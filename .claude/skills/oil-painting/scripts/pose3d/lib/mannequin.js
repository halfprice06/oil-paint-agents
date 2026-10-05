// pose3d mannequin: an articulated human figure built from anatomical masses (browser side).
// All dimensions are for a reference adult male (1.78 m) and are rescaled per preset.
(function () {
  const T = THREE, D = Math.PI / 180;
  const { loft, taperTube, rng, hashStr } = window.P3G;

  const PRESETS = {
    male:   { height: 1.76, head: 1.00, shoulders: 1.00, chest: 1.00, waist: 1.00, hips: 1.00, limbs: 1.00, female: false },
    female: { height: 1.64, head: 0.98, shoulders: 0.87, chest: 0.90, waist: 0.86, hips: 1.08, limbs: 0.90, female: true },
    boy:    { height: 1.62, head: 1.04, shoulders: 0.90, chest: 0.90, waist: 0.92, hips: 0.95, limbs: 0.88, female: false }, // teen
    girl:   { height: 1.56, head: 1.03, shoulders: 0.85, chest: 0.86, waist: 0.86, hips: 1.02, limbs: 0.86, female: true },  // teen
    child:  { height: 1.22, head: 1.38, shoulders: 0.92, chest: 0.98, waist: 1.04, hips: 0.95, limbs: 0.98, female: false },
    elder:  { height: 1.68, head: 1.00, shoulders: 0.95, chest: 1.02, waist: 1.10, hips: 1.02, limbs: 0.92, female: false, stoop: 1 }
  };
  // reference vertical layout (m): sole->ankle .075, shin .40, thigh .43, hip joint->waist .18, waist->neck base .42, neck .09, head joint->crown .19
  const REF = { ankle: .075, shin: .40, thigh: .43, hipToWaist: .18, waistToNeck: .42, neck: .09, headTop: .19, upperArm: .30, forearm: .26 };
  const REF_BODY = REF.ankle + REF.shin + REF.thigh + REF.hipToWaist + REF.waistToNeck + REF.neck; // 1.595

  // ---- cross sections (reference male, metres) -------------------------------------------
  const SEC = {
    chest: (m) => [
      { y: -.04, w: .235 * m.waist, f: .08, b: .072 },
      { y: .04, w: .275 * m.waist, f: .1, b: .09 },
      { y: .10, w: .29 * m.waist * .5 + .29 * m.chest * .5, f: .107, b: .096 },
      { y: .18, w: .315 * m.chest, f: .12, b: .10 },
      { y: .27, w: .345 * m.shoulders, f: .11, b: .10 },
      { y: .335, w: .35 * m.shoulders, f: .08, b: .085, p: 2.4 },
      { y: .38, w: .25 * m.shoulders, f: .055, b: .07 },
      { y: .415, w: .12, f: .05, b: .05 },
      { y: .43, w: .03, f: .01, b: .01 }
    ],
    pelvis: (m) => [
      { y: .05, w: .26 * m.waist, f: .09, b: .085 },
      { y: -.04, w: .285 * (m.waist * .4 + m.hips * .6), f: .10, b: .095 },
      { y: -.11, w: .325 * m.hips, f: .10, b: .11 },
      { y: -.17, w: .345 * m.hips, f: .095, b: .12, p: 2.3 },
      { y: -.225, w: .31 * m.hips, f: .085, b: .10 },
      { y: -.265, w: .20 * m.hips, f: .06, b: .07 },
      { y: -.285, w: .05, f: .02, b: .02 }
    ],
    thigh: () => [
      { y: .04, w: .06, f: .03, b: .03 },
      { y: 0, w: .155, f: .08, b: .08 },
      { y: -.10, w: .15, f: .085, b: .078 },
      { y: -.25, w: .125, f: .07, b: .064 },
      { y: -.37, w: .10, f: .055, b: .05 },
      { y: -.43, w: .10, f: .062, b: .045 },
      { y: -.465, w: .05, f: .02, b: .02 }
    ],
    shin: () => [
      { y: .025, w: .06, f: .03, b: .02 },
      { y: 0, w: .098, f: .055, b: .045 },
      { y: -.08, w: .096, f: .046, b: .066 },
      { y: -.15, w: .092, f: .042, b: .068 },
      { y: -.25, w: .072, f: .036, b: .046 },
      { y: -.35, w: .056, f: .03, b: .03 },
      { y: -.40, w: .066, f: .036, b: .036 },
      { y: -.425, w: .03, f: .015, b: .015 }
    ],
    upperArm: () => [
      { y: .03, w: .07, f: .04, b: .04 },
      { y: 0, w: .105, f: .055, b: .056 },
      { y: -.08, w: .098, f: .052, b: .05 },
      { y: -.16, w: .082, f: .05, b: .044 },
      { y: -.25, w: .074, f: .04, b: .04 },
      { y: -.30, w: .08, f: .038, b: .042 },
      { y: -.325, w: .04, f: .02, b: .02 }
    ],
    forearm: () => [
      { y: .02, w: .05, f: .025, b: .025 },
      { y: 0, w: .076, f: .04, b: .04 },
      { y: -.06, w: .085, f: .045, b: .045 },
      { y: -.16, w: .066, f: .035, b: .035 },
      { y: -.25, w: .054, f: .026, b: .026 },
      { y: -.275, w: .03, f: .015, b: .015 }
    ],
    // hand sections: X = thickness (palm faces -X on the left hand at rest), Z = width
    palm: () => [
      { y: .01, w: .028, f: .028, b: .028 },
      { y: -.02, w: .034, f: .04, b: .04 },
      { y: -.08, w: .03, f: .045, b: .044 },
      { y: -.105, w: .022, f: .042, b: .04 }
    ],
    fingers: () => [
      { y: .005, w: .024, f: .042, b: .04 },
      { y: -.045, w: .021, f: .038, b: .034, p: 2.4 },
      { y: -.08, w: .016, f: .03, b: .024 },
      { y: -.092, w: .008, f: .012, b: .01 }
    ],
    // foot: built along Y (heel -> toe), then turned so Y points forward; z here becomes "down"
    foot: () => [
      { y: -.07, w: .04, f: .02, b: .02, z: .04 },
      { y: -.055, w: .066, f: .03, b: .035, z: .035 },
      { y: 0, w: .074, f: .07, b: .045, z: .0 },
      { y: .07, w: .092, f: .055, b: .02, z: .025 },
      { y: .15, w: .098, f: .035, b: .012, z: .045 },
      { y: .19, w: .085, f: .025, b: .01, z: .05 },
      { y: .205, w: .03, f: .01, b: .005, z: .055 }
    ],
    head: () => [
      { y: -.052, w: .02, f: .01, b: .01, z: .065 },
      { y: -.045, w: .055, f: .028, b: .02, z: .063 },
      { y: -.025, w: .095, f: .04, b: .03, z: .045 },
      { y: .01, w: .12, f: .065, b: .055, z: .025 },
      { y: .045, w: .138, f: .088, b: .085, z: .01 },
      { y: .085, w: .148, f: .095, b: .1, z: 0 },
      { y: .12, w: .15, f: .09, b: .104, z: -.004 },
      { y: .155, w: .138, f: .075, b: .095, z: -.008 },
      { y: .18, w: .1, f: .045, b: .06, z: -.01 },
      { y: .19, w: .03, f: .01, b: .015, z: -.01 }
    ],
    neck: () => [
      { y: -.02, w: .1, f: .05, b: .05 },
      { y: .03, w: .1, f: .052, b: .05 },
      { y: .09, w: .09, f: .05, b: .045 },
      { y: .115, w: .05, f: .02, b: .02 }
    ]
  };
  function scaleSecs(secs, sy, sw, sd) {
    return secs.map(s => ({ y: s.y * sy, w: s.w * sw, f: s.f * sd, b: s.b * sd, z: (s.z || 0) * sd, x: (s.x || 0) * sw, p: s.p }));
  }

  // ---- materials (cached by colour) -------------------------------------------------------
  const MATS = {};
  function mat(color, kind) {
    const key = color + '|' + kind;
    if (!MATS[key]) {
      const rough = kind === 'skin' ? .62 : kind === 'hair' ? .7 : kind === 'shiny' ? .35 : .88;
      MATS[key] = new T.MeshStandardMaterial({ color: new T.Color(color), roughness: rough, metalness: 0, side: kind === 'cloth2' ? T.DoubleSide : T.FrontSide });
    }
    return MATS[key];
  }
  // every mesh gets: part (anatomy mass name), layer (skin/top/...), flat colour, figure id
  function M(geo, color, kind, part, figId) {
    const m = new T.Mesh(geo, mat(color, kind));
    m.castShadow = true; m.receiveShadow = true;
    m.userData = { part, color, figId, kind };
    return m;
  }

  // swing (exponential map "joystick") + twist about the bone axis, for ball joints
  function ballQuat(fwd, out, twist, side) {
    const sx = side === 'L' ? 1 : -1;
    const w = new T.Vector3(-fwd * D, 0, sx * out * D);
    const ang = w.length();
    const qs = new T.Quaternion(); if (ang > 1e-6) qs.setFromAxisAngle(w.clone().normalize(), ang);
    const qt = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), -sx * (twist || 0) * D);
    return qs.multiply(qt);
  }
  function trunkQuat(v) { // [fwd, twist, side]
    const e = new T.Euler((v[0] || 0) * D, (v[1] || 0) * D, -(v[2] || 0) * D, 'YXZ');
    return new T.Quaternion().setFromEuler(e);
  }

  function buildFigure(spec, figId) {
    const pre = Object.assign({}, PRESETS[spec.preset || 'male'] || PRESETS.male);
    const H = spec.height || pre.height;
    const build = spec.build || 1; // girth
    const R = rng(spec.seed !== undefined ? spec.seed : hashStr(JSON.stringify(spec.name || '') + figId));
    const headS = (H / 1.785) * pre.head * (spec.headScale || 1);
    const bs = (H - REF.headTop * headS) / REF_BODY; // body length scale
    const gw = bs * build; // girth scale
    const m = { shoulders: pre.shoulders * (spec.shoulders || 1), chest: pre.chest, waist: pre.waist * (build > 1 ? 1 + (build - 1) * 1.4 : 1), hips: pre.hips * (spec.hips || 1) };
    const L = pre.limbs; // limb girth factor
    const LL = L * 1.14, LA = L * 1.08; // legs / arms girth
    const col = Object.assign({ skin: '#d9a07a', hair: '#4a3020', top: '#6a7a8a', pants: '#4a4038', shoes: '#3a2a20' }, spec.colors || {});
    const cl = Object.assign({ top: 'shirt', sleeves: 'long', legs: 'pants', boots: false, belt: false }, spec.clothes || {});
    if (cl.top === 'jumpsuit') { col.sleeves = col.sleeves || col.top; col.pants = col.pants && spec.colors && spec.colors.pants ? col.pants : col.top; }
    col.sleeves = col.sleeves || col.top;
    const joints = {};
    const root = new T.Group(); root.name = spec.name || ('fig' + figId);
    root.userData = { figId, spec };

    const yHip = (REF.ankle + REF.shin + REF.thigh) * bs;
    const pelvisJ = new T.Group(); pelvisJ.position.set(0, yHip + REF.hipToWaist * bs, 0); root.add(pelvisJ); joints.pelvis = pelvisJ;
    const legsCloth = cl.legs === 'bare' ? null : (cl.legs === 'shorts' ? 'shorts' : 'pants');
    const legInfl = cl.legs === 'baggy' || cl.top === 'jumpsuit' ? 1.1 : 1.0;
    const pantsKind = 'cloth';
    // pelvis mass
    pelvisJ.add(M(loft(scaleSecs(SEC.pelvis(m), bs, gw, gw), { inflate: legsCloth ? 1.02 : 1 }), legsCloth ? col.pants : col.skin, pantsKind, 'pelvis', figId));
    // spine -> chest
    const spineJ = new T.Group(); pelvisJ.add(spineJ); joints.spine = spineJ;
    const topCol = cl.top === 'bare' ? col.skin : col.top;
    spineJ.add(M(loft(scaleSecs(SEC.chest(m), bs, gw, gw)), topCol, 'cloth', 'ribcage', figId));
    if (pre.female) {
      for (const sx of [-1, 1]) {
        const g = new T.SphereGeometry(.05 * gw, 16, 12); const b = M(g, topCol, 'cloth', 'ribcage', figId);
        b.scale.set(1.1, .85, .5); b.position.set(sx * .05 * gw, .175 * bs, .086 * gw); b.rotation.x = .3; spineJ.add(b);
      }
    }
    if (cl.belt) {
      const bsec = [{ y: -.02, w: .30 * m.waist, f: .1, b: .095 }, { y: .03, w: .29 * m.waist, f: .098, b: .092 }];
      pelvisJ.add(M(loft(scaleSecs(bsec, bs, gw, gw), { inflate: 1.06, capTop: false, capBottom: false }), col.belt || '#3a2a1a', 'cloth2', 'pelvis', figId));
    }
    // tunic / skirt: open flared shell hung from the waist
    const shell = (len, flare, color, topY) => {
      const secs = [];
      const n = 5;
      for (let i = 0; i <= n; i++) {
        const t = i / n, y = (topY || .06) - t * (len + (topY || .06));
        const base = SEC.pelvis(m); // approximate the hip widths
        const wHip = .345 * m.hips, w = (t < .45 ? (.27 * m.waist + (wHip - .27 * m.waist) * Math.sin(t / .45 * Math.PI / 2)) : wHip) * (1 + flare * Math.max(0, t - .4) * 1.4);
        const d = (t < .45 ? .095 + .025 * t / .45 : .12) * (1 + flare * Math.max(0, t - .4) * 1.6);
        secs.push({ y, w: w + .02, f: d, b: d + .01 });
      }
      return M(loft(scaleSecs(secs, bs, gw, gw), { inflate: 1.05, capTop: false, capBottom: false, seg: 28 }), color, 'cloth2', 'pelvis', figId);
    };
    if (cl.tunic) { const t = cl.tunic === true ? {} : cl.tunic; pelvisJ.add(shell(t.length || .42, t.flare === undefined ? .5 : t.flare, col.tunic || topCol, .08)); }
    if (cl.skirt) { const s = cl.skirt === true ? {} : cl.skirt; pelvisJ.add(shell(s.length || .55, s.flare === undefined ? .6 : s.flare, col.skirt || col.pants, .03)); }
    if (cl.top === 'dress') pelvisJ.add(shell((cl.dressLength || .6), .7, topCol, .03));

    // neck + head
    const neckJ = new T.Group(); neckJ.position.set(0, .405 * bs, -.005 * gw); spineJ.add(neckJ); joints.neck = neckJ;
    neckJ.add(M(loft(scaleSecs(SEC.neck(), bs * (.6 + .4 * headS / bs), gw * (.5 + .5 * headS / bs), gw * (.5 + .5 * headS / bs))), cl.collar ? topCol : col.skin, 'skin', 'neck', figId));
    const headJ = new T.Group(); headJ.position.set(0, REF.neck * bs, .012 * bs); neckJ.add(headJ); joints.head = headJ;
    buildHead(headJ, headS, col, spec, figId, R);
    if (spec.scarf) {
      const ssec = [{ y: -.01, w: .13, f: .07, b: .065 }, { y: .04, w: .12, f: .065, b: .06 }];
      neckJ.add(M(loft(scaleSecs(ssec, bs, gw, gw), { capTop: false, capBottom: false }), spec.scarf, 'cloth2', 'neck', figId));
    }

    // arms
    for (const side of ['L', 'R']) {
      const sx = side === 'L' ? 1 : -1;
      const shJ = new T.Group(); shJ.position.set(sx * .158 * m.shoulders * gw, .332 * bs, -.008 * gw); spineJ.add(shJ); joints['shoulder' + side] = shJ;
      shJ.userData.rest = shJ.position.clone();
      const sl = cl.sleeves; const upCol = cl.top === 'bare' || sl === 'none' ? col.skin : col.sleeves;
      const loCol = sl === 'long' && cl.top !== 'bare' ? col.sleeves : col.skin;
      const armInfl = sl !== 'none' && (cl.top === 'jumpsuit' || cl.looseSleeves) ? 1.1 : 1;
      // deltoid cap
      const dg = new T.SphereGeometry(.05 * gw * LA, 16, 12); const del = M(dg, upCol, upCol === col.skin ? 'skin' : 'cloth', 'upperArm', figId);
      del.scale.set(.95, 1.25, 1.0); del.position.set(sx * .004 * gw, -.035 * bs, 0); shJ.add(del);
      shJ.add(M(loft(scaleSecs(SEC.upperArm(), bs, gw * LA, gw * LA), { inflate: armInfl }), upCol, upCol === col.skin ? 'skin' : 'cloth', 'upperArm', figId));
      const elJ = new T.Group(); elJ.position.set(0, -REF.upperArm * bs, 0); shJ.add(elJ); joints['elbow' + side] = elJ;
      elJ.add(M(new T.SphereGeometry(.037 * gw * LA * armInfl, 12, 10), loCol, loCol === col.skin ? 'skin' : 'cloth', 'forearm', figId));
      elJ.add(M(loft(scaleSecs(SEC.forearm(), bs, gw * LA, gw * LA), { inflate: sl === 'long' ? armInfl : 1 }), loCol, loCol === col.skin ? 'skin' : 'cloth', 'forearm', figId));
      const wrJ = new T.Group(); wrJ.position.set(0, -REF.forearm * bs, 0); elJ.add(wrJ); joints['wrist' + side] = wrJ;
      const handCol = cl.gloves ? (col.gloves || col.shoes) : col.skin;
      const hs = bs * (.75 + .25 * headS / bs);
      const pal = M(loft(scaleSecs(SEC.palm(), hs, hs * L, hs * L)), handCol, 'skin', 'hand', figId); wrJ.add(pal);
      const fJ = new T.Group(); fJ.position.set(0, -.1 * hs, 0); wrJ.add(fJ); joints['fingers' + side] = fJ;
      fJ.add(M(loft(scaleSecs(SEC.fingers(), hs, hs * L, hs * L)), handCol, 'skin', 'hand', figId));
      // thumb: from the front edge of the palm near the wrist, angled down-forward-inward
      const tp = [new T.Vector3(-sx * .006, -.02, .03), new T.Vector3(-sx * .016, -.05, .052), new T.Vector3(-sx * .022, -.075, .056), new T.Vector3(-sx * .024, -.092, .05)].map(v => v.multiplyScalar(hs));
      const th = M(taperTube(tp, t => (.013 - .004 * t) * hs * L, { radial: 8, segments: 10 }), handCol, 'skin', 'hand', figId); wrJ.add(th);
      if (spec.prop && spec.prop.hand === side) addProp(wrJ, spec.prop, hs, sx, figId);
    }
    // legs
    for (const side of ['L', 'R']) {
      const sx = side === 'L' ? 1 : -1;
      const hipJ = new T.Group(); hipJ.position.set(sx * .092 * m.hips * gw, -REF.hipToWaist * bs, 0); pelvisJ.add(hipJ); joints['hip' + side] = hipJ;
      const thCol = legsCloth ? col.pants : col.skin;
      hipJ.add(M(loft(scaleSecs(SEC.thigh(), bs, gw * LL, gw * LL), { inflate: legsCloth ? legInfl : 1 }), thCol, legsCloth ? 'cloth' : 'skin', 'thigh', figId));
      const knJ = new T.Group(); knJ.position.set(0, -REF.thigh * bs, 0); hipJ.add(knJ); joints['knee' + side] = knJ;
      const shCol = legsCloth === 'pants' ? col.pants : col.skin;
      knJ.add(M(new T.SphereGeometry(.05 * gw * LL * (legsCloth === 'pants' ? legInfl : 1), 12, 10), shCol, legsCloth === 'pants' ? 'cloth' : 'skin', 'shin', figId));
      knJ.add(M(loft(scaleSecs(SEC.shin(), bs, gw * LL, gw * LL), { inflate: legsCloth === 'pants' ? legInfl : 1 }), shCol, legsCloth === 'pants' ? 'cloth' : 'skin', 'shin', figId));
      if (cl.boots) {
        const bh = typeof cl.boots === 'number' ? cl.boots : .22;
        const bsec = SEC.shin().filter(s => s.y <= -(.40 - bh) + .001 || s.y < -.39);
        bsec.unshift({ y: -(.40 - bh), w: .085, f: .045, b: .05 });
        knJ.add(M(loft(scaleSecs(bsec, bs, gw * LL, gw * LL), { inflate: 1.16 }), col.shoes, 'cloth', 'shin', figId));
      }
      const anJ = new T.Group(); anJ.position.set(0, -REF.shin * bs, 0); knJ.add(anJ); joints['ankle' + side] = anJ;
      const fg = loft(scaleSecs(SEC.foot(), bs * 1.0, gw * L, bs), {});
      fg.rotateX(Math.PI / 2); // loft +Y -> +Z (forward), loft +Z -> -Y (down)
      // flat sole
      const pa = fg.attributes.position; const sole = -REF.ankle * bs;
      for (let i = 0; i < pa.count; i++) if (pa.getY(i) < sole) pa.setY(i, sole);
      fg.computeVertexNormals();
      const ft = M(fg, col.shoes, 'cloth', 'foot', figId); if (cl.shoes !== false || true) ft.scale.set(1.08, 1.04, 1.06);
      anJ.add(ft);
    }
    // pose
    const pose = window.P3POSES.resolve(spec.pose);
    if (spec.tilt) { const tl = spec.tilt; const pv = pose.pelvis || [0, 0, 0]; pose.pelvis = [pv[0] + (tl[0] || 0), pv[1] + (tl[1] || 0), pv[2] + (tl[2] || 0)]; }
    if (pre.stoop) { const sp = pose.spine || [0, 0, 0]; pose.spine = [sp[0] + 10, sp[1], sp[2]]; const nk = pose.neck || [0, 0, 0]; pose.neck = [nk[0] + 12, nk[1], nk[2]]; }
    applyPose(joints, pose, bs);
    root.userData.joints = joints;
    root.userData.scale = { bs, headS, H };
    return { root, joints, pose };
  }

  function applyPose(J, p, bs) {
    for (const k of ['pelvis', 'spine', 'neck', 'head']) if (p[k]) J[k].quaternion.copy(trunkQuat(p[k]));
    for (const side of ['L', 'R']) {
      const sh = p['shoulder' + side] || [0, 0, 0];
      J['shoulder' + side].quaternion.copy(ballQuat(sh[0], sh[1], sh[2], side));
      // shoulder girdle rises when the arm goes overhead
      const elev = Math.acos(Math.max(-1, Math.min(1, new T.Vector3(0, -1, 0).applyQuaternion(J['shoulder' + side].quaternion).y * -1))) / D;
      const shrug = (p['shrug' + side] || 0) + Math.max(0, (elev - 80) / 100) * .8;
      const rp = J['shoulder' + side].userData.rest;
      J['shoulder' + side].position.set(rp.x * (1 - .06 * shrug), rp.y + .045 * bs * shrug, rp.z);
      J['elbow' + side].quaternion.setFromAxisAngle(new T.Vector3(1, 0, 0), -(p['elbow' + side] || 0) * D);
      const w = p['wrist' + side] || [0, 0];
      const sx = side === 'L' ? 1 : -1;
      J['wrist' + side].quaternion.setFromEuler(new T.Euler(-(w[1] || 0) * D, 0, -sx * (w[0] || 0) * D, 'XYZ'));
      const curl = p['hand' + side] === undefined ? .35 : p['hand' + side];
      J['fingers' + side].quaternion.setFromAxisAngle(new T.Vector3(0, 0, 1), -sx * curl * 105 * D);
      const hp = p['hip' + side] || [0, 0, 0];
      J['hip' + side].quaternion.copy(ballQuat(hp[0], hp[1], hp[2], side));
      J['knee' + side].quaternion.setFromAxisAngle(new T.Vector3(1, 0, 0), (p['knee' + side] || 0) * D);
      const an = p['ankle' + side] || [0, 0];
      J['ankle' + side].quaternion.setFromEuler(new T.Euler(-(an[0] || 0) * D, 0, sx * (an[1] || 0) * D, 'XYZ'));
    }
  }

  function addProp(wrJ, pr, hs, sx, figId) {
    const len = pr.length || .9, r = pr.radius || .018;
    const g = new T.CylinderGeometry(r, r, len, 10);
    const mesh = M(g, pr.color || '#3a2a1a', 'shiny', 'prop', figId);
    const grp = new T.Group(); grp.position.set(-sx * .005, -.06 * hs, .0); wrJ.add(grp);
    // held in the fist; angle 90 (default) = the rod leaves the fist on the thumb side, 270 = little-finger side
    grp.rotation.set((pr.angle === undefined ? 90 : pr.angle) * D, 0, (pr.tilt || 0) * D);
    const off = pr.offset === undefined ? .3 : pr.offset;
    mesh.position.y = len * (.5 - off);
    grp.add(mesh);
    if (pr.type === 'umbrella' || pr.type === 'parasol') {
      const cr = pr.canopy || .5;
      const cg = new T.ConeGeometry(cr, cr * .45, 16, 1, true);
      const cm = new T.Mesh(cg, new T.MeshStandardMaterial({ color: new T.Color(pr.canopyColor || '#c03a2a'), roughness: .8, side: T.DoubleSide }));
      cm.castShadow = cm.receiveShadow = true; cm.userData = { part: 'prop', color: pr.canopyColor || '#c03a2a', figId, kind: 'cloth' };
      cm.position.y = len * (1 - off) - cr * .2; grp.add(cm);
    }
  }

  // ---- head, face masses, hair ---------------------------------------------------------------
  function buildHead(headJ, hs, col, spec, figId, R) {
    const skin = col.skin;
    const hd = M(loft(scaleSecs(SEC.head(), hs, hs, hs), { seg: 24 }), skin, 'skin', 'head', figId); headJ.add(hd);
    // nose wedge
    const ng = new T.ConeGeometry(.014 * hs, .042 * hs, 4); ng.rotateY(Math.PI / 4);
    const nose = M(ng, skin, 'skin', 'head', figId); nose.position.set(0, .056 * hs, .1 * hs); nose.rotation.x = .35; nose.scale.set(1, 1, .9); headJ.add(nose);
    // brow ridge
    const bg = new T.SphereGeometry(.05 * hs, 14, 8); const brow = M(bg, skin, 'skin', 'head', figId);
    brow.scale.set(1.15, .3, .32); brow.position.set(0, .094 * hs, .074 * hs); headJ.add(brow);
    // ears
    for (const sx of [-1, 1]) { const eg = new T.SphereGeometry(.022 * hs, 10, 8); const e = M(eg, skin, 'skin', 'head', figId); e.scale.set(.45, 1.15, .8); e.position.set(sx * .073 * hs, .07 * hs, -.01 * hs); headJ.add(e); }
    const hair = Object.assign({ style: 'short' }, typeof spec.hair === 'string' ? { style: spec.hair } : (spec.hair || {}));
    const hc = hair.color || col.hair;
    const cc = new T.Vector3(0, .105 * hs, -.008 * hs); // cranium centre
    const crR = new T.Vector3(.081, .092, .106).multiplyScalar(hs); // cranium radii
    const vol = hair.volume || 1;
    const cap = (k, theta, tilt) => {
      const g = new T.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, theta || 1.95);
      const c = M(g, hc, 'hair', 'hair', figId); c.scale.set(crR.x * k, crR.y * k, crR.z * k); c.position.copy(cc); c.rotation.x = -(tilt === undefined ? .45 : tilt); headJ.add(c); return c;
    };
    const st = hair.style;
    if (st !== 'bald' && st !== 'none') {
      if (st === 'short' || st === 'spiky' || st === 'ponytail' || st === 'bun' || st === 'long' || st === 'bob' || st === 'curly') cap(st === 'curly' ? 1.18 * vol : 1.1 * vol, 1.8, .45);
      if (st === 'bob' || st === 'long') {
        const g = new T.SphereGeometry(1, 28, 18, (150) * D, 240 * D, .25, 1.75);
        const b = M(g, hc, 'hair', 'hair', figId); b.scale.set(crR.x * 1.16 * vol, crR.y * 1.25, crR.z * 1.12 * vol); b.position.copy(cc).add(new T.Vector3(0, -.025 * hs, -.004 * hs)); headJ.add(b);
        if (st === 'long') {
          const lg = new T.SphereGeometry(1, 20, 14); const l = M(lg, hc, 'hair', 'hair', figId);
          const len = hair.length || .3; l.scale.set(.085 * hs * vol, len * hs / 1.0 * .55, .03 * hs); l.position.set(0, .06 * hs - len * hs * .35, -.085 * hs); headJ.add(l);
        }
      }
      if (st === 'bun') { const g = new T.SphereGeometry(.045 * hs, 14, 10); const b = M(g, hc, 'hair', 'hair', figId); b.position.set(0, .15 * hs, -.1 * hs); headJ.add(b); }
      if (st === 'spiky') {
        cap(1.12 * vol, 1.6, .7);
        const n = hair.spikes || 16; const len = (hair.length || .17) * hs * vol;
        const sweep = new T.Vector3(...(hair.sweep || [0, .6, -1])).normalize();
        for (let i = 0; i < n; i++) {
          // spikes grow from the crown and the back of the skull (not the face), swept by `sweep`
          const th = .12 + (i / n) * 1.55 + (R() - .5) * .25, ph = i * 2.39996 + R() * .5;
          const nrm = new T.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
          if (nrm.z > .25) { nrm.z = .25 - (nrm.z - .25) * .5; nrm.normalize(); }
          const base = cc.clone().add(new T.Vector3(nrm.x * crR.x * .85, nrm.y * crR.y * .85, nrm.z * crR.z * .85));
          const dir = nrm.clone().multiplyScalar(.75).add(sweep.clone().multiplyScalar(.8 + R() * .4)).normalize();
          const l = len * (.55 + R() * .6) * (nrm.y > .3 ? 1.1 : .8);
          const tip = base.clone().add(dir.clone().multiplyScalar(l));
          const mid = base.clone().lerp(tip, .5).add(new T.Vector3(0, l * .1, 0));
          const r0 = (.036 + R() * .016) * hs * vol;
          const sp = M(taperTube([base, mid, tip], t => r0 * Math.pow(1 - t, .9) + .002 * hs, { radial: 7, segments: 8, flat: .75 }), hc, 'hair', 'hair', figId);
          headJ.add(sp);
        }
      }
      if (st === 'ponytail') headJ.userData.ponytail = { hc, hs, hair, figId };
    }
    const hat = spec.hat ? Object.assign({ style: 'cap' }, typeof spec.hat === 'string' ? { style: spec.hat } : spec.hat) : null;
    if (hat) {
      const hcol = hat.color || '#5a4a3a';
      if (hat.style === 'helmet') {
        const g = new T.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, 1.55); const h = M(g, hcol, 'shiny', 'hat', figId);
        h.scale.set(crR.x * 1.25, crR.y * 1.2, crR.z * 1.18); h.position.copy(cc).add(new T.Vector3(0, .01 * hs, 0)); h.rotation.x = -.3; headJ.add(h);
        const rg = new T.TorusGeometry(1, .09, 8, 28); const rim = M(rg, hat.band || '#d8b040', 'shiny', 'hat', figId);
        rim.scale.set(crR.x * 1.22, crR.z * 1.16, crR.y * 1.1); rim.rotation.x = Math.PI / 2 - .3; rim.position.copy(cc).add(new T.Vector3(0, .018 * hs, .004 * hs)); headJ.add(rim);
      } else if (hat.style === 'brimmed') {
        const cr = M(new T.CylinderGeometry(.085 * hs, .095 * hs, .1 * hs, 20), hcol, 'cloth', 'hat', figId); cr.position.copy(cc).add(new T.Vector3(0, .07 * hs, 0)); headJ.add(cr);
        const br = M(new T.CylinderGeometry(.17 * hs, .17 * hs, .01 * hs, 28), hcol, 'cloth', 'hat', figId); br.position.copy(cc).add(new T.Vector3(0, .025 * hs, 0)); headJ.add(br);
      } else if (hat.style === 'headband') {
        const tg = new T.TorusGeometry(1, .14, 8, 28); const t = M(tg, hcol, 'cloth', 'hat', figId);
        t.scale.set(crR.x * 1.08, crR.z * 1.06, crR.y * 1.0); t.rotation.x = Math.PI / 2 - .25; t.position.copy(cc).add(new T.Vector3(0, -.002 * hs, .004 * hs)); headJ.add(t);
        if (hat.tails !== false) headJ.userData.headbandTails = { hcol, hs, flow: hat.flow, figId };
      } else { // flat cap with a visor
        const g = new T.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, 1.45); const c = M(g, hcol, 'cloth', 'hat', figId);
        c.scale.set(crR.x * 1.16, crR.y * 1.0, crR.z * 1.12); c.position.copy(cc).add(new T.Vector3(0, .02 * hs, -.005 * hs)); c.rotation.x = -.25; headJ.add(c);
        const vg = new T.CylinderGeometry(.07 * hs, .07 * hs, .008 * hs, 20, 1, false, -Math.PI / 2, Math.PI);
        const v = M(vg, hcol, 'cloth', 'hat', figId); v.scale.set(1.1, 1, .8); v.position.copy(cc).add(new T.Vector3(0, .025 * hs, .085 * hs)); v.rotation.x = .12; headJ.add(v);
      }
    }
    if (spec.glasses) {
      for (const sx of [-1, 1]) {
        const g = new T.TorusGeometry(.019 * hs, .0045 * hs, 6, 16); const gl = M(g, spec.glasses === true ? '#2a2a2a' : spec.glasses, 'shiny', 'head', figId);
        gl.position.set(sx * .032 * hs, .075 * hs, .104 * hs); headJ.add(gl);
      }
    }
  }

  // hair / cloth chains that need the posed world frame (ponytail, headband tails)
  function addFlowing(root) {
    root.updateMatrixWorld(true);
    const headJ = root.userData.joints.head;
    const inv = new T.Matrix4().copy(headJ.matrixWorld).invert();
    const chain = (startLocal, initLocalDir, flowWorld, n, segLen, droop) => {
      const pts = [startLocal.clone()];
      const qW = new T.Quaternion(); headJ.getWorldQuaternion(qW);
      const qInv = qW.clone().invert();
      const fl = flowWorld.clone().normalize().applyQuaternion(qInv);
      const grav = new T.Vector3(0, -1, 0).applyQuaternion(qInv);
      let p = startLocal.clone();
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const d = initLocalDir.clone().multiplyScalar(Math.max(0, 1 - t * 1.6)).add(fl.clone().multiplyScalar(Math.min(1, t * 1.4) + .2)).add(grav.clone().multiplyScalar(droop * t)).normalize();
        p = p.clone().add(d.multiplyScalar(segLen)); pts.push(p);
      }
      return pts;
    };
    if (headJ.userData.ponytail) {
      const { hc, hs, hair, figId } = headJ.userData.ponytail;
      const flow = new T.Vector3(...(hair.flow || [0, -1, -.15]));
      const len = (hair.length || .38) * hs * (hair.volume || 1);
      const start = new T.Vector3(0, .15 * hs, -.095 * hs);
      const pts = chain(start, new T.Vector3(0, -.2, -1).normalize(), flow, 6, len / 6, hair.flow ? .15 : 0);
      const r0 = .042 * hs * (hair.volume || 1);
      headJ.add(M(taperTube(pts, t => r0 * (t < .15 ? .7 + 2 * t : 1 - .75 * Math.pow((t - .15) / .85, 1.2)), { radial: 12, segments: 24, flat: .8 }), hc, 'hair', 'hair', figId));
      const tie = M(new T.SphereGeometry(.03 * hs, 10, 8), hair.tie || hc, 'cloth', 'hair', figId); tie.position.copy(start).add(new T.Vector3(0, -.005, -.015 * hs)); headJ.add(tie);
    }
    if (headJ.userData.headbandTails) {
      const { hcol, hs, flow, figId } = headJ.userData.headbandTails;
      const f = new T.Vector3(...(flow || [.3, -.6, -1]));
      for (const sx of [-1, 1]) {
        const start = new T.Vector3(sx * .02 * hs, .1 * hs, -.11 * hs);
        const pts = chain(start, new T.Vector3(sx * .4, -.2, -1).normalize(), f.clone().add(new T.Vector3(sx * .15, sx * .1, 0)), 5, .045 * hs * (sx > 0 ? 1.1 : .9), .1);
        headJ.add(M(taperTube(pts, t => .016 * hs * (1 - .4 * t), { radial: 8, segments: 14, flat: .3 }), hcol, 'cloth', 'hat', figId));
      }
    }
  }

  window.P3MAN = { buildFigure, addFlowing, applyPose, PRESETS };
})();
