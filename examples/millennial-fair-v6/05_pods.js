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
// 05 the telepods: steel domes reflecting sky and violet gate light, a stack of copper torus rings, dark steel base, antennas with red balls.
function domeFill(cx,cy,rx,ry,x0,x1,rampFn,size){ // half-ellipse dome, flat-brush rows, then smooth vertical melt
 const poly=[];for(let a=Math.PI;a<=TAU+.001;a+=.12){const x=cx+Math.cos(a)*rx;poly.push([clamp(x,x0,x1),cy+Math.sin(a)*ry]);}poly.push([clamp(cx+rx,x0,x1),cy]);poly.push([clamp(cx-rx,x0,x1),cy]);
 fill(poly,size,(x,y)=>{const nx=(x-cx)/rx,ny=(y-cy)/ry;const L=-(nx*.62+ny*.78);return rampFn(L,nx,ny);},{seg:6,brush:'filbert',so:{thin:.35,edge:.15}});
 for(let i=0;i<40;i++){const x=R(Math.max(x0,cx-rx*.9),Math.min(x1,cx+rx*.9)),y=cy-R(.05,.95)*ry*Math.sqrt(Math.max(0,1-Math.pow((x-cx)/rx,2)));BL(seg(x,y,R(60,120),R(0,1)<.5?R(-.3,.3):Math.PI/2+R(-.3,.3),0,3),R(36,60),R(.35,.55));}
 return poly;}
function rings(x0,x1,y0,n,pitch,pal,glintX){
 for(let i=0;i<n;i++){const y=y0+i*pitch;const w=x1-x0;
  S((x0+x1)/2,y+5,w,0,M([[pal.dk,1],['#1e1008',.4]],.2),pitch*.95,{load:1,thin:.3,taper:0});
  S((x0+x1)/2,y-2,w*.97,0,M([[pal.mid,1],[pal.dk,.35]],.25),pitch*.62,{load:1.05,thin:.3,taper:[.04,.05]});
  S(x0+w*.46,y-6,w*.6,R(-.01,.01),M([[pal.lit,1],[pal.mid,.5]],.2),pitch*.3,{load:1.15,thin:.3,taper:[.1,.3]});
  S(glintX+R(-25,25),y-8,R(30,60),R(-.02,.02),M([[pal.glint,1],['#ffffff',.2]],.2),pitch*.14,{load:1.2,thin:.25,taper:[.3,.4]});
  S(x1-w*.18,y+4,w*.28,0,M([[pal.refl,1],[pal.mid,.6]],.3),pitch*.2,{load:.9,thin:.35,taper:[.3,.3],opacity:.8}); // violet gate light on the right, lower side
  S((x0+x1)/2,y+pitch*.5-2,w,0,M([['#120a08',1],['#241410',.5]],.2),pitch*.14,{load:.9,thin:.3,taper:0,opacity:.9});
 }}
// ---------- left pod ----------
domeFill(15,602,250,205,-40,262,(L,u,v)=>{const t=clamp(.5+L*.36+R(-.05,.05)+(v>-.15?.1:0),0,1);return K(G([[0,'#1c1e44'],[.4,'#34367a'],[.72,'#5456a0'],[1,'#8486c8']],t),.025);},16);
// silhouette strokes follow the dome edge so the outline is round, not stepped
for(let a=Math.PI*1.0;a<TAU*1.0;a+=.16){const x=15+Math.cos(a)*250,y=602+Math.sin(a)*205;if(x>262)continue;earc(15,602,243,198,a,a+.22,M([[a<Math.PI*1.5?'#4c4e92':'#22244a',1],['#1c1e44',.3]],.2),14,{load:1,thin:.35,taper:[.1,.1],opacity:.9});}
// sky reflected on the upper-left of the dome: pale lavender band, warm low band
for(let i=0;i<7;i++){S(R(10,150),R(430,520),R(70,150),R(-.5,-.2),M([['#8a88b8',1],['#a8a4cc',.6]],.2),R(14,26),{load:1,thin:.35,opacity:.7,taper:[.3,.4],edge:.4});}
// bright violet rim band at the base of the dome
S(130,598,260,0,M([['#7e78d0',1],['#9a98e0',.6]],.2),24,{load:1.1,thin:.3,taper:[.05,.2]});
S(180,590,150,-.03,M([['#b4b0f0',1],['#d0ccff',.5]],.2),10,{load:1.2,thin:.25,taper:[.3,.4]});
S(130,612,260,0,M([['#1c1c3c',1],['#2a2a50',.5]],.2),11,{load:1,thin:.3,taper:0});
BL([[0,520],[250,520]],70,.35); 
rings(-40,262,628,9,33,{dk:'#3a1c0c',mid:'#8a4a1c',lit:'#c0762a',glint:'#f2b878',refl:'#8a60b0'},150);
// base: dark steel with violet bounce on the right, lit rim ring
fill([[-30,925],[262,925],[272,1012],[-30,1012]],14,(x,y)=>M([[mixh('#10102c','#2c2c5a',clamp(x/270,0,1)),1],['#0c0c1e',.3]],.25),{seg:12,jy:0});
S(115,914,300,0,M([['#8a8ed0',1],['#a8acdc',.5]],.2),14,{load:1.1,thin:.3,taper:[.05,.2]});S(150,908,150,0,M([['#c8ccf6',1],['#e4e4ff',.4]],.2),6,{load:1.2,thin:.25,taper:[.3,.4]});
// antenna
L([[62,400],[50,300],[38,140]],M([['#1e1e3c',1],['#2e2e50',.5]],.2),13,{load:1,thin:.3,taper:[.05,.1]});
L([[56,400],[44,300],[32,140]],M([['#5a5a88',1],['#7a7aa8',.5]],.2),4,{load:.9,thin:.3,taper:[.2,.3],opacity:.8});
lobe(36,129,18,18,[[0,'#5a0c18'],[.5,'#b01c28'],[.85,'#e04838'],[1,'#ffb090']],6,{dens:1.4,len:1.4});
p.dab({x:30,y:122,color:'#ffe8d8',size:6,brush:'round',load:1.2});
// ---------- right pod ----------
domeFill(2140,597,176,170,1960,2330,(L,u,v)=>{const t=clamp(.5+L*.42+R(-.05,.05)+(u>.4?-.08:0),0,1);return K(G([[0,'#24243e'],[.35,'#46465e'],[.65,'#78768e'],[.88,'#b2b0c8'],[1,'#e4e2f4']],t),.025);},14);
// warm sky reflected low on the left, dark tree reflected upper right
for(let i=0;i<8;i++){S(R(1990,2200),R(480,570),R(60,130),R(-.5,-.1),M([['#a8a0b0',1],['#c8b4a8',.5]],.2),R(12,20),{load:1,thin:.35,opacity:.65,taper:[.3,.4],edge:.4});}
for(let i=0;i<8;i++){S(R(2150,2280),R(450,540),R(50,110),R(.2,.6),M([['#1e2230',1],['#2a3036',.5]],.2),R(12,22),{load:1,thin:.35,opacity:.7,taper:[.3,.4],edge:.4});}
// the big window-light specular on the dome
S(2018,548,34,-.75,M([['#b8b6d0',1],['#e4e2f4',.5]],.15),20,{load:1.1,thin:.3,taper:[.3,.4]});S(2014,545,22,-.75,M([['#e8e6f6',1],['#ffffff',.4]],.1),12,{load:1.2,thin:.25,taper:[.3,.4]});
S(2140,598,370,0,M([['#a8a4c8',1],['#8a86b0',.5]],.2),16,{load:1.05,thin:.3,taper:[.04,.1]}); // rim
rings(1962,2332,618,9,34,{dk:'#4a2a0a',mid:'#a8661c',lit:'#e0963a',glint:'#fcd8a0',refl:'#8a6ab0'},2060);
fill([[1985,915],[2370,915],[2370,1012],[1985,1012]],14,(x,y)=>M([[mixh('#22223a','#3e3e5a',clamp((x-1985)/385,0,1)),1],['#16162a',.3]],.25),{seg:14});
S(2175,922,380,0,M([['#7a7ea8',1],['#a0a4c8',.5]],.2),16,{load:1.1,thin:.3,taper:[.05,.2]});S(2290,934,120,0,M([['#c4c0f0',1],['#e0daff',.4]],.2),7,{load:1.2,thin:.25,taper:[.3,.4]});
// antennas
L([[2125,430],[2142,300],[2160,185]],M([['#3a3a48',1],['#2a2a34',.5]],.2),11,{load:1,thin:.3,taper:[.05,.1]});L([[2121,430],[2138,300],[2156,185]],M([['#9a9ab0',1],['#c0c0d0',.5]],.2),3.5,{load:.9,thin:.3,taper:[.2,.3],opacity:.8});
L([[2222,447],[2255,390],[2288,335]],M([['#3a3a48',1],['#2a2a34',.5]],.2),10,{load:1,thin:.3,taper:[.05,.1]});L([[2218,447],[2251,390],[2284,335]],M([['#9a9ab0',1],['#c0c0d0',.5]],.2),3.5,{load:.9,thin:.3,taper:[.2,.3],opacity:.8});
for(const [x,y] of [[2163,178],[2288,328]]){lobe(x,y,17,17,[[0,'#5a0c18'],[.5,'#b01c28'],[.85,'#e04838'],[1,'#ffb090']],6,{dens:1.4,len:1.4});p.dab({x:x-5,y:y-6,color:'#ffe8d8',size:6,brush:'round',load:1.2});}
