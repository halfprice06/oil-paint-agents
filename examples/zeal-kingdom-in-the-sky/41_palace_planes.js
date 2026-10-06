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

// ---- 41_palace_planes.body.js ----
// 41: cornices (varied bands, no ring of blocks), plinths and contact shadows, bridges to the towers, a few broken stone courses on the lit sides only
p.wipe();
const LD={cx:1490,r:190,cy:600,ry:36,bot:765},UD={cx:1490,r:120,cy:500,ry:26,bot:605};
const CRM=()=>M([['titanium_white',3.2],['naples_yellow',.8],['yellow_ochre',.1]],.18);
const LAV=()=>M([['titanium_white',2],['ultramarine',.45],['cobalt_violet',.6]],.18);
const UNL=()=>M([['ultramarine',.5],['cobalt_violet',.45],['burnt_umber',.3],['titanium_white',1]],.2);
const DKS=()=>M([['ultramarine',.8],['cobalt_violet',.6],['burnt_umber',.3],['titanium_white',.6]],.2);
function cornice(d,size,term){
 for(let a=0.05;a<Math.PI-.05;a+=R(.15,.35)){if(p.random()<.3)continue;const u=Math.cos(a);
  earc(d.cx,d.cy+size*.8,d.r,d.ry,a-R(.02,.05),a+R(.12,.3),u>term?DKS():UNL(),size*R(.3,.5),{load:.6,thin:.6,edge:.4,opacity:.7,taper:[.2,.3]});}
 for(let a=0.06;a<Math.PI-.05;a+=R(.1,.3)){const u=Math.cos(a);const lit=u<term;if(!lit&&p.random()<.35)continue;
  earc(d.cx,d.cy+R(-1,1),d.r,d.ry,a-R(0,.04),a+R(.08,.3),lit?CRM():LAV(),size*R(.7,1.3),{load:lit?1.3:.9,thin:lit?.3:.5,clean:lit,taper:[.1,.3],brush:p.random()<.5?'flat':'filbert'});}
}
cornice(LD,10,.42);
cornice(UD,8,.4);
// tower cornices under the spires, and the lantern's
for(const t of [[1232,560,52,12],[1772,600,52,12],[1878,600,20,5]]){const d={cx:t[0],cy:t[1],r:t[2],ry:t[3]};
 for(let a=0.1;a<Math.PI-.1;a+=R(.3,.6)){const u=Math.cos(a);if(p.random()<.4)continue;earc(d.cx,d.cy+5,d.r,d.ry,a,a+R(.2,.4),u>.4?DKS():UNL(),3.5,{load:.6,thin:.6,edge:.4,opacity:.7});}
 for(let a=0.1;a<Math.PI-.1;a+=R(.25,.5)){const u=Math.cos(a);const lit=u<.4;if(!lit&&p.random()<.4)continue;earc(d.cx,d.cy,d.r,d.ry,a,a+R(.2,.45),lit?CRM():LAV(),R(5,7.5)*(d.r/52+.4),{load:lit?1.3:.9,thin:.35,clean:lit});}}
// plinths and contact shadows
const PL=()=>M([['titanium_white',2.4],['naples_yellow',.4],['cobalt_violet',.3],['raw_umber',.12]],.2);
const CT=()=>M([['ultramarine',.7],['burnt_umber',.5],['sap_green',.3],['titanium_white',.2]],.2);
function plinth(x0,x1,yb,term){for(let x=x0;x<x1;x+=R(26,44)){const l=R(30,56);const lit=x<term;S(x+l/2,yb-6+R(-1,1),l,0,lit?PL():LAV(),R(7,10),{load:.9,thin:.45,brush:'flat',taper:[.1,.2]});}
 for(let x=x0-2;x<x1+2;x+=R(28,48)){const l=R(34,60);S(x+l/2,yb+3+R(-1,1),l,R(-.02,.02),CT(),R(5,8),{load:.7,thin:.6,edge:.4,taper:[.15,.3]});}}
plinth(1300,1680,765,1560);plinth(1180,1285,765,1255);plinth(1720,1825,772,1795);plinth(960,1160,770,1118);plinth(1880,2050,760,1985);
// bridges: a slender deck joining each tower to the drum, lit top, shadowed underside, small arches below
function bridge(x0,x1,y,lit){const c=lit?CRM():LAV();
 S((x0+x1)/2,y,x1-x0+6,0,c,6,{brush:'flat',load:1.2,thin:.35,clean:lit});
 S((x0+x1)/2,y+7,x1-x0+2,0,lit?UNL():DKS(),5,{load:.7,thin:.55,edge:.3,opacity:.8});
 const n=Math.max(1,Math.round((x1-x0)/18));for(let i=0;i<n;i++){const x=lerp(x0,x1,(i+.5)/n);L([[x,y+22,.8],[x,y+10,.7]],M([['burnt_umber',.8],['ultramarine',.7],['titanium_white',.3]],.2),R(7,9),{brush:'round',load:.8,thin:.5,taper:[0,.3]});}
 for(let i=1;i<n;i++){const x=lerp(x0,x1,i/n);L([[x,y+24],[x,y+9]],c,R(4,5),{brush:'round',load:1.1,thin:.4});}}
bridge(1680,1722,644,false);
bridge(1283,1302,626,true);
// broken dry-brush stone courses: three or four per form, lit side only, varied length and spacing
const CO=()=>M([['titanium_white',2.6],['naples_yellow',.5],['cobalt_violet',.25],['raw_umber',.12]],.25);
function courses(d,ys,aRange){for(const y0 of ys){let a=aRange[0]+R(0,.2);while(a<aRange[1]){const len=R(.08,.3);if(p.random()<.4){a+=len+R(.05,.2);continue;}
  earc(d.cx,y0+R(-2,2),d.r*.985,d.ry*.95,a,a+len,CO(),R(3.5,5.5),{load:R(.25,.45),thin:.45,edge:.35,taper:[.2,.3],brush:'flat'});a+=len+R(.05,.25);}}}
courses({cx:1490,r:190,ry:36},[656,672,690,744],[1.4,2.95]);
courses({cx:1490,r:120,ry:26},[548,566,586],[1.4,2.9]);
courses({cx:1232,r:52,ry:12},[598,640,684,728],[1.5,2.9]);
courses({cx:1772,r:52,ry:12},[636,678,722],[1.5,2.9]);
