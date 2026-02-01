import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
KB_DIR = os.path.join(BASE, "..", "knowledge_base")

def load_kb(cancer):
    fname = f"{cancer}_kb.json"
    path = os.path.join(KB_DIR, fname)

    if not os.path.exists(path):
        raise FileNotFoundError(f"No KB found for {cancer}: {path}")

    with open(path, "r") as f:
        return json.load(f)
