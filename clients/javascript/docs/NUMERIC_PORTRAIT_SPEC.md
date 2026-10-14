# Numeric portrait interchange — format 1, catalog 1

Client release: 1.2.0. Art packs remain pinned to 1.1.0.

## Save contract

The complete appearance is a JSON object with exactly five fields: `format`,
`catalog`, `pack`, `parts`, and `colors`. All leaf values are integers.
`format` is 1; `catalog` is 1. Pack 1 is Everyday, 2 is Cyberpunk, 3 is Mix everything.
`parts` requires face, eyes, nose, mouth, hair, outfit, glasses, mask, implant.
`colors` requires skin, hair, hairAccent, outfit, accessory, iris.
Colours are packed sRGB `0xRRGGBB` integers, 0–16777215, without alpha.
For example `#123456` is 1193046. Eye colour tints only the iris mask.
Accessory colour is currently shared by glasses, mask and implant.

The shipped `schemas/numeric-appearance-v1.schema.json` specifies structure.
`catalogs/numeric-catalog-1.json` specifies the allowed IDs and exact pinned art.
Validation MUST check both. Reject unknown format, catalog, collection, component,
extra fields, missing fields, booleans, fractions and invalid RGB ranges.
Never silently substitute unknown parts. Godot JSON integral float values are
accepted as integers; fractional values are rejected.

## Stable IDs and new artwork

IDs are explicit catalog entries, NEVER dropdown positions or random seeds.
They are scoped by component category. The same source part uses the same number
in its original pack and Mix everything. Zero means Original for facial parts;
optional None/Bald entries retain their explicit source IDs.
Catalog 1 is immutable. Adding/replacing parts requires a new catalog ID and an
explicit migration; never reuse or reassign old IDs. Retain old catalogs and art
so old saves remain reproducible. The renderer checks pack id, revision and
assetVersion against the catalog. Pin the trusted catalog with your game;
appearance files never specify URLs or file paths.

Artists must follow `PORTRAIT_COMPONENT_SPEC.md`: transparent aligned PNGs,
consistent full canvas, fixed facial landmarks, correct layer order, colour masks
and matching blank foundations. New eyes/noses/mouths need matching manifest
entries, native bindings and explicit numeric IDs in the new catalog.

## JavaScript integration

Load src/portrait-kit.js, src/numeric-portrait.js and optionally src/portrait-wizard.js
in that order. No framework required. See examples/game-profile.html and its JS.

```js
const system = await NumericPortraits.System.load("packs/all-options/pack.json", {
  catalogURL: "catalogs/numeric-catalog-1.json",
  backgroundProvider: ({context}) => jobBackgrounds[context.jobId] || "#e7ecdf"
});
const appearance = system.defaultAppearance();
appearance.colors.iris = NumericPortraits.rgb("#4488aa");
const png = system.toDataURL(appearance, {size:256, context:{jobId:101}});
const saved = NumericPortraits.serialize(system.catalog, appearance);
const restored = NumericPortraits.deserialize(system.catalog, saved);
PortraitWizard.mount(container, system, restored, {onChange: draw});
```

system.choices(slot) provides numeric IDs and display labels. Wizard tabs are
Face, Hair, Details, Clothing, Review, with adjacent colours, Undo, per-tab reset
and per-tab randomization. Optional allowedOptions maps slots to numeric ID lists.
Legacy string-ID appearances are imported through system.fromLegacy(value).
The workshop accepts old local saves and exports numeric appearances by default.

## Game-owned backgrounds

Keep jobId and other gameplay state outside appearance, e.g.
`{id:17,jobId:101,appearance:...}`. Job numbers are defined by each game.
The synchronous backgroundProvider receives `{context,appearance}` and returns
a six-digit hex colour, a preloaded image/canvas (drawn cover), or null for
transparency. Preload images before rendering. Explicit render `background`
overrides the provider. Without a provider the pack background is used.
Changing jobs must not modify the appearance code. Reproducing a full picture
requires the same game context/backdrop as well as the appearance and pinned art.

## Godot integration

scripts/ui/portraits/numeric_portrait_codec.gd exposes encode(identity,catalog,packId)
and decode(code,catalog). A failure returns `{error:...}`; decode success returns
`{appearance:...}`. Load the bundled catalog with JSON.parse_string.
Native portrait_rgb stores exact packed RGB overrides; indexed palette IDs remain
supported for old saves. The creator clears an override when selecting a palette
swatch. Profiles, presets, builder metadata and portrait cache keys preserve RGB.
The native preset save writes numeric format for these three collections; old
text presets and the older original stylized collection remain compatible.
ProductionPortraitView.set_background_provider(callable,context) accepts a callback
receiving context and returning Color, Texture2D, or null. Context is separate
from identity and is not exported. Clear the callback with Callable() to restore
the pack background. This hook applies to the three modular collections.

The numeric code describes appearance only, never names, stats, equipment authority,
job definitions or campaign state. Games remain responsible for gameplay rules.
