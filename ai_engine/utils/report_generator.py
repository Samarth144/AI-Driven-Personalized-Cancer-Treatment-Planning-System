"""
RESONANCE AI — Clinical Report Generator
Skeleton code: professional layout, null-safe field handling, no duplicates.
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, String, Rect, Line
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.barcharts import HorizontalBarChart
from reportlab.graphics.charts.legends import Legend
import os
import numpy as np
from datetime import datetime


# ──────────────────────────────────────────────
#  COLOR PALETTE
# ──────────────────────────────────────────────
C = {
    "primary":   colors.HexColor("#3B5BDB"),   # deep indigo
    "accent":    colors.HexColor("#0CA678"),   # teal-green
    "dark":      colors.HexColor("#0D1B2A"),   # navy
    "mid":       colors.HexColor("#495057"),   # slate body
    "muted":     colors.HexColor("#868E96"),   # caption grey
    "surface":   colors.HexColor("#F8F9FA"),   # card bg
    "border":    colors.HexColor("#DEE2E6"),   # grid lines
    "danger":    colors.HexColor("#FA5252"),
    "warning":   colors.HexColor("#FD7E14"),
    "success":   colors.HexColor("#40C057"),
    "white":     colors.white,
}

PAGE_W, PAGE_H = letter  # 612 × 792 pt
MARGIN_H = 36            # 0.5 in left/right
CONTENT_W = PAGE_W - MARGIN_H * 2   # 540 pt usable width
COL2 = CONTENT_W / 2    # 270 pt half-column
COL3 = CONTENT_W / 3    # 180 pt third-column


# ──────────────────────────────────────────────
#  UTILITY: NULL-SAFE VALUE CLEANER
# ──────────────────────────────────────────────
_EMPTY = {"", "n/a", "none", "undefined", "nan", "null", "—", "-", "___"}

def v(val, fallback=None):
    """Return val if meaningful, else fallback (default None → omit field)."""
    if val is None:
        return fallback
    s = str(val).strip()
    if s.lower() in _EMPTY:
        return fallback
    return s

def vstr(val, fallback="—"):
    """Always return a display string; use '—' when empty."""
    return v(val, fallback) or fallback

def present(val):
    """True only when val is non-empty/non-null."""
    return v(val) is not None

def clean_dict(d: dict) -> dict:
    """Drop keys whose values are null/empty."""
    if not isinstance(d, dict):
        return {}
    return {k: val for k, val in d.items() if present(val)}

def clean_list(lst: list) -> list:
    """Drop null/empty items from a list."""
    if not isinstance(lst, list):
        return []
    return [i for i in lst if present(i)]

def dedup_list(lst: list) -> list:
    """Remove duplicate entries while preserving order."""
    seen, out = set(), []
    for item in lst:
        key = str(item).strip().lower()
        if key not in seen:
            seen.add(key)
            out.append(item)
    return out


# ──────────────────────────────────────────────
#  STYLE SHEET
# ──────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()

    def ps(name, parent="Normal", **kw):
        return ParagraphStyle(name, parent=base[parent], **kw)

    return {
        # Section headings
        "section":   ps("section",   fontSize=11, fontName="Helvetica-Bold",
                         textColor=C["dark"], spaceBefore=14, spaceAfter=6,
                         borderPad=0),

        "subsection": ps("subsection", fontSize=9, fontName="Helvetica-Bold",
                          textColor=C["primary"], spaceBefore=10, spaceAfter=4),

        # Table / card text
        "th":        ps("th",   fontSize=8,  fontName="Helvetica-Bold",
                         textColor=C["white"]),
        "label":     ps("label", fontSize=7.5, fontName="Helvetica-Bold",
                         textColor=C["muted"]),
        "val":       ps("val",   fontSize=9,  fontName="Helvetica",
                         textColor=C["dark"]),
        "val_sm":    ps("val_sm", fontSize=8,  fontName="Helvetica",
                         textColor=C["mid"]),

        # Recommendation hero
        "hero":      ps("hero", fontSize=13, fontName="Helvetica-Bold",
                         textColor=C["white"], alignment=1, leading=18),

        # Bullet rationale
        "bullet":    ps("bullet", fontSize=8.5, fontName="Helvetica",
                         textColor=C["mid"], leftIndent=14,
                         firstLineIndent=-10, spaceAfter=3),

        # Alert
        "alert":     ps("alert", fontSize=8, fontName="Helvetica",
                         textColor=C["mid"]),
    }


# ──────────────────────────────────────────────
#  PAGE TEMPLATE (header + footer via canvas callbacks)
# ──────────────────────────────────────────────
class ReportDoc(SimpleDocTemplate):
    """SimpleDocTemplate subclass that carries per-report metadata."""

    def __init__(self, filename, meta: dict, **kw):
        super().__init__(
            filename,
            pagesize=letter,
            leftMargin=MARGIN_H,
            rightMargin=MARGIN_H,
            topMargin=1.1 * inch,
            bottomMargin=0.75 * inch,
            **kw,
        )
        self.meta = meta  # pass-through dict for header / footer labels

    # ── header ──────────────────────────────
    def on_page(self, canvas, doc):
        canvas.saveState()

        # --- full-width header band (taller to fit logo comfortably) ---
        HEADER_H = 68
        canvas.setFillColor(C["dark"])
        canvas.rect(0, PAGE_H - HEADER_H, PAGE_W, HEADER_H, fill=1, stroke=0)

        # Thin teal accent strip at bottom edge of header
        canvas.setFillColor(colors.HexColor("#0CA678"))
        canvas.rect(0, PAGE_H - HEADER_H, PAGE_W, 2, fill=1, stroke=0)

        # ── Logo (left side) ─────────────────────────────────────────
        LOGO_PATH = os.path.join(os.path.dirname(__file__), "resonance_logo.png")
        if os.path.exists(LOGO_PATH):
            # Original image: 388×114 px → scale to fit inside header
            LOGO_W = 148   # rendered width  (pt)
            LOGO_H = 43    # rendered height (pt)  — keeps ~3.4:1 aspect
            logo_x = MARGIN_H
            logo_y = PAGE_H - HEADER_H + (HEADER_H - LOGO_H) / 2   # vertically centred
            canvas.drawImage(
                LOGO_PATH,
                logo_x, logo_y,
                width=LOGO_W, height=LOGO_H,
                preserveAspectRatio=True,
                mask="auto",            # treats white/near-white as transparent
            )
        else:
            # Fallback text brand if logo file is missing
            canvas.setFillColor(C["white"])
            canvas.setFont("Helvetica-Bold", 14)
            canvas.drawString(MARGIN_H, PAGE_H - 30, "RESONANCE")
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(colors.HexColor("#0CA678"))
            canvas.drawString(MARGIN_H, PAGE_H - 44, "PRECISION ONCOLOGY")

        # ── Report type + timestamp (right side) ─────────────────────
        canvas.setFillColor(C["white"])
        canvas.setFont("Helvetica-Bold", 9)
        canvas.drawRightString(PAGE_W - MARGIN_H, PAGE_H - 22, "TREATMENT SUMMARY REPORT")
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#94A3B8"))
        canvas.drawRightString(
            PAGE_W - MARGIN_H, PAGE_H - 35,
            f"Generated: {datetime.now().strftime('%d %b %Y  %H:%M')}"
        )

        # ── Patient name badge (centre) ───────────────────────────────
        pt_name = vstr(self.meta.get("name"), "Unknown Patient")
        mrn     = vstr(self.meta.get("mrn"),  "N/A")
        BADGE_W = 200
        canvas.setFillColor(colors.HexColor("#1E2D4A"))   # slightly lighter than header bg
        canvas.roundRect(
            PAGE_W / 2 - BADGE_W / 2, PAGE_H - HEADER_H + 14,
            BADGE_W, 22, 5, fill=1, stroke=0
        )
        # Left teal notch on badge
        canvas.setFillColor(colors.HexColor("#0CA678"))
        canvas.roundRect(
            PAGE_W / 2 - BADGE_W / 2, PAGE_H - HEADER_H + 14,
            4, 22, 2, fill=1, stroke=0
        )
        canvas.setFillColor(C["white"])
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawCentredString(
            PAGE_W / 2, PAGE_H - HEADER_H + 23,
            f"{pt_name}   ·   MRN: {mrn}"
        )

        # --- footer ---
        canvas.setStrokeColor(C["border"])
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN_H, 36, PAGE_W - MARGIN_H, 36)

        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(C["muted"])
        canvas.drawString(MARGIN_H, 26, "CONFIDENTIAL — RESONANCE AI PROPRIETARY")
        canvas.drawRightString(PAGE_W - MARGIN_H, 26, f"Page {doc.page}")

        canvas.setFont("Helvetica-Oblique", 6.5)
        disclaimer = (
            "AI-assisted report. Must be reviewed by a licensed medical professional "
            "before any clinical application."
        )
        canvas.drawCentredString(PAGE_W / 2, 14, disclaimer)

        canvas.restoreState()


# ──────────────────────────────────────────────
#  SECTION DIVIDER (decorative rule + label)
# ──────────────────────────────────────────────
def section_divider(label: str, styles: dict):
    """Returns a list of flowables: coloured rule + section heading."""
    return [
        HRFlowable(width="100%", thickness=1.5, color=C["primary"],
                   spaceAfter=4, spaceBefore=12),
        Paragraph(label.upper(), styles["section"]),
    ]


# ──────────────────────────────────────────────
#  CARD TABLE HELPER
# ──────────────────────────────────────────────
def kv_card(pairs: list[tuple], styles: dict, col_widths=None) -> Table | None:
    """
    Build a label/value card from a list of (label, value) tuples.
    Automatically drops pairs with null/empty values.
    Returns None when nothing to render.
    """
    filtered = [(lbl, val) for lbl, val in pairs if present(val)]
    if not filtered:
        return None

    # Deduplicate on label
    seen_labels, deduped = set(), []
    for lbl, val in filtered:
        key = lbl.strip().lower()
        if key not in seen_labels:
            seen_labels.add(key)
            deduped.append((lbl, val))

    # Two columns of label+value side by side
    rows = []
    chunk = 3                         # fields per row
    for i in range(0, len(deduped), chunk):
        group = deduped[i : i + chunk]
        label_row, value_row = [], []
        for lbl, val in group:
            label_row.append(Paragraph(lbl, styles["label"]))
            value_row.append(Paragraph(vstr(val), styles["val"]))
        # Pad to chunk width
        while len(label_row) < chunk:
            label_row.append(Paragraph("", styles["label"]))
            value_row.append(Paragraph("", styles["val"]))
        rows.append(label_row)
        rows.append(value_row)
        rows.append([Spacer(1, 4)] * chunk)

    n = chunk
    cw = col_widths or [CONTENT_W / n] * n
    t = Table(rows, colWidths=cw)
    t.setStyle(TableStyle([
        ("VALIGN",  (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING",   (0, 0), (-1, -1), 4),
    ]))
    return t


# ──────────────────────────────────────────────
#  SECTION 1 — CLINICAL OVERVIEW
# ──────────────────────────────────────────────
def build_overview(patient: dict, styles: dict) -> list:
    story = []
    story += section_divider("1. Clinical Overview", styles)

    path  = clean_dict(patient.get("pathology", {}))
    diag  = vstr(path.get("diagnosis"))
    sub   = vstr(path.get("subtype"))
    stage = vstr(path.get("stage"))
    grade = vstr(path.get("grade"))
    kps   = v(patient.get("kps"))

    # Risk level logic
    risk, risk_col = "MODERATE", C["warning"]
    if any(x in stage for x in ("IV", "4")) or (kps and int(kps) < 70):
        risk, risk_col = "HIGH", C["danger"]
    elif any(x in stage for x in ("I ", "IA", "IB", "1")):
        risk, risk_col = "LOW", C["success"]

    intro_parts = []
    if diag != "—":
        intro_parts.append(f"Patient presents with <b>{diag}</b>")
    if sub != "—":
        intro_parts[-1] += f" ({sub})" if intro_parts else f"Subtype: <b>{sub}</b>"
    intro_parts.append(
        f"Clinical-molecular profile indicates a "
        f"<font color='{risk_col.hexval()}'><b>{risk} RISK</b></font> classification."
    )
    story.append(Paragraph("  ".join(intro_parts), styles["val"]))
    story.append(Spacer(1, 8))

    # Patient profile card — only non-null fields
    pairs = [
        ("PATIENT NAME",     patient.get("name")),
        ("MRN",              patient.get("mrn")),
        ("RISK LEVEL",       risk),
        ("GENDER / AGE",
            f"{v(patient.get('gender'), '')} / {v(patient.get('age'), '')}".strip(" /") or None),
        ("DIAGNOSIS DATE",   patient.get("dod")),
        ("WHO GRADE",        path.get("grade")),
        ("DIAGNOSIS",        path.get("diagnosis")),
        ("SUBTYPE",          path.get("subtype")),
        ("STAGE",            path.get("stage")),
    ]
    card = kv_card(pairs, styles)
    if card:
        story.append(card)

    return story


# ──────────────────────────────────────────────
#  SECTION 2 — PRIMARY RECOMMENDATION
# ──────────────────────────────────────────────
def build_recommendation(patient: dict, styles: dict) -> list:
    story = []
    story += section_divider("2. Primary Clinical Recommendation", styles)

    rec_raw = patient.get("treatment_plan")
    
    if isinstance(rec_raw, dict):
        # Format as "KEY: VALUE" multi-line string
        lines = []
        for k, val in rec_raw.items():
            if present(val):
                lines.append(f"<b>{str(k).upper()}:</b> {str(val).upper()}")
        rec = "<br/>".join(lines)
    else:
        rec = v(rec_raw, "Awaiting multidisciplinary review.")
        rec = str(rec).upper()

    # Hero box
    # We remove rowHeights to allow it to expand naturally for long multi-line plans
    hero_tbl = Table(
        [[Paragraph(rec, styles["hero"])]],
        colWidths=[CONTENT_W]
    )
    hero_tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), C["primary"]),
        ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
        ("TOPPADDING",   (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 12),
        ("LEFTPADDING",  (0, 0), (-1, -1), 15),
        ("RIGHTPADDING", (0, 0), (-1, -1), 15),
    ]))
    story.append(hero_tbl)
    story.append(Spacer(1, 10))

    # Rationale bullets — deduped, null-stripped
    rationale = dedup_list(clean_list(patient.get("rationale", [])))
    if rationale:
        story.append(Paragraph("Clinical Rationale & Evidence Basis", styles["subsection"]))
        for r in rationale:
            story.append(Paragraph(f"• {r}", styles["bullet"]))

    return story


# ──────────────────────────────────────────────
#  SECTION 3 — GENOMIC & MOLECULAR LANDSCAPE
# ──────────────────────────────────────────────
def build_genomics(patient: dict, styles: dict) -> list:
    story = []
    story += section_divider("3. Genomic & Molecular Landscape", styles)

    # VCF summary card
    vcf = clean_dict(patient.get("vcf_metrics", {}))
    vcf_pairs = [
        ("TOTAL VARIANTS",       vcf.get("total")),
        ("ACTIONABLE MUTATIONS", vcf.get("actionable")),
        ("VUS",                  vcf.get("vus")),
        ("TMB",                  vcf.get("tmb")),
        ("MSI STATUS",           vcf.get("msi")),
    ]
    card = kv_card(vcf_pairs, styles)
    if card:
        story.append(card)
        story.append(Spacer(1, 8))

    # Genomics detail table
    genomics = dedup_list(clean_list(patient.get("genomics", [])))
    if genomics:
        hdr = [
            Paragraph("GENE",            styles["th"]),
            Paragraph("STATUS",          styles["th"]),
            Paragraph("CLINICAL IMPACT", styles["th"]),
            Paragraph("TIER",            styles["th"]),
        ]
        rows = [hdr]
        for g in genomics:
            if not isinstance(g, (list, tuple)) or len(g) < 2:
                continue
            row = [Paragraph(vstr(c), styles["val_sm"]) for c in g[:4]]
            while len(row) < 4:
                row.append(Paragraph("—", styles["val_sm"]))
            rows.append(row)

        if len(rows) > 1:
            t = Table(rows, colWidths=[65, 105, 310, 60])
            t.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1,  0), C["dark"]),
                ("TEXTCOLOR",     (0, 0), (-1,  0), C["white"]),
                ("ROWBACKGROUNDS",(0, 1), (-1, -1), [C["white"], C["surface"]]),
                ("GRID",          (0, 0), (-1, -1), 0.4, C["border"]),
                ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING",    (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING",   (0, 0), (-1, -1), 6),
            ]))
            story.append(t)

    return story


# ──────────────────────────────────────────────
#  SECTION 4 — IMAGING & VOLUMETRICS
# ──────────────────────────────────────────────
def _pie_chart(metrics: dict) -> Drawing:
    slices = [
        ("Enhancing", v(metrics.get("core_vol")),    C["primary"]),
        ("Edema",     v(metrics.get("edema_vol")),   C["warning"]),
        ("Necrosis",  v(metrics.get("necrotic_pct")), C["muted"]),
    ]
    slices = [(lbl, float(val), col) for lbl, val, col in slices if val is not None]

    d = Drawing(COL2, 110)
    if not slices:
        d.add(String(COL2 / 2, 55, "No data", fontSize=8, textAnchor="middle",
                     fontName="Helvetica", fillColor=C["muted"]))
        return d

    pc = Pie()
    pc.x, pc.y, pc.width, pc.height = 10, 15, 80, 80
    pc.data   = [s[1] for s in slices]
    pc.labels = [""] * len(slices)
    for i, (_, _, col) in enumerate(slices):
        pc.slices[i].fillColor     = col
        pc.slices[i].strokeColor   = C["white"]
        pc.slices[i].strokeWidth   = 0.5
    d.add(pc)

    leg = Legend()
    leg.x, leg.y, leg.fontSize = 100, 90, 7
    leg.fontName     = "Helvetica"
    leg.columnMaximum = 10
    leg.colorNamePairs = [(col, lbl) for lbl, _, col in slices]
    d.add(leg)
    return d


def _km_plot(median_months) -> Drawing:
    try:
        m = float(str(median_months).split()[0])
    except Exception:
        m = 12.0

    d = Drawing(COL2, 120)
    lp = LinePlot()
    lp.x, lp.y, lp.width, lp.height = 30, 25, COL2 - 45, 80

    t = np.linspace(0, m * 2.5, 30)
    s = np.exp(-t * np.log(2) / m) * 100

    lp.data = [list(zip(t, s))]
    lp.lines[0].strokeColor = C["primary"]
    lp.lines[0].strokeWidth = 1.8

    lp.xValueAxis.valueMin, lp.xValueAxis.valueMax = 0, round(m * 2.5)
    lp.xValueAxis.labelTextFormat = "%d"
    lp.xValueAxis.labels.fontSize = 6

    lp.yValueAxis.valueMin, lp.yValueAxis.valueMax, lp.yValueAxis.valueStep = 0, 100, 25
    lp.yValueAxis.labelTextFormat = "%d%%"
    lp.yValueAxis.labels.fontSize = 6

    d.add(lp)
    d.add(String(lp.x + lp.width / 2, 12,
                 "Months post-initiation", fontSize=6,
                 textAnchor="middle", fontName="Helvetica", fillColor=C["muted"]))
    return d


def build_imaging(patient: dict, styles: dict) -> list:
    story = []
    story += section_divider("4. Imaging & Volumetric Analytics", styles)

    metrics = clean_dict(patient.get("imaging_metrics", {}))

    # Metrics summary strip
    metric_pairs = [
        ("CORE VOLUME (cc)",   metrics.get("core_vol")),
        ("EDEMA VOLUME (cc)",  metrics.get("edema_vol")),
        ("NECROTIC %",         metrics.get("necrotic_pct")),
        ("SPHERICITY",         metrics.get("sphericity")),
        ("MAX DIAMETER (mm)",  metrics.get("max_diam")),
        ("KPS SCORE",          patient.get("kps")),
        ("ECOG SCORE",         patient.get("ecog")),
    ]
    card = kv_card(metric_pairs, styles)
    if card:
        story.append(card)
        story.append(Spacer(1, 8))

    # Side-by-side: pie chart | KM plot
    pie = _pie_chart(metrics)
    os_val = v(patient.get("outcomes", {}).get("os"), "12")
    km  = _km_plot(os_val)

    cols = [
        [Paragraph("Volumetric Distribution", styles["label"]), pie],
        [Paragraph("Estimated Survival Projection", styles["label"]), km],
    ]
    t = Table([cols], colWidths=[COL2, COL2])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",  (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t)

    return story


# ──────────────────────────────────────────────
#  SECTION 5 — TOXICITY PROFILE
# ──────────────────────────────────────────────
def _tox_chart(tox_data: dict) -> Drawing:
    tox_data = {k: float(val) for k, val in tox_data.items() if present(val)}
    if not tox_data:
        d = Drawing(COL2, 80)
        d.add(String(COL2 / 2, 40, "No toxicity data",
                     fontSize=8, textAnchor="middle", fontName="Helvetica",
                     fillColor=C["muted"]))
        return d

    d = Drawing(COL2, max(80, len(tox_data) * 16 + 30))
    bc = HorizontalBarChart()
    bc.x, bc.y      = 60, 18
    bc.width, bc.height = COL2 - 75, max(60, len(tox_data) * 14)

    bc.data = [list(tox_data.values())]
    bc.categoryAxis.categoryNames = [k.capitalize() for k in tox_data.keys()]
    bc.categoryAxis.labels.fontSize = 7
    bc.valueAxis.valueMin, bc.valueAxis.valueMax = 0, 100
    bc.valueAxis.valueStep  = 25
    bc.valueAxis.labels.fontSize = 7
    bc.bars[0].fillColor    = C["warning"]
    bc.bars[0].strokeColor  = C["white"]
    d.add(bc)
    d.add(String(bc.x + bc.width / 2, 6,
                 "Toxicity Risk (%)", fontSize=7,
                 textAnchor="middle", fontName="Helvetica-Bold",
                 fillColor=C["muted"]))
    return d


def build_outcomes(patient: dict, styles: dict) -> list:
    story = []
    story += section_divider("5. Advanced Outcome Projections", styles)

    outcomes = clean_dict(patient.get("outcomes", {}))
    out_pairs = [
        ("MEDIAN OS",   outcomes.get("os")),
        ("MEDIAN PFS",  outcomes.get("pfs")),
        ("RESPONSE RATE", outcomes.get("rr")),
        ("5-YR SURVIVAL", outcomes.get("5yr")),
    ]
    card = kv_card(out_pairs, styles)
    if card:
        story.append(card)
        story.append(Spacer(1, 6))

    # Toxicity chart
    tox = clean_dict(patient.get("toxicity_profile", {}))
    if tox:
        story.append(Paragraph("Therapeutic Toxicity Profile", styles["subsection"]))
        story.append(_tox_chart(tox))

    return story


# ──────────────────────────────────────────────
#  SECTION 6 — PATIENT-REPORTED OUTCOMES (optional)
# ──────────────────────────────────────────────
def build_pro(patient: dict, styles: dict) -> list:
    adherence = clean_list(patient.get("adherence_history", []))
    alerts    = clean_list(patient.get("recent_alerts", []))
    if not adherence and not alerts:
        return []          # skip section entirely

    story = []
    story += section_divider("6. Patient-Reported Outcomes", styles)

    if adherence:
        avg = sum(h["score"] for h in adherence if present(h.get("score"))) / len(adherence)
        col = C["success"] if avg > 80 else C["warning"] if avg > 50 else C["danger"]
        story.append(Paragraph(
            f"<b>30-Day Protocol Adherence:</b> "
            f"<font color='{col.hexval()}'>{avg:.1f}%</font>",
            styles["val"],
        ))
        story.append(Spacer(1, 4))

    if alerts:
        story.append(Paragraph("Recent Clinical Alerts", styles["subsection"]))
        for a in dedup_list(alerts)[:5]:
            prio = vstr(a.get("priority"), "INFO")
            msg  = vstr(a.get("message"),  "(no message)")
            story.append(Paragraph(f"• [{prio}] {msg}", styles["alert"]))

    return story


# ──────────────────────────────────────────────
#  SECTION 7 — IMMEDIATE ACTIONS
# ──────────────────────────────────────────────
def build_actions(patient: dict, styles: dict) -> list:
    actions = dedup_list(clean_list(patient.get("next_actions", [
        "Initiate recommended protocol within 7–10 days.",
        "Schedule baseline MRI/CT for post-treatment comparison.",
        "Monitor hematological parameters weekly if systemic therapy initiated.",
    ])))

    story = []
    story += section_divider("7. Immediate Clinical Actions", styles)
    for i, a in enumerate(actions, 1):
        story.append(Paragraph(f"{i}.  {a}", styles["bullet"]))
    return story


# ──────────────────────────────────────────────
#  MAIN: generate_cancer_report()
# ──────────────────────────────────────────────
def generate_cancer_report(output_filename: str, patient: dict) -> None:
    """
    Entry point.  patient dict keys (all optional / null-safe):

        name, mrn, gender, age, dod, kps, ecog
        pathology:      { diagnosis, subtype, stage, grade }
        treatment_plan: str
        rationale:      [str, ...]
        vcf_metrics:    { total, actionable, vus, tmb, msi }
        genomics:       [[gene, status, impact, tier], ...]
        imaging_metrics:{ core_vol, edema_vol, necrotic_pct, sphericity, max_diam }
        outcomes:       { os, pfs, rr, 5yr }
        toxicity_profile: { fatigue: 40, nausea: 20, ... }
        adherence_history: [{ score: 85 }, ...]
        recent_alerts:  [{ priority: "HIGH", message: "..." }, ...]
        next_actions:   [str, ...]
    """
    os.makedirs(os.path.dirname(output_filename) or ".", exist_ok=True)
    styles = build_styles()

    doc = ReportDoc(
        output_filename,
        meta={ "name": patient.get("name"), "mrn": patient.get("mrn") },
    )

    story = []

    # Build each section; each returns a list of flowables
    story += build_overview(patient, styles)
    story.append(Spacer(1, 6))
    story += build_recommendation(patient, styles)
    story.append(Spacer(1, 6))
    story += build_genomics(patient, styles)
    story.append(PageBreak())
    story += build_imaging(patient, styles)
    story.append(Spacer(1, 6))
    story += build_outcomes(patient, styles)
    story += build_pro(patient, styles)
    story.append(Spacer(1, 6))
    story += build_actions(patient, styles)

    doc.build(story, onFirstPage=doc.on_page, onLaterPages=doc.on_page)
    print(f"✓ Report saved → {output_filename}")


# ──────────────────────────────────────────────
#  SAMPLE USAGE
# ──────────────────────────────────────────────
if __name__ == "__main__":
    sample_patient = {
        "name":   "Jane Doe",
        "mrn":    "MRN-20240087",
        "gender": "Female",
        "age":    "54",
        "dod":    "12 Jan 2024",
        "kps":    "80",
        "ecog":   "1",

        "pathology": {
            "diagnosis": "Glioblastoma Multiforme",
            "subtype":   "IDH-Wildtype",
            "stage":     "IV",
            "grade":     "Grade 4",
        },

        "treatment_plan": (
            "Stupp Protocol — Concurrent Temozolomide + RT (60 Gy/30 fx), "
            "followed by adjuvant TMZ × 6 cycles"
        ),

        "rationale": [
            "IDH-wildtype GBM with MGMT methylation confirmed — TMZ sensitivity predicted.",
            "KPS 80 supports aggressive standard-of-care protocol.",
            "No contraindications to alkylating agents on CBC review.",
            "EGFR amplification detected; consider erlotinib if recurrence.",
        ],

        "vcf_metrics": {
            "total":      "1,247",
            "actionable": "14",
            "vus":        "83",
            "tmb":        "8.4 mut/Mb",
            "msi":        "MSS",
        },

        "genomics": [
            ["EGFR",  "Amplified",  "Potential erlotinib sensitivity",     "Tier I"],
            ["PTEN",  "Deleted",    "PI3K/AKT pathway activation",         "Tier I"],
            ["MGMT",  "Methylated", "Improved TMZ response probability",   "Tier I"],
            ["TP53",  "Mutated",    "Tumour suppressor loss",               "Tier II"],
            ["CDKN2A","Deleted",    "Cell-cycle checkpoint dysregulation",  "Tier II"],
        ],

        "imaging_metrics": {
            "core_vol":    "18.4",
            "edema_vol":   "42.1",
            "necrotic_pct":"6.2",
            "sphericity":  "0.71",
            "max_diam":    "38",
        },

        "outcomes": {
            "os":  "18.5 Months",
            "pfs": "7.2 Months",
            "rr":  "42%",
            "5yr": "9.8%",
        },

        "toxicity_profile": {
            "Fatigue":        55,
            "Nausea":         30,
            "Myelosuppression": 40,
            "Neuro (Grade 3)": 18,
            "Alopecia":       25,
        },

        "adherence_history": [
            {"score": 92}, {"score": 88}, {"score": 75},
            {"score": 90}, {"score": 85},
        ],

        "recent_alerts": [
            {"priority": "HIGH",   "message": "Platelet count < 100 k/μL — hold TMZ, repeat CBC in 48 h."},
            {"priority": "MEDIUM", "message": "Patient reported grade-2 fatigue; supportive care initiated."},
        ],

        "next_actions": [
            "Initiate Stupp protocol within 7 days of surgical confirmation.",
            "Arrange simulation CT for radiotherapy planning.",
            "Monitor CBC weekly; hold TMZ if ANC < 1.5 × 10⁹/L.",
            "Neurosurgery review at 6-week post-op MRI.",
        ],
    }

    # Use a relative path for local testing
    generate_cancer_report("reports/resonance_sample_report.pdf", sample_patient)
