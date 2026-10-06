// 31_lucca: hero pass (engine v6), full 2400x1600 canvas coordinates. Built from heroes-dev/src2 by build2.sh.
(function(){const OX=0,OY=0,SEED=3111;
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
// ---- lucca_00_pal.js
// ================= LUCCA: at her console on stage right, recoiling from the gate =================
// Warm sun from the left on the front of her face and her left-facing planes; she stands against the dark telepod,
// so she reads as a light, warm figure on dark. A teenage girl: small, clean, young features.
P.dry();P.wipe();
// weight shift: she recoils from the gate, the upper body leaning back (to screen right) from the waist over the
// weight-bearing leg; the legs stay put, the lean grows from the hips up
XF=(x,y)=>{const t=clamp((842-y)/90,0,1),k=t*t*(3-2*t),a=deg(5.5)*k,cx=2150,cy=836,dx=x-cx,dy=y-cy;return [cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)];};
const SK={lite:[['titanium_white',4],['naples_yellow',.45],['vermilion',.06],['quinacridone_rose',.04]],
  half:[['titanium_white',2.4],['yellow_ochre',.16],['venetian_red',.18],['cobalt_violet',.08],['raw_umber',.04]],
  shad:[['titanium_white',1],['venetian_red',.32],['raw_umber',.2],['cobalt_violet',.18],['yellow_ochre',.08]],
  core:[['titanium_white',.4],['venetian_red',.35],['burnt_umber',.4],['cobalt_violet',.12]],
  rim:[['titanium_white',3],['cobalt_violet',.4],['quinacridone_rose',.08]],
  lip:[['titanium_white',1.6],['venetian_red',.45],['quinacridone_rose',.15]]};
const PL={lite:[['quinacridone_rose',.4],['dioxazine_purple',.15],['titanium_white',1],['burnt_sienna',.1]],mid:[['alizarin_crimson',.4],['dioxazine_purple',.25],['burnt_umber',.15],['titanium_white',.35]],
  shad:[['alizarin_crimson',.4],['dioxazine_purple',.3],['burnt_umber',.3],['titanium_white',.08]]};
const HM={lite:[['titanium_white',3],['naples_yellow',.6],['yellow_ochre',.15]],half:[['titanium_white',2],['yellow_ochre',.35],['raw_umber',.08],['naples_yellow',.3]],
  shad:[['titanium_white',.9],['yellow_ochre',.3],['raw_umber',.25],['cobalt_violet',.2]],hi:[['titanium_white',4],['naples_yellow',.2]]};
const OT={lite:[['cadmium_orange',1],['titanium_white',.7],['naples_yellow',.35]],mid:[['cadmium_orange',.9],['vermilion',.15],['titanium_white',.2]],
  shad:[['cadmium_orange',.5],['burnt_sienna',.5],['alizarin_crimson',.1],['cobalt_violet',.06]],core:[['burnt_sienna',.6],['alizarin_crimson',.2],['burnt_umber',.2]]};
const TL={lite:[['viridian',.2],['cerulean',.22],['titanium_white',1.1],['naples_yellow',.2]],mid:[['viridian',.32],['cerulean',.22],['titanium_white',.5],['raw_umber',.08]],
  shad:[['viridian',.3],['phthalo_blue',.06],['burnt_umber',.25],['cobalt_violet',.08],['titanium_white',.15]],half:[['viridian',.32],['cerulean',.22],['titanium_white',.5],['raw_umber',.08]],
  core:[['viridian',.25],['burnt_umber',.35],['ultramarine',.08],['titanium_white',.06]]};
const YS={lite:[['cadmium_yellow',.8],['titanium_white',.8],['naples_yellow',.3]],mid:[['cadmium_yellow',.8],['yellow_ochre',.4],['titanium_white',.2]],shad:[['yellow_ochre',.7],['raw_sienna',.3],['cobalt_violet',.1]]};
const BKS={mid:[['ivory_black',.5],['burnt_umber',.3],['ultramarine',.1],['titanium_white',.06]],hi:[['titanium_white',1.5],['cobalt_violet',.2],['paynes_grey',.4]]};
const BO={lite:[['burnt_sienna',.6],['yellow_ochre',.3],['titanium_white',.45]],mid:[['burnt_sienna',.6],['burnt_umber',.4],['titanium_white',.12]],
  shad:[['burnt_umber',.7],['ivory_black',.1],['cobalt_violet',.1],['titanium_white',.06]],hi:[['titanium_white',2],['naples_yellow',.4],['burnt_sienna',.2]]};
const SKS={thin:.5,edge:.2,stir:.75,load:1},SKL={thin:.2,edge:.25,stir:.6,load:1.25},CLS={thin:.5,edge:.15,stir:.7,load:1},CLL={thin:.25,edge:.3,stir:.6,load:1.2};
// ---- lucca_10_body.js
const sl0=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.25,edge:.6,stir:.85,load:1.15,jit:.03},o||{}));
// ================= BODY: boots, knees, black shorts, the orange tunic, the yellow scarf =================
const formDo=(A,B,C,o)=>{o=o||{};const al=alongAB(A,B);const w=o.w;const k=o.k||0;
  const H=MX(C.half||C.mid,C.shad,.15+k*.4),Sd=MX(C.shad,C.core||C.shad,.3+k*.3),L=MX(MX(C.lite,C.half||C.mid,.15),C.shad,k*.5);
  // the shadow side first on bare ground, then the half-tone, the light last and thickest; turns melted lightly
  fill(strip(A,B,.55,1),{size:w*.3,len:4,dens:2.3,ang:al,angJ:5,col:()=>J(Sd,.04),over:.1,so:{thin:.35,edge:.15,stir:.8}});
  fill(strip(A,B,.25,.6),{size:w*.3,len:4,dens:2.2,ang:al,angJ:5,col:()=>J(H,.04),over:.03,so:{thin:.4,edge:.2,stir:.8}});
  fill(strip(A,B,0,.3),{size:w*.3,len:4,dens:2.1,ang:al,angJ:5,col:()=>J(L,.04),over:.1,so:{thin:.25,edge:.2,stir:.75,load:1.2,clean:true}});
  SB(mid(A,B,.28,12),w*.3,.4);SB(mid(A,B,.57,12),w*.3,.35);};
SK.mid=SK.half;BO.half=BO.mid;
// her shadow on the stage boards under the feet: a thin dark glaze
for(const [x0,x1,y] of [[2066,2120,1054],[2120,2186,1060]])S([[x0,y],[(x0+x1)/2,y+2],[x1,y]],[['burnt_umber',.6],['ultramarine',.15],['alizarin_crimson',.1]],7,{thin:.8,opacity:.45,edge:.7,taper:[.3,.4]});
// ---- black shorts: two legs from under the tunic hem to just above the knee ----
const BKX={lite:MX(BKS.mid,BKS.hi,.4),half:MX(BKS.mid,BKS.hi,.12),shad:BKS.mid,core:[['ivory_black',.6],['burnt_umber',.3],['dioxazine_purple',.1]]};
formDo([[2094,826],[2096,872],[2100,916]],[[2142,830],[2139,872],[2134,916]],BKX,{w:44,k:.1});
formDo([[2146,832],[2148,874],[2150,918]],[[2194,830],[2189,874],[2183,918]],BKX,{w:42,k:.15});
S([[2142,860],[2144,880],[2145,900]],[['ivory_black',1],['burnt_umber',.2]],3,{thin:.5,edge:.4});      // the crotch seam
S([[2100,915],[2134,916]],BKS.hi,1.6,{taper:[.2,.3],load:.9});S([[2150,917],[2182,918]],BKS.hi,1.6,{taper:[.2,.3],load:.9});
// ---- knees: young, rounded, lit on the left ----
formDo([[2101,912],[2100,930],[2101,948]],[[2132,912],[2133,930],[2131,948]],SK,{w:31,k:.25});
formDo([[2151,914],[2150,932],[2151,950]],[[2181,914],[2182,932],[2180,950]],SK,{w:30,k:.35});
sl0([[2106,918],[2105,930]],MX(SK.lite,SK.half,.3),4);sl0([[2156,920],[2155,932]],MX(SK.lite,SK.half,.4),4);   // the kneecaps catch the sun
// ---- boots: calf-high brown leather, the feet turned out toward the gate ----
formDo([[2097,942],[2093,974],[2090,1004],[2084,1030]],[[2131,944],[2129,976],[2122,1006],[2110,1034]],BO,{w:34});   // the relaxed leg: knee eased forward, heel lifted
formDo([[2148,946],[2148,982],[2150,1014],[2146,1042]],[[2180,948],[2180,982],[2176,1016],[2168,1048]],BO,{w:32,k:.1});
// feet: the toes pointing down-left onto the stage, the soles dark
for(const [c,w] of [[[[2106,1030],[2094,1040],[2082,1048]],10],[[[2166,1044],[2152,1050],[2136,1054]],10]]){
  S(c,MX(BO.mid,BO.shad,.3),w,{thin:.4,load:1.05,taper:[.05,.4],stir:.8});S(c.map(q=>[q[0],q[1]-2.5]),BO.lite,w*.35,{load:1.2,taper:[.2,.5],thin:.25});
  S(c.map(q=>[q[0],q[1]+4]),[['burnt_umber',.6],['ivory_black',.3],['titanium_white',.06]],3,{thin:.4,taper:[.1,.3]});}
S([[2098,946],[2114,948],[2132,947]],MX(BO.lite,BO.mid,.3),4,{load:1.1,thin:.3,taper:[.1,.2]});S([[2148,950],[2164,952],[2180,951]],MX(BO.lite,BO.mid,.3),4,{load:1.1,thin:.3,taper:[.1,.2]});   // boot tops
S([[2101,962],[2097,996]],BO.hi,1.6,{load:1.3,taper:[.3,.5]});S([[2153,966],[2153,1004]],BO.hi,1.6,{load:1.3,taper:[.3,.5]});
// ---- orange tunic: fitted over the chest, flaring to a hem that swings as she recoils ----
const TUN=[[2148,676],[2172,670],[2196,672],[2212,686],[2208,716],[2202,744],[2210,780],[2216,808],[2218,824],[2180,824],[2140,822],[2100,822],[2074,822],[2090,786],[2112,756],[2134,740],[2138,710],[2140,688]];
fill(TUN,{size:7,len:5,dens:2.3,ang:(x,y)=>y<745?deg(-75):deg(-100+(x-2150)*.25),angJ:5,col:(x,y)=>J(MX(OT.mid,OT.shad,Math.max(0,Math.min(.75,(x-2120)/90))),.04),over:.1,so:{thin:.4,edge:.2,stir:.8}});
// lit left planes of the chest and of the skirt
S([[2146,684],[2142,710],[2140,736]],OT.lite,10,{thin:.25,load:1.2,edge:.3});
S([[2130,752],[2110,780],[2090,808]],OT.lite,11,{thin:.25,load:1.2,edge:.3});
S([[2150,756],[2134,790],[2118,818]],MX(OT.lite,OT.mid,.4),9,{thin:.3,load:1.1,edge:.35});
// shade on the right; the waist pulled in; folds of the skirt dropping from the waist
S([[2204,690],[2202,718],[2198,744]],OT.shad,8,{thin:.5,edge:.35});S([[2204,756],[2212,790],[2216,824]],OT.shad,9,{thin:.5,edge:.35});
S([[2138,744],[2170,748],[2202,746]],MX(OT.shad,OT.core,.3),3,{thin:.5,edge:.45});            // waist seam
for(const [x0,x1,c] of [[2150,2130,OT.core],[2172,2166,OT.shad],[2190,2196,OT.core]])S([[x0,758],[lerp(x0,x1,.5),790],[x1,826]],c,3.4,{thin:.5,edge:.45,taper:[.2,.3],opacity:.85});
for(const [x0,x1] of [[2142,2120],[2164,2152],[2182,2184]])S([[x0,760],[lerp(x0,x1,.5),792],[x1,824]],MX(OT.lite,OT.mid,.3),2.6,{thin:.3,load:1.1,taper:[.2,.3]});
SB([[2120,780],[2160,790],[2200,800]],12,.4);SB([[2172,690],[2176,720]],10,.5);
S([[2076,824],[2110,825],[2150,824],[2190,824],[2218,824]],OT.core,2.6,{thin:.5,edge:.35});    // the hem's underside
S([[2078,819],[2110,821],[2140,820]],OT.lite,2.2,{load:1.15,thin:.3,taper:[.1,.3]});
// ---- yellow scarf at the throat, wrapped once, its end tucked down the front ----
const SC=[[2154,660],[2178,656],[2204,662],[2208,674],[2190,680],[2166,680],[2152,674]];
fill(SC,{size:6,len:2.6,dens:2.4,ang:-5,angJ:12,col:()=>MX(YS.mid,YS.shad,R(0,.4)),over:.08,so:CLS});
S([[2156,664],[2170,661],[2186,662]],YS.lite,4,{load:1.25,thin:.25,taper:[.2,.3]});
S([[2184,674],[2200,672],[2208,668]],YS.shad,3,{thin:.5,edge:.4});
S([[2162,676],[2160,690],[2164,704]],YS.mid,5,{thin:.4,load:1.05,taper:[.1,.4]});S([[2159,678],[2157,692]],YS.lite,2,{load:1.2,taper:[.2,.4]});
// ---- lucca_20_arms.js
// ================= ARMS (teal sleeves) and HANDS =================
// right arm (screen left): elbow out, the hand going to the levers
formDo([[2142,680],[2114,690],[2088,700]],[[2144,704],[2116,716],[2094,724]],TL,{w:22,lf:.2,sf:.8});
formDo([[2084,702],[2066,690],[2052,674]],[[2098,722],[2076,708],[2060,690]],TL,{w:18,lf:.22,sf:.8});
S([[2088,714],[2096,722]],TL.shad,5,{thin:.5,edge:.4});
S([[2054,676],[2062,688]],MX(TL.mid,TL.lite,.3),4.4,{thin:.4,load:1.1});           // cuff
// left arm (screen right): thrown up, the upper arm rising past the head, the forearm out to the right
formDo([[2196,688],[2206,650],[2214,618]],[[2218,700],[2230,656],[2238,620]],TL,{w:22,lf:.2,sf:.8});
formDo([[2214,614],[2234,596],[2252,578]],[[2234,628],[2250,608],[2264,592]],TL,{w:18,lf:.22,sf:.8});
S([[2226,618],[2236,626]],TL.shad,5,{thin:.5,edge:.4});
S([[2250,580],[2260,592]],MX(TL.mid,TL.lite,.3),4.4,{thin:.4,load:1.1});           // cuff
// ---- right hand: half-closed, reaching for the lever; the back of the hand to us, knuckles lit, fingers curled under ----
const LRH=[[2054,664],[2046,654],[2036,651],[2029,656],[2028,666],[2034,676],[2046,680],[2054,676]];
fill(LRH,{size:4,len:5,dens:2.4,ang:-145,angJ:5,col:()=>J(MX(SK.half,SK.shad,.2),.03),over:.06,so:{thin:.4,edge:.3,stir:.8}});
S([[2052,664],[2043,658],[2034,655]],SK.lite,3.4,{load:1.2,thin:.25,edge:.5});                                   // the back of the hand in the sun
S([[2050,677],[2040,676],[2032,671]],MX(SK.shad,SK.core,.2),2.6,{thin:.5,edge:.5});                               // the palm side, shade
SB([[2050,670],[2040,666],[2032,662]],4,.45);
for(const [x,y,k] of [[2030,659,0],[2029,664.5,.15],[2030.5,670,.3]])S([[x+5,y-.5],[x+1.4,y],[x,y+2]],MX(MX(SK.half,SK.lite,.25),SK.shad,k),2.6,{taper:[.05,.2],load:1.05,edge:.3});   // curled fingers
for(const [x,y] of [[2034,657],[2033,662.6],[2034,668]])T(x,y,0,1,MX(SK.lite,SK.half,.2),1.2,{load:1.1});              // knuckles catching light
S([[2042,654],[2036,650],[2031,651]],MX(SK.lite,SK.half,.3),2.4,{taper:[.1,.3],load:1.1,edge:.35});                      // thumb
// ---- left hand: open, fingers spread, palm out against the glare ----
const LLH=[[2258,584],[2262,574],[2272,568],[2282,570],[2284,580],[2276,590],[2264,592]];
fill(LLH,{size:5,len:2.4,dens:2.4,ang:-30,angJ:12,col:()=>MX(SK.half,SK.lite,R(0,.3)),over:.06,so:SKS});
S([[2262,586],[2268,576],[2276,572]],SK.lite,3.6,{load:1.2,thin:.25,edge:.35});S([[2266,592],[2278,588],[2284,582]],SK.shad,3,{thin:.5,edge:.4});
for(const [b,t,w] of [[[2274,570],[2280,557],3],[[2279,572],[2290,562],3.2],[[2282,577],[2295,571],3],[[2283,583],[2294,584],2.6]]){
  S([b,[lerp(b[0],t[0],.6),lerp(b[1],t[1],.6)-1],t],MX(SK.half,SK.lite,.35),w,{taper:[.05,.12],thin:.4,load:1.05});
  S([[b[0]-.6,b[1]-.6],[t[0]-.6,t[1]-.8]],SK.lite,w*.35,{taper:[.2,.3],load:1.2});}
S([[2264,576],[2262,566],[2264,558]],MX(SK.half,SK.lite,.3),3,{taper:[.05,.15],thin:.4,load:1.05});      // thumb
// ---- lucca_30_head.js
// ================= HEAD: three-quarter to screen left, round glasses, plum bob under a cream helmet =================
// neck
fill([[2166,652],[2186,648],[2190,660],[2184,668],[2168,668]],{size:4.4,len:5,dens:2.4,ang:85,angJ:4,col:()=>J(MX(SK.shad,SK.half,.35),.03),over:.06,so:{thin:.4,edge:.3,stir:.8}});
// ---- plum bob behind the face (the far side of the head and the back) ----
const BOB=[[2184,608],[2204,606],[2216,616],[2218,634],[2214,650],[2206,658],[2194,656],[2190,644],[2190,628],[2186,616]];
fill(BOB,{size:6,len:2.8,dens:2.3,ang:95,angJ:10,col:()=>MX(PL.mid,PL.shad,R(0,.5)),over:.08,so:{thin:.45,edge:.2,stir:.5}});
S([[2192,614],[2196,632],[2194,650]],PL.lite,3.4,{load:1.15,thin:.3,edge:.35,taper:[.2,.4]});
S([[2208,616],[2212,636],[2208,654]],PL.shad,4,{thin:.5,edge:.35});
S([[2192,654],[2200,658],[2210,656]],PL.mid,2.6,{thin:.4,taper:[.2,.3]});                     // the blunt cut at the jaw
// ---- face: a clean young face; few, soft strokes; the planes melted, not mottled ----
const sl=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.25,edge:.6,stir:.85,load:1.15,jit:.03},o||{}));
const sk=(c,col,size,o)=>S(c,col,size,Object.assign({thin:.45,edge:.6,stir:.8,load:1},o||{}));
SK.blush=[['titanium_white',2.5],['quinacridone_rose',.14],['vermilion',.08]];
const LF=[[2158,611],[2190,612],[2192,626],[2190,640],[2184,650],[2175,656],[2166,658],[2160,655],[2158,649],[2157,642],[2155,636],[2153,632],[2155,626],[2156,618]];
fill(LF,{size:5,len:6,dens:2.4,ang:(x,y)=>deg(84+(x-2170)*.4),angJ:4,col:(x,y)=>J(MX(SK.half,SK.lite,Math.max(0,.55-(x-2160)/50)),.03),over:.1,so:{thin:.4,edge:.3,stir:.8,load:1}});
// the side plane toward the hair, turned from the sun
fill([[2180,613],[2190,612],[2192,626],[2190,640],[2184,650],[2176,656],[2179,642],[2181,628]],{size:4.4,len:6,dens:2.4,ang:86,angJ:4,col:()=>J(MX(SK.half,SK.shad,.4),.03),over:.08,so:{thin:.4,edge:.3,stir:.8}});
// the light: the front of the cheek, the cheekbone under the near lens, the chin
sl([[2162,630],[2164,640],[2165,648]],SK.lite,5);
sl([[2170,632],[2172,642],[2170,650]],MX(SK.lite,SK.half,.3),4.4);
sl([[2162,652],[2168,655]],MX(SK.lite,SK.half,.15),3.2);
// the brim's shadow across the forehead, soft
sk([[2156,615],[2170,615.6],[2188,616]],MX(SK.half,SK.shad,.35),4,{opacity:.85});
// melt
for(let y=614;y<=654;y+=5)SB([[2155+(y>648?(y-648)*.6:0),y],[2168,y+.4],[2184-(y>640?(y-640)*.7:0),y]],5,.4);
SB([[2178,614],[2180,634],[2176,652]],5,.55);
// the jaw turning under, a cool shade beneath it
sk([[2160,657],[2170,659],[2180,655],[2187,648]],MX(SK.shad,SK.half,.3),2.6,{edge:.5});
// a girl's warm cheek
S([[2172,640],[2177,645]],SK.blush,4,{edge:.85,thin:.6,opacity:.45});
// nose: small, a little upturned; a soft shade on its far side, a light on the tip, the nostril a dot
sk([[2161,624],[2161.4,630],[2160,634]],MX(SK.half,SK.shad,.3),1.8,{opacity:.85});
T(2155.6,632,0,1.4,MX(SK.lite,SK.blush,.3),1.8,{load:1.15});
T(2158.6,634.6,0,1,MX(SK.shad,SK.core,.25),1,{opacity:.8});
sk([[2157,636.4],[2162,637]],MX(SK.half,SK.shad,.25),1.4,{opacity:.6});
// mouth: small, a little open in surprise
S([[2157.6,643],[2161,642.6],[2165,643.2]],MX(SK.lip,SK.half,.3),1.5,{thin:.5,edge:.4,taper:[.2,.3]});
T(2160.6,644,0,1.8,[['burnt_umber',.5],['alizarin_crimson',.3],['titanium_white',.25]],1,{});
S([[2158.6,645.6],[2162.6,645.8]],MX(SK.lip,SK.lite,.5),1.3,{thin:.4,edge:.4,taper:[.2,.3]});
sk([[2159,648.6],[2163,649]],MX(SK.half,SK.shad,.2),1.4,{opacity:.6});
// eyes behind the lenses: wide open; a dark upper lid, the iris, a little white
S([[2168,623],[2172,622],[2176,623]],[['burnt_umber',1],['ivory_black',.2],['dioxazine_purple',.1]],1.2,{taper:[.15,.35],load:.9});
T(2171.8,624.4,90,1.6,[['burnt_umber',.6],['ultramarine',.15],['titanium_white',.25]],1.7,{load:.9});
T(2171.4,623.8,0,.4,[['titanium_white',4]],.6,{load:1.3,clean:true});
S([[2154.8,623],[2158.2,622.6]],[['burnt_umber',1],['ivory_black',.2]],1,{taper:[.2,.3],load:.9});
T(2156.6,624.2,90,1.3,[['burnt_umber',.6],['ultramarine',.15],['titanium_white',.25]],1.2,{load:.85});
// brows, plum-brown, raised in surprise
S([[2166,618],[2171,616.8],[2177,617.4]],[['alizarin_crimson',.3],['burnt_umber',.4],['titanium_white',.5]],1.1,{taper:[.2,.5],load:.8});
S([[2154.6,618.8],[2158.6,618]],[['alizarin_crimson',.3],['burnt_umber',.4],['titanium_white',.5]],.9,{taper:[.2,.5],load:.8});
// glasses: thin light gold rims, round; the far lens foreshortened; a glint on the near lens
const ring=(cx,cy,rx,ry,col,w)=>{const c=[];for(let i=0;i<=14;i++){const a=i/14*TAU+.3;c.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}S(c,col,w,{taper:[.04,.04],load:.95,thin:.3,raw:true});};
ring(2172,624,5.6,5.8,[['naples_yellow',.6],['yellow_ochre',.4],['titanium_white',.6]],1.05);
ring(2157,623.6,3.6,5.2,[['yellow_ochre',.6],['raw_sienna',.2],['titanium_white',.4]],1);
S([[2160.6,623],[2166.4,623.2]],[['yellow_ochre',.6],['titanium_white',.4]],.9,{load:.9});                // bridge
S([[2177.6,623.2],[2186,624],[2191,625]],[['yellow_ochre',.5],['raw_umber',.2],['titanium_white',.3]],.9,{load:.85,taper:[.2,.3]});   // temple arm
T(2169.6,620.6,-40,2,[['titanium_white',5]],1,{load:1.4,clean:true});                                     // glint
// bangs: a blunt plum fringe under the brim
S([[2156,613],[2170,614],[2186,614]],PL.mid,3,{thin:.45,load:1,taper:[.1,.2]});
for(const x of [2160,2167,2174,2181])S([[x,611],[x-.5,616]],MX(PL.mid,PL.lite,.4),2,{taper:[.1,.5],load:1});
// ---- helmet: a cream dome, orange band at the brim, antenna on the right with a red ball ----
const HMT=[[2150,610],[2154,598],[2166,589],[2184,585],[2202,588],[2212,598],[2214,612]];
fill(HMT,{size:5,len:6,dens:2.4,ang:(x,y)=>deg(-8+(x-2180)*.9),angJ:5,col:(x,y)=>J(MX(HM.half,HM.shad,Math.max(0,Math.min(.8,(x-2172)/40))),.03),over:.08,so:{thin:.4,edge:.25,stir:.8}});
SB([[2156,604],[2180,590],[2206,598]],6,.45);
S([[2154,604],[2162,594],[2176,588],[2190,587]],HM.lite,5,{load:1.25,thin:.25,edge:.35});
S([[2200,592],[2210,602],[2213,610]],HM.shad,4,{thin:.5,edge:.4});
S([[2164,592],[2172,589]],HM.hi,1.8,{load:1.4,clean:true,taper:[.2,.4]});
S([[2150,609],[2166,607],[2184,607],[2200,609],[2214,612]],OT.mid,3.6,{load:1.1,thin:.3,taper:[.05,.1]});
S([[2152,607],[2170,605],[2186,605]],OT.lite,1.5,{load:1.2,taper:[.2,.4]});
S([[2196,590],[2199,566],[2201,546],[2202,536]],[['raw_sienna',.6],['burnt_umber',.3],['titanium_white',.3]],1.5,{load:.95,taper:[.05,.2]});
S([[2195.4,588],[2198.4,562]],[['titanium_white',2],['naples_yellow',.4]],.8,{load:.9,taper:[.2,.4]});
S([[2202,533],[2202.4,537]],[['cadmium_red',1],['vermilion',.3],['titanium_white',.1]],5,{load:1.2,taper:0});
T(2200.6,533.2,0,1,[['titanium_white',4],['naples_yellow',.3]],1.2,{load:1.4,clean:true});
// ---- lucca_40_finish.js
// ================= FINISH: sleeve folds, the tunic's form, glazes in the shadows, scumbles on the lit cloth, lost edges =================
P.dry();
// ---- the sleeves: soft folds bunching at the elbows and the inside of the raised arm; cuffs ----
const sfold=(c,w)=>{S(c,MX(TL.shad,TL.core,.3),w,{thin:.45,edge:.55,taper:[.2,.5],opacity:.8});S(c.map(q=>[q[0]-w*.5,q[1]-w*.5]),MX(TL.lite,TL.mid,.3),w*.55,{thin:.25,edge:.45,taper:[.25,.5],load:1.1,clean:true});};
sfold([[2094,712],[2088,704],[2084,694]],2.6);sfold([[2108,706],[2100,700]],2.2);sfold([[2076,700],[2070,692]],2);
sfold([[2222,640],[2226,628],[2222,618]],2.6);sfold([[2238,612],[2232,604]],2.2);sfold([[2208,664],[2214,650]],2.2);
// ---- the tunic: the chest's lit plane, the waist pulled in, the flare of the skirt turning from the sun ----
S([[2150,690],[2160,700],[2168,716]],MX(OT.lite,[['titanium_white',1]],.15),6,{scumble:true,load:.55,stir:.5});
for(const c of [[[2126,760],[2108,786],[2092,810]],[[2148,764],[2136,792],[2124,816]]])S(c,MX(OT.lite,[['titanium_white',1]],.2),7,{scumble:true,load:.5,stir:.5});
const GL_O=[['alizarin_crimson',.35],['burnt_sienna',.3],['ultramarine',.1]];
S([[2204,690],[2202,720],[2198,746]],GL_O,10,{thin:.6,opacity:.25,edge:.7});
S([[2196,760],[2208,792],[2214,820]],GL_O,14,{thin:.6,opacity:.25,edge:.7});
S([[2176,760],[2184,792],[2188,820]],GL_O,6,{thin:.6,opacity:.2,edge:.7});
S([[2140,748],[2172,752],[2204,750]],GL_O,5,{thin:.6,opacity:.3,edge:.6});                                 // the waist pulled in
S([[2184,600],[2192,620],[2196,640]],[['dioxazine_purple',.3],['alizarin_crimson',.2],['ultramarine',.1]],6,{thin:.6,opacity:.25,edge:.7});   // the bob in shadow
S([[2176,906],[2180,930],[2178,1010]],[['burnt_umber',.5],['ultramarine',.25]],8,{thin:.6,opacity:.2,edge:.7});   // the shaded leg
// ---- lost edges: the dark side of the figure sinks into the dark telepod behind it; the lit side stays found ----
const POD=[['burnt_umber',.5],['raw_sienna',.3],['ultramarine',.1],['titanium_white',.15]];
S([[2214,700],[2210,740],[2218,790],[2222,824]],POD,6,{thin:.7,opacity:.3,edge:.85,taper:[.3,.4]});
S([[2194,836],[2188,876],[2184,912]],[['ivory_black',.4],['burnt_umber',.4],['ultramarine',.1]],5,{thin:.7,opacity:.3,edge:.85,taper:[.3,.4]});
S([[2182,950],[2180,990],[2172,1040]],POD,5,{thin:.7,opacity:.3,edge:.85,taper:[.3,.4]});
})();
