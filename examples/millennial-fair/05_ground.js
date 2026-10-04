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
// GROUND: dappled packed earth and cobbles, haze behind crowd
const nz=(x,y)=>Math.sin(x*.043+1.3)*Math.sin(y*.051+.4)+.6*Math.sin(x*.11+y*.07)+.4*Math.sin(x*.19-y*.13);
// hazy distant backdrop at the far left and between tent and trees (soft, pale)
for(const poly of [[[0,336],[96,336],[96,452],[0,452]],[[268,340],[330,340],[330,452],[268,452]],[[560,330],[600,330],[600,452],[560,452]]]){
  cover(poly,16,(x,y)=>{const n=nz(x*1.3,y*1.3)+R(-.5,.5);return n>.4?M([['sap_green',.5],['cadmium_yellow',.15],['titanium_white',1.6],['cerulean',.3]]):M([['viridian',.3],['cobalt_violet',.3],['titanium_white',1.7],['sap_green',.3],['cerulean',.2]]);},{ang:-.5,angJ:1,dens:1.3,len:1.8,brush:'filbert',o:{load:.85,thin:.55}});}
const STG=[[586,466],[1205,466],[1205,592],[586,592]];
const G=[[0,448],[560,448],[560,470],[1045,470],[1045,433],[1205,433],[1205,805],[0,805]];
const sd=(x,y)=>{let b=0;if(x>640&&y>600)b+=.32;if(x>330&&x<650&&y>560)b-=.3;
  if(inPoly([[110,448],[300,448],[580,480],[430,496],[100,474]],x,y))b+=.7;
  if(inPoly([[470,440],[610,446],[700,500],[520,474]],x,y))b+=.5;
  const n=nz(x*.8+50,y*1.6)*.4;return Math.max(0,Math.min(1,.42+b+n));};
const sunC=()=>M([['yellow_ochre',.25],['naples_yellow',.45],['titanium_white',1.9],['raw_sienna',.15],['quinacridone_rose',.12],['cadmium_orange',.03]]);
const shdC=()=>M([['cobalt_violet',.5],['ultramarine',.22],['burnt_sienna',.18],['quinacridone_rose',.08],['titanium_white',1.5],['yellow_ochre',.08]]);
const deepC=()=>M([['ultramarine',.35],['cobalt_violet',.45],['burnt_sienna',.25],['titanium_white',1.0]]);
const gcol=(x,y)=>{const s=sd(x,y)+R(-.18,.18);return s<.35?sunC():s<.7?shdC():deepC();};
const dep=y=>lerp(.42,1.5,Math.max(0,Math.min(1,(y-440)/360)));
function gs(n,base,o){o=o||{};let k=0,g=0;while(k<n&&g++<n*80){const x=R(-10,1210),y=R(o.y0||436,805);const d=dep(y);if(R(0,1)>.4/d)continue;if(!inPoly(G,x,y)||inPoly(STG,x,y))continue;k++;
  const sz=base*d*R(.75,1.3);const L=sz*R(o.l0||2,o.l1||3.4);const a=(o.ang||0)+R(-1,1)*(o.angJ===undefined?.35:o.angJ);
  F(seg(x,y,L,a,R(-3,3)*sz/10),(o.col||gcol)(x,y),sz,Object.assign({brush:'flat',load:o.load||.9,thin:.55},o.o||{}));}}
gs(520,30,{l0:2.6,l1:4.2,angJ:.22});gs(900,15,{l0:2.4,l1:4,angJ:.25});gs(600,7.5,{l0:1.8,l1:3,angJ:.5,load:.85});
// shadow-side darks and cool reflected notes
gs(90,14,{col:()=>deepC(),o:{opacity:.6},angJ:.3});
// cobbles: a few broken stone-like marks, bigger toward the viewer
let kk=0,gg=0;while(kk<60&&gg++<40000){const x=R(0,1200),y=R(452,800);const d=dep(y);if(R(0,1)>.5/d)continue;if(!inPoly(G,x,y)||inPoly(STG,x,y))continue;kk++;
  const s=sd(x,y);const lit=s<.5;const sz=R(5,10)*d;
  const c=lit?M([['naples_yellow',.3],['titanium_white',2.2],['quinacridone_rose',R(0,.15)],['cerulean',R(0,.1)]]):M([['cobalt_violet',.4],['titanium_white',1.4],['ultramarine',.15],['burnt_sienna',.15]]);
  S(x,y,sz*R(1.6,2.8),R(-.5,.5),c,sz,{brush:'flat',load:1,thin:.5,opacity:R(.5,.9),bend:R(-3,3)});
  if(R(0,1)<.3)S(x+sz*.8,y+sz*.7,sz*R(1.2,2.2),R(-.3,.3),deepC(),sz*.4,{brush:'flat',load:.8,thin:.5,opacity:.6});}
// dappled sun on the shaded right side: soft clustered patches of light sharing an angle
for(let i=0;i<25;i++){const cx=R(640,1205),cy=R(600,805);if(inPoly(STG,cx,cy))continue;const d=dep(cy);const m=Math.round(R(2,3)),a0=R(-.5,.4);
  for(let j=0;j<m;j++){const x=cx+R(-12,12)*d,y=cy+R(-6,6)*d;S(x,y,R(14,34)*d,a0+R(-.2,.2),M([['naples_yellow',.4],['titanium_white',2.4],['quinacridone_rose',.1],['yellow_ochre',.08]]),R(7,15)*d,{brush:'filbert',load:1.05,thin:.45,opacity:R(.5,.85)});}}
// dapples through the tower/tent area and the lane
for(let i=0;i<50;i++){const x=R(0,640),y=R(450,560);const d=dep(y);S(x,y,R(10,28)*d,R(-.8,.8),M([['naples_yellow',.3],['titanium_white',2.3],['quinacridone_rose',.1]]),R(5,10)*d,{brush:'filbert',load:1,thin:.45,opacity:.6});}
// a soft blend to unify the far ground
for(let i=0;i<40;i++){const x=R(0,1200),y=R(450,620);if(inPoly(STG,x,y))continue;BL(seg(x,y,R(40,90),R(-.15,.15),R(-3,3),4),R(10,18));}
p.dry();
