# Portrait library 2.2.0 — system specification

One library, one pack: `portraits` 2.2.0. No everyday/cyberpunk collections,
compatibility aliases, old save imports or migration code are provided.

## Categories, types and optional tags

| Key | Category number | Contents |
| --- | --- | --- |
| face | 1 | 10 heads |
| eyes | 2 | 7 eye pairs, with brows |
| nose | 3 | 6 noses |
| mouth | 4 | 7 mouths |
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
nose and mouth. The 47 transparent source PNGs are bundled exactly once.

## Portable appearance

The saved object has exactly `format:2`, `library:5`, `parts`, `colors`.
All leaf values are integers. Parts requires all eleven category keys above.
Colours requires skin, hair, hairAccent, clothing, accessory, iris, facialHair. RGB is
packed 0xRRGGBB, 0–16777215. Iris changes only the iris mask; accessory colour
is shared by eyewear, face coverings and augmentations.

Validate `schemas/appearance-v2.schema.json` AND `catalogs/library-5.json`.
Reject missing/extra fields, unknown IDs, formats or libraries, fractions,
booleans and invalid RGB values. Appearance never includes names, stats, jobs,
URLs or asset paths. Format 1 saves are intentionally rejected.
Catalog 5 and released pack 2.2.0 are immutable once published. Future additions
receive a new library ID and art version. No migration promise is made. Earlier library saves are rejected by this release.

## JavaScript

Load src/portrait-kit.js, src/numeric-portrait.js, then src/portrait-wizard.js.
The low-level renderer uses an internal selection object. Games save only the
numeric appearance returned by System; there is no old-save conversion API.

```js
const system = await NumericPortraits.System.load('packs/portraits/pack.json', {
  catalogURL:'catalogs/library-5.json',
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

catalog.json at TheBigTreeInc/assets lists `portraits` 2.2.0 and its trusted hash.
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
primary/highlight masks. Garments must overlap the neck cleanly using the anatomy planes described below.
The old frontFromY/frontSlope triangular overlap masks are removed. No background should be baked into
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
New layers stay optional, with None 0. Earlier released files remain immutable.
See examples/fantasy-gallery.html for six assembled portraits.


## Head, neck and garment separation (2.2.0)

Required drawing order: face anatomy=neck, clothing, face anatomy=head,
then eyes/nose/mouth, scars, facialHair, covering/accessory layers and hair.
The neck is intrinsic to the selected face and skin colour, not a user choice.
Clothing transparency defines the real neckline; never draw a skin patch into
a shirt. Garments cover the neck; the jaw/head stays above collars.

Each face defines jawBoundary as an ascending-x array of normalized [x,y]
coordinates following its jawline. Values must be finite in [0,1]. The renderer
transforms this boundary with the face scale/offset and clips complementary
head/neck drawing regions. Anatomy is a layer property: head or neck, only on
the face slot. Optional neckAsset names a separate registered full-canvas PNG;
otherwise the existing full head/neck texture supplies both drawing regions.
Existing source PNGs are unchanged: separation happens during rendering.

Preferred artist delivery: separate head and bare-neck RGBA PNGs on the same
1254x1254 padded canvas, matching pose, anatomy, shading and registration.
Head ends at the jaw. Neck begins beneath it with enough overlap to avoid a
seam. Provide a jawBoundary for that head. Bare neck contains no collar,
clothes or background. neckAsset shares the face's scale/offset/render settings
and skin colour. Supply each garment with a genuinely transparent neck opening
and no baked-in neck/skin. Verify all garments on all head shapes.

Native game renderers must implement this order and complementary clipping too;
the codec alone cannot change an existing renderer. See examples/collar-gallery.html
for the shipped fit preview. No new bitmap artwork was needed for this update.

## Feminine-focused facial options (2.2.0)

Nine independently authored components add three adult face foundations
(Gentle oval, Heart-shaped, Mature contours), two eye pairs (Soft almond,
Open rounded), two noses (Fine bridge, Rounded tip) and two mouths
(Soft smile, Defined bow). Tags are illustrated/feminine, with neutral names.
These tags support optional filtering; no gender locks restrict combinations.
All existing hair, clothing, scars, beards, glasses and implants remain available.

Each foundation stays featureless, and its neck matches the head/garment layering.
New head scale/offset is calibrated from scalp and chin landmarks. Eyes are
registered by iris centers to x=.40/.60, y=.50; nose and mouth are independently
registered. Artwork stays on its complete padded source canvas without cropping.
REGISTRATION_CHECKS.json records measured landmarks and transforms.
ASSET_PROMPTS.json contains the exact built-in ImageGen prompts for this batch
and the preceding fantasy batch. ASSET_PROVENANCE.json records all 47 PNG hashes.
See examples/feminine-gallery.html for six assembled portraits, including mixing
with casual and fantasy clothing. Catalog 5/schema retain format 2, eleven
categories and seven RGB colours. Earlier catalogs/releases are not modified.
