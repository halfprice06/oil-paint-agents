#!/usr/bin/env node
/*
 * Headless studio runner.
 *
 *   node render.js <paintingDir> [--upto N] [--progress] [--crop x,y,w,h] [--zoom 2] [--out file.png]
 *
 * <paintingDir>/painting.json:
 *   { "title": "...", "artist": "...", "width": 1200, "height": 900,
 *     "ground": "#hex or pigment", "seed": 1, "passes": ["01_underpainting.js", ...] }
 *
 * Each pass file is plain JavaScript run with one variable in scope, `p`:
 *   p.width, p.height
 *   p.stroke({points, color, color2, brush, size, load, opacity, angle, thin, taper, edge,
 *             clean, dirty, stir, scumble})     (taper/edge: v5+, clean/dirty/stir/scumble: v6+)
 *   p.dab({x, y, color, size, brush, angle, load, ...})     a single short touch
 *   p.dry()                       let all paint so far dry (no more wet blending with it)
 *   p.wipe()                      clean every brush (v6: no residue of earlier colours)
 *   p.random(), p.rand(a,b)       seeded randomness
 *   p.mix([[pigment, parts], ...]) -> '#hex'   premix on the palette
 *   p.pigments                    list of pigment names
 * There is deliberately no way to read pixels back or load images.
 *
 *   --scale 3     simulate on a 3x larger canvas (same strokes, finer paint) -> final_3x.png
 *   --crop "x,y,w,h;x,y,w,h"   several crops from one simulation -> <out>_1.png, <out>_2.png ...
 *
 * Engine version: if <paintingDir>/ENGINE exists and names an older engine ("v2" ... "v5"),
 * that engine (oilpaint_vN.js, next to this script or in legacy/) is used, so old stroke logs
 * replay exactly. No ENGINE file = the current engine. --engine vN overrides; --engine with the
 * current engine's version (e.g. v6), "current" or "latest" selects the current oilpaint.js.
 *
 * Writes: final.png (or --out), strokes.json (full replayable stroke log),
 * and with --progress one PNG per pass in progress/.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// pick the engine that made this painting (ENGINE file), so old stroke logs replay exactly
function loadEngine(dir, override) {
  let ver = override;
  if (!ver) {
    const f = path.join(dir, 'ENGINE');
    if (fs.existsSync(f)) ver = fs.readFileSync(f, 'utf8').trim().toLowerCase();
  }
  if (ver === 'current' || ver === 'latest') ver = null;
  if (ver) {
    const cur = require('./oilpaint.js');
    if (cur.VERSION && cur.VERSION === ver) { console.log(`engine ${ver} (oilpaint.js, current)`); return cur; }
  }
  if (ver && /^v\d+$/.test(ver)) {
    for (const cand of [path.join(__dirname, `oilpaint_${ver}.js`), path.join(__dirname, 'legacy', `oilpaint_${ver}.js`)]) {
      if (fs.existsSync(cand)) { console.log(`engine ${ver} (${path.relative(__dirname, cand)})`); return require(cand); }
    }
    const cur = require('./oilpaint.js');
    if (cur.VERSION && cur.VERSION !== ver) console.warn(`warning: ENGINE says ${ver} but no oilpaint_${ver}.js found; using current engine ${cur.VERSION}`);
    return cur;
  }
  return require('./oilpaint.js');
}
let OilPainting, PIGMENTS, parseColor, rgbToHex, mulberry32;

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function encodePNG(rgba, w, h) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4, d = y * (w * 3 + 1) + 1 + x * 3;
      raw[d] = rgba[s]; raw[d + 1] = rgba[s + 1]; raw[d + 2] = rgba[s + 2];
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

function snapshot(canvas, file, crop, zoom) {
  const full = new Uint8ClampedArray(canvas.w * canvas.h * 4);
  canvas.renderTo(full);
  let [cx, cy, cw, ch] = crop || [0, 0, canvas.w, canvas.h];
  cx = Math.max(0, cx | 0); cy = Math.max(0, cy | 0);
  cw = Math.min(canvas.w - cx, cw | 0); ch = Math.min(canvas.h - cy, ch | 0);
  const z = Math.max(1, zoom | 0);
  const ow = cw * z, oh = ch * z, out = new Uint8ClampedArray(ow * oh * 4);
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
    const s = ((cy + ((y / z) | 0)) * canvas.w + cx + ((x / z) | 0)) * 4, d = (y * ow + x) * 4;
    out[d] = full[s]; out[d + 1] = full[s + 1]; out[d + 2] = full[s + 2]; out[d + 3] = 255;
  }
  fs.writeFileSync(file, encodePNG(out, ow, oh));
}

function makePainterAPI(canvas, seed) {
  const rnd = mulberry32(seed * 7919 + 13);
  return {
    width: Math.round(canvas.w / canvas.scale), height: Math.round(canvas.h / canvas.scale),
    pigments: Object.keys(PIGMENTS),
    stroke: (s) => canvas.stroke(s),
    dab: (s) => canvas.stroke({ ...s, points: [[s.x, s.y, s.pressure == null ? 0.9 : s.pressure]] }),
    dry: () => canvas.dry(),
    wipe: () => { if (canvas.wipe) canvas.wipe(); },
    random: rnd,
    rand: (a, b) => a + (b - a) * rnd(),
    mix: (spec) => rgbToHex(parseColor(spec)),
  };
}

function main() {
  const args = process.argv.slice(2);
  const dir = path.resolve(args[0] || '.');
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
  const has = (name) => args.includes(name);
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'painting.json'), 'utf8'));
  ({ OilPainting, PIGMENTS, parseColor, rgbToHex, mulberry32 } = loadEngine(dir, opt('--engine')));
  const upto = opt('--upto') ? parseInt(opt('--upto'), 10) : cfg.passes.length;
  // --crop x,y,w,h  (several crops of one simulation: "x,y,w,h;x,y,w,h" -> <out>_1.png, <out>_2.png, ...)
  const crops = opt('--crop') ? opt('--crop').split(';').filter(Boolean).map((c) => c.split(',').map(Number)) : [];
  const crop = crops.length ? crops[0] : null;
  const zoom = opt('--zoom') ? parseInt(opt('--zoom'), 10) : 1;
  const scale = opt('--scale') ? parseFloat(opt('--scale')) : 1;
  const outFile = opt('--out') ? path.resolve(opt('--out')) : path.join(dir, crop ? 'detail.png' : scale !== 1 ? `final_${scale}x.png` : 'final.png');

  const canvas = new OilPainting(cfg.width || 1200, cfg.height || 900, { ground: cfg.ground, seed: cfg.seed || 1, scale });
  const p = makePainterAPI(canvas, cfg.seed || 1);
  if (has('--progress')) fs.mkdirSync(path.join(dir, 'progress'), { recursive: true });
  const t0 = Date.now();
  const passLog = [];
  for (let k = 0; k < Math.min(upto, cfg.passes.length); k++) {
    const file = cfg.passes[k];
    const code = fs.readFileSync(path.join(dir, file), 'utf8');
    const before = canvas.log.length, tp = Date.now();
    try {
      new Function('p', code)(p);
    } catch (e) {
      console.error(`Error in pass ${file}: ${e.stack}`);
      process.exit(1);
    }
    const n = canvas.log.length - before;
    passLog.push({ file, start: before, end: canvas.log.length });
    console.log(`pass ${file}: ${n} strokes in ${((Date.now() - tp) / 1000).toFixed(1)}s`);
    if (has('--progress') && scale === 1) snapshot(canvas, path.join(dir, 'progress', file.replace(/\.js$/, '.png')), null, 1);
  }
  if (crops.length > 1) crops.forEach((c, k) => snapshot(canvas, outFile.replace(/(\.png)?$/i, `_${k + 1}.png`), c, zoom));
  else snapshot(canvas, outFile, crop, zoom);
  if (!crop && scale === 1 && upto >= cfg.passes.length) {
    fs.writeFileSync(path.join(dir, 'strokes.json'), JSON.stringify({
      title: cfg.title, artist: cfg.artist, width: canvas.w, height: canvas.h,
      ground: cfg.ground, seed: cfg.seed || 1, passes: passLog, strokes: canvas.log,
    }));
  }
  console.log(`total ${canvas.log.length} strokes, ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outFile}`);
}
main();
