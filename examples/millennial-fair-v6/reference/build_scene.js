#!/usr/bin/env node
// Builds the pose3d scene JSON for "The Gate Opens at the Millennial Fair" (v6).
//   node build_scene.js <option A|B|C|final> <out.json>
// The set (stage, telepods, gate, tower, tents, trees, bunting, balloons) and the light are shared by every option,
// in world metres (Y up; +X right, -Z away from the default camera). Options differ in camera and in where the
// people stand.
const fs = require('fs');
const opt = (process.argv[2] || 'A');
const out = process.argv[3] || '/tmp/scene.json';
const D = Math.PI / 180;
const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]) / D; // pose3d yaw: 0 faces +Z

// ------------------------------------------------------------------ the set (world metres)
const STAGE = { c: [0, 0, -20], size: [10, .75, 4.6] };
const DECK = STAGE.size[1];
// defaults (option F); an option may override them with o.gate = {pos, r, pods: [podL, podR]}
let GATE = [0, DECK + 2.05, -20.9]; // vortex centre
let GATE_R = 1.75;
let POD_L = [-2.75, DECK, -20.8], POD_R = [2.75, DECK, -20.8];

function setProps(o) {
  const P = [];
  P.push({ name: 'stage', type: 'stage', position: STAGE.c, size: STAGE.size, color: '#b08250', skirtColor: '#7a5236', stepX: o.stepX === undefined ? -3.4 : o.stepX, stepWidth: 1.6,
           posts: [[-4.85, -17.85, 3.6], [4.85, -17.85, 3.6]] });
  P.push({ name: 'telepod_left', type: 'telepod', position: POD_L, radius: .72, coil: 1.35, antennas: [[0, 0, -8, 1.2], [-.35, 0, -30, .8]] });
  P.push({ name: 'telepod_right', type: 'telepod', position: POD_R, radius: .72, coil: 1.35, antennas: [[0, 0, 8, 1.2], [.35, 0, 30, .8]] });
  P.push({ name: 'gate', type: 'vortex', position: GATE, radius: GATE_R,  intensity: 2.6, ribbons: 2, yaw: o.gateYaw || 0, castShadow: false, shadowBounds: false });
  P.push({ name: 'console', type: 'console', position: o.console ? [o.console[0], DECK, o.console[1]] : [4.05, DECK, -19.25], yaw: o.consoleYaw === undefined ? -125 : o.consoleYaw, width: .95, lamp: '#ff5040' });
  // cables from the pods to the console (low rods along the deck)
  P.push({ type: 'cylinder', position: [3.4, DECK + .05, -20.0], size: [.04, 1.4], rotation: [90, 0, 55], color: '#1e1e22' });

  // Leene's bell tower, back left
  P.push({ name: 'bell_tower', type: 'tower', position: o.tower || [-26, 0, -78], width: 5.6, height: 14.5, belfry: 3.6, roof: 4.6, yaw: 18, color: '#d2c09a', roofColor: '#a0503a' });
  // circus tents
  P.push({ name: 'tent_red', type: 'tent', position: [14.5, 0, -36], radius: 4.4, wall: 2.6, roof: 3.8, stripes: 18, color: '#c8382e', color2: '#f2e8d8', yaw: -30, flagColor: '#f0c040' });
  P.push({ name: 'tent_blue', type: 'tent', position: o.tentBlue || [-6.5, 0, -45], radius: 3.4, wall: 2.2, roof: 3.0, stripes: 14, color: '#3a5aa8', color2: '#f2e8d8', yaw: 20, flagColor: '#d8402e' });
  // trees: two masses behind the stage, a far row, and one off-frame left whose canopy dapples the foreground
  P.push({ name: 'tree_back_right', type: 'tree', position: [7.5, 0, -29], trunk: 3.4, trunkRadius: .35, canopy: [4.2, 3.6, 3.6], clumps: 30, seed: 11 });
  P.push({ name: 'tree_back_left', type: 'tree', position: o.treeBackLeft || [-8.5, 0, -31], trunk: 3.0, trunkRadius: .3, canopy: [3.6, 3.2, 3.2], clumps: 26, seed: 12, colors: ['#4a7432', '#58843a', '#41682c'] });
  P.push({ name: 'tree_far_1', type: 'tree', position: [24, 0, -58], trunk: 3, canopy: [5, 4, 4], clumps: 24, seed: 13, colors: ['#5a8040', '#668a48'] });
  P.push({ name: 'tree_far_2', type: 'tree', position: [-30, 0, -62], trunk: 3, canopy: [5, 4.2, 4], clumps: 24, seed: 14, colors: ['#5a8040', '#668a48'] });
  P.push({ name: 'tree_far_3', type: 'tree', position: [2, 0, -70], trunk: 3, canopy: [6, 4, 4], clumps: 26, seed: 15, colors: ['#5f8646', '#6a9050'] });
  for (const [i, x, z] of [[1, -40, -88], [2, -52, -96], [3, -62, -84], [4, 34, -92], [5, 46, -86]])
    P.push({ type: 'tree', position: [x, 0, z], trunk: 3.2, canopy: [5.5, 4.2, 4.5], clumps: 18, seed: 40 + i, colors: ['#6a8a50', '#728f58'] });
  // background houses around the far side of the square (low contrast, just enough to close the plaza)
  for (const [i, x, z, w, h, c, r, aw] of [[1, -40, -78, 10, 7, '#e6d6b4', '#a85a3c', '#c8402e'], [2, -6, -86, 12, 8, '#dccaa4', '#9a5038', null],
      [3, 8, -84, 9, 6.5, '#e8dcc0', '#b0603c', '#3a6aa8'], [4, 20, -80, 11, 7.5, '#d8c49c', '#a04a34', null], [5, -52, -70, 9, 6, '#e0d0ac', '#a85a3c', null]])
    P.push({ name: 'house_' + i, type: 'house', position: [x, 0, z], width: w, depth: 7, height: h, roof: 3.2, color: c, roofColor: r, awning: aw || undefined });
  P.push({ name: 'tree_dapple', type: 'tree', position: o.dappleTree || [-15, 0, -4], trunk: 4.8, trunkRadius: .42, canopy: [6.5, 2.6, 6.5], clumps: 34, clumpSize: .75, seed: 21 });
  // bunting poles + strings
  const poleA = o.buntingPole || [-6.5, 0, -6.5];
  P.push({ name: 'bunting_pole_front', type: 'pole', position: poleA, height: 5.2 });
  P.push({ name: 'bunting_pole_back', type: 'pole', position: [11, 0, -24], height: 6 });
  const top = (p, h) => [p[0], p[1] + h, p[2]];
  const postL = [-4.85, DECK + 3.55, -17.85], postR = [4.85, DECK + 3.55, -17.85];
  P.push({ name: 'bunting_lead', type: 'bunting', from: top(poleA, 5.1), to: o.buntingTo === 'R' ? postR : postL, sag: .7, count: 26 });
  P.push({ name: 'bunting_stage', type: 'bunting', from: o.buntingTo === 'R' ? postL : postR, to: o.buntingTo === 'R' ? [-9, 6, -28] : top([11, 0, -24], 5.9), sag: .5, count: 14 });
  P.push({ name: 'bunting_back', type: 'bunting', from: [-8.2, 6.2, -31], to: [7.2, 6.8, -29], sag: 1.1, count: 30, colors: ['#f2ead8', '#d8402e', '#f0c040', '#3a7ac8'] });
  P.push({ name: 'tree_back_centre', type: 'tree', position: [.8, 0, -32], trunk: 3.9, trunkRadius: .38, canopy: [4.8, 3.9, 3.6], clumps: 32, seed: 16, colors: ['#46702e', '#527c36', '#3e662a'] });
  // balloons: three escaping toward the vortex, one in a child's hand (added with the child)
  const BL = o.balloons || [[-1.6, 5.5, -19.4], [1.9, 6.4, -20.2], [-.6, 7.1, -21.4]];
  P.push({ name: 'balloon_1', type: 'balloon', position: BL[0], color: '#d8302a', string: .9 });
  P.push({ name: 'balloon_2', type: 'balloon', position: BL[1], color: '#f0c030', string: .9 });
  P.push({ name: 'balloon_3', type: 'balloon', position: BL[2], color: '#3a78d0', string: .8 });
  return P;
}

// ------------------------------------------------------------------ heroes
function heroes(o) {
  const F = [];
  const cr = o.crono;
  const runDir = [GATE[0] + (cr.aim || 0) - cr.pos[0], 0, -18 - cr.pos[2]];
  const n = Math.hypot(runDir[0], runDir[2]);
  F.push({
    name: 'crono', preset: 'boy', height: 1.66, build: 1.0, position: cr.pos, facing: cr.heading !== undefined ? cr.heading : yawTo(cr.pos, [cr.pos[0] + runDir[0], 0, cr.pos[2] + runDir[2]]),
    pose: { base: 'run', pelvis: [22, 10, 0], spine: [14, -16, 0], neck: [-12, 0, 0], head: [-14, 10, 0],
            hipL: [58, 4, 0], kneeL: 78, ankleL: [6, 0], hipR: [-28, 4, 0], kneeR: 70, ankleR: [-40, 0],
            shoulderL: [-50, 14, 0], elbowL: 90, shoulderR: [62, 16, 10], elbowR: 95, handL: .9, handR: .9 },
    colors: { skin: '#f0c4a0', hair: '#d63a24', top: '#8ec3e6', sleeves: '#3d8a3a', tunic: '#8ec3e6', pants: '#caa470', shoes: '#6a3e22', belt: '#1c1816' },
    clothes: { top: 'shirt', sleeves: 'long', legs: 'pants', tunic: { length: .24, flare: .22 }, belt: true, boots: .2 },
    hair: { style: 'spiky', volume: 1.3, spikes: 24, length: .22, sweep: [0, .9, -.8] },
    hat: { style: 'headband', color: '#f4f0e6', flow: [-runDir[0] / n * 1, .25, -runDir[2] / n] },
    ascot: '#ec7a26', sword: { side: 'L', length: 1.0, color: '#3a1c16', hilt: '#4a3448', guard: '#c8a040', angle: 40, splay: 0 }
  });
  // Marle: hauled up off the deck in front of the gate, arched back, arms reaching out toward the plaza, ponytail into the vortex
  F.push({
    name: 'marle', preset: 'girl', height: 1.6, position: (o.marle && o.marle.pos) || [-.15, 0, -20.0], facing: o.marleFacing === undefined ? 12 : o.marleFacing, ground: false, lift: (o.marle && o.marle.lift) || DECK + 1.05,
    // torso tipped back ~45 deg toward the vortex; with the trunk tipped back, shoulder fwd ~30 reaches the arms out toward the plaza
    pose: { pelvis: [-26, 0, 30], spine: [-20, 14, 10], neck: [-6, 0, 4], head: [-18, 24, 10],
            shoulderR: [-15, 55, 0], elbowR: 14, handR: 0, wristR: [-20, 0],
            shoulderL: [150, 30, 0], elbowL: 30, handL: .1,
            hipL: [42, 10, 0], kneeL: 70, hipR: [16, 12, 0], kneeR: 28, ankleL: [-40, 0], ankleR: [-45, 0] },
    colors: { skin: '#f6d2b8', hair: '#f2a072', top: '#b2dcf4', pants: '#b2dcf4', shoes: '#eae6ee', belt: '#e2b23e' },
    clothes: { top: 'jumpsuit', sleeves: 'none', legs: 'pants', belt: true, boots: .14 },
    hair: { style: 'ponytail', volume: 1.35, length: .8, origin: [0, .19, -.07], flow: [1, .45, -.25], tie: '#e8e4f0' }
  });
  // Lucca: at her console beside the right telepod, recoiling from the gate, one hand still on a lever
  const lp = o.lucca || [4.55, 0, -18.75];
  F.push({
    name: 'lucca', preset: 'girl', height: 1.52, build: 1.02, position: lp, ground: true, lift: DECK, facing: o.luccaFacing === undefined ? yawTo(lp, GATE) + 8 : o.luccaFacing,
    // startled: body still square to her console, recoiling (weight back on the right leg), head snapped round to the
    // gate, left forearm flung up to shield her face, right hand still gripping a lever
    pose: { pelvis: [-8, 0, 6], spine: [-14, -8, 4], neck: [-6, -6, 0], head: [-10, -10, 0],
            shoulderR: [55, 18, 0], elbowR: 40, handR: .8,
            shoulderL: [100, 40, -60], elbowL: 115, handL: .1, wristL: [-25, 0],
            hipL: [14, 6, 0], kneeL: 12, hipR: [-22, 6, 0], kneeR: 20, ankleR: [-10, 0] },
    colors: { skin: '#f4cdb0', hair: '#7a3468', top: '#2e8e8c', sleeves: '#2e8e8c', tunic: '#e27a2c', pants: '#1c1c22', shoes: '#6a4628' },
    clothes: { top: 'shirt', sleeves: 'long', legs: 'shorts', tunic: { length: .22, flare: .4 }, boots: .3 },
    hair: { style: 'bob', volume: 1.15 }, hat: { style: 'helmet', color: '#e0cf98', band: '#d07a2a', antenna: 'R', antennaTip: '#e04030' },
    glasses: '#c8a050', scarf: '#f0c830'
  });
  return F;
}

// ------------------------------------------------------------------ fairgoers (each placed with intent)
const PAL = { skin: ['#f0c8a8', '#e8b896', '#d9a07a', '#c68a62', '#a8694a'] };
function person(name, preset, pos, look, pose, colors, extra) {
  return Object.assign({ name, preset, position: pos, facing: typeof look === 'number' ? look : yawTo(pos, look), pose, colors, clothes: { top: 'shirt', sleeves: 'long', legs: 'pants' } }, extra || {});
}
function fairgoers(o) {
  const G = GATE, F = [];
  const g = o.groups;
  // 1. the pair stepping back, stage-left front: a man shielding the woman, both recoiling from the light
  if (g.pair) {
    const [a, b] = g.pair;
    F.push(person('pair_man', 'male', a, G, { pelvis: [-2, 0, 0], spine: [-16, 10, 0], neck: [-4, 0, 0], head: [-4, -12, 0],
      shoulderR: [100, 40, -50], elbowR: 100, handR: .2, wristR: [-20, 0], shoulderL: [35, 62, 0], elbowL: 15, handL: .1,
      hipL: [14, 4, 0], kneeL: 3, ankleL: [12, 0], hipR: [-12, 5, 0], kneeR: 16, ankleR: [0, 0] },
      { skin: '#e2b08a', hair: '#3a2a20', top: '#ede4d2', pants: '#4a4038', shoes: '#2a2018', belt: '#3a2a1a', sleeves: '#ede4d2' },
      { height: 1.8, hat: { style: 'brimmed', color: '#c8b48a' }, clothes: { top: 'shirt', sleeves: 'long', legs: 'pants', tunic: { length: .32, flare: .2 } }, colorsExtra: 0 }));
    F[F.length - 1].colors.tunic = '#3a4a6a';
    F.push(person('pair_woman', 'female', b, G, { pelvis: [-6, 0, 0], spine: [-8, -10, 0], head: [-6, -12, 0], shoulderL: [40, 20, 40], elbowL: 110, handL: .4,
      shoulderR: [50, 20, 50], elbowR: 115, handR: .5, hipL: [-22, 4, 0], kneeL: 20, hipR: [8, 4, 0], kneeR: 6 },
      { skin: '#f2cdb2', hair: '#6b4a2a', top: '#b8503a', pants: '#b8503a', skirt: '#6a3a4a', shoes: '#3a2a20' },
      { height: 1.64, hair: { style: 'bun' }, clothes: { top: 'shirt', sleeves: 'long', legs: 'bare', skirt: { length: .78, flare: .65 } }, hat: { style: 'brimmed', color: '#efe6d0' } }));
  }
  // 2. two pointing at the gate (right middle ground)
  if (g.pointers) {
    const [a, b] = g.pointers;
    F.push(person('pointer_man', 'male', a, G, { base: 'point', shoulderR: [100, 12, 0], spine: [-4, 12, 0], head: [-14, 14, 0] },
      { skin: '#c68a62', hair: '#1a1a1a', top: '#a83a2e', sleeves: '#a83a2e', pants: '#3a3530', shoes: '#2a2018', belt: '#2a1a10' }, { height: 1.78, clothes: { top: 'shirt', sleeves: 'short', legs: 'pants', belt: true }, hat: { style: 'cap', color: '#3a3a4a' } }));
    F.push(person('pointer_woman', 'female', b, G, { base: 'point', mirror: true, shoulderL: [105, 20, 0], head: [-16, -8, 0], spine: [-6, -6, 0] },
      { skin: '#e8b896', hair: '#a07040', top: '#e8d8a8', sleeves: '#e8d8a8', pants: '#3a4a6a', skirt: '#3a4a6a', shoes: '#3a2a20' },
      { height: 1.63, hair: { style: 'long', length: .4 }, clothes: { top: 'shirt', sleeves: 'long', legs: 'bare', skirt: { length: .72, flare: .55 } } }));
  }
  // 3. mother and child with a balloon (foreground right)
  if (g.child) {
    const [m, c] = g.child;
    // the mother crouches beside her boy (keeps her head below the stage line), an arm round him; he points up at the gate
    F.push(person('mother', 'female', m, G, { base: 'crouch', pelvis: [10, 0, 0], spine: [6, 0, 0], neck: [-10, 0, 0], head: [-26, 0, 0],
        shoulderR: [40, 60, 40], elbowR: 70, handR: .3, shoulderL: [30, 10, 0], elbowL: 40, handL: .4 },
      { skin: '#f0c8a8', hair: '#4a3020', top: '#5a7a9a', sleeves: '#5a7a9a', skirt: '#2f4f6f', pants: '#263a52', shoes: '#2a2018' },
      { height: 1.66, hair: { style: 'bun' }, clothes: { top: 'shirt', sleeves: 'long', legs: 'pants', skirt: { length: .5, flare: .9 } }, hat: { style: 'brimmed', color: '#d8c8a0' } }));
    F.push(person('child', 'child', c, G, { base: 'point', shoulderR: [140, 14, 0], elbowR: 6, handR: .8, head: [-30, 10, 0], spine: [-6, 8, 0] },
      { skin: '#f2cdb2', hair: '#c8a060', top: '#f0e8d8', sleeves: '#f0e8d8', pants: '#3a6a5a', shoes: '#4a3a2a', belt: '#3a2a1a' },
      { height: 1.12, clothes: { top: 'shirt', sleeves: 'short', legs: 'shorts' }, hat: { style: 'cap', color: '#b83a2a' } }));
  }
  // 4. a woman shielding her eyes (left middle ground)
  if (g.shield) F.push(person('shield_woman', 'female', g.shield, G, { base: 'shield_eyes', pelvis: [0, 0, 4], spine: [-6, 0, -4] },
      { skin: '#e8b896', hair: '#2a1d15', top: '#e8e0f0', sleeves: '#e8e0f0', skirt: '#8a6a7a', pants: '#8a6a7a', shoes: '#3a2a20' },
      { height: 1.62, hair: { style: 'bun' }, clothes: { top: 'shirt', sleeves: 'long', legs: 'bare', skirt: { length: .82, flare: .6 } },
        prop: o.noParasol ? undefined : { type: 'parasol', hand: 'L', length: .9, offset: .15, angle: 95, canopy: .55, canopyColor: '#f4efe4' } }));
  // 5. an old man gaping up (right, near the stage)
  if (g.elder) F.push(person('elder', 'elder', g.elder, G, { base: 'look_up', shoulderL: [20, 10, 30], elbowL: 70, head: [-30, 0, 0] },
      { skin: '#d9a07a', hair: '#d8d8d4', top: '#6b7a3a', sleeves: '#6b7a3a', pants: '#5a5248', shoes: '#2a2018', belt: '#3a2a1a' },
      { height: 1.66, hair: { style: 'bald' }, hat: { style: 'brimmed', color: '#5a4a3a' }, prop: { type: 'rod', hand: 'R', length: .95, offset: .9, angle: 270, color: '#5a3a22' } }));
  // 6. a boy who has jumped up on the stage edge to see (cheering), and a young man running with Crono
  if (g.cheer) F.push(person('boy_cheer', 'boy', g.cheer, G, { base: 'cheer', head: [-20, 10, 0] },
      { skin: '#e2b08a', hair: '#6b4a2a', top: '#c8a24a', sleeves: '#c8a24a', pants: '#4a4038', shoes: '#2a2018' }, { height: 1.5 }));
  if (g.vendor) F.push(person('vendor', 'male', g.vendor, G, { base: 'stand_relaxed', head: [-18, 0, 0], shoulderR: [20, 10, 20], elbowR: 80 },
      { skin: '#e8b896', hair: '#4a3020', top: '#f0ece0', sleeves: '#f0ece0', pants: '#3a3530', shoes: '#2a2018', tunic: '#f4f0e8' },
      { height: 1.74, build: 1.2, clothes: { top: 'shirt', sleeves: 'long', legs: 'pants', tunic: { length: .5, flare: .25 } }, hat: { style: 'cap', color: '#f4f0e8' } }));
  return F;
}

// ------------------------------------------------------------------ options
const OPTIONS = {
  // A: standing eye level from the near plaza; Crono lower left running away from us toward the stage (lost profile),
  //    gate right of centre against the dark tree mass, tower small at upper left, dapples across the foreground.
  A: { camera: { fov: 32, eyeHeight: 1.6, horizonY: 860, x: -3.2, z: -3.0, yaw: -4 },
       crono: { pos: [-3.3, 0, -10.2], aim: -.4 },
       dappleTree: [-19, 0, -12], buntingPole: [-8.5, 0, -8.5],
       groups: { pair: [[-5.0, 0, -16.0], [-4.3, 0, -16.6]], pointers: [[3.0, 0, -13.6], [3.9, 0, -13.1]], child: [[5.0, 0, -10.6], [4.4, 0, -10.2]],
                 shield: [-8.6, 0, -13.2], elder: [6.6, 0, -16.6], cheer: [-1.6, 0, -16.9] } },
  // B: low camera off to the right front; the stage on a diagonal at left; Crono crosses the right foreground toward
  //    the gate, three-quarter front so his face shows; the sun from the left lights his front.
  B: { camera: { fov: 32, eyeHeight: 1.5, horizonY: 860, x: 9.5, z: -3.5, yaw: 35 },
       crono: { pos: [6.0, 0, -11.5], aim: 0 }, marleFacing: 30, gateYaw: 28,
       dappleTree: [-12, 0, -15], buntingPole: [11.5, 0, -11.5], buntingTo: 'R',
       groups: { pair: [[-4.6, 0, -15.8], [-3.9, 0, -16.3]], pointers: [[-1.0, 0, -13.6], [-.2, 0, -13.1]], child: [[1.4, 0, -11.2], [1.0, 0, -10.6]],
                 shield: [-6.4, 0, -13.4], elder: [7.8, 0, -18.8], cheer: [1.6, 0, -16.6] } },
  // C: raised viewpoint (eye 3.4 m, as from the fountain steps), looking down-right at the stage; Crono in the
  //    middle ground on a long diagonal with his long shadow; dapples cover the near plaza.
  C: { camera: { fov: 32, eyeHeight: 3.4, horizonY: 520, x: -8.0, z: -1.5, yaw: -22 },
       crono: { pos: [-5.6, 0, -9.4], aim: -.5 },
       dappleTree: [-22, 0, -12], buntingPole: [-10.5, 0, -9.0],
       groups: { pair: [[-4.9, 0, -16.2], [-4.2, 0, -16.7]], pointers: [[3.4, 0, -14.4], [4.3, 0, -14.0]], child: [[1.2, 0, -9.8], [.6, 0, -9.6]],
                 shield: [-7.4, 0, -13.6], elder: [6.8, 0, -16.9], cheer: [-1.9, 0, -16.9] } }
};

// ground point (world metres) under a canvas pixel, for a horizon-matched pose3d camera (same maths as lib/scene.js)
function groundAt(c, px, py) {
  const W = c.width || 2400, H = c.height || 1600, f = (H / 2) / Math.tan(c.fov * D / 2);
  const pitch = Math.atan((H / 2 - c.horizonY) / f), a = -pitch, th = (c.yaw || 0) * D;
  let x = px - W / 2, y = -(py - H / 2), z = -f;
  const y1 = y * Math.cos(a) - z * Math.sin(a), z1 = y * Math.sin(a) + z * Math.cos(a);
  const x2 = x * Math.cos(th) + z1 * Math.sin(th), z2 = -x * Math.sin(th) + z1 * Math.cos(th);
  if (y1 >= 0) throw new Error('pixel above horizon');
  const t = -c.eyeHeight / y1;
  return [+(c.x + x2 * t).toFixed(2), 0, +(c.z + z2 * t).toFixed(2)];
}
// F: the chosen composition (refined from A). Placement is by canvas pixel of the feet, converted to world metres.
{
  const cam = { width: 2400, height: 1600, fov: 32, eyeHeight: 1.6, horizonY: 860, x: -2.4, z: -3.0, yaw: -4 };
  const g = (px, py) => groundAt(cam, px, py);
  OPTIONS.F = { camera: cam,
    crono: { pos: g(770, 1545), aim: -.2 },
    tower: g(330, 905), dappleTree: [-21.5, 0, -16], buntingPole: [-8.0, 0, -8.5], treeBackLeft: [-24, 0, -42],
    lucca: [4.35, 0, -18.45], console: [3.62, -18.55], consoleYaw: 81, luccaFacing: -95, noParasol: true, tentBlue: [-10.5, 0, -47],
    groups: { pair: [g(500, 1205), g(615, 1180)], pointers: [g(1760, 1235), g(1885, 1212)], child: [g(2255, 1425), g(2140, 1405)],
              shield: g(230, 1335), elder: g(352, 1098), cheer: g(1060, 1168) } };
}

// G: close staging for faces (v6 follow-up, chosen). 40 deg lens, camera ~4.7 m from Marle so her head is ~110 px.
// The gate has opened in front of the stage, hovering over its front edge; Marle is lifted out in front of it, turned
// three-quarter to us, reaching toward Crono. Crono runs in from the left at about her depth (lost profile), Lucca on
// the stage at right is turned three-quarter to us. The left telepod moved out so Crono's head reads against the plaza.
// Fairgoers stand on the open plaza behind, left of the stage.
{
  const cam = { width: 2400, height: 1600, fov: 40, eyeHeight: 1.5, horizonY: 830, x: -0.4, z: -11.3, yaw: -4.5 };
  const g = (px, py) => groundAt(cam, px, py);
  OPTIONS.G = { camera: cam,
    gate: { pos: [0.3, DECK + 2.05, -20.6], r: 1.75, pods: [[-4.4, DECK, -20.9], [4.6, DECK, -20.9]] }, gateLight: 18,
    marle: { pos: [0.3, 0, -15.5], lift: .85 }, marleFacing: -45,
    // a cold rim light just behind Marle, standing in for the gate's glow reaching forward to her
    extraLights: [{ position: [0.45, 2.2, -16.4], color: '#8a80ff', intensity: 7, distance: 2.6 }],
    crono: { pos: [-1.6, 0, -16.7], heading: 129 },
    lucca: [3.2, 0, -18.1], console: [2.8, -18.75], consoleYaw: 20, luccaFacing: -50,
    tower: g(300, 872), dappleTree: [-18, 0, -18.5], gateFill: 1.5, buntingPole: [-7.5, 0, -12.5], treeBackLeft: [-30, 0, -46], tentBlue: [-14, 0, -42],
    stepX: -1.0, noParasol: true, balloons: [[-2.3, 4.2, -19.0], [2.9, 4.4, -19.8], [-1.2, 4.9, -21.5]],
    groups: { pair: [g(330, 975), g(255, 962)], pointers: [g(1700, 948), g(1770, 958)], shield: g(905, 952), cheer: g(470, 945) },
    over: {
      marle: { pose: { pelvis: [-20, 0, 8], spine: [-14, 6, 4], neck: [14, -4, 0], head: [12, -10, 0],
                        shoulderR: [45, 40, 0], elbowR: 12, handR: 0, wristR: [-15, 0], shoulderL: [100, 75, 0], elbowL: 40, handL: .1,
                        hipL: [40, 8, 0], kneeL: 65, hipR: [14, 10, 0], kneeR: 30, ankleL: [-40, 0], ankleR: [-45, 0] },
               hair: { style: 'ponytail', volume: 1.35, length: .8, origin: [0, .19, -.07], flow: [.9, .6, -.8], tie: '#e8e4f0' } },
      crono: { pose: { base: 'run', pelvis: [20, 10, 0], spine: [12, -18, 0], neck: [-10, -14, 0], head: [-10, -22, 0],
                       hipL: [58, 4, 0], kneeL: 78, ankleL: [6, 0], hipR: [-28, 4, 0], kneeR: 70, ankleR: [-40, 0],
                       shoulderL: [-50, 14, 0], elbowL: 90, shoulderR: [62, 16, 10], elbowR: 95, handL: .9, handR: .9 } },
      lucca: { pose: { pelvis: [-8, 0, 4], spine: [-12, -6, 2], neck: [6, -4, 0], head: [8, -10, 0],
                       shoulderL: [125, 55, -40], elbowL: 80, handL: .1, wristL: [-20, 0], shoulderR: [50, 14, 0], elbowR: 45, handR: .8,
                       hipL: [10, 6, 0], kneeL: 10, hipR: [-20, 6, 0], kneeR: 20, ankleR: [-10, 0] } }
    } };
}

const base = opt.replace(/^final/, '') || 'A';
const o = OPTIONS[(process.argv[4] || base || 'A')] || OPTIONS[opt] || OPTIONS.A;
if (o.gate) { GATE = o.gate.pos; GATE_R = o.gate.r; if (o.gate.pods) [POD_L, POD_R] = o.gate.pods; }
const scene = {
  _comment: 'Millennial Fair v6 master scene, option ' + opt + '. Generated by build_scene.js; world metres.',
  camera: Object.assign({ width: 2400, height: 1600 }, o.camera),
  // the sun stays at the same place relative to the view (from the left, a little beyond the scene) for every option
  sun: { azimuth: -104 + (o.camera.yaw || 0), elevation: 19, color: '#ffcf96', intensity: 3.4, softness: 1.0, samples: 6, shadowMapSize: 4096 },
  sky: { color: '#b8c4d4', zenith: '#4a72b4', horizon: '#e8cca0', curve: .3, sunGlow: '#ffd8a0', ambientSky: '#c8c4cc', ambientGround: '#c89a6a', intensity: 0.85 },
  ground: { color: '#d4b892', texture: 'paving', tile: 3.2 },
  exposure: 1.0,
  lights: [
    { position: [GATE[0], GATE[1], GATE[2] + .35], color: '#8a78ff', intensity: o.gateLight || 30, shadows: true, shadowMapSize: 2048 },
    { position: [GATE[0], DECK + 1.0, GATE[2] + 2.2], color: '#7a8cff', intensity: o.gateFill === undefined ? 10 : o.gateFill },
    ...(o.extraLights || [])
  ],
  props: setProps(o),
  figures: [...heroes(o), ...fairgoers(o)].map(f => {
    const ov = o.over && o.over[f.name];
    if (ov) { if (ov.pose) f.pose = Object.assign({}, typeof f.pose === 'string' ? { base: f.pose } : f.pose, ov.pose); for (const k in ov) if (k !== 'pose') f[k] = ov[k]; }
    return f;
  }).filter(f => !(o.drop || []).includes(f.name)),
  passes: ['lit']
};
fs.writeFileSync(out, JSON.stringify(scene, null, 1));
console.log('wrote', out, scene.figures.length, 'figures', scene.props.length, 'props');
