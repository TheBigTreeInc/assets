# ZipRunner project identity and public catalog identity

- **ZipRunner registered project key:** `CharacterBuilder` (case-sensitive; use this key in all ZIP metadata)
- **Git source folder and package name:** `portrait-library`
- **ZIP filename:** `portrait-library-3.0.6-ziprunner.zip` (recipe glob preserved)
- **Public library and artwork:** `portraits/index.json` and `art/*.png` unchanged
- **Deployment:** keep the existing GitHub Pages job; review/push the source and wait for CI.

The registered project key is deliberately independent of the product name. Every ZIP update must keep `.ziprunner-workboard-update.json:project`, `ziprunner-manifest.json:project.key`, and `ziprunner-verification-plan.json:project` equal to `CharacterBuilder`. The canonical Git recipe `project.zr:project_key` also uses this key, but the 3.0.6 registered-project compatibility ZIP intentionally does not carry a root recipe. The build validator must pass `--expected-project CharacterBuilder`. The source `package.json:name` remains `portrait-library`.

**Root cause fixed:** the prior 3.0.3 distribution declared `portrait-library` as its ZipRunner workboard project even though the recipient had selected `CharacterBuilder`, so ZipRunner rejected it before installing the source.

## Installed-recipe compatibility exception (3.0.5–3.0.6)

The recipe remains in Git, but ZipRunner 1.2.304.125 reports the normalized `characterbuilder` when checking the recipe against `CharacterBuilder`. The recipient ZIP therefore omits root `project.zr` to bypass the optional proposal. Import into the existing registration only; see ZIPRUNNER_RECIPE_CASE_WORKAROUND.md.
