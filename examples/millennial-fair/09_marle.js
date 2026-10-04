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
const _p=p;p=Object.create(_p);{const K=1.4,CX=843,CY=490,LF=22;const tf=(x,y)=>[CX+(x-CX)*K,CY+(y-CY)*K-LF];
p.stroke=s=>_p.stroke(Object.assign({},s,{points:s.points.map(q=>{const t=tf(q[0],q[1]);return q.length>2?[t[0],t[1],q[2]]:[t[0],t[1]];}),size:(s.size||20)*K}));
p.dab=s=>{const t=tf(s.x,s.y);return _p.dab(Object.assign({},s,{x:t[0],y:t[1],size:(s.size||20)*K}));};}
// MARLE: being pulled into the gate, pendant glowing
const skinL=()=>M([['flesh_tint',1],['titanium_white',.5],['cadmium_orange',.1],['naples_yellow',.1]]);
const skinM=()=>M([['flesh_tint',1],['titanium_white',.2],['cadmium_orange',.12],['burnt_sienna',.1]]);
const skinS=()=>M([['flesh_tint',.8],['burnt_sienna',.25],['cobalt_violet',.3],['titanium_white',.1]]);
const skinR=()=>M([['flesh_tint',.7],['cerulean',.2],['cobalt_violet',.25],['titanium_white',.9]]);
const iceL=()=>M([['titanium_white',3],['cerulean',.18],['naples_yellow',.08]]);
const iceM=()=>M([['titanium_white',2.2],['cerulean',.45],['cobalt_violet',.12]]);
const iceS=()=>M([['cobalt_violet',.55],['ultramarine',.25],['titanium_white',1.6],['cerulean',.2]]);
const rimC=()=>M([['titanium_white',3],['cerulean',.4],['cobalt_violet',.1]]);
const hairL=()=>M([['cadmium_yellow',.4],['naples_yellow',.5],['titanium_white',.5],['cadmium_orange',.15]]);
const hairM=()=>M([['yellow_ochre',.7],['cadmium_orange',.35],['naples_yellow',.3],['quinacridone_rose',.08],['titanium_white',.15]]);
const hairS=()=>M([['raw_sienna',.7],['burnt_sienna',.5],['cadmium_orange',.2],['cobalt_violet',.12]]);
const gold=()=>M([['cadmium_yellow',.8],['yellow_ochre',.4],['titanium_white',.4]]);
const goldS=()=>M([['yellow_ochre',.7],['raw_sienna',.5],['burnt_umber',.2]]);
// ponytail: gathered at the crown, whipping up toward the gate, splaying into strands
const PT=[[848,373],[858,362],[870,353],[884,349],[897,352],[907,361]];
for(let k=0;k<6;k++){const sp=(k-2.5)*1.7;const pts=PT.map((q,i)=>{const f=i/5;return [q[0]+sp*f*1.1+R(-.8,.8),q[1]+sp*f*1.6+R(-.8,.8)+Math.sin(f*5+k)*1.5*f,.8-.5*f];});
  F(pts.slice(0,k<2?6:5),k<2?hairL():k<4?hairM():hairS(),R(3.4,5.4),{brush:'filbert',load:1,thin:.4});}
F(PT.slice(0,3).map((q,i)=>[q[0]-1,q[1]+1,.9]),hairM(),8,{brush:'filbert',load:1.05,thin:.4});
for(let k=0;k<4;k++){const f0=R(.3,.6);const pts=PT.slice(1).map((q,i)=>[q[0]+R(-2,2),q[1]+R(-2,2)-1.5,.5+.3*(1-i/5)]);F(pts,hairL(),R(1.4,2.2),{brush:'filbert',load:1.2,thin:.35,opacity:.9});}
// back hair behind the head
for(let k=0;k<5;k++)S(842+R(-9,9),383+R(-6,6),R(14,20),1.57+R(-.4,.4),k%2?hairM():hairS(),R(4,6),{brush:'filbert',load:1,thin:.4});
// legs (pale trousers trailing, bent), boots
tube([841,442],[835,466],13,10,{lit:iceL,mid:iceM,shade:iceS});tube([835,466],[829,486],10,8,{lit:iceL,mid:iceM,shade:iceS});
tube([852,442],[860,463],13,10,{lit:iceM,mid:iceM,shade:iceS,rim:rimC});tube([860,463],[866,482],10,8,{lit:iceM,mid:iceS,shade:iceS,rim:rimC});
for(const [bx,by,a] of [[827,491,1.9],[867,487,1.4]])S(bx,by,12,a,M([['naples_yellow',.5],['raw_sienna',.5],['titanium_white',.8],['burnt_umber',.15]]),6,{brush:'filbert',load:1,thin:.4});
p.dab({x:826,y:496,size:3.5,color:M([['burnt_umber',1],['ultramarine',.3]]),brush:'round',load:1});p.dab({x:868,y:492,size:3.5,color:M([['burnt_umber',1],['ultramarine',.3]]),brush:'round',load:1});
// torso: ice-blue sleeveless jumpsuit, light from left, cool glow from right
cover([[829,402],[857,401],[858,422],[854,436],[836,437],[830,422]],4,(x,y)=>{const f=(x-829)/29;return f<.3?iceL():f<.65?iceM():iceS();},{ang:1.5,angJ:.35,dens:1.4,len:2,brush:'filbert',o:{load:1,thin:.45}});
cover([[829,402],[857,401],[858,422],[854,436],[836,437],[830,422]],2.4,(x,y)=>{const f=(x-829)/29+R(-.2,.2);return f<.3?iceL():f<.65?iceM():(R(0,1)<.5?iceS():rimC());},{ang:1.4,angJ:.5,dens:.5,len:1.8,brush:'filbert',o:{load:1.05,thin:.4}});
// hips / upper thighs
cover([[835,434],[856,433],[860,448],[834,449]],3.4,(x)=>x<844?iceL():x<852?iceM():iceS(),{ang:1.5,angJ:.4,dens:1.5,len:2,brush:'filbert',o:{load:1,thin:.45}});
// gold belt, chain and buckle
S(846,435,23,.03,gold(),4.5,{brush:'flat',load:1.15,thin:.4,bend:2});S(846,438,22,.03,goldS(),2,{brush:'flat',load:1,thin:.45,opacity:.8,bend:2});
for(let k=0;k<5;k++)p.dab({x:837+k*4.5,y:441+Math.sin(k*1.3)*1.5,size:2,color:gold(),brush:'round',load:1.2,pressure:.8});
p.dab({x:846,y:435,size:4,color:M([['cadmium_yellow',1],['titanium_white',.5]]),brush:'round',load:1.3});
// sleeveless shoulders and arms: reaching arm toward Crono (our left), swept arm toward the gate
tube([831,405],[815,418],8,6,{lit:skinL,mid:skinM,shade:skinS});tube([815,418],[803,406],6,4.6,{lit:skinL,mid:skinM,shade:skinS});
tube([855,404],[869,411],8,6,{lit:skinM,mid:skinM,shade:skinS,rim:()=>skinR()});tube([869,411],[879,397],6,4.6,{lit:skinM,mid:skinS,shade:skinS,rim:()=>skinR()});
// hands: open fingers
for(const [hx,hy,s] of [[799,402,-1],[882,392,1]]){p.dab({x:hx,y:hy,size:5.5,color:s<0?skinL():skinM(),brush:'round',load:1.1,pressure:.9});
  for(let f=0;f<4;f++){const a=(s<0?-2.6:-.7)+f*.28-.4;S(hx+Math.cos(a)*3.5,hy+Math.sin(a)*3.5,7,a,s<0?skinL():skinM(),1.8,{brush:'round',load:1,thin:.45,bend:1});}}
// gold bracelets
for(const [bx,by] of [[804,407],[879,398]]){S(bx,by,6,.9,gold(),3,{brush:'flat',load:1.2,thin:.4});p.dab({x:bx,y:by,size:2,color:'titanium_white',brush:'round',load:1.3,pressure:.7});}
// neck and head (3/4 view, looking back toward Crono)
S(842,396,7,1.57,skinM(),4.5,{brush:'filbert',load:1,thin:.45});S(845,397,6,1.57,skinS(),2,{brush:'filbert',load:.9,thin:.5,opacity:.7});
cover(ELL(842,384,8,9.2,.1,14),3,(x,y)=>{const f=(x-834)/16;return f<.35?skinL():f<.7?skinM():skinR();},{ang:1.2,angJ:.7,dens:1.8,len:1.7,brush:'filbert',o:{load:1,thin:.4}});
// hair cap, fringe and side locks
cover([[833,382],[836,374],[843,371],[850,374],[852,382],[848,378],[842,376],[837,379]],2.8,()=>R(0,1)<.3?hairL():hairM(),{ang:-.2,angJ:.9,dens:2,len:2,brush:'filbert',o:{load:1.05,thin:.4}});
for(const [x0,y0,x1,y1] of [[835,376,834,391],[851,376,853,390],[838,375,844,378]])S((x0+x1)/2,(y0+y1)/2,Math.hypot(x1-x0,y1-y0),Math.atan2(y1-y0,x1-x0),hairM(),3,{brush:'filbert',load:1.1,thin:.4});
S(838,372,10,.2,hairL(),2.4,{brush:'filbert',load:1.3,thin:.35});
// hair tie (red) at the ponytail root and strands
p.dab({x:848,y:373,size:4,color:M([['cadmium_red',1],['alizarin_crimson',.2]]),brush:'round',load:1.2});
// face: eyes, brows, nose, open mouth, blush
for(const ex of [839,846]){p.dab({x:ex,y:384,size:2.8,color:'titanium_white',brush:'round',load:1.1,pressure:.7});p.dab({x:ex-.4,y:384.4,size:2,color:M([['cobalt_blue',.5],['burnt_umber',.8]]),brush:'round',load:1.1,pressure:.8});p.dab({x:ex-.7,y:383.8,size:.9,color:'titanium_white',brush:'round',load:1.2,pressure:.6});
  S(ex,381.4,4,-.1,M([['burnt_sienna',1],['burnt_umber',.4]]),1.1,{brush:'round',load:.9,thin:.5});}
S(842.5,387,2.6,1.5,skinS(),1,{brush:'round',load:.8,thin:.5,opacity:.6});
p.dab({x:842.5,y:391,size:2.2,color:M([['alizarin_crimson',.6],['quinacridone_rose',.4],['flesh_tint',.6]]),brush:'round',load:1,pressure:.6});
p.dab({x:836.5,y:388.5,size:2.6,color:M([['quinacridone_rose',.5],['flesh_tint',1],['titanium_white',.4]]),brush:'round',load:.9,pressure:.5,opacity:.7});
S(850,384,9,1.57,skinR(),1.6,{brush:'filbert',load:1,thin:.4,opacity:.7});
// glowing pendant and its light on her chest
for(let i=0;i<10;i++){const a=R(0,6.28),r=R(3,10);S(842+Math.cos(a)*r,411+Math.sin(a)*r,R(4,9),a+1.5,M([['cerulean',.5],['titanium_white',2],['cobalt_violet',.2]]),R(2,4),{brush:'filbert',load:.8,thin:.5,opacity:R(.35,.7)});}
S(842,404,8,1.57,gold(),1.2,{brush:'round',load:1,thin:.5});
p.dab({x:842,y:410,size:5,color:M([['cerulean',.4],['titanium_white',2.5]]),brush:'round',load:1.3,pressure:.9});
p.dab({x:842,y:410,size:2.6,color:'titanium_white',brush:'round',load:1.5,pressure:.9});
// rim light from the gate on her right edge and hair
for(let i=0;i<14;i++){const y=R(376,440);S(855.5+(y>400?1:0)+R(-1,1),y,R(6,12),1.57+R(-.1,.1),rimC(),R(1.4,2.4),{brush:'filbert',load:1.2,thin:.4,opacity:R(.6,1)});}
p.dry();
