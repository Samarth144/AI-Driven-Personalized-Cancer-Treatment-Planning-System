# rag/embedder.py

import os
import pdfplumber
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

BASE = os.path.dirname(os.path.abspath(__file__))
GUIDE_DIR = os.path.join(BASE, "..", "guidelines")
FAISS_DIR = os.path.join(BASE, "faiss_store")

EMBED = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

TARGET_SECTIONS = [
    "treatment", "therapy", "systemic", "surgery",
    "radiation", "follow-up", "monitoring",
    "diagnosis", "pathology", "recurrence"
]

def extract_chunks(pdf_path):
    chunks = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            # Instead of splitting by lines, treat the whole page text as a single chunk
            # if it contains any of the target keywords.
            lowered_text = text.lower()
            if any(key in lowered_text for key in TARGET_SECTIONS):
                chunks.append(text)
    return chunks

def build_index(cancer):
    folder = os.path.join(GUIDE_DIR, cancer)
    out_folder = os.path.join(FAISS_DIR, cancer)
    os.makedirs(out_folder, exist_ok=True)

    all_chunks = []
    for file in os.listdir(folder):
        if file.endswith(".pdf"):
            path = os.path.join(folder, file)
            extracted = extract_chunks(path)
            for c in extracted:
                all_chunks.append({"text": c, "source": file})

    if not all_chunks:
        print(f"[WARN] No data found for {cancer}.")
        return

    texts = [x["text"] for x in all_chunks]
    emb = EMBED.encode(texts, convert_to_numpy=True)

    dim = emb.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(emb)

    faiss.write_index(index, os.path.join(out_folder, "index.bin"))
    np.save(os.path.join(out_folder, "meta.npy"), np.array(all_chunks, dtype=object))

    print(f"[OK] {cancer}: {len(all_chunks)} chunks indexed.")

def build_all():
    cancers = ["breast", "brain", "lung", "liver", "pancreas"]
    for c in cancers:
        build_index(c)

if __name__ == "__main__":
    build_all()
