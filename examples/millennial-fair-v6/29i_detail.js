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
// 29i detail layer: intentional touches on top of the finished surfaces, concentrated where the eye lands (around the gate and the stage front). Deck: sun glints on board bevels, scuffs and a few nail heads in the lit zones, cold gate light scumbled on the boards beneath the vortex. Paving: a second skin on every stone (broken pink, ochre and grey touches, pale worn corners, pits, lichen, a dust of grit in the joints), strongest on the sunlit left. Steps and skirt: scuffs and nail heads. Nothing here is a tint over the whole surface.
p.wipe();p.dry();const pk=a=>a[Math.floor(R(0,a.length))%a.length];
const SN=Math.sin(4.5*Math.PI/180),CS=Math.cos(4.5*Math.PI/180);
const proj=(u,v)=>{const a=u*CS+v*SN,d=-u*SN+v*CS;return [1200+2198*a/d,830+3297/d];};
const yb=x=>1362-40*x/2400;
const mb=(a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;})(31415);
const mr=(a,b)=>a+(b-a)*mb();
const chaikin=(P,n)=>{for(let k=0;k<n;k++){const Q=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];Q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}P=Q;}return P;};
const xr=(P,y)=>{let lo=1e9,hi=-1e9;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y)){const x=a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]);if(x<lo)lo=x;if(x>hi)hi=x;}}return hi>lo?[lo,hi]:null;};
function stoneList(){const out=[];let v=3.7;
 while(v<7.6){const dv=mr(.24,.46);const v0=v,v1=v+dv;let u=-9+mr(0,.9);const rowKind=mb();
  while(u<9){let du;const r=mb();if(rowKind<.12)du=mr(.17,.28);else du=r<.62?mr(.5,.98):r<.88?mr(.3,.5):mr(.18,.3);
   const u0=u,u1=u+du;u=u1;const g=mr(.005,.012);const J=(m)=>mr(-m,m);
   // the stone's own skew: back edge shifted against front edge, corners jittered
   const sk=J(.05);
   const W=[[u0+g+J(.035),v0+g+J(.03)],[u1-g+J(.035)+sk,v0+g+J(.03)],[u1-g+J(.035),v1-g+J(.03)],[u0+g+J(.035)+sk,v1-g+J(.03)]];
   const C=W.map(q=>proj(q[0],q[1]));
   const xs=C.map(q=>q[0]),ys=C.map(q=>q[1]);if(Math.max(...xs)<-30||Math.min(...xs)>2430||Math.max(...ys)<1315||Math.min(...ys)>1640)continue;
   const mx=(Math.min(...xs)+Math.max(...xs))/2;if(Math.min(...ys)<yb(mx)+1)continue;
   out.push({C,cx:(C[0][0]+C[2][0])/2,cy:(C[0][1]+C[2][1])/2,hgt:Math.max(...ys)-Math.min(...ys),wid:Math.max(...xs)-Math.min(...xs)});}
  v=v1;}
 return out;}

const stones=stoneList();
const inSteps=(x,y)=>x>430&&x<1120&&y>1180&&y<1470;
// paving second skin
for(const st of stones){const C=st.C;const {cx,cy,hgt,wid}=st;if(inSteps(cx,cy))continue;const sun=clamp(1.15-cx/1700,.15,1);
 const pt=(f1,f2)=>[lerp(lerp(C[0][0],C[1][0],f1),lerp(C[3][0],C[2][0],f1),f2),lerp(lerp(C[0][1],C[1][1],f1),lerp(C[3][1],C[2][1],f1),f2)];
 const n=Math.round(clamp(wid*hgt/900,2,7));
 for(let m=0;m<n;m++){const q=pt(R(.12,.8),R(.15,.85));const l=R(.12,.4)*wid;const k=R(0,1);
  const col=k<.3?M([['quinacridone_rose',1],['titanium_white',2.4],['raw_umber',.2]],.3):k<.55?M([['yellow_ochre',1],['titanium_white',2.4],['raw_umber',.25]],.3):k<.8?M([['ultramarine',.5],['titanium_white',2.4],['raw_umber',.3],['quinacridone_rose',.2]],.3):M([['raw_umber',1],['titanium_white',1.2],['dioxazine_purple',.2]],.3);
  p.stroke({points:[[q[0],q[1],.7],[q[0]+l*.5,q[1]+R(-1.2,1.2),.8],[q[0]+l,q[1]+R(-1.5,1.5),.6]],color:col,brush:'filbert',size:R(2.5,6)*clamp(hgt/45,.6,1.2),angle:Math.PI/2,load:R(.35,.7),thin:.4,opacity:R(.2,.45)*(k<.8?.6+.4*sun:1),taper:[.2,.4],scumble:true});}
 // worn pale corner on the sunward side, a pit or two, lichen
 {const c=pt(R(.04,.14),R(.1,.2));p.stroke({points:[[c[0],c[1]],[c[0]+R(5,12),c[1]+R(-1,1)]],color:M([['titanium_white',1],['quinacridone_rose',.12],['yellow_ochre',.1]],.2),brush:'filbert',size:R(3,5),angle:Math.PI/2,load:1,thin:.3,opacity:R(.35,.65)*sun,taper:[.2,.5]});}
 for(let m=0;m<2;m++){const q=pt(R(.15,.85),R(.2,.8));p.dab({x:q[0],y:q[1],color:M([['burnt_umber',1],['dioxazine_purple',.3]],.3),size:R(1.6,3.2),brush:'round',load:.6,pressure:.5,opacity:R(.4,.7)});}
 if(R(0,1)<.18){const q=pt(R(.1,.9),R(.2,.8));p.stroke({points:[[q[0],q[1]],[q[0]+R(6,14),q[1]+R(-2,2)]],color:M([['sap_green',1],['raw_umber',.5],['titanium_white',1.1],['yellow_ochre',.2]],.3),brush:'round',size:R(2.5,4),load:.7,thin:.3,opacity:.5,taper:[.2,.4]});}
}
// grit in the joints and light spilling into them on the left
for(let i=0;i<500;i++){const x=R(0,2400),y=R(1340,1600);if(inSteps(x,y))continue;const sun=clamp(1.2-x/1700,.1,1);
 p.dab({x,y,color:R(0,1)<.5?M([['titanium_white',1],['yellow_ochre',.4],['raw_umber',.3]],.3):M([['raw_umber',1],['dioxazine_purple',.4]],.3),size:R(1.4,3),brush:'round',load:.6,pressure:.5,opacity:R(.25,.6)*(R(0,1)<.5?sun:1)});}
// deck: sun glints on bevels, scuffs, nail heads; the cold light of the gate
const VPX=1370,VPY=830,YF=1097,YB=978,WF=60;const sc=y=>(y-VPY)/(YF-VPY);const xAt=(xf,y)=>VPX+(xf-VPX)*sc(y);
const inCon=(x,y)=>x>1770&&x<2125&&y<1062;
const inShade=(x,y)=>{const d=y-YB;const s1=x-4.2*d;const s2=x-2.4*d;return (s1>150&&s1<480)||(s2>1960&&s2<2260);};
for(let i=0;i<420;i++){const xf=Math.round(R(-1200,3300)/WF)*WF-WF*.47+1.5;const y0=R(YB+2,YF-30),y1=y0+R(14,60);const x0=xAt(xf,y0),x1=xAt(xf,y1);if(x0<-20||x0>2420||inCon(x0,y0))continue;const sh=inShade(x0,y0);
 p.stroke({points:[[x0,y0,.6],[(x0+x1)/2,(y0+y1)/2,.8],[x1,y1,.6]],color:sh?M([['dioxazine_purple',1],['titanium_white',1.4],['quinacridone_rose',.2]],.3):M([['titanium_white',1],['yellow_ochre',.35],['quinacridone_rose',.2]],.25),brush:'round',size:R(1.3,2.4),load:.9,thin:.3,opacity:R(.25,.55)*(sh?.5:1),taper:[.2,.4]});}
for(let i=0;i<260;i++){const xf=R(-1200,3300),y0=R(YB+3,YF-6);const x0=xAt(xf,y0);if(x0<-20||x0>2420||inCon(x0,y0))continue;const l=R(10,36);const x1=xAt(xf,y0+l*.4);const lt=R(0,1)<.5;
 p.stroke({points:[[x0,y0,.6],[x1,y0+l*.4,.6]],color:lt?M([['burnt_sienna',1],['titanium_white',1.1],['quinacridone_rose',.2]],.3):M([['burnt_umber',1],['dioxazine_purple',.3]],.3),brush:'round',size:R(1.5,2.6),load:.6,thin:.4,opacity:R(.15,.35),taper:[.2,.4],scumble:true});}
for(let k=0;k<44;k++){const xf=Math.round(R(-1200,3300)/WF)*WF;for(const yy of [R(YB+12,YB+50),R(YF-40,YF-8)]){const x=xAt(xf+WF*R(-.3,.3),yy);if(x<0||x>2400||inCon(x,yy))continue;p.dab({x,y:yy,color:M([['ivory_black',1],['van_dyke_brown',.6]],.2),size:R(1.8,2.8)*sc(yy)*1.1+.8,brush:'round',load:.7,pressure:.5,opacity:.45});}}
for(let i=0;i<60;i++){const x=R(760,1640),y=R(YB+2,YB+60);const k=Math.exp(-Math.pow((x-1190)/430,2));if(R(0,1)>k)continue;
 p.stroke({points:[[x,y],[x+R(20,60),y+R(-1,3)]],color:M([['titanium_white',1.6],['dioxazine_purple',.4],['ultramarine',.25]],.25),brush:'filbert',size:R(2,5),angle:Math.PI/2,load:.7,thin:.4,opacity:R(.2,.4)*k,taper:[.2,.4],scumble:true});}
// steps and skirt: scuffs and nail heads
for(let i=0;i<60;i++){const x=R(470,1090),y=R(1214,1440);if((y>1312&&y<1324)||(y>1204&&y<1210))continue;const lt=R(0,1)<.45;
 p.stroke({points:[[x,y,.6],[x+R(24,90),y+R(-.8,.8),.6]],color:lt?M([['burnt_sienna',1],['titanium_white',.9],['quinacridone_rose',.15]],.3):M([['van_dyke_brown',1],['ivory_black',.4]],.3),brush:'round',size:R(1.5,2.8),load:.6,thin:.4,opacity:R(.15,.3),taper:[.2,.4],scumble:true});}
for(let i=0;i<260;i++){const x=R(0,2400),y=R(1140,Math.min(1340,1362-40*x/2400-12));if(x>430&&x<1115&&y>1180)continue;const l=R(18,70);const lt=R(0,1)<.35;
 p.stroke({points:[[x,y,.6],[x+R(-1,1),y+l*.5,.7],[x+R(-1.5,1.5),y+l,.5]],color:lt?M([['burnt_sienna',1],['titanium_white',.6],['quinacridone_rose',.12]],.3):M([['ivory_black',1],['van_dyke_brown',.7],['dioxazine_purple',.2]],.3),brush:'round',size:R(1.4,2.6),load:.6,thin:.4,opacity:R(.1,.25),taper:[.2,.4],scumble:true});}
p.dry();
