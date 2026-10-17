"""Check release identity, documentation links and task/test references without running metadata."""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
def read(name):
    return json.loads((ROOT / name).read_text(encoding='utf-8'))

def check():
    package = read('package.json')
    capabilities = read('engine-capabilities.json')
    recipe = read('project.zr')
    board = read('.ziprunner-workboard-update.json')
    manifest = read('ziprunner-manifest.json')
    plan = read('ziprunner-verification-plan.json')
    key, version = package['name'], package['version']
    assert key == 'portrait-library'
    assert board['project'] == plan['project'] == recipe['project_key'] == manifest['project']['key'] == key
    assert board['version'] == plan['version'] == capabilities['engine_version'] == manifest['project']['version'] == version
    assert capabilities['implemented'] and capabilities['specified_not_implemented']
    assert not set(capabilities['implemented']) & set(capabilities['specified_not_implemented'])
    implemented = {item['id'] for item in board['implemented']}
    remaining = {item['id'] for item in board['remaining']}
    assert implemented and not implemented & remaining
    assert implemented == {task['id'] for task in plan['tasks']}
    checks = {item['id']: item for item in plan['checks']}
    assert len(checks) == len(plan['checks'])
    for task in plan['tasks']:
        assert task['criteria']
        for criterion in task['criteria']:
            assert criterion['checks'] and all(key in checks for key in criterion['checks'])
    for item in plan['checks']:
        if item['kind'] == 'automated':
            relative = Path(item['test_ref'])
            assert not relative.is_absolute() and '..' not in relative.parts
            assert (ROOT / relative).is_file() and item['assertions']
        else:
            assert item['instructions']
    for filename in ['CHARACTER_ENGINE_SPEC.adoc', 'CONTRIBUTOR_SPEC.adoc']:
        path = ROOT / 'docs' / filename
        text = path.read_text(encoding='utf-8')
        assert text.startswith('= ') and ':revnumber: 1.0.0' in text
        assert text.count('\n----') % 2 == 0
        for target in re.findall(r'link:([^\[\s]+)\[', text):
            assert (path.parent / target).is_file(), target
    for item in manifest['done_work']:
        for evidence in item['evidence']:
            assert (ROOT / evidence['ref']).is_file(), evidence['ref']
    print('PASS: release identity, AsciiDoc links, capability declarations and task/test references')

if __name__ == '__main__':
    check()
