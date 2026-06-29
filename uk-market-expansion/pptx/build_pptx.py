"""
ECY — UK Pitch Deck → PPTX  (premium-minimal rebuild)
Native, editable PowerPoint in the 'Resolved Field' aesthetic, restructured and
UK-optimized: differentiators + UK proof front-loaded, ISO 19650 / RIBA / CDE
compliance made explicit, an offshore de-risk slide, a 'Why now' market slide,
and an A/B/C pricing comparison. Calmer point-field backgrounds, more whitespace,
single brass accent per slide.

Content grounded by research; Leas Pavilion framed strictly as the BIM Manager's
personal experience (no prior-employer / client attribution).
Windows-safe fonts: Segoe UI family + Consolas (mono).
"""
import os, glob
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from PIL import Image
import render_field as rf

HERE = os.path.dirname(os.path.abspath(__file__))
REND = os.path.join(HERE, "_render")
PROJ = os.path.join(HERE, "projects")
os.makedirs(REND, exist_ok=True)

# ---- palette -----------------------------------------------------------
BRASS    = RGBColor(0xBD, 0x94, 0x57)
BRASSLIT = RGBColor(0xDB, 0xB5, 0x71)
BRASSDIM = RGBColor(0x6E, 0x57, 0x34)   # hairline brass on espresso
BONE     = RGBColor(0xEC, 0xE3, 0xD1)
BONEDIM  = RGBColor(0xB9, 0xAE, 0x99)
ASH      = RGBColor(0x87, 0x7C, 0x6B)
ASHDIM   = RGBColor(0x5B, 0x53, 0x45)
PANEL    = RGBColor(0x22, 0x1A, 0x12)
EDGE     = RGBColor(0x2A, 0x21, 0x14)

# ---- fonts -------------------------------------------------------------
DISP = "Segoe UI Light"
SEMI = "Segoe UI Semibold"
BODY = "Segoe UI"
LIGHT = "Segoe UI Light"
MONO = "Consolas"

EMU_W, EMU_H = Inches(13.333), Inches(7.5)
M = 0.92  # governing margin (inches)


# ---- primitives --------------------------------------------------------
def tx(slide, x, y, w, h, lines, anchor=MSO_ANCHOR.TOP, align=PP_ALIGN.LEFT):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = line.get("align", align)
        if "space_after" in line:
            p.space_after = Pt(line["space_after"])
        if "space_before" in line:
            p.space_before = Pt(line["space_before"])
        p.line_spacing = line.get("ls", 1.0)
        for run in line["runs"]:
            r = p.add_run()
            r.text = run["t"]
            f = r.font
            f.name = run.get("font", BODY)
            f.size = Pt(run["size"])
            f.color.rgb = run.get("color", BONE)
            f.bold = run.get("bold", False)
            f.italic = run.get("italic", False)
    return tb


def rule(slide, x1, y1, x2, y2, color=BRASSDIM, w=0.75):
    ln = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    ln.line.color.rgb = color
    ln.line.width = Pt(w)
    ln.shadow.inherit = False
    return ln


def background(slide, name, mood="calm", **kw):
    path = os.path.join(REND, name + ".png")
    rf.render_plate(path, mood=mood, **kw)
    slide.shapes.add_picture(path, 0, 0, EMU_W, EMU_H)


def masthead(slide, tag, idx):
    tx(slide, M, 0.56, 8, 0.4, [{"runs": [{"t": tag, "font": MONO, "size": 9.5, "color": ASH}]}])
    tx(slide, EMU_W.inches - M - 3, 0.56, 3, 0.4,
       [{"runs": [{"t": idx, "font": MONO, "size": 9.5, "color": ASH}]}], align=PP_ALIGN.RIGHT)


def eyebrow(slide, text, x=M, y=1.5):
    tx(slide, x, y, 10, 0.35, [{"runs": [{"t": text, "font": MONO, "size": 10, "color": BRASS}]}])


def headline(slide, x, y, w, text, accent=None, size=34, color=BONE, ls=1.04):
    runs = []
    if accent and accent in text:
        a, b = text.split(accent, 1)
        if a:
            runs.append({"t": a, "font": DISP, "size": size, "color": color})
        runs.append({"t": accent, "font": DISP, "size": size, "color": BRASS, "italic": True})
        if b:
            runs.append({"t": b, "font": DISP, "size": size, "color": color})
    else:
        runs = [{"t": text, "font": DISP, "size": size, "color": color}]
    tx(slide, x, y, w, 1.8, [{"runs": runs, "ls": ls}])


def subhead(slide, x, y, w, text, size=15, color=BONEDIM):
    tx(slide, x, y, w, 1.0, [{"runs": [{"t": text, "font": LIGHT, "size": size, "color": color}], "ls": 1.32}])


def bullets(slide, x, y, w, items, size=13, gap=11, ls=1.4, color=BONEDIM, dash="—"):
    lines = []
    for it in items:
        lines.append({"runs": [
            {"t": dash + "   ", "font": MONO, "size": size - 2, "color": BRASS},
            {"t": it, "font": LIGHT, "size": size, "color": color}], "ls": ls, "space_after": gap})
    h = min(7.35 - y, 0.55 * len(items) + 2.2)
    tx(slide, x, y, w, h, lines)


def chips(slide, items, x, y, gap=2.15, big=30, brass_idx=0, vw=None):
    vw = vw or (gap - 0.2)
    for i, (val, lab) in enumerate(items):
        col = BRASSLIT if i == brass_idx else BONE
        tx(slide, x + i * gap, y, vw, 1.1, [
            {"runs": [{"t": val, "font": LIGHT, "size": big, "color": col}], "ls": 0.9},
            {"runs": [{"t": lab.upper(), "font": MONO, "size": 8, "color": ASH}], "ls": 1.15, "space_before": 3}])


def cover_fit(src, w_in, h_in, out):
    im = Image.open(src).convert("RGB")
    tw, th = w_in / h_in, im.width / im.height
    if th > tw:
        nw = int(im.height * tw); xo = (im.width - nw) // 2
        im = im.crop((xo, 0, xo + nw, im.height))
    else:
        nh = int(im.width / tw); yo = (im.height - nh) // 2
        im = im.crop((0, yo, im.width, yo + nh))
    im.save(out, "JPEG", quality=88)
    return out


def framed_image(slide, src, x, y, w, h):
    out = os.path.join(REND, os.path.splitext(os.path.basename(src))[0] + "_fit.jpg")
    cover_fit(src, w, h, out)
    pic = slide.shapes.add_picture(out, Inches(x), Inches(y), Inches(w), Inches(h))
    ln = pic.line; ln.color.rgb = EDGE; ln.width = Pt(1)
    return pic


def project_image(slide, folder, x, y, w, h):
    imgs = []
    for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.JPG", "*.PNG"):
        imgs += glob.glob(os.path.join(PROJ, folder, ext))
    if imgs:
        framed_image(slide, sorted(imgs)[0], x, y, w, h)
    else:
        sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
        sh.fill.solid(); sh.fill.fore_color.rgb = PANEL
        sh.line.color.rgb = BRASS; sh.line.width = Pt(1)
        sh.shadow.inherit = False
        tf = sh.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
        r = p.add_run(); r.text = "PROJECT IMAGE\n→ pptx/projects/" + folder + "/"
        r.font.name = MONO; r.font.size = Pt(11); r.font.color.rgb = ASH


# ---- contacts ----------------------------------------------------------
UK_PHONE = "+44 7786 410586"
TR_PHONE = "+90 533 566 67 80"
INFO = "info@ecy.com.tr"
RAMI_MAIL = "rami@ecy.com.tr"

# ---- build -------------------------------------------------------------
prs = Presentation()
prs.slide_width = EMU_W
prs.slide_height = EMU_H
blank = prs.slide_layouts[6]


def slide():
    return prs.slides.add_slide(blank)


# 01 — COVER ------------------------------------------------------------
s = slide()
background(s, "s01", structure="elevation", phase=.14, density=1500, seed=3, mood="hero")
masthead(s, "ECY · ARCHITECTURE & BIM", "01 / 14")
eyebrow(s, "OFFSHORE BIM PRODUCTION PARTNER · UNITED KINGDOM", y=2.6)
tx(s, M, 3.1, 11.6, 1.9, [
    {"runs": [{"t": "The ", "font": DISP, "size": 46, "color": BONE},
              {"t": "production engine", "font": DISP, "size": 46, "color": BRASS, "italic": True}], "ls": 1.04},
    {"runs": [{"t": "behind UK practices.", "font": DISP, "size": 46, "color": BONE}], "ls": 1.04}])
subhead(s, M, 5.0, 9.6, "You keep the client and the design intent. We take the modelling load.", size=17)
rule(s, M, 5.95, M + 2.2, 5.95, color=BRASS, w=1.0)
tx(s, M, 6.25, 11.6, 0.9, [
    {"runs": [{"t": "Enes Cemil Yağcı — Founder & BIM Manager", "font": BODY, "size": 11.5, "color": BONE},
              {"t": "    ·    Autodesk Expert Elite · ~250 worldwide", "font": MONO, "size": 10, "color": BRASS}], "space_after": 5},
    {"runs": [{"t": "UK contact: Rami Daşkın · " + UK_PHONE + " · " + RAMI_MAIL + " · ecy.com.tr",
               "font": MONO, "size": 10, "color": ASH}]}])

# 02 — DIFFERENTIATORS (front-loaded) -----------------------------------
s = slide()
background(s, "s02", structure="grid", phase=.30, density=1100, seed=9, mood="calm")
masthead(s, "WHY ECY", "02 / 14")
eyebrow(s, "THREE REASONS, UP FRONT")
headline(s, M, 1.95, 11.4, "A UK contact, an elite credential, proven delivery.", "UK contact", size=33)
# three columns split by hairline rules
cols = [
    ("~250", "EXPERT ELITE WORLDWIDE", "Autodesk Expert Elite-led production — a recognition held by only ~250 professionals worldwide.", True),
    ("UK", "REPRESENTATIVE, 26 YRS", "Rami Daşkın, 26 years in the UK. Same time zone, local meetings, no language gap.", False),
    ("218", "PROJECTS · 17 COUNTRIES", "A track record that travels — 15 years' team experience, standards-led throughout.", False),
]
cx = M
cw = 3.62
for i, (val, lab, desc, lit) in enumerate(cols):
    if i > 0:
        rule(s, cx - 0.25, 3.55, cx - 0.25, 5.95, color=BRASSDIM, w=0.75)
    tx(s, cx, 3.55, cw - 0.3, 1.0, [
        {"runs": [{"t": val, "font": LIGHT, "size": 40, "color": BRASSLIT if lit else BONE}], "ls": 0.9}])
    tx(s, cx, 4.55, cw - 0.3, 0.35, [{"runs": [{"t": lab, "font": MONO, "size": 8.5, "color": ASH}]}])
    tx(s, cx, 4.95, cw - 0.4, 1.4, [{"runs": [{"t": desc, "font": LIGHT, "size": 12, "color": BONEDIM}], "ls": 1.4}])
    cx += cw

# 03 — UK PROOF (Leas) — anchored to the individual ---------------------
s = slide()
background(s, "s03", structure="elevation", phase=.50, density=1100, seed=66, mood="calm")
masthead(s, "UK EXPERIENCE", "03 / 14")
project_image(s, "leas", 7.55, 2.45, 4.85, 3.4)
eyebrow(s, "FOLKESTONE, KENT")
headline(s, M, 1.98, 6.2, "Leas Pavilion — led by ECY's BIM Manager.", "BIM Manager", size=27)
tx(s, M, 3.1, 6.0, 1.2, [{"runs": [{"t": "A UK project led by Enes Cemil Yağcı as BIM Manager — the 1902 Grade II listed tea room, restored beneath a new nine-storey, 91-home development.",
                                    "font": LIGHT, "size": 12.5, "color": BONEDIM}], "ls": 1.35}])
bullets(s, M, 4.4, 5.9, [
    "As BIM Manager, Enes led RIBA Stage 5–7 execution-drawing coordination — structural, mechanical and electrical.",
    "He ran the BIM model and subcontractor drawing review for dimensional accuracy and tolerances.",
], size=12, gap=9, color=ASH)
# project-context stats (clearly labelled as the building, not ECY's deliverable)
tx(s, M, 5.95, 4, 0.3, [{"runs": [{"t": "PROJECT CONTEXT", "font": MONO, "size": 8, "color": ASHDIM}]}])
chips(s, [("133,715", "sq ft"), ("91", "apartments"), ("9", "storeys")], M, 6.28, gap=1.7, big=21, brass_idx=-1)
tx(s, 7.55, 5.95, 4.85, 0.3, [{"runs": [{"t": "Project context · BIM delivery led by ECY's BIM Manager",
                                          "font": MONO, "size": 7.5, "color": ASHDIM}]}])

# 04 — WHY NOW ----------------------------------------------------------
s = slide()
background(s, "s04", structure="grid", phase=.40, density=1000, seed=14, mood="calm")
masthead(s, "WHY NOW", "04 / 14")
eyebrow(s, "UK MARKET CONDITIONS · 2025–2026")
headline(s, M, 1.95, 11.4, "The modelling load is rising. The people aren't.", "modelling load", size=32)
bullets(s, M, 3.1, 6.95, [
    "Hardest hiring market in years — construction & engineering are the UK's worst-hit sector for recruitment difficulty (BCC, 2024).",
    "BIM headcount is a heavy fixed cost — a Coordinator runs c.£34k–£54k, a Manager up to c.£80k, before on-costs and software.",
    "Pipeline is recovering as build costs climb — more delivery, less room to staff up permanently (RICS).",
    "Standards are non-negotiable — ISO 19650 on UK public work; the Building Safety Act 'golden thread' on higher-risk buildings.",
], size=12.5, gap=16, color=BONEDIM)
rule(s, 8.5, 3.1, 8.5, 6.55, color=BRASSDIM, w=0.75)
rail = [("82%", "constr. & eng. firms", "hiring difficulty · BCC Q2 2024", True),
        ("+17%", "forward workload", "RICS · infra +32%", False),
        ("~251.5k", "extra workers by 2028", "CITB skills network", False)]
ry = 3.2
for val, lab, sub, lit in rail:
    tx(s, 8.95, ry, 3.5, 1.1, [
        {"runs": [{"t": val, "font": LIGHT, "size": 30, "color": BRASSLIT if lit else BONE}], "ls": 0.9},
        {"runs": [{"t": lab.upper(), "font": MONO, "size": 8, "color": ASH}], "space_before": 3},
        {"runs": [{"t": sub, "font": MONO, "size": 7.5, "color": ASHDIM}], "space_before": 1}])
    ry += 1.15

# 05 — WHERE WE FIT -----------------------------------------------------
s = slide()
background(s, "s05", structure="elevation", phase=.55, density=1100, seed=31, mood="calm")
masthead(s, "WHERE WE FIT", "05 / 14")
eyebrow(s, "THE GAP IN UK DELIVERY")
headline(s, M, 1.95, 11.4, "A production engine, not a competitor.", "not a competitor", size=33)
# two-zone schematic
tx(s, M, 3.5, 4.3, 1.3, [
    {"runs": [{"t": "YOU", "font": DISP, "size": 34, "color": BONE}], "ls": 0.9, "space_after": 6},
    {"runs": [{"t": "Client relationship · design intent · your brand", "font": MONO, "size": 9.5, "color": ASH}]}])
tx(s, 8.5, 3.5, 4.0, 1.3, [
    {"runs": [{"t": "ECY", "font": DISP, "size": 34, "color": BRASSLIT}], "ls": 0.9, "space_after": 6},
    {"runs": [{"t": "BIM production · on your standards", "font": MONO, "size": 9.5, "color": ASH}]}])
rule(s, 4.55, 3.78, 8.35, 3.78, color=BRASS, w=1.0)
tx(s, 4.55, 3.42, 3.8, 0.3, [{"runs": [{"t": "the modelling load  →", "font": MONO, "size": 8.5, "color": BRASS}], "align": PP_ALIGN.CENTER}])
bullets(s, M, 5.35, 11.2, [
    "The squeeze: rising ISO 19650 duties, scarce and expensive BIM talent, deadline spikes you can't permanently staff for.",
    "Our answer: a dedicated, standards-led production team that works to your BEP, your naming and your CDE — white-label.",
], size=12.5, gap=10, color=BONEDIM)

# 06 — SERVICES ---------------------------------------------------------
s = slide()
background(s, "s06", structure="grid", phase=.50, density=1100, seed=23, mood="calm")
masthead(s, "WHAT WE DO", "06 / 14")
eyebrow(s, "FIVE SERVICES")
headline(s, M, 1.95, 11.4, "From point cloud to coordinated, costed model.", "coordinated, costed", size=32)
sy = 3.2
for k, v, x2 in [("01", "BIM Modelling · Revit · arch / struct / MEP", "LOD 300–400 · as-built to 500"),
                 ("02", "Scan-to-BIM · point cloud to as-built", "E57 / RCP → Revit"),
                 ("03", "Coordination & Clash Detection", "Navisworks federated"),
                 ("04", "4D / 5D · programme & cost", "Primavera P6"),
                 ("05", "BEP & CDE setup", "ISO 19650")]:
    tx(s, M, sy, 8.6, 0.5, [{"runs": [
        {"t": k + "    ", "font": MONO, "size": 11, "color": BRASS},
        {"t": v, "font": LIGHT, "size": 16.5, "color": BONE}]}])
    tx(s, EMU_W.inches - M - 3.0, sy + 0.05, 3.0, 0.4,
       [{"runs": [{"t": x2.upper(), "font": MONO, "size": 8.5, "color": ASHDIM}]}], align=PP_ALIGN.RIGHT)
    if k != "05":
        rule(s, M, sy + 0.62, EMU_W.inches - M, sy + 0.62, color=EDGE, w=0.5)
    sy += 0.78

# 07 — UK STANDARDS -----------------------------------------------------
s = slide()
background(s, "s07", structure="grid", phase=.62, density=1100, seed=72, mood="calm")
masthead(s, "UK STANDARDS", "07 / 14")
eyebrow(s, "ISO 19650 BY DEFAULT")
headline(s, M, 1.95, 7.3, "Built to UK standard, not retrofitted to it.", "UK standard", size=30)
rows = [
    ("FRAMEWORK", "ISO 19650-1 to -5 — delivery, operational, exchange & security-minded information management"),
    ("NAMING", "BS EN ISO 19650-2 UK convention (Project-Originator-Volume-Level-Type-Role-Number); supersedes BS 1192"),
    ("CDE WORKFLOW", "Controlled suitability codes  S0 WIP → S1–S4 Shared → A/B Published — full revision traceability"),
    ("STAGE-ALIGNED", "RIBA Plan of Work 2020 stages 0–7; proven at Stages 5–7 execution"),
]
ry = 3.15
for lab, val in rows:
    tx(s, M, ry, 1.9, 0.5, [{"runs": [{"t": lab, "font": MONO, "size": 9, "color": BRASS}]}])
    tx(s, M + 2.0, ry - 0.02, 5.7, 0.8, [{"runs": [{"t": val, "font": LIGHT, "size": 11.5, "color": BONEDIM}], "ls": 1.28}])
    rule(s, M, ry + 0.72, 8.7, ry + 0.72, color=EDGE, w=0.5)
    ry += 0.9
# right rail: the naming example as a quiet artefact
tx(s, 9.15, 3.15, 3.3, 0.3, [{"runs": [{"t": "NAMING EXAMPLE", "font": MONO, "size": 8, "color": ASHDIM}]}])
tx(s, 9.15, 3.5, 3.4, 0.6, [{"runs": [{"t": "WBP-EDO-00-XX-SP-Z-0001", "font": MONO, "size": 13.5, "color": BRASSLIT}]}])
tx(s, 9.15, 4.15, 3.4, 1.6, [
    {"runs": [{"t": "Project · Originator · Volume", "font": MONO, "size": 9, "color": ASH}], "ls": 1.6, "space_after": 4},
    {"runs": [{"t": "Level · Type · Role · Number", "font": MONO, "size": 9, "color": ASH}], "ls": 1.6}])

# 08 — DE-RISK ----------------------------------------------------------
s = slide()
background(s, "s08", structure="elevation", phase=.60, density=1100, seed=44, mood="calm")
masthead(s, "DE-RISKING OFFSHORE", "08 / 14")
eyebrow(s, "YOUR THREE FEARS, ANSWERED")
headline(s, M, 1.95, 11.4, "Quality, revision risk, communication — each with a mechanism.", "a mechanism", size=27)
bands = [
    ("QUALITY", "Every model is QA-gated against the BEP and EIR — model-health checks, Navisworks clash validation and a documented review at the S0 → S1/S2 transition. No model is issued to your CDE until it passes the QA gate against the agreed LOD."),
    ("REVISION RISK", "ISO 19650 CDE workflow with controlled status codes (S0→S4→A/B): every issue traceable, single-source-of-truth, full revision history per container. No overwriting, no lost markups."),
    ("COMMUNICATION", "A UK-based representative — same time zone, local meetings, no language gap. Work flows to the BEP and MIDP/TIDP dates, with issue-tracked clash reports."),
]
by = 3.25
for lab, val in bands:
    tx(s, M, by, 2.5, 0.5, [{"runs": [{"t": lab, "font": MONO, "size": 11, "color": BRASS}]}])
    tx(s, M + 2.7, by - 0.03, 8.6, 1.0, [{"runs": [{"t": val, "font": LIGHT, "size": 12, "color": BONEDIM}], "ls": 1.32}])
    rule(s, M, by + 1.04, EMU_W.inches - M, by + 1.04, color=EDGE, w=0.5)
    by += 1.22

# 09 — CASE · ERBIL -----------------------------------------------------
s = slide()
background(s, "s09", structure="elevation", phase=.70, density=1100, seed=50, mood="calm")
masthead(s, "CASE STUDY · 01", "09 / 14")
project_image(s, "erbil", 7.35, 2.35, 5.05, 3.6)
eyebrow(s, "ERBIL INTERNATIONAL HOSPITAL · IRAQ")
headline(s, M, 1.98, 6.0, "Caught in the model, not on site.", "the model", size=30)
tx(s, M, 3.2, 5.9, 1.2, [{"runs": [{"t": "Structural BIM and federated multi-discipline coordination on a large, complex healthcare structure — issues resolved before construction.",
                                    "font": LIGHT, "size": 12.5, "color": BONEDIM}], "ls": 1.35}])
chips(s, [("LOD 350", "model detail"), ("829", "clashes resolved"), ("20 wk", "turnaround")],
      M, 4.9, gap=1.95, big=26, brass_idx=1)

# 10 — CASE · HEMA (the real before/after, the proof) -------------------
s = slide()
background(s, "s10", structure="grid", phase=.56, density=900, seed=58, mood="calm")
masthead(s, "CASE STUDY · 02", "10 / 14")
eyebrow(s, "HEMA, EMMEN · NETHERLANDS")
headline(s, M, 1.98, 4.9, "Point cloud in. As-built model out.", "model out", size=27)
tx(s, M, 3.25, 4.7, 1.6, [{"runs": [{"t": "The literal before/after — a registered scan of a building corner, beside its parametric Revit twin.",
                                     "font": LIGHT, "size": 12.5, "color": BONEDIM}], "ls": 1.35}])
chips(s, [("3,500 m²", "captured"), ("LOD 300", "as-built")], M, 4.75, gap=2.4, big=23, brass_idx=-1)
chips(s, [("8 wk", "delivery")], M, 5.85, gap=2.4, big=23, brass_idx=-1)
# right: the two real images, stacked, labelled
tx(s, 6.0, 1.45, 5, 0.3, [{"runs": [{"t": "BEFORE · REGISTERED POINT CLOUD", "font": MONO, "size": 8.5, "color": ASH}]}])
framed_image(s, os.path.join(PROJ, "hema", "HEMA_012.jpg"), 6.0, 1.75, 6.4, 2.3)
tx(s, 6.0, 4.22, 5, 0.3, [{"runs": [{"t": "AFTER · AS-BUILT REVIT MODEL", "font": MONO, "size": 8.5, "color": BRASS}]}])
framed_image(s, os.path.join(PROJ, "hema", "HEMA_01.png"), 6.0, 4.52, 6.4, 2.3)

# 11 — HOW WE WORK (5-node track) ---------------------------------------
s = slide()
background(s, "s11", structure="grid", phase=.60, density=1100, seed=80, mood="calm")
masthead(s, "HOW WE WORK", "11 / 14")
eyebrow(s, "TO YOUR BEP, NAMING AND CDE")
headline(s, M, 1.95, 11.4, "Five steps, all on your standards.", "your standards", size=32)
steps = [
    ("01", "Onboard", "Adopt your BEP, naming & CDE; confirm scope vs the EIR."),
    ("02", "Produce", "Model to agreed LOD on the MIDP / TIDP schedule."),
    ("03", "QA", "Model-health & standards checks, clash validation, review."),
    ("04", "Deliver", "Issue through the CDE with controlled status codes."),
    ("05", "Report", "Issue-tracked clash reports & progress vs plan."),
]
track_y = 4.1
rule(s, M + 0.1, track_y, EMU_W.inches - M - 0.1, track_y, color=BRASS, w=1.0)
sw = (EMU_W.inches - 2 * M - 0.2) / 5
for i, (k, name, desc) in enumerate(steps):
    nx = M + 0.1 + i * sw
    rule(s, nx, track_y - 0.08, nx, track_y + 0.08, color=BRASSLIT, w=1.4)
    tx(s, nx - 0.1, track_y - 0.95, sw - 0.1, 0.6, [
        {"runs": [{"t": k, "font": MONO, "size": 10.5, "color": BRASS}], "space_after": 3},
        {"runs": [{"t": name, "font": SEMI, "size": 14, "color": BONE}]}])
    tx(s, nx - 0.1, track_y + 0.22, sw - 0.25, 1.2, [{"runs": [{"t": desc, "font": LIGHT, "size": 10.5, "color": BONEDIM}], "ls": 1.3}])

# 12 — PRICING (A/B/C comparison table) ---------------------------------
s = slide()
background(s, "s12", structure="grid", phase=.64, density=950, seed=88, mood="calm")
masthead(s, "ENGAGEMENT", "12 / 14")
eyebrow(s, "THREE WAYS TO WORK · GBP")
headline(s, M, 1.72, 11.4, "Pick the model that fits the work.", "fits the work", size=30)

col_lab_x = M
col_xs = [3.05, 6.30, 9.55]          # A, B, C
col_w = 3.05
hi = 1                                # highlight middle column (B)
top = 3.0
# highlight rail behind B
rule(s, col_xs[hi] - 0.12, top - 0.18, col_xs[hi] + col_w - 0.35, top - 0.18, color=BRASS, w=1.4)
tx(s, col_xs[hi] - 0.12, top - 0.52, col_w, 0.3, [{"runs": [{"t": "MOST POPULAR", "font": MONO, "size": 8, "color": BRASS}]}])
heads = ["A · Fixed-fee per project", "B · Dedicated BIM resource", "C · Per-unit"]
for j, htext in enumerate(heads):
    parts = htext.split(" · ", 1)
    tx(s, col_xs[j] - 0.12, top, col_w - 0.2, 0.7, [
        {"runs": [{"t": parts[0] + "  ", "font": MONO, "size": 10, "color": BRASS},
                  {"t": parts[1], "font": SEMI, "size": 13, "color": BRASSLIT if j == hi else BONE}], "ls": 1.05}])
rule(s, col_lab_x, top + 0.78, EMU_W.inches - M, top + 0.78, color=BRASSDIM, w=0.75)

table_rows = [
    ("Best for", ["Bounded, defined-scope deliverables", "Ongoing capacity as part of your team", "High-volume Scan-to-BIM"]),
    ("Commitment", ["Per project", "Monthly FTE, scalable", "None — pay per item"]),
    ("Billing", ["Milestone payments", "Predictable monthly fee", "Per model / sheet / m²"]),
    ("Scaling", ["Fixed to scope", "Add or release resources", "Flexes with volume"]),
]
ry = top + 0.98
for lab, cells in table_rows:
    tx(s, col_lab_x, ry + 0.02, col_w - 0.3, 0.6, [{"runs": [{"t": lab.upper(), "font": MONO, "size": 8.5, "color": ASH}]}])
    for j, cell in enumerate(cells):
        tx(s, col_xs[j] - 0.12, ry, col_w - 0.25, 0.7, [
            {"runs": [{"t": cell, "font": LIGHT, "size": 11, "color": BONE if j == hi else BONEDIM}], "ls": 1.15}])
    rule(s, col_lab_x, ry + 0.62, EMU_W.inches - M, ry + 0.62, color=EDGE, w=0.5)
    ry += 0.72
tx(s, M, ry + 0.05, 11.5, 0.4, [{"runs": [{"t": "Priced in GBP · NDA + simple service agreement · deposit + milestones · UK reverse-charge VAT applies",
                                           "font": MONO, "size": 9, "color": ASH}]}])

# 13 — CONTACTS ---------------------------------------------------------
s = slide()
background(s, "s13", structure="elevation", phase=.82, density=1100, seed=91, mood="calm")
masthead(s, "YOUR CONTACTS", "13 / 14")
eyebrow(s, "UNITED KINGDOM AND TÜRKİYE")
headline(s, M, 1.95, 11.4, "One UK call away. One production team behind it.", "One UK call", size=30)
rule(s, 6.55, 3.4, 6.55, 6.25, color=BRASSDIM, w=0.75)
tx(s, M, 3.45, 5.3, 2.6, [
    {"runs": [{"t": "UNITED KINGDOM", "font": MONO, "size": 8.5, "color": ASH}], "space_after": 10},
    {"runs": [{"t": "Rami Daşkın", "font": DISP, "size": 25, "color": BONE}], "space_after": 4},
    {"runs": [{"t": "UK Representative", "font": BODY, "size": 12.5, "color": BRASS}], "space_after": 12},
    {"runs": [{"t": UK_PHONE, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.45},
    {"runs": [{"t": RAMI_MAIL, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.45},
    {"runs": [{"t": "26 years in the UK · same time zone · local meetings", "font": LIGHT, "size": 11, "color": ASH}], "space_before": 8}])
tx(s, 7.05, 3.45, 5.4, 2.8, [
    {"runs": [{"t": "TÜRKİYE · HEAD OFFICE", "font": MONO, "size": 8.5, "color": ASH}], "space_after": 10},
    {"runs": [{"t": "Enes Cemil Yağcı", "font": DISP, "size": 25, "color": BONE}], "space_after": 4},
    {"runs": [{"t": "Founder & BIM Manager", "font": BODY, "size": 12.5, "color": BRASS}], "space_after": 12},
    {"runs": [{"t": TR_PHONE, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.45},
    {"runs": [{"t": INFO, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.45},
    {"runs": [{"t": "Autodesk Expert Elite · openBIM · Primavera P6 · Adana", "font": LIGHT, "size": 11, "color": ASH}], "space_before": 8}])

# 14 — CTA --------------------------------------------------------------
s = slide()
background(s, "s14", structure="elevation", phase=1.0, density=1500, seed=100, mood="hero")
masthead(s, "NEXT STEP", "14 / 14")
eyebrow(s, "LOW-RISK BY DESIGN", y=2.55)
headline(s, M, 2.95, 11.5, "Start with a pilot.", "a pilot", size=52, ls=1.0)
rule(s, M, 4.25, M + 2.0, 4.25, color=BRASS, w=1.0)
subhead(s, M, 4.5, 9.6, "One bounded deliverable, on your standards, so the proof is yours before the commitment is.", size=16)
bullets(s, M, 5.45, 11.0, [
    "Send us a defined scope — a model, a scan, a coordination package.",
    "We deliver it to your BEP, naming and CDE, QA-gated and issue-tracked.",
    "Judge us on the output, then scale only if it earns it.",
], size=12.5, gap=8, color=BONEDIM)
tx(s, M, 6.95, 11.6, 0.4, [{"runs": [
    {"t": "Book a 15-minute call    ", "font": SEMI, "size": 12.5, "color": BONE},
    {"t": "Rami " + UK_PHONE + "  ·  " + RAMI_MAIL + "  ·  ecy.com.tr", "font": MONO, "size": 10, "color": ASH}]}])

out = os.path.join(HERE, "ECY-UK-Pitch-Deck.pptx")
prs.save(out)
print("saved", out, "·", len(prs.slides._sldIdLst), "slides")
