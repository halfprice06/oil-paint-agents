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
// 08 the gate: an emissive vortex. Violet depths, pale lilac spiral arms winding into a white core, a solid bright white rim with a deeper violet inner edge. Melted wet-into-wet so it glows, then crisp lights on top.
p.wipe();
const GX=1193,GY=524,GR=386;
const armV=(x,y)=>{const dx=x-GX,dy=y-GY,r=Math.hypot(dx,dy);const th=Math.atan2(dy,dx);const ph=2*th+3.4*Math.log(Math.max(r,12)/GR);return {r:r/GR,arm:(1+Math.cos(ph))/2,th};};
const gateC=(x,y)=>{const v=armV(x,y);const r=clamp(v.r,0,1);
 const deep=G([[0,'#e0d0fc'],[.3,'#c09cf6'],[.7,'#aa7cf0'],[1,'#9062dc']],r);
 const light=G([[0,'#ffffff'],[.3,'#f4ecff'],[.7,'#e4d2fa'],[1,'#cdb6f2']],r);
 let t=Math.pow(v.arm,1.25);t=clamp(t*(.8+.45*(1-r))+(x<GX?.07:-.05)*r,0,1);return mixh(deep,light,t);};
const rimC=(x,y)=>{const a=Math.atan2(y-GY,x-GX);const hot=.5+.5*Math.cos(a-Math.PI*1.25);return mixh('#e2d8fc','#ffffff',clamp(hot*1.2,0,1));};
// 1. solid rim base first (arcs), then the interior laid in strokes that ride the spiral iso-phase lines so each arm keeps one colour along its length
for(let a=0;a<TAU;a+=.2)for(const [r,sz] of [[412,44],[398,36]]){arc(GX,GY,r,a,a+.34,K(rimC(GX+Math.cos(a)*r,GY+Math.sin(a)*r),.02),sz,{load:1.1,thin:.35,taper:[.04,.04]});}
for(let i=0;i<10;i++){const a=R(0,TAU),r=R(0,60);S(GX+14+Math.cos(a)*r,GY+22+Math.sin(a)*r,R(60,100),R(0,TAU),'#eee0ff',R(40,60),{load:1.1,thin:.4,taper:[.2,.3]});}
// coverage: concentric rings of broad strokes in the mean colour, so nothing underneath shows
for(let r=20;r<392;r+=30)for(let a=0;a<TAU;a+=.9){const aa=a+R(0,.5);arc(GX,GY,r,aa,aa+1.1,K(gateC(GX+Math.cos(aa+.5)*r,GY+Math.sin(aa+.5)*r),.02),R(40,56),{load:1.05,thin:.35,taper:[.1,.1],edge:.1});}
const sp=(phi,r0,u,dr)=>{const r=r0*(1-u*dr);const th=phi/2-1.7*Math.log(Math.max(r,8)/GR);return [GX+Math.cos(th)*r,GY+Math.sin(th)*r];};
for(let i=0;i<420;i++){const r0=Math.sqrt(R(.004,1))*392,phi=R(0,4*Math.PI),len=R(.18,.3),sz=R(30,46)*(.6+.4*r0/GR);const pts=[];for(let k=0;k<5;k++)pts.push(sp(phi,r0,k/4,len).concat([pr(k,5)]));
 const mid=pts[2];L(pts,K(gateC(mid[0],mid[1]),.015),sz,{load:1.05,thin:.35,taper:[.15,.2],edge:.25});}
// 2. melt the arms along the spiral, several passes at varied length: this is what makes it glow
for(let i=0;i<160;i++){const r0=Math.sqrt(R(.01,1))*370,phi=R(0,4*Math.PI);const pts=[];for(let k=0;k<5;k++)pts.push(sp(phi,r0,k/4,R(.2,.4)));BL(pts,R(40,70),R(.4,.65));}
// 3. arm lights: long tapering strokes along the two main arms, pale lilac to white; darker violet ridges between them
for(let j=0;j<2;j++){const th0=j*Math.PI;const pts=[];for(let k=0;k<=48;k++){const r=GR*.97*Math.pow(1-k/52,1.4)+14;const th=th0-1.7*Math.log(r/GR);pts.push([GX+Math.cos(th)*r,GY+Math.sin(th)*r]);}
 for(let k=0;k<pts.length-7;k+=4){L(pts.slice(k,k+8),M([['#f4ecff',1],['#e6d8fc',.6],['#ffffff',.2]],.25),clamp(48-k*.8,18,48),{load:1.1,thin:.3,taper:[.3,.5],opacity:R(.5,.75),edge:.45});}}
for(let j=0;j<2;j++){const th0=j*Math.PI+Math.PI/2;const pts=[];for(let k=0;k<=40;k++){const r=GR*.95*Math.pow(1-k/46,1.3)+30;const th=th0-1.7*Math.log(r/GR);pts.push([GX+Math.cos(th)*r,GY+Math.sin(th)*r]);}
 for(let k=0;k<pts.length-7;k+=4){L(pts.slice(k,k+8),M([['#8858d6',1],['#9a68e2',.6]],.25),clamp(34-k*.5,14,34),{load:.9,thin:.4,taper:[.3,.5],opacity:R(.3,.5),edge:.6});}}
for(let i=0;i<90;i++){const a=R(0,TAU),r=Math.sqrt(R(.02,1))*350;BL(seg(GX+Math.cos(a)*r,GY+Math.sin(a)*r,R(80,160),a+Math.PI/2-.8,0,3),R(34,56),R(.3,.5));}
// 4. the white core: hot centre, soft halo, then a few thick touches
lobe(GX+14,GY+22,100,100,[[0,'#d8c2f8'],[.5,'#f2e8ff'],[1,'#ffffff']],24,{dens:1.7,len:1.5,jit:.04,so:{edge:.3}});
for(let i=0;i<30;i++){const a=R(0,TAU),r=R(10,130);BL(seg(GX+14+Math.cos(a)*r,GY+22+Math.sin(a)*r,R(60,120),a+Math.PI/2-.7,0,3),R(30,46),R(.35,.55));}
for(let i=0;i<7;i++){const a=R(0,TAU),r=R(0,60);S(GX+14+Math.cos(a)*r,GY+22+Math.sin(a)*r,R(30,70),a+Math.PI/2-.7,M([['#ffffff',1],['#faf4ff',.5]],.1),R(14,24),{load:1.25,thin:.25,taper:[.3,.4],opacity:.85});}
// 5. thin filaments spiralling in (the master has two ribbons)
for(const th0 of [.2,3.5]){const pts=[];for(let k=0;k<=30;k++){const r=GR*.92*(1-k/38);const th=th0+k*.16;pts.push([GX+Math.cos(th)*r,GY+Math.sin(th)*r]);}
 for(let k=0;k<pts.length-5;k+=4)L(pts.slice(k,k+6),M([['#ffffff',1],['#f0e6ff',.5]],.2),R(5,8),{load:1.1,thin:.3,taper:[.3,.4],opacity:R(.6,.9)});}
// 6. deeper violet just inside the rim (lower right strongest), then the rim itself: continuous thick arcs, overlapped, hot at upper left, lavender at lower right
for(let a=0;a<TAU;a+=.12){arc(GX,GY,GR-22,a,a+.3,M([['#7a4ec8',1],['#8a5ad8',.6]],.25),R(18,30),{load:.9,thin:.45,edge:.6,opacity:R(.15,.45)+(Math.sin(a+.9)>0?.12:0)});}
for(let a=0;a<TAU;a+=.19){const hot=.5+.5*Math.cos(a-Math.PI*1.25);const col=mixh('#e0d6fc','#ffffff',clamp(hot*1.3,0,1));arc(GX,GY,409,a,a+.34,M([[col,1],['#ffffff',hot*.5+.05],['#c8bcf2',(1-hot)*.4]],.15),R(40,48),{load:1.2,thin:.3,taper:[.04,.04],stir:.5});}
for(let a=0;a<TAU;a+=.2){const hot=.5+.5*Math.cos(a-Math.PI*1.25);arc(GX,GY,419,a,a+.34,M([['#ffffff',1],['#f4eeff',.4]],.1),R(14,22),{load:1.2,thin:.25,opacity:.45+.45*hot,taper:[.1,.1]});}
for(let a=0;a<TAU;a+=.26){arc(GX,GY,436,a,a+.34,M([['#b8a4f0',1],['#a894e8',.5]],.2),R(8,14),{load:.8,thin:.4,edge:.6,opacity:.55,taper:[.2,.2]});}
for(let a=0;a<TAU;a+=.3)BL([[GX+Math.cos(a)*372,GY+Math.sin(a)*372],[GX+Math.cos(a+.16)*378,GY+Math.sin(a+.16)*378],[GX+Math.cos(a+.3)*372,GY+Math.sin(a+.3)*372]],30,.3);
p.dry();
