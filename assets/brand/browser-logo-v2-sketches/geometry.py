"""Clean vector redraw of the AxioSozo A, fitted to the parent symbol PNG.

Coordinates are pixels of `../axiosozo-symbol-v1/source-01-selected-symbol.png`
(1254 x 1254, y down). Straight edges are lines through traced points, corners
are circular fillets and the three curves are cubic Beziers fitted by least
squares to the traced outline. `python3 geometry.py` prints the fit per part.
"""
from pathlib import Path
from collections import defaultdict
import math

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "axiosozo-symbol-v1" / "source-01-selected-symbol.png"


def unit(v):
    v = np.asarray(v, dtype=float)
    return v / np.linalg.norm(v)


def cubic(p0, p1, p2, p3, n=48):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = (np.asarray(p, dtype=float) for p in (p0, p1, p2, p3))
    return ((1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1
            + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3)


def x_on(a, b, y):
    """x of the line through a and b at height y."""
    return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])


def fillet(points, radii, steps=20):
    """Round the vertices listed in `radii` (index -> radius) with circular arcs."""
    p = [np.asarray(q, dtype=float) for q in points]
    out = []
    for i, v in enumerate(p):
        r = radii.get(i)
        if not r:
            out.append(v)
            continue
        u, w = unit(p[i - 1] - v), unit(p[(i + 1) % len(p)] - v)
        half = math.acos(float(np.clip(u @ w, -1, 1))) / 2
        d = r / math.tan(half)
        t1, t2 = v + u * d, v + w * d
        c = v + unit(u + w) * r / math.sin(half)
        a1 = math.atan2(*(t1 - c)[::-1])
        a2 = math.atan2(*(t2 - c)[::-1])
        sweep = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi
        for k in range(steps + 1):
            a = a1 + sweep * k / steps
            out.append(c + r * np.array([math.cos(a), math.sin(a)]))
    return np.array(out)


# ---------------------------------------------------------------- the three parts

# Crown: left and right edges, flat rounded top, flat underside that sweeps
# down to a sharp tip on the right edge.
CROWN_L = ((391, 587), (546, 286))
CROWN_R = ((943, 759), (722, 303))
TOP = 273
CROWN_CURVE = ((943, 759), (893, 711), (803, 587), (690, 587))

# Left leg: rounded shoulder, flat top with a small nub, inner curve.
LEG_L = ((171, 1028), (347, 694))
LEG_L_TOP = 648
LEG_L_CURVE = ((734, 663), (640, 694), (606, 740), (598, 755))
LEG_L_FOOT = (456, 1028)

# Right leg: domed top, rounded heel.
LEG_R_LEFT = ((660, 740), (773, 978))
LEG_R_RIGHT = ((1049, 1028), (909, 777))
LEG_R_CURVE = ((660, 740), (676, 729), (815, 608), (916, 790))
BASE = 1028


def crown():
    tl = (x_on(*CROWN_L, TOP), TOP)
    tr = (x_on(*CROWN_R, TOP), TOP)
    body = fillet([CROWN_L[0], tl, tr, CROWN_CURVE[0]], {1: 34, 2: 40})
    return np.vstack([body[:-1], cubic(*CROWN_CURVE)])


def leg_left():
    shoulder = (x_on(*LEG_L, LEG_L_TOP), LEG_L_TOP)
    body = fillet([LEG_L[0], shoulder, (734, LEG_L_TOP)], {1: 60})
    return np.vstack([body, cubic(*LEG_L_CURVE), [LEG_L_FOOT]])


def leg_right():
    heel = (x_on(*LEG_R_LEFT, BASE), BASE)
    body = fillet([LEG_R_RIGHT[0], heel, LEG_R_LEFT[0]], {1: 85})
    return np.vstack([body[:-1], cubic(*LEG_R_CURVE)])


def parts():
    return {"crown": crown(), "leg_left": leg_left(), "leg_right": leg_right()}


# ------------------------------------------------------------------- validation

def raster(polys, size=1254, scale=2):
    img = Image.new("L", (size * scale, size * scale), 0)
    draw = ImageDraw.Draw(img)
    for poly in polys:
        draw.polygon([(x * scale, y * scale) for x, y in poly], fill=255)
    return np.asarray(img.resize((size, size), Image.LANCZOS)) > 127


def source_mask():
    im = np.asarray(Image.open(SOURCE).convert("RGBA")).astype(int)
    return (im[..., :3].mean(axis=2) < 128) & (im[..., 3] > 128)


if __name__ == "__main__":
    mask = source_mask()
    total = raster(parts().values())
    for name, poly in parts().items():
        mine = raster([poly])
        near = mask & raster([poly * 1.0], scale=2)  # same region of the source
        box = np.zeros_like(mask)
        xs, ys = poly[:, 0], poly[:, 1]
        box[int(ys.min()) - 15:int(ys.max()) + 15, int(xs.min()) - 15:int(xs.max()) + 15] = True
        src = mask & box & ~raster([p for n, p in parts().items() if n != name])
        iou = (src & mine).sum() / (src | mine).sum()
        print(f"{name:10s} IoU {iou:.4f}")
    iou = (mask & total).sum() / (mask | total).sum()
    print(f"{'all':10s} IoU {iou:.4f}")
    diff = np.zeros(mask.shape + (3,), np.uint8) + 255
    diff[mask & total] = (200, 200, 200)
    diff[mask & ~total] = (220, 40, 40)   # in source, missing from redraw
    diff[~mask & total] = (40, 90, 220)   # in redraw, not in source
    Image.fromarray(diff).save(HERE / "fit-diff.png")
