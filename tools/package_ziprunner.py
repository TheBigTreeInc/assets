"""Build the registered-project compatibility ZIP and validate its full-spec candidate.

The ZipRunner 1.2.304.125 recipe-proposal reader lowercases CharacterBuilder
and then compares it with the mixed-case registered name. Until the consumer
is fixed, a source archive for that existing installation omits root project.zr.
The canonical recipe stays in Git, and the full candidate is validated first.
"""
from pathlib import Path
import argparse
import hashlib
import json
import os
import subprocess
import sys
import zipfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[1]
TOP = {'AGENTS.md', 'README.md', 'LICENSE', 'package.json', 'engine-capabilities.json',
       'index.html', 'Start Portrait Workshop.cmd', 'project.zr', '.ziprunner-workboard-update.json',
       'ziprunner-manifest.json', 'ziprunner-verification-plan.json', 'ZIPRUNNER_HANDOFF.md',
       '.gitattributes', '.gitignore'}
DIRECTORIES = {'art', 'portraits', 'clients', 'docs', 'tools', '.github'}
EXCLUDED = {'__pycache__', 'node_modules', '.git', '.godot', '.runtime', 'dist', 'logs', 'state'}
PROJECT = 'CharacterBuilder'


def payloads():
    files = {}
    for child in ROOT.iterdir():
        if child.is_file() and child.name in TOP:
            assert not child.is_symlink(), child
            files[child.name] = child.read_bytes()
        elif child.is_dir() and child.name in DIRECTORIES:
            for parent, folders, names in os.walk(child, followlinks=False):
                folders[:] = [name for name in folders if name not in EXCLUDED and not (Path(parent) / name).is_symlink()]
                for name in names:
                    path = Path(parent) / name
                    assert not path.is_symlink(), path
                    if path.suffix in {'.pyc', '.pyo'}:
                        continue
                    files[path.relative_to(ROOT).as_posix()] = path.read_bytes()
    assert TOP <= files.keys(), TOP - files.keys()
    assert not any(name == '.env' or name.startswith('.env.') or name.startswith(('state/', 'logs/', 'dist/', 'secrets/')) or 'ziprunner.config.json' in name for name in files)
    return files


def run(command):
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True,
                            encoding='utf-8', errors='replace')
    output = result.stdout + result.stderr
    print(output, end='')
    if result.returncode:
        raise RuntimeError('Check failed: ' + str(command))
    return output.encode('utf-8')


def inventory(files):
    return (json.dumps({'schema': 'portrait-library.package-inventory/v1', 'entries': [
        {'path': name, 'size': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
        for name, data in sorted(files.items())
    ]}, indent=2) + '\n').encode('utf-8')


def write_archive(destination, original_files):
    files = dict(original_files)
    files['package-inventory.json'] = inventory(files)
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 10, 18, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    with zipfile.ZipFile(destination) as archive:
        assert archive.testzip() is None
        assert set(archive.namelist()) == set(files)
        for name, data in files.items():
            assert archive.read(name) == data, name
    return files


def check_identity(files):
    read = lambda n: json.loads(files[n].decode('utf-8'))
    recipe = read('project.zr')
    board = read('.ziprunner-workboard-update.json')
    manifest = read('ziprunner-manifest.json')
    verification = read('ziprunner-verification-plan.json')
    package = read('package.json')
    assert recipe['project_key'] == board['project'] == manifest['project']['key'] == verification['project'] == PROJECT
    assert board['version'] == manifest['project']['version'] == verification['version'] == package['version']
    assert package['name'] == 'portrait-library'
    assert set(files) >= {'portraits/index.json', 'ZIPRUNNER_HANDOFF.md'}
    return package['version']


def build(output, validator, node, include_recipe=False, skip_upstream_validator=False):
    if not skip_upstream_validator and (validator is None or not validator.is_file()):
        raise ValueError('Provide pinned upstream tools/validate.py or explicitly use --skip-upstream-validator for local preflight only')
    files = payloads()
    version = check_identity(files)
    logs = {
        'library': run([sys.executable, 'tools/check_library.py']),
        'delivery': run([sys.executable, 'tools/check_delivery.py']),
        'javascript': run([node, '--test', *[str(p.relative_to(ROOT)) for p in sorted((ROOT/'clients/javascript/tests').glob('*.test.cjs'))]]),
        'identity-regression': run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tools/tests', '-p', 'test_release_identity.py', '-v']),
    }
    for key, log in logs.items():
        files['evidence/' + key + '.txt'] = log
    manifest = json.loads(files['ziprunner-manifest.json'])
    for check in manifest['validation']['checks']:
        if check['id'] in logs:
            check.update(status='passed', evidence_ref='evidence/' + check['id'] + '.txt')
            check.pop('reason', None)
    files['ziprunner-manifest.json'] = (json.dumps(manifest, indent=2) + '\n').encode('utf-8')
    output.mkdir(parents=True, exist_ok=True)
    target = output / f'portrait-library-{version}-ziprunner.zip'
    candidate = output / (f'portrait-library-{version}-full-spec-candidate.pending')
    temporary = output / (target.name + '.pending')
    try:
        # Validate a complete standards-conformant candidate without shipping it
        # as the operator archive to the affected 1.2.304.125 consumer.
        write_archive(candidate, files)
        if not skip_upstream_validator:
            run([sys.executable, str(validator), 'package', str(candidate),
                 '--expected-project', PROJECT, '--require-verification-plan'])
        else:
            print('NOTE: full-spec upstream validation SKIPPED for this local build; GitHub CI must perform it.')
        recipient_files = dict(files)
        if not include_recipe:
            recipient_files.pop('project.zr')
        write_archive(temporary, recipient_files)
        with zipfile.ZipFile(temporary) as archive:
            member_names = set(archive.namelist())
            assert ('project.zr' in member_names) == include_recipe
            assert '.ziprunner-workboard-update.json' in member_names
            assert json.loads(archive.read('.ziprunner-workboard-update.json'))['project'] == PROJECT
            assert json.loads(archive.read('ziprunner-verification-plan.json'))['version'] == version
        temporary.replace(target)
    finally:
        for extra in [candidate, temporary]:
            if extra.exists():
                extra.unlink()
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    (output / (target.name + '.sha256')).write_text(digest + '  ' + target.name + '\n', encoding='utf-8')
    print(json.dumps({'file': str(target), 'project': PROJECT, 'version': version,
                      'sha256': digest, 'bytes': target.stat().st_size,
                      'recipient_mode': 'full-spec' if include_recipe else 'existing-registration-no-recipe',
                      'upstream_validator': 'skipped' if skip_upstream_validator else 'passed'}))
    return target


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    parser.add_argument('--validator', type=Path)
    parser.add_argument('--node', default='node')
    parser.add_argument('--include-recipe', action='store_true', help='Use only after ZipRunner fixes recipe project normalization')
    parser.add_argument('--skip-upstream-validator', action='store_true', help='Local preflight only; CI must validate pinned specification')
    args = parser.parse_args()
    build(args.output.resolve(), args.validator.resolve() if args.validator else None,
          args.node, args.include_recipe, args.skip_upstream_validator)
