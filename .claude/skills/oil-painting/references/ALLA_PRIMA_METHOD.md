# Alla prima method (strict)

The goal is a painting that a gallery visitor would accept as a photograph of a real oil painting
on canvas. That means a painter's economy: few, large, deliberate strokes; mostly greyed, related
colour; and decisions about value before anything else.

## 1. Plan before painting (write plan.md)
- Subject, light direction, time of day, and the single focal point.
- A value plan: describe the picture as 3-5 large value shapes (e.g. "sky = value 8, distant hills = 6,
  water = 5, near bank = 2"), using a 1 (black) to 9 (white) scale. Most of the canvas should be
  large simple shapes; small detail only at the focal point.
- A limited palette of 4-7 pigments (e.g. titanium white, yellow ochre, cadmium red, ultramarine,
  burnt umber, plus 1-2 accents). Every mix comes from these, as palette-mix arrays.
- A stroke budget: rub-in under 40 strokes, block-in under 200, refinement under 200, accents under 60.
  Total under 500. Count them (render.js prints counts).

## 2. Passes
1. Toned ground (painting.json `ground`) - a mid value, usually warm.
2. Rub-in: thin (`thin: 0.6-0.9`), big brushes, one dark transparent mix (e.g. burnt umber + ultramarine)
   placing the dark masses and the drawing. Then `p.dry()` - the only dry in the painting.
3. Block-in: biggest brushes (size 40-120 in a 1000 px canvas), opaque paint, the large value shapes,
   dark to light, wet-into-wet. Big shapes first, edges soft.
4. Refinement: medium brushes (15-40), turn the forms with planes of colour (light / half-tone / shadow /
   reflected light), find a few hard edges, lose the others.
5. Accents: small brushes (6-15), thick paint (`load` 1.2-1.5), highlights and darkest darks, only at the
   focal point and a few echoes. Stop early.

## 3. Rules
- No stroke narrower than 6 px except at most 10 tiny accents.
- No outlines. No ruler-straight lines. No rows, rings, grids or evenly spaced repeats.
- A loop may place at most ~20 strokes and every parameter must vary (position jitter, size, angle,
  length, pressure, load, mix).
- Every stroke should describe a plane, an edge or a direction of form. Short strokes for turning forms,
  long sweeping ones for sky, water and fields.
- Keep colour greyed and related; save saturated colour for the focal point.
- Leave some of the toned ground and rub-in showing, especially at the edges and in the shadows.

## 4. Review loop
After every pass, render at 1x and look at it, then look at a 2x crop of the focal area
(`--scale 2 --crop ...`). Ask: "Would a gallery visitor believe this is a photograph of a real oil
painting? What gives it away?" Fix the biggest give-away first. Expect to redo passes.
