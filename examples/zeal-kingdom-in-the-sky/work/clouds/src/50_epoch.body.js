// 50: the Epoch (round 2, about 480 px wide): a streamlined cream-gold teardrop hull painted as a cylinder (light, halftone, core shadow, warm reflected light from the clouds), a bubble canopy of dark blue-grey glass with the sky reflected and one glint, swept-back wings with thickness (lit gold top, dark leading edge, cool underside on the banked near wing), a tail fin, the canopy's cast shadow on the hull. Nose right, lit from the upper left.
p.dry();p.wipe();
const EP={
 gold:()=>M([['cadmium_yellow',.8],['yellow_ochre',.7],['titanium_white',1],['naples_yellow',.35],['raw_umber',.05]],.2),
 goldHi:()=>M([['cadmium_yellow',.7],['naples_yellow',.7],['titanium_white',1.6]],.15),
 goldHalf:()=>M([['yellow_ochre',1],['cadmium_yellow',.25],['titanium_white',.5],['raw_umber',.18],['cobalt_violet',.08]],.2),
 goldS:()=>M([['yellow_ochre',1],['raw_umber',.45],['cobalt_violet',.3],['ultramarine',.15],['titanium_white',.4]],.2),
 edgeD:()=>M([['raw_umber',1],['yellow_ochre',.4],['ultramarine',.3],['titanium_white',.15]],.15),
 under:()=>M([['titanium_white',1.2],['cobalt_violet',.5],['ultramarine',.35],['raw_umber',.25],['yellow_ochre',.15]],.2),
 hullHi:()=>M([['titanium_white',3.2],['naples_yellow',.5]],.1),
 hull:()=>M([['titanium_white',2.6],['naples_yellow',.6],['yellow_ochre',.12]],.15),
 hullHalf:()=>M([['titanium_white',1.3],['naples_yellow',.6],['yellow_ochre',.5],['cobalt_violet',.15],['raw_umber',.06]],.2),
 hullS:()=>M([['yellow_ochre',.45],['raw_umber',.4],['ultramarine',.42],['cobalt_violet',.3],['titanium_white',.45]],.2),
 hullRefl:()=>M([['titanium_white',1.1],['cobalt_violet',.4],['naples_yellow',.35],['cadmium_orange',.04],['ultramarine',.15]],.2),
 glass:()=>M([['ultramarine',1],['paynes_grey',.8],['titanium_white',.3]],.15),
 glassD:()=>M([['paynes_grey',1],['ultramarine',.6],['burnt_umber',.25],['titanium_white',.1]],.15),
 glassRefl:()=>M([['titanium_white',1.1],['ultramarine',.45],['paynes_grey',.3],['naples_yellow',.12],['cobalt_violet',.15]],.2),
 glassSky:()=>M([['titanium_white',1.6],['cobalt_violet',.25],['naples_yellow',.2],['ultramarine',.25]],.2),
 glint:()=>M([['titanium_white',2.5],['cerulean',.2]],.1),
};
// strokes along a plane given by its root edge (a->b) and tip edge (c->d)
function plane(a,b,c,d,n,col,size,o,t0r,t1r){o=o||{};t0r=t0r||[0,.12];t1r=t1r||[.86,1];
 for(let i=0;i<n;i++){const u=clamp((i+R(.15,.85))/n,0,1);const s=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],e=[lerp(c[0],d[0],u),lerp(c[1],d[1],u)];
  const t0=R(t0r[0],t0r[1]),t1=R(t1r[0],t1r[1]);const m=R(.4,.6);
  const pts=[[lerp(s[0],e[0],t0),lerp(s[1],e[1],t0),.7],[lerp(s[0],e[0],m)+R(-2,2),lerp(s[1],e[1],m)+R(-2,2),.95],[lerp(s[0],e[0],t1),lerp(s[1],e[1],t1),.6]];
  F(pts,col(),size*R(.85,1.15),Object.assign({load:1.05,thin:.35,edge:.15,taper:[.12,.2]},o));}}
// ---- far wing (raised toward the sun): lit gold top, lighter near the root, dark leading edge, tip lost in the cloud
plane([505,1174],[600,1167],[268,1088],[296,1079],8,EP.gold,20,{stir:.4});
plane([540,1171],[598,1167],[312,1084],[330,1081],4,EP.goldHi,12,{load:1.2,stir:.4});
plane([505,1174],[528,1172],[270,1088],[282,1086],2,EP.goldHalf,9,{thin:.45});
plane([594,1167],[602,1166],[292,1078],[300,1077],3,EP.edgeD,6,{thin:.5,load:.9});
BL([[268,1090],[300,1082],[340,1090]],28,.55);BL([[262,1082],[290,1092]],22,.5);
// ---- tail fin: lit left face, shadow right face, a bright leading edge
plane([386,1203],[416,1200],[404,1122],[418,1120],5,EP.hull,12,{stir:.6,load:1.15,clean:true});
plane([416,1200],[440,1197],[418,1120],[432,1118],3,EP.goldS,9,{thin:.45});
F([[404,1124,.6],[394,1165,.9],[387,1200,.5]],EP.hullHi(),4,{load:1.2,thin:.3,taper:[.1,.3],clean:true});
// ---- hull as a cylinder: strokes run along the pod; bands from the top (light) to the bottom (core shadow, then reflected light)
const top=[[360,1200],[420,1160],[500,1148],[580,1143],[660,1155],[700,1170],[740,1190]];
const bot=[[360,1210],[440,1238],[540,1244],[620,1236],[700,1212],[740,1190]];
const atT=(A,u)=>{const k=Math.min(A.length-2,Math.floor(u*(A.length-1))),f=u*(A.length-1)-k;return [lerp(A[k][0],A[k+1][0],f),lerp(A[k][1],A[k+1][1],f)];};
const along=(t,n,col,size,o)=>{for(let i=0;i<n;i++){const u0=R(0,.55),u1=Math.min(1,u0+R(.3,.5));const pts=[];for(let j=0;j<4;j++){const u=lerp(u0,u1,j/3);const a=atT(top,u),b=atT(bot,u);const w=t+R(-.05,.05);pts.push([lerp(a[0],b[0],w),lerp(a[1],b[1],w),pr(j,4)]);}F(pts,col(),size,o);}};
along(.75,10,EP.hullS,15,{load:.9,thin:.5,edge:.3,taper:[.15,.25],stir:.7});
along(.62,6,EP.hullS,10,{load:.85,thin:.55,edge:.4,taper:[.15,.25],stir:.7});
along(.93,5,EP.hullRefl,7,{load:.95,thin:.45,edge:.4,taper:[.2,.3],stir:.5});
along(.48,7,EP.hullHalf,13,{load:1,thin:.4,edge:.3,taper:[.15,.25],stir:.6});
along(.26,9,EP.hull,15,{load:1.25,thin:.3,edge:.15,taper:[.1,.2],stir:.6,clean:true});
along(.1,5,EP.hullHi,8,{load:1.3,thin:.25,edge:.1,taper:[.1,.2],clean:true});
// the nose: converging strokes to a point
F([[640,1152,.5],[700,1170,.9],[740,1190,.4]],EP.hull(),11,{load:1.2,thin:.3,taper:[.1,.3],clean:true});
F([[650,1230,.5],[700,1212,.9],[740,1191,.4]],EP.hullS(),9,{load:.9,thin:.5,taper:[.1,.3]});
F([[690,1178,.5],[720,1186,.9],[740,1190,.3]],EP.hullHalf(),7,{load:1,thin:.4,taper:[.1,.4]});
// melt the turns: light into halftone, halftone into core shadow (soft brush along the length)
BL([[400,1190],[520,1192],[660,1186]],16,.45);BL([[420,1215],[540,1222],[660,1212]],16,.45);
// ---- canopy cast shadow on the hull and the seam at its base
F([[452,1184,.5],[530,1189,.9],[612,1184,.6],[648,1194,.3]],EP.hullS(),9,{load:.85,thin:.55,edge:.4,taper:[.15,.3]});
F([[470,1194,.5],[560,1198,.8],[640,1198,.3]],EP.hullHalf(),6,{load:.85,thin:.5,edge:.4,taper:[.2,.3]});
// ---- canopy bubble: solid dark glass, the sky reflected in a pale band on the upper left, darkest lower right, one glint
const dome=[];for(let i=0;i<=12;i++){const a=lerp(-Math.PI,0,i/12);dome.push([528+Math.cos(a)*84,1181+Math.sin(a)*62]);}

const darc=(a0,a1,rr,col,size,o)=>{const n=5,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));pts.push([528+Math.cos(a)*84*rr,1181+Math.sin(a)*62*rr,pr(i,n)]);}F(pts,col(),size,o);};
for(let i=0;i<16;i++)darc(R(-3.1,-2.4),R(-.6,0),R(.15,1.0),EP.glass,R(12,18),{load:1,thin:.45,edge:.2,taper:[.1,.15],stir:.85});
for(let i=0;i<6;i++)darc(R(-1.0,-.6),R(-.2,.0),R(.55,1),EP.glassD,R(12,18),{load:.95,thin:.45,edge:.25,taper:[.15,.2],stir:.8});
for(let i=0;i<4;i++)darc(R(-2.9,-2.6),R(-2.0,-1.7),R(.6,.95),EP.glassRefl,R(10,15),{load:1,thin:.4,edge:.25,taper:[.15,.25],stir:.6});
for(let i=0;i<3;i++)darc(R(-2.7,-2.5),R(-1.9,-1.7),R(.78,.95),EP.glassSky,R(7,10),{load:1.05,thin:.4,edge:.3,taper:[.2,.3],stir:.6});
darc(-2.2,-.9,.35,EP.glass,14,{load:.9,thin:.45,edge:.3});
BL([[455,1178],[500,1135],[560,1125],[608,1176]],16,.45);BL([[470,1170],[528,1140],[590,1165]],14,.4);
F([[446,1182,.4],[500,1185,.7],[560,1185,.7],[612,1181,.4]],EP.glassD(),5,{load:.75,thin:.6,taper:[.2,.3]});
p.stroke({points:[[476,1150,.5],[486,1142,.9],[498,1138,.4]],color:EP.glint(),brush:'round',size:6,load:1.3,taper:[.2,.4],clean:true});
p.dab({x:484,y:1144,color:EP.glint(),size:5,brush:'round',load:1.3});
// ---- near wing (banked down): upper surface in half-light, a cool underside strip along the trailing edge, dark leading edge; root over the hull's lower side
plane([520,1222],[612,1214],[380,1344],[420,1350],8,EP.goldHalf,19,{thin:.42,stir:.45});
plane([556,1218],[612,1214],[470,1280],[500,1284],3,EP.gold,12,{thin:.4,stir:.45,load:1.1});
plane([520,1222],[546,1221],[380,1344],[398,1346],4,EP.under,11,{thin:.45,stir:.5});
plane([596,1214],[612,1214],[416,1349],[426,1350],3,EP.edgeD,6,{thin:.5,load:.9});
BL([[380,1348],[400,1340]],18,.4);
// ---- highlights: knife on the far wing's leading edge (left of the canopy only), the hull's top ridge, a bright touch on the nose
p.stroke({points:[[432,1118,.6],[380,1104,.9],[320,1086,.4]],color:EP.goldHi(),brush:'knife',size:6,load:1.25,taper:[.1,.4],clean:true});
p.stroke({points:[[395,1186,.5],[420,1172,.9],[444,1166,.4]],color:EP.hullHi(),brush:'knife',size:5,load:1.2,taper:[.1,.4],clean:true});
p.stroke({points:[[616,1150,.5],[670,1158,.9],[716,1176,.3]],color:EP.hullHi(),brush:'knife',size:5,load:1.2,taper:[.2,.4],clean:true});
