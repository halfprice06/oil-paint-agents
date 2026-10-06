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

// ---- 44_windows_arches.body.js ----
// 44: the arcade of pointed arches at the base of the lower drum, the grand entrance, grouped windows (fewer, varied, lost in shadow)
p.wipe();
const LD={cx:1490,r:190,cy:600,ry:36,bot:765},UD={cx:1490,r:120,cy:500,ry:26,bot:605};
const rim=(d,x)=>{const u=clamp((x-d.cx)/d.r,-1,1);return d.cy+d.ry*Math.sqrt(1-u*u);};
const WD=()=>M([['burnt_umber',1],['ultramarine',.55],['titanium_white',.15]],.2);
const WDI=()=>M([['burnt_umber',.9],['ultramarine',.5],['cadmium_orange',.12],['titanium_white',.3]],.2); // inside of an arch, a little warmer
const WS=()=>M([['ultramarine',.8],['cobalt_violet',.5],['burnt_umber',.35],['titanium_white',.6]],.2);
const JAMB=()=>M([['titanium_white',3.2],['naples_yellow',.8],['yellow_ochre',.12]],.15);
const JAMBS=()=>M([['titanium_white',2.2],['cobalt_violet',.4],['naples_yellow',.3]],.15);
// pointed arch opening: x centre, y of the sill (bottom), h height, w width; lit: has a lit left jamb
const WDD=()=>M([['burnt_umber',1],['ultramarine',.6],['alizarin_crimson',.12],['titanium_white',.08]],.2); // deep warm dark inside
function arch(x,yb,h,w,lit,deep){const c=lit?(deep?WDD():WD()):WS();
 // body of the opening
 L([[x,yb,.95],[x+R(-.4,.4),yb-h*.5,1],[x,yb-h*.74,.9]],c,w,{brush:'round',load:lit?1:.75,thin:lit?.4:.6,taper:0,edge:.05});
 // crisp pointed top: two short strokes from the shoulders meeting at the apex
 L([[x-w*.42,yb-h*.7,.9],[x-w*.12,yb-h*.93,.8],[x,yb-h,.5]],c,w*.42,{brush:'round',load:lit?1:.75,thin:.45,taper:0});
 L([[x+w*.42,yb-h*.7,.9],[x+w*.12,yb-h*.93,.8],[x,yb-h,.5]],c,w*.42,{brush:'round',load:lit?1:.75,thin:.45,taper:0});
 if(lit){L([[x-w*.66,yb-1,.95],[x-w*.66,yb-h*.45,1],[x-w*.6,yb-h*.72,.8]],JAMB(),R(5,6.5),{brush:'round',load:1.4,thin:.26,clean:true,taper:0});
  if(p.random()<.5)p.dab({x:x-w*.3,y:yb-h*.98,color:JAMB(),size:R(3,4),brush:'round',load:1.2});}
 else if(p.random()<.3){L([[x-w*.62,yb-2],[x-w*.6,yb-h*.5]],JAMBS(),3.5,{brush:'round',load:.9,thin:.45,taper:[0,.3]});}}
// ---- arcade at the base of the lower drum (skips the entrance) ----
const EX=1372;
for(let a=0.18;a<Math.PI-.15;a+=R(.15,.21)){const u=Math.cos(a);const x=LD.cx+LD.r*u*.985;if(Math.abs(x-EX)<42)continue;
 if(u>.42&&p.random()<.4)continue;const h=R(44,62)*(1-.25*Math.abs(u)),w=R(13,17)*(1-.3*Math.abs(u));arch(x,765,h,w,u<.42,true);}
// ---- grand entrance: a taller pointed arch with pale pilasters and a crown of gold (gold in 47) ----
arch(EX,765,84,30,true,true);
L([[EX-21,764,.9],[EX-21,710,.9],[EX-18,690,.6]],JAMB(),6,{brush:'round',load:1.35,thin:.28,clean:true,taper:[0,.25]});
L([[EX+19,764,.8],[EX+20,712,.8],[EX+17,692,.5]],M([['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.2]],.15),5,{brush:'round',load:1.1,thin:.35,taper:[0,.25]});
earc(EX,700,19,15,Math.PI*1.08,Math.PI*1.92,JAMB(),5,{load:1.2,thin:.3,clean:true});
// ---- windows: grouped, varied, dark warm on the lit wall, nearly lost in shadow ----
function win(x,y,h,w,lit,sun){const c=lit?WD():WS();
 L([[x,y+h,.85],[x+R(-.4,.4),y+h*.45,.9],[x,y+w*.4,.6]],c,w,{brush:'round',load:lit?.95:.7,thin:lit?.45:.62,taper:[0,.3],edge:.1});
 if(lit&&sun)p.dab({x:x-w*.72,y:y+h*.6,color:JAMB(),size:R(4.5,6),brush:'round',load:1.35,angle:Math.PI/2});}
// lower drum: three groups above the arcade
for(const g of [[2.55,2],[2.05,3],[1.45,3],[.95,2]]){const n=g[1];for(let i=0;i<n;i++){const a=g[0]+(i-(n-1)/2)*R(.11,.14);const x=LD.cx+LD.r*Math.cos(a)*.98;const u=Math.cos(a);
  const y=rim(LD,x)+R(18,28);win(x,y,R(18,26),R(8,12)*(1-.2*Math.abs(u)),u<.42,u<-.1);}}
// upper drum: a loose band
for(let a=2.75;a>.3;a-=R(.33,.5)){const u=Math.cos(a);if(u>.45&&p.random()<.5)continue;const x=UD.cx+UD.r*u*.97;win(x,rim(UD,x)+R(16,24),R(16,22),R(7,10)*(1-.2*Math.abs(u)),u<.4,u<-.1);}
// towers and lantern: a few scattered, varied
for(const t of [[1232,560,765],[1772,600,772]]){const cx=t[0];
 for(let row=0;row<3;row++){const y=t[1]+R(28,40)+row*R(56,70);if(y>t[2]-28)continue;
  for(const a of [-.6,-.05,.55]){if(p.random()<.45)continue;const x=cx+52*Math.sin(a);win(x+R(-2,2),y+R(-6,6),R(14,22),R(6,8.5),Math.sin(a)<.4,Math.sin(a)<-.1);}}}
for(const y of [618,650]){win(1872+R(-3,3),y,R(14,18),5,true,true);}
// pavilion arcades: three arches on the left one, a lower row on the right one (softer)
for(const x of [995,1040,1095]){arch(x+R(-3,3),768,R(34,42),R(14,17),true,true);}
for(let x=1900;x<2040;x+=R(36,46)){arch(x,760,R(26,34),R(12,15),x<1985,false);}
