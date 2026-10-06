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
// 23 deck: weathered boards in perspective (rays to the vanishing point), piece by piece. Lit bevel on the sunward edge of every board, dark gap, butt joints staggered, grain along the board, a few knots, worn lighter paths and darker damp boards.
p.wipe();p.dry();const pk=a=>a[Math.floor(R(0,a.length))%a.length];
const VPX=1370,VPY=830,YF=1097,YB=978,WF=34;
const sc=y=>(y-VPY)/(YF-VPY);
const xAt=(xf,y)=>VPX+(xf-VPX)*sc(y);
const yOfD=d=>VPY+1648/d,dOfY=y=>1648/(y-VPY);
const WOOD=[ [['burnt_sienna',1],['raw_umber',.6],['titanium_white',.2]],
 [['raw_umber',1],['burnt_sienna',.7],['titanium_white',.25],['ultramarine',.06]],
 [['venetian_red',1],['burnt_umber',.7],['titanium_white',.22]],
 [['van_dyke_brown',1],['burnt_sienna',.55],['titanium_white',.16]],
 [['burnt_sienna',1],['raw_umber',.4],['yellow_ochre',.1],['titanium_white',.34]] ];
// cold light of the gate across the middle, warm sun at the ends: tone shift 0 (warm) .. 1 (cool violet) by x
const coolAt=(x,y)=>clamp(1-Math.abs(x-1200)/900,0,1)*clamp(1.15-(y-YB)/200,.25,1);
const wcol=(x,y,j)=>{const cl=coolAt(x,y);const w=pk(WOOD).map(a=>[a[0],a[1]*(1+R(-j,j))]);return w.concat([['ultramarine',cl*.22],['dioxazine_purple',cl*.1],['titanium_white',cl*.35]]);};
const boards=[];for(let k=-42;k<=98;k++)boards.push(k);
for(const k of boards){const xf=k*WF+R(-.8,.8);const xm=xAt(xf,YB),xm2=xAt(xf,YF);if(Math.max(xm,xm2)<-60||Math.min(xm,xm2)>2460)continue;
 // pieces along the depth
 let d=dOfY(YB+.01);const dEnd=dOfY(YF);const bnds=[d];d-=R(.2,2.6);while(d>dEnd+.4){bnds.push(d);d-=R(1.6,3.1);}bnds.push(dEnd);
 const dark=R(0,1)<.14,worn=R(0,1)<.18;
 for(let i=0;i<bnds.length-1;i++){const da=bnds[i],db=bnds[i+1];if(db>=da)continue;
  const ya=yOfD(da),yb=Math.min(yOfD(db),YF+3);const ym=(ya+yb)/2;const wd=WF*sc(ym)*.94;
  const base=wcol(xAt(xf,ym),ym,.16);const col=dark?base.concat([['van_dyke_brown',.6]]):worn?base.concat([['titanium_white',.4],['yellow_ochre',.2]]):base;
  const x1=xAt(xf,ya),x2=xAt(xf,yb);
  p.stroke({points:[[x1,ya,.9],[(x1+x2)/2,ym,.95],[x2,yb,.9]],color:col,brush:'flat',size:wd,angle:0,load:R(.95,1.15),thin:.35,taper:0,edge:.12,stir:.35});
  // grain: long streaks following the board, dark and light, dry
  const ng=Math.max(1,Math.round(wd/7));for(let g=0;g<ng;g++){const off=R(-.4,.4)*wd;const t0=R(0,.35),t1=R(.65,1);const xa=xAt(xf+off/sc(ym),lerp(ya,yb,t0)),xb=xAt(xf+off/sc(ym),lerp(ya,yb,t1));
   const lt=R(0,1)<.4;p.stroke({points:[[xa,lerp(ya,yb,t0),.7],[(xa+xb)/2+R(-1,1),ym,.8],[xb,lerp(ya,yb,t1),.6]],color:lt?M([['burnt_sienna',1],['titanium_white',.9],['yellow_ochre',.15]],.3):M([['van_dyke_brown',1],['burnt_umber',.6],['ultramarine',.1]],.3),brush:'flat',size:clamp(wd*R(.07,.16),1.6,5),load:R(.35,.7),thin:.3,opacity:R(.25,.5),taper:[.3,.4],scumble:lt});}
  // butt joint at the near end of the piece (not at the very front)
  if(i<bnds.length-2){const yj=yOfD(db);const xj=xAt(xf,yj);p.stroke({points:[[xj-wd*.5,yj,.8],[xj,yj+.3,.9],[xj+wd*.5,yj,.8]],color:M([['van_dyke_brown',1],['ultramarine',.15]],.2),brush:'flat',size:clamp(2.6*sc(yj)+1,1.8,4.5),load:1,thin:.3,opacity:.85,taper:.05});
   p.stroke({points:[[xj-wd*.5,yj+2.2*sc(yj)+.8,.7],[xj+wd*.5,yj+2.2*sc(yj)+.8,.7]],color:M([['yellow_ochre',1],['titanium_white',1]],.2),brush:'flat',size:1.8,load:.9,thin:.3,opacity:.4,taper:.2});}
  if(R(0,1)<.045){const ky=lerp(ya,yb,R(.2,.8)),kx=xAt(xf+R(-.25,.25)*wd/sc(ym),ky);const ks=wd*R(.22,.36);
   p.stroke({points:[[kx,ky-ks*.35,.8],[kx+R(-1,1),ky,1],[kx,ky+ks*.35,.8]],color:M([['van_dyke_brown',1],['burnt_umber',.5],['ultramarine',.1]],.2),brush:'filbert',size:ks,load:1,thin:.3,opacity:.85,taper:.3});
   p.stroke({points:[[kx-ks*.5,ky-ks*.1,.6],[kx,ky-ks*.7,.8],[kx+ks*.5,ky-ks*.1,.6]],color:M([['yellow_ochre',1],['titanium_white',.5]],.3),brush:'round',size:clamp(ks*.12,1.4,3),load:.8,thin:.3,opacity:.35,taper:.3});}}
 // seams between boards: a dark gap, broken, with the lit bevel on its sunward (left) side
 const xs=xf+WF/2;let y0=YB;while(y0<YF-4){const y1=Math.min(YF,y0+R(60,160));const s0=sc(y0),s1=sc(y1);const wgap=clamp(3*(s0+s1)/2+.8,1.4,4);
  p.stroke({points:[[xAt(xs,y0),y0,.8],[xAt(xs,(y0+y1)/2),(y0+y1)/2,.9],[xAt(xs,y1),y1,.8]],color:M([['van_dyke_brown',1],['ultramarine',.2],['paynes_grey',.15]],.2),brush:'flat',size:wgap,load:1,thin:.3,opacity:R(.7,.95),taper:[.15,.25]});
  p.stroke({points:[[xAt(xs-WF*.16,y0),y0,.7],[xAt(xs-WF*.16,(y0+y1)/2),(y0+y1)/2,.8],[xAt(xs-WF*.16,y1),y1,.6]],color:M([['yellow_ochre',1],['titanium_white',.9],['cadmium_orange',.12]],.25),brush:'flat',size:clamp(wgap*.7,1.2,3),load:.9,thin:.3,opacity:R(.25,.5),taper:[.3,.4]});
  y0=y1+R(0,14);}
}
p.dry();
