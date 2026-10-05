// pose3d scene builder + renderer (browser side). Entry: window.P3RENDER(sceneJson, opts) -> {images:{name:dataURL}, info}
(function () {
  const T = THREE, D = Math.PI / 180;
  const { rng, hashStr } = window.P3G;
  const { buildFigure, addFlowing } = window.P3MAN;

  const DEFAULT_PALETTE = {
    tops: ['#8a3b2e', '#3f5a7a', '#6b7a3a', '#c8a24a', '#7a4a6a', '#d8d0c0', '#3a6a5a', '#b86a3a', '#5a4a3a', '#9aa0b0', '#a83a3a', '#2f4f6f', '#c87a5a', '#a0b8d8', '#5a7a9a', '#7a6a9a'],
    pants: ['#3a3530', '#4a4038', '#2e3540', '#6a5a48', '#5a5248', '#3a4a3a', '#7a6a58', '#2a2a30'],
    skirts: ['#6a3a4a', '#3a4a6a', '#7a5a3a', '#4a6a5a', '#8a6a7a', '#5a3a2a'],
    skin: ['#f0c8a8', '#e8b896', '#d9a07a', '#c68a62', '#a8694a', '#7a4a32'],
    hair: ['#2a1d15', '#4a3020', '#6b4a2a', '#a07040', '#c8a060', '#1a1a1a', '#8a8a88', '#b05a30', '#3a2a20'],
    shoes: ['#2a2018', '#3a2a20', '#4a3a2a', '#1e1e22', '#5a4030'],
    hats: ['#5a4a3a', '#8a7a5a', '#3a3a4a', '#a89070', '#6a3a2a', '#d8c8a0']
  };

  function makeCamera(c) {
    const W = c.width || 2400, H = c.height || 1600;
    const cam = new T.PerspectiveCamera(c.fov || 40, W / H, c.near || .1, c.far || 2000);
    if (c.position) {
      cam.position.set(...c.position);
      cam.lookAt(new T.Vector3(...(c.lookAt || [0, 0, -10])));
    } else {
      // horizon-matched camera: eye height (m), where the horizon falls (px from top), yaw (deg, 0 = looking along -Z)
      const f = (H / 2) / Math.tan((c.fov || 40) * D / 2);
      const hz = c.horizonY === undefined ? H / 2 : c.horizonY;
      const pitch = Math.atan((H / 2 - hz) / f); // + = looking down
      cam.position.set(c.x || 0, c.eyeHeight || 1.6, c.z || 0);
      cam.rotation.order = 'YXZ';
      cam.rotation.set(-pitch, (c.yaw || 0) * D, (c.roll || 0) * D);
    }
    cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
    return { cam, W, H };
  }
  function makePicker(cam, W, H) {
    const rc = new T.Raycaster();
    return function (px, py, planeY) {
      rc.setFromCamera(new T.Vector2(px / W * 2 - 1, -(py / H * 2 - 1)), cam);
      const pl = new T.Plane(new T.Vector3(0, 1, 0), -(planeY || 0));
      const out = new T.Vector3();
      if (!rc.ray.intersectPlane(pl, out)) throw new Error('pixel ' + px + ',' + py + ' is above the horizon; it does not hit the ground');
      return out;
    };
  }
  function project(v, cam, W, H) { const p = v.clone().project(cam); return [Math.round((p.x + 1) / 2 * W), Math.round((1 - p.y) / 2 * H)]; }

  function pickWeighted(R, obj) {
    const ks = Object.keys(obj); let tot = 0; for (const k of ks) tot += obj[k];
    let r = R() * tot; for (const k of ks) { r -= obj[k]; if (r <= 0) return k; } return ks[ks.length - 1];
  }
  const pick = (R, a) => a[Math.floor(R() * a.length) % a.length];
  function inPoly(x, y, poly) {
    let ins = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins;
    }
    return ins;
  }

  // expand a crowd spec into figure specs with world positions
  function expandCrowd(cs, picker, placed, ci) {
    const R = rng(cs.seed === undefined ? 1234 + ci : cs.seed);
    const pal = Object.assign({}, DEFAULT_PALETTE, cs.palette || {});
    // region: pixel polygon (feet positions) -> ground polygon
    let poly;
    if (cs.region.rect) { const [x0, y0, x1, y1] = cs.region.rect; poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; }
    else poly = cs.region.poly;
    const g = poly.map(p => { const v = picker(p[0], p[1]); return [v.x, v.z]; });
    const xs = g.map(p => p[0]), zs = g.map(p => p[1]);
    const bx0 = Math.min(...xs), bx1 = Math.max(...xs), bz0 = Math.min(...zs), bz1 = Math.max(...zs);
    const excl = (cs.exclude || []).map(r => [picker(r[0], r[3]), picker(r[2], r[3])]); // pixel rects [x0,y0,x1,y1] measured at the feet line
    const exPix = cs.exclude || [];
    const minSp = cs.minSpacing || .62;
    const presets = cs.presets || { male: .42, female: .42, child: .1, elder: .06 };
    const poses = cs.poses || { stand: 4, stand_relaxed: 4, walk: 1.2, walk_b: 1.2, look_up: 1, talk: 1, hands_behind: .6, arms_crossed: .6, hands_on_hips: .5, wave: .5, point: .4, cheer: .4, shield_eyes: .4 };
    const out = [];
    let tries = 0;
    const target = cs.count || 50;
    while (out.length < target && tries < target * 400) {
      tries++;
      let x = bx0 + R() * (bx1 - bx0), z = bz0 + R() * (bz1 - bz0);
      if (cs.depthBias) { const u = Math.pow(R(), 1 + cs.depthBias); z = bz0 + u * (bz1 - bz0); } // >0 crowds toward the far side
      if (!inPoly(x, z, g)) continue;
      let ok = true;
      for (const p of placed) { const dx = p.x - x, dz = p.z - z; if (dx * dx + dz * dz < Math.pow(Math.max(minSp, p.r || 0), 2)) { ok = false; break; } }
      if (!ok) continue;
      if (exPix.length) {
        const sp = cs._project(new T.Vector3(x, 0, z));
        if (exPix.some(r => sp[0] > r[0] && sp[0] < r[2] && sp[1] > r[1] && sp[1] < r[3])) continue;
      }
      placed.push({ x, z, r: minSp });
      const preset = pickWeighted(R, presets);
      const female = preset === 'female' || preset === 'girl';
      const hj = cs.heightJitter === undefined ? .05 : cs.heightJitter;
      const base = window.P3MAN.PRESETS[preset].height;
      const height = base * (1 + (R() * 2 - 1) * hj) * (cs.heightScale || 1);
      let yaw;
      if (cs.faceToward) {
        const tgt = picker(cs.faceToward[0], cs.faceToward[1]);
        yaw = Math.atan2(tgt.x - x, tgt.z - z) / D;
      } else yaw = cs.facing === undefined ? R() * 360 : cs.facing;
      const fj = cs.facingJitter === undefined ? 35 : cs.facingJitter;
      yaw += (R() * 2 - 1) * fj;
      let pose = pickWeighted(R, poses);
      const pj = cs.poseJitter === undefined ? 8 : cs.poseJitter;
      const P = window.P3POSES.resolve(pose);
      // jitter: head turn, slight lean, arm hang
      const jit = (v, a) => (v || 0) + (R() * 2 - 1) * a;
      const head = P.head || [0, 0, 0]; P.head = [jit(head[0], pj), jit(head[1], pj * 3), jit(head[2], pj)];
      const sp = P.spine || [0, 0, 0]; P.spine = [jit(sp[0], pj * .5), jit(sp[1], pj), jit(sp[2], pj * .5)];
      if (R() < .5) Object.assign(P, window.P3POSES.mirror(P));
      const hairStyles = female ? (cs.hairFemale || { ponytail: 1, bob: 1.2, long: 1.2, bun: 1, short: .4 }) : (cs.hairMale || { short: 3, curly: .6, bald: .4, spiky: .2 });
      const top = pick(R, pal.tops);
      const clothes = { top: 'shirt', sleeves: R() < .75 ? 'long' : 'short', legs: 'pants', belt: R() < .3 };
      const colors = { skin: pick(R, pal.skin), hair: pick(R, pal.hair), top, pants: pick(R, pal.pants), shoes: pick(R, pal.shoes), belt: '#3a2a1a' };
      if (female && R() < .65) { clothes.skirt = { length: .45 + R() * .3, flare: .4 + R() * .5 }; colors.skirt = pick(R, pal.skirts); clothes.legs = R() < .5 ? 'bare' : 'pants'; }
      else if (R() < .25) { clothes.tunic = { length: .25 + R() * .2, flare: .3 }; colors.tunic = top; }
      if (R() < .25) colors.sleeves = pick(R, pal.tops);
      const spec = {
        name: (cs.name || 'crowd' + ci) + '_' + out.length, preset, height, build: .9 + R() * .3 * (preset === 'child' ? .5 : 1),
        position: [x, 0, z], facing: yaw, pose: P, colors, clothes, hair: { style: pickWeighted(R, hairStyles), volume: .95 + R() * .15 },
        seed: Math.floor(R() * 1e9)
      };
      if (R() < (cs.hatChance === undefined ? .25 : cs.hatChance)) spec.hat = { style: R() < .7 ? 'cap' : 'brimmed', color: pick(R, pal.hats) };
      out.push(spec);
    }
    return out;
  }

  function addProp(scene, pr, picker, figId) {
    const col = pr.color || '#888888';
    const matOpts = { color: new T.Color(col), roughness: pr.roughness === undefined ? .8 : pr.roughness, metalness: pr.metalness || 0 };
    if (pr.emissive) { matOpts.emissive = new T.Color(pr.emissive); matOpts.emissiveIntensity = pr.emissiveIntensity === undefined ? 1 : pr.emissiveIntensity; }
    const mt = new T.MeshStandardMaterial(matOpts);
    let g; const s = pr.size || [1, 1, 1];
    switch (pr.type) {
      case 'box': g = new T.BoxGeometry(s[0], s[1], s[2]); break;
      case 'sphere': g = new T.SphereGeometry(s[0], 32, 20); break;
      case 'dome': g = new T.SphereGeometry(s[0], 32, 16, 0, Math.PI * 2, 0, Math.PI / 2); break;
      case 'cylinder': g = new T.CylinderGeometry(s[0], s[2] === undefined ? s[0] : s[2], s[1], 32); break;
      case 'cone': g = new T.ConeGeometry(s[0], s[1], 32); break;
      case 'disc': g = new T.CylinderGeometry(s[0], s[0], s[1] || .05, 48); g.rotateX(Math.PI / 2); break;
      default: throw new Error('unknown prop type ' + pr.type);
    }
    const m = new T.Mesh(g, mt);
    let pos;
    if (pr.at) { const v = picker(pr.at[0], pr.at[1]); pos = [v.x, 0, v.z]; } else pos = (pr.position || [0, 0, 0]).slice();
    pos[1] += (pr.y || 0);
    if (pr.offset) { pos[0] += pr.offset[0] || 0; pos[1] += pr.offset[1] || 0; pos[2] += pr.offset[2] || 0; }
    m.position.set(...pos);
    if (pr.rotation) m.rotation.set(...pr.rotation.map(a => a * D));
    if (pr.faceCamera) m.userData.faceCamera = true;
    m.castShadow = pr.castShadow !== false; m.receiveShadow = pr.receiveShadow !== false;
    m.userData = Object.assign(m.userData, { part: 'prop', color: col, figId, kind: 'prop', emissive: pr.emissive });
    scene.add(m);
    return m;
  }

  const PART_COLORS = { head: '#e8c070', neck: '#d0a060', ribcage: '#d05040', pelvis: '#8040a0', upperArm: '#40a0d0', forearm: '#40d0a0', hand: '#f0f070', thigh: '#4060d0', shin: '#30a050', foot: '#a06030', hair: '#502818', hat: '#806040', prop: '#909090' };

  async function render(S, opts) {
    opts = opts || {};
    const { cam, W, H } = makeCamera(S.camera || {});
    const picker = makePicker(cam, W, H);
    const scene = new T.Scene();
    const sky = S.sky || {};
    scene.background = new T.Color(sky.color || '#a8c4e0');

    // ---- figures
    const figSpecs = [];
    (S.figures || []).forEach(f => figSpecs.push(f));
    const placed = [];
    const posOf = (f) => { if (f.at) { const v = picker(f.at[0], f.at[1]); return [v.x, 0, v.z]; } return (f.position || [0, 0, 0]).slice(); };
    figSpecs.forEach(f => { const p = posOf(f); f._pos = p; placed.push({ x: p[0], z: p[2], r: f.clearance || 1.0 }); });
    (S.crowds || []).forEach((cs, ci) => {
      cs._project = (v) => project(v, cam, W, H);
      expandCrowd(cs, picker, placed, ci).forEach(f => { f._pos = f.position; f._crowd = true; figSpecs.push(f); });
    });
    const info = { figures: {}, camera: { position: cam.position.toArray(), W, H }, counts: { figures: figSpecs.length } };
    const figRoots = [];
    const bbox = new T.Box3();
    figSpecs.forEach((f, i) => {
      const { root, joints } = buildFigure(f, i + 1);
      root.position.set(f._pos[0], 0, f._pos[2]);
      let yaw = f.facing || 0;
      if (f.faceToward) { const t = picker(f.faceToward[0], f.faceToward[1]); yaw = Math.atan2(t.x - f._pos[0], t.z - f._pos[2]) / D + (f.facingOffset || 0); }
      if (f.faceCamera) yaw = Math.atan2(cam.position.x - f._pos[0], cam.position.z - f._pos[2]) / D + (f.facingOffset || 0);
      root.rotation.y = yaw * D;
      scene.add(root);
      root.updateMatrixWorld(true);
      if (f.ground === false) root.position.y = f.lift || 0;
      else {
        // drop the lowest point of the feet onto the ground (or onto a raised surface at height `lift`)
        const b = new T.Box3();
        for (const s of ['L', 'R']) b.expandByObject(joints['ankle' + s], true);
        root.position.y += (f.lift || 0) - b.min.y;
      }
      addFlowing(root);
      root.updateMatrixWorld(true);
      figRoots.push(root);
      bbox.expandByObject(root);
      if (!f._crowd || f.name) {
        const J = {};
        for (const k in joints) { const v = new T.Vector3(); joints[k].getWorldPosition(v); J[k] = project(v, cam, W, H); }
        const hb = new T.Box3().setFromObject(root);
        const corners = []; for (const x of [hb.min.x, hb.max.x]) for (const y of [hb.min.y, hb.max.y]) for (const z of [hb.min.z, hb.max.z]) corners.push(project(new T.Vector3(x, y, z), cam, W, H));
        const top = new T.Vector3(); joints.head.getWorldPosition(top);
        if (!f._crowd) info.figures[f.name || ('fig' + i)] = {
          joints2d: J, screenBox: [Math.min(...corners.map(c => c[0])), Math.min(...corners.map(c => c[1])), Math.max(...corners.map(c => c[0])), Math.max(...corners.map(c => c[1]))],
          world: root.position.toArray().map(v => +v.toFixed(3)), yaw: +yaw.toFixed(1), distance: +cam.position.distanceTo(root.position).toFixed(2)
        };
      }
    });
    // ---- props
    (S.props || []).forEach((pr, i) => addProp(scene, pr, picker, 10000 + i));
    scene.traverse(o => { if (o.userData && o.userData.faceCamera) { o.lookAt(cam.position.x, o.position.y, cam.position.z); } });
    // ---- ground
    const gr = S.ground || {};
    const groundMat = new T.MeshStandardMaterial({ color: new T.Color(gr.color || '#c8a878'), roughness: gr.roughness === undefined ? .95 : gr.roughness });
    const ground = new T.Mesh(new T.PlaneGeometry(gr.size || 600, gr.size || 600), groundMat);
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.userData = { part: 'ground', color: gr.color || '#c8a878', figId: 0, kind: 'ground' };
    scene.add(ground);
    // ---- lights
    const lights = [];
    const sun = S.sun || {};
    let sunDir;
    if (sun.direction) sunDir = new T.Vector3(...sun.direction).multiplyScalar(-1).normalize(); // direction the light travels -> towards the sun
    else { const az = (sun.azimuth === undefined ? -120 : sun.azimuth) * D, el = (sun.elevation === undefined ? 30 : sun.elevation) * D; sunDir = new T.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)); }
    // shadow frustum fitted to everything that casts
    const target = bbox.isEmpty() ? new T.Vector3() : bbox.getCenter(new T.Vector3());
    const rad = bbox.isEmpty() ? 20 : bbox.getSize(new T.Vector3()).length() / 2 + 2;
    const samples = Math.max(1, sun.samples || 4), soft = (sun.softness === undefined ? 1.2 : sun.softness) * D;
    const mapSize = sun.shadowMapSize || 4096;
    const up = Math.abs(sunDir.y) > .99 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 1, 0);
    const ax1 = new T.Vector3().crossVectors(sunDir, up).normalize(), ax2 = new T.Vector3().crossVectors(sunDir, ax1).normalize();
    for (let i = 0; i < samples; i++) {
      const a = i / samples * Math.PI * 2 + .3, r = samples === 1 ? 0 : soft * (i % 2 ? 1 : .55);
      const d = sunDir.clone().add(ax1.clone().multiplyScalar(Math.cos(a) * r)).add(ax2.clone().multiplyScalar(Math.sin(a) * r)).normalize();
      const L = new T.DirectionalLight(new T.Color(sun.color || '#ffe0b8'), (sun.intensity === undefined ? 3 : sun.intensity) / samples);
      L.position.copy(target).add(d.multiplyScalar(rad * 2));
      L.target.position.copy(target);
      L.castShadow = sun.shadows !== false;
      L.shadow.mapSize.set(mapSize, mapSize);
      const sc = L.shadow.camera; sc.left = -rad; sc.right = rad; sc.top = rad; sc.bottom = -rad; sc.near = .1; sc.far = rad * 4;
      L.shadow.bias = sun.bias === undefined ? -0.0004 : sun.bias; L.shadow.normalBias = sun.normalBias === undefined ? .015 : sun.normalBias;
      L.shadow.radius = 3;
      scene.add(L); scene.add(L.target); lights.push(L);
    }
    const hemi = new T.HemisphereLight(new T.Color(sky.ambientSky || sky.color || '#a8c4e0'), new T.Color(sky.ambientGround || gr.color || '#c8a878'), sky.intensity === undefined ? 1.0 : sky.intensity);
    scene.add(hemi); lights.push(hemi);
    (S.lights || []).forEach(l => {
      let pos;
      if (l.at) { const v = picker(l.at[0], l.at[1]); pos = [v.x, l.y || 1, v.z]; } else pos = l.position;
      const P = new T.PointLight(new T.Color(l.color || '#ffffff'), l.intensity === undefined ? 20 : l.intensity, l.distance || 0, l.decay === undefined ? 2 : l.decay);
      P.position.set(...pos);
      if (l.shadows) { P.castShadow = true; P.shadow.mapSize.set(1024, 1024); P.shadow.bias = -0.002; }
      scene.add(P); lights.push(P);
    });

    // ---- renderer
    const ss = opts.ss || S.supersample || 1;
    const canvas = document.createElement('canvas');
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = S.exposure === undefined ? 1 : S.exposure;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setPixelRatio(1);

    const views = [];
    if (opts.crop) views.push(Object.assign({ name: '' }, opts.crop));
    else {
      if (!opts.cropsOnly) views.push({ name: '', x: 0, y: 0, w: W, h: H, scale: opts.scale || 1 });
      if (!opts.noCrops) (S.crops || []).forEach(c => views.push(Object.assign({ scale: 1 }, c)));
    }
    const passes = opts.passes || S.passes || ['lit'];
    const images = {};
    // material sets for passes
    const meshes = []; scene.traverse(o => { if (o.isMesh) meshes.push(o); });
    const litMats = new Map(meshes.map(m => [m, m.material]));
    const basicCache = {};
    const basic = (c) => basicCache[c] || (basicCache[c] = new T.MeshBasicMaterial({ color: new T.Color(c) }));
    const idColor = (id) => { if (!id) return '#000000'; const c = new T.Color().setHSL((id * 0.61803398875) % 1, .75, .5); return '#' + c.getHexString(); };
    const setPass = (pass) => {
      const flat = pass !== 'lit' && pass !== 'value' && pass !== 'notan';
      for (const m of meshes) {
        const u = m.userData || {};
        if (!flat) m.material = litMats.get(m);
        else if (pass === 'flat') m.material = basic(u.emissive || u.color || '#888888');
        else if (pass === 'id') m.material = basic(u.kind === 'ground' ? '#000000' : u.kind === 'prop' ? '#404040' : idColor(u.figId));
        else if (pass === 'parts') m.material = basic(u.kind === 'ground' ? '#f4efe6' : (PART_COLORS[u.part] || '#888888'));
      }
      scene.background = new T.Color(flat ? (pass === 'flat' ? (sky.color || '#a8c4e0') : pass === 'id' ? '#000000' : '#ffffff') : (sky.color || '#a8c4e0'));
      renderer.toneMapping = flat ? T.NoToneMapping : T.ACESFilmicToneMapping;
    };
    for (const v of views) {
      const sc = v.scale || 1;
      const ow = Math.round(v.w * sc), oh = Math.round(v.h * sc);
      cam.setViewOffset(W, H, v.x, v.y, v.w, v.h); cam.updateProjectionMatrix();
      renderer.setSize(ow * ss, oh * ss, false);
      const out = document.createElement('canvas'); out.width = ow; out.height = oh;
      const ctx = out.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      const grab = () => { ctx.clearRect(0, 0, ow, oh); ctx.drawImage(canvas, 0, 0, ow * ss, oh * ss, 0, 0, ow, oh); };
      let litData = null;
      const want = new Set(passes);
      if (want.has('value') || want.has('notan')) want.add('lit');
      for (const pass of ['lit', 'flat', 'id', 'parts']) {
        if (!want.has(pass)) continue;
        setPass(pass);
        renderer.render(scene, cam);
        grab();
        if (pass === 'lit') litData = ctx.getImageData(0, 0, ow, oh);
        if (passes.includes(pass)) images[(v.name ? v.name + '_' : '') + pass] = out.toDataURL('image/png');
      }
      if (want.has('value') || want.has('notan')) {
        const steps = S.notanSteps || 5;
        for (const pass of ['value', 'notan']) {
          if (!passes.includes(pass)) continue;
          const d = new ImageData(new Uint8ClampedArray(litData.data), ow, oh), a = d.data;
          for (let i = 0; i < a.length; i += 4) {
            let y = .2126 * a[i] + .7152 * a[i + 1] + .0722 * a[i + 2];
            if (pass === 'notan') y = Math.round(Math.min(steps - 1, Math.floor(y / 256 * steps)) * 255 / (steps - 1));
            a[i] = a[i + 1] = a[i + 2] = y;
          }
          ctx.putImageData(d, 0, 0);
          images[(v.name ? v.name + '_' : '') + pass] = out.toDataURL('image/png');
        }
      }
      cam.clearViewOffset();
    }
    renderer.dispose();
    return { images, info };
  }
  window.P3RENDER = render;
})();
