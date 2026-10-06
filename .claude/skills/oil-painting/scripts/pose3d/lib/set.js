// pose3d set pieces (browser side): architecture, fair props and procedural textures for prop types beyond the
// primitives in scene.js. Each builder returns a THREE.Group positioned at the origin; scene.js places it.
//   tower, tent, tree, bunting, balloon, telepod, vortex, stage, console, pole, flag
// Every mesh carries userData {part:'prop', color, figId, kind:'prop'} so the flat/id passes work.
(function () {
  const T = THREE, D = Math.PI / 180;
  const { rng, taperTube } = window.P3G;

  // ---------------------------------------------------------------- procedural textures (canvas)
  const TEX = {};
  function canvasTex(key, w, h, draw) {
    if (TEX[key]) return TEX[key];
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
    t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter;
    return (TEX[key] = t);
  }
  // multiplicative detail textures: mid-grey-ish white so the material colour stays the local colour
  const shade = (v) => { const g = Math.max(0, Math.min(255, Math.round(v))); return `rgb(${g},${g},${g})`; };
  function texture(kind, seed) {
    const R = rng(seed || 7);
    if (kind === 'paving') return canvasTex('paving' + seed, 1024, 1024, (x, w, h) => {
      // irregular rectangular setts in running courses, light grout, soft per-stone value shifts
      x.fillStyle = shade(222); x.fillRect(0, 0, w, h);
      const rows = 10, rh = h / rows;
      for (let r = 0; r < rows; r++) {
        let cx = -R() * 80;
        while (cx < w) {
          const sw = 80 + R() * 70;
          x.fillStyle = shade(240 + R() * 15);
          const inset = 4;
          x.beginPath();
          const rr = 10;
          const x0 = cx + inset, y0 = r * rh + inset, x1 = cx + sw - inset, y1 = (r + 1) * rh - inset;
          x.moveTo(x0 + rr, y0); x.lineTo(x1 - rr, y0); x.quadraticCurveTo(x1, y0, x1, y0 + rr); x.lineTo(x1, y1 - rr);
          x.quadraticCurveTo(x1, y1, x1 - rr, y1); x.lineTo(x0 + rr, y1); x.quadraticCurveTo(x0, y1, x0, y1 - rr); x.lineTo(x0, y0 + rr);
          x.quadraticCurveTo(x0, y0, x0 + rr, y0); x.fill();
          // wrap stones that cross the right edge so the tile repeats
          if (x1 > w) { x.save(); x.translate(-w, 0); x.fill(); x.restore(); }
          cx += sw;
        }
      }
    });
    if (kind === 'ashlar') return canvasTex('ashlar' + seed, 512, 512, (x, w, h) => {
      x.fillStyle = shade(170); x.fillRect(0, 0, w, h);
      const rows = 8, rh = h / rows;
      for (let r = 0; r < rows; r++) {
        let cx = (r % 2) * -64 - R() * 20;
        while (cx < w) {
          const sw = 100 + R() * 50;
          x.fillStyle = shade(215 + R() * 40);
          x.fillRect(cx + 3, r * rh + 3, sw - 6, rh - 6);
          if (cx + sw > w) x.fillRect(cx + 3 - w, r * rh + 3, sw - 6, rh - 6);
          cx += sw;
        }
      }
    });
    if (kind === 'planks') return canvasTex('planks' + seed, 512, 512, (x, w, h) => {
      const n = 8, pw = w / n;
      for (let i = 0; i < n; i++) {
        x.fillStyle = shade(205 + R() * 50); x.fillRect(i * pw, 0, pw, h);
        x.fillStyle = shade(120); x.fillRect(i * pw, 0, 3, h);
        const j = R() * h; x.fillRect(i * pw, j, pw, 3);
      }
    });
    if (kind === 'spiral') return canvasTex('spiral' + seed, 1024, 1024, (x, w, h) => {
      // vortex: dark-violet rim to a white-hot eye, with bright spiral arms (colour texture, used as emissive map too)
      const cx = w / 2, cy = h / 2, Rr = w / 2;
      const img = x.createImageData(w, h), d = img.data;
      const arms = 3;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const dx = (i - cx) / Rr, dy = (j - cy) / Rr, r = Math.sqrt(dx * dx + dy * dy);
        const k = (j * w + i) * 4;
        if (r > 1) { d[k + 3] = 0; continue; }
        const a = Math.atan2(dy, dx);
        const phase = a * arms + Math.log(r + .04) * 7.5; // log spiral
        const arm = Math.pow(.5 + .5 * Math.cos(phase), 3);
        const core = Math.exp(-r * r / .03);
        const rim = Math.pow(r, 6);
        // base colours: deep violet -> blue -> pale cyan-white core
        let R0 = 70 + 60 * (1 - r), G0 = 40 + 70 * (1 - r), B0 = 170 + 70 * (1 - r);
        R0 += arm * (120 * (1 - r) + 60); G0 += arm * (150 * (1 - r) + 40); B0 += arm * 60;
        R0 = R0 * (1 - core) + 255 * core; G0 = G0 * (1 - core) + 250 * core; B0 = B0 * (1 - core) + 255 * core;
        R0 = R0 * (1 - rim * .5) + 150 * rim * .5; G0 = G0 * (1 - rim * .5) + 200 * rim * .5; B0 = B0 * (1 - rim * .5) + 255 * rim * .5;
        d[k] = Math.min(255, R0); d[k + 1] = Math.min(255, G0); d[k + 2] = Math.min(255, B0); d[k + 3] = 255;
      }
      x.putImageData(img, 0, 0);
    });
    if (kind === 'glow') return canvasTex('glow', 256, 256, (x, w, h) => {
      const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.45, 'rgba(255,255,255,.55)'); g.addColorStop(.75, 'rgba(255,255,255,.15)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    return null;
  }

  // ---------------------------------------------------------------- helpers
  function mat(color, o) {
    o = o || {};
    const m = new T.MeshStandardMaterial({ color: new T.Color(color), roughness: o.roughness === undefined ? .85 : o.roughness, metalness: o.metalness || 0, side: o.double ? T.DoubleSide : T.FrontSide });
    if (o.emissive) { m.emissive = new T.Color(o.emissive); m.emissiveIntensity = o.emissiveIntensity === undefined ? 1 : o.emissiveIntensity; }
    if (o.map) m.map = o.map;
    if (o.emissiveMap) m.emissiveMap = o.emissiveMap;
    return m;
  }
  function mesh(g, color, o, figId) {
    o = o || {};
    const m = new T.Mesh(g, o.material || mat(color, o));
    m.castShadow = o.castShadow !== false; m.receiveShadow = o.receiveShadow !== false;
    m.userData = { part: 'prop', color: o.flat || color, figId, kind: 'prop', emissive: o.emissive && o.flatEmissive !== false ? (o.flat || o.emissive) : undefined };
    return m;
  }
  const V = (a) => new T.Vector3(a[0], a[1], a[2]);
  function rod(a, b, r, color, o, figId) { // cylinder between two points
    const A = V(a), B = V(b), len = A.distanceTo(B);
    const g = new T.CylinderGeometry(r, (o && o.r2) || r, len, 10);
    const m = mesh(g, color, o, figId);
    m.position.copy(A).lerp(B, .5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
  }
  function repeatTex(kind, seed, rx, ry) { const t = texture(kind, seed).clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return t; }
  // box with UVs scaled so a texture repeats every `tile` metres on every face
  function texBox(sx, sy, sz, tile, kind, seed) {
    const g = new T.BoxGeometry(sx, sy, sz);
    const uv = g.attributes.uv, n = g.attributes.normal, p = g.attributes.position;
    for (let i = 0; i < uv.count; i++) {
      const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
      let u, v;
      if (ny > .5) { u = p.getX(i); v = p.getZ(i); } else if (nx > .5) { u = p.getZ(i); v = p.getY(i); } else { u = p.getX(i); v = p.getY(i); }
      uv.setXY(i, u / tile, v / tile);
    }
    return g;
  }

  // ---------------------------------------------------------------- builders
  const B = {};

  // Square stone bell tower: shaft, string courses, open belfry (corner piers, arches implied by lintel), bell, pyramid roof, finial.
  B.tower = function (pr, figId) {
    const G = new T.Group();
    const w = pr.width || 5, h = pr.height || 16, bh = pr.belfry || 3.4, rh = pr.roof || 4.2;
    const stone = pr.color || '#cbb894', roof = pr.roofColor || '#9a4a32', dark = pr.darkColor || '#2a2420';
    const ash = repeatTex('ashlar', 3, 1, 1);
    const shaft = mesh(texBox(w, h, w, 2.4, 'ashlar'), stone, { map: ash }, figId); shaft.position.y = h / 2; G.add(shaft);
    // plinth and string courses
    const plinth = mesh(new T.BoxGeometry(w + .5, 1.0, w + .5), stone, {}, figId); plinth.position.y = .5; G.add(plinth);
    for (const y of [h * .45, h]) { const c = mesh(new T.BoxGeometry(w + .35, .35, w + .35), stone, {}, figId); c.position.y = y; G.add(c); }
    // windows (dark slits) on the front and side faces
    const win = (x, y, z, rot, ww, wh) => { const m = mesh(new T.BoxGeometry(ww, wh, .12), dark, { roughness: 1 }, figId); m.position.set(x, y, z); m.rotation.y = rot; G.add(m); };
    for (const [face, rot] of [[[0, 1], 0], [[1, 0], Math.PI / 2], [[-1, 0], Math.PI / 2], [[0, -1], 0]]) {
      const fx = face[0] * (w / 2 + .02), fz = face[1] * (w / 2 + .02);
      win(fx, h * .3, fz, rot, .55, 1.4); win(fx, h * .66, fz, rot, .6, 1.6);
    }
    if (pr.clock !== false) { // clock face below the belfry, on the front (+Z)
      const cf = mesh(new T.CylinderGeometry(w * .2, w * .2, .1, 32), pr.clockColor || '#efe6cc', {}, figId); cf.rotation.x = Math.PI / 2; cf.position.set(0, h * .84, w / 2 + .08); G.add(cf);
      const rim = mesh(new T.TorusGeometry(w * .2, .07, 8, 32), '#6a5a3a', {}, figId); rim.position.set(0, h * .84, w / 2 + .12); G.add(rim);
      const hand1 = mesh(new T.BoxGeometry(.06, w * .14, .04), dark, {}, figId); hand1.position.set(0, h * .84 + w * .06, w / 2 + .16); G.add(hand1);
      const hand2 = mesh(new T.BoxGeometry(.06, w * .1, .04), dark, {}, figId); hand2.position.set(w * .04, h * .84 - .02, w / 2 + .16); hand2.rotation.z = -1.2; G.add(hand2);
    }
    // belfry: floor slab, four corner piers, lintel slab, dark interior core so the openings read, bell
    const pier = w * .2;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = mesh(new T.BoxGeometry(pier, bh, pier), stone, {}, figId); p.position.set(sx * (w / 2 - pier / 2), h + bh / 2, sz * (w / 2 - pier / 2)); G.add(p); }
    const lint = mesh(new T.BoxGeometry(w + .3, .6, w + .3), stone, {}, figId); lint.position.y = h + bh + .3; G.add(lint);
    const sill = mesh(new T.BoxGeometry(w - .1, .5, w - .1), stone, {}, figId); sill.position.y = h + .25; G.add(sill);
    const bell = mesh(new T.CylinderGeometry(.45, .85, 1.2, 24, 1, true), pr.bellColor || '#8a6a2a', { metalness: .6, roughness: .4, double: true }, figId); bell.position.set(0, h + bh * .55, 0); G.add(bell);
    const bellTop = mesh(new T.SphereGeometry(.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), pr.bellColor || '#8a6a2a', { metalness: .6, roughness: .4 }, figId); bellTop.position.set(0, h + bh * .55 + .6, 0); G.add(bellTop);
    const beam = mesh(new T.BoxGeometry(w - .4, .25, .25), '#4a3626', {}, figId); beam.position.set(0, h + bh * .55 + 1.15, 0); G.add(beam);
    // roof: 4-sided pyramid, eaves overhang
    const roofG = new T.ConeGeometry((w + .9) / Math.SQRT2 * 1.0, rh, 4, 1); roofG.rotateY(Math.PI / 4);
    const rf = mesh(roofG, roof, { roughness: .9 }, figId); rf.position.y = h + bh + .6 + rh / 2; G.add(rf);
    const fin = rod([0, h + bh + .6 + rh - .1, 0], [0, h + bh + .6 + rh + 1.0, 0], .05, '#5a4a30', {}, figId); G.add(fin);
    const ball = mesh(new T.SphereGeometry(.14, 12, 8), '#c8a040', { metalness: .5, roughness: .4 }, figId); ball.position.y = h + bh + .6 + rh + 1.05; G.add(ball);
    return G;
  };

  // Striped circus tent: vertical-striped wall, striped cone roof, scalloped valance implied by a ring, pole + pennant.
  B.tent = function (pr, figId) {
    const G = new T.Group();
    const r = pr.radius || 3.5, wh = pr.wall || 2.2, rh = pr.roof || 3.2, n = pr.stripes || 16;
    const c1 = pr.color || '#c8382e', c2 = pr.color2 || '#f2e8d8';
    const seg = Math.PI * 2 / n;
    for (let i = 0; i < n; i++) {
      const col = i % 2 ? c2 : c1;
      const wall = mesh(new T.CylinderGeometry(r, r, wh, 4, 1, true, i * seg, seg), col, { double: true }, figId); wall.position.y = wh / 2; G.add(wall);
      const rf = mesh(new T.ConeGeometry(r * 1.08, rh, 4, 1, true, i * seg, seg), col, { double: true }, figId); rf.position.y = wh + rh / 2; G.add(rf);
      // valance: a short flared band under the roof edge
      const val = mesh(new T.CylinderGeometry(r * 1.08, r * 1.1, .45, 4, 1, true, i * seg, seg), i % 2 ? c1 : c2, { double: true }, figId); val.position.y = wh - .2; G.add(val);
    }
    // doorway (dark flap) facing +Z, rotated by the prop rotation
    if (pr.door !== false) { const d = mesh(new T.PlaneGeometry(r * .5, wh * .85), '#3a2a24', { double: true, roughness: 1 }, figId); d.position.set(0, wh * .42, r + .02); G.add(d); }
    const top = wh + rh;
    G.add(rod([0, top - .2, 0], [0, top + 1.2, 0], .05, '#5a4a3a', {}, figId));
    G.add(flagMesh([0, top + 1.15, 0], pr.flagColor || '#e8c040', .9, .45, figId));
    return G;
  };
  function flagMesh(at, color, len, ht, figId) {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, len, -ht / 2, .05, 0, -ht, 0], 3)); g.computeVertexNormals();
    const m = mesh(g, color, { double: true }, figId); m.position.set(at[0], at[1], at[2]); return m;
  }
  B.flag = function (pr, figId) { const G = new T.Group(); G.add(flagMesh([0, 0, 0], pr.color || '#e8c040', pr.length || .9, pr.heightM || .45, figId)); return G; };

  // Tree: tapering trunk with a couple of limbs and a canopy built from lumpy foliage masses (seeded).
  B.tree = function (pr, figId) {
    const G = new T.Group();
    const R = rng(pr.seed || 5);
    const th = pr.trunk || 3.2, tr = pr.trunkRadius || .28, cr = pr.canopy || [4, 3, 4]; // canopy radii x,y,z
    const cy = th + cr[1] * .7;
    const bark = pr.trunkColor || '#5a4636';
    G.add(rod([0, 0, 0], [0, th + cr[1] * .4, 0], tr, bark, { r2: tr * 1.35, roughness: 1 }, figId));
    for (let i = 0; i < 3; i++) { const a = R() * Math.PI * 2; G.add(rod([0, th * .8, 0], [Math.cos(a) * cr[0] * .5, th + cr[1] * .5, Math.sin(a) * cr[2] * .5], tr * .45, bark, { r2: tr * .7, roughness: 1 }, figId)); }
    const cols = pr.colors || ['#4f7a34', '#5d8a3a', '#46702e', '#6a9440'];
    const nb = pr.clumps || 22;
    for (let i = 0; i < nb; i++) {
      // points inside the canopy ellipsoid, biased to the shell so the mass reads as one volume with lumpy edges
      let u, v, w; do { u = R() * 2 - 1; v = R() * 2 - 1; w = R() * 2 - 1; } while (u * u + v * v + w * w > 1);
      const s = Math.pow(u * u + v * v + w * w, .5); const k = .55 + .45 * s;
      const rad = (pr.clumpSize || 1.25) * (.6 + R() * .6) * Math.min(cr[0], cr[1], cr[2]) / 2.6;
      // smooth lumpy sphere: low-frequency displacement (a function of direction, so the UV seam stays closed)
      const g = new T.SphereGeometry(rad, 22, 14);
      const p = g.attributes.position, a1 = R() * 6, a2 = R() * 6, a3 = R() * 6;
      for (let j = 0; j < p.count; j++) {
        const x = p.getX(j) / rad, y = p.getY(j) / rad, z = p.getZ(j) / rad;
        const f = 1 + .14 * Math.sin(3.1 * x + a1) * Math.sin(2.7 * y + a2) * Math.sin(3.3 * z + a3) + .06 * Math.sin(6 * x + 5 * z + a2);
        p.setXYZ(j, p.getX(j) * f, p.getY(j) * f * .82, p.getZ(j) * f);
      }
      g.computeVertexNormals();
      const m = mesh(g, cols[i % cols.length], { roughness: .95 }, figId);
      m.position.set(u * cr[0] * k, cy + v * cr[1] * k, w * cr[2] * k); G.add(m);
    }
    return G;
  };

  // Bunting: a sagging string between two world points with triangular pennants in a repeating colour cycle.
  B.bunting = function (pr, figId) {
    const G = new T.Group();
    const A = V(pr.from), Bp = V(pr.to), sag = pr.sag === undefined ? .8 : pr.sag, n = pr.count || 18;
    const P = (t) => A.clone().lerp(Bp, t).add(new T.Vector3(0, -sag * 4 * t * (1 - t), 0));
    const pts = []; for (let i = 0; i <= 24; i++) pts.push(P(i / 24));
    G.add(mesh(taperTube(pts, () => pr.cord || .015, { radial: 5, segments: 48 }), pr.cordColor || '#3a3028', {}, figId));
    const cols = pr.colors || ['#d8402e', '#f0c040', '#3a7ac8', '#f2ead8', '#3a9a5a'];
    const pw = pr.width || .3, ph = pr.length || .42;
    for (let i = 0; i < n; i++) {
      const t = (i + .5) / n, a = P(t - .5 / n * .8), b = P(t + .5 / n * .8);
      const dir = b.clone().sub(a).normalize().multiplyScalar(pw / 2), mid = P(t);
      const tip = mid.clone().add(new T.Vector3(0, -ph, 0));
      const g = new T.BufferGeometry();
      const p0 = mid.clone().sub(dir), p1 = mid.clone().add(dir);
      g.setAttribute('position', new T.Float32BufferAttribute([p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, tip.x, tip.y, tip.z], 3)); g.computeVertexNormals();
      G.add(mesh(g, cols[i % cols.length], { double: true }, figId));
    }
    return G;
  };

  // Balloon: slightly egg-shaped sphere, knot, string hanging (or to a hand position `stringTo`).
  B.balloon = function (pr, figId) {
    const G = new T.Group();
    const r = pr.radius || .22, col = pr.color || '#d8302a';
    const b = mesh(new T.SphereGeometry(r, 24, 16), col, { roughness: .3 }, figId); b.scale.set(1, 1.18, 1); G.add(b);
    const k = mesh(new T.ConeGeometry(r * .14, r * .2, 8), col, { roughness: .3 }, figId); k.position.y = -r * 1.2; G.add(k);
    const len = pr.string === undefined ? 1.1 : pr.string;
    const end = pr.stringTo ? V(pr.stringTo) : new T.Vector3(.1, -r * 1.25 - len, .05);
    const s = new T.Vector3(0, -r * 1.25, 0);
    const mid = s.clone().lerp(end, .5).add(new T.Vector3(.08, 0, 0));
    G.add(mesh(taperTube([s, mid, end], () => .006, { radial: 4, segments: 10 }), '#e8e0d0', { castShadow: false }, figId));
    return G;
  };

  // Telepod (Lucca's): plinth, brass coil drum (stacked tori around a dark core), steel flanges, steel dome, antennas.
  B.telepod = function (pr, figId) {
    const G = new T.Group();
    const r = pr.radius || .7, ch = pr.coil || 1.3;
    const brass = pr.color || '#c89a3a', steel = pr.steel || '#9aa4b0', dark = pr.dark || '#3a3430';
    const base = mesh(new T.CylinderGeometry(r * 1.15, r * 1.25, .3, 32), dark, { roughness: .6, metalness: .3 }, figId); base.position.y = .15; G.add(base);
    const fl1 = mesh(new T.CylinderGeometry(r * 1.08, r * 1.08, .1, 32), steel, { roughness: .4, metalness: .3 }, figId); fl1.position.y = .35; G.add(fl1);
    const core = mesh(new T.CylinderGeometry(r * .9, r * .9, ch, 32), dark, { roughness: .5 }, figId); core.position.y = .4 + ch / 2; G.add(core);
    const turns = pr.turns || 9, tr = ch / turns / 2 * .92;
    for (let i = 0; i < turns; i++) { const t = mesh(new T.TorusGeometry(r * .92, tr, 10, 40), brass, { roughness: .35, metalness: .4 }, figId); t.rotation.x = Math.PI / 2; t.position.y = .4 + tr + i * (ch / turns); G.add(t); }
    const fl2 = mesh(new T.CylinderGeometry(r * 1.08, r * 1.08, .1, 32), steel, { roughness: .4, metalness: .3 }, figId); fl2.position.y = .45 + ch; G.add(fl2);
    const dome = mesh(new T.SphereGeometry(r * 1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), steel, { roughness: .3, metalness: .3 }, figId); dome.position.y = .5 + ch; G.add(dome);
    const top = .5 + ch + r;
    const ants = pr.antennas || [[0, 0, 0, 1.1]]; // [dx, dz, lean(deg, toward +x), length]
    for (const a of ants) {
      const s = [a[0], top - .05 - Math.abs(a[0]) * .5, a[1]], L = a[3] || 1, ln = (a[2] || 0) * D;
      const e = [s[0] + Math.sin(ln) * L, s[1] + Math.cos(ln) * L, s[2]];
      G.add(rod(s, e, .025, steel, { metalness: .7, roughness: .3 }, figId));
      const bl = mesh(new T.SphereGeometry(.07, 12, 8), pr.tipColor || '#d84030', { roughness: .4, emissive: pr.tipGlow, emissiveIntensity: 1 }, figId); bl.position.set(...e); G.add(bl);
    }
    return G;
  };

  // Time-gate vortex: spiral disc (emissive, faces +Z), bright rim torus, inner swirl ribbons, additive glow halo.
  B.vortex = function (pr, figId) {
    const G = new T.Group();
    const r = pr.radius || 1.6, I = pr.intensity === undefined ? 1.6 : pr.intensity;
    const sp = texture('spiral', 1);
    const discMat = new T.MeshStandardMaterial({ color: new T.Color('#000000'), emissive: new T.Color('#ffffff'), emissiveIntensity: I, emissiveMap: sp, transparent: true, map: sp, roughness: 1, side: T.DoubleSide });
    const disc = mesh(new T.CircleGeometry(r, 64), '#7a62e0', { material: discMat, castShadow: false, emissive: '#7a62e0' }, figId); G.add(disc);
    const rim = mesh(new T.TorusGeometry(r, r * .045, 12, 64), pr.rimColor || '#c8d8ff', { emissive: pr.rimColor || '#b8c8ff', emissiveIntensity: I * 1.1, castShadow: false }, figId); G.add(rim);
    // swirl ribbons a little in front, so the vortex has depth
    for (let k = 0; k < (pr.ribbons === undefined ? 3 : pr.ribbons); k++) {
      const pts = []; const a0 = k * Math.PI * 2 / Math.max(1, pr.ribbons === undefined ? 3 : pr.ribbons);
      for (let i = 0; i <= 20; i++) { const t = i / 20, rr = r * (1 - t * .85), a = a0 + t * 3.6; pts.push(new T.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, .08 + t * .5)); }
      G.add(mesh(taperTube(pts, t => r * .03 * (1 - t * .7), { radial: 6, segments: 40, flat: .5 }), pr.ribbonColor || '#b4b0ff', { emissive: pr.ribbonColor || '#a8a4ff', emissiveIntensity: I * .8, castShadow: false }, figId));
    }
    if (pr.halo !== false) {
      const hm = new T.MeshBasicMaterial({ map: texture('glow'), color: new T.Color(pr.haloColor || '#8070ff'), transparent: true, opacity: pr.haloOpacity === undefined ? .55 : pr.haloOpacity, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
      const h = new T.Mesh(new T.PlaneGeometry(r * 3.4, r * 3.4), hm); h.position.z = -.05; h.userData = { part: 'prop', color: '#000000', figId, kind: 'halo' }; h.castShadow = false; h.receiveShadow = false; G.add(h);
    }
    return G;
  };

  // Stage: plank deck on a skirted frame, front steps, optional corner posts (for bunting).
  B.stage = function (pr, figId) {
    const G = new T.Group();
    const s = pr.size || [9, .7, 4], wood = pr.color || '#a87a4c', skirt = pr.skirtColor || '#7a5236';
    const deck = mesh(texBox(s[0], .08, s[2], 1.2, 'planks'), wood, { map: repeatTex('planks', 1, 1, 1) }, figId); deck.position.y = s[1] - .04; G.add(deck);
    const body = mesh(new T.BoxGeometry(s[0] - .1, s[1] - .08, s[2] - .1), skirt, { roughness: .9 }, figId); body.position.y = (s[1] - .08) / 2; G.add(body);
    // vertical skirt boards on the front face
    for (let x = -s[0] / 2 + .3; x < s[0] / 2; x += .6) { const b = mesh(new T.BoxGeometry(.06, s[1] - .1, .03), '#5a3c26', {}, figId); b.position.set(x, (s[1] - .1) / 2, s[2] / 2 - .03); G.add(b); }
    if (pr.steps !== false) {
      const stw = pr.stepWidth || 1.6, sx = pr.stepX || 0, n = Math.max(2, Math.round(s[1] / .22));
      for (let i = 0; i < n - 1; i++) { const h = s[1] * (i + 1) / n, d = .32 * (n - 1 - i); const st = mesh(new T.BoxGeometry(stw, h, .32), wood, {}, figId); st.position.set(sx, h / 2, s[2] / 2 + d - .16 + .32); G.add(st); }
    }
    if (pr.posts) for (const p of pr.posts) G.add(rod([p[0], s[1], p[1]], [p[0], s[1] + (p[2] || 3), p[1]], .06, '#6a4a30', {}, figId));
    return G;
  };

  // Lucca's control console: angled desk with levers, dials and an indicator lamp.
  B.console = function (pr, figId) {
    const G = new T.Group();
    const w = pr.width || 1.0, body = pr.color || '#6a6f78', brass = pr.trim || '#c89a3a';
    const b = mesh(new T.BoxGeometry(w, .9, .5), body, { roughness: .5, metalness: .4 }, figId); b.position.y = .45; G.add(b);
    const top = mesh(new T.BoxGeometry(w + .06, .06, .62), brass, { roughness: .35, metalness: .7 }, figId); top.position.set(0, .95, .02); top.rotation.x = .35; G.add(top);
    for (let i = 0; i < 3; i++) { const x = -w * .3 + i * w * .3; G.add(rod([x, .98, -.02], [x, 1.3, .06 - i * .05], .018, '#2a2a2a', {}, figId)); const k = mesh(new T.SphereGeometry(.045, 10, 8), i === 1 ? '#d83a2a' : '#1a1a1a', { roughness: .4 }, figId); k.position.set(x, 1.3, .06 - i * .05); G.add(k); }
    const dial = mesh(new T.CylinderGeometry(.09, .09, .02, 20), '#efe6c8', { emissive: pr.lamp ? '#ffe8a0' : undefined, emissiveIntensity: .4 }, figId); dial.rotation.x = Math.PI / 2 - .35; dial.position.set(w * .32, 1.0, .2); G.add(dial);
    if (pr.lamp) { const l = mesh(new T.SphereGeometry(.05, 10, 8), pr.lamp, { emissive: pr.lamp, emissiveIntensity: 2, castShadow: false }, figId); l.position.set(-w * .38, 1.02, .2); G.add(l); }
    return G;
  };

  // Simple house / market hall for the background: walls, gabled roof (ridge along X), dark windows and door on the +Z face.
  B.house = function (pr, figId) {
    const G = new T.Group();
    const w = pr.width || 8, d = pr.depth || 6, h = pr.height || 6, rh = pr.roof || 3;
    const wall = mesh(new T.BoxGeometry(w, h, d), pr.color || '#e2d2b0', {}, figId); wall.position.y = h / 2; G.add(wall);
    const shape = new T.Shape(); shape.moveTo(-d / 2 - .4, 0); shape.lineTo(d / 2 + .4, 0); shape.lineTo(0, rh); shape.lineTo(-d / 2 - .4, 0);
    const rg = new T.ExtrudeGeometry(shape, { depth: w + .6, bevelEnabled: false }); rg.translate(0, 0, -(w + .6) / 2); rg.rotateY(Math.PI / 2);
    const rf = mesh(rg, pr.roofColor || '#a85a3c', {}, figId); rf.position.y = h; G.add(rf);
    const dark = pr.windowColor || '#3a3430';
    const nw = Math.max(1, Math.floor(w / 2.2)), floors = Math.max(1, Math.floor(h / 3));
    for (let f = 0; f < floors; f++) for (let i = 0; i < nw; i++) {
      if (f === 0 && i === Math.floor(nw / 2)) { const dr = mesh(new T.BoxGeometry(1.1, 2.2, .1), dark, {}, figId); dr.position.set((i - (nw - 1) / 2) * 2.2, 1.1, d / 2 + .03); G.add(dr); continue; }
      const wi = mesh(new T.BoxGeometry(.8, 1.2, .1), dark, {}, figId); wi.position.set((i - (nw - 1) / 2) * 2.2, 1.6 + f * 3, d / 2 + .03); G.add(wi);
    }
    if (pr.awning) { // striped market awning over the ground floor
      const n = Math.max(4, Math.round(w / .6));
      for (let i = 0; i < n; i++) { const a = mesh(new T.BoxGeometry(w / n, .05, 1.4), i % 2 ? '#f2e8d8' : pr.awning, { double: true }, figId); a.position.set(-w / 2 + (i + .5) * w / n, 2.8, d / 2 + .6); a.rotation.x = .35; G.add(a); }
    }
    return G;
  };

  // Plain pole (for bunting anchors, lamp posts).
  B.pole = function (pr, figId) {
    const G = new T.Group(); const h = pr.height || 4;
    G.add(rod([0, 0, 0], [0, h, 0], pr.radius || .06, pr.color || '#5a4030', {}, figId));
    if (pr.finial !== false) { const b = mesh(new T.SphereGeometry((pr.radius || .06) * 1.8, 10, 8), pr.finialColor || '#c8a040', { metalness: .5, roughness: .4 }, figId); b.position.y = h; G.add(b); }
    return G;
  };

  window.P3SET = { builders: B, texture, repeatTex };
})();
