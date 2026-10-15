# Portrait Library 2.0.0

One combined portrait pack with neutral part names, categories, types and optional
rendering style tags. No compatibility with earlier appearance saves.

Run **Start Portrait Workshop.cmd** or `python tools/serve.py --open`.
The workshop uses the bundled single pack and runs without external services.
If port 8927 is occupied, use `python tools/serve.py --port 8928 --open`.

Read [the full system specification](docs/PORTRAIT_SYSTEM_SPEC.md).
The numeric catalog, exact JSON schema, component artwork rules and working
JavaScript game example are included. Run `npm test` for contract/cache tests;
open tests/browser.html for rendering and guided creator checks.

7 heads; 4 each of eyes/noses/mouths; 4 hairstyles plus Bald; 3 garments;
round glasses and goggles; respirator; eye implant. None choices are deduplicated.
Colours: skin, hair, highlights, clothing, shared accessory, iris.
No fixed-feature compatibility heads are shipped. Every face uses modular anatomy.
The public shared asset catalog lists only portraits 2.0.0.
