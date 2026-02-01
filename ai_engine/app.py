from flask import Flask, request, jsonify
from flask_cors import CORS
from rule_engine import run_rules
from llm import generate_treatment_plan
import re

app = Flask(__name__)
CORS(app)

def clean_value(text):
    """Removes extra colons and spaces from a string."""
    return re.sub(':', '', text).strip()

def parse_report_text(text):
    """
    Parses unstructured report text to extract structured patient data.
    This is a simplified parser using regex.
    """
    patient_data = {}

    # Diagnosis and Cancer Type
    diagnosis_match = re.search(r"Diagnosis\s*:(.*)", text, re.IGNORECASE)
    if diagnosis_match:
        diagnosis_text = clean_value(diagnosis_match.group(1))
        patient_data['diagnosis'] = diagnosis_text
        if "invasive ductal carcinoma" in diagnosis_text.lower() or "breast" in text.lower():
            patient_data['cancer_type'] = "Breast"
        elif "glioblastoma" in diagnosis_text.lower():
            patient_data['cancer_type'] = "Brain"
        elif "lung" in diagnosis_text.lower():
            patient_data['cancer_type'] = "Lung"
        elif "liver" in diagnosis_text.lower():
            patient_data['cancer_type'] = "Liver"
        elif "pancreatic" in diagnosis_text.lower():
            patient_data['cancer_type'] = "Pancreas"

        # Extract Grade from the cleaned diagnosis text
        grade_match = re.search(r"grade\s+([IVX]+)", diagnosis_text, re.IGNORECASE)
        if grade_match:
            patient_data['stage'] = grade_match.group(1)

    # Biomarkers
    er_status_match = re.search(r"ER Status\s*:(.*)", text, re.IGNORECASE)
    if er_status_match:
        patient_data['ER'] = clean_value(er_status_match.group(1)).split(' ')[0]

    pr_status_match = re.search(r"PR Status\s*:(.*)", text, re.IGNORECASE)
    if pr_status_match:
        patient_data['PR'] = clean_value(pr_status_match.group(1)).split(' ')[0]

    her2_status_match = re.search(r"HER2 Status\s*:(.*)", text, re.IGNORECASE)
    if her2_status_match:
        patient_data['HER2'] = clean_value(her2_status_match.group(1)).split(' ')[0]
        
    return patient_data

@app.route('/process_report_text', methods=['POST'])
def process_report_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    report_text = data['text']
    patient_data = parse_report_text(report_text)

    if not patient_data.get('cancer_type'):
        return jsonify({"error": "Could not determine cancer type from the report."}), 400

    # Run rule engine
    rules = run_rules(patient_data)
    if "error" in rules:
        return jsonify({"error": rules["error"]}), 400

    # Prepare queries for RAG
    cancer_type = patient_data.get("cancer_type", "cancer")
    stage = patient_data.get("stage", "")
    query = f"{cancer_type} stage {stage} treatment"
    queries = [query]
    if patient_data.get('ER'):
        queries.append(f"{cancer_type} ER {patient_data['ER']}")
    if patient_data.get('HER2'):
        queries.append(f"{cancer_type} HER2 {patient_data['HER2']}")

    # Call the advanced LLM function with RAG
    plan_text, evidence = generate_treatment_plan(
        patient=patient_data,
        rules=rules,
        cancer=cancer_type,
        query=query,
        queries=queries
    )

    return jsonify({
        'plan': plan_text,
        'evidence': evidence,
        'extracted_data': patient_data
    })


@app.route('/recommend', methods=['POST'])
def recommend():
    patient_data = request.get_json()
    
    # Run rule engine
    rules = run_rules(patient_data)
    if "error" in rules:
        return jsonify({"error": rules["error"]}), 400

    # Prepare queries for RAG
    cancer_type = patient_data.get("cancer_type", "cancer")
    stage = patient_data.get("stage", "")
    query = f"{cancer_type} stage {stage} treatment"
    queries = [query]
    if patient_data.get('ER'):
        queries.append(f"{cancer_type} ER {patient_data['ER']}")
    if patient_data.get('HER2'):
        queries.append(f"{cancer_type} HER2 {patient_data['HER2']}")

    # Call the advanced LLM function with RAG
    plan_text, evidence = generate_treatment_plan(
        patient=patient_data,
        rules=rules,
        cancer=cancer_type,
        query=query,
        queries=queries
    )

    return jsonify({
        'plan': plan_text,
        'evidence': evidence
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
