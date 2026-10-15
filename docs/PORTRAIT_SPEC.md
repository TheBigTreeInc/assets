# Portrait system specification

Library client 3.0.0; numeric encoding 1; registry schema `portraits.registry/v1`.
These describe separate things. Updating the client or adding artwork does not change saved portrait values.

## Identity

A portrait chooses a permanent numeric item ID in each category, plus numeric RGB colours. Item IDs are scoped to their category: head 19 and eyes 19 are different fields. Head 19 always identifies the same head artwork, proportions and rendering profile. A pixel head retains its pixel style; style is metadata, not another identity namespace. There are currently heads 1–10; 19 is an illustrative future ID.

IDs are never array positions, filenames selected by a save, or labels. Changing sorting, names, tags and filtering must not change saved values. Never reuse an allocated ID. For substantially different art, registration, shading, resolution or rig, allocate a new item ID. Keep retired items and their art available for existing saves, and set `retired:true` to hide them from creation menus. Unknown IDs are errors, never silently substituted.

The renderer builds a temporary drawing structure from the registry in memory. There is no second persisted catalog, pack mapping or per-release art folder.

## Files

* `art/<sha256>.png`: one immutable copy of each image, named by SHA-256 of its exact bytes.
* `portraits/items/<category>/<id padded to at least 8 digits>.json`: one descriptor per real item.
* `portraits/index.json`: category IDs, colour IDs, item descriptor paths, defaults, shared render profiles and layer order. It contains no repeated item descriptions.
* `clients/`: renderer, codec and examples; no bundled artwork copies.

Example descriptor (abbreviated image hash here; actual files require all 64 hex digits):

```json
{
  "id": 19,
  "category": "head",
  "name": "Angular face",
  "type": "head",
  "tags": ["pixel", "adult"],
  "order": 30,
  "render": {
    "image": "art/<64 lowercase hex digits>.png",
    "profile": "pixel",
    "scale": [1, 1],
    "offset": [0, 0]
  }
}
```

`name`, `type`, `tags`, `order` and `retired` support presentation and filtering. `id`, `category`, and the rendering identity are permanent. Shared render profiles and layer semantics used by existing items must also remain unchanged. Create a new profile instead of editing one already used. Category keys, numeric IDs, nullability and colour semantics are permanent. New optional categories may be appended with unique field IDs, `nullable:true`, default 0. New optional colours may be appended with `required:false` and an immutable default. Existing readers reject unknown fields clearly; updated readers can still reconstruct older codes.

## Numeric format

One arbitrary-precision positive integer contains the whole portrait. Store/transmit its canonical decimal representation as a string. JavaScript must use `String` or `BigInt`, **never `Number`**, including JSON and database columns. Use text in databases. BigInt cannot be serialized by JSON directly; serialize its decimal string.

Construct these bytes in order, with every multibyte integer unsigned and big endian:

| Field | Size |
|---|---:|
| Encoding version, currently 1 | 1 byte |
| Number of nonzero part records | 1 byte |
| Each part: category ID, item ID | 2 + 4 bytes |
| Number of colour records | 1 byte |
| Each colour: colour ID, RGB (`0xRRGGBB`) | 2 + 3 bytes |

Part and colour records are separately sorted by ascending field ID, strictly increasing. Omit part ID 0; it means None/Bald only in nullable categories. Required categories must be present. Required colours are always present, even if their associated part is hidden. Optional colours equal to their declared default are omitted. No duplicate fields, trailing bytes, negative values, leading decimal zeros or redundant zero/default records. Maximum 255 records in either section; category/colour IDs 1–65535, item IDs 1–4294967295, RGB 0–16777215. Decode the decimal integer to its shortest big endian byte string and validate this structure and every referenced item. The version byte makes the leading byte nonzero.

There is no art-release number or catalog revision inside this integer. Only the encoding format is versioned. This avoids changing old character codes whenever items are added.

`ENCODING_VECTORS.json` provides exact decimal values, byte sequences and decoded appearances for other engines. `clients/godot/portrait_code.gd` implements the same format using decimal-string arithmetic; it is a codec, and does not supply a native renderer or downloader.

### Fixed fields

| Category ID | Key | Zero allowed |
|---:|---|---|
| 1 | head | No |
| 2 | eyes | No |
| 3 | nose | No |
| 4 | mouth | No |
| 5 | hair | Yes (Bald) |
| 6 | clothing | No |
| 7 | eyewear | Yes |
| 8 | faceCovering | Yes |
| 9 | augmentation | Yes |
| 10 | facialHair | Yes |
| 11 | scars | Yes |

Colour IDs: 1 skin, 2 hair, 3 hairAccent, 4 clothing, 5 accessory, 6 iris, 7 facialHair. All seven are required. Arbitrary 24-bit colours are supported. Parts from different styles may be mixed. Games may restrict picker choices without reassigning IDs or changing the code format.

## Rendering and artist delivery

All current PNGs are transparent RGBA, 1254×1254, in the shared `front-portrait-v1` rig. Deliver complete independently drawn parts, never slices from a flattened portrait. Keep empty canvas margins and facial anchors consistent. Standard frontal eye line is about normalized Y .51, scalp .21, chin .82; provide measured `scale:[x,y]` and `offset:[x,y]` where necessary. They are normalized drawing-canvas registration, not an image crop. Leave underlying face features out of blank heads; draw eyes, nose and mouth separately. Hair and eyewear must fit the rig. Provide neutral grayscale tintable shading and transparent backgrounds; current eye art uses a blue chroma mask for the iris, preserving whites and highlights. Hair supports primary/accent colours, clothing its own colour, and beard an independent colour. Review at 64, 128 and 512 pixels with different heads and clothing before accepting a new item.

Draw order is neck, clothing, head, facial features, scars, beard, eyewear, face covering, augmentation, hair. Head metadata has a `jawBoundary` polyline of ascending-X normalized points, clipped into complementary neck/head regions; this keeps the neck below clothing and the face above the collar. Artists may deliver a separate registered neck PNG as `render.neckAsset`; it follows the same content-hash storage rule. The existing heads share one image for both planes, without a second PNG. Do not flatten a collar into head artwork.

Profiles define logical shading/resolution (`pixel`: 256px, 8 shade steps; `illustrated`: 512px, continuous shading). Changing an existing profile or registration changes existing portraits and is prohibited by the permanent-identity contract. Run `python tools/check_library.py --against HEAD` before committing additions; it verifies files and compares identities against Git history without maintaining another duplicate ledger.

## JavaScript integration

Load `clients/javascript/src/portrait-kit.js`, then `portraits.js`. Add `portrait-wizard.js` only if using the guided creation UI.

```javascript
const system = await Portraits.System.load('/assets/portraits/index.json');
const appearance = system.defaultAppearance();
appearance.parts.head = 8;
appearance.parts.eyes = 6;
appearance.colors.iris = Portraits.rgb('#538c75');
const code = Portraits.encode(system.registry, appearance); // decimal string
localStorage.setItem('characterPortrait', code);
system.render(code, { canvas: document.querySelector('canvas'), size: 256 });
const restored = Portraits.decode(system.registry, code);
const fantasyHair = system.choices('hair', { tags: ['fantasy'] });
const glasses = system.choices('eyewear', { type: 'glasses' });
```

Host the canonical folders together on a static origin. For this repository the remote index is `https://raw.githubusercontent.com/TheBigTreeInc/assets/main/portraits/index.json`. Cross-origin hosts must allow CORS. HTTPS and modern browsers with BigInt, Web Crypto and Canvas are required (localhost is suitable for development). Git raw hosting is convenient for this project; games can pin a Git commit for reproducible distribution.

`System.load` fetches metadata network-first with cached offline fallback. Image bytes are verified against their SHA-256 filename and cached once per origin/path. A corrupt image is discarded and downloaded again; if unavailable the load fails visibly. No URLs come from saved portrait codes. On first use a network connection or locally supplied library is required. Caches are an optimization and the browser may evict them; bundle the canonical library once for guaranteed offline use. Optional `fallbackURL` points to a bundled `portraits/index.json`. For a known saved character, `{preload:'selected',code}` downloads only its selected images; await `system.preload(newCode)` before drawing a different selection. The default downloads all current images for the creator. Metadata still loads for all options.

Backgrounds and game context are outside portrait identity:

```javascript
system.backgroundProvider = context => context.jobId === 101 ? '#223344' : '#e7ecdf';
system.render(code, { canvas, context: { jobId: 101 } });
system.render(code, { canvas, background: null }); // transparent export
```

The callback currently returns a six-digit hex colour or null. Games can draw their own image background behind a transparent portrait. Portrait codes contain no job, game name, character stats or equipment permissions.

## Migration scope

3.0.0 replaces the earlier version-pinned JSON save and duplicated release-folder design. It deliberately does not read those old saves. Existing real item numbers were preserved where categories were retained; `face` is now `head`. Archived deliveries and Git history remain available. The standalone demo uses this new mechanism; existing Neon Control game ZIPs have not been rebuilt with this revision.
