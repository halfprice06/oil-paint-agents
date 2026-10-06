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
// 04 the bell tower, 85 m away: crisp simplified masonry: rows of flat-brush stones lit warm at left, cool brown at right; pyramid roof in two planes; open belfry with a bronze bell; clock.
const stoneC=(x,y)=>{const t=clamp((x-210)/182,0,1);const b=mixh('#c2a27a','#74604f',Math.pow(t,.8)*.95);const j=R(-1,1);return M([[mixh(b,j>0?'#d8bc92':'#6e5444',Math.abs(j)*.35),1],[mixh(b,'#8a6c52',.4),.35]],.3);};
fill(RECT(210,470,392,886),14,stoneC,{seg:2.4,wob:.8,so:{thin:.45,load:1}});
// courses of lighter and darker single stones (a few, not every one)
for(let i=0;i<70;i++){const x=R(214,380),y=R(480,876),t=(x-210)/182;p.stroke({points:[[x,y],[x+R(14,30),y+R(-.6,.6)]],brush:'flat',size:R(8,12),color:M([[R(0,1)<.5?mixh('#d8bc92','#8a7458',t):mixh('#8a6c52','#5a4638',t),1]],.3),load:1,thin:.35,taper:0,opacity:R(.6,.95)});}
// mortar shadow lines, thin and broken
for(let y=484;y<884;y+=14){S(301,y+7+R(-.8,.8),R(120,176),R(-.01,.01),M([['#4a3a30',1],['#5a4638',.5]],.2),R(1.8,3),{load:.5,thin:.5,taper:[.1,.3],opacity:R(.3,.55)});}
// shade on the right third, soft
for(let i=0;i<6;i++){S(R(358,376),R(480,880),R(160,300),Math.PI/2,M([['#4e4050',1],['#5a4a5a',.5]],.2),R(16,26),{load:.7,thin:.5,edge:.7,opacity:.4,taper:[.2,.3]});}
// stringcourses: lit ledge and a dark cast shadow below
for(const y of [470,684]){fill(RECT(204,y-6,398,y+6),6,()=>M([['#cfb088',1],['#e0c8a0',.4]],.2),{seg:20});fill(RECT(208,y+6,392,y+16),5,()=>M([['#4a3a38',1],['#5a4a48',.5]],.25),{seg:20,so:{opacity:.85}});}
// belfry: pilasters, dark opening with inner light, lintel
fill(RECT(212,346,250,468),12,(x,y)=>M([['#c6a67e',1],['#a88a66',.4]],.3),{vert:true,seg:10});
fill(RECT(354,346,392,468),12,(x,y)=>M([['#8a7058',1],['#6e5a4c',.5]],.3),{vert:true,seg:10});
fill(RECT(250,358,354,466),12,(x,y)=>M([['#241a1e',1],['#34242a',.6]],.3),{seg:10});
fill(RECT(250,358,262,462),6,()=>M([['#6a5848',1],['#7a6654',.5]],.3),{vert:true,seg:20,so:{opacity:.8}});
fill(RECT(206,336,398,356),9,()=>M([['#c8a880',1],['#a88a66',.4]],.25),{seg:20});
// bell
lobe(302,408,22,22,[[0,'#26180e'],[.5,'#5a3a1c'],[.85,'#a07a38'],[1,'#d8b060']],6,{dens:1.6,len:1.4});
fill(RECT(280,426,324,434),4,()=>M([['#5a3a18',1],['#7a5a28',.5]],.2),{seg:20});
fill(RECT(252,366,352,374),4,()=>M([['#2a2024',1],['#3a2c2c',.5]],.2),{seg:20});
// clock: cream disc, dark rim, hands
lobe(302,521,33,33,[[0,'#8a7a64'],[.5,'#d6caac'],[1,'#f2e8ca']],7,{dens:1.7,len:1.4,bias:.1});
arc(302,521,34,0,TAU*.99,M([['#3a2a20',1],['#5a4030',.5]],.2),6,{load:1,thin:.3,taper:0});
S(302,508,26,Math.PI/2,'#3a2c26',3.4,{load:1,thin:.3,taper:0});S(316,525,28,.12,'#3a2c26',3.4,{load:1,thin:.3,taper:0});
for(let k=0;k<12;k++){const a=k/12*TAU;S(302+Math.cos(a)*26,521+Math.sin(a)*26,4,a,'#4a3a2e',2.6,{load:1,thin:.3,taper:0});}
// slit windows
for(const y of [598,748]){fill(RECT(292,y-20,312,y+22),9,()=>M([['#20181c',1],['#2e2228',.6]],.3),{vert:true,seg:10});S(295,y,28,Math.PI/2,M([['#5a4e68',1],['#6a5e78',.5]],.3),3,{load:.7,thin:.4,opacity:.6});}
// roof: two planes in rows of flat strokes; lit left plane warm red, shaded right plane deep wine
fill([[198,340],[303,226],[303,340]],10,(x,y)=>M([[mixh('#9a4038','#722c30',clamp((y-226)/114,0,1)),1],['#b0503e',R(.1,.4)]],.3),{seg:12});
fill([[303,226],[410,340],[303,340]],10,(x,y)=>M([['#4a1c26',1],['#3a1620',.7],['#5a2630',.3]],.3),{seg:12});
fill(RECT(196,338,412,346),6,()=>M([['#2a1418',1],['#40201e',.5]],.2),{seg:20});
S(280,300,70,-.85,M([['#c0624a',1],['#d4785a',.4]],.2),6,{load:1.1,thin:.3,taper:[.2,.4],opacity:.8});S(250,322,55,-.8,M([['#b85846',1],['#c8685a',.4]],.2),5,{load:1.1,thin:.3,taper:[.2,.4],opacity:.7});
L([[303,226],[303,204],[303,192]],'#3a2a2a',4.5,{brush:'round',load:1,thin:.3,taper:[.05,.3]});p.dab({x:303,y:190,color:'#5a4640',size:8,brush:'round',load:1});
// warm rim light down the left edge
for(let i=0;i<5;i++){S(R(212,218),R(500,820),R(60,130),Math.PI/2,M([['#e8c898',1],['#f4dcb0',.4]],.2),R(4,6),{load:1.1,thin:.35,opacity:.6,taper:[.2,.4]});}
