# Shared game assets

Versioned asset packs for TheBigTreeInc games and reusable systems. Games download
only the packs they need, verify their contents and cache them for offline use.

## Available systems

| System | Pack | Contents |
| --- | --- | --- |
| Modular portraits | `dominion-pixel` 1.0.1 | Four faces, two hairstyles plus bald, jacket, goggles, respirator and implant |
| Modular portraits | `everyday-illustrated` 1.0.1 | Three faces, two hairstyles plus bald, two shirts and optional round glasses |

Portraits use independently authored transparent components on a registered rig.
Hair, clothes and accessories are interchangeable inside their own art pack.
Facial features are fixed within each complete head. Different styles retain
separate identities and are not mixed automatically. No game saves are stored here.

## Download location

Base URL for games:

```
https://raw.githubusercontent.com/TheBigTreeInc/assets/main
```

The catalog is [catalog.json](catalog.json). Each entry identifies an immutable
release and its SHA-256. Copy its `id`, `version` and `sha256` into your game's
trusted bindings. Games do not accept arbitrary asset URLs from character saves.
For an additional repository snapshot pin, replace `main` in the base URL with
the chosen commit SHA. A direct HTTPS host serving this same layout also works.

## JavaScript

`clients/javascript/` is a working portrait workshop, reusable Canvas renderer,
editor, game-profile example and asset-library client. Run:

```
python clients/javascript/tools/serve.py --open
```

Use `GameAssetLibrary.loadRenderer(baseURL, trustedPin, {fallbackURL})` at game
startup. See [the working integration code](clients/javascript/docs/SHARED_LIBRARY.md).
The browser client verifies every file and decoded image canvas, uses CacheStorage
for offline starts, and falls back to bundled art when downloads fail. Art and
example files are included locally, so the workshop works without this repository.

## Godot

See [clients/godot](clients/godot/README.md) for the downloader, trusted pack bindings
and configuration example. The client is integrated in neon-control 0.7.85.
Startup uses bundled or verified cached art. Missing packs download in the
background and become available on the next launch. Offline fallback is retained.

## Repository layout

```
catalog.json
releases/<pack-id>/<version>/release.json
releases/<pack-id>/<version>/pack.json
releases/<pack-id>/<version>/godot-catalog.json
releases/<pack-id>/<version>/*.png
clients/javascript/
clients/godot/
tools/validate_library.py
```

`release.json` indexes every pack file by SHA-256 and byte length. The consumer
pins the release hash, then checks every file. Paths are relative and bounded;
partial or corrupt downloads cannot replace a valid pack. `.gitattributes`
preserves exact bytes across Git checkouts, including JSON line endings.

## Add another system or pack

Choose a unique pack ID, declare its kind and schema, and publish under a new
version directory. Never overwrite published release bytes. Keep older versions
available for games that still use them, and update consuming games' trusted pins
explicitly. Each system should own its renderer, identity/schema and validation;
the repository is shared storage, not a single game-specific appearance format.

The initial download clients support portrait PNG/JSON packs. Terrain, sound,
animation and other systems can use this repository later, with suitable readers
and checks for their formats. They are not implemented in these clients yet.
Syndicate reference data and private game state are excluded from this repository.

Run `python tools/validate_library.py` before committing pack changes. The initial
release also passed 14 JavaScript contract/cache checks, 146 browser checks,
132 rendered portrait combinations and the neon-control engine regression suite.
