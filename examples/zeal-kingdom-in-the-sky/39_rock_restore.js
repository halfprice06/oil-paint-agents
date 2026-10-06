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

// ---- 39_rock_restore.body.js ----
// 39_rock_restore (round 4): the last thing painted on the rock. Re-lays the three strata as lit ledge edges with thin dark undersides, the crevices, the lower-right stepped facets, and warms the lit left face, all over the dry wreath, skipping the waterfalls.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const SIL=[[860,780],[980,800],[1200,825],[1500,830],[1800,815],[2050,790],[2160,760],[2140,800],[2085,812],[2065,872],[2005,880],[1992,942],[1935,950],[1922,1002],[1872,1012],[1862,1062],[1802,1076],[1792,1122],[1722,1132],[1700,1150],[1690,1185],[1650,1190],[1645,1225],[1600,1232],[1598,1262],[1560,1250],[1550,1215],[1512,1205],[1505,1180],[1480,1180],[1450,1220],[1400,1250],[1378,1288],[1358,1306],[1336,1290],[1290,1230],[1255,1200],[1210,1160],[1180,1150],[1140,1100],[1100,1060],[1060,1090],[1040,1080],[1000,1000],[980,960],[940,930],[900,900],[880,860],[870,840]];
const S1=[[870,862],[980,882],[1100,894],[1240,900],[1400,896],[1560,892],[1720,886],[1900,884],[2070,878]];
const S2=[[985,990],[1100,1004],[1240,1010],[1400,1006],[1560,1000],[1720,998],[1930,1002]];
const S3=[[1150,1108],[1240,1122],[1400,1120],[1560,1116],[1700,1122],[1800,1122]];
const inFall=x=>(x>1203&&x<1337)||(x>1683&&x<1767)||(x>993&&x<1057);
const Lsienna=[['burnt_sienna',.4],['yellow_ochre',.8],['titanium_white',1.9],['raw_umber',.5],['cobalt_violet',.1]];
const Lhot=[['yellow_ochre',1],['titanium_white',2.4],['naples_yellow',.5],['burnt_sienna',.2]];
const Lpink=[['titanium_white',2.6],['naples_yellow',.6],['quinacridone_rose',.12],['yellow_ochre',.4]];
const Lhalf=[['raw_umber',1],['burnt_sienna',.3],['ultramarine',.5],['titanium_white',.9],['cobalt_violet',.25]];
const Vgrey=[['ultramarine',.7],['cobalt_violet',.6],['paynes_grey',.35],['burnt_umber',.3],['titanium_white',1.3]];
const Vlit=[['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.35],['naples_yellow',.2]];
const Vdark=[['ultramarine',1],['dioxazine_purple',.4],['burnt_umber',.5],['paynes_grey',.3],['titanium_white',.4]];
const Core=[['ultramarine',1],['burnt_umber',.8],['dioxazine_purple',.5],['paynes_grey',.4],['titanium_white',.04]];
const Crev=[['dioxazine_purple',.6],['burnt_umber',.8],['ultramarine',.6],['titanium_white',.02]];
const Bounce=[['cobalt_violet',.8],['quinacridone_rose',.25],['titanium_white',1.5],['ultramarine',.25],['burnt_umber',.1]];
// 1. the lit left face: broad warm planes between the ledges, thick, in raking light (clearly lighter and warmer than the centre)
for(let i=0;i<44;i++){const x=R(885,1200),y=R(805,1100);if(!inPoly(SIL,x,y)||inFall(x))continue;const t=clamp(((x-885)/320*.6+(y-805)/300*.7),0,1);
  const sz=R(14,30);const a=p.random()<.5?.1+R(-.3,.3):1.05+R(-.5,.5);S(x,y,sz*R(1.8,3.2),a,M(ML(Lhot,Lsienna,t*.8+R(-.15,.15)),.18),sz,{brush:p.random()<.5?'flat':'filbert',load:1.1,thin:.38,edge:.4,taper:[.12,.15],stir:.65});}
// cool half-tone to keep the centre and core darker than the face
for(let i=0;i<40;i++){const x=R(1340,1690),y=R(850,1200);if(!inPoly(SIL,x,y)||inFall(x))continue;const sz=R(18,32);S(x,y,sz*R(2.5,4),.1+R(-.5,.5),M(ML(Vgrey,Vdark,R(.3,.8)),.18),sz,{brush:'flat',load:.9,thin:.5,edge:.4,taper:[.1,.12],stir:.75});}
for(let i=0;i<40;i++){const x=R(1700,2050),y=R(880,1150);if(!inPoly(SIL,x,y)||inFall(x))continue;const sz=R(18,34);S(x,y,sz*R(2.5,4),.15+R(-.5,.5),M(ML(Vdark,Core,R(.4,.9)),.15),sz,{brush:'flat',load:.85,thin:.55,edge:.4,taper:[.1,.12],stir:.85});}
// 2. strata as ledges: thin dark underside, lit outer edge (thick warm left, pale violet right), knife touches
function stratum(L,depth,knifeAt){
  for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const n=Math.max(1,Math.round(len/120));let jog=0;
    for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;const x=lerp(a[0],b[0],(t0+t1)/2),y=lerp(a[1],b[1],(t0+t1)/2)+jog;const u=clamp((x-900)/1100,0,1);const pl=len/n*R(.85,1.1);
      if(!inPoly(SIL,x,y+10)||inFall(x))continue;
      const dk=u<.35?ML(Lhalf,Core,.6):u<.6?ML(Vdark,Core,.6):Core;
      S(x+R(-4,4),y+depth*.6,pl*R(1,1.2),ang+R(-.04,.04),M(dk,.15),depth*R(.9,1.3),{load:.8,thin:.6,edge:.5,taper:[.2,.2],stir:.9});
      p.stroke({points:[[x-Math.cos(ang)*pl*.5,y-Math.sin(ang)*pl*.5+R(-2,2),.4],[x-Math.cos(ang)*pl*.5+pl*.35,y-Math.sin(ang)*pl*.5-2,.9],[x+Math.cos(ang)*pl*.5,y+Math.sin(ang)*pl*.5-1,.4]],color:M(u<.3?ML(Lhot,Lpink,R(.2,.7)):u<.6?ML(Vlit,Lpink,R(0,.4)):ML(Vgrey,Vlit,R(.3,.7)),.12),brush:'filbert',size:u<.35?depth*R(.45,.65):depth*R(.28,.45),load:u<.35?1.35:u<.6?1.05:.85,thin:u<.35?.25:.45,taper:[.25,.35],edge:u<.35?.1:.35,stir:.6,clean:u<.35&&k===0,opacity:u>.75?.7:1});
      if(p.random()<.3)jog=R(-8,8);}}
  for(const kx of knifeAt){const y=((x)=>{for(let i=0;i<L.length-1;i++)if(x<=L[i+1][0])return lerp(L[i][1],L[i+1][1],(x-L[i][0])/(L[i+1][0]-L[i][0]));return L[L.length-1][1];})(kx);
    p.stroke({points:[[kx-R(22,36),y-4,.8],[kx,y-5,1],[kx+R(22,40),y-3,.6]],color:M(Lpink,.08),brush:'knife',size:R(7,11),load:1.3,thin:.15,taper:[.1,.3],clean:true});}}
stratum(S1,28,[905,1130]);
stratum(S2,24,[1080]);
stratum(S3,20,[]);
stratum([[900,940],[1000,950],[1100,958],[1240,962]],12,[]);
// thin cast shadows right under the lit edges on the left face
for(const L of [S1,S2])for(let i=0;i<L.length-1&&L[i][0]<1250;i++){const a=L[i],b=L[i+1];const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/45));
  for(let k=0;k<n;k++){const t=(k+R(.2,.8))/n;const x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t)+R(3,8);if(!inPoly(SIL,x,y)||inFall(x))continue;
    S(x,y,R(26,48),Math.atan2(b[1]-a[1],b[0]-a[0])+R(-.05,.05),M(Crev,.12),R(3,5.5),{load:.75,thin:.6,taper:[.25,.3],edge:.25,opacity:.85,stir:.9});}}
// 3. the lower-right stepped facets: lit riser, dark underside, bounce on each lower lip
const steps=[[[2140,800],[2085,812],[2065,872]],[[2005,880],[1992,942],[1935,950]],[[1922,1002],[1872,1012],[1862,1062]],[[1802,1076],[1792,1122],[1722,1132]],[[1700,1150],[1690,1185],[1650,1190]],[[1650,1190],[1645,1225],[1600,1232]],[[1560,1250],[1550,1215],[1512,1205]],[[1512,1205],[1505,1180],[1480,1180]]];
for(const st of steps){const [a,b,c]=st;
  for(let k=0;k<3;k++)p.stroke({points:[[a[0]+R(-3,3)-k*9,a[1]+R(0,6),.7],[(a[0]+b[0])/2-k*9,(a[1]+b[1])/2,.9],[b[0]+R(-3,3)-k*9,b[1]-R(0,6),.5]],color:M(k===0?ML(Vgrey,Vlit,.35):ML(Vdark,Core,k*.3),.15),brush:'filbert',size:R(10,16),load:k===0?1.05:.8,thin:k===0?.4:.55,taper:[.15,.25],edge:.3,stir:.7,clean:k===0});
  for(let k=0;k<2;k++)p.stroke({points:[[b[0]+R(-3,3),b[1]-R(6,12)-k*10,.6],[(b[0]+c[0])/2,(b[1]+c[1])/2-R(6,12)-k*10,.9],[c[0]+R(-3,3),c[1]-R(6,12)-k*10,.5]],color:M(Core,.12),brush:'filbert',size:R(12,18),load:.75,thin:.6,taper:[.2,.2],edge:.5,stir:.9});
  p.stroke({points:[[b[0]-4,b[1]+2,.6],[(b[0]+c[0])/2,(b[1]+c[1])/2+2,.85],[c[0],c[1]+2,.4]],color:M(ML(Vdark,Bounce,.6),.15),brush:'filbert',size:R(6,10),load:.9,thin:.45,taper:[.25,.35],edge:.4,stir:.6});}
// 4. crevices, broken at the strata
for(const c of [[1060,840,1075,990],[1350,840,1388,1000],[1372,1010,1360,1230],[1565,845,1600,990],[1700,900,1690,1100],[1935,835,1978,935],[2040,800,2030,870],[1440,1030,1455,1200],[1120,1010,1130,1090]]){
  if(inFall(c[0]))continue;p.stroke({points:[[c[0]+R(-4,4),c[1],.5],[(c[0]+c[2])/2+R(-8,8),(c[1]+c[3])/2,.95],[c[2]+R(-4,4),c[3],.35]],color:M(Crev,.1),brush:'round',size:R(4,8),load:.7,thin:.62,taper:[.15,.55],stir:.9});}
// 5. the stalactite facets and found edges on the lit silhouette
p.stroke({points:[[1340,1225,.9],[1346,1265,.9],[1356,1298,.3]],color:M(ML(Vlit,Lhalf,.4),.15),brush:'flat',size:R(13,17),load:1.05,thin:.4,taper:[0,.45],edge:.1,stir:.7,clean:true});
p.stroke({points:[[1372,1222,.9],[1370,1262,.9],[1361,1300,.3]],color:M(Core,.12),brush:'flat',size:R(13,17),load:.8,thin:.55,taper:[0,.45],edge:.15,stir:.85});
for(const e of [[868,845,906,906],[906,906,944,934],[1000,1000,1040,1078]])for(let k=0;k<2;k++)p.stroke({points:[[e[0]+R(-3,3),e[1]+R(-3,3),.7],[(e[0]+e[2])/2+R(-4,4),(e[1]+e[3])/2,1],[e[2]+R(-3,3),e[3]+R(-3,3),.6]],color:M(Lpink,.1),brush:'filbert',size:R(7,12),load:1.3,thin:.25,taper:[.2,.3],clean:true});
