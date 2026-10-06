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
// 29d skirt refine: the shaded stage front gets its second layer: grain and scuffs on the boards, a few boards warmer or cooler, the gate's cold light across the upper middle, lit caps and edges on the posts, screw heads, and on the steps worn nosings, nail heads, lit tread patches, shadow under the nosing.
p.wipe();p.dry();
const yb=x=>1362-40*x/2400,SY=1130;
const inSt=(x,y,m)=>x>430-(m||0)&&x<1115+(m||0)&&y>1183;
const POSTS=[133,353,780,993,1196,1400,1600,1797,1987,2184,2373];
// 1. grain and scuffs on the skirt boards: long thin dry strokes along the boards, warm and cool, lost in the dark
for(let i=0;i<380;i++){const x=R(-10,2410),y=R(SY+8,yb(x)-14);const l=R(24,110);if(inSt(x,y,8)||inSt(x,y+l,8))continue;const lt=R(0,1)<.4;
 p.stroke({points:[[x,y,.6],[x+R(-1.2,1.2),y+l*.5,.8],[x+R(-2,2),y+l,.5]],color:lt?M([['burnt_sienna',1],['titanium_white',.5],['alizarin_crimson',.12]],.3):M([['ivory_black',1],['dioxazine_purple',.25],['van_dyke_brown',.5]],.3),brush:'flat',size:R(1.6,4.5),angle:0,load:R(.3,.6),thin:.3,opacity:R(.15,.38),taper:[.3,.4],scumble:lt});}
// 2. some boards a little warmer or cooler (glaze), and a few knots with a ring
for(let i=0;i<70;i++){const x=R(0,2400);const w=R(30,44);const y0=R(SY+20,SY+120),y1=Math.min(yb(x)-8,y0+R(60,200));const k=R(0,1);if(inSt(x,y0,30)||inSt(x,y1,30))continue;
 p.stroke({points:[[x,y0,.7],[x+R(-1,1),(y0+y1)/2,.9],[x,y1,.7]],color:k<.4?M([['burnt_sienna',1],['alizarin_crimson',.2],['raw_umber',.3]],.3):k<.75?M([['ultramarine',1],['dioxazine_purple',.5],['burnt_umber',.5]],.3):M([['yellow_ochre',1],['burnt_sienna',.6]],.3),brush:'flat',size:w*.9,angle:0,load:.8,thin:.55,opacity:R(.1,.22),taper:[.1,.3],edge:.3});}
for(let i=0;i<14;i++){const x=R(20,2380),y=R(SY+30,yb(x)-40);if(inSt(x,y,10))continue;p.stroke({points:[[x,y-5],[x,y+5]],color:M([['ivory_black',1],['van_dyke_brown',.6]],.2),brush:'filbert',size:R(5,8),load:1,thin:.3,opacity:.7,taper:.3});p.stroke({points:[[x-4,y-6],[x,y-9],[x+4,y-6]],color:M([['burnt_sienna',1],['titanium_white',.5]],.3),brush:'round',size:1.6,load:.8,thin:.3,opacity:.3,taper:.3});}
// 3. the gate's cold light on the shaded wood: transparent violet veils on the upper middle, strongest under the vortex
for(let i=0;i<46;i++){const x=R(500,1900);const k=clamp(1-Math.abs(x-1200)/750,0,1);const y=R(SY+6,SY+50);p.stroke({points:[[x,y],[x+R(90,200),y+R(-2,2)]],color:M([['dioxazine_purple',1],['ultramarine',.8],['titanium_white',.8],['quinacridone_rose',.15]],.3),brush:'flat',size:R(26,60),angle:Math.PI/2,load:.7,thin:.55,opacity:R(.04,.1)*(.4+k),taper:[.3,.4],edge:.6});}
// 4. posts: lit left edge, pale cap highlight at the top, shadow beside them, screw heads
for(const px of POSTS){const b=(px>430&&px<1115)?1188:yb(px)-4;
 p.stroke({points:[[px-9,SY+6],[px-9.5,(SY+b)/2],[px-9,b-10]],color:M([['burnt_sienna',1],['titanium_white',.9],['yellow_ochre',.2]],.3),brush:'flat',size:3,angle:0,load:1,thin:.3,opacity:R(.35,.6),taper:[.1,.4]});
 p.stroke({points:[[px-9,SY-1],[px+9,SY-1]],color:M([['titanium_white',1],['burnt_sienna',.6],['yellow_ochre',.2]],.3),brush:'flat',size:3.2,angle:Math.PI/2,load:1,thin:.3,opacity:.55,taper:[.1,.1]});
 p.stroke({points:[[px+11,SY+4],[px+12,(SY+b)/2],[px+11,b-10]],color:M([['ivory_black',1],['dioxazine_purple',.2]],.2),brush:'flat',size:5,angle:0,load:.9,thin:.4,opacity:.4,taper:[.1,.4],edge:.5});
 for(const f of [.25,.6]){const y=SY+(b-SY)*f+R(-6,6);p.dab({x:px+R(-3,3),y,color:M([['burnt_sienna',1],['titanium_white',.7]],.3),size:3,brush:'round',load:.8,pressure:.5,opacity:.55});}}
// 5. steps, repainted as two real wooden steps: lit treads, deep nosing shadow, one broad riser each in warm brown with a floor bounce at the foot, faint grain, worn nosing, cast shadows
p.dry();
const RIS=(y,f)=>M([['burnt_umber',1],['burnt_sienna',.55+f*.35],['titanium_white',.28+f*.25],['quinacridone_rose',.1],['ultramarine',.05*(1-f)]],.12);
const step=(x0,x1,yt0,yt1,yr1,tag)=>{
 // tread: lit top, three rows, warm pink-brown with lilac from the gate on the right
 for(let y=yt0;y<yt1+1;y+=4.5){for(const [a,b,k] of [[x0,(x0+x1)/2,0],[(x0+x1)/2-30,x1,1]]){
  p.stroke({points:[[a,y+2.5],[(a+b)/2,y+2.5+R(-.3,.3)],[b,y+2.5]],color:M([['burnt_sienna',1],['titanium_white',.95+k*.15-(y-yt0)/(yt1-yt0)*.2],['yellow_ochre',.2*(1-k)],['quinacridone_rose',.14],['dioxazine_purple',k*.16]],.1),brush:'flat',size:6.5,angle:Math.PI/2,load:1.1,thin:.15,taper:[.02,.02],edge:.03,stir:.1});}}
 // riser: rows of broad horizontal strokes from the shadowed top down to the bounce at the foot
 const rh=yr1-(yt1+2);
 for(let y=yt1+2;y<yr1;y+=7){const f=(y-yt1)/rh;const fe=clamp((f-.7)/.3,0,1);
  for(const [a,b] of [[x0,x1]]){
   p.stroke({points:[[a,y+4],[(a+b)/2,y+4+R(-.3,.3)],[b,y+4]],color:RIS(y,Math.min(1,f*.7+fe*.5)),brush:'flat',size:9,angle:Math.PI/2,load:1.1,thin:.12,taper:[.02,.02],edge:.03,stir:.1});}}
 // smooth the stack of rows with wet soft strokes along the riser
 for(const fy of [.2,.4,.6,.8]){const y=yt1+rh*fy;BL([[x0+6,y,.8],[(x0+x1)/2,y,.8],[x1-6,y,.8]],clamp(rh*.28,14,34),.6);}
 p.dry();
 // nosing: a lit rounded edge in pieces, a dark line under it, the nosing's own shadow falling on the riser
 p.stroke({points:[[x0,yt1+1.5],[(x0+x1)/2,yt1+1.5],[x1,yt1+1.5]],color:M([['titanium_white',1],['quinacridone_rose',.2],['yellow_ochre',.2]],.2),brush:'flat',size:3.2,angle:Math.PI/2,load:1.1,thin:.2,opacity:.8,taper:[.02,.02]});
 p.stroke({points:[[x0,yt1+5],[(x0+x1)/2,yt1+5],[x1,yt1+5]],color:M([['ivory_black',1],['van_dyke_brown',.6],['dioxazine_purple',.3]],.2),brush:'flat',size:5,angle:Math.PI/2,load:1,thin:.3,opacity:.55,taper:[.02,.02]});
 p.stroke({points:[[x0,yt1+14],[(x0+x1)/2,yt1+15],[x1,yt1+14]],color:M([['dioxazine_purple',1],['van_dyke_brown',.9],['ultramarine',.2]],.2),brush:'flat',size:14,angle:Math.PI/2,load:.7,thin:.6,opacity:.28,taper:[.02,.02],edge:.7});
 for(let x=x0+20;x<x1-30;x+=R(70,170)){p.stroke({points:[[x,yt1+1.5],[x+R(20,60),yt1+1.5]],color:M([['titanium_white',1],['yellow_ochre',.2]],.2),brush:'flat',size:R(1.4,2.4),angle:Math.PI/2,load:1,thin:.2,opacity:R(.3,.6),taper:[.2,.3]});}
 // tread seams (short, running front to back) and grain
 for(let x=x0+R(40,90);x<x1-20;x+=R(90,170)){p.stroke({points:[[x,yt0+1],[x+R(-.8,.8),yt1]],color:M([['van_dyke_brown',1],['ivory_black',.3]],.2),brush:'round',size:1.5,load:.9,thin:.3,opacity:.6,taper:[.1,.2]});}
 for(let i=0;i<7;i++){const x=R(x0+4,x1-120),y=R(yt0+3,yt1-3);p.stroke({points:[[x,y],[x+R(60,200),y+R(-.5,.5)]],color:M([['burnt_sienna',1],['titanium_white',1.1],['yellow_ochre',.2]],.25),brush:'flat',size:R(2,3.5),angle:Math.PI/2,load:.6,thin:.35,opacity:R(.2,.4),taper:[.2,.4],scumble:true});}
 // riser grain: a few long faint horizontal streaks and a darker knot or two, no stacked bars
 for(let i=0;i<10;i++){const x=R(x0+6,x1-200),y=R(yt1+16,yr1-12);const lt=R(0,1)<.4;p.stroke({points:[[x,y,.6],[x+R(80,260),y+R(-1,1),.7]],color:lt?M([['burnt_sienna',1],['titanium_white',.8],['yellow_ochre',.1]],.3):M([['van_dyke_brown',1],['ivory_black',.4]],.3),brush:'flat',size:R(2,4),angle:Math.PI/2,load:.5,thin:.4,opacity:R(.14,.26),taper:[.2,.4],scumble:true});}
 for(let i=0;i<2;i++){const x=R(x0+60,x1-60),y=R(yt1+20,yr1-20);p.stroke({points:[[x-7,y],[x+7,y+.5]],color:M([['van_dyke_brown',1],['ivory_black',.5]],.2),brush:'filbert',size:6,angle:Math.PI/2,load:1,thin:.3,opacity:.5,taper:.3});}
 // gate light: a veil of cold violet on the right half of the tread and riser
 p.stroke({points:[[(x0+x1)/2,(yt0+yt1)/2],[x1-30,(yt0+yt1)/2]],color:M([['dioxazine_purple',1],['ultramarine',.6],['titanium_white',1.3]],.3),brush:'flat',size:yt1-yt0,angle:Math.PI/2,load:.6,thin:.55,opacity:.12,taper:[.2,.2],edge:.5});
 // floor bounce: warm light on the lowest board of the riser; contact shadow under the step
 p.stroke({points:[[x0+10,yr1-6],[(x0+x1)/2,yr1-6],[x1-10,yr1-6]],color:M([['burnt_sienna',1],['yellow_ochre',.3],['titanium_white',.7]],.2),brush:'flat',size:9,angle:Math.PI/2,load:.8,thin:.5,opacity:.25,taper:[.1,.1],edge:.5});
 p.stroke({points:[[x0,yr1+3],[(x0+x1)/2,yr1+3],[x1+40,yr1+4]],color:M([['ivory_black',1],['dioxazine_purple',.6],['van_dyke_brown',.5]],.2),brush:'flat',size:9,angle:Math.PI/2,load:1,thin:.35,opacity:.6,taper:[.05,.1],edge:.3});
};
step(564,1104,1192,1208,1311,'u');
step(444,1107,1309,1325,1447,'l');
// cast shadows: the lower step throws a cool wedge onto the paving to the right and in front; the upper step shades the back of the lower tread; the hero's shadow falls across the upper riser
for(let k=0;k<7;k++){const j=R(-1,1);p.stroke({points:[[1090,1448+j*3],[1190,1458+j*3],[1300,1470+j*3]],color:M([['dioxazine_purple',1],['ultramarine',.8],['quinacridone_rose',.3],['burnt_umber',.2]],.25),brush:'flat',size:R(26,40),angle:Math.PI/2,load:.8,thin:.6,opacity:R(.08,.14),taper:[.1,.6],edge:.7});}
for(let k=0;k<5;k++){p.stroke({points:[[444,1456+k*4],[780,1460+k*4],[1100,1456+k*4]],color:M([['dioxazine_purple',1],['ultramarine',.7],['burnt_umber',.4]],.25),brush:'flat',size:R(14,22),angle:Math.PI/2,load:.8,thin:.6,opacity:R(.1,.16),taper:[.1,.2],edge:.7});}
p.stroke({points:[[460,1314],[780,1316],[1100,1314]],color:M([['ivory_black',1],['dioxazine_purple',.6],['van_dyke_brown',.5]],.2),brush:'flat',size:9,angle:Math.PI/2,load:.9,thin:.4,opacity:.4,taper:[.1,.1],edge:.5});
for(let k=0;k<6;k++){const x=R(620,780),y=R(1214,1290);p.stroke({points:[[x,y],[x+R(70,130),y+R(-2,2)]],color:M([['dioxazine_purple',1],['ultramarine',.7],['burnt_umber',.5]],.25),brush:'flat',size:R(20,34),angle:Math.PI/2,load:.7,thin:.6,opacity:R(.06,.1),taper:[.2,.4],edge:.6});}
p.dry();
