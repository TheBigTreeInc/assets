# Artist brief — reusable modular portrait packs

## Objective

Create compatible portrait components for a generator used by multiple games.
Each visual style is its own art pack. Deliver reusable parts designed together;
do not cut completed portraits into fragments.

## Deliverables per style

1. A shared alignment template, including canvas, head center, scalp/hairline,
   eye line, nose bridge, chin, ears, neck, shoulder line and clothing opening.
2. Separate RGBA PNG exports for every head, hairstyle, garment and accessory.
   All components in the pack retain the same full canvas and transparent padding.
   No automatic trimming, recentering, background, watermark or baked checkerboard.
3. Editable layered masters (Aseprite, PSD, Krita or equivalent). Keep facial
   anatomy, color regions and clothing/collar construction separately editable.
4. An asset list with stable IDs, filenames, labels, category and restrictions.
5. A contact sheet showing every head with the supported hair and clothing, plus
   representative combinations of accessories and colors.

Existing packs use 1254×1254 source canvases. That is a current asset size, not a
universal requirement. A new pack may use another approved canvas size; record it
in pack.json and keep every exported component in that pack consistent. Agree the
native working resolution and final export before producing the whole library.

Pixel art is currently sampled at 256 logical pixels. The everyday illustrated
pack is rendered at 512 logical pixels without pixel quantization. Other styles
can have their own declared logical resolution. Test detail at 256, 128 and 64px.

## Alignment and component boundaries

All interchangeable heads must use the approved camera and matching scalp, eye,
ear and neck landmarks. Vary facial anatomy without breaking hair or accessory
placement. Pose/viewpoint changes require a separately agreed rig.

- Heads: bald head, ears and a complete bare neck; no hair, clothing or accessories.
- Hair: hair only. Fit the approved scalp and hairline; keep skin/face areas clear.
- Clothing: garment only, with an intentional transparent neck opening. Preserve
  proportions and continuous neck connection. Keep front/rear collar construction
  on separate editable source layers, and provide an approved composite export.
- Accessories: one component per export. Glasses have transparent lens openings
  if the eyes should show. Masks, jewelry and implants contain no underlying face.

For the existing front rig, scalp top is approximately y=.21, eyes y=.51, chin
y=.82 and neck extends to y=.96; the supplied head template is authoritative.
Our old raw PNGs can have runtime offsets: use the head and assembled reference,
not an isolated old hair/jacket PNG, to establish final placement.

The supplied `templates/front-portrait-v1.svg` overlays the shared landmarks on
the everyday head. Keep its linked PNG beside the template's relative pack path.

Prefer exports already registered on the final canvas. Record any required scale,
offset and front-collar overlap explicitly. No undocumented per-character fixes.
Every accessory must fit every advertised head; list exceptions before approval.

## Color and style

Maintain consistent perspective, lighting, outline treatment and shading within
each pack. Everyday-life art uses casual clothes, natural hairstyles and ordinary
accessories, without cybernetics. Cyberpunk remains a separate pack.

For parts the player can recolor, deliver neutral grayscale shading. The game
applies colors at runtime. Keep dark outlines, middle tones and highlights useful
across light and dark skin/hair/fabric colors. Avoid broad near-white skin patches.
Keep any fixed-color iris/light details separately editable. Do not bake all color
choices into separate finished portraits. Fully colored non-recolorable layers
can be agreed separately and declared as such in the pack.

## First approval milestone

Approve two heads, two hairstyles, one garment and glasses inside the renderer
before producing the complete pack. Inspect neckline, jaw, scalp coverage,
accessory fit, transparency fringes and readability at icon sizes. Check every
supported combination again at final delivery.

Current runtime supports independent eye pairs (with eyebrows), noses and mouths.
Deliver a matching blank facial foundation for each head shape, with smooth
grayscale skin where the facial features attach. Keep the approved complete head
as a separate optional legacy/default asset. Deliver each eye pair, nose and mouth
as its own full 1254×1254 transparent image, registered to the same rig; do not
deliver cropped face pieces. Keep feathered edges narrow and alpha clean.
Use blue/cyan only in the irises for the runtime iris color channel; skin, brows,
nose and lips should be neutral grayscale. Supply the scale/offset declaration
if artwork needs a transform. Test both eye shapes, both nose shapes and both
mouth shapes across every blank head before final delivery. Inspect seam blending
under different skin colors and at 64, 128 and 256 pixels.

Brows currently travel with the eye pair. Separate brows, ears, facial hair,
expressions and linked front/back long hair still need an agreed extension.
The mixed collection accepts parts from both art styles; a stylistic mismatch
is allowed, but face/neck/feature registration must remain compatible.
