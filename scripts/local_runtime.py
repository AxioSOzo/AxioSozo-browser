"""Read a private product-local native build-root selection; never rebuild or relabel stamps."""
import json,os
from pathlib import Path
import storage
p=Path(__file__).resolve().parents[1]/'.local/runtime.json'
if p.is_symlink() or not p.is_file() or p.stat().st_uid != os.getuid() or p.stat().st_mode & 0o077:
    raise SystemExit('Refusing non-private local browser runtime selection')
v=json.loads(p.read_text())['build_root']
print(storage.build_root(v))
