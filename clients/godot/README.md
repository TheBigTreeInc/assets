# Numeric portrait v2 game adapter

Bundle numeric-catalogs/2/catalog.json and a game binding table. The provided
neon-control-bindings.json targets neon-control 0.7.87's native renderer.
numeric_portrait_codec.gd.decode(code,catalog,bindings) returns {appearance:...}
or {error:...}; encode(identity,catalog,bindings) returns the portable numeric
object or {error:...}. Exact portrait_rgb values are required on encode.
No old preset or palette conversion is included. The binding maps portable
clothing to the native renderer's outfit colour; native IDs are game details.
portrait_asset_library.gd.load_pack(baseURL,trustedPin,fallbackRoot) verifies
the single release, caches it and returns root/pack/catalog metadata. The cached
result is usable immediately and offline. Bundle the numeric catalog separately
for fallback. This client does not supply a complete native renderer. The delivered
neon-control 0.7.87 ZIP has not been rebuilt to adopt the unified library.
Read ../../docs/PORTRAIT_SYSTEM_SPEC.md for the system contract.
