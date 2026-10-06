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

// ---- 35_gardens_trees.body.js ----
// 35_gardens_trees (round 2): cast shadows first; each tree as trunk, shadow mass (cool blue-green, thin), one or two big lit masses (two or three large curved thick warm strokes), sky holes, small touches only at the outer edge; cypresses near the palace; trees and shrubs on the far rim to break the back edge. Then dry.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const Tsh=[['sap_green',1],['ultramarine',.7],['burnt_umber',.3],['titanium_white',.4]];
const Tcore=[['sap_green',.8],['ultramarine',1],['burnt_umber',.4],['dioxazine_purple',.2],['titanium_white',.2]];
const Tmid=[['sap_green',1],['yellow_ochre',.5],['ultramarine',.25],['titanium_white',.5]];
const Tlit=[['sap_green',1],['cadmium_lemon',.5],['yellow_ochre',.6],['titanium_white',1]];
const Thot=[['cadmium_lemon',.7],['yellow_ochre',.6],['sap_green',.5],['titanium_white',1.5]];
const Sky=[['titanium_white',2.6],['naples_yellow',.5],['cobalt_violet',.25]];
const Gshadow=[['sap_green',.9],['ultramarine',.8],['burnt_umber',.2],['cobalt_violet',.2],['titanium_white',.35]];
const Trunk=[['burnt_umber',1],['ultramarine',.4],['titanium_white',.25]];
const Cyp=[['sap_green',.8],['ultramarine',.8],['burnt_umber',.3],['viridian',.15],['titanium_white',.25]];
const CypL=[['sap_green',1],['yellow_ochre',.5],['titanium_white',.7],['ultramarine',.2]];
function castShadow(cx,cy,rx,ry,len){const x0=cx-rx*.2,y0=cy+ry*.8,x1=cx+len,y1=y0+len*.16;
  for(let k=0;k<3;k++){const o=(k-1)*ry*.3;p.stroke({points:[[x0+R(-6,6),y0+o,.9],[lerp(x0,x1,.5),lerp(y0,y1,.5)+o*.8,.8],[x1+R(-10,10),y1+o*.6,.3]],color:M(Gshadow,.18),brush:'filbert',size:ry*R(.5,.7),load:.8,thin:.5,edge:.6,taper:[.1,.5],stir:.75});}
  SB([[x0,y0+ry*.2],[lerp(x0,x1,.6),lerp(y0,y1,.6)],[x1,y1]],ry*.9,.4);}
function tree(cx,cy,rx,ry,o){o=o||{};const s=o.s===undefined?1:o.s;
  // trunk first
  p.stroke({points:[[cx+R(-3,3),cy+ry*.3,.5],[cx+R(-3,3),cy+ry*.9,.9],[cx+R(-2,2),cy+ry*1.3,.6]],color:M(Trunk,.15),brush:'round',size:Math.max(4,rx*.1),load:.95,thin:.45,taper:[.2,.3]});
  // shadow mass: thin cool blue-green over the whole crown, darker core lower right
  cover(ELL(cx,cy,rx,ry,0,18),Math.max(10,rx*.34),(x,y)=>{const d=((x-cx)/rx*.62+(y-cy)/ry*.78);return M(ML(Tsh,Tcore,clamp(.45+d*.8,0,1)),.2);},{dens:2,len:2,angJ:.8,ang:-.4,o:{load:.85,thin:.55,edge:.3,taper:[.2,.2],stir:.7}});
  // the big lit mass: two or three large curved strokes, thick warm yellow-green, around the upper-left of the crown
  const lx=cx-rx*.22,ly=cy-ry*.25;
  for(let k=0;k<3;k++){const r0=[.95,.7,.45][k];const a0=-3.1+R(-.1,.25),a1=-.9+R(-.3,.1);
    earc(lx,ly,rx*r0*.8,ry*r0*.85,a0,a1,M(ML(ML(Tmid,Tlit,.6+k*.2),Thot,k*.15-(1-s)*.4),.18),Math.max(8,rx*R(.22,.3)),{load:1.25,thin:.32,edge:.3,taper:[.15,.2],stir:.55,clean:k===0});}
  // a second, smaller lit mass lower left (a second bough), thinner
  if(o.second!==false)earc(cx-rx*.35,cy+ry*.3,rx*.4,ry*.4,-3,-1.3,M(ML(Tlit,Tmid,.4-(1-s)*.3),.18),Math.max(7,rx*.26),{load:1.1,thin:.35,edge:.35,taper:[.2,.3],stir:.6});
  // melt the turning edge between light and shadow
  BL([[cx-rx*.1,cy-ry*.55],[cx+rx*.3,cy-ry*.05],[cx+rx*.25,cy+ry*.5]],Math.max(10,rx*.38),.45);
  // sky holes: one or two small touches of sky through the crown near its edge
  for(let i=0;i<(rx>45?3:1);i++){const a=R(-2.6,-.4);p.dab({x:cx+Math.cos(a)*rx*R(.55,.8),y:cy+Math.sin(a)*ry*R(.5,.8),color:M(Sky,.1),size:R(4,7),brush:'filbert',load:.9,pressure:.6});}
  // small touches only on the outer edge: lit leaves against the sky top-left, dark notches lower right
  for(let i=0;i<8;i++){const a=R(-3.3,-1.2);const x=cx+Math.cos(a)*rx*R(.92,1.1),y=cy+Math.sin(a)*ry*R(.92,1.1);S(x,y,R(7,14),a+Math.PI/2+R(-.4,.4),M(ML(Tlit,Thot,R(0,.6)),.2),R(4,7),{load:1.1,thin:.35,taper:[.3,.3],stir:.6});}
  for(let i=0;i<4;i++){const a=R(.3,1.3);const x=cx+Math.cos(a)*rx*R(.9,1.05),y=cy+Math.sin(a)*ry*R(.9,1.05);S(x,y,R(7,12),a+Math.PI/2+R(-.4,.4),M(Tcore,.15),R(4,7),{load:.8,thin:.5,taper:[.3,.3]});}}
function cypress(bx,by,h,w){// tall slender dark column, pointed, lit thin on the left, a long cool shadow to the lower right
  for(let k=0;k<2;k++)p.stroke({points:[[bx+R(-2,2),by+2+k*2,.9],[bx+h*.45,by+4+h*.09+k*2,.8],[bx+h*.9,by+6+h*.18+k*2,.25]],color:M(Gshadow,.18),brush:'filbert',size:w*R(.45,.6),load:.8,thin:.55,edge:.6,taper:[.05,.5],stir:.75});
  p.stroke({points:[[bx,by,.5],[bx+R(-1,1),by-h*.5,.9],[bx+R(-1,1),by-h,.15]],color:M(Trunk,.15),brush:'round',size:Math.max(2,w*.15),load:.9,thin:.5,taper:[0,.5]});
  for(let k=0;k<3;k++){const off=(k-1)*w*.3;p.stroke({points:[[bx+off*.5,by-2,.6],[bx+off,by-h*.3,.95],[bx+off*.8,by-h*.7,.8],[bx+off*.2,by-h,.1]],color:M(k===0?ML(Cyp,Tcore,.4):Cyp,.15),brush:'filbert',size:w*R(.5,.7),load:.9,thin:.5,taper:[.05,.45],edge:.3,stir:.7});}
  p.stroke({points:[[bx-w*.32,by-h*.1,.5],[bx-w*.3,by-h*.5,.9],[bx-w*.15,by-h*.92,.1]],color:M(CypL,.15),brush:'filbert',size:w*.3,load:1.1,thin:.35,taper:[.1,.5],edge:.2,stir:.6,clean:true});
  for(let i=0;i<3;i++){const y=by-h*R(.2,.85);S(bx+R(-w*.5,w*.5),y,R(5,9),R(-.5,.5),M(ML(Cyp,CypL,R(0,.5)),.2),R(3,5),{load:1,thin:.4,taper:[.3,.3]});}}
// ---- cast shadows on the turf
castShadow(1030,680,70,45,150);castShadow(1960,665,80,50,160);castShadow(1198,795,48,28,100);castShadow(1890,792,50,28,100);castShadow(895,735,42,26,80);castShadow(2085,748,38,22,60);
castShadow(1100,666,34,18,50);castShadow(1700,665,22,12,30);castShadow(1860,672,30,16,45);castShadow(2060,712,24,13,36);
// ---- rim trees and shrubs on the far edge (break the ruled back contour)
tree(1100,666,34,18,{s:.8,second:false});tree(1700,665,22,12,{s:.75,second:false});tree(1860,672,30,16,{s:.75,second:false});tree(2060,712,24,13,{s:.7,second:false});
for(const b of [[975,692,26,12],[1345,648,16,7],[1810,668,20,9],[1995,690,14,7],[2125,742,18,9]]){
  cover(ELL(b[0],b[1],b[2],b[3],0,12),Math.max(6,b[2]*.4),()=>M(Tsh,.2),{dens:1.8,len:1.8,angJ:.8,o:{load:.85,thin:.5,edge:.3,stir:.7}});
  earc(b[0],b[1],b[2]*.7,b[3]*.7,-3,-1.3,M(ML(Tlit,Tmid,.4),.15),Math.max(5,b[2]*.3),{load:1.1,thin:.35,taper:[.25,.3],stir:.55,clean:true});}
// ---- main trees
tree(1030,680,70,45,{s:1});
tree(1960,665,80,50,{s:.85});
tree(1198,795,48,28,{s:1});
tree(1890,792,50,28,{s:.8});
tree(895,735,42,26,{s:1});
tree(2085,748,38,22,{s:.75});
// ---- cypresses near the palace, varied heights
cypress(1172,772,95,18);cypress(1291,790,74,15);cypress(1700,790,82,16);cypress(2070,770,56,12);cypress(1150,792,60,13);
// ---- shrubs in the garden
for(const b of [[1660,805,24,11],[1050,782,18,9],[1395,812,20,10],[1560,808,18,9],[2000,796,16,8],[1105,797,14,7],[1150,818,14,7],[1790,800,14,7]]){
  cover(ELL(b[0],b[1],b[2],b[3],0,12),Math.max(6,b[2]*.4),()=>M(Tsh,.2),{dens:1.8,len:1.8,angJ:.8,o:{load:.9,thin:.5,edge:.3,stir:.7}});
  earc(b[0],b[1],b[2]*.7,b[3]*.7,-3,-1.3,M(Tlit,.15),Math.max(5,b[2]*.3),{load:1.15,thin:.35,taper:[.25,.3],stir:.55,clean:true});
  p.stroke({points:[[b[0]-b[2]*.3,b[1]+b[3]*.9,.8],[b[0]+b[2]*.9,b[1]+b[3]*1.1,.3]],color:M(Gshadow,.15),brush:'filbert',size:b[3]*.6,load:.7,thin:.5,edge:.6,taper:[.1,.5]});}
p.dry();
