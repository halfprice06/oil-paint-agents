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

// ---- 10_sky_gradient.body.js ----
// 10_sky_gradient: the whole sky laid wet as one luminous gradient, lavender-blue at the top through
// pale violet to warm gold at the horizon; the sun glow at upper left as a pale pool with a pink-violet halo;
// calmer, darker sky around the spire.
p.wipe();
const W=p.width;
const mixW=(a,b,u)=>{const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
const KEYS=[
 [0.00,[['ultramarine',1.1],['cobalt_blue',.5],['titanium_white',2.4],['alizarin_crimson',.12],['raw_umber',.05]]],
 [0.22,[['ultramarine',.6],['cobalt_blue',.4],['cobalt_violet',.25],['titanium_white',2.9],['alizarin_crimson',.08]]],
 [0.45,[['cobalt_violet',.35],['cobalt_blue',.2],['titanium_white',3.3],['naples_yellow',.28],['quinacridone_rose',.05]]],
 [0.66,[['naples_yellow',.7],['titanium_white',3.2],['cobalt_violet',.16],['cadmium_orange',.06],['quinacridone_rose',.05]]],
 [0.86,[['naples_yellow',1],['titanium_white',3],['cadmium_orange',.1],['cobalt_violet',.07],['yellow_ochre',.08]]],
 [1.00,[['naples_yellow',.8],['titanium_white',3.2],['quinacridone_rose',.1],['cobalt_violet',.1],['cadmium_orange',.05]]]];
function skyT(t){t=clamp(t,0,1);for(let i=0;i<KEYS.length-1;i++){if(t<=KEYS[i+1][0]){const u=(t-KEYS[i][0])/(KEYS[i+1][0]-KEYS[i][0]);return mixW(KEYS[i][1],KEYS[i+1][1],u);}}return KEYS[KEYS.length-1][1];}
const SUNX=260,SUNY=420;
const sunF=(x,y)=>{const dx=(x-SUNX)/720,dy=(y-SUNY)/440;const d=Math.sqrt(dx*dx+dy*dy);return clamp(Math.exp(-d*d*1.7)-0.05,0,1);};
const spireF=(x,y)=>{const dx=(x-1500)/560,dy=(y-330)/330;const d=dx*dx+dy*dy;return d>1?0:(1-d)*(1-d);};
const sm=(a,b,v)=>{const u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u);};
const GLOW=[['titanium_white',4],['naples_yellow',.5],['cadmium_orange',.03]];
const HALO=[['titanium_white',3.2],['cobalt_violet',.22],['naples_yellow',.35],['quinacridone_rose',.07]];
function skyCol(x,y,j){const t=y/1000;let m=skyT(t+R(-.02,.02));const s=sunF(x,y);
 if(s>0.02){m=mixW(m,HALO,sm(0,.55,s)*.8);m=mixW(m,GLOW,sm(.35,1,s)*.9);}
 const c=spireF(x,y);if(c>0.01){m=mixW(m,[['ultramarine',.55],['cobalt_violet',.3],['titanium_white',1.6],['raw_umber',.05]],c*.6);}
 return M(m,j===undefined?.18:j);}
// direction field: slow drift across the canvas, flatter near the horizon, a slight lift toward the upper right
function skyAng(x,y){const t=y/1000;const drift=Math.sin(x/700+y/900)*.22+Math.sin(x/260-y/400)*.08;
 const base=lerp(-.12,0,t)+drift*(1-t*.6);return base+R(-.16,.16);}
// 1. lay in wet, big brushes, long overlapping strokes; lower warm strokes sit on top of upper cool ones
{const n=1400;const ys=[];for(let i=0;i<n;i++)ys.push(R(-60,1040));ys.sort((a,b)=>a-b);
 for(const y of ys){const x=R(-60,W+60);const t=y/1000;const s=sunF(x,y);
  const sz=lerp(104,72,t)*R(.78,1.22);const len=sz*R(2.8,4.6);const a=skyAng(x,y);
  const thin=lerp(.58,.4,t)*(1-s*.4);const load=lerp(.95,1.1,t)+s*.3;
  p.stroke({points:seg(x,y,len,a,R(-.08,.08)*len,4),color:skyCol(x,y),brush:R(0,1)<.6?'flat':'filbert',size:sz,load:load,thin:thin,edge:R(.25,.55),taper:[R(.1,.3),R(.1,.3)],stir:(x>1200&&y<280)?R(.8,.95):R(.5,.75),clean:s>.5});}}
// upper right: two or three broad, soft, slightly darker drifts whose edges melt, so the top stays calm
for(const [x0,y0,x1,y1,sz] of [[1250,60,2450,120,120],[1500,170,2450,210,110],[1150,-10,1900,20,100]]){
 for(let k=0;k<3;k++){const u0=R(-.05,.2),u1=R(.8,1.05);const pts=[[lerp(x0,x1,u0),lerp(y0,y1,u0)+R(-20,20),.7],[lerp(x0,x1,(u0+u1)/2),lerp(y0,y1,(u0+u1)/2)+R(-30,30),.9],[lerp(x0,x1,u1),lerp(y0,y1,u1)+R(-20,20),.7]];
  p.stroke({points:pts,color:M([['ultramarine',.85],['cobalt_blue',.4],['cobalt_violet',.22],['titanium_white',2.8],['alizarin_crimson',.08]],.1),brush:'flat',size:sz*R(.85,1.1),load:1,thin:.55,edge:.8,taper:[.3,.3],stir:.9});}}
for(let i=0;i<40;i++){const x=R(1150,2450),y=R(-30,270);SB(seg(x,y,R(300,520),R(-.12,.12),R(-.03,.03)*400,3),88,R(.45,.6));}
// 1. cross the rows: long diagonal and gently curved strokes of the same mixes through the middle sky and the warm band
for(let i=0;i<70;i++){const band=R(0,1)<.55;const y=band?R(380,680):R(780,960);const x=R(-60,W+60);if(spireF(x,y)>.3&&R(0,1)<.6)continue;
 const nearP=x>1500&&y<700;const a=(nearP?R(.03,.1):R(.18,.45))*(R(0,1)<.5?1:-1);const len=nearP?R(500,800):R(380,700);const sz=R(60,95);
 p.stroke({points:seg(x,y,len,a,R(.08,.2)*len*(R(0,1)<.5?1:-1),5),color:skyCol(x,y,.15),brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.95,1.15),thin:R(.4,.5),edge:R(.4,.6),taper:[R(.25,.4),R(.25,.4)],stir:R(.55,.75),clean:sunF(x,y)>.5});}
// 2. the glow itself: thick pale buttery paint, clean brush, broad soft-edged sweeps around the sun centre
for(let i=0;i<70;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*300;const x=SUNX+Math.cos(a)*r*1.55,y=SUNY+Math.sin(a)*r;const s=sunF(x,y);
 const sz=R(70,110),len=sz*R(2.5,4);S(x,y,len,skyAng(x,y)+R(-.2,.2),M(mixW(HALO,GLOW,sm(.3,1,s)),.12),sz,{load:R(1.1,1.35),thin:.3,edge:R(.5,.7),taper:[.3,.3],stir:.85,clean:true});}
// 3. melt: two light soft passes at varied angles, then one long pass along the bands
for(let k=0;k<3;k++){const ang=[-.1,.4,-.55][k];
 for(let i=0;i<120;i++){const x=R(-40,W+40),y=R(-40,1040);const l=R(220,440);SB(seg(x,y,l,ang+R(-.3,.3),R(-.05,.05)*l,3),88,R(.35,.5));}}
for(let y=-20;y<1040;y+=R(65,100)){for(let x=-60;x<W;x+=R(380,560)){SB([[x,y+R(-15,15)],[x+R(200,300),y+R(-25,25)],[x+R(430,560),y+R(-15,15)]],88,R(.4,.55));}}
// soft radial-free melt of the glow: big soft strokes crossing the glow in several directions
for(let i=0;i<100;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*420;const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;SB(seg(x,y,R(260,420),R(-.5,.5),0,3),88,R(.4,.55));}
// 4. put paint back: fewer, longer, varied visible strokes; sparse around the spire; thick and pale in the glow
for(let i=0;i<300;i++){const x=R(-40,W+40),y=R(-40,1030);const c=spireF(x,y);if(c>.25&&R(0,1)<.7)continue;if(x>1200&&y<280&&R(0,1)<.8)continue;
 const t=y/1000;const s=sunF(x,y);const sz=R(30,80)*(1+s*.3);const len=sz*R(3,6);const a=skyAng(x,y)+R(-.1,.1);
 p.stroke({points:seg(x,y,len,a,R(-.1,.1)*len,4),color:skyCol(x,y,.22),brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.85,1.05)+s*.35,thin:lerp(.5,.35,t),edge:R(.3,.6),taper:[R(.2,.4),R(.2,.4)],stir:R(.4,.65),clean:s>.5});}
// 4b. broken colour: smaller half-stirred strokes of the local mix with a warmer or cooler neighbour streaked in, mid and lower sky; not horizontal only
for(let i=0;i<220;i++){const x=R(-40,W+40),y=R(120,1000);const c=spireF(x,y);if(c>.2&&R(0,1)<.75)continue;if(x>1200&&y<280)continue;
 const t=y/1000;const s=sunF(x,y);let m=skyCol(x,y,.1);const w=R(0,1);
 if(w<.35)m=m.concat([['naples_yellow',R(.05,.12)],['quinacridone_rose',R(.01,.04)]]);else if(w<.7)m=m.concat([['cobalt_violet',R(.06,.12)],['cobalt_blue',R(.02,.05)]]);else m=m.concat([['titanium_white',R(.2,.5)]]);
 const sz=R(34,72)*(1+s*.3);const len=sz*R(3,6);const a=((x>1500&&y<700)?R(-.06,.06):(R(0,1)<.35?R(-.6,.6):skyAng(x,y)+R(-.15,.15)));
 p.stroke({points:seg(x,y,len,a,R(-.12,.12)*len,4),color:m,brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.8,1.05)+s*.3,thin:lerp(.5,.35,t),edge:R(.3,.6),taper:[R(.25,.45),R(.25,.45)],stir:R(.35,.5),clean:s>.5});}
for(let i=0;i<70;i++){const x=R(-40,W+40),y=R(100,1000);SB(seg(x,y,R(240,420),R(-.5,.5),0,3),88,R(.3,.45));}
// 4c. a few long non-horizontal strokes back across the middle and the warm band so the rows do not return
for(let i=0;i<40;i++){const y=R(0,1)<.5?R(400,660):R(780,950);const x=R(-40,W+40);if(spireF(x,y)>.3)continue;if(x>1500&&y<700)continue;const a=R(.15,.4)*(R(0,1)<.5?1:-1);const len=R(240,480);
 p.stroke({points:seg(x,y,len,a,R(.05,.15)*len*(R(0,1)<.5?1:-1),5),color:skyCol(x,y,.18),brush:'filbert',size:R(34,60),load:R(.9,1.1),thin:.42,edge:.5,taper:[.35,.35],stir:R(.45,.65),clean:sunF(x,y)>.5});}
// 4d. right of and above the palace: melt the crossing more, then a few long, calm, nearly horizontal strokes so the spire is the sharpest thing there
for(let i=0;i<60;i++){const x=R(1550,W+40),y=R(-20,700);SB(seg(x,y,R(300,520),R(-.08,.08),R(-.02,.02)*400,3),88,R(.45,.6));}
for(let i=0;i<14;i++){const x=R(1600,W+40),y=R(250,660);const len=R(420,760);
 p.stroke({points:seg(x,y,len,R(-.04,.04),R(-.02,.02)*len,5),color:skyCol(x,y,.12),brush:'flat',size:R(44,70),load:R(.95,1.1),thin:.48,edge:R(.55,.7),taper:[.35,.35],stir:R(.7,.85)});}
for(let i=0;i<24;i++){const x=R(1550,W+40),y=R(200,700);SB(seg(x,y,R(300,500),R(-.06,.06),0,3),88,R(.35,.5));}
// 5. a gentle last melt only in places, light touch
for(let i=0;i<90;i++){const x=R(-40,W+40),y=R(-20,1030);const l=R(240,400);SB(seg(x,y,l,R(-.4,.4),R(-.05,.05)*l,3),80,R(.25,.4));}
