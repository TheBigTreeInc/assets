# Four modular portrait outfits — 2026-10-18

Version 3.0.3 extends **portrait-library** 3.0.2, and adds four original independent front-facing grayscale pixel-style clothing components:

| Permanent clothing ID | Name | Category | Style |
| --- | --- | --- | --- |
| 12 | Ranger leather jerkin | clothing | fantasy / ranger |
| 13 | Tailored waistcoat | clothing | formal / everyday |
| 14 | Scholar-mage mantle | clothing | fantasy / scholar |
| 15 | Futuristic utility jacket | clothing | cyberpunk / utility |

## Integration

Each choice has one item descriptor `portraits/items/clothing/000000NN.json`, a stable integer ID and one canonical SHA-256-addressed `art/<digest>.png`. `portraits/index.json` includes the four new items without modifying the earlier entries or layer composition. Each image is 1254×1254 RGBA, contains transparent negative space and a transparent neckline, and is stored in normalized neutral grayscale for use with the existing clothing-colour control. It uses the established `pixel` render profile and a placement scale of 0.9. The four variations use matching, individually tuned y offsets around 0.23–0.24.

Authored using OpenAI image generation with the existing library artwork as visual registration references; each descriptor records individual provenance. PNGs are component artwork only; no skins, heads, or body shapes are baked into them. Editable artist layers, side views, full-body parts and animation frames are not supplied. Nothing is copied into client asset directories, and existing artwork is preserved.

## Verification and publication

`python tools/check_library.py`, `python tools/check_delivery.py` and `node --test clients/javascript/tests/*.test.cjs` validate the source and preserved numeric identity semantics. The repository workflow additionally verifies identities against the Git base and uses the pinned upstream ZipRunner 2.3 validator to build a source-root ZIP, its checksum and a Pages deployment bundle.

**Manual acceptance before pushing to online store:** open the portrait workshop, select each new garment on at least two different heads and hairstyles, check neck visibility and shoulder alignment, tint the clothing, and verify portrait code save/restore. ZipRunner import and GitHub Pages deployment have separate operator approval/CI gates. The archive on its own does **not** upload to the online store.


**Delivery:** In release 3.0.4 the ZipRunner project key is corrected to `CharacterBuilder`. All four clothing IDs, images, public catalog references, and tinting behavior are identical to 3.0.3.

**Recipient compatibility:** Version 3.0.5 preserves all four outfit assets and metadata and packages without a root recipe only to avoid the ZipRunner 1.2.304.125 mixed-case project-key comparison.

**3.0.6 maintenance reissue:** No changes to the four original outfit assets or clothing IDs 12–15.
