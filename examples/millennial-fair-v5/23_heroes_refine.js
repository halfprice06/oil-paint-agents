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
{
// ===== LUCCA (r6 rebuild): re-posed in pose3d (recoiling from the gate, right hand up, left hand reaching to the telepod) =====
// shapes are in the 4x ref crop (origin canvas 1250,775); MAP scales them about the feet by k
const KL=1.15;
MAP(1250,775,4,1345,1030,KL,-25,0);SZ=1;
const G3=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c]);
const G3s=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c],.05);
const OR_H=[['cadmium_yellow',.6],['cadmium_orange',.6],['titanium_white',.7]];
const OR_L=[['cadmium_orange',1],['cadmium_yellow',.5],['titanium_white',.35]];
const OR_M=[['cadmium_orange',1],['cadmium_red',.25],['cadmium_yellow',.2],['titanium_white',.12]];
const OR_S=[['cadmium_orange',.5],['burnt_sienna',.6],['alizarin_crimson',.2],['cobalt_violet',.2],['titanium_white',.1]];
const OR_C=[['burnt_sienna',.7],['alizarin_crimson',.3],['cobalt_violet',.35],['ultramarine',.1]];
const TL_H=[['viridian',.3],['cerulean',.5],['titanium_white',1.5],['cadmium_lemon',.1]];
const TL_L=[['viridian',.5],['cerulean',.5],['titanium_white',1.0],['cadmium_lemon',.1]];
const TL_M=[['viridian',.8],['cerulean',.3],['titanium_white',.4],['sap_green',.1]];
const TL_S=[['viridian',.8],['ultramarine',.35],['titanium_white',.15],['burnt_umber',.1]];
const TL_C=[['viridian',.5],['ultramarine',.5],['burnt_umber',.3],['dioxazine_purple',.1]];
const BK_H=[['cobalt_blue',.5],['paynes_grey',.5],['titanium_white',1.1],['cobalt_violet',.2]];
const BK_L=[['paynes_grey',.8],['ultramarine',.4],['titanium_white',.38],['cobalt_violet',.15]];
const BK_M=[['paynes_grey',.9],['ultramarine',.3],['titanium_white',.18],['burnt_umber',.1]];
const BK_S=[['ivory_black',.9],['ultramarine',.35],['burnt_umber',.25]];
const SK_H=[['titanium_white',1.4],['flesh_tint',.7],['naples_yellow',.25],['cadmium_orange',.04]];
const SK_L=[['titanium_white',1.2],['flesh_tint',.8],['naples_yellow',.2],['cadmium_orange',.04]];
const SK_M=[['titanium_white',.8],['flesh_tint',.9],['cadmium_orange',.08],['yellow_ochre',.1],['quinacridone_rose',.05]];
const SK_S=[['flesh_tint',.7],['burnt_sienna',.25],['cobalt_violet',.12],['quinacridone_rose',.08],['titanium_white',.35]];
const SK_C=[['flesh_tint',.6],['burnt_sienna',.3],['cobalt_violet',.2],['alizarin_crimson',.05],['titanium_white',.2]];
const PL_L=[['dioxazine_purple',.4],['alizarin_crimson',.3],['titanium_white',1.2],['cobalt_violet',.4]];
const PL_M=[['dioxazine_purple',.7],['alizarin_crimson',.4],['titanium_white',.5],['cobalt_violet',.3]];
const PL_S=[['dioxazine_purple',.8],['alizarin_crimson',.3],['ultramarine',.3],['burnt_umber',.15],['titanium_white',.1]];
const HM_H=[['titanium_white',1.8],['cerulean',.3],['naples_yellow',.1]];
const HM_L=[['cobalt_blue',.5],['paynes_grey',.5],['titanium_white',1.6],['naples_yellow',.2]];
const HM_M=[['cobalt_blue',.7],['paynes_grey',.6],['titanium_white',.6]];
const HM_S=[['paynes_grey',.9],['ultramarine',.5],['cobalt_violet',.2],['titanium_white',.1]];
const YL_L=[['cadmium_yellow',1],['titanium_white',.5],['cadmium_lemon',.3]];
const YL_M=[['cadmium_yellow',1],['cadmium_orange',.15],['yellow_ochre',.2]];
const YL_S=[['cadmium_yellow',.8],['yellow_ochre',.5],['raw_sienna',.2],['cobalt_violet',.12]];
const BT_H=[['paynes_grey',.35],['burnt_umber',.4],['titanium_white',.7],['naples_yellow',.12],['cobalt_violet',.12]];
const BT_L=[['burnt_umber',.6],['paynes_grey',.5],['titanium_white',.55],['cobalt_violet',.2]];
const BT_M=[['van_dyke_brown',.9],['paynes_grey',.3],['burnt_umber',.4],['titanium_white',.1]];
const BT_S=[['ivory_black',1],['ultramarine',.25],['van_dyke_brown',.3]];
const GOLD=[['yellow_ochre',.7],['cadmium_yellow',.3],['burnt_umber',.2],['titanium_white',.15]];

// ===== LUCCA refine: shade planes with warm bounce from the deck, sun planes, gate rim on her right side, boot form, hand detail =====
MAP(1250,775,4,1345,1030,KL,-25,0);SZ=1;
const SHO=[['burnt_sienna',.6],['alizarin_crimson',.25],['cobalt_violet',.3],['cadmium_orange',.3],['titanium_white',.1]];   // orange tunic in shade
const SHB=[['ivory_black',1],['ultramarine',.35],['burnt_umber',.3]];
const SHT=[['viridian',.8],['ultramarine',.35],['paynes_grey',.2],['titanium_white',.12]];
const SHS=[['flesh_tint',.7],['burnt_sienna',.3],['quinacridone_rose',.1],['cobalt_violet',.1],['titanium_white',.3]];
const SUNW=[['naples_yellow',.6],['titanium_white',1],['cadmium_orange',.05]];
const GATE=[['cerulean',.4],['titanium_white',1],['cobalt_violet',.5]];
// ---- shade planes ----
SHD([[344,300],[378,300],[398,396],[366,426],[348,360]],GR([340,360],[400,360],[SHO,mixL(SHO,[['ivory_black',.2]],.5)]),ANG(85),{size:4.4,len:12,op:.6});
SHD([[392,430],[440,490],[470,560],[524,640],[512,644],[462,654],[470,590],[436,520]],CC(SHB),ANG(65),{size:4.4,len:12,op:.55});
SHD([[318,580],[372,600],[388,590],[372,630],[366,654],[330,656],[320,620]],CC(SHB),ANG(80),{size:4.4,len:12,op:.5});
SHD([[340,246],[420,252],[490,252],[492,238],[420,236],[348,226]],CC(SHT),ANG(0),{size:3.4,len:10,op:.5});
SHD([[236,330],[250,404],[222,420],[230,360]],CC(SHT),ANG(90),{size:3.4,len:10,op:.5});
// legs: violet-warm shade on the right edge, rounded knee
SHD([[352,654],[366,700],[366,770],[352,800],[340,780],[348,700]],CC(SHS),ANG(90),{size:3,len:9,op:.5});
SHD([[520,720],[546,760],[552,800],[534,806],[520,770]],CC(SHS),ANG(70),{size:3,len:9,op:.5});
// ---- sun planes: warm light on the left of each form, pale thick strokes on the upper edges ----
GLZ([[232,264],[250,238],[300,218],[318,250],[280,300],[240,310]],CC(mixL(OR_H,SUNW,.3)),ANG(-30),{size:3.4,len:10,cover:.6,op:.5,blend:.5});
GLZ([[270,468],[300,452],[320,500],[300,580],[276,600]],CC(BK_H),ANG(80),{size:3,len:9,cover:.6,op:.4,blend:.5});
GLZ([[408,430],[440,486],[462,552],[452,552],[420,500]],CC(BK_H),ANG(60),{size:3,len:9,cover:.6,op:.4,blend:.5});
GLZ([[338,236],[430,238],[486,248],[488,234],[420,226],[344,220]],CC(TL_H),ANG(3),{size:3,len:10,cover:.6,op:.55,blend:.5});
GLZ([[326,660],[336,740],[334,820],[316,820],[312,740]],CC(mixL(SK_L,SUNW,.2)),ANG(90),{size:3,len:9,cover:.6,op:.4,blend:.5});
GLZ([[490,660],[512,730],[524,800],[506,796],[494,730]],CC(mixL(SK_L,SUNW,.2)),ANG(75),{size:3,len:9,cover:.6,op:.4,blend:.5});
// ---- warm bounce from the deck on the undersides of the boots and the shorts hems ----
for(const pts of [[[330,1016],[372,1034],[414,1042]],[[580,978],[622,998],[652,1004]]])PATH(pts,[['raw_sienna',.6],['burnt_sienna',.3],['cobalt_violet',.15],['titanium_white',.25]],1.4,{op:.3,taper:[.2,.6]});
// ---- gate rim on her right-hand (screen right) contours ----
for(const pts of [[[398,410],[388,350],[372,300]],[[512,636],[506,606],[484,580]],[[366,700],[368,760]],[[660,964],[640,1000]],[[490,250],[560,226],[620,198]],[[196,262],[236,228]]])PATH(pts,GATE,2.4,{op:.65,taper:[.25,.6]});
// ---- boot form: lit leather on the left, crease at the ankle, cuff shadow ----
for(const [pts,op] of [[[[320,860],[324,930],[340,972]],.35],[[[514,820],[528,880],[548,924]],.35],[[[330,900],[350,940],[370,968]],.25],[[[540,880],[566,910],[590,942]],.25]])FOLD(pts,3,BT_S,BT_H,op,[3,-1]);
PATH([[302,846],[366,842]],BT_S,2,{op:.7});PATH([[502,812],[566,806]],BT_S,2,{op:.7});
// ---- tunic: creases from belt/hem, dark crease with warm lip; hem shadow on the shorts ----
for(const [a,b,c] of [[[286,330],[300,380],[310,432]],[[336,300],[352,350],[366,410]],[[262,360],[274,400],[282,432]]])FOLD([a,b,c],3.2,OR_C,OR_H,.5,[3,-1]);
PATH([[266,440],[330,452],[396,438]],SHB,2.6,{op:.55,taper:[.2,.6]});
// ---- hands: finger joints and nail light so they read as hands ----
for(const [pts] of [[[[64,238],[84,248],[100,262]]],[[[88,224],[100,242],[110,260]]],[[[116,228],[122,248],[124,266]]],[[[142,242],[142,260],[136,276]]]])PATH(pts,SK_H,1.1,{op:.6,taper:[.3,.5]});
PATH([[96,288],[118,292],[132,288]],SK_C,1.6,{op:.6});
PATH([[640,164],[680,150],[712,142]],SK_H,1.1,{op:.6,taper:[.3,.5]});PATH([[650,176],[684,168],[714,160]],SK_H,1,{op:.5,taper:[.3,.5]});
// ---- sun glints: antenna bulb, glasses, helmet edge, scarf ----
{MAP(1285,785,12,1345,1030,KL,-25,0);
 PATH([[196,100],[250,84],[310,86]],HM_H,1.6,{op:.6,taper:[.2,.6]});
 PATH([[246,150],[290,138],[340,140]],[['titanium_white',1.6],['naples_yellow',.3]],.9,{op:.5,taper:[.2,.6]});
 PATH([[220,330],[240,404]],[['naples_yellow',.8],['titanium_white',.8],['flesh_tint',.3]],1.4,{op:.4,taper:[.2,.6]});
 PATH([[244,540],[290,560],[344,548]],[['naples_yellow',.8],['titanium_white',1],['cadmium_yellow',.2]],1,{op:.7,taper:[.2,.6]});}
}
{
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

// ===== MARLE refine: form shadows with violet reflected light, pale sun planes in thick paint, ponytail strands, gate rim =====
MAP(1530,520,3,1750,700,1.0,0,0);SZ=1;
const SHJ=[['cobalt_violet',.5],['ultramarine',.2],['cobalt_blue',.2],['titanium_white',1.1]];
const SHJ2=[['cobalt_violet',.5],['ultramarine',.3],['dioxazine_purple',.05],['titanium_white',.6]];
const SHK=[['flesh_tint',.7],['burnt_sienna',.2],['cobalt_violet',.2],['quinacridone_rose',.1],['titanium_white',.35]];
const SUN=[['titanium_white',3],['naples_yellow',.2]];
// ---- shade planes: lower/right sides of the limbs and torso, cool and simple ----
SHD([[780,600],[744,660],[700,664],[640,646],[660,640],[720,620],[760,560]],GR([640,640],[790,560],[SHJ,SHJ2]),ANG(-20),{size:5,len:14,op:.5});
SHD([[640,640],[704,716],[780,790],[852,892],[930,990],[900,990],[820,880],[748,780],[690,712],[620,650]],GR([700,700],[930,990],[SHJ,SHJ2]),ANG(50),{size:5,len:14,op:.52});
SHD([[780,556],[868,536],[960,600],[1048,680],[1040,690],[950,622],[870,572],[790,586]],GR([780,560],[1048,690],[SHJ,SHJ2]),ANG(30),{size:5,len:14,op:.5});
SHD([[470,520],[540,556],[600,568],[560,574],[480,552]],CC(SHJ2),ANG(-15),{size:5,len:12,op:.5});
// arms: warm-violet undersides
SHD([[452,540],[366,516],[286,470],[290,458],[366,498],[452,516]],CC(SHK),ANG(-20),{size:4,len:11,op:.55});
SHD([[596,380],[622,330],[640,274],[622,268],[606,330],[590,386]],CC(SHK),ANG(-70),{size:4,len:11,op:.5});
// ---- sun on the upper-left planes: thick pale paint ----
for(const [poly,ang] of [[[[438,468],[470,424],[540,400],[596,410],[560,430],[490,440]],-25],[[[722,500],[800,496],[866,486],[820,510],[740,530]],-5],[[[652,612],[700,664],[748,716],[726,708],[672,656]],40],[[[870,516],[950,570],[1030,640],[1004,636],[930,586],[870,540]],35],[[[800,740],[866,830],[918,920],[900,912],[850,840],[792,756]],55]])
 GLZ(poly,CC(SUN),ANG(ang),{size:3,len:12,cover:.5,op:.45,blend:.5});
// ---- cool-violet reflected light under the forms, from the vortex ----
for(const pts of [[[704,668],[780,738],[852,846]],[[790,770],[860,862],[928,962]],[[870,534],[948,598],[1032,676]],[[780,610],[742,656]],[[660,642],[620,612]]])PATH(pts,[['cerulean',.4],['titanium_white',1],['cobalt_violet',.4]],2.6,{op:.55,taper:[.2,.6]});
// ---- gate rim: bright cyan-white along the gate-facing (lower/right) contours ----
for(const pts of [[[784,556],[778,612],[742,652]],[[930,962],[852,852],[772,744]],[[1050,676],[960,590],[870,520]],[[656,134],[648,204],[634,274]],[[286,458],[236,424],[190,396]]])PATH(pts,[['titanium_white',1.6],['cerulean',.5],['cobalt_violet',.1]],2.2,{op:.7,taper:[.25,.6]});
// ---- fabric folds with form: hip, knees, waist (shade side dark, light lip) ----
for(const [a,b,c] of [[[640,600],[684,632],[716,660]],[[700,520],[740,548],[770,566]],[[760,716],[800,742],[820,774]],[[836,500],[866,534],[858,566]],[[800,610],[782,650],[744,690]]])FOLD([a,b,c],3.6,SHJ2,SUN,.6,[3,-2]);
// ---- ponytail: strands, hot highlights on the sun side, coral in the shade ----
{const AX=[[430,398],[510,372],[600,320],[690,262],[742,226]];
 for(let i=0;i<30;i++){const t0=R(0,.55),t1=Math.min(1,t0+R(.25,.5));const off=R(-1,1)*26*(1-t0*.7);
  const pt=t=>{const q=cr(AX,t),d=cdir(AX,t);return [q[0]-d[1]*off*(1-t*.5),q[1]+d[0]*off*(1-t*.5)];};
  const sun=off<0;PATH([pt(t0),pt((t0+t1)/2),pt(t1)],sun?(R(0,1)<.5?HR_H:HR_L):(R(0,1)<.6?HR_S:HR_M),R(1.4,2.6),{op:R(.55,.9),taper:[.15,.8],thin:.5});}
 for(let i=0;i<6;i++){const t=R(.5,.9);const q=cr(AX,t);PATH([[q[0],q[1]],[q[0]+R(20,50),q[1]-R(20,40)],[q[0]+R(50,90),q[1]-R(30,70)]],HR_L,1.6,{op:.7,taper:[.1,.9]});}}
// ---- belt glints, bracelet glints, shoe highlights ----
PATH([[590,560],[630,520],[670,478]],[['titanium_white',1.5],['naples_yellow',.5]],1.4,{op:.8,taper:[.2,.6]});
DB(633,136,1.2,[['titanium_white',2]],{opacity:.8});DB(204,382,1.2,[['titanium_white',2]],{opacity:.8});
for(const pts of [[[1060,648],[1120,676],[1170,706]],[[912,962],[960,1002],[1004,1042]]])PATH(pts,[['titanium_white',1.6],['naples_yellow',.4]],1.6,{op:.75,taper:[.2,.6]});
// ---- face: wet highlights, a warm shadow under the lower lip, light on the cheekbone ----
{MAP(1620,630,12,1750,700,1.0,0,0);
 DB(332,224,.6,[['titanium_white',2]],{opacity:.9});DB(284,366,.5,[['titanium_white',2]],{opacity:.9});
 PATH([[400,330],[440,300],[480,296]],[['titanium_white',1.6],['naples_yellow',.3]],1.6,{op:.55,taper:[.2,.6]});
 PATH([[520,410],[560,404]],[['burnt_sienna',.5],['flesh_tint',.8],['cobalt_violet',.1]],1.6,{op:.5,taper:[.2,.6]});}
}
{
// ===== CRONO (r6 rebuild): running away toward the gate, seen from behind; shapes in the 2.4x ref crop (origin canvas 440,990) =====
MAP(440,990,2.4,690,1555,1.0,0,0);SZ=1;
const G3=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c]);
const G3s=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c],.05);
const LVC=[-.8,-.5];
const HR_H=[['cadmium_yellow',.5],['cadmium_orange',.9],['cadmium_red',.2],['titanium_white',.12]];
const HR_L=[['cadmium_orange',1],['cadmium_red',.5],['cadmium_yellow',.15]];
const HR_M=[['cadmium_red',1],['cadmium_orange',.35],['alizarin_crimson',.2]];
const HR_S=[['alizarin_crimson',.8],['cadmium_red',.35],['burnt_sienna',.3],['cobalt_violet',.2]];
const HR_C=[['alizarin_crimson',.6],['burnt_umber',.4],['dioxazine_purple',.3],['ultramarine',.1]];
const BD_L=[['titanium_white',2],['naples_yellow',.2]];
const BD_M=[['titanium_white',2.2],['cerulean',.1],['cobalt_violet',.05],['naples_yellow',.15]];
const BD_S=[['titanium_white',1.3],['cerulean',.15],['cobalt_violet',.2],['naples_yellow',.1],['burnt_umber',.03]];
const TN_H=[['titanium_white',2],['cerulean',.3],['naples_yellow',.2]];
const TN_L=[['cerulean',.4],['titanium_white',1.4],['naples_yellow',.12],['cobalt_blue',.08]];
const TN_M=[['cerulean',.35],['cobalt_blue',.3],['titanium_white',.9],['cobalt_violet',.06]];
const TN_S=[['cobalt_blue',.4],['cobalt_violet',.25],['titanium_white',.6],['burnt_sienna',.06]];
const TN_C=[['ultramarine',.4],['cobalt_violet',.3],['titanium_white',.35],['burnt_sienna',.1]];
const GR_H=[['sap_green',.4],['naples_yellow',.3],['titanium_white',.5]];
const GR_L=[['sap_green',.6],['viridian',.2],['naples_yellow',.2],['titanium_white',.3]];
const GR_M=[['sap_green',.7],['viridian',.4],['titanium_white',.2],['burnt_umber',.1]];
const GR_S=[['viridian',.6],['sap_green',.3],['ultramarine',.2],['burnt_umber',.2],['titanium_white',.1]];
const GR_C=[['viridian',.4],['ultramarine',.35],['burnt_umber',.3],['dioxazine_purple',.1]];
const OR_L=[['cadmium_orange',1],['cadmium_yellow',.4],['titanium_white',.2]];
const OR_M=[['cadmium_orange',1],['cadmium_red',.3],['cadmium_yellow',.1]];
const OR_S=[['cadmium_orange',.4],['burnt_sienna',.6],['alizarin_crimson',.3],['cobalt_violet',.15]];
const PN_H=[['naples_yellow',.5],['titanium_white',1.2],['raw_sienna',.1]];
const PN_L=[['naples_yellow',.5],['titanium_white',.7],['raw_sienna',.3],['yellow_ochre',.15]];
const PN_M=[['raw_sienna',.6],['naples_yellow',.35],['titanium_white',.4],['burnt_sienna',.1]];
const PN_S=[['raw_sienna',.5],['burnt_sienna',.3],['cobalt_violet',.25],['titanium_white',.3]];
const PN_C=[['burnt_sienna',.6],['cobalt_violet',.4],['raw_umber',.3],['ultramarine',.1]];
const BT_H=[['burnt_sienna',.7],['yellow_ochre',.4],['titanium_white',.4]];
const BT_L=[['burnt_sienna',.8],['raw_sienna',.4],['titanium_white',.2],['burnt_umber',.2]];
const BT_M=[['burnt_umber',.9],['burnt_sienna',.5],['van_dyke_brown',.3]];
const BT_S=[['van_dyke_brown',.9],['burnt_umber',.5],['cobalt_violet',.2],['ultramarine',.12]];
const BT_C=[['ivory_black',.8],['van_dyke_brown',.6],['ultramarine',.2]];
const SK_L=[['titanium_white',1.1],['flesh_tint',.8],['naples_yellow',.2],['cadmium_orange',.04]];
const SK_M=[['titanium_white',.7],['flesh_tint',.9],['yellow_ochre',.1],['cadmium_orange',.08],['quinacridone_rose',.06]];
const SK_S=[['flesh_tint',.7],['burnt_sienna',.3],['cobalt_violet',.15],['titanium_white',.3],['quinacridone_rose',.08]];
const BK_M=[['ivory_black',.9],['ultramarine',.35],['burnt_umber',.25],['titanium_white',.12]];
const BK_L=[['paynes_grey',.8],['ultramarine',.3],['titanium_white',.5],['burnt_umber',.2]];
const RIMV=[['cerulean',.4],['titanium_white',1],['cobalt_violet',.45]];       // gate light, from the front right
const RIMS=[['naples_yellow',.7],['titanium_white',.9],['cadmium_orange',.1]];  // low sun, from the left

// ===== CRONO refine: broken colour over the big forms, sun on the back, cool shade side, bounce light, hair strands =====
MAP(440,990,2.4,690,1555,1.0,0,0);SZ=1;
const WARM=[['naples_yellow',.6],['titanium_white',1],['cadmium_orange',.06]];
const BNC=[['raw_sienna',.4],['naples_yellow',.4],['titanium_white',.5],['cadmium_orange',.05]];   // light bounced from the plaza
const VIO=[['cobalt_violet',.6],['ultramarine',.25],['titanium_white',.6]];
// ---- structure first: the shade side of the body is one cool, simple shape; the sun side stays warm and light ----
const SHT=[['cobalt_blue',.5],['cobalt_violet',.32],['titanium_white',.5],['ultramarine',.1]];       // shade on the blue tunic
const SHT2=[['cobalt_blue',.4],['cobalt_violet',.35],['titanium_white',.4],['ultramarine',.2],['burnt_sienna',.04]];
SHD([[622,488],[664,472],[692,490],[698,560],[690,640],[696,684],[650,684],[638,640],[626,560]],GR([618,560],[702,560],[SHT,SHT2]),ANG(80),{op:.7});
SHD([[628,722],[702,712],[738,884],[650,906],[630,820]],GR([626,800],[738,800],[SHT,SHT2]),ANG(75),{op:.7});
GLZ([[526,732],[620,728],[630,860],[560,890],[530,820]],GR([526,800],[630,800],[mixL(TN_L,TN_M,.3),mixL(TN_M,SHT,.3)]),ANG(100),{op:.3});
SHD([[656,512],[760,574],[808,656],[790,672],[736,598],[680,550]],CC(mixL(GR_S,GR_C,.5)),ANG(45),{size:5,len:13});
SHD([[394,656],[414,730],[450,790],[474,774],[438,716],[420,652]],CC(mixL(GR_S,GR_C,.5)),ANG(80),{size:5,len:13});
SHD([[670,880],[706,874],[708,960],[692,1060],[684,1148],[640,1150],[656,1060],[666,960]],CC(mixL(PN_S,PN_C,.5)),ANG(90),{size:5,len:13,op:.55,blend:1.8,bop:.5});
SHD([[556,886],[586,884],[592,1000],[584,1108],[552,1108],[560,1000]],CC(mixL(PN_S,PN_C,.4)),ANG(90),{size:5,len:13});
SHD([[660,340],[690,332],[692,372],[676,402],[656,412]],CC(mixL(HR_S,HR_C,.3)),ANG(-70),{size:4,len:12,op:.5});
// sun planes: warm, light, on the left of every form
GLZ([[426,886],[450,806],[500,730],[566,722],[548,800],[524,892]],GR([426,820],[566,820],[mixL(WARM,TN_H,.4),mixL(TN_H,TN_L,.4)]),ANG(30),{op:.4});
GLZ([[512,492],[556,470],[604,476],[580,524],[530,548],[508,520]],GR([512,500],[604,500],[mixL(WARM,TN_H,.5),mixL(TN_H,TN_L,.5)]),ANG(-20),{op:.42});
GLZ([[520,498],[470,540],[420,590],[392,640],[418,636],[470,590],[534,540]],GR([440,520],[520,600],[mixL(GR_H,WARM,.3),GR_L]),ANG(-35),{op:.45});
GLZ([[696,508],[758,576],[806,658],[790,670],[740,590],[690,530]],GR([690,520],[806,620],[mixL(GR_L,GR_M,.5),GR_S]),ANG(50),{op:.4});
GLZ([[508,886],[520,1000],[512,1100],[534,1100],[540,1000],[540,890]],CC(mixL(PN_H,PN_L,.4)),ANG(80),{op:.42});
GLZ([[592,886],[640,884],[640,1000],[640,1140],[606,1140],[598,1000]],CC(mixL(PN_H,PN_L,.5)),ANG(75),{op:.4});
// bounce light from the warm plaza under the hem and above the boots
GLZ([[436,880],[580,906],[734,884],[730,862],[580,884],[444,860]],CC(BNC),ANG(5),{op:.4,cover:.7});
GLZ([[510,1070],[576,1076],[580,1108],[508,1106]],CC(BNC),ANG(0),{op:.4});
// folds in the shade: darker creases with a light lip, following the cloth
for(const [a,b,c] of [[[640,730],[660,800],[690,870]],[[664,500],[678,560],[684,640]],[[650,740],[668,820],[700,880]]])PATH([a,b,c],SHT2,3,{op:.55,taper:[.2,.8]});
// pants: creases where the knees and thighs bend, dark crease and a light lip, a few across the shade side
for(const [a,b,c] of [[[520,930],[548,962],[574,950]],[[514,1012],[546,1034],[576,1024]],[[606,932],[648,964],[692,948]],[[604,1012],[644,1042],[688,1030]],[[610,1082],[648,1112],[684,1098]],[[528,1060],[552,1078],[576,1070]]])FOLD([a,b,c],3.4,PN_C,PN_H,.5,[3,-2]);
// boots: lit leather on the left edges, dark core, cool rim
GLZ([[500,1112],[520,1112],[516,1210],[498,1290],[496,1260],[500,1180]],CC(BT_H),ANG(95),{op:0.42});
GLZ([[548,1114],[572,1114],[566,1230],[570,1290],[552,1290],[556,1200]],CC(BT_C),ANG(95),{op:0.39});
GLZ([[600,1204],[628,1196],[622,1300],[610,1410],[590,1408],[598,1300]],CC(mixL(BT_L,BT_H,.4)),ANG(95),{op:0.42});
GLZ([[636,1200],[662,1196],[640,1300],[630,1400],[620,1400],[630,1300]],CC(BT_C),ANG(95),{op:0.39});
// thick-paint accents: sun glints, cuffs, belt, sole welt
for(const [a,b,w] of [[[516,1120],[508,1180],2],[[606,1204],[600,1260],2],[[510,900],[510,1040],1.8],[[598,892],[600,1010],1.8],[[510,500],[502,600],2],[[436,874],[476,780],2.2]])PATH([a,b],WARM,w,{op:.7,taper:[.2,.6],thin:.4});
PATH([[500,704],[570,696],[640,690]],[['titanium_white',1],['paynes_grey',.4],['cobalt_violet',.2]],1.6,{op:.5,taper:[.1,.5]});
// hair: fine strands along the spikes, hot on the sun side, dark in the cleft, a few stray wisps
{const SP=[[690,330,730,296,26],[668,312,720,212,34],[650,300,664,142,34],[630,292,628,120,32],[610,288,596,96,38],[588,290,566,112,34],[566,296,520,118,36],[546,304,474,138,38],[534,324,468,262,26],[532,338,446,238,32],[600,292,560,150,28],[636,290,690,170,28]];
 for(const [bx,by,tx,ty,w] of SP){const dx=tx-bx,dy=ty-by,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
  for(let k=0;k<5;k++){const t0=R(.05,.45),t1=t0+R(.3,.5);const off=R(-.35,.35)*w*.8;
   const pt=(t)=>[bx+dx*t+nx*off*(1-t*.6)+(ty-by)*(-.16)*t*(1-t)*.6,by+dy*t+ny*off*(1-t*.6)];
   const u=clamp((bx-500)/200,0,1);const sunny=off<0;
   const col=sunny?(u<.5?HR_H:HR_L):(u<.7?HR_S:HR_C);
   PATH([pt(t0),pt((t0+t1)/2),pt(t1)],col,R(1.2,2.2),{op:R(.5,.85),taper:[.15,.8],thin:.5});}}
 for(let i=0;i<7;i++){const bx=R(500,700),by=R(250,320),L=R(14,34),a=-Math.PI/2+R(-.9,.5);PATH([[bx,by],[bx+Math.cos(a)*L*.5,by+Math.sin(a)*L*.5],[bx+Math.cos(a)*L,by+Math.sin(a)*L]],i%2?HR_L:HR_H,1.4,{op:.7,taper:[.1,.9]});}}
// katana scabbard shine and the tsuba
PATH([[440,812],[408,872],[364,944]],[['titanium_white',1],['cerulean',.3]],1,{op:.6,taper:[.1,.7]});
DB(448,792,1.8,[['naples_yellow',1],['titanium_white',.8]],{opacity:.9});
}
