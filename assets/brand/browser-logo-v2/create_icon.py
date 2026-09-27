"""Render the v2 browser app icon: the "Off-centre" sketch, finished for macOS.

    python3 assets/brand/browser-logo-v2/create_icon.py

The artwork comes from ../browser-logo-v2-sketches (the fitted A and the
renderer). This script only adds the outer shadow and writes the final files:
a 1024 px PNG for build_icons.py and an SVG of the artwork without the shadow.
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageChops, ImageFilter

HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE.parent / "browser-logo-v2-sketches"))
import build_sketches as b  # noqa: E402

PNG = HERE / "axiosozo-browser-icon-v2-1024.png"
SVG = HERE / "axiosozo-browser-icon-v2.svg"
# A soft shadow under the tile, like Apple's icon template. It must fade out well
# inside the 100 px canvas margin (v1 baked in a shadow that reached the edge).
SHADOW_OFFSET, SHADOW_BLUR, SHADOW_OPACITY = 10, 14, 0.30


def main():
    elements = b.concept_off_centre()
    art = b.render(elements)
    tile = b.mask_of(b.squircle(), b.SIZE)
    blur = ImageChops.offset(tile, 0, SHADOW_OFFSET).filter(ImageFilter.GaussianBlur(SHADOW_BLUR))
    shadow = Image.new("RGBA", art.size, (0, 0, 0, 255))
    shadow.putalpha(blur.point(lambda v: int(v * SHADOW_OPACITY)))
    icon = Image.alpha_composite(shadow, art)
    alpha = np.asarray(icon.getchannel("A"))
    edge = max(alpha[:8].max(), alpha[-8:].max(), alpha[:, :8].max(), alpha[:, -8:].max())
    assert edge == 0, f"shadow reaches the canvas edge (alpha {edge})"
    icon.save(PNG)
    SVG.write_text(b.svg(elements, "AxioSozo browser"))
    print(PNG.relative_to(HERE.parents[2]), icon.size)


if __name__ == "__main__":
    main()
