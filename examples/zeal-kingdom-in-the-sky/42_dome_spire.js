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

// ---- 42_dome_spire.body.js ----
// 42: the great spire: a slender ogee (waist ~110 px wide at y 400, swelling to the drum rim at y 500), tiled blue-green,
// lit left face warm turquoise, right face deep ultramarine, the turn melted; one crisp highlight ridge comes in pass 47
p.wipe();
const CX=1490,TIP=240,BY=500,RY=26,RB=120;
const TAB=[[240,0],[262,5],[290,11],[320,18],[355,28],[400,55],[435,78],[462,99],[484,114],[500,120]];
const W=y=>{if(y<=TAB[0][0])return 0;for(let i=0;i<TAB.length-1;i++){if(y<=TAB[i+1][0]){const t=(y-TAB[i][0])/(TAB[i+1][0]-TAB[i][0]);return lerp(TAB[i][1],TAB[i+1][1],t*t*(3-2*t)*.5+t*.5);}}return RB;};
const rimY=u=>BY+RY*Math.sqrt(Math.max(0,1-u*u));
// (the sky patch over the block-in's old dome was removed in round 5: the block-in is now a thin wash and the sky painter covers it)
const SP_L=()=>M([['titanium_white',2.7],['cerulean',1],['viridian',.28],['naples_yellow',.14]],.22);
const SP_LT=()=>M([['titanium_white',2.9],['cerulean',.8],['viridian',.2],['naples_yellow',.25]],.2);
const SP_H=()=>M([['titanium_white',1.5],['cerulean',.9],['cobalt_blue',.45],['viridian',.22]],.22);
const SP_B=()=>M([['titanium_white',1.1],['cerulean',.55],['cobalt_blue',.7],['ultramarine',.3],['viridian',.1]],.25);
const SP_T=()=>M([['titanium_white',.7],['cobalt_blue',.7],['ultramarine',.7],['viridian',.08]],.2);
const SP_C=()=>M([['ultramarine',1.3],['cobalt_blue',.3],['titanium_white',.4],['dioxazine_purple',.12]],.2);
const SP_R=()=>M([['ultramarine',.8],['cobalt_violet',.4],['titanium_white',.9]],.2);
function zone(u,y){u+=R(-.05,.05);const nearTip=y<330;
 if(u<-.92)return{c:SP_H(),o:{load:1,thin:.4}};
 if(u<-.1)return{c:nearTip?SP_LT():(y>455&&p.random()<.4?SP_H():SP_L()),o:{load:1.3,thin:.3,clean:true}};
 if(u<.2)return{c:SP_H(),o:{load:1.1,thin:.38}};
 if(u<.42)return{c:SP_B(),o:{load:1,thin:.4}};
 if(u<.58)return{c:SP_T(),o:{load:.9,thin:.45}};
 if(u<.88)return{c:SP_C(),o:{load:.8,thin:.55}};
 return{c:SP_R(),o:{load:.85,thin:.5}};}
function merid(u,ya,yb,size,o){const n=5,pts=[];for(let i=0;i<n;i++){const y=lerp(ya,yb,i/(n-1));pts.push([CX+u*W(y)+R(-.8,.8),Math.min(y,rimY(u)-2),pr(i,n)]);}
 const z=zone(u,(ya+yb)/2);L(pts,z.c,size,Object.assign({edge:R(0,.2),taper:R(0,.25),brush:p.random()<.3?'flat':'filbert'},z.o,o||{}));}
const items=[];
for(let i=0;i<820;i++){const u=R(-1,1);const yc=R(255,520);const len=R(20,70)*(yc<340?.45:1);items.push([u,yc,len]);}
items.sort((a,b)=>b[0]-a[0]);
for(const [u,yc,len] of items){const ya=Math.max(TIP+6,yc-len/2),yb=Math.min(rimY(u)-1,yc+len/2);if(yb-ya<6)continue;
 const w=W(yc);const size=clamp(w*.15,3.5,16)*R(.8,1.25);merid(u,ya,yb,size);}
// the narrow upper shaft: thin strokes up to the tip
for(let i=0;i<40;i++){const u=R(-.95,.95);const ya=R(244,300),yb=ya+R(14,40);merid(u,ya,yb,R(3,5));}
// melt the turn along the surface (three bands), then the reflected edge and the lit edge a little
for(let k=0;k<14;k++){const u=(k<5?.3:(k<10?.48:.64))+R(-.07,.07);const pts=[];for(let i=0;i<5;i++){const y=lerp(300,500,i/4);pts.push([CX+u*W(y),y]);}SB(pts,R(22,38)*(k<5?.8:1),.55);}
for(let k=0;k<3;k++){const u=.9+R(-.04,.04);const pts=[];for(let i=0;i<4;i++){const y=lerp(360,500,i/3);pts.push([CX+u*W(y),y]);}SB(pts,R(10,14),.4);}
for(let k=0;k<3;k++){const u=-.15+R(-.1,.1);const pts=[];for(let i=0;i<4;i++){const y=lerp(320,500,i/3);pts.push([CX+u*W(y),y]);}SB(pts,R(16,24),.3);}
// a few warm reflected touches low on the shadow side (the plateau and clouds light it)
for(let i=0;i<5;i++){const u=R(.72,.95),y=R(445,498);merid(u,y-R(10,18),y+R(4,8),R(5,8),{color:M([['ultramarine',.7],['cobalt_violet',.5],['naples_yellow',.15],['titanium_white',.6]],.2),load:.85,thin:.5,clean:false,edge:.4});}
p.dry();
