# Godot numeric portrait codec

`portrait_code.gd` reads and writes the exact same decimal string as the JavaScript client, without converting it to a floating point number or requiring BigInt support. It is a data codec, not a native portrait renderer or downloader. Existing Neon Control game builds have not been migrated by this standalone library release.

Load `portraits/index.json` into `registry`. Read each category's listed item descriptors and put them into `items[category.key][str(item.id)]`. This dictionary is an in-memory lookup of the canonical descriptors, not a second saved mapping file.

```gdscript
var appearance = PortraitCode.defaults(registry)
appearance.parts.head = 8
appearance.colors.iris = 0x538c75
var code: String = PortraitCode.encode(registry, items, appearance)
var restored: Dictionary = PortraitCode.decode(registry, items, code)
```

Invalid input returns `""` from encode or `{}` from decode. Store `code` as a String. The same number reconstructs the same selected items and colours across clients. To draw them in a game, follow the canonical item `render` descriptors and the layer/anatomy rules in `docs/PORTRAIT_SPEC.md`.

Verified against 80 JavaScript-generated portrait values covering all colour channels and mixed parts, including malformed code and unknown-ID rejection. Godot 4.7 was used for this check.
