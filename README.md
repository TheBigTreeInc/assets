# Shared game assets — Portrait Library 3.0.0

One library of 47 modular images, with one metadata descriptor per item. One decimal portrait value stores permanent part IDs and exact colours. Everyday, fantasy, feminine and cyberpunk parts can be freely mixed.

Start `Start Portrait Workshop.cmd`, or run `python tools/serve.py --open`. The standalone workshop is `index.html`. The JavaScript integration example and formal contract are in [docs/PORTRAIT_SPEC.md](docs/PORTRAIT_SPEC.md). Serve over localhost/HTTPS; opening HTML as a `file:` URL cannot fetch the assets.

`art/` is the only artwork directory. `portraits/items/` is the only source of item descriptions. `portraits/index.json` defines category/colour IDs and lists descriptor paths. Clients compile their drawing structure in memory, so there is no duplicate persisted catalog or bundled artwork in clients.

Never reassign an existing ID or materially change its art/registration. Add new IDs, retire old choices while preserving their files, and change metadata names/tags/order freely. Save numeric portrait values as decimal **text**, not JavaScript Number. The encoding version is independent of releases and item additions.

Validation: `python tools/check_library.py`; `node --test --test-isolation=none clients/javascript/tests/*.test.cjs`; browser suite at `/clients/javascript/tests/browser.html`. For additions to this repository also run `python tools/check_library.py --against HEAD` to check permanent identities.

The old release directories and client art copies are removed from the active repository; Git history keeps earlier releases. Existing Neon Control game archives have not been rebuilt by this shared-library update.
