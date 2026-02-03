# llm_chain.py

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from functools import lru_cache
from rag.retriever_hybrid import hybrid_retrieve

MODEL_NAME = "google/flan-t5-small"


@lru_cache(maxsize=1)
def load_model():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
    return tokenizer, model


# llm_chain.py

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from functools import lru_cache
from rag.retriever_hybrid import hybrid_retrieve

MODEL_NAME = "google/flan-t5-small"


@lru_cache(maxsize=1)
def load_model():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
    return tokenizer, model


def flatten_rule_output(rules):
    lines = []

    # -------- Surgery --------
    if rules.get("surgery"):
        lines.append("Surgery options: " + ", ".join(rules["surgery"]))

    # -------- Radiation --------
    if rules.get("radiation"):
        if isinstance(rules["radiation"], list):
            lines.append("Radiation options: " + ", ".join(rules["radiation"]))
        else:
            lines.append("Radiation options: " + str(rules["radiation"]))

    # -------- Systemic / Chemo --------
    if rules.get("systemic"):
        for t in rules["systemic"]:
            lines.append(f"Systemic therapy: {t}")

    # -------- Primary treatment --------
    if rules.get("primary_treatments"):
        for t in rules["primary_treatments"]:
            lines.append(f"Primary treatment: {t}")

    # -------- Targeted biomarkers --------
    if rules.get("biomarker_targets"):
        for bx in rules["biomarker_targets"]:
            lines.append(f"Biomarker-targeted therapy: {bx}")

    # -------- Immunotherapy --------
    if rules.get("immunotherapy_candidates"):
        ims = rules["immunotherapy_candidates"]
        lines.append("Immunotherapy candidates: " + ", ".join(ims))

    # -------- Residual Disease --------
    if rules.get("residual_disease"):
        lines.append(f"Residual disease option: {', '.join(rules['residual_disease'])}")

    # -------- BRCA --------
    if rules.get("brca_options"):
        lines.append(f"BRCA option: {', '.join(rules['brca_options'])}")

    # -------- Alternative --------
    if rules.get("alternative_options"):
        lines.append("Alternatives: " + ", ".join(rules["alternative_options"]))

    # -------- Contraindications --------
    if rules.get("contraindications"):
        lines.append("Contraindications: " + "; ".join(rules["contraindications"]))

    # -------- Follow Up --------
    if rules.get("follow_up"):
        for f in rules["follow_up"]:
            lines.append(f"Follow-up: {f}")

    return "\n".join(lines)
    


def generate_treatment_plan(patient, rules, cancer, query, queries):
    rule_text = flatten_rule_output(rules)
    
    # RAG evidence
    evidence = hybrid_retrieve(cancer, query, queries)
    evidence_text = "\n".join([f"[{i+1}] {e['text']}" for i, e in enumerate(evidence)])

    prompt = f"""
You are an oncology clinical summarizer.
Rewrite the following clinical plan into a clear NCCN-style treatment plan.

When a treatment regimen is mentioned with an acronym and a descriptive name in parentheses,
be sure to include the full descriptive name in the final output.

Do NOT add new drugs.
Do NOT invent treatments.
Do NOT hallucinate.
Only reformat what is provided.

PATIENT:
{patient}

CLINICAL NOTES:
{rule_text}

SUPPORTING EVIDENCE:
{evidence_text}

Write sections exactly as:

Primary recommended treatment:
Because this treatment matches staging and biomarkers:
Alternative evidence-based options:
Contraindications and safety alerts:
Follow-up surveillance plan:
Evidence references [S1], [S2]
"""

    tokenizer, model = load_model()

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)
    outputs = model.generate(**inputs, max_new_tokens=240, do_sample=False)

    text = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    # HARD FALLBACK FOR SAFETY
    if len(text) < 70:
        text = f"""
Primary recommended treatment:
{rule_text.splitlines()[0]}

Because this treatment matches staging and biomarkers:
Treatment aligns with standard guideline recommendations for the declared cancer stage.

Alternative evidence-based options:
Further escalation or biomarkers could modify treatment pathway if indicated.

Contraindications and safety alerts:
Check cardiac, renal, and neuropathy tolerance as applicable.

Follow-up surveillance plan:
Routine clinical evaluation, imaging, and lab-based surveillance recommended.

Evidence references:
[S1] NCCN Guidelines
[S2] Peer-reviewed oncology trials
"""
    return text, evidence

def predict_outcomes(patient, cancer, query, queries):
    # RAG evidence
    evidence = hybrid_retrieve(cancer, query, queries)
    evidence_text = "\n".join([f"[{i+1}] {e['text']}" for i, e in enumerate(evidence)])

    prompt = f"""
You are an oncology clinical predictor.
Based on the following patient data and supporting evidence, predict the outcomes.

PATIENT:
{patient}

SUPPORTING EVIDENCE:
{evidence_text}

Write sections exactly as:

Side Effects:
- Fatigue: 0%
- Nausea: 0%
- Cognitive Impairment: 0%
- Hematologic Toxicity: 0%

Overall Survival:
- Median: 0 months
- Range: 0-0 months

Progression-Free Survival:
- Median: 0 months
- Range: 0-0 months

Quality of Life: 0
"""

    tokenizer, model = load_model()

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)
    outputs = model.generate(**inputs, max_new_tokens=240, do_sample=False)

    text = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    return text, evidence