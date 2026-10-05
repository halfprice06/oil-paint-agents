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
// BLOCK-IN: big masses, dark to light, wet
// far town / hazy tree line
cover([[-20,305],[1220,298],[1220,365],[-20,372]],42,(x,y)=>M([['cerulean',.5],['cobalt_violet',.35],['sap_green',.25],['titanium_white',1.6],['naples_yellow',.3]]),{ang:0,dens:1.2,o:{load:.8,thin:.6}});
// GROUND: warm sun patches and violet shadow bands
const sunG=()=>M([['yellow_ochre',.3],['naples_yellow',.3],['titanium_white',1.7],['raw_sienna',.3],['cobalt_violet',.08],['cadmium_orange',.04]]);
const shG=()=>M([['ultramarine',.35],['cobalt_violet',.35],['burnt_sienna',.35],['titanium_white',1],['yellow_ochre',.2]]);
cover([[-20,395],[1220,395],[1220,820],[-20,820]],58,(x,y)=>R(0,1)<.5?sunG():shG(),{ang:.05,angJ:.35,dens:1.3,o:{load:.9,thin:.65}});
// tree mass behind the stage: dark so the gate pops
const treeD=(x,y)=>M([['sap_green',.8],['ultramarine',.6],['viridian',.25],['burnt_umber',.35],['titanium_white',.12]]);
cover([[555,355],[590,285],[670,240],[760,222],[850,232],[940,236],[1015,275],[1045,355],[1045,470],[555,470]],40,treeD,{ang:-.5,angJ:.9,dens:1.3,o:{load:.85,thin:.55}});
// top-right foliage
cover([[870,-20],[1220,-20],[1220,235],[1120,205],[1050,155],[960,135],[900,75]],44,(x,y)=>M([['sap_green',.9],['ultramarine',.5],['burnt_umber',.3],['viridian',.2]]),{ang:-.4,angJ:1,dens:1.3,o:{load:.9,thin:.5}});
// tent A and B
cover([[318,445],[442,272],[568,445]],28,(x,y)=>M([['vermilion',.7],['cadmium_red',.4],['alizarin_crimson',.1],['titanium_white',.7],['yellow_ochre',.2]]),{ang:-.9,angJ:.5});
cover([[980,425],[1085,282],[1220,298],[1220,425]],30,(x,y)=>M([['cobalt_blue',.6],['ultramarine',.3],['titanium_white',.9],['cobalt_violet',.15]]),{ang:-.9,angJ:.5});
// tower block-in: stone pillars (shadow right), roof, interior dark
cover([[96,150],[140,150],[142,445],[96,445]],22,()=>M([['yellow_ochre',.6],['raw_sienna',.4],['titanium_white',.8],['burnt_umber',.2]]),{ang:1.57,angJ:.2,dens:1.6,o:{thin:.6}});
cover([[220,150],[266,150],[266,445],[218,445]],22,()=>M([['burnt_umber',.5],['cobalt_violet',.5],['ultramarine',.3],['titanium_white',.8],['yellow_ochre',.2]]),{ang:1.57,angJ:.2,dens:1.6,o:{thin:.6}});
cover([[140,160],[220,160],[220,420],[140,420]],30,()=>M([['cerulean',.6],['titanium_white',1.5],['naples_yellow',.3],['cobalt_violet',.1]]),{ang:0,o:{thin:.6}});
cover([[74,155],[182,52],[292,155],[250,172],[110,172]],22,(x)=>x<182?M([['burnt_sienna',.8],['raw_sienna',.5],['yellow_ochre',.3],['titanium_white',.3]]):M([['burnt_umber',.8],['burnt_sienna',.5],['cobalt_violet',.3],['titanium_white',.3]]),{ang:-.6,angJ:.2,o:{thin:.5}});
// bell (bronze)
cover(ELL(180,225,42,50,0),26,(x,y)=>x<175?M([['yellow_ochre',1],['cadmium_yellow',.5],['raw_sienna',.4],['titanium_white',.4]]):M([['raw_sienna',.9],['burnt_sienna',.6],['burnt_umber',.3],['yellow_ochre',.3]]),{ang:1.4,angJ:.3,o:{thin:.4,load:1}});
// left crowd mass
cover([[-20,410],[630,415],[630,560],[-20,570]],28,()=>M([['burnt_sienna',.5],['ultramarine',.3],['cobalt_violet',.3],['titanium_white',.8],['yellow_ochre',.3]]),{ang:1.2,angJ:.7,dens:1.2,o:{thin:.6}});
// stage
cover([[588,468],[1220,468],[1220,517],[588,517]],24,()=>M([['yellow_ochre',.8],['raw_sienna',.5],['titanium_white',.7],['naples_yellow',.4]]),{ang:0,angJ:.1,dens:1.2,o:{thin:.5}});
cover([[588,517],[1220,517],[1220,590],[588,590]],22,()=>M([['burnt_sienna',.8],['burnt_umber',.4],['cobalt_violet',.25],['titanium_white',.3],['alizarin_crimson',.08]]),{ang:1.57,angJ:.15,dens:1.2,o:{thin:.55}});
// pods
for(const cx of [742,968]){cover([[cx-50,512],[cx-52,420],[cx-30,382],[cx+30,382],[cx+52,420],[cx+50,512]],20,(x)=>x<cx?M([['paynes_grey',.6],['cerulean',.5],['titanium_white',1.4],['viridian',.1]]):M([['paynes_grey',.9],['cobalt_violet',.4],['titanium_white',.7],['ultramarine',.2]]),{ang:1.57,angJ:.3,o:{thin:.5}});}
// front-of-stage crowd + right foreground
cover([[630,590],[1050,588],[1050,650],[630,650]],26,()=>M([['burnt_umber',.5],['ultramarine',.5],['cobalt_violet',.4],['titanium_white',.7],['burnt_sienna',.3]]),{ang:1.3,angJ:.6,dens:1.1});
cover([[1030,605],[1220,590],[1220,820],[1020,820]],36,()=>M([['burnt_umber',.6],['ultramarine',.5],['alizarin_crimson',.12],['titanium_white',.6],['cobalt_violet',.3]]),{ang:1.4,angJ:.6,dens:1.1});
