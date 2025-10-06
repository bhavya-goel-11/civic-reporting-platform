import os
import random
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, f1_score
from sklearn.utils.class_weight import compute_class_weight
from sklearn.model_selection import train_test_split
from tqdm import tqdm

import torch
from torch.utils.data import Dataset, DataLoader
from torch import nn
from transformers import DistilBertTokenizerFast, DistilBertModel, get_linear_schedule_with_warmup
from torch.optim import AdamW

# -------- Config --------
MODEL_NAME = "distilbert-base-uncased"
MAX_LEN = 128
BATCH_SIZE = 4         # smaller batch for small dataset
NUM_EPOCHS = 15        # more epochs
LR = 2e-5
WEIGHT_DECAY = 0.01
PATIENCE = 3           # early stopping patience
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
SEED = 42
# Get the directory of the current script to make paths relative to it
script_dir = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(script_dir, "output_distilbert_multitask")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------- Helpers --------
def set_seed(seed=SEED):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
set_seed()

# -------- Load data --------
# Get the directory of the current script to make paths relative to it
script_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(script_dir, "data", "data.csv")
df = pd.read_csv(data_path)
df = df.dropna(subset=["text", "category", "urgency"]).reset_index(drop=True)

# Label encoders
cat_le = LabelEncoder()
urg_le = LabelEncoder()
df["cat_id"] = cat_le.fit_transform(df["category"])
df["urg_id"] = urg_le.fit_transform(df["urgency"])

num_cat = len(cat_le.classes_)
num_urg = len(urg_le.classes_)

print("Categories:", cat_le.classes_)
print("Urgency labels:", urg_le.classes_)

train_df, val_df = train_test_split(
    df, test_size=0.2, random_state=SEED, stratify=df["category"]
)

# -------- Dataset class --------
tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_NAME)

class CivicTextDataset(Dataset):
    def __init__(self, texts, cat_ids, urg_ids, tokenizer, max_len=MAX_LEN):
        self.texts = texts.tolist()
        self.cat_ids = cat_ids.tolist()
        self.urg_ids = urg_ids.tolist()
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        enc = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_len,
            padding="max_length",
            return_tensors="pt"
        )
        return {
            "input_ids": enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "cat_id": torch.tensor(self.cat_ids[idx], dtype=torch.long),
            "urg_id": torch.tensor(self.urg_ids[idx], dtype=torch.long)
        }

train_dataset = CivicTextDataset(train_df["text"], train_df["cat_id"], train_df["urg_id"], tokenizer)
val_dataset = CivicTextDataset(val_df["text"], val_df["cat_id"], val_df["urg_id"], tokenizer)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

# -------- Model --------
class DistilBertMultiTask(nn.Module):
    def __init__(self, model_name, num_cat, num_urg, dropout=0.2):
        super().__init__()
        self.backbone = DistilBertModel.from_pretrained(model_name)
        hidden_size = self.backbone.config.hidden_size
        self.dropout = nn.Dropout(dropout)
        self.cat_classifier = nn.Linear(hidden_size, num_cat)
        self.urg_classifier = nn.Linear(hidden_size, num_urg)

    def forward(self, input_ids, attention_mask):
        out = self.backbone(input_ids=input_ids, attention_mask=attention_mask)
        hidden = out.last_hidden_state[:,0,:]  # CLS-like
        hidden = self.dropout(hidden)
        return self.cat_classifier(hidden), self.urg_classifier(hidden)

model = DistilBertMultiTask(MODEL_NAME, num_cat=num_cat, num_urg=num_urg).to(DEVICE)

# -------- Optimizer & Scheduler --------
no_decay = ["bias", "LayerNorm.weight"]
optimizer_grouped_parameters = [
    {
        "params": [p for n,p in model.named_parameters() if not any(nd in n for nd in no_decay)],
        "weight_decay": WEIGHT_DECAY
    },
    {
        "params": [p for n,p in model.named_parameters() if any(nd in n for nd in no_decay)],
        "weight_decay": 0.0
    }
]
optimizer = AdamW(optimizer_grouped_parameters, lr=LR)
total_steps = len(train_loader) * NUM_EPOCHS
scheduler = get_linear_schedule_with_warmup(
    optimizer, num_warmup_steps=int(0.06*total_steps), num_training_steps=total_steps
)

# -------- Loss with class weights --------
cat_weights = compute_class_weight("balanced", classes=np.unique(df["cat_id"]), y=df["cat_id"])
urg_weights = compute_class_weight("balanced", classes=np.unique(df["urg_id"]), y=df["urg_id"])
cat_loss_fn = nn.CrossEntropyLoss(weight=torch.tensor(cat_weights, dtype=torch.float).to(DEVICE))
urg_loss_fn = nn.CrossEntropyLoss(weight=torch.tensor(urg_weights, dtype=torch.float).to(DEVICE))

# -------- Training loop with early stopping --------
# Check if model already exists
model_path = os.path.join(OUTPUT_DIR, "best_model.pth")
if os.path.exists(model_path):
    print("Model already exists. Skipping training.")
else:
    print("Starting training...")
    best_val_f1 = 0
    patience_counter = 0

    for epoch in range(NUM_EPOCHS):
        # Training
        model.train()
        train_loss = 0.0
        for batch in tqdm(train_loader, desc=f"Train Epoch {epoch+1}"):
            optimizer.zero_grad()
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            cat_labels = batch["cat_id"].to(DEVICE)
            urg_labels = batch["urg_id"].to(DEVICE)

            cat_logits, urg_logits = model(input_ids, attention_mask)
            loss_cat = cat_loss_fn(cat_logits, cat_labels)
            loss_urg = urg_loss_fn(urg_logits, urg_labels)
            loss = loss_cat + loss_urg
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            train_loss += loss.item()
        avg_train_loss = train_loss / len(train_loader)

        # Validation
        model.eval()
        val_loss = 0.0
        all_cat_preds, all_cat_labels = [], []
        all_urg_preds, all_urg_labels = [], []

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(DEVICE)
                attention_mask = batch["attention_mask"].to(DEVICE)
                cat_labels = batch["cat_id"].to(DEVICE)
                urg_labels = batch["urg_id"].to(DEVICE)

                cat_logits, urg_logits = model(input_ids, attention_mask)
                loss_cat = cat_loss_fn(cat_logits, cat_labels)
                loss_urg = urg_loss_fn(urg_logits, urg_labels)
                loss = loss_cat + loss_urg
                val_loss += loss.item()

                all_cat_preds.extend(torch.argmax(cat_logits, dim=1).cpu().numpy())
                all_cat_labels.extend(cat_labels.cpu().numpy())
                all_urg_preds.extend(torch.argmax(urg_logits, dim=1).cpu().numpy())
                all_urg_labels.extend(urg_labels.cpu().numpy())

        avg_val_loss = val_loss / len(val_loader)
        cat_f1 = f1_score(all_cat_labels, all_cat_preds, average="macro", zero_division=0)
        urg_f1 = f1_score(all_urg_labels, all_urg_preds, average="macro", zero_division=0)
        avg_f1 = (cat_f1 + urg_f1) / 2

        print(f"Epoch {epoch+1} | Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f} | Cat F1: {cat_f1:.3f} | Urg F1: {urg_f1:.3f}")

        if avg_f1 > best_val_f1:
            best_val_f1 = avg_f1
            patience_counter = 0
            print("Saving best model...")
            torch.save({
                "model_state_dict": model.state_dict(),
                "cat_le_classes": cat_le.classes_.tolist(),
                "urg_le_classes": urg_le.classes_.tolist()
            }, os.path.join(OUTPUT_DIR, "best_model.pth"))
            tokenizer.save_pretrained(os.path.join(OUTPUT_DIR, "tokenizer"))
        else:
            patience_counter += 1
            if patience_counter >= PATIENCE:
                print("Early stopping triggered.")
                break

    print("Training complete.")
