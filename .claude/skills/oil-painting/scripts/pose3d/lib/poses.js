// pose3d named poses. Angles in degrees. See README for the joint conventions.
//  pelvis, spine, neck, head : [fwd, twist, side]   fwd + = bend forward, twist + = turn to own left, side + = lean to own left
//                              (pelvis also carries the whole body: pelvis fwd tips the body forward about the hips, legs included)
//  shoulderL/R, hipL/R       : [fwd, out, twist]    "joystick": fwd + = limb swings forward, out + = limb swings out to its own side,
//                              both combine (fwd 64, out 64 = diagonal, raised 90 deg). twist + = inward (internal) rotation.
//  elbowL/R, kneeL/R         : bend (0 = straight). Elbows bend forward, knees backward.
//  wristL/R                  : [flex, dev]          flex + = bend toward the palm; dev + = bend toward the thumb
//  ankleL/R                  : [flex, roll]         flex + = toes up
//  handL/R                   : curl 0 (flat open) .. 1 (fist)
//  shrugL/R                  : 0..1 raises the shoulder (added automatically when the arm goes above horizontal)
(function () {
  const P = {
    neutral: {},
    stand: {
      shoulderL: [2, 7, 0], shoulderR: [2, 7, 0], elbowL: 12, elbowR: 12, wristL: [8, 0], wristR: [8, 0], handL: .35, handR: .35,
      hipL: [0, 3, 0], hipR: [0, 3, 0], kneeL: 3, kneeR: 3, ankleL: [0, 0], ankleR: [0, 0], neck: [6, 0, 0], head: [-4, 0, 0]
    },
    stand_relaxed: { // contrapposto, weight on the right leg
      pelvis: [0, 4, 5], spine: [2, -5, -8], neck: [6, 0, 3], head: [-2, 8, 2],
      shoulderL: [6, 9, 0], shoulderR: [-4, 6, 0], elbowL: 18, elbowR: 10, handL: .4, handR: .35, wristL: [10, 0], wristR: [6, 0],
      hipL: [8, 8, -10], hipR: [0, -3, 0], kneeL: 18, kneeR: 2, ankleL: [-6, 0]
    },
    walk: {
      pelvis: [3, 6, 0], spine: [2, -10, 0], neck: [4, 0, 0], head: [-2, 4, 0],
      hipL: [26, 3, 0], kneeL: 8, ankleL: [12, 0], hipR: [-16, 3, 0], kneeR: 26, ankleR: [-12, 0],
      shoulderL: [-16, 8, 0], elbowL: 14, shoulderR: [20, 8, 0], elbowR: 30, handL: .4, handR: .4
    },
    walk_b: { mirror: 'walk' },
    run: {
      pelvis: [14, 10, 0], spine: [10, -18, 0], neck: [-6, 0, 0], head: [-10, 8, 0],
      hipL: [62, 4, 0], kneeL: 72, ankleL: [10, 0], hipR: [-22, 4, 0], kneeR: 95, ankleR: [-35, 0],
      shoulderL: [-45, 12, 0], elbowL: 95, shoulderR: [55, 14, 10], elbowR: 95, handL: .85, handR: .85, wristL: [10, 0], wristR: [10, 0]
    },
    run_b: { mirror: 'run' },
    sprint: {
      pelvis: [24, 10, 0], spine: [12, -18, 0], neck: [-12, 0, 0], head: [-14, 8, 0],
      hipL: [80, 4, 0], kneeL: 95, ankleL: [10, 0], hipR: [-10, 4, 0], kneeR: 40, ankleR: [-40, 0],
      shoulderL: [-55, 14, 0], elbowL: 90, shoulderR: [75, 16, 10], elbowR: 80, handL: .5, handR: .5
    },
    lunge: { // wide fighting stance, weight forward on the left leg
      pelvis: [10, 25, 0], spine: [8, -20, 4], head: [-8, -10, 0],
      hipL: [60, 18, 10], kneeL: 70, ankleL: [12, 0], hipR: [-30, 22, -10], kneeR: 15, ankleR: [-5, 0],
      shoulderL: [70, 30, 0], elbowL: 30, shoulderR: [-30, 35, 0], elbowR: 40, handL: .3, handR: .9
    },
    reach_up: {
      spine: [-8, 0, -6], neck: [-14, 0, 0], head: [-22, 0, 0],
      shoulderR: [165, 12, 0], elbowR: 8, handR: 0, wristR: [-10, 0],
      shoulderL: [10, 14, 0], elbowL: 25, handL: .4,
      hipL: [4, 4, 0], hipR: [-4, 2, 0], kneeL: 6, ankleR: [-20, 0]
    },
    reach_forward: {
      pelvis: [6, 0, 0], spine: [14, 0, 0], head: [-14, 0, 0],
      shoulderR: [85, 6, 0], elbowR: 10, handR: .1, shoulderL: [55, 10, 0], elbowL: 25, handL: .2,
      hipL: [14, 3, 0], kneeL: 20, hipR: [-10, 3, 0], kneeR: 5
    },
    wave: {
      pelvis: [0, -4, 4], spine: [0, 6, -4], head: [-4, 6, 4],
      shoulderR: [10, 100, -80], elbowR: 95, wristR: [-10, 0], handR: 0,
      shoulderL: [2, 8, 0], elbowL: 15, handL: .4, hipL: [6, 8, -8], kneeL: 12, hipR: [0, -2, 0]
    },
    cheer: { // both arms up in a V
      spine: [-6, 0, 0], neck: [-8, 0, 0], head: [-16, 0, 0],
      shoulderL: [30, 145, 0], shoulderR: [30, 145, 0], elbowL: 25, elbowR: 25, handL: .5, handR: .5,
      hipL: [2, 5, 0], hipR: [2, 5, 0], kneeL: 5, kneeR: 5
    },
    jump_cheer: {
      spine: [-10, 0, 0], head: [-18, 0, 0],
      shoulderL: [20, 150, 0], shoulderR: [20, 150, 0], elbowL: 15, elbowR: 15, handL: 0, handR: 0,
      hipL: [30, 6, 0], kneeL: 70, hipR: [20, 6, 0], kneeR: 55, ankleL: [-30, 0], ankleR: [-30, 0]
    },
    point: {
      pelvis: [0, 8, 0], spine: [2, 12, 0], head: [-4, 14, 0],
      shoulderR: [80, 10, 0], elbowR: 6, handR: .75, wristR: [0, 0],
      shoulderL: [4, 8, 0], elbowL: 14, handL: .4, hipL: [5, 5, 0], kneeL: 8, hipR: [-3, 3, 0]
    },
    hands_on_hips: {
      neck: [4, 0, 0],
      shoulderL: [-15, 48, 75], shoulderR: [-15, 48, 75], elbowL: 105, elbowR: 105, wristL: [-25, 0], wristR: [-25, 0], handL: .3, handR: .3,
      hipL: [0, 8, 0], hipR: [0, 8, 0], kneeL: 3, kneeR: 3
    },
    arms_crossed: {
      neck: [6, 0, 0], head: [-2, 0, 0],
      shoulderL: [22, 14, 70], shoulderR: [26, 16, 70], elbowL: 115, elbowR: 112, handL: .6, handR: .6,
      hipL: [0, 4, 0], hipR: [0, 4, 0]
    },
    hands_behind: {
      spine: [-2, 0, 0], neck: [4, 0, 0],
      shoulderL: [-25, 10, 20], shoulderR: [-25, 10, 20], elbowL: 45, elbowR: 45, handL: .5, handR: .5,
      hipL: [0, 5, 0], hipR: [0, 5, 0]
    },
    look_up: {
      spine: [-6, 0, 0], neck: [-16, 0, 0], head: [-26, 0, 0],
      shoulderL: [0, 8, 0], shoulderR: [0, 8, 0], elbowL: 15, elbowR: 15, handL: .4, handR: .4, hipL: [0, 4, 0], hipR: [0, 4, 0]
    },
    talk: { // gesturing with the right hand
      pelvis: [0, 6, 3], spine: [3, 8, -3], head: [-2, 18, 4],
      shoulderR: [30, 22, 30], elbowR: 80, handR: .15, wristR: [-20, 0],
      shoulderL: [8, 6, 0], elbowL: 20, handL: .4, hipL: [5, 8, -6], kneeL: 10
    },
    shield_eyes: { // hand shading the eyes, looking at something bright
      spine: [-3, 0, 0], head: [-10, 0, 0],
      shoulderR: [95, 40, 30], elbowR: 125, handR: 0, wristR: [-10, 0],
      shoulderL: [2, 8, 0], elbowL: 14, handL: .4, hipL: [0, 4, 0], hipR: [0, 4, 0]
    },
    hold_child_hand: { shoulderL: [4, 22, 0], elbowL: 10, handL: .6, shoulderR: [2, 7, 0], elbowR: 12, hipL: [0, 4, 0], hipR: [0, 4, 0] },
    fall_back: { // pulled backward off the feet: arched back, arms flung, legs trailing
      pelvis: [-35, 0, 0], spine: [-28, 6, 0], neck: [-12, 0, 0], head: [-6, 10, 0],
      shoulderL: [70, 120, 0], elbowL: 25, handL: .1, shoulderR: [140, 40, 0], elbowR: 30, handR: 0,
      hipL: [40, 10, 0], kneeL: 70, hipR: [12, 6, 0], kneeR: 35, ankleL: [-30, 0], ankleR: [-35, 0]
    },
    float: { // weightless, limbs loose
      pelvis: [-8, 0, 0], spine: [-6, 0, 0], head: [-4, 0, 0],
      shoulderL: [30, 55, 0], shoulderR: [30, 55, 0], elbowL: 40, elbowR: 40, handL: .3, handR: .3,
      hipL: [25, 8, 0], kneeL: 45, hipR: [10, 6, 0], kneeR: 25, ankleL: [-30, 0], ankleR: [-30, 0]
    },
    sit_ground: {
      hipL: [88, 14, 10], hipR: [88, 14, 10], kneeL: 100, kneeR: 95, spine: [10, 0, 0],
      shoulderL: [30, 10, 0], shoulderR: [30, 10, 0], elbowL: 40, elbowR: 40, handL: .4, handR: .4
    },
    crouch: {
      pelvis: [20, 0, 0], spine: [20, 0, 0], head: [-25, 0, 0],
      hipL: [110, 10, 0], kneeL: 125, ankleL: [25, 0], hipR: [80, 12, 0], kneeR: 140, ankleR: [-10, 0],
      shoulderL: [40, 10, 0], shoulderR: [50, 10, 0], elbowL: 50, elbowR: 40, handL: .4, handR: .4
    }
  };
  const SIDE_KEYS = ['shoulder', 'elbow', 'wrist', 'hand', 'hip', 'knee', 'ankle', 'shrug'];
  // mirror a pose left <-> right (twists and side-bends change sign)
  function mirror(p) {
    const o = {};
    for (const k in p) {
      let v = p[k]; let k2 = k;
      const m = k.match(/^(\w+?)(L|R)$/);
      if (m && SIDE_KEYS.includes(m[1])) k2 = m[1] + (m[2] === 'L' ? 'R' : 'L');
      else if (Array.isArray(v) && ['pelvis', 'spine', 'neck', 'head'].includes(k)) v = [v[0], -v[1], -v[2]];
      o[k2] = Array.isArray(v) ? v.slice() : v;
    }
    return o;
  }
  function getNamed(name) {
    const p = P[name];
    if (!p) throw new Error('unknown pose "' + name + '". Known: ' + Object.keys(P).join(', '));
    if (p.mirror) return mirror(getNamed(p.mirror));
    return JSON.parse(JSON.stringify(p));
  }
  function lerpPose(a, b, t) {
    const o = {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const va = a[k], vb = b[k];
      if (Array.isArray(va) || Array.isArray(vb)) { const A = va || [0, 0, 0], B = vb || [0, 0, 0]; o[k] = A.map((x, i) => x + ((B[i] || 0) - x) * t); }
      else o[k] = (va || 0) + ((vb || 0) - (va || 0)) * t;
    }
    return o;
  }
  // resolve a pose spec: "run" | {base:"run", mirror:true, blend:{pose:"stand", t:.3}, scale:.8, ...joint overrides}
  function resolve(spec) {
    if (!spec) return getNamed('stand');
    if (typeof spec === 'string') return getNamed(spec);
    let p = spec.base ? getNamed(spec.base) : {};
    if (spec.blend) { const b = typeof spec.blend.pose === 'string' ? getNamed(spec.blend.pose) : spec.blend.pose; p = lerpPose(p, b, spec.blend.t === undefined ? .5 : spec.blend.t); }
    if (spec.scale !== undefined) p = lerpPose({}, p, spec.scale);
    if (spec.mirror) p = mirror(p);
    for (const k in spec) if (!['base', 'blend', 'scale', 'mirror'].includes(k)) p[k] = spec[k];
    return p;
  }
  window.P3POSES = { POSES: P, mirror, resolve, getNamed, lerpPose, names: Object.keys(P) };
})();
