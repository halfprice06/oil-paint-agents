#!/bin/sh
# Builds each src/NN_name.body.js into NN_name.js with lib.js (and src/clouds_lib.inc.js, the cloud helpers) prepended.
cd "$(dirname "$0")"
for b in src/*.body.js; do
  [ -e "$b" ] || continue
  out=$(basename "$b" .body.js).js
  { cat lib.js; echo; [ -e src/clouds_lib.inc.js ] && cat src/clouds_lib.inc.js; echo; echo "// ---- $(basename "$b") ----"; cat "$b"; } > "$out"
done
