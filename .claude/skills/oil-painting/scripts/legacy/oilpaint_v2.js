/*
 * oilpaint.js — a small physical-ish oil paint simulator for <canvas>.
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

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

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
      let acc = null, tot = 0;
      for (const item of c) {
        const [name, w0] = Array.isArray(item) ? item : [item, 1];
        const w = w0 == null ? 1 : w0;
        if (w <= 0) continue;
        const col = parseColor(name);
        if (!acc) { acc = col; tot = w; continue; }
        acc = mixRGB(acc, col, w / (tot + w)); tot += w;
      }
      return acc || [0.5, 0.5, 0.5];
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
  const DEPK = 0.30;    // thickness laid down per px of contact by a full bristle

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
          .map((it) => ({ col: parseColor(it[0]), w: it[1] == null ? 1 : it[1] }));
        if (comps.length < 2) comps = null;
      }
      const streak = s.brush === 'knife' ? 0.35 : 1;
      const base2 = s.color2 != null ? parseColor(s.color2) : null;
      const isKnife = brush === 'knife';

      // ---- path
      let pts = s.points.map((p) => [p[0] * sc, p[1] * sc, p.length > 2 && p[2] != null ? p[2] : null]);
      if (pts.length === 1) {
        const a = s.angle != null ? s.angle + Math.PI / 2 : 0;
        const L = size * 0.9;
        pts = [[pts[0][0] - Math.cos(a) * L / 2, pts[0][1] - Math.sin(a) * L / 2, pts[0][2]],
               [pts[0][0] + Math.cos(a) * L / 2, pts[0][1] + Math.sin(a) * L / 2, pts[0][2]]];
      }
      const path = resample(pts, 0.75);
      if (path.length < 2) return;
      const total = path[path.length - 1].d || 1;
      const autoPressure = pts.every((p) => p[2] == null);

      // ---- bristles (each one is really a clump of hairs)
      const spacing = (isKnife ? 1.1 : brush === 'fan' ? 3.2 : 1.7) * sqs;
      const nb = clamp(Math.round(size / spacing), 3, Math.round((isKnife ? 220 : 110) * sqs));
      const bristles = [];
      // smooth random functions across the brush width -> coherent colour ribbons
      const knots = 3 + Math.floor(nb / 7);
      const ribbon = () => { const v = []; for (let k = 0; k <= knots; k++) v.push(rng() * 2 - 1);
        return (u) => { const t = (u + 0.5) * knots, k = Math.min(knots - 1, Math.floor(t)), f = t - k, e = f * f * (3 - 2 * f); return v[k] + (v[k + 1] - v[k]) * e; }; };
      const compNoise = comps ? comps.map(() => ribbon()) : null;
      const valNoise = ribbon(), warmNoise = ribbon(), loadNoise = ribbon();
      const ragged = clamp(total / (size * 2.5), 0.15, 1); // short touches land almost whole
      for (let i = 0; i < nb; i++) {
        let u = (i + 0.5) / nb - 0.5;
        if (!isKnife) u += (rng() - 0.5) * 0.7 / nb;
        let prof = 1;
        if (brush === 'round') prof = Math.cos(u * Math.PI * 0.95) ** 0.8;
        else if (brush === 'filbert') prof = Math.sqrt(Math.max(0, 1 - (2 * u) ** 2)) * 0.6 + 0.4;
        else if (brush === 'fan') prof = 0.5 + 0.5 * rng();
        const r = isKnife ? 1.0 : clamp((size / nb) * (brush === 'fan' ? 0.4 : 0.85), 0.6, 2.6 * sqs) * (0.75 + 0.5 * rng());
        const area = Math.PI * r * r;
        const lv = isKnife ? 0.97 + 0.06 * rng() : clamp(1 + 0.32 * loadNoise(u) + (rng() - 0.5) * 0.35, 0.35, 1.6);
        let col = base;
        if (comps) {
          let acc = null, tot = 0;
          for (let c = 0; c < comps.length; c++) {
            const wgt = comps[c].w * Math.exp(1.1 * streak * compNoise[c](u) + (rng() - 0.5) * 0.5 * streak);
            if (!acc) { acc = comps[c].col; tot = wgt; continue; }
            acc = mixRGB(acc, comps[c].col, wgt / (tot + wgt)); tot += wgt;
          }
          col = acc;
        }
        if (base2) {
          const t = clamp((u + 0.5 - 0.5) * 3 + 0.5 + (rng() - 0.5) * 0.3, 0, 1); // left->right blend
          col = mixRGB(base, base2, t);
        }
        col = col.slice();
        { // uneven pigment dispersion: value and temperature drift in ribbons across the brush
          const j = valNoise(u) * 0.05 * streak + (rng() - 0.5) * 0.06 * streak, wm = warmNoise(u) * 0.025 * streak;
          col[0] = clamp(col[0] * (1 + j + wm), 0, 1); col[1] = clamp(col[1] * (1 + j), 0, 1); col[2] = clamp(col[2] * (1 + j - wm), 0, 1);
        }
        const edge = Math.abs(u) > 0.4 && !isKnife;
        bristles.push({
          u, prof, r, area,
          L: capS * load * lv * area * (edge ? 0.75 : 1),   // paint amount held
          col,
          wobA: isKnife ? 0 : (rng() - 0.5) * (edge ? 2.6 : 0.9) * sc, wobF: 0.01 + rng() * 0.04, wobP: rng() * 6.28,
          gv: rng() - 0.5,   // this bristle's own groove depth: irregular striations
          s0: isKnife ? 0 : rng() ** 1.5 * size * 0.35 * ragged,   // ragged start
          s1: isKnife ? 0 : rng() ** 1.5 * size * 0.45 * ragged,   // ragged lift-off
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
      const gAmp = isKnife ? 0 : (0.55 + 0.45 * Math.min(load, 1)) * (1 - thin * 0.7);
      const ridgeAmp = (isKnife ? 1.2 : 0.7) * Math.min(load, 1.3) * (1 - thin * 0.6);

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
          if (br.L <= 1e-5) continue;
          const off = br.u * width + br.wobA * Math.sin(P.d * br.wobF + br.wobP);
          const bx = P.x + nx * off, by = P.y + ny * off;
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
              let wt = rr + 0.5 - dist;
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
              // --- pick up wet paint from the canvas into the bristle
              const wet = W[i];
              if (wet > 0.002) {
                let pk = wet * pickRate * cw * f;
                if (pk > wet * 0.5) pk = wet * 0.5;
                tmp[0] = R[i]; tmp[1] = G[i]; tmp[2] = B[i];
                mixInto(br.col, tmp, pk / (pk + br.area * (0.25 + 0.5 * Math.min(1, br.L / (br.area * capS))) + 1e-6));
                br.L += pk; W[i] = wet - pk; A[i] = a0 - pk > 0 ? a0 - pk : 0;
              }
              const a = A[i];
              const full = br.L / (br.area * capS);
              const dep = Math.pow(full > 1.5 ? 1.5 : full, 0.6) * rate * cw * f * thick;
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
              const pc = (xx + 0.5 - P.x) * nx + (yy + 0.5 - P.y) * ny;
              const ed = Math.abs(pc) / (halfW + 0.5);
              const ridge = (ed > 0.72 ? (ed - 0.72) * 3.2 : 0) * ridgeAmp * full + lift * 0.9 * ridgeAmp * full;
              const tv = gAmp * 0.6 * br.gv + ridge;
              let tk = cover * 1.6 * opacity; if (tk > 1) tk = 1;
              T[i] += (tv - T[i]) * tk;
              br.L -= dep;
            }
          }
        }
      }
    }

    // ------------------------------------------------------------- rendering
    /** Render into an RGBA Uint8ClampedArray (e.g. ImageData.data) with impasto lighting. */
    renderTo(out) {
      const { w, h, A, gH, R, G, B } = this;
      const N = w * h;
      if (!this._H || this._H.length !== N) { this._H = new Float32Array(N); this._H2 = new Float32Array(N); }
      const H = this._H, H2 = this._H2;
      const sc = this.scale;
      const hs = 0.65 * this.impasto * sc;
      for (let i = 0; i < N; i++) {
        const a = A[i];
        H[i] = a * hs + gH[i] * 0.4 * Math.exp(-3 * a);
      }
      // the body of the paint is soft-edged: blur its bulk twice, then add the crisp combed relief
      const passes = Math.round(2 * sc * sc);
      for (let pass = 0; pass < passes; pass++) {
        for (let y = 0; y < h; y++) {
          const o = y * w;
          for (let x = 0; x < w; x++) {
            const xm = x > 0 ? x - 1 : x, xp = x < w - 1 ? x + 1 : x;
            H2[o + x] = (H[o + xm] + 2 * H[o + x] + H[o + xp]) * 0.25;
          }
        }
        for (let y = 0; y < h; y++) {
          const ym = (y > 0 ? y - 1 : y) * w, yc = y * w, yp = (y < h - 1 ? y + 1 : y) * w;
          for (let x = 0; x < w; x++) H[yc + x] = (H2[ym + x] + 2 * H2[yc + x] + H2[yp + x]) * 0.25;
        }
      }
      const T = this.T, ta = 0.3 * this.impasto * Math.sqrt(sc);
      for (let i = 0; i < N; i++) { const a = A[i]; H[i] += T[i] * ta * (a > 0.5 ? 1 : a * 2); }
      let [lx, ly, lz] = this.light;
      const ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
      let hx = lx, hy = ly, hz = lz + 1; const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;
      const g = this.groundColor;
      for (let y = 0; y < h; y++) {
        const ym = (y > 0 ? y - 1 : y) * w, yc = y * w, yp = (y < h - 1 ? y + 1 : y) * w;
        for (let x = 0; x < w; x++) {
          const i = yc + x;
          const xm = x > 0 ? x - 1 : x, xp = x < w - 1 ? x + 1 : x;
          const dzdx = (H[yc + xp] - H[yc + xm]) * 0.5, dzdy = (H[yp + x] - H[ym + x]) * 0.5;
          let nx = -dzdx, ny = -dzdy, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
          const diff = nx * lx + ny * ly + nz * lz;
          const shade = Math.max(0.6, 1 + 0.38 * (diff - lz));
          const a = A[i];
          const alpha = 1 - Math.exp(-4.5 * a);
          const ndh = Math.max(0, nx * hx + ny * hy + nz * hz);
          const spec = Math.pow(ndh, 28) * 0.11 * Math.min(1, a);
          const gw = 0.93 + 0.07 * gH[i];
          const r = (g[0] * gw * (1 - alpha) + R[i] * alpha) * shade + spec;
          const gg = (g[1] * gw * (1 - alpha) + G[i] * alpha) * shade + spec;
          const b = (g[2] * gw * (1 - alpha) + B[i] * alpha) * shade + spec;
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
  global.OilPaintV2 = api;
})(typeof window !== 'undefined' ? window : globalThis);
