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
// 24 paving: flagstones set in true perspective (world grid, camera yaw 4.5 deg, eye 1.5 m). Dark joints first, then each stone as a lit top with its own tone, a sunward bevel, worn corners, mottling; warm low sun on the left, violet fill from the gate on the right; the stage's shadow band and long cool cast shadows on top as glazes.
p.wipe();p.dry();const pk=a=>a[Math.floor(R(0,a.length))%a.length];
const SN=Math.sin(4.5*Math.PI/180),CS=Math.cos(4.5*Math.PI/180);
const proj=(u,v)=>{const a=u*CS+v*SN,d=-u*SN+v*CS;return [1200+2198*a/d,830+3297/d];};
const dOf=y=>3297/(y-830);
// dark joint layer over the whole ground band
for(let y=1320;y<1640;y+=44)p.stroke({points:[[-60,y],[1200,y+R(-2,2)],[2460,y]],color:M([['raw_umber',1],['ivory_black',.55],['dioxazine_purple',.35],['titanium_white',.45]],.2),brush:'flat',size:62,angle:Math.PI/2,load:1.1,thin:.35,taper:0,edge:.05,stir:.5});
p.dry();
const tone=(x,y)=>{const t=clamp((x-650)/1300,0,1);const warm=[['raw_umber',.5],['burnt_sienna',.35],['yellow_ochre',.18],['quinacridone_rose',.12],['titanium_white',1.9]];const cool=[['ultramarine',.22],['dioxazine_purple',.1],['quinacridone_rose',.2],['raw_umber',.4],['burnt_sienna',.15],['titanium_white',2.0]];
 const o={};for(const [n,w] of warm)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of cool)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]).filter(q=>q[1]>1e-3);};
const rnd=(a,m)=>a.map(q=>[q[0],q[1]*(1+R(-m,m))]);
const cut=(P,f)=>{const o=[];for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4],c=P[(i+3)%4];o.push([lerp(a[0],c[0],f),lerp(a[1],c[1],f)]);o.push([lerp(a[0],b[0],f),lerp(a[1],b[1],f)]);}return o;};
// deterministic stone layout (own PRNG, shared with the refinement pass 29c)
const mb=(a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;})(90210);
const mr=(a,b)=>a+(b-a)*mb();
function stoneList(){const out=[];for(let v=3.75,row=0;v<7.3;row++){const dv=mr(.25,.36);const v0=v,v1=v+dv;let u=-9+mr(0,.6);
 while(u<9){const du=mr(.3,.52);const u0=u,u1=u+du;u=u1+.02;const g=.011;const J=()=>mr(0,.03);
  const C=[proj(u0+g+J(),v0+g+J()),proj(u1-g-J(),v0+g+J()),proj(u1-g-J(),v1-g-J()),proj(u0+g+J(),v1-g-J())];
  const xs=C.map(q=>q[0]),ys=C.map(q=>q[1]);if(Math.max(...xs)<-30||Math.min(...xs)>2430||Math.max(...ys)<1315||Math.min(...ys)>1640)continue;
  if(Math.min(...ys)<1362-40*((Math.min(...xs)+Math.max(...xs))/2)/2400-4)continue;
  out.push({C,row,cx:(C[0][0]+C[2][0])/2,cy:(C[0][1]+C[2][1])/2,hgt:Math.max(...ys)-Math.min(...ys),wid:Math.max(...xs)-Math.min(...xs),ymin:Math.min(...ys)});}
 v=v1+.03;}return out;}
let nst=0;
for(const st of stoneList()){const C=st.C;const ys=C.map(q=>q[1]),xs=C.map(q=>q[0]);
  nst++;
  const cx=st.cx,cy=st.cy,hgt=st.hgt,wid=st.wid;
  const base=rnd(tone(cx,cy),.38);const poly=cut(C,.16);
  const lit=R(0,1);const dkst=R(0,1)<.18;
  for(const f of (hgt>26?[.24,.5,.76]:[.3,.7])){const yl=lerp(C[0][1],C[3][1],f),yr=lerp(C[1][1],C[2][1],f),xl=lerp(C[0][0],C[3][0],f)+3,xr=lerp(C[1][0],C[2][0],f)-3;
   const mk=(sh)=>base.concat([['titanium_white',(.4-f*.7)*(1+lit*.4)*2+sh],['burnt_umber',(dkst?.5:0)+Math.max(0,-sh)*.3]]).filter(q=>q[1]>0).map(q=>[q[0],q[1]*(1+R(-.06,.06))]);
   const xm=lerp(xl,xr,.55);
   p.stroke({points:[[xl,yl,.9],[xm,lerp(yl,yr,.55)+R(-.4,.4),.95]],color:mk(.25),brush:'filbert',size:hgt/(hgt>26?3.1:2.0)+2,angle:Math.PI/2,load:1.2,thin:.6,taper:[.02,.0],edge:0,stir:.8,clean:true});
   p.stroke({points:[[xm-6,lerp(yl,yr,.5),.9],[xr,yr,.9]],color:mk(-.35),brush:'filbert',size:hgt/(hgt>26?3.1:2.0)+2,angle:Math.PI/2,load:1.2,thin:.6,taper:[.0,.02],edge:0,stir:.8,clean:true});}
  for(const f of [.5]){const yl=lerp(C[0][1],C[3][1],f),yr=lerp(C[1][1],C[2][1],f),xl=lerp(C[0][0],C[3][0],f)+5,xr=lerp(C[1][0],C[2][0],f)-5;
   p.stroke({points:[[xl,yl,.8],[(xl+xr)/2,(yl+yr)/2,.8],[xr,yr,.8]],brush:'soft',size:Math.max(8,hgt*.8),opacity:R(.4,.6),color:'titanium_white'});}
  // sunward (left) bevel catches light, right and back edges fall into shade
  const lp=[C[0],C[3]],rp=[C[1],C[2]],fp=[C[3],C[2]];
  const lw=clamp(hgt*.05,1.6,3.2);
  p.stroke({points:[[lp[0][0]+2,lp[0][1]+3,.8],[(lp[0][0]+lp[1][0])/2+2,(lp[0][1]+lp[1][1])/2,.9],[lp[1][0]+2,lp[1][1]-3,.8]],color:M([['titanium_white',1],['yellow_ochre',.35],['burnt_sienna',.2],['quinacridone_rose',.08]],.2),brush:'flat',size:lw,load:1,thin:.3,opacity:R(.5,.8),taper:[.15,.25]});
  p.stroke({points:[[C[3][0]+4,C[3][1]-lw*.5,.8],[(C[3][0]+C[2][0])/2,(C[3][1]+C[2][1])/2-lw*.5,.9],[C[2][0]-4,C[2][1]-lw*.5,.8]],color:M([['titanium_white',1],['yellow_ochre',.3],['burnt_sienna',.2]],.2),brush:'flat',size:lw*.8,load:.9,thin:.3,opacity:R(.25,.5),taper:[.2,.3]});
  p.stroke({points:[[rp[0][0]-2,rp[0][1]+3,.8],[(rp[0][0]+rp[1][0])/2-2,(rp[0][1]+rp[1][1])/2,.9],[rp[1][0]-2,rp[1][1]-2,.8]],color:M([['burnt_umber',1],['dioxazine_purple',.5],['ultramarine',.15]],.2),brush:'flat',size:lw*1.2,load:.8,thin:.4,opacity:R(.3,.55),taper:[.15,.25],edge:.5});
  p.stroke({points:[[C[0][0]+3,C[0][1]+2,.8],[(C[0][0]+C[1][0])/2,(C[0][1]+C[1][1])/2+2,.9],[C[1][0]-3,C[1][1]+2,.8]],color:M([['burnt_umber',1],['dioxazine_purple',.5],['ultramarine',.15]],.2),brush:'flat',size:lw*1.2,load:.8,thin:.4,opacity:R(.25,.45),taper:[.15,.25],edge:.5});
  // mottling and wear inside the stone: dry scumbles of lighter, pinker, greyer paint, a few pits
  const nm=Math.round(clamp(wid*hgt/1100,2,8));
  for(let m=0;m<nm;m++){const f1=R(.1,.9),f2=R(.15,.85);const px=lerp(lerp(C[0][0],C[1][0],f1),lerp(C[3][0],C[2][0],f1),f2),py=lerp(lerp(C[0][1],C[1][1],f1),lerp(C[3][1],C[2][1],f1),f2);const ml=R(.1,.35)*wid;const kind=R(0,1);
   p.stroke({points:[[px,py,.7],[px+ml*.5,py+R(-1.5,1.5),.8],[px+ml,py+R(-2,2),.6]],color:kind<.4?M([['titanium_white',1],['yellow_ochre',.4],['quinacridone_rose',.12]],.3):kind<.75?M([['burnt_sienna',1],['titanium_white',1.2],['ultramarine',.1]],.3):M([['raw_umber',1],['titanium_white',1.4],['paynes_grey',.2]],.3),brush:'flat',size:R(3,8)*clamp(hgt/50,.6,1.3),angle:Math.PI/2,load:R(.3,.6),thin:.3,opacity:R(.25,.55),taper:[.3,.4],scumble:true});}
  for(let m=0;m<R(-1,2);m++){const f1=R(.1,.9),f2=R(.15,.85);const px=lerp(lerp(C[0][0],C[1][0],f1),lerp(C[3][0],C[2][0],f1),f2),py=lerp(lerp(C[0][1],C[1][1],f1),lerp(C[3][1],C[2][1],f1),f2);
   p.dab({x:px,y:py,color:M([['burnt_umber',1],['dioxazine_purple',.3]],.3),size:R(2,3.5),brush:'round',load:.7,pressure:.5});}
  // worn corner chips (light)
  if(R(0,1)<.6){const k=Math.floor(R(0,4));p.dab({x:C[k][0]+(cx-C[k][0])*.08,y:C[k][1]+(cy-C[k][1])*.12,color:M([['titanium_white',1],['quinacridone_rose',.15],['raw_umber',.2]],.3),size:R(3,6),brush:'round',load:.8,pressure:.6});}
 }
// sunlight floods some of the joints on the lit left side: lost and found
for(let i=0;i<150;i++){const x=R(-20,1300),y=R(1345,1600);const len=R(14,60),ang=R(-.2,.2)+(i%2?1.55:0);const k=clamp(1-x/1400,.2,1);
 p.stroke({points:[[x,y],[x+Math.cos(ang)*len,y+Math.sin(ang)*len]],color:M([['titanium_white',1],['yellow_ochre',.5],['burnt_sienna',.5]],.3),brush:'filbert',size:R(4,8),load:.8,thin:.4,opacity:R(.2,.45)*k,taper:[.3,.5],scumble:true});}
p.dry();
// moss and weeds in the joints: tiny dark-green flecks, a few
for(let i=0;i<70;i++){const y=R(1340,1600),x=R(0,2400);p.stroke({points:[[x,y],[x+R(-6,6),y+R(-4,4)]],color:M([['sap_green',1],['burnt_umber',.6],['yellow_ochre',.3]],.3),brush:'round',size:R(2,4),load:.8,thin:.3,opacity:R(.35,.7),taper:[.2,.4]});}
// glazes of shadow: the stage's shadow band under the skirt (cool grey-violet, deepest at the foot of the stage, fading downwards), then long cast shadows of the figures
const sh=(x0,y0,x1,y1,w,col,op)=>p.stroke({points:[[x0,y0,.8],[(x0+x1)/2,(y0+y1)/2,.9],[x1,y1,.8]],color:col,brush:'flat',size:w,angle:Math.PI/2,load:.8,thin:.6,opacity:op,taper:[.1,.3],edge:.5});
const SHC=()=>M([['dioxazine_purple',1],['ultramarine',.8],['burnt_umber',.35]],.25);
for(let i=0;i<22;i++){const x=R(300,2300);sh(x-R(150,260),1352+R(0,18),x+R(150,300),1352+R(0,22),R(26,40),SHC(),R(.2,.34));}
for(let i=0;i<8;i++){const x=R(900,2300);sh(x-R(100,200),1392+R(0,14),x+R(100,260),1396+R(0,16),R(20,32),SHC(),R(.1,.2));}
// Crono's and Marle's long cool cast shadows, running right and a little toward us
const cast=(x0,y0,x1,y1,w0,w1)=>{for(let k=0;k<7;k++){const j=R(-.5,.5);p.stroke({points:[[x0,y0+j*w0*.4,.8],[(x0+x1)/2,(y0+y1)/2+j*w0*.3,.9],[x1,y1+j*w1*.3,.7]],color:SHC(),brush:'flat',size:lerp(w0,w1,.5)*R(.5,.9),angle:Math.PI/2,load:.8,thin:.6,opacity:R(.07,.14),taper:[.1,.5],edge:.6});}};
cast(490,1420,1250,1478,52,30);
cast(1380,1500,2150,1560,60,34);
p.dry();
