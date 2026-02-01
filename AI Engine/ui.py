# ui.py
import streamlit as st
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rule_engine.rule_engine import run_rules
from llm.llm_chain import generate_treatment_plan

# ================================
# PAGE CONFIG + THEME
# ================================
st.set_page_config(
    page_title="AI Oncology Assistant",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Background Style
st.markdown("""
<style>
    body {
        background-color: #F5F7FA;
    }
    .main {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 12px;
    }
</style>
""", unsafe_allow_html=True)

st.title("🧬 AI-Driven Personalized Cancer Treatment System")


# ================================
# CANCER TYPE SELECTION
# ================================
cancer_type = st.selectbox(
    "Select Cancer Type",
    ["Breast", "Brain", "Lung", "Liver", "Pancreas"]
)

st.markdown("---")

# ================================
# DYNAMIC INPUTS PER CANCER
# ================================
patient = {"cancer_type": cancer_type.lower()}

if cancer_type == "Breast":
    col1, col2 = st.columns(2)
    patient["stage"] = col1.selectbox("Stage", ["0", "I", "II", "III", "IV"])
    patient["ER"] = col2.selectbox("ER", ["positive", "negative"])
    patient["PR"] = col1.selectbox("PR", ["positive", "negative"])
    patient["HER2"] = col2.selectbox("HER2", ["positive", "negative"])
    patient["BRCA"] = col1.selectbox("BRCA", ["positive", "negative"])
    patient["PDL1"] = col2.selectbox("PD-L1", ["low", ">=10", ">=50", "unknown"])
    patient["residual"] = col1.selectbox("Residual disease", ["yes", "no"])

elif cancer_type == "Brain":
    col1, col2 = st.columns(2)
    patient["stage"] = col1.selectbox("WHO Grade", ["LOCALIZED", "RECURRENT"])
    patient["MGMT"] = col2.selectbox("MGMT Methylation", ["methylated", "unmethylated"])
    patient["IDH"] = col1.selectbox("IDH Status", ["mutant", "wild-type"])
    patient["Resection"] = col2.selectbox("Resection Status", ["complete", "partial", "biopsy"])

elif cancer_type == "Lung":
    col1, col2 = st.columns(2)
    patient["stage"] = col1.selectbox("Stage", ["I", "II", "III", "IV"])
    patient["EGFR"] = col2.selectbox("EGFR", ["positive", "negative"])
    patient["ALK"] = col1.selectbox("ALK", ["positive", "negative"])
    patient["PDL1"] = col2.selectbox("PD-L1", ["<1%", "1-49%", ">=50%"])

elif cancer_type == "Liver":
    col1, col2 = st.columns(2)
    patient["stage"] = col1.selectbox("BCLC Stage", ["EARLY", "INTERMEDIATE", "ADVANCED"])
    patient["AFP"] = col2.selectbox("AFP Levels", ["normal", "elevated"])
    patient["Cirrhosis"] = col1.selectbox("Cirrhosis", ["yes", "no"])

elif cancer_type == "Pancreas":
    col1, col2 = st.columns(2)
    patient["stage"] = col1.selectbox("Stage", ["RESECTABLE", "LOCALLY_ADVANCED", "METASTATIC"])
    patient["CA19-9"] = col2.selectbox("CA19-9", ["normal", "elevated"])
    patient["BRCA"] = col1.selectbox("BRCA", ["positive", "negative"])


st.markdown("---")


# ================================
# ACTION BUTTON
# ================================
if st.button("Generate Treatment Plan 🚀"):

    st.subheader("📌 Running Rule Engine...")
    rules = run_rules(patient)

    if "error" in rules:
        st.error(rules["error"])
    else:
        st.success("Rules Applied Successfully")

        # Create a more targeted query for PubMed
        query = f"{patient['cancer_type']} cancer stage {patient.get('stage', '')}"
        
        queries = [query]
        if patient.get('ER'):
            queries.append(f"{patient['cancer_type']} cancer ER {patient['ER']}")
        if patient.get('PR'):
            queries.append(f"{patient['cancer_type']} cancer PR {patient['PR']}")
        if patient.get('HER2'):
            queries.append(f"{patient['cancer_type']} cancer HER2 {patient['HER2']}")


        st.subheader("🧠 Generating Clinical Narrative")
        plan, evidence = generate_treatment_plan(patient, rules, patient['cancer_type'], query, queries)
        st.markdown(f"```text\n{plan}\n```")

        st.subheader("📚 Evidence Sources")
        for e in evidence:
            st.write(f"- **{e['source']}**: {e['text']}")
