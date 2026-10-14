# Modular Portrait Kit 1.0.1

A reusable, dependency-free JavaScript portrait generator. It uses transparent
component images and JSON art packs, with no Godot or server-side rendering needed.

## Open it

On Windows, run **Start Portrait Workshop.cmd** (Python 3 is required only for the
local preview server). Or run `python tools/serve.py --open`. Open
`http://127.0.0.1:8927/`. Keep that terminal open while using the preview.
Opening index.html directly as a file cannot load JSON packs reliably; use HTTP.

Copy the kit into an existing JavaScript game's static assets to use its normal
web server instead. Once the kit files are local, rendering needs no external API,
account or image-generation service. The browser creates portraits on demand.

## Included art

- Everyday illustrated: three faces, side-part and curly hair plus bald, T-shirt
  and collared shirt, optional round glasses. 36 combinations before colors.
- DOMINION pixel: four faces, two hairstyles plus bald, tactical jacket, goggles,
  respirator and temple implant. 96 combinations before colors.
- Five independently selectable colors: skin, hair, hair highlights, clothing and
  accessories. Style switching remembers each style's choices in the workshop.

The eight new everyday assets were independently generated with built-in ImageGen.
The ten existing DOMINION assets are retained intact. See docs/ASSET_PROMPTS.json
and docs/ASSET_PROVENANCE.json. Full facial anatomy is fixed within each head.

## Use from JavaScript

```html
<script src="portrait-kit/src/portrait-kit.js"></script>
<canvas id="person" width="256" height="256"></canvas>
<script>
(async () => {
  const renderer = await ModularPortraits.Renderer.load(
    'portrait-kit/packs/everyday-illustrated/pack.json'
  );
  const appearance = ModularPortraits.normalizeIdentity(renderer.pack);
  appearance.choices.hair = 'curly';
  appearance.colors.hair = '#67442f';
  renderer.render(appearance, {
    canvas: document.getElementById('person'), size: 256
  });
  // Store only the appearance in a character's presentation record.
  const saved = ModularPortraits.serialize(renderer.pack, appearance);
  const restored = ModularPortraits.deserialize(renderer.pack, saved);
})();
</script>
```

ES modules can import the same API from src/portrait-kit.mjs. React, Vue and other
frameworks can call Renderer from their canvas/ref lifecycle; the core has no
framework dependency. The optional DOM controls are src/portrait-editor.js and
src/portrait-editor.css. Call Renderer.dispose() when a game releases an art pack.

## Cross-game integration

The save contract contains only schema, pack ID, pack revision, component choices
and colors. The game retains names, IDs, age, jobs, statistics, inventory and its
save authority. Art packs retain their own alignment, draw order, palettes and
logical resolution. Different styles are selected as complete packs; components
are not silently mixed across art families.

See docs/INTEGRATION.md for APIs, DOMINION preset conversion, compatibility and
constraints. See docs/ARTIST_BRIEF.md for reusable art delivery requirements.

## Working game example

Open examples/game-profile.html through the local server. Its accompanying
examples/game-profile.js shows loading a pack, rendering an img, changing
components, and saving/loading appearance JSON. It is independent of any game.

## Verification

Run `node --test --test-isolation=none tests/core.test.cjs tests/library.test.cjs`. Open tests/browser.html
for real canvas, PNG export, editor and browser save checks. Evidence
ships under evidence/. The browser gate covers all 132 combinations. User art
acceptance remains separate from automated rendering checks.

This kit does not yet provide independent eye/nose/mouth selection, expressions,
body animation, automatic tactical-model matching or untested multiplayer-server
support for a new appearance field.

1.0.1 corrects everyday glasses, uniform hair proportions and clothing front overlap.
Both packs now convert to Godot presets. See docs/SHARED_LIBRARY.md for optional
Git-hosted downloads, trusted version pins, browser caching and bundled fallback.
