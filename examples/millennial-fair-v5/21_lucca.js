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
// ===== LUCCA on the stage, three-quarter to the gate, recoiling. Ref origin canvas (1060,660) -> ref px = 2x =====
OX=1060;OY=660;SC=.5;SZ=.55;
const G3=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c]);
const G3s=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c],.05);
const OR_L=[['cadmium_orange',1],['cadmium_yellow',.5],['titanium_white',.35]];
const OR_M=[['cadmium_orange',1],['cadmium_red',.25],['cadmium_yellow',.2],['titanium_white',.15]];
const OR_S=[['cadmium_orange',.5],['burnt_sienna',.6],['alizarin_crimson',.2],['cobalt_violet',.2],['titanium_white',.1]];
const OR_C=[['burnt_sienna',.7],['alizarin_crimson',.3],['cobalt_violet',.35],['ultramarine',.1]];
const TL_L=[['viridian',.5],['cerulean',.5],['titanium_white',1.1],['cadmium_lemon',.1]];
const TL_M=[['viridian',.8],['cerulean',.3],['titanium_white',.5],['sap_green',.1]];
const TL_S=[['viridian',.8],['ultramarine',.35],['titanium_white',.2],['burnt_umber',.1]];
const TL_C=[['viridian',.5],['ultramarine',.5],['burnt_umber',.3],['dioxazine_purple',.1]];
const BK_L=[['paynes_grey',.8],['ultramarine',.3],['titanium_white',.7],['cobalt_violet',.1]];
const BK_M=[['paynes_grey',.9],['ultramarine',.3],['titanium_white',.2]];
const BK_S=[['ivory_black',.9],['ultramarine',.35],['burnt_umber',.2]];
const SK_L=[['titanium_white',1.2],['flesh_tint',.8],['naples_yellow',.2],['cadmium_orange',.04]];
const SK_M=[['titanium_white',.8],['flesh_tint',.9],['cadmium_orange',.08],['yellow_ochre',.1],['quinacridone_rose',.05]];
const SK_S=[['flesh_tint',.7],['burnt_sienna',.3],['cobalt_violet',.18],['quinacridone_rose',.06],['titanium_white',.35]];
const PL_L=[['dioxazine_purple',.4],['alizarin_crimson',.3],['titanium_white',1.2],['cobalt_violet',.4]];
const PL_M=[['dioxazine_purple',.7],['alizarin_crimson',.4],['titanium_white',.5],['cobalt_violet',.3]];
const PL_S=[['dioxazine_purple',.8],['alizarin_crimson',.3],['ultramarine',.3],['burnt_umber',.15],['titanium_white',.1]];
const HM_L=[['cobalt_blue',.5],['paynes_grey',.5],['titanium_white',1.6],['naples_yellow',.2]];
const HM_M=[['cobalt_blue',.7],['paynes_grey',.6],['titanium_white',.6]];
const HM_S=[['paynes_grey',.9],['ultramarine',.5],['cobalt_violet',.2],['titanium_white',.1]];
const YL_L=[['cadmium_yellow',1],['titanium_white',.5],['cadmium_lemon',.3]];
const YL_S=[['cadmium_yellow',.8],['yellow_ochre',.5],['raw_sienna',.2],['cobalt_violet',.12]];
const BT=[[['paynes_grey',.5],['burnt_umber',.5],['titanium_white',.3],['cobalt_violet',.15]],[['van_dyke_brown',.9],['ultramarine',.3],['burnt_umber',.4]],[['ivory_black',1],['ultramarine',.3]]];

// ---------- cast shadow of the figure on the stage deck (falls right) ----------
fill([[430,740],[470,712],[560,700],[700,712],[820,720],[820,760],[700,772],[520,764],[430,752]],{size:16,len:60,ang:ANG(4),thin:.55,blend:.8,op:.7,col:GR([430,740],[820,740],[[['cobalt_violet',.6],['ultramarine',.3],['burnt_umber',.4],['titanium_white',.3]],[['cobalt_violet',.6],['ultramarine',.2],['raw_sienna',.2],['titanium_white',.6]]])});
// ---------- legs ----------
// rear leg (screen left): bare knee, short black shorts, mid-calf boot on tiptoe
LIMB([[540,470],[520,540],[508,596],[490,640],[480,670]],[46,36,30,32,24],[SK_L,SK_M,SK_S,SK_S],{size:6,len:20,blend:.7,bop:.5,bias:.08});
DB(516,556,8,SK_L,{opacity:.5,load:1});
PATH([[500,572],[522,578]],SK_S,3,{op:.6,taper:[.2,.6]});
fill([[522,420],[572,450],[558,500],[510,508],[504,482]],{size:11,len:36,ang:AXF([[545,430],[528,500]]),blend:.6,col:G3s([495,470],[575,470],BK_L,BK_M,BK_S)});
fill([[470,664],[498,668],[497,694],[484,722],[462,745],[440,745],[432,730],[450,710],[460,690]],{size:7,len:20,ang:AXF([[484,668],[470,710],[440,742]]),blend:.6,col:G3s([430,700],[500,700],BT[0],BT[1],BT[2])});
PATH([[474,672],[458,714],[440,740]],[['burnt_sienna',.5],['paynes_grey',.4],['titanium_white',.4]],3,{op:.75,taper:[.1,.7]});
PATH([[470,664],[498,668]],[['titanium_white',.4],['paynes_grey',.5],['cobalt_violet',.2]],2.4,{op:.7});
// front leg (screen right)
LIMB([[628,470],[650,540],[657,596],[656,640],[654,670]],[40,34,28,30,22],[SK_L,SK_M,SK_S,SK_S],{size:6,len:20,blend:.7,bop:.5,bias:.08});
DB(648,554,7,SK_L,{opacity:.5,load:1});
fill([[594,430],[630,400],[660,468],[664,508],[626,510],[612,490]],{size:11,len:36,ang:AXF([[610,420],[630,500]]),blend:.6,col:G3s([600,470],[670,470],BK_M,BK_S,BK_S)});
fill([[640,664],[670,664],[670,694],[690,716],[712,730],[708,745],[668,745],[640,724],[636,692]],{size:7,len:20,ang:AXF([[654,668],[652,700],[700,738]]),blend:.6,col:G3s([630,700],[712,700],BT[0],BT[1],BT[2])});
PATH([[644,672],[642,704],[668,734]],[['burnt_sienna',.5],['paynes_grey',.4],['titanium_white',.4]],3,{op:.7,taper:[.1,.7]});
PATH([[640,664],[670,664]],[['titanium_white',.4],['paynes_grey',.5],['cobalt_violet',.2]],2.4,{op:.7});
// ---------- shorts hips ----------
fill([[518,348],[560,344],[604,338],[630,372],[640,420],[592,456],[546,446],[522,420]],{size:13,len:44,ang:AXF([[540,350],[565,440]]),blend:.7,col:G3([515,400],[645,400],BK_L,BK_M,BK_S)});
// ---------- far arm (blue-teal, in shade) reaching to the gate ----------
fill([[590,232],[640,214],[690,224],[740,176],[758,166],[760,190],[700,252],[650,262],[598,262]],{size:11,len:40,ang:AXF([[595,245],[650,238],[700,225],[755,178]]),blend:.6,col:G3([590,240],[760,200],TL_M,TL_S,TL_C)});
fill([[734,170],[760,160],[764,180],[744,192]],{size:6,len:16,ang:ANG(-20),col:G3([734,176],[764,176],SK_M,SK_M,SK_S)});
// ---------- torso: orange tunic ----------
fill([[503,232],[520,210],[556,206],[582,216],[600,252],[604,336],[562,350],[522,347],[500,300]],{size:14,len:46,ang:AXF([[545,215],[552,280],[560,345]]),blend:.9,bsz:1.6,col:G3([498,280],[606,280],OR_L,OR_M,OR_S,OR_C)});
// tunic hem / belt line
PATH([[505,338],[550,346],[602,340]],[['ivory_black',.5],['burnt_umber',.6],['cadmium_orange',.2]],7,{op:.8});
// chest light and underarm shade
fill([[512,230],[548,222],[560,270],[520,300]],{size:9,len:26,ang:ANG(80),col:CC(OR_L),op:.7,thin:.5,blend:.4});
// ---------- yellow scarf ----------
fill([[500,206],[540,196],[566,208],[562,230],[532,236],[504,228]],{size:8,len:26,ang:ANG(15),col:G3([500,215],[566,215],YL_L,YL_L,YL_S)});
PATH([[506,222],[480,236],[462,262],[452,290]],YL_L,10,{taper:[.1,.8]});
PATH([[516,228],[496,252],[490,284]],YL_S,8,{taper:[.1,.8]});
// ---------- near arm (teal sleeve), upper arm forward, forearm up ----------
fill([[496,250],[500,232],[530,240],[570,250],[598,235],[612,206],[622,214],[612,262],[580,282],[548,268],[512,268]],{size:11,len:40,ang:AXF([[503,248],[550,262],[590,262],[612,215]]),blend:.7,col:G3([498,235],[620,285],TL_L,TL_M,TL_S,TL_C)});
// hand raised, palm to the gate
fill([[610,208],[618,150],[628,148],[640,156],[642,176],[632,210],[620,216]],{size:5,len:16,ang:ANG(-85),col:G3s([606,180],[646,180],SK_L,SK_M,SK_S),blend:.8,bop:.5});
fill([[604,190],[612,168],[620,172],[616,196]],{size:3.2,len:8,ang:ANG(-70),col:G3s([604,180],[620,180],SK_L,SK_M,SK_M),blend:.4});
// ---------- neck ----------
fill([[510,190],[544,186],[548,218],[516,222]],{size:7,len:20,ang:ANG(80),col:G3([508,205],[550,205],SK_M,SK_S,SK_S)});
// ---------- lost edges on the shadow side ----------
for(const [pts,sz,op] of [[[[602,252],[606,300],[600,340]],10,.5],[[[664,508],[660,468],[634,404]],10,.45],[[[657,596],[656,640]],8,.4],[[[708,730],[670,745]],8,.4]])SOFT(pts,sz,op);
// ---------- head (canvas coordinates; 1 unit = 1 canvas px) ----------
p.dry();
{const o0=[OX,OY,SC,SZ];OX=0;OY=0;SC=1;SZ=1;
 const FL=[['titanium_white',1.1],['flesh_tint',.9],['naples_yellow',.1],['quinacridone_rose',.04]];
 const FM=[['titanium_white',.7],['flesh_tint',1],['yellow_ochre',.05],['quinacridone_rose',.05]];
 const FS=[['flesh_tint',.8],['titanium_white',.4],['burnt_sienna',.14],['cobalt_violet',.1],['quinacridone_rose',.06]];
 const FC=[['flesh_tint',.6],['titanium_white',.25],['burnt_sienna',.25],['cobalt_violet',.12],['alizarin_crimson',.05]];
 // neck: warm half-tone skin, soft
 fill([[1316,758],[1334,756],[1337,772],[1317,774]],{size:4,len:9,cover:1.4,ang:ANG(80),thin:.7,blend:2,bop:.6,o:{edge:.5},col:G3s([1316,764],[1337,764],FM,FM,mixL(FM,FS,.6))});
 // plum bob framing the face, behind the jaw
 fill([[1291,742],[1300,736],[1312,740],[1313,758],[1309,770],[1299,768],[1291,756]],{size:4.5,len:12,ang:AXF([[1300,740],[1298,768]]),blend:.8,col:G3s([1291,755],[1313,755],PL_M,PL_S,PL_S)});
 PATH([[1297,744],[1295,758],[1300,768]],PL_L,2.4,{op:.7,taper:[.1,.8]});
 // face: strokes curve around the head; light left/forehead, half-tone, soft warm shadow on the far side and under the chin
 const FACE=[[1308,738],[1318,733],[1334,733],[1342,740],[1344,747],[1347,751],[1343,754],[1343,759],[1338,765],[1329,769],[1319,767],[1311,761],[1309,750]];
 fill(FACE,{size:4,len:9,cover:1.5,ang:ANG(55),wob:.6,thin:.7,blend:3,bop:.6,o:{edge:.55},col:G3s([1308,748],[1347,752],FL,FM,FM,mixL(FM,FS,.55))});
 // brow shadow under the helmet rim, soft and warm
 fill([[1309,737],[1322,734],[1341,735],[1343,741],[1322,742],[1311,745]],{size:3.4,len:8,ang:ANG(-6),col:CC(FS),op:.4,thin:.7,blend:2,bop:.5,o:{edge:.5}});
 // warm shadow plane down the far cheek and under the chin
 fill([[1336,745],[1344,748],[1342,760],[1336,766],[1330,766],[1334,756]],{size:3.4,len:8,ang:ANG(80),col:CC(FS),op:.35,thin:.7,blend:2,bop:.5,o:{edge:.5}});
 // ear
 DB(1310,748,3.6,mixL(FM,FS,.4),{opacity:.8});
 // thin round glasses, light rims, eyes barely suggested
 for(const [cx,cy,r] of [[1321,744,4.3],[1334,746,3.6]]){
  const pts=[];for(let k=0;k<=8;k++){const a=k/8*TAU;const q=T(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.95);pts.push([q[0],q[1],.6]);}
  p.stroke({points:pts,color:[['titanium_white',1],['naples_yellow',.4],['yellow_ochre',.2]],brush:'round',size:.9,load:.9,thin:.3,opacity:.8});
  DB(cx+.5,cy+.4,2.2,[['burnt_sienna',.3],['ultramarine',.2],['yellow_ochre',.2],['titanium_white',.6]],{opacity:.5,pressure:.5});}
 PATH([[1325,744],[1330,745]],[['titanium_white',1],['naples_yellow',.4]],.8,{op:.7});
 // nose: lit bridge, warm shade beneath
 PATH([[1339,745],[1343,751]],FL,2.2,{op:.7});
 DB(1341,754,2,FS,{opacity:.45});
 // mouth: one small soft warm touch
 DB(1335,760,2.4,[['quinacridone_rose',.15],['raw_umber',.08],['titanium_white',.9]],{pressure:.6,opacity:.7});
 // helmet: a rounded dome with a glossy highlight, gold band at the rim, cool reflected gate light on the right
 const DOME=[[1291,742],[1288,728],[1292,716],[1302,708],[1316,705],[1330,707],[1341,716],[1346,728],[1344,734],[1334,736],[1320,739],[1305,744]];
 fill(DOME,{size:6,len:14,ang:TANG(1318,730),thin:.6,blend:1.8,bop:.55,col:G3s([1290,712],[1346,738],HM_L,HM_M,HM_S,HM_S)});
 PATH([[1292,741],[1306,738],[1320,735],[1344,731]],[['yellow_ochre',.7],['burnt_umber',.3],['paynes_grey',.2],['titanium_white',.15]],2.2,{});
 PATH([[1294,739],[1308,736],[1320,733]],[['naples_yellow',.8],['titanium_white',.8]],.9,{op:.65});
 PATH([[1294,724],[1299,715],[1308,710],[1318,708]],[['titanium_white',2],['naples_yellow',.2]],2.6,{op:.9,thin:.3,taper:[.2,.6]});
 DB(1301,719,2.4,[['titanium_white',2],['naples_yellow',.2]],{opacity:.9});
 PATH([[1338,712],[1344,720],[1346,729]],[['cerulean',.5],['titanium_white',1],['cobalt_violet',.3]],2.2,{op:.7,taper:[.1,.5]});
 // antenna on the helmet's right side
 PATH([[1311,707],[1309,699],[1311,692]],[['paynes_grey',.9],['titanium_white',.3]],1.4,{});
 DB(1311,690,3,[['cadmium_red',1],['cadmium_orange',.3]],{pressure:.8});
 OX=o0[0];OY=o0[1];SC=o0[2];SZ=o0[3];}
