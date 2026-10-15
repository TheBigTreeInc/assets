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
assert len(catalog['packs'])==1 and catalog['packs'][0]['id']=='portraits'
pin=json.loads((ROOT/'clients/javascript/integrations/trusted-release.json').read_text(encoding='utf-8'))
assert all(pin[k]==catalog['packs'][0][k] for k in ['id','version','sha256'])
numeric=json.loads((ROOT/'numeric-catalogs/2/catalog.json').read_text(encoding='utf-8'))
assert numeric['library']==2 and numeric['schema']=='portrait-library.catalog/v2'
assert numeric==json.loads((ROOT/'clients/javascript/catalogs/library-2.json').read_text(encoding='utf-8'))
assert numeric==json.loads((release.parent/'numeric-catalog.json').read_text(encoding='utf-8'))
for category,ids in numeric['parts'].items():
 assert set(ids)=={o['id'] for o in pack['slots'][category]['options']}
 assert len(ids)==len(set(ids.values()))
assert (ROOT/'.gitattributes').read_text().strip()=='* -text'
assert not list((ROOT/'releases').rglob('*syndicate*'))
print(f'PASS: one neutral pack, {count} file hashes, trusted pin, numeric catalog and Git byte preservation.')
