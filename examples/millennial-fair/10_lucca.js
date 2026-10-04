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
const _p=p;p=Object.create(_p);{const K=1.25,CX=659,CY=512,LF=0;const tf=(x,y)=>[CX+(x-CX)*K,CY+(y-CY)*K-LF];
p.stroke=s=>_p.stroke(Object.assign({},s,{points:s.points.map(q=>{const t=tf(q[0],q[1]);return q.length>2?[t[0],t[1],q[2]]:[t[0],t[1]];}),size:(s.size||20)*K}));
p.dab=s=>{const t=tf(s.x,s.y);return _p.dab(Object.assign({},s,{x:t[0],y:t[1],size:(s.size||20)*K}));};}
// LUCCA: startled beside her machine
const skinL=()=>M([['flesh_tint',1],['titanium_white',.5],['cadmium_orange',.1],['naples_yellow',.1]]);
const skinM=()=>M([['flesh_tint',1],['titanium_white',.2],['cadmium_orange',.12],['burnt_sienna',.1]]);
const skinS=()=>M([['flesh_tint',.8],['burnt_sienna',.25],['cobalt_violet',.3],['titanium_white',.1]]);
const rimC=()=>M([['titanium_white',3],['cerulean',.4],['cobalt_violet',.15]]);
const hairC=()=>M([['cobalt_violet',.6],['burnt_umber',.4],['alizarin_crimson',.25],['ultramarine',.15],['titanium_white',.12]]);
const hairLC=()=>M([['cobalt_violet',.8],['quinacridone_rose',.25],['titanium_white',.5],['burnt_umber',.15]]);
const tealL=()=>M([['viridian',.5],['cerulean',.4],['titanium_white',1],['naples_yellow',.05]]);
const tealM=()=>M([['viridian',.7],['cerulean',.3],['titanium_white',.45],['paynes_grey',.12]]);
const tealS=()=>M([['viridian',.6],['ultramarine',.35],['paynes_grey',.3],['cobalt_violet',.15],['titanium_white',.12]]);
const orL=()=>M([['cadmium_orange',.9],['cadmium_yellow',.35],['titanium_white',.35]]);
const orM=()=>M([['cadmium_orange',.9],['vermilion',.35],['titanium_white',.15]]);
const orS=()=>M([['vermilion',.5],['burnt_sienna',.5],['alizarin_crimson',.15],['cobalt_violet',.25]]);
const blkL=()=>M([['paynes_grey',.9],['burnt_umber',.3],['titanium_white',.3]]);
const blkM=()=>M([['paynes_grey',.9],['ultramarine',.3],['burnt_umber',.3]]);
const blkS=()=>M([['ivory_black',.7],['ultramarine',.4],['burnt_umber',.2]]);
const yelL=()=>M([['cadmium_yellow',.9],['naples_yellow',.4],['titanium_white',.4]]);
const yelS=()=>M([['yellow_ochre',.8],['raw_sienna',.4],['cadmium_orange',.15]]);
const brL=()=>M([['burnt_sienna',.6],['raw_sienna',.4],['titanium_white',.3]]);
const brS=()=>M([['burnt_umber',1],['ultramarine',.3],['ivory_black',.15]]);
const LX=659;
// cast shadow to the right on the deck
S(LX+38,513,70,.03,M([['burnt_umber',.6],['cobalt_violet',.5],['ultramarine',.25],['titanium_white',.3]]),9,{brush:'flat',load:.9,thin:.5,opacity:.65});
// legs: boots, bare knees, black shorts
tube([654,467],[652,484],11,9,{lit:skinL,mid:skinM,shade:skinS});tube([666,467],[669,484],11,9,{lit:skinM,mid:skinM,shade:skinS,rim:rimC});
for(const [x0,x1] of [[652,650],[669,672]]){tube([x0,484],[x1,509],11,12,{lit:brL,mid:brS,shade:brS},{});}
for(const bx of [648,675]){S(bx,510,15,R(-.1,.1),brS(),7,{brush:'filbert',load:1,thin:.4});S(bx-3,508,9,0,brL(),2.5,{brush:'flat',load:1.1,thin:.4,opacity:.8});}
S(651,483,14,0,M([['burnt_sienna',.5],['titanium_white',.5],['raw_sienna',.4]]),2.6,{brush:'flat',load:1.1,thin:.4});S(670,483,14,0,M([['burnt_sienna',.5],['titanium_white',.5],['raw_sienna',.4]]),2.6,{brush:'flat',load:1.1,thin:.4});
cover([[648,449],[675,449],[677,470],[646,470]],3.6,(x)=>x<657?blkL():x<668?blkM():blkS(),{ang:1.5,angJ:.4,dens:1.5,len:2,brush:'filbert',o:{load:1,thin:.45}});
// arms (long teal sleeves), raised in alarm; hands
tube([649,422],[637,433],8,6.5,{lit:tealL,mid:tealM,shade:tealS});tube([637,433],[633,417],6.5,5.5,{lit:tealL,mid:tealM,shade:tealS});
tube([672,422],[685,431],8,6.5,{lit:tealM,mid:tealM,shade:tealS,rim:rimC});tube([685,431],[690,414],6.5,5.5,{lit:tealM,mid:tealS,shade:tealS,rim:rimC});
for(const [hx,hy,s] of [[633,412,-1],[691,409,1]]){p.dab({x:hx,y:hy,size:5.5,color:s<0?skinL():skinM(),brush:'round',load:1.1,pressure:.9});
  for(let f=0;f<4;f++){const a=-1.57+(f-1.5)*.38;S(hx+Math.cos(a)*3.8,hy+Math.sin(a)*3.8,6,a,s<0?skinL():skinM(),1.7,{brush:'round',load:1,thin:.45,bend:1});}}
// teal shirt torso under the tunic
cover([[648,417],[672,417],[673,436],[646,436]],3.5,(x)=>x<656?tealL():x<666?tealM():tealS(),{ang:1.5,angJ:.4,dens:1.4,len:2,brush:'filbert',o:{load:1,thin:.45}});
// orange tunic: A-line, light on left, shade on right with folds
cover([[648,424],[672,424],[679,452],[642,452]],3.6,(x,y)=>{const f=(x-642)/37;return f<.3?orL():f<.65?orM():orS();},{ang:1.55,angJ:.3,dens:1.6,len:2,brush:'filbert',o:{load:1.05,thin:.4}});
cover([[648,424],[672,424],[679,452],[642,452]],2.2,(x,y)=>{const f=(x-642)/37+R(-.15,.15);return f<.3?orL():f<.65?orM():(R(0,1)<.6?orS():rimC());},{ang:1.5,angJ:.5,dens:.45,len:1.8,brush:'filbert',o:{load:1.05,thin:.4}});
S(660,451,36,0,orS(),3,{brush:'flat',load:1,thin:.45,opacity:.85,bend:2});
for(let k=0;k<3;k++)S(652+k*7,438,22,1.57+R(-.08,.08),k===2?orS():orL(),2.2,{brush:'filbert',load:1,thin:.45,opacity:.8});
// black belt
S(660,433,28,0,blkS(),3.4,{brush:'flat',load:1,thin:.45,bend:2});
// yellow scarf at the neck, tail flung out by the gate wind
S(659,417,19,.02,yelL(),6,{brush:'filbert',load:1.1,thin:.4,bend:3});S(662,419,15,0,yelS(),3,{brush:'filbert',load:1,thin:.4,opacity:.9});
F([[652,419,.8],[646,428,.7],[642,440,.5],[644,450,.3]],yelL(),4.5,{brush:'filbert',load:1.1,thin:.4});
F([[650,420,.6],[644,430,.5],[640,438,.3]],yelS(),2,{brush:'filbert',load:1,thin:.4,opacity:.8});
// neck, head
S(659,413,6,1.57,skinS(),5,{brush:'filbert',load:1,thin:.45});
cover(ELL(660,404,8,9,0,14),3,(x)=>{const f=(x-652)/16;return f<.35?skinL():f<.7?skinM():skinS();},{ang:1.2,angJ:.7,dens:1.9,len:1.7,brush:'filbert',o:{load:1,thin:.4}});
// plum hair at the sides below the helmet
for(const [hx,hy] of [[650,406],[670,406]]){S(hx,hy,10,1.57,hairC(),4,{brush:'filbert',load:1,thin:.4});}
S(650,404,6,1.57,hairLC(),1.6,{brush:'filbert',load:1.1,thin:.4});S(659,396,18,0,hairC(),3.4,{brush:'filbert',load:1,thin:.4});
// helmet: steel-blue dome with brim, highlight, antenna on her right side
cover([[648,398],[650,391],[656,387],[664,387],[670,391],[672,398],[660,396]],2.8,(x,y)=>x<656?M([['cerulean',.5],['paynes_grey',.4],['titanium_white',1.4]]):x<666?M([['cobalt_blue',.45],['paynes_grey',.5],['titanium_white',.8]]):M([['ultramarine',.5],['paynes_grey',.6],['cobalt_violet',.2],['titanium_white',.3]]),{ang:-.1,angJ:1,dens:2,len:1.9,brush:'filbert',o:{load:1.05,thin:.4}});
S(660,397,26,.02,M([['paynes_grey',1],['ultramarine',.35],['burnt_umber',.15]]),3.2,{brush:'flat',load:1.05,thin:.4,bend:-2});
S(654,390,8,-.6,M([['titanium_white',3],['cerulean',.2]]),2.4,{brush:'filbert',load:1.3,thin:.35});
S(668,392,6,1.9,rimC(),1.4,{brush:'filbert',load:1.2,thin:.4,opacity:.9});
PL([[671,394],[674,388],[676,381]],M([['paynes_grey',1],['ultramarine',.3]]),1.8,{brush:'round',load:1,thin:.5});
p.dab({x:676.5,y:379.5,size:4,color:M([['cadmium_red',1],['alizarin_crimson',.2]]),brush:'round',load:1.2});p.dab({x:676,y:379,size:1.6,color:'titanium_white',brush:'round',load:1.3});
// face: round glasses with glints, brows, open mouth
for(const gx of [656,664]){cover(ELL(gx,405,3.6,3.6,0,10),1.6,()=>M([['titanium_white',2],['cerulean',.4]]),{ang:.6,angJ:1,dens:1.6,brush:'round',o:{load:1.05,thin:.4}});
  PL([[gx-4,405],[gx-2.8,402.4],[gx+.2,401.6],[gx+2.8,402.8],[gx+4,405.2],[gx+2.6,407.6],[gx-.6,408.2],[gx-3,407]],M([['burnt_umber',.8],['paynes_grey',.5]]),1.1,{brush:'round',load:1,thin:.5,opacity:.9});
  p.dab({x:gx-.2,y:405.2,size:1.8,color:M([['burnt_umber',1],['ultramarine',.4]]),brush:'round',load:1.1,pressure:.8});p.dab({x:gx-1.3,y:404,size:.9,color:'titanium_white',brush:'round',load:1.3,pressure:.6});}
S(660,405,3,0,M([['burnt_umber',.8],['paynes_grey',.4]]),.9,{brush:'round',load:.9,thin:.5});
for(const bx of [656,664])S(bx,400.5,5,R(-.2,.2),hairC(),1.2,{brush:'round',load:.9,thin:.5});
p.dab({x:660.5,y:411,size:2.6,color:M([['alizarin_crimson',.6],['burnt_umber',.6]]),brush:'round',load:1,pressure:.7});
p.dab({x:653.5,y:409,size:2.2,color:M([['quinacridone_rose',.4],['flesh_tint',1],['titanium_white',.4]]),brush:'round',load:.9,pressure:.5,opacity:.7});
// gate light along her right (cool rim) and sun on left (warm highlights)
for(let i=0;i<16;i++){const y=R(392,500);S(675.5+R(-1,1)+(y<430?-2:0),y,R(6,14),1.57+R(-.1,.1),rimC(),R(1.3,2.2),{brush:'filbert',load:1.2,thin:.4,opacity:R(.55,.95)});}
for(let i=0;i<10;i++){const y=R(392,500);S(645.5+R(-1,1),y,R(5,12),1.57+R(-.1,.1),M([['naples_yellow',.6],['titanium_white',2]]),R(1.3,2),{brush:'filbert',load:1.2,thin:.4,opacity:R(.5,.9)});}
p.dry();
