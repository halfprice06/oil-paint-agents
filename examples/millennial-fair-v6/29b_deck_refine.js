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
// 29b deck, final: the stage floor repainted as a few long boards in clean perspective, every board running from the back edge to the fascia toward the vanishing point (1370,830). Each board is a lit top plane with its own warm or cool tone, a bevel catching sun on its left edge, a dark gap on its right, a couple of butt joints, a faint grain and rare knots. Light is built into the colour: warm sun stripes, long lilac cast shadows of the left pod and the console, the gate's cold light pooling at the middle of the back edge.
p.wipe();p.dry();const pk=a=>a[Math.floor(R(0,a.length))%a.length];
const F2=o=>{const P=o.points,a=P[0],b=P[P.length-1];const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,th=Math.atan2(dy,dx);return p.stroke(Object.assign({},o,{brush:'flat',size:Math.max(1.2,o.size*Math.abs(dy)/L),angle:th-Math.PI/2}));};
const VPX=1370,VPY=830,YF=1097,YB=978,WF=60;
const sc=y=>(y-VPY)/(YF-VPY);
const xAt=(xf,y)=>VPX+(xf-VPX)*sc(y);
const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// shade 0..1 (cast shadow), cool 0..1 (gate light)
const shade=(x,y)=>{const d=y-YB;
 const s1=x-4.2*d, b1=sm(150,190,s1)*(1-sm(430,480,s1));          // long shadow of the left pod, leaning to the right
 const s2=x-2.4*d, b2=sm(1960,2010,s2)*(1-sm(2200,2260,s2));       // shadow of the console and the right pod
 const s3=x-3.2*d, b3=sm(560,590,s3)*(1-sm(640,680,s3))*.55;       // thin shadow of the tower
 return Math.max(b1,b2,b3);};
const cool=(x,y)=>Math.exp(-Math.pow((x-1190)/430,2))*clamp(1.25-(y-YB)/150,.12,1);
const add=(o,parts,k)=>{for(const [n,w] of parts)o[n]=(o[n]||0)+w*k;};
const LITS=[[['burnt_sienna',1],['raw_umber',.55],['titanium_white',.8],['quinacridone_rose',.24],['yellow_ochre',.06]],
 [['burnt_sienna',1],['raw_umber',.7],['titanium_white',.6],['quinacridone_rose',.1],['yellow_ochre',.2]],
 [['venetian_red',1],['raw_umber',.6],['titanium_white',.75],['yellow_ochre',.1]],
 [['burnt_sienna',1],['raw_umber',.6],['titanium_white',.95],['quinacridone_rose',.3]]];
const SHD=[['burnt_umber',1],['dioxazine_purple',.3],['ultramarine',.14],['titanium_white',.4],['quinacridone_rose',.14]];
const COOL=[['titanium_white',.7],['ultramarine',.2],['dioxazine_purple',.24],['quinacridone_rose',.1]];
const wood=(lit,x,y,tw)=>{const sh=shade(x,y),c=cool(x,y);const o={};add(o,lit,(1-sh));add(o,SHD,sh);add(o,COOL,c*(1-sh*.6)*.9);
 return Object.keys(o).map(n=>[n,o[n]*(1+R(-.012,.012))]).filter(q=>q[1]>1e-3);};
const boards=[];for(let k=-48;k<=96;k++)boards.push(k);
const RS=4.2;
const B=[];
for(const k of boards){const xf=k*WF+R(-1.5,1.5);const xa=xAt(xf,YB),xb=xAt(xf,YF);if(Math.max(xa,xb)<-70||Math.min(xa,xb)>2470)continue;
 const lit=pk(LITS).map(q=>[q[0],q[1]*(1+R(-.1,.1))]);const dark=R(0,1)<.12,worn=R(0,1)<.14,tone=R(-.08,.1);
 const joints=[];let yj=YB+R(30,80);while(yj<YF-10){joints.push(yj);yj+=R(50,100);}
 B.push({xf,lit,dark,worn,tone,joints});}
// rows laid back to front: every board gets one broad horizontal pass per row, so the plank is a smooth lit plane
for(let y=YB-2;y<YF+1;y+=RS){const ym=y+RS/2;const s=sc(ym);const hh=RS*1.7;
 for(const bd of B){const xl=xAt(bd.xf-WF*.47,ym),xr=xAt(bd.xf+WF*.47,ym);if(xr<-20||xl>2420)continue;
  const xm=(xl+xr)/2;let col=wood(bd.lit,xm,ym);if(bd.dark)col=col.concat([['van_dyke_brown',.4]]);if(bd.worn)col=col.concat([['titanium_white',.28],['yellow_ochre',.14]]);if(bd.tone>0)col=col.concat([['titanium_white',bd.tone*3]]);
  const w=xr-xl;
  p.stroke({points:[[xl,ym,.9],[xm,ym+R(-.3,.3),.95],[xr,ym,.9]],color:col,brush:'flat',size:hh,angle:Math.PI/2,load:1.1,thin:.1,taper:0,edge:.02,stir:.08});}}
for(const bd of B){const ym=(YB+YF)/2;for(const o of [-.2,.2]){const g=(y)=>xAt(bd.xf+o*WF,y);const pts=[[g(YB+2),YB+2,.8],[g(YB+40),YB+40,.8],[g(YB+80),YB+80,.8],[g(YF-2),YF-2,.8]];if(pts[0][0]<-60||pts[0][0]>2460)continue;p.stroke({points:pts,brush:'soft',size:clamp(WF*.5*sc(YB+60),7,26),opacity:.55,color:'titanium_white'});}}
p.dry();
// along every board: the dark gap on its right, the sunlit bevel on its left, grain, butt joints, knots
for(const bd of B){const ya=YB,yb=YF+1;const gx=(o,y)=>xAt(bd.xf+o,y);const ym=(ya+yb)/2;
 const sh=shade(gx(0,ym),ym);
 p.stroke({points:[[gx(WF*.5,ya),ya],[gx(WF*.5,ym),ym],[gx(WF*.5,yb),yb]],color:M([['van_dyke_brown',1],['ivory_black',.55],['dioxazine_purple',.25]],.2),brush:'round',size:1.9,load:1,thin:.2,opacity:.6,taper:[.02,.02]});
 p.stroke({points:[[gx(-WF*.47+1,ya),ya],[gx(-WF*.47+1,ym),ym],[gx(-WF*.47+1,yb),yb]],color:M([['burnt_sienna',1],['titanium_white',1.2],['yellow_ochre',.35],['quinacridone_rose',.1]],.25),brush:'round',size:1.8,load:1,thin:.2,opacity:.5*(1-sh*.85),taper:[.1,.1]});
 for(let g=0;g<2;g++){const off=R(-.3,.3)*WF,t0=R(0,.3),t1=R(.55,1);const y0=lerp(ya,yb,t0),y1=lerp(ya,yb,t1),y2=(y0+y1)/2;const lt=R(0,1)<.5;
  p.stroke({points:[[gx(off,y0),y0,.6],[gx(off,y2),y2,.8],[gx(off,y1),y1,.6]],color:lt?M([['burnt_sienna',1],['titanium_white',1],['yellow_ochre',.2]],.3):M([['burnt_umber',1],['dioxazine_purple',.3]],.3),brush:'round',size:R(1.4,2.4),load:.6,thin:.35,opacity:(lt?.3:.25)*(1-sh*.3),taper:[.2,.4]});}
 for(const yj of bd.joints){const xl=gx(-WF*.47,yj),xr=gx(WF*.47,yj);
  p.stroke({points:[[xl,yj],[(xl+xr)/2,yj+.3],[xr,yj]],color:M([['van_dyke_brown',1],['ivory_black',.5],['dioxazine_purple',.2]],.2),brush:'round',size:clamp(2*sc(yj),1.3,2),load:1,thin:.25,opacity:.55,taper:.05});
  p.stroke({points:[[xl+1,yj+2.2],[xr-1,yj+2.2]],color:M([['burnt_sienna',1],['titanium_white',1.2],['yellow_ochre',.3]],.25),brush:'round',size:1.4,load:.9,thin:.25,opacity:.4*(1-sh*.8),taper:.2});}
 if(R(0,1)<.09){const yk=R(YB+20,YF-20);const xk=gx(R(-.25,.25)*WF,yk);p.stroke({points:[[xk-WF*sc(yk)*.12,yk],[xk+WF*sc(yk)*.12,yk+.5]],color:M([['van_dyke_brown',1],['ivory_black',.4]],.2),brush:'filbert',size:WF*sc(yk)*.1,angle:Math.PI/2,load:.8,thin:.4,opacity:.3,taper:.3});}}
p.dry();
// glazes: sun stripes laid across the lit boards (warm, thin), the gate's cold pool at the back-middle, deep lilac in the shadow bands, a pale lip where the deck meets the plaza
for(let i=0;i<46;i++){const xf=R(-1200,3300);const ya=YB+R(0,30),yb=ya+R(60,118);const xm=xAt(xf,(ya+yb)/2);if(shade(xm,(ya+yb)/2)>.3)continue;
 F2({points:[[xAt(xf,ya),ya],[xAt(xf,(ya+yb)/2),(ya+yb)/2],[xAt(xf,yb),yb]],color:M([['yellow_ochre',1],['titanium_white',1.2],['burnt_sienna',.6],['cadmium_orange',.1]],.25),brush:'flat',size:WF*sc((ya+yb)/2)*R(.35,.7),load:.6,thin:.5,opacity:R(.12,.24),taper:[.2,.4],scumble:true});}
for(let i=0;i<40;i++){const x=R(760,1640);const y=YB+R(0,70);const k=cool(x,y);if(R(0,1)>k*1.3)continue;
 p.stroke({points:[[x-R(40,90),y],[x,y+R(-2,2)],[x+R(40,90),y]],color:M([['titanium_white',1.4],['dioxazine_purple',.5],['ultramarine',.3],['quinacridone_rose',.12]],.25),brush:'flat',size:R(10,20),angle:Math.PI/2,load:.55,thin:.55,opacity:R(.08,.16)*k,taper:[.2,.4],edge:.4});}
for(let i=0;i<34;i++){const d=R(0,119),y=YB+d;const s=R(150,430);const x=s+4.2*d;p.stroke({points:[[x-30,y],[x+40,y],[x+110,y]],color:M([['dioxazine_purple',1],['ultramarine',.7],['burnt_umber',.35]],.25),brush:'flat',size:R(10,18),angle:Math.PI/2,load:.6,thin:.6,opacity:R(.06,.12),taper:[.2,.4],edge:.5});}
p.stroke({points:[[0,YB+.5],[1200,YB+1],[2400,YB+.5]],color:M([['titanium_white',1],['burnt_sienna',.6],['yellow_ochre',.4]],.2),brush:'flat',size:2.4,angle:Math.PI/2,load:1,thin:.25,opacity:.55,taper:0});
p.dry();
