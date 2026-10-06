# pose3d: lit 3D reference for figures

Your figures come out as dolls because you draw your own reference from what you know about
bodies. pose3d gives you something to observe instead: articulated mannequins with real
anatomical masses (cranium and jaw, neck, ribcage, pelvis, shaped thighs and calves, forearms,
mitten hands with thumbs, feet), simple clothes and hair, posed in a three.js scene with a sun,
sky light, coloured point lights and soft cast shadows. The camera matches your painting's
canvas, so a render lines up with your composition pixel for pixel.

**Rule: LOOK, never sample.** Open the renders with your image tool and paint what you see:
where the light plane turns into shadow, how big the cast shadow is and which way it falls, how
the head overlaps the shoulder, how the far arm gets smaller. Do not read pixel colours or trace
outlines in code. Every stroke's position, shape and colour stays your decision. The colours are
flat local colours lit by a simple renderer, not a palette.

## Quick start

```bash
cd /tmp
node $SKILL/scripts/pose3d/pose3d.js \
     $SKILL/scripts/pose3d/examples/millennial_fair.json \
     /tmp/myref/fair.png
```

Run node from `/tmp` and use absolute paths. Nothing has to be installed: three.js is vendored in
`vendor/` and Chromium comes from `/opt/pw-browsers` (do not run `playwright install`). A full
2400x1600 render with about 150 figures takes about 20 s per pass. Four crops at 1.5x with four passes
each take about 2 minutes in total.

Options:

| flag | meaning |
|---|---|
| `--passes lit,value,notan,flat,id,parts` | which images to make (default: `scene.passes` or `lit`) |
| `--crop x,y,w,h` | render only this canvas rectangle (canvas pixels)... |
| `--scale 2` | ...at 2x resolution (also works without `--crop`) |
| `--crops-only` / `--no-crops` | render only, or skip, the crops listed in `scene.crops` |
| `--ss 2` | supersample for smoother edges (slower) |
| `--poses` | print the named poses |

Outputs, for `out.png`:
- `out.png`: lit render, at canvas size.
- `out_value.png`: greyscale values of the lit render. Use it to judge light and shadow masses.
- `out_notan.png`: the values posterised to `scene.notanSteps` (default 5) steps.
- `out_flat.png`: unlit local colours, with no light and no shadow.
- `out_id.png`: one flat colour per figure on black. Use it to see who overlaps whom in a crowd.
- `out_parts.png`: one colour per body mass (head, ribcage, pelvis, upper arm, forearm, hand,
  thigh, shin, foot). Use it to read gesture and foreshortening.
- `out_<crop>_<pass>.png` for each crop in `scene.crops` (for crops the lit pass is also suffixed: `out_crono_lit.png`).
- `out.json`: for every figure you listed by hand (not crowd extras): `joints2d` (canvas pixel
  of every joint: pelvis, spine, neck, head, shoulderL/R, elbowL/R, wristL/R, hipL/R, kneeL/R,
  ankleL/R), `screenBox` (a generous box from the 3D bounding box), distance and yaw. Use these numbers to
  place your gesture lines. They are positions, not colours.

## How to use it while painting

1. Build or copy a scene JSON for your painting (start from `examples/millennial_fair.json`).
   Match the horizon, the sun direction and where each figure's feet stand.
2. Render it and look at the full image next to your canvas. Fix placement, facing and pose in
   the JSON until the gesture is right. A render takes seconds, so iterate on the reference, not the paint.
3. Add `crops` around each focal figure at `scale` 1.5 to 2, and render `lit` + `value`.
4. Paint with the crop of your canvas and the same crop of the reference **side by side**
   (`convert canvas.png -crop WxH+X+Y`, then view both). Check one thing at a time: the shape of the shadow mass
   on the body, the cast shadow on the ground, the line where the head meets the shoulders, and
   the relative sizes of near and far limbs.
5. Translate, don't copy. The mannequin has no faces, fingers or cloth folds. It gives you the big
   planes, overlaps, proportions and cast shadows. Invent costume and character on top of them in paint.
   Push the colour (violet shadows, warm light) as your palette demands.

## Scene JSON

Units are metres. Y points up. The default camera looks along −Z, so +X is screen right and +Z
comes toward the viewer.

```jsonc
{
  "camera": { "width": 2400, "height": 1600, "fov": 40,          // vertical FOV, degrees
              "eyeHeight": 3.6, "horizonY": 520,                  // horizon lands on this canvas row
              "x": 0, "yaw": 0 },                                 // or: "position":[x,y,z], "lookAt":[x,y,z]
  "sun":   { "azimuth": -108, "elevation": 24,    // az 0 = from behind the viewer, -90 = from the left,
                                                  // ±180 = from the far side (backlight)
             "color": "#ffd6a0", "intensity": 3.2,
             "softness": 1.3, "samples": 4 },     // penumbra: angular radius (deg) and number of jittered shadow lights
  "sky":   { "color": "#a8c4e4", "ambientSky": "#9ec0ea", "ambientGround": "#d0a878", "intensity": 1.1 },
  "ground":{ "color": "#d2b484" },
  "exposure": 1.0,
  "lights":[ { "at": [1776,1095], "y": 2.2, "offset": [0,0,0.8], "color": "#8060ff", "intensity": 35 } ],
  "props": [ { "type": "disc|box|sphere|dome|cylinder|cone", "at": [px,py], "y": 1.9, "offset": [dx,dy,dz],
               "size": [...], "color": "#...", "emissive": "#...", "emissiveIntensity": 1,
               "faceCamera": true, "castShadow": false } ],
  "figures": [ ... ],
  "crowds":  [ ... ],
  "crops":   [ { "name": "crono", "x": 380, "y": 950, "w": 700, "h": 650, "scale": 1.5 } ],
  "passes":  ["lit", "value"]
}
```

`at: [px, py]` means *the ground point under this canvas pixel*: the tool casts a ray from the
camera onto the ground plane. So you place figures by where their feet stand on your canvas. The
height in metres plus perspective then decides how big they are. If a figure comes out bigger or
smaller than in your painting, the perspective is telling you something. Move its feet, or
change `eyeHeight` / `horizonY`. Do not just scale the figure.

Point-light intensity is in candela-like units with inverse-square falloff. Something like 20–60
lights a figure 2–3 m away.

### A figure

```jsonc
{ "name": "marle",
  "preset": "male | female | boy | girl | child | elder",   // proportions (teen boy/girl ~1.6 m, child ~1.2 m, 6 heads tall)
  "height": 1.6, "build": 1.0,          // build = girth (0.85 slim .. 1.3 heavy); "headScale", "shoulders", "hips" also exist
  "at": [1720, 1300],                   // or "position": [x, 0, z]
  "facing": 180,                        // yaw, degrees: 0 = faces the viewer, 180 = back to the viewer, 90 = faces screen right
  "faceToward": [1776, 1045],           // or face the ground point under a canvas pixel ("facingOffset" adds degrees)
  "faceCamera": true,                   //   or face the viewer
  "ground": true,                       // feet are dropped onto the ground (or onto a raised surface at "lift" metres)
  "lift": 0.6,                          // with "ground": false the body floats: its standing origin is "lift" m above the ground
  "pose": "run",                        // or {"base": "run", "mirror": true, "scale": 0.7, "blend": {"pose": "stand", "t": 0.3}, "kneeL": 40, ...}
  "tilt": [0, 0, 0],                    // extra whole-body [fwd, twist, side] about the hips
  "colors": { "skin": "#f0c8a8", "hair": "#f0a878", "top": "#c4e2f2", "sleeves": "#3a8a3a", "pants": "#c8a878",
              "shoes": "#6a4a2a", "belt": "#e0b040", "skirt": "#...", "tunic": "#...", "gloves": "#..." },
  "clothes": { "top": "shirt | jumpsuit | dress | bare", "sleeves": "long | short | none", "legs": "pants | baggy | shorts | bare",
               "tunic": { "length": 0.36, "flare": 0.55 }, "skirt": { "length": 0.55, "flare": 0.6 },
               "belt": true, "boots": 0.2, "gloves": false, "looseSleeves": false },
  "hair": { "style": "short | spiky | ponytail | bob | long | bun | curly | bald", "color": "#...", "volume": 1.1,
            "length": 0.55, "flow": [1, 0.8, -0.3],      // ponytail: world direction it streams toward (wind, a vortex)
            "spikes": 18, "sweep": [0, 0.7, -1] },        // spiky: count and head-space sweep direction
  "hat": { "style": "cap | brimmed | helmet | headband", "color": "#...", "band": "#...", "flow": [-0.4, -0.2, 1] },
  "glasses": "#d0b040", "scarf": "#e07030",
  "prop": { "type": "rod | umbrella", "hand": "R", "length": 1.05, "offset": 0.1, "angle": 90,
            "canopy": 0.45, "canopyColor": "#c8402a" } }
```

### Joint angles (degrees)

| joint | values | meaning |
|---|---|---|
| `pelvis`, `spine`, `neck`, `head` | `[fwd, twist, side]` | fwd + bends forward. Twist + turns to the figure's own left. Side + leans to its own left. `pelvis` carries the whole body, legs included, so a negative pelvis fwd tips the body back. |
| `shoulderL/R`, `hipL/R` | `[fwd, out, twist]` | Works like a joystick. fwd swings the limb forward and out swings it to its own side. They combine: fwd 90 is horizontal forward, out 90 is horizontal sideways, fwd 165 is overhead. Twist + is inward rotation. Use twist −80…−90 with a bent elbow to stand the forearm up (wave), and +70 to bring it across the body (arms crossed, hands on hips). |
| `elbowL/R`, `kneeL/R` | number | Bend from straight. Elbows bend forward, knees bend backward. |
| `wristL/R` | `[flex, dev]` | flex + bends toward the palm |
| `ankleL/R` | `[flex, roll]` | flex + raises the toes |
| `handL/R` | 0..1 | finger curl: 0 = flat open hand, 1 = fist |
| `shrugL/R` | 0..1 | Raises the shoulder. This is added automatically when the arm goes overhead. |

Named poses (`node pose3d.js --poses`): stand, stand_relaxed, walk, walk_b, run, run_b, sprint,
lunge, reach_up, reach_forward, wave, cheer, jump_cheer, point, hands_on_hips, arms_crossed,
hands_behind, look_up, talk, shield_eyes, hold_child_hand, fall_back, float, sit_ground, crouch.
`renders/pose_sheet.png` (+ `_parts.png`) shows them all, laid out left to right and back to front in that
order. The scene is `examples/pose_sheet.json`. Right-handed poses wave, point and talk with the right hand.
Use `{"base": "wave", "mirror": true}` for the left hand.

### A crowd

```jsonc
{ "name": "left", "count": 90, "seed": 11,
  "region": { "poly": [[0,870],[1180,870],[1180,990],[1020,1125],[0,1140]] },   // canvas pixels of the FEET; or "rect": [x0,y0,x1,y1]
  "faceToward": [1776, 1045], "facingJitter": 45,     // or "facing": yaw (random if neither)
  "minSpacing": 0.55,                                  // metres between people (named figures keep a 1 m clearance)
  "presets": { "male": 0.42, "female": 0.42, "child": 0.1, "elder": 0.06 },
  "poses": { "stand": 4, "stand_relaxed": 4, "look_up": 1.2, "talk": 1, "wave": 0.6, ... },   // weights
  "heightJitter": 0.05, "heightScale": 1, "poseJitter": 8, "hatChance": 0.3,
  "exclude": [[x0,y0,x1,y1]],                          // canvas rects where no feet may land
  "palette": { "tops": [...], "pants": [...], "skirts": [...], "skin": [...], "hair": [...], "shoes": [...], "hats": [...] } }
```

People are scattered evenly over the ground area, so the crowd thins and shrinks with
perspective on its own. If the region is too small for `count` at `minSpacing`, fewer people are
placed. The figure count is printed after each render. The same seed always gives the same crowd.

## Set pieces (lib/set.js) and other additions (Oct 2026, for millennial-fair-v6)

Props can now be whole set pieces as well as primitives. Give them `position: [x, y, z]` in metres (or `at`), and
optionally `yaw` (degrees), `scale`, `name`. Named props are listed in `out.json` under `props` with `screenBox`,
`anchor2d`, `base2d` (canvas pixel of the ground under the anchor), `world` and `distance`. `out.json` also has `horizonY`.

| type | what | main keys |
|---|---|---|
| `tower` | square stone bell tower: ashlar shaft, string courses, slit windows, clock, open belfry with bell, pyramid roof, finial | `width height belfry roof color roofColor clock` |
| `tent` | striped circus tent: striped wall, striped cone roof, valance, door, pole + pennant | `radius wall roof stripes color color2 flagColor` |
| `tree` | trunk + limbs + lumpy foliage masses (seeded); casts dappled shadow | `trunk trunkRadius canopy:[rx,ry,rz] clumps clumpSize colors seed` |
| `bunting` | sagging cord between two world points with triangular pennants | `from to sag count colors width length` |
| `balloon` | egg-shaped balloon with knot and string | `radius color string stringTo` |
| `telepod` | plinth, brass coil drum, steel flanges and dome, antennas with ball tips | `radius coil turns color steel antennas:[[dx,dz,leanDeg,len]]` |
| `vortex` | time gate: spiral-textured emissive disc facing +Z, bright rim, swirl ribbons, additive halo (halo shows only in lit/value) | `radius intensity ribbons rimColor haloColor haloOpacity` |
| `stage` | plank deck on a skirted frame, front steps, optional posts | `size:[w,h,d] color skirtColor stepX stepWidth posts:[[x,z,h]]` |
| `console` | control desk with levers, dial, lamp | `width color trim lamp` |
| `house` | background house: walls, gabled roof, windows, door, optional striped awning | `width depth height roof color roofColor awning` |
| `pole`, `flag` | plain pole with finial; a pennant | `height radius color` |

Other additions:
- `ground.texture: "paving"` (+ `tile` metres): a subtle multiplicative stone-sett pattern so the plaza shows perspective.
- `sky.zenith` / `sky.horizon` (+ `curve`, `sunGlow`): a gradient sky dome instead of a flat background (crops keep the right sky).
- `sun.shadowCenter` / `sun.shadowRadius` override the shadow frustum. Props now count toward it (`shadowBounds: false` to exclude one).
- Lights: `shadowMapSize` for shadow-casting point lights.
- Figures: `ascot: "#hex"` (knotted cravat), `sword: {side, length, color, hilt, guard, angle, splay}` (sheathed sword at the hip;
  `angle` = degrees from hanging straight down toward the back), helmet `hat.antenna: "L"|"R"` (+ `antennaTip`, `antennaLength`),
  ponytail `hair.origin: [x, y, z]` in head units (crown is about `[0, .19, -.07]`).
- Older scene files render as before, except that the sun's shadow frustum now also covers props.

Example: `paintings/millennial-fair-v6/reference/build_scene.js` generates a full set (stage, telepods, gate, tower, tents,
trees, bunting, balloons, houses) in world metres and places figures by the canvas pixel of their feet.

## The Millennial Fair demo

`examples/millennial_fair.json` sets up a camera matched to `paintings/millennial-fair-v5` (2400x1600, horizon
y≈520, eye height 3.6 m). The late-afternoon sun comes from the left and slightly beyond the
scene, so cast shadows fall toward the lower right. The violet gate is an emissive disc with a
violet point light in front of it. The figures:
- Crono: seen from behind, running toward the gate. Spiky red hair, white headband with tails,
  light-blue tunic with belt, green sleeves, tan pants, boots, orange scarf.
- Marle: pulled backward into the air in front of the gate. Ice-blue jumpsuit, strawberry-blonde ponytail streaming toward the vortex.
- Lucca: on the stage, three-quarter toward the gate, arms up. Helmet, glasses, bob.
- About 150 crowd people left and right, plus three foreground figures (one with a red umbrella).

Renders are in `renders/millennial_fair*.png`, with crops `crono`, `gate`, `crowd_left` and `crowd_right` for the
lit, value, flat and id passes. The joints of the named figures are in `renders/millennial_fair.json`.

Things the demo shows about the v5 painting: the painted right-hand crowd (feet around y 1100–1330) is about
1.5–1.7x smaller than consistent perspective allows from the left crowd's scale. Lucca is painted
larger than her depth implies. The tool keeps one consistent camera. Choose deliberately whether to follow it.

## Limitations

- Mannequins, not people. There are no faces (only nose, brow and ears for the head planes), no fingers
  (mitten plus thumb), no cloth folds and no hair strands. Clothing is coloured body segments plus open
  shells (tunic, skirt) that legs can poke through in big strides.
- Joints are not limited. Extreme angles can twist limbs through each other. Check the
  `parts` pass if a pose looks wrong.
- Shading is a standard PBR material with soft shadow maps. There is no bounce light between
  figures apart from the hemisphere ambient, and no subsurface skin glow. Treat colour as a hint
  and judge value relationships.
- Nothing stops figures from overlapping props, and crowd spacing only considers feet positions.
- The renderer is software WebGL (SwiftShader). Very large crops at a high `--scale` take a while.
