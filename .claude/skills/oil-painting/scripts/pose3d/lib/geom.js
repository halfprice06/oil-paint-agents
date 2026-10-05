// pose3d geometry helpers (browser side, plain script; needs global THREE)
// loft: a smooth closed body through elliptical/superelliptical cross-sections stacked along Y.
// section = {y, w (full width along X), f (depth toward +Z/front), b (depth toward -Z/back), z (centre offset), x (centre offset), p (2 = ellipse, >2 boxier)}
(function () {
  const T = THREE;
  const sgnpow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
  function catmull(a, i, u, key) {
    const n = a.length - 1;
    const g = (k) => { const s = a[Math.max(0, Math.min(n, k))]; const v = s[key]; return v === undefined ? (key === 'p' ? 2 : 0) : v; };
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
  }
  function loft(sections, o) {
    o = o || {};
    const seg = o.seg || 20, sub = o.sub || 4, k = o.inflate || 1;
    const S = sections.slice().sort((a, b) => a.y - b.y);
    const rings = [];
    for (let i = 0; i < S.length - 1; i++) {
      for (let s = 0; s < sub; s++) {
        const u = s / sub;
        rings.push(['y', 'w', 'f', 'b', 'z', 'x', 'p'].reduce((r, key) => (r[key] = catmull(S, i, u, key), r), {}));
      }
    }
    rings.push(Object.assign({ z: 0, x: 0, p: 2 }, S[S.length - 1]));
    const pos = [], idx = [];
    for (const r of rings) {
      const e = 2 / Math.max(1.2, r.p || 2);
      for (let j = 0; j < seg; j++) {
        const a = (j / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
        const w = Math.max(1e-4, r.w) * k, f = Math.max(1e-4, r.f) * k, b = Math.max(1e-4, r.b) * k;
        pos.push((r.x || 0) + (w / 2) * sgnpow(c, e), r.y, (r.z || 0) + (s >= 0 ? f : b) * sgnpow(s, e));
      }
    }
    const R = rings.length;
    for (let i = 0; i < R - 1; i++) for (let j = 0; j < seg; j++) {
      const v00 = i * seg + j, v01 = i * seg + (j + 1) % seg, v10 = (i + 1) * seg + j, v11 = (i + 1) * seg + (j + 1) % seg;
      idx.push(v00, v10, v01, v01, v10, v11);
    }
    if (o.capBottom !== false) {
      const r = rings[0]; const pi = pos.length / 3; pos.push(r.x || 0, r.y, r.z || 0);
      for (let j = 0; j < seg; j++) idx.push(pi, j, (j + 1) % seg);
    }
    if (o.capTop !== false) {
      const r = rings[R - 1]; const pi = pos.length / 3; pos.push(r.x || 0, r.y, r.z || 0);
      const base = (R - 1) * seg;
      for (let j = 0; j < seg; j++) idx.push(pi, base + (j + 1) % seg, base + j);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  // tube with a radius profile along a list of points (THREE.Vector3)
  function taperTube(points, radiusFn, o) {
    o = o || {};
    const radial = o.radial || 10, n = o.segments || Math.max(8, points.length * 4);
    const curve = new T.CatmullRomCurve3(points);
    const fr = curve.computeFrenetFrames(n, false);
    const pos = [], idx = [];
    const flat = o.flat || 1;
    for (let i = 0; i <= n; i++) {
      const t = i / n, P = curve.getPointAt(t), N = fr.normals[i], B = fr.binormals[i];
      const r = Math.max(1e-4, radiusFn(t));
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * Math.PI * 2, c = Math.cos(a) * r, s = Math.sin(a) * r * flat;
        pos.push(P.x + c * N.x + s * B.x, P.y + c * N.y + s * B.y, P.z + c * N.z + s * B.z);
      }
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
      const a = i * radial + j, b = i * radial + (j + 1) % radial, c = (i + 1) * radial + j, d = (i + 1) * radial + (j + 1) % radial;
      idx.push(a, b, c, b, d, c);
    }
    const p0 = curve.getPointAt(0), p1 = curve.getPointAt(1);
    let pi = pos.length / 3; pos.push(p0.x, p0.y, p0.z);
    for (let j = 0; j < radial; j++) idx.push(pi, (j + 1) % radial, j);
    pi = pos.length / 3; pos.push(p1.x, p1.y, p1.z); const base = n * radial;
    for (let j = 0; j < radial; j++) idx.push(pi, base + j, base + (j + 1) % radial);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    // the winding depends on the frame handedness; make normals point outward
    return fixOutward(g, curve, n);
  }
  function fixOutward(g, curve) {
    const p = g.attributes.position, nrm = g.attributes.normal;
    // test one vertex in the middle of the tube
    const radial = 1; const mid = Math.floor(p.count / 2);
    const v = new T.Vector3().fromBufferAttribute(p, mid), nn = new T.Vector3().fromBufferAttribute(nrm, mid);
    // closest curve point
    let best = null, bd = 1e9;
    for (let i = 0; i <= 40; i++) { const q = curve.getPointAt(i / 40); const d = q.distanceToSquared(v); if (d < bd) { bd = d; best = q; } }
    if (v.clone().sub(best).dot(nn) < 0) {
      const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
      g.index.needsUpdate = true; g.computeVertexNormals();
    }
    return g;
  }
  // seeded RNG
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  window.P3G = { loft, taperTube, rng, hashStr };
})();
