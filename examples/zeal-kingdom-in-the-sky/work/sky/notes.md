# Sky painter notes (area: sky, passes 10-19)

**Artist statement.** The sky is one continuous luminous gradient, lavender-blue at the top melting through pale violet into warm gold at the horizon, with the sun's glow a thick pale buttery pool at upper left (no disc) inside a pink-violet halo; a family of high cloud streaks lit salmon-pink from below with lavender tops, thinner and warmer near the sun; a pink-cream haze where the sky meets the cloud sea; and Enhasa floating at left as a hazy lavender-grey mass with a warm lit top, a cool underside and a few tiny pale buildings, its edges lost into the haze. The sky is kept calmer and a touch darker around the palace spire so the spire carries the contrast.

## Passes (after 00_under.js), round 4
| pass | strokes | what |
|---|---|---|
| 10_sky_gradient.js | ~2850 | wipe; whole sky laid wet in ~1400 big strokes (6-key pigment interpolation, pulled toward halo/glow near the sun and a cooler mix around the spire); upper right as three broad soft drifts; 70 long cross strokes through the middle sky and warm band (long, calm, nearly horizontal right of/above the palace); soft passes at varied angles; put-back, ~220 larger half-stirred broken-colour strokes + light melt, long non-horizontal strokes back (none right of the palace); extra melting and 14 long calm near-horizontal strokes at x>1600, y 250-660 |
| 11_sun_glow.js | ~250 | thick clean heart, half-tone strokes bridging glow to sky, very large soft rim passes, long thick strokes back, melted |
| 12_high_clouds.js | ~1130 | five streaks + strand + wisps, broken-colour layer per streak; plus three soft pale pink-lavender drifts over the warm band at right (y ~735, ~770, ~955; the one at y 770 sits just above Kajar) |
| 13_enhasa.js | ~190 | horizon haze band y 925-1045; Enhasa mass, cool underside, warm firmer lit top, found edge at left, small building planes |
| 13b_kajar.js | ~160 | Kajar: polygon x 2000-2360, y 800-950; mass in long overlapping strokes with a little haze, interior melted; shadow band under the lit top; long cool underside contour strokes melted along the contour and lost at the bottom (above y 990); warm pale lit top plane with a found edge at left; half-tone cliff at right; a little broken colour; a slender tower (light face / shadow face / cap), a dome, two walls as 8-20 px planes |
| 14_sky_glaze.js | ~30 | p.dry(); faint warm veil lower right and a few warm strokes, both kept off Kajar (x>1900, y>760) |
| 15_surface.js | ~30-50 | sparse dry-brush scumble over the dried lower right sky, off Kajar and the spire zone |

Total for the area: about 4,650 strokes (5,574 with 00_under.js). Backups: src_r1/, src_r2/, src_r3/, src_r3b/, src_r4/ (before round 4). Renders kept: final_r3a.png (confetti regression), final_r3b.png, final_r3c.png (round 3 as shipped), final.png (round 4).

## Self-assessment (round 4)
What works: one luminous gradient of visible paint; the glow is a soft pool, brightest value, no disc; the top right is calm (three soft drifts); the middle sky and warm band no longer read as stacked rows (cross strokes + melts); the streaks have lit undersides, lavender tops and a little broken colour; Enhasa reads as the second-furthest thing, with a warm firmer top and small lit/shadow planes for its buildings.

What still gives it away: the broken-colour layer leaves a slightly even, all-over flecked texture in the lower sky (more where the warm band meets the island) rather than the calm passages a painter would leave; the main streak is still one long bar in places; Enhasa's underside is bowl-shaped and its found top edge is subtle; Kajar's underside still shows separate oval marks at 1x and its buildings are a little toy-like; the block-in's vertical tower relief shows through at x 1180-1300 and 1370-1610 (palace covers it); the horizon haze is a straight band.

## For the merge / other painters
- Sky passes end wet; 14 begins with p.dry(). Everything in 10-13 blends wet into each other.
- I paint down to y = 1045 with the pink-cream haze band so there is no gap under the horizon; the cloud sea painter owns y >= 990 and may overpaint the band freely. The haze there is [white 3.2, naples .45, quin rose .1, cobalt violet .14] if they want to match it.
- Kajar (13b) sits at x 2000-2360, y 800-950, melted above y 990; its left part x<2160 is meant to be covered by the main island's right rim. Passes 14 and 15 keep their dry veils off it; anyone glazing the lower right sky should do the same.
- Enhasa sits at x 140-660, y 820-1020; its bottom edge is melted into the haze, so the cloud sea should not put a hard light edge right under it.
- The sky behind the main island/palace is painted loosely (the calm zone around the spire is cooler and lower in contrast); nothing to preserve there.
- Scratch tools in this folder: scratch_build.sh (box filter for fast crop loops; --bg uses a cheap stand-in sky), scratch/ renders, src_r1/ and src_r2/ backups.
- final.png in this folder is the full 1x render of 00_under + passes 10-14 (rendered Oct 6; crops fin_L.png, fin_R.png, fin_enh.png).
