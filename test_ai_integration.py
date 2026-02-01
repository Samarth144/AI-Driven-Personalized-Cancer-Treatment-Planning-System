from ai_engine.rule_engine import run_rules
from ai_engine.llm_chain import generate_fast_treatment

patient = {
    "cancer_type": "Breast Cancer",
    "age": 50,
    "stage": "1",
    "ER": "positive",
    "PR": "positive",
    "HER2": "positive",
    "BRCA": "negative",
    "residual": "no"
}

rules = run_rules(patient)

if rules.get("error"):
    print("ERROR:", rules["error"])
else:
    output = generate_fast_treatment(patient, rules)
    print("\n=== AI TREATMENT PLAN ===\n")
    print(output)
