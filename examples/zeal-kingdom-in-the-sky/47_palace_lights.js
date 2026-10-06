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

// ---- 47_palace_lights.body.js ----
// 47: thick lights and gold: a few knife touches at cornices and arch crowns, highlight ridges on the roofs, finials
p.wipe();
const CRM=()=>M([['titanium_white',3.4],['naples_yellow',.8],['cadmium_lemon',.08]],.15);
const CRX=()=>M([['titanium_white',3.6],['naples_yellow',.5],['cadmium_lemon',.12]],.12);
const GLD=()=>M([['cadmium_yellow',1],['yellow_ochre',.55],['titanium_white',.45]],.2);
const GLL=()=>M([['cadmium_lemon',.8],['titanium_white',.9],['cadmium_yellow',.4]],.15);
const GLS=()=>M([['yellow_ochre',1],['burnt_sienna',.5],['ultramarine',.12]],.2);
// knife lights on the lit rims: few, varied
for(const a of [2.92,2.5,2.1]){earc(1490,599+R(-1,1),190,36,a,a-R(.1,.3),CRX(),R(5,9),{brush:p.random()<.6?'knife':'flat',load:1.3,thin:.2,clean:true,taper:0});}
for(const a of [2.85,2.3]){earc(1490,499,120,26,a,a-R(.14,.26),CRX(),R(5,7),{brush:'knife',load:1.3,thin:.2,clean:true,taper:0});}
// thickest cream near the lit normal of each cylinder
for(let i=0;i<9;i++){const u=R(-.78,-.45),x=1490+u*190;S(x,R(650,700),R(22,44),Math.PI/2+R(-.08,.08),CRX(),R(10,15),{load:1.4,thin:.25,clean:true,edge:.15,taper:[.15,.3]});}
for(let i=0;i<5;i++){const u=R(-.75,-.45),x=1490+u*120;S(x,R(545,590),R(18,32),Math.PI/2+R(-.08,.08),CRX(),R(8,11),{load:1.4,thin:.25,clean:true,edge:.15,taper:[.15,.3]});}
for(const t of [[1232,590,740],[1772,630,750]])for(let i=0;i<5;i++){const u=R(-.75,-.45),x=t[0]+u*52;S(x,R(t[1],t[2]),R(20,38),Math.PI/2+R(-.06,.06),CRX(),R(7,10),{load:1.4,thin:.25,clean:true,edge:.15,taper:[.15,.3]});}
for(let i=0;i<4;i++){const a=R(2.1,2.9);earc(1490,596,182,32,a,a-R(.12,.22),CRM(),R(6,9),{load:1.3,thin:.3,clean:true});}
// gold: band at the great spire's base (bright left, ochre right), arch crowns, cornice touches
for(let a=3.05;a>.08;a-=R(.1,.2)){const u=Math.cos(a);const c=u<-.3?GLL():(u<.4?GLD():GLS());earc(1490,500+R(-.5,.5),121,27,a,a-R(.16,.36),c,R(3.5,5.5),{brush:p.random()<.4?'knife':'filbert',load:1.2,thin:.3,clean:true,taper:[.1,.2]});}
p.dab({x:1372,y:679,color:GLD(),size:6,brush:'knife',load:1.2,angle:0});p.dab({x:1369,y:677,color:GLL(),size:3.5,brush:'round',load:1.2});
for(const x of [1318,1430,1545]){p.dab({x:x,y:600+36*Math.sqrt(1-Math.pow((x-1490)/190,2))-R(0,2),color:GLL(),size:R(3.5,5),brush:'knife',load:1.2,angle:.2});}
for(const t of [[1232,560],[1772,600]]){for(const a of [2.7,2.1]){const x=t[0]+52*Math.cos(a);p.dab({x:x,y:t[1]+12*Math.sin(a),color:GLD(),size:R(3,4),brush:'round',load:1.1});}}
// finials: gold rods with a lit side, orbs, knife glints
function rod(x,y0,y1,w){WL(x+1,y0,x+1,y1,GLS(),w,{load:1,thin:.35});WL(x-1,y0,x-1,y1,GLD(),w*.8,{load:1.1,thin:.3,clean:true});WL(x-2,y0+(y1-y0)*.1,x-2,y1-(y1-y0)*.15,GLL(),w*.45,{load:1.1,thin:.3,clean:true});}
rod(1490,238,126,6);
p.dab({x:1491,y:232,color:GLD(),size:12,brush:'round',load:1.2});p.dab({x:1488,y:229,color:GLL(),size:5,brush:'knife',load:1.2,angle:-.6});
p.dab({x:1490,y:174,color:GLD(),size:8,brush:'round',load:1.2});p.dab({x:1488,y:172,color:GLL(),size:4,brush:'knife',load:1.2,angle:-.6});
p.dab({x:1490,y:124,color:GLL(),size:5,brush:'round',load:1.2});
for(const t of [[1232,393,34,4],[1772,443,30,4],[1878,538,16,3],[1062,660,14,3]]){rod(t[0],t[1],t[1]-t[2],t[3]);p.dab({x:t[0],y:t[1]-t[2],color:GLL(),size:t[3]+1.5,brush:'round',load:1.2});p.dab({x:t[0],y:t[1]-t[2]*.45,color:GLD(),size:t[3]+1,brush:'round',load:1.1});}
// one crisp highlight ridge near the lit edge of each roof, with a few pale touches at the great spire's tip
const TAB=[[240,0],[262,5],[290,11],[320,18],[355,28],[400,55],[435,78],[462,99],[484,114],[500,120]];
const W=y=>{if(y<=240)return 0;for(let i=0;i<TAB.length-1;i++){if(y<=TAB[i+1][0]){const t=(y-TAB[i][0])/(TAB[i+1][0]-TAB[i][0]);return lerp(TAB[i][1],TAB[i+1][1],t*t*(3-2*t)*.5+t*.5);}}return 120;};
const HL=()=>M([['titanium_white',3.2],['cerulean',.55],['naples_yellow',.3],['viridian',.08]],.15);
{const pts=[];for(let i=0;i<7;i++){const y=lerp(262,492,i/6);pts.push([1490-.58*W(y)+R(-.6,.6),y,.6+.4*Math.sin(Math.PI*i/6)]);}L(pts,HL(),R(4.5,6),{load:1.35,thin:.25,clean:true,taper:[.15,.2]});}
for(let i=0;i<5;i++){const y=R(250,300);const u=R(-.7,-.2);L([[1490+u*W(y+10),y+10],[1490+u*W(y),y]],HL(),R(3,4.5),{load:1.3,thin:.3,clean:true,taper:[.1,.3]});}
const TB=[[0,0],[.085,.042],[.19,.092],[.31,.15],[.44,.233],[.615,.458],[.75,.65],[.85,.825],[.94,.95],[1,1]];
const prof=t=>{t=clamp(t,0,1);for(let i=0;i<TB.length-1;i++){if(t<=TB[i+1][0]){const s=(t-TB[i][0])/(TB[i+1][0]-TB[i][0]);return lerp(TB[i][1],TB[i+1][1],s*s*(3-2*s)*.5+s*.5);}}return 1;};
for(const t of [[1232,395,560,52],[1772,445,600,52],[1878,540,600,20]]){const pts=[];for(let i=0;i<6;i++){const y=lerp(t[1]+14,t[2]-4,i/5);pts.push([t[0]-.58*t[3]*prof((y-t[1])/(t[2]-t[1]))+R(-.4,.4),y,.6+.4*Math.sin(Math.PI*i/5)]);}L(pts,HL(),R(3,4)*(t[3]/52+.5),{load:1.3,thin:.25,clean:true,taper:[.15,.2]});}
// the pavilion dome's highlight
L([[1040,680],[1048,670],[1058,665]],HL(),4,{load:1.3,thin:.25,clean:true,taper:[.2,.3]});
// sparkles
p.dab({x:1310,y:598,color:CRX(),size:7,brush:'knife',load:1.3,angle:.3});
p.dab({x:1184,y:558,color:CRX(),size:5,brush:'knife',load:1.3,angle:.3});
