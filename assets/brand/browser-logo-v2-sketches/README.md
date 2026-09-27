# AxioSozo browser — logo v2 sketches

Flat, first-round sketches for a new browser icon. They replace nothing yet;
[browser-logo-v1](../browser-logo-v1/README.md) is still the shipped icon.

All sketches keep the parent AxioSozo A and use its three brand colours: ink
`#1C1A16`, vermilion `#C73E1D` and cream `#F0E9D7`. Vermilion has one job per
sketch.

| Sketch | Idea |
| --- | --- |
| **A1 Path** | The cut between crown and legs is filled in vermilion. |
| **A2 Thread** | One vermilion line runs inside that cut. |
| **A3 Compounding** | A redraw: the cut becomes an exponential curve rising to the right. |
| **B1 Keystone** | The crown is vermilion and slightly lifted, held up by the legs. |
| **B2 Keystone, dark** | The same without the lift, on an ink tile. |
| **C1 Doorway** | The arch between the legs is vermilion: a door in the A. |
| **C2 Window** | The A rises out of a window pane. |

Round 2 combines the favourites: Path, Keystone and Window.

| Sketch | Idea |
| --- | --- |
| **R2-1 Path, edge to edge** | The vermilion cut crosses the whole tile. |
| **R2-2 Horizon** | Path + Window: the cut is a horizon, with ink sky and cream ground. |
| **R2-3 Horizon, keystone** | A vermilion crown in the sky, the legs on the ground. |
| **R2-4 Keystone, close crop** | The A fills the tile and runs off the edges. |
| **R2-5/6/7 … lit** | Keystone, Horizon and Path with top light and soft shadows. |
| **R2-8 Path, J-curve** | The cut dips through the A and climbs out on the right. |

Round 3 goes wide: twelve ideas that differ in shape, crop, colour and story —
Summit, Off-centre, Vermilion tile, Sunrise, Seal, Tab, Two engines, Strata,
Monolith, Line, Glass and Bookmark. `sheet-r3.png` gives each one's story.

**Chosen (2026-09-27):** *Off-centre* is now the browser app icon; see
[browser-logo-v2](../browser-logo-v2/README.md). **Kept for later:** *Tab*,
*Monolith* and *Glass*, as options for future icon changes.

Direction A treats the cut as the browser's signature. B reads the crown as the
value that the work holds up (*sozo*: kept whole). C uses the A's negative space
as an opening.

Note on A: the parent's cut is flat on the left and sweeps *down* to the right,
so it doesn't read as a growth curve. A3 shows what a rising curve looks like,
but that changes the parent letterform.

## Files

- `sheet-a.png`, `sheet-b.png`, `sheet-c.png` — each sketch at 420 px and at
  128/64/32/16 px on light and dark backgrounds, plus the 16 px render enlarged 6×.
- `sheet-all.png` — round 1 after v1.
- `sheet-r2.png` — round 2, same layout.
- `sheet-r3.png` — round 3 as a contact sheet, with 64/32/16 px under each idea.
- `sheet-dock.png`, `sheet-dock-r2.png`, `sheet-dock-r3.png` — each sketch in a
  Dock next to Zen, Chrome, Safari and Cursor. Round 2 is shown with the three
  favourites of round 1, round 3 with Keystone, close crop.
- `<sketch>.svg`, `<sketch>-1024.png` — the icon on the 1024 px macOS canvas
  (824 px squircle tile, superellipse exponent 5), without an outer shadow.
- `geometry.py` — the A redrawn as vectors, fitted to the parent symbol PNG.
- `fit-diff.png` — redraw against the source. Red is in the source only, blue is
  in the redraw only. The overlap (intersection over union) is 98.7%.
- `build_sketches.py` — renders everything above.

## Rebuild

```sh
/Users/wout/.local/bin/mount-dev-storage
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- \
  python3 assets/brand/browser-logo-v2-sketches/build_sketches.py
python3 assets/brand/browser-logo-v2-sketches/geometry.py   # fit report
```

The Dock sheet reads icons of apps installed in `/Applications` and caches them in
`/Volumes/AxioSozoBuild/brand-sketches/app-icons`. They are not stored in this
repository.
