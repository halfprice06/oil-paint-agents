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
// thin dark drawing of the big shapes
const D=()=>M([['burnt_umber',1],['ultramarine',.8],['alizarin_crimson',.1]]);
const o={brush:'round',thin:.85,load:.5,opacity:.8};
const L=(pts,w)=>PL(pts.map(q=>[q[0]+R(-1,1),q[1]+R(-1,1)]),D(),w||4,o);
// horizon & trees
L([[0,330],[200,322],[420,328],[600,318],[800,326],[1000,320],[1200,326]],4);
L([[560,440],[570,330],[620,270],[700,240],[780,225],[880,238],[960,240],[1020,290],[1040,440]],5);
// foliage top right
L([[880,0],[900,70],[960,130],[1050,150],[1120,200],[1200,230]],5);
// tower: pillars, roof, bell
L([[100,440],[102,150]],6);L([[138,440],[136,160]],5);L([[222,440],[224,160]],5);L([[262,440],[260,150]],6);
L([[78,152],[180,56],[286,152]],6);L([[100,160],[262,160]],5);L([[100,185],[262,185]],4);
L([[135,200],[132,255],[120,272],[240,272],[228,255],[226,200]],5);
L([[135,200],[150,170],[210,170],[226,200]],4);
// tent A
L([[322,440],[442,272],[565,440]],5);L([[360,402],[400,420],[440,402],[480,420],[520,402]],3);
// tent B
L([[985,420],[1085,284],[1200,300]],5);
// stage
L([[590,470],[1200,470]],5);L([[590,515],[1200,515]],5);L([[590,585],[1200,585]],5);L([[590,470],[590,585]],5);
// pods
for(const cx of [742,968]){L([[cx-48,512],[cx-50,420],[cx-30,382],[cx+30,382],[cx+50,420],[cx+48,512]],5);L([[cx-48,512],[cx+48,512]],4);}
// gate
for(let i=0;i<3;i++)L([[860+Math.cos(i)*80,414+Math.sin(i)*78],[860+Math.cos(i+1.2)*90,414+Math.sin(i+1.2)*84],[860+Math.cos(i+2.2)*84,414+Math.sin(i+2.2)*80]],3);
// Marle, Lucca
L([[815,378],[800,440],[812,505]],4);L([[848,382],[860,440],[852,500]],4);
L([[640,420],[630,470],[638,512]],4);L([[668,425],[672,470],[664,512]],4);
// Crono
L([[300,560],[292,520],[330,500],[372,540],[368,580]],5);
L([[300,600],[292,690],[290,740],[300,775]],5);L([[372,600],[395,650],[380,700],[395,770]],5);
L([[372,615],[420,590],[455,575]],5);
// lanes of crowd
for(let i=0;i<14;i++){const x=R(10,610),y=R(430,540);L([[x,y],[x+R(-4,4),y-R(30,60)]],8);}
for(let i=0;i<8;i++){const x=R(650,1040),y=R(590,630);L([[x,y],[x+R(-4,4),y-R(30,50)]],9);}
