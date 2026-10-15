# Portrait Library 2.2.0 — feminine-focused facial options

One combined portrait library, now with nine new independent components:
three adult face shapes, two eye pairs, two noses and two mouths. New parts
have neutral names and optional feminine/illustrated tags, with no gender locks.
All existing hair, clothes and accessories remain freely mixable.

Run Start Portrait Workshop.cmd, or `python tools/serve.py --port 8931 --open`.
Open examples/feminine-gallery.html for six assembled portraits.
Read [the system specification](docs/PORTRAIT_SYSTEM_SPEC.md).
Catalog 5, numeric format 2 schema, exact image-generation prompts, registration
measurements and artist requirements are included. Earlier saves are not imported.

47 source PNGs: 10 heads, 7 eyes, 6 noses, 7 mouths, 7 hairstyles plus Bald,
4 garments, glasses/goggles, respirator, implant, optional beard and scar.
Separate neck/garment/head rendering and independent eye/beard colours remain.
Run npm test for contracts/cache checks; tests/browser.html checks rendering.
This standalone update does not modify Life or the earlier neon-control ZIP.
