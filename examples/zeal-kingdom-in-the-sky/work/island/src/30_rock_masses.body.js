// 30_rock_masses (round 2): the underside as stratified rock. Three stratum lines step in and out across the mass; each band has its own tone;
// temperature runs warm sienna-ochre at the lit left, violet-grey centre, near-black blue-brown core at the lower right; pink-lavender bounce along the bottom edges. Left wet for 31.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const SIL=[[860,780],[980,800],[1200,825],[1500,830],[1800,815],[2050,790],[2160,760],[2140,800],[2085,812],[2065,872],[2005,880],[1992,942],[1935,950],[1922,1002],[1872,1012],[1862,1062],[1802,1076],[1792,1122],[1722,1132],[1700,1150],[1690,1185],[1650,1190],[1645,1225],[1600,1232],[1598,1262],[1560,1250],[1550,1215],[1512,1205],[1505,1180],[1480,1180],[1450,1220],[1400,1250],[1378,1288],[1358,1306],[1336,1290],[1290,1230],[1255,1200],[1210,1160],[1180,1150],[1140,1100],[1100,1060],[1060,1090],[1040,1080],[1000,1000],[980,960],[940,930],[900,900],[880,860],[870,840]];
const S1=[[870,862],[980,882],[1100,894],[1240,900],[1400,896],[1560,892],[1720,886],[1900,884],[2070,878]];
const S2=[[985,990],[1100,1004],[1240,1010],[1400,1006],[1560,1000],[1720,998],[1930,1002]];
const S3=[[1150,1108],[1240,1122],[1400,1120],[1560,1116],[1700,1122],[1800,1122]];
const lineY=(L,x)=>{if(x<=L[0][0])return L[0][1];for(let i=0;i<L.length-1;i++)if(x<=L[i+1][0])return lerp(L[i][1],L[i+1][1],(x-L[i][0])/(L[i+1][0]-L[i][0]));return L[L.length-1][1];};
const band=(x,y)=>y<lineY(S1,x)?0:y<lineY(S2,x)?1:y<lineY(S3,x)?2:3;
// palette
const Lsienna=[['burnt_sienna',.7],['yellow_ochre',.8],['titanium_white',1.6],['raw_umber',.4]];
const Lhot=[['yellow_ochre',1],['titanium_white',2.4],['naples_yellow',.5],['burnt_sienna',.2]];
const Lhalf=[['raw_umber',1],['burnt_sienna',.3],['ultramarine',.5],['titanium_white',.9],['cobalt_violet',.25]];
const Vgrey=[['ultramarine',.7],['cobalt_violet',.6],['paynes_grey',.35],['burnt_umber',.3],['titanium_white',1.3]];
const Vdark=[['ultramarine',1],['dioxazine_purple',.4],['burnt_umber',.5],['paynes_grey',.3],['titanium_white',.4]];
const Core=[['ultramarine',1],['burnt_umber',.8],['dioxazine_purple',.5],['paynes_grey',.4],['titanium_white',.04]];
const Bounce=[['cobalt_violet',.8],['quinacridone_rose',.25],['titanium_white',1.5],['ultramarine',.25],['burnt_umber',.1]];
// temperature by position: u 0 at the lit left .. 1 at the far right; the core is lower right
function rockCol(x,y){const u=clamp((x-900)/1100,0,1);const b=band(x,y);
  let c=u<.3?ML(Lsienna,Lhalf,u/.3):u<.6?ML(Lhalf,Vgrey,(u-.3)/.3):ML(Vgrey,Vdark,(u-.6)/.4);
  const d=Math.hypot((x-1800)/260,(y-1080)/170);c=ML(c,Core,clamp(1-d*.85,0,1)*.9);// the core
  if(b===0)c=ML(c,Core,.35);// shaded under the lip
  if(b===1)c=ML(c,u<.4?Lhot:Vgrey,.18);// this stratum steps out and catches more light
  if(b===3)c=ML(c,Core,.2);
  const bot=y>1150?clamp((y-1150)/150,0,1):0;c=ML(c,Bounce,bot*.3);// bounce near the bottom
  return c;}
// 1. base: patches following the strata (near horizontal), dense, dark first by painting right to left bands
cover(SIL,40,(x,y)=>M(rockCol(x,y),.18),{dens:3.2,len:5,angf:(x,y)=>.08+(x-1500)/8000+(band(x,y)===3?.5:0),angJ:.75,o:{brush:'flat',load:.95,thin:.48,edge:.3,taper:[.05,.08],stir:.8}});
// 2. second layer: mid patches with the facet's own temperature shifts (sienna/ochre touches at left, violet/blue at centre, warm-dark umber in the core), still following the strata
for(let i=0;i<520;i++){const x=R(870,2150),y=R(790,1380);if(!inPoly(SIL,x,y))continue;const u=clamp((x-900)/1100,0,1);const w=p.random();
  const sh=u<.35?(w<.5?[['burnt_sienna',1],['yellow_ochre',.5],['titanium_white',.8]]:[['cobalt_violet',.4],['titanium_white',1.2],['yellow_ochre',.4]]):u<.65?(w<.5?[['ultramarine',.8],['titanium_white',.9],['cobalt_violet',.4]]:[['burnt_umber',.6],['ultramarine',.5],['titanium_white',.5]]):(w<.5?[['burnt_umber',1],['ultramarine',.7],['titanium_white',.15]]:[['dioxazine_purple',.5],['ultramarine',.8],['titanium_white',.35]]);
  const sz=R(12,30);S(x,y,sz*R(4,7),.05+(x-1500)/8000+R(-.5,.5)+(p.random()<.25?1.2:0),M(ML(rockCol(x,y),sh,R(.12,.3)),.18),sz,{brush:'flat',load:R(.8,1.05),thin:.45,edge:.45,taper:[.08,.1],stir:.7});}
// 3. the left lit face: sloping sun-struck planes, thick warm paint, diagonal
for(let i=0;i<110;i++){const x=R(880,1230),y=R(800,1120);if(!inPoly(SIL,x,y)||band(x,y)===0&&x>960)continue;const t=clamp(((x-880)/350*.6+(y-800)/320*.7),0,1);
  const sz=R(18,34);S(x,y,sz*R(2,3),1.05+R(-.3,.3),M(ML(Lhot,Lsienna,t+R(-.15,.15)),.18),sz,{load:1.15,thin:.35,edge:.2,taper:[.15,.2],stir:.6});}
// 4. the core: thin near-black blue-brown, long strokes
for(let i=0;i<140;i++){const x=R(1660,2020),y=R(900,1180);if(!inPoly(SIL,x,y))continue;const sz=R(20,36);S(x,y,sz*R(2.5,4),.15+R(-.4,.4),M(Core,.15),sz,{load:.8,thin:.6,edge:.4,taper:[.2,.2],stir:.85});}
// 5. shade under the lip: dark band melted downward
for(let x=880;x<2140;x+=R(50,80)){const y=x<980?lerp(780,800,(x-860)/120):x<1200?lerp(800,825,(x-980)/220):x<1500?lerp(825,830,(x-1200)/300):x<1800?lerp(830,815,(x-1500)/300):x<2050?lerp(815,790,(x-1800)/250):lerp(790,760,(x-2050)/110);
  S(x,y+R(12,22),R(60,100),Math.atan2(x<1500?.03:-.09,1)+R(-.1,.1),M(ML(Core,x<1100?Lhalf:Vdark,.4),.15),R(22,32),{load:.8,thin:.55,edge:.6,taper:[.3,.3],stir:.85});
  SB(seg(x,y+40,R(60,90),0,0,3),40,.4);}
// 6. bounce light along every bottom edge: pink-lavender strokes just inside the silhouette, following the edge
for(let i=7;i<SIL.length-1;i++){const a=SIL[i],b=SIL[i+1];if(a[1]<850&&b[1]<850)continue;const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const n=Math.max(1,Math.round(len/34));
  for(let k=0;k<n;k++){const t=(k+R(.3,.7))/n;let x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);const dx=1500-x,dy=1000-y,dl=Math.hypot(dx,dy);const inn=R(8,22);x+=dx/dl*inn;y+=dy/dl*inn;
    const str=(y>1100?.7:.45)+R(-.1,.1);
    S(x,y,R(30,60),ang+R(-.15,.15),M(ML(rockCol(x,y),Bounce,str),.18),R(10,18),{load:.9,thin:.45,edge:.5,taper:[.3,.3],stir:.6});}}
