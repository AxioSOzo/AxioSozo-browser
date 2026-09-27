"""Render the browser logo v2 sketches: one SVG + PNG icon per idea, and sheets.

    python3 assets/brand/browser-logo-v2-sketches/build_sketches.py

The Dock comparison uses icons of apps installed in /Applications. They are
extracted with AppKit into /Volumes/AxioSozoBuild/brand-sketches (not this
repository); the Dock sheets are skipped when that volume is not mounted.
"""
from pathlib import Path
import subprocess
import sys
import textwrap

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

sys.dont_write_bytecode = True  # keep __pycache__ out of the repo
import geometry as g  # noqa: E402

HERE = Path(__file__).resolve().parent
V1 = HERE.parent / "browser-logo-v1" / "axiosozo-browser-icon-v1-1024.png"
ICON_CACHE = Path("/Volumes/AxioSozoBuild/brand-sketches/app-icons")
DOCK_APPS = ["Zen", "Google Chrome", "Safari", "Cursor"]

INK = (0x1C, 0x1A, 0x16)
VERMILION = (0xC7, 0x3E, 0x1D)
CREAM = (0xF0, 0xE9, 0xD7)
PAPER = (0xF7, 0xF4, 0xEE)

SIZE, TILE, SS = 1024, 824, 3
A_CENTER = np.array([610.0, 651.0])  # centre of the A's bounding box, source px


def hexc(c):
    return "#%02X%02X%02X" % c


def place(poly, scale=0.66, center=(512, 526), shift=(0, 0), angle=0):
    """Source-pixel coordinates -> 1024 icon canvas, optionally rotated (degrees)."""
    p = np.asarray(poly, float) + shift - A_CENTER
    if angle:
        a = np.radians(angle)
        p = p @ np.array([[np.cos(a), np.sin(a)], [-np.sin(a), np.cos(a)]])
    return p * scale + center


def squircle(n=5, steps=720):
    t = np.linspace(0, 2 * np.pi, steps, endpoint=False)
    c, s = np.cos(t), np.sin(t)
    x = np.sign(c) * np.abs(c) ** (2 / n)
    y = np.sign(s) * np.abs(s) ** (2 / n)
    return np.c_[SIZE / 2 + TILE / 2 * x, SIZE / 2 + TILE / 2 * y]


def rounded_rect(x0, y0, x1, y1, r):
    return g.fillet([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], {i: r for i in range(4)})


def stroke(line, width):
    """Polygon of a round-capped stroke along a polyline."""
    p = np.asarray(line, float)
    d = np.gradient(p, axis=0)
    n = np.c_[-d[:, 1], d[:, 0]] / np.linalg.norm(d, axis=1)[:, None] * width / 2

    def cap(center, start, sweep=np.pi):
        a0 = np.arctan2(*(start - center)[::-1])
        a = a0 + np.linspace(0, sweep, 16)
        return center + width / 2 * np.c_[np.cos(a), np.sin(a)]

    return np.vstack([p + n, cap(p[-1], p[-1] + n[-1], -np.pi),
                      (p - n)[::-1], cap(p[0], p[0] - n[0], -np.pi)])


def smooth(p, k=9):
    kernel = np.ones(k) / k
    pad = np.pad(p, ((k // 2, k // 2), (0, 0)), mode="edge")
    return np.c_[np.convolve(pad[:, 0], kernel, "valid"), np.convolve(pad[:, 1], kernel, "valid")]


# ------------------------------------------------------------------ A geometry

PARTS = g.parts()
CROWN_UNDER = np.vstack([[(391, 587)], g.cubic(*g.CROWN_CURVE, n=96)[::-1]])  # left -> tip
DOME = g.cubic(*g.LEG_R_CURVE, n=96)                                        # apex -> right edge
LEG_CURVE = g.cubic(*g.LEG_L_CURVE, n=96)                                    # nub -> inner edge
APEX = np.array(g.LEG_R_CURVE[0], float)
_k = int(np.argmin(np.linalg.norm(LEG_CURVE - APEX, axis=1)))
SHOULDER = (g.x_on(*g.LEG_L, g.LEG_L_TOP), g.LEG_L_TOP)

# The cut between the crown and the legs, closed where it meets the outline
# and across the mouth of the counter (apex of the right leg -> left leg).
GAP = np.vstack([CROWN_UNDER, DOME[::-1], LEG_CURVE[:_k + 1][::-1],
                 [(734, 648), SHOULDER]])
# The lower edge of that cut, left to right.
GAP_FLOOR = np.vstack([[SHOULDER, (734, 648)], LEG_CURVE[:_k + 1], DOME])
# The counter: the arch between the legs, closed at its top the same way.
COUNTER = np.vstack([LEG_CURVE[_k:], [g.LEG_L_FOOT, (g.x_on(*g.LEG_R_LEFT, g.BASE), g.BASE)],
                     [APEX]])


def thread_line(width):
    """Centre line of the cut, from its left end until it gets too narrow."""
    floor = np.vstack([np.linspace(a, b, 40) for a, b in zip(GAP_FLOOR[:-1], GAP_FLOOR[1:])])
    pts = []
    for p in np.vstack([np.linspace((430, 587), (690, 587), 60), CROWN_UNDER[1:]]):
        dist = np.linalg.norm(floor - p, axis=1)
        q = floor[int(np.argmin(dist))]
        if dist.min() < 2.3 * width:
            break
        pts.append((p + q) / 2)
    return smooth(np.array(pts), 15)


def compounding():
    """A redraw of the A whose cut is an exponential curve rising to the right."""
    sil = g.fillet([(171, 1028), (553, 273), (707, 273), (1049, 1028)], {1: 34, 2: 40})
    x = np.linspace(150, 1100, 200)
    u = (x - 300) / 560
    k = 2.4
    y = 700 - 210 * (np.exp(k * u) - 1) / (np.exp(k) - 1)
    center = np.c_[x, y]
    half = 24
    band = np.vstack([center + (0, -half), (center + (0, half))[::-1]])
    counter = [(456, 1028), (626, 700), (656, 708), (797, 1028)]
    return sil, band, g.fillet(counter, {1: 14, 2: 14})


# -------------------------------------------------------------------- concepts

def el(poly, fill, clip=(), minus=(), shadow=None, outline=None):
    """A shape. `poly` is one polygon or a list of them. `fill` is an RGB(A)
    colour or a `lit()` gradient; `shadow` is (offset down, blur, opacity) and
    `outline` a stroke width, both in icon px. With `outline` only the edge is drawn."""
    polys = poly if isinstance(poly, list) else [poly]
    return {"polys": [np.asarray(q, float) for q in polys], "fill": fill,
            "shadow": shadow, "outline": outline,
            "clip": [np.asarray(c, float) for c in clip],
            "minus": [np.asarray(m, float) for m in minus]}


def tile(color):
    return el(squircle(), color)


def a_parts(color, **kw):
    return [el(place(p, **kw), color) for p in PARTS.values()]


def concept_path():
    return [tile(INK), el(place(GAP), VERMILION), *a_parts(CREAM)]


def concept_thread():
    return [tile(CREAM), *a_parts(INK), el(place(stroke(thread_line(20), 20)), VERMILION)]


def concept_compounding():
    sil, band, counter = compounding()
    return [tile(INK), el(place(sil), CREAM, minus=[place(counter)]),
            el(place(band), VERMILION, clip=[place(sil)])]


def concept_keystone():
    return [tile(CREAM), el(place(PARTS["crown"], shift=(0, -30)), VERMILION),
            el(place(PARTS["leg_left"]), INK), el(place(PARTS["leg_right"]), INK)]


def concept_keystone_dark():
    return [tile(INK), el(place(PARTS["crown"]), VERMILION),
            el(place(PARTS["leg_left"]), CREAM), el(place(PARTS["leg_right"]), CREAM)]


def concept_doorway():
    return [tile(INK), el(place(COUNTER), VERMILION), *a_parts(CREAM)]


def concept_window():
    top = place([(0, 617)])[0][1]
    pane = rounded_rect(164, top, 860, 860, 44)
    parts = [place(p) for p in PARTS.values()]
    return ([tile(INK), el(pane, CREAM)]
            + [el(p, CREAM, minus=[pane]) for p in parts]
            + [el(p, INK, clip=[pane]) for p in parts])


# ---------------------------------------------------------- round 2: fusions

# Light from above: each brand colour as a top -> bottom ramp.
LIT = {INK: ((0x2E, 0x2A, 0x24), (0x12, 0x11, 0x0E)),
       CREAM: ((0xFB, 0xF6, 0xEA), (0xE2, 0xD8, 0xC1)),
       VERMILION: ((0xDD, 0x58, 0x31), (0xAC, 0x32, 0x18))}


def lit(color, poly):
    """Vertical gradient of a brand colour over the height of `poly` (icon px)."""
    ys = np.asarray(poly)[:, 1]
    top, bottom = LIT[color]
    return {"stops": (top, bottom), "y": (float(ys.min()), float(ys.max()))}


def horizon(width_right=800):
    """The cut, extended edge to edge: (top edge, bottom edge), left -> right."""
    tip = CROWN_UNDER[-1]
    run = g.unit(tip - CROWN_UNDER[-4])
    top = np.vstack([[(-400, 587)], CROWN_UNDER, [tip + run * width_right]])
    bottom = np.vstack([[(-400, 648)], GAP_FLOOR, [GAP_FLOOR[-1] + run * width_right]])
    return top, bottom


def below(edge):
    return np.vstack([edge, [(edge[-1][0], 2000), (edge[0][0], 2000)]])


def concept_path_through():
    top, bottom = horizon()
    band = np.vstack([top, bottom[::-1]])
    return [tile(INK), el(place(band), VERMILION, clip=[squircle()]), *a_parts(CREAM)]


def concept_horizon(crown=CREAM, band=VERMILION, depth=False):
    top, bottom = horizon()
    ground = below(bottom if band else top)
    fill = (lambda c, poly: lit(c, poly)) if depth else (lambda c, poly: c)
    shadow = (10, 14, 0.45) if depth else None
    out = [el(squircle(), fill(INK, squircle())),
           el(place(ground), fill(CREAM, squircle()), clip=[squircle()])]
    if band:
        out.append(el(place(np.vstack([top, bottom[::-1]])), fill(band, place(top)),
                      clip=[squircle()]))
    c = place(PARTS["crown"])
    out.append(el(c, fill(crown, c), shadow=shadow))
    for key in ("leg_left", "leg_right"):
        leg = place(PARTS[key])
        out.append(el(leg, fill(INK, leg)))
    return out


def concept_keystone_crop():
    kw = {"scale": 1.1, "center": (512, 606)}
    return [tile(INK),
            el(place(PARTS["crown"], **kw), VERMILION, clip=[squircle()]),
            el(place(PARTS["leg_left"], **kw), CREAM, clip=[squircle()]),
            el(place(PARTS["leg_right"], **kw), CREAM, clip=[squircle()])]


def concept_keystone_lit():
    legs = [place(PARTS[k]) for k in ("leg_left", "leg_right")]
    crown = place(PARTS["crown"])
    return ([el(squircle(), lit(INK, squircle()))]
            + [el(leg, lit(CREAM, np.vstack(legs))) for leg in legs]
            + [el(crown, lit(VERMILION, crown), shadow=(12, 16, 0.5))])


def concept_path_lit():
    parts = [place(p) for p in PARTS.values()]
    whole = np.vstack(parts)
    return ([el(squircle(), lit(INK, squircle())), el(place(GAP), lit(VERMILION, place(GAP)))]
            + [el(p, lit(CREAM, whole), shadow=(8, 10, 0.35)) for p in parts])


def j_tail(width=42):
    """Where the cut leaves the A, bend it back up to the tile's right edge."""
    exit_mid = (CROWN_UNDER[-1] + DOME[-1]) / 2
    run = g.unit(CROWN_UNDER[-1] - CROWN_UNDER[-4])
    end, rise = np.array([1350.0, 380.0]), g.unit((0.6, -0.8))
    return stroke(g.cubic(exit_mid, exit_mid + run * 120, end - rise * 250, end, n=96), width)


def concept_j_curve():
    parts = [place(p) for p in PARTS.values()]
    whole = np.vstack(parts)
    red = lit(VERMILION, place(np.vstack([GAP, j_tail()])))
    return ([el(squircle(), lit(INK, squircle())), el(place(GAP), red),
             el(place(j_tail()), red, clip=[squircle()])]
            + [el(p, lit(CREAM, whole), shadow=(8, 10, 0.35)) for p in parts])


# ------------------------------------------------------ round 3: wider ideas

def ramp(top, bottom, poly):
    ys = np.asarray(poly)[:, 1]
    return {"stops": (top, bottom), "y": (float(ys.min()), float(ys.max()))}


def lit_tile(color):
    return el(squircle(), lit(color, squircle()))


def placed(**kw):
    return {k: place(v, **kw) for k, v in PARTS.items()}


def rect(x0, y0, x1, y1):
    return np.array([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], float)


def circle(cx, cy, r, steps=180):
    t = np.linspace(0, 2 * np.pi, steps, endpoint=False)
    return np.c_[cx + r * np.cos(t), cy + r * np.sin(t)]


def crop(crown_color, leg_color, tile_color, **kw):
    """The keystone A, enlarged so it runs off the tile."""
    p, clip = placed(**kw), [squircle()]
    legs = [p["leg_left"], p["leg_right"]]
    return ([lit_tile(tile_color)]
            + [el(q, lit(leg_color, np.vstack(legs)), clip=clip) for q in legs]
            + [el(p["crown"], lit(crown_color, p["crown"]), clip=clip, shadow=(14, 20, 0.45))])


def concept_summit():
    return crop(VERMILION, CREAM, INK, scale=1.75, center=(512, 832))


def concept_off_centre():
    return crop(VERMILION, INK, CREAM, scale=1.3, center=(590, 600), angle=-10)


def concept_vermilion_tile():
    p = placed()
    return [lit_tile(VERMILION)] + [el(q, lit(CREAM, np.vstack(list(p.values()))),
                                        shadow=(10, 16, 0.35)) for q in p.values()]


def concept_sunrise():
    p = placed(scale=0.9, center=(512, 560))
    sky = ramp((0xF8, 0xF1, 0xE2), (0xE9, 0xD5, 0xB0), squircle())
    sun = circle(530, 470, 128)
    legs = [p["leg_left"], p["leg_right"]]
    return ([el(squircle(), sky), el(sun, lit(VERMILION, sun))]
            + [el(q, lit(INK, np.vstack(legs)), clip=[squircle()]) for q in legs])


def concept_seal():
    disc = circle(512, 512, 300)
    p = placed(scale=0.46, center=(512, 524))
    return ([lit_tile(CREAM), el(disc, lit(VERMILION, disc), shadow=(8, 14, 0.25)),
             el(circle(512, 512, 272), CREAM, outline=8)]
            + [el(q, CREAM) for q in p.values()])


def concept_tab():
    p = placed(scale=0.72, center=(512, 560))
    top = place([(0, 587)], scale=0.72, center=(512, 560))[0][1]
    page = g.fillet([(150, top), (874, top), (874, 874), (150, 874)], {0: 24, 1: 24, 2: 56, 3: 56})
    red = lit(VERMILION, np.vstack([p["crown"], page]))
    legs = [p["leg_left"], p["leg_right"]]
    return ([lit_tile(INK), el([p["crown"], page], red, shadow=(10, 18, 0.4))]
            + [el(q, lit(INK, np.vstack(legs))) for q in legs])


def concept_two_engines():
    p = placed()
    whole = np.vstack(list(p.values()))
    return [lit_tile(INK), el(p["crown"], lit(CREAM, whole), shadow=(8, 12, 0.35)),
            el(p["leg_left"], lit(CREAM, whole)), el(p["leg_right"], lit(VERMILION, whole))]


def concept_strata():
    bars = [place(rect(0, y, 1300, y + 22)) for y in (425, 790, 900)]
    peak = place(rect(0, 0, 1300, 425))
    p = placed()
    return ([lit_tile(CREAM)]
            + [el(q, lit(INK, q), minus=bars + [peak]) for q in p.values()]
            + [el(p["crown"], lit(VERMILION, peak), clip=[peak])])


def concept_monolith():
    p = placed(scale=0.6, center=(496, 500))
    depth = np.array([16.0, 30.0])
    sides = [q + depth * k / 24 for q in p.values() for k in range(1, 25)]
    whole = np.vstack(list(p.values()))
    return ([lit_tile(VERMILION), el(sides, lit(INK, np.vstack(sides)), shadow=(18, 28, 0.35))]
            + [el(q, lit(CREAM, whole)) for q in p.values()])


def concept_line():
    p = placed()
    return ([lit_tile(INK), el(p["crown"], VERMILION, outline=18)]
            + [el(p[k], CREAM, outline=18) for k in ("leg_left", "leg_right")])


def concept_glass():
    p = placed()
    tile_fill = ramp((0xE4, 0x66, 0x3C), (0x5E, 0x1B, 0x0C), squircle())
    whole = np.vstack(list(p.values()))
    glass = ramp((0xFF, 0xFB, 0xF2, 235), (0xF0, 0xE9, 0xD7, 150), whole)
    return ([el(squircle(), tile_fill)]
            + [el(q, glass, shadow=(16, 26, 0.3)) for q in p.values()]
            + [el(q, (0xFF, 0xFF, 0xFF, 110), outline=4) for q in p.values()])


def concept_bookmark():
    ribbon = np.array([(332, 40), (692, 40), (692, 856), (512, 650), (332, 856)], float)
    top, _ = horizon()
    cut = place(np.vstack([top, (top + (0, 64))[::-1]]), center=(512, 472))
    return [lit_tile(INK),
            el(ribbon, lit(VERMILION, ribbon), clip=[squircle()], minus=[cut], shadow=(12, 20, 0.45))]


CONCEPTS = [
    # key, group, name, meaning
    ("a1-path", "A", "Path",
     "The cut through the A is filled in vermilion: value runs through the letter."),
    ("a2-thread", "A", "Thread",
     "A single vermilion line runs inside the cut: one thread of work, kept intact."),
    ("a3-compounding", "A", "Compounding",
     "A redraw: the cut becomes an exponential curve that rises to the right."),
    ("b1-keystone", "B", "Keystone",
     "The crown is lifted and made vermilion: the value the legs hold up."),
    ("b2-keystone-dark", "B", "Keystone, dark",
     "Same idea, not lifted, on an ink tile like the Dock's dark neighbours."),
    ("c1-doorway", "C", "Doorway",
     "The arch between the legs lights up: the A is a door you open."),
    ("c2-window", "C", "Window",
     "The A rises out of a window: cream above the frame, ink inside it."),
    ("r2-1-path-through", "R2", "Path, edge to edge",
     "The vermilion path doesn't stop at the letter: it crosses the whole tile."),
    ("r2-2-horizon", "R2", "Horizon",
     "Path + window: the path is a horizon. Crown against ink sky, legs on cream ground."),
    ("r2-3-horizon-keystone", "R2", "Horizon, keystone",
     "Keystone + window: vermilion crown in the sky, the work on the ground below."),
    ("r2-4-keystone-crop", "R2", "Keystone, close crop",
     "The A fills the tile and runs off the edges; the crown is the focal point."),
    ("r2-5-keystone-lit", "R2", "Keystone, lit",
     "Keystone with light from above and the crown casting a soft shadow."),
    ("r2-6-horizon-lit", "R2", "Horizon, lit",
     "Horizon with the same light and shadow."),
    ("r2-7-path-lit", "R2", "Path, lit",
     "Path with light and the letter's parts lifted off the vermilion."),
    ("r2-8-j-curve", "R2", "Path, J-curve",
     "The path dips through the A and climbs out: the founder's J-curve."),
    ("r3-01-summit", "R3", "Summit",
     "An extreme crop: only the peak and the cut. Confident, almost abstract."),
    ("r3-02-off-centre", "R3", "Off-centre",
     "Close crop on cream, tilted and pushed right, as if it is moving."),
    ("r3-03-vermilion-tile", "R3", "Vermilion tile",
     "The brand colour as the whole tile. No red icon among these neighbours."),
    ("r3-04-sunrise", "R3", "Sunrise",
     "The crown becomes a rising sun over the two legs: value at first light."),
    ("r3-05-seal", "R3", "Seal",
     "A stamp or hanko: the mark of value that is certified and kept."),
    ("r3-06-tab", "R3", "Tab",
     "The crown is shaped like a browser tab; the page below holds the legs."),
    ("r3-07-two-engines", "R3", "Two engines",
     "Two legs, two engines (Gecko and Chromium), one crown: one browser."),
    ("r3-08-strata", "R3", "Strata",
     "The A built from layers, with the peak in vermilion: value that accrues."),
    ("r3-09-monolith", "R3", "Monolith",
     "The A as a solid object: something built, with weight."),
    ("r3-10-line", "R3", "Line",
     "Outline only, like a developer tool or terminal glyph."),
    ("r3-11-glass", "R3", "Glass",
     "A frosted A over a deep vermilion tile, in the macOS 26 material style."),
    ("r3-12-bookmark", "R3", "Bookmark",
     "A bookmark ribbon (sozo: to save) whose notch and cut form the A."),
]
BUILD = {"a1-path": concept_path, "a2-thread": concept_thread,
         "a3-compounding": concept_compounding, "b1-keystone": concept_keystone,
         "b2-keystone-dark": concept_keystone_dark, "c1-doorway": concept_doorway,
         "c2-window": concept_window, "r2-1-path-through": concept_path_through,
         "r2-2-horizon": concept_horizon,
         "r2-3-horizon-keystone": lambda: concept_horizon(crown=VERMILION, band=None),
         "r2-4-keystone-crop": concept_keystone_crop,
         "r2-5-keystone-lit": concept_keystone_lit,
         "r2-6-horizon-lit": lambda: concept_horizon(depth=True),
         "r2-7-path-lit": concept_path_lit, "r2-8-j-curve": concept_j_curve,
         "r3-01-summit": concept_summit, "r3-02-off-centre": concept_off_centre,
         "r3-03-vermilion-tile": concept_vermilion_tile, "r3-04-sunrise": concept_sunrise,
         "r3-05-seal": concept_seal, "r3-06-tab": concept_tab,
         "r3-07-two-engines": concept_two_engines, "r3-08-strata": concept_strata,
         "r3-09-monolith": concept_monolith, "r3-10-line": concept_line,
         "r3-11-glass": concept_glass, "r3-12-bookmark": concept_bookmark}
DIRECTIONS = {
    "A": ("Direction A — the path",
          "The cut in the parent A becomes the browser's signature. No added objects."),
    "B": ("Direction B — the keystone",
          "The crown is the value; the legs are the work that holds it up (sozo: kept whole)."),
    "C": ("Direction C — the aperture",
          "The A's own negative space becomes a door or window: the browser opens things."),
    "R2": ("Round 2 — fusing Path, Keystone and Window",
           "The cut becomes a horizon across the tile; plus a close crop and light."),
    "R3": ("Round 3 — twelve different ideas",
           "Different shapes, crops, colours and stories. Under each: 64, 32 and 16 px."),
}


# ------------------------------------------------------------------- rendering

def mask_of(polys, px, outline=None):
    m = Image.new("L", (px, px), 0)
    draw = ImageDraw.Draw(m)
    for poly in polys if isinstance(polys, list) else [polys]:
        pts = [tuple(p) for p in np.asarray(poly) * px / SIZE]
        if outline:
            draw.line(pts + pts[:2], fill=255, width=round(outline * px / SIZE), joint="curve")
        else:
            draw.polygon(pts, fill=255)
    return m


def rgba(c):
    return tuple(c) + (255,) * (4 - len(c))


def paint(fill, px):
    if isinstance(fill, tuple):
        return Image.new("RGBA", (px, px), rgba(fill))
    c0, c1 = (np.array(rgba(c), float) for c in fill["stops"])
    y0, y1 = (v * px / SIZE for v in fill["y"])
    t = np.clip((np.arange(px) - y0) / max(y1 - y0, 1), 0, 1)[:, None]
    rows = (c0 + (c1 - c0) * t).astype(np.uint8)
    return Image.fromarray(np.repeat(rows[:, None, :], px, axis=1), "RGBA")


def render(elements):
    px = SIZE * SS
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    tile_mask = mask_of(squircle(), px)
    for e in elements:
        m = mask_of(e["polys"], px, e["outline"])
        for c in e["clip"]:
            m = ImageChops.multiply(m, mask_of(c, px))
        for c in e["minus"]:
            m = ImageChops.subtract(m, mask_of(c, px))
        if e["shadow"]:
            dy, blur, opacity = e["shadow"]
            sh = ImageChops.offset(m, 0, int(dy * SS)).filter(ImageFilter.GaussianBlur(blur * SS))
            layer = Image.new("RGBA", (px, px), (0, 0, 0, 255))
            layer.putalpha(ImageChops.multiply(sh.point(lambda v: int(v * opacity)), tile_mask))
            img.alpha_composite(layer)
        layer = paint(e["fill"], px)
        layer.putalpha(ImageChops.multiply(layer.getchannel("A"), m))
        img.alpha_composite(layer)
    return img.resize((SIZE, SIZE), Image.LANCZOS)


def svg_path(polys):
    return " ".join("M" + " ".join(f"{x:.1f},{y:.1f}" for x, y in np.asarray(p)) + "Z"
                    for p in (polys if isinstance(polys, list) else [polys]))


def svg_colour(c):
    c = rgba(c)
    return f'"{hexc(c[:3])}"' + (f' stop-opacity="{c[3] / 255:.2f}"' if c[3] < 255 else "")


def svg(elements, title):
    defs, body = [], []
    for i, e in enumerate(elements):
        fill = e["fill"]
        if isinstance(fill, tuple):
            paint_attr = f'"{hexc(fill[:3])}"'
            if len(fill) == 4:
                paint_attr += f' {"stroke" if e["outline"] else "fill"}-opacity="{fill[3] / 255:.2f}"'
        else:
            (c0, c1), (y0, y1) = fill["stops"], fill["y"]
            defs.append(f'<linearGradient id="g{i}" gradientUnits="userSpaceOnUse" x1="0" '
                        f'y1="{y0:.1f}" x2="0" y2="{y1:.1f}"><stop offset="0" '
                        f'stop-color={svg_colour(c0)}/><stop offset="1" '
                        f'stop-color={svg_colour(c1)}/></linearGradient>')
            paint_attr = f'"url(#g{i})"'
        if e["outline"]:
            node = (f'<path d="{svg_path(e["polys"])}" fill="none" stroke={paint_attr} '
                    f'stroke-width="{e["outline"]}" stroke-linejoin="round"/>')
        else:
            node = f'<path d="{svg_path(e["polys"])}" fill={paint_attr}/>'
        if e["shadow"]:
            dy, blur, opacity = e["shadow"]
            defs.append(f'<filter id="s{i}" x="-20%" y="-20%" width="140%" height="160%">'
                        f'<feDropShadow dx="0" dy="{dy}" stdDeviation="{blur / 2}" '
                        f'flood-color="#000" flood-opacity="{opacity}"/></filter>')
            node = f'<g filter="url(#s{i})">{node}</g>'
        if e["minus"]:
            holes = "".join(f'<path d="{svg_path(m)}" fill="#000"/>' for m in e["minus"])
            defs.append(f'<mask id="m{i}" maskUnits="userSpaceOnUse" x="0" y="0" '
                        f'width="{SIZE}" height="{SIZE}"><rect width="{SIZE}" height="{SIZE}" '
                        f'fill="#fff"/>{holes}</mask>')
            node = f'<g mask="url(#m{i})">{node}</g>'
        for j, c in enumerate(e["clip"]):
            defs.append(f'<clipPath id="c{i}_{j}"><path d="{svg_path(c)}"/></clipPath>')
            node = f'<g clip-path="url(#c{i}_{j})">{node}</g>'
        body.append(node)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" '
            f'width="{SIZE}" height="{SIZE}"><title>{title}</title>'
            f'<defs>{"".join(defs)}</defs>{"".join(body)}</svg>\n')


# ---------------------------------------------------------------------- sheets

def font(size, bold=False):
    return ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", size, index=1 if bold else 0)


def sized(icon, px):
    return icon.resize((px, px), Image.LANCZOS)


def size_strip(icon, bg, fg):
    """The icon at 128/64/32/16 px plus the 16 px render blown up 6x."""
    w, h = 520, 170
    strip = Image.new("RGB", (w, h), bg)
    x = 16
    for px in (128, 64, 32, 16):
        strip.paste(sized(icon, px), (x, (h - px) // 2 - 8), sized(icon, px))
        ImageDraw.Draw(strip).text((x, h - 26), f"{px}", fill=fg, font=font(14))
        x += px + 22
    tiny = sized(icon, 16).resize((96, 96), Image.NEAREST)
    backed = Image.new("RGB", (96, 96), bg)
    backed.paste(tiny, (0, 0), tiny)
    strip.paste(backed, (x + 8, (h - 96) // 2 - 8))
    ImageDraw.Draw(strip).text((x + 8, h - 26), "16 × 6", fill=fg, font=font(14))
    return strip


def card(icon, name, meaning):
    c = Image.new("RGB", (1560, 460), PAPER)
    c.paste(sized(icon, 420), (20, 20), sized(icon, 420))
    d = ImageDraw.Draw(c)
    d.text((470, 34), name, fill=INK, font=font(34, bold=True))
    d.text((470, 84), meaning, fill=(0x55, 0x50, 0x48), font=font(20))
    c.paste(size_strip(icon, (0xFF, 0xFF, 0xFF), (0x88, 0x84, 0x7C)), (470, 150))
    c.paste(size_strip(icon, (0x23, 0x22, 0x26), (0x9A, 0x96, 0x90)), (1010, 150))
    d.text((470, 330), "light: menus, Finder, website", fill=(0x88, 0x84, 0x7C), font=font(15))
    d.text((1010, 330), "dark: tab strip, dark Dock", fill=(0x88, 0x84, 0x7C), font=font(15))
    return c


def sheet(title, subtitle, cards):
    h = 150 + sum(c.height + 16 for c in cards)
    s = Image.new("RGB", (1600, h), (0xE9, 0xE4, 0xD9))
    d = ImageDraw.Draw(s)
    d.text((40, 36), title, fill=INK, font=font(44, bold=True))
    d.text((40, 96), subtitle, fill=(0x55, 0x50, 0x48), font=font(22))
    y = 150
    for c in cards:
        s.paste(c, (20, y))
        y += c.height + 16
    return s


def grid_sheet(title, subtitle, items, cols=4):
    """Contact sheet: each idea large, with its name, story and small sizes."""
    cw, ch = 385, 590
    rows = -(-len(items) // cols)
    s = Image.new("RGB", (40 + cols * cw, 150 + rows * ch), (0xE9, 0xE4, 0xD9))
    d = ImageDraw.Draw(s)
    d.text((40, 36), title, fill=INK, font=font(44, bold=True))
    d.text((40, 96), subtitle, fill=(0x55, 0x50, 0x48), font=font(22))
    for i, (icon, name, meaning) in enumerate(items):
        x, y = 20 + (i % cols) * cw, 150 + (i // cols) * ch
        d.rectangle((x, y, x + cw - 16, y + ch - 16), fill=PAPER)
        s.paste(sized(icon, 320), (x + 25, y + 12), sized(icon, 320))
        d.text((x + 24, y + 345), name, fill=INK, font=font(26, bold=True))
        for k, line in enumerate(textwrap.wrap(meaning, 40)[:3]):
            d.text((x + 24, y + 384 + k * 22), line, fill=(0x55, 0x50, 0x48), font=font(17))
        d.rectangle((x + 24, y + 460, x + cw - 40, y + 556), fill=(0x23, 0x22, 0x26))
        ox = x + 44
        for px in (64, 32, 16):
            s.paste(sized(icon, px), (ox, y + 508 - px // 2), sized(icon, px))
            ox += px + 34
    return s


ICON_JXA = """ObjC.import('AppKit');
function run(argv) {
  const img = $.NSWorkspace.sharedWorkspace.iconForFile(argv[0]);
  img.size = $.NSMakeSize(512, 512);
  const rep = $.NSBitmapImageRep.imageRepWithData(img.TIFFRepresentation);
  rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $())
     .writeToFileAtomically(argv[1], true);
}"""


def app_icon(app):
    """The app's Finder icon, via AppKit (Quick Look hangs without a GUI session)."""
    out = ICON_CACHE / f"{app}.app.png"
    if not out.exists():
        ICON_CACHE.mkdir(parents=True, exist_ok=True)
        subprocess.run(["osascript", "-l", "JavaScript", "-e", ICON_JXA,
                        f"/Applications/{app}.app", str(out)], check=True, timeout=60)
    return Image.open(out).convert("RGBA")


def dock_sheet(rows):
    others = [app_icon(a) for a in DOCK_APPS]
    px, gap = 104, 14
    height = 130 + len(rows) * 170
    s = Image.new("RGB", (1300, height))
    top, bottom = np.array([0x3A, 0x4A, 0x6B]), np.array([0xC9, 0x8E, 0x6A])
    for y in range(height):  # stand-in wallpaper so tiles are judged on colour
        s.paste(tuple(int(v) for v in top + (bottom - top) * y / height), (0, y, 1300, y + 1))
    d = ImageDraw.Draw(s, "RGBA")
    d.text((40, 36), "In the Dock, next to Zen, Chrome, Safari and Cursor", fill="white",
           font=font(34, bold=True))
    y = 120
    for label, icon in rows:
        d.rounded_rectangle((30, y, 30 + 5 * (px + gap) + gap + 8, y + px + 28), 30,
                            fill=(255, 255, 255, 70), outline=(255, 255, 255, 110))
        x = 30 + gap
        for other in others + [icon]:
            s.paste(sized(other, px), (x, y + 14), sized(other, px))
            x += px + gap
        d.text((x + 40, y + 50), label, fill="white", font=font(24, bold=True))
        y += 170
    return s


def main():
    icons = {}
    for key, _, name, _ in CONCEPTS:
        elements = BUILD[key]()
        (HERE / f"{key}.svg").write_text(svg(elements, f"AxioSozo browser sketch — {name}"))
        icons[key] = render(elements)
        icons[key].save(HERE / f"{key}-1024.png")
    for letter, (title, subtitle) in DIRECTIONS.items():
        group = [(icons[k], n, m) for k, dl, n, m in CONCEPTS if dl == letter]
        page = (grid_sheet(title, subtitle, group) if letter == "R3"
                else sheet(title, subtitle, [card(*item) for item in group]))
        page.save(HERE / f"sheet-{letter.lower()}.png")
    v1 = Image.open(V1).convert("RGBA")
    rows = [("v1 (current)", v1)] + [(n, icons[k]) for k, grp, n, _ in CONCEPTS if grp in "ABC"]
    favourites = ("a1-path", "b2-keystone-dark", "c2-window")
    rows2 = ([("v1 (current)", v1)] + [(n, icons[k]) for k, _, n, _ in CONCEPTS if k in favourites]
             + [(n, icons[k]) for k, grp, n, _ in CONCEPTS if grp == "R2"])
    rows3 = ([("Keystone, close crop", icons["r2-4-keystone-crop"])]
             + [(n, icons[k]) for k, grp, n, _ in CONCEPTS if grp == "R3"])
    grid = sheet("Round 1 next to v1", "Same order as the direction sheets.",
                 [card(v1, "v1 (current)", "The A with a vermilion orbit, rendered in 3D.")]
                 + [card(icons[k], f"{k[:2].upper()}  {n}", m)
                    for k, grp, n, m in CONCEPTS if grp in "ABC"])
    grid.save(HERE / "sheet-all.png")
    if ICON_CACHE.parent.parent.is_mount():
        dock_sheet(rows).save(HERE / "sheet-dock.png")
        dock_sheet(rows2).save(HERE / "sheet-dock-r2.png")
        dock_sheet(rows3).save(HERE / "sheet-dock-r3.png")
    else:
        print("skipped Dock sheet: /Volumes/AxioSozoBuild is not mounted")


if __name__ == "__main__":
    main()
