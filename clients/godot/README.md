# Godot portrait download client

This is the client integrated and tested in neon-control 0.7.86 (Godot 4.7).
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

Release 1.1.0 adds all-options, independent facial components and iris colors.
Use the native 0.7.86 renderer and identity writers when consuming the new facial
metadata; the downloader alone does not provide a portrait editor. Appearance
and native identity schemas are included under schemas/.

## Numeric interoperability — neon-control 0.7.87

The included numeric_portrait_codec.gd and portrait_rgb.gd support portable
format 1. Bundle numeric-catalogs/1/catalog.json. Decode returns an appearance
with portrait_rgb overrides; encode reverses it without losing arbitrary RGB.
See ../../docs/NUMERIC_PORTRAIT_SPEC.md for validation and integration requirements.
The full renderer/profile/preset integration is in neon-control 0.7.87; copying
the codec alone does not add RGB rendering or job backdrops to another game.
