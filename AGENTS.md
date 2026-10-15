# Maintaining shared assets

Read docs/PORTRAIT_SPEC.md. Keep exactly one artwork store and one descriptor per real item. Do not add per-release art copies, embedded client art, or another item-ID mapping file.

Item and category IDs are permanent. Never modify the render identity of an existing item, replace its art with a different object, or remove a retired item needed by old codes. Add new IDs and profiles. Labels, filtering tags, type, order and retired are mutable presentation metadata. Existing rig, layer semantics and colour IDs must remain stable.

Run tools/check_library.py --against HEAD and the JavaScript tests before committing. Keep the runnable standalone example and specification with the system.
