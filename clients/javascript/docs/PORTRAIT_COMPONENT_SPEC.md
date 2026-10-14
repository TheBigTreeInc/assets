# Portrait component integration specification

Contract: `front-portrait-v1`, client 1.1.0 or later.
This describes the implemented JavaScript 1.1.0 and neon-control 0.7.86 system.
The existing pack and appearance schemas remain `modular-portraits.pack/v1` and
`modular-portraits.identity/v1`. Adding a component means adding a new option to
an existing slot; it does not mean producing a finished portrait for each choice.

## Eye colour

Eye colour is supported on modular eye components. JavaScript stores a six-digit
hex colour in `appearance.colors.iris`; Godot stores a 0–23 `iris_color_id`.
The bridge maps the 24 swatches by their exact hex values. Browser-only colours
can be arbitrary hex values; Godot export needs an exact supported swatch.

```js
const renderer = await ModularPortraits.Renderer.load('packs/all-options/pack.json');
const appearance = ModularPortraits.normalizeIdentity(renderer.pack);
appearance.choices.eyes = 'everyday-almond';
appearance.colors.iris = '#3d6650';
renderer.render(appearance, {canvas, size: 256});
```

The workshop exposes this as **Eyes** in the colour controls. Godot exposes it as
**Color → Eyes**. If all eyes/nose/mouth choices are `original` / Face default,
the approved full-head image is retained and its baked eye colour is unchanged.
Choosing any custom facial feature activates the matching blank foundation and
modular eye/nose/mouth layers. Eyes marked Face default then use that head's
registered modular eye default, which does support iris colour.

## Artwork delivery

| Requirement | Value |
| --- | --- |
| File | One PNG per option, 8-bit RGBA, genuine alpha transparency |
| Canvas | 1254 × 1254 pixels for the existing collections |
| Padding | Full canvas, including empty space; never crop to the feature bounds |
| View | Front-facing, same projection and upper-left light as the head |
| Recolourable material | Neutral grayscale shading, useful dark/mid/light values |
| Eye component | Both eyes and their eyebrows in one image |
| Nose component | Nose bridge, tip, nostrils and narrow local shadow only |
| Mouth component | Lips, mouth line and narrow local shadow only |
| Edges | Clean alpha; narrow feather where skin meets the foundation |
| Forbidden baked content | Backgrounds, complete faces, hair, glasses, clothes, labels |

Use blue/cyan **only inside the irises** as the colour channel marker. Keep pupils
and outlines dark, eye whites neutral white, and skin/brows grayscale. The renderer
detects blue-dominant chromatic pixels for iris tinting; it does not require a
separate iris mask PNG. Do not put blue highlights elsewhere in an eye component.
Very dark pupils and bright catchlights should remain neutral. Check the actual
renderer: this is a colour-key convention, not an arbitrary semantic mask format.
Noses and mouths have no separate colour channel in the current client.

### Registration landmarks

Coordinates are normalized to the full portrait canvas, with (0,0) at top-left.
These are the **final drawn positions after scale/offset**, not necessarily the
raw positions in an existing generated PNG.

| Landmark | Position |
| --- | --- |
| Head centre | x = 0.50 |
| Scalp top | y ≈ 0.21 |
| Eye centres | x ≈ 0.40 and 0.60; y ≈ 0.51 |
| Nose base / nostrils | y ≈ 0.63–0.64 |
| Mouth centre | x = 0.50; y ≈ 0.705 |
| Chin | y ≈ 0.82 |

Prefer artwork registered directly to this rig with scale [1,1], offset [0,0].
Existing generated components have individual transforms to achieve the same
registration. The transform is `drawn = offset + source * scale` on each axis.
Do not copy another feature's transform unless its source registration matches.
See [the artist brief](ARTIST_BRIEF.md) and
[alignment template](../templates/front-portrait-v1.svg).

## Register an additional option in JavaScript

Add the image next to the pack's other art, then append an option to the existing
`slots.eyes.options`, `slots.nose.options` or `slots.mouth.options` array.

```json
{
  "id": "rounded",
  "label": "Rounded nose",
  "asset": "features_nose_rounded.png",
  "scale": [1, 1],
  "offset": [0, 0]
}
```

This is an option object, not a complete pack. IDs are unique inside their slot,
lowercase kebab-case (`a-z`, `0-9`, `-`). Paths are relative to the pack, with no
absolute paths, `..` or URLs. The current portable native client consumes PNGs;
use PNG for a pack shared between JavaScript and Godot.

`scale` and `offset` are optional and default to [1,1] and [0,0]. Each is a two-number
array. Scale must be greater than zero and at most 2. In mixed collections an
option may carry its source `render` settings:

```json
{
  "logicalSize": 512,
  "shadeSteps": 0,
  "pixelated": false,
  "whiteThreshold": 0.995
}
```

This object is the value of the option's `render` field. Use shadeSteps 0 for
continuous illustrated shading, or 8 for the current pixel style. Existing pixel
parts use logicalSize 256. Colour handling and pixel boundaries can differ between
Canvas and Godot; their renderings are not promised to be byte-identical.

### Facial foundations and layers

Each head must have its own `modularAsset` pointing to a matching blank head, plus
`featureDefaults` mapping eyes/nose/mouth to existing **nonempty** option IDs.
Keep the original full-head `asset` so existing original appearances stay intact.

```json
{
  "id": "face-1",
  "label": "Soft features",
  "asset": "head.png",
  "modularAsset": "head_blank.png",
  "featureDefaults": {
    "eyes": "almond",
    "nose": "straight",
    "mouth": "neutral"
  }
}
```

Facial slots retain `{ "id":"original", "label":"Face default", "asset":"" }`.
If any explicit facial option is selected, Face default slots use the chosen
head's newly authored feature defaults. They do not extract features from its old
full-head PNG. Switching to custom anatomy can therefore redraw the other default
features as well; subsequent feature changes are independent layers.

The pack already has these facial layers immediately after the face layer:

```json
[
  {"slot":"eyes","color":"skin","preserveChroma":true,"feature":true,"chromaColor":"iris","whiteThreshold":0.995},
  {"slot":"nose","color":"skin","preserveChroma":true,"feature":true,"whiteThreshold":0.995},
  {"slot":"mouth","color":"skin","preserveChroma":true,"feature":true,"whiteThreshold":0.995}
]
```

No new renderer code is needed for another option in these slots. A new anatomical
slot, such as separate eyebrows or ears, requires an explicit contract extension.

## Register the same option in Godot

| Web slot | Native catalog array | Saved native key |
| --- | --- | --- |
| eyes | `eye_packages` | `eye_package` |
| nose | `nose_packages` | `nose_package` |
| mouth | `mouth_packages` | `mouth_package` |

Add the option to its native catalog using `asset`, `scale` and `offset`. Native
IDs may use underscores; preserve existing IDs and add new unique ones. For example:

```json
{"id":"day_nose_rounded","label":"Rounded nose","asset":"features_nose_rounded.png","scale":[1,1],"offset":[0,0]}
```

Add the corresponding mapping in the web pack:
`godot.slots.nose.rounded = "day_nose_rounded"`. The bridge uses these explicit
mappings; it does not guess native IDs. Extend the native identity schema's enum
for that field as well. Preset/profile/HUD writers already support these three
keys. Keep all 24 iris swatches in the same order in web `colors.iris.swatches`
and native `palettes.iris_colors_24`.

Native head fields are `modular_base` and `feature_defaults`. Native defaults use
saved key names (`eye_package`, `nose_package`, `mouth_package`) and native IDs.
Native render settings are `logical_pixels`, `shade_steps`, `white_threshold`.
See [native schemas](https://github.com/TheBigTreeInc/assets/tree/main/clients/godot/schemas).

## Include an option in Mix everything

Register it in its source style first, then rebuild the mixed pack. Mixed IDs are
origin-prefixed, for example `everyday-rounded`; paths include the origin folder,
for example `everyday-illustrated/features_nose_rounded.png`. Add the matching
mixed native option and `godot.slots` mapping. Retain the source render settings.
Rebuilding a source pack alone does not automatically change an already-published
mixed release. Face defaults must point to IDs present in that same mixed pack.

There are no gender, genre or game restrictions in Mix everything. Games can
optionally pass `allowedOptions` to the editor to limit a clothing picker. The
underlying renderer retains every option; each game owns its appearance rules.

## Publish and validate

1. Keep existing IDs/assets/defaults unless deliberately making an incompatible change.
2. Publish under a **new asset version**; never edit a released version's bytes.
3. Update `pack.json`, `godot-catalog.json` and the immutable `release.json` file index.
4. Update the catalog and each consuming game's trusted release hash/version.
5. Run `python tools/validate_library.py` and the JavaScript tests in package.json.
6. Verify each new variant on all seven heads, with other features, glasses/masks,
   skin/iris colours and 64/128/256px previews; check save/restore and Godot export.
7. For native integration, run the source checks and `facial_components_smoke_test.gd`.

Asset version (currently 1.1.0) is separate from appearance revision (currently 1).
Additive choices can preserve revision 1. A changed rig or incompatible identity
format needs an explicit migration/revision plan. The current release tests cover
448 explicit facial combinations, the previous 132 combinations and persistence;
the complete Cartesian product of every colour/accessory is not exhaustively tested.

Current limits: eyebrows travel with eyes; separate eyebrows, expressions, ears,
jaw controls and facial hair are not implemented in the present client.
