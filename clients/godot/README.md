# Godot portrait download client

This is the client integrated and tested in neon-control 0.7.85 (Godot 4.7).
Copy portrait_asset_library.gd to scripts/ui/portraits/ in a game, register it
as the PortraitAssetLibrary autoload, and copy portrait_asset_sources.json to
game_data/characters/. Keep bundled portrait art and catalogs as fallback.

The source bindings map pack IDs to the bundled catalog paths of neon-control.
For another game, adapt those catalog paths and call resolve(bundled_catalog_path)
when loading a portrait catalog. The returned catalog points to the verified
cache when available. Always override a cached catalog's asset root with the
returned root; never interpret remote asset_root values as filesystem authority.

Copy portrait-library.example.json into Godot's user data folder as
portrait-library.json. This enables background downloads from this repository.
Completed packs activate on the next launch. Without config, valid caches are
used and bundled portraits remain available. Never distribute credentials.

The native renderer and creator UI remain in neon-control; this folder contains
the reusable downloader, trusted release bindings and configuration example.
The portable web renderer and editor are in ../javascript/.
