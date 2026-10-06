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
// 06 the wooden stage: radiating planks lit warm with cool violet shade bands, a lighter fascia with cross joints, a very dark skirt with posts, two steps; Lucca's console on the deck.
const VPX=1370,VPY=830;
const ray=(xf,yf,y)=>VPX+(xf-VPX)*(y-VPY)/(yf-VPY);
// deck lighting: warm lit, violet where the gate light and tree shadows fall
const deckC=(x,y)=>{let sh=0;
 sh+=.55*Math.exp(-Math.pow((x-120)/260,2)); // pod shadow at far left
 sh+=.45*Math.exp(-Math.pow((x-(1020+(y-975)*1.1))/120,2));sh+=.4*Math.exp(-Math.pow((x-(1240+(y-975)*1.4))/90,2));sh+=.35*Math.exp(-Math.pow((x-(1700-(y-975)*.9))/200,2));
 const warm=mixh('#a26a54','#8c5a4a',clamp((y-975)/110,0,1));return mixh(warm,'#6a4c68',clamp(sh,0,.75));};
// planks: one long stroke per plank along its ray
for(let xf=-1100;xf<=3900;xf+=58){const xf2=xf+29;const x0=ray(xf2,1080,972),x1=ray(xf2,1080,1080);const mx=(x0+x1)/2;if(mx<-120||mx>2520)continue;
 const w=58*(1080-VPY)/(1080-VPY)*.88*0+50;
 for(let k=0;k<2;k++){const ya=k?1028:972,yb=k?1082:1032;const xa=ray(xf2,1080,ya),xb=ray(xf2,1080,yb);const c=deckC((xa+xb)/2,(ya+yb)/2);
  L([[xa,ya],[(xa+xb)/2,(ya+yb)/2],[xb,yb]],M([[mixh(c,'#b87a5c',R(0,.15)),1],[mixh(c,'#6a4234',R(.1,.4)),.35]],.3),k?46:34,{load:1,thin:.4,taper:[.03,.03],stir:.4,edge:.15});}
}
// seams: broken dark lines along the rays
for(let xf=-1100;xf<=3900;xf+=58){const xa=ray(xf,1080,970),xb=ray(xf,1080,1082);if(xb<-60||xb>2460)continue;const ym=R(1010,1040);
 L([[xa,970],[ray(xf,1080,ym),ym],[xb,1082]],M([['#3a2028',1],['#2a1620',.5]],.3),R(2.5,4),{load:.6,thin:.5,taper:[.1,.15],opacity:R(.5,.8)});}
// sunlit streaks and warm highlights on plank edges
for(let i=0;i<22;i++){const xf=R(-600,3400),y=R(985,1075);const xa=ray(xf,1080,y);if(xa<0||xa>2400)continue;const c=deckC(xa,y);S(xa,y,R(30,90),Math.atan2(y-VPY,xa-VPX),M([['#c88a64',1],['#e0a678',.4]],.3),R(5,10),{load:1.15,thin:.3,taper:[.3,.4],opacity:.7});}
// soft melt of the light/shade boundaries on the deck
for(let i=0;i<40;i++){BL(seg(R(0,2400),R(980,1070),R(80,160),R(-.4,.4),0,3),34,R(.25,.4));}
// fascia: lighter band at the front edge with cross joints, shadow line under
fill(RECT(-20,1080,2420,1128),12,(x,y)=>M([[mixh('#7a4a36','#5a3028',clamp((y-1080)/48,0,1)),1],['#8a5a44',.25]],.25),{seg:16});
for(let i=0;i<30;i++){const x=R(0,2400);const y=R(1090,1118);S(x,y,R(36,56),0,M([['#241012',1],['#341a1a',.5]],.3),R(2.5,4),{load:.8,thin:.4,opacity:.55,taper:0});}
S(1200,1081,2440,0,M([['#c28a64',1],['#d8a074',.4]],.2),5,{load:1,thin:.3,taper:0,opacity:.6}); // lit nose of the deck edge
// skirt: dark red-brown, a violet rim near the top (bounce from the paving), cool near the bottom
fill(RECT(-20,1126,2420,1340),22,(x,y)=>M([[mixh('#3a1c1c','#1c0e10',clamp((y-1126)/160,0,1)),1],['#2e1618',.4],['#2a1a26',.2]],.25),{seg:12,jy:2});
// posts
for(const x of [130,355,580,790,990,1195,1395,1595,1795,1990,2180,2375]){const w=R(14,19);S(x,1230,215,Math.PI/2,M([['#120a0c',1],['#1e1014',.6]],.2),w,{load:1,thin:.3,taper:0});S(x-w*.3,1230,205,Math.PI/2,M([['#4a2428',1],['#5a2e32',.5]],.3),3.5,{load:.7,thin:.4,opacity:.55,taper:[.1,.3]});}
// pink bounce light on the skirt at the right
for(let i=0;i<10;i++){S(R(1100,2400),R(1150,1300),R(120,260),R(-.03,.03),M([['#5a3036',1],['#4a2a3a',.5]],.3),R(18,34),{load:.7,thin:.6,edge:.7,opacity:.4,taper:[.3,.4]});}
// ---- steps (canvas coords from the master: upper tread y1192-1215 x480-1100, riser to 1300; lower tread 1300-1325 x443-1103, riser to 1448) ----
const stc=(c1,c2,y0,y1)=>(x,y)=>M([[mixh(c1,c2,clamp((y-y0)/(y1-y0),0,1)),1],['#8a5a44',.12]],.25);
fill(RECT(480,1192,1100,1216),8,stc('#9a6a52','#80523e',1192,1216),{seg:16});
fill(RECT(480,1216,1100,1300),14,(x,y)=>M([[mixh(mixh('#5e3628','#3a2018',clamp((y-1216)/84,0,1)),'#2e1a18',clamp((x-480)/620,0,1)*.5),1],['#6a4030',.2]],.25),{seg:14});
fill(RECT(443,1300,1103,1326),8,stc('#a47258','#8a5a46',1300,1326),{seg:16});
fill(RECT(443,1326,1103,1450),14,(x,y)=>M([[mixh(mixh('#583224','#321c14',clamp((y-1326)/124,0,1)),'#2a1618',clamp((x-443)/660,0,1)*.5),1],['#6a4030',.2]],.25),{seg:14});
S(790,1194,620,0,M([['#b88262',1],['#cc9470',.4]],.2),4.5,{load:1.1,thin:.3,taper:[.03,.05]});S(773,1302,660,0,M([['#b88262',1],['#cc9470',.4]],.2),4.5,{load:1.1,thin:.3,taper:[.03,.05]});
S(790,1298,620,0,M([['#201010',1],['#1a0c0e',.5]],.2),7,{load:.9,thin:.35,opacity:.8,taper:0});S(773,1326,660,0,M([['#201010',1],['#1a0c0e',.5]],.2),6,{load:.9,thin:.35,opacity:.8,taper:0});
for(let i=0;i<6;i++){S(R(500,800),R(1230,1290),R(120,260),0,M([['#7a4a38',1],['#8a5a44',.4]],.3),R(14,24),{load:.8,thin:.5,edge:.6,opacity:.45,taper:[.3,.4]});}
for(let i=0;i<5;i++){S(R(460,760),R(1340,1440),R(120,240),0,M([['#6a3c30',1],['#7a4a3a',.4]],.3),R(14,24),{load:.8,thin:.5,edge:.6,opacity:.45,taper:[.3,.4]});}
p.dry();
// ---- console (Lucca stands behind it): lit lilac left face, near-black front, tilted lid with gold edge: planes in a few big strokes ----
for(let i=0;i<4;i++){const x=1790+i*26+13;L([[x,796+i*2],[x,930],[x,1056]],M([[mixh('#a498cc','#6a62a0',i/3*.8),1],['#b8acd8',.25]],.2),30,{brush:'flat',load:1.15,thin:.4,taper:0});}
for(let i=0;i<5;i++){const x=1892+i*42+21;L([[x,804],[x,880]],M([['#14141a',1],['#1e1e28',.4],['#0e0e12',.3]],.25),46,{brush:'flat',load:1.2,thin:.4,taper:0});L([[x,870],[x,970]],M([['#14141a',1],['#1e1e28',.4],['#0e0e12',.3]],.25),46,{brush:'flat',load:1.2,thin:.4,taper:0});L([[x,960],[x,1064]],M([['#12121a',1],['#1e1e28',.4],['#0e0e12',.3]],.25),46,{brush:'flat',load:1.3,thin:.4,taper:0});}
fill([[1776,724],[2098,776],[2098,808],[1790,764]],10,(x,y)=>M([[mixh('#6a4228','#2e1c16',clamp((x-1776)/322,0,1)),1],['#7a5028',.25]],.25),{seg:30});
S(1938,748,332,.162,M([['#dca64c',1],['#f2c868',.4]],.2),6,{load:1.15,thin:.3,taper:[.03,.05]});S(1936,768,326,.16,M([['#4a2e1a',1],['#3a2216',.5]],.2),4,{load:.9,thin:.35,opacity:.7,taper:0});
for(const [x,y,h] of [[1888,690,80],[1952,676,76],[2012,694,84]]){S(x,y+h*.4,h,Math.PI/2+.04,'#101014',9,{load:1,thin:.3,taper:0});lobe(x,y,12,12,[[0,'#1a1a1e'],[.6,'#3a3a44'],[1,'#8a8a98']],5,{dens:1.3,len:1.4});}
lobe(1952,672,12,12,[[0,'#5a0c18'],[.5,'#c02430'],[1,'#ff9078']],5,{dens:1.4,len:1.4});
lobe(1855,790,14,14,[[0,'#c85a50'],[.6,'#f08a78'],[1,'#ffd0b8']],5,{dens:1.4,len:1.4});
S(1990,1062,330,0,M([['#241420',1],['#321c2c',.5]],.2),18,{load:1.2,thin:.35,taper:[.05,.2]});S(2000,1066,360,0,M([['#2a1824',1],['#3a2030',.5]],.2),16,{load:.9,thin:.4,edge:.6,opacity:.75,taper:[.1,.3]});
