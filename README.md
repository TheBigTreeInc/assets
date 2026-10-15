# Shared game assets

The current portrait system uses **one pack: portraits 2.0.0**.
Faces, eyes, noses, mouths, hairstyles, clothing, eyewear, face coverings and
augmentations have neutral names and numeric IDs. Optional pixel/illustrated
tags describe rendering style. Glasses and goggles are types of Eyewear.

[System specification](docs/PORTRAIT_SYSTEM_SPEC.md) ·
[Working JavaScript system](clients/javascript) ·
[Numeric catalog 2](numeric-catalogs/2/catalog.json) ·
[Download catalog](catalog.json)

30 unique PNGs: 7 heads, 4 each of eyes/noses/mouths, 4 hairstyles, 3 garments,
round glasses, goggles, respirator and eye implant. None/Bald choices are merged.
All parts can mix. Games choose their own clothing menus and job backgrounds.
The specification, numeric schema, artist delivery rules, guided workshop and
working game example are included. Only numeric format 2/library 2 is supported.

Base URL: https://raw.githubusercontent.com/TheBigTreeInc/assets/main
Pin the release id, version and SHA-256 with your game. The JavaScript download
client verifies every file, caches downloads and supports bundled fallback.
Historical releases remain archived; the active catalog lists only portraits.
No game saves, credentials or private Syndicate data are included here.

The Godot folder supplies an optional codec/game binding adapter. The previously
delivered neon-control 0.7.87 game remains on its prior library until integrated.
