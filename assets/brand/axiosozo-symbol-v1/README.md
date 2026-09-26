# AxioSozo — 3D symbol (borrowed)

This is the main AxioSozo 3D symbol, copied from the AxioSozo website repository
(`assets/brand/3d/composition-v1`, Blender 5.2.1 LTS build). Here it serves as the
source mark for the [browser logo](../browser-logo-v1/README.md). Change the master
in the AxioSozo repository first, then copy it back here.

The GLB is byte-identical to the original. `create_asset.py` differs by one line:
it reads the source PNG from this folder (`source-01-selected-symbol.png`, which is
`public/Logos/concepts-v6/01-selected-symbol.png` in the AxioSozo repository).
`validation.json` is the original build record, so its `source` still shows the
AxioSozo path.

## Files

- `axiosozo-symbol-v1.blend` — editable Blender scene with three logo parts, a
  graphite material, studio lighting and two cameras.
- `axiosozo-symbol-v1.glb` — glTF binary with only the logo geometry and material.
- `axiosozo-symbol-v1-preview.png` — three-quarter studio render on cream.
- `axiosozo-symbol-v1-front.png` — front orthographic render on a transparent background.
- `create_asset.py` — Blender script that rebuilds the symbol.
- `validation.json` — outline fidelity and mesh checks.

## Geometry

The symbol is the three-part A without the AXIOSOZO wordmark. The PNG alpha
silhouette was traced into three outlines. The outlines match the source symbol
with 99.36% pixel overlap (intersection over union) before the bevel. The logo is
160 mm wide and 14 mm deep, with a 0.65 mm edge bevel. The three meshes are
**Crown**, **Left leg** and **Right leg**, parented to **AxioSozo Symbol**. The
material is satin graphite based on brand ink `#1C1A16`. The front of the mark
faces negative Y in Blender.

## Rebuild

```sh
/Users/wout/.local/bin/mount-dev-storage
python3 scripts/storage.py setup
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- \
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python assets/brand/axiosozo-symbol-v1/create_asset.py
```

Rebuilding overwrites the files in this folder, so they will no longer match the
master copy.
