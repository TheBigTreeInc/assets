"""Validate immutable release pins and every indexed pack file."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
catalog=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
assert catalog['schema']=='game-assets.catalog/v1'
count=0
for entry in catalog['packs']:
 release=(ROOT/entry['release']).resolve();assert release.is_relative_to(ROOT/'releases')
 assert digest(release)==entry['sha256'],str(release)
 data=json.loads(release.read_text(encoding='utf-8'))
 assert data['schema']=='game-assets.release/v1'
 assert data['id']==entry['id'] and data['version']==entry['version']
 assert data['kind']=='portraits'
 for name,index in data['files'].items():
  assert not any(v in name for v in ['..',':','\\','%'])
  path=(release.parent/name).resolve();assert path.is_relative_to(release.parent)
  assert path.stat().st_size==index['size'] and digest(path)==index['sha256'],name
  count+=1
 pack=json.loads((release.parent/'pack.json').read_text(encoding='utf-8'))
 for slot in pack['slots'].values():
  for option in slot['options']:
   if option.get('asset'):assert option['asset'] in data['files']
bindings=json.loads((ROOT/'clients/godot/portrait_asset_sources.json').read_text(encoding='utf-8'))
assert {(p['id'],p['version'],p['sha256']) for p in bindings['packs']}=={(p['id'],p['version'],p['sha256']) for p in catalog['packs']}
assert (ROOT/'.gitattributes').read_text().strip()=='* -text'
assert not list((ROOT/'releases').rglob('*syndicate*'))
print(f'PASS: {len(catalog["packs"])} immutable packs, {count} file hashes, Godot pins and Git byte preservation.')
