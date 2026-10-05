/*
 * oilpaint.js — a small physical-ish oil paint simulator for <canvas>.
 *
 * Ideas borrowed from IMPaSTo (Baxter, Wendt & Lin, NPAR 2004): paint as a height
 * field moved by the brush, and Kubelka-Munk pigment mixing.
 *
 * Nothing here is an image filter. The only way to put paint on the canvas
 * is stroke(): a brush made of bristle clumps is dragged along a path. Each
 * bristle carries its own paint reservoir, deposits paint as it moves, runs
 * dry, picks up wet paint already on the canvas (wet-on-wet mixing), skips
 * across the canvas weave when it is low on paint (dry brush / scumble), and
 * leaves a ridged paint surface that is lit as impasto when rendered.
 *
 * Works in browsers (window.OilPaint) and Node (module.exports).
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- pigments
  const PIGMENTS = {
    titanium_white: '#f5f3ec', zinc_white: '#eef0ee', ivory_black: '#1b1a1a',
    lamp_black: '#141516', paynes_grey: '#2c3540',
    cadmium_lemon: '#f4e23a', cadmium_yellow: '#f7c51e', naples_yellow: '#f1d38f',
    yellow_ochre: '#c9962f', raw_sienna: '#b9722a', cadmium_orange: '#ef7a1c',
    cadmium_red: '#d4301e', vermilion: '#e0442a', alizarin_crimson: '#8c1c2e',
    quinacridone_rose: '#c4295e', burnt_sienna: '#8a3c1f', venetian_red: '#9b3b2b',
    burnt_umber: '#4a2f20', raw_umber: '#5b4a33', van_dyke_brown: '#3a2b22',
    ultramarine: '#2a3a9a', cobalt_blue: '#2f5bb0', cerulean: '#3d8fc4',
    prussian_blue: '#1d3550', phthalo_blue: '#123a7a', manganese_blue: '#3fa3c0',
    viridian: '#1f7a5e', phthalo_green: '#0f5a46', sap_green: '#4f6b25',
    chromium_oxide: '#5d7d43', terre_verte: '#7b8c68', cobalt_violet: '#8a4fa0',
    dioxazine_purple: '#45276e', flesh_tint: '#e8b896'
  };

  // Relative scattering power (hiding power) of each pigment. Opaque pigments (white,
  // cadmiums, earths) scatter strongly; transparent ones (alizarin, phthalos) barely
  // scatter, so a little of them stains a lot of white, as with real paint.
  const SCATTER = {
    titanium_white: 1.0, zinc_white: 0.55, ivory_black: 0.45, lamp_black: 0.5, paynes_grey: 0.35,
    cadmium_lemon: 0.8, cadmium_yellow: 0.85, naples_yellow: 0.85, yellow_ochre: 0.7, raw_sienna: 0.35,
    cadmium_orange: 0.85, cadmium_red: 0.85, vermilion: 0.8, alizarin_crimson: 0.12, quinacridone_rose: 0.15,
    burnt_sienna: 0.35, venetian_red: 0.75, burnt_umber: 0.45, raw_umber: 0.5, van_dyke_brown: 0.25,
    ultramarine: 0.22, cobalt_blue: 0.45, cerulean: 0.65, prussian_blue: 0.12, phthalo_blue: 0.1,
    manganese_blue: 0.4, viridian: 0.22, phthalo_green: 0.1, sap_green: 0.15, chromium_oxide: 0.8,
    terre_verte: 0.3, cobalt_violet: 0.45, dioxazine_purple: 0.12, flesh_tint: 0.85
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  // Kubelka-Munk: mix absorption K and scattering S by concentration, then back to reflectance
  function kmMix(items) { // items: [{col:[r,g,b] sRGB, S, w}]
    const out = [0, 0, 0];
    let tw = 0; for (const it of items) tw += it.w;
    if (tw <= 0) return [0.5, 0.5, 0.5];
    for (let k = 0; k < 3; k++) {
      let K = 0, S = 0;
      for (const it of items) {
        const R = clamp(toLin(it.col[k]), 0.002, 0.998);
        const ks = (1 - R) * (1 - R) / (2 * R);
        K += it.w * ks * it.S; S += it.w * it.S;
      }
      const q = K / Math.max(S, 1e-6);
      out[k] = clamp(toSrgb(1 + q - Math.sqrt(q * q + 2 * q)), 0, 1);
    }
    return out;
  }
  function pigmentKey(c) { return typeof c === 'string' ? c.trim().toLowerCase().replace(/[\s-]+/g, '_') : null; }
  function scatterOf(c) {
    const k = pigmentKey(c);
    if (k === 'white') return 1; if (k === 'black') return 0.45;
    return k && SCATTER[k] != null ? SCATTER[k] : 0.6;
  }

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  function rgbToHex(c) {
    const f = (v) => ('0' + Math.round(clamp(v, 0, 1) * 255).toString(16)).slice(-2);
    return '#' + f(c[0]) + f(c[1]) + f(c[2]);
  }

  // Pigment-like mixing: blend of linear and absorbance (log) space, so
  // blue + yellow goes green and mixes lose chroma/value like real paint.
  function mixRGB(a, b, t) {
    const out = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
      const la = a[k] + (b[k] - a[k]) * t;
      const sa = -Math.log(Math.max(a[k], 0.004)), sb = -Math.log(Math.max(b[k], 0.004));
      const ga = Math.exp(-(sa + (sb - sa) * t));
      out[k] = la * 0.4 + ga * 0.6;
    }
    return out;
  }
  function mixInto(a, b, t) { // in-place on array a, fast path for bristles
    for (let k = 0; k < 3; k++) {
      const la = a[k] + (b[k] - a[k]) * t;
      const sa = -Math.log(a[k] > 0.004 ? a[k] : 0.004), sb = -Math.log(b[k] > 0.004 ? b[k] : 0.004);
      a[k] = la * 0.4 + Math.exp(-(sa + (sb - sa) * t)) * 0.6;
    }
  }

  // color spec: '#hex' | pigment name | [[pigmentOrHex, parts], ...]
  function parseColor(c) {
    if (c == null) return [0.5, 0.5, 0.5];
    if (Array.isArray(c)) {
      if (typeof c[0] === 'number') return c.slice(0, 3);
      const items = [];
      for (const item of c) {
        const [name, w0] = Array.isArray(item) ? item : [item, 1];
        const w = w0 == null ? 1 : w0;
        if (w <= 0) continue;
        items.push({ col: parseColor(name), S: scatterOf(name), w });
      }
      return items.length ? kmMix(items) : [0.5, 0.5, 0.5];
    }
    if (typeof c === 'string') {
      const key = c.trim().toLowerCase().replace(/[\s-]+/g, '_');
      if (PIGMENTS[key]) return hexToRgb(PIGMENTS[key]);
      if (key === 'white') return hexToRgb(PIGMENTS.titanium_white);
      if (key === 'black') return hexToRgb(PIGMENTS.ivory_black);
      if (/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(c.trim())) return hexToRgb(c.trim());
      throw new Error('Unknown color: ' + c);
    }
    throw new Error('Bad color spec');
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash2(a, b) { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; return h | 0; }

  // smooth value noise for the canvas weave
  function makeNoise(seed) {
    const r = mulberry32(seed), P = new Float32Array(512);
    for (let i = 0; i < 512; i++) P[i] = r();
    return function (x, y) {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const h = (i, j) => P[((i * 73856093) ^ (j * 19349663)) & 511];
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
  }

  // ----------------------------------------------------------------- canvas
  const CAP = 110;      // paint volume a fully loaded bristle holds, per unit of its contact area
  const DEPK = 0.38;    // thickness laid down per px of contact by a full bristle

  class OilPainting {
    constructor(width, height, opts) {
      opts = opts || {};
      // scale: render the same painting on a larger canvas. Stroke coordinates and sizes stay
      // in the painting's own units; the simulation runs at scale x the pixels, so bristles,
      // grooves and canvas weave get finer instead of being upscaled.
      this.scale = opts.scale || 1;
      this.w = Math.round(width * this.scale); this.h = Math.round(height * this.scale);
      const N = this.w * this.h;
      this.R = new Float32Array(N); this.G = new Float32Array(N); this.B = new Float32Array(N);
      this.A = new Float32Array(N);   // total paint thickness
      this.W = new Float32Array(N);   // wet (still pickable) thickness
      this.gH = new Float32Array(N);  // canvas weave height 0..1
      this.T = new Float32Array(N);   // surface relief of the top paint layer: bristle grooves, ridges
      this.seed = opts.seed == null ? 7 : opts.seed;
      this.groundColor = parseColor(opts.ground || '#e9e2d3');
      this.light = opts.light || [-0.55, -0.65, 0.78];
      this.impasto = opts.impasto == null ? 1 : opts.impasto;
      this.strokeIndex = 0;
      this.log = [];
      this._buildGround();
    }

    _buildGround() {
      const { w, h } = this, noise = makeNoise(this.seed + 11), noise2 = makeNoise(this.seed + 23);
      const period = 3.6;
      const g = this.groundColor;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const jx = x + (noise(x * 0.02, y * 0.02) - 0.5) * 2.5;
          const jy = y + (noise(x * 0.02 + 40, y * 0.02) - 0.5) * 2.5;
          const tx = jx / period, ty = jy / period;
          const cx = Math.floor(tx), cy = Math.floor(ty);
          const fx = tx - cx, fy = ty - cy;
          const warp = Math.sin(Math.PI * fx), weft = Math.sin(Math.PI * fy);
          const over = ((cx + cy) & 1) === 0;
          let v = over ? warp * 0.75 + weft * 0.25 : weft * 0.75 + warp * 0.25;
          v = v * (0.75 + 0.5 * noise(x * 0.15, y * 0.9)) ; // slub irregularity
          v += (noise2(x * 0.5, y * 0.5) - 0.5) * 0.25;
          const i = y * w + x;
          this.gH[i] = clamp(v, 0, 1);
          this.R[i] = g[0]; this.G[i] = g[1]; this.B[i] = g[2];
        }
      }
    }

    /** Let everything on the canvas dry: later strokes no longer lift or blend into it. */
    dry() { this.W.fill(0); this.log.push({ dry: 1 }); }

    /**
     * stroke(spec)
     *  points:  [[x,y,pressure?], ...]  path in canvas pixels; pressure 0..1 (default tapered 1)
     *  color:   '#hex' | pigment name | [[pigment, parts], ...]
     *  color2:  optional second color loaded on one side of the brush (double loading)
     *  brush:   'flat' | 'round' | 'filbert' | 'fan' | 'knife'    (default 'flat')
     *  size:    brush width in px (default 20)
     *  load:    0..1.5 how much paint is on the brush (default 1). Low = dry brush.
     *  opacity: 0..1 (default 1). Low = transparent glaze over what is below.
     *  angle:   optional fixed brush orientation in radians (flat/knife calligraphy).
     *           Without it the brush face stays perpendicular to the direction of travel.
     *  thin:    0..1 amount of medium; thinner paint is flatter and spreads further (default 0)
     */
    stroke(spec) {
      const s = spec;
      const rec = { ...s };
      if (rec.points) rec.points = rec.points.map((p) => p.map((v) => Math.round(v * 10) / 10));
      this.log.push(rec);
      const rng = mulberry32(hash2(this.seed, this.strokeIndex++));
      if (!s.points || s.points.length === 0) return;

      const brush = s.brush || 'flat';
      const sc = this.scale, sqs = Math.sqrt(sc);
      const size = Math.max(1, s.size || 20) * sc;
      const capS = CAP * sc;
      const load = clamp(s.load == null ? 1 : s.load, 0, 1.5);
      const opacity = clamp(s.opacity == null ? 1 : s.opacity, 0, 1);
      const thin = clamp(s.thin || 0, 0, 1);
      const base = parseColor(s.color);
      // palette mixes are never perfectly stirred: keep the components so each
      // bristle can carry a slightly different proportion (streaks of unmixed pigment)
      let comps = null;
      if (Array.isArray(s.color) && typeof s.color[0] !== 'number') {
        comps = s.color.map((it) => (Array.isArray(it) ? it : [it, 1]))
          .filter((it) => (it[1] == null ? 1 : it[1]) > 0)
          .map((it) => ({ col: parseColor(it[0]), S: scatterOf(it[0]), w: it[1] == null ? 1 : it[1] }));
        if (comps.length < 2) comps = null;
      }
      const streak = s.brush === 'knife' ? 0.35 : 1;
      const base2 = s.color2 != null ? parseColor(s.color2) : null;
      const isKnife = brush === 'knife';

      // ---- path
      let pts = s.points.map((p) => [p[0] * sc, p[1] * sc, p.length > 2 && p[2] != null ? p[2] : null]);
      if (pts.length === 1) {
        // a touch of the brush: press in, drag a little on a slight curve, lift off
        const a = (s.angle != null ? s.angle + Math.PI / 2 : rng() * Math.PI) + (rng() - 0.5) * 0.5;
        const L = size * (0.55 + 0.7 * rng()), bend = (rng() - 0.5) * 0.35 * L, p0 = pts[0][2] == null ? 0.9 : pts[0][2];
        const ca = Math.cos(a), sa = Math.sin(a), cx = pts[0][0], cy = pts[0][1];
        const at = (t, b, pr) => [cx + ca * (t - 0.5) * L - sa * b, cy + sa * (t - 0.5) * L + ca * b, pr];
        pts = [at(0, 0, p0 * 0.55), at(0.3, bend * 0.8, p0), at(0.65, bend * 0.9, p0 * 0.85), at(1, bend * 0.4, p0 * 0.3)];
      }
      const path = resample(pts, 0.75);
      if (path.length < 2) return;
      const total = path[path.length - 1].d || 1;
      const autoPressure = pts.every((p) => p[2] == null);

      // ---- bristles (each one is really a clump of hairs)
      const spacing = (isKnife ? 1.1 : brush === 'fan' ? 3.2 : 1.7) * sqs;
      const nb = clamp(Math.round(size / spacing), 3, Math.round((isKnife ? 220 : 110) * sqs));
      const bristles = [];
      const br_side = (u) => (Math.abs(u) > 0.38 && !isKnife ? Math.sign(u) : (isKnife && Math.abs(u) > 0.46 ? Math.sign(u) : 0));
      // smooth random functions across the brush width -> coherent colour ribbons
      const knots = 3 + Math.floor(nb / 7);
      const ribbon = () => { const v = []; for (let k = 0; k <= knots; k++) v.push(rng() * 2 - 1);
        return (u) => { const t = (u + 0.5) * knots, k = Math.min(knots - 1, Math.floor(t)), f = t - k, e = f * f * (3 - 2 * f); return v[k] + (v[k + 1] - v[k]) * e; }; };
      const compNoise = comps ? comps.map(() => ribbon()) : null;
      const valNoise = ribbon(), warmNoise = ribbon(), loadNoise = ribbon(), endA = ribbon(), endB = ribbon();
      const gKnots = 2 + Math.floor(nb / 4);
      const grooveNoise = (() => { const v = []; for (let k = 0; k <= gKnots; k++) v.push(rng() - 0.5);
        return (u) => { const t = (u + 0.5) * gKnots, k = Math.min(gKnots - 1, Math.floor(t)), f = t - k, e = f * f * (3 - 2 * f); return v[k] + (v[k + 1] - v[k]) * e; }; })();
      const ragged = clamp(total / (size * 2.5), 0.35, 1); // short touches land almost whole
      for (let i = 0; i < nb; i++) {
        let u = (i + 0.5) / nb - 0.5;
        if (!isKnife) u += (rng() - 0.5) * 0.7 / nb;
        let prof = 1;
        if (brush === 'round') prof = Math.cos(u * Math.PI * 0.95) ** 0.8;
        else if (brush === 'filbert') prof = Math.sqrt(Math.max(0, 1 - (2 * u) ** 2)) * 0.6 + 0.4;
        else if (brush === 'fan') prof = 0.5 + 0.5 * rng();
        const r = isKnife ? 1.0 : clamp((size / nb) * (brush === 'fan' ? 0.4 : 1.45), 0.6, 4 * sqs) * (0.9 + 0.2 * rng());
        const area = Math.PI * r * r;
        const lv = isKnife ? 0.97 + 0.06 * rng() : clamp(1 + 0.32 * loadNoise(u) + (rng() - 0.5) * 0.35, 0.35, 1.6);
        let col = base;
        if (comps) {
          col = kmMix(comps.map((cp, c) => ({ col: cp.col, S: cp.S,
            w: cp.w * Math.exp(0.6 * streak * compNoise[c](u) + (rng() - 0.5) * 0.08 * streak) })));
        }
        if (base2) {
          const t = clamp((u + 0.5 - 0.5) * 3 + 0.5 + (rng() - 0.5) * 0.3, 0, 1); // left->right blend
          col = mixRGB(base, base2, t);
        }
        col = col.slice();
        { // uneven pigment dispersion: value and temperature drift in ribbons across the brush
          const j = valNoise(u) * 0.05 * streak + (rng() - 0.5) * 0.015 * streak, wm = warmNoise(u) * 0.025 * streak;
          col[0] = clamp(col[0] * (1 + j + wm), 0, 1); col[1] = clamp(col[1] * (1 + j), 0, 1); col[2] = clamp(col[2] * (1 + j - wm), 0, 1);
        }
        const edge = Math.abs(u) > 0.4 && !isKnife;
        bristles.push({
          u, prof, r, area,
          L: capS * load * lv * area * (edge ? 0.75 : 1),   // paint amount held
          col,
          wobA: isKnife ? 0 : (rng() - 0.5) * (edge ? 1.3 : 0.6) * sc, wobF: 0.01 + rng() * 0.04, wobP: rng() * 6.28,
          gv: 0.4 * grooveNoise(u) + 1.0 * (rng() - 0.5),   // groove depth: a few broad furrows plus fine hair marks
          bowV: 0, bowC: [0, 0, 0], side: br_side(u), lx: 0, ly: 0, touched: false,
          s0: (brush === 'filbert' || brush === 'round' ? (1 - Math.sqrt(Math.max(0, 1 - (2 * u) ** 2))) * Math.min(size * 0.3, total * 0.25) : 0) + (isKnife ? 0 : (0.45 * (0.5 + 0.5 * endA(u)) ** 1.5 + 0.55 * rng() ** 2) * size * 0.35 * ragged),   // ragged start
          s1: (brush === 'filbert' || brush === 'round' ? (1 - Math.sqrt(Math.max(0, 1 - (2 * u) ** 2))) * Math.min(size * 0.3, total * 0.25) : 0) + (isKnife ? 0 : (0.45 * (0.5 + 0.5 * endB(u)) ** 1.5 + 0.55 * rng() ** 2) * size * 0.45 * ragged),   // ragged lift-off
        });
      }

      const rate = DEPK * (isKnife ? 1.3 : 1) * (1 - thin * 0.4);
      const pickRate = (isKnife ? 0.3 : 0.035 + thin * 0.03) / sc;
      const W = this.W, A = this.A, R = this.R, G = this.G, B = this.B, gH = this.gH;
      const w = this.w, h = this.h;
      const fixedN = s.angle != null ? [Math.cos(s.angle), Math.sin(s.angle)] : null;
      const tmp = [0, 0, 0], cur3 = [0, 0, 0];
      const thick = (1 - thin * 0.65);
      // surface relief this stroke combs into the paint
      const T = this.T;
      const gPeriod = isKnife ? 1e9 : (brush === 'fan' ? 3.2 : clamp(size / 14, 2.4, 6 * sqs) * (0.85 + rng() * 0.35));
      const gFreq = 2 * Math.PI / gPeriod, gPh = rng() * 6.28;
      const gAmp = isKnife ? 0 : (load > 0 ? 0.45 + 0.4 * Math.min(load, 1) : 0.4) * (1 - thin * 0.7);
      // viscous transport: how much wet paint a bristle shoves along, and how fast it lets go
      const plow = (isKnife ? 0.16 : 0.045) * (1 - thin * 0.6) * (load > 0 ? 1 : 0.2) / sc;
      const release = (isKnife ? 0.05 : 0.09) / sc;
      const depositBow = (br, x, y, amt) => {
        const xi = Math.floor(x), yi = Math.floor(y);
        const rad = Math.max(1, Math.round(br.r));
        let tw = 0;
        for (let yy = yi - rad; yy <= yi + rad; yy++) for (let xx = xi - rad; xx <= xi + rad; xx++) {
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y); if (d <= rad + 0.5) tw += rad + 0.5 - d;
        }
        if (tw <= 0) return;
        for (let yy = yi - rad; yy <= yi + rad; yy++) for (let xx = xi - rad; xx <= xi + rad; xx++) {
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y); if (d > rad + 0.5) continue;
          const v = amt * (rad + 0.5 - d) / tw, i = yy * w + xx;
          const wetNow = W[i];
          const cover = v / (v + 0.5 * (wetNow < 0.7 ? wetNow : 0.7) + 0.1 * (1 - Math.exp(-2 * (A[i] - wetNow))) + 1e-4);
          const cur = cur3; cur[0] = R[i]; cur[1] = G[i]; cur[2] = B[i];
          mixInto(cur, br.bowC, cover);
          R[i] = cur[0]; G[i] = cur[1]; B[i] = cur[2];
          A[i] += v; W[i] = wetNow + v;
        }
      };

      for (let k = 0; k < path.length; k++) {
        const P = path[k];
        let pr = P.p;
        if (pr == null) pr = 1;
        if (autoPressure) {
          const a = clamp(P.d / Math.min(size * 0.8, total * 0.3), 0, 1);
          const b = clamp((total - P.d) / Math.min(size * 1.2, total * 0.35), 0, 1);
          pr *= (0.35 + 0.65 * Math.sqrt(a)) * (0.25 + 0.75 * Math.sqrt(b));
        }
        let nx, ny;
        if (fixedN) { nx = fixedN[0]; ny = fixedN[1]; } else { nx = -P.ty; ny = P.tx; }
        let width = size;
        if (brush === 'round') width = size * (0.3 + 0.7 * pr);
        else if (brush === 'filbert') width = size * (0.55 + 0.45 * pr);
        else if (brush === 'fan') width = size * (0.8 + 0.2 * pr);
        else width = size * (0.85 + 0.15 * pr);
        const stepLen = P.step;
        const halfW = width * 0.5;
        // paint piles up where the brush lifts off
        const lift = clamp(1 - (total - P.d) / (size * 0.6), 0, 1) * (1 - clamp(1 - P.d / size, 0, 1));
        const wob2 = 0.5 * Math.sin(P.d * 0.07 + gPh);

        for (let bi = 0; bi < nb; bi++) {
          const br = bristles[bi];
          if (P.d < br.s0 || P.d > total - br.s1) continue;
          if (br.L <= 1e-5 && load > 0) continue;
          const off = br.u * width + br.wobA * Math.sin(P.d * br.wobF + br.wobP);
          const bx = P.x + nx * off, by = P.y + ny * off;
          br.lx = bx; br.ly = by; br.touched = true;
          // the bow wave rides along: some of it slips out behind, edge bristles squeeze it sideways
          if (br.bowV > 1e-4) {
            const rel = br.bowV * release * stepLen;
            br.bowV -= rel;
            if (br.side !== 0) {
              const o = br.r + 1.2 * sqs;
              depositBow(br, bx + nx * br.side * o, by + ny * br.side * o, rel * 0.5);
              depositBow(br, bx, by, rel * 0.5);
            } else depositBow(br, bx, by, rel);
          }
          const c = pr * br.prof;
          if (c <= 0.01) continue;
          const lfrac = br.L / (br.area * capS);
          // dry-brush threshold: low paint + light pressure only touches the weave peaks
          const thr = 0.95 - (pr * 0.6 + Math.min(lfrac, 1.2) * 0.9);
          const rr = br.r, x0 = Math.floor(bx - rr - 0.5), x1 = Math.ceil(bx + rr + 0.5);
          const y0 = Math.floor(by - rr - 0.5), y1 = Math.ceil(by + rr + 0.5);
          for (let yy = y0; yy <= y1; yy++) {
            if (yy < 0 || yy >= h) continue;
            const dy = yy + 0.5 - by;
            for (let xx = x0; xx <= x1; xx++) {
              if (xx < 0 || xx >= w) continue;
              const dx = xx + 0.5 - bx;
              const dist = Math.sqrt(dx * dx + dy * dy);
              let wt = (rr + 0.5 - dist) / (0.45 * rr + 0.5);
              if (wt <= 0) continue;
              if (wt > 1) wt = 1;
              const i = yy * w + xx;
              const cw = c * wt * stepLen;
              // --- contact: low paint / light pressure only touches the high points of the surface
              const a0 = A[i];
              const surf = gH[i] * Math.exp(-2.2 * a0) + 0.55 * (1 - Math.exp(-2.2 * a0));
              let f = (surf - thr) / 0.45 + 0.5;
              if (f <= 0) continue;
              if (f > 1) f = 1;
              // --- shove wet paint along (bow wave): it leaves this pixel and travels with the bristle
              let wet = W[i];
              if (wet > 0.01) {
                let pv = wet * plow * cw * f * (0.4 + 0.6 * pr);
                if (pv > wet * 0.45) pv = wet * 0.45;
                const bt = pv / (br.bowV + pv + 1e-9);
                br.bowC[0] += (R[i] - br.bowC[0]) * bt; br.bowC[1] += (G[i] - br.bowC[1]) * bt; br.bowC[2] += (B[i] - br.bowC[2]) * bt;
                br.bowV += pv; W[i] = wet - pv; A[i] = A[i] - pv > 0 ? A[i] - pv : 0;
                wet = W[i];
              }
              // --- pick up wet paint from the canvas into the bristle
              if (wet > 0.002) {
                let pk = wet * pickRate * cw * f;
                if (pk > wet * 0.5) pk = wet * 0.5;
                tmp[0] = R[i]; tmp[1] = G[i]; tmp[2] = B[i];
                if (br.L < br.area * capS * 0.01) { br.col[0] = tmp[0]; br.col[1] = tmp[1]; br.col[2] = tmp[2]; }
                else mixInto(br.col, tmp, pk / (pk + br.area * (1.5 + 2.5 * Math.min(1, br.L / (br.area * capS))) + 1e-6));
                br.L += pk; W[i] = wet - pk; A[i] = A[i] - pk > 0 ? A[i] - pk : 0;
              }
              const a = A[i];
              const full = br.L / (br.area * capS);
              let dep = full > 0 ? Math.pow(full > 1.5 ? 1.5 : full, 0.6) * rate * cw * f * thick : 0;
              if (dep > br.L) dep = br.L;
              if (dep <= 1e-6) continue;
              const wetNow = W[i], dryA = a - wetNow;
              // transparent paint (low opacity) only tints what is below it: a glaze
              // only the top film of wet paint competes with the new stroke; the rest of the
              // mixing happens through what the bristles pick up
              const cover = opacity * dep / (dep + 0.5 * (wetNow < 0.7 ? wetNow : 0.7) + 0.14 * (1 - Math.exp(-2 * dryA)) + 1e-4);
              const bc = br.col;
              tmp[0] = bc[0]; tmp[1] = bc[1]; tmp[2] = bc[2];
              const cur = cur3; cur[0] = R[i]; cur[1] = G[i]; cur[2] = B[i];
              mixInto(cur, tmp, cover);
              R[i] = cur[0]; G[i] = cur[1]; B[i] = cur[2];
              const add = dep * (opacity < 0.999 ? 0.35 + 0.65 * opacity : 1);
              A[i] = a + add; W[i] = wetNow + add;
              // relief: fine bristle grooves along the stroke, ridges at its edges and where it lifts
              const tv = gAmp * 0.55 * br.gv * (1.4 - 0.5 * Math.min(1, full));
              let tk = cover * 1.6 * opacity * wt * wt; if (tk > 1) tk = 1;
              T[i] += (tv - T[i]) * tk;
              br.L -= dep;
            }
          }
        }
      }
      // whatever is still in the bow wave stays on the brush when it lifts
    }

    // ------------------------------------------------------------- rendering
    /** Render into an RGBA Uint8ClampedArray (e.g. ImageData.data) with impasto lighting. */
    renderTo(out) {
      const { w, h, A, gH, R, G, B } = this;
      const N = w * h;
      if (!this._H || this._H.length !== N) { this._H = new Float32Array(N); this._H2 = new Float32Array(N); this._Hb = new Float32Array(N); }
      const H = this._H, H2 = this._H2, Hb = this._Hb;
      const sc = this.scale;
      const hs = 0.8 * this.impasto * sc;
      // height: paint thickness, with the canvas weave telegraphing through thin and medium paint
      for (let i = 0; i < N; i++) {
        const a = A[i];
        H[i] = hs * a / (1 + 0.18 * a) + gH[i] * (0.45 * Math.exp(-3 * a) + 0.12 * Math.exp(-0.8 * a));
      }
      const blur121 = (src, dst, passes) => {
        for (let pass = 0; pass < passes; pass++) {
          for (let y = 0; y < h; y++) {
            const o = y * w;
            for (let x = 0; x < w; x++) {
              const xm = x > 0 ? x - 1 : x, xp = x < w - 1 ? x + 1 : x;
              H2[o + x] = (src[o + xm] + 2 * src[o + x] + src[o + xp]) * 0.25;
            }
          }
          for (let y = 0; y < h; y++) {
            const ym = (y > 0 ? y - 1 : y) * w, yc = y * w, yp = (y < h - 1 ? y + 1 : y) * w;
            for (let x = 0; x < w; x++) dst[yc + x] = (H2[ym + x] + 2 * H2[yc + x] + H2[yp + x]) * 0.25;
          }
          src = dst;
        }
      };
      // paint is a viscous body: soften it slightly, keep ridges crisp
      blur121(H, H, Math.max(1, Math.round(sc * sc)));
      const T = this.T, ta = 0.25 * this.impasto * Math.pow(sc, 1.6);
      for (let i = 0; i < N; i++) { const a = A[i]; H[i] += T[i] * ta * (a > 0.5 ? 1 : a * 2); }
      // broad local average of the surface, for cavity shading (paint valleys catch less light)
      Hb.set(H);
      boxBlur(Hb, H2, w, h, Math.round(5 * sc));
      boxBlur(Hb, H2, w, h, Math.round(5 * sc));
      let [lx, ly, lz] = this.light;
      const ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
      let hx = lx, hy = ly, hz = lz + 1; const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;
      const g = this.groundColor;
      const cavK = 0.35 / sc;
      for (let y = 0; y < h; y++) {
        const ym = (y > 0 ? y - 1 : y) * w, yc = y * w, yp = (y < h - 1 ? y + 1 : y) * w;
        for (let x = 0; x < w; x++) {
          const i = yc + x;
          const xm = x > 0 ? x - 1 : x, xp = x < w - 1 ? x + 1 : x;
          const dzdx = (H[yc + xp] - H[yc + xm]) * 0.5, dzdy = (H[yp + x] - H[ym + x]) * 0.5;
          let nx = -dzdx, ny = -dzdy, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
          const diff = nx * lx + ny * ly + nz * lz;
          const shade = Math.max(0.6, 1 + 0.38 * (diff - lz));
          let cav = 1 - (Hb[i] - H[i]) * cavK; if (cav > 1.04) cav = 1.04; if (cav < 0.8) cav = 0.8;
          const a = A[i];
          const alpha = 1 - Math.exp(-4.5 * a);
          const ndh = Math.max(0, nx * hx + ny * hy + nz * hz);
          // oil gloss: sharp glints on ridges facing the light, a faint broad sheen elsewhere
          const gloss = Math.min(1, a * 0.9);
          const spec = (Math.pow(ndh, 60) * 0.22 + Math.pow(ndh, 10) * 0.025) * gloss;
          const gw = 0.93 + 0.07 * gH[i];
          const m = shade * cav;
          const r = (g[0] * gw * (1 - alpha) + R[i] * alpha) * m + spec;
          const gg = (g[1] * gw * (1 - alpha) + G[i] * alpha) * m + spec;
          const b = (g[2] * gw * (1 - alpha) + B[i] * alpha) * m + spec;
          const o = i * 4;
          out[o] = r * 255; out[o + 1] = gg * 255; out[o + 2] = b * 255; out[o + 3] = 255;
        }
      }
      return out;
    }

    /** Replay a stroke log (from .log) onto this canvas. */
    replay(log, from, to) {
      for (let k = from || 0; k < (to == null ? log.length : to); k++) {
        const e = log[k];
        if (e.dry) this.dry(); else this.stroke(e);
      }
    }
  }

  // separable running-sum box blur, in place on src (tmp is scratch of the same size)
  function boxBlur(src, tmp, w, h, r) {
    if (r < 1) return;
    const n = 2 * r + 1;
    for (let y = 0; y < h; y++) {
      const o = y * w; let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[o + clamp(x, 0, w - 1)];
      for (let x = 0; x < w; x++) {
        tmp[o + x] = acc / n;
        acc += src[o + clamp(x + r + 1, 0, w - 1)] - src[o + clamp(x - r, 0, w - 1)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x];
      for (let y = 0; y < h; y++) {
        src[y * w + x] = acc / n;
        acc += tmp[clamp(y + r + 1, 0, h - 1) * w + x] - tmp[clamp(y - r, 0, h - 1) * w + x];
      }
    }
  }

  // Catmull-Rom resampling of the control points at ~step px spacing.
  function resample(pts, step) {
    const out = [];
    const n = pts.length;
    const get = (i) => pts[clamp(i, 0, n - 1)];
    let d = 0, prev = null;
    for (let i = 0; i < n - 1; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const m = Math.max(1, Math.ceil(segLen / step));
      for (let j = 0; j < m; j++) {
        const t = j / m, t2 = t * t, t3 = t2 * t;
        const cr = (a, b, c, e) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - e) * t2 + (-a + 3 * b - 3 * c + e) * t3);
        const x = cr(p0[0], p1[0], p2[0], p3[0]), y = cr(p0[1], p1[1], p2[1], p3[1]);
        let p = null;
        if (p1[2] != null || p2[2] != null) {
          const a = p1[2] == null ? 1 : p1[2], b = p2[2] == null ? 1 : p2[2];
          p = a + (b - a) * t;
        }
        push(x, y, p);
      }
    }
    const last = pts[n - 1];
    push(last[0], last[1], last[2]);
    // tangents
    for (let k = 0; k < out.length; k++) {
      const a = out[Math.max(0, k - 2)], b = out[Math.min(out.length - 1, k + 2)];
      let tx = b.x - a.x, ty = b.y - a.y; const l = Math.hypot(tx, ty) || 1;
      out[k].tx = tx / l; out[k].ty = ty / l;
    }
    return out;
    function push(x, y, p) {
      if (prev) {
        const sl = Math.hypot(x - prev.x, y - prev.y);
        if (sl < 1e-3 && out.length > 0) return;
        d += sl;
        prev = { x, y, p, d, step: sl };
      } else prev = { x, y, p, d: 0, step: step };
      out.push(prev);
    }
  }

  const api = { OilPainting, PIGMENTS, parseColor, mixRGB, rgbToHex, hexToRgb, mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.OilPaintV4 = api;
})(typeof window !== 'undefined' ? window : globalThis);
