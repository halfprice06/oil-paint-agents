const _P0=p;p=Object.create(_P0);{const K0=2;p.width=1200;p.height=800;
p.stroke=s=>_P0.stroke(Object.assign({},s,{points:s.points.map(q=>q.length>2?[q[0]*K0,q[1]*K0,q[2]]:[q[0]*K0,q[1]*K0]),size:(s.size||20)*K0}));
p.dab=s=>_P0.dab(Object.assign({},s,{x:s.x*K0,y:s.y*K0,size:(s.size||20)*K0}));}
const R=(a,b)=>p.rand(a,b);
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.8,1.2)]);
const pr=(i,n)=>{const f=i/(n-1);return .35+.65*Math.sin(Math.PI*Math.min(1,Math.max(0,f*.9+.05)));};
function seg(x,y,len,ang,bend,n){n=n||4;const pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;const b=bend*(t*t-.08);pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*b,y+Math.sin(ang)*len*t+Math.cos(ang)*b,pr(i,n)]);}return pts;}
const F=(pts,c,size,o)=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size:size,load:1,thin:.5},o||{}));
const S=(x,y,len,ang,c,size,o)=>{o=o||{};const b=o.bend===undefined?R(-5,5):o.bend;const n=o.n||4;delete o.bend;delete o.n;return F(seg(x,y,len,ang,b,n),c,size,o);};
const BL=(pts,size,brush)=>p.stroke({points:pts,brush:brush||'filbert',size:size,load:0,color:'titanium_white'});
// polyline through points -> multi-point stroke with pressure
const PL=(pts,c,size,o)=>F(pts.map((q,i)=>[q[0],q[1],q[2]===undefined?pr(i,pts.length):q[2]]),c,size,o);
const area=poly=>{let a=0;for(let i=0;i<poly.length;i++){const q=poly[i],r=poly[(i+1)%poly.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
const inPoly=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
function cover(poly,size,col,o){o=o||{};const dens=o.dens||1,lenf=o.len||2.5;const n=Math.max(1,Math.round(area(poly)*dens*1.5/(size*size*lenf*.7)));
 const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 let k=0,g=0;while(k<n&&g++<n*40){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;
  const a=(o.ang||0)+R(-1,1)*(o.angJ===undefined?.3:o.angJ);const sz=size*R(.75,1.25);
  const oo=Object.assign({brush:'flat'},o.o||{});if(o.brush)oo.brush=o.brush;
  let L=sz*lenf*R(.7,1.3);const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  F(seg(x,y,L,a,R(-4,4)*size/20),col(x,y),sz,oo);}
 return n;}
const ELL=(cx,cy,rx,ry,rot,n)=>{n=n||20;rot=rot||0;const pts=[];for(let i=0;i<n;i++){const a=i/n*6.2832;const x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return pts;};
const lerp=(a,b,t)=>a+(b-a)*t;
// wobbling line from a to b
function WL(x0,y0,x1,y1,c,size,o){const n=4,pts=[];for(let i=0;i<n;i++){const t=i/(n-1);pts.push([lerp(x0,x1,t)+R(-1.2,1.2),lerp(y0,y1,t)+R(-1.2,1.2),.5+.4*Math.sin(Math.PI*t)]);}return F(pts,c,size,o);}
// tapered limb/tube painted as light / mid / shade strips along its length (light from the left)
function tube(p0,p1,w0,w1,cols,o){o=o||{};const dx=p1[0]-p0[0],dy=p1[1]-p0[1];const L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L;let nx=-uy,ny=ux;if(nx>0){nx=-nx;ny=-ny;}
  const ang=Math.atan2(dy,dx);const n=Math.max(2,Math.round(L/((o.step||9)*1.8)));
  for(let i=0;i<n;i++){const t=(i+.5)/n;const w=lerp(w0,w1,t);const cx=lerp(p0[0],p1[0],t),cy=lerp(p0[1],p1[1],t);const seglen=L/n*1.8;
    const strips=[[-.27,cols.lit,.42,.95],[0,cols.mid,.5,1],[.3,cols.shade,.38,.9]];
    for(const [off,cf,wf,ld] of strips){S(cx+nx*w*off+R(-.4,.4),cy+ny*w*off+R(-.4,.4),seglen*R(.9,1.3),ang+R(-.04,.04),cf(),Math.max(1.5,w*wf*R(.85,1.15)),Object.assign({brush:'filbert',load:ld,thin:.45,bend:R(-1,1)},o.o||{}));}
  }
  if(!o.noblend&&Math.max(w0,w1)>7){for(let k=0;k<3;k++){const off=(k==1?.12:k==2?0:-.1)*Math.max(w0,w1);BL([[p0[0]+nx*off,p0[1]+ny*off,.7],[lerp(p0[0],p1[0],.5)+nx*off,lerp(p0[1],p1[1],.5)+ny*off,.8],[p1[0]+nx*off,p1[1]+ny*off,.5]],Math.max(3,Math.max(w0,w1)*.42));}}
  if(cols.rim){for(let i=0;i<Math.max(2,Math.round(L/22));i++){const t=R(.1,.9);const w=lerp(w0,w1,t);S(lerp(p0[0],p1[0],t)-nx*w*.36,lerp(p0[1],p1[1],t)-ny*w*.36,R(8,16),ang,cols.rim(),Math.max(1.4,w*.13),{brush:'filbert',load:1.1,thin:.4,opacity:R(.6,.95),bend:0});}}
}
// THE TIME GATE: luminous asymmetric vortex, bright core, broken-colour arms; light on stage
const GX=885,GY=390,PHI=2.75;
const rot=(x,y,t)=>[x*Math.cos(t)-y*Math.sin(t),x*Math.sin(t)+y*Math.cos(t)];
const SPT=(a,r,tilt)=>{const bulge=1+.28*Math.cos(a-PHI)+.07*Math.cos(2*a+1);const x=Math.cos(a)*r*bulge*1.05*1.38,y=Math.sin(a)*r*bulge*.93*1.38;const q=rot(x,y,tilt);return [GX+q[0],GY+q[1]];};
const cOut=()=>M([['cobalt_violet',.7],['titanium_white',1.3],['cerulean',.45],['ultramarine',.15]]);
const cMid=()=>M([['ultramarine',1],['cobalt_violet',.6],['dioxazine_purple',.25],['titanium_white',.2]]);
const cDark=()=>M([['ultramarine',1],['dioxazine_purple',.7],['paynes_grey',.35],['cobalt_violet',.1]]);
const cBri=()=>M([['cerulean',.7],['titanium_white',2.2],['cobalt_violet',.2]]);
const cWh=()=>M([['titanium_white',4],['cerulean',.2],['naples_yellow',.1]]);
const TILT=-.35;
// 5) electric arcs from pod windows to the gate rim
function arc(x0,y0,x1,y1){const n=6,pts=[];for(let i=0;i<n;i++){const t=i/(n-1);const j=Math.sin(Math.PI*t)*R(-7,7);pts.push([lerp(x0,x1,t)+R(-1,1),lerp(y0,y1,t)+j,.9]);}
  F(pts,M([['cerulean',.5],['titanium_white',2.5],['cobalt_violet',.1]]),R(2.2,3.4),{brush:'round',load:1.2,thin:.4});
  F(pts.map(q=>[q[0]+1,q[1]+1,.6]),M([['cobalt_violet',.8],['titanium_white',1.2]]),R(5,7),{brush:'round',load:.7,thin:.6,opacity:.45});}
for(let i=0;i<3;i++){arc(768,424,810+R(-4,4),400+R(-20,20));arc(961,424,950+R(-4,4),400+R(-20,20));}
arc(735,388,800,366);arc(990,388,932,366);
// 6) glow on the pods' gate-facing sides, and on cables/deck
for(let i=0;i<14;i++){const y=R(404,498);S(787+R(-2,2),y,R(8,16),1.57+R(-.1,.1),M([['cobalt_violet',.4],['cerulean',.5],['titanium_white',1.8]]),R(2.5,4.5),{brush:'filbert',load:.9,thin:.45,opacity:R(.4,.8)});
  S(938+R(-2,2),y,R(8,16),1.57+R(-.1,.1),M([['cobalt_violet',.4],['cerulean',.5],['titanium_white',1.8]]),R(2.5,4.5),{brush:'filbert',load:.9,thin:.45,opacity:R(.4,.8)});}
// stage deck glow: cool violet-white pool, brightest below the gate
for(let i=0;i<70;i++){const x=R(790,935),y=R(486,513);const d=Math.hypot((x-GX)/75,(y-503)/16);if(d>1.05&&R(0,1)<.7)continue;
  S(x,y,R(10,30),R(-.08,.08),M([['cobalt_violet',.45],['cerulean',.45],['titanium_white',1.4+(1-Math.min(1,d))*1.2],['ultramarine',.05]]),R(3,6),{brush:'flat',load:.8,thin:.55,opacity:R(.25,.55)});}
// sparkles and flying motes
for(let i=0;i<110;i++){const a=R(0,6.28),r=R(70,175)*R(.8,1.1);const q=SPT(a,r,TILT);if(q[1]>492)continue;
  const k=R(0,1);p.dab({x:q[0],y:q[1],size:R(1.8,4.5),color:k<.55?M([['titanium_white',2.5],['cerulean',.3]]):k<.85?M([['cobalt_violet',.5],['titanium_white',1.8]]):M([['cadmium_lemon',.6],['titanium_white',1.6]]),brush:'round',load:1.2,pressure:R(.5,.9)});}
p.dry();
