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

// ---- 37_edges.body.js ----
// 37_edges (round 2): dark notches under the lip, the broken bright turf edge, a soft lost passage on the right back edge against the sky, cloud veils on the lowest tips, found edges on the lit facets and the main fall, white touches on the crests and the stream.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const Edge=[['cadmium_lemon',.5],['yellow_ochre',.6],['titanium_white',2],['sap_green',.25]];
const EdgeC=[['titanium_white',1.6],['sap_green',.6],['yellow_ochre',.4],['cerulean',.15]];
const Notch=[['burnt_umber',.8],['sap_green',.6],['ultramarine',.5],['titanium_white',.15]];
const Cloud=[['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.3],['quinacridone_rose',.08]];
const SkyR=[['titanium_white',2.6],['naples_yellow',.6],['cobalt_violet',.3],['sap_green',.2]];
const Lpink=[['titanium_white',2.6],['naples_yellow',.6],['quinacridone_rose',.12],['yellow_ochre',.4]];
const Wlit=[['titanium_white',4],['cerulean',.12],['naples_yellow',.06]];
const lipY=x=>x<980?lerp(780,800,(x-860)/120):x<1200?lerp(800,825,(x-980)/220):x<1500?lerp(825,830,(x-1200)/300):x<1800?lerp(830,815,(x-1500)/300):x<2050?lerp(815,790,(x-1800)/250):lerp(790,760,(x-2050)/110);
for(let x=875;x<2150;x+=R(28,60)){const y=lipY(x);const d=R(6,18);
  p.stroke({points:[[x+R(-3,3),y-2,.8],[x+R(-4,4),y+d*.5,.7],[x+R(-6,6),y+d,.2]],color:M(Notch,.2),brush:'filbert',size:R(5,9),load:.85,thin:.5,taper:[0,.6],stir:.8});}
for(let x=866;x<2150;x+=R(40,110)){const y=lipY(x)-R(0,3);const len=R(30,90);const a=Math.atan2(lipY(x+30)-lipY(x-30),60);const u=clamp((x-860)/1300,0,1);
  if(p.random()<.3)continue;const v=R(0,1);
  p.stroke({points:[[x-Math.cos(a)*len/2,y-Math.sin(a)*len/2,.4],[x+R(-5,5),y+R(-1,1),.9],[x+Math.cos(a)*len/2,y+Math.sin(a)*len/2,.35]],color:M(ML(ML(Edge,EdgeC,u),[['sap_green',1],['yellow_ochre',.7],['titanium_white',1]],v*.7),.12),brush:'filbert',size:R(3,6),load:1.2,thin:.35,taper:[.35,.35],edge:.3,stir:.6,clean:x<900});}
// lost passage: the right part of the back edge melts into the sky with a few thin sky-coloured veils laid across the contour
for(let i=0;i<9;i++){const x=R(1900,2150);const y=x<2100?lerp(670,710,(x-1900)/200):lerp(710,760,(x-2100)/60);S(x,y+R(-6,6),R(60,120),Math.atan2(x<2100?.2:.8,1)+R(-.1,.1),M(SkyR,.15),R(10,18),{load:.7,thin:.65,opacity:R(.2,.35),edge:.9,taper:[.4,.4],stir:.9});}
for(const t of [[1362,1372],[1325,1300],[1600,1267],[1640,1237],[1960,1002],[2010,902]]){
  S(t[0]+R(-10,10),t[1]-R(0,20),R(80,130),R(-.2,.2),M(Cloud,.15),R(34,48),{load:.7,thin:.7,opacity:R(.14,.22),edge:.95,taper:[.45,.45],stir:.9});}
for(const e of [[870,846,906,906],[906,906,944,934]])p.stroke({points:[[e[0],e[1],.6],[(e[0]+e[2])/2+R(-2,2),(e[1]+e[3])/2,1],[e[2],e[3],.5]],color:M(Lpink,.08),brush:'filbert',size:R(6,9),load:1.35,thin:.25,taper:[.2,.3],clean:true});
p.stroke({points:[[1218,840,.6],[1222,900,.95],[1226,960,.9],[1230,1000,.4]],color:M(Wlit,.06),brush:'flat',size:R(8,11),load:1.4,thin:.2,taper:[.1,.5],clean:true});
p.stroke({points:[[1226,1020,.6],[1228,1080,.9],[1226,1140,.4]],color:M(Wlit,.06),brush:'flat',size:R(6,9),load:1.4,thin:.2,taper:[.1,.5],clean:true});
p.stroke({points:[[1696,828,.6],[1700,890,.9],[1708,960,.4]],color:M(Wlit,.06),brush:'flat',size:R(5,8),load:1.35,thin:.2,taper:[.1,.5],clean:true});
for(const c of [[1240,826],[1275,826],[1705,815],[1012,803]])for(let k=0;k<2;k++)p.dab({x:c[0]+R(-12,12),y:c[1]+R(-3,2),color:M(Wlit,.06),size:R(6,10),brush:'filbert',load:1.4,pressure:.9});
for(const q of [[1410,806],[1300,815]])p.dab({x:q[0],y:q[1],color:M([['titanium_white',4]],.05),size:R(3,4.5),brush:'filbert',load:1.4,pressure:.9});
