# Jug and Two Apples

**Artist statement.** A cream glazed jug and two apples stand on a plain brown table before a warm grey wall, lit by one window at upper left, in the quiet spirit of Chardin. Three simple forms, one light: the jug is the big light mass, the red apple the single warm accent, and the wall is meant as atmosphere rather than texture.

## Process
Thumbnail study (study.svg, study_color.svg), then 7 passes: thin drawing; wall, table and cast shadows wet-into-wet, then dried; block-in of the objects in four to five value planes (broad strokes that follow the curve of the jug and the apples, colour computed from the angle of the form to the light); wet blending only across plane boundaries; mouth and lip; handle, one shoulder highlight and soft apple highlights; then glazes over dry paint for the core shadows, apple streaks and warm reflected light, and the dark contact shadows. Sources are in src/ (round1/ holds the first-round version of every pass).

Round 2 changes after review: the wall was repainted with large strokes at mixed angles and big blenders; the table has fewer, bigger strokes with a soft far edge; the jug lost its regular striping, its dark right outline, and all but one highlight, its reflected light is dim and wide and the shadow side melts into the wall; the apples are less saturated with yellow streaks, a warm reflected light and blended steps. The engine update made strokes about 35% narrower than their nominal size, so every size is scaled by 1.35 in the helper.

Round 3 changes: the jug's lit plane is now a few broad, loaded strokes in hand-chosen colours (cream with naples yellow and a touch of ochre, cooler grey-violet halftones) plus one thick highlight; wall is darker behind the jug's lit side and lighter behind its shadow side, and the dark corner smudge is gone; the table has a warmer lighter front band, soft reflections of the apples and the jug's base, and soft far ends on the cast shadows; the apple dabs became 2-3 long curved glazes and one soft cool highlight; a white cloth over the front left corner (lit top, cool blue-grey fold shadows) was added in pass 8. Round 2 and round 1 sources are in src/round2 and src/round1. The 1.35 stroke-size factor still looks right on the updated engine.

## Self-assessment
Works: drawing and value design; the jug now reads as warm cream ceramic turning into a cool shadow that melts into a lighter wall; counterchange gives lost-and-found edges; the table plane has reflections, a lit front band and soft shadows; the cloth adds a second white mass and a real-life note.
Still gives it away: the cloth is the weakest part, a little stacked and plate-like with too clean a rim; the jug's lit side still shows regular vertical bristle streaks, and a faint horizontal seam where its long strokes overlap; the apples are smooth and slightly plastic with a stepped core shadow; the reflections are soft blobs; the wall strokes are all of similar length; no accidents, drips or visible corrections, and the overall finish is more even than a human painter's.


**Final version note.** The cloth pass (08_cloth.js) was left out of the final because it read as a stacked plate; the version with it is in src/final_with_cloth.png and src/painting_with_cloth.json.
