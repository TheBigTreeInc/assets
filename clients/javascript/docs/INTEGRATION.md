# JavaScript integration and pack contract

## API

- `Renderer.load(manifestURL)`: fetches a pack and preloads its own image files.
- `normalizeIdentity(pack, input, {strict})`: returns only supported appearance
  fields. Strict mode rejects unknown selected components and malformed colors.
- `serialize` / `deserialize`: canonical appearance-only JSON with a 16KB limit.
- `randomIdentity(pack, rng)`: component/color selection from a pack's choices.
- `renderer.render(identity, {canvas, size, background, base})`: synchronous canvas
  rendering after preload. background=null gives transparency. base=true omits
  accessory layers. Sizes 16–2048px are supported.
- `renderer.toBlob` / `toDataURL`: PNG export suitable for a game's img element.
- `ModularPortraitEditor.mount(container, renderer, identity, {onChange})`: optional
  controls. Returned controller supports getIdentity, setIdentity and destroy.

The renderer uses browser Canvas 2D and local assets, not a generation API. Recolor
textures use a bounded cache. All art is preloaded before synchronous rendering.
Art-pack and component load errors are surfaced rather than hidden placeholders.
Serve the kit over HTTP/HTTPS. Images stay on the pack origin and are loaded with
anonymous CORS. Keep the pack on the game origin, or configure the pack host to
permit cross-origin loading, so canvas recoloring and PNG export remain available.

## Identity

```json
{"schema":"modular-portraits.identity/v1","pack":"everyday-illustrated",
 "revision":1,"choices":{"face":"face-2","hair":"curly","outfit":"collar",
 "glasses":"glasses","mask":"none","implant":"none"},
 "colors":{"skin":"#c18c69","hair":"#67442f","hairAccent":"#9b7658",
 "outfit":"#528071","accessory":"#383c40"}}
```

This is presentation data. The host game owns player/person identifiers, names,
jobs, age, inventory, stats, unlocks and saved games. Unknown extra fields do not
become authority through this appearance record. Components are selected by IDs;
saved appearances cannot select arbitrary asset URLs.

Changing styles requires choosing that pack's appearance. The workshop remembers
each pack independently; it does not pretend that an unavailable option exists
in another style. Hosts may implement explicit semantic mappings if desired.

## Art packs

Pack schema: modular-portraits.pack/v1. Required: id, revision, canvas, logicalSize,
slots, colors and layers. Each slot has options and a default. Each option has a
stable ID, label, optional asset, scale and offset. Empty asset means None/Bald.
All PNG/WebP source files in a pack share its declared canvas dimensions.

Layers select a slot and optionally a primary/accent color. Their array order is
draw order. preserveChroma retains authored saturated accents; whiteThreshold is
pack-specific. pixelated/shadeSteps select pixel sampling or smooth illustration.
An outfit can be drawn behind the head and again in front below frontFromY.

Existing pack defaults are eight shade bands / 256px for DOMINION, and continuous
shading / 512px for Everyday. This is visual approximation of the Godot palette
shader; Canvas/browser color handling and pixel boundaries can differ. It is not
claimed to be a bit-identical GPU shader port.

Current compatible slots include whole face, eyes (with brows), nose, mouth,
front hair, outfit, glasses, mask and implant. Add a new slot and layers to an art pack for another independent
component. The generic editor uses manifest labels/options. Facial foundations and fallback features are declared on each head option.
Linked multi-part long-hair selection is not yet implemented.

## DOMINION bridge

Load integrations/dominion-bridge.js after the core. `fromDominion(pack, identity)`
accepts a modular Godot identity or dominion-appearance-v1 preset. `toDominionPreset`
returns a Godot appearance-only preset for the DOMINION, Everyday or all-options pack. No game identities
or inventory are copied. Godot currently has 24 indexed palette choices, so custom
web colors outside those swatches fail export visibly. Everyday portraits are installed in the companion neon-control 0.7.86 source
delivery. The standalone JavaScript ZIP does not modify a Godot installation.


## Facial foundations and mixing

Each face option keeps its original `asset` and adds `modularAsset` and
`featureDefaults`. With all three facial selections set to `original`, the old
full head renders unchanged. Any explicit eyes/nose/mouth choice activates the
blank foundation; unspecified parts use that head's newly authored defaults.
Layers marked `feature:true` render only in this mode. Eyes use `chromaColor:iris`
to tint their blue/cyan iris pixels independently from grayscale skin and brows.

The `all-options` pack registers all assets under origin-prefixed paths and IDs.
Each option's `render` settings retain its source logicalSize, shadeSteps and
pixelated flag. Components from both origins may be chosen independently.
The shared API has no game clothing policy. Optional editor `allowedOptions`
controls a game's picker without changing the source pack or renderer.
