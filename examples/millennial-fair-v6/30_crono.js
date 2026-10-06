// 30_crono: hero pass (engine v6), full 2400x1600 canvas coordinates. Built from heroes-dev/src2 by build2.sh.
(function(){const OX=0,OY=0,SEED=3011;
// ===== heroes lib (engine v6). All coordinates are full 2400x1600 canvas coordinates. =====
// OX/OY (set by build.sh) shift everything for the small test windows; they are 0 in the delivered passes.
const PI=Math.PI,TAU=2*PI;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
// own seeded RNG, so the strokes are identical in the test window and in the full painting
let _rs=SEED>>>0;
function rnd(){_rs|=0;_rs=_rs+0x6D2B79F5|0;let t=Math.imul(_rs^_rs>>>15,1|_rs);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const R=(a,b)=>a+(b-a)*rnd();
const pick=a=>a[Math.floor(rnd()*a.length)];
let NSTROKE=0;
// XF: an optional pose warp (x,y)->[x,y] applied to every stroke, e.g. to bend a figure at the waist
let XF=null;
const P={
  stroke(o){NSTROKE++;if(XF){o=Object.assign({},o);o.points=o.points.map(q=>{const r=XF(q[0],q[1]);return q.length>2?[r[0],r[1],q[2]]:r;});}if(typeof CULL!=='undefined'&&CULL){const m=(o.size||20)+4;if(o.points.every(q=>q[0]<OX-m||q[1]<OY-m||q[0]>OX+CULL[0]+m||q[1]>OY+CULL[1]+m))return;}o=Object.assign({},o);o.points=o.points.map(q=>q.length>2&&q[2]!==undefined?[q[0]-OX,q[1]-OY,q[2]]:[q[0]-OX,q[1]-OY]);return p.stroke(o);},
  dry(){p.dry();},wipe(){p.wipe();}
};
// jitter a palette mix a little (remixing on the palette from stroke to stroke)
const J=(m,k)=>{k=k===undefined?.12:k;return m.map(([n,w])=>[n,w*R(1-k,1+k)]);};
const isMix=c=>Array.isArray(c)&&Array.isArray(c[0]);
// blend two palette mixes (t=0 -> a, 1 -> b)
function MX(a,b,t){const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]).filter(q=>q[1]>1e-4);}
// Catmull-Rom through control points -> n points (pressure interpolated if present)
function cr(c,n){if(c.length<2)return c.slice();const out=[];const N=c.length-1;
  for(let i=0;i<n;i++){const t=i/(n-1)*N;const k=Math.min(N-1,Math.floor(t));const u=t-k;
    const p0=c[Math.max(0,k-1)],p1=c[k],p2=c[k+1],p3=c[Math.min(N,k+2)];
    const f=(a,b,cc,d)=>0.5*((2*b)+(-a+cc)*u+(2*a-5*b+4*cc-d)*u*u+(-a+3*b-3*cc+d)*u*u*u);
    const q=[f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])];
    if(p1[2]!==undefined&&p2[2]!==undefined)q.push(lerp(p1[2],p2[2],u));out.push(q);}return out;}
const plen=c=>{let s=0;for(let i=1;i<c.length;i++)s+=Math.hypot(c[i][0]-c[i-1][0],c[i][1]-c[i-1][1]);return s;};
// a stroke along control points; smoothed; o: engine options
function S(c,col,size,o){o=o||{};let pts=c;if(c.length>=3&&!o.raw){const n=clamp(Math.round(plen(c)/Math.max(2,size*.6))+2,3,14);pts=cr(c,Math.max(n,c.length));}
  const oo=Object.assign({points:pts,color:isMix(col)?J(col,o.jit):col,size:size,brush:'filbert',load:1,stir:.6},o);delete oo.jit;delete oo.raw;
  return P.stroke(oo);}
// short touch from (x,y) length len at angle a (deg), slight bend
function T(x,y,a,len,col,size,o){a=a*PI/180;const b=(o&&o.bend!==undefined)?o.bend:R(-.12,.12)*len;const ca=Math.cos(a),sa=Math.sin(a);
  const pts=[-.5,0,.5].map((t,i)=>[x+ca*len*t-sa*b*(i===1?1:0),y+sa*len*t+ca*b*(i===1?1:0)]);const oo=Object.assign({},o||{});delete oo.bend;return S(pts,col,size,Object.assign({raw:true},oo));}
// soft badger blender along a path
function SB(c,size,op,o){const pts=c.length>=3?cr(c,clamp(Math.round(plen(c)/Math.max(3,size*.5))+2,3,12)):c;
  return P.stroke(Object.assign({points:pts,brush:'soft',size:size,opacity:op===undefined?.5:op,load:0,color:'titanium_white'},o||{}));}
// bristle blender (clean dry brush that drags wet paint)
function BL(c,size,o){return S(c,'titanium_white',size,Object.assign({load:0},o||{}));}
// ---- geometry ----
const inPoly=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const bbox=poly=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of poly){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1]);}return [x0,y0,x1,y1];};
const area=poly=>{let a=0;for(let i=0;i<poly.length;i++){const q=poly[i],r=poly[(i+1)%poly.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
function dEdge(poly,x,y){let m=1e9;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];const dx=b[0]-a[0],dy=b[1]-a[1];const L2=dx*dx+dy*dy||1;const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/L2,0,1);const d=Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t));if(d<m)m=d;}return m;}
// closed smooth outline from control points
function sm(c,k){k=k||4;const out=[];const n=c.length;for(let i=0;i<n;i++){const p0=c[(i-1+n)%n],p1=c[i],p2=c[(i+1)%n],p3=c[(i+2)%n];
  for(let j=0;j<k;j++){const u=j/k;const f=(a,b,cc,d)=>0.5*((2*b)+(-a+cc)*u+(2*a-5*b+4*cc-d)*u*u+(-a+3*b-3*cc+d)*u*u*u);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}return out;}
// direction fields
const deg=d=>d*PI/180;
function alongF(spine){return (x,y)=>{let best=1e9,ang=0;for(let i=0;i<spine.length-1;i++){const a=spine[i],b=spine[i+1];const dx=b[0]-a[0],dy=b[1]-a[1];const L2=dx*dx+dy*dy||1;const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/L2,0,1);const d=Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t));if(d<best){best=d;ang=Math.atan2(dy,dx);}}return ang;};}
// limb: spine points with half-widths [x,y,wl,wr]; returns point at across-fraction f (-1 = left edge, +1 = right edge) for each spine point
function offs(sp,f){const out=[];for(let i=0;i<sp.length;i++){const a=sp[Math.max(0,i-1)],b=sp[Math.min(sp.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;
  const nx=-dy,ny=dx;const w=f<0?sp[i][2]*f:sp[i][3]*f;out.push([sp[i][0]+nx*w,sp[i][1]+ny*w]);}return out;}
function band(sp,f0,f1){const a=offs(sp,f0),b=offs(sp,f1).reverse();return a.concat(b);}
function outline(sp){return band(sp,-1,1);}
// fill a polygon with overlapping strokes. o: size, len (x size), ang (deg or fn(x,y)->rad), angJ (deg), col (mix or fn(x,y)),
//   dens, over (how far strokes may poke out, x size), so (stroke options), curve
function fill(poly,o){o=o||{};const size=o.size||10,lenf=o.len||2.4,dens=o.dens||1;const [x0,y0,x1,y1]=bbox(poly);
  const ar=area(poly);const n=Math.max(1,Math.round(ar*dens*1.3/(size*size*lenf*.75)));const over=(o.over===undefined?.25:o.over)*size;
  const items=[];let g=0;
  // stratified sampling: grid cells of equal area, a jittered point per cell
  const cell=Math.sqrt(ar/n);
  for(let y=y0;y<y1;y+=cell)for(let x=x0;x<x1;x+=cell){const px=x+R(0,cell),py=y+R(0,cell);if(!inPoly(poly,px,py))continue;items.push([px,py]);}
  for(let i=items.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  if(o.order)items.sort(o.order);
  let k=0;
  for(const [x,y] of items){const a0=typeof o.ang==='function'?o.ang(x,y):deg(o.ang||0);const a=a0+deg(R(-1,1)*(o.angJ===undefined?12:o.angJ));
    const sz=size*R(.75,1.2);let L=sz*lenf*R(.65,1.35);const ca=Math.cos(a),sa=Math.sin(a);
    const ok=(t)=>{const qx=x+ca*t,qy=y+sa*t;return inPoly(poly,qx,qy)||dEdge(poly,qx,qy)<over;};
    let t0=-L/2,t1=L/2;while(t1>sz*.3&&!ok(t1))t1*=.8;while(t0<-sz*.3&&!ok(t0))t0*=.8;
    const bend=(o.curve===undefined?R(-.1,.1):o.curve*R(.6,1.2))*(t1-t0);
    const pts=[[x+ca*t0,y+sa*t0],[x+ca*(t0+t1)/2-sa*bend,y+sa*(t0+t1)/2+ca*bend],[x+ca*t1,y+sa*t1]];
    const col=typeof o.col==='function'?o.col(x,y):o.col;
    S(pts,col,sz,Object.assign({raw:true},o.so||{}));k++;}
  return k;}
// resample an open polyline to n points evenly by arc length
function rs(c,n){const L=[0];for(let i=1;i<c.length;i++)L.push(L[i-1]+Math.hypot(c[i][0]-c[i-1][0],c[i][1]-c[i-1][1]));const tot=L[L.length-1];const out=[];let k=0;
  for(let i=0;i<n;i++){const t=tot*i/(n-1);while(k<c.length-2&&L[k+1]<t)k++;const u=(t-L[k])/((L[k+1]-L[k])||1);out.push([lerp(c[k][0],c[k+1][0],u),lerp(c[k][1],c[k+1][1],u)]);}return out;}
// strip between two edge polylines A and B (same direction), across fractions f0..f1 (0 = A, 1 = B), along t0..t1
function strip(A,B,f0,f1,t0,t1,n){n=n||24;t0=t0||0;t1=t1===undefined?1:t1;const a=rs(A,n),b=rs(B,n);const s=[],e=[];
  for(let i=0;i<n;i++){const t=i/(n-1);if(t<t0-1e-9||t>t1+1e-9)continue;s.push([lerp(a[i][0],b[i][0],f0),lerp(a[i][1],b[i][1],f0)]);e.push([lerp(a[i][0],b[i][0],f1),lerp(a[i][1],b[i][1],f1)]);}
  return s.concat(e.reverse());}
// a polyline at across-fraction f between A and B
function mid(A,B,f,n){n=n||24;const a=rs(A,n),b=rs(B,n);return a.map((q,i)=>[lerp(q[0],b[i][0],f),lerp(q[1],b[i][1],f)]);}
// direction field along the centre line of A,B
const alongAB=(A,B)=>alongF(mid(A,B,.5,12));
// direction field across (wrapping) the form between A and B
const acrossAB=(A,B)=>{const f=alongAB(A,B);return (x,y)=>f(x,y)+PI/2;};
// part of a polyline between t0 and t1 (0..1 of its arc length)
function sub(c,t0,t1,n){n=n||24;const r=rs(c,n);const a=Math.max(0,Math.round(t0*(n-1))),b=Math.min(n-1,Math.round(t1*(n-1)));return r.slice(a,b+1);}
// a rounded form between edge A (lit side) and edge B (shadow side): opaque base, long strokes of light and shade
// along the form, the turning edge melted, reflected light / rim on the far edge. C: {base,lite,shad,refl} mixes
function limb(A,B,C,o){o=o||{};const w=o.w||12;const sp=mid(A,B,.5,16);const L=plen(sp);
  fill(strip(A,B,0,1),{size:w*.5,len:o.len||4,dens:2.1,ang:alongAB(A,B),angJ:5,col:C.base,over:.1,so:{thin:.5,edge:.12,stir:.8}});
  const k=Math.max(1,Math.round(L/(w*(o.seg||4.5))));
  for(let i=0;i<k;i++){const t0=Math.max(0,i/k-.04),t1=Math.min(1,(i+1)/k+.06);
    S(sub(mid(A,B,o.lf||.24,24),t0,t1),C.lite,w*(o.lw||.36),{thin:.25,load:1.2,edge:.3,stir:.8,jit:.06});
    S(sub(mid(A,B,o.sf||.76,24),t0,t1),C.shad,w*.32,{thin:.5,load:1,edge:.3,stir:.8,jit:.06});}
  SB(mid(A,B,o.tf||.52,12),w*.55,o.blend||.65);
  if(C.refl)S(mid(A,B,.92,14),C.refl,Math.max(1.4,w*.12),{thin:.4,edge:.35,taper:[.2,.3],load:.9});
}
// a mark that narrows to a point (a lock of hair, a flame, a finger tip): overlapping strokes of decreasing width
function point(c,col,w,o){const cc=c.length<3?c:cr(c,12);const segs=[[0,.48,1],[.32,.72,.68],[.56,.88,.42],[.76,1,.2]];
  for(const [a,b,k] of segs)S(sub(cc,a,b,20),col,Math.max(1,w*k),Object.assign({},o||{},{taper:[.05,b===1?.6:.25]}));}
// ---- crono_00_pal.js
// ================= CRONO: running in from the lower left toward Marle =================
// Sun from the left and a little behind him: his back, the back of his head, the top of the hair and the backs of the
// limbs are lit warm; the sides toward us are a grazing half-tone; his front (face, chest, shins) turns into shade,
// with cool violet light from the gate in front of him on the profile edges.
P.dry();P.wipe();
const SK={lite:[['titanium_white',3],['naples_yellow',.5],['vermilion',.08],['yellow_ochre',.12]],
  half:[['titanium_white',2],['yellow_ochre',.22],['venetian_red',.22],['raw_umber',.06]],
  shad:[['titanium_white',.9],['venetian_red',.35],['raw_umber',.25],['cobalt_violet',.2],['yellow_ochre',.1]],
  core:[['titanium_white',.4],['venetian_red',.35],['burnt_umber',.4],['cobalt_violet',.15]],
  cool:[['titanium_white',1.4],['venetian_red',.18],['cobalt_violet',.32],['raw_umber',.1]],
  rim:[['titanium_white',3],['cobalt_violet',.45],['quinacridone_rose',.08]],
  lip:[['titanium_white',1],['venetian_red',.5],['quinacridone_rose',.1],['raw_umber',.08]]};
const HR={lite:[['cadmium_orange',.4],['vermilion',.7],['titanium_white',.55],['naples_yellow',.25]],
  mid:[['cadmium_red',.75],['alizarin_crimson',.25],['vermilion',.15],['titanium_white',.12]],
  shad:[['alizarin_crimson',.5],['cadmium_red',.5],['burnt_sienna',.25],['cobalt_violet',.06],['titanium_white',.06]],
  dark:[['alizarin_crimson',.7],['burnt_umber',.25],['cadmium_red',.2],['dioxazine_purple',.05]],
  rim:[['titanium_white',2],['cobalt_violet',.4],['quinacridone_rose',.3]],
  glow:[['titanium_white',2],['naples_yellow',.6],['cadmium_orange',.35],['vermilion',.15]]};
const TU={lite:[['titanium_white',4],['cerulean',.3],['naples_yellow',.3]],half:[['titanium_white',2.5],['cerulean',.45],['cobalt_violet',.1],['paynes_grey',.05]],
  shad:[['titanium_white',.9],['cerulean',.35],['paynes_grey',.28],['cobalt_violet',.32]],core:[['titanium_white',.6],['paynes_grey',.45],['ultramarine',.15],['cobalt_violet',.2]],
  rim:[['titanium_white',3],['cobalt_violet',.45],['cerulean',.1]]};
const GR={half:[['sap_green',.5],['chromium_oxide',.4],['raw_umber',.12],['titanium_white',.3]],lite:[['sap_green',.35],['cadmium_yellow',.15],['titanium_white',.8],['chromium_oxide',.3],['naples_yellow',.15]],mid:[['sap_green',.5],['chromium_oxide',.4],['raw_umber',.12],['titanium_white',.3]],
  shad:[['sap_green',.45],['viridian',.12],['burnt_umber',.3],['cobalt_violet',.12],['titanium_white',.1]],core:[['sap_green',.3],['burnt_umber',.4],['ultramarine',.1],['titanium_white',.05]],rim:[['titanium_white',2],['cobalt_violet',.35],['chromium_oxide',.2]]};
const PA={lite:[['titanium_white',3],['yellow_ochre',.24],['naples_yellow',.12],['raw_umber',.13],['raw_sienna',.05],['cobalt_violet',.02]],half:[['titanium_white',1.6],['yellow_ochre',.35],['raw_umber',.25],['raw_sienna',.08],['cobalt_violet',.05]],
  shad:[['titanium_white',.8],['raw_umber',.4],['yellow_ochre',.2],['cobalt_violet',.3]],core:[['raw_umber',.5],['burnt_umber',.2],['cobalt_violet',.2],['titanium_white',.3]],
  rim:[['titanium_white',2.5],['cobalt_violet',.4],['naples_yellow',.1]]};
const BO={lite:[['burnt_sienna',.6],['yellow_ochre',.3],['titanium_white',.5]],mid:[['burnt_sienna',.6],['burnt_umber',.4],['titanium_white',.15]],
  shad:[['burnt_umber',.7],['ivory_black',.1],['cobalt_violet',.1],['titanium_white',.08]],hi:[['titanium_white',2],['naples_yellow',.4],['burnt_sienna',.2]]};
const ORG={lite:[['cadmium_orange',1],['titanium_white',.6],['naples_yellow',.3]],mid:[['cadmium_orange',.8],['vermilion',.2],['titanium_white',.15]],shad:[['cadmium_orange',.6],['burnt_sienna',.5],['cadmium_red',.1]]};
const BD={lite:[['titanium_white',4],['naples_yellow',.3]],half:[['titanium_white',3],['naples_yellow',.1],['cobalt_violet',.12],['raw_umber',.04]],shad:[['titanium_white',2],['cobalt_violet',.3],['paynes_grey',.1],['raw_umber',.05]]};
const BK={mid:[['ivory_black',.6],['burnt_umber',.3],['ultramarine',.1],['titanium_white',.06]],hi:[['titanium_white',2],['cobalt_violet',.2],['paynes_grey',.3]]};
const SKS={thin:.5,edge:.2,stir:.75,load:1},SKL={thin:.2,edge:.25,stir:.6,load:1.25},CLS={thin:.5,edge:.15,stir:.7,load:1},CLL={thin:.25,edge:.3,stir:.6,load:1.2};
// ---- crono_10_far.js
// ================= FAR SIDE: the reaching right arm and the kicked-back right leg (painted first, behind) =================
// generic form painter: an outline filled with the half-tone, then a lit band along the lit contour and a shadow band
// along the other, melted where they meet. A,B: the two contours, same direction.
const formDo=(A,B,C,o)=>{o=o||{};const al=alongAB(A,B);const w=o.w;
  const k=o.k||0;const H=MX(C.half||C.mid,C.shad,.15+k*.4),Sd=MX(C.shad,C.core||C.shad,.3+k*.3),L=MX(MX(C.lite,C.half||C.mid,.15),C.shad,k*.5);
  // the shadow side first on bare ground, then the half-tone, the light last and thickest; turns melted lightly
  fill(strip(A,B,.55,1),{size:w*.3,len:4,dens:2.3,ang:al,angJ:5,col:()=>J(Sd,.04),over:.1,so:{thin:.35,edge:.15,stir:.8}});
  fill(strip(A,B,.25,.6),{size:w*.3,len:4,dens:2.2,ang:al,angJ:5,col:()=>J(H,.04),over:.03,so:{thin:.4,edge:.2,stir:.8}});
  fill(strip(A,B,0,.3),{size:w*.3,len:4,dens:2.1,ang:al,angJ:5,col:()=>J(L,.04),over:.1,so:{thin:.25,edge:.2,stir:.75,load:1.2,clean:true}});
  SB(mid(A,B,.28,12),w*.3,.4);SB(mid(A,B,.57,12),w*.3,.35);
  if(C.rim&&o.rim!==false)S(mid(A,B,o.rf||.94,14),C.rim,Math.max(1.6,o.w*.09),{thin:.4,edge:.35,taper:[.2,.3],load:.9});};

// ---- right (far) leg: thigh back-down to the knee, shin kicked up behind, boot sole up ----
// thigh: lit along its back (upper-left) contour
const FT_A=[[470,1150],[452,1190],[436,1226],[422,1262],[414,1290]];
const FT_B=[[530,1160],[516,1200],[494,1240],[468,1278],[446,1300]];
formDo(FT_A,FT_B,PA,{k:.35,w:40,lf:.18,sf:.8,rim:false});
// pull folds from the hip to the bent knee, a crush of folds behind the knee
S([[504,1170],[480,1210],[456,1246]],PA.shad,3.6,{thin:.5,edge:.45,taper:[.2,.6]});S([[498,1168],[474,1206],[450,1240]],PA.lite,2.4,{thin:.3,load:1.1,taper:[.2,.6]});
S([[446,1284],[436,1270],[430,1256]],PA.core,3,{thin:.5,edge:.4,taper:[.2,.5]});
// shin, kicked back and up: its top (the calf, facing up-left) catches the sun; the shin underneath is in shade
const FS_A=[[420,1262],[396,1242],[372,1228],[352,1220],[336,1220]];
const FS_B=[[440,1300],[408,1286],[374,1266],[346,1252]];
formDo(FS_A,FS_B,PA,{k:.35,w:34,lf:.2,sf:.8,rim:false});
// boot: calf-high soft leather; the shaft round the calf, the foot bent at the ankle with the sole turned up and back
const BO2={lite:BO.lite,half:MX(BO.mid,BO.lite,.25),shad:BO.shad,core:[['burnt_umber',.6],['ivory_black',.25],['cobalt_violet',.1]]};
formDo([[356,1216],[334,1206],[312,1200],[292,1198]],[[360,1266],[338,1256],[314,1244],[294,1236]],BO2,{w:46,k:.25});   // the shaft
formDo([[296,1196],[276,1194],[256,1196],[236,1200],[226,1206]],[[298,1236],[278,1232],[258,1226],[240,1220],[230,1214]],BO2,{w:36,k:.3});   // the foot
S([[300,1192],[280,1190],[258,1192],[236,1196],[224,1203]],[['burnt_umber',.6],['ivory_black',.3],['raw_sienna',.15],['titanium_white',.12]],4,{thin:.4,taper:[.05,.3]});   // the sole, up and back
S([[302,1189],[280,1187],[258,1189]],MX(BO.lite,BO.hi,.3),1.6,{load:1.2,taper:[.2,.5],thin:.25,clean:true});                    // the sole's edge in the sun
S([[306,1196],[300,1212],[296,1226]],MX(BO.shad,BO.mid,.3),3.4,{edge:.5,thin:.45,taper:[.2,.3]});                             // the ankle's fold
T(312,1197,0,8,MX(BO.lite,BO.mid,.3),5,{edge:.4,load:1.1});                                                                    // the heel's round
S([[350,1214],[330,1206],[310,1201]],BO.hi,1.8,{load:1.3,taper:[.3,.6],thin:.2,clean:true});                                   // sheen along the shaft
S([[356,1216],[358,1240],[360,1264]],MX(BO.shad,PA.shad,.3),4,{thin:.5,edge:.4});                                             // boot top over the trouser
S([[226,1204],[224,1212],[230,1216]],MX(BO.mid,BO.lite,.3),3.4,{thin:.4,edge:.4});                                            // toe

// ---- right (far) arm: reaching forward toward Marle; green sleeve, the fist up ----
const RU_A=[[606,952],[628,984],[648,1014],[664,1040]];                  // upper arm, back (lit) edge on the left
const RU_B=[[630,946],[652,976],[674,1006],[690,1032]];
formDo(RU_A,RU_B,GR,{k:.2,w:24,lf:.2,sf:.8,rim:false});
const RF_A=[[664,1042],[686,1030],[708,1012],[726,996]];                 // forearm: upper-left (lit) contour
const RF_B=[[688,1050],[706,1036],[722,1020],[736,1006]];
formDo(RF_A,RF_B,GR,{k:.2,w:20,lf:.25,sf:.8,rim:false});
S([[668,1036],[680,1048]],GR.shad,6,{thin:.5,edge:.4});                                              // the elbow bend
S([[690,1028],[708,1014],[724,1000]],GR.rim,2,{taper:[.3,.4],load:.85});                              // gate light on the top of the forearm
// cuff of the sleeve at the wrist
S([[724,994],[732,1006]],MX(GR.mid,GR.lite,.3),5,{thin:.4,load:1.1});
// ---- crono_20_torso.js
// ================= TORSO: light-blue sleeveless tunic over the green shirt, black belt, orange ascot =================
// He leans into the run: the back is a long lit curve, the chest turns into shade toward the gate.
const TU_UP=[[574,944],[600,934],[628,940],[636,960],[630,986],[616,1014],[600,1040],[540,1046],[486,1040],[494,1008],[514,976],[544,954]];
// the torso as one form: the back (left) in the sun, the chest (right) turned to the gate in shade
formDo([[578,942],[548,954],[518,976],[498,1008],[488,1040]],[[604,936],[630,944],[634,968],[626,996],[612,1022],[600,1042]],TU,{w:50,rim:false});
fill(TU_UP,{size:6,len:5,dens:.5,ang:-60,angJ:8,col:()=>J(MX(TU.half,TU.shad,.2),.04),over:.02,so:{thin:.4,edge:.3,stir:.8}});   // a few strokes to tie the bands
S([[632,958],[630,984],[618,1012]],TU.rim,2.6,{taper:[.3,.4],load:.85});
// the cloth pulled across the chest by the reaching arm: two soft diagonal folds from the far shoulder
S([[620,960],[594,990],[566,1020]],TU.shad,4,{thin:.5,edge:.5,taper:[.2,.6],opacity:.8});
S([[614,956],[588,986],[560,1016]],MX(TU.lite,TU.half,.4),2.6,{thin:.3,load:1.1,taper:[.2,.6]});
// armhole: the near arm leaves the tunic at the shoulder
S([[566,950],[574,966],[576,986]],TU.core,3,{taper:[.2,.4],edge:.4,thin:.5});
// skirt of the tunic, flaring from the belt and swinging back with the run: a few big pleats, lit on the left
const TU_SK=[[486,1040],[540,1046],[600,1046],[594,1100],[584,1150],[578,1178],[540,1170],[490,1160],[430,1148],[446,1100],[466,1066]];
fill(TU_SK,{size:8,len:5,dens:2.2,ang:-84,angJ:5,col:(x,y)=>J(MX(TU.half,TU.shad,Math.max(0,Math.min(.7,(x-470)/180))),.04),over:.1,so:{thin:.4,edge:.2,stir:.8}});
const PLE=[[[484,1050],[468,1100],[446,1146]],[[514,1052],[504,1104],[494,1156]],[[548,1052],[546,1108],[542,1166]],[[580,1052],[584,1112],[578,1172]]];
PLE.forEach((c,i)=>{const lit=MX(TU.lite,TU.half,i*.18);S(c.map(q=>[q[0]-6,q[1]]),lit,12-i,{thin:.3,load:1.15,edge:.35,taper:[.1,.3]});
  S(c.map(q=>[q[0]+8,q[1]]),MX(TU.shad,TU.core,i*.12),5,{thin:.5,edge:.45,taper:[.2,.3]});});
SB([[470,1100],[520,1110],[580,1120]],12,.4);
// the hem: a wavy edge, lit where it turns up toward the sun, its underside dark
S([[432,1146],[462,1154],[492,1158],[522,1164],[552,1170],[578,1176]],MX(TU.lite,TU.half,.2),3,{load:1.1,thin:.3,taper:[.1,.2]});
S([[436,1152],[470,1160],[504,1164],[540,1172],[576,1180]],TU.core,2.4,{thin:.5,edge:.4,taper:[.1,.2]});
S([[596,1056],[592,1106],[584,1150]],TU.rim,2.4,{taper:[.3,.4],load:.85});
// black belt round the waist; a dull light on its upper edge, a brass buckle at the side
S([[486,1038],[520,1043],[560,1046],[600,1044]],BK.mid,9,{thin:.4,load:1.05,taper:[.05,.1],stir:.8});
S([[490,1035],[530,1039],[570,1041]],BK.hi,2,{load:1.1,taper:[.2,.4],thin:.3,opacity:.85});
S([[540,1040],[541,1050]],[['yellow_ochre',1],['raw_sienna',.2],['titanium_white',.3]],4,{taper:0,load:1.1});
T(539.5,1041,90,2,[['titanium_white',2],['naples_yellow',.5]],1.4,{load:1.3,clean:true});
// orange ascot at the throat: a bunched knot, the ends tucked into the tunic
const AS=[[612,940],[634,936],[644,950],[640,966],[628,976],[614,968],[608,954]];
fill(AS,{size:6,len:2.4,dens:2.4,ang:-70,angJ:20,col:()=>MX(ORG.mid,ORG.shad,R(0,.4)),over:.08,so:CLS});
S([[614,944],[624,940],[634,942]],ORG.lite,4,{load:1.2,thin:.3,taper:[.2,.3]});
S([[616,954],[624,950]],ORG.lite,3,{load:1.2,thin:.3});
S([[634,952],[640,962],[634,972]],ORG.shad,3.4,{thin:.5,edge:.35});
S([[622,962],[628,972]],MX(ORG.shad,[['burnt_umber',1]],.3),2,{thin:.5});
// ---- crono_30_near.js
// ================= NEAR SIDE: katana at the left hip, the planted left leg, the left arm swinging back =================
// ---- katana: a dark lacquered scabbard angled back and down, the wrapped hilt forward, his left hand steadying it ----
const KA=[[458,1102],[410,1144],[360,1188],[312,1232],[288,1254]];
S(KA,BK.mid,9,{thin:.3,load:1.15,taper:[.02,.06],stir:.9});
S(KA.map(q=>[q[0]+2,q[1]+2.4]),[['ivory_black',.7],['ultramarine',.12],['burnt_umber',.2]],4,{thin:.4,taper:[.05,.1]});      // the underside, darkest
S(KA.slice(0,4).map(q=>[q[0]-1.6,q[1]-2]),[['titanium_white',2.4],['naples_yellow',.4],['burnt_sienna',.15],['ivory_black',.1]],2.2,{load:1.3,taper:[.15,.5],thin:.2,clean:true});   // the sun along the lacquer
S([[430,1126],[400,1152]],[['titanium_white',4],['naples_yellow',.3]],1.3,{load:1.4,taper:[.3,.5],clean:true});                  // its brightest glint
S(KA.slice(1).map(q=>[q[0]+2.6,q[1]+3.2]),[['titanium_white',1.6],['cobalt_violet',.4],['ivory_black',.1]],1.2,{taper:[.3,.5],load:.85,opacity:.8});   // cool sky in the lower edge
S([[296,1248],[284,1260]],[['yellow_ochre',1],['burnt_umber',.4],['titanium_white',.2]],8,{taper:0,load:1.1});                   // the chape at the tip
T(292,1250,40,3,[['titanium_white',3],['naples_yellow',.5]],1.4,{load:1.4,clean:true});
S([[456,1102],[450,1108]],[['yellow_ochre',.8],['raw_sienna',.3],['titanium_white',.3]],9,{taper:0,load:1.1});                   // the throat fitting
S([[434,1124],[440,1130],[432,1138],[442,1146]],[['cobalt_violet',.5],['ultramarine',.3],['titanium_white',.6]],1.6,{taper:[.2,.3],load:.9});   // the cord knotted round it
S([[468,1092],[486,1080],[502,1070]],[['ivory_black',.5],['burnt_umber',.4],['ultramarine',.1],['titanium_white',.1]],6,{thin:.3,taper:[.05,.2]});   // hilt
for(let i=0;i<4;i++)T(472+i*8,1088-i*5.5,-34,3,[['titanium_white',1.5],['raw_umber',.4],['cobalt_violet',.2]],1.6,{load:.9});                         // the wrapping's diamonds
S([[462,1090],[458,1104]],[['yellow_ochre',.8],['raw_sienna',.3],['titanium_white',.3]],5,{taper:0,load:1.1});                                        // tsuba

// ---- left (near) leg, planted: thigh down to the forward knee, shin back down to the boot ----
const NT_A=[[476,1166],[500,1202],[522,1232],[548,1262]];       // back of the thigh (faces left, into the sun)
const NT_B=[[528,1158],[552,1188],[572,1218],[584,1244]];       // front of the thigh (faces the gate)
formDo(NT_A,NT_B,PA,{w:42,lf:.2,sf:.8,rim:false});
S([[580,1186],[586,1214],[588,1240]],PA.rim,2.4,{taper:[.3,.4],load:.85});
// the knee: the cap on the front contour, a crush of folds behind it
S([[574,1236],[584,1246],[584,1260]],MX(PA.half,PA.lite,.2),5,{thin:.3,load:1,edge:.6,opacity:.8});
S([[546,1258],[556,1270]],PA.core,3.4,{thin:.5,edge:.4,taper:[.2,.4]});T(578,1248,70,10,MX(PA.lite,PA.half,.3),6,{edge:.55,load:1.15});S([[588,1240],[590,1256]],PA.shad,3,{edge:.5,thin:.5});S([[540,1250],[552,1262]],PA.lite,2,{load:1.1,taper:[.2,.5]});
// pull folds from the hip over the thigh to the knee
S([[500,1168],[530,1196],[556,1230]],PA.shad,3.4,{thin:.5,edge:.45,taper:[.2,.6]});S([[494,1172],[524,1200],[550,1234]],PA.lite,2.4,{thin:.3,load:1.1,taper:[.2,.6]});
// shin: the calf (facing back into the sun) lit; the shin bone in the shade; gate light on the front edge
const NS_A=[[548,1262],[530,1282],[514,1304],[502,1330]];
const NS_B=[[584,1246],[574,1276],[556,1304],[536,1328]];
formDo(NS_A,NS_B,PA,{w:36,lf:.2,sf:.8,rim:false});
S([[582,1256],[572,1284],[554,1310]],PA.rim,2.2,{taper:[.3,.4],load:.85});
// boot: calf-high, folded over at the top; the foot pushing off, heel lifted, toe down on the plaza
const BO2n={lite:BO.lite,half:MX(BO.mid,BO.lite,.25),shad:BO.shad,core:[['burnt_umber',.6],['ivory_black',.25],['cobalt_violet',.1]]};
formDo([[504,1302],[498,1328],[490,1352],[480,1376]],[[548,1308],[540,1332],[528,1356],[516,1378]],BO2n,{w:42});
formDo([[480,1374],[468,1390],[456,1404],[448,1412]],[[518,1376],[504,1396],[490,1412],[478,1418]],BO2n,{w:36,k:.1});
S([[504,1300],[526,1302],[548,1306]],MX(BO.lite,BO.mid,.3),5,{load:1.1,thin:.3,taper:[.1,.2]});            // turned-over top
S([[506,1307],[528,1310],[546,1312]],BO.shad,2.4,{thin:.5,edge:.4});
S([[500,1316],[494,1340],[484,1364]],BO.hi,1.8,{load:1.3,taper:[.3,.5],thin:.2,clean:true});                // sheen down the shin of the boot
S([[518,1376],[508,1384],[498,1392]],MX(BO.shad,BO.core||BO.shad,.3),3,{edge:.5,thin:.45});                 // the ankle's crease
T(528,1366,60,5,MX(BO.mid,BO.shad,.2),4,{edge:.55});                                                       // the heel, lifted
S([[446,1414],[468,1420],[490,1416]],[['burnt_umber',.6],['ivory_black',.3],['titanium_white',.1]],3,{thin:.4});       // sole
S([[436,1420],[470,1424],[500,1420]],[['burnt_umber',.6],['ultramarine',.15],['alizarin_crimson',.1]],8,{thin:.8,opacity:.4,edge:.7,taper:[.3,.4]});   // his shadow on the plaza

// ---- left (near) arm swinging back: green sleeve, upper arm back to the elbow, forearm down to the fist ----
const LA_A=[[566,950],[530,956],[494,962],[458,968],[438,978]];         // top of the upper arm (lit)
const LA_B=[[576,980],[540,986],[504,992],[470,996],[452,1002]];
formDo(LA_A,LA_B,GR,{w:28,lf:.2,sf:.8,rim:false});
const LF_A=[[436,980],[440,1014],[446,1046],[454,1076]];                 // back of the forearm (lit)
const LF_B=[[462,996],[466,1026],[470,1054],[476,1078]];
formDo(LF_A,LF_B,GR,{w:24,lf:.2,sf:.8,rim:false});
// the elbow's point, the crease in the bend, folds of the sleeve
S([[436,976],[440,990]],MX(GR.lite,GR.mid,.3),7,{thin:.3,load:1.1,edge:.4});
S([[462,998],[470,1006]],GR.shad,4,{thin:.5,edge:.4});
S([[530,964],[508,972],[488,976]],GR.shad,2.6,{thin:.5,edge:.5,taper:[.2,.5]});S([[520,960],[498,966]],GR.lite,2,{thin:.3,load:1.1,taper:[.2,.5]});
S([[448,1030],[456,1040]],GR.shad,2.4,{thin:.5,edge:.5});
S([[452,1074],[478,1078]],MX(GR.mid,GR.lite,.3),5,{thin:.4,load:1.1});                                   // cuff
// ---- crono_40_head.js
// ================= HEAD: near profile facing right, lifted toward Marle =================
// Sun from the left and a little behind: it grazes the side of the face we see, strongest at the back (ear, the
// back of the cheek, the nape); the front of the face (brow, nose, lips, chin) turns away into a cool half-shadow,
// rimmed in violet by the gate he is running toward. Darker than the light plaza behind it.
const sk2=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.45,edge:.55,stir:.8,load:1},o||{}));
const sl=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.25,edge:.6,stir:.85,load:1.15,jit:.03},o||{}));
// ---- neck: the nape lit, the throat in shade under the jaw ----
const CNK=[[596,898],[612,906],[626,914],[634,920],[631,934],[628,948],[604,950],[594,940],[593,916]];
fill(CNK,{size:6,len:5,dens:2.4,ang:82,angJ:5,col:()=>J(MX(SK.half,SK.shad,.5),.04),over:.1,so:{thin:.4,edge:.3,stir:.8}});
sl([[599,904],[598,922],[599,944]],MX(SK.lite,SK.half,.35),5);                                  // the nape in the sun
sk2([[626,918],[630,932],[628,946]],MX(SK.shad,SK.cool,.4),6);                                  // the throat, turned away
sk2([[614,912],[622,926],[624,944]],MX(SK.half,SK.shad,.55),4,{taper:[.2,.4]});                // the long neck muscle
SB([[600,904],[612,924],[626,944]],7,.5);
S([[633,922],[630,938]],SK.rim,1.8,{taper:[.3,.3],load:.85,edge:.4});
sk2([[610,908],[622,915],[634,920]],MX(SK.shad,SK.core,.35),5,{taper:[.2,.3]});                  // shadow under the jaw on the neck

// ---- face: one block of half-tone, the grazing light at the back, the cool front ----
const CFACE=[[608,866],[656,866],[657,872],[655,877],[660,884],[666,890],[662,893],[660,895],[662,897],[657,900],[659,904],[656,908],[656,914],[650,920],[636,918],[622,912],[612,904],[606,890]];
fill(CFACE,{size:6,len:5,dens:2.4,ang:(x,y)=>deg(86+(x-630)*.3),angJ:4,col:(x,y)=>J(MX(SK.half,SK.shad,Math.max(0,Math.min(.55,(x-626)/40))),.04),over:.1,so:{thin:.4,edge:.3,stir:.8,load:1}});
// the light: down the back of the cheek and the temple, along the jaw's side; vertical, soft-sided
sl([[619,869],[619,884],[620,900]],SK.lite,5);
sl([[624,869],[625,884],[626,898]],MX(SK.lite,SK.half,.2),5.5);
sl([[634,882],[640,886]],MX(SK.lite,SK.half,.1),3.6);                                            // the cheekbone
sl([[620,904],[630,910]],MX(SK.lite,SK.half,.45),4);                                             // the jaw's side
SB([[616,868],[618,888],[620,906]],7,.45);SB([[628,868],[630,888],[630,908]],7,.5);
// the front: brow, eye socket, the cheek under the eye turning away, the mouth barrel, the chin
sk2([[648,868],[650,880],[652,892],[652,904],[650,914]],MX(SK.shad,SK.half,.45),5);
sk2([[654,869],[655,877],[659,885],[663,890]],MX(SK.shad,SK.cool,.4),3.6);
sk2([[656,896],[654,904],[654,912],[650,918]],MX(SK.shad,SK.cool,.35),4);
SB([[642,868],[645,888],[644,908]],6,.55);
for(let y=870;y<=912;y+=5)SB([[612+Math.max(0,y-900)*.5,y],[630,y+.5],[646,y]],6,.4);
// the jaw line: the underside of the jaw in shade, a crisp but not hard edge
sk2([[612,905],[624,913],[638,918],[650,920]],MX(SK.shad,SK.core,.25),3,{edge:.4});

// ---- features ----
// eye socket under the brow ridge, the eye set back in it: lids a small wedge, iris looking up at her
sk2([[640,875],[646,874],[652,876]],MX(SK.shad,SK.half,.25),4,{edge:.65});
S([[643,878.4],[647.5,877.4],[651.4,878.4]],[['burnt_umber',1],['ivory_black',.25],['alizarin_crimson',.1]],1.5,{taper:[.15,.35],load:.95});
T(649.4,879.6,80,1.8,[['burnt_umber',.6],['ultramarine',.25],['titanium_white',.2]],1.7,{load:.9});
S([[644.4,881.2],[649,881.6]],MX(SK.half,SK.lite,.3),1,{taper:[.3,.3]});
T(648.6,879,0,.5,[['titanium_white',4]],.8,{load:1.3,clean:true});
// brow: a strong ridge, red-brown hair pulled down in effort
S([[637,872.6],[646,870.8],[655,871.4]],[['burnt_sienna',.6],['alizarin_crimson',.2],['raw_umber',.25],['titanium_white',.25]],2,{taper:[.15,.5],load:.85,edge:.3});
// nose: the bridge's side catching a little light, the wing, the dark nostril, the shadow under it
sk2([[652,878],[656,884],[661,889]],MX(SK.half,SK.lite,.25),2.4,{thin:.3,edge:.4,load:1.1});
sk2([[656,890],[652,891.6]],MX(SK.shad,SK.core,.3),2.4,{edge:.45});
T(659.6,892.6,10,2,MX(SK.core,SK.shad,.2),1.4,{});
// mouth open in a shout: upper lip, the dark of the mouth, lower lip catching light from the plaza
S([[661,896.4],[656,897],[651,898.8]],MX(SK.lip,SK.shad,.3),2,{thin:.5,edge:.35,taper:[.2,.3]});
S([[659,899.8],[655,900.2],[652,900.4]],[['burnt_umber',.6],['alizarin_crimson',.35],['ivory_black',.1]],1.5,{taper:[.2,.5]});
S([[658,903],[653,903.4],[649.6,902.6]],MX(SK.lip,SK.half,.35),2,{thin:.4,edge:.35,taper:[.2,.3]});
sk2([[654,907.4],[649,908]],MX(SK.shad,SK.core,.2),1.8,{edge:.5});                                // under the lower lip
sk2([[648,896],[648,906]],MX(SK.half,SK.shad,.5),2.4,{edge:.65,opacity:.8});                       // the corner of the mouth, the cheek's fold
// ---- the ear: lit by the sun behind, its rim light, the bowl warm and dark ----
const CEAR=[[602,870],[610,867],[615,874],[615,886],[611,895],[604,894],[600,884]];
fill(CEAR,{size:3.2,len:3,dens:2.4,ang:85,angJ:6,col:()=>J(MX(SK.half,SK.lite,.4),.04),over:.05,so:{thin:.4,edge:.3,stir:.8}});
S([[603,870],[609,867.5],[614,872],[615,882],[612,892]],SK.lite,1.8,{taper:[.2,.3],load:1.2});
S([[608,875],[610,883],[607,889]],MX(SK.shad,SK.core,.4),2.2,{taper:[.2,.3]});T(609,880,90,5,MX(SK.shad,SK.half,.3),3,{edge:.5,opacity:.8});
T(605.4,893,90,2.4,MX(SK.half,[['vermilion',.3],['titanium_white',1]],.25),1.8,{});              // the lobe, blood-warm
S([[616,872],[617,880],[616,888]],MX(SK.shad,SK.half,.3),2.4,{edge:.55,opacity:.9});S([[600,872],[598,884],[601,894]],MX(SK.shad,SK.core,.3),2.4,{edge:.4});                           // the hollow in front of the ear
// ---- the violet rim of the gate down the profile, broken ----
S([[657,870],[656,877]],SK.rim,1.2,{taper:[.3,.3],load:.85});S([[662,886],[666.4,890.6]],SK.rim,1.2,{taper:[.3,.3],load:.85});
S([[658,905],[656.6,912],[652,919]],SK.rim,1.3,{taper:[.3,.3],load:.85});
// ---- crono_45_hair.js
// ================= HAIR: one flame-shaped mass of red, swept up and back by the run, breaking into tapered spikes =================
// Painted as a mass first (crimson in shade), then the locks as long tapering strokes from the skull to their tips,
// lit orange on the side facing the sun, crimson underneath, a violet edge toward the gate.
const HCORE=[[658,858],[670,846],[658,822],[638,806],[610,798],[584,804],[566,820],[556,844],[562,870],[576,890],[592,902],[602,884],[608,868],[616,860]];
fill(HCORE,{size:9,len:2.8,dens:2.3,ang:(x,y)=>Math.atan2(y-860,x-640),angJ:14,col:()=>MX(HR.shad,HR.mid,R(0,.4)),over:.1,so:{thin:.45,edge:.2,stir:.5}});
// locks: [base, mid, tip], base width
const LOCKS=[
  [[648,848],[672,836],[694,828],12],
  [[636,834],[652,800],[660,770],18],
  [[620,826],[618,780],[606,726],22],
  [[604,826],[588,782],[566,740],22],
  [[594,832],[564,798],[530,770],20],
  [[586,842],[548,820],[504,800],18],
  [[582,856],[548,850],[510,846],15],
  [[584,870],[560,880],[538,896],13],
  [[594,884],[584,900],[570,914],10]];
// each lock: shade body, mid colour, light along the upper-left edge, tapering to a point
const lockDo=(b,m,t,w,k)=>{const c=[b,m,t];const cc=cr(c,12);
  point(c,MX(HR.shad,HR.dark,.3),w,{thin:.45,edge:.15,stir:.5,load:1});
  // offset toward the light (up-left of the lock's direction)
  const dx=t[0]-b[0],dy=t[1]-b[1],L=Math.hypot(dx,dy);let nx=-dy/L,ny=dx/L;if(nx*-1+ny*-1<0){nx=-nx;ny=-ny;}
  const sh=(f,s)=>c.map((q,i)=>[q[0]+nx*w*f*(1-i*.4),q[1]+ny*w*f*(1-i*.4)]);
  point(sh(.18),HR.mid,w*.7,{thin:.35,edge:.25,stir:.45,load:1.1});
  point(sh(.34),k%2?HR.lite:MX(HR.lite,HR.glow,.4),w*.36,{thin:.25,edge:.3,stir:.4,load:1.25});
  point(sh(-.36),HR.dark,w*.28,{thin:.5,edge:.35,load:.9});};
LOCKS.forEach((L,k)=>lockDo(L[0],L[1],L[2],L[3],k));
// smaller spikes between the big ones, so the edge is irregular
for(const [b,t,w] of [[[628,830],[634,782],11],[[598,830],[580,770],11],[[588,838],[548,800],10],[[652,846],[676,818],9]])
  point([b,[lerp(b[0],t[0],.5)+R(-3,3),lerp(b[1],t[1],.5)+R(-3,3)],t],MX(HR.mid,HR.shad,.35),w,{thin:.4,edge:.25,stir:.5});
// the sun on the crown, where the mass faces up into the light
S([[572,832],[590,816],[612,810]],HR.glow,5,{load:1.3,thin:.2,edge:.5,taper:[.2,.5]});

// violet light of the gate on the front of the hair and the forward spike
S([[660,846],[668,838],[680,834]],HR.rim,1.8,{taper:[.3,.5],load:.85});S([[652,826],[656,800],[655,772]],HR.rim,1.6,{taper:[.3,.5],load:.8});
// ---- white bandana round the forehead, knotted at the back, the tails flying back ----
// a band of cloth round a sphere: its top edge lit, its lower half in shade, turning cool where it rounds the brow
const BDT=[[592,850],[612,850],[634,852],[650,855],[658,859]],BDB=[[594,865],[614,866],[636,867],[651,868],[657,868]];
fill(strip(BDT,BDB,0,1),{size:5,len:5,dens:2.3,ang:alongAB(BDT,BDB),angJ:4,col:()=>J(BD.half,.03),over:.08,so:{thin:.35,edge:.2,stir:.75,load:1.1}});
S(mid(BDT,BDB,.22,12),BD.lite,5,{load:1.3,thin:.2,edge:.4,taper:[.1,.3],clean:true});
S(mid(BDT,BDB,.8,12),MX(BD.shad,BD.half,.3),4,{thin:.45,edge:.45,taper:[.1,.2]});
S([[650,856],[656,860],[657,867]],MX(BD.shad,SK.rim,.45),3.6,{thin:.4,edge:.4});
// folds where it is pulled tight into the knot
S([[598,853],[612,857]],BD.shad,1.6,{taper:[.3,.5],edge:.4,opacity:.8});S([[598,862],[614,861]],BD.shad,1.4,{taper:[.3,.5],edge:.4,opacity:.7});
// the knot, and two tails flapping back from it: each a twisting strip, lit where it faces up, shaded where it turns
S([[592,852],[584,856],[586,866],[594,866]],BD.half,7,{thin:.35,load:1.1,stir:.7});
S([[588,853],[584,858]],BD.lite,3,{load:1.25,taper:[.2,.4],clean:true});
const tail=(c,w,o)=>{const cc=cr(c,16);S(cc,MX(BD.half,BD.shad,.25),w,{taper:[.04,.5],thin:.35,load:1.1,stir:.7});
  S(sub(cc,0,.45,8).map(q=>[q[0],q[1]-w*.22]),BD.lite,w*.45,{taper:[.1,.5],load:1.25,thin:.2,clean:true});
  S(sub(cc,.5,.85,8).map(q=>[q[0],q[1]-w*.18]),MX(BD.lite,BD.half,.3),w*.4,{taper:[.2,.5],load:1.15,thin:.25});
  S(sub(cc,.3,.6,8).map(q=>[q[0],q[1]+w*.25]),BD.shad,w*.35,{taper:[.3,.4],thin:.5,edge:.4});};
tail([[584,856],[566,850],[546,852],[528,846],[508,846]],8);
tail([[584,864],[566,870],[550,868],[534,876],[518,874]],7);
// ---- crono_50_hands.js
// ================= HANDS =================
// right hand: open and reaching up toward Marle, fingers together and a little curled, thumb up; lit on its back
// (left) edge, the palm side toward the gate in cool half-tone.
const CRH=[[730,996],[736,984],[744,974],[752,968],[762,966],[768,972],[764,982],[756,992],[746,1002],[736,1006]];
fill(CRH,{size:5,len:2.4,dens:2.4,ang:-45,angJ:10,col:()=>MX(SK.half,SK.shad,R(0,.3)),over:.06,so:SKS});
S([[732,992],[740,980],[750,970]],MX(SK.lite,SK.half,.2),4.4,{load:1.2,thin:.25,edge:.35});           // back of the hand, lit
S([[740,1002],[752,992],[762,980]],MX(SK.shad,SK.cool,.4),3.6,{thin:.5,edge:.4});                    // palm edge, cool
// fingers: together, pointing up-right, the tips curling in
S([[752,970],[760,962],[767,958],[771,960]],MX(SK.half,SK.lite,.3),4.4,{taper:[.05,.15],thin:.4,load:1.05});
S([[756,976],[764,968],[771,965],[774,968]],SK.half,4,{taper:[.05,.15],thin:.4});
S([[758,983],[766,977],[772,974],[774,977]],MX(SK.half,SK.shad,.3),3.6,{taper:[.05,.15],thin:.4});
S([[752,966],[762,959],[768,956]],SK.lite,1.6,{load:1.25,taper:[.2,.4],thin:.2});
S([[762,985],[768,980],[772,978]],MX(SK.rim,SK.half,.4),1.2,{taper:[.3,.3],load:.8,edge:.5});
// thumb, up along the side of the index finger
S([[738,984],[742,972],[748,964],[752,960]],MX(SK.half,SK.lite,.4),3.8,{taper:[.05,.2],thin:.4,load:1.05});
S([[739,982],[743,970],[748,962]],SK.lite,1.4,{load:1.25,taper:[.2,.4]});
// left fist gripping the scabbard at the hip: knuckles lit, thumb over the guard
const CLH=[[454,1080],[476,1080],[484,1094],[482,1112],[470,1120],[458,1116],[451,1100]];
fill(CLH,{size:4.4,len:5,dens:2.4,ang:85,angJ:5,col:()=>J(MX(SK.half,SK.shad,.3),.03),over:.06,so:{thin:.4,edge:.3,stir:.8}});
S([[455,1083],[453,1098],[456,1112]],MX(SK.lite,SK.half,.2),5,{load:1.2,thin:.25,edge:.5});            // the back of the hand toward the sun
S([[460,1082],[462,1096],[462,1110]],MX(SK.half,SK.lite,.3),3.4,{edge:.5,thin:.3});
// the curled fingers wrapped round the scabbard: four stacked rolls, each lit on top, a dark crease below
for(let i=0;i<4;i++){const y=1092+i*6.2;
  S([[466,y],[474,y-.6],[481,y+.6]],MX(SK.half,SK.shad,.2+i*.1),4.6,{taper:[.1,.3],load:1.05,thin:.35,edge:.3});
  if(i===0)S([[467,y-1.6],[474,y-2.2],[479,y-1.4]],MX(SK.lite,SK.half,.35),1.6,{taper:[.2,.4],load:1.15,thin:.25});
  if(i<3)S([[468+i,y+2.8],[475,y+2.4+R(-.4,.4)],[480-i,y+3.2]],MX(SK.shad,SK.half,.3),1.2,{taper:[.3,.4],edge:.6,opacity:.6});}
SB([[468,1090],[474,1102],[476,1114]],5,.4);
for(const [x,y] of [[462,1092],[463,1098.2],[463.6,1104.4],[464,1110.6]])T(x,y,0,1.6,MX(SK.lite,SK.half,.45),1.8,{load:1.05,edge:.5,opacity:.75});   // the knuckles' row
S([[478,1086],[483,1100],[479,1115]],MX(SK.shad,SK.cool,.3),3,{thin:.5,edge:.45});
S([[468,1083],[478,1086],[486,1091]],MX(SK.half,SK.lite,.4),3.6,{load:1.1,thin:.3,taper:[.1,.4]});      // the thumb over the guard
S([[470,1081.6],[480,1084.6]],SK.lite,1.4,{load:1.25,taper:[.2,.4]});
// ---- crono_60_finish.js
// ================= FINISH: folds in the tunic, glazes in the shadows, scumbles on the lit cloth, lost edges =================
P.dry();
// ---- tunic folds: the cloth pulled from the shoulder of the swinging arm down across the back to the belt, and
//      from the reaching arm across the chest; each fold a shaded trough with its lit ridge on the sun side ----
const fold=(c,w,o)=>{S(c,MX(TU.shad,TU.core,.3),w,Object.assign({thin:.45,edge:.55,taper:[.2,.6],stir:.8,opacity:.85},o||{}));
  S(c.map(q=>[q[0]-w*.7,q[1]-w*.2]),MX(TU.lite,TU.half,.25),w*.6,{thin:.25,edge:.4,taper:[.25,.6],load:1.15,clean:true});};
fold([[572,962],[556,986],[542,1012],[534,1034]],3.4);
fold([[596,954],[586,982],[574,1010]],3);
fold([[620,966],[606,992],[594,1020]],3,{opacity:.7});
fold([[530,968],[520,992],[512,1020]],2.6,{opacity:.7});
// the skirt swinging back: deeper troughs between the pleats, the hem flipping up at the back
for(const [x0,x1] of [[498,470],[530,520],[564,560]])S([[x0,1056],[lerp(x0,x1,.5),1104],[x1,1156]],MX(TU.shad,TU.core,.45),3,{thin:.45,edge:.5,taper:[.15,.5],opacity:.8});
S([[436,1146],[452,1140],[470,1146]],MX(TU.lite,TU.half,.2),3,{load:1.2,thin:.25,taper:[.2,.4],clean:true});
// ---- glazes: the shadow sides deepened with transparent colour, the texture below showing through ----
const GLZ_B=[['ultramarine',.3],['cobalt_violet',.3],['paynes_grey',.12]],GLZ_W=[['burnt_umber',.5],['ultramarine',.25],['alizarin_crimson',.1]];
S([[630,950],[628,980],[616,1012],[600,1040]],GLZ_B,20,{thin:.6,opacity:.18,edge:.75});                      // the chest turned from the sun
S([[596,1060],[590,1110],[582,1160]],GLZ_B,18,{thin:.6,opacity:.16,edge:.75});                             // the front of the skirt
S([[528,1160],[552,1190],[572,1220],[584,1244]],GLZ_W,10,{thin:.6,opacity:.25,edge:.6});                   // the front of the planted thigh
S([[584,1250],[574,1278],[556,1304],[536,1328]],GLZ_W,9,{thin:.6,opacity:.25,edge:.6});                    // the shin in shade
S([[530,1160],[516,1200],[494,1240],[468,1278]],GLZ_W,12,{thin:.6,opacity:.3,edge:.6});                    // the far thigh, behind
S([[690,1032],[706,1036],[722,1020]],[['sap_green',.4],['ultramarine',.3],['burnt_umber',.2]],8,{thin:.6,opacity:.25,edge:.6});   // under the reaching arm
// ---- scumbles: broken light paint dragged over the peaks of the lit cloth ----
for(const c of [[[576,946],[548,960],[522,984],[504,1014]],[[560,952],[534,976],[516,1004]]])S(c,MX(TU.lite,[['titanium_white',1]],.2),6,{scumble:true,load:.55,stir:.5});
for(const c of [[[476,1170],[498,1204],[520,1234]],[[468,1156],[450,1196],[434,1232]],[[548,1266],[532,1288],[514,1310]]])S(c,MX(PA.lite,[['titanium_white',1]],.15),6,{scumble:true,load:.5,stir:.5});
S([[562,954],[528,960],[494,966]],MX(GR.lite,[['titanium_white',1]],.2),5,{scumble:true,load:.5});            // the top of the swinging sleeve
// ---- lost edges: where a form and the ground behind it are close in value, a veil of the ground over the edge ----
const PLAZA=[['titanium_white',2.2],['yellow_ochre',.22],['raw_sienna',.1],['cobalt_violet',.06]];
S([[574,940],[552,950],[530,964]],PLAZA,5,{thin:.6,opacity:.35,edge:.85,taper:[.3,.4]});                  // the lit back against the plaza
S([[600,712],[598,726]],PLAZA,7,{thin:.6,opacity:.4,edge:.85});S([[474,818],[488,822]],PLAZA,6,{thin:.6,opacity:.35,edge:.85});   // hair tips into the light
S([[652,758],[656,772]],PLAZA,6,{thin:.6,opacity:.35,edge:.85});
const DECK=[['burnt_umber',.6],['burnt_sienna',.3],['ultramarine',.1],['titanium_white',.1]];
S([[530,1160],[516,1200],[494,1240]],DECK,6,{thin:.7,opacity:.3,edge:.85,taper:[.3,.4]});                  // the far thigh's shaded edge sinks into the dark stage
S([[360,1266],[330,1256],[300,1244]],DECK,5,{thin:.7,opacity:.3,edge:.85,taper:[.3,.4]});
})();
