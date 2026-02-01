# rule_engine.py

import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KB_DIR = os.path.join(BASE_DIR, "knowledge_base")

# Load all KB files into memory
KB = {
    "breast": json.load(open(os.path.join(KB_DIR, "breast_kb.json"), encoding="utf-8")),
    "brain": json.load(open(os.path.join(KB_DIR, "brain_kb.json"), encoding="utf-8")),
    "lung": json.load(open(os.path.join(KB_DIR, "lung_kb.json"), encoding="utf-8")),
    "liver": json.load(open(os.path.join(KB_DIR, "liver_kb.json"), encoding="utf-8")),
    "pancreas": json.load(open(os.path.join(KB_DIR, "pancreas_kb.json"), encoding="utf-8")),
    "common": json.load(open(os.path.join(KB_DIR, "common_kb.json"), encoding="utf-8"))
}


def run_rules(patient):
    cancer = patient.get("cancer_type", "").lower()
    stage = str(patient.get("stage", "")).upper()
    residual = patient.get("residual", "").lower()
    brca = patient.get("BRCA", "").lower()
    pdl1 = patient.get("PDL1", "")
    egfr = patient.get("EGFR", "")
    alk = patient.get("ALK", "")
    kras = patient.get("KRAS", "")

    if cancer not in KB or cancer == "common":
        return {"error": f"Cancer type '{cancer}' not supported."}

    cancer_kb = KB[cancer]
    stages = cancer_kb.get("stages", {})

    # Stage fallback
    if stage not in stages:
        return {"error": f"No treatment rules found for stage '{stage}' in {cancer}."}

    data = stages[stage]

    result = {
        "primary_treatments": data.get("primary_treatments", []),
        "surgery": data.get("surgery", []),
        "radiation": data.get("radiation", []),
        "systemic": data.get("systemic", []),
        "targeted": data.get("targeted", {}),
        "immunotherapy": data.get("immunotherapy", []),
        "alternative_options": data.get("alternatives", []),
        "follow_up": data.get("follow_up", []),
        "contraindications": KB["common"]["contraindications"].get("cardiac", []) 
                            + KB["common"]["contraindications"].get("renal", []),
        "evidence": KB["common"]["evidence"]
    }

    # Biomarker-specific augmentations
    if cancer == "breast":
        if brca == "positive" and "brca" in data:
            result["brca_options"] = data["brca"]
        if residual == "yes" and "residual" in data:
            result["residual_disease"] = data["residual"]

    if cancer == "lung":
        biomarker_hits = []
        if egfr:
            biomarker_hits.append(data.get("targeted", {}).get("EGFR"))
        if alk:
            biomarker_hits.append(data.get("targeted", {}).get("ALK"))
        if kras:
            biomarker_hits.append(data.get("targeted", {}).get("KRAS"))
        result["biomarker_targets"] = [b for b in biomarker_hits if b]

        if pdl1 and data.get("immunotherapy"):
            result["immunotherapy_candidates"] = data["immunotherapy"]

    # Universal follow-up fallback
    if not result["follow_up"]:
        result["follow_up"] = KB["common"]["follow_up"]["standard"]

    return result
