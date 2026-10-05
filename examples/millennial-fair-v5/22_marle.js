// ===== lib3d: figure painting helpers (engine v5, full 2400x1600 canvas coords) =====
// Shapes are written in REF coordinates (the 2x crop of the 3D reference). T() maps them to canvas.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const R=(a,b)=>p.rand(a,b);
let OX=0,OY=0,SC=.5,SZ=1,GX=0,GY=0;
const T=(x,y)=>[OX+x*SC-GX,OY+y*SC-GY];
const pr=(i,n)=>{const f=n<2?.5:i/(n-1);return .4+.6*Math.sin(Math.PI*clamp(f*.9+.05,0,1));};
function cat(a,b,c,d,u){return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u);}
function cr(pts,t){const n=pts.length-1;if(n<1)return pts[0];const f=clamp(t,0,1)*n;const i=Math.min(n-1,Math.floor(f));const u=f-i;
 const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(n,i+2)];
 return [cat(p0[0],p1[0],p2[0],p3[0],u),cat(p0[1],p1[1],p2[1],p3[1],u)];}
function ccr(pts,ns){const n=pts.length,o=[];for(let i=0;i<n;i++){const a=pts[(i+n-1)%n],b=pts[i],c=pts[(i+1)%n],d=pts[(i+2)%n];for(let k=0;k<ns;k++){const u=k/ns;o.push([cat(a[0],b[0],c[0],d[0],u),cat(a[1],b[1],c[1],d[1],u)]);}}return o;}
function alen(pts){let L=0,pv=cr(pts,0);for(let i=1;i<=20;i++){const q=cr(pts,i/20);L+=Math.hypot(q[0]-pv[0],q[1]-pv[1]);pv=q;}return L;}
function inside(poly,x,y){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
function dedge(poly,x,y){let m=1e9;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];const dx=b[0]-a[0],dy=b[1]-a[1];const L2=dx*dx+dy*dy||1;let t=clamp(((x-a[0])*dx+(y-a[1])*dy)/L2,0,1);const d=Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t));if(d<m)m=d;}return m;}
// ---- colour -----------------------------------------------------------------
const J=(m,k)=>m.map(([n,w])=>[n,w*R(1-(k||.16),1+(k||.16))]);
function mixL(a,b,t){const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]).filter(q=>q[1]>0.001);}
// gradient colour along ref line A->B through stops (mixes); returns fn(x,y) in canvas coords
function GR(A,B,stops,jit){const a=T(A[0],A[1]),b=T(B[0],B[1]);const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;
 return (x,y)=>{let t=clamp(((x-a[0])*dx+(y-a[1])*dy)/L2+R(-.05,.05),0,1);const f=t*(stops.length-1);const i=Math.min(stops.length-2,Math.floor(f));return J(mixL(stops[i],stops[i+1],f-i),jit);};}
const CC=m=>()=>J(m);
// ---- direction fields (return radians, in canvas space) ----------------------
const DEG=d=>d*Math.PI/180;
const ANG=d=>()=>DEG(d);
function AXF(ctl){const c=ctl.map(q=>T(q[0],q[1]));return (x,y)=>{let best=1e9,ang=0;for(let i=0;i<c.length-1;i++){const a=c[i],b=c[i+1];const dx=b[0]-a[0],dy=b[1]-a[1];const L2=dx*dx+dy*dy||1;const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/L2,0,1);const d=Math.hypot(x-(a[0]+dx*t),y-(a[1]+dy*t));if(d<best){best=d;ang=Math.atan2(dy,dx);}}return ang;};}
function TANG(cx,cy){const c=T(cx,cy);return (x,y)=>Math.atan2(x-c[0],-(y-c[1]));}
function RADF(cx,cy){const c=T(cx,cy);return (x,y)=>Math.atan2(y-c[1],x-c[0]);}
// ---- strokes -----------------------------------------------------------------
const F=(pts,col,size,o)=>{if(pts.some(q=>!isFinite(q[0])||!isFinite(q[1]))||!isFinite(size))throw new Error('NaN stroke');
 return p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],q[2]===undefined?pr(i,pts.length):q[2]]),color:typeof col==='function'?col():J(col),brush:'filbert',size:size,load:1,thin:.4},o||{}));};
// stroke along a REF-coordinate control path
const PATH=(ctl,col,size,o,n)=>{size*=SZ;const c=ctl.map(q=>T(q[0],q[1]));n=n||Math.max(3,Math.min(9,Math.round(alen(c)/(size*1.1))+2));const pts=[];for(let i=0;i<n;i++)pts.push(cr(c,i/(n-1)));return F(pts,col,size,o);};
const SOFT=(ctl,size,op,o)=>{const c=ctl.map(q=>T(q[0],q[1]));size=Math.min(size,70);const n=Math.max(3,Math.min(8,Math.round(alen(c)/(size*.7))+2));const pts=[];for(let i=0;i<n;i++){const q=cr(c,i/(n-1));pts.push([q[0],q[1],.8]);}
 return p.stroke(Object.assign({points:pts,brush:'soft',size:size,opacity:op===undefined?.5:op,load:0,color:'titanium_white'},o||{}));};
const DB=(x,y,size,col,o)=>{size*=SZ;const q=T(x,y);return p.dab(Object.assign({x:q[0],y:q[1],size:size,color:typeof col==='function'?col():J(col),brush:'round',load:1.1,pressure:.85},o||{}));};
// ---- fill a closed shape (REF ctl) with streamline strokes -------------------
// o: size,len,cover,ang(fn),col(fn),thin,load,op,brush,order('u'|'rand'),edge,taper
function fill(ctl,o){o=o||{};const poly=o.sharp?ctl.map(q=>T(q[0],q[1])):ccr(ctl.map(q=>T(q[0],q[1])),5);
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of poly){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1]);}
 const size=(o.size||14)*SZ,len=(o.len||(o.size||14)*2.6)*SZ,cov=o.cover||1;const mg=size*.3;const ang=o.ang||ANG(90);const col=o.col;
 const sx=Math.max(3,len*.5/cov),sy=Math.max(3,size*.62/cov);
 // jittered grid in a frame rotated by the mean direction so rows follow the form
 const a0=ang((x0+x1)/2,(y0+y1)/2);const ca=Math.cos(a0),sa=Math.sin(a0);
 const cx=(x0+x1)/2,cy=(y0+y1)/2;const Rr=Math.hypot(x1-x0,y1-y0)/2+size;
 const items=[];
 for(let v=-Rr;v<=Rr;v+=sy)for(let u=-Rr;u<=Rr;u+=sx){
  const uu=u+R(-.5,.5)*sx*1.1,vv=v+R(-.5,.5)*sy*1.1;
  const x=cx+uu*ca-vv*sa,y=cy+uu*sa+vv*ca;
  const ins=inside(poly,x,y);const d0=dedge(poly,x,y);if(!ins&&d0>mg)continue;const dd=ins?d0:-d0;
  const sz=Math.max(2.5,Math.min(size*R(.78,1.22),(dd+mg)*2+1));
  const L=len*R(.7,1.3);const step=L/5;
  const jit=R(-.16,.16)*(o.wob===undefined?1:o.wob);const trace=(sg)=>{const r=[];let px=x,py=y,pa=ang(x,y);for(let k=0;k<3;k++){let a=ang(px,py)+jit*(k+1)*.4;let dx=Math.cos(a),dy=Math.sin(a);if(dx*Math.cos(pa)+dy*Math.sin(pa)<0){dx=-dx;dy=-dy;a+=Math.PI;}pa=a;
    const nx=px+sg*dx*step*(k===0?.5:1),ny=py+sg*dy*step*(k===0?.5:1);if(!inside(poly,nx,ny)&&dedge(poly,nx,ny)>mg)break;r.push([nx,ny]);px=nx;py=ny;}return r;};
  const bw=trace(-1).reverse(),fw=trace(1);const pts=bw.concat([[x,y]],fw);
  if(pts.length<2){pts.push([x+Math.cos(a0)*2,y+Math.sin(a0)*2]);}
  items.push({pts,sz,x,y,u:o.u?o.u(x,y):R(0,1)});}
 if(o.order==='u')items.sort((a,b)=>a.u-b.u);else for(let i=items.length-1;i>0;i--){const j=Math.floor(R(0,i+1));[items[i],items[j]]=[items[j],items[i]];}
 let n=0;
 for(const s of items){const c=col(s.x,s.y);F(s.pts.map((q,i)=>[q[0],q[1],pr(i,s.pts.length)]),c,s.sz,Object.assign({load:R(.95,1.15),thin:o.thin===undefined?.4:o.thin,opacity:o.op===undefined?1:o.op},o.o||{}));n++;}
 
 if(o.blend){const nb=Math.max(2,Math.round(o.blend*polyArea(poly)/(Math.pow(Math.min(70,size*(o.bsz||1.8)),2)*2.2)));
  for(let i=0;i<nb;i++){let x,y,t=0;do{x=R(x0,x1);y=R(y0,y1);t++;}while(!inside(poly,x,y)&&t<60);if(t>=60)continue;
   const d0=dedge(poly,x,y);const bsz=Math.min(70,size*(o.bsz||1.8),d0*2.2);if(bsz<4)continue;
   const a=ang(x,y)+(o.bang===undefined?R(-.9,.9):o.bang);const L=bsz*R(.9,1.6);
   const pts=[];let ok=true;for(let k=0;k<4;k++){const f=k/3-.5;const qx=x+Math.cos(a)*L*f,qy=y+Math.sin(a)*L*f;if(!inside(poly,qx,qy)){ok=false;break;}pts.push([qx,qy,.8]);}
   if(!ok)continue;
   p.stroke({points:pts,brush:'soft',size:bsz,opacity:o.bop||.4,load:0,color:'titanium_white'});}}
 return n;}
function polyArea(P){let a=0;for(let i=0,j=P.length-1;i<P.length;j=i++)a+=(P[j][0]+P[i][0])*(P[j][1]-P[i][1]);return Math.abs(a/2);}
// ---- tubes: limbs as axis + widths (ref coords) ------------------------------
function wat(ws,t){if(ws.length===1)return ws[0];const n=ws.length-1;const f=clamp(t,0,1)*n;const i=Math.min(n-1,Math.floor(f));const u=f-i;const s=u*u*(3-2*u);return ws[i]+(ws[i+1]-ws[i])*s;}
function cdir(pts,t){const a=cr(pts,Math.max(0,t-.03)),b=cr(pts,Math.min(1,t+.03));const dx=b[0]-a[0],dy=b[1]-a[1];const L=Math.hypot(dx,dy)||1;return [dx/L,dy/L];}
function TUBE(ax,ws,n){n=n||Math.max(8,Math.round(alen(ax)/14));const Lf=[],Rt=[];
 for(let i=0;i<=n;i++){const t=i/n,q=cr(ax,t),d=cdir(ax,t),w=wat(ws,t)/2;Lf.push([q[0]-d[1]*w,q[1]+d[0]*w]);Rt.push([q[0]+d[1]*w,q[1]-d[0]*w]);}
 return Lf.concat(Rt.reverse());}
const LV=[-.78,-.62]; // toward the sun (canvas)
// colour across a tube: lit edge u=0 ... shadow edge u=1 (light vector lv), stops = mixes
function GRT(ax,ws,stops,o){o=o||{};const lv=o.lv||LV;const N=24;const S=[];
 for(let i=0;i<=N;i++){const t=i/N,q=cr(ax,t),d=cdir(ax,t),w=wat(ws,t)/2*SC;const c=T(q[0],q[1]);let nx=-d[1],ny=d[0];if(nx*lv[0]+ny*lv[1]<0){nx=-nx;ny=-ny;}S.push({x:c[0],y:c[1],nx,ny,w});}
 return (x,y)=>{let b=1e9,k=0;for(let i=0;i<=N;i++){const d=(x-S[i].x)**2+(y-S[i].y)**2;if(d<b){b=d;k=i;}}const s=S[k];const off=((x-s.x)*s.nx+(y-s.y)*s.ny)/Math.max(s.w,1);
  let u=clamp(.5-.5*off+(o.bias||0)+R(-.05,.05),0,1);const f=u*(stops.length-1);const i=Math.min(stops.length-2,Math.floor(f));return J(mixL(stops[i],stops[i+1],f-i),o.jit);};}
// paint a tube: planes light->shadow across the width, strokes along the axis
function LIMB(ax,ws,stops,o){o=o||{};return fill(TUBE(ax,ws),Object.assign({ang:AXF(ax),col:GRT(ax,ws,stops,o)},o));}
// ===== kit: helpers added in r6 on top of lib3d =====
// smooth value noise for direction fields so strokes do not read as parallel hatching
const _nz=[];for(let i=0;i<64;i++)_nz.push(R(0,1));
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y);const xf=x-xi,yf=y-yi;const h=(a,b)=>_nz[((a*7+b*13)%64+64)%64];
 const s=t=>t*t*(3-2*t);const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return lerp(lerp(a,b,s(xf)),lerp(c,d,s(xf)),s(yf));}
// wrap an angle field with smooth noise (amp in radians, scale in px)
const NZF=(f,amp,sc)=>(x,y)=>f(x,y)+amp*(vnoise(x/(sc||18),y/(sc||18))-.5)*2;
// set the REF->canvas mapping: ref image (rx,ry) -> crop origin (cx,cy) at refScale, then scaled by k about F
function MAP(cx,cy,refScale,Fx,Fy,k,dx,dy){SC=k/refScale;OX=Fx+k*(cx-Fx)+(dx||0);OY=Fy+k*(cy-Fy)+(dy||0);GX=(typeof __GX!=='undefined'?__GX:0);GY=(typeof __GY!=='undefined'?__GY:0);}
// cool rim light along a REF path
const RIMC=[['cerulean',.5],['titanium_white',1],['cobalt_violet',.35]];
const RIMW=[['titanium_white',1],['naples_yellow',.5],['cadmium_yellow',.1]];
const RIM=(ctl,size,op,col)=>PATH(ctl,col||RIMC,size*.8,{op:(op===undefined?.7:op)*.8,taper:[.35,.6],thin:.5});
// fold: dark soft crease with a lighter lip beside it. ctl in REF coords, dark/light = colour mixes
function FOLD(ctl,size,dark,light,op,off){off=off||[2,-2];const c2=ctl.map(q=>[q[0]+off[0],q[1]+off[1]]);
 PATH(ctl,dark,size,{op:op===undefined?.6:op,taper:[.25,.7],thin:.5});PATH(c2,light,size*.45,{op:(op===undefined?.6:op)*.5,taper:[.35,.7],thin:.5});}
// finger: small tapered stroke from a base along a bent path (REF coords)
const FNG=(ctl,size,col,op)=>PATH(ctl,col,size,{op:op===undefined?.95:op,taper:[.1,.55],thin:.35});
// glowing source in canvas coords: stacked translucent discs, brightening toward the centre, melted into a smooth falloff, then a hot core
function GLOW(x,y,r,core,halo,o){o=o||{};x-=GX;y-=GY;halo=halo||[['cerulean',.5],['titanium_white',1],['cobalt_violet',.1]];
 const rings=[[7,.16,0],[5.4,.16,.2],[4.1,.18,.4],[3.1,.2,.6],[2.2,.24,.8],[1.5,.3,1]];
 for(const [m,op,w] of rings){const col=mixL(halo,[['titanium_white',3]],w);
  p.stroke({points:[[x-m*r*.15,y,.9],[x+m*r*.15,y,.9]],brush:'round',size:m*r*2,color:col,load:1,opacity:op*(o.k||1),edge:.95,taper:[.3,.3],thin:.9});}
 p.stroke({points:[[x-r*3,y-r,.8],[x+r*3,y+r,.8]],brush:'soft',size:r*7,opacity:.5});
 p.stroke({points:[[x-r*2,y+r,.8],[x+r*2,y-r,.8]],brush:'soft',size:r*5,opacity:.4});
 p.dab({x:x,y:y,size:r*1.2,color:core||[['titanium_white',3]],brush:'round',load:1.3,pressure:.95});}
// sparse second layer of short strokes crossing the first, to break up hatching and add colour
const GLZ=(ctl,col,ang,o)=>fill(ctl,Object.assign({size:5,len:12,cover:.6,ang:NZF(ang,.5,16),col:col,op:.38,thin:.75,wob:2,blend:.8,bop:.4,o:{edge:.7}},o||{}));
// a cast/form shadow shape: strong, cool, edges melted so it can be lost on one side
const SHD=(ctl,col,ang,o)=>fill(ctl,Object.assign({size:6,len:16,cover:1,ang:NZF(ang,.35,18),col:col,op:.78,thin:.6,wob:1.5,blend:1.1,bop:.5,o:{edge:.6}},o||{}));
// broken colour: a share of strokes in every fill carry a touch of a warm or a cool accent, so planes shimmer instead of sitting flat
const _COOL={cerulean:1,cobalt_blue:1,ultramarine:1,prussian_blue:1,phthalo_blue:1,viridian:1,paynes_grey:1,cobalt_violet:1,dioxazine_purple:1,manganese_blue:1};
const BRK=(f,k)=>(x,y)=>{const c=f(x,y);const r=R(0,1);k=k||.12;if(r>=.44)return c;
 let tot=0,cool=0;for(const [n,w] of c){if(n==='titanium_white'||n==='zinc_white')continue;tot+=w;if(_COOL[n])cool+=w;}
 const isCool=tot>0&&cool/tot>.5;
 if(r<.22)return mixL(c,isCool?[['quinacridone_rose',.3],['cobalt_violet',.2],['titanium_white',.3]]:[['cadmium_orange',.25],['naples_yellow',.35],['quinacridone_rose',.08]],k);
 return mixL(c,isCool?[['cerulean',.3],['titanium_white',.4],['cobalt_violet',.05]]:[['cobalt_violet',.3],['cerulean',.2],['ultramarine',.1]],k);};
let NOBRK=false;
const _fill=fill;
// every large form gets a base layer, then a sparser, finer second layer crossing it at about 55-65 degrees (set nox:1 to skip)
fill=function(ctl,o){if(!o||!o.col)return _fill(ctl,o);if(NOBRK)return _fill(ctl,o);
 const o2=Object.assign({},o,{col:BRK(o.col,o.brk)});const n=_fill(ctl,o2);
 if(!o.nox&&!o.sharp&&(o.size||14)>=3.6){const poly=ctl.map(q=>T(q[0],q[1]));
  if(polyArea(poly)>1200){const rot=o.xl||(1.0+R(-.2,.2));const ang0=o.ang||ANG(90);const sz=(o.size||14);
   _fill(ctl,Object.assign({},o2,{size:sz*.7,len:(o.len||sz*2.6)*.75,cover:(o.cover||1)*.55,ang:(x,y)=>ang0(x,y)+rot,op:.42,thin:.7,blend:0,col:BRK(o.col,.16),o:Object.assign({},o.o||{},{edge:.5})}));}}
 return n;};
// ===== MARLE (r6 rebuild): pulled backward into the vortex, pose3d fall_back; shapes in the 3x ref crop (origin canvas 1530,520) =====
MAP(1530,520,3,1750,700,1.0,0,0);SZ=1;
const G3=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c]);
const G3s=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c],.05);
const LVM=[-.7,-.45];
const JS_H=[['titanium_white',3.2],['naples_yellow',.12],['cerulean',.04]];
const JS_L=[['titanium_white',2.8],['cerulean',.1],['naples_yellow',.05]];
const JS_M=[['titanium_white',2.7],['cerulean',.15],['cobalt_blue',.05]];
const JS_T=[['titanium_white',1.9],['cobalt_blue',.25],['cobalt_violet',.22],['cerulean',.06]];
const JS_S=[['cobalt_violet',.5],['ultramarine',.22],['cobalt_blue',.2],['titanium_white',.9]];
const JS_C=[['ultramarine',.45],['cobalt_violet',.4],['dioxazine_purple',.08],['titanium_white',.55]];
const SK_H=[['titanium_white',1.5],['flesh_tint',.6],['naples_yellow',.25],['quinacridone_rose',.04]];
const SK_L=[['titanium_white',1.2],['flesh_tint',.8],['naples_yellow',.2],['quinacridone_rose',.05]];
const SK_M=[['titanium_white',.8],['flesh_tint',.9],['yellow_ochre',.08],['cadmium_orange',.05],['quinacridone_rose',.08]];
const SK_S=[['flesh_tint',.7],['burnt_sienna',.25],['cobalt_violet',.2],['titanium_white',.45],['quinacridone_rose',.08]];
const HR_H=[['naples_yellow',.7],['titanium_white',1],['cadmium_orange',.1],['quinacridone_rose',.05]];
const HR_L=[['naples_yellow',.7],['titanium_white',.6],['cadmium_orange',.2],['quinacridone_rose',.05]];
const HR_M=[['naples_yellow',.4],['cadmium_orange',.4],['yellow_ochre',.2],['titanium_white',.3],['quinacridone_rose',.12]];
const HR_S=[['burnt_sienna',.6],['cadmium_orange',.35],['alizarin_crimson',.12],['cobalt_violet',.25]];
const GD_L=[['cadmium_yellow',1],['titanium_white',.5],['naples_yellow',.3]];
const GD_M=[['cadmium_yellow',.8],['yellow_ochre',.5],['cadmium_orange',.1]];
const GD_S=[['yellow_ochre',.8],['burnt_sienna',.4],['cobalt_violet',.2],['cadmium_yellow',.2]];
const SH_L=[['naples_yellow',.7],['titanium_white',1],['raw_sienna',.1]];
const SH_M=[['naples_yellow',.6],['titanium_white',.6],['raw_sienna',.3],['yellow_ochre',.2]];
const SH_S=[['raw_sienna',.5],['cobalt_violet',.35],['titanium_white',.4],['burnt_umber',.1]];
const RIMG=[['titanium_white',1.4],['cerulean',.4],['cobalt_violet',.1]];   // gate light
const RIMS=[['titanium_white',1],['naples_yellow',.6],['cadmium_orange',.06]];  // sun

// ---------- ponytail: a flame of hair streaming toward the vortex, three layers ----------
LIMB([[430,398],[510,372],[600,320],[690,262],[742,226]],[56,90,84,58,30,6],[HR_L,HR_M,HR_S],{size:10,len:34,cover:1.1,lv:LVM,blend:.5,wob:1.6,o:{taper:[.1,.8]},ang:NZF(AXF([[430,398],[510,372],[600,320],[742,226]]),.2,18)});
for(const [a,b,c,d] of [[[440,392],[540,350],[650,282],[736,236]],[[438,404],[520,380],[610,336],[690,290]],[[434,388],[500,356],[580,320],[640,270]]])PATH([a,b,c,d],HR_H,3.4,{taper:[.1,.9],op:.8});
PATH([[444,414],[540,396],[640,330],[722,268]],HR_S,3.8,{taper:[.1,.9],op:.7});
for(const [a,b,c] of [[[560,350],[620,330],[690,300]],[[600,320],[650,310],[700,296]]])PATH([a,b,c],HR_M,1.8,{taper:[.2,.9],op:.8});
// ---------- far leg (stretched to the right): thigh and shin ----------
LIMB([[712,548],[790,532],[866,512]],[112,96,80],[JS_H,JS_L,JS_M,JS_T,JS_S,JS_C],{bias:-.08,size:7,len:22,cover:1.1,lv:LVM,blend:.6,wob:1.6,ang:NZF(AXF([[712,548],[866,512]]),.28,18)});
LIMB([[866,512],[960,572],[1050,650]],[80,64,48],[JS_H,JS_L,JS_M,JS_T,JS_S,JS_C],{bias:-.08,size:6,len:20,cover:1.1,lv:LVM,blend:.6,wob:1.6,ang:NZF(AXF([[866,512],[1050,650]]),.28,18)});
LIMB([[1034,656],[1100,682],[1170,722]],[64,66,46],[SH_L,SH_M,SH_S,SH_S],{size:7,len:22,cover:1.2,lv:LVM,blend:.5,wob:.7,ang:NZF(AXF([[1034,656],[1170,722]]),.15,18)});
PATH([[1046,650],[1100,676],[1156,704]],[['titanium_white',1.2],['naples_yellow',.4]],2.4,{op:.7,taper:[.15,.6]});
// ---------- near leg (falling down-right) ----------
LIMB([[640,596],[704,672],[770,742]],[124,102,88],[JS_H,JS_L,JS_M,JS_T,JS_S,JS_C],{bias:-.08,size:7,len:22,cover:1.1,lv:LVM,blend:.6,wob:1.6,ang:NZF(AXF([[640,596],[770,742]]),.28,18)});
LIMB([[770,742],[850,850],[930,958]],[88,68,50],[JS_H,JS_L,JS_M,JS_T,JS_S,JS_C],{bias:-.08,size:6,len:20,cover:1.1,lv:LVM,blend:.6,wob:1.6,ang:NZF(AXF([[770,742],[930,958]]),.28,18)});
LIMB([[908,962],[958,1008],[1000,1046]],[66,70,52],[SH_L,SH_M,SH_S,SH_S],{size:7,len:22,cover:1.2,lv:LVM,blend:.5,wob:.7,ang:NZF(AXF([[908,962],[1000,1046]]),.15,18)});
PATH([[916,958],[962,1000],[1004,1038]],[['titanium_white',1.2],['naples_yellow',.4]],2.4,{op:.7,taper:[.15,.6]});
// ---------- pelvis ----------
fill([[572,585],[650,522],[716,496],[768,504],[792,556],[780,612],[742,652],[690,662],[630,642],[596,612]],{size:7,len:22,cover:1.1,ang:NZF(ANG(-30),.5,20),blend:.7,wob:1.6,col:GR([572,600],[792,560],[JS_H,JS_L,JS_M,JS_T,JS_S])});
// ---------- torso ----------
fill([[432,470],[470,420],[540,396],[600,408],[655,448],[694,468],[640,520],[584,562],[556,568],[500,556],[446,545],[430,515]],{size:7,len:22,cover:1.1,ang:NZF(AXF([[450,470],[540,470],[640,480]]),.4,20),blend:.8,bsz:1.6,wob:1.6,col:GR([430,440],[696,520],[JS_H,JS_L,JS_M,JS_T,JS_S])});
// light plane on the lit upper chest, cool shade under the bust and at the waist
GLZ([[450,450],[500,418],[560,404],[600,420],[560,452],[500,470],[456,490]],CC(JS_H),ANG(-25),{size:5,len:12,op:.55});
GLZ([[470,500],[540,500],[600,490],[640,500],[600,540],[540,556],[480,548]],CC(JS_S),ANG(-20),{size:5,len:12,op:.4});
// bust forms: soft light on top, shadow beneath (a left and a right mound)
DB(486,476,9,JS_H,{opacity:.5,load:1});DB(488,498,6,JS_S,{opacity:.4,load:1});
DB(548,422,7,JS_H,{opacity:.45,load:1});
// real folds: pull lines from the belt and under the arm, a crease across the waist
FOLD([[560,556],[520,548],[480,540]],4,JS_C,JS_H,.5);
FOLD([[598,520],[570,492],[540,466]],3.6,JS_S,JS_H,.5);
FOLD([[640,500],[610,470],[590,440]],3.4,JS_S,JS_H,.45);
FOLD([[600,566],[640,580],[676,568]],4,JS_C,JS_H,.5);
// ---------- gold belt ----------
fill([[556,548],[600,505],[660,458],[696,468],[652,522],[590,592],[570,584]],{size:4.4,len:15,cover:1.2,ang:ANG(-42),blend:.4,col:G3([556,560],[696,470],GD_L,GD_M,GD_S)});
PATH([[566,556],[606,514],[664,466]],[['naples_yellow',.8],['titanium_white',.9]],2,{op:.7,taper:[.15,.6]});
PATH([[580,588],[640,530],[690,478]],GD_S,2.2,{op:.6,taper:[.15,.6]});
// ---------- hip and thigh creases where the body bends ----------
FOLD([[610,616],[664,600],[716,566]],4.2,JS_C,JS_H,.5);
FOLD([[722,520],[742,556],[770,590]],4,JS_S,JS_H,.45);
FOLD([[752,712],[786,728],[800,756]],4,JS_C,JS_H,.55);    // knee, near leg
FOLD([[840,490],[860,520],[850,552]],4,JS_C,JS_H,.5);     // knee, far leg
FOLD([[700,630],[740,670],[780,712]],3.2,JS_S,JS_H,.4);
// kneecap lights
DB(768,730,5,JS_H,{opacity:.55,load:1});DB(862,502,5,JS_H,{opacity:.55,load:1});
// ---------- arms (bare skin, sleeveless): screen-left arm out toward the vortex edge ----------
LIMB([[452,520],[366,492],[286,446]],[62,54,46],[SK_H,SK_L,SK_M,SK_S],{size:5,len:15,cover:1.2,lv:LVM,blend:.5,wob:1.6,ang:NZF(AXF([[452,520],[286,446]]),.25,16)});
LIMB([[286,446],[232,416],[186,386]],[46,40,32],[SK_H,SK_L,SK_M,SK_S],{size:4.4,len:13,cover:1.2,lv:LVM,blend:.5,wob:1.6,ang:NZF(AXF([[286,446],[186,386]]),.25,16)});
fill([[190,394],[178,372],[142,346],[122,340],[120,352],[150,378],[180,400]],{size:4,len:10,cover:1.2,ang:ANG(-35),col:G3s([120,350],[190,380],SK_L,SK_M,SK_S),blend:.5});
FNG([[150,350],[128,342],[112,338]],2.4,SK_L);FNG([[162,358],[138,352],[116,346]],2.4,SK_M);FNG([[176,370],[158,366],[136,360]],2.2,SK_M);FNG([[196,376],[200,360],[196,348]],2.4,SK_S);
// ---------- raised arm ----------
LIMB([[560,404],[598,336],[630,274]],[64,54,48],[SK_H,SK_L,SK_M,SK_S],{size:5,len:15,cover:1.2,lv:LVM,blend:.5,wob:1.6,ang:NZF(AXF([[560,404],[630,274]]),.25,16)});
LIMB([[630,274],[646,202],[656,134]],[48,42,36],[SK_H,SK_L,SK_M,SK_S],{size:4.4,len:13,cover:1.2,lv:LVM,blend:.5,wob:1.6,ang:NZF(AXF([[630,274],[656,134]]),.25,16)});
fill([[632,128],[638,70],[652,40],[680,34],[692,62],[680,130]],{size:4,len:10,cover:1.2,ang:ANG(-80),col:G3s([632,80],[694,80],SK_L,SK_M,SK_S),blend:.5});
FNG([[640,72],[638,48],[644,30]],2.4,SK_L);FNG([[654,54],[656,32],[662,16]],2.4,SK_L);FNG([[670,52],[676,32],[684,18]],2.4,SK_M);FNG([[684,64],[694,46],[700,32]],2.2,SK_S);
FNG([[640,100],[622,90],[612,76]],2.6,SK_M);
// bracelets, gold with a bright upper edge
PATH([[630,134],[678,136]],GD_M,3.6,{});PATH([[632,131],[676,133]],GD_L,1.4,{op:.8});
PATH([[184,396],[212,370]],GD_M,3.6,{});PATH([[190,392],[210,372]],GD_L,1.4,{op:.8});
// ---------- shoulders: straps of the jumpsuit and a collar ----------
PATH([[450,466],[470,430],[500,412],[540,398]],JS_H,3,{op:.8,taper:[.1,.5]});
// ---------- rim light: gate light along the lower/right (gate-facing) edges, sun on upper-left edges ----------
RIM([[1176,726],[1124,736],[1062,706]],3,.6,RIMG);
for(const pts of [[[1050,676],[1000,626],[940,578]],[[1010,1062],[950,1056],[912,996]],[[930,962],[860,860],[800,770]],[[780,640],[742,654],[694,664]],[[790,560],[780,612]],[[696,470],[656,520]]])RIM(pts,3.2,.6,RIMG);
for(const pts of [[[540,396],[600,408]],[[432,470],[470,420]],[[712,500],[790,500],[866,490]],[[286,440],[366,484]],[[560,400],[600,332]],[[640,598],[596,610]],[[700,664],[770,742]]])PATH(pts,RIMS,2.2,{op:.55,taper:[.25,.6]});
// ---------- neck, jaw: the glow of the pendant falls here ----------
fill([[404,440],[446,432],[462,470],[430,490],[408,470]],{size:3.6,len:8,cover:1.2,thin:.85,ang:ANG(30),blend:.5,col:G3s([404,450],[462,450],SK_M,SK_S,SK_S)});
// ---------- pendant: a small intense light with a soft halo on the chest and under the jaw ----------
{const cx=1530+490/3,cy=520+474/3,gx=cx-GX,gy=cy-GY;
 // the cloth around it falls into cool shade so the light can glow against it
 SHD([[448,476],[466,450],[498,442],[530,458],[540,490],[518,516],[484,524],[456,508]],CC([['ultramarine',.6],['cobalt_violet',.5],['dioxazine_purple',.1],['titanium_white',.3]]),ANG(10),{size:4.4,len:10,op:.7,blend:1.6,bop:.5,nobrk:1});
 for(let i=0;i<7;i++){const an=i/7*TAU+.3;const r0=15;p.stroke({points:[[gx+Math.cos(an)*r0-Math.sin(an)*9,gy+Math.sin(an)*r0+Math.cos(an)*9,.8],[gx+Math.cos(an)*r0+Math.sin(an)*9,gy+Math.sin(an)*r0-Math.cos(an)*9,.8]],brush:'soft',size:26,opacity:.55});}
 // the light spilling onto the cloth and the underside of the jaw (cyan-white, brightest near the source)
 GLZ([[470,456],[514,450],[532,484],[506,508],[468,494]],GR([470,470],[532,490],[[['titanium_white',2],['cerulean',.3]],[['titanium_white',1.2],['cerulean',.6],['cobalt_violet',.1]]]),ANG(15),{size:3.6,len:8,op:.6,cover:1.1});
 GLOW(cx,cy,4,[['titanium_white',3]],[['cerulean',.55],['titanium_white',1],['cobalt_violet',.08]],{k:1.7});
 // radial scumbles of light around the source
 for(let i=0;i<9;i++){const an=i/9*TAU+R(-.3,.3);const L1=R(6,14);const x0=gx+Math.cos(an)*3.5,y0=gy+Math.sin(an)*3.5;F([[x0,y0],[x0+Math.cos(an)*L1*.6,y0+Math.sin(an)*L1*.6],[x0+Math.cos(an)*L1,y0+Math.sin(an)*L1]],[['titanium_white',2],['cerulean',.2]],1.2,{opacity:.3+.2*(L1<10?1:0),taper:[.1,.9],thin:.5});}
 // a lit rim on the nearest jaw edge
 PATH([[438,462],[462,470],[484,466]],[['titanium_white',1.6],['cerulean',.4],['flesh_tint',.2]],1.6,{op:.55,taper:[.2,.6]});}
// ---------- lost edges toward the cool vortex ----------
for(const [pts,sz,op] of [[[[694,470],[640,522],[590,590]],10,.4],[[[792,556],[780,610],[742,654]],10,.4],[[[1050,650],[960,572],[870,520]],8,.35],[[[930,958],[850,850],[770,742]],8,.35],[[[656,134],[646,204],[632,274]],8,.35]])SOFT(pts,sz,op);

// ---------- HEAD (12x ref, origin canvas 1620,630): face tipped back, forehead toward the upper left ----------
p.dry();
{MAP(1620,630,12,1750,700,1.0,0,0);NOBRK=true;
 const FL=[['titanium_white',1.5],['flesh_tint',.7],['naples_yellow',.15],['quinacridone_rose',.04]];
 const FM=[['titanium_white',1],['flesh_tint',1],['yellow_ochre',.03],['cadmium_orange',.02],['quinacridone_rose',.08]];
 const FS=[['flesh_tint',.8],['burnt_sienna',.14],['quinacridone_rose',.1],['titanium_white',.5],['yellow_ochre',.03]];
 const FR=[['flesh_tint',.7],['titanium_white',.7],['cerulean',.15],['cobalt_violet',.1],['quinacridone_rose',.08]];
 const FC=[['flesh_tint',.7],['burnt_sienna',.3],['quinacridone_rose',.1],['cobalt_violet',.1],['titanium_white',.2]];
 // hair behind and around the face: the high ponytail's root and the fringe
 fill([[100,340],[110,240],[180,150],[300,100],[420,92],[520,120],[600,170],[560,160],[420,120],[300,140],[220,200],[190,300],[190,420],[150,440],[110,400]],{size:3.4,len:10,cover:1.3,ang:AXF([[110,380],[130,250],[260,120],[420,100],[560,130]]),blend:.5,wob:1.5,col:G3s([100,300],[600,150],HR_H,HR_L,HR_M,HR_S)});
 // face oval, tipped back: forehead left, chin lower right
 const FACE=[[200,290],[230,200],[310,150],[400,130],[500,160],[580,230],[640,320],[650,400],[600,470],[520,512],[430,500],[330,450],[250,390]];
 fill(FACE,{size:5,len:10,cover:1,ang:NZF(ANG(40),.4,14),wob:.6,thin:.9,blend:1,bop:.35,o:{edge:.6},col:GR([200,300],[650,420],[FL,FM,FM,mixL(FM,FS,.5)],.04)});
 // forehead light
 fill([[222,230],[280,176],[340,160],[330,230],[270,300],[220,320]],{size:3.6,len:8,ang:ANG(-60),col:CC(FL),op:.55,thin:.85,o:{edge:.6}});
 // cheek: warm blush, then the lit cheekbone
 fill([[440,330],[520,300],[580,360],[560,430],[490,460],[450,400]],{size:3.8,len:8,ang:ANG(35),col:CC([['flesh_tint',.8],['quinacridone_rose',.3],['titanium_white',.4],['cadmium_orange',.05]]),op:.45,thin:.85,o:{edge:.6}});
 // shaded jaw and chin plane (warm), with the cool pendant light catching the underside
 fill([[480,470],[560,440],[630,420],[610,470],[540,508],[470,500]],{size:3,len:7,ang:ANG(-25),col:CC(FC),op:.55,thin:.8,o:{edge:.6}});
 PATH([[500,500],[560,486],[620,450]],[['titanium_white',1.2],['cerulean',.4],['flesh_tint',.3]],2.4,{op:.6,taper:[.2,.6]});
 // eyes: two wide arcs stacked along the forehead-to-chin axis, dark lashes, wet highlight
 for(const [x,y,r] of [[330,230,1],[280,372,.9]]){
  PATH([[x-34*r,y-8],[x,y-26*r],[x+34*r,y-4]],[['burnt_umber',.6],['ultramarine',.2],['burnt_sienna',.3]],1.3,{op:.9,taper:[.2,.3]});
  DB(x+4,y,2.4*r,[['burnt_umber',.4],['ultramarine',.45],['cerulean',.15],['titanium_white',.1]],{opacity:.95,pressure:.8});
  DB(x+2,y-3,.7,[['titanium_white',2]],{opacity:.9});}
 PATH([[300,176],[346,158],[400,170]],[['burnt_sienna',.6],['yellow_ochre',.5],['cadmium_orange',.15],['titanium_white',.2]],1.5,{op:.8,taper:[.3,.5]});
 PATH([[230,330],[262,320],[300,318]],[['burnt_sienna',.6],['yellow_ochre',.5],['cadmium_orange',.15],['titanium_white',.2]],1.4,{op:.8,taper:[.3,.5]});
 // nose: light ridge, warm shadow on the far side
 PATH([[350,270],[400,310],[440,330]],FL,2.4,{op:.6,taper:[.2,.4]});
 DB(448,336,2,FS,{opacity:.5,pressure:.6});
 // mouth: parted, a surprised "o": warm rose with a lit lip
 DB(520,370,3,[['quinacridone_rose',.4],['burnt_sienna',.35],['alizarin_crimson',.1],['titanium_white',.3]],{pressure:.7,opacity:.85});
 PATH([[500,350],[524,336],[552,348]],[['quinacridone_rose',.3],['flesh_tint',.8],['titanium_white',.7]],1.4,{op:.7,taper:[.2,.4]});
 PATH([[500,396],[530,402],[556,390]],[['quinacridone_rose',.25],['flesh_tint',.8],['titanium_white',.9]],1.4,{op:.7,taper:[.2,.4]});
 // ear half hidden under hair
 DB(580,260,3.2,mixL(FM,FS,.4),{opacity:.8});
 // hair bang across the forehead and a few loose strands
 fill([[196,330],[210,240],[260,176],[340,140],[330,176],[270,214],[236,290],[230,350]],{size:3,len:8,ang:AXF([[330,150],[250,200],[210,300]]),col:G3s([196,260],[340,160],HR_H,HR_L,HR_M),op:.95,wob:1.3});
 PATH([[540,150],[600,130],[680,120]],HR_L,2.4,{op:.8,taper:[.2,.9]});
 NOBRK=false;
 }
