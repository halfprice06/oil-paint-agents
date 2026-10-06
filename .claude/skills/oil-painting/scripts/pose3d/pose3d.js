#!/usr/bin/env node
// pose3d: render a lit 3D reference of posed human mannequins (three.js in headless Chromium).
//   node pose3d.js scene.json out.png [--passes lit,value,notan,flat,id,parts] [--crop x,y,w,h] [--scale 2] [--ss 2]
//                                      [--crops-only] [--no-crops] [--info]
//   node pose3d.js --poses              list the named poses
// Outputs: out.png (lit), out_<pass>.png for other passes, out_<crop>_<pass>.png for crops listed in scene.crops,
//          out.json (camera + screen-space joints/boxes of the named figures).
// Reference only: LOOK at these images while painting. Never sample their pixels.
const fs = require('fs');
const path = require('path');
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const HERE = __dirname;
const LIBS = ['vendor/three.min.js', 'lib/geom.js', 'lib/poses.js', 'lib/mannequin.js', 'lib/set.js', 'lib/scene.js'].map(f => path.join(HERE, f));

function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (['crops-only', 'no-crops', 'info', 'poses', 'help'].includes(k)) o[k] = true;
      else o[k] = argv[++i];
    } else o._.push(a);
  }
  return o;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.poses) {
    global.window = {};
    eval(fs.readFileSync(path.join(HERE, 'lib/poses.js'), 'utf8'));
    console.log(window.P3POSES.names.join('\n'));
    return;
  }
  if (args.help || args._.length < 2) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 8).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(args.help ? 0 : 1);
  }
  const scenePath = path.resolve(args._[0]);
  const outPath = path.resolve(args._[1]);
  const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
  const opts = {};
  if (args.passes) opts.passes = args.passes.split(',').map(s => s.trim());
  if (args.crop) { const [x, y, w, h] = args.crop.split(',').map(Number); opts.crop = { name: '', x, y, w, h, scale: Number(args.scale || 1) }; }
  else if (args.scale) opts.scale = Number(args.scale);
  if (args.ss) opts.ss = Number(args.ss);
  if (args['crops-only']) opts.cropsOnly = true;
  if (args['no-crops']) opts.noCrops = true;

  const t0 = Date.now();
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
    const logs = [];
    page.on('console', m => { const t = m.text(); if (!/deprecated with r150/.test(t)) logs.push(t); });
    page.on('pageerror', e => logs.push('pageerror: ' + e.message));
    await page.setContent('<!doctype html><html><body></body></html>');
    for (const f of LIBS) await page.addScriptTag({ path: f });
    let res;
    try {
      res = await page.evaluate(async ({ scene, opts }) => {
        try { return await window.P3RENDER(scene, opts); } catch (e) { return { error: e.message + '\n' + e.stack }; }
      }, { scene, opts });
    } catch (e) { console.error(logs.join('\n')); throw e; }
    if (res.error) { console.error(logs.join('\n')); throw new Error(res.error); }
    if (logs.length && args.info) console.log(logs.join('\n'));
    const base = outPath.replace(/\.png$/i, '');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const written = [];
    for (const [name, url] of Object.entries(res.images)) {
      const fn = name === 'lit' ? outPath : base + '_' + name + '.png';
      fs.writeFileSync(fn, Buffer.from(url.split(',')[1], 'base64'));
      written.push(fn);
    }
    fs.writeFileSync(base + '.json', JSON.stringify(res.info, null, 1));
    written.push(base + '.json');
    console.log(`pose3d: ${res.info.counts.figures} figures, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    written.forEach(w => console.log('  ' + w));
  } finally {
    await browser.close();
  }
}
main().catch(e => { console.error(e.stack || e.message); process.exit(1); });
