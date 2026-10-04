# Lessons learned

What we learned getting AI agents to make oil paintings that pass as real ones, stroke by stroke,
over several rounds of engine work and painter critique.

## What makes a digital painting give itself away

1. **Drawing, values and form matter most.** Once the paint simulation was decent, every failed
   painting failed on design and form: objects drawn as outlines, forms made of parallel
   stripes, trees as stamped blobs. Planning the design in a value study first gave the biggest
   single improvement.
2. **Parallel stripes.** Stacking strokes of the same width side by side to build a gradient
   or a form reads as a machine. Real painters lay patches at varied angles and drag one into
   the next.
3. **Stamps.** Many short marks of the same size and shape (foliage, foam, lights) read as a
   pattern generator. Use fewer, larger, multi-point strokes, and keep small touches for edges.
4. **Uniform edges.** Real paintings have lost-and-found edges: sharp at the focal point and
   where light meets dark, melted elsewhere. Use the blender (`load: 0`).
5. **Colour computed by formula.** Choosing each stroke's colour from a lighting formula gives an
   airbrushed, plastic look. Pick colours from a colour study, with deliberate variation.
6. **Saturation.** Pure pigments look digital. Real paintings are mostly greyed, related colours
   with one or two saturated accents.
7. **Smooth everything.** Too much blending gives a digital smudge. Leave strokes visible and
   ground showing in places, with thin shadows and thick lights.

## Engine lessons (oilpaint.js)

- **Bristles as clumps** with their own paint reservoirs give natural run-out, dry-brush and
  ragged ends. Each bristle picks up wet paint from the canvas, so wet-into-wet blending happens
  for free.
- **Kubelka-Munk mixing** in linear RGB, with a per-pigment scattering (hiding power) table,
  makes palette mixes behave like paint. Opaque pigments cover; transparent ones stain white.
  (Mixbox was avoided because of its non-commercial licence.)
- **Imperfect mixing:** for a palette mix, each bristle carries a slightly different proportion,
  in smooth ribbons across the brush. Too much per-bristle randomness gives fine colour stripes.
- **Bow-wave transport** (after Baxter et al., *IMPaSTo*, NPAR 2004): the brush shoves wet paint
  ahead and to its sides and releases it behind, so ridges form at stroke edges.
  Dumping the whole bow at the end of a stroke made bead artifacts, so don't.
- **Relief has two scales.**
  - Coarse: the thickness field, smoothed and compressed (`a/(1+0.18a)`) so overlapping
    strokes don't form tubes.
  - Fine: per-bristle grooves (a few broad furrows plus fine hair marks) that scale with
    resolution (`0.25 * sc^1.6`).
  Flattening the fine grooves made 3x renders look like a digital smudge; making them too
  strong at 1x made everything look combed.
- **Lighting:** diffuse shading from the height field, cavity darkening from a blurred height
  field, and an oil-gloss specular (sharp glints plus a faint broad sheen).
- **Blender brush:** a `load: 0` stroke carries no paint; it picks up and drags wet paint,
  plows only a little, and leaves dry-brush striations. These striations are very
  characteristic of real paintings.
- **Dabs:** a single-point stroke is a short curved drag with press-in and lift-off pressure, not
  a stamped rectangle. Filbert and round brushes get rounded ends.
- **Bugs to watch:**
  - Negative bristle paint (deposit larger than the reservoir) produces NaN that spreads through
    the blur as black patches; clamp it.
  - Guard 0/0 in colour blends.
- **Determinism:** every stroke seeds its own RNG from (seed, stroke index), so a stroke log
  replays exactly, but only on the same engine version. Old versions are kept in
  `scripts/legacy/`.
- **High resolution:** `--scale 3` re-simulates the same strokes on a 3x canvas (finer bristles,
  weave and grooves). Judge the surface from 2x or 3x crops; the 1x image hides most of it.

## Method lessons (for the painting agent)

- **SVG value study first** (`sketch.js`), then a colour study. Iterate until the design reads at
  thumbnail size. Reuse its shape coordinates, but never sample its pixels.
- **Pass order:**
  1. Tone the ground and draw.
  2. Dry.
  3. Block in, dark to light.
  4. Turn the form (light, halftone, core shadow, reflected light, cast shadow).
  5. Edges with the blender.
  6. Thick lights and accents.
- **`p.dry()` ends blending.** Softening must happen in the same pass as the strokes it softens.
  Overlays on dried paint (haze, reeds, highlights) tend to look pasted on.
- **Drawing strokes can ghost through** later paint as halos. Keep the drawing inside the shapes,
  and thin.
- **Critique rounds work.** A second agent (or you) looking at the render and naming the three
  worst problems, in plain painter's terms, improved every painting. Two to four rounds is
  typical.
- **Critique can make it worse.** A later round sometimes loses what worked (a seascape's wave lost
  its curl; a cloth added to a still life read as a plate). Back up every round, compare them
  side by side, and ship the best, not the latest. Dropping a weak pass is often the best edit.
- **Mixing notes:**
  - Ultramarine with burnt umber goes brown; Payne's grey with white gives cleaner greys.
  - Viridian is neon on its own; yellow ochre is strong.
  - Loaded strokes of white look like toothpaste; use translucent veils (`opacity` 0.3) for foam
    and mist, plus a few thick touches.
- **Render time:** a 3x render takes 5–35 minutes depending on brush sizes. Run it in the
  background, and don't `pkill` broadly when other renders may be running.
