# Portrait Library 3.0.8 CI identity repair — CharacterBuilder

**Scope:** Git recovery reissue of 3.0.7 candidate; no additional game features or release approval.

GitHub exact-push SHA `56848d0fc1d521a6bedcf134e52bccd039167b5e` FAILED validate-package, and deploy-pages was skipped. New version 3.0.8 is a proposed operator-reviewed reissue, not CI-verified or published.

- Public package/catalog: `portrait-library`; ZipRunner registered project: `CharacterBuilder`.
- 72 canonical artworks and clothing IDs 12-15 preserved.
- Root recipe omitted from the **recipient** compatibility ZIP because consumer recipe parser mismatched case; canonical `project.zr` remains tracked in Git.
- This recipient ZIP is an overlay into the *existing* `CharacterBuilder` Git checkout. It does not include or overwrite previously pushed `AGENTS.md` and `README.md` engineering docs, or `project.zr`. It is not a standalone bootstrap bundle.
- Two durable local high-priority Suggested tickets are carried forward in `.ziprunner-workboard-update.json` as remaining; their actual statuses and exact acceptance criteria are retained in `docs/QA_CI_GATE_20261019.adoc`; trust ZipRunner's local state.
- No local runtime data, `.env`, private keys, active ziprunner config, or generated build cache included.
- Push, tagging, release, acceptance and Work Board promotion are operator-gated.

Full source builder (on installed Git checkout) uses `python tools/package_ziprunner.py --validator PATH/TO/pinned/tools/validate.py`. Pinned version: `pac-labs/ziprunner-spec@341005206094862853435ad68801be7ff28c4490`.

# Shared Character Engine — ZipRunner handoff

ZipRunner project key: `CharacterBuilder`. Public package/catalog name: `portrait-library`. Package version: `3.0.8`. Filename: `portrait-library-3.0.8-ziprunner.zip`.

This source package includes the working portrait engine, 72 unique image assets, permanent numeric IDs and RGB colours, and the new AsciiDoc architecture and contributor specifications. Multi-piece objects, alternate representations, named anchors, standard views and full-body artwork remain explicitly planned work. This version adds independent optional headwear and neckwear slots and colours; old codes retain zero selections and default colours for these additions.

Use the existing registered ZipRunner project with key `CharacterBuilder` and target folder `portrait-library`; the repository recipe carries that exact key. The 3.0.8 compatibility ZIP has source files at its root but deliberately omits `project.zr` to avoid the recipient recipe-proposal bug. Use Python 3.10+ and Node 22.8+ on PATH. The build gate validates assets, contract references and the JavaScript suite. Start opens a loopback workshop on port 8940; configure another port locally if needed. Stop an earlier managed preview before updating. The recipe does not kill unrelated processes or overwrite local configuration. Installation and manual acceptance have not been executed on the recipient's ZipRunner.

Start reading `docs/CHARACTER_ENGINE_SPEC.adoc`, then `docs/CONTRIBUTOR_SPEC.adoc`. Current API and numeric wire details remain in `docs/PORTRAIT_SPEC.md`. The new machine-readable capability declaration is `engine-capabilities.json`.

Delivered work IDs: CL-SPEC, CL-CI, CL-ZIP, CL-ACCESSORIES, CL-OUTFITS. Remaining: CL-REPRESENTATIONS, CL-VIEWS, CL-ACCEPTANCE. The package does not mark tasks approved or close their consumer workboard status. Verification runner IDs are declarations to map to trusted local checks: portrait-delivery-check, portrait-node-tests and portrait-package-check. The package check requires a checked-out copy of the pinned public ZipRunner specification tools.

The GitHub workflow runs on pull requests, pushes to main and manual dispatch. It validates identities against the appropriate Git base and creates the ZIP/checksum artifact with read-only repository permissions. A separate Pages job publishes the public workshop after validation; it does not publish a GitHub release.

The builder uses the public ZipRunner 2.3.0 validator at commit `341005206094862853435ad68801be7ff28c4490` and requires its functional-verification extension. Fresh producer logs are included under evidence/ in the ZIP. Consumer reports and approval records belong outside the downloaded package. The project-owned package-inventory.json lists every other packaged file and its SHA-256; it is not ZipRunner's reserved self-update inventory.

To reproduce: check out the pinned upstream specification separately, then run `python tools/package_ziprunner.py --validator PATH/TO/ziprunner-spec/tools/validate.py`. The external delivery supplies the exact ZIP link and computed SHA-256.

## Outfit additions (3.0.3, retained in 3.0.4)

New clothing IDs 12–15 (Ranger leather jerkin, Tailored waistcoat, Scholar-mage mantle, Futuristic utility jacket) have exactly one content-addressed PNG each under `art/`, are listed in `portraits/index.json` and participate in the existing clothing colour selection. No old art or permanent ID changes. Confirm appearance with several heads, save/restore codes and tint in the local workshop. Publishing remains by pushing the installed project source to main; GitHub Actions validates before updating Pages.

## ZipRunner job failure correction (3.0.4)

The 3.0.3 archive failed preflight because its workboard project field used `portrait-library` while ZipRunner had selected `CharacterBuilder`. Version 3.0.4 changes all ZipRunner identity and validation fields to `CharacterBuilder` while keeping the public `portrait-library` product identity, source directory, unchanged asset IDs, artwork and GitHub Pages URLs. This archive contains only Git-tracked source files, not local configuration, runtime data, secrets or generated build output. Import it into the existing `CharacterBuilder` job, not a new `portrait-library` registration. After local verification, review and push the installed source via ZipRunner; publication is not automatic until that push passes CI.

## ZipRunner 1.2.304.125 recipe-case workaround (3.0.5)

The 3.0.4 failure `Recipe targets 'characterbuilder', not 'CharacterBuilder'` occurs despite root `project.zr:project_key` containing the exact registered mixed-case value. This is a case-normalization/compare defect in the recipient recipe-proposal path, not a mis-typed recipe. The 3.0.5 ZIP is a **registered-project compatibility package**, omitting `project.zr` from the imported ZIP. Keep the installed project registration, existing recipe/configuration, protected paths and runtime data; do not rename the project. The full recipe remains in Git source and is used by the producer validator in CI. The artifact is not standalone fully conformant to the upstream recipe-required source ZIP contract. See `docs/ZIPRUNNER_RECIPE_CASE_WORKAROUND.md`.

## Git working tree requirement (3.0.8)

The recipient ZipRunner 1.2.304.126 accepted the 3.0.5 workboard and captured a source snapshot, then failed `source_publish_failed` because its configured source publish directory (`C:\Users\dorbi\source\portrait-library`) is not a Git working tree. This is a recipient-local prerequisite, not an archive defect. The 3.0.8 ZIP is a versioned reissue containing the same art and code, with package/version metadata advanced to 3.0.8. It keeps the recipe-free compatibility approach and does **not** disable the clean-Git overlay guard.

Before rerun, open **Edit project > Git source publish** and select a valid existing local Git working tree for `https://github.com/TheBigTreeInc/assets`, or safely initialize and attach the current folder after reviewing its contents and reconciling any differences. Do not delete, reset --hard, overwrite working files or add private runtime state just to satisfy the guard. Review `git status` before rerunning the archive. Import is still subject to operator approval, CI checks and separate GitHub Pages deployment.
