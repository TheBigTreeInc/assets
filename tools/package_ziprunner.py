"""Build and independently validate a complete ZipRunner source ZIP without staging artwork copies."""
from pathlib import Path
import argparse, hashlib, json, os, subprocess, sys, zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[1]
TOP = {'AGENTS.md', 'README.md', 'LICENSE', 'package.json', 'engine-capabilities.json',
       'index.html', 'Start Portrait Workshop.cmd', 'project.zr', '.ziprunner-workboard-update.json',
       'ziprunner-manifest.json', 'ziprunner-verification-plan.json', 'ZIPRUNNER_HANDOFF.md', '.gitattributes', '.gitignore'}
DIRECTORIES = {'art', 'portraits', 'clients', 'docs', 'tools', '.github'}
EXCLUDED = {'__pycache__', 'node_modules', '.git', '.godot', '.runtime', 'dist', 'logs', 'state'}

def payloads():
    files = {}
    for child in ROOT.iterdir():
        if child.is_file() and child.name in TOP:
            assert not child.is_symlink()
            files[child.name] = child.read_bytes()
        elif child.is_dir() and child.name in DIRECTORIES:
            for parent, folders, names in os.walk(child, followlinks=False):
                folders[:] = [name for name in folders if name not in EXCLUDED]
                for name in names:
                    path = Path(parent) / name
                    assert not path.is_symlink(), path
                    if path.suffix in {'.pyc', '.pyo'}: continue
                    files[path.relative_to(ROOT).as_posix()] = path.read_bytes()
    assert TOP <= files.keys(), TOP - files.keys()
    return files

def run(command):
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
    output = result.stdout + result.stderr
    print(output, end='')
    if result.returncode: raise RuntimeError('Check failed: ' + str(command))
    return output.encode('utf-8')

def build(output, validator, node):
    if not validator.is_file(): raise ValueError('Supply the pinned upstream tools/validate.py using --validator')
    files = payloads()
    logs = {
        'library': run([sys.executable, 'tools/check_library.py']),
        'delivery': run([sys.executable, 'tools/check_delivery.py']),
        'javascript': run([node, '--test', '--test-isolation=none', *[str(p.relative_to(ROOT)) for p in sorted((ROOT/'clients/javascript/tests').glob('*.test.cjs'))]])
    }
    for key, log in logs.items(): files['evidence/'+key+'.txt'] = log
    manifest = json.loads(files['ziprunner-manifest.json'])
    for check in manifest['validation']['checks']:
        if check['id'] in logs:
            check.update(status='passed', evidence_ref='evidence/'+check['id']+'.txt')
            check.pop('reason', None)
    files['ziprunner-manifest.json'] = (json.dumps(manifest, indent=2)+'\n').encode()
    # This project-owned inventory is distinct from ZipRunner's reserved self-update manifest.
    inventory = {'schema':'portrait-library.package-inventory/v1', 'entries':[
        {'path':name,'size':len(data),'sha256':hashlib.sha256(data).hexdigest()} for name,data in sorted(files.items())]}
    files['package-inventory.json'] = (json.dumps(inventory,indent=2)+'\n').encode()
    version = json.loads(files['package.json'])['version']
    output.mkdir(parents=True, exist_ok=True)
    target = output / f'portrait-library-{version}-ziprunner.zip'
    temporary = output / (target.name+'.pending')
    try:
        with zipfile.ZipFile(temporary,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
            for name,data in sorted(files.items()):
                info=zipfile.ZipInfo(name,date_time=(2026,10,17,0,0,0))
                info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644 << 16
                archive.writestr(info,data)
        with zipfile.ZipFile(temporary) as archive:
            assert archive.testzip() is None
            assert set(archive.namelist()) == set(files)
            for name,data in files.items(): assert archive.read(name)==data
        run([sys.executable,str(validator),'package',str(temporary),'--expected-project','portrait-library','--require-verification-plan'])
        temporary.replace(target)
    finally:
        if temporary.exists(): temporary.unlink()
    digest=hashlib.sha256(target.read_bytes()).hexdigest()
    (output/(target.name+'.sha256')).write_text(digest+'  '+target.name+'\n',encoding='utf-8')
    print(json.dumps({'file':str(target),'project':'portrait-library','version':version,'sha256':digest,'bytes':target.stat().st_size}))
    return target

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'dist')
    parser.add_argument('--validator',type=Path,required=True);parser.add_argument('--node',default='node')
    args=parser.parse_args();build(args.output.resolve(),args.validator.resolve(),args.node)
