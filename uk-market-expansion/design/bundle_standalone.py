"""
Bundle deck.html into a single self-contained HTML file for Claude Design import.
Inlines resolved-field.css, field.js, and all project images (resized + base64).
Output: deck-standalone.html  (no external local references)
"""
import os, re, base64, io
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PPTX = os.path.normpath(os.path.join(HERE, "..", "pptx"))

with open(os.path.join(HERE, "deck.html"), encoding="utf-8") as f:
    html = f.read()
with open(os.path.join(HERE, "resolved-field.css"), encoding="utf-8") as f:
    css = f.read()
with open(os.path.join(HERE, "field.js"), encoding="utf-8") as f:
    js = f.read()


def data_uri(rel_src, max_w=1700, quality=82):
    """resolve a deck-relative src, resize, return a base64 data URI (JPEG)"""
    path = os.path.normpath(os.path.join(HERE, rel_src))
    im = Image.open(path).convert("RGB")
    if im.width > max_w:
        h = int(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return "data:image/jpeg;base64," + b64


# 1) replace <link rel=stylesheet ...> with inline <style>
html = re.sub(r'<link rel="stylesheet" href="resolved-field\.css">',
              "<style>\n" + css + "\n</style>", html)

# 2) replace <script src="field.js"></script> with inline <script>
html = re.sub(r'<script src="field\.js"></script>',
              "<script>\n" + js + "\n</script>", html)

# 3) inline every <img src="..."> that points at a local file
def repl_img(m):
    src = m.group(1)
    if src.startswith("data:") or src.startswith("http"):
        return m.group(0)
    uri = data_uri(src)
    return m.group(0).replace(src, uri)

html = re.sub(r'<img[^>]*\bsrc="([^"]+)"', repl_img, html)

out = os.path.join(HERE, "deck-standalone.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)

size = os.path.getsize(out) / 1024 / 1024
print(f"wrote {out}  ({size:.2f} MB)")
remaining = re.findall(r'(?:src|href)="(\.\./[^"]+|resolved-field\.css|field\.js)"', html)
print("remaining local refs:", remaining or "none")
