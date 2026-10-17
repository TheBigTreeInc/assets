# Shared Character Engine — ZipRunner handoff

Project key: `portrait-library`. Package version: `3.0.1`. Filename: `portrait-library-3.0.1-ziprunner.zip`.

This source package includes the working portrait engine, 47 unique image assets, permanent numeric IDs and RGB colours, and the new AsciiDoc architecture and contributor specifications. Multi-piece objects, alternate representations, named anchors, standard views and full-body artwork remain explicitly planned work. The current runtime is unchanged.

Register `project.zr` as a separate project with key `portrait-library`. The ZIP has source files at its root. Use Python 3.10+ and Node 22.8+ on PATH. The build gate validates assets, contract references and the JavaScript suite. Start opens a loopback workshop on port 8940; configure another port locally if needed. Stop an earlier managed preview before updating. The recipe does not kill unrelated processes or overwrite local configuration. Installation and manual acceptance have not been executed on the recipient's ZipRunner.

Start reading `docs/CHARACTER_ENGINE_SPEC.adoc`, then `docs/CONTRIBUTOR_SPEC.adoc`. Current API and numeric wire details remain in `docs/PORTRAIT_SPEC.md`. The new machine-readable capability declaration is `engine-capabilities.json`.

Delivered work IDs: CL-SPEC, CL-CI, CL-ZIP. Remaining: CL-REPRESENTATIONS, CL-VIEWS, CL-ACCEPTANCE. The package does not mark tasks approved or close their consumer workboard status. Verification runner IDs are declarations to map to trusted local checks: portrait-delivery-check, portrait-node-tests and portrait-package-check. The package check requires a checked-out copy of the pinned public ZipRunner specification tools.

The GitHub workflow runs on pull requests, pushes to main and manual dispatch. It validates identities against the appropriate Git base and creates the ZIP/checksum artifact with read-only repository permissions. It does not publish a site or GitHub release.

The builder uses the public ZipRunner 2.3.0 validator at commit `341005206094862853435ad68801be7ff28c4490` and requires its functional-verification extension. Fresh producer logs are included under evidence/ in the ZIP. Consumer reports and approval records belong outside the downloaded package. The project-owned package-inventory.json lists every other packaged file and its SHA-256; it is not ZipRunner's reserved self-update inventory.

To reproduce: check out the pinned upstream specification separately, then run `python tools/package_ziprunner.py --validator PATH/TO/ziprunner-spec/tools/validate.py`. The external delivery supplies the exact ZIP link and computed SHA-256.
