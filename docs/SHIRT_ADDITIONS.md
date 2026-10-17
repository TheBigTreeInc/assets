# Shirt additions — 2026-10-17

The Clothing tab includes three new recolourable pixel-style portrait garments:

| Permanent clothing ID | Name |
| --- | --- |
| 5 | Crew-neck T-shirt |
| 6 | Button henley |
| 7 | Open-collar shirt |

Each garment is a separate transparent RGBA component with no baked skin or neck. The existing renderer draws the character's neck behind clothing and the head above it. Clothing colour controls the neutral fabric shading.

Generated individually with the built-in OpenAI image tool. Exact prompts and provenance are in `portraits/items/clothing/00000005.json` through `00000007.json`; each descriptor references the sole canonical PNG in `art/`. No third-party artwork was used. Editable layered artist sources are unavailable. Coverage is front-facing portraits only, not full-body or animation.

Collar placement was reviewed in the creator; browser checks include all clothing choices across the existing feminine facial combinations. Existing IDs and render definitions remain unchanged.
