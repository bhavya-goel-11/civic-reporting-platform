import torch
import os
import numpy as np
from transformers import DistilBertTokenizerFast
from train_multitask_distilbert import DistilBertMultiTask
import json

MODEL_NAME = "distilbert-base-uncased"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# Get the directory of the current script to make paths relative to it
script_dir = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(script_dir, "output_distilbert_multitask")

# Load saved checkpoint and tokenizer
ckpt = torch.load(os.path.join(OUTPUT_DIR, "best_model.pth"), map_location=DEVICE)
tokenizer = DistilBertTokenizerFast.from_pretrained(os.path.join(OUTPUT_DIR, "tokenizer"))
cat_classes = ckpt["cat_le_classes"]
urg_classes = ckpt["urg_le_classes"]

# Initialize model
model = DistilBertMultiTask(MODEL_NAME, num_cat=len(cat_classes), num_urg=len(urg_classes))
model.load_state_dict(ckpt["model_state_dict"])
model.to(DEVICE)
model.eval()

def predict_text(text):
    enc = tokenizer(
        text, max_length=128, truncation=True, padding="max_length", return_tensors="pt"
    )
    input_ids = enc["input_ids"].to(DEVICE)
    attention_mask = enc["attention_mask"].to(DEVICE)

    with torch.no_grad():
        cat_logits, urg_logits = model(input_ids=input_ids, attention_mask=attention_mask)

    cat_pred = torch.argmax(cat_logits, dim=1).cpu().item()
    urg_pred = torch.argmax(urg_logits, dim=1).cpu().item()

    cat_prob = torch.softmax(cat_logits, dim=1)[0].cpu().numpy().tolist()
    urg_prob = torch.softmax(urg_logits, dim=1)[0].cpu().numpy().tolist()

    return {
        "category": cat_classes[cat_pred],
        "category_probs": {cls: float(p) for cls, p in zip(cat_classes, cat_prob)},
        "urgency": urg_classes[urg_pred],
        "urgency_probs": {cls: float(p) for cls, p in zip(urg_classes, urg_prob)}
    }

# Quick test
if __name__ == "__main__":
    text = "There is a water leaking near the school, a lot of traffic jam is there "
    print(json.dumps(predict_text(text), indent=2))
