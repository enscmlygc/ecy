"""
Render an approximate visual proof of the generated PPTX, slide by slide, so
layout (overlaps, alignment, off-slide text) can be eyeballed without LibreOffice.
Reads real shape geometry + text from the .pptx and composites onto a white-on-dark
canvas using DejaVu fonts (metrics approximate Segoe UI / Consolas closely enough
to catch layout problems). Pictures are drawn from disk; connectors as lines.
"""
import os
from pptx import Presentation
from pptx.util import Emu
from pptx.enum.shapes import MSO_SHAPE_TYPE
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
REND = os.path.join(HERE, "_render")
PV = os.path.join(REND, "preview")
os.makedirs(PV, exist_ok=True)

SCALE = 148  # px per inch (≈ 1973x1110 for a 13.333x7.5 slide)

SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANSL = "/usr/share/fonts/truetype/dejavu/DejaVuSans-ExtraLight.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
if not os.path.exists(SANSL):
    SANSL = SANS


def font_for(name, size_px):
    f = MONO if "Consolas" in name else (SANSL if "Light" in name else SANS)
    try:
        return ImageFont.truetype(f, size_px)
    except Exception:
        return ImageFont.load_default()


def rgb(c):
    return (c[0], c[1], c[2]) if c else (236, 227, 209)


def emu_in(v):
    return Emu(v).inches if v is not None else 0


prs = Presentation(os.path.join(HERE, "ECY-UK-Pitch-Deck.pptx"))
W = int(prs.slide_width / 914400 * SCALE)
H = int(prs.slide_height / 914400 * SCALE)

for i, slide in enumerate(prs.slides, 1):
    bg_path = os.path.join(REND, f"s{i:02d}.png")
    if os.path.exists(bg_path):
        img = Image.open(bg_path).convert("RGB").resize((W, H))
    else:
        img = Image.new("RGB", (W, H), (20, 15, 11))
    draw = ImageDraw.Draw(img)

    for sh in slide.shapes:
        x = emu_in(sh.left) * SCALE
        y = emu_in(sh.top) * SCALE
        w = emu_in(sh.width) * SCALE
        h = emu_in(sh.height) * SCALE

        if sh.shape_type == MSO_SHAPE_TYPE.PICTURE:
            try:
                blob = sh.image.blob
                tmp = os.path.join(PV, f"_img{i}_{int(x)}.png")
                with open(tmp, "wb") as f:
                    f.write(blob)
                pim = Image.open(tmp).convert("RGB").resize((max(1, int(w)), max(1, int(h))))
                # skip full-bleed backgrounds (cover the whole slide)
                if not (w > W * 0.95 and h > H * 0.95):
                    img.paste(pim, (int(x), int(y)))
                    draw = ImageDraw.Draw(img)
                    draw.rectangle([x, y, x + w, y + h], outline=(42, 33, 20), width=1)
            except Exception:
                pass
            continue

        if sh.shape_type == MSO_SHAPE_TYPE.LINE or sh.name.lower().startswith("connector"):
            draw.line([x, y, x + w, y + h], fill=(189, 148, 87), width=2)
            continue

        if not sh.has_text_frame:
            continue
        cy = y
        for p in sh.text_frame.paragraphs:
            runs = p.runs
            if not runs:
                cy += 14
                continue
            sz = max(8, int((runs[0].font.size.pt if runs[0].font.size else 12) * SCALE / 72.0))
            ls = (p.line_spacing or 1.0)
            # assemble line
            cx = x
            align = str(p.alignment)
            total_w = 0
            pieces = []
            for r in runs:
                rsz = max(8, int((r.font.size.pt if r.font.size else 12) * SCALE / 72.0))
                fnt = font_for(r.font.name or "Segoe UI", rsz)
                col = rgb(r.font.color.rgb if (r.font.color and r.font.color.type is not None) else None)
                wpx = draw.textlength(r.text, font=fnt)
                pieces.append((r.text, fnt, col, wpx, rsz))
                total_w += wpx
                sz = max(sz, rsz)
            if "RIGHT" in align:
                cx = x + w - total_w
            elif "CENTER" in align:
                cx = x + (w - total_w) / 2
            for text, fnt, col, wpx, rsz in pieces:
                draw.text((cx, cy), text, font=fnt, fill=col)
                cx += wpx
            sb = (p.space_before.pt if p.space_before else 0) * SCALE / 72.0
            sa = (p.space_after.pt if p.space_after else 0) * SCALE / 72.0
            cy += sz * ls + sa + sb * 0.4

    img.save(os.path.join(PV, f"slide_{i:02d}.png"))

print("rendered", len(prs.slides._sldIdLst), "preview slides to", PV)
