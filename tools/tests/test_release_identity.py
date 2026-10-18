"""Focused regression: public package name is not the registered ZipRunner key."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

class ReleaseIdentityTests(unittest.TestCase):
    def test_real_metadata_keeps_distinct_public_and_registered_identities(self):
        package = json.loads((ROOT / 'package.json').read_text('utf-8'))
        board = json.loads((ROOT / '.ziprunner-workboard-update.json').read_text('utf-8'))
        recipe_path = ROOT / 'project.zr'
        recipe = json.loads(recipe_path.read_text('utf-8')) if recipe_path.exists() else None
        manifest = json.loads((ROOT / 'ziprunner-manifest.json').read_text('utf-8'))
        self.assertEqual('portrait-library', package['name'])
        if recipe is not None:
            self.assertEqual('CharacterBuilder', recipe['project_key'])
        else:
            self.assertTrue((ROOT / 'docs/ZIPRUNNER_RECIPE_CASE_WORKAROUND.md').is_file())
        self.assertEqual('CharacterBuilder', board['project'])
        self.assertEqual('CharacterBuilder', manifest['project']['key'])
        self.assertNotEqual(package['name'], board['project'])
        self.assertEqual(package['version'], board['version'])

    def test_delivery_checker_accepts_independent_public_package_name(self):
        result = subprocess.run([sys.executable, str(ROOT / 'tools/check_delivery.py')],
                                cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)

    def test_delivery_checker_rejects_actual_project_mismatch(self):
        script = (ROOT / 'tools/check_delivery.py').read_text('utf-8')
        self.assertIn('ZipRunner metadata project mismatch', script)
        # Regression guard: never reintroduce equality with the public npm name.
        self.assertNotIn("manifest['project']['key'] == key == package['name']", script)
        self.assertNotIn("manifest['project']['key'] == package['name']", script)

if __name__ == '__main__':
    unittest.main()
