import streamlit as st
from rule_engine import run_rules
from llm_chain import generate_fast_treatment

# --------------------------------------------------
# PAGE CONFIG
# --------------------------------------------------
st.set_page_config(
    page_title="Cancer Treatment Recommendation AI",
    page_icon="🧬",
    layout="wide"
)

# --------------------------------------------------
# ADVANCED UI STYLES
# --------------------------------------------------
st.markdown("""
<style>
body {
    background: radial-gradient(circle at top, #020617, #000000);
}

/* ---------- HEADER ---------- */
.main-title {
    font-size: 2.8rem;
    font-weight: 900;
    background: linear-gradient(90deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.sub-title {
    color: #94a3b8;
    font-size: 1rem;
    margin-bottom: 1.2rem;
}

/* ---------- AI BANNER ---------- */
.ai-banner {
    background: linear-gradient(90deg, #1e3a8a, #6d28d9);
    color: white;
    padding: 0.9rem 1.3rem;
    border-radius: 16px;
    font-weight: 700;
    margin-bottom: 2rem;
    box-shadow: 0 16px 40px rgba(99,102,241,0.45);
}

/* ---------- CARDS ---------- */
.card {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(16px);
    border-radius: 22px;
    padding: 1.8rem;
    box-shadow: 0 24px 55px rgba(0,0,0,0.7);
}

/* ---------- SECTION TITLES ---------- */
.section-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: #e5e7eb;
    margin-bottom: 1rem;
    border-left: 4px solid #7c3aed;
    padding-left: 10px;
}

/* ---------- BADGES ---------- */
.badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    margin-right: 6px;
    margin-bottom: 6px;
    background: linear-gradient(90deg, #e0e7ff, #ede9fe);
    color: #4338ca;
}

/* ---------- OUTPUT ---------- */
.output-box {
    background: linear-gradient(135deg, #020617, #020617);
    color: #e5e7eb;
    padding: 1.9rem;
    border-radius: 20px;
    line-height: 1.75;
    border: 1px solid rgba(255,255,255,0.1);
}

/* ---------- OUTPUT HEADERS ---------- */
.output-section {
    margin-top: 1.2rem;
    margin-bottom: 0.3rem;
    font-weight: 800;
    color: #a78bfa;
    font-size: 1.05rem;
}

/* ---------- BUTTON ---------- */
.stButton>button {
    background: linear-gradient(90deg, #2563eb, #7c3aed);
    color: white;
    font-weight: 800;
    border-radius: 18px;
    height: 3.4rem;
    border: none;
    box-shadow: 0 16px 40px rgba(99,102,241,0.6);
}

.stButton>button:hover {
    transform: translateY(-1px);
    box-shadow: 0 20px 50px rgba(124,58,237,0.75);
}
</style>
""", unsafe_allow_html=True)

# --------------------------------------------------
# HEADER
# --------------------------------------------------
st.markdown('<div class="main-title">🧬 Cancer Treatment Recommendation AI</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Evidence-based NCCN-style care powered by Rules + GenAI</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="ai-banner">🧠 AI Reasoning Mode: NCCN-Guided · Rule-Validated · Hallucination-Controlled</div>',
    unsafe_allow_html=True
)

# --------------------------------------------------
# LAYOUT
# --------------------------------------------------
left, right = st.columns([1, 1.7], gap="large")

# --------------------------------------------------
# LEFT PANEL — INPUT (COMPACT)
# --------------------------------------------------
with left:
    # st.markdown('<div class="card">', unsafe_allow_html=True)

    st.markdown('<div class="section-title">Patient Information</div>', unsafe_allow_html=True)
    cancer_type = st.selectbox("Cancer Category", ["Breast Cancer"])
    age = st.number_input("Age", 18, 100, 50)

    st.markdown('<div class="section-title">🎯 Tumor Profile</div>', unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    with c1:
        stage = st.selectbox("Cancer Stage", ["1", "2", "3"])
    with c2:
        HER2 = st.radio("HER2 Status", ["positive", "negative"], horizontal=True)

    c3, c4 = st.columns(2)
    with c3:
        ER = st.radio("ER Status", ["positive", "negative"], horizontal=True)
    with c4:
        PR = st.radio("PR Status", ["positive", "negative"], horizontal=True)

    st.markdown('<div class="section-title">🧬 Genomics & Context</div>', unsafe_allow_html=True)
    c5, c6 = st.columns(2)
    with c5:
        BRCA = st.radio("BRCA Mutation", ["positive", "negative"], horizontal=True)
    with c6:
        residual = st.radio("Residual Disease?", ["no", "yes"], horizontal=True)

    reasoning_mode = st.selectbox(
        "AI Reasoning Mode",
        ["Guideline-Conservative", "Escalation-Ready", "Trial-Eligible"]
    )

    st.markdown("<br>", unsafe_allow_html=True)
    generate = st.button("🚀 Generate Treatment Plan", use_container_width=True)

    st.markdown('</div>', unsafe_allow_html=True)

# --------------------------------------------------
# RIGHT PANEL — OUTPUT (STYLED SECTIONS)
# --------------------------------------------------
with right:
    # st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-title">🤖 AI Clinical Reasoning</div>', unsafe_allow_html=True)

    if generate:
        patient = {
            "cancer_type": cancer_type,
            "age": age,
            "stage": stage,
            "ER": ER,
            "PR": PR,
            "HER2": HER2,
            "BRCA": BRCA,
            "residual": residual
        }

        st.markdown("**Detected Clinical Features**")
        st.markdown(
            f"""
            <span class="badge">{cancer_type}</span>
            <span class="badge">Stage {stage}</span>
            <span class="badge">HER2 {HER2}</span>
            <span class="badge">ER {ER}</span>
            <span class="badge">PR {PR}</span>
            <span class="badge">BRCA {BRCA}</span>
            """,
            unsafe_allow_html=True
        )

        with st.spinner("🧠 Generating AI-validated treatment plan…"):
            rules = run_rules(patient)

            if rules.get("error"):
                st.error(rules["error"])
            else:
                output = generate_fast_treatment(patient, rules)

                # ---- Styled Output Rendering ----
                st.markdown('<div class="output-box">', unsafe_allow_html=True)
                for block in output.split("\n\n"):
                    if ":" in block:
                        title, content = block.split(":", 1)
                        st.markdown(f"<div class='output-section'>{title.strip()}</div>", unsafe_allow_html=True)
                        st.markdown(content.strip())
                    else:
                        st.markdown(block)
                st.markdown('</div>', unsafe_allow_html=True)

        with st.expander("⚠️ Clinical Disclaimer"):
            st.write(
                "This system is for educational and hackathon demonstration purposes only. "
                "It does not replace professional medical judgment or official clinical guidelines."
            )

    else:
        st.info("Enter patient details and click **Generate Treatment Plan**")

    st.markdown('</div>', unsafe_allow_html=True)
