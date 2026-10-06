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
// 29 gate refine: second and third layers on the vortex. Broken colour scumbled along the arms, thin bright filaments (light threads), thick crest lights, knife planes on a few arms, deep accents in the troughs for depth, rim flares and sparks flung into the foliage.
p.wipe();p.dry();
const GX=1193,GY=524,GR=392,CX2=GX+16,CY2=GY+26,SW=1.55;
const spt=(th0,r)=>{const u=1-r/GR;const cx=lerp(GX,CX2,u*u),cy=lerp(GY,CY2,u*u);const th=th0+SW*Math.log(GR/Math.max(r,5));return [cx+Math.cos(th)*r,cy+Math.sin(th)*r];};
// colour mix by lightness t (0 dark indigo .. 1 white) and warmth w (-1 cyan side .. +1 magenta side)
const VC=(t,w)=>{w=w||0;const wh=Math.pow(t,1.5)*6.5+.04,dk=Math.pow(1-t,1.6)*2.6+.03;return M([['ultramarine',dk*(.8-.25*w)+.1],['dioxazine_purple',dk*(.9+.5*Math.max(w,0))],['paynes_grey',(1-t)*.5],['quinacridone_rose',Math.max(0,w)*(.1+t*t*.4)],['cerulean',Math.max(0,-w)*(.1+t*t*.6)],['titanium_white',wh]],.18);};
const LUM=r=>{const x=clamp(r/GR,0,1);const st=[[0,.99],[.1,.93],[.25,.78],[.45,.58],[.7,.36],[.9,.22],[1,.15]];for(let i=0;i<st.length-1;i++)if(x<=st[i+1][0])return lerp(st[i][1],st[i+1][1],(x-st[i][0])/(st[i+1][0]-st[i][0]));return .1;};
const armPath=(th0,r0,r1,n)=>{r1=Math.max(r1,4);n=Math.max(n,Math.ceil(SW*Math.log(Math.max(r0,r1)/Math.min(r0,r1))/.2)+1);const pts=[];for(let k=0;k<n;k++){const r=r0*Math.pow(r1/r0,k/(n-1));pts.push(spt(th0,r).concat([pr(k,n)]));}return pts;};
const warmAt=(x,y)=>{const a=Math.atan2(y-GY,x-GX);return Math.sin(a+2.2)*.9;}; // magenta toward the lower right, cyan toward the upper left

const rimR=a=>GR+9+5*Math.sin(3*a+1)+4*Math.sin(7*a+.4);
const hotAt=a=>.5+.5*Math.cos(a-Math.PI*1.25);
// 1. deep accents in the troughs: thin dark indigo, thicker where the funnel is deepest, glazed so the arms still show through
for(let i=0;i<60;i++){const th0=R(0,TAU),r0=R(120,GR*.93),r1=Math.max(40,r0-R(60,150));L(armPath(th0,r0,r1,5),M([['dioxazine_purple',1],['ultramarine',.8],['paynes_grey',.5]],.3),R(8,26),{load:R(.7,1),thin:.45,taper:[.3,.5],opacity:R(.25,.5),edge:.4});}
// 2. broken colour: scumbled hues along the arms (rose, cyan, lilac, a little green-blue), dragged over the dry layer so it only catches the peaks
for(let i=0;i<50;i++){const th0=R(0,TAU),r0=R(50,GR*.95),r1=Math.max(10,r0-R(40,120));const m=spt(th0,(r0+r1)/2);const w=warmAt(m[0],m[1]);const k=R(0,1);
 const col=k<.12?M([['quinacridone_rose',1],['titanium_white',3.2],['dioxazine_purple',.3]],.3):k<.3?M([['cerulean',1],['titanium_white',3.4],['ultramarine',.25]],.3):k<.9?M([['titanium_white',2.5],['dioxazine_purple',.3],['ultramarine',.2]],.3):M([['viridian',.25],['cerulean',.7],['titanium_white',2.5]],.3);
 L(armPath(th0,r0,r1,5),col,R(6,22),{load:R(.4,.75),thin:.25,taper:[.3,.5],opacity:R(.16,.34),scumble:true,stir:.3});}
// 3. light threads: long thin bright filaments that follow the spiral, in broken pieces, brightest toward the core
for(let j=0;j<8;j++){const th0=R(0,TAU);let r=GR*R(.8,.98);while(r>30){const len=R(40,140)*(.35+r/GR*.8);const r2=Math.max(12,r-len);const t=clamp(.8+(1-r/GR)*.2+R(-.05,.05),.7,1);
  L(armPath(th0+R(-.03,.03),r,r2,6),VC(t,R(-.4,.4)),R(2.6,6.5)*(.6+r/GR*.6),{load:R(1.2,1.45),thin:.15,taper:[.3,.5],opacity:R(.7,1),stir:.4});r-=len*R(.8,1.8);}}
// 4. crest lights: thick short impasto along the arm crests, and a few knife planes
for(let i=0;i<70;i++){const th0=R(0,TAU),r0=Math.pow(R(0,1),.9)*GR*.9+20,r1=Math.max(8,r0-R(24,70));const t=clamp(.8+(1-r0/GR)*.18+R(-.08,.08),.65,1);
 L(armPath(th0,r0,r1,4),VC(t,R(-.5,.5)),R(5,15)*(.55+r0/GR*.6),{load:R(1.2,1.5),thin:.15,taper:[.3,.45],opacity:R(.8,1),stir:.4,dirty:.3});}
for(let i=0;i<6;i++){const th0=R(0,TAU),r0=R(120,GR*.9),r1=Math.max(30,r0-R(70,140));L(armPath(th0,r0,r1,5),M([['titanium_white',5],['ultramarine',.06],['dioxazine_purple',.05]],.2),R(8,16),{brush:'knife',load:R(.8,1.1),thin:.2,opacity:R(.7,.95),clean:true});}
// 5. the core blooms: veils, then a handful of hot touches that are not on the spiral so it does not look wound up
for(let k=0;k<22;k++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*170;L(seg(CX2+Math.cos(a)*r,CY2+Math.sin(a)*r,R(60,150),R(0,TAU),R(-10,10),4),M([['titanium_white',3],['ultramarine',.05],['quinacridone_rose',.06]],.3),R(26,60),{load:.9,thin:.45,opacity:R(.16,.3),taper:[.3,.5],edge:.5});}
for(let k=0;k<9;k++){const th0=R(0,TAU),r0=R(36,70),r1=Math.max(4,r0*R(.15,.4));L(armPath(th0,r0,r1,6),M([['titanium_white',6],['ultramarine',.03]],.2),R(9,17),{load:R(1.3,1.5),thin:.12,taper:[.3,.5],opacity:1,clean:true});}
// 6. rim flares: curved tongues of light spilling outward in the spin direction, hot upper left, cooler pink-violet lower right; then loose sparks
for(let i=0;i<60;i++){const a=R(0,TAU),hot=hotAt(a);if(R(0,1)>.25+hot*.8)continue;const r0=rimR(a)+R(-2,10),Ln=R(24,80)*(.35+hot);const pts=[];for(let k=0;k<5;k++){const f=k/4,rr=r0+Ln*f,aa=a-.0018*(rr-r0)*R(.7,1.3)-f*f*.07;pts.push([GX+Math.cos(aa)*rr,GY+Math.sin(aa)*rr,.9-f*.6]);}
 L(pts,hot>.5?M([['titanium_white',3],['ultramarine',.12],['dioxazine_purple',.1]],.35):M([['titanium_white',2],['quinacridone_rose',.3],['dioxazine_purple',.25]],.35),R(8,22)*(.5+hot*.7),{load:R(.7,1.1),thin:.3,taper:[.1,.8],opacity:R(.2,.45),edge:.6});}
for(let i=0;i<22;i++){const a=R(0,TAU),hot=hotAt(a);if(R(0,1)>.2+hot*.8)continue;const r=GR+R(20,230)*Math.pow(R(0,1),1.3);const k=R(0,1);
 p.dab({x:GX+Math.cos(a)*r,y:GY+Math.sin(a)*r,color:M([['titanium_white',3],['ultramarine',.1],['dioxazine_purple',.05]],.3),size:R(2.5,5),brush:'round',load:R(.7,1.2),pressure:R(.5,.9)});}
// 7. a last halo: broad pale veils well outside the rim so the light seems to sit in the air
for(let a=R(0,.2);a<TAU;a+=R(.12,.3)){const hot=hotAt(a);const r=GR+R(40,130);const pts=[];for(let k=0;k<4;k++){const aa=a+k*.12;pts.push([GX+Math.cos(aa)*r,GY+Math.sin(aa)*r,.8]);}
 L(pts,M([['titanium_white',2],['ultramarine',.3],['dioxazine_purple',.25]],.3),R(50,90),{load:.5,thin:.5,opacity:R(.03,.07)+hot*.05,taper:[.4,.5],edge:.8});}
p.dry();

// 8. the rim made luminous: a broken, thick, near-white crescent riding the edge of the funnel, strongest on the upper left, thin and lilac where it turns away, with a soft bloom outside it
p.dry();
for(let a=R(0,.1);a<TAU;a+=R(.16,.3)){const hot=hotAt(a);const r=rimR(a)-5+R(-2,2);const n=5,span=R(.2,.4);const pts=[];for(let k=0;k<n;k++){const aa=a+span*k/(n-1);pts.push([GX+Math.cos(aa)*(rimR(aa)-5),GY+Math.sin(aa)*(rimR(aa)-5),.9-Math.abs(k/(n-1)-.5)*.5]);}
 L(pts,M([['titanium_white',5],['ultramarine',.05],['dioxazine_purple',.05],['quinacridone_rose',.03]],.2),R(7,13)*(.55+hot*.7),{load:R(1.2,1.4),thin:.15,taper:[.3,.4],opacity:R(.55,.9)*(.45+hot*.55),stir:.2});}
for(let a=R(0,.1);a<TAU;a+=R(.25,.5)){const hot=hotAt(a);const pts=[];const span=R(.25,.45);for(let k=0;k<4;k++){const aa=a+span*k/3;pts.push([GX+Math.cos(aa)*(rimR(aa)+10),GY+Math.sin(aa)*(rimR(aa)+10),.8]);}
 L(pts,M([['titanium_white',2.5],['ultramarine',.2],['dioxazine_purple',.15]],.3),R(20,34),{load:.5,thin:.55,opacity:R(.06,.14)+hot*.07,taper:[.3,.5],edge:.8});}
p.dry();
