// 32_marle: hero pass (engine v6), full 2400x1600 canvas coordinates. Built from heroes-dev/src2 by build2.sh.
(function(){const OX=0,OY=0,SEED=3211;
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
// ---- marle_00_pal.js
// ================= MARLE (focal figure) =================
// Lifted in front of the gate. Warm low sun from the left (a little from behind), cold violet light from the gate
// behind her. She reads as a mid-value figure against the light disc, with warm lit fronts and violet-rimmed backs.
P.dry();P.wipe();
const SK={ // fair skin of a strawberry blonde in late sun: warm only in the light, cool rose-grey half-tones,
           // violet from the gate in the shadows, blood-rose at the cheeks, nose and ears
  lite:[['titanium_white',4],['naples_yellow',.35],['vermilion',.05],['quinacridone_rose',.06],['yellow_ochre',.03]],
  hot:[['titanium_white',3],['naples_yellow',.45],['cadmium_orange',.04],['vermilion',.06],['quinacridone_rose',.03]],
  half:[['titanium_white',2.4],['yellow_ochre',.09],['venetian_red',.15],['cobalt_violet',.14],['quinacridone_rose',.04],['raw_umber',.04]],
  shad:[['titanium_white',1.15],['venetian_red',.27],['raw_umber',.13],['cobalt_violet',.32],['ultramarine',.04],['yellow_ochre',.04]],
  core:[['titanium_white',.5],['venetian_red',.35],['burnt_umber',.3],['cobalt_violet',.28]],
  refl:[['titanium_white',1.6],['venetian_red',.2],['yellow_ochre',.1],['cobalt_violet',.2],['quinacridone_rose',.04]],
  cool:[['titanium_white',1.7],['cobalt_violet',.38],['venetian_red',.12],['ultramarine',.05],['quinacridone_rose',.04]],
  rim:[['titanium_white',3],['cobalt_violet',.45],['quinacridone_rose',.08]],
  blush:[['titanium_white',2.4],['quinacridone_rose',.2],['vermilion',.07]],
  lip:[['titanium_white',1.4],['venetian_red',.38],['quinacridone_rose',.24],['vermilion',.05]],
};
const HR={ // strawberry blonde
  lite:[['titanium_white',2.6],['naples_yellow',.5],['cadmium_orange',.14],['vermilion',.08]],
  mid:[['titanium_white',1.1],['cadmium_orange',.22],['burnt_sienna',.45],['naples_yellow',.2]],
  shad:[['burnt_sienna',.8],['venetian_red',.25],['titanium_white',.4],['raw_umber',.1]],
  dark:[['burnt_sienna',.6],['burnt_umber',.5],['alizarin_crimson',.1],['titanium_white',.15]],
  rim:[['titanium_white',3],['cobalt_violet',.4],['quinacridone_rose',.15],['naples_yellow',.2]],
};
const BU={ // ice-blue jumpsuit
  lite:[['titanium_white',5],['cerulean',.1],['naples_yellow',.25],['cobalt_violet',.05]],
  half:[['titanium_white',2.2],['cerulean',.2],['cobalt_violet',.17],['paynes_grey',.1]],
  shad:[['titanium_white',1.1],['paynes_grey',.35],['cobalt_violet',.4],['cerulean',.15]],
  core:[['titanium_white',.8],['paynes_grey',.6],['ultramarine',.15],['cobalt_violet',.25]],
  rim:[['titanium_white',3],['cobalt_violet',.5],['cerulean',.08]],
};
const GD={lite:[['naples_yellow',1],['cadmium_yellow',.12],['titanium_white',.9]],mid:[['yellow_ochre',1],['raw_sienna',.25],['titanium_white',.2]],
  shad:[['raw_sienna',.8],['burnt_umber',.35],['cobalt_violet',.1],['titanium_white',.15]],hi:[['titanium_white',3],['naples_yellow',.6],['cadmium_yellow',.1]]};
const BT={lite:[['titanium_white',4],['naples_yellow',.35]],half:[['titanium_white',2],['raw_umber',.14],['cobalt_violet',.2],['naples_yellow',.15]],
  shad:[['titanium_white',1],['paynes_grey',.2],['raw_umber',.22],['cobalt_violet',.35]],rim:[['titanium_white',3],['cobalt_violet',.45]]};
const GATE={lite:[['titanium_white',4],['cobalt_violet',.35],['quinacridone_rose',.03]],mid:[['titanium_white',2],['cobalt_violet',.6],['dioxazine_purple',.06]]};
// stroke styles
const SKS={thin:.5,edge:.2,stir:.75,load:1};          // skin block-in
const SKL={thin:.2,edge:.25,stir:.6,load:1.25};       // skin lights: thicker
const CLS={thin:.5,edge:.15,stir:.7,load:1};          // cloth block-in
const CLL={thin:.25,edge:.3,stir:.6,load:1.2};        // cloth lights
// ---- marle_05_pony.js
// ================= PONYTAIL (behind everything): streams up and back from the tie in one long S =================
// Full and heavy near the tie, it twists once, thins, and breaks into a few locks at the end. Lit along the top,
// a dark underside, violet light from the gate on the edge nearest it.
const PT_TOP=[[1548,394],[1578,391],[1612,392],[1646,390],[1678,386],[1708,386],[1732,392]];
const PT_BOT=[[1552,446],[1584,448],[1616,440],[1648,426],[1680,412],[1710,402],[1732,396]];
fill(strip(PT_TOP,PT_BOT,0,1),{size:9,len:4.2,dens:2.2,ang:alongAB(PT_TOP,PT_BOT),angJ:5,col:()=>MX(HR.shad,HR.mid,R(0,.4)),over:.08,so:{thin:.5,edge:.2,stir:.5}});
// the lit top surface and the dark underside, laid along the stream; the twist where they cross over
S(sub(mid(PT_TOP,PT_BOT,.16,16),0,.75),MX(HR.lite,HR.mid,.25),9,{thin:.35,load:1.15,edge:.3,stir:.45});
S(sub(mid(PT_TOP,PT_BOT,.1,16),.05,.6),HR.lite,5,{thin:.3,load:1.25,edge:.35,stir:.4});
S(sub(mid(PT_TOP,PT_BOT,.42,16),.0,.9),HR.mid,7,{thin:.4,edge:.35,stir:.45});
S(sub(mid(PT_TOP,PT_BOT,.78,16),0,.85),MX(HR.shad,HR.dark,.4),9,{thin:.5,edge:.3});
S(sub(mid(PT_TOP,PT_BOT,.9,16),.05,.6),HR.dark,5,{thin:.5,edge:.35});
SB(mid(PT_TOP,PT_BOT,.5,12),14,.6);SB(mid(PT_TOP,PT_BOT,.3,12).slice(0,8),10,.5);
// a twisting lock crossing the mass: light on its back
S([[1600,442],[1628,428],[1656,410],[1684,396]],MX(HR.mid,HR.lite,.5),5,{taper:[.2,.5],thin:.35,load:1.1});
S([[1604,446],[1632,434],[1660,416]],HR.shad,3,{taper:[.2,.5],thin:.5});
// locks and strands at the end, tapering out; a few loose hairs beyond the mass
for(let i=0;i<10;i++){const f=R(.0,1);const L=mid(PT_TOP,PT_BOT,f,16).slice(Math.round(R(6,10)));
  const c=L.map((q,k)=>[q[0],q[1]+Math.sin(k*.9+i)*1.6]);const e=c[c.length-1];c.push([e[0]+R(8,22),e[1]+R(-6,8)]);
  S(c,f<.35?MX(HR.lite,HR.mid,.35):f<.7?HR.mid:HR.shad,R(2,4),{taper:[.1,.8],stir:.45,thin:.4,load:.95});}
for(let i=0;i<7;i++){const y0=R(386,400);const x0=R(1680,1710);S([[x0,y0+4],[x0+22,y0+R(-4,4)],[x0+40+R(0,16),y0-4+R(-8,10)]],i%2?HR.mid:HR.lite,R(1,1.6),{taper:[.15,.85],load:.8});}
// violet rim of the gate along the upper edge near the head
S(sub(PT_TOP,0,.35).map(q=>[q[0],q[1]+1.5]),HR.rim,2.4,{taper:[.2,.5],load:.9});
S(sub(PT_BOT,0,.25).map(q=>[q[0],q[1]-1.5]),MX(HR.rim,HR.shad,.4),2,{taper:[.2,.5],load:.85});
// ---- marle_10_torso.js
// ================= TORSO: sleeveless top of the jumpsuit =================
// The chest faces up-left into the sun; the flank under the raised arm turns into cool shade with a violet rim.
// The raised arm pulls the cloth into long diagonal tension folds from the armpit toward the far hip; above the
// belt the cloth blouses and drops over it.
const TORSO=[[1436,526],[1458,532],[1484,530],[1500,522],[1512,540],[1518,566],[1510,592],[1494,614],[1474,636],[1458,656],[1420,650],[1380,642],[1340,636],[1348,616],[1360,590],[1374,566],[1390,548],[1404,536],[1420,528]];
fill(TORSO,{size:11,len:3,dens:2.2,ang:-60,angJ:14,col:()=>MX(BU.half,BU.shad,R(0,.3)),over:.1,so:CLS});
// the lit chest and the side under the reaching arm: big strokes, varied angles, following the ribcage
const TL=[[1404,540],[1430,532],[1458,538],[1470,548],[1462,572],[1446,592],[1420,612],[1392,628],[1362,632],[1370,604],[1384,574]];
fill(TL,{size:8,len:4.2,dens:2,ang:(x,y)=>deg(-48+(y-560)*.35),angJ:5,col:(x,y)=>J(MX(BU.lite,BU.half,Math.max(0,Math.min(.6,.15+(x-1380)/250))),.04),over:.05,so:{thin:.25,edge:.3,stir:.8,load:1.2}});
SB([[1400,548],[1440,540],[1466,552]],10,.45);SB([[1380,590],[1420,580],[1456,580]],10,.45);SB([[1370,620],[1410,610],[1440,600]],10,.4);
// the shadow flank, one connected shape from the armpit down to the waist
const TS=[[1496,526],[1512,544],[1517,568],[1508,594],[1490,618],[1470,642],[1456,654],[1446,640],[1462,612],[1478,584],[1488,556]];
fill(TS,{size:8,len:4,dens:2.2,ang:-62,angJ:5,col:()=>J(MX(BU.shad,BU.core,.25),.04),over:.05,so:{thin:.35,edge:.2,stir:.8}});
// the turn between them, melted
SB([[1478,536],[1480,566],[1468,596],[1450,626],[1440,646]],14,.7);
// the form of the bust: light on the upper slope, a soft shade beneath, pulled diagonally by the raised arm
S([[1428,560],[1446,552],[1462,560]],MX(BU.lite,[['titanium_white',1]],.2),7,{thin:.25,load:1.25,edge:.45,taper:[.2,.5]});
S([[1424,588],[1446,592],[1468,584]],MX(BU.shad,BU.half,.3),5,{thin:.5,edge:.6,taper:[.3,.5]});
SB([[1430,576],[1450,578],[1468,574]],8,.5);
// tension folds from the raised arm's armpit toward the far hip: each a lit ridge with its shade on the side away
// from the sun; long, tapering, not parallel
S([[1512,556],[1484,584],[1452,612],[1418,634]],BU.shad,4.5,{thin:.5,edge:.45,taper:[.15,.6],opacity:.85});
S([[1506,550],[1478,578],[1446,606],[1412,628]],MX(BU.half,BU.lite,.5),3,{thin:.3,load:1.1,edge:.35,taper:[.15,.6]});
S([[1508,578],[1486,604],[1466,628]],BU.core,3.4,{thin:.5,edge:.5,taper:[.2,.6],opacity:.8});
S([[1502,574],[1480,598],[1460,622]],MX(BU.half,BU.shad,.2),2.4,{thin:.4,edge:.4,taper:[.2,.6]});
S([[1494,534],[1468,556],[1446,578]],MX(BU.half,BU.shad,.5),3,{thin:.5,edge:.5,taper:[.2,.6],opacity:.75});
// blousing over the belt: the cloth drops in a few soft loops, light on top, dark tucked under
for(const [x,y,L,w] of [[1356,630,20,8],[1392,638,26,9],[1426,646,20,8],[1450,652,14,6]]){
  S([[x-8,y-L],[x-3,y-L*.5],[x+2,y]],MX(BU.lite,BU.half,.25),w*.6,{thin:.3,load:1.15,edge:.4,taper:[.3,.3]});
  S([[x+4,y-L*.85],[x+7,y-L*.35],[x+9,y+1]],MX(BU.shad,BU.half,.2),w*.5,{thin:.5,edge:.5,taper:[.3,.3]});}
S([[1346,636],[1390,644],[1440,654],[1458,658]],BU.core,4,{thin:.5,edge:.35,opacity:.8});     // shade of the overhang on the belt
// neckline: a soft rolled edge round the base of the neck
S([[1416,529],[1438,529],[1460,535],[1484,532],[1500,523]],MX(BU.lite,BU.half,.15),4,{load:1.15,taper:[.2,.3],thin:.3});
S([[1440,535],[1462,540],[1484,536]],BU.shad,2.4,{taper:[.3,.3],edge:.5,thin:.5});
// armholes: the edge of the cloth over the shoulders
S([[1404,536],[1412,548],[1412,562]],BU.shad,3,{taper:[.2,.4],edge:.4,thin:.5});
S([[1500,524],[1512,540],[1520,560]],BU.core,3,{taper:[.2,.4],edge:.4,thin:.5});
// violet rim on the shadow flank against the gate
S([[1515,548],[1519,568],[1511,592],[1496,614]],BU.rim,2.8,{taper:[.3,.5],load:.95});
// ---- marle_20_legs.js
// ================= LEGS: loose jumpsuit trousers, trailing down-left =================
// Each leg: the planes facing up-left into the sun are light, the side toward us a cool half-tone, the underside and
// the back of the calf shade, rimmed in violet where the gate is behind. The cloth is loose: it pulls in long folds
// from the hip toward the knee, crushes behind the bent knee, drapes down the shin and gathers over the boot tops.
const fold2=(c,w,o)=>S(c,BU.shad,w,Object.assign({thin:.5,edge:.45,taper:[.2,.6],stir:.7},o||{}));
const ridge2=(c,w,o)=>S(c,MX(BU.lite,BU.half,.2),w,Object.assign({thin:.25,load:1.15,edge:.35,taper:[.2,.6],stir:.6},o||{}));

// a rounded form painted as three bands between its lit edge A and its shadow edge B: the light, the half-tone,
// the shadow with its core and a cool reflected edge; the turns melted. k: 0..1 how much the whole form is in shade.
const band3=(A,B,k,o)=>{o=o||{};const al=alongAB(A,B);const w=o.w||12;
  const L=MX(MX(BU.lite,BU.half,.15),BU.half,k*.7),H=MX(BU.half,BU.shad,.4+k*.3),Sd=MX(BU.shad,BU.core,.35+k*.3);
  // shadow first, laid on bare ground so it keeps its value; then the half-tone; the light last and thickest
  fill(strip(A,B,.52,1),{size:w*.6,len:3.6,dens:2.3,ang:al,angJ:6,col:()=>J(Sd,.04),over:.1,so:{thin:.35,edge:.15,stir:.75}});
  fill(strip(A,B,.28,.56),{size:w*.55,len:3.4,dens:2.2,ang:al,angJ:6,col:()=>J(H,.04),over:.03,so:CLS});
  fill(strip(A,B,0,.3),{size:w*.55,len:3.6,dens:2.1,ang:al,angJ:6,col:()=>J(L,.04),over:.1,so:{thin:.25,edge:.2,stir:.7,load:1.2,clean:true}});
  S(mid(A,B,.93,16),MX(Sd,BU.half,.3),w*.35,{thin:.45,edge:.35,taper:[.15,.3]});               // reflected light in the shadow
  SB(mid(A,B,.3,12),w*.6,.4);SB(mid(A,B,.54,12),w*.6,.35);};
// hips under the belt
fill([[1338,650],[1460,660],[1456,702],[1362,704],[1336,670]],{size:10,len:3,dens:2.2,ang:-20,angJ:10,col:()=>MX(BU.half,BU.shad,R(.1,.4)),over:.08,so:CLS});
// ---- far leg (her right): mostly in shade behind the near leg ----
band3([[1336,668],[1310,710],[1282,752],[1252,798],[1222,842],[1200,872]],[[1368,700],[1344,738],[1318,782],[1290,826],[1262,868],[1244,896]],.45,{w:11});
band3([[1202,868],[1191,902],[1184,940],[1178,980],[1173,1008]],[[1246,892],[1237,932],[1227,972],[1213,1010]],.35,{w:10});
// ---- near leg (her left): the thigh comes toward us, top plane in the sun, the underside in shade ----
band3([[1362,700],[1340,730],[1316,762],[1294,792],[1276,818],[1268,846]],[[1454,700],[1442,752],[1410,786],[1370,808],[1338,830],[1328,852]],0,{w:12});
band3([[1270,840],[1265,880],[1267,920],[1270,960],[1272,992]],[[1330,846],[1334,882],[1337,920],[1334,960],[1328,996]],.05,{w:11});
SB([[1272,836],[1300,840],[1330,850]],10,.5);
// ---- far leg (her right): thigh, knee, shin ----
// top of the thigh to the knee in light; the shin's front in light; the back of the calf in shade
// the knee: its cap catches the sun; folds crush behind it
S([[1200,870],[1212,860],[1228,858]],MX(BU.lite,[['titanium_white',1]],.15),7,{load:1.25,edge:.35,thin:.2,taper:[.2,.4]});
fold2([[1260,866],[1246,878],[1236,894]],3.4);ridge2([[1255,862],[1242,874]],2.4);
fold2([[1250,884],[1240,900]],2.6,{opacity:.8});
// pull folds from the hip over the thigh, and a long drape down the shin
fold2([[1352,690],[1316,724],[1280,762],[1248,806]],3.6,{opacity:.8});ridge2([[1346,686],[1310,720],[1274,758]],2.6);
fold2([[1214,904],[1210,944],[1202,984]],3,{opacity:.75});ridge2([[1208,906],[1203,946]],2.2);
// gathered over the boot top: two soft rolls
for(const [x,y] of [[1192,988],[1194,1000]]){fold2([[x-18,y-2],[x,y+3],[x+18,y-1]],3,{opacity:.8});ridge2([[x-18,y-6],[x,y-1],[x+16,y-5]],2.6);}
S([[1240,900],[1234,940],[1224,978]],BU.rim,2.4,{taper:[.3,.4],load:.85});

// ---- near leg (her left): the thigh comes toward us, the knee bends, the shin hangs ----
// the top of the thigh: a big plane facing up-left into the sun
// the underside of the thigh toward the knee, in shade; the inner thigh dark against the far leg
// shin: front lit, back of the calf in shade; the calf swells and narrows to the ankle
// knee: the cap in light; folds crush behind it
S([[1272,830],[1286,818],[1304,818],[1314,826]],MX(BU.lite,[['titanium_white',1]],.15),7,{load:1.25,edge:.35,thin:.2,taper:[.2,.4]});
fold2([[1334,830],[1320,842],[1308,856]],3.2);ridge2([[1330,826],[1316,838]],2.4);
fold2([[1336,848],[1324,862]],2.6,{opacity:.8});
// tension folds from the crotch and hip toward the knee
fold2([[1404,694],[1382,716],[1352,744],[1318,778]],3.8);ridge2([[1398,690],[1376,712],[1346,740]],2.8);
fold2([[1436,700],[1414,726],[1384,752]],3.2,{opacity:.8});ridge2([[1431,697],[1408,722]],2.4);
// a long drape down the shin
fold2([[1302,862],[1298,904],[1302,946]],3.2,{opacity:.75});ridge2([[1296,864],[1291,906],[1294,946]],2.4);
fold2([[1320,886],[1306,920],[1294,948]],2.6,{opacity:.65});
// gathered over the boot top
for(const [x,y] of [[1300,972],[1300,984]]){fold2([[x-26,y-1],[x,y+4],[x+26,y]],3.2,{opacity:.8});ridge2([[x-26,y-5],[x,y],[x+24,y-4]],2.8);}
// violet rims on the back edges
S([[1450,700],[1448,728],[1434,756]],BU.rim,2.8,{taper:[.2,.5],load:.85});
S([[1334,872],[1337,910],[1332,950]],BU.rim,2.4,{taper:[.3,.4],load:.85});
// ---- marle_25_boots.js
// ================= BOOTS: pale soft leather, toes pointed down =================
// Each boot a cylinder over the calf bending at the ankle into the wedge of the foot, painted in bands between its
// lit edge A (left, toward the sun) and its shadow edge B: light, half-tone, cool shade with warm bounce from the
// deck along the underside; a turned-down cuff at the top; the shaft narrowing to the ankle.
const bootDo=(A,B,cuff,crease)=>{const al=alongAB(A,B);const bw=Math.hypot(A[0][0]-B[0][0],A[0][1]-B[0][1]);
  const L=MX(BT.lite,BT.half,.3),H=MX(BT.half,BT.shad,.5),Sd=MX(BT.shad,[['raw_umber',1],['cobalt_violet',.6],['titanium_white',.6]],.5);
  // smooth leather: long strokes down the boot, shadow side first, then half-tone, then the light
  fill(strip(A,B,0,1),{size:bw*.3,len:5,dens:1.6,ang:al,angJ:3,col:()=>J(H,.03),over:.05,so:{thin:.4,edge:.2,stir:.8}});
  for(const f of [.86,.72,.6])S(mid(A,B,f,16),J(Sd,.03),bw*.2,{thin:.35,edge:.25,stir:.8});
  for(const f of [.46,.36])S(mid(A,B,f,16),J(H,.03),bw*.2,{thin:.3,edge:.3,stir:.8});
  for(const f of [.24,.13])S(mid(A,B,f,16),J(L,.03),bw*.2,{thin:.25,edge:.3,stir:.7,load:1.2,clean:true});
  S(mid(A,B,.92,14),[['titanium_white',1.4],['raw_sienna',.2],['venetian_red',.1],['cobalt_violet',.15]],2.6,{thin:.45,edge:.4,taper:[.2,.3]});   // warm bounce from the deck
  SB(mid(A,B,.36,12),5,.4);SB(mid(A,B,.58,12),5,.35);
  // the cuff: a soft roll, lit on top, its shadow below
  S(cuff,MX(BT.lite,BT.half,.15),5,{load:1.2,taper:[.1,.2],thin:.3});S(cuff.map(q=>[q[0]+1,q[1]+4.5]),MX(BT.shad,BT.half,.3),2.6,{edge:.5,thin:.5});
  // the ankle crease where the foot bends
  S(crease,MX(BT.shad,BT.half,.3),3,{taper:[.3,.4],edge:.7,opacity:.5});
  SB(mid(A,B,.5,10),bw*.5,.3);};
// far boot
bootDo([[1172,1006],[1168,1032],[1160,1058],[1146,1082],[1126,1110],[1108,1136],[1098,1156]],
       [[1213,1010],[1211,1036],[1203,1056],[1206,1074],[1190,1094],[1166,1120],[1138,1146],[1112,1164]],
       [[1171,1008],[1192,1013],[1213,1012]],[[1162,1066],[1180,1074],[1196,1076]]);
// near boot
bootDo([[1273,992],[1276,1022],[1276,1054],[1270,1086],[1262,1116],[1256,1140],[1254,1158]],
       [[1328,996],[1331,1024],[1326,1046],[1330,1066],[1318,1092],[1300,1120],[1282,1146],[1266,1162]],
       [[1273,994],[1300,998],[1328,998]],[[1278,1062],[1298,1068],[1318,1068]]);
// a few thick lights on the shins of the boots and the toe caps
S([[1170,1022],[1164,1046],[1152,1070]],BT.lite,3,{load:1.35,taper:[.2,.5],thin:.15});S([[1280,1010],[1281,1040],[1278,1068]],BT.lite,3,{load:1.35,taper:[.2,.5],thin:.15});
S([[1116,1128],[1106,1144]],MX(BT.lite,BT.half,.2),3,{load:1.2,taper:[.2,.4],thin:.2});S([[1264,1126],[1259,1146]],MX(BT.lite,BT.half,.2),3,{load:1.2,taper:[.2,.4],thin:.2});
// violet rim on the backs of the heels
S([[1212,1030],[1206,1060],[1194,1088]],BT.rim,2,{taper:[.3,.4],load:.85});S([[1331,1030],[1328,1056],[1320,1084]],BT.rim,2,{taper:[.3,.4],load:.85});
// ---- marle_30_belt.js
// ================= BELT: gold, wrapping round the waist (curves with the body) =================
const BELT_T=[[1342,636],[1372,640],[1404,646],[1432,652],[1456,658]],BELT_B=[[1336,660],[1366,665],[1398,671],[1428,678],[1452,684]];
fill(strip(BELT_T,BELT_B,0,1),{size:8,len:4,dens:2,ang:alongAB(BELT_T,BELT_B),angJ:4,col:()=>MX(GD.mid,GD.shad,R(0,.3)),over:.05,so:{load:1.1,thin:.4,edge:.1,stir:.6}});
// the upper edge catches the sun on the left; the band turns into shade round the far side
S(sub(mid(BELT_T,BELT_B,.25,10),0,.6),GD.lite,4.4,{load:1.3,taper:[.1,.4],thin:.2});
S(sub(mid(BELT_T,BELT_B,.85,10),0,1),GD.shad,3.4,{taper:[.1,.2],thin:.5});
S(sub(mid(BELT_T,BELT_B,.5,10),.65,1),MX(GD.shad,[['cobalt_violet',.3],['titanium_white',.5]],.4),8,{edge:.45,thin:.45,opacity:.85});
// buckle: a square of gold with its own light
S([[1386,646],[1384,670]],GD.shad,7,{taper:0,thin:.3});
S([[1382,649],[1381,666]],GD.hi,2,{load:1.4,clean:true,taper:[.1,.3]});
T(1381.5,651,80,2,[['titanium_white',5]],1.6,{load:1.5,clean:true});
// the near hip below the belt in sun
S([[1340,664],[1326,686],[1318,702]],BU.lite,7,{edge:.35,taper:[.2,.5],thin:.3,load:1.1});
S([[1454,686],[1452,700]],BU.rim,2.4,{taper:[.3,.4],load:.85});
// ---- marle_35_arms.js
// ================= ARMS =================
// Slender young arms built from their parts: the deltoid's round cap leaving the shoulder, the biceps and the
// triceps hanging under it, the elbow (a bony point and a soft crease), the forearm full near the elbow and turning
// flat and narrow to the wrist. The top planes face the low sun and are warm; the undersides turn away and take the
// cool violet light of the gate, with a violet rim on the edge nearest it.
// seg(A,B,o): one segment between its lit contour A and its shadow contour B (same direction): shadow on bare
// ground first, then the cool half-tone, the warm light last; turns melted, a reflected rim on the far edge.
const seg=(A,B,o)=>{o=o||{};const al=alongAB(A,B);const w=o.w;
  const L=o.L||MX(SK.lite,SK.half,.08),H=o.H||MX(SK.half,SK.lite,.15),Sd=o.Sd||MX(SK.shad,SK.cool,.35);
  fill(strip(A,B,.55,1),{size:w*.28,len:4.2,dens:2.3,ang:al,angJ:5,col:()=>J(Sd,.04),over:.1,so:{thin:.35,edge:.15,stir:.75}});
  fill(strip(A,B,.26,.6),{size:w*.28,len:4.2,dens:2.2,ang:al,angJ:5,col:()=>J(H,.04),over:.03,so:{thin:.4,edge:.2,stir:.7}});
  fill(strip(A,B,0,.3),{size:w*.28,len:4.2,dens:2.1,ang:al,angJ:5,col:()=>J(L,.04),over:.1,so:{thin:.25,edge:.3,stir:.75,load:1.15,clean:true}});
  SB(mid(A,B,.28,12),w*.32,.4);SB(mid(A,B,.57,12),w*.32,.4);
  S(mid(A,B,.9,14),MX(SK.cool,SK.refl,.4),Math.max(1.6,w*.13),{thin:.4,edge:.45,taper:[.2,.3],load:.9});};

// ---- raised left arm: from the shoulder up past the head; lit contour on the left, the gate behind on the right ----
// upper arm: deltoid cap at the shoulder, the biceps' long swell on the lit side, the triceps on the shadow side
seg([[1498,532],[1504,512],[1514,494],[1528,474],[1544,452],[1556,436],[1563,424]],
    [[1524,574],[1536,548],[1552,520],[1568,494],[1584,468],[1592,450],[1596,436]],{w:38});
// forearm: from the elbow, full at first (the muscles of the forearm), then flat and narrow to the wrist
seg([[1562,428],[1566,408],[1569,388],[1574,364],[1580,342],[1586,324]],
    [[1596,438],[1600,416],[1602,394],[1604,370],[1606,346],[1609,324]],{w:30});
// the deltoid: a round cap, its top in the sun, the hollow where it inserts into the arm
S([[1500,536],[1504,516],[1514,500]],MX(SK.lite,SK.half,.1),6,{load:1.2,edge:.6,thin:.2,taper:[.2,.4]});
S([[1526,500],[1534,488]],MX(SK.half,SK.shad,.3),4,{edge:.65,thin:.5,opacity:.75});
// biceps swell, lit; the groove between biceps and triceps runs up the middle in half-tone
S([[1522,486],[1536,466],[1550,446]],MX(SK.lite,SK.half,.05),5,{load:1.2,edge:.45,thin:.25,taper:[.2,.4]});
S([[1540,506],[1556,482],[1572,460]],MX(SK.half,SK.shad,.35),3,{edge:.7,thin:.5,opacity:.7,taper:[.3,.4]});
// the elbow: a bony point on the outer (shadow) contour, a soft crease on the inside
S([[1588,452],[1595,440],[1597,428]],MX(SK.half,SK.refl,.4),4,{edge:.5,thin:.3,taper:[.2,.3]});
T(1594,446,-70,5,MX(SK.shad,SK.core,.35),2.4,{edge:.4});
S([[1562,422],[1570,430]],MX(SK.half,SK.shad,.45),2.2,{edge:.55,taper:[.3,.3],opacity:.85});
// forearm: the radius side lit and round near the elbow, the ulna a straight edge in shade; the wrist turns
S([[1568,410],[1572,384],[1578,358]],MX(SK.lite,SK.half,.05),4.4,{load:1.2,edge:.45,thin:.25,taper:[.2,.4]});
S([[1586,342],[1594,334],[1604,332]],MX(SK.half,SK.shad,.3),2.4,{edge:.6,thin:.5,opacity:.8});        // the wrist's turn
// armpit shade into the top; the violet rim along the back of the arm against the gate
S([[1514,560],[1522,576],[1516,590]],MX(SK.core,SK.cool,.4),4.5,{edge:.6,thin:.5});
S([[1538,548],[1556,514],[1576,482],[1593,452]],SK.rim,2.2,{taper:[.2,.4],load:.9,edge:.4});
S([[1600,420],[1604,388],[1608,352]],MX(SK.rim,SK.half,.25),1.8,{taper:[.3,.4],load:.85,edge:.4});

// ---- reaching right arm: out to screen left toward Crono; the top in the sun, the underside cool ----
// upper arm: the deltoid's cap, then the arm slimmer to the elbow; the triceps hangs under it
seg([[1424,522],[1404,512],[1384,510],[1362,513],[1340,513],[1316,511],[1294,511]],
    [[1416,558],[1394,553],[1368,547],[1344,542],[1320,538],[1302,536],[1290,535]],{w:34});
// forearm: full near the elbow, flattening and narrowing to the wrist; it turns palm-up toward the hand
seg([[1296,511],[1272,506],[1250,498],[1228,491],[1208,486],[1192,484]],
    [[1294,535],[1274,531],[1252,523],[1230,511],[1210,502],[1194,499]],{w:26});
// deltoid cap in full sun; the dip where it inserts
S([[1422,532],[1412,520],[1396,515]],MX(SK.lite,SK.half,.1),6,{load:1.2,edge:.6,thin:.2,taper:[.2,.4]});
S([[1372,520],[1362,524]],MX(SK.half,SK.shad,.25),3.4,{edge:.7,thin:.5,opacity:.6});
// the top of the upper arm lit; the triceps' underside swelling in cool shade with violet bounce
S([[1388,516],[1360,518],[1330,516],[1306,515]],MX(SK.lite,SK.half,.15),4.4,{edge:.45,load:1.15,thin:.25,taper:[.2,.4]});
S([[1396,550],[1370,546],[1344,541],[1318,537]],MX(SK.cool,SK.refl,.35),4,{edge:.55,thin:.5,taper:[.2,.4]});
// the elbow: a bony point on the underside, the soft hollow on top where the arm bends
T(1296,532,-10,6,MX(SK.shad,SK.core,.3),3,{edge:.45});
S([[1300,514],[1288,513]],MX(SK.half,SK.shad,.3),2.6,{edge:.65,thin:.5,opacity:.7});
// forearm: its rounded top near the elbow lit, the flexors underneath in shade; the wrist bones
S([[1280,509],[1256,502],[1232,494]],MX(SK.lite,SK.half,.05),4.4,{edge:.45,load:1.2,thin:.25,taper:[.2,.4]});
S([[1276,529],[1250,520],[1222,508]],MX(SK.shad,SK.cool,.3),3.6,{edge:.5,thin:.5});
S([[1206,487],[1196,485]],MX(SK.half,SK.lite,.35),3,{edge:.5,thin:.3});
// violet rim of the gate along the underside
S([[1410,559],[1380,551],[1346,544],[1316,539],[1290,537],[1260,529],[1230,514]],SK.rim,1.8,{taper:[.2,.4],load:.85,edge:.45});
// the armholes of the jumpsuit lie over the roots of the arms: a soft rolled cloth edge
S([[1426,522],[1420,536],[1418,552],[1420,562]],MX(BU.half,BU.lite,.3),4,{thin:.35,load:1.1,edge:.35,taper:[.2,.3]});
S([[1430,526],[1426,540],[1424,556]],BU.shad,2,{thin:.5,edge:.45,taper:[.2,.3],opacity:.8});
S([[1498,528],[1504,546],[1514,562],[1524,576]],MX(BU.shad,BU.half,.3),3.6,{thin:.4,edge:.4,taper:[.2,.3]});
// ---- marle_40_head.js
// ================= HEAD: three-quarter to screen left, tipped back; the focal point =================
// Drawn first as a flat study (study2/marle_face.svg), then painted: planes of skin laid as overlapping strokes along
// the form and melted with the soft blender, then the features as a handful of soft accents, then a few thick lights.
// Light from the left and a little in front: the front of the face is the light shape, the side plane toward the ear
// a warm half-tone, the underside of the jaw and the neck the shadow, the back edges rimmed violet by the gate.
const sk=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.45,edge:.45,stir:.7,load:1,jit:.05},o||{}));
const plane=(poly,col,size,ang,o)=>fill(poly,Object.assign({size:size,len:7,dens:2.4,ang:ang,angJ:4,col:()=>J(col,.05),over:.12,so:{thin:.4,edge:.3,stir:.75,load:1}},o||{}));
const LITE={thin:.2,edge:.3,stir:.6,load:1.2};
const H1=MX(SK.half,SK.lite,.35), H2=MX(SK.half,SK.shad,.5), SH=MX(SK.shad,SK.half,.2), SH2=MX(SK.shad,SK.core,.25);

// ---- neck: rising from the neckline to the back of the jaw; the throat runs diagonally down from under the chin ----
const NECK=[[1474,494],[1488,498],[1502,491],[1512,480],[1514,496],[1512,512],[1508,532],[1484,536],[1464,534],[1468,518],[1472,506]];
plane(NECK,MX(SK.half,SK.shad,.35),7,80);
plane([[1498,494],[1512,480],[1514,496],[1512,512],[1508,532],[1496,533],[1497,512]],MX(SK.shad,SK.cool,.4),6,80);   // the shadow side of the neck
plane([[1474,498],[1484,500],[1480,512],[1474,524],[1468,533],[1463,533],[1467,518],[1471,506]],MX(SK.half,SK.refl,.45),5,70);   // throat, catching light
SB([[1468,500],[1490,500],[1512,494]],12,.5);SB([[1462,520],[1484,522],[1508,516]],12,.45);
sk([[1512,486],[1498,502],[1484,516],[1470,531]],MX(SK.half,SK.refl,.3),3.6,{edge:.75,taper:[.3,.4],opacity:.7});   // the sternomastoid, a faint long ridge
SB([[1474,500],[1474,528]],8,.5);SB([[1490,496],[1488,530]],8,.5);
sk([[1512,490],[1506,510],[1502,528]],SH2,4,{edge:.6,thin:.55});                                         // shade behind it
S([[1513,486],[1511,506],[1507,527]],SK.rim,2.6,{taper:[.3,.4],load:.9,edge:.5});                         // violet rim at the back

// ---- the face: one light front plane, a half-tone side plane turned to the ear, a dark narrow shelf under the jaw ----
const FACE=[[1461,407],[1455,413],[1451,420],[1448,428],[1449,434],[1446,442],[1446,449],[1448,456],[1450,463],[1451,470],[1453,478],[1456,486],[1460,494],[1467,498.5],[1480,497],[1494,491],[1506,482],[1514,472],[1518,466],[1514,456],[1512,446],[1510,436],[1506,424],[1500,414],[1488,406],[1474,404],[1462,406]];
plane(FACE,MX(SK.half,SK.lite,.3),6,0,{ang:(x,y)=>y<424?deg(-4):x>1494?deg(-30):deg(72+(1470-x)*.5)});
const SIDE=[[1499,413],[1496,428],[1497,442],[1495,456],[1490,470],[1482,484],[1472,496],[1480,497],[1494,491],[1506,482],[1514,472],[1518,466],[1514,456],[1512,446],[1510,436],[1506,424],[1501,414]];
plane(SIDE,MX(SK.shad,SK.half,.5),5,0,{ang:(x,y)=>y<440?deg(80):deg(-35)});
plane([[1464,499],[1480,498],[1494,492],[1506,483],[1515,472],[1519,468],[1518,478],[1510,488],[1496,496],[1482,502],[1468,502]],MX(SH,SH2,.5),3.4,-25);   // under the jaw: a narrow shelf of shade, darker at the back
SB([[1468,502],[1490,499],[1514,480]],5,.45);
// the terminator: soft but present, a curve from the temple round the cheekbone down to the jaw
SB([[1499,414],[1497,430],[1497,444],[1494,458],[1488,472],[1478,488],[1468,498]],6,.6);
// ---- the light shape: soft-sided strokes that follow the planes (no hard patches) ----
const sl=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.25,edge:.6,stir:.85,load:1.15,jit:.03},o||{}));
sl([[1457,413],[1468,408],[1482,407],[1492,410]],SK.lite,7);                         // forehead, across its front
sl([[1454,421],[1468,419],[1484,419],[1492,422]],MX(SK.lite,SK.half,.12),6);
sl([[1470,444.5],[1478,443.2],[1487,445.8]],MX(SK.lite,SK.half,.05),5);                      // the cheek under the eye
sl([[1471,449.5],[1474,459.5],[1473,468.2]],MX(SK.lite,SK.half,.12),5.5);
sl([[1482,449.5],[1484,459.5],[1480,469.5]],MX(SK.lite,SK.half,.35),5);
sl([[1451,440.8],[1452,448.2]],MX(SK.lite,SK.half,.25),3);                                 // far cheekbone
sl([[1470,470.8],[1473,479],[1470,486]],MX(SK.lite,SK.half,.35),5);                    // the lower cheek, turning under to the jaw

sl([[1458,487],[1463,489.5]],MX(SK.lite,SK.half,.2),4);                       // chin
sl([[1455,464.5],[1461,465.8]],MX(SK.lite,SK.half,.3),3);                                  // over the lip
// ---- melt: along the forms, then across them, lightly, so the strokes sit in one skin ----
SB([[1452,413],[1470,407],[1492,409]],6,.5);SB([[1454,420],[1476,418],[1496,422]],8,.5);
SB([[1458,432],[1466,452],[1462,476],[1460,494]],8,.45);SB([[1476,440],[1480,460],[1476,480],[1468,496]],9,.5);
SB([[1450,440],[1470,446],[1490,444]],7,.35);SB([[1450,462],[1470,466],[1488,462]],7,.35);SB([[1454,482],[1468,486],[1482,480]],6,.35);
SB([[1500,430],[1506,446],[1508,462],[1500,480]],7,.5);
// a last even melt across the front plane, row by row, stopping short of the terminator
for(let y=414;y<=492;y+=5){const xr=y<444?1494:1494-(y-444)*.55;SB([[1449+(y>470?(y-470)*.3:0),y],[(1449+xr)/2,y+.6],[xr,y]],8,.42);}
for(let y=430;y<=486;y+=7)SB([[1499,y-6],[1510,y],[1504,y+8]],7,.35);
// ---- warmth: blood in the cheek, the nose tip, the ear ----
S([[1478,455.8],[1486,463.2]],SK.blush,7,{edge:.85,thin:.6,opacity:.42});
S([[1444,452],[1448,457]],SK.blush,3.6,{edge:.85,thin:.6,opacity:.35});

// ---- eye sockets: soft half-tone hollows under the brow; darkest by the bridge ----
sk([[1466,432],[1477,429.6],[1490,432.6]],MX(SK.half,SK.shad,.25),5,{edge:.65,opacity:.85});
sk([[1464.4,431],[1465,436]],MX(SK.shad,SK.half,.45),2.6,{edge:.75,opacity:.8});
sk([[1449.4,432.6],[1455,431.4],[1460,434]],MX(SK.half,SK.shad,.2),3.2,{edge:.65,opacity:.8});
SB([[1464,430],[1478,428],[1492,431]],5,.3);

// ---- nose: short and straight; the bridge lit, the side plane toward us soft, a gentle shadow under it ----
sk([[1461,432],[1458,440.8],[1455.8,449.5],[1451.6,453.2]],MX(SK.lite,SK.hot,.15),2.8,{thin:.2,load:1.2,edge:.45});
sk([[1464,437],[1463.4,446],[1462.4,454]],MX(SK.half,SK.shad,.45),2.6,{edge:.7,opacity:.95});
sk([[1461,458.5],[1465,460],[1468,459]],MX(SK.shad,SK.half,.3),2.8,{edge:.7,opacity:.9});              // its small cast shadow
sk([[1448.2,453.2],[1451.3,455.8]],MX(SK.lite,SK.blush,.3),3,{thin:.25,load:1.15,edge:.5});          // the rounded tip
S([[1449.6,459.8],[1453.8,461],[1458.4,460]],MX(SK.shad,SK.half,.25),1.6,{thin:.5,edge:.55,taper:[.2,.3],opacity:.85});   // under the nose
S([[1457,455.8],[1459.8,459]],MX(SK.half,SK.shad,.4),1.6,{edge:.55,thin:.5});              // wing of the nostril
T(1453,460,8,1.6,MX(SK.shad,SK.core,.35),1.1,{opacity:.75});

// ---- mouth: full young lips, closed and soft; the upper lip turns down into shade, the lower catches the light ----
S([[1451.9,469.2],[1455,467.8],[1457.5,468.5],[1461,468.2],[1466,470.8]],MX(SK.lip,SK.half,.4),2.4,{thin:.5,edge:.5,taper:[.15,.3]});
S([[1452.5,472.2],[1456.7,473],[1461.8,472.8],[1466.6,471.5]],[['burnt_umber',.35],['venetian_red',.5],['alizarin_crimson',.12],['titanium_white',.45]],1,{taper:[.2,.45],load:.85});
S([[1453,475.2],[1457.5,477],[1462.7,475.8]],MX(SK.lip,SK.lite,.55),2.8,{thin:.4,edge:.5,taper:[.2,.3]});
T(1456.7,475.5,-3,2.4,MX(SK.lite,[['titanium_white',1]],.25),1,{load:1.2});
T(1467.1,471.2,-30,1.4,MX(SK.shad,SK.core,.2),1,{opacity:.8});
sk([[1455,480.2],[1459.2,481.2],[1463.5,480.5]],MX(SK.half,SK.shad,.25),2,{edge:.7,opacity:.7});

// ---- eyes: soft dark lid line with lashes, the iris half under it, the white a dull half-tone ----
S([[1468.6,437.5],[1475,440.2],[1485.4,436.8]],[['titanium_white',1.8],['raw_umber',.14],['cobalt_violet',.12],['venetian_red',.05]],2,{load:.8,thin:.4});
T(1474.6,437.8,90,4,[['burnt_umber',.6],['ultramarine',.18],['cerulean',.18],['titanium_white',.4]],3.8,{load:.9});
T(1474.6,437.8,90,1.6,[['ivory_black',.5],['burnt_umber',.5]],1.6,{});
S([[1467.6,437],[1471,434.4],[1478.6,433.4],[1486.4,435.8]],[['burnt_umber',1],['ivory_black',.2],['alizarin_crimson',.1]],1.5,{taper:[.1,.35],load:.95});
S([[1484.4,435.4],[1488.6,434.4]],[['burnt_umber',1],['titanium_white',.12]],1,{taper:[.2,.6],load:.85});
sk([[1469,432.6],[1476,431.2],[1482,431.4],[1488,433.6]],MX(SK.half,SK.shad,.4),1,{edge:.4,taper:[.2,.3]});      // lid crease
S([[1469.4,441.2],[1476,443],[1481,442.2],[1485,440.2]],MX(SK.half,SK.lite,.5),1.1,{taper:[.3,.3],edge:.3});  // lower lid in light
T(1473.8,436.4,0,.6,[['titanium_white',4]],.9,{load:1.3,clean:true});                                       // catchlight
// far eye
S([[1450.4,437],[1453.6,435],[1457,435],[1460.2,436.2]],[['burnt_umber',1],['ivory_black',.15],['alizarin_crimson',.1]],1.3,{taper:[.2,.4],load:.9});
T(1454.6,437.8,90,2.6,[['burnt_umber',.6],['ultramarine',.18],['cerulean',.18],['titanium_white',.4]],2.4,{load:.85});
S([[1451,440.5],[1455,441.2],[1458.4,440.2]],MX(SK.half,SK.lite,.4),1,{taper:[.3,.3]});
// brows: soft strawberry, arched, thinning toward the temple
S([[1466.4,428.4],[1472,425.8],[1480,424.8],[1488,426],[1493,428.8]],[['burnt_sienna',.5],['raw_umber',.1],['titanium_white',1.1],['cadmium_orange',.12]],1.4,{taper:[.15,.75],load:.8,edge:.4});
S([[1449.6,429.6],[1454,427.6],[1460,427.6]],[['burnt_sienna',.5],['raw_umber',.15],['titanium_white',.9]],1.3,{taper:[.3,.5],load:.8,edge:.4});

// the hollow round the ear, in hair-shade, so no sky shows between ear, jaw and hair
plane([[1510,436],[1522,434],[1532,440],[1534,456],[1532,470],[1520,476],[1514,470],[1512,452]],MX(HR.shad,SK.shad,.5),4,80);
// ---- ear: half-tone, a lighter rim, a dark bowl, violet on its back edge ----
plane([[1513,446],[1518,441],[1526,442],[1528,450],[1527,460],[1521,468],[1516,465]],MX(SH,SK.refl,.4),3,85);
S([[1514.6,446],[1520,442.4],[1525.6,445],[1527.4,452]],MX(SK.refl,SK.half,.45),1.5,{taper:[.2,.3],load:1});
S([[1519.4,451],[1521,457],[1518.6,463]],MX(SK.core,SK.shad,.2),1.5,{taper:[.2,.3]});
S([[1528,450],[1527,461],[1522,468]],SK.rim,1.3,{taper:[.3,.3],load:.9});
S([[1500,490],[1510,481],[1516,470]],MX(SK.rim,SK.shad,.45),1.4,{taper:[.3,.3],load:.85,edge:.3});

// ---- last lights: a few thick touches where the planes face the sun squarely ----
S([[1458,416],[1468,413.6]],MX(SK.lite,[['titanium_white',1]],.15),2.4,{load:1.35,taper:[.25,.5],thin:.15});
S([[1459.6,437],[1456,447]],MX(SK.lite,[['titanium_white',1]],.25),1.4,{load:1.35,taper:[.3,.5],thin:.15});
S([[1472,446],[1480,447]],SK.lite,2.2,{load:1.3,taper:[.3,.5],thin:.15});
T(1444.6,453,30,1.3,MX(SK.lite,[['titanium_white',1]],.35),1.1,{load:1.35});
S([[1457,486],[1461,490]],SK.lite,1.6,{load:1.25,taper:[.3,.5],thin:.15});
// ---- marle_45_hair.js
// ================= HAIR over the skull: pulled back smooth and tight into the high ponytail =================
// One mass with three planes: the top of the head lit by the sun, the side above the ear in mid-tone, the back of
// the head in shade with a violet rim. Long strokes swept toward the tie, melted along the sweep, a few strands last.
const TIE=[1550,398];
const sweep=(x,y)=>Math.atan2(TIE[1]-y,TIE[0]-x);
const hr=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.4,edge:.3,stir:.45,load:1.05,jit:.05},o||{}));
const HAIR=[[1453,414],[1452,404],[1452,400],[1461,386],[1476,376],[1494,369],[1516,368],[1534,375],[1548,385],[1556,400],[1556,420],[1550,440],[1540,456],[1532,466],[1530,456],[1530,446],[1526,439],[1518,437],[1512,438],[1508,428],[1504,420],[1498,412],[1488,405],[1476,402.5],[1466,404],[1460,407.5],[1456,412]];
// planes: top (lit), side (mid), back (shade)
fill(HAIR,{size:7,len:6,dens:2.4,ang:sweep,angJ:4,col:(x,y)=>y<392&&x<1530?J(MX(HR.mid,HR.lite,.45),.05):x>1528||y>430?J(MX(HR.shad,HR.dark,.2),.05):J(HR.mid,.05),over:.12,so:{thin:.4,edge:.3,stir:.45,load:1.05}});
hr([[1453,404],[1468,388],[1492,377],[1518,374],[1536,380]],MX(HR.lite,HR.mid,.25),6,{load:1.2});
hr([[1458,398],[1478,384],[1504,376],[1526,377]],HR.lite,3.6,{load:1.3,thin:.25});
hr([[1512,436],[1528,420],[1546,404]],HR.shad,6);
hr([[1528,464],[1540,446],[1550,424]],MX(HR.shad,HR.dark,.4),6);
// melt along the sweep
for(const c of [[[1456,402],[1490,386],[1530,388]],[[1468,410],[1500,398],[1540,398]],[[1512,440],[1530,422],[1550,404]],[[1490,372],[1520,372],[1546,386]],[[1528,462],[1542,440],[1552,414]]])SB(c,10,.65);
// strands catching the light and darker partings, all running to the tie
for(let i=0;i<5;i++){const t=R(0,1);const x0=lerp(1454,1500,t)+R(-2,2),y0=lerp(404,379,t)+R(-2,2);
  S([[x0,y0],[lerp(x0,TIE[0],.5),lerp(y0,TIE[1],.5)-R(2,6)],[TIE[0]-R(3,10),TIE[1]-R(1,5)]],i%3===0?HR.mid:MX(HR.lite,[['titanium_white',1]],.2),R(1,1.4),{taper:[.25,.7],load:.9,stir:.4});}
for(let i=0;i<3;i++){const t=R(.15,.9);const x0=lerp(1460,1500,t),y0=lerp(406,388,t);S([[x0,y0],[lerp(x0,TIE[0],.5),lerp(y0,TIE[1],.5)-2],[TIE[0]-6,TIE[1]+1]],HR.shad,1.2,{taper:[.3,.6],load:.8,thin:.4});}
// the hairline: soft, the skin showing through at the temple; fine hairs pulled back over the ear
for(const [x,y] of [[1456,411],[1466,407],[1478,405.5],[1490,408]])S([[x,y-1.5],[x+.4,y+2.4]],MX(HR.mid,SK.half,.55),2.4,{taper:[.2,.8],edge:.7,thin:.6});
S([[1500,414],[1506,426],[1511,438]],MX(HR.mid,SK.shad,.45),2.6,{taper:[.2,.6],edge:.6,thin:.5});
S([[1504,420],[1514,414],[1530,408]],MX(HR.shad,HR.mid,.3),1.6,{taper:[.2,.6],load:.85});
// wisps at the hairline and the temple, pulled back; they break the edge of the forehead
for(const [x,y,l] of [[1454,410,10],[1462,406.5,12],[1472,404.6,12],[1484,405,10],[1495,409,10]])S([[x,y+1.5],[x+l*.5,y-2.5],[x+l,y-6]],MX(HR.mid,HR.lite,.4),1.6,{taper:[.3,.6],load:.9,stir:.4});
S([[1498,412],[1504,418],[1509,428],[1512,437]],HR.mid,3,{taper:[.2,.5],thin:.4,edge:.4});
S([[1502,420],[1510,416],[1522,410]],MX(HR.mid,HR.lite,.3),1.6,{taper:[.2,.6],load:.85});
// violet rim along the crown and the back of the head, broken
S([[1506,368],[1518,368.6]],MX(HR.rim,HR.mid,.4),1.6,{taper:[.3,.5],load:.8,edge:.5});
S([[1526,371],[1540,377],[1551,389]],HR.rim,2.2,{taper:[.3,.4],load:.85,edge:.5});
S([[1556,414],[1553,434],[1545,452]],HR.rim,1.8,{taper:[.3,.4],load:.8});
// the tie: a gold band gathering the hair
S([[1546,388],[1549,399],[1553,410]],GD.shad,4.2,{taper:.15,thin:.3});S([[1545.6,391],[1547.6,400]],GD.lite,1.6,{load:1.2});

// the hairline melted into the skin so the forehead turns softly under the hair
SB([[1452,416],[1457,410],[1466,405],[1480,403.5],[1492,407],[1501,414],[1507,425],[1511,437]],3.6,.55);
// ---- marle_50_hands.js
// ================= HANDS =================
// A hand is a mitten first: the palm block with its light side and shadow side; then the fingers as a few
// rounded, jointed forms with gaps of background between them. Fingertips are round, not pointed.
// finger(c, w, base, lit, dark, litSide): c = knuckle..tip; litSide +1/-1 = which side of the path faces the sun
const finger=(c,w,base,lit,dark,side,o)=>{o=o||{};const n=c.length;
  // the finger narrows from the knuckle to the last joint; the tip is round
  const cc=c.length<4?cr(c,8):cr(c,10);
  S(sub(cc,0,.6,12),base,w,{taper:[.02,.02],load:1.05,thin:.4,stir:.8,edge:.15});
  S(sub(cc,.5,1,10),base,w*.8,{taper:[.02,.12],load:1.05,thin:.4,stir:.8,edge:.15});
  const nrm=(i)=>{const p0=c[Math.max(0,i-1)],p1=c[Math.min(n-1,i+1)];const dx=p1[0]-p0[0],dy=p1[1]-p0[1],L=Math.hypot(dx,dy)||1;return [-dy/L,dx/L];};
  const off=(k,t1)=>c.slice(0,t1||n).map((q,i)=>{const [nx,ny]=nrm(i);return [q[0]+nx*k*w*side,q[1]+ny*k*w*side];});
  S(off(.25,n),lit,w*.32,{taper:[.2,.3],load:1.15,thin:.2,edge:.5});
  S(off(-.3,n-1),dark,w*.36,{taper:[.2,.4],load:.95,thin:.5,edge:.35});
  if(o.knuckles)for(const k of o.knuckles){const q=c[k];T(q[0],q[1],0,1.2,MX(dark,base,.5),w*.25,{load:.8,opacity:.7});}
  if(o.tip){const t=c[n-1],u=c[n-2];T(lerp(u[0],t[0],.6),lerp(u[1],t[1],.6),Math.atan2(t[1]-u[1],t[0]-u[0])*180/PI,3,MX(o.tip,base,.45),w*.4,{load:1.1,edge:.5});}
};

// ---- reaching right hand: palm toward us, thumb up, fingers out toward Crono, index and middle reaching,
//      ring and little finger curling a little behind ----
const XH=[[1194,481],[1178,474],[1162,468],[1151,466],[1146,474],[1145,485],[1149,494],[1164,500],[1180,503],[1195,500]];
fill(XH,{size:7,len:2.6,dens:2.4,ang:-170,angJ:10,col:()=>MX(SK.half,SK.shad,R(0,.25)),over:.06,so:SKS});
// the palm's planes: the ball of the thumb catches the light, the hollow of the palm in half-tone, the heel warm
S([[1190,484],[1176,478],[1164,474]],MX(SK.lite,SK.hot,.35),6,{load:1.2,thin:.25,edge:.35,taper:[.2,.4]});
S([[1172,490],[1160,488],[1152,486]],MX(SK.half,SK.shad,.35),5,{thin:.5,edge:.5});
S([[1190,498],[1174,499],[1158,496]],MX(SK.shad,SK.refl,.4),4,{thin:.5,edge:.45});
SB([[1188,490],[1170,486],[1152,482]],7,.5);
// fingers, from the back (little) to the front (index); each a little curved, jointed
finger([[1150,493],[1141,497],[1134,502],[1131,507]],5,MX(SK.half,SK.shad,.4),MX(SK.half,SK.lite,.25),MX(SK.shad,SK.core,.3),-1);
finger([[1148,486],[1135,487],[1125,490],[1118,494]],5.8,MX(SK.half,SK.shad,.2),MX(SK.lite,SK.half,.35),MX(SK.shad,SK.core,.2),-1,{tip:MX(SK.lite,SK.blush,.3)});
finger([[1148,477],[1132,475],[1119,475],[1109,477]],6.3,MX(SK.half,SK.lite,.2),SK.lite,MX(SK.shad,SK.half,.3),-1,{tip:MX(SK.lite,SK.blush,.3)});
finger([[1151,468],[1136,464],[1124,461],[1115,460]],6,MX(SK.lite,SK.half,.35),MX(SK.lite,SK.hot,.35),MX(SK.shad,SK.half,.3),-1,{tip:MX(SK.lite,[['titanium_white',1]],.3)});
// the thumb: up from the ball of the thumb, its tip curving back a little
finger([[1176,477],[1168,466],[1162,456],[1160,448]],6.4,MX(SK.half,SK.lite,.35),MX(SK.lite,SK.hot,.45),MX(SK.shad,SK.half,.3),-1,{tip:MX(SK.lite,[['titanium_white',1]],.35)});
SB([[1152,462],[1150,478],[1151,496]],6,.5);
// creases at the base of the fingers, the gate light glimpsed between the fingers
S([[1150,470],[1149,480],[1150,490]],MX(SK.shad,SK.half,.4),1.4,{taper:[.3,.3],load:.8,opacity:.75});

// gold bracelet round the wrist
S([[1196,478],[1192,485],[1191,492],[1193,499],[1197,505]],GD.mid,3.8,{taper:0,load:1.1,thin:.3});
S([[1195,480],[1192.4,486],[1192,492]],GD.lite,1.6,{load:1.35,thin:.2});S([[1193,497],[1196,503]],GD.shad,1.6,{thin:.5});

// ---- raised left hand: open, fingers up and a little spread, palm turned to the sun, against the tree ----
const LH=[[1589,322],[1586,306],[1587,292],[1591,282],[1612,282],[1615,294],[1611,308],[1608,322]];
fill(LH,{size:8,len:2.6,dens:2.4,ang:-90,angJ:8,col:()=>MX(SK.half,SK.lite,R(0,.3)),over:.05,so:SKS});
S([[1607,318],[1611,302],[1612,288]],MX(SK.half,SK.shad,.5),5,{thin:.5,edge:.35});                // little-finger edge, in shade
S([[1592,318],[1589,306],[1591,296]],MX(SK.lite,SK.hot,.3),6,{load:1.2,thin:.25,edge:.35});           // ball of the thumb, lit
S([[1595,292],[1601,289],[1608,291]],MX(SK.lite,SK.half,.3),4,{load:1.15,thin:.3,edge:.35});          // pads under the fingers
S([[1594,304],[1600,299],[1607,297]],MX(SK.half,SK.shad,.3),1.2,{taper:[.3,.4],load:.85,opacity:.8});  // palm crease
SB([[1598,320],[1600,304],[1601,290]],7,.6);
finger([[1611,288],[1613,274],[1614,263],[1614,257]],5,MX(SK.half,SK.shad,.45),MX(SK.half,SK.lite,.3),MX(SK.shad,SK.core,.3),1);
finger([[1606,285],[1607,267],[1608,254],[1608,246]],5.8,MX(SK.half,SK.shad,.15),MX(SK.lite,SK.half,.4),MX(SK.shad,SK.core,.25),1,{tip:MX(SK.lite,SK.half,.4)});
finger([[1600,284],[1600,264],[1601,249],[1602,240]],6.2,MX(SK.half,SK.lite,.3),SK.lite,MX(SK.shad,SK.half,.35),1,{tip:MX(SK.lite,[['titanium_white',1]],.25)});
finger([[1594,286],[1592,268],[1592,256],[1593,248]],6,MX(SK.lite,SK.half,.35),MX(SK.lite,SK.hot,.3),MX(SK.shad,SK.half,.35),1,{tip:MX(SK.lite,[['titanium_white',1]],.3)});
finger([[1593,314],[1585,304],[1579,294],[1576,286]],6,MX(SK.half,SK.lite,.3),MX(SK.lite,SK.hot,.4),MX(SK.shad,SK.half,.35),1,{tip:MX(SK.lite,[['titanium_white',1]],.3)});
for(const [x,y] of [[1592,268],[1600,264],[1607.5,266]])S([[x-2,y],[x+2,y+.3]],MX(SK.half,SK.shad,.25),.9,{taper:[.3,.3],load:.8,opacity:.35});
S([[1616,262],[1615,286]],[['titanium_white',2],['cerulean',.2],['cobalt_violet',.3],['venetian_red',.1]],1.2,{load:.8});   // cool edge against the tree
// gold bracelet on the raised wrist
S([[1585,324],[1597,327],[1610,324]],GD.mid,4.2,{taper:0,load:1.1,thin:.3});S([[1587,322.5],[1595,324.5]],GD.lite,1.8,{load:1.35,thin:.2});
S([[1601,328],[1609,326]],GD.shad,1.8,{thin:.5});
// ---- marle_55_pendant.js
// ================= PENDANT: a glowing stone on a fine chain at the neckline =================
S([[1444,533],[1450,544],[1456,552]],GD.shad,1.1,{load:.8,taper:[.2,.2]});S([[1480,533],[1468,546],[1460,552]],GD.shad,1.1,{load:.8,taper:[.2,.2]});
S([[1446,534],[1451,543]],GD.lite,.9,{load:.9});
// its glow on the cloth around it: thin veils, then the stone, then one hot touch
for(let i=0;i<4;i++)S([[1458+R(-6,6),556+R(-6,6)],[1458+R(-3,3),556+R(-3,3)]],[['titanium_white',3],['cerulean',.35],['cobalt_violet',.12]],R(6,10),{opacity:.28,edge:.85,thin:.6});
S([[1456.5,551.5],[1459,560]],[['cerulean',1],['titanium_white',1.6],['phthalo_blue',.06]],4.4,{load:1.3,clean:true,taper:[.1,.2]});
S([[1458.5,553],[1460,559]],[['phthalo_blue',.4],['cerulean',.6],['titanium_white',.3]],1.6,{load:1,taper:[.2,.3]});
T(1457,554,60,1.6,[['titanium_white',5]],1.6,{load:1.5,clean:true});
// ---- marle_60_finish.js
// ================= FINISH: glazes in the shadows, scumbles on the lit cloth, lost edges against the gate =================
P.dry();
// ---- glazes: violet-blue in the jumpsuit's shadows, rose-violet in the skin's, the texture below showing through ----
const GB=[['ultramarine',.3],['cobalt_violet',.35],['dioxazine_purple',.06]],GS=[['cobalt_violet',.35],['alizarin_crimson',.1],['ultramarine',.08]];
for(const c of [[[1500,540],[1508,570],[1494,604],[1470,636]],[[1446,738],[1414,766],[1376,790],[1336,814]],[[1330,860],[1334,910],[1328,960]],[[1244,896],[1234,940],[1220,990]],[[1362,704],[1336,744],[1306,790],[1270,840]]])
  S(c,GB,14,{thin:.6,opacity:.2,edge:.75});
S([[1504,486],[1512,500],[1510,520]],GS,8,{thin:.6,opacity:.22,edge:.75});                           // under the jaw, the neck's shadow
S([[1400,556],[1360,548],[1320,540],[1290,536]],GS,6,{thin:.6,opacity:.18,edge:.75});                // under the reaching arm
S([[1536,556],[1560,510],[1586,466]],GS,7,{thin:.6,opacity:.18,edge:.75});                            // the back of the raised arm
// ---- scumbles: broken, airy light paint dragged over the peaks of the lit cloth ----
const SC=MX(BU.lite,[['titanium_white',1],['naples_yellow',.08]],.3);
for(const c of [[[1410,546],[1436,540],[1458,548]],[[1392,580],[1420,574],[1446,572]],[[1340,724],[1312,760],[1288,800]],[[1278,850],[1274,900],[1276,950]],[[1200,880],[1192,920],[1186,960]]])
  S(c,SC,7,{scumble:true,load:.55,stir:.5});
// ---- lost edges: where the shadow side meets the gate of nearly the same value, a veil of gate violet over the edge ----
const GV=[['titanium_white',1.6],['cobalt_violet',.45],['ultramarine',.2]];
for(const c of [[[1456,656],[1470,640],[1490,618],[1508,594]],[[1452,704],[1440,740],[1420,766]],[[1338,884],[1338,920],[1334,956]],[[1246,900],[1238,940],[1228,976]],[[1546,452],[1552,430],[1556,410]]])
  S(c,GV,6,{thin:.7,opacity:.3,edge:.9,taper:[.3,.4]});
S([[1552,396],[1556,416],[1550,438]],GV,5,{thin:.7,opacity:.3,edge:.9,taper:[.3,.4]});                // the back of the head into the gate's glow
})();
