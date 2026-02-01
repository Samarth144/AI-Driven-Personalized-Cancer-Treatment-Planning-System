import json
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

def load_cancer_inputs(cancer):
    with open(os.path.join(BASE_PATH, "settings.json"), "r") as f:
        cfg = json.load(f)

    # universal fields for v1
    fields = {
        "age": "Age",
        "stage": "Cancer Stage (0-IV)",
        "ER": "ER Status (positive/negative/NA)",
        "PR": "PR Status (positive/negative/NA)",
        "HER2": "HER2 Status (positive/negative/NA)",
        "BRCA": "BRCA Mutation (positive/negative/NA)",
        "PDL1": "PD-L1 CPS or Expression",
        "residual": "Residual Disease After Therapy (yes/no/NA)"
    }

    # remove irrelevant biomarkers depending on cancer
    if cancer in ["brain", "liver", "pancreas", "lung"]:
        fields.pop("ER")
        fields.pop("PR")
        fields.pop("HER2")

    if cancer != "breast":
        fields.pop("BRCA")

    return fields
