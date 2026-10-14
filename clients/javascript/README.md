# Modular Portrait Kit 1.2.0

A working JavaScript portrait generator with independent eyes, nose and mouth,
plus faces, hair, clothing, glasses, masks and implants. No external image service
is required at runtime. Run **Start Portrait Workshop.cmd** or
`python tools/serve.py --open`, then open http://127.0.0.1:8927/.

## Collections

- **Mix everything:** all seven head shapes; four eye, four nose and four mouth
  variants across both styles; every hairstyle, garment and accessory.
- **Everyday illustrated:** the approved casual collection, extended with facial parts.
- **DOMINION pixel:** the approved cyberpunk collection, extended with facial parts.

There are no genre, gender or game restrictions in the mixed collection. Each game
can provide its own clothing menu. Components retain their source shading style,
so mixing pixel art and illustration intentionally produces a hybrid portrait.

Two new eye pairs, two noses and two mouths are authored per style. Eyebrows travel
with the eyes. Iris color is independent for custom facial components. Face shape
still changes through the head selector. Brows, ears, jaw, expressions and facial
hair are not separate controls in this release.

The original 18 component PNGs are unchanged. Seven matching blank foundations and
12 separately generated facial components were added. Original saved appearances
default all facial choices to **Face default** and render the approved full heads.
Selecting any facial component activates the matching blank foundation and the
registered feature defaults for the other facial slots. The mixed collection
starts with custom features active. A fallback feature is newly authored; it is
not a cropped portion of the old face. No reference portrait was segmented.

## JavaScript example

```html
<script src="src/portrait-kit.js"></script>
<canvas id="person"></canvas>
<script>
(async () => {
  const renderer = await ModularPortraits.Renderer.load('packs/all-options/pack.json');
  const appearance = ModularPortraits.normalizeIdentity(renderer.pack);
  Object.assign(appearance.choices, {
    eyes: 'cyberpunk-narrow', nose: 'everyday-broad', mouth: 'everyday-full',
    hair: 'cyberpunk-swept', outfit: 'everyday-collar'
  });
  appearance.colors.iris = '#64835c';
  renderer.render(appearance, {canvas: document.getElementById('person'), size: 256});
  const json = ModularPortraits.serialize(renderer.pack, appearance);
  // Save json inside your game's character record.
})();
</script>
```

The game retains names, age, jobs, statistics, inventory and save authority.
This renderer stores appearance only. `examples/game-profile.html` demonstrates
a complete selectable profile and save/load flow. `examples/gallery.html` shows
the approved collections; `examples/mixed-faces.html` shows the new facial controls.

## Optional game clothing menus

Pass `allowedOptions` to `ModularPortraitEditor.mount` when a game wants a smaller
picker. The renderer and source pack retain all options:

```js
const editor = ModularPortraitEditor.mount(container, renderer, appearance, {
  allowedOptions: {outfit: ['everyday-crew', 'everyday-collar']},
  onChange: value => renderer.render(value, {canvas})
});
```

Filtering is optional; the workshop never filters the mixed collection. This is
a picker setting; games enforce their own saved-appearance rules. To add another
garment, author a registered transparent full-canvas component and add an outfit
option to a new pack version. Do not rewrite a published release.

## Shared library and Godot

The shared repository is https://github.com/TheBigTreeInc/assets. Use
`https://raw.githubusercontent.com/TheBigTreeInc/assets/main` as the download base.
See docs/SHARED_LIBRARY.md for pinned downloads, browser caching and bundled fallback.
The Godot bridge supports all three packs using each manifest's explicit mapping;
Godot export requires one of the 24 palette swatches. Custom web colors render
normally but are rejected by indexed Godot export when no exact swatch exists.
The companion neon-control 0.7.86 ZIP includes the native controls and mixed library.
No Life site changes are included.

## Verification and source art

Run `npm test` (or the test command in package.json). Open tests/browser.html for
the 132 legacy component combinations and tests/facial-browser.html for the
448 explicit face/eye/nose/mouth combinations, unrestricted clothing combinations,
iris color, menu filtering and save round trips. The full Cartesian product of
every accessory/color is not exhaustively rendered.

Built-in ImageGen was used for the new bitmap art. Exact prompts and SHA-256
provenance are in docs/ASSET_PROMPTS.json and docs/ASSET_PROVENANCE.json.
See docs/ARTIST_BRIEF.md for the delivery contract for replacement artist assets.

## Numeric saves and guided creator (1.2.0)

See [NUMERIC_PORTRAIT_SPEC.md](docs/NUMERIC_PORTRAIT_SPEC.md), the bundled numeric catalog and JSON schema. Open examples/game-profile.html for numeric choices and game-owned job backgrounds.
