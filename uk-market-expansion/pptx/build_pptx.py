"""
ECY — UK Pitch Deck → PPTX
Native, editable PowerPoint in the 'Resolved Field' aesthetic.
Procedural point-field backgrounds (render_field) + editable text + project images.
Windows-safe fonts: Segoe UI family (humanist grotesque) + Consolas (mono).
"""
import os, glob
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from PIL import Image
import render_field as rf

HERE = os.path.dirname(os.path.abspath(__file__))
REND = os.path.join(HERE, "_render")
PROJ = os.path.join(HERE, "projects")
os.makedirs(REND, exist_ok=True)

# palette
BRASS    = RGBColor(0xBD, 0x94, 0x57)
BRASSLIT = RGBColor(0xDB, 0xB5, 0x71)
BONE     = RGBColor(0xEC, 0xE3, 0xD1)
BONEDIM  = RGBColor(0xB9, 0xAE, 0x99)
ASH      = RGBColor(0x87, 0x7C, 0x6B)
ASHDIM   = RGBColor(0x6E, 0x66, 0x57)
GROUND   = RGBColor(0x1A, 0x14, 0x0F)

# fonts
DISP = "Segoe UI Light"      # display / titles
SEMI = "Segoe UI Semibold"
BODY = "Segoe UI"
LIGHT= "Segoe UI Light"
MONO = "Consolas"

EMU_W, EMU_H = Inches(13.333), Inches(7.5)
M = 0.92  # margin inches


def track(s, n=2):
    return (" " * 0).join(s)  # tracking approximated via mono + caps


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


def background(slide, name, **kw):
    path = os.path.join(REND, name + ".png")
    if name.startswith("split"):
        rf.render_split(path, **kw)
    else:
        rf.render_plate(path, **kw)
    slide.shapes.add_picture(path, 0, 0, EMU_W, EMU_H)


def masthead(slide, tag, idx):
    tx(slide, M, M - 0.32, 7, 0.4, [{"runs": [{"t": tag, "font": MONO, "size": 9.5, "color": ASH}]}])
    tx(slide, EMU_W.inches - M - 3, M - 0.32, 3, 0.4,
       [{"runs": [{"t": idx, "font": MONO, "size": 9.5, "color": ASH}]}], align=PP_ALIGN.RIGHT)


def cover_fit(src, w_in, h_in, out):
    """crop image to box aspect (cover), return path; placeholder if missing"""
    im = Image.open(src).convert("RGB")
    tw, th = w_in / h_in, im.width / im.height
    if th > tw:
        nw = int(im.height * tw); x = (im.width - nw) // 2
        im = im.crop((x, 0, x + nw, im.height))
    else:
        nh = int(im.width / tw); y = (im.height - nh) // 2
        im = im.crop((0, y, im.width, y + nh))
    im.save(out, "JPEG", quality=88)
    return out


def framed_image(slide, src, x, y, w, h):
    out = os.path.join(REND, os.path.splitext(os.path.basename(src))[0] + "_fit.jpg")
    cover_fit(src, w, h, out)
    pic = slide.shapes.add_picture(out, Inches(x), Inches(y), Inches(w), Inches(h))
    ln = pic.line; ln.color.rgb = RGBColor(0x2A, 0x21, 0x14); ln.width = Pt(1)
    return pic


def project_image(slide, folder, x, y, w, h):
    imgs = []
    for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.JPG", "*.PNG"):
        imgs += glob.glob(os.path.join(PROJ, folder, ext))
    if imgs:
        out = os.path.join(REND, "proj_" + folder + ".jpg")
        cover_fit(sorted(imgs)[0], w, h, out)
        pic = slide.shapes.add_picture(out, Inches(x), Inches(y), Inches(w), Inches(h))
        ln = pic.line; ln.color.rgb = RGBColor(0x2A, 0x21, 0x14); ln.width = Pt(1)
    else:
        from pptx.enum.shapes import MSO_SHAPE
        sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
        sh.fill.solid(); sh.fill.fore_color.rgb = RGBColor(0x20, 0x19, 0x12)
        sh.line.color.rgb = BRASS; sh.line.width = Pt(1)
        tf = sh.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
        r = p.add_run(); r.text = "PROJECT IMAGE\n→ push to  pptx/projects/" + folder + "/"
        r.font.name = MONO; r.font.size = Pt(11); r.font.color.rgb = ASH


# ---------------------------------------------------------------- build
prs = Presentation()
prs.slide_width = EMU_W
prs.slide_height = EMU_H
blank = prs.slide_layouts[6]


def slide():
    return prs.slides.add_slide(blank)

UK_PHONE = "+44 7786 410586"
TR_PHONE = "+90 533 566 67 80"
INFO = "info@ecy.com.tr"
RAMI_MAIL = "rami@ecy.com.tr"

# 01 COVER
s = slide()
background(s, "s01", structure="elevation", phase=.16, density=1900, seed=3)
masthead(s, "ECY · ARCHITECTURE & BIM", "01 / 12")
tx(s, M, 2.9, 11, 0.4, [{"runs": [{"t": "RESOLVED FIELD", "font": MONO, "size": 11, "color": BRASS}]}])
tx(s, M, 3.3, 11.5, 2.2, [
    {"runs": [{"t": "The scattered, ", "font": DISP, "size": 54, "color": BONE},
              {"t": "resolved", "font": DISP, "size": 54, "color": BRASS, "italic": True}], "ls": 0.98},
    {"runs": [{"t": "into form.", "font": DISP, "size": 54, "color": BONE}], "ls": 0.98},
])
tx(s, M, 5.2, 8.5, 0.8, [{"runs": [{"t": "Your ISO 19650-aligned offshore BIM partner — with a UK-based point of contact.",
                                    "font": LIGHT, "size": 16, "color": BONEDIM}], "ls": 1.3}])
tx(s, M, 5.85, 10.5, 0.4, [{"runs": [{"t": "FOUNDED BY AN AUTODESK EXPERT ELITE · A RECOGNITION HELD BY ONLY ~250 PROFESSIONALS WORLDWIDE",
                                      "font": MONO, "size": 9.5, "color": BRASS}]}])
tx(s, M, 6.55, 11.5, 0.4, [{"runs": [
    {"t": "Enes Cemil Yağcı · Founder & BIM Manager    ·    Rami Daşkın · UK Representative · " + UK_PHONE + "        ",
     "font": MONO, "size": 9.5, "color": ASH},
    {"t": "ecy.com.tr", "font": MONO, "size": 9.5, "color": ASH}]}])

# 02 WHO WE ARE
s = slide()
background(s, "s02", structure="grid", phase=.32, density=1500, seed=9)
masthead(s, "WHO WE ARE", "02 / 12")
tx(s, M, 2.5, 6.2, 2.6, [
    {"runs": [{"t": "A young studio,", "font": DISP, "size": 38, "color": BONE}], "ls": 1.0},
    {"runs": [{"t": "a ", "font": DISP, "size": 38, "color": BONE},
              {"t": "measured", "font": DISP, "size": 38, "color": BRASS, "italic": True},
              {"t": " record.", "font": DISP, "size": 38, "color": BONE}], "ls": 1.0, "space_after": 14},
    {"runs": [{"t": "Founded 2022 in Adana, Türkiye. Standards-led, ISO 19650. The production engine behind UK practices, contractors and surveyors — not a competitor.",
               "font": LIGHT, "size": 13.5, "color": ASH}], "ls": 1.35},
])
fy = 2.6
for n, lbl in [("218", "Projects delivered"), ("17", "Countries"), ("15", "Years, team experience")]:
    tx(s, 8.2, fy, 4, 1.1, [
        {"runs": [{"t": n, "font": LIGHT, "size": 44, "color": BONE}], "ls": 0.9},
        {"runs": [{"t": lbl.upper(), "font": MONO, "size": 9.5, "color": ASH}]}])
    fy += 1.5

# 03 PROBLEM
s = slide()
background(s, "s03", structure="elevation", phase=.24, density=1700, seed=17)
masthead(s, "THE PROBLEM", "03 / 12")
tx(s, M, 2.3, 9, 1.6, [
    {"runs": [{"t": "Demand is measured.", "font": DISP, "size": 40, "color": BONE}], "ls": 1.0},
    {"runs": [{"t": "Capacity is ", "font": DISP, "size": 40, "color": BONE},
              {"t": "not", "font": DISP, "size": 40, "color": BRASS, "italic": True},
              {"t": ".", "font": DISP, "size": 40, "color": BONE}], "ls": 1.0}])
py = 4.5
for k, v, x2 in [("01", "ISO 19650 obligations on almost every project", "regulation"),
                 ("02", "BIM talent is scarce and expensive to hire", "cost"),
                 ("03", "Deadline spikes don't justify permanent headcount", "load")]:
    tx(s, M, py, 11.5, 0.5, [{"runs": [
        {"t": k + "   ", "font": MONO, "size": 11, "color": BRASS},
        {"t": v, "font": BODY, "size": 16, "color": BONE}]}])
    tx(s, EMU_W.inches - M - 2, py + 0.03, 2, 0.4, [{"runs": [{"t": x2.upper(), "font": MONO, "size": 9, "color": ASHDIM}]}], align=PP_ALIGN.RIGHT)
    py += 0.62

# 04 SERVICES
s = slide()
background(s, "s04", structure="grid", phase=.50, density=1600, seed=23)
masthead(s, "WHAT WE DO", "04 / 12")
tx(s, M, 2.0, 9, 0.8, [{"runs": [{"t": "Five instruments.", "font": DISP, "size": 40, "color": BONE}]}])
sy = 3.1
for k, v, x2 in [("S—01", "BIM Modelling · Revit · arch / struct / MEP", "LOD 300–400"),
                 ("S—02", "Scan-to-BIM · point cloud to as-built", "cloud → model"),
                 ("S—03", "Coordination & Clash Detection", "Navisworks"),
                 ("S—04", "4D / 5D · programme & cost", "Primavera P6"),
                 ("S—05", "BEP & CDE setup", "ISO 19650")]:
    tx(s, M, sy, 8.5, 0.5, [{"runs": [
        {"t": k + "   ", "font": MONO, "size": 11, "color": BRASS},
        {"t": v, "font": BODY, "size": 16.5, "color": BONE}]}])
    tx(s, EMU_W.inches - M - 2.4, sy + 0.03, 2.4, 0.4, [{"runs": [{"t": x2.upper(), "font": MONO, "size": 9, "color": ASHDIM}]}], align=PP_ALIGN.RIGHT)
    sy += 0.66

# 05 WHY ECY — Expert Elite featured panel + measured list
s = slide()
background(s, "s05", structure="elevation", phase=.55, density=1600, seed=31)
masthead(s, "WHY ECY", "05 / 12")
tx(s, M, 1.9, 5.6, 1.6, [
    {"runs": [{"t": "An axis that ", "font": DISP, "size": 38, "color": BONE},
              {"t": "aligns", "font": DISP, "size": 38, "color": BRASS, "italic": True},
              {"t": ".", "font": DISP, "size": 38, "color": BONE}], "ls": 1.0, "space_after": 12},
    {"runs": [{"t": "One warm metal carries the tension: a contact in your time zone, on UK soil, from intro to delivery.",
               "font": LIGHT, "size": 13.5, "color": ASH}], "ls": 1.35}])
# Expert Elite panel — the differentiator, framed in brass
from pptx.enum.shapes import MSO_SHAPE
ee = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(M), Inches(4.15), Inches(5.6), Inches(2.45))
ee.fill.solid(); ee.fill.fore_color.rgb = RGBColor(0x24, 0x1C, 0x13)
ee.line.color.rgb = BRASS; ee.line.width = Pt(1.5)
ee.shadow.inherit = False
tx(s, M + 0.28, 4.4, 5.1, 2.0, [
    {"runs": [{"t": "AUTODESK EXPERT ELITE", "font": MONO, "size": 10, "color": BRASS}], "space_after": 6},
    {"runs": [{"t": "~250 ", "font": LIGHT, "size": 34, "color": BRASSLIT},
              {"t": "hold this worldwide", "font": LIGHT, "size": 13, "color": BONEDIM}], "space_after": 6},
    {"runs": [{"t": "Our founder, Enes Cemil Yağcı, is one of them — Autodesk's global recognition of verified expertise and community contribution.",
               "font": LIGHT, "size": 11.5, "color": ASH}], "ls": 1.3}])
wy = 2.6
for v, x2 in [("UK-based contact — Rami, 26 yrs in the UK", "local"),
              ("Autodesk Expert Elite founder · ~250 worldwide", "elite"),
              ("openBIM Foundation · Primavera P6 certified", "certified"),
              ("Delivery across 17 countries", "proven"),
              ("Competitive rates, kept quality", "value")]:
    tx(s, 7.4, wy, 5, 0.5, [{"runs": [
        {"t": "·  ", "font": MONO, "size": 13, "color": BRASS},
        {"t": v, "font": BODY, "size": 14.5, "color": BRASSLIT if x2 == "elite" else BONE}]}])
    tx(s, EMU_W.inches - M - 1.7, wy + 0.03, 1.7, 0.4, [{"runs": [{"t": x2.upper(), "font": MONO, "size": 8.5, "color": ASHDIM}]}], align=PP_ALIGN.RIGHT)
    wy += 0.72

# 06 ERBIL
s = slide()
background(s, "s06", structure="elevation", phase=.70, density=1400, seed=44)
masthead(s, "CASE STUDY · IRAQ", "06 / 12")
project_image(s, "erbil", 6.7, 1.5, 5.7, 4.2)
tx(s, M, 1.6, 5.4, 0.4, [{"runs": [{"t": "CASE STUDY", "font": MONO, "size": 10.5, "color": BRASS}]}])
tx(s, M, 2.05, 5.6, 1.4, [{"runs": [{"t": "Erbil International Hospital", "font": DISP, "size": 30, "color": BONE}], "ls": 1.0}])
tx(s, M, 3.2, 5.4, 1.0, [{"runs": [{"t": "Structural BIM · federated coordination. A large, complex structure brought into a single coordinated model — issues caught in the model, not on site.",
                                    "font": LIGHT, "size": 13, "color": BONEDIM}], "ls": 1.3}])
ex = M
for n, lbl in [("LOD 350", "Detail"), ("829", "Clashes resolved"), ("20 wk", "Turnaround")]:
    tx(s, ex, 5.0, 2.0, 1.0, [
        {"runs": [{"t": n, "font": LIGHT, "size": 30, "color": BRASS if lbl == "Clashes resolved" else BONE}], "ls": 0.9},
        {"runs": [{"t": lbl.upper(), "font": MONO, "size": 8.5, "color": ASH}]}])
    ex += 1.85

# 07 HEMA — the real before/after: registered point cloud → as-built Revit model
s = slide()
background(s, "s07", structure="grid", phase=.58, density=1600, seed=58)
masthead(s, "CASE STUDY · NETHERLANDS", "07 / 12")
# right column: the literal proof, stacked plates
tx(s, 6.0, 1.30, 5, 0.3, [{"runs": [{"t": "BEFORE · REGISTERED POINT CLOUD", "font": MONO, "size": 9, "color": ASH}]}])
framed_image(s, os.path.join(PROJ, "hema", "HEMA_012.jpg"), 6.0, 1.62, 6.4, 2.3)
tx(s, 6.0, 4.12, 5, 0.3, [{"runs": [{"t": "AFTER · AS-BUILT REVIT MODEL", "font": MONO, "size": 9, "color": BRASS}]}])
framed_image(s, os.path.join(PROJ, "hema", "HEMA_01.png"), 6.0, 4.44, 6.4, 2.3)
# left column: the story
tx(s, M, 1.62, 4.7, 0.4, [{"runs": [{"t": "SCAN-TO-BIM · CLOUD RESOLVES TO LINE", "font": MONO, "size": 10, "color": BRASS}]}])
tx(s, M, 2.1, 4.8, 1.0, [
    {"runs": [{"t": "HEMA, ", "font": DISP, "size": 34, "color": BONE},
              {"t": "Emmen", "font": DISP, "size": 34, "color": BRASS, "italic": True},
              {"t": ".", "font": DISP, "size": 34, "color": BONE}]}])
tx(s, M, 3.0, 4.7, 1.4, [{"runs": [{"t": "The same corner, twice: a registered point cloud pulled patiently into an accurate as-built Revit model — the literal proof of what we do.",
                                    "font": LIGHT, "size": 13, "color": BONEDIM}], "ls": 1.3}])
hx = M
for n, lbl in [("3 500 m²", "Area captured"), ("LOD 300", "Delivered"), ("8 wk", "Total delivery")]:
    tx(s, hx, 5.6, 1.7, 0.9, [
        {"runs": [{"t": n, "font": LIGHT, "size": 22, "color": BRASS if lbl == "Delivered" else BONE}], "ls": 0.9},
        {"runs": [{"t": lbl.upper(), "font": MONO, "size": 8, "color": ASH}]}])
    hx += 1.72

# 08 LEAS PAVILION (UK) — framed as the BIM Manager's professional track record (no ESC)
s = slide()
background(s, "s08", structure="elevation", phase=.74, density=1400, seed=66)
masthead(s, "SELECTED EXPERIENCE · UNITED KINGDOM", "08 / 12")
project_image(s, "leas", 6.7, 1.5, 5.7, 4.2)
tx(s, M, 1.6, 5.4, 0.4, [{"runs": [{"t": "TRACK RECORD · UK", "font": MONO, "size": 10.5, "color": BRASS}]}])
tx(s, M, 2.05, 5.6, 1.0, [{"runs": [{"t": "Leas Pavilion", "font": DISP, "size": 32, "color": BONE}]}])
tx(s, M, 2.85, 5.5, 2.6, [
    {"runs": [{"t": "Folkestone, Kent — restoration of a Grade II listed Edwardian tea room (1902), with a new nine-storey development of 91 sea-view apartments rising above it.",
               "font": LIGHT, "size": 13, "color": BONEDIM}], "ls": 1.3, "space_after": 10},
    {"runs": [{"t": "RIBA Stage 5–7 execution drawings and structural, mechanical & electrical coordination; BIM model and subcontractor drawing review for dimensional accuracy and tolerances — led by ECY's BIM Manager, Enes Cemil Yağcı. Part of the expertise ECY now brings to British clients.",
               "font": LIGHT, "size": 11.5, "color": ASH}], "ls": 1.35}])
lx = M
for n, lbl in [("1902", "Grade II listed"), ("91", "Apartments"), ("5–7", "RIBA stages"), ("133,715", "Sq ft")]:
    tx(s, lx, 5.75, 1.5, 0.9, [
        {"runs": [{"t": n, "font": LIGHT, "size": 22, "color": BRASS if lbl == "Grade II listed" else BONE}], "ls": 0.9},
        {"runs": [{"t": lbl.upper(), "font": MONO, "size": 8, "color": ASH}]}])
    lx += 1.42

# 09 HOW WE WORK
s = slide()
background(s, "s09", structure="grid", phase=.60, density=1500, seed=72)
masthead(s, "HOW WE WORK", "09 / 12")
tx(s, M, 2.1, 9, 0.8, [
    {"runs": [{"t": "We work to ", "font": DISP, "size": 38, "color": BONE},
              {"t": "your", "font": DISP, "size": 38, "color": BRASS, "italic": True},
              {"t": " standards.", "font": DISP, "size": 38, "color": BONE}]}])
stx = M
for k, v in [("01", "Onboard — your BEP, naming, CDE"),
             ("02", "Produce — agreed LOD, WIP check-ins"),
             ("03", "QA — internal checks before issue"),
             ("04", "Deliver — via your CDE, ISO codes"),
             ("05", "Report — clear progress & issues")]:
    tx(s, stx, 4.0, 2.3, 1.6, [
        {"runs": [{"t": k, "font": MONO, "size": 13, "color": BRASS}], "space_after": 8},
        {"runs": [{"t": v, "font": LIGHT, "size": 12.5, "color": BONEDIM}], "ls": 1.25}])
    stx += 2.36

# 10 PRICING
s = slide()
background(s, "s10", structure="grid", phase=.65, density=1500, seed=80)
masthead(s, "ENGAGEMENT", "10 / 12")
tx(s, M, 1.9, 10, 0.8, [{"runs": [{"t": "Three ways to engage.", "font": DISP, "size": 36, "color": BONE}]}])
from pptx.enum.shapes import MSO_SHAPE
cards = [("MODEL A", "Fixed-fee per project", "Defined scope, milestone payments. Best for bounded deliverables.", False),
         ("MOST POPULAR", "Dedicated BIM resource", "A monthly FTE working as part of your team. Predictable, scalable.", True),
         ("MODEL C", "Per-unit", "Per model / sheet / m². Transparent for high-volume Scan-to-BIM.", False)]
cx = M
for pop, title, body, lit in cards:
    sh = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(cx), Inches(3.1), Inches(3.6), Inches(2.5))
    sh.fill.solid(); sh.fill.fore_color.rgb = RGBColor(0x24, 0x1C, 0x13) if lit else RGBColor(0x1E, 0x18, 0x11)
    sh.line.color.rgb = BRASS if lit else RGBColor(0x2C, 0x24, 0x19); sh.line.width = Pt(1.5 if lit else 1)
    sh.shadow.inherit = False
    tf = sh.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.25); tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]; r = p.add_run(); r.text = pop
    r.font.name = MONO; r.font.size = Pt(9); r.font.color.rgb = BRASS
    p2 = tf.add_paragraph(); p2.space_before = Pt(8); r = p2.add_run(); r.text = title
    r.font.name = SEMI; r.font.size = Pt(17); r.font.color.rgb = BONE
    p3 = tf.add_paragraph(); p3.space_before = Pt(8); p3.line_spacing = 1.25; r = p3.add_run(); r.text = body
    r.font.name = LIGHT; r.font.size = Pt(11.5); r.font.color.rgb = ASH
    cx += 3.83
tx(s, M, 6.0, 11.5, 0.4, [{"runs": [{"t": "Priced in GBP · NDA + service agreement · deposit + milestones · UK reverse charge applies",
                                     "font": MONO, "size": 9.5, "color": ASH}]}])

# 11 CONTACTS — Rami (UK) + Enes (Türkiye, Founder & BIM Manager)
s = slide()
background(s, "s11", structure="elevation", phase=.86, density=1600, seed=91)
masthead(s, "YOUR CONTACTS", "11 / 12")
tx(s, M, 1.9, 11, 0.4, [{"runs": [{"t": "TWO POINTS, ONE TEAM", "font": MONO, "size": 10.5, "color": BRASS}]}])
tx(s, M, 2.35, 11, 1.0, [{"runs": [{"t": "Always someone to talk to.", "font": DISP, "size": 36, "color": BONE}]}])
# UK contact
tx(s, M, 4.0, 5.6, 2.6, [
    {"runs": [{"t": "UNITED KINGDOM", "font": MONO, "size": 9, "color": ASH}], "space_after": 10},
    {"runs": [{"t": "Rami Daşkın", "font": DISP, "size": 26, "color": BONE}], "space_after": 4},
    {"runs": [{"t": "UK Representative", "font": BODY, "size": 13, "color": BRASS}], "space_after": 12},
    {"runs": [{"t": UK_PHONE, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.4},
    {"runs": [{"t": RAMI_MAIL, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.4},
    {"runs": [{"t": "26 years in the UK · same time zone", "font": LIGHT, "size": 11.5, "color": ASH}], "space_before": 6}])
# Türkiye contact
tx(s, 7.0, 4.0, 5.4, 2.6, [
    {"runs": [{"t": "TÜRKİYE · HEAD OFFICE", "font": MONO, "size": 9, "color": ASH}], "space_after": 10},
    {"runs": [{"t": "Enes Cemil Yağcı", "font": DISP, "size": 26, "color": BONE}], "space_after": 4},
    {"runs": [{"t": "Founder & BIM Manager", "font": BODY, "size": 13, "color": BRASS}], "space_after": 12},
    {"runs": [{"t": TR_PHONE, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.4},
    {"runs": [{"t": INFO, "font": MONO, "size": 12, "color": BONEDIM}], "ls": 1.4},
    {"runs": [{"t": "Adana · ecy.com.tr", "font": LIGHT, "size": 11.5, "color": ASH}], "space_before": 6}])

# 12 CTA
s = slide()
background(s, "s12", structure="elevation", phase=1.0, density=2100, seed=100)
masthead(s, "BEGIN", "12 / 12")
tx(s, M, 2.6, 11, 0.4, [{"runs": [{"t": "START SMALL", "font": MONO, "size": 11, "color": BRASS}]}])
tx(s, M, 3.0, 11.5, 1.8, [
    {"runs": [{"t": "Let's resolve", "font": DISP, "size": 52, "color": BONE}], "ls": 0.98},
    {"runs": [{"t": "a ", "font": DISP, "size": 52, "color": BONE},
              {"t": "pilot", "font": DISP, "size": 52, "color": BRASS, "italic": True},
              {"t": ".", "font": DISP, "size": 52, "color": BONE}], "ls": 0.98}])
tx(s, M, 5.1, 9, 0.8, [{"runs": [{"t": "One floor of Scan-to-BIM, or a single building at LOD 300. Low risk — judge our quality first-hand, then scale.",
                                  "font": LIGHT, "size": 15, "color": BONEDIM}], "ls": 1.3}])
tx(s, M, 6.4, 11.5, 0.6, [
    {"runs": [{"t": "Book a 15-minute call    ", "font": SEMI, "size": 15, "color": BONE},
              {"t": "Rami " + UK_PHONE + "  ·  Enes " + TR_PHONE + "  ·  " + INFO,
               "font": MONO, "size": 10, "color": ASH}]}])

out = os.path.join(HERE, "ECY-UK-Pitch-Deck.pptx")
prs.save(out)
print("saved", out)
