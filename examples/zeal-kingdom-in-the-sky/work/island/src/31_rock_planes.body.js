// 31_rock_planes (round 2): wet into 30. The strata as overhanging ledges (dark underside, lit outer edge: thick ochre-pink at the left with a few knife touches, pale violet-grey thinner to the right), stepped facets at the lower right, deep crevices, the long central stalactite, tips, roots at the lip. Then dry.
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const SIL=[[860,780],[980,800],[1200,825],[1500,830],[1800,815],[2050,790],[2160,760],[2140,800],[2085,812],[2065,872],[2005,880],[1992,942],[1935,950],[1922,1002],[1872,1012],[1862,1062],[1802,1076],[1792,1122],[1722,1132],[1700,1150],[1690,1185],[1650,1190],[1645,1225],[1600,1232],[1598,1262],[1560,1250],[1550,1215],[1512,1205],[1505,1180],[1480,1180],[1450,1220],[1400,1250],[1378,1288],[1358,1306],[1336,1290],[1290,1230],[1255,1200],[1210,1160],[1180,1150],[1140,1100],[1100,1060],[1060,1090],[1040,1080],[1000,1000],[980,960],[940,930],[900,900],[880,860],[870,840]];
const S1=[[870,862],[980,882],[1100,894],[1240,900],[1400,896],[1560,892],[1720,886],[1900,884],[2070,878]];
const S2=[[985,990],[1100,1004],[1240,1010],[1400,1006],[1560,1000],[1720,998],[1930,1002]];
const S3=[[1150,1108],[1240,1122],[1400,1120],[1560,1116],[1700,1122],[1800,1122]];
const Lsienna=[['burnt_sienna',.7],['yellow_ochre',.8],['titanium_white',1.6],['raw_umber',.4]];
const Lhot=[['yellow_ochre',1],['titanium_white',2.4],['naples_yellow',.5],['burnt_sienna',.2]];
const Lpink=[['titanium_white',2.6],['naples_yellow',.6],['quinacridone_rose',.12],['yellow_ochre',.4]];
const Lhalf=[['raw_umber',1],['burnt_sienna',.3],['ultramarine',.5],['titanium_white',.9],['cobalt_violet',.25]];
const Vgrey=[['ultramarine',.7],['cobalt_violet',.6],['paynes_grey',.35],['burnt_umber',.3],['titanium_white',1.3]];
const Vlit=[['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.35],['naples_yellow',.2]];
const Vdark=[['ultramarine',1],['dioxazine_purple',.4],['burnt_umber',.5],['paynes_grey',.3],['titanium_white',.4]];
const Core=[['ultramarine',1],['burnt_umber',.8],['dioxazine_purple',.5],['paynes_grey',.4],['titanium_white',.04]];
const Crev=[['dioxazine_purple',.6],['burnt_umber',.8],['ultramarine',.6],['titanium_white',.02]];
const Bounce=[['cobalt_violet',.8],['quinacridone_rose',.25],['titanium_white',1.5],['ultramarine',.25],['burnt_umber',.1]];
const Root=[['burnt_umber',1],['sap_green',.5],['ultramarine',.3],['titanium_white',.15]];
// a stratum edge as a ledge: pieces along the line with gaps and vertical jogs; each piece: wide thin dark underside (overhang), then the lit outer edge on top (warm thick left, cool thinner right), a few knife touches at the left
function stratum(L,depth,knifeAt){
  for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const n=Math.max(1,Math.round(len/130));
    let jog=0;
    for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;const x=lerp(a[0],b[0],(t0+t1)/2),y=lerp(a[1],b[1],(t0+t1)/2)+jog;const u=clamp((x-900)/1100,0,1);const pl=len/n*R(.85,1.15);
      if(!inPoly(SIL,x,y+10))continue;
      // underside shadow: wide, thin, soft, sinking into the band below
      const dk=u<.35?ML(Lhalf,Core,.55):u<.6?ML(Vdark,Core,.5):Core;
      S(x+R(-4,4),y+depth*.85,pl*R(1.05,1.3),ang+R(-.04,.04),M(dk,.15),depth*R(1.6,2.1),{load:.75,thin:.62,edge:.55,taper:[.2,.2],stir:.9});
      // lit outer edge: left warm thick, centre pale violet, right faint
      if(p.random()<.9){const lc=u<.3?ML(Lhot,Lpink,R(0,.6)):u<.6?ML(Vlit,Lpink,R(0,.4)):ML(Vgrey,Vlit,R(.2,.6));const w=u<.35?depth*R(.45,.7):depth*R(.25,.45);
        p.stroke({points:[[x-Math.cos(ang)*pl*.5,y-Math.sin(ang)*pl*.5-2,.5],[x+R(-6,6),y-3+R(-1,1),.95],[x+Math.cos(ang)*pl*.5,y+Math.sin(ang)*pl*.5-2,.4]],color:M(lc,.12),brush:'filbert',size:w,load:u<.35?1.35:u<.6?1.05:.85,thin:u<.35?.25:.45,taper:[.25,.35],edge:u<.35?.1:.35,stir:.6,clean:u<.35&&k===0,opacity:u>.75?.7:1});}
      if(p.random()<.3)jog=R(-10,10);}}
  for(const kx of knifeAt){const y=((x)=>{for(let i=0;i<L.length-1;i++)if(x<=L[i+1][0])return lerp(L[i][1],L[i+1][1],(x-L[i][0])/(L[i+1][0]-L[i][0]));return L[L.length-1][1];})(kx);
    p.stroke({points:[[kx-R(25,40),y-4,.8],[kx,y-5,1],[kx+R(25,45),y-3,.6]],color:M(Lpink,.08),brush:'knife',size:R(7,11),load:1.3,thin:.15,taper:[.1,.3],clean:true});}}
stratum(S1,30,[905,1010,1135]);
stratum(S2,26,[1030,1150]);
stratum(S3,22,[]);
// minor ledges between the main strata (left and centre only), shallower
stratum([[900,940],[1000,950],[1100,958],[1240,962]],12,[960]);// one short minor ledge on the lit face only
// stepped facets at the lower right: each step's riser faces left (half-light violet-grey) and its underside is dark; paint them along the silhouette steps
const steps=[[[2140,800],[2085,812],[2065,872]],[[2005,880],[1992,942],[1935,950]],[[1922,1002],[1872,1012],[1862,1062]],[[1802,1076],[1792,1122],[1722,1132]],[[1700,1150],[1690,1185],[1650,1190]],[[1650,1190],[1645,1225],[1600,1232]],[[1560,1250],[1550,1215],[1512,1205]],[[1512,1205],[1505,1180],[1480,1180]]];
for(const st of steps){const [a,b,c]=st;
  // riser (near vertical a->b): lit a little from the left
  for(let k=0;k<3;k++)p.stroke({points:[[a[0]+R(-3,3)-k*9,a[1]+R(0,6),.7],[(a[0]+b[0])/2-k*9,(a[1]+b[1])/2,.9],[b[0]+R(-3,3)-k*9,b[1]-R(0,6),.5]],color:M(k===0?ML(Vgrey,Vlit,.3):ML(Vdark,Core,k*.3),.15),brush:'filbert',size:R(10,16),load:k===0?1:.8,thin:k===0?.4:.55,taper:[.15,.25],edge:.3,stir:.7});
  // tread underside (b->c): dark, soft
  for(let k=0;k<2;k++)p.stroke({points:[[b[0]+R(-3,3),b[1]-R(6,12)-k*10,.6],[(b[0]+c[0])/2,(b[1]+c[1])/2-R(6,12)-k*10,.9],[c[0]+R(-3,3),c[1]-R(6,12)-k*10,.5]],color:M(Core,.12),brush:'filbert',size:R(12,18),load:.75,thin:.6,taper:[.2,.2],edge:.5,stir:.9});
  // bounce on the step's lower lip
  p.stroke({points:[[b[0]-4,b[1]+2,.6],[(b[0]+c[0])/2,(b[1]+c[1])/2+2,.85],[c[0],c[1]+2,.4]],color:M(ML(Vdark,Bounce,.6),.15),brush:'filbert',size:R(6,10),load:.9,thin:.45,taper:[.25,.35],edge:.4,stir:.6});}
// crevices: thin dark violet-brown, vertical, broken at the strata, with a cool pale edge on their left where light grazes
for(const c of [[1060,840,1075,990],[1350,840,1388,1000],[1372,1010,1360,1230],[1565,845,1600,990],[1700,900,1690,1100],[1935,835,1978,935],[2040,800,2030,870],[1440,1030,1455,1200]]){
  for(let k=0;k<1;k++)p.stroke({points:[[c[0]+R(-4,4),c[1],.5],[(c[0]+c[2])/2+R(-8,8),(c[1]+c[3])/2,.95],[c[2]+R(-4,4),c[3],.35]],color:M(Crev,.1),brush:'round',size:R(4,8),load:.7,thin:.62,taper:[.15,.55],stir:.9});
  if(c[0]<1250&&p.random()<.6)p.stroke({points:[[c[0]-7,c[1]+10,.4],[(c[0]+c[2])/2-7,(c[1]+c[3])/2,.8],[c[2]-7,c[3]-10,.3]],color:M(c[0]<1250?Lsienna:Vlit,.15),brush:'round',size:R(3,5),load:.9,thin:.45,taper:[.2,.5],edge:.3,opacity:.8});}
// the central stalactite: a short faceted point, lit left facet warm violet-grey, dark right facet, bounce at its tip (33 dissolves it in mist)
p.stroke({points:[[1340,1225,.9],[1346,1265,.9],[1356,1300,.3]],color:M(ML(Vlit,Lhalf,.4),.15),brush:'flat',size:R(14,18),load:1.05,thin:.4,taper:[0,.45],edge:.1,stir:.7,clean:true});
p.stroke({points:[[1372,1222,.9],[1370,1262,.9],[1360,1302,.3]],color:M(Core,.12),brush:'flat',size:R(14,18),load:.8,thin:.55,taper:[0,.45],edge:.15,stir:.85});
p.stroke({points:[[1356,1230,.6],[1358,1270,.9],[1358,1296,.3]],color:M(Crev,.1),brush:'round',size:R(3,5),load:.7,thin:.6,taper:[.1,.5]});
p.stroke({points:[[1340,1292,.5],[1352,1300,.8],[1366,1292,.3]],color:M(Bounce,.15),brush:'filbert',size:R(6,9),load:.9,thin:.45,taper:[.3,.3],edge:.5});
// the other tips: dark right side, lit-bounce left edge
for(const t of [[1400,1252],[1290,1232],[1598,1262],[1700,1152],[1040,1082],[1140,1102],[1180,1152],[1000,1002],[940,932]]){const lit=t[0]<1240;
  p.stroke({points:[[t[0]+9+R(-4,4),t[1]-R(60,90),.8],[t[0]+5,t[1]-30,.85],[t[0]+R(-3,3),t[1]-4,.3]],color:M(lit?Lhalf:Core,.1),brush:'filbert',size:R(12,18),load:.8,thin:.55,taper:[.1,.5],stir:.85});
  p.stroke({points:[[t[0]-10+R(-4,4),t[1]-R(50,80),.6],[t[0]-6,t[1]-25,.8],[t[0]-2,t[1]-6,.3]],color:M(lit?Lsienna:ML(Vdark,Bounce,.55),.15),brush:'filbert',size:R(5,9),load:.9,thin:.45,taper:[.1,.5],edge:.4,stir:.6});}
// the lit left face in raking light: thin cool violet-brown cast shadows right under each lit ledge edge, a few cracks, extra knife touches
for(const L of [S1,S2,[[900,940],[1000,950],[1100,958],[1240,962]]]){for(let i=0;i<L.length-1&&L[i][0]<1250;i++){const a=L[i],b=L[i+1];const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/45));
  for(let k=0;k<n;k++){const t=(k+R(.2,.8))/n;const x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t)+R(4,9);if(!inPoly(SIL,x,y))continue;
    S(x,y,R(26,48),Math.atan2(b[1]-a[1],b[0]-a[0])+R(-.05,.05),M([['dioxazine_purple',.5],['burnt_umber',.9],['ultramarine',.5],['titanium_white',.15]],.12),R(3,5.5),{load:.75,thin:.6,taper:[.25,.3],edge:.25,opacity:.85,stir:.9});}}}
for(const c of [[940,900,990,970],[1080,930,1120,1010],[1150,860,1170,920],[1010,1020,1060,1070],[930,850,960,890]])p.stroke({points:[[c[0],c[1],.4],[(c[0]+c[2])/2+R(-5,5),(c[1]+c[3])/2+R(-4,4),.85],[c[2],c[3],.3]],color:M(Crev,.1),brush:'round',size:R(2.5,4.5),load:.7,thin:.62,taper:[.15,.5],stir:.9});
for(const k of [[915,866],[1055,884],[1120,975],[1185,1002]])p.stroke({points:[[k[0]-R(14,24),k[1]-3,.8],[k[0],k[1]-5,1],[k[0]+R(14,24),k[1]-3,.6]],color:M(Lpink,.08),brush:'knife',size:R(7,10),load:1.35,thin:.12,taper:[.1,.3],clean:true});
// roots and hanging vegetation at the lip
const roots=[[905,800,905,885],[1000,815,1010,870],[1120,826,1122,900],[1330,838,1325,890],[1600,845,1595,930],[1880,830,1878,905],[2020,815,2015,870],[2110,790,2100,840],[1450,840,1455,880],[1760,832,1750,890]];
for(const r of roots){const n=1+Math.floor(R(0,2));for(let k=0;k<n;k++){const dx=R(-10,10);
  p.stroke({points:[[r[0]+dx,r[1],.8],[r[0]+dx+R(-8,8),(r[1]+r[3])/2,.6],[r[2]+dx+R(-6,6),r[3]+R(-10,10),.25]],color:M(Root,.2),brush:'round',size:R(3,6),load:.9,thin:.5,taper:[0,.5]});}}
for(const c of [[1130,840,40,30],[1610,846,52,36],[1950,812,44,28],[960,802,30,22],[1420,842,36,26]]){
  for(let k=0;k<5;k++){const x=c[0]+R(-c[2]*.5,c[2]*.5);p.stroke({points:[[x,c[1]-4,.9],[x+R(-5,5),c[1]+c[3]*R(.4,.7),.7],[x+R(-8,8),c[1]+c[3]*R(.8,1.3),.2]],color:M(ML(Root,[['sap_green',1],['ultramarine',.3],['yellow_ochre',.3]],R(.3,.7)),.2),brush:'filbert',size:R(6,11),load:.95,thin:.45,edge:.4,taper:[0,.6],stir:.6});}}
// found edges along the lit left silhouette
for(const e of [[868,845,906,906],[906,906,944,934],[1000,1000,1040,1078]])for(let k=0;k<2;k++)p.stroke({points:[[e[0]+R(-3,3),e[1]+R(-3,3),.7],[(e[0]+e[2])/2+R(-4,4),(e[1]+e[3])/2,1],[e[2]+R(-3,3),e[3]+R(-3,3),.6]],color:M(Lpink,.1),brush:'filbert',size:R(7,12),load:1.3,thin:.25,taper:[.2,.3],clean:true});
// lost edges: melt the far-right steps' outer edge and the lowest tips a little
for(let i=0;i<6;i++)SB(seg(R(2040,2140),R(790,870),R(60,90),R(1.5,2),0,3),40,.4);
for(let i=0;i<6;i++)SB(seg(R(1280,1440),R(1230,1290),R(50,80),R(-.4,.4),0,3),36,.3);
p.dry();
