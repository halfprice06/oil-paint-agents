# Zeal, the Kingdom in the Sky

**Artist statement.** Chrono Trigger's floating kingdom at golden hour: Zeal Palace on a stratified rock island hanging over a sea of sunlit cumulus, waterfalls pouring off the island's lip into the cloud deck, Enhasa and Kajar hazy in the distance, and the Epoch banking in toward the palace at lower left. A low sun at the upper left gives warm cream lights against greyed violet shadows; the palace spire is the sharpest, highest-contrast thing in the picture.

Engine v6, 2400x1600, 21,992 strokes, 32 passes. `final.png` is the 1x render; `final_2x.jpg` is the 2x re-simulation (4800x3200).

## How it was made

One session designed the composition (`study.svg`, `study_color.svg`), painted the block-in (`00_under.js`, 929 strokes) and then ran four painter agents in parallel, each in its own folder under `work/` with a copy of the block-in and the studies, on one area of the full canvas:

| painter | passes | strokes | rounds |
|---|---|---|---|
| sky, sun glow, high cloud streaks, Enhasa, Kajar | 10-15 | 4,493 | 3 |
| cloud sea and the Epoch | 20-24, 50 | 3,490 | 4 |
| island rock, waterfalls, plateau garden, trees | 30-39 | 5,996 | 4 |
| Zeal Palace, towers, pavilions, cast shadows | 40-48 | 7,084 | 5 |

`lib.js` holds the shared helpers prepended to every pass by `build.sh`; each painter's sources are in `work/<area>/src/*.body.js` with their round backups and `notes.md`. `merge.sh` copies the built passes into this folder in layer order (block-in, sky, clouds, island, palace, Epoch) and rewrites `painting.json`.

After each round the coordinating session rendered the merged painting (`rounds/merge1.png` is the first merge) and sent each painter the worst problems in painter's terms. The critiques that changed the most: cloud values (the deck was a mauve sea until the lit tops were raised to cream-white), cloud form (a row of lumps became one tall tower, a flat bank and drifts), the palace proportions (a squat brick-tiled mosque became a slender ogee spire with an arcade and stair), and the island's rock (a dark slab became three strata with lit ledges).

## Honest self-assessment

What works: the light. The sky is one luminous gradient with a buttery glow and no disc; the palace reads as Zeal's palace and holds the eye; the island hangs in the light with a warm lit face and waterfalls as the brightest accents; the cloud tower at right and the flat bank under the island give the deck form and recession; the Epoch reads as a solid machine with a glass dome.

What still gives it away: the island's lit face reads as stacked planks where the flat strokes line up; the waterfall ribbons are partly dry-brush strands at 2x; the cloud masses' lit caps are soft and a little marbled; the palace's big drum wall is dense vertical patches and its terrace balustrade is a busy strip of small marks; Kajar's buildings are toy-like; the high cloud streaks share one construction.

## On the stroke count

The brief asked for about 50,000 strokes; the painting has 22,000. Every painter was given a budget of 9,000 to 14,000 and came in at 3,500 to 7,000. Each one tried to spend the rest (broken-colour layers over the sky, a second rock layer, scumbles over cloud bellies, dense lay-back strokes) and each time the surface got worse: sky into confetti, rock into bricks or fur, clouds into speckle. The strokes that survived are the ones that build planes and edges. More content (Kajar, the cloud tower, the stair and arcade, the garden) added strokes that read; more marks on existing forms did not. This matches the v6 lesson that past a point rewrites help and extra strokes do not; on this canvas that point came early because the big forms are big.
