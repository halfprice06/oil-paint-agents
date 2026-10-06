// 39_rock_restore (round 4): the last thing painted on the rock. Re-lays the three strata as lit ledge edges with thin dark undersides, the crevices, the lower-right stepped facets, and warms the lit left face, all over the dry wreath, skipping the waterfalls.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const SIL=[[860,780],[980,800],[1200,825],[1500,830],[1800,815],[2050,790],[2160,760],[2140,800],[2085,812],[2065,872],[2005,880],[1992,942],[1935,950],[1922,1002],[1872,1012],[1862,1062],[1802,1076],[1792,1122],[1722,1132],[1700,1150],[1690,1185],[1650,1190],[1645,1225],[1600,1232],[1598,1262],[1560,1250],[1550,1215],[1512,1205],[1505,1180],[1480,1180],[1450,1220],[1400,1250],[1378,1288],[1358,1306],[1336,1290],[1290,1230],[1255,1200],[1210,1160],[1180,1150],[1140,1100],[1100,1060],[1060,1090],[1040,1080],[1000,1000],[980,960],[940,930],[900,900],[880,860],[870,840]];
const S1=[[870,862],[980,882],[1100,894],[1240,900],[1400,896],[1560,892],[1720,886],[1900,884],[2070,878]];
const S2=[[985,990],[1100,1004],[1240,1010],[1400,1006],[1560,1000],[1720,998],[1930,1002]];
const S3=[[1150,1108],[1240,1122],[1400,1120],[1560,1116],[1700,1122],[1800,1122]];
const inFall=x=>(x>1203&&x<1337)||(x>1683&&x<1767)||(x>993&&x<1057);
const Lsienna=[['burnt_sienna',.4],['yellow_ochre',.8],['titanium_white',1.9],['raw_umber',.5],['cobalt_violet',.1]];
const Lhot=[['yellow_ochre',1],['titanium_white',2.4],['naples_yellow',.5],['burnt_sienna',.2]];
const Lpink=[['titanium_white',2.6],['naples_yellow',.6],['quinacridone_rose',.12],['yellow_ochre',.4]];
const Lhalf=[['raw_umber',1],['burnt_sienna',.3],['ultramarine',.5],['titanium_white',.9],['cobalt_violet',.25]];
const Vgrey=[['ultramarine',.7],['cobalt_violet',.6],['paynes_grey',.35],['burnt_umber',.3],['titanium_white',1.3]];
const Vlit=[['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.35],['naples_yellow',.2]];
const Vdark=[['ultramarine',1],['dioxazine_purple',.4],['burnt_umber',.5],['paynes_grey',.3],['titanium_white',.4]];
const Core=[['ultramarine',1],['burnt_umber',.8],['dioxazine_purple',.5],['paynes_grey',.4],['titanium_white',.04]];
const Crev=[['dioxazine_purple',.6],['burnt_umber',.8],['ultramarine',.6],['titanium_white',.02]];
const Bounce=[['cobalt_violet',.8],['quinacridone_rose',.25],['titanium_white',1.5],['ultramarine',.25],['burnt_umber',.1]];
// 1. the lit left face: broad warm planes between the ledges, thick, in raking light (clearly lighter and warmer than the centre)
for(let i=0;i<44;i++){const x=R(885,1200),y=R(805,1100);if(!inPoly(SIL,x,y)||inFall(x))continue;const t=clamp(((x-885)/320*.6+(y-805)/300*.7),0,1);
  const sz=R(14,30);const a=p.random()<.5?.1+R(-.3,.3):1.05+R(-.5,.5);S(x,y,sz*R(1.8,3.2),a,M(ML(Lhot,Lsienna,t*.8+R(-.15,.15)),.18),sz,{brush:p.random()<.5?'flat':'filbert',load:1.1,thin:.38,edge:.4,taper:[.12,.15],stir:.65});}
// cool half-tone to keep the centre and core darker than the face
for(let i=0;i<40;i++){const x=R(1340,1690),y=R(850,1200);if(!inPoly(SIL,x,y)||inFall(x))continue;const sz=R(18,32);S(x,y,sz*R(2.5,4),.1+R(-.5,.5),M(ML(Vgrey,Vdark,R(.3,.8)),.18),sz,{brush:'flat',load:.9,thin:.5,edge:.4,taper:[.1,.12],stir:.75});}
for(let i=0;i<40;i++){const x=R(1700,2050),y=R(880,1150);if(!inPoly(SIL,x,y)||inFall(x))continue;const sz=R(18,34);S(x,y,sz*R(2.5,4),.15+R(-.5,.5),M(ML(Vdark,Core,R(.4,.9)),.15),sz,{brush:'flat',load:.85,thin:.55,edge:.4,taper:[.1,.12],stir:.85});}
// 2. strata as ledges: thin dark underside, lit outer edge (thick warm left, pale violet right), knife touches
function stratum(L,depth,knifeAt){
  for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const n=Math.max(1,Math.round(len/120));let jog=0;
    for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;const x=lerp(a[0],b[0],(t0+t1)/2),y=lerp(a[1],b[1],(t0+t1)/2)+jog;const u=clamp((x-900)/1100,0,1);const pl=len/n*R(.85,1.1);
      if(!inPoly(SIL,x,y+10)||inFall(x))continue;
      const dk=u<.35?ML(Lhalf,Core,.6):u<.6?ML(Vdark,Core,.6):Core;
      S(x+R(-4,4),y+depth*.6,pl*R(1,1.2),ang+R(-.04,.04),M(dk,.15),depth*R(.9,1.3),{load:.8,thin:.6,edge:.5,taper:[.2,.2],stir:.9});
      p.stroke({points:[[x-Math.cos(ang)*pl*.5,y-Math.sin(ang)*pl*.5+R(-2,2),.4],[x-Math.cos(ang)*pl*.5+pl*.35,y-Math.sin(ang)*pl*.5-2,.9],[x+Math.cos(ang)*pl*.5,y+Math.sin(ang)*pl*.5-1,.4]],color:M(u<.3?ML(Lhot,Lpink,R(.2,.7)):u<.6?ML(Vlit,Lpink,R(0,.4)):ML(Vgrey,Vlit,R(.3,.7)),.12),brush:'filbert',size:u<.35?depth*R(.45,.65):depth*R(.28,.45),load:u<.35?1.35:u<.6?1.05:.85,thin:u<.35?.25:.45,taper:[.25,.35],edge:u<.35?.1:.35,stir:.6,clean:u<.35&&k===0,opacity:u>.75?.7:1});
      if(p.random()<.3)jog=R(-8,8);}}
  for(const kx of knifeAt){const y=((x)=>{for(let i=0;i<L.length-1;i++)if(x<=L[i+1][0])return lerp(L[i][1],L[i+1][1],(x-L[i][0])/(L[i+1][0]-L[i][0]));return L[L.length-1][1];})(kx);
    p.stroke({points:[[kx-R(22,36),y-4,.8],[kx,y-5,1],[kx+R(22,40),y-3,.6]],color:M(Lpink,.08),brush:'knife',size:R(7,11),load:1.3,thin:.15,taper:[.1,.3],clean:true});}}
stratum(S1,28,[905,1130]);
stratum(S2,24,[1080]);
stratum(S3,20,[]);
stratum([[900,940],[1000,950],[1100,958],[1240,962]],12,[]);
// thin cast shadows right under the lit edges on the left face
for(const L of [S1,S2])for(let i=0;i<L.length-1&&L[i][0]<1250;i++){const a=L[i],b=L[i+1];const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/45));
  for(let k=0;k<n;k++){const t=(k+R(.2,.8))/n;const x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t)+R(3,8);if(!inPoly(SIL,x,y)||inFall(x))continue;
    S(x,y,R(26,48),Math.atan2(b[1]-a[1],b[0]-a[0])+R(-.05,.05),M(Crev,.12),R(3,5.5),{load:.75,thin:.6,taper:[.25,.3],edge:.25,opacity:.85,stir:.9});}}
// 3. the lower-right stepped facets: lit riser, dark underside, bounce on each lower lip
const steps=[[[2140,800],[2085,812],[2065,872]],[[2005,880],[1992,942],[1935,950]],[[1922,1002],[1872,1012],[1862,1062]],[[1802,1076],[1792,1122],[1722,1132]],[[1700,1150],[1690,1185],[1650,1190]],[[1650,1190],[1645,1225],[1600,1232]],[[1560,1250],[1550,1215],[1512,1205]],[[1512,1205],[1505,1180],[1480,1180]]];
for(const st of steps){const [a,b,c]=st;
  for(let k=0;k<3;k++)p.stroke({points:[[a[0]+R(-3,3)-k*9,a[1]+R(0,6),.7],[(a[0]+b[0])/2-k*9,(a[1]+b[1])/2,.9],[b[0]+R(-3,3)-k*9,b[1]-R(0,6),.5]],color:M(k===0?ML(Vgrey,Vlit,.35):ML(Vdark,Core,k*.3),.15),brush:'filbert',size:R(10,16),load:k===0?1.05:.8,thin:k===0?.4:.55,taper:[.15,.25],edge:.3,stir:.7,clean:k===0});
  for(let k=0;k<2;k++)p.stroke({points:[[b[0]+R(-3,3),b[1]-R(6,12)-k*10,.6],[(b[0]+c[0])/2,(b[1]+c[1])/2-R(6,12)-k*10,.9],[c[0]+R(-3,3),c[1]-R(6,12)-k*10,.5]],color:M(Core,.12),brush:'filbert',size:R(12,18),load:.75,thin:.6,taper:[.2,.2],edge:.5,stir:.9});
  p.stroke({points:[[b[0]-4,b[1]+2,.6],[(b[0]+c[0])/2,(b[1]+c[1])/2+2,.85],[c[0],c[1]+2,.4]],color:M(ML(Vdark,Bounce,.6),.15),brush:'filbert',size:R(6,10),load:.9,thin:.45,taper:[.25,.35],edge:.4,stir:.6});}
// 4. crevices, broken at the strata
for(const c of [[1060,840,1075,990],[1350,840,1388,1000],[1372,1010,1360,1230],[1565,845,1600,990],[1700,900,1690,1100],[1935,835,1978,935],[2040,800,2030,870],[1440,1030,1455,1200],[1120,1010,1130,1090]]){
  if(inFall(c[0]))continue;p.stroke({points:[[c[0]+R(-4,4),c[1],.5],[(c[0]+c[2])/2+R(-8,8),(c[1]+c[3])/2,.95],[c[2]+R(-4,4),c[3],.35]],color:M(Crev,.1),brush:'round',size:R(4,8),load:.7,thin:.62,taper:[.15,.55],stir:.9});}
// 5. the stalactite facets and found edges on the lit silhouette
p.stroke({points:[[1340,1225,.9],[1346,1265,.9],[1356,1298,.3]],color:M(ML(Vlit,Lhalf,.4),.15),brush:'flat',size:R(13,17),load:1.05,thin:.4,taper:[0,.45],edge:.1,stir:.7,clean:true});
p.stroke({points:[[1372,1222,.9],[1370,1262,.9],[1361,1300,.3]],color:M(Core,.12),brush:'flat',size:R(13,17),load:.8,thin:.55,taper:[0,.45],edge:.15,stir:.85});
for(const e of [[868,845,906,906],[906,906,944,934],[1000,1000,1040,1078]])for(let k=0;k<2;k++)p.stroke({points:[[e[0]+R(-3,3),e[1]+R(-3,3),.7],[(e[0]+e[2])/2+R(-4,4),(e[1]+e[3])/2,1],[e[2]+R(-3,3),e[3]+R(-3,3),.6]],color:M(Lpink,.1),brush:'filbert',size:R(7,12),load:1.3,thin:.25,taper:[.2,.3],clean:true});
