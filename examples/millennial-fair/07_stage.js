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
// STAGE, flagpole, telepods, console, cables
const nz=(x,y)=>Math.sin(x*.043+1.3)*Math.sin(y*.051+.4)+.6*Math.sin(x*.11+y*.07)+.4*Math.sin(x*.19-y*.13);
const woodL=()=>M([['raw_sienna',.45],['yellow_ochre',.45],['titanium_white',.8],['naples_yellow',.3],['quinacridone_rose',.05]]);
const woodS=()=>M([['burnt_sienna',.7],['burnt_umber',.25],['cobalt_violet',.35],['titanium_white',.45]]);
// deck planks
const DK=[[586,468],[1210,468],[1210,517],[586,517]];
cover(DK,15,(x,y)=>{const n=nz(x*.5,y*2)+R(-.5,.5);return n>.3?woodL():M([['raw_sienna',.55],['burnt_sienna',.3],['titanium_white',.7],['yellow_ochre',.3],['cobalt_violet',.12]]);},{ang:0,angJ:.04,dens:1.3,len:3.4,o:{load:.95,thin:.5}});
cover(DK,7,(x,y)=>R(0,1)<.5?woodL():woodS(),{ang:0,angJ:.05,dens:.35,len:3,o:{load:.9,thin:.55}});
for(const y of [479,491,503]){let x=588;while(x<1205){const l=R(60,160);S(x+l/2,y+R(-1,1),l,R(-.01,.01),M([['burnt_umber',.7],['burnt_sienna',.4],['cobalt_violet',.25]]),R(2,3.4),{brush:'flat',load:.75,thin:.55,opacity:.75,bend:0});x+=l+R(10,50);}}
// back edge dark line (shadow under the trees) and front lip highlight
S(900,470,620,0,M([['burnt_umber',.8],['ultramarine',.3],['sap_green',.2]]),7,{brush:'flat',load:.9,thin:.5,opacity:.8});
S(900,516,620,0,M([['titanium_white',1.6],['naples_yellow',.6],['yellow_ochre',.2]]),4,{brush:'flat',load:1.1,thin:.4,opacity:.9,bend:1});
// stage face: vertical boards in half shade
let bx=588;while(bx<1210){const w=R(11,16);const c=R(0,1);
  S(bx+w/2,531,R(30,40),1.57,c<.5?M([['burnt_sienna',.7],['alizarin_crimson',.08],['burnt_umber',.3],['cobalt_violet',.2],['titanium_white',.35]]):M([['burnt_sienna',.6],['burnt_umber',.4],['ultramarine',.12],['titanium_white',.3]]),w,{brush:'flat',load:.95,thin:.5});
  S(bx+w/2,566,R(36,48),1.57,M([['burnt_umber',.7],['burnt_sienna',.4],['cobalt_violet',.3],['titanium_white',.18]]),w,{brush:'flat',load:.9,thin:.5});
  S(bx+1,545,R(35,70),1.57,M([['burnt_umber',1],['ultramarine',.4]]),2.2,{brush:'flat',load:.7,thin:.6,opacity:.7});
  bx+=w;}
// lit left edges of boards and under-deck shadow
for(let i=0;i<30;i++)S(R(588,1205),R(524,545),R(8,20),1.57,M([['raw_sienna',.5],['titanium_white',.9],['burnt_sienna',.3]]),R(3,5),{brush:'flat',load:1,thin:.45,opacity:.7});
S(900,520,620,0,M([['burnt_umber',1],['ultramarine',.3]]),7,{brush:'flat',load:.9,thin:.5,opacity:.7});
// swags of cloth along the front of the stage
for(let i=0;i<12;i++){const xa=596+i*51,xb=xa+51;const c=i%2;const pts=[];for(let k=0;k<=6;k++){const t=k/6;pts.push([lerp(xa,xb,t),521+Math.sin(Math.PI*t)*17,.5+.5*Math.sin(Math.PI*t)]);}
  F(pts,c?M([['titanium_white',2],['naples_yellow',.5],['cobalt_violet',.15]]):M([['vermilion',.7],['cadmium_red',.4],['alizarin_crimson',.1]]),13,{brush:'filbert',load:1.05,thin:.4});
  F(pts.map(q=>[q[0],q[1]-4,q[2]]),c?M([['titanium_white',2.5],['naples_yellow',.3]]):M([['cadmium_orange',.4],['vermilion',.5],['titanium_white',.5]]),5,{brush:'filbert',load:1.2,thin:.35,opacity:.9});
  for(let k=1;k<6;k++)p.dab({x:pts[k][0],y:pts[k][1]+9,size:3,color:M([['cadmium_yellow',.6],['yellow_ochre',.4],['titanium_white',.3]]),brush:'round',load:1.1,pressure:.8});}
// flagpole at stage left with a swallow-tail banner
for(let k=0;k<7;k++)S(597+R(-1,1),474-k*23,R(26,34),1.57+R(-.02,.02),M([['burnt_umber',.7],['raw_sienna',.4],['titanium_white',.18]]),R(5,6.5),{brush:'flat',load:1,thin:.45});
S(594,400,150,1.57,M([['titanium_white',2],['naples_yellow',.5]]),2,{brush:'flat',load:1,thin:.4,opacity:.85});
F([[599,326,.9],[630,322,.8],[664,330,.6],[690,338,.4]],M([['vermilion',.7],['cadmium_red',.4]]),20,{brush:'filbert',load:1.05,thin:.4,angle:.1});
F([[599,344,.9],[626,344,.8],[652,352,.5]],M([['cadmium_yellow',.7],['yellow_ochre',.3],['titanium_white',.2]]),12,{brush:'filbert',load:1.05,thin:.4,angle:.1});
F([[601,334,.8],[618,334,.6]],M([['alizarin_crimson',.6],['burnt_umber',.3]]),5,{brush:'flat',load:1,thin:.4,opacity:.8});
p.dab({x:597,y:316,size:8,color:M([['cadmium_yellow',1],['yellow_ochre',.4],['titanium_white',.3]]),brush:'round',load:1.2});
// ---- telepods
const steelL=()=>M([['paynes_grey',.4],['cerulean',.35],['titanium_white',1.6],['naples_yellow',.12]]);
const steelM=()=>M([['paynes_grey',.65],['cobalt_blue',.25],['titanium_white',1]]);
const steelD=()=>M([['paynes_grey',1],['ultramarine',.35],['burnt_umber',.2],['titanium_white',.28]]);
const glowC=()=>M([['cobalt_violet',.5],['cerulean',.5],['titanium_white',2.2],['ultramarine',.1]]);
const brassL=()=>M([['cadmium_yellow',.5],['yellow_ochre',.5],['titanium_white',.9],['naples_yellow',.3]]);const brassM=()=>M([['yellow_ochre',.8],['raw_sienna',.4],['cadmium_yellow',.2],['titanium_white',.3]]);const brassS=()=>M([['raw_sienna',.7],['burnt_umber',.4],['cobalt_violet',.2]]);
function pod(cx,side){ // side=+1: gate lies to the right
  const yb=509,yt=402,hw=50;
  // cast shadow on deck, contact shadow
  S(cx+(side>0?95:90),yb+2,120,.04,M([['burnt_umber',.6],['cobalt_violet',.5],['ultramarine',.2],['titanium_white',.3]]),10,{brush:'flat',load:.9,thin:.5,opacity:.65});
  // base slab and ring
  cover(ELL(cx,yb,64,12,0),6,(x)=>x<cx-10?steelL():x<cx+25?steelM():steelD(),{ang:0,angJ:.1,dens:1.4,len:2.4,brush:'flat',o:{load:1,thin:.45}});
  S(cx,yb+7,120,0,M([['paynes_grey',1],['ultramarine',.3],['burnt_umber',.2]]),5,{brush:'flat',load:1,thin:.45,bend:3});
  S(cx-10,yb-3,100,0,M([['titanium_white',2],['cerulean',.3]]),2.6,{brush:'flat',load:1.2,thin:.4,opacity:.85,bend:3});
  // body bands (cylinder lit from the left, glow from the gate side)
  const bands=side>0?[[-1,-.55,steelL],[-.55,0,()=>M([['paynes_grey',.5],['cerulean',.25],['titanium_white',1.25]])],[0,.5,steelM],[.5,.8,steelD],[.8,1,glowC]]:[[-1,-.75,glowC],[-.75,-.25,steelL],[-.25,.3,steelM],[.3,.85,steelD],[.85,1,()=>M([['cerulean',.4],['paynes_grey',.5],['titanium_white',.6]])]];
  for(const [u0,u1,cf] of bands){for(let layer=0;layer<2;layer++){let y=yt+R(8,26);while(y<yb-6){const l=R(26,52);S(cx+hw*lerp(u0,u1,R(.25,.75)),y+l/2,l,1.57+R(-.03,.03),cf(),Math.max(4,hw*(u1-u0)*R(.55,.95)),{brush:'flat',load:.98,thin:.45,bend:R(-1,1)});y+=l*R(.55,.85);}}}
  // dome cap
  for(let k=0;k<9;k++){const t=k/8;const yy=yt+6-Math.sin(t*1.45)*22;const hwk=hw*Math.cos(t*1.35)*.98;
    S(cx-4,yy+5,hwk*1.9,R(-.03,.03),k<4?steelL():steelM(),R(6,9),{brush:'filbert',load:1,thin:.4,bend:-5});}
  S(cx-18,yt-12,28,-.5,M([['titanium_white',2.6],['cerulean',.2]]),5,{brush:'filbert',load:1.3,thin:.35});
  S(cx+22,yt-4,34,.8,M([['paynes_grey',1],['ultramarine',.3]]),6,{brush:'filbert',load:1,thin:.4,opacity:.8});
  // rim between dome and body
  S(cx,yt+10,100,0,M([['paynes_grey',1],['ultramarine',.3],['burnt_umber',.15]]),5,{brush:'flat',load:1,thin:.45,bend:5});
  S(cx-6,yt+7,80,0,M([['titanium_white',2],['cerulean',.3]]),2.4,{brush:'flat',load:1.2,thin:.4,bend:5,opacity:.85});
  // orange/red band around the body
  for(const [yy,w] of [[444,100],[452,100]]){const c=yy<448?M([['cadmium_orange',.7],['cadmium_red',.3],['titanium_white',.15]]):M([['vermilion',.7],['alizarin_crimson',.2],['burnt_umber',.1]]);
    S(cx,yy,w,0,c,6,{brush:'flat',load:1.05,thin:.4,bend:6});}
  S(cx-14,442,56,0,M([['titanium_white',1.2],['cadmium_yellow',.6],['cadmium_orange',.3]]),2.4,{brush:'flat',load:1.2,thin:.4,bend:6,opacity:.9});
  // brass drum with a glowing coil
  cover([[cx-hw+2,yt+14],[cx+hw-2,yt+14],[cx+hw-2,441],[cx-hw+2,441]],6,(x)=>{const u=(x-(cx-hw))/(2*hw);return u<.3?brassL():u<.65?brassM():brassS();},{ang:1.57,angJ:.15,dens:1.6,len:2,brush:'flat',o:{load:1,thin:.45}});
  for(let k=0;k<7;k++){const yy=414+k*4.8;PL([[cx-24,yy+2],[cx-8,yy+6],[cx+8,yy+6],[cx+24,yy+2]],M([['burnt_umber',.8],['raw_sienna',.4]]),4,{brush:'filbert',load:1,thin:.45,opacity:.8});PL([[cx-22,yy+1],[cx-8,yy+4.5],[cx+8,yy+4.5],[cx+22,yy+1]],M([['cerulean',.4],['titanium_white',3],['cobalt_violet',.1]]),2.6,{brush:'filbert',load:1.3,thin:.35});}
  p.dab({x:cx,y:430,size:9,color:M([['titanium_white',3],['cerulean',.3]]),brush:'round',load:1.4});
  S(cx-hw+6,428,26,1.57,M([['titanium_white',2],['naples_yellow',.6],['cadmium_yellow',.2]]),3,{brush:'flat',load:1.25,thin:.4,opacity:.9});
  for(const sg of [-1,1])PL([[cx+sg*(hw-2),452],[cx+sg*(hw+10),468],[cx+sg*(hw+9),500]],brassM(),5,{brush:'filbert',load:1.05,thin:.4});
  // control panel with dials and lamps
  cover([[cx-27,478],[cx+27,478],[cx+27,500],[cx-27,500]],5,()=>M([['paynes_grey',1],['burnt_umber',.3],['ultramarine',.3]]),{ang:0,dens:1.3,brush:'flat',o:{load:1,thin:.45}});
  for(const dx of [-12,12]){p.dab({x:cx+dx,y:489,size:8,color:brassM(),brush:'round',load:1.1,pressure:.9});p.dab({x:cx+dx-1.5,y:487.5,size:3,color:brassL(),brush:'round',load:1.3,pressure:.8});}
  for(let i=0;i<5;i++)p.dab({x:cx-16+i*8,y:497,size:2.6,color:M([[['cadmium_red','cadmium_yellow','viridian','cadmium_yellow','cadmium_red'][i],1],['titanium_white',.4]]),brush:'round',load:1.2,pressure:.8});
  S(cx,481,44,0,M([['titanium_white',1.4],['paynes_grey',.5]]),2,{brush:'flat',load:1,thin:.45,opacity:.7});
  p.dab({x:cx+21,y:481,size:3,color:M([['cadmium_yellow',1],['titanium_white',.4]]),brush:'round',load:1.2});
  // rivets and seams
  for(const yy of [418,458,474,504])for(let i=0;i<7;i++){const x=cx-44+i*14.5+R(-2,2);p.dab({x:x,y:yy+R(-1,1)+(Math.abs(i-3)>2?-1:0),size:2.8,color:M([['titanium_white',2],['paynes_grey',.3]]),brush:'round',load:1.1,pressure:.7});p.dab({x:x+1.5,y:yy+2,size:2.4,color:M([['paynes_grey',1],['ultramarine',.3]]),brush:'round',load:.9,pressure:.6});}
  // specular and streaks
  for(let k=0;k<3;k++)S(cx-24+R(-3,3),yt+36+k*34,R(22,30),1.57,M([['titanium_white',3],['cerulean',.1]]),R(2.5,4),{brush:'flat',load:1.3,thin:.35,opacity:.9});
  for(let k=0;k<8;k++)S(cx+R(-40,40),R(430,500),R(10,24),1.57+R(-.05,.05),M([['paynes_grey',1],['ultramarine',.3],['burnt_umber',.2]]),R(1.5,3),{brush:'flat',load:.7,thin:.6,opacity:.55});
  // antenna and lamp
  S(cx-12,yt-30,48,1.57+.12,M([['paynes_grey',1],['burnt_umber',.3],['ultramarine',.2]]),3,{brush:'round',load:1,thin:.45});
  p.dab({x:cx-16,y:yt-54,size:6,color:M([['cadmium_red',1],['titanium_white',.2]]),brush:'round',load:1.2});
  p.dab({x:cx-17,y:yt-55,size:3,color:'titanium_white',brush:'round',load:1.3});
  for(let k=0;k<3;k++)S(cx+4,yt-6-k*5,22-k*6,0,k%2?steelM():steelL(),5,{brush:'flat',load:1,thin:.4});
}
pod(735,1);pod(990,-1);
// console box left of the left pod
cover([[606,482],[648,482],[648,511],[606,511]],5,(x,y)=>x<620?M([['paynes_grey',.5],['cerulean',.3],['titanium_white',1.2]]):M([['paynes_grey',.8],['cobalt_blue',.2],['titanium_white',.6]]),{ang:0,dens:1.4,brush:'flat',o:{load:1,thin:.45}});
cover([[611,486],[636,486],[636,497],[611,497]],3,()=>M([['viridian',.5],['cerulean',.5],['titanium_white',1.5]]),{ang:0,dens:1.4,brush:'flat',o:{load:1.05,thin:.4}});
for(let i=0;i<4;i++)p.dab({x:613+i*7,y:504,size:3.5,color:M([[['cadmium_red','cadmium_yellow','viridian','cadmium_red'][i],1],['titanium_white',.3]]),brush:'round',load:1.2});
S(627,482,42,0,M([['titanium_white',2],['cerulean',.3]]),2.5,{brush:'flat',load:1.2,thin:.4,opacity:.85});
S(628,512,44,0,M([['burnt_umber',1],['ultramarine',.4]]),4,{brush:'flat',load:1,thin:.45,opacity:.8});
// thick cables: console -> pod, pod -> pod, with highlights and coils
function cable(pts,w){F(pts.map((q,i)=>[q[0],q[1],.85]),M([['ivory_black',.5],['paynes_grey',.5],['sap_green',.15],['burnt_umber',.2]]),w,{brush:'round',load:1.05,thin:.4});
  F(pts.map((q,i)=>[q[0]-.5,q[1]-w*.28,.7]),M([['paynes_grey',.5],['titanium_white',1.1],['cerulean',.25]]),Math.max(1.6,w*.28),{brush:'round',load:1.1,thin:.4,opacity:.85});}
cable([[648,506],[664,514],[684,509]],5);
cable([[786,508],[815,519],[845,515],[870,520],[905,516],[935,521],[944,509]],5.5);
cable([[784,498],[802,507],[822,512]],3.5);cable([[944,496],[930,508],[905,514]],3.5);
for(const [cx,cy] of [[818,517],[905,517]])for(let k=0;k<2;k++)PL([[cx-12,cy+1],[cx-4,cy-5+k*3],[cx+8,cy-2],[cx+14,cy+3]],M([['ivory_black',.5],['paynes_grey',.6],['burnt_umber',.2]]),3.2,{brush:'round',load:1,thin:.45});
p.dry();
