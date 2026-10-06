#!/bin/bash
# usage: grid.sh src.png x y w h scale step out.png   (crop in canvas pixels; draws a labelled coordinate grid for placing strokes)
SRC=$1; X=$2; Y=$3; W=$4; H=$5; S=$6; ST=$7; OUT=$8
DRAW=""
for ((gx=(X/ST+1)*ST; gx<X+W; gx+=ST)); do px=$(( (gx-X)*S )); DRAW="$DRAW line $px,0 $px,$((H*S))"; done
for ((gy=(Y/ST+1)*ST; gy<Y+H; gy+=ST)); do py=$(( (gy-Y)*S )); DRAW="$DRAW line 0,$py $((W*S)),$py"; done
LBL=""
for ((gx=(X/ST+1)*ST; gx<X+W; gx+=ST)); do px=$(( (gx-X)*S+2 )); LBL="$LBL text $px,12 '$gx'"; done
for ((gy=(Y/ST+1)*ST; gy<Y+H; gy+=ST)); do py=$(( (gy-Y)*S-2 )); LBL="$LBL text 2,$py '$gy'"; done
convert "$SRC" -crop ${W}x${H}+${X}+${Y} +repage -filter point -resize $((W*S))x$((H*S)) \
  -stroke 'rgba(0,255,255,0.45)' -strokewidth 1 -draw "$DRAW" \
  -stroke none -fill yellow -pointsize 11 -draw "$LBL" "$OUT"
