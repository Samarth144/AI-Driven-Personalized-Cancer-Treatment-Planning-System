import os
import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer

from .embedder import build_index  # <-- NEW
from utils.text_cleaner import clean_text

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
STORE_PATH = os.path.join(BASE_PATH, "faiss_store")

EMBED_MODEL = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def load_faiss_index(cancer):
    folder = os.path.join(STORE_PATH, cancer)
    index_path = os.path.join(folder, "index.bin")
    meta_path = os.path.join(folder, "meta.npy")

    # ---- AUTO BUILD IF NOT FOUND ----
    if not os.path.exists(index_path) or not os.path.exists(meta_path):
        print(f"[RAG] No index found for {cancer}. Building now...")
        build_index(cancer)

    # If still missing, then fail gracefully
    if not os.path.exists(index_path) or not os.path.exists(meta_path):
        print(f"[RAG] Failed to build index for {cancer}")
        return None, None

    index = faiss.read_index(index_path)
    meta = np.load(meta_path, allow_pickle=True)
    return index, meta


def retrieve_local_cancer(cancer, query, k=6):
    index, meta = load_faiss_index(cancer)
    if index is None:
        return []

    query = clean_text(query)
    qemb = EMBED_MODEL.encode([query], convert_to_numpy=True)
    scores, idxs = index.search(qemb, k)

    results = []
    for dist, idx in zip(scores[0], idxs[0]):
        item = meta[int(idx)]
        results.append({
            "text": item["text"],
            "source": item.get("source", "unknown"),
            "score": float(dist)
        })
    return results
