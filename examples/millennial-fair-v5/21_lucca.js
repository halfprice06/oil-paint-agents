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

// ---------- cast shadow on the deck (sun from the left, falls right and toward us) ----------
fill([[300,990],[420,1018],[640,1010],[900,1000],[1010,1020],[900,1048],[620,1056],[380,1048],[296,1024]],{size:11,len:44,ang:ANG(5),thin:.55,blend:.8,op:.7,wob:1.3,col:GR([300,1000],[1010,1020],[[['cobalt_violet',.6],['ultramarine',.3],['burnt_umber',.5],['paynes_grey',.2]],[['cobalt_violet',.6],['ultramarine',.2],['burnt_umber',.3],['titanium_white',.25]],[['cobalt_violet',.6],['raw_sienna',.2],['titanium_white',.5]]])});
// ---------- REAR leg (screen right): bent knee, skin between short hem and boot, boot to the toe ----------
// skin of the lower thigh/knee/shin
LIMB([[482,632],[520,730],[538,800]],[100,70,56],[mixL(SK_L,SK_M,.45),SK_M,SK_M,SK_S],{size:3.4,len:10,cover:1.4,blend:1.1,bop:.5,bias:.1,wob:1.4,ang:AXF([[505,722],[538,800]])});
DB(512,722,2,SK_H,{opacity:.5,load:1});   // kneecap light
// boot
fill([[500,792],[566,784],[580,832],[596,880],[622,918],[658,948],[662,986],[632,1000],[592,978],[552,938],[534,912],[522,862]],{size:4.2,len:12,cover:1.5,ang:NZF(AXF([[534,790],[550,870],[560,920],[648,980]]),.3,16),blend:.6,wob:1.3,col:G3s([500,860],[665,900],BT_L,BT_M,BT_S,BT_S)});
// boot cuff (folded top) in warm tan leather
fill([[498,790],[566,782],[568,798],[500,806]],{size:3.4,len:10,ang:ANG(-8),col:GR([498,790],[568,790],[[['naples_yellow',.5],['raw_sienna',.4],['titanium_white',.4]],[['raw_sienna',.6],['burnt_umber',.4],['cobalt_violet',.15]]]),op:.95});
fill([[590,950],[640,968],[662,988],[640,1002],[600,986]],{size:3.4,len:9,cover:1.5,ang:ANG(35),col:G3s([590,960],[664,990],BT_M,BT_S,BT_S),op:.95});
// toe cap highlight, lit leather on the lit (left/top) side, laces
PATH([[520,830],[528,880],[545,922]],BT_L,3.2,{op:.8,taper:[.15,.6]});
PATH([[610,950],[640,970]],BT_H,1.8,{op:.7,taper:[.2,.6]});
for(const [a,b] of [[540,812],[546,826],[552,840],[556,854],[560,868]])PATH([[a-8,b],[a+10,b+3]],[['naples_yellow',.7],['titanium_white',.6],['raw_sienna',.2]],1.2,{op:.75});
// sole edge, a dark line with ground-bounce warmth
PATH([[558,946],[600,984],[640,1004]],[['ivory_black',1],['burnt_umber',.4]],3,{op:.85,taper:[.1,.4]});
// ---------- FRONT leg (screen left): straight, weight-bearing ----------
LIMB([[336,650],[336,770],[336,838]],[96,64,50],[mixL(SK_L,SK_M,.45),SK_M,SK_M,SK_S],{size:3.4,len:10,cover:1.4,blend:1.1,bop:.5,bias:.08,wob:1.4,ang:AXF([[336,772],[336,838]])});
fill([[303,826],[368,822],[364,880],[356,936],[374,982],[420,1008],[424,1036],[380,1042],[330,1014],[306,990],[318,942],[310,886]],{size:4.2,len:12,cover:1.5,ang:NZF(AXF([[334,826],[334,900],[340,960],[410,1022]]),.3,16),blend:.6,wob:1.3,col:G3s([300,900],[428,940],BT_L,BT_M,BT_S,BT_S)});
fill([[300,822],[370,818],[371,836],[302,840]],{size:3.4,len:10,ang:ANG(-6),col:GR([300,830],[372,830],[[['naples_yellow',.5],['raw_sienna',.4],['titanium_white',.4]],[['raw_sienna',.6],['burnt_umber',.4],['cobalt_violet',.15]]]),op:.95});
PATH([[314,860],[320,920],[332,962]],BT_L,3.2,{op:.8,taper:[.15,.6]});
for(const [a,b] of [[330,852],[333,868],[336,884],[340,900],[346,916]])PATH([[a-8,b],[a+10,b+3]],[['naples_yellow',.7],['titanium_white',.6],['raw_sienna',.2]],1.2,{op:.75});
fill([[372,1000],[412,1014],[426,1030],[400,1042],[366,1030]],{size:3.4,len:9,cover:1.5,ang:ANG(25),col:G3s([370,1010],[426,1030],BT_M,BT_S,BT_S),op:.95});
PATH([[380,1020],[408,1030]],BT_H,1.8,{op:.7,taper:[.2,.6]});
PATH([[310,990],[350,1030],[420,1042]],[['ivory_black',1],['burnt_umber',.4]],3,{op:.85,taper:[.1,.4]});
// ---------- shorts: rear thigh (screen right) then front thigh and hips ----------
fill([[395,420],[452,490],[470,556],[508,606],[512,640],[462,652],[436,622],[404,596]],{size:4.6,len:14,cover:1.3,ang:NZF(AXF([[420,450],[480,570],[524,700]]),.35,18),blend:.7,wob:1.6,col:G3([396,500],[552,700],BK_L,BK_M,BK_S,BK_S)});
fill([[264,455],[330,440],[398,415],[408,520],[388,592],[372,630],[366,650],[308,656],[284,630],[270,604],[264,540]],{size:4.6,len:14,cover:1.3,ang:NZF(AXF([[300,450],[310,560],[336,700],[336,740]]),.35,18),blend:.7,wob:1.6,col:G3([264,520],[400,640],BK_L,BK_M,BK_S,BK_S)});
// folds in the shorts: crotch pull, hem cuffs
FOLD([[330,540],[366,580],[384,616]],4.2,BK_S,BK_L,.55);
FOLD([[420,520],[440,570],[462,616]],3.2,BK_S,BK_L,.4);
FOLD([[282,540],[298,584],[304,628]],3.6,BK_S,BK_L,.45);
PATH([[308,652],[366,648]],[['ivory_black',1],['ultramarine',.3]],3,{op:.7});
PATH([[464,650],[510,640]],[['ivory_black',1],['ultramarine',.3]],3,{op:.7});
// ---------- far arm, screen right, reaching to the telepod (teal sleeve, upper surface catches the sun) ----------
LIMB([[338,238],[420,240],[492,244]],[56,50,46],[TL_L,TL_M,TL_S,TL_C],{size:3.8,len:11,cover:1.3,blend:.6,bias:.0,wob:1.6,ang:NZF(AXF([[338,238],[492,244]]),.25,18)});
LIMB([[492,244],[560,222],[620,194]],[46,40,34],[TL_L,TL_M,TL_S,TL_C],{size:3.6,len:10,cover:1.3,blend:.6,wob:1.6,ang:NZF(AXF([[492,244],[620,194]]),.25,18)});
PATH([[500,226],[560,204],[612,180]],TL_H,3,{op:.75,taper:[.15,.6]});
// ---------- torso: orange tunic ----------
fill([[226,266],[248,234],[300,214],[348,230],[372,292],[400,400],[392,424],[360,436],[330,446],[296,440],[270,428],[258,378],[238,324]],{size:6.4,len:20,ang:NZF(AXF([[290,230],[310,330],[326,440]]),.35,20),blend:.9,bsz:1.6,wob:1.4,col:G3([226,300],[402,340],OR_L,OR_M,OR_S,OR_C)});
// tunic light plane on the chest, shadow under the arm and waist, hem tooth
fill([[236,262],[270,238],[316,232],[330,266],[300,320],[262,330]],{size:5,len:14,ang:NZF(ANG(70),.5,16),col:CC(OR_H),op:.6,thin:.5,blend:.4,wob:1.6});
fill([[340,300],[376,300],[398,396],[364,420],[346,360]],{size:5,len:14,ang:ANG(95),col:CC(OR_C),op:.5,thin:.5,blend:.5,wob:1.4});
FOLD([[270,330],[300,380],[318,430]],4.4,OR_C,OR_H,.5);
FOLD([[348,270],[360,330],[372,380]],4,OR_C,OR_L,.45);
FOLD([[262,392],[296,404],[330,398]],3.4,OR_S,OR_H,.45);
for(let i=0;i<6;i++){const x=264+i*22+R(-3,3);PATH([[x,430+R(-3,3)],[x+12,444+R(-2,4)],[x+24,432+R(-3,3)]],i%2?OR_S:OR_M,3,{op:.85,taper:[.1,.3]});}
// ---------- yellow scarf at the neck, one end blown toward the gate ----------
fill([[212,222],[248,212],[300,206],[336,218],[328,246],[290,252],[246,252],[218,244]],{size:4.6,len:15,ang:ANG(8),wob:1.5,blend:.6,col:G3([212,230],[336,230],YL_L,YL_M,YL_S)});
PATH([[322,224],[368,208],[410,186],[440,160]],YL_M,5.4,{taper:[.1,.85]});
PATH([[326,234],[368,222],[408,202],[430,180]],YL_S,3.2,{taper:[.1,.8],op:.9});
PATH([[324,218],[366,200],[408,178]],YL_L,2,{op:.85,taper:[.15,.7]});
PATH([[224,246],[236,296],[256,326],[268,344]],YL_S,4.6,{taper:[.1,.8]});
PATH([[220,242],[230,288],[248,318]],YL_L,2,{op:.8,taper:[.15,.7]});
// ---------- near arm, screen left: teal sleeve, elbow in, forearm up, palm out ----------
LIMB([[226,290],[232,348],[226,414]],[56,50,42],[TL_L,TL_M,TL_S,TL_C],{size:3.8,len:11,cover:1.3,blend:.6,wob:1.6,ang:NZF(AXF([[226,290],[226,414]]),.3,16)});
LIMB([[226,414],[180,350],[130,298]],[42,38,30],[TL_L,TL_M,TL_S,TL_C],{size:3.4,len:10,cover:1.3,blend:.6,wob:1.6,lv:[-.7,-.4],ang:NZF(AXF([[226,414],[130,298]]),.3,16)});
// elbow crease, cuff
FOLD([[210,386],[236,402],[250,396]],3.6,TL_C,TL_H,.55);
PATH([[128,300],[150,314]],[['titanium_white',.8],['viridian',.3],['cerulean',.3]],3.5,{op:.8});
// sleeve highlight on the lit outer side
PATH([[218,296],[212,350],[210,404]],TL_H,3.2,{op:.7,taper:[.15,.6]});
PATH([[210,396],[170,342],[138,306]],TL_H,2.8,{op:.7,taper:[.15,.6]});
// ---------- raised right hand: palm out, fingers spread (mitten read replaced by four fingers and a thumb) ----------
fill([[104,290],[130,296],[142,282],[124,262],[96,258]],{size:3.2,len:8,ang:ANG(-60),col:G3s([96,270],[142,270],SK_L,SK_M,SK_S),blend:.5,wob:1.3});
FNG([[98,262],[84,248],[64,238]],3,SK_L);FNG([[110,260],[100,242],[88,224]],3,SK_M);
FNG([[124,266],[122,248],[116,228]],3,SK_M);FNG([[136,276],[142,260],[142,242]],2.8,SK_S);
FNG([[100,290],[84,282],[68,284]],3.2,SK_L);   // thumb
PATH([[108,294],[130,290]],SK_S,3,{op:.6});
// ---------- reaching left hand, flat on the telepod shell ----------
fill([[616,194],[664,166],[704,148],[708,162],[672,188],[630,208]],{size:3.4,len:9,ang:ANG(-25),col:G3s([616,180],[708,180],SK_L,SK_M,SK_S),blend:.5,wob:1.2});
FNG([[664,164],[690,150],[712,142]],2.8,SK_L);FNG([[658,172],[686,164],[714,158]],2.8,SK_M);FNG([[650,182],[676,180],[700,176]],2.6,SK_S);
FNG([[636,200],[646,214],[660,222]],3,SK_M);
// ---------- neck ----------
fill([[228,196],[290,200],[290,236],[246,236]],{size:4.4,len:12,ang:ANG(80),wob:1.4,blend:.8,col:G3s([228,210],[292,210],SK_M,SK_S,SK_S,SK_C)});
// ---------- rim light from the gate on the shadow (screen right) edges ----------
RIM([[398,410],[386,350],[372,300]],2.6,.55);
RIM([[512,636],[504,606],[480,580]],2.6,.5);
RIM([[664,982],[634,998]],3,.55);
RIM([[368,648],[372,620],[386,590]],2.4,.45);
// sun-lit warm left edges
for(const pts of [[[228,270],[244,240]],[[262,380],[244,330]],[[222,420],[222,356]]])PATH(pts,RIMW,2.2,{op:.45,taper:[.2,.6]});
// ---------- lost edges toward the shadow side ----------
for(const [pts,sz,op] of [[[[400,420],[392,500],[404,590]],12,.4],[[[368,700],[366,778]],9,.4],[[[550,720],[538,800],[534,880]],10,.35],[[[372,300],[398,400]],10,.4]])SOFT(pts,sz,op);

// ---------- HEAD (12x ref crop, origin canvas 1285,785): small strokes, warm young face ----------
p.dry();
{MAP(1285,785,12,1345,1030,KL,-25,0);NOBRK=true;
 const FL=[['titanium_white',.9],['flesh_tint',.9],['naples_yellow',.15],['cadmium_orange',.03],['quinacridone_rose',.05]];
 const FM=[['titanium_white',.5],['flesh_tint',1],['yellow_ochre',.08],['cadmium_orange',.05],['quinacridone_rose',.08]];
 const FS=[['flesh_tint',.8],['burnt_sienna',.14],['quinacridone_rose',.1],['titanium_white',.4],['yellow_ochre',.06],['cadmium_orange',.02]];
 const FR=[['flesh_tint',.8],['titanium_white',.4],['burnt_sienna',.1],['quinacridone_rose',.1],['yellow_ochre',.05]];

 const FC=[['flesh_tint',.7],['burnt_sienna',.28],['quinacridone_rose',.1],['yellow_ochre',.06],['titanium_white',.3]];
 const BL=[['quinacridone_rose',.35],['flesh_tint',.8],['titanium_white',.4],['cadmium_orange',.05]];
 // plum bob behind the jaw, on the lit side
 fill([[126,300],[146,364],[186,426],[236,436],[252,410],[214,340],[192,290],[150,268]],{size:2.4,len:7,cover:1.3,ang:AXF([[150,290],[190,400]]),blend:.8,wob:1.3,col:G3s([126,330],[250,330],PL_L,PL_M,PL_S,PL_S)});
 PATH([[138,310],[158,380],[200,426]],PL_L,1.6,{op:.7,taper:[.1,.8]});
 // neck: narrow, warm half-tone, in the shadow of the jaw
 fill([[262,440],[326,462],[338,512],[298,528],[272,516]],{size:3,len:6,cover:1,thin:.85,ang:ANG(60),blend:.5,col:G3s([262,470],[340,470],FS,FC,FC,FC)});
 // face
 const FACE=[[216,214],[290,196],[380,214],[426,246],[454,312],[468,392],[450,446],[408,482],[350,490],[292,462],[240,408],[212,320]];
 fill(FACE,{size:4.4,len:9,cover:1.1,ang:NZF(ANG(15),.35,12),wob:.6,thin:.9,blend:1,bop:.35,o:{edge:.6},col:GR([212,300],[468,330],[FL,FM,FM,mixL(FM,FR,.5)],.04)});
 // brow shade under the helmet band
 fill([[216,214],[300,198],[400,222],[420,252],[300,248],[228,264]],{size:2.4,len:6,ang:ANG(-8),col:CC(FS),op:.4,thin:.7,o:{edge:.5}});
 // far cheek plane, a touch cooler and pinker
 fill([[340,330],[404,300],[444,344],[436,440],[380,486],[346,440]],{size:3.6,len:7,ang:ANG(20),col:CC(FR),op:.45,thin:.85,o:{edge:.6}});
 // rosy cheek and lit cheek/forehead
 fill([[250,380],[300,366],[330,410],[300,452],[262,430]],{size:3.2,len:6,ang:ANG(20),col:CC(BL),op:.4,thin:.85,o:{edge:.6}});
 fill([[236,330],[286,318],[300,350],[262,376],[236,366]],{size:3,len:6,ang:ANG(15),col:CC(FL),op:.55,thin:.85,o:{edge:.6}});
 fill([[236,224],[310,208],[380,226],[372,246],[300,238],[240,250]],{size:1.8,len:4.5,ang:ANG(-6),col:CC(FL),op:.5,thin:.6,o:{edge:.5}});
 // chin and jaw: warm turn
 fill([[320,462],[410,470],[420,484],[350,496],[318,484]],{size:2.4,len:5,ang:ANG(10),col:CC(FS),op:.4,thin:.7,o:{edge:.5}});
 // thin round glasses
 for(const [cx,cy,r] of [[338,300,36],[430,274,28]]){
  const pts=[];for(let k=0;k<=10;k++){const a=k/10*TAU;const q=T(cx+Math.cos(a)*r,cy+Math.sin(a)*r);pts.push([q[0],q[1],.6]);}
  p.stroke({points:pts,color:[['titanium_white',1],['naples_yellow',.5],['yellow_ochre',.15]],brush:'round',size:.6,load:.9,thin:.3,opacity:.8});}
 PATH([[372,296],[404,284]],[['titanium_white',1],['naples_yellow',.4]],.5,{op:.6});
 // eyes: dark iris under a lash line, white catch, raised brows
 DB(341,305,1.9,[['burnt_umber',.5],['ultramarine',.25],['yellow_ochre',.2],['titanium_white',.3]],{opacity:.9,pressure:.7});
 DB(430,279,1.6,[['burnt_umber',.5],['ultramarine',.25],['yellow_ochre',.2],['titanium_white',.3]],{opacity:.9,pressure:.7});
 DB(338,300,.6,[['titanium_white',2]],{opacity:.9});DB(428,274,.5,[['titanium_white',2]],{opacity:.9});
 PATH([[308,284],[338,268],[368,278]],[['burnt_sienna',.7],['burnt_umber',.3],['yellow_ochre',.3],['titanium_white',.2]],.8,{op:.8});
 PATH([[296,246],[336,226],[376,234]],[['burnt_sienna',.7],['yellow_ochre',.4],['cobalt_violet',.1],['titanium_white',.3]],1,{op:.75,taper:[.2,.5]});
 PATH([[404,228],[440,216],[466,226]],[['burnt_sienna',.7],['yellow_ochre',.4],['cobalt_violet',.1],['titanium_white',.3]],.9,{op:.7,taper:[.2,.5]});
 // nose: soft lit bridge, warm shade under the tip
 PATH([[392,304],[402,360],[424,398]],FL,1.8,{op:.55,taper:[.2,.4]});
 DB(416,404,1.6,FS,{opacity:.5,pressure:.6});
 // mouth: small open "o", warm rose interior, lit lower lip
 DB(398,446,1.7,[['quinacridone_rose',.4],['burnt_sienna',.35],['alizarin_crimson',.1],['titanium_white',.3]],{pressure:.7,opacity:.85});
 PATH([[378,462],[398,468],[418,458]],[['quinacridone_rose',.3],['flesh_tint',.8],['titanium_white',.6]],1,{op:.7,taper:[.2,.4]});
 PATH([[296,468],[350,490],[412,476]],FC,2.6,{op:.75,taper:[.15,.5]});
 // ear under the bob
 DB(240,382,2.2,mixL(FM,FS,.35),{opacity:.85,pressure:.6});
 // fringe of plum hair under the band
 fill([[128,300],[196,262],[240,236],[300,216],[290,246],[240,282],[200,330],[168,366],[134,340]],{size:2.2,len:6,cover:1.3,ang:AXF([[240,250],[200,330],[150,350]]),wob:1.3,col:G3s([130,300],[300,240],PL_L,PL_M,PL_S,PL_S),op:.95});
 // helmet dome, gold band, glossy highlight, gate reflection
 const DOME=[[104,300],[104,226],[130,142],[196,86],[272,72],[346,90],[410,130],[440,172],[400,184],[330,160],[240,200],[160,260],[130,320]];
 fill(DOME,{size:3.2,len:8,cover:1.3,ang:NZF(TANG(260,200),.2,12),thin:.6,blend:1.5,bop:.5,wob:1,col:GR([104,200],[440,170],[HM_L,HM_M,HM_S,mixL(HM_S,[['cerulean',.3]],.4)],.04)});
 PATH([[110,330],[130,280],[210,220],[300,176],[380,150],[430,150],[446,180]],GOLD,5.6,{taper:[.05,.4]});
 PATH([[116,324],[140,276],[214,214],[300,170],[380,144]],[['naples_yellow',.8],['titanium_white',.8],['cadmium_yellow',.15]],1.8,{op:.8,taper:[.15,.5]});
 PATH([[122,338],[160,296],[234,244],[320,200]],[['burnt_umber',.5],['yellow_ochre',.3],['cobalt_violet',.3]],1.8,{op:.5,taper:[.15,.5]});
 PATH([[118,230],[150,150],[200,112],[260,96]],[['titanium_white',2],['naples_yellow',.2]],2.8,{op:.85,thin:.3,taper:[.2,.6]});
 DB(180,170,2,[['titanium_white',2],['naples_yellow',.2]],{opacity:.9});
 PATH([[360,100],[410,130],[432,170]],[['cerulean',.5],['titanium_white',1],['cobalt_violet',.3]],2.6,{op:.7,taper:[.1,.5]});
 // antenna on the helmet's right side
 PATH([[352,102],[372,60],[388,26]],[['paynes_grey',.9],['titanium_white',.3]],1,{});
 DB(390,20,2.4,[['cadmium_red',1],['cadmium_orange',.3]],{pressure:.8});DB(388,17,.8,[['titanium_white',1],['cadmium_orange',.4]],{pressure:.8,opacity:.9});
 // scarf collar over the neck, in front of everything
 PATH([[236,520],[290,548],[350,536]],YL_M,3.6,{taper:[.1,.3]});PATH([[240,516],[290,538],[346,526]],YL_L,1.6,{op:.8,taper:[.1,.4]});PATH([[250,540],[300,560],[352,548]],YL_S,2.4,{op:.8,taper:[.1,.4]});
 NOBRK=false;
 }
