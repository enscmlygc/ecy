"""
RESOLVED FIELD — procedural background renderer (PIL)
Python port of field.js. Renders dark espresso plates with a point field
resolving from scatter -> structural line, for use as PPTX slide backgrounds.
"""
import math, random
import numpy as np
from PIL import Image, ImageDraw

W, H = 1920, 1080

# palette (RGB)
GROUND   = (26, 20, 15)
GROUND2  = (33, 26, 19)
GRIDLINE = (44, 36, 25)
BRASS    = (189, 148, 87)
BRASSLIT = (219, 181, 113)
BONE     = (236, 227, 209)
ASH      = (135, 124, 107)
ASHDIM   = (91, 83, 69)
BACKDROP = (13, 10, 7)


def _ease(t):
    return 2 * t * t if t < .5 else 1 - (-2 * t + 2) ** 2 / 2


def _elevation():
    s = []
    x0, x1, y0, y1, floors, cols = .30, .70, .12, .90, 7, 4
    s += [[x0, y0, x1, y0, 0], [x0, y1, x1, y1, 1], [x0, y0, x0, y1, 0], [x1, y0, x1, y1, 0]]
    for i in range(1, floors):
        y = y0 + (y1 - y0) * i / floors
        s.append([x0, y, x1, y, 0])
    for j in range(1, cols):
        x = x0 + (x1 - x0) * j / cols
        s.append([x, y0, x, y1, 0])
    return {"segs": s, "axis": [x1, y1, x0, y0]}


def _grid():
    s = []
    n, x0, x1, y0, y1 = 6, .26, .74, .16, .84
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        s.append([x, y0, x, y1, 0])
    for i in range(5):
        y = y0 + (y1 - y0) * i / 4
        s.append([x0, y, x1, y, 0])
    return {"segs": s, "axis": [x0, y1, x1, y0]}


GEO = {"elevation": _elevation, "grid": _grid, "plan": _grid}


def _base(draw, img):
    """espresso radial gradient + faint coordinate grid"""
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy = W * .78, H * .12
    d = np.sqrt(((xx - cx) / (W * .9)) ** 2 + ((yy - cy) / (H * .9)) ** 2)
    d = np.clip(d, 0, 1)
    top = np.array(GROUND2, float)
    mid = np.array(GROUND, float)
    bot = np.array(BACKDROP, float)
    arr = np.where(d[..., None] < .5,
                   top + (mid - top) * (d[..., None] / .5),
                   mid + (bot - mid) * ((d[..., None] - .5) / .5))
    img.paste(Image.fromarray(arr.astype("uint8")), (0, 0))
    # grid every ~7.69%
    step_x, step_y = W / 13.0, H / 13.0
    for i in range(1, 13):
        a = int(255 * .18 * (1 - abs(i - 6.5) / 9))
        col = tuple(int(g + (a / 255) * (gl - g)) for g, gl in zip(GROUND, GRIDLINE))
        draw.line([(i * step_x, 0), (i * step_x, H)], fill=col, width=1)
        draw.line([(0, i * step_y), (W, i * step_y)], fill=col, width=1)


def _reg_marks(draw, m=78):
    """corner registration crosshairs"""
    r = 13
    for (cx, cy) in [(m, m), (W - m, m), (m, H - m), (W - m, H - m)]:
        draw.line([(cx, cy - r), (cx, cy + r)], fill=ASH, width=1)
        draw.line([(cx - r, cy), (cx + r, cy)], fill=ASH, width=1)


def _blend(base, col, a):
    return tuple(int(b + (c - b) * a) for b, c in zip(base, col))


def render_plate(path, structure="elevation", phase=.7, density=1500, seed=7):
    img = Image.new("RGB", (W, H), GROUND)
    draw = ImageDraw.Draw(img)
    _base(draw, img)
    rnd = random.Random(seed)
    geo = GEO.get(structure, _elevation)()
    segs, ax = geo["segs"], geo["axis"]
    lens = [math.hypot(g[2] - g[0], g[3] - g[1]) for g in segs]
    total = sum(lens)
    e = _ease(max(0, min(1, phase)))
    jitter = 1 - e

    # background un-resolving field (depth)
    for _ in range(int(density * .35)):
        x, y, s = rnd.random() * W, rnd.random() * H, rnd.uniform(.4, 1.1)
        draw.rectangle([x, y, x + s, y + s], fill=_blend(GROUND, ASH, .10))

    # declared structure at high focus
    if e > .55:
        la = (e - .55) / .45
        for g in segs:
            draw.line([(g[0] * W, g[1] * H), (g[2] * W, g[3] * H)],
                      fill=_blend(GROUND, BRASS, la * .28), width=1)
        draw.line([(ax[0] * W, ax[1] * H), (ax[2] * W, ax[3] * H)],
                  fill=_blend(GROUND, BRASSLIT, la * .5), width=2)

    # the marks
    for _ in range(density):
        brass = rnd.random() < .12
        emph = 0
        if brass:
            u = rnd.random()
            tx, ty = ax[0] + (ax[2] - ax[0]) * u, ax[1] + (ax[3] - ax[1]) * u
        else:
            r = rnd.random() * total
            k = 0
            while k < len(lens) - 1 and r > lens[k]:
                r -= lens[k]; k += 1
            g = segs[k]; t = rnd.random()
            tx, ty = g[0] + (g[2] - g[0]) * t, g[1] + (g[3] - g[1]) * t
            emph = g[4]
        sx, sy = .08 + rnd.random() * .84, .06 + rnd.random() * .88
        jx, jy = rnd.random() - .5, rnd.random() - .5
        x = (sx + (tx - sx) * e + jx * jitter * .10) * W
        y = (sy + (ty - sy) * e + jy * jitter * .10) * H
        sz = rnd.uniform(.8, 2.0) + (1.0 if brass else 0)
        if brass:
            col = _blend(GROUND, (208, 160, 90), .28 + e * .55)
        elif emph:
            col = _blend(GROUND, BONE, .20 + e * .45)
        else:
            col = _blend(GROUND, BONE, .12 + e * .30)
        draw.rectangle([x, y, x + sz, y + sz], fill=col)

    _reg_marks(draw)
    img.save(path, "PNG")
    return path


def render_split(path, density=2100, seed=58, sweep=1.0):
    """BEFORE (raw cloud) | AFTER (resolved model) — scan-to-bim hero"""
    img = Image.new("RGB", (W, H), GROUND)
    draw = ImageDraw.Draw(img)
    _base(draw, img)
    rnd = random.Random(seed)
    geo = _elevation()
    segs, ax = geo["segs"], geo["axis"]

    def mapR(x, y):
        return (0.545 + (x - .30) / .40 * .40, 0.16 + (y - .12) / .78 * .70)

    pts = []
    lens = [math.hypot(g[2] - g[0], g[3] - g[1]) for g in segs]
    total = sum(lens)
    for _ in range(density):
        brass = rnd.random() < .12
        if brass:
            u = rnd.random(); tx, ty = ax[0] + (ax[2] - ax[0]) * u, ax[1] + (ax[3] - ax[1]) * u; emph = 1
        else:
            r = rnd.random() * total; k = 0
            while k < len(lens) - 1 and r > lens[k]:
                r -= lens[k]; k += 1
            g = segs[k]; t = rnd.random(); tx, ty = g[0] + (g[2] - g[0]) * t, g[1] + (g[3] - g[1]) * t; emph = g[4]
        rx, ry = mapR(tx, ty)
        lx = .05 + (tx - .30) / .40 * .40 + (rnd.random() - .5) * .05
        ly = .16 + (ty - .12) / .78 * .70 + (rnd.random() - .5) * .05
        pts.append((rx, ry, lx, ly, brass, emph, rnd.uniform(.9, 1.9), rnd.random()))

    # LEFT raw cloud
    for (rx, ry, lx, ly, brass, emph, sz, band) in pts:
        a = .30 + band * .22
        col = _blend(GROUND, (208, 160, 90), a) if brass else _blend(GROUND, BONE, a)
        draw.rectangle([lx * W, ly * H, lx * W + sz, ly * H + sz], fill=col)
    # divider
    draw.line([(W * .5, H * .10), (W * .5, H * .90)], fill=_blend(GROUND, BRASS, .55), width=2)
    # RIGHT resolved
    for g in segs:
        draw.line([(mapR(g[0], g[1])[0] * W, mapR(g[0], g[1])[1] * H),
                   (mapR(g[2], g[3])[0] * W, mapR(g[2], g[3])[1] * H)],
                  fill=_blend(GROUND, BRASS, .26), width=1)
    a0, a1 = mapR(ax[0], ax[1]), mapR(ax[2], ax[3])
    draw.line([(a0[0] * W, a0[1] * H), (a1[0] * W, a1[1] * H)], fill=_blend(GROUND, BRASSLIT, .5), width=2)
    for (rx, ry, lx, ly, brass, emph, sz, band) in pts:
        if brass:
            col = _blend(GROUND, (208, 160, 90), .82)
        elif emph:
            col = _blend(GROUND, BONE, .66)
        else:
            col = _blend(GROUND, BONE, .50)
        s = sz + (.5 if brass else .2)
        draw.rectangle([rx * W, ry * H, rx * W + s, ry * H + s], fill=col)

    _reg_marks(draw)
    img.save(path, "PNG")
    return path


if __name__ == "__main__":
    render_plate("_render/test_elev.png", "elevation", .16, 1900, 3)
    render_split("_render/test_split.png")
    print("rendered test plates")
