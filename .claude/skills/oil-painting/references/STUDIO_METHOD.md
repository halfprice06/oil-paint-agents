# Studio method: paint it like a trained painter

Earlier rounds failed for one reason: the paint surface is convincing, but the **drawing,
values and form** were not. Lemons read as striped tubes, trees as stamped blobs, skies as
combed bands. Fix that by working the way an academy-trained painter works: design first,
then masses, then form, then edges.

Read `PAINTER_GUIDE.md` for the brush API and `LESSONS.md` for what has gone wrong before. This file is the method to follow. (`$SKILL` is this skill's folder.)

## 0. Pick a subject you can actually carry

Choose something with **few, large, simple shapes** and one clear light source. Think of a
specific master painting's design (Chardin, Corot, Levitan, Sorolla, Whistler, Sargent's
oil sketches, Fantin-Latour) and borrow its composition and value scheme, not its subject.

## 1. Thumbnail study (SVG) before any paint

Draw your composition as an SVG at the painting's size, using only flat shapes in **4 values**
(light, light-middle, dark-middle, dark). Render it and look at it:

```
node $SKILL/scripts/sketch.js my-painting/study.svg
```

Iterate until the design reads at thumbnail size (`convert study.png -resize 160x x.png`):
a strong big-shape design, a clear focal point, unequal shape sizes, no tangents.
Then make `study_color.svg`: the same shapes with the colour of each mass, the light
side and shadow side of every object, cast shadows, and the soft gradients of sky / wall.
The SVG is your drawing and your eyes. Its shape coordinates may be reused in your pass
files (e.g. the lemon ellipse's centre and radii). **Never read pixels from it** and never
loop over it to place strokes; every stroke's position, direction, colour and size is your decision.

## 2. Passes

1. **Tone + drawing**: toned ground; a thin (`thin:0.8`, `load:0.5`) dark drawing of the big
   shapes and the shadow shapes with a small round brush. Then `p.dry()`.
2. **Block-in, dark to light** (sizes 30–120): fill every mass with its local colour in its
   shadow and its light, matching the colour study. Shadows thin, lights thicker.
   Cover the canvas. Do not dry: work into this wet.
3. **Turn the form** (sizes 12–50). For every object, paint the planes side by side as
   separate strokes of distinct value and temperature: light, half-tone, core shadow
   (darkest, on the form), reflected light (dim, cooler or warmer), cast shadow (darkest
   near the object, softening away). Strokes **follow the form** (around a sphere, along a
   cylinder, across a plane) and are laid **as patches, not parallel stripes**: vary length
   and direction, overlap, let neighbours touch.
4. **Edges** (blender, `load: 0`, sizes 15–60): drag a clean brush along or across the
   boundaries you want soft: turning edges of rounded forms, cast-shadow edges away from the
   object, the sky into the distance, the background into itself. Keep 2–4 edges razor sharp
   at the focal point. Lost-and-found edges are what makes it read as painted from life.
5. **Lights and accents** (sizes 6–20, `load: 1.3–1.5`): thick lightest lights on the
   forms facing the light, a few dark accents where forms touch, specular highlights as
   one or two thick touches. Fewer is better.

Optional `p.dry()` then thin glazes (`opacity: 0.25–0.45`) to deepen or unify shadows.

Budget: 500–1500 strokes. Loops are allowed for passes 2–4, but each loop must place strokes
whose position, size, angle and colour vary with intent (follow the form, change with the
light), never a grid.

## 3. Review like a teacher, every pass

After each pass, render and compare with your colour study:

- Side by side at thumbnail size (`convert final.png study_color.png +append -resize 600x cmp.png`).
  Do the big shapes and values match? Squint (`-blur 0x6`): is the value design intact?
- At 1x: does each object turn (light, halftone, core shadow, reflected light, cast shadow)?
  Are there parallel stripes, stamps, outlines or hairlines? Fix them.
- With a 2x crop (`render.js dir --scale 2 --crop x,y,w,h`): does the focal area hold up?

Keep backups: copy your pass files into `src/` before big rewrites. Write `notes.md` with an
`**Artist statement.**` line and an honest self-assessment.
