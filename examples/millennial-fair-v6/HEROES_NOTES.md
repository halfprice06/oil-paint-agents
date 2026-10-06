# Hero figures: notes and honest self-assessment

## Deliverables
- `30_crono.js` (1549 strokes), `31_lucca.js` (912), `32_marle.js` (2596). Total about 5,060 strokes.
- Each file is self-contained, in full 2400x1600 canvas coordinates, and starts with `p.dry(); p.wipe()`.
- They are built from `src2/` by `build2.sh <crono|lucca|marle>`: `src2/lib.js` plus the figure's numbered parts, sorted. The older `src/` and `build.sh` are the previous painter's and are no longer used.
- Test render: `merge.sh` copies the scene painter's current passes (00–27) into `merge-test/` and appends the three hero passes. `merge-test/final.png` was rendered with `studio/render.js`.

## Method
- References: master.png and master.json for pose, joints and scale; `reference/faces/` photos; Sargent's *Helen Sears* and Sorolla's *Strolling along the Seashore* for handling (`refs/README.md`). I looked at them only; I never sampled or traced pixels.
- Order per form: shadow band first on bare ground, then the half-tone, then the light, thickest and on a clean brush, then soft-blender melts at the turns. Doing the shadow first matters in v6: when the shadow went on over wet light paint, it picked up the light and the forms went flat.
- Faces and hands were done as separate passes and checked at 4x in context. Whole figures were checked at 1x and 2x on a fresh copy of the scene.

## Self-assessment (honest)
- **Marle (focal point).**
  - At 1x and 2x she reads as a young woman whose head is tipped back in three-quarter view. The eyes are the best part. The jaw shelf, ear, neck and violet rim are placed correctly, and the ponytail streams back.
  - At 4x the face is still a sketch, not Sargent-level. The skin shows stroke patches, the nose bridge is weak, and the far cheek and jaw contour is somewhat heavy. The light planes read, but not with the authority of a master's three-value face.
  - The jumpsuit now has real light, half-tone and shadow bands. The legs read as forms, and the boots are smooth, shaded leather.
  - The arms are slender but still close to tubes: the elbow and forearm anatomy is understated.
  - The reaching hand and the raised hand read as hands at 2x. At 4x the fingers are too uniform.
- **Crono.**
  - His head was rebuilt. The flame of crimson hair spikes works, the profile now has brow, nose, open mouth, ear and jaw, and the bandana has a knot and twisting tails.
  - The body is the weakest area in the whole set. The tunic is a fairly flat light-blue shape, the limbs are simplified forms, the far boot is a slab, and the katana is a plain dark line.
  - At 1x he reads as Crono running. At 2x the body looks illustrative rather than painted from life.
- **Lucca.**
  - Her face was repainted clean and young, after the old version read as elderly. The glasses, bob, smooth helmet and antenna are in place.
  - The legs, knees and boots were rebuilt as forms, and there is a contact shadow on the stage.
  - The arms are still blocky teal shapes, and the hands are summary.
- **Budget.** At about 5k strokes, I used well under the 12–15k budget. The added effort went into rewrites rather than more strokes. More passes on Marle's face and hands, Crono's tunic and the arms would be the next step.
- **Scene changes.** The scene painter keeps changing the parent passes (27_spill was added during my last session). Re-run `merge.sh` and re-render to check the figures against the latest scene.

## Round 2 (after the coordinator's review)
- **Marle's arms** are rebuilt from their parts:
  - Upper arm: deltoid cap with the dip where it inserts, biceps swell on the sunlit side, triceps hanging in the cool shadow.
  - Elbow: a bony point and a soft crease.
  - Forearm: full near the elbow, then flattening to the wrist.
  - Painting order per segment: shadow first, then the cool half-tone, then the warm light. The violet rim sits on the side toward the gate. The jumpsuit's armholes lie over the arm roots.
- **Marle's skin palette** is cooler:
  - Rose-grey half-tones, and violet from the gate in the shadows (a new `SK.cool`).
  - More rose in the blush and lips. The warm yellow is kept for the lights only.
  - The neck is lighter and cooler.
- **Crono:**
  - Tunic: pull folds from the shoulders and deeper skirt troughs.
  - Boots: both repainted as forms. The far boot's foot is bent at the ankle with its sole turned up and back; the near boot has a lifted heel and a shadow on the plaza.
  - Katana: a lacquered scabbard with a sunlit highlight, a darker underside, metal fittings and a cord.
  - Legs: a knee cap and calf swell. The trouser lights are less yellow.
- **Lucca:**
  - A weight shift: `lib.js` now has an optional pose warp, `XF`. Her upper body leans back from the waist, recoiling from the gate, while the legs stay put.
  - The relaxed leg has its heel lifted.
  - Sleeve folds, and form in the tunic from scumbles and glazes.
- **Finish passes** (`crono_60_finish`, `lucca_40_finish`, `marle_60_finish`), each starting with `P.dry()`:
  - Transparent glazes deepen the shadows.
  - Broken `scumble` light goes on the lit cloth.
  - Lost edges: a soft veil of the background's tone over contours where figure and ground are close in value (Marle's shadow side into the gate, Crono's back into the plaza, Lucca's dark side into the telepod). The light sides keep found edges.
- **Still weak:**
  - Hands at 4x (fingers too even).
  - Lucca's arms are still simple.
  - Crono's tunic is still more illustration than cloth.
  - Stroke total is still about 6k, well under budget. The work went into rewrites, not stroke count.
