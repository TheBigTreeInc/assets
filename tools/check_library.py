"""Validate canonical artwork and permanent identities; no duplicate identity ledger."""
from pathlib import Path
import argparse, hashlib, json, re, struct, subprocess

ROOT=Path(__file__).resolve().parents[1]
def read(path): return json.loads(path.read_text(encoding='utf-8'))
def require(condition,message):
    if not condition: raise ValueError(message)
def git_json(ref,path,optional=False):
    result=subprocess.run(['git','show',f'{ref}:{path}'],cwd=ROOT,capture_output=True)
    if result.returncode:
        if optional: return None
        raise ValueError(f'Missing baseline file: {path}')
    return json.loads(result.stdout.decode('utf-8'))
def run(against=None):
    index=read(ROOT/'portraits/index.json'); require(index['schema']=='portraits.registry/v1','Registry schema')
    categories=index['categories'];colors=index['colors'];items={};files=set();ids=set();keys=set()
    for c in categories:
        require(type(c['id']) is int and 0<c['id']<=65535 and c['id'] not in ids,'Category ID');ids.add(c['id'])
        require(re.fullmatch(r'[A-Za-z][A-Za-z0-9]*',c['key']) and c['key'] not in keys,'Category key');keys.add(c['key'])
        seen=set()
        for p in c['items']:
            require(re.fullmatch(r'items/'+c['key']+r'/[0-9]{8,10}\.json',p),'Unsafe item path')
            item=read(ROOT/'portraits'/p);id=item['id']
            require(type(id) is int and 0<id<=0xffffffff and id not in seen and item['category']==c['key'],'Item identity');seen.add(id)
            require(p==f'items/{c["key"]}/{id:08}.json','Item filename differs from ID')
            r=item['render'];require(r['profile'] in index['renderProfiles'],'Unknown profile')
            for file in [r['image']]+([r['neckAsset']] if r.get('neckAsset') else []):
                require(re.fullmatch(r'art/[a-f0-9]{64}\.png',file),'Unsafe artwork path');files.add(file)
            for prop in ('scale','offset'):
                if prop in r: require(len(r[prop])==2 and all(type(n) in (int,float) for n in r[prop]),'Registration')
            items['portraits/'+p]=item
        require(c['default'] in seen or (c['default']==0 and c['nullable']),'Missing default')
    ids=set();keys=set()
    for c in colors:
        require(type(c['id']) is int and 0<c['id']<=65535 and c['id'] not in ids and c['key'] not in keys,'Colour identity');ids.add(c['id']);keys.add(c['key'])
        require(re.fullmatch(r'#[0-9a-fA-F]{6}',c['default']),'RGB default')
    require(len(categories)<=255 and len(colors)<=255,'Too many fields')
    descriptors={p.relative_to(ROOT).as_posix() for p in (ROOT/'portraits/items').rglob('*.json')}
    require(descriptors==set(items),'Unlisted or missing item descriptor')
    # Generated deployment output is not a second source artwork store.
    actual={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*.png')
            if p.relative_to(ROOT).parts[0] not in {'.git', 'dist', '_ziprunner-spec'}}
    require(actual==files,'Artwork must appear once, only in art/, and all artwork must be referenced')
    hashes=set();size=0
    for file in files:
        data=(ROOT/file).read_bytes();sha=hashlib.sha256(data).hexdigest();size+=len(data)
        require(sha==Path(file).stem and sha not in hashes,'Artwork hash mismatch or duplicate');hashes.add(sha)
        require(data[:8]==b'\x89PNG\r\n\x1a\n' and list(struct.unpack('>II',data[16:24]))==index['canvas'] and data[25]==6,'Expected same-canvas RGBA PNG')
    if against:
        subprocess.run(['git','rev-parse','--verify',against],cwd=ROOT,check=True,capture_output=True)
        old=git_json(against,'portraits/index.json',optional=True)
        if old:
            for key in ('schema','id','canvas','rig','logicalSize','shadeSteps','pixelated','layers'):
                require(old[key]==index[key],f'Existing rendering contract changed: {key}')
            for name,profile in old['renderProfiles'].items(): require(index['renderProfiles'].get(name)==profile,f'Existing profile changed: {name}')
            for oldc in old['categories']:
                new=next((c for c in categories if c['id']==oldc['id']),None)
                require(new and all(new[k]==oldc[k] for k in ('id','key','nullable')),'Existing category changed')
                for p in oldc['items']:
                    file='portraits/'+p;prior=git_json(against,file);current=items.get(file)
                    require(current and all(current[k]==prior[k] for k in ('id','category','render')),f'Existing item changed or removed: {file}')
            old_ids={c['id'] for c in old['categories']}
            for c in categories:
                if c['id'] not in old_ids: require(c['nullable'] and c['default']==0,'New category must be optional with default zero')
            for oldc in old['colors']:
                new=next((c for c in colors if c['id']==oldc['id']),None)
                require(new and all(new[k]==oldc[k] for k in ('id','key','required','default')),'Existing colour identity/default changed')
            for c in colors:
                if c['id'] not in {c['id'] for c in old['colors']}: require(not c['required'],'New colour must be optional')
        else: print('Baseline predates canonical layout; identity comparison starts with this migration.')
    print(f'PASS: {len(items)} item descriptors, {len(files)} unique RGBA PNGs, {size:,} artwork bytes; no client/release artwork copies.')
    return {'items':len(items),'images':len(files),'artworkBytes':size}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--against',help='Compare permanent identities with a Git ref, e.g. HEAD');args=parser.parse_args()
    try: run(args.against)
    except (ValueError,KeyError,FileNotFoundError,subprocess.CalledProcessError) as error: raise SystemExit(f'FAIL: {error}')
