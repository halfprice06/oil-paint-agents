#!/bin/sh
# Merge the four painters' built passes into this folder, in layer order:
# 00 block-in, 1x sky, 2x cloud sea, 3x island, 4x palace, 5x Epoch.
cd "$(dirname "$0")"
rm -f [1-5][0-9]_*.js
for a in sky clouds island palace; do cp work/$a/[1-5][0-9]_*.js . 2>/dev/null; done
passes=$(ls 00_under.js [1-5][0-9]_*.js 2>/dev/null | sort | sed 's/.*/"&"/' | paste -sd, -)
node -e "const fs=require('fs');const c=JSON.parse(fs.readFileSync('painting.json'));c.passes=[$passes];fs.writeFileSync('painting.json',JSON.stringify(c,null,1)+'\n');console.log(c.passes.join(' '));"
