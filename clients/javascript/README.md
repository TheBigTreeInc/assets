# Portrait Library 2.1.1 — medieval fantasy additions

One combined portrait pack, now with eight new independently generated parts:
long waves, braided crown, tied-back hair, watchful eyes, gentle smile,
short full beard, healed cheek scar and a linen/leather travel tunic.
The same library retains all everyday and pixel-style options.

Run **Start Portrait Workshop.cmd** or `python tools/serve.py --port 8930 --open`.
Open examples/fantasy-gallery.html for six assembled fantasy portraits.

Read [the system specification](docs/PORTRAIT_SYSTEM_SPEC.md). The numeric
catalog 4, format 2 schema, artwork rules, exact generation prompts and working
JavaScript example are included. Older library saves are not imported.
Facial hair and Scars have separate selectors; beard colour is independent.
Scars tint with skin. Each new component is tagged illustrated/fantasy.

38 source PNGs; 7 heads, 5 eyes, 4 noses, 5 mouths, 7 hairstyles plus Bald,
4 garments, glasses/goggles, respirator, implant, optional beard and scar.
Run npm test for contract/cache checks and tests/browser.html for render checks.
This standalone system does not modify Life or the existing neon-control ZIP.

Neck fix: independent neck, garment and head drawing planes replace triangular
collar masks. See examples/collar-gallery.html and the updated artist rules.
Existing source PNGs are unchanged; optional separate neckAsset PNGs are supported.
