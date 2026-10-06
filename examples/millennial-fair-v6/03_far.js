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
// 03 the far plaza: low cream houses on the horizon, warm sand lit from the left with long violet cast shadows, a few far trees.
// houses: warm-lit wall, cooler toward the right, dark red roofs, navy windows
function house(x0,x1,roofTop,roofBot,wallBot,wins,rows){
 const wall=(x,y)=>M([[mixh('#a47c68','#7e6258',clamp((x-x0)/(x1-x0),0,1)*.7),1],['#b8906e',.25],['#8a6a68',.2]],.25);
 // wall
 cover([[x0,roofBot],[x1,roofBot],[x1,wallBot],[x0,wallBot]],34,(x,y)=>wall(x,y),{dens:1.6,len:2.4,ang:0,angJ:.12,o:{load:1,thin:.4,edge:.2}});
 // roof (sloped mass, left lit slope warmer)
 cover([[x0-14,roofBot],[x0+30,roofTop],[x1-30,roofTop],[x1+14,roofBot]],24,(x,y)=>M([[mixh('#7a3236','#4e222c',clamp((x-x0)/(x1-x0),0,1)),1],['#40181e',.3]],.25),{dens:1.8,len:2.6,ang:0,angJ:.08,o:{load:1,thin:.35,edge:.2}});
 S((x0+x1)/2,roofBot+3,x1-x0,0,M([[ '#3a2428',1],['#563a3c',.5]],.2),10,{load:.9,thin:.4,edge:.3}); // eave shadow
 // wall shade under eaves
 S((x0+x1)/2,roofBot+18,x1-x0-20,0,M([['#7a5e58',1],['#6a5060',.5]],.3),22,{load:.8,thin:.5,edge:.6,opacity:.7});
 for(const r of rows){for(const wx of wins){const wy=r;
  p.stroke({points:[[wx,wy,.9],[wx,wy+40,.9]],brush:'flat',angle:0,size:26,color:M([['#231c2c',1],['#2c2438',.7]],.3),load:1,thin:.3,stir:.6,taper:0});
  p.stroke({points:[[wx-6,wy+4,.8],[wx-6,wy+16,.8]],brush:'flat',angle:0,size:8,color:M([['#4a4058',1],['#6a5a78',.4]],.3),load:.8,thin:.4,opacity:.7,taper:0}); // sky-glint upper left on glass
  S(wx,wy+44,32,0,M([['#c9aa90',1],['#d8bc9c',.4]],.2),6,{load:1,thin:.3,taper:0}); // sill catching light
 }}
}
house(662,905,540,625,880,[712,784,855],[712]);
house(662,905,540,625,880,[712,784],[812]);
house(1330,1860,545,650,880,[1562,1630,1700,1770],[720]);
house(1330,1860,545,650,880,[1562,1630,1700,1770],[820]);
// doors
S(850,830,56,Math.PI/2,M([['#1e1824',1],['#2c2030',.5]],.3),34,{load:1,thin:.3,stir:.6,taper:0});
// the dark pole left of the left house
S(654,735,300,Math.PI/2,M([['#3a1e22',1],['#2a181c',.7]],.2),11,{load:1,thin:.3,taper:0});
// far sand (Sorolla's beach): long dragged strokes of broken ochre, rose and cool grey-violet, directional, then a few soft pulls; shadows are bold violet shapes
const SAND=[[0,'#d6b07c'],[.35,'#cf9e6c'],[.7,'#c99468'],[1,'#b8845e']];
for(let k=0;k<3;k++){for(let y=848;y<992;y+=k?20:30){for(let x=220;x<2420;x+=R(110,220)){const yy=y+R(-8,8),t=(yy-845)/145;
 const c=G(SAND,t);S(x,yy,R(120,300),R(-.025,.035),M([[c,1],[mixh(c,'#e6c08c',.5),R(.1,.5)],[mixh(c,'#a8788a',.5),R(0,.3)]],.3),k?R(14,22):R(26,38),{load:k?.9:1,thin:.45,edge:.3,taper:[.1,.3],stir:.3});}}
 if(k===0)blendPoly([[230,845],[2400,845],[2400,990],[230,990]],44,.45,0,60);}
// a low pale wall/low hills at the left horizon
cover([[330,836],[480,834],[480,862],[330,862]],20,()=>K('#c9a47a',.04),{dens:1.5,len:3,ang:0,angJ:.05,o:{load:1,thin:.4}});
// far tree clumps on the horizon
for(const [x,y,w] of [[1860,862,90],[1930,858,70],[2100,862,110],[600,856,40],[285,852,50]]){lobe(x,y-w*.2,w*.5,w*.28,[[0,'#3a3f32'],[.5,'#58613c'],[1,'#7a8048']],10,{dens:1.3,len:1.5});}
// long violet cast shadows laid over the sand (thin, cool, edge-soft), falling right from the pods and the trees
for(let i=0;i<9;i++){const x=R(250,1000),y=R(895,950);S(x,y,R(160,330),R(-.02,.04),M([['#8a6a78',1],['#7a6488',.6]],.3),R(14,26),{load:.7,thin:.6,edge:.6,opacity:.55,taper:[.2,.4]});}
for(let i=0;i<8;i++){const x=R(1450,2300),y=R(890,950);S(x,y,R(160,330),R(-.02,.04),M([['#8a6a78',1],['#7a6488',.6]],.3),R(14,26),{load:.7,thin:.6,edge:.6,opacity:.55,taper:[.2,.4]});}
// sunlit streaks: pale gold
for(let i=0;i<26;i++){const x=R(250,2300),y=R(870,950);S(x,y,R(60,170),R(-.03,.03),M([['#f0cf98',1],['#e8b886',.5]],.3),R(5,11),{load:1.1,thin:.35,taper:[.3,.4],opacity:.85});}
