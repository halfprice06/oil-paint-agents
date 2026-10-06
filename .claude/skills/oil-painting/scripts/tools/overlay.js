// node overlay.js <passfile.js> <reference.png> x y w h scale out.png [alpha] [fromStroke] [toStroke]
// Dry-runs a pass with a recording mock (no paint simulation) and draws every stroke as a line of its
// width and colour over a crop of your reference: a check of placement and drawing only. The painting
// never sees this image; it is for looking, like holding a tracing up to the light.
const fs = require('fs'), cp = require('child_process'), path = require('path');
const E = require(path.join(__dirname, '..', 'oilpaint.js'));
const [file, ref, X, Y, W, H, S, out, alpha, from, to] = process.argv.slice(2);
const x = +X, y = +Y, w = +W, h = +H, s = +S;
const strokes = [];
const p = { width: 1e5, height: 1e5, stroke: o => strokes.push(o), dab: o => strokes.push(Object.assign({}, o, { points: [[o.x, o.y]] })),
  dry() {}, wipe() {}, random: Math.random, rand: (a, b) => a + (b - a) * Math.random(), mix: c => E.rgbToHex(E.parseColor(c)) };
new Function('p', fs.readFileSync(file, 'utf8'))(p);
const a0 = from ? +from : 0, a1 = to ? +to : strokes.length;
const img = cp.execFileSync('convert', [ref, '-crop', `${w}x${h}+${x}+${y}`, '+repage', '-resize', `${w * s}x${h * s}`, 'png:-'], { maxBuffer: 1 << 28 }).toString('base64');
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * s}" height="${h * s}">`;
svg += `<image href="data:image/png;base64,${img}" width="${w * s}" height="${h * s}" opacity="${alpha || 0.5}"/>`;
for (let i = a0; i < Math.min(a1, strokes.length); i++) {
  const o = strokes[i]; let col = '#fff';
  try { col = o.load === 0 || o.brush === 'soft' ? null : E.rgbToHex(E.parseColor(o.color)); } catch (e) {}
  if (!col) continue;
  const pts = o.points.map(q => [((q[0] - x) * s).toFixed(1), ((q[1] - y) * s).toFixed(1)].join(','));
  svg += `<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="${(o.size * s * 0.8).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${o.opacity || 0.9}"/>`;
}
svg += '</svg>';
const svgOut = out.replace(/\.png$/, '.svg');
fs.writeFileSync(svgOut, svg);
cp.execFileSync('node', [path.join(__dirname, '..', 'sketch.js'), svgOut, out]);
console.log(strokes.length, 'strokes');
