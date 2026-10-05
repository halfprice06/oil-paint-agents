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
// ===== MARLE pulled backward into the air before the gate vortex. Ref origin canvas (1520,520), ref px = 2x =====
OX=1520;OY=520;SC=.5;SZ=.8;
const G3=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c]);
const JS_L=[['titanium_white',2.4],['naples_yellow',.14],['cerulean',.06]];
const JS_M=[['titanium_white',1.6],['cerulean',.3],['cobalt_blue',.12]];
const JS_H=[['titanium_white',1],['cobalt_blue',.4],['cobalt_violet',.25],['cerulean',.1]];
const JS_S=[['cobalt_violet',.6],['ultramarine',.3],['cobalt_blue',.3],['titanium_white',.55]];
const JS_C=[['ultramarine',.55],['cobalt_violet',.45],['dioxazine_purple',.1],['titanium_white',.3]];
const SK_L=[['titanium_white',1.6],['flesh_tint',.6],['naples_yellow',.2],['quinacridone_rose',.04]];
const SK_M=[['titanium_white',1],['flesh_tint',.8],['yellow_ochre',.1],['quinacridone_rose',.06]];
const SK_S=[['flesh_tint',.7],['burnt_sienna',.2],['cobalt_violet',.25],['titanium_white',.6],['quinacridone_rose',.08]];
const HR_L=[['naples_yellow',.7],['titanium_white',.7],['cadmium_orange',.12],['quinacridone_rose',.05]];
const HR_M=[['naples_yellow',.5],['cadmium_orange',.35],['yellow_ochre',.2],['titanium_white',.4],['quinacridone_rose',.1]];
const HR_S=[['burnt_sienna',.6],['cadmium_orange',.35],['alizarin_crimson',.12],['cobalt_violet',.2]];
const GD_L=[['cadmium_yellow',1],['titanium_white',.45],['naples_yellow',.3]];
const GD_M=[['cadmium_yellow',.8],['yellow_ochre',.5],['cadmium_orange',.1]];
const GD_S=[['yellow_ochre',.8],['burnt_sienna',.4],['cobalt_violet',.15],['cadmium_yellow',.2]];
const SH_L=[['naples_yellow',.7],['titanium_white',1],['raw_sienna',.1]];
const SH_M=[['naples_yellow',.6],['titanium_white',.6],['raw_sienna',.3],['yellow_ochre',.2]];
const SH_S=[['raw_sienna',.5],['cobalt_violet',.3],['titanium_white',.4],['burnt_umber',.1]];
const LVM=[-.7,-.45]; // sun from the upper left
// ---------- ponytail streaming toward the vortex ----------
LIMB([[386,176],[450,170],[530,140],[610,90],[680,48],[712,30]],[26,40,36,26,14,4],[HR_L,HR_M,HR_S],{size:10,len:40,lv:LVM,blend:.5,o:{taper:[.1,.8]}});
for(const [a,b,c] of [[[400,190],[520,150],[640,66]],[[398,200],[500,176],[600,110]],[[396,185],[480,160],[560,118]]])PATH([a,b,c,[b[0]+90,b[1]-50]],HR_L,5,{taper:[.1,.9],op:.8});
PATH([[400,206],[500,196],[600,140],[680,78]],HR_S,6,{taper:[.1,.9],op:.7});
// ---------- bent near leg ----------
LIMB([[500,382],[580,342]],[92,66],[JS_L,JS_M,JS_H,JS_S],{size:11,len:36,lv:LVM,blend:.6});
LIMB([[580,342],[690,430],[742,470]],[62,42,34],[JS_L,JS_M,JS_H,JS_S,JS_C],{size:10,len:34,lv:LVM,blend:.6,bias:.08});
fill([[722,452],[770,470],[778,500],[738,502],[702,472]],{size:8,len:22,ang:ANG(25),col:G3([700,450],[780,500],SH_L,SH_M,SH_S),blend:.5});
// knee cap highlight
DB(582,336,12,JS_L,{load:1.2});
// ---------- straight far leg trailing toward the gate ----------
LIMB([[462,408],[548,515],[655,662]],[86,64,40],[JS_L,JS_M,JS_H,JS_S,JS_C],{size:11,len:38,lv:LVM,blend:.7,bias:.08});
fill([[630,640],[668,640],[702,672],[730,700],[736,716],[706,724],[664,692],[640,666]],{size:8,len:24,ang:ANG(40),col:G3([630,640],[736,716],SH_L,SH_M,SH_S),blend:.5});
// ---------- hips and torso ----------
fill([[392,380],[436,350],[500,350],[546,392],[540,422],[490,446],[440,440],[410,420]],{size:12,len:40,ang:ANG(-25),blend:.7,col:G3([395,400],[545,400],JS_L,JS_M,JS_H,JS_S)});
fill([[345,292],[372,262],[420,238],[455,246],[470,276],[468,310],[430,332],[392,372],[378,350],[352,320]],{size:11,len:36,ang:AXF([[350,300],[420,280],[466,280]]),blend:.8,bsz:1.6,col:G3([345,300],[470,300],JS_L,JS_M,JS_H,JS_S)});
// light plane on the lit chest, cool shade under the arm and waist
fill([[352,298],[386,270],[420,262],[404,300],[372,322]],{size:8,len:22,ang:ANG(-35),col:CC(JS_L),op:.8,thin:.5,blend:.4});
fill([[430,320],[466,300],[468,312],[430,336]],{size:7,len:18,ang:ANG(-20),col:CC(JS_C),op:.6});
// gold belt
fill([[408,326],[474,306],[480,322],[438,352],[402,394],[390,378]],{size:7,len:30,ang:ANG(-40),col:G3([392,380],[480,310],GD_L,GD_M,GD_S)});
// pendant, glowing
DB(402,284,13,[['titanium_white',1],['cerulean',.4],['cobalt_violet',.1]],{opacity:.7,load:.8});
DB(402,284,6,[['titanium_white',2],['cerulean',.2]],{load:1.3});
// ---------- arms: skin, bare shoulders ----------
LIMB([[445,255],[472,160],[432,76],[414,38]],[31,27,21,17],[SK_L,SK_M,SK_S],{size:8,len:28,lv:LVM,blend:.5});
LIMB([[360,298],[292,262],[262,226],[272,176]],[31,26,20,16],[SK_L,SK_M,SK_S],{size:8,len:28,lv:LVM,blend:.5});
fill([[392,14],[422,6],[434,30],[428,58],[410,62],[396,50]],{size:6,len:18,ang:ANG(-70),col:G3([384,30],[440,30],SK_L,SK_M,SK_S),blend:.5});
fill([[270,144],[284,142],[294,160],[290,180],[272,180],[266,160]],{size:6,len:16,ang:ANG(-80),col:G3([262,160],[298,160],SK_L,SK_M,SK_S),blend:.5});
// bracelets
PATH([[412,64],[434,72]],GD_M,7,{});PATH([[262,182],[290,188]],GD_M,7,{});
// ---------- neck and head ----------
fill([[360,236],[390,232],[394,264],[364,270]],{size:6,len:16,ang:ANG(80),col:G3([360,250],[394,250],SK_M,SK_S,SK_S)});
// ---------- head (8x reference: origin canvas (1660,590), 1 ref px = .125 canvas px) ----------
p.dry();
{const o0=[OX,OY,SC,SZ];OX=1660;OY=590;SC=.125;SZ=1;
 // hair behind the face and the back of the head
 fill([[100,300],[110,220],[180,140],[300,108],[420,128],[500,200],[524,330],[470,260],[400,205],[200,215],[160,262]],{size:5,len:14,ang:ANG(-15),blend:.4,col:G3([100,200],[520,200],HR_L,HR_M,HR_S)});
 // face: lit warm left cheek, soft cool shade on the right, nothing dark at the jaw
 fill([[165,252],[200,188],[300,168],[420,192],[456,262],[432,346],[372,410],[300,452],[246,414],[190,340]].map(q=>[310+(q[0]-310)*.88,q[1]]),{size:4,len:11,ang:ANG(75),blend:.8,bop:.5,col:G3([165,300],[456,300],SK_L,SK_M,SK_M,SK_S)});
 // forehead light, cheek warmth, chin light
 fill([[210,200],[300,182],[390,200],[380,240],[290,226],[220,240]],{size:3,len:9,ang:ANG(-5),col:CC(SK_L),op:.75,thin:.5});
 // brow shadow band and eye sockets (cool, soft), then tiny eyes
 fill([[200,240],[300,226],[400,222],[420,262],[300,262],[210,268]],{size:3,len:9,ang:ANG(-5),col:CC(mixL(SK_S,[['cobalt_violet',.4],['titanium_white',.4]],.4)),op:.5,thin:.55,blend:.6,bop:.45});
 DB(240,266,3,[['ultramarine',.6],['cerulean',.4],['burnt_umber',.35]],{pressure:.9});
 DB(372,254,3,[['ultramarine',.6],['cerulean',.4],['burnt_umber',.35]],{pressure:.9});
 PATH([[214,244],[250,236],[276,240]],[['burnt_sienna',.7],['yellow_ochre',.4],['cobalt_violet',.2]],1.6,{op:.8});
 PATH([[344,230],[378,226],[408,236]],[['burnt_sienna',.7],['yellow_ochre',.4],['cobalt_violet',.2]],1.6,{op:.8});
 // nose: light bridge, small warm shadow under the tip
 PATH([[308,262],[304,318],[300,346]],SK_L,3,{op:.7});
 DB(310,362,3.2,mixL(SK_S,[['quinacridone_rose',.2]],.3),{opacity:.55});
 // mouth: one small soft warm touch, lips parted
 DB(300,414,2.6,[['quinacridone_rose',.3],['burnt_sienna',.15],['flesh_tint',.8],['titanium_white',.35]],{pressure:.7,opacity:.8});
 // hair bang over the brow on the light side, ear on the left
 fill([[160,254],[190,190],[250,160],[330,150],[300,190],[220,206],[190,258]],{size:4,len:10,ang:ANG(-25),col:G3([160,200],[330,170],HR_L,HR_M,HR_S),op:.95});
 OX=o0[0];OY=o0[1];SC=o0[2];SZ=o0[3];}
// ---------- cold gate light rimming the shadow edges, warm sun on the left edges ----------
PATH([[470,262],[468,310],[432,334]],[['cerulean',.5],['titanium_white',1],['cobalt_violet',.2]],5,{op:.8,taper:[.1,.6]});
PATH([[700,430],[742,470]],[['cerulean',.5],['titanium_white',1],['cobalt_violet',.2]],5,{op:.7,taper:[.1,.6]});

// ---------- details: folds, knee, cuffs, sun glints on the upper left edges ----------
PATH([[560,330],[582,350],[600,346]],JS_C,5,{op:.55,taper:[.2,.7]});
PATH([[690,430],[672,448],[660,444]],JS_S,5,{op:.5,taper:[.2,.7]});
PATH([[506,470],[540,486],[560,500]],JS_S,6,{op:.5,taper:[.2,.7]});
PATH([[630,636],[650,650],[664,660]],JS_C,5,{op:.55});
for(const pts of [[[470,260],[430,242],[392,262]],[[352,300],[372,266]],[[462,410],[510,478]],[[510,372],[566,336]],[[590,332],[690,414]]])PATH(pts,[['naples_yellow',.8],['titanium_white',1.4]],2.4,{op:.45,taper:[.2,.7]});
// ---------- lost edges on the shadow side ----------
for(const [pts,sz,op] of [[[[470,262],[470,310],[436,336]],10,.5],[[[546,392],[540,424],[492,448]],10,.5],[[[650,470],[610,560],[640,640]],10,.4],[[[740,470],[700,430],[640,380]],9,.4],[[[472,160],[480,230],[450,262]],8,.4]])SOFT(pts,sz,op);
