# retriever.py

import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

DATA_PATH = "guidelines.json"
INDEX_PATH = "faiss_store/index.bin"
META_PATH = "faiss_store/meta.npy"

EMBED_MODEL = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def load_guidelines():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = []
    for path, value in flatten(data).items():
        if isinstance(value, str) and len(value.split()) > 2:
            if "pdf" in value.lower():
                continue
            chunks.append({"text": value, "path": "/" + path})

    return chunks


def flatten(d, parent="root"):
    items = {}
    for k, v in d.items():
        path = f"{parent}/{k}"
        if isinstance(v, dict):
            items.update(flatten(v, path))
        else:
            items[path] = v
    return items


def build_index():
    print("Building FAISS index...")
    chunks = load_guidelines()

    texts = [c["text"] for c in chunks]
    embeddings = EMBED_MODEL.encode(texts, convert_to_numpy=True)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    os.makedirs("faiss_store", exist_ok=True)
    faiss.write_index(index, INDEX_PATH)
    np.save(META_PATH, np.array(chunks, dtype=object))

    print(f"Index built: {len(chunks)} guideline sentences.")
    return index, chunks


def load_index():
    if not os.path.exists(INDEX_PATH):
        return build_index()

    index = faiss.read_index(INDEX_PATH)
    meta = np.load(META_PATH, allow_pickle=True)
    return index, meta


def retrieve(query, k=8):
    index, meta = load_index()

    qemb = EMBED_MODEL.encode([query], convert_to_numpy=True)
    scores, idxs = index.search(qemb, k)

    results = []
    for dist, idx in zip(scores[0], idxs[0]):
        idx = int(idx)
        if idx < len(meta):
            item = meta[idx]
            results.append({
                "text": item["text"],
                "path": item["path"],
                "score": float(dist)
            })
    return results

if __name__ == "__main__":
    build_index()