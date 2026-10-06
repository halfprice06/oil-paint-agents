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
// 28 richness: second-layer broken colour so close-ups have life: warm/cool strokes in the sky (sky only), more leaf masses with lit rims on every lobe, plank tone variation on the deck, board tone on the skirt, mottling on tower stone and house plaster.
p.wipe();p.dry();
const GX=1193,GY=524;
const TREEP=[[440,330],[455,270],[520,205],[600,175],[650,120],[665,40],[690,0],[2400,0],[2400,1010],[2330,990],[2330,780],[1990,760],[1840,700],[1800,640],[1530,640],[1520,560],[1380,540],[1250,520],[1000,600],[900,640],[780,600],[700,560],[620,540],[530,500],[470,440]];
const BALS=[[472,45,76,90],[855,95,57,68],[1857,100,67,80]];
const inBl=(x,y)=>BALS.some(b=>Math.pow((x-b[0])/b[2],2)+Math.pow((y-b[1])/b[3],2)<1);
const isSky=(x,y)=>y<835&&!inPoly(TREEP,x,y)&&!(x>180&&x<420&&y>185)&&!(x<275&&y>380)&&Math.hypot(x-GX,y-GY)>455&&!(x>640&&x<920&&y>520)&&!inBl(x,y)&&!(x>560&&x<780&&y>380);
// sky: elongated broken strokes, warm in the low sun-side, cool toward the zenith, sizes 10-30, low opacity so the underlayer glows through
for(let i=0;i<300;i++){const x=R(0,700),y=Math.pow(R(0,1),.9)*830;const a=R(-.12,.06),l=R(120,300);if(!isSky(x,y)||!isSky(x+Math.cos(a)*l,y+Math.sin(a)*l))continue;
 const t=y/830;const warm=R(0,1)<(.2+.7*t);
 S(x,y,l,a,warm?M([['#f4d4a8',1],['#eab890',.5],['#f8e4c0',.3]],.3):M([['#9c9cc4',1],['#aeaad0',.5],['#8a8cb8',.3]],.3),R(26,52),{load:R(.5,.9),thin:.6,opacity:R(.07,.17),taper:[.3,.5],stir:.3,edge:.7});}
// leaf masses on every lobe: larger dragged clumps in two tones with a lit rim; right-hand lobes stay dark with just a hint of rim light
const LB=[[545,395,112,135,1],[500,300,72,70,.95],[610,235,90,82,1],[720,160,115,115,1],[845,205,105,150,.8],[800,50,100,70,.9],[985,35,150,60,.7],[1170,25,130,55,.55],[1340,28,160,55,.5],[1520,60,120,80,.5],[1650,170,160,140,.4],[1790,330,150,140,.3],[1930,115,170,110,.35],[2090,300,150,190,.25],[2290,160,150,150,.25],[1540,430,110,130,.3],[1640,590,240,95,.2],[1900,520,110,140,.2],[2300,620,110,200,.18],[2000,590,90,100,.15]];
for(const [cx,cy,rx,ry,lt] of LB){const n=Math.round(10+lt*40);
 for(let i=0;i<n;i++){const a=R(Math.PI*.6,Math.PI*1.95),rr=Math.sqrt(R(.1,1));const x=cx+Math.cos(a)*rx*rr,y=cy+Math.sin(a)*ry*rr;if(Math.hypot(x-GX,y-GY)<452||inBl(x,y)||(x>1920&&x<2370&&y>400&&y<640))continue;
  const L0=clamp(-(Math.cos(a)*.62+Math.sin(a)*.78)*.5+.5,0,1)*lt;const sz=R(14,32)*(.6+lt*.5),dir=a+Math.PI/2+R(-.9,.9);
  S(x,y,sz*R(1.4,2.8),dir,M([[mixh('#1c2a1c','#4a6030',L0*1.2),1],[mixh('#16221a','#2e4228',L0),.5]],.3),sz,{load:1.05,thin:.35,taper:[.2,.4],opacity:R(.5,.85),stir:.35,edge:.2});
  if(L0>.25)S(x-sz*.2,y-sz*.3,sz*R(1.2,2.4),dir+R(-.3,.3),M([[mixh('#6a7e32','#a4b044',L0),1],['#4a5c2a',.4]],.3),sz*R(.35,.55),{load:1.15,thin:.3,taper:[.3,.5],opacity:.9,stir:.3});}}
// tower stone mottling: patches of lichen-grey and warm ochre, a darker foot
for(let i=0;i<120;i++){const x=R(214,388),y=R(486,874);const t=(x-210)/182;S(x,y,R(14,40),R(-.05,.05),R(0,1)<.5?M([['#a8a490',1],['#9a9684',.5]],.3):M([['#c4a070',1],['#b08c60',.5]],.3),R(7,13),{load:.6,thin:.45,opacity:R(.2,.45)*(1-t*.4),taper:[.2,.4],scumble:true});}
for(let i=0;i<10;i++){S(R(220,384),R(820,880),R(40,100),0,M([['#3e3430',1],['#4e4038',.5]],.3),R(10,18),{load:.7,thin:.5,opacity:.35,taper:[.2,.4],edge:.5});}
// house plaster: soft mottling, damp stains under the eaves, light on the left edges
for(const [x0,x1,yt,yb] of [[662,905,636,880],[1330,1860,656,880]]){for(let i=0;i<50;i++){const x=R(x0,x1),y=R(yt,yb);if(Math.hypot(x-GX,y-GY)<452&&x<1400)continue;S(x,y,R(30,90),R(-.05,.05),R(0,1)<.5?M([['#b89a84',1],['#a8846c',.5]],.3):M([['#8a6c64',1],['#7a5e5c',.5]],.3),R(12,26),{load:.6,thin:.5,opacity:R(.15,.3),taper:[.2,.4],edge:.5});}}

p.dry();
