from flask import Flask, request, jsonify
from flask_cors import CORS
from rule_engine import run_rules
from llm import generate_treatment_plan

app = Flask(__name__)
CORS(app)

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
