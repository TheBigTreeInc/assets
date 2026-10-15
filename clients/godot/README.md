# Portrait library 4 native data clients

The codec handles format 2/library 4, eleven categories and seven RGB colours.
example-game-bindings.json demonstrates game component IDs. The verified pack
downloader returns root/pack/catalog metadata and works with a complete offline
cache. Bundle the numeric catalog separately for fallback.

Game renderers must implement neck, garment, head drawing planes, jawBoundary
clipping, optional neckAsset, facialHair, scars and opacity as specified in
../../docs/PORTRAIT_SYSTEM_SPEC.md. These data clients do not supply a native
renderer or update the previously delivered neon-control 0.7.87 game.
