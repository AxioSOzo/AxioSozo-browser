#!/usr/bin/env python3
"""Generate the browser branding icon set from the rendered 1024 px app icon.

Uses only macOS system tools (sips, iconutil). Writes apps/browser/branding/,
which scripts/zen.py copies over the generated axiosozo-dev branding folder.
"""
import base64
from pathlib import Path
import shutil
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = HERE / "axiosozo-browser-icon-v1-1024.png"
DESTINATION = ROOT / "apps/browser/branding"
CANVAS = 1024
# The render places the 824 px tile at the canvas centre. Keep a 4 px margin for
# antialiasing when making full-bleed images (window icons, About logo).
TILE_CROP = 832


def sips(*args):
    subprocess.run(["/usr/bin/sips", *map(str, args)], check=True, capture_output=True)


def resized(source, size, target):
    shutil.copyfile(source, target)
    sips("-z", size, size, target)
    return target


def main():
    size = subprocess.run(["/usr/bin/sips", "-g", "pixelWidth", "-g", "pixelHeight", SOURCE],
                          check=True, capture_output=True, text=True).stdout.split()
    assert size[-3:] == [str(CANVAS), "pixelHeight:", str(CANVAS)], size
    content = DESTINATION / "content"
    content.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="axiosozo-icons-", dir=ROOT / ".local") as temporary:
        work = Path(temporary)
        tile = work / "tile.png"
        shutil.copyfile(SOURCE, tile)
        offset = (CANVAS - TILE_CROP) // 2
        sips("-c", TILE_CROP, TILE_CROP, "--cropOffset", offset, offset, tile)

        # macOS app icon keeps Apple's grid padding, so crop nothing.
        iconset = work / "firefox.iconset"
        iconset.mkdir()
        for points in (16, 32, 128, 256, 512):
            resized(SOURCE, points, iconset / f"icon_{points}x{points}.png")
            resized(SOURCE, points * 2, iconset / f"icon_{points}x{points}@2x.png")
        subprocess.run(["/usr/bin/iconutil", "-c", "icns", iconset, "-o", DESTINATION / "firefox.icns"],
                       check=True)

        for pixels in (16, 22, 24, 32, 48, 64, 128, 256):
            resized(tile, pixels, DESTINATION / f"default{pixels}.png")
        resized(tile, 192, content / "about-logo.png")
        resized(tile, 384, content / "about-logo@2x.png")
        logo = base64.b64encode(resized(tile, 256, work / "logo256.png").read_bytes()).decode()
    (content / "about-logo.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        'width="512" height="512" viewBox="0 0 512 512"><title>AxioSozo browser</title>'
        f'<image width="512" height="512" xlink:href="data:image/png;base64,{logo}"/></svg>\n')
    # Same text and proportions as the AxioSozo v3 wordmark, filled by the About dialog.
    (content / "about-wordmark.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 372 99" role="img">'
        '<title>AXIOSOZO</title><text x="186" y="66" fill="context-fill" '
        'font-family="Arial, Helvetica, sans-serif" font-size="47" letter-spacing="2" '
        'text-anchor="middle" textLength="322" lengthAdjust="spacing">AXIOSOZO</text></svg>\n')
    for path in sorted(DESTINATION.rglob("*")):
        if path.is_file() and not path.name.startswith("._"):
            print(path.relative_to(ROOT), path.stat().st_size)


if __name__ == "__main__":
    main()
