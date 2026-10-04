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
// 1) halo: scumbled pale violet-blue light, offset toward the lower left where Marle is pulled, kept tight
for(let i=0;i<150;i++){const a=R(0,6.28),r=R(70,130);const f=(r-70)/60;const q=SPT(a,r,TILT);
  S(q[0],q[1],R(22,52),a+1.57+R(-.5,.5),M([['cobalt_violet',.5-.25*f],['cerulean',.45],['titanium_white',1.4+1.6*f],['ultramarine',.1]]),R(9,20),{brush:'filbert',load:.5,thin:.7,opacity:R(.35,.7)*(1.2-f)});}
// light bleeding into the leaves behind: pale blue-violet licks on dark foliage
for(let i=0;i<60;i++){const a=R(3.6,6.0),r=R(88,125);const q=SPT(a,r,TILT);S(q[0],q[1],R(10,22),a+R(-.8,.8),M([['cerulean',.6],['titanium_white',1.3],['cobalt_violet',.3]]),R(4,8),{brush:'filbert',load:.8,thin:.5,opacity:R(.45,.8)});}
// 2) dark vortex body: deep blue-violet mass swirled in the direction of rotation
for(let i=0;i<60;i++){const a=R(0,6.28),r=R(20,76);const q=SPT(a,r,TILT);const f=r/76;
  S(q[0],q[1],R(26,50),a+1.45+R(-.3,.3),f<.5?cMid():cDark(),R(12,22),{brush:'filbert',load:1,thin:.45,opacity:R(.85,1),bend:R(-6,6)});}
// 3) spiral arms (generator)
function arm(a0,turns,r0,r1,w0,w1,colf,o){o=o||{};const n=15,pts=[];for(let j=0;j<n;j++){const f=j/(n-1);const a=a0+f*turns*6.283;const r=lerp(r0,r1,Math.pow(f,.85))+R(-1.5,1.5);const q=SPT(a,r,TILT);pts.push([q[0],q[1],f]);}
  for(let s=0;s+4<n;s+=3){const seg=pts.slice(s,s+5);const f=seg[2][2];const w=lerp(w0,w1,f);
    F(seg.map((q,i)=>[q[0],q[1],(o.pr||.9)*(.55+.45*Math.sin(Math.PI*(i/4)))]),colf(f),w*R(.85,1.15),Object.assign({brush:'filbert',load:.95,thin:.45},o.o||{}));}}
for(let k=0;k<7;k++)arm(R(0,6.28),R(.8,1.15),R(72,84),R(14,22),R(15,20),R(5,8),f=>f<.5?cMid():M([['cobalt_violet',.8],['ultramarine',.4],['titanium_white',.9]]));
for(let k=0;k<11;k++)arm(R(0,6.28),R(.7,1.1),R(68,80),R(16,26),R(9,13),R(3,6),f=>f<.55?cOut():cBri(),{o:{load:1.05}});
for(let k=0;k<4;k++)arm(R(0,6.28),R(.6,.9),R(66,78),R(20,30),R(7,10),R(3,5),f=>M([['cerulean',.7],['viridian',.2],['titanium_white',1.6]]),{o:{load:1.05,opacity:.9}});
for(let k=0;k<4;k++)arm(R(0,6.28),R(.6,.9),R(62,76),R(20,30),R(7,10),R(3,5),f=>M([['quinacridone_rose',.45],['cobalt_violet',.6],['titanium_white',1.2]]),{o:{load:1.05,opacity:.85}});
for(let k=0;k<10;k++)arm(R(0,6.28),R(.6,.95),R(60,74),R(18,30),R(5,9),R(2.5,4.5),f=>cWh(),{o:{load:1.3,thin:.35},pr:1});
// dark gaps between bright arms (so the light reads)
for(let k=0;k<5;k++)arm(R(0,6.28),R(.5,.8),R(54,66),R(22,30),R(5,8),R(3,4),f=>cDark(),{o:{opacity:.85}});
// ragged flung-out streaks beyond the rim (broken colour, thinning)
for(let i=0;i<70;i++){const a=R(0,6.28),r=R(72,100);const q=SPT(a,r,TILT);const L=R(14,40);
  S(q[0],q[1],L*.6,a+1.2+R(-.25,.25),R(0,1)<.5?cOut():cBri(),R(2.5,6),{brush:'filbert',load:.9,thin:.45,opacity:R(.5,.95),bend:R(-6,6)});}
// fine filaments inside the arms
for(let i=0;i<260;i++){const a=R(0,6.28),r=R(20,70);const q=SPT(a,r,TILT);const f=r/70;
  S(q[0],q[1],R(8,22),a+1.35+R(-.35,.35),f>.6?cOut():(R(0,1)<.5?cBri():cMid()),R(2,5),{brush:'filbert',load:1,thin:.4,opacity:R(.6,1),bend:R(-4,4)});}
// bright inner glow: graded from cyan-white to violet, crisp near the core
for(let i=0;i<130;i++){const a=R(0,6.28),r=R(6,40);const q=SPT(a,r,TILT);const f=r/34;
  S(q[0],q[1],R(10,22),a+1.5+R(-.3,.3),f<.45?cWh():f<.75?cBri():cOut(),R(4,9),{brush:'filbert',load:1.1,thin:.4,opacity:R(.8,1),bend:R(-3,3)});}
// 4) inner ring and crisp bright core
for(let k=0;k<12;k++){const a=k/12*6.283+R(-.2,.2);const q1=SPT(a,36,TILT),q2=SPT(a+.6,37,TILT);F([[q1[0],q1[1],.7],[(q1[0]+q2[0])/2+R(-1,1),(q1[1]+q2[1])/2+R(-1,1),1],[q2[0],q2[1],.6]],cBri(),R(4,7),{brush:'filbert',load:1.15,thin:.4});}
cover(ELL(GX+1,GY,22,19,TILT,12),5,cWh,{ang:0,angJ:3,dens:1.6,len:1.6,brush:'filbert',o:{load:1.3,thin:.35}});
p.dab({x:GX,y:GY,size:15,color:M([['titanium_white',6],['cerulean',.1]]),brush:'round',load:1.5});
p.dab({x:GX+1,y:GY-1,size:8,color:'titanium_white',brush:'round',load:1.5});
// warm complement sparks near the core and rim
for(let i=0;i<14;i++){const a=R(0,6.28),r=R(18,60);const q=SPT(a,r,TILT);p.dab({x:q[0],y:q[1],size:R(3,5),color:M([['cadmium_lemon',.7],['titanium_white',1.5],['naples_yellow',.3]]),brush:'round',load:1.2,pressure:.8});}
p.dry();
