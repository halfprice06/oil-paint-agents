#!/usr/bin/env node
// Render a thumbnail/value study you drew as SVG to PNG so you can look at it:
//   node sketch.js study.svg [out.png]
// Uses the preinstalled Chromium via Playwright (global npm). This is for the painter's eyes only:
// the painting itself is still made only from brushstrokes.
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'));
(async () => {
  const src = path.resolve(process.argv[2]), out = process.argv[3] || src.replace(/\.svg$/i, '') + '.png';
  const svg = fs.readFileSync(src, 'utf8');
  const m = svg.match(/<svg[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/) || [0, 800, 600];
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: +m[1], height: +m[2] } });
  await pg.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await pg.screenshot({ path: out }); await b.close(); console.log('wrote', out);
})();
