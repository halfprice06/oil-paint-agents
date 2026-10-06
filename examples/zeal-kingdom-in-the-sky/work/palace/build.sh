#!/bin/sh
# Builds each src/NN_name.body.js into NN_name.js with lib.js prepended (shared helpers).
cd "$(dirname "$0")"
for b in src/*.body.js; do
  [ -e "$b" ] || continue
  out=$(basename "$b" .body.js).js
  { cat lib.js; echo; echo "// ---- $(basename "$b") ----"; cat "$b"; } > "$out"
done
