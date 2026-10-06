// ---- shared helpers (prepended to every pass by build.sh) ----
const R=(a,b)=>p.rand(a,b),TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const hx2=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const toHex=a=>'#'+a.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
const mixh=(a,b,t)=>{const A=hx2(a),B=hx2(b);return toHex(A.map((v,i)=>lerp(v,B[i],t)));};
// broken colour from a hex: small value/hue jitter and a second near-colour streak
function K(h,j,st){j=j===undefined?.05:j;const c=hx2(h);const d=R(-1,1)*j*255;const base=toHex(c.map(v=>v+d+R(-1,1)*j*110));
  if(st===false)return base;const alt=toHex(c.map(v=>v+d*.5+R(-1,1)*j*260));return [[base,1],[alt,R(.15,.6)]];}
// gradient stops [[t,hex],...]
function G(stops,t){t=clamp(t,0,1);for(let i=0;i<stops.length-1;i++){if(t<=stops[i+1][0]){const u=(t-stops[i][0])/(stops[i+1][0]-stops[i][0]);return mixh(stops[i][1],stops[i+1][1],clamp(u,0,1));}}return stops[stops.length-1][1];}
const pr=(i,n)=>{const f=i/(n-1);return .4+.6*Math.sin(Math.PI*clamp(f*.9+.05,0,1));};
function seg(x,y,len,ang,bend,n){n=n||4;const pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;const b=bend*(t*t-.08);pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*b,y+Math.sin(ang)*len*t+Math.cos(ang)*b,pr(i,n)]);}return pts;}
const F=(pts,c,size,o)=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size:size,load:1,thin:.4},o||{}));
const S=(x,y,len,ang,c,size,o)=>{o=Object.assign({},o||{});const b=o.bend===undefined?R(-.12,.12)*len:o.bend;const n=o.n||4;delete o.bend;delete o.n;return F(seg(x,y,len,ang,b,n),c,size,o);};
const SB=(pts,size,op,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],q[2]===undefined?.8:q[2]]),brush:'soft',size:Math.min(size,88),opacity:op===undefined?.5:op,color:'titanium_white'},o||{}));
const SBs=(x,y,len,ang,size,op)=>SB(seg(x,y,len,ang,R(-.05,.05)*len,3),size,op);
const area=poly=>{let a=0;for(let i=0;i<poly.length;i++){const q=poly[i],r=poly[(i+1)%poly.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
const inPoly=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const bbox=poly=>{const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};
// cover a polygon with overlapping patches; col(x,y) -> colour; o.ang, o.angJ, o.len, o.dens, o.o (stroke opts), o.angf(x,y)
function cover(poly,size,col,o){o=o||{};const dens=o.dens||1,lenf=o.len||2.2;const n=Math.max(1,Math.round(area(poly)*dens*1.4/(size*size*lenf*.7)));
 const [x0,y0,x1,y1]=bbox(poly);let k=0,g=0;
 while(k<n&&g++<n*50){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;
  const a=(o.angf?o.angf(x,y):(o.ang||0))+R(-1,1)*(o.angJ===undefined?.3:o.angJ);const sz=size*R(.75,1.25);
  let L=sz*lenf*R(.7,1.3);const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  S(x,y,L,a,col(x,y),sz,Object.assign({brush:'filbert'},o.o||{}));}
 return n;}
const ELL=(cx,cy,rx,ry,rot,n)=>{n=n||20;rot=rot||0;const pts=[];for(let i=0;i<n;i++){const a=i/n*TAU;const x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return pts;};
// arc stroke around (cx,cy) radius r from angle a0 to a1 (radians, screen coords)
function arc(cx,cy,r,a0,a1,c,size,o){const n=5,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,pr(i,n)]);}return F(pts,c,size,o);}
const SUN=[-0.7,-0.7]; // direction toward the sun: upper left
// wobbling thin-ish line (a few slightly offset pieces)
function WL(x0,y0,x1,y1,c,size,o){const n=4,pts=[];for(let i=0;i<n;i++){const t=i/(n-1);pts.push([lerp(x0,x1,t)+R(-1.2,1.2),lerp(y0,y1,t)+R(-1.2,1.2),.5+.4*Math.sin(Math.PI*t)]);}return F(pts,c,size,o);}
// ---- v6 helpers ----
const P=(pts)=>pts; // polygon literal
// dense stroke along polyline with taper; thin wrapper
const L=(pts,c,size,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],q[2]===undefined?pr(i,pts.length):q[2]]),color:c,brush:'filbert',size:size,load:1,thin:.4},o||{}));
// pigment-mix colour with jitter in parts (broken, marbling)
const M=(arr,j)=>{j=j===undefined?.25:j;return arr.map(a=>[a[0],a[1]*(1+R(-j,j))]);};
// soft blend along path
const BL=(pts,size,op,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],.8]),brush:'soft',size:Math.min(size,90),opacity:op===undefined?.5:op,color:'titanium_white'},o||{}));
// blender bristle drag (load 0)
const DR=(pts,size,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],.7]),brush:'filbert',size:size,load:0,color:'titanium_white'},o||{}));
// polygon scatter blend: zigzag soft strokes inside polygon
function blendPoly(poly,size,op,ang,n){const [x0,y0,x1,y1]=bbox(poly);let k=0,g=0;while(k<n&&g++<n*40){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;const a=ang+R(-.5,.5),l=size*R(1.2,2.2);BL(seg(x,y,l,a,R(-.1,.1)*l,3),size,op);}}
const hexA=(c,t,a)=>mixh(c,t,a);
// light from upper-left: L in [-1,1] over an ellipse (cx,cy,rx,ry)
const LIGHTD=[-.62,-.78];
const Lof=(x,y,cx,cy,rx,ry)=>{const nx=(x-cx)/rx,ny=(y-cy)/ry;return -(nx*LIGHTD[0]*-1*-1)*0+(-(nx*(-LIGHTD[0]))*-1)*0+(-(nx*.62+ny*.78));};
// shaded blob: cover an ellipse with strokes coloured from a ramp by position (lit upper-left, core shadow lower-right, a touch of reflected light at the rim)
function lobe(cx,cy,rx,ry,ramp,size,o){o=o||{};const poly=ELL(cx,cy,rx,ry,o.rot||0,o.n||22);
 return cover(poly,size,(x,y)=>{const L=-(((x-cx)/rx)*.62+((y-cy)/ry)*.78);const t=clamp(.5+L*.5+R(-1,1)*(o.jit===undefined?.12:o.jit)+(o.bias||0),0,1);return K(G(ramp,t),o.kj===undefined?.04:o.kj);},
  Object.assign({dens:1.2,len:1.8,angJ:.7,ang:o.ang===undefined?-.3:o.ang,o:Object.assign({load:1,thin:.35,edge:.2},o.so||{})},o.cv||{}));}
// scanline fill with crisp square-ended flat strokes (architecture, planes, boards). colfn(x,y)->colour.
// o.vert: columns instead of rows. o.seg: max piece length (in sizes). o.brush, o.jx (jitter of ends), o.so: stroke opts
function fill(poly,size,colfn,o){o=o||{};const vert=!!o.vert;const P=vert?poly.map(q=>[q[1],q[0]]):poly;const [x0,y0,x1,y1]=bbox(P);const step=size*(o.step||.78);let n=0;
 const maxL=size*(o.seg||14);
 for(let y=y0+size*.5;y<=y1+size*.4;y+=step){const yc=clamp(y+R(-1,1)*(o.jy||0),y0,y1);const xs=[];
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc)){xs.push(a[0]+(yc-a[1])*(b[0]-a[0])/(b[1]-a[1]));}}
  xs.sort((a,b)=>a-b);
  for(let k=0;k+1<xs.length;k+=2){let xa=xs[k],xb=xs[k+1];if(xb-xa<2)continue;const pieces=Math.max(1,Math.ceil((xb-xa)/maxL));
   for(let m=0;m<pieces;m++){const pa=xa+(xb-xa)*m/pieces-(m?size*.3:0),pb=xa+(xb-xa)*(m+1)/pieces+(m<pieces-1?size*.3:0);const mid=(pa+pb)/2;
    const tl=R(-1,1)*(o.tilt===undefined?.012:o.tilt)*(pb-pa);const pts=vert?[[yc+R(-1,1)*(o.jy||0)*.3-tl/2,pa,.85],[yc,mid,.9],[yc+tl/2,pb,.85]]:[[pa,yc-tl/2,.85],[mid,yc+R(-1,1)*(o.wob||0),.9],[pb,yc+tl/2,.85]];
    const cx=vert?yc:mid,cy=vert?mid:yc;
    p.stroke(Object.assign({points:pts,color:colfn(cx,cy),brush:o.brush||"flat",size:size*R(.96,1.1),load:1,thin:.4,taper:0,edge:0},o.so||{}));n++;}}}
 return n;}
// rectangle helper
const RECT=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
// elliptical arc stroke
function earc(cx,cy,rx,ry,a0,a1,c,size,o){const n=5,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));pts.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,pr(i,n)]);}return F(pts,c,size,o);}
// 27 spill: the gate's cold light on the world: glints on the rims of the leaves around it, a violet glaze across the boards beneath it, pale scumbles where the light lands hardest, a breath of it on the far houses and the plaza.
p.wipe();p.dry();
const GX=1193,GY=524,GR=392;
const TREEP=[[440,330],[455,270],[520,205],[600,175],[650,120],[665,40],[690,0],[2400,0],[2400,1010],[2330,990],[2330,780],[1990,760],[1840,700],[1800,640],[1530,640],[1520,560],[1380,540],[1250,520],[1000,600],[900,640],[780,600],[700,560],[620,540],[530,500],[470,440]];
const COLD=()=>{const k=R(0,1);return k<.3?M([['titanium_white',3],['ultramarine',.12]],.3):k<.65?M([['titanium_white',2],['dioxazine_purple',.3],['quinacridone_rose',.12]],.35):M([['titanium_white',2],['cerulean',.25],['ultramarine',.15]],.35);};
// 1. leaf glints: short tangential touches on the leaves nearest the gate, thinning out with distance
for(let i=0;i<380;i++){const a=R(0,TAU),r=GR+22+Math.pow(R(0,1),1.8)*190;const x=GX+Math.cos(a)*r,y=GY+Math.sin(a)*r;if(!inPoly(TREEP,x,y)||y>780)continue;
 const near=Math.exp(-(r-GR-20)/95);if(R(0,1)>near*1.1)continue;const tang=a+Math.PI/2+R(-.9,.9);const l=R(9,26)*(.6+near);
 p.stroke({points:[[x-Math.cos(tang)*l/2,y-Math.sin(tang)*l/2,.6],[x,y,.9],[x+Math.cos(tang)*l/2,y+Math.sin(tang)*l/2,.5]],color:COLD(),brush:'filbert',size:R(4,9)*(.7+near*.5),load:R(.8,1.2),thin:.3,opacity:R(.4,.85)*(.5+near*.5),taper:[.2,.4]});}
// 2. veils: transparent violet glaze breathing outward from the rim over the foliage
for(let k=0;k<70;k++){const a=R(0,TAU),r=GR+R(35,190);const x=GX+Math.cos(a)*r,y=GY+Math.sin(a)*r;if(!inPoly(TREEP,x,y)||y>790)continue;
 p.stroke({points:[[x-Math.cos(a+Math.PI/2)*60,y-Math.sin(a+Math.PI/2)*60],[x,y],[x+Math.cos(a+Math.PI/2)*60,y+Math.sin(a+Math.PI/2)*60]],color:M([['dioxazine_purple',1],['ultramarine',.8],['titanium_white',.8],['cerulean',.2]],.3),brush:'filbert',size:R(40,80),load:.7,thin:.5,opacity:R(.05,.11)*(1.3-(r-GR)/190),taper:[.3,.4],edge:.7});}
// 3. deck: violet fill light over the boards under the gate, along the board rays; hard bright catch-light on the back boards
const VPX=1370,VPY=830,YF=1097,YB=978;const sc=y=>(y-VPY)/(YF-VPY),xAt=(xf,y)=>VPX+(xf-VPX)*sc(y);
for(let i=0;i<190;i++){const xs=R(540,1900);const xf=VPX+(xs-VPX)/sc(YB+8);const dist=Math.abs(xs-1210)/700;const strength=clamp(1.15-dist,0,1);if(R(0,1)>strength+.1)continue;
 const y0=R(YB,YB+40),y1=y0+R(40,118);p.stroke({points:[[xAt(xf,y0),y0],[xAt(xf,(y0+y1)/2),(y0+y1)/2],[xAt(xf,y1),y1]],color:M([['dioxazine_purple',1],['ultramarine',.9],['titanium_white',.7],['quinacridone_rose',.2]],.3),brush:'flat',size:R(14,34)*sc((y0+y1)/2)*1.2+6,angle:0,load:.7,thin:.5,opacity:R(.05,.14)*strength,taper:[.2,.4],edge:.4});}
for(let i=0;i<260;i++){const xs=R(600,1800);const dist=Math.abs(xs-1210)/650;const strength=clamp(1.1-dist,0,1);if(R(0,1)>strength)continue;
 const y0=R(YB,YB+75);const l=R(10,38);const xf=VPX+(xs-VPX)/sc(y0);p.stroke({points:[[xAt(xf,y0),y0,.7],[xAt(xf,y0+l*.5),y0+l*.5,.8],[xAt(xf,y0+l),y0+l,.5]],color:M([['titanium_white',2],['dioxazine_purple',.25],['ultramarine',.3],['cerulean',.1]],.3),brush:'flat',size:R(2.5,7)*sc(y0+l/2)*1.4+1.5,angle:0,load:R(.45,.8),thin:.25,opacity:R(.2,.45)*strength,taper:[.3,.4],scumble:R(0,1)<.5});}
// a soft reflection of the vortex on the boards: vertical-ish pale smear straight below the gate, thin and broken
for(let i=0;i<14;i++){const xs=1193+R(-150,150);const y0=R(982,1010);const xf=VPX+(xs-VPX)/sc(y0);p.stroke({points:[[xAt(xf,y0),y0,.8],[xAt(xf,y0+R(35,60)),y0+R(35,60),.6],[xAt(xf,y0+R(70,100)),y0+R(70,100),.3]],color:M([['titanium_white',2],['ultramarine',.3],['dioxazine_purple',.2]],.3),brush:'flat',size:R(8,20),angle:0,load:.6,thin:.4,opacity:R(.1,.22),taper:[.2,.6],edge:.5,scumble:true});}
// 4. far houses and the plaza strip: a little of the cold light on the faces turned to the gate
for(const [x0,x1,yt,yb] of [[662,905,636,880],[1330,1860,656,880]]){for(let i=0;i<40;i++){const x=R(x0,x1),y=R(yt,yb);const d=Math.hypot(x-GX,y-GY);if(d<GR+10)continue;const k=clamp(1-(d-GR)/520,0,1);if(R(0,1)>k+.2)continue;
 p.stroke({points:[[x,y],[x+R(20,60),y+R(-2,2)]],color:M([['dioxazine_purple',1],['ultramarine',.6],['titanium_white',1.5]],.3),brush:'filbert',size:R(8,20),load:.6,thin:.5,opacity:R(.08,.2)*k,taper:[.3,.4],edge:.5});}}
for(let i=0;i<40;i++){const x=R(820,1560),y=R(840,950);const k=clamp(1-Math.abs(x-1193)/450,0,1);p.stroke({points:[[x,y],[x+R(50,120),y+R(-2,2)]],color:M([['dioxazine_purple',1],['ultramarine',.7],['titanium_white',2],['quinacridone_rose',.2]],.3),brush:'flat',size:R(10,24),angle:Math.PI/2,load:.6,thin:.5,opacity:R(.07,.15)*k,taper:[.3,.4],edge:.5});}
p.dry();
