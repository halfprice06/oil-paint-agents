# Checking tools

Both are for looking only. Neither feeds anything back into the painting.

- `grid.sh src.png x y w h scale step out.png` crops a render or reference, enlarges it and draws a labelled
  grid in canvas pixels, so you can read off where a shape sits before you place strokes.
- `node overlay.js pass.js reference.png x y w h scale out.png [alpha] [from] [to]` dry-runs one pass
  (no paint simulation) and draws its strokes as coloured lines over the reference crop. Use it to check the
  drawing (is the eye where the eye is?) before spending a slow render. Needs ImageMagick `convert`.
