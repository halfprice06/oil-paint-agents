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
// 29h Lucca's console, repainted as a real desk seen from the left: the left face a painted metal plane catching the gate's cold light (pale lilac at the top deepening to indigo at the floor), the front a near-black enamel with a violet sheen along its lit edge and a floor bounce, the lid a brown wooden top with a gold chamfer, a thick front edge and cast shadows of the levers. Over the pod, which had swallowed it. Hero passes (Marle) go on top.
p.dry();
const xr=(P,y)=>{let lo=1e9,hi=-1e9;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y)){const x=a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]);if(x<lo)lo=x;if(x>hi)hi=x;}}return hi>lo?[lo,hi]:null;};
const rows=(P,y0,y1,step,colf,size,o)=>{for(let y=y0;y<y1;y+=step){const e=xr(P,y+step/2);if(!e)continue;p.stroke(Object.assign({points:[[e[0],y+step/2,.9],[(e[0]+e[1])/2,y+step/2+R(-.2,.2),.95],[e[1],y+step/2,.9]],color:colf(y),brush:'flat',size:size,angle:Math.PI/2,load:1.1,thin:.12,taper:[.02,.02],edge:.02,stir:.1},o||{}));}};
// shadow on the deck
for(let k=0;k<5;k++)p.stroke({points:[[1730,1058+k*3],[1850,1070+k*3],[1960,1080+k*3]],color:M([['dioxazine_purple',1],['burnt_umber',.8],['ultramarine',.3]],.25),brush:'flat',size:R(14,22),angle:Math.PI/2,load:.9,thin:.5,opacity:R(.1,.18),taper:[.1,.2],edge:.5});
// left face
const LF=[[1790,785],[1890,805],[1890,1055],[1792,1030]];
rows(LF,785,1056,6,y=>{const t=clamp((y-790)/265,0,1);return M([[mixh('#d6cef4','#9a94d8',Math.min(1,t*1.4)),1],[mixh('#d6cef4','#3c3a8c',t),.6]],.1);},9);
for(const fy of [.2,.45,.7]){const y=785+270*fy;BL([[1796,y,.8],[1842,y+5,.8],[1886,y+10,.8]],30,.55);}
p.dry();
p.stroke({points:[[1795,800],[1796,900],[1798,1020]],color:M([['titanium_white',1],['quinacridone_rose',.1]],.1),brush:'flat',size:3,angle:0,load:1.1,thin:.25,opacity:.75,taper:[.1,.3]});
p.stroke({points:[[1886,812],[1887,930],[1887,1048]],color:M([['ultramarine',1],['dioxazine_purple',.7]],.2),brush:'flat',size:5,angle:0,load:.9,thin:.3,opacity:.5,taper:[.1,.3]});
// front face
const FF=[[1890,805],[2110,800],[2110,1050],[1890,1055]];
rows(FF,800,1056,7,y=>{const t=clamp((y-805)/250,0,1);return M([['#0c0c14',1],['#14141e',.5+t*.3],['#1c1c2c',t*.4]],.15);},10);
for(let i=0;i<7;i++)p.stroke({points:[[1893+i*5,830+R(0,12)],[1894+i*5,930],[1893+i*5,1020+R(0,16)]],color:M([['ultramarine',1],['dioxazine_purple',.8],['titanium_white',.15]],.25),brush:'flat',size:R(3,5),angle:0,load:.8,thin:.4,opacity:.42-i*.05,taper:[.1,.3]});
p.stroke({points:[[1900,925],[2000,923],[2108,921]],color:M([['ivory_black',1],['ultramarine',.3]],.2),brush:'flat',size:2.2,angle:Math.PI/2,load:1,thin:.3,opacity:.7,taper:[.1,.1]});
p.stroke({points:[[1900,927],[2000,925],[2108,923]],color:M([['ultramarine',1],['dioxazine_purple',.6],['titanium_white',.4]],.25),brush:'flat',size:1.4,angle:Math.PI/2,load:.8,thin:.3,opacity:.25,taper:[.1,.1]});
p.stroke({points:[[1900,1046],[2000,1047],[2108,1044]],color:M([['burnt_sienna',1],['raw_umber',.5],['titanium_white',.4]],.2),brush:'flat',size:7,angle:Math.PI/2,load:.8,thin:.5,opacity:.28,taper:[.1,.1],edge:.5});
// lid: front thickness, top plane with grain, gold chamfer, lever shadows
rows([[1890,788],[2110,786],[2110,807],[1890,809]],788,808,5,y=>M([['#2c180a',1],['#3a200e',.6]],.12),7);
const TP=[[1795,738],[2020,748],[2110,788],[1890,789]];
rows(TP,738,790,6,y=>{const t=(y-738)/52;return M([['#4a2c16',1],['#3a2210',.6+t*.3],['#5a361c',.4*(1-t)]],.14);},8);
for(let i=0;i<9;i++){const y=R(745,785),e=xr(TP,y);if(!e)continue;p.stroke({points:[[e[0]+8,y],[e[1]-8,y+R(-1,3)]],color:R(0,1)<.5?M([['#7a4c28',1],['#8a5a30',.4]],.2):M([['#1c0e06',1]],.2),brush:'flat',size:R(1.5,3),angle:Math.PI/2,load:.5,thin:.4,opacity:R(.18,.32),taper:[.2,.4],scumble:true});}
p.stroke({points:[[1778,737],[1840,763],[1893,790]],color:M([['#e8a840',1],['#f0b850',.5]],.15),brush:'flat',size:12,angle:Math.PI/4,load:1.1,thin:.3,taper:[.05,.05]});
p.stroke({points:[[1781,735],[1840,759],[1890,783]],color:M([['#ffd878',1],['#ffe8a0',.5]],.1),brush:'flat',size:3.5,angle:Math.PI/4,load:1.1,thin:.25,opacity:.8,taper:[.1,.2]});
p.stroke({points:[[1893,790],[2000,789],[2108,788]],color:M([['#a06838',1],['#b87a44',.5]],.2),brush:'flat',size:2.2,angle:Math.PI/2,load:1,thin:.3,opacity:.55,taper:[.1,.1]});
for(const [x,y,l] of [[1873,757,55],[1941,762,60],[2000,758,50]])p.stroke({points:[[x,y+3],[x+l*.6,y+10],[x+l,y+16]],color:M([['#120a06',1]],.2),brush:'flat',size:4,angle:Math.PI/2,load:.9,thin:.4,opacity:.4,taper:[.2,.5]});
// levers
const lever=(bx,by,tx,ty,r,col,hi)=>{p.stroke({points:[[bx,by],[(bx+tx)/2,(by+ty)/2],[tx,ty]],color:M([['#14101a',1]],.1),brush:'round',size:5,load:1,thin:.3,taper:0});
 p.dab({x:tx,y:ty,color:col,size:r*2,brush:'round',load:1.1});p.dab({x:tx,y:ty,color:col,size:r*1.5,brush:'round',load:1.1});p.dab({x:tx-r*.35,y:ty-r*.4,color:hi,size:r*.55,brush:'round',load:1.2});};
lever(1872,758,1893,668,12,'#16141c','#8a88a8');
lever(1940,762,1947,672,13,'#c01820','#ff9080');
lever(2000,758,1998,675,12,'#16141c','#8a88a8');
// discs on the lid
p.stroke({points:[[1890,748],[1905,750],[1920,748]],color:'#f0a090',brush:'filbert',size:20,angle:Math.PI/2,load:1.1,thin:.3});p.stroke({points:[[1896,744],[1906,745],[1914,744]],color:'#ffc8b4',brush:'filbert',size:8,angle:Math.PI/2,load:1.2,thin:.3});
p.stroke({points:[[2034,760],[2056,764],[2078,758]],color:'#e4dcb0',brush:'filbert',size:26,angle:Math.PI/2,load:1.1,thin:.3});p.stroke({points:[[2040,754],[2054,756],[2068,752]],color:'#f4eecc',brush:'filbert',size:9,angle:Math.PI/2,load:1.2,thin:.3});
p.dry();
