---
name: oil-painting
description: Paint a realistic oil painting one brushstroke at a time in JavaScript with a bristle-level oil paint simulator (no filters, no source images). Use when asked to make an oil painting, a painterly image made of brushstrokes, or to run painter agents.
---

# Oil painting, stroke by stroke

You make a painting by writing JavaScript pass files that place brushstrokes. The engine
(`scripts/oilpaint.js`) drags simulated bristles through oil paint on linen. Each bristle
carries its own paint, runs dry, picks up wet paint already on the canvas, and skips across
the weave. The paint piles into ridges, and the surface is lit as impasto.

There is no image input and no way to read pixels back. Every mark is a stroke you choose.

## Read first

- `references/PAINTER_GUIDE.md`: the brush API, pigments, and how the paint behaves.
- `references/STUDIO_METHOD.md`: the method to follow (value study, then passes, then review).
- `references/LESSONS.md`: what made earlier paintings look digital, and how it was fixed.

Below, `$SKILL` means this skill's folder (for example `.claude/skills/oil-painting`).

## Quick start

```
my-painting/
  painting.json   {"title","artist","width":1000,"height":700,"ground":"#8a6a4a","seed":1,
                   "passes":["01_drawing.js","02_block_in.js","03_form.js","04_edges.js","05_accents.js"]}
  study.svg       your 4-value thumbnail (and study_color.svg)
  01_drawing.js   ... one file per pass; each runs with `p` in scope
```

```js
// 02_block_in.js
p.stroke({ points: [[40, 120], [300, 110], [560, 130]],
           color: [['ultramarine', 1], ['titanium_white', 4], ['burnt_sienna', 0.2]],
           brush: 'flat', size: 70, load: 1 });
p.stroke({ points: [[200, 300], [260, 340]], brush: 'filbert', size: 30, load: 0, color: 'titanium_white' }); // blender
```

Commands:

```
node $SKILL/scripts/sketch.js my-painting/study.svg        # render your SVG study to PNG to look at it
node $SKILL/scripts/render.js my-painting --progress        # final.png, progress/<pass>.png, strokes.json
node $SKILL/scripts/render.js my-painting --scale 2 --crop 600,400,800,600   # inspect the surface up close
node $SKILL/scripts/render.js my-painting --scale 3         # final_3x.png, the deliverable (5-35 min)
```

After every pass, look at the PNGs with your image-reading tool and fix what you see. Judge the
paint surface from 2x crops. Keep backups of pass files before big rewrites.

## Rules

- No filters, no pixel reading, no source photos. Use `p.random()` and `p.rand()`, never
  `Math.random`, so the painting replays exactly.
- Don't loop over an image or grid to place strokes. Loops are fine for a group of marks when
  their position, size, angle and colour vary with intent.
- A `strokes.json` replays only on the engine version that made it. Old engines are in
  `scripts/legacy/`; an `ENGINE` file (e.g. `v4`) in a painting folder makes `render.js` use one.

## Running several painter agents

Give each agent one painting folder, these three references, and the rules above. Ask for an
honest self-assessment in `notes.md`. Then critique each render in plain painter's terms
(the three worst problems first) and send it back for 2–4 rounds. That loop improved every
painting more than any single engine change.
