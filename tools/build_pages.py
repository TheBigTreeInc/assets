"""Stage only public runtime files for GitHub Pages; keep repository paths intact."""
from pathlib import Path
import json
from package_ziprunner import ROOT, payloads

destination = ROOT / 'dist' / 'pages'
if destination.exists():
    raise SystemExit('Use a fresh dist/pages directory to avoid publishing stale files.')
public = {
    name: data for name, data in payloads().items()
    if name in {'index.html', 'engine-capabilities.json', 'LICENSE'}
    or name.startswith(('art/', 'portraits/', 'clients/javascript/', 'docs/'))
}
index = json.loads(public['portraits/index.json'])
# All catalog and artwork paths keep their relative location under /assets/.
assert public['index.html'] and index
assert sum(name.startswith('art/') for name in public) > 0
for name, data in public.items():
    target = destination / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
(destination / '.nojekyll').touch()
print(f'PASS: staged {len(public)} public files in {destination}')
