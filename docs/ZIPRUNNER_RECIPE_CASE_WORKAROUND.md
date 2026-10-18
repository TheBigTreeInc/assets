# ZipRunner 1.2.304.125: mixed-case recipe identity workaround

## Observed failure

- Selected project: `CharacterBuilder`, source folder `portrait-library`.
- Workboard update for 3.0.4 validated successfully.
- `recipe_proposals.extract_proposal()` rejected the recipe: `Recipe targets 'characterbuilder', not 'CharacterBuilder'`.
- The source ZIP's `project.zr` already specified `"project_key": "CharacterBuilder"` exactly.

The observed claim in the error is lowercased, indicating the recipient's recipe-loading path normalizes the recipe key and later compares it case-sensitively to the registered project key. We have not inspected the private recipient implementation; the precise normalization point requires confirming in the ZipRunner source. Do not mutate the existing registry or project UUID to compensate.

## Delivery workaround

`portrait-library-3.0.5-ziprunner.zip` and its 3.0.6 successor are **existing-registration compatibility ZIP**. It retains workboard, manifest, verification plan, source, artwork, tests and Pages publishing support, but omits root `project.zr`. That prevents a new recipe proposal on this consumer. It must be imported into the existing `CharacterBuilder` project with a working registered recipe; no new project is created. All runtime config, secrets, local state and generated files remain consumer-owned. Recipe acceptance and build success must be tested by the operator.

The canonical `project.zr` remains in the Git source for standards-based packaging and future clients. The build script runs a normal full-candidate validator first when the pinned upstream tool is available; the resulting compatibility archive is **not** fully standalone source-package conformant because upstream specification requires `project.zr`. This exception is deliberate, labeled and temporary.

## Correct consumer-side fix

In ZipRunner's `ziprunner_app/recipe_proposals.py`, compare validated canonical keys consistently. A narrowly scoped comparison could be `claimed_key.casefold() != project_key.casefold()` if project keys are explicitly case-insensitive and there is no conflicting registered project differing by case. Prefer the project's central canonical-ID/registry resolution for comparison rather than inferring identity from case alone. Preserve UUID-based project identity. Once the consumer fix is deployed and tested, distribute the full-conformance ZIP with root `project.zr` again.

## Required regression tests

1. Parse a recipe declaring `CharacterBuilder` and install it into registered `CharacterBuilder`; no mismatch.
2. Reject recipes for other projects (`OtherProject`), and keep canonical UUID check enforced.
3. Validate workboard and manifest for `CharacterBuilder`; do not alter their case or package name.
4. Confirm compatibility ZIP has no `project.zr`, imports into an existing project, and never changes local state or secrets.
5. Run canonical library and JavaScript tests; visually inspect outfits 12-15; push source only after operator approval.

## 3.0.6 Git source-publish prerequisite

The 3.0.5 job advanced past the workboard and recipe-case gate. ZipRunner 1.2.304.126 then stopped before source overlay because the local publishing folder was not a Git worktree. A version bump cannot fix a missing `.git` directory or Git source path configuration. The user must select an existing Git repository in ZipRunner or safely attach the current source folder, reconcile its working-tree changes, and rerun the update. The 3.0.6 compatibility ZIP deliberately leaves both the case workaround and the source publish guard intact.
