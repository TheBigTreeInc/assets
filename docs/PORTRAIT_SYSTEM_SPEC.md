# Portrait library 2.1.0 — system specification

One library, one pack: `portraits` 2.1.0. No everyday/cyberpunk collections,
compatibility aliases, old save imports or migration code are provided.

## Categories, types and optional tags

| Key | Category number | Contents |
| --- | --- | --- |
| face | 1 | 7 heads |
| eyes | 2 | 5 eye pairs, with brows |
| nose | 3 | 4 noses |
| mouth | 4 | 5 mouths |
| hair | 5 | 7 hairstyles and Bald |
| clothing | 6 | T-shirt, collared shirt, high-collar jacket, travel tunic |
| eyewear | 7 | None, round glasses, goggles |
| faceCovering | 8 | None, respirator |
| augmentation | 9 | None, eye implant |
| facialHair | 10 | None, short full beard |
| scars | 11 | None, healed cheek scar |

Every option has a neutral name, a type, and optional tags. Hair is a category;
all hairstyles have type `hairstyle`. Eyewear is a category with types `glasses`
and `goggles`. Clothing types are `t-shirt`, `shirt`, `jacket`. Optional tags
`illustrated` and `pixel` describe rendering style, not game ownership.
The new parts also carry `fantasy` as an optional theme tag.
No option is owned by a genre or another pack. All combinations are allowed.
None/Bald is 0; real parts are 1–N within their own category. Duplicate no-part
entries are merged. Part numbers are explicit catalog entries, never list indices.
There are no Face-default feature options: every face has independent eyes,
nose and mouth. The 38 transparent source PNGs are bundled exactly once.

## Portable appearance

The saved object has exactly `format:2`, `library:3`, `parts`, `colors`.
All leaf values are integers. Parts requires all eleven category keys above.
Colours requires skin, hair, hairAccent, clothing, accessory, iris, facialHair. RGB is
packed 0xRRGGBB, 0–16777215. Iris changes only the iris mask; accessory colour
is shared by eyewear, face coverings and augmentations.

Validate `schemas/appearance-v2.schema.json` AND `catalogs/library-3.json`.
Reject missing/extra fields, unknown IDs, formats or libraries, fractions,
booleans and invalid RGB values. Appearance never includes names, stats, jobs,
URLs or asset paths. Format 1 saves are intentionally rejected.
Catalog 3 and released pack 2.1.0 are immutable once published. Future additions
receive a new library ID and art version. No migration promise is made. Library 2 saves are rejected by this release.

## JavaScript

Load src/portrait-kit.js, src/numeric-portrait.js, then src/portrait-wizard.js.
The low-level renderer uses an internal selection object. Games save only the
numeric appearance returned by System; there is no old-save conversion API.

```js
const system = await NumericPortraits.System.load('packs/portraits/pack.json', {
  catalogURL:'catalogs/library-3.json',
  backgroundProvider:({context}) => jobBackgrounds[context.jobId] || '#e7ecdf'
});
const appearance = system.defaultAppearance();
appearance.parts.hair = 2;
appearance.parts.eyewear = 1;
appearance.colors.iris = NumericPortraits.rgb('#4488aa');
const png = system.toDataURL(appearance,{size:256,context:{jobId:101}});
const saved = NumericPortraits.serialize(system.catalog,appearance);
const restored = NumericPortraits.deserialize(system.catalog,saved);
const wizard = PortraitWizard.mount(container,system,restored,{
  onChange: value => system.render(value,{canvas,size:256})
});
```

system.choices('hair') returns every hairstyle plus Bald.
system.choices('eyewear',{type:'glasses'}) returns glasses.
system.choices('hair',{tags:['fantasy']}) optionally filters medieval fantasy hairstyles.
Choices include numeric id, label, type, tags and hasAsset. Optional wizard
allowedOptions uses numeric IDs, e.g. `{clothing:[1,2]}`. Filtering belongs
to game UI; it does not remove parts from the pack or enforce game rules.
Wizard tabs: Face, Hair, Details, Clothing, Review. Colours are beside their
part, with Undo, per-tab reset and randomization. None/Bald hides unused colours. Facial hair has an independent facialHair colour;
its highlights share hairAccent. Scars tint with skin and use layer.opacity .65.
Optional layer.opacity is a finite number 0–1 and must be applied during compositing.
Scars render above the face, then facial hair, then covering/accessory/hair layers.

Backgrounds belong to each game. Store jobId beside appearance in your character
record. The synchronous backgroundProvider receives context and an appearance
copy, returning a six-digit hex colour, preloaded image/canvas, or null. Images
cover the canvas. Explicit render background overrides the callback. Jobs and
backdrops never enter the appearance. Matching full pictures require the same
game backdrop/context as well as the pinned library.
See examples/game-profile.html for working code, including job changes/save/load.

## Downloading the single pack

catalog.json at TheBigTreeInc/assets lists `portraits` 2.1.0 and its trusted hash.
src/asset-library.js verifies hashes and caches files for offline use. Example:

```js
const renderer = await GameAssetLibrary.loadRenderer(assetBaseURL, trustedPin, {
  fallbackURL:'packs/portraits/pack.json'
});
const system = new NumericPortraits.System(renderer, bundledCatalog);
```

Pin release id, version, SHA-256 and the numeric catalog with your game; do not
trust URLs or release hashes supplied by appearance files. Old releases may
remain archived in the repository but are not listed or used by this system.

## Artwork delivery and new parts

Deliver full-canvas 1254×1254 transparent 8-bit RGBA PNGs. Never crop a part to
its visible bounds. Maintain the front portrait rig, pose, proportions and
registration: normalized scalp top .21, eyes .51, chin .82. Actual per-part
scale/offset and per-style render settings in pack.json are authoritative.
Provide an editable layered source, visible variant/contact sheet, and clearly
named component/mask exports. Test every new part on every head in that style.

Heads are blank foundations without fixed eyes/nose/mouth. Eyes include brows;
no independent eyebrow selection currently exists. Eye whites/skin must use
the current masks; iris uses authored chroma and the chromaColor/threshold
settings. Nose and mouth skin regions respond to the skin colour. Hair needs
primary/highlight masks. Garments must overlap the neck cleanly and preserve
the existing frontFromY collar layering. No background should be baked into
any component. Inspect all 512/128/64 previews before accepting art.

Add the new neutral option ID, label, type and tags to a new pack version;
register its art, scale/offset, layer/color masks and explicit numeric ID in
a new library catalog. Update the JSON schema and provenance, then validate
combinations and save/render round trips. Do not append to a released catalog.

## Native integration

clients/godot provides the numeric codec, verified single-pack download client
and example-game-bindings.json. The example binding table demonstrates how to
map all eleven portable categories to a game's own component identifiers.
The codec requires exact RGB including facialHair; clothing maps to native
portrait_rgb.outfit in this example. Your game's renderer must implement both
facialHair and scars in the documented layer order and support opacity.
The downloader load_pack(baseURL,trustedPin,fallbackRoot) returns verified
root/pack/catalog metadata or a bundled pack fallback. Bundle the numeric catalog
separately for fallback. This is a data client and codec, not a native renderer.
The previously delivered neon-control 0.7.87 game has not been integrated with
this library. No game-specific integration changes are part of this release.

Tattoos, independent brows and expressions are not included.

## Medieval fantasy artwork

Eight independently generated transparent components were created with built-in
ImageGen: long waves, braided crown, tied-back hair, watchful eyes, gentle smile,
short full beard, healed cheek scar and travel tunic. Exact generation prompts
are in ASSET_PROMPTS.json; hashes and provenance are in ASSET_PROVENANCE.json.
New layers stay optional, with None 0. The released 2.0.0 files remain immutable.
See examples/fantasy-gallery.html for six assembled portraits.

