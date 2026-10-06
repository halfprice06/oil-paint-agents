// 36_rock_glaze: transparent glazes over the dry rock to deepen the shadow core and unify the lit face; scumbled broken light on the half-tone planes; a few knife lights. Then dry.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const Gl=[['ultramarine',1],['dioxazine_purple',.6],['burnt_umber',.3]];
const Gw=[['burnt_sienna',.6],['yellow_ochre',.5],['raw_umber',.3]];
const Scl=[['titanium_white',2],['cobalt_violet',.5],['ultramarine',.3],['naples_yellow',.2]];
const Ahot=[['naples_yellow',1],['titanium_white',2.6],['yellow_ochre',.5],['cadmium_orange',.08]];
// deepen the shadow core (B lower, D core): one thin transparent layer, long strokes, little overlap
const FBlow=[[1250,1000],[1500,1010],[1480,1180],[1400,1250],[1320,1290],[1255,1200],[1200,1100]];
cover(FBlow,54,()=>M(Gl,.15),{dens:.7,len:4,ang:1.45,angJ:.2,o:{load:.9,thin:.6,opacity:R(.1,.16),edge:.7,taper:[.3,.3],stir:.9}});
const FDcore=[[1740,930],[1980,920],[1960,1000],[1870,1060],[1810,1110],[1700,1150],[1700,1000]];
cover(FDcore,54,()=>M(Gl,.15),{dens:.7,len:4,ang:1.75,angJ:.2,o:{load:.9,thin:.6,opacity:R(.22,.32),edge:.7,taper:[.3,.3],stir:.9}});
// under the lip: a thin dark glaze band (the turf's shadow on the rock)
for(let x=1210;x<2140;x+=R(60,90)){const y=x<1500?836:x<1800?lerp(838,822,(x-1500)/300):lerp(822,790,(x-1800)/340);S(x,y+14,R(60,100),Math.atan2(x<1500?.02:-.08,1),M(Gl,.15),R(16,24),{load:.8,thin:.6,opacity:R(.16,.26),edge:.6,taper:[.3,.3],stir:.9});}
// (warm glaze over A muddied the lit face and covered the small fall; removed)
p.dry();
// (scumbles and knife lights tried here read as confetti and sticks; removed)
