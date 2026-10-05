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
// BACKGROUND: far town, trees, foliage, tents, tower, bell, bunting
const GX=860,GY=415;
const nz=(x,y)=>Math.sin(x*.043+1.3)*Math.sin(y*.051+.4)+.6*Math.sin(x*.11+y*.07)+.4*Math.sin(x*.19-y*.13);
function leafy(poly,sz,o,dark){
  cover(poly,sz,(x,y)=>{let n=nz(x,y)+R(-.55,.55);const d=Math.hypot(x-GX,y-GY);if(dark&&d<150)n-=1.4*(1-d/150);
    if(n>.95)return M([['cadmium_lemon',.45],['sap_green',.6],['titanium_white',.45],['yellow_ochre',.12]]);
    if(n>.25)return M([['sap_green',1],['cadmium_yellow',.22],['viridian',.15],['titanium_white',.25]]);
    if(n>-.5)return M([['sap_green',.7],['viridian',.3],['ultramarine',.3],['titanium_white',.12]]);
    return M([['ultramarine',.5],['viridian',.35],['burnt_umber',.3],['sap_green',.3]]);},
    Object.assign({ang:-.6,angJ:1.1,len:1.7,brush:'filbert',o:{load:.9,thin:.5}},o||{}));}
// --- far town
for(let x=-10;x<1200;x+=R(28,52)){const w=R(22,38),h=R(14,24),y=R(352,368);
  const wall=M([['titanium_white',2],['quinacridone_rose',.2],['naples_yellow',.5],['cerulean',.3]]);
  S(x+w/2,y-h/2,w,0,wall,h*.8,{load:.8,thin:.6,brush:'flat'});
  S(x+w/2,y-h-3,w*1.25,R(-.06,.06),M([['burnt_sienna',.6],['cobalt_violet',.3],['titanium_white',1.6],['cerulean',.2]]),h*.55,{load:.85,thin:.6,brush:'flat'});
  p.dab({x:x+w*.3,y:y-h*.4,size:4,color:M([['cobalt_violet',.6],['titanium_white',.7],['ultramarine',.3]]),brush:'flat',load:.7});}
for(let i=0;i<40;i++){const x=R(0,1200),y=R(340,372);S(x,y,R(14,26),R(-.4,.4),M([['viridian',.4],['cerulean',.3],['titanium_white',1.2],['sap_green',.3],['cobalt_violet',.15]]),R(8,13),{load:.8,thin:.55});}
// --- tree mass behind the stage (dark so the gate pops)
const T=[[555,355],[590,285],[670,240],[760,222],[850,232],[940,236],[1015,275],[1045,355],[1045,470],[555,470]];
leafy(T,24,{dens:1.2},true);leafy(T,12,{dens:.5},true);leafy(T,6,{dens:.12,len:1.5},true);
// trunks
for(const [tx,ty] of [[648,318],[1006,330]]){
  for(let k=0;k<6;k++)S(tx+R(-2,2),ty+k*24+R(-4,4),R(30,50),1.57+R(-.06,.06),M([['burnt_umber',.8],['ultramarine',.3],['sap_green',.2],['titanium_white',.12]]),R(10,15),{load:.9,thin:.5,brush:'flat'});
  S(tx-4,ty+60,90,1.57,M([['yellow_ochre',.4],['burnt_sienna',.4],['titanium_white',.4],['burnt_umber',.3]]),5,{load:1,thin:.4,brush:'flat'});}
// --- top-right canopy
const C=[[870,-20],[1220,-20],[1220,235],[1120,205],[1050,155],[960,135],[900,75]];
leafy(C,24,{dens:1.2});leafy(C,12,{dens:.55});leafy(C,6,{dens:.18,len:1.5});
// sky holes in the canopy: bright dabs
for(let i=0;i<26;i++){const x=R(920,1200),y=R(10,200);if(!inPoly(C,x,y))continue;S(x,y,R(8,18),R(-.8,.8),M([['titanium_white',2],['cerulean',.6],['naples_yellow',.3]]),R(5,9),{load:1,thin:.4});}
// left-edge branches over the crowd? (small leafy tuft far left)
// --- TENT A
function tent(ax,ay,x0,x1,by,cols,n,sz){
  const wid=(x1-x0)/n;
  for(let i=0;i<n;i++){const xa=x0+i*wid,xb=xa+wid,xm=(xa+xb)/2;const c=cols[i%2];
    const poly=[[ax,ay+1],[xa,by+Math.sin(i*.9)*3],[xb,by+Math.sin(i*.9+.9)*3]];
    const ang=Math.atan2(by-ay,xm-ax);
    for(const [s2,dn] of [[sz,1.4],[sz*.55,.7]]){
      cover(poly,s2,(x,y)=>{const sh=Math.max(0,Math.min(1,(x-(x0+(x1-x0)*.45))/((x1-x0)*.55)));const f=(y-ay)/(by-ay);
        const base=c==='r'?[['vermilion',.7],['cadmium_red',.5],['alizarin_crimson',.08],['titanium_white',.18*(1-sh)]]:c==='b'?[['cobalt_blue',.8],['ultramarine',.35],['titanium_white',.5*(1-sh)+.2]]:[['titanium_white',2],['naples_yellow',.5],['yellow_ochre',.05]];
        const shd=[['cobalt_violet',.5*sh],['ultramarine',.25*sh],['burnt_sienna',.15*sh]];
        const warm=[['cadmium_orange',.12*(1-sh)*(f)]];
        return M(base.concat(shd,warm));},
        {ang:ang,angJ:.08,dens:dn,len:2.4,brush:'flat',o:{load:.95,thin:.5}});}
  }
}
tent(442,272,318,568,436,['r','w'],12,16);
// valance scallops
for(let i=0;i<13;i++){const x=322+i*19.5;const c=i%2?'w':'r';const sh=(x-318)/250;
  S(x+9,442,20,0,c==='r'?M([['vermilion',.7],['alizarin_crimson',.12],['cobalt_violet',.4*sh]]):M([['titanium_white',2],['naples_yellow',.4],['cobalt_violet',.5*sh]]),13,{load:.95,thin:.5,brush:'filbert',bend:5});}
// tent pole finial + pennant
S(442,262,18,1.57,M([['burnt_umber',1],['yellow_ochre',.4]]),4,{brush:'flat',load:1});
F([[444,258,.8],[462,254,.6],[480,258,.45],[470,263,.3]],M([['cadmium_red',1],['vermilion',.4]]),10,{brush:'flat',load:1,angle:0});
// --- TENT B
tent(1085,282,985,1235,428,['b','w'],10,16);

// tent B scallops + finial + pennant
for(let i=0;i<13;i++){const x=985+i*19.5;if(x>1200)break;const c=i%2?'w':'b';const sh=(x-985)/215;
  S(x+9,432,20,0,c==='b'?M([['cobalt_blue',.8],['ultramarine',.3],['cobalt_violet',.3*sh],['titanium_white',.2]]):M([['titanium_white',2],['naples_yellow',.4],['cobalt_violet',.4*sh]]),13,{load:.95,thin:.5,brush:'filbert',bend:5});}
S(1085,272,18,1.57,M([['burnt_umber',1],['yellow_ochre',.4]]),4,{brush:'flat',load:1});
F([[1087,268,.8],[1106,263,.6],[1124,268,.45],[1114,273,.3]],M([['cadmium_yellow',1],['cadmium_orange',.2]]),10,{brush:'flat',load:1,angle:0});
// --- TOWER
function pillar(x0,x1,y0,y1,lightK){
  const w=x1-x0;
  const bands=[[0,.33,[['naples_yellow',.6],['yellow_ochre',.35],['titanium_white',1.3],['raw_sienna',.1]]],[.33,.68,[['raw_sienna',.5],['titanium_white',1.1],['cobalt_violet',.2],['yellow_ochre',.3]]],[.68,1,[['cobalt_violet',.5],['burnt_umber',.4],['ultramarine',.25],['titanium_white',.9]]]];
  for(const [a,b,mx] of bands){for(let pass=0;pass<2;pass++){let y=y0+R(-10,0);while(y<y1){const len=R(26,56);S(x0+w*lerp(a,b,R(.2,.8)),y+len/2,len,1.57+R(-.05,.05),M(mx),w*(b-a)*R(.6,1.0)+3,{load:.95,thin:.5,brush:'flat'});y+=len*R(.5,.8);}}}
  // stone courses: broken horizontal mortar and chips
  for(let y=y0+14;y<y1;y+=R(20,27)){const sx=x0+R(0,8);S(sx+w*.4,y,w*R(.5,.95),R(-.03,.03),M([['burnt_umber',.7],['cobalt_violet',.5],['titanium_white',.6]]),R(2.5,4),{load:.7,thin:.6,brush:'flat',opacity:.75});
    if(R(0,1)<.5)S(x0+w*.2,y-9,w*R(.25,.4),0,M([['titanium_white',2],['naples_yellow',.5]]),3.5,{load:1,thin:.4,brush:'flat',opacity:.8});}
  // highlight edge on lit side
  for(let k=0;k<4;k++)S(x0+3,lerp(y0,y1,k/4+.1),R(40,70),1.57,M([['titanium_white',2],['naples_yellow',.6],['cadmium_yellow',.06]]),4,{load:1.1,thin:.4,brush:'flat'});
}
pillar(97,141,156,448);pillar(220,266,156,448);
// plinth bases
for(const [x0,x1] of [[88,150],[212,276]]){S((x0+x1)/2,436,x1-x0,0,M([['raw_sienna',.5],['titanium_white',1],['cobalt_violet',.3]]),14,{load:.95,thin:.5});S((x0+x1)/2,424,x1-x0-8,0,M([['naples_yellow',.5],['titanium_white',1.4],['yellow_ochre',.2]]),9,{load:1,thin:.5});}
// roof gable: boards, rakes, fascia
const AX=182,AY=54;
for(let x=96;x<=270;x+=R(7,10)){const yt=AY+Math.abs(x-AX)*(100/108);const left=x<AX;
  S(x,(yt+160)/2+2,160-yt,1.57,left?M([['raw_sienna',.7],['yellow_ochre',.5],['titanium_white',.6],['burnt_sienna',.2]]):M([['burnt_sienna',.7],['burnt_umber',.4],['cobalt_violet',.3],['titanium_white',.4]]),R(8,11),{load:.95,thin:.5,brush:'flat'});}
for(const dir of [-1,1]){const lit=dir<0;for(let k=0;k<22;k++){const t=k/21;const x=AX+dir*(t*112),y=AY+t*104;
  S(x+dir*R(-3,3),y,R(14,22),dir<0?2.35:.8,lit?M([['burnt_sienna',.9],['vermilion',.2],['yellow_ochre',.25],['titanium_white',.2]]):M([['burnt_umber',.8],['cobalt_violet',.4],['burnt_sienna',.4]]),R(8,12),{load:1,thin:.45,brush:'flat'});}}
S(182,164,200,0,M([['burnt_umber',1],['ultramarine',.4],['cobalt_violet',.2]]),14,{load:1,thin:.45,brush:'flat'});
S(176,160,120,0,M([['burnt_sienna',.6],['yellow_ochre',.3],['titanium_white',.3]]),5,{load:1,thin:.4,brush:'flat',opacity:.8});
S(AX,AY-2,10,1.57,M([['burnt_umber',1],['yellow_ochre',.5]]),5,{load:1,brush:'round'});
// interior: crossbeam, braces
S(180,184,170,0,M([['burnt_umber',1],['raw_sienna',.4],['ultramarine',.2]]),12,{load:1,thin:.4,brush:'flat'});
S(176,180,140,0,M([['yellow_ochre',.4],['burnt_sienna',.5],['titanium_white',.3]]),4,{load:1,thin:.4,brush:'flat',opacity:.85});
S(150,168,26,.9,M([['burnt_umber',1],['raw_sienna',.3]]),7,{load:1,brush:'flat'});S(212,168,26,2.2,M([['burnt_umber',1],['cobalt_violet',.3]]),7,{load:1,brush:'flat'});
// BELL
const BELL=[[163,198],[197,198],[205,222],[215,250],[232,272],[130,272],[147,250],[157,222]];
for(const [s2,dn] of [[16,1.4],[9,.9]])cover(BELL,s2,(x,y)=>{const f=(x-130)/102;const lit=1-Math.min(1,Math.abs(f-.3)*2.2);
  return M([['yellow_ochre',.8],['cadmium_yellow',.25*lit],['raw_sienna',.45*(1-lit)],['burnt_sienna',.3*(1-f)*(1-lit)+.35*f],['burnt_umber',.35*f*f],['titanium_white',.5*lit+.1]]);},{ang:1.5,angJ:.18,dens:dn,len:2.2,brush:'filbert',o:{load:1.05,thin:.4}});
// bell bands, highlights, reflected sky light, mouth
for(const [by,w] of [[236,52],[262,84]]){S(180,by,w,R(-.03,.03),M([['cadmium_yellow',.5],['yellow_ochre',.5],['titanium_white',.7]]),5,{load:1.1,thin:.4,brush:'flat',bend:4});S(186,by+4,w*.8,0,M([['burnt_umber',.8],['raw_sienna',.4]]),3,{load:.9,thin:.5,brush:'flat',opacity:.8,bend:4});}
S(162,236,60,1.45,M([['titanium_white',2.5],['naples_yellow',.8],['cadmium_yellow',.1]]),7,{load:1.3,thin:.35,brush:'filbert',bend:-3});
S(166,262,26,1.2,M([['titanium_white',2],['cadmium_yellow',.3]]),4,{load:1.3,thin:.4,brush:'round'});
S(216,250,36,1.2,M([['cerulean',.7],['titanium_white',1],['yellow_ochre',.3]]),5,{load:.9,thin:.5,brush:'filbert',opacity:.7});
S(180,273,100,0,M([['burnt_umber',1],['ultramarine',.3]]),8,{load:1,thin:.4,brush:'flat',bend:6});
S(180,276,70,0,M([['yellow_ochre',.6],['titanium_white',.8],['cadmium_yellow',.2]]),3,{load:1.1,thin:.4,brush:'flat',bend:5});
p.dab({x:180,y:282,size:9,color:M([['burnt_umber',1],['raw_sienna',.5]]),brush:'round',load:1});
// yoke
S(180,200,56,0,M([['burnt_umber',1],['raw_sienna',.5]]),9,{load:1,brush:'flat'});S(162,201,26,0,M([['yellow_ochre',.4],['burnt_sienna',.4],['titanium_white',.3]]),3,{load:1,brush:'flat'});
// --- BUNTING
const PC=[[['cadmium_red',1],['titanium_white',.15]],[['cadmium_yellow',1],['titanium_white',.3]],[['cobalt_blue',1],['titanium_white',.4]],[['titanium_white',2],['naples_yellow',.3]],[['viridian',.4],['sap_green',.4],['titanium_white',.4]],[['quinacridone_rose',.7],['titanium_white',.6]]];
function bunting(x0,y0,x1,y1,sag,step){const N=Math.round(Math.hypot(x1-x0,y1-y0)/step);const pt=t=>[lerp(x0,x1,t),lerp(y0,y1,t)+sag*4*t*(1-t)];
  const sp=[];for(let i=0;i<=7;i++){const q=pt(i/7);sp.push([q[0],q[1],.6]);}
  F(sp,M([['burnt_umber',1],['ultramarine',.5],['titanium_white',.4]]),1.8,{brush:'round',load:.7,thin:.7});
  for(let k=1;k<N;k++){const q=pt(k/N+R(-.012,.012));const c=PC[(k+Math.floor(R(0,2)))%PC.length];const h=R(9,13);
    F([[q[0],q[1]+1,1],[q[0]+R(-1,1),q[1]+h,.3]],M(c),R(8,11),{brush:'flat',load:1.05,thin:.4,angle:R(-.15,.15)});
    p.dab({x:q[0]-2,y:q[1]+3,size:3,color:M([['titanium_white',2],['naples_yellow',.3]]),brush:'round',load:1,pressure:.8});}}
bunting(188,58,440,268,30,20);bunting(448,270,596,330,16,17);bunting(1085,284,905,118,34,19);bunting(76,156,-10,120,8,16);bunting(292,156,420,150,-1,17);
p.dry();
