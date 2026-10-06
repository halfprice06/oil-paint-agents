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

// ---- 40_palace_masses.body.js ----
// 40: palace masses (round 3: taller drum, lantern behind the right tower, domed pavilion). Shadow first, halftone, thick light, melted turns.
p.wipe();
const CR_L=()=>M([['titanium_white',3],['naples_yellow',.8],['yellow_ochre',.12]],.2);
const CR_E=()=>M([['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.1]],.2);
const CR_H=()=>M([['titanium_white',3],['naples_yellow',.45],['cobalt_violet',.22],['yellow_ochre',.06]],.2);
const CR_T=()=>M([['titanium_white',1.6],['cobalt_violet',.5],['ultramarine',.45],['naples_yellow',.1]],.2);
const CR_C=()=>M([['titanium_white',1.1],['ultramarine',.7],['cobalt_violet',.6],['raw_umber',.2]],.2);
const CR_R=()=>M([['titanium_white',1.6],['cobalt_violet',.45],['naples_yellow',.35],['ultramarine',.3]],.2);
const GR_L=()=>M([['titanium_white',2.6],['raw_umber',.25],['naples_yellow',.5],['cobalt_violet',.2]],.2);
const GR_C=()=>M([['titanium_white',1.3],['ultramarine',.5],['cobalt_violet',.5],['raw_umber',.25]],.2);
function zone(u,term,pal){pal=pal||{};const Lc=pal.L||CR_L,Ec=pal.E||CR_E,Hc=pal.H||CR_H,Tc=pal.T||CR_T,Cc=pal.C||CR_C,Rc=pal.R||CR_R;
 u+=R(-.05,.05);
 if(u<-.86)return{c:Ec(),o:{load:1.1,thin:.35}};
 if(u<term-.55)return{c:Lc(),o:{load:1.3,thin:.28,clean:true}};
 if(u<term-.12)return{c:Hc(),o:{load:1.1,thin:.35}};
 if(u<term+.08)return{c:Tc(),o:{load:.9,thin:.45}};
 if(u<.86)return{c:Cc(),o:{load:.8,thin:.55}};
 return{c:Rc(),o:{load:.85,thin:.5}};}
function patch(poly,size,n,fn,angf,ang,lenf){const [x0,y0,x1,y1]=bbox(poly);const pts=[];let g=0;
 while(pts.length<n&&g++<n*60){const x=R(x0,x1),y=R(y0,y1);if(inPoly(poly,x,y))pts.push([x,y]);}
 pts.sort((a,b)=>b[0]-a[0]);
 for(const [x,y] of pts){const a=angf(x,y)+R(-1,1)*ang;const sz=size*R(.7,1.3);let L=sz*lenf*R(.6,1.4);
  const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  const z=fn(x,y);S(x,y,L,a,z.c,sz,Object.assign({brush:p.random()<.3?'flat':'filbert',edge:R(0,.25),taper:R(0,.2)},z.o));}}
const VERT=()=>Math.PI/2;
const LD={cx:1490,r:190,cy:600,ry:36,bot:765},UD={cx:1490,r:120,cy:500,ry:26,bot:605};
const rim=(d,x)=>{const u=clamp((x-d.cx)/d.r,-1,1);return d.cy+d.ry*Math.sqrt(1-u*u);};
const wallPoly=(d,x0,x1)=>{const P=[];for(let i=0;i<=16;i++){const x=lerp(x0,x1,i/16);P.push([x,rim(d,x)]);}P.push([x1,d.bot],[x0,d.bot]);return P;};
function melt(d,x0,x1,term,n,size,op){for(let k=0;k<n;k++){const x=d.cx+d.r*(term+R(-.08,.08));SB([[x+R(-5,5),rim(d,x)+8],[x,(rim(d,x)+d.bot)/2+R(-15,15)],[x+R(-5,5),d.bot-6]],size*R(.85,1.15),op);}}
// ---- LANTERN TOWER behind the right tower (painted first: it is behind) ----
const LT={cx:1878,r:20};
patch(RECT(1858,600,1898,700),7,130,(x,y)=>zone((x-LT.cx)/LT.r,.4),VERT,.15,2.6);
for(let k=0;k<2;k++)SB([[1886,606],[1886,694]],12,.45);
// ---- LOWER DRUM wall ----
const ldW=wallPoly(LD,1300,1680);
patch(ldW,12,1500,(x,y)=>zone((x-LD.cx)/LD.r,.42),VERT,.2,2.6);
for(let i=0;i<16;i++){const u=R(-.95,.95);const a0=Math.acos(u);const z=zone(u,.42);earc(LD.cx,LD.cy+7,LD.r-4,LD.ry,a0,a0+R(.1,.22),z.c,R(8,13),Object.assign({},z.o));}
// warm reflected light low on the shadow side (plateau and cloud light), laid wet before the melts
for(let i=0;i<70;i++){const u=R(.55,.97),x=LD.cx+u*LD.r;const y=R(700,760);S(x,y,R(16,34),Math.PI/2+R(-.25,.25),M([['titanium_white',1.7],['cobalt_violet',.45],['naples_yellow',.5],['yellow_ochre',.1],['ultramarine',.22]],.2),R(7,11),{load:.9,thin:.45,edge:.35,taper:[.15,.3]});}
for(const uu of [-.2,.05,.25])melt(LD,0,0,uu,3,34,.35);
melt(LD,0,0,.34,4,48,.45);melt(LD,0,0,.42,6,44,.5);melt(LD,0,0,.52,4,40,.5);melt(LD,0,0,.64,3,30,.4);
for(let k=0;k<4;k++)SB([[LD.cx+LD.r*.5+R(-10,10),R(700,730)],[LD.cx+LD.r*.95,R(735,760)]],R(20,28),.35);
for(let k=0;k<3;k++){const x=LD.cx+LD.r*(.88+R(-.04,.04));SB([[x,rim(LD,x)+10],[x+R(-4,4),LD.bot-8]],R(18,24),.4);}
for(let k=0;k<2;k++){const x=LD.cx-LD.r*(.88+R(-.04,.04));SB([[x,rim(LD,x)+10],[x+R(-4,4),LD.bot-8]],R(16,22),.35);}
// ---- TERRACE ----
const TER=(()=>{const P=[];for(let i=0;i<=20;i++){const x=lerp(1300,1680,i/20);P.push([x,rim(LD,x)]);}
 const back=x=>{const u=clamp((x-LD.cx)/LD.r,-1,1);return LD.cy-LD.ry*Math.sqrt(1-u*u);};
 for(let i=0;i<=4;i++){const x=lerp(1680,1612,i/4);P.push([x,back(x)]);}P.push([1612,UD.bot],[1368,UD.bot]);
 for(let i=0;i<=4;i++){const x=lerp(1368,1300,i/4);P.push([x,back(x)]);}return P;})();
const TER_L=()=>M([['titanium_white',3],['naples_yellow',.55],['cobalt_violet',.14],['yellow_ochre',.06]],.2);
const TER_S=()=>M([['titanium_white',1.5],['ultramarine',.55],['cobalt_violet',.55],['naples_yellow',.1]],.2);
const terShadow=[[1545,598],[1612,602],[1680,608],[1676,626],[1640,636],[1585,634],[1548,624]];
patch(TER,10,560,(x,y)=>inPoly(terShadow,x,y)?{c:TER_S(),o:{load:.8,thin:.55}}:(x>1600&&y>615?{c:CR_H(),o:{load:1,thin:.4}}:{c:TER_L(),o:{load:1.2,thin:.32,clean:true}}),(x,y)=>(x<LD.cx?-.16:.16),.18,2.8);
for(let k=0;k<3;k++)SB([[1600+R(-8,8),633],[1660,628+R(-4,4)]],R(14,20),.4);
// ---- UPPER DRUM ----
const udW=wallPoly(UD,1370,1610);
patch(udW,9,540,(x,y)=>zone((x-UD.cx)/UD.r,.4),VERT,.18,2.6);
melt(UD,0,0,.4,4,30,.5);melt(UD,0,0,.1,2,24,.3);melt(UD,0,0,.6,2,20,.4);
for(let k=0;k<2;k++){const x=UD.cx+UD.r*(.87+R(-.04,.04));SB([[x,rim(UD,x)+8],[x+R(-3,3),UD.bot-6]],R(12,16),.4);}
// ---- TOWERS ----
function tower(cx,top,bot){const r=52;const poly=RECT(cx-r,top,cx+r,bot);
 patch(poly,9,Math.round(3.5*(bot-top)),(x,y)=>zone((x-cx)/r,.4),VERT,.16,2.8);
 for(let k=0;k<4;k++){const x=cx+r*(.4+R(-.1,.1));SB([[x+R(-3,3),top+6],[x,(top+bot)/2+R(-20,20)],[x+R(-3,3),bot-4]],R(20,26),.5);}
 for(let k=0;k<2;k++){const x=cx+r*(.1+R(-.1,.1));SB([[x+R(-3,3),top+6],[x+R(-3,3),bot-4]],R(16,20),.3);}
 for(let k=0;k<2;k++){const x=cx+r*(.88+R(-.04,.04));SB([[x,top+8],[x+R(-2,2),bot-6]],R(10,14),.4);}
 for(let k=0;k<2;k++){const x=cx-r*(.88+R(-.04,.04));SB([[x,top+8],[x+R(-2,2),bot-6]],R(9,12),.3);}}
tower(1232,560,765);
tower(1772,600,772);
// ---- LOW BUILDINGS ----
function box(x0,y0,x1,y1,xs,L,C,H,dens){const front=RECT(x0,y0,xs,y1),end=RECT(xs,y0,x1,y1);
 patch(end,10,Math.round(40*dens),(x,y)=>({c:C(),o:{load:.8,thin:.55}}),VERT,.15,2.2);
 patch(front,11,Math.round(150*dens),(x,y)=>(y<y0+12?{c:H(),o:{load:1.1,thin:.35}}:{c:L(),o:{load:1.2,thin:.32,clean:true}}),()=>0,.12,2.8);
 for(let k=0;k<2;k++)SB([[xs+R(-4,4),y0+6],[xs+R(-4,4),y1-6]],R(12,16),.35);}
box(960,700,1160,770,1118,CR_L,CR_C,CR_H,1);
// right pavilion: duller stone, lower contrast, its right half sinking into shadow
box(1880,690,2050,760,1985,GR_L,GR_C,()=>M([['titanium_white',2.4],['raw_umber',.25],['naples_yellow',.45],['cobalt_violet',.15]],.2),.9);
for(let k=0;k<3;k++)SB([[1985+R(-10,10),696],[1985+R(-10,10),754]],R(22,30),.45);
// small dome on the left pavilion: a half sphere, lit upper left, in blue-green like the roofs
const DM={cx:1062,cy:702,r:40};
const dpoly=[];for(let i=0;i<=16;i++){const a=Math.PI+Math.PI*i/16;dpoly.push([DM.cx+Math.cos(a)*DM.r,DM.cy+Math.sin(a)*DM.r*.9]);}
patch(dpoly,7,120,(x,y)=>{const u=(x-DM.cx)/DM.r,v=(y-DM.cy)/DM.r;const l=-(u*.62+v*.78)+R(-.1,.1);
 return l>.45?{c:M([['titanium_white',2.6],['cerulean',.9],['viridian',.25],['naples_yellow',.12]],.2),o:{load:1.3,thin:.3,clean:true}}:(l>0?{c:M([['titanium_white',1.5],['cerulean',.8],['cobalt_blue',.5],['viridian',.2]],.2),o:{load:1.1,thin:.4}}:{c:M([['ultramarine',1.2],['cobalt_blue',.3],['titanium_white',.5]],.2),o:{load:.8,thin:.55}});},
 (x,y)=>Math.atan2(y-DM.cy,x-DM.cx)+Math.PI/2,.25,2.4);
for(let k=0;k<3;k++)SB([[DM.cx+R(0,12),DM.cy-DM.r*.85],[DM.cx+DM.r*.55+R(-4,4),DM.cy-DM.r*.5],[DM.cx+DM.r*.9,DM.cy-4]],R(12,16),.5);
p.dry();
