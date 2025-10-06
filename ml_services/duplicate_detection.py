import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# === Utilities ===
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    a = np.sin(dphi/2)**2 + np.cos(phi1)*np.cos(phi2)*np.sin(dlambda/2)**2
    return 2 * R * np.arcsin(np.sqrt(a))

# === Duplicate Detector ===
class DuplicateDetector:
    def __init__(self, existing_reports: pd.DataFrame):
        """
        existing_reports: DataFrame with columns ['id', 'lat', 'lon', 'text']
        """
        self.df = existing_reports.copy()
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Precompute embeddings as matrix
        # Convert Series of arrays to list, then stack
        self.embeddings = np.vstack(self.df["text"].apply(lambda t: self.model.encode(t)).tolist())

    def check_duplicate(self, new_report, distance_threshold=200):
        lat, lon, text = new_report["lat"], new_report["lon"], new_report["text"]

        # Step 1: Spatial filter (wider net)
        self.df["distance"] = self.df.apply(
            lambda row: haversine(lat, lon, row["lat"], row["lon"]), axis=1
        )
        nearby_idx = self.df[self.df["distance"] <= distance_threshold].index
        if nearby_idx.empty:
            print(f"[DEBUG] No reports within {distance_threshold}m")
            return False, None

        # Step 2: Text similarity
        new_emb = self.model.encode(text).reshape(1, -1)
        sims = cosine_similarity(new_emb, self.embeddings[nearby_idx])[0]

        scores = []
        for idx, sim in zip(nearby_idx, sims):
            dist_val = self.df.loc[idx, "distance"]
            try:
                import numpy as np
                if isinstance(dist_val, np.generic):
                    dist_val = dist_val.item()
                if isinstance(dist_val, (int, float)):
                    dist = float(dist_val)
                else:
                    dist = 0.0
            except Exception:
                dist = 0.0
            score = sim * (1 - dist / float(distance_threshold))  # weight by distance
            scores.append((idx, sim, dist, score))

        # Best candidate
        best_idx, best_sim, best_dist, best_score = max(scores, key=lambda x: x[3])
        print(f"[DEBUG] Best candidate {self.df.loc[best_idx,'id']} → dist={best_dist:.1f}m, sim={best_sim:.2f}, score={best_score:.2f}")

        if best_score > 0.4:  # tune threshold
            return True, self.df.loc[best_idx, "id"]
        return False, None



# === Example Usage ===
if __name__ == "__main__":
    existing = pd.DataFrame([
        {"id": 1, "lat": 98.610, "lon": 97.230, "text": "Pothole near Connaught Place"},
        {"id": 2, "lat": 8.611, "lon": 7.231, "text": "Garbage dump overflowing"},
    ])

    detector = DuplicateDetector(existing)

    new_report = {"lat": 28.6105, "lon": 77.2305, "text": "Huge pothole close to CP"}
    is_dup, dup_of = detector.check_duplicate(new_report)
    print("Duplicate?", is_dup, "| Duplicate of:", dup_of)
