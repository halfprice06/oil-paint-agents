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
// ===== CRONO, seen from behind running toward the gate. Ref origin = canvas (420,930), ref px = 2x =====
OX=420;OY=930;SC=.5;SZ=.55;
// palettes
const TAN_L=[['titanium_white',2.2],['raw_sienna',.18],['burnt_sienna',.1],['cobalt_violet',.04]];
const TAN_M=[['raw_sienna',.6],['titanium_white',1.3],['yellow_ochre',.08],['cobalt_violet',.1]];
const TAN_S=[['raw_sienna',.45],['burnt_umber',.15],['cobalt_violet',.45],['titanium_white',.9],['ultramarine',.06]];
const TAN_C=[['burnt_umber',.6],['cobalt_violet',.6],['raw_sienna',.3],['ultramarine',.15],['titanium_white',.2]];
const BOOT_L=[['burnt_sienna',.8],['burnt_umber',.6],['titanium_white',.28]];
const BOOT_M=[['burnt_umber',1],['burnt_sienna',.45],['titanium_white',.06]];
const BOOT_D=[['van_dyke_brown',1],['ultramarine',.3],['burnt_umber',.4]];
const BL_L=[['cobalt_blue',.35],['cerulean',.2],['titanium_white',2.2],['naples_yellow',.3]];
const BL_M=[['cobalt_blue',.7],['cerulean',.25],['titanium_white',1.3],['burnt_umber',.05],['cobalt_violet',.1]];
const BL_H=[['cobalt_blue',.7],['cobalt_violet',.3],['titanium_white',1],['burnt_umber',.05]];
const BL_S=[['ultramarine',.5],['cobalt_violet',.4],['titanium_white',.55],['cobalt_blue',.2],['burnt_umber',.06]];
const BL_C=[['ultramarine',.6],['dioxazine_purple',.12],['cobalt_violet',.25],['titanium_white',.2],['burnt_umber',.14]];
const GN_L=[['sap_green',.8],['cadmium_lemon',.5],['titanium_white',.7],['viridian',.1]];
const GN_M=[['sap_green',1],['viridian',.35],['cadmium_lemon',.25],['titanium_white',.3]];
const GN_S=[['viridian',.7],['sap_green',.35],['ultramarine',.3],['burnt_umber',.2]];
const GN_C=[['viridian',.5],['ultramarine',.35],['burnt_umber',.4],['dioxazine_purple',.1]];
const SK_L=[['titanium_white',1.5],['flesh_tint',.7],['naples_yellow',.15],['quinacridone_rose',.04]];
const SK_M=[['titanium_white',.9],['flesh_tint',.85],['yellow_ochre',.08],['quinacridone_rose',.06]];
const SK_S=[['flesh_tint',.7],['burnt_sienna',.25],['cobalt_violet',.22],['quinacridone_rose',.08],['titanium_white',.5]];
const HR_L=[['cadmium_red',1.2],['cadmium_orange',1],['titanium_white',.1],['cadmium_yellow',.1]];
const HR_M=[['cadmium_red',1.3],['cadmium_orange',.35],['alizarin_crimson',.1]];
const HR_S=[['alizarin_crimson',.9],['cadmium_red',.5],['burnt_umber',.25],['ultramarine',.1]];
const HR_C=[['alizarin_crimson',.9],['burnt_umber',.55],['ultramarine',.25],['dioxazine_purple',.1]];
const WH_L=[['titanium_white',2],['naples_yellow',.2]];
const WH_S=[['titanium_white',1.2],['cobalt_violet',.3],['cerulean',.25],['ultramarine',.06]];
const OR_L=[['cadmium_orange',1],['cadmium_yellow',.4],['titanium_white',.15]];
const OR_S=[['cadmium_orange',.8],['cadmium_red',.5],['alizarin_crimson',.2],['cobalt_violet',.1]];


const G3=(A,B,a,b,c,d)=>GR(A,B,[a,b,c,d||c]);
// ---------- 1. cast shadow on the sand (long, falls to the lower right) ----------
fill([[596,1192],[650,1168],[720,1142],[765,1150],[742,1176],[800,1196],[960,1232],[1180,1272],[1500,1330],[1500,1372],[1180,1310],[960,1272],[800,1236],[690,1218]],
 {size:26,len:90,ang:ANG(10),thin:.6,blend:1,bsz:1.6,op:.82,col:GR([600,1190],[1400,1330],[[['cobalt_violet',.7],['ultramarine',.3],['raw_umber',.3],['titanium_white',.7],['alizarin_crimson',.05]],[['cobalt_violet',.6],['ultramarine',.2],['raw_sienna',.2],['titanium_white',1.1]]])});

// ---------- 2. rear leg (screen left): thigh, knee, calf, boot ----------
LIMB([[540,830],[512,930],[478,1030],[448,1118]],[104,92,76,66],[TAN_L,TAN_M,TAN_S,TAN_C],{size:15,len:50,blend:.7,bias:-.12});
LIMB([[448,1112],[402,1062],[376,1034]],[66,58,52],[TAN_L,TAN_M,TAN_S,TAN_C],{size:11,len:34,blend:.6,bias:-.1});
// knee cap catches the light
fill([[404,1088],[444,1076],[470,1108],[452,1146],[420,1140]],{size:9,len:22,ang:ANG(30),blend:.5,col:GR([404,1088],[470,1140],[TAN_L,TAN_L,TAN_M])});
// reflected sand light on the shaded thigh edge
PATH([[548,880],[540,960],[512,1050],[488,1100]],[['naples_yellow',.4],['raw_sienna',.5],['cobalt_violet',.2],['titanium_white',.4]],8,{op:.55,taper:[.2,.6]});
// rear boot with the sole turned up to the light
fill([[198,1018],[250,986],[320,946],[345,924],[356,944],[358,986],[402,1022],[414,1052],[404,1082],[376,1091],[352,1070],[332,1026],[290,1030],[236,1034],[204,1030]],
 {size:13,len:40,ang:AXF([[210,1025],[300,965],[350,935]]),thin:.5,blend:.5,col:G3([200,1010],[400,1070],BOOT_L,BOOT_M,BOOT_D)});
fill([[205,1020],[260,990],[318,950],[300,985],[250,1020]],{size:7,len:26,ang:ANG(-28),col:CC(BOOT_L),op:.9,thin:.3});
PATH([[352,945],[356,985],[400,1022]],BOOT_L,5,{op:.8});

// ---------- 3. front leg (planted): thigh, calf and boot ----------
LIMB([[598,840],[598,930],[598,1030]],[70,62,56],[TAN_M,TAN_S,TAN_C],{size:12,len:40,blend:.6,bias:-.05});
fill([[566,1042],[592,1030],[626,1018],[632,1062],[626,1100],[660,1090],[692,1090],[696,1106],[662,1142],[622,1182],[596,1199],[573,1191],[570,1122]],
 {size:12,len:36,ang:AXF([[600,1030],[600,1120],[690,1100]]),blend:.5,col:G3([566,1100],[690,1100],BOOT_L,BOOT_M,BOOT_D)});
PATH([[570,1060],[574,1130],[580,1190]],BOOT_L,6,{op:.8});
PATH([[566,1040],[595,1030],[628,1020]],BOOT_M,8,{});

// ---------- 4. tunic skirt (hip length), sun on the left, violet shade right ----------
fill([[458,688],[608,698],[622,745],[636,840],[560,852],[480,846],[392,830],[428,760]],
 {size:20,len:70,ang:AXF([[520,690],[512,760],[505,850]]),blend:1,bsz:1.7,col:G3([395,780],[640,780],BL_L,BL_M,BL_H,BL_S)});
// shadow under the hem on the thighs
fill([[470,850],[560,858],[636,848],[636,858],[560,870],[474,862]],{size:7,len:30,ang:ANG(0),col:CC(mixL(TAN_C,TAN_S,.6)),op:.45,thin:.55});
// hem folds and swing, shadow cast by the swinging hand
for(const [x,y,l] of [[430,822,40],[490,836,44],[560,846,46],[612,840,40]])PATH([[x,y-l],[x+R(-5,5),y]],BL_S,9,{op:.65,taper:[.1,.6]});
// ---------- 5. torso (back of the tunic) ----------
fill([[484,492],[528,470],[600,478],[634,508],[640,566],[610,690],[460,688],[462,600],[478,552]],
 {size:17,len:56,ang:AXF([[535,690],[545,590],[565,490]]),blend:1,bsz:1.7,col:G3([450,580],[650,580],BL_L,BL_M,BL_H,BL_S)});
// shoulder blade planes and spine groove
fill([[466,548],[520,534],[546,596],[516,640],[470,622]],{size:10,len:30,ang:ANG(60),col:CC(BL_L),op:.7,thin:.5,blend:.4});
PATH([[566,500],[556,590],[544,680]],BL_S,7,{op:.65,taper:[.1,.7]});
PATH([[600,520],[612,600],[606,680]],BL_C,10,{op:.5,taper:[.1,.8]});
// ---------- belt ----------
fill([[456,684],[612,692],[614,710],[456,704]],{size:8,len:60,ang:ANG(2),col:G3([444,690],[620,690],[['ivory_black',.9],['burnt_umber',.5],['titanium_white',.15]],[['ivory_black',1],['burnt_umber',.3],['titanium_white',.06]],[['ivory_black',1],['ultramarine',.25]])});
// ---------- katana scabbard at the left hip ----------
PATH([[470,706],[432,770],[392,840],[354,898]],[['ivory_black',.8],['burnt_umber',.6],['ultramarine',.12],['titanium_white',.1]],13,{});
PATH([[464,712],[428,776],[392,838]],BOOT_L,3.5,{op:.85});
PATH([[372,866],[352,900]],[['cadmium_yellow',.6],['yellow_ochre',.6],['burnt_umber',.2]],10,{});

// ---------- 6. left arm (swinging back) ----------
LIMB([[470,500],[428,560],[392,620],[364,700],[360,768]],[50,44,40,34,28],[GN_L,GN_M,GN_S,GN_C],{size:12,len:44,blend:.6});
fill([[464,492],[490,502],[470,520],[446,520]],{size:8,len:18,ang:ANG(-30),col:CC(GN_L),op:.9});
// elbow crease
PATH([[385,585],[420,590],[430,610]],GN_C,5,{op:.6});
// ---------- 7. right arm (forward, raised) ----------
LIMB([[636,520],[700,500],[728,480]],[48,42,36],[GN_L,GN_M,GN_S,GN_C],{size:11,len:36,blend:.5,lv:[-.5,-.85]});
LIMB([[728,480],[742,440],[738,396]],[40,34,28],[GN_L,GN_M,GN_S,GN_C],{size:10,len:30,blend:.5,lv:[-.6,-.8]});
// ---------- 8. neck, ear, head skin ----------
fill([[546,418],[598,418],[622,430],[616,468],[540,468]],{size:9,len:24,ang:ANG(90),col:G3([540,440],[620,440],SK_M,SK_S,SK_S)});
fill([[600,380],[628,392],[630,430],[608,448],[594,420]],{size:7,len:18,ang:ANG(80),col:G3([596,410],[632,410],SK_M,SK_M,SK_S)});
// ---------- 9. ascot ----------
fill([[520,462],[608,454],[616,474],[600,490],[536,492],[520,480]],{size:8,len:30,ang:ANG(0),col:G3([520,470],[616,470],OR_L,OR_L,OR_S,OR_S)});
PATH([[524,476],[496,490],[470,518],[452,540]],OR_L,10,{taper:[.1,.7]});
PATH([[530,484],[510,508],[498,540]],OR_S,8,{taper:[.1,.7]});
// ---------- 10. hands ----------
fill([[338,776],[376,770],[394,792],[398,822],[404,860],[374,852],[342,838]],{size:7,len:20,ang:ANG(80),col:G3([338,800],[404,800],SK_L,SK_M,SK_S)});
fill([[722,392],[750,398],[744,356],[728,326],[714,340],[706,352],[712,382]],{size:6,len:18,ang:ANG(-85),col:G3([704,360],[750,360],SK_L,SK_M,SK_S)});
// ---------- 11. hair: one flame mass, spikes streaming back ----------
const HC=[565,425],HK=1.2;const HP=a=>a.map(q=>[HC[0]+(q[0]-HC[0])*HK,HC[1]+(q[1]-HC[1])*HK]);
const HAIR=HP([[505,414],[498,372],[470,336],[432,262],[486,300],[494,282],[455,214],[522,262],[500,200],[464,176],[540,236],[548,158],[570,226],[586,182],[600,256],[612,214],[624,282],[634,256],[640,322],[648,362],[642,402],[612,428],[540,430]]);
fill(HAIR,{sharp:true,size:12,len:44,ang:RADF(565,430),cover:1.3,wob:.6,thin:.55,blend:.5,bop:.35,o:{taper:[.1,.75]},col:G3([430,200],[660,440],HR_M,HR_M,HR_S,HR_C)});
// each spike: a dark underside stroke, then the sunlit side, tapering to a point
const SPK=[[[515,330],[428,252],20],[[505,345],[440,300],16],[[525,312],[460,170],24],[[550,300],[543,150],26],[[580,300],[588,172],24],[[600,306],[614,206],22],[[620,326],[634,250],18],[[500,330],[490,200],20]];
for(const [a,b,w] of SPK){const A=HP([a])[0],B=HP([b])[0];const mid=[(A[0]+B[0])/2+R(-8,8),(A[1]+B[1])/2];
 PATH([A,mid,B],HR_S,w*.9,{taper:[.05,.95],thin:.5});
 const o1=[A[0]-w*.18,A[1]],o2=[mid[0]-w*.14,mid[1]],o3=[B[0]-1,B[1]+4];
 PATH([o1,o2,o3],G3([430,200],[660,300],HR_L,HR_L,HR_M)(A[0],A[1]),w*.5,{taper:[.05,.95],thin:.4,load:1.2});}
// warm sun glints along the lit left edge of the mass
for(const [a,b] of [[[472,340],[452,292]],[[500,300],[470,214]],[[538,278],[532,190]],[[570,262],[580,194]]])PATH(HP([a,b]),HR_L,5,{taper:[.1,.9],load:1.3,thin:.3});
// cold gate light on the shadow side
for(const [a,b] of [[[636,330],[640,290]],[[646,380],[640,336]]])PATH(HP([a,b]),[['cobalt_violet',.7],['cerulean',.3],['titanium_white',.5]],6,{taper:[.1,.9],op:.8});
// ---------- 12. bandana + tails ----------
PATH([[498,388],[530,406],[590,412],[642,392]],WH_S,22,{});
PATH([[500,384],[536,398],[590,402]],WH_L,12,{});
PATH([[518,398],[488,402],[462,420],[420,436],[390,432]],WH_L,14,{taper:[.05,.8]});
PATH([[522,404],[498,418],[478,440],[450,452]],WH_S,12,{taper:[.05,.8]});
// ---------- details: cloth folds, cast shadows, rim light, accents ----------
// pants folds across the thighs and knee
for(const [a,b] of [[[466,940],[522,966]],[[420,1100],[470,1128]]])PATH([a,[(a[0]+b[0])/2,(a[1]+b[1])/2+R(-6,6)],b],TAN_S,6,{op:.6,taper:[.2,.6]});

// tunic: cast shadow of the raised arm on the right shoulder, wrinkles pulled by the belt
fill([[596,512],[644,534],[642,610],[604,596]],{size:8,len:26,ang:ANG(75),col:CC(BL_S),op:.35,thin:.6,blend:1.2,bop:.6});
for(const [x,y] of [[480,676],[520,680],[560,684],[596,690]])PATH([[x,y],[x+R(8,16),y+R(-18,-10)]],BL_S,5,{op:.55,taper:[.1,.7]});
for(const [x,y] of [[480,712],[530,718],[580,722]])PATH([[x,y],[x+R(-10,-4),y+R(14,26)]],BL_S,5,{op:.5,taper:[.1,.7]});
// boots: lit edges and cuffs
PATH([[570,1046],[576,1120],[584,1186]],BOOT_L,4,{op:.85,taper:[.1,.7]});
PATH([[200,1020],[250,990],[310,950]],BOOT_L,4,{op:.85,taper:[.1,.7]});
PATH([[352,1040],[392,1070],[404,1100]],[['burnt_umber',.8],['ivory_black',.4]],5,{op:.8});
// cold gate light rimming the shadow edges (right side)
for(const pts of [[[640,520],[648,580],[630,640]],[[612,700],[630,760],[636,830]],[[634,930],[632,1000],[630,1020]],[[748,410],[742,470],[728,500]]])PATH(pts,[['cerulean',.5],['titanium_white',1],['cobalt_violet',.3]],4,{op:.75,taper:[.1,.6]});
// warm sun glints on the lit left edges
for(const pts of [[[484,500],[470,545]],[[430,570],[402,620]],[[372,690],[366,760]],[[470,700],[444,790]],[[455,940],[445,1010]]])PATH(pts,[['naples_yellow',1],['titanium_white',1.2]],3.5,{op:.7,taper:[.1,.7]});
// ---------- lost edges on the shadow side (soft badger drags), a few found edges stay crisp on the lit side ----------
for(const [pts,sz,op] of [[[[642,520],[648,580],[630,650],[618,700]],12,.55],[[[632,720],[636,790],[638,850]],12,.5],[[[636,860],[634,940],[630,1020]],12,.5],[[[568,1100],[596,1190]],10,.45],[[[750,420],[742,470],[702,510]],10,.5],[[[655,380],[644,420],[612,432]],10,.5],[[[470,880],[455,960],[440,1060]],10,.35],[[[420,560],[392,640],[372,720]],10,.35]])SOFT(pts,sz,op);
