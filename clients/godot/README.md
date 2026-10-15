# Portrait library 3 native data clients

numeric_portrait_codec.gd encodes/decodes format 2, library 3, all eleven
categories and seven RGB colours. example-game-bindings.json demonstrates
mapping portable options to a game's own component IDs; replace it with your
game bindings. Codec success returns appearance; unknown parts return error.
The codec alone does not provide a native portrait renderer.

portrait_asset_library.gd.load_pack(baseURL,trustedPin,fallbackRoot) verifies
the single release, caches it and returns root/pack/catalog metadata. Cache
results work immediately and offline. Bundle the numeric catalog separately
for fallback. Use clients/javascript/integrations/trusted-release.json as a
trusted pin when consuming portraits 2.1.0.

Your renderer must implement facialHair, scars, independent facialHair RGB and
layer.opacity as documented in ../../docs/PORTRAIT_SYSTEM_SPEC.md. The earlier
neon-control 0.7.87 game integration is not updated by these generic clients.
