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
// FINAL ACCENTS on dry paint: sky air and sparkle, leaf lights, stone, tents, ground dapples (clear of the figures)
const clouds=[[470,62,420,96],[900,74,300,80],[70,64,240,78],[700,205,340,66],[340,225,280,56],[1010,250,260,50],[150,305,260,40],[580,298,220,36],[230,150,170,42],[790,22,220,40]];
const balls=[[420,120],[458,88],[503,152],[545,104],[588,174],[632,66],[668,136],[382,190],[724,92],[692,216],[300,98],[564,226],[790,150]];
const inCloud=(x,y)=>clouds.some(c=>Math.pow((x-c[0])/(c[2]*.55),2)+Math.pow((y-c[1])/(c[3]*.75),2)<1);
const nearBall=(x,y)=>balls.some(b=>Math.hypot(x-b[0],y-b[1])<30);
const inFoliage=(x,y)=>inPoly([[870,-20],[1220,-20],[1220,235],[1120,205],[1050,155],[960,135],[900,75]],x,y)||inPoly([[555,355],[590,285],[670,240],[760,222],[850,232],[940,236],[1015,275],[1045,355],[1045,470],[555,470]],x,y);
const towerBox=(x,y)=>x>60&&x<300&&y>40&&y<460;
// 1) sky: richer blue overhead, pearly warmth low, kept out of clouds and balloons
let k=0,g=0;while(k<45&&g++<6000){const x=R(0,1200),y=R(0,235);if(inCloud(x,y)||nearBall(x,y)||inFoliage(x,y)||towerBox(x,y))continue;k++;const t=y/340;
  const c=y<110?M([['ultramarine',.5],['cerulean',.8],['titanium_white',.6+t*2],['cobalt_violet',.08]]):y<230?M([['cerulean',1],['cobalt_blue',.2],['titanium_white',1+t*2.4]]):M([['naples_yellow',.5],['quinacridone_rose',.14],['titanium_white',2.2],['cerulean',.2]]);
  S(x,y,R(40,90),R(-.3,.12),c,R(10,20),{brush:R(0,1)<.5?'filbert':'flat',load:R(.7,1.05),thin:.5,opacity:R(.5,.9)});}
// 3) leaf lights on the trees (away from the gate) and the canopy
const Tpoly=[[555,355],[590,285],[670,240],[760,222],[850,232],[940,236],[1015,275],[1045,355],[1045,470],[555,470]];
k=0;g=0;while(k<60&&g++<8000){const x=R(705,1040),y=R(225,430);if(!inPoly(Tpoly,x,y))continue;if(Math.hypot(x-884,y-400)<135)continue;if(x>640&&x<655&&y>318)continue;k++;
  const lit=(1040-x)/480+(430-y)/300;
  S(x,y,R(14,28),R(-1.2,.3),R(0,1)<.65?M([['cadmium_lemon',.4],['sap_green',.6],['titanium_white',.35+.2*lit],['yellow_ochre',.1]]):M([['sap_green',.9],['cadmium_yellow',.25],['titanium_white',.3]]),R(5,10),{brush:'filbert',load:1.1,thin:.4,opacity:R(.6,.95)});}
k=0;g=0;while(k<45&&g++<8000){const x=R(705,1040),y=R(225,430);if(!inPoly(Tpoly,x,y)||Math.hypot(x-885,y-390)<150||(x>640&&x<655&&y>318))continue;k++;S(x,y,R(22,40),R(-1,.2),R(0,1)<.5?M([['viridian',.4],['ultramarine',.4],['sap_green',.4],['burnt_umber',.15]]):M([['sap_green',.8],['cadmium_yellow',.25],['titanium_white',.3]]),R(11,19),{brush:'filbert',load:.95,thin:.5,opacity:R(.5,.8)});}
const Cpoly=[[870,-20],[1220,-20],[1220,235],[1120,205],[1050,155],[960,135],[900,75]];
k=0;g=0;while(k<40&&g++<5000){const x=R(880,1200),y=R(0,225);if(!inPoly(Cpoly,x,y))continue;k++;
  S(x,y,R(8,18),R(-1.2,.3),R(0,1)<.7?M([['cadmium_lemon',.5],['sap_green',.5],['titanium_white',.6],['yellow_ochre',.1]]):M([['viridian',.5],['ultramarine',.3],['sap_green',.5]]),R(3,7),{brush:'filbert',load:1.1,thin:.4,opacity:R(.7,1)});}
// 4) tower: stone chips, sun on the bell, a few shadow stains
for(let i=0;i<28;i++){const x=R(99,138),y=R(165,440);S(x,y,R(5,12),R(-.15,.15),M([['titanium_white',2],['naples_yellow',.6],['cadmium_yellow',.05]]),R(2,3.4),{brush:'flat',load:1.2,thin:.4,opacity:R(.6,.95)});}
for(let i=0;i<22;i++){const x=R(224,262),y=R(165,440);S(x,y,R(5,12),R(-.15,.15),i%3?M([['burnt_umber',.6],['cobalt_violet',.5],['titanium_white',.7]]):M([['titanium_white',2],['naples_yellow',.6]]),R(2,3.2),{brush:'flat',load:1.1,thin:.4,opacity:R(.5,.9)});}
for(let i=0;i<6;i++)S(R(160,176),R(210,262),R(8,16),1.5,M([['titanium_white',3],['cadmium_yellow',.2]]),R(2,3.4),{brush:'filbert',load:1.3,thin:.35,opacity:.9});
// 5) tents: sun on the left stripes, shade creases
for(let i=0;i<34;i++){const x=R(330,440),y=R(300,430);if(!inPoly([[318,445],[442,272],[568,445]],x,y))continue;S(x,y,R(10,22),-.95+R(-.2,.2),R(0,1)<.5?M([['titanium_white',2],['naples_yellow',.6]]):M([['cadmium_orange',.5],['vermilion',.4],['titanium_white',.6]]),R(2.5,4.5),{brush:'filbert',load:1.15,thin:.4,opacity:.85});}
for(let i=0;i<22;i++){const x=R(470,560),y=R(330,430);if(!inPoly([[318,445],[442,272],[568,445]],x,y))continue;S(x,y,R(10,22),-.95+R(-.2,.2),M([['cobalt_violet',.6],['ultramarine',.25],['burnt_sienna',.2],['titanium_white',.4]]),R(2.5,4.5),{brush:'filbert',load:1,thin:.45,opacity:.7});}
for(let i=0;i<9;i++){const x=R(1000,1190),y=R(300,425);if(!inPoly([[985,425],[1085,284],[1220,298],[1220,425]],x,y))continue;S(x,y,R(10,22),-.9+R(-.2,.2),R(0,1)<.5?M([['titanium_white',2],['naples_yellow',.6]]):M([['cerulean',.6],['titanium_white',1.2]]),R(2.5,4.5),{brush:'filbert',load:1.15,thin:.4,opacity:.8});}
// 6) ground: a few soft leaf-shadow patches (cool) with warm light beside them on the right-hand floor, clear of the figures
const clear=(x,y)=>!(x<440&&y>470)&&!(x>980&&y>640)&&!(x>580&&x<1060&&y<600)&&!(x<200&&y>650);
k=0;g=0;while(k<20&&g++<9000){const x=R(450,1000),y=R(640,800);if(!clear(x,y))continue;k++;const d=lerp(.8,1.4,(y-600)/200);const a=R(-.5,.2);
  S(x,y,R(30,70)*d,a,M([['cobalt_violet',.5],['ultramarine',.2],['burnt_sienna',.2],['titanium_white',1.2]]),R(9,16)*d,{brush:'filbert',load:.9,thin:.55,opacity:R(.35,.6)});
  S(x+R(10,26)*d,y+R(-6,6),R(20,44)*d,a,M([['naples_yellow',.3],['titanium_white',2.2],['yellow_ochre',.15],['quinacridone_rose',.05]]),R(6,11)*d,{brush:'filbert',load:1,thin:.5,opacity:R(.4,.7)});}
p.dry();
