import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_PATH = os.path.join(BASE_DIR, "oncology_kb_full.json")

with open(KB_PATH, "r", encoding="utf-8") as f:
    KB = json.load(f)



def run_rules(patient):
    stage = f"stage_{patient.get('stage')}"
    her2 = patient.get("HER2", "").lower()
    brca = patient.get("BRCA", "").lower()

    if her2 != "positive":
        return {"error": "Only HER2-positive pathway implemented."}

    block = KB.get("HER2_positive", {})

    if stage not in block:
        return {"error": f"No rules found for stage {patient.get('stage')}"}

    data = block[stage]

    result = {
        "primary_treatments": data.get("primary_treatments", []),
        "follow_up": data.get("follow_up", []),
        "contraindications": data.get("contraindications", [])
    }

    if brca == "positive" and "brca_positive" in data:
        result["brca"] = data["brca_positive"]

    return result
