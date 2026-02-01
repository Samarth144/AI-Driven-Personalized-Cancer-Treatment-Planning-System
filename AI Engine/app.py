from rule_engine import run_rules
from llm_chain import generate_fast_treatment

print("⚕️ Cancer Treatment Recommendation System\n")

patient = {
    "Age": input("Age: "),
    "Stage": input("Stage (0–IV): "),
    "ER": input("ER (positive/negative): "),
    "PR": input("PR (positive/negative): "),
    "HER2": input("HER2 (positive/negative): "),
    "BRCA": input("BRCA (positive/negative): "),
    "pdl1": input("PD-L1 CPS (>=10/<10/unknown): "),
    "residual": input("Residual disease after surgery? (yes/no): "),
    "cardiac_issues": input("Cardiac issues? (yes/no): ")
}

rules = run_rules(patient)
final = generate_fast_treatment(patient, rules)

print("\n===============================")
print("📄 Recommended Treatment Plan")
print("===============================\n")
print(final)
