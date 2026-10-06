# Millennial Fair v6: lit 3D master scene (option G)

Reference for "The Gate Opens at the Millennial Fair" (canvas 2400x1600). It was rendered with
`studio/pose3d` from `scene.json`, which `build_scene.js` generates (option `G`).

**LOOK at these images. Never sample their pixels.** They give you perspective, proportion, the direction
of the light, where the shadows fall and the big value masses. Colour and finish are your own decisions.
These are mannequins with no faces, fingers or cloth folds. Paint people over them, not dolls. For the faces
and hands, use the photos in `faces/` (see `faces/README.md`).

## Files

| file | use |
|---|---|
| `master.png` | lit render at canvas size (2400x1600) |
| `master_value.png`, `master_notan.png` | greyscale, and 5 posterised steps. Use these for the value design. |
| `master_flat.png` | local colours with no light |
| `master_id.png` | one colour per figure, for overlaps |
| `master_parts.png` | body masses, for gesture and foreshortening |
| `master.json` | canvas pixel of every joint of every figure, plus screen boxes of every named prop |
| `crops/<name>_{lit,value,flat,id}.png` | enlarged crops: `crono`, `marle`, `lucca` (2x), `crono_face`, `marle_face` (3x), `lucca_face` (4x), `gate` (2x), `fairgoers_left` (3x), `fairgoers_centre_right` (2x). Rectangles are in `crops/crops.json` and `scene.json` → `crops`. |
| `faces/` | 24 real photos (faces at matching angles in warm low side light, hands in matching gestures) plus face close-ups of the renders. Sources, licences, and canvas position and size for each face are in `faces/README.md`. |
| `options/contact_sheet.png` | composition studies A, B, C, the earlier pick F, and the chosen G, each with its value pass |
| `master_F*.png`, `master_F.json`, `crops_F/`, `scene_F.json` | the previous master (option F, small faces), kept for comparison. Do not paint from it. |
| `scene.json`, `build_scene.js` | the scene. To change it, edit `build_scene.js` (option `G`), then run `node build_scene.js G scene.json` and re-render. |

To re-render (about 20 s for the master, about 1 min for the crops):
```bash
cd /tmp
node /mnt/project-files/painting/studio/pose3d/pose3d.js <ref>/scene.json <ref>/master.png --passes lit,value,notan,flat,id,parts --no-crops
node /mnt/project-files/painting/studio/pose3d/pose3d.js <ref>/scene.json <ref>/crops/x.png --crops-only   # then strip the x_ prefix
```

## Composition (why G)

F read well at thumbnail size, but every face was tiny (Marle's head was about 30 px). G re-stages the same
idea with the camera closer and a longer lens, so the faces read:
- **Marle is the focal point.** She is lifted off her feet in front of the gate, over the plaza, so she is about
  as close to us as Crono. Her head is about 130 px tall (crown to chin, with hair). Her face turns toward the
  viewer in three-quarter to screen left: warm sun on the face, a violet rim from the gate behind her. Her body
  is a long diagonal from the raised left hand (upper right) to the trailing feet (lower left). Her right arm
  reaches out to screen left toward Crono.
- **Value masses:** the gate disc is the lightest shape in the picture. It is centred left of Marle, and her
  mid-value body crosses its right half, so she reads as a silhouette with lit edges against it. A dark tree mass
  rings the gate on the top. Light warm sky and the small bell tower are at the upper left. Below are a dark band
  (the stage skirt and steps), then a light band of plaza paving along the bottom.
- **Path of the eye:** Crono runs in from the lower left toward Marle. His outstretched arm and her reaching arm
  point at each other across the gap. Lucca at the right, recoiling at her console, closes the triangle. The
  balloons and the antenna tips lead back in from the top edge.
- **Fewer people:** 3 heroes and 6 small fairgoers in the background, 24–30 m away, on the far plaza between
  the pods. They are accents for scale and reaction, not a crowd.

## Camera

- Canvas 2400x1600, vertical FOV 40°, focal length ≈ 2198 px.
- Eye height 1.5 m. The camera is at world (-0.4, 1.5, -11.3), yawed 4.5° to the right. There is no tilt, so
  verticals stay vertical.
- **Horizon: y = 830.** Lines running straight into the scene converge on the horizon a little right of centre
  (x ≈ 1370). The stage front edge and the paving courses are nearly horizontal.
- Scale: a 1.7 m figure stands about 2198·1.7/d px tall, where d is its distance in metres.

| object | distance | head on canvas |
|---|---|---|
| Marle | 4.3 m | ≈ 130 px crown to chin with hair, face (brow to chin) ≈ 75 px |
| Crono | 5.75 m | ≈ 76 px to the hairline, plus about 60 px of hair spikes |
| Lucca | 7.7 m | ≈ 62 px including the helmet |
| fairgoers | 24–30 m | 15–25 px heads, figures 130–190 px tall |

## Light

- **Sun:** low, warm late-afternoon sun (`#ffcf96`), elevation 19°, azimuth -108.5° (from the LEFT and a little
  beyond the scene). Shadows fall to the right and slightly toward the viewer. A 1.66 m person throws a shadow
  about 4.8 m long. The sun lights each figure's left side, and the right side turns into shadow. It lights
  Marle's face and the front of Lucca's face.
- **Sky light:** warm hemisphere light (sky `#c8c4cc`, ground bounce `#c89a6a`). Sky gradient from warm horizon
  `#e8cca0` to blue `#4a72b4`.
- **Gate:** a cold violet point light (`#8a78ff`, intensity 18) just in front of the vortex centre. It casts
  shadows. There is also a soft blue-violet fill (`#7a8cff`) over the stage floor, and a short-range violet rim
  light (`#8a80ff`) just behind Marle that edges her hair, the back of her head, her shoulders and arms. Its
  range is limited so it does not tint the plaza. The vortex disc is emissive: violet rim, lighter spiral arms, a
  near-white centre.
- No dapples in G. The dapple tree is moved away so that it does not shadow Marle's face. The plaza strip is in
  open sun.

## Where everything is (canvas pixels, from master.json)

Boxes are generous [x0, x1] / [y0, y1] boxes taken from 3D bounds. Joints are exact. More joints for each figure
are in master.json → `figures.<name>.joints2d`.

### Heroes
| figure | where | key joints |
|---|---|---|
| **Marle** (4.3 m; lifted about 0.85 m above the plaza in front of the stage; body on a diagonal; head turned three-quarter toward the viewer, to screen left; left arm thrown up and right; right arm flung out to screen left toward Crono; legs trailing down and left; ponytail streaming up and back) | box 1069–2073 x, 113–1208 y | head 1489,484 (face centre ≈ 1497,435) · neck 1477,523 · pelvis 1391,665 · raised left hand 1603,269 · reaching right hand 1138,471 · ankles 1301,1048 / 1169,1070 |
| **Crono** (5.75 m, on the plaza in front of the stage steps, running in from the left toward Marle; head in near profile facing right, turned up toward her) | box 170–774 x, 677–1576 y | head 612,906 (face ≈ 615,888) · neck 597,936 · pelvis 526,1073 · reaching right hand 750,976 · left hand 471,1117 · planted foot 476,1384 · kicked-back foot 288,1221 |
| **Lucca** (7.7 m, on the deck at stage right behind her console, recoiling, face three-quarter toward screen left, left hand up, right hand toward the levers) | box 1960–2357 x, 494–1081 y | head 2182,648 (face ≈ 2176,628) · pelvis 2151,769 · left hand 2279,572 · right hand 2032,664 · feet 2159,1037 / 2120,1005 |

### Fairgoers (small, in the background on the far plaza, feet just below the horizon)
| figure | head | feet | crop |
|---|---|---|---|
| couple, man (arm up in surprise) | 325,820 | ≈ 330,960 | `fairgoers_left` |
| couple, woman (hands clasped) | 255,834 | ≈ 254,950 | `fairgoers_left` |
| boy cheering, arms up in a V | 470,843 | ≈ 470,940 | `fairgoers_left` |
| woman shielding her eyes | 905,835 | ≈ 900,946 | `fairgoers_centre_right` |
| pointer man, pointing at the gate | 1699,823 | ≈ 1701,941 | `fairgoers_centre_right` |
| pointer woman | 1771,834 | ≈ 1769,951 | `fairgoers_centre_right` |

### Set
| item | canvas position |
|---|---|
| stage (10 x 4.6 m, 0.75 m high, plank deck, dark skirt boards, steps at its left front) | runs off both edges. Deck surface ≈ y 960–1100, skirt ≈ y 1100–1330. The steps are behind Crono at about x 440–1100, y 1190–1440. The plaza is below y ≈ 1330. |
| gate vortex (radius 1.75 m, 9.4 m away) | centre 1193,524. Disc about 760–1625 x, 95–955 y. Marle overlaps its right half. |
| telepod left / right (brass coil drum, steel dome, red-tipped antennas) | left: x −278–362 (cut by the left edge), antenna tips up to y ≈ 31. Right: x 1862–2452, antennas up to y ≈ 93. Both stand on the deck at y ≈ 1010. |
| Lucca's console (levers, red lamp) | x 1745–2179, y 648–1061 |
| bell tower (square stone, clock, open belfry with bell, pyramid roof) | x 135–450, top y ≈ 151, base on the horizon at 300,872. Far away (85 m). |
| tents | blue and white at the far left (x < 421, top ≈ 401), mostly behind the left pod. Red and white at the far right behind the right pod and trees. |
| trees | the big dark mass behind the gate, from x ≈ 500 to the right edge, top beyond y 0. Small far trees on the horizon. |
| houses | low cream houses on the horizon between the pods (x ≈ 650–1894, roofs ≈ y 520–565) |
| bunting | one string across the tree mass behind the gate, y ≈ 147–455, x 19–1945. Another runs from the stage-right side off the right edge. Pennants in red, yellow, blue, cream and green. |
| balloons | red 474,45 · blue 854,94 · yellow-gold 1857,103 (strings hanging below) |

## Costumes (local colours in the model)

- **Crono:**
  - spiky red hair `#d63a24` and a white bandana with tails `#f4f0e6`
  - light-blue sleeveless tunic `#8ec3e6` over a green long-sleeved shirt `#3d8a3a`
  - orange ascot `#ec7a26`, black belt
  - tan pants `#caa470`, brown boots `#6a3e22`
  - katana in a dark lacquered scabbard at his left hip, tip angled back and down (the black diagonal by his left hand)
- **Marle:**
  - strawberry-blonde high ponytail `#f2a072`
  - ice-blue sleeveless jumpsuit `#b2dcf4`, gold belt `#e2b23e`, pale boots
- **Lucca:**
  - plum bob `#7a3468`
  - cream helmet `#e0cf98` with an orange band and an antenna with a red tip on her right side, round gold-rimmed glasses
  - orange tunic `#e27a2c` over a teal long-sleeved shirt `#2e8e8c`, yellow scarf `#f0c830`
  - black shorts, brown boots
- **Fairgoers:**
  - deliberately muted period clothes (cream, navy, plum, rust, olive)
  - the pointer man's red shirt is a small warm accent on the right that answers Crono's hair

## Limitations

- Mannequins with no faces, hands that are mittens, no cloth folds and no hair strands. Long skirts are open
  shells. On several women, the hanging hands poke through the skirt and show as small skin-coloured patches.
  Ignore them.
- The vortex is a textured disc with two thin swirl ribbons and a bright rim. Invent the energy, sparks and depth
  of the spiral yourself. Its halo glow is subtle.
- Foliage is lumpy spheres. Use it for the overall mass, the light side and the shadow side, not for leaf
  character.
- The paving texture is only there to show perspective. Do not paint every stone.
- Metals (telepod domes, brass coils) have no environment reflections, so they read flatter than real brass and
  steel. Add sky reflections and specular highlights.
- There is no bounce light between objects apart from the hemisphere ambient. Colours are hints. Judge values from
  `master_value.png`.
- `screenBox` values in master.json are generous. Several run off the canvas (the stage, the left telepod).
  The joints are exact.
- Crono is in near profile (more face shows than a lost profile). If you want him more from behind, turn his
  head further away from us and keep the rest.
- The faces in the renders are blank ovals. Only the head's angle, size and light are reliable. Take features,
  hair and hands from the photos in `faces/`.
