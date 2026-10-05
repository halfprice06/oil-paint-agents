# Painter's guide to the oil studio

You are painting a real-looking oil painting **one brushstroke at a time**. The engine
(`oilpaint.js`) simulates a bristle brush dragging oil paint across a linen canvas:
every bristle carries its own paint, deposits it, runs dry, picks up wet paint that is
already on the canvas (so wet strokes blend into each other), skips across the canvas
weave when it is low on paint, and leaves a raised, ridged surface that is lit as impasto.

There are no filters, no fills, no images, and no way to read pixels back. The only
thing that makes marks is a brushstroke you place.

## Files

```
my-painting/
  painting.json            {"title","artist","width","height","ground","seed","passes":[...]}
  01_toned_ground.js       one file per painting session / layer
  02_block_in.js
  ...
```

Render (takes a few seconds to a minute):

```
node $SKILL/scripts/render.js my-painting --progress
node $SKILL/scripts/render.js my-painting --upto 2          # only the first 2 passes
node $SKILL/scripts/render.js my-painting --crop 300,200,300,300 --zoom 3   # inspect detail
```

Outputs `final.png` (or `detail.png` for a crop), `progress/<pass>.png`, and `strokes.json`
(the full stroke log, used to replay the painting being painted). Look at the PNGs with
your image-reading tool after every pass and correct what you see.

Engine versions: a stroke log replays exactly only on the engine that painted it. A painting folder
with an `ENGINE` file containing `v4` (or `v3`, `v2`) is rendered with that older engine, which
does not have `brush: 'soft'`, `taper` or `edge`. New paintings need no `ENGINE` file (current
engine, v5). Don't add v5 options to a v4 painting's passes; that painting stays on v4.

## The brush API (variable `p` inside each pass file)

```js
p.stroke({
  points:  [[x, y, pressure], ...],  // the path of the brush; pressure 0..1, optional
                                     // (omit pressure everywhere and the stroke tapers naturally)
  color:   'ultramarine' | '#2a3a9a' | [['ultramarine', 1], ['titanium_white', 3], ['burnt_umber', 0.3]],
  color2:  optional second colour loaded on one side of the brush (double loading)
  brush:   'flat' | 'round' | 'filbert' | 'fan' | 'knife',   // default flat
  size:    width in px,           // default 20
  load:    0..1.5 paint on brush,  // 1 = normal, 0.2-0.4 = dry brush/scumble, 1.3 = juicy impasto
  opacity: 0..1,                   // < 1 = transparent glaze over dry paint below
  angle:   radians,                // fix the brush orientation (calligraphic flat marks);
                                   // otherwise the brush face stays square to the direction of travel
  thin:    0..1,                   // more medium: flatter, smoother, thinner paint
  taper:   0..1 | [start, end],    // feathered ends: fraction of the stroke over which paint fades in/out
  edge:    0..1                    // soft sides: paint thins towards the stroke's edges (default 0)
});
// load: 0 is a clean, dry blending brush: it carries no paint of its own, it picks up the wet
// paint it touches and drags it along, softening and melting edges (colour is ignored).
p.stroke({points: [...], brush: 'filbert', size: 30, load: 0, color: 'titanium_white'});
// brush: 'soft' is a dry badger / mop blender (v5). It carries no paint: it averages and diffuses the
// wet colour under it across its width and a little along the stroke, melting an edge or a
// gradient without bristle striations or plowed ridges. It gently flattens relief and keeps some
// paint texture. opacity = strength (0.3-0.6 for a light touch). Only works on wet paint.
p.stroke({points: [...], brush: 'soft', size: 50, opacity: 0.8});   // (or load: 0, soft: true)
p.dab({x, y, color, size, brush, angle, load, pressure})  // a single short touch
p.dry()                 // the painting dries: later strokes no longer pick up / blend with it
p.random(), p.rand(a, b)   // seeded randomness (use these, not Math.random, for reproducibility)
p.mix([['cadmium_red',1],['titanium_white',2]])  // -> '#hex', premix on the palette
p.width, p.height, p.pigments
```

Pigments: titanium_white, zinc_white, ivory_black, lamp_black, paynes_grey, cadmium_lemon,
cadmium_yellow, naples_yellow, yellow_ochre, raw_sienna, cadmium_orange, cadmium_red,
vermilion, alizarin_crimson, quinacridone_rose, burnt_sienna, venetian_red, burnt_umber,
raw_umber, van_dyke_brown, ultramarine, cobalt_blue, cerulean, prussian_blue, phthalo_blue,
manganese_blue, viridian, phthalo_green, sap_green, chromium_oxide, terre_verte,
cobalt_violet, dioxazine_purple, flesh_tint. Palette mixes use Kubelka-Munk pigment
physics: opaque pigments (titanium white, cadmiums, ochres, cerulean, chromium oxide) cover; transparent
ones (alizarin, phthalos, prussian, sap green, ultramarine, dioxazine) are dark in masstone and stain
white strongly, so a little goes a long way. Mix the way a painter would.

## How the paint behaves (use it)

- A loaded brush lays thick paint that fades and breaks up as it runs out along the stroke.
  Long strokes end dry and scratchy; reload (start a new stroke) for solid colour.
- The brush shoves wet paint: dragging through wet paint pushes a little ridge of it to the stroke's
  edges and leaves a lip where the brush lifts. Knife strokes push much more.
- Wet paint blends: a stroke dragged through wet paint picks up that colour and smears it.
  Great for soft edges and skies; muddy if you overwork. Call `p.dry()` between sessions
  (e.g. after the block-in) to paint crisp layers over dry paint, like a real painter
  waiting a day.
- Low `load` + light pressure catches only the canvas tooth: broken colour, scumbles, sparkle.
- `opacity` 0.2-0.5 over dried paint = glaze (deepens shadows, unifies colour).
- Thick light paint in the lights, thinner darker paint in the shadows reads as real oil.
- Stroke direction is everything: follow form (curve strokes around a round object,
  horizontal for water, radiating for foliage, short directional dabs for leaves/petals).

## Blending and soft ends (engine v5)

- **Which blender.** `load: 0` with a bristle brush drags paint and leaves dry-brush striations and
  a ragged ridge: use it where you want the blend to show the brush (grass, rough skies, hair).
  `brush: 'soft'` melts without marks: a sky gradient laid in bands, the turning edge between light
  and shadow on a face or an apple, the edges of a cloud, atmospheric distance. Size it at 1.5-3x
  the width of the zone you want to melt. Two or three light passes (`opacity` 0.4-0.7) at varied
  angles beat one heavy pass; zigzag across a boundary, then one long stroke along it.
- **Don't soften everything.** A soft-blended area next to crisp strokes reads as oil paint; a whole
  canvas run over with the soft brush reads as an airbrushed digital image. Soften turning edges and
  the distance, keep accents, lights and the focal edge sharp, and paint some strokes after blending.
- **It needs wet paint.** Blend in the same pass, before `p.dry()`. On dry paint it does nothing.
- **taper.** Strokes now have a gentle default taper: short touches and dabs get rounded,
  lighter, slightly broken ends instead of blunt stamped ones; long strokes keep their body.
  Set `taper: [0.3, 0.6]` (fade in over 30% of the stroke, out over 60%) for strokes that melt into
  their neighbours: petals, grass blades, feathered hair, wisps of cloud, the tail of a wave.
  `taper: 0` gives v4's blunt ends (crisp architectural or knife-like marks).
- **edge.** `edge: 0.5-0.8` makes the stroke's sides thin out so they sink into wet paint below:
  soft modelling strokes on skin, cloud masses, out-of-focus backgrounds. Keep 0 for crisp marks.

## Working method (as a painter would)

1. Tone the ground (`ground` in painting.json, or a thin `thin:0.8` wash of e.g. burnt sienna).
2. Drawing / underpainting: thin, dark, monochrome lines and masses placing the composition.
3. Block in big shapes with big brushes, dark to light, ignoring detail. Dry.
4. Develop form: mid-size brushes, temperature shifts, edges soft/hard where they matter.
5. Details and highlights last: small brushes, thick light paint, knife for accents.

Hand-place strokes with intent. Loops are fine for repetitive marks (a field of grass,
sky strokes), but vary length, angle, size, colour and pressure, and place them where
the form needs them; mechanical grids of identical strokes look like a machine, not a painter.
Expect hundreds to a few thousand strokes for a finished painting.

## Painterly realism: make it look like a real oil painting

The aim is a real painting on an easel, not a photograph and not digital art.
What gives a canvas away as computer-made, and what to do instead:

- **Perfectly mixed flat colour.** Give colours as palette mixes, `[['ultramarine',2],['burnt_umber',1],['titanium_white',3]]`,
  not as hex or `p.mix()` results. The engine then loads each bristle with a slightly different,
  imperfectly stirred proportion, so strokes carry streaks of the separate pigments (broken colour).
  Change the mix a little from stroke to stroke, as a painter remixing on the palette would.
- **Repetition.** Identical strokes at even spacing (rows of dashes, stamped dabs, grids, rings)
  read as a pattern generator. Vary length, width, angle, pressure, load and spacing every time;
  cluster marks and leave gaps; let a few strokes be big and decisive.
- **Hard outlines and thin ruler-straight lines.** Painters model with planes of colour, not outlines.
  Where a line is needed (a mast, a branch), make it from 2-4 slightly wobbling strokes with varying
  pressure, broken in places.
- **Every edge equally sharp.** Use lost-and-found edges: sharp only at the focal point and where
  light meets dark; elsewhere drag one area into the next wet-into-wet.
- **Everything finished everywhere.** Leave the toned ground or the block-in showing in places,
  especially in the shadows and at the edges of the canvas. Thin dark shadows, thick light lights.
- **Uniform detail.** Concentrate detail and contrast at the centre of interest; simplify the rest
  into big, suggestive strokes.
- **Bright pure colour.** Real paintings are mostly greyed, related colours with a few saturated
  accents. Knock pure pigments down with their complement or an earth colour.
- **Gradients made of parallel stripes.** Blend by dragging a stroke through wet paint, crossing
  strokes at varied angles, or melting the steps with a few `brush: 'soft'` passes, not by leaving
  stacked stripes of stepped colour.

The paint surface itself (bristle grooves, ridges at stroke edges, paint piling up where the brush lifts)
comes from the engine; your job is the hand and the eye.

## High resolution

Your stroke coordinates and sizes are in the painting's own units. `--scale 3` re-simulates the same
strokes on a 3x larger canvas (finer bristles and weave), writing `final_3x.png`. It takes a few minutes,
so iterate at 1x and check the real surface with a scaled crop, e.g.
`render.js my-painting --scale 2 --crop 600,500,800,600` (crop coordinates are in scaled pixels).
At high resolution every stroke is seen up close: thin 2-5 px strokes read as digital lines, repeated
small marks read as stamps. Give marks real brush sizes and let them vary.
