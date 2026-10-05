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

// ---------- cast shadow on the plaza, falling right and a little toward us ----------
fill([[520,1384],[600,1370],[800,1380],[1100,1396],[1400,1410],[1640,1420],[1700,1436],[1640,1452],[1400,1448],[1100,1436],[800,1428],[620,1432],[540,1424]],{size:11,len:50,ang:ANG(4),thin:.55,blend:.9,op:.75,wob:1.3,col:GR([520,1400],[1700,1430],[[['cobalt_violet',.6],['ultramarine',.3],['burnt_umber',.5],['paynes_grey',.2]],[['cobalt_violet',.6],['ultramarine',.25],['burnt_umber',.3],['titanium_white',.25]],[['cobalt_violet',.5],['raw_sienna',.3],['titanium_white',.6]]])});
// ---------- left (screen) leg: tan pants, the boot raised behind ----------
fill([[508,880],[582,884],[590,960],[586,1040],[580,1110],[506,1108],[510,1040],[506,960]],{size:5.4,len:18,cover:1.2,ang:NZF(AXF([[546,884],[544,1108]]),.3,18),blend:.7,wob:1.5,col:G3([506,1000],[592,1000],PN_L,PN_M,PN_S,PN_C)});
FOLD([[516,1030],[548,1050],[576,1040]],3.4,PN_C,PN_H,.5);
FOLD([[520,950],[552,970],[578,962]],3,PN_S,PN_H,.45);
// left boot: calf with a folded cuff, the foot turned out behind
fill([[502,1108],[572,1110],[568,1170],[562,1226],[576,1262],[568,1296],[520,1304],[494,1292],[496,1250],[512,1212],[508,1160]],{size:4.6,len:15,cover:1.3,ang:NZF(AXF([[538,1110],[534,1210],[528,1290]]),.3,16),blend:.6,wob:1.4,col:G3s([494,1200],[578,1200],BT_H,BT_L,BT_M,BT_S)});
fill([[500,1104],[574,1106],[574,1136],[502,1134]],{size:3.4,len:11,ang:ANG(-4),col:G3([500,1120],[576,1120],BT_H,BT_L,BT_M,BT_S),op:.95});   // cuff
PATH([[502,1138],[574,1140]],BT_C,2.2,{op:.7});
PATH([[500,1170],[498,1210]],BT_H,2.2,{op:.6,taper:[.15,.6]});
// ---------- right leg: pants to the bent knee, then the rear boot with its sole toward us ----------
fill([[590,884],[702,872],[708,960],[692,1060],[684,1146],[600,1160],[596,1060],[588,960]],{size:5.4,len:18,cover:1.2,ang:NZF(AXF([[646,884],[640,1160]]),.3,18),blend:.7,wob:1.5,col:G3([590,1000],[710,1000],PN_L,PN_M,PN_S,PN_C)});
FOLD([[610,960],[650,990],[690,978]],3.6,PN_C,PN_H,.5);
FOLD([[604,1060],[640,1090],[684,1076]],3.4,PN_S,PN_H,.45);
// bent knee: a warm, rounded lump with creases behind it
fill([[596,1138],[674,1128],[690,1186],[664,1232],[622,1240],[598,1202]],{size:4.4,len:13,cover:1.3,ang:ANG(20),blend:.6,wob:1.4,col:G3s([596,1180],[690,1180],PN_H,PN_L,PN_M,PN_S)});
FOLD([[610,1176],[640,1196],[672,1186]],3.2,PN_C,PN_H,.5);
// boot shaft and heel
fill([[598,1196],[654,1188],[666,1240],[646,1296],[640,1350],[628,1406],[604,1418],[576,1410],[566,1360],[572,1300],[580,1250]],{size:4.6,len:15,cover:1.3,ang:NZF(AXF([[622,1200],[612,1300],[602,1410]]),.3,16),blend:.6,wob:1.3,col:G3s([566,1300],[668,1300],BT_L,BT_M,BT_S,BT_C)});
fill([[594,1190],[656,1182],[660,1212],[598,1222]],{size:3.4,len:11,ang:ANG(-10),col:G3([594,1200],[660,1200],BT_H,BT_L,BT_M,BT_S),op:.95});   // cuff
// the sole: a clean slab, tan welt, heel block and forefoot with an arch between
fill([[572,1304],[636,1300],[638,1352],[630,1408],[604,1418],[578,1410],[566,1362]],{size:3.6,len:12,cover:1.3,ang:ANG(88),blend:.4,col:G3s([566,1340],[640,1340],BT_M,BT_S,BT_C,BT_C)});
PATH([[574,1306],[634,1302]],[['raw_sienna',.7],['yellow_ochre',.4],['titanium_white',.3]],2.6,{op:.9});                 // top welt
PATH([[570,1356],[636,1350]],[['raw_umber',.6],['ivory_black',.5]],1.8,{op:.8});                                    // arch gap
PATH([[568,1362],[580,1410],[604,1418]],[['raw_sienna',.7],['yellow_ochre',.3],['titanium_white',.3]],2.2,{op:.8,taper:[.1,.5]});  // lit left welt
PATH([[640,1306],[640,1352],[630,1410]],BT_C,2.4,{op:.75});
FOLD([[580,1318],[606,1326],[630,1316]],2.4,BT_C,BT_L,.5);
FOLD([[580,1376],[606,1386],[628,1378]],2.4,BT_C,BT_L,.5);
// ---------- tunic skirt: flared, blown to the left by the run; folds radiate from the belt ----------
fill([[500,700],[690,692],[712,780],[736,880],[580,908],[424,896],[450,800],[476,740]],{size:6.4,len:22,cover:1.2,ang:NZF(AXF([[560,704],[560,800],[570,900]]),.35,22),blend:.9,bsz:1.6,wob:1.6,col:GR([424,820],[736,820],[TN_H,TN_L,TN_M,TN_S,TN_C])});
GLZ([[430,860],[470,780],[540,740],[560,800],[520,870]],CC(TN_H),ANG(100),{size:4.4,len:12,op:.55});
GLZ([[630,730],[712,780],[736,882],[650,900],[640,820]],G3([620,800],[736,800],TN_S,TN_S,TN_C),ANG(80),{size:4.4,len:12,op:.55,cover:1.1});
for(const [a,b,c,d] of [[[540,718],[524,780],[500,850],[470,892]],[[590,716],[586,790],[584,850],[590,900]],[[640,714],[656,780],[680,850],[712,888]],[[510,716],[484,770],[452,830],[438,884]]])FOLD([a,b,c,d],5,TN_C,TN_H,.5,[3,-1]);
// hem: scalloped, a wind-lift on the left
for(let i=0;i<7;i++){const x=428+i*44;PATH([[x,892+i*1.2+R(-3,3)],[x+22,910+R(-2,4)],[x+44,900+R(-3,3)]],i%2?TN_S:TN_M,4,{op:.85,taper:[.1,.3]});}
// ---------- vest: sleeveless tunic body, light on the left shoulder-blade ----------
fill([[510,490],[552,468],[596,470],[650,466],[690,486],[698,560],[690,650],[702,704],[498,704],[504,610],[506,540]],{size:6.4,len:22,cover:1.2,ang:NZF(AXF([[560,480],[556,590],[552,700]]),.35,20),blend:.9,bsz:1.6,wob:1.6,col:GR([500,540],[702,600],[TN_H,TN_L,TN_M,TN_S,TN_C])});
GLZ([[516,500],[560,476],[600,486],[580,560],[540,620],[510,600]],CC(TN_H),ANG(-70),{size:4.4,len:12,op:.55});
GLZ([[630,490],[690,500],[698,620],[690,690],[650,690],[640,600]],G3([620,560],[698,560],TN_S,TN_S,TN_C),ANG(80),{size:4.4,len:12,op:.55,cover:1.1});
FOLD([[560,560],[580,620],[592,690]],5,TN_C,TN_H,.45);
FOLD([[640,540],[656,610],[662,690]],4.4,TN_C,TN_H,.4);
FOLD([[530,640],[550,672],[566,700]],4,TN_S,TN_H,.4);
// belt
fill([[494,694],[704,684],[708,716],[490,722]],{size:3.6,len:20,ang:ANG(-3),cover:1.3,col:G3([490,704],[710,704],BK_L,BK_M,BK_M,BK_M)});
PATH([[498,696],[560,694],[620,690]],[['paynes_grey',.5],['titanium_white',.7],['cobalt_violet',.2]],1.8,{op:.7,taper:[.1,.6]});
// ---------- arms: green sleeves, hand at the hip and a fist raised ----------
LIMB([[524,498],[446,566],[388,640]],[66,60,52],[GR_H,GR_L,GR_M,GR_S,GR_C],{size:4.8,len:16,cover:1.3,lv:LVC,blend:.6,wob:1.6,ang:NZF(AXF([[524,498],[388,640]]),.25,18)});
LIMB([[388,640],[412,718],[448,782]],[52,46,40],[GR_H,GR_L,GR_M,GR_S,GR_C],{size:4.2,len:14,cover:1.3,lv:LVC,blend:.6,wob:1.6,ang:NZF(AXF([[388,640],[448,782]]),.25,18)});
FOLD([[402,626],[420,650],[420,676]],3.4,GR_C,GR_H,.5);
FOLD([[420,712],[440,730],[446,756]],3,GR_C,GR_H,.45);
LIMB([[690,502],[758,570],[806,652]],[66,60,54],[GR_H,GR_L,GR_M,GR_S,GR_C],{size:4.8,len:16,cover:1.3,lv:LVC,blend:.6,wob:1.6,ang:NZF(AXF([[690,502],[806,652]]),.25,18)});
LIMB([[806,652],[802,584],[788,512]],[54,48,42],[GR_H,GR_L,GR_M,GR_S,GR_C],{size:4.2,len:14,cover:1.3,lv:LVC,blend:.6,wob:1.6,ang:NZF(AXF([[806,652],[788,512]]),.25,18)});
FOLD([[780,620],[808,628],[826,610]],3.4,GR_C,GR_H,.5);
// raised fist: knuckles toward us, thumb over the fingers
fill([[748,508],[776,466],[806,462],[820,486],[808,516],[776,526]],{size:3.4,len:9,cover:1.3,ang:ANG(-50),col:G3s([746,490],[822,490],SK_L,SK_M,SK_S),blend:.5,wob:1.3});
FNG([[756,480],[770,468],[790,464]],3,SK_L);FNG([[784,470],[800,466],[816,478]],3,SK_M);PATH([[760,500],[792,508],[812,500]],SK_S,2.4,{op:.7});
// fist at the hip gripping the katana
fill([[424,774],[452,768],[470,788],[462,816],[434,820],[418,800]],{size:3.4,len:9,cover:1.3,ang:ANG(70),col:G3s([418,790],[470,790],SK_L,SK_M,SK_S),blend:.5,wob:1.3});
// katana: hilt up past the fist (white cord wrap), tsuba, scabbard slanting down and back
PATH([[452,784],[470,744],[482,716]],[['paynes_grey',.5],['ivory_black',.5],['titanium_white',.4]],3.8,{});
for(let i=0;i<4;i++){const t=i/3;PATH([[456+t*22-4,776-t*58],[456+t*22+6,772-t*58]],[['titanium_white',1],['cerulean',.2]],1.2,{op:.9});}
PATH([[432,800],[462,790]],[['yellow_ochre',.7],['burnt_umber',.3],['titanium_white',.2]],3,{});
PATH([[450,806],[418,866],[372,938],[338,988]],[['ivory_black',.9],['ultramarine',.3],['burnt_umber',.3]],4.6,{taper:[.05,.5]});
PATH([[444,806],[412,866],[366,938]],[['paynes_grey',.5],['titanium_white',.9],['cerulean',.2]],1.2,{op:.8,taper:[.1,.7]});
// ---------- neck, scarf, bandana, hair ----------
fill([[596,418],[652,414],[660,452],[598,454]],{size:3.6,len:9,cover:1.3,ang:ANG(80),blend:.6,col:G3s([596,430],[660,430],SK_M,SK_S,SK_S)});
fill([[566,446],[652,442],[662,476],[602,490],[568,476]],{size:3.8,len:12,cover:1.3,ang:ANG(5),wob:1.5,blend:.5,col:G3([566,460],[664,460],OR_L,OR_M,OR_S)});
PATH([[570,462],[556,490],[540,512]],OR_M,5,{taper:[.1,.8]});PATH([[576,468],[564,492],[556,516]],OR_S,3.4,{taper:[.1,.8],op:.9});
// hair: one flame mass. A base cap, then long tapered spikes from back to front, swept left by the run
{const CAP=[[532,356],[526,320],[552,290],[600,278],[652,288],[690,314],[694,360],[678,402],[646,424],[606,430],[568,420],[544,396]];
 fill(CAP,{size:5,len:16,cover:1.3,ang:NZF(RADF(610,450),.2,12),wob:1.3,blend:.5,col:GR([520,360],[700,330],[HR_H,HR_L,HR_M,HR_S,HR_C],.05)});
 const SP=[[690,330,730,296,26,.1],[668,312,720,212,34,-.05],[650,300,664,142,34,-.15],[630,292,628,120,32,-.25],[610,288,596,96,38,-.25],[588,290,566,112,34,-.3],[566,296,520,118,36,-.35],[546,304,474,138,38,-.35],[534,324,468,262,26,-.35],[532,338,446,238,32,-.4],[552,384,500,430,20,-.2],[664,382,708,346,20,.1],[600,292,560,150,28,-.2],[636,290,690,170,28,0]];
 for(const [bx,by,tx,ty,w,bd] of SP){const mx=(bx+tx)/2+(ty-by)*bd*.5,my=(by+ty)/2-(tx-bx)*bd*.5;const u=clamp((bx-500)/200,0,1);
  const col=u<.35?HR_L:u<.7?HR_M:HR_S;const hl=u<.5?HR_H:HR_L;
  PATH([[bx,by],[mx,my],[tx,ty]],col,w*.4,{taper:[.05,.95],thin:.55});
  PATH([[bx-w*.18,by],[mx-w*.18,my],[tx-w*.05,ty+8]],hl,w*.18,{op:.8,taper:[.1,.9],thin:.5});
  PATH([[bx+w*.2,by+2],[mx+w*.2,my],[tx+w*.03,ty+14]],u<.7?HR_S:HR_C,w*.2,{op:.6,taper:[.1,.9],thin:.5});}
 // shadow between spikes and a few loose strands, warm sun glints on the sun side
 for(const [a,b,c] of [[[560,330],[556,250],[546,190]],[[600,340],[600,260],[596,190]],[[640,340],[642,280],[650,220]],[[700,330],[704,300],[706,280]]])PATH([a,b,c],HR_C,2.6,{op:.45,taper:[.2,.9]});
 for(const [a,b,c] of [[[542,320],[516,280],[490,250]],[[560,300],[546,240],[530,190]],[[600,290],[596,220],[590,160]]])PATH([a,b,c],RIMS,1.5,{op:.6,taper:[.2,.8]});
 fill([[548,392],[606,410],[672,396],[660,424],[606,430],[560,420]],{size:3.4,len:10,ang:ANG(0),col:CC(HR_C),op:.6,thin:.6,blend:.5});}
// bandana: white band round the back of the head with a knot and two long tails blown left
fill([[538,366],[600,378],[672,368],[690,392],[650,410],[600,414],[552,406]],{size:3.8,len:14,cover:1.3,ang:ANG(8),wob:1.4,blend:.5,col:G3([538,386],[690,386],BD_L,BD_M,BD_S)});
PATH([[562,370],[532,400],[492,430],[452,452]],BD_M,8,{taper:[.08,.4]});PATH([[566,376],[536,404],[496,434],[458,456]],BD_S,3.6,{taper:[.08,.4],op:.8});
PATH([[544,384],[520,408],[484,434]],BD_L,2.6,{op:.9,taper:[.2,.8]});
PATH([[596,380],[574,412],[540,444],[506,476]],BD_M,7.4,{taper:[.08,.4]});PATH([[600,388],[578,418],[544,448],[512,480]],BD_S,3.2,{taper:[.08,.4],op:.8});
PATH([[582,394],[560,418],[528,448]],BD_L,2.4,{op:.9,taper:[.2,.8]});
PATH([[548,368],[600,380],[670,370]],BD_L,2.2,{op:.8,taper:[.2,.5]});   // lit top edge
// ---------- rim light from the gate on the right (shadow) edges, warm sun on the left edges ----------
for(const pts of [[[698,520],[694,610],[702,700]],[[734,884],[712,790],[702,712]],[[708,960],[692,1060],[684,1140]],[[812,500],[824,560],[812,650]],[[690,330],[692,372],[676,400]]])PATH(pts,RIMV,3,{op:.6,taper:[.25,.6]});
for(const pts of [[[500,712],[480,760],[450,810],[432,868]],[[510,500],[506,560]],[[502,590],[500,640]],[[516,504],[486,532]],[[444,570],[414,610]],[[508,884],[506,960],[506,1040]],[[536,334],[520,310],[496,280]],[[540,386],[560,414]]])PATH(pts,RIMS,2.4,{op:.5,taper:[.25,.6]});
// ---------- lost edges on the shadow side ----------
for(const [pts,sz,op] of [[[[698,520],[694,610],[702,700]],10,.4],[[[734,884],[712,790]],10,.35],[[[708,960],[692,1060]],9,.35],[[[666,1240],[646,1296],[640,1350]],8,.35]])SOFT(pts,sz,op);
