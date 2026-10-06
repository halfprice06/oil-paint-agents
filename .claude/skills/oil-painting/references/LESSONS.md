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

8. **Painting symbols instead of light.** The deepest failure. A painter agent writes coordinates
   from concepts ("a hand is a palm plus five fingers", "a cloud is bumps", "a person is a peg")
   and gets sausage fingers, doll crowds, cotton-ball clouds and confetti ground. More strokes
   and more resolution don't fix it. Paint value masses, then two or three planes of light and
   shadow per form, then edges; work from a lit reference (looking, never sampling pixels); and
   check a crop every few dozen strokes instead of after a whole pass.

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

## Figure and detail lessons (millennial-fair v6, Oct 2026)

- **Look it up.** Faces stopped reading as dolls only when the painter looked at real face photos
  (sources listed in `examples/millennial-fair-v6/reference/FACE_REFS.md`) beside the lit 3D reference. The same goes for any small
  form: stones, planks, leaves. The photo need not match the scene; it shows how light sits on that
  kind of form.
- **Shadow first on each form.** In v6 the brush carries residue, so a shadow laid over wet light paint
  picks up the light and the form goes flat. Lay the shadow band on bare ground, then the half-tone,
  then the light thickest on a clean brush (`clean: true`), then melt the turns with the soft blender.
- **Faces need a separate pass and a 4x check in context.** A face that reads at 1x can be stroke
  patches at 4x. Paint it at face-scale brushes, then check at 1x, 2x and 4x on a fresh copy of the scene.
- **Use the strongest model for faces and hands.** The faces that read as real came from the strongest
  painter model; weaker models produced symbols.
- **Hard lines across a plane look like construction marks.** A flat brush laid at an arbitrary slant on
  the deck gave spikes. Painting each plank as horizontal rows (one smooth lit plane) and then drawing
  the gap, bevel and grain with a round brush along the perspective rays worked.
- **Irregularity has to be designed in.** A paving pattern on a jittered grid still reads as a grid:
  vary the stone sizes (cobbles to long slabs), skew the corners, vary the tone across the field, and
  break the joints. Even joints and same-size stones are what give a pattern away.
- **Lost edges join a figure to its ground.** Where figure and background are close in value, veil the
  contour with the background's tone; keep found edges on the light side.
- **More strokes alone stop helping.** Past about 30k on a 2400x1600 canvas, rewrites of weak areas did
  more than extra strokes. v6 engine features (glaze, scumble, knife, dirty brush) only help when a
  painter uses them on purpose; replaying old strokes on v6 changed little.
- **Rounds can regress.** Keep every round's passes and compare crops side by side before merging.


## Parallel painters on one canvas (zeal-kingdom-in-the-sky, Oct 2026)

- **Four painters, one block-in, merge by layer.** Give each painter a copy of the whole scene's block-in and the
  colour study, one area each (sky, cloud sea, island, palace), its own folder and a numbered pass range, and
  merge the built passes in depth order. Painters test against the shared block-in, so they see their area in
  context without waiting for each other. Critique from the merged render, not from each folder's render: the
  island's underside looked fine alone and became a grey smear over the cloud painter's repainted deck.
- **The block-in's relief ghosts through.** Thick vertical strokes in the block-in (a dome, tower cones) left
  ridges that showed through every later sky pass as a striped silhouette. Block in shapes that later layers
  must cover thinly (`thin: 0.9`, `load: 0.5`), or not at all.
- **Stroke budgets have a ceiling per area.** Painters asked for 9-14k strokes delivered 3.5-7k and could not
  spend more without damage: extra marks on existing forms became confetti, bricks, fur or speckle. Added
  content (a second island, a cloud tower, an arcade and stair, garden walls) added strokes that read; added
  texture did not. Ask for forms, not counts.
- **Values before form before surface.** The cloud deck went through three rounds: first a row of lumps, then
  recession, then values (lit tops to cream-white), and only then form (one tower, one bank, drifts). Each round
  fixed one thing; asking for all three at once produced none of them.
