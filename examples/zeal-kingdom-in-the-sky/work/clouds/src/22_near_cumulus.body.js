// 22: the three near masses, each one big form with its own silhouette: left = a tall tower with wide shoulders (nearest the sun), centre = a long flat-topped bank under the island (largest, its right end in the island's shadow), right = a low rolling one. Deep violet valleys between them.
p.wipe();
const dimf=(x,y)=>ISL(x,y);
// ---- LEFT MASS
const leftPoly=[[-60,1230],[40,1180],[150,1150],[260,1170],[330,1110],[380,1060],[430,1040],[480,1055],[530,1100],[580,1130],[680,1150],[780,1170],[840,1210],[870,1260],[870,1345],[-60,1350]];
massFill(leftPoly,70,{dens:1.4});
bulge({cx:170,cy:1225,rx:250,ry:95,warm:.8,sz:110,n:1.3,k1:.06,k2:.03});           // wide flat shoulder, huge strokes
bulge({cx:720,cy:1215,rx:170,ry:75,warm:.6,sz:80,n:1.1,k1:.1});                      // right shoulder
bulge({cx:440,cy:1145,rx:125,ry:105,warm:.75,sz:90,near:true,n:1.4,k1:.12,k2:.06});  // the tall crown, brightest and thickest
bulge({cx:585,cy:1135,rx:60,ry:45,warm:.65,sz:34,n:.8,k1:.14});                      // a small lump (3x smaller)
belly([[-60,1262],[150,1255],[400,1265],[650,1258],[840,1262],[880,1300],[850,1350],[-60,1355]],56,{dens:1.5});
// ---- CENTRE MASS: a long, low, flat-topped bank under the island (x 900-1700, top near y 1230), one crisp lit top edge, its right half in the island's soft shadow
const bankTop=[[900,1262],[940,1240],[1000,1230],[1120,1224],[1250,1222],[1400,1226],[1540,1234],[1640,1250],[1700,1290]];
const bankPoly=bankTop.concat([[1725,1340],[1730,1455],[890,1455],[880,1340]]);
const bankDim=(x)=>clamp((x-1250)/400,0,1)*.5;
const bankLit=(x)=>{const c=p.random()<.3?CL.litPink():CL.lit(.55);const d=bankDim(x);if(d>0)c.push(['cobalt_violet',d*.2],['ultramarine',d*.12],['raw_umber',d*.05]);return c;};
massFill(bankPoly,80,{dens:1.3});
// body: halftone and the shadow belly in long horizontal strokes
cover([[900,1300],[1700,1310],[1725,1340],[1730,1455],[890,1455],[880,1340]],80,(x,y)=>{const u=(y-1300)/155;const c=u<.35?CL.halfD():CL.shad();const d=bankDim(x);if(d>0)c.push(['ultramarine',d*.08],['cobalt_violet',d*.08]);return c;},{dens:1.4,len:4,ang:.01,angJ:.06,o:{brush:'flat',load:.9,thin:.6,edge:.45,taper:[.15,.2],stir:.7}});
// the flat-lit top plane: big horizontal strokes, cream at left, cooler toward the right
for(let i=0;i<52;i++){const x=R(930,1660),y=R(1226,1300);const len=R(250,480),sz=R(50,90);S(x,y,len,R(-.03,.03),bankLit(x),sz,{brush:'flat',load:R(1.15,1.4),thin:.28,edge:.15,taper:[.1,.15],stir:.5,clean:i<4});}
// rounded front edge of the bank: strokes curving down from the top plane into the halftone
for(let i=0;i<14;i++){const x=R(920,1680);const pts=[[x+R(-30,30),1250+R(-10,10),.6],[x+R(-10,10),1285,.95],[x+R(-20,20),1320+R(-10,10),.5]];F(pts,p.random()<.5?CL.half():bankLit(x),R(30,50),{load:1.05,thin:.4,edge:.35,taper:[.2,.4],stir:.55});}
// melt the terminator (top plane into halftone) along the bank, only there
for(let i=0;i<10;i++){const x=R(900,1700);BL([[x-120,1292+R(-6,6)],[x,1300+R(-6,6)],[x+120,1294+R(-6,6)]],44,.4);}
// the crisp lit top edge against the violet valley behind it (thick, taper 0, clean), brighter at the left
for(let i=0;i<bankTop.length-1;i++){const a=bankTop[i],b=bankTop[i+1];for(let k=0;k<2;k++){const o=k*R(6,12);F([[a[0],a[1]+o+R(0,4),.85],[(a[0]+b[0])/2,(a[1]+b[1])/2+o+R(-2,4),.95],[b[0],b[1]+o+R(0,4),.75]],bankLit((a[0]+b[0])/2),R(20,32),{load:1.45,thin:.2,edge:0,taper:0,stir:.5,clean:true});}}
belly([[890,1372],[1100,1368],[1300,1380],[1500,1372],[1725,1368],[1730,1455],[890,1455]],60,{dens:1.4});
// island's soft shadow over the bank's right half: a few thin cool veils, melted
for(let i=0;i<8;i++){const x=R(1320,1720),y=R(1300,1420);S(x,y,R(160,320),R(-.03,.03),CL.islShad(),R(50,80),{brush:'flat',load:.8,thin:.6,edge:.6,opacity:R(.1,.18),taper:[.2,.2]});}
blendPoly([[1300,1300],[1730,1300],[1730,1450],[1300,1450]],80,.35,0,20);
// ---- RIGHT: the dominant form, a tall cumulus tower (x 1850-2350, crown near y 1040), built from very large strokes
const towerPoly=[[1800,1432],[1840,1330],[1860,1240],[1890,1170],[1930,1095],[1990,1050],[2070,1036],[2150,1058],[2220,1115],[2280,1200],[2330,1300],[2350,1432]];
const litT=()=>{const c=CL.lit(.5);c.push(['titanium_white',.4]);return c;};
massFill(towerPoly,90,{dens:1.2});
// the tower as one big rounded form: lit cap upper-left, halftone, deep violet right flank, from very large strokes
bulge({cx:2085,cy:1275,rx:265,ry:235,warm:.5,sz:135,near:true,n:2.2,k1:.14,k2:.07});
// its right flank and base restated darker, big strokes curving down the form
for(let i=0;i<16;i++){const t=R(0,1);const x0=lerp(2170,2310,t)+R(-30,30),y0=lerp(1110,1330,t);const pts=[[x0-30*(1-t),y0-R(30,70),.6],[x0+R(-10,10),y0,.95],[x0+R(10,30),y0+R(50,100),.5]];F(pts,t>.5?CL.trough():CL.shad(),R(70,115),{load:.85,thin:.6,edge:.45,taper:[.15,.25],stir:.7,opacity:.85});}
for(let i=0;i<8;i++){S(R(1850,2320),R(1345,1420),R(200,380),R(-.03,.03),CL.shad(),R(60,95),{brush:'flat',load:.85,thin:.6,edge:.5,taper:[.15,.2],stir:.7});}
// rounded shoulder on the left, half-lit
for(let i=0;i<8;i++){const a=R(-3.0,-2.0),w=R(.5,.9);arcOn(1935,1260,115,115,null,a-w/2,a+w/2,R(.6,1.0),p.random()<.5?CL.half():litT(),R(60,95),{load:1.1,thin:.35,edge:.25,taper:[.12,.2],stir:.55});}
// the bright flat-lit top plane at the upper left: 80-150 px strokes
const litPlane=[[1905,1150],[1950,1075],[2010,1045],[2090,1038],[2160,1062],[2140,1130],[2060,1175],[1960,1215]];
cover(litPlane,100,litT,{dens:1.5,len:2.2,ang:-.3,angJ:.3,o:{brush:'flat',load:1.35,thin:.22,edge:.12,taper:[.08,.15],stir:.7,clean:true}});
for(let i=0;i<3;i++){const a=R(-2.6,-1.8),w=R(.6,.9);arcOn(2085,1275,265,235,null,a-w/2,a+w/2,R(.8,.96),litT(),R(90,140),{load:R(1.3,1.45),thin:.22,edge:.1,taper:[.08,.15],stir:.7,clean:true});}
// the top plane is flat: big near-horizontal strokes across the crown
for(let i=0;i<14;i++){const x=R(1930,2140),y=R(1050,1150);S(x,y,R(160,320),R(-.25,.05),litT(),R(70,120),{brush:'flat',load:R(1.3,1.45),thin:.22,edge:.12,taper:[.08,.15],stir:.7,clean:i<3});}
// terminator: a few soft strokes down the diagonal only
for(let i=0;i<6;i++){const t=R(0,1);const x=lerp(2160,2000,t),y=lerp(1090,1310,t);BL(seg(x,y,R(90,150),SUNA+R(-.3,.3),0,3),60,.38);}
// the sharp found edge along the lit crown against the sky haze: thick, crisp, clean
const crown=[[1925,1100],[1960,1068],[2010,1046],[2070,1038],[2130,1050],[2170,1072]];
for(let i=0;i<crown.length-1;i++){const a=crown[i],b=crown[i+1];for(let k=0;k<2;k++){const o=k*R(8,14);F([[a[0],a[1]+o,.85],[(a[0]+b[0])/2,(a[1]+b[1])/2+o+R(-2,3),.95],[b[0],b[1]+o,.75]],CL.lit(.6),R(22,34),{load:1.45,thin:.2,edge:0,taper:0,stir:.5,clean:true});}}
belly([[1800,1350],[2000,1340],[2200,1352],[2360,1340],[2360,1432],[1790,1432]],64,{dens:1.5});
for(let i=0;i<12;i++){const x=R(1800,2360);BL([[x-140,1340+R(-10,10)],[x,1352+R(-10,10)],[x+140,1342+R(-10,10)]],70,.5);}
for(let i=0;i<6;i++){const x=R(2240,2370);BL([[x-30,1150+R(0,40)],[x+10,1250],[x-20,1340]],60,.45);}
// one found edge on the left tower's crown
for(let i=0;i<3;i++){arcOn(440,1145,125,105,null,SUNA-.5+R(-.2,.2),SUNA+.3+R(-.2,.2),R(.9,.98),CL.lit(.8),R(22,34),{load:1.45,thin:.2,edge:0,taper:[.05,.15],stir:.5,clean:true});}
// ---- valleys: deep violet troughs between the masses, curved, melted
for(const v of [[850,1200,900,1330],[1745,1240,1790,1370]]){const [x0,y0,x1,y1]=v;
  for(let i=0;i<5;i++){const t0=R(0,.3),t1=R(.7,1);const pts=[[lerp(x0,x1,t0)+R(-14,14),lerp(y0,y1,t0),.5],[(x0+x1)/2+R(-20,20),(y0+y1)/2+R(-10,10),.9],[lerp(x0,x1,t1)+R(-14,14),lerp(y0,y1,t1),.5]];F(pts,CL.shad(),R(30,50),{load:.85,thin:.6,edge:.6,taper:[.3,.4],stir:.7,opacity:.7});}
  BL([[x0-10,y0],[(x0+x1)/2,(y0+y1)/2],[x1+10,y1]],60,.5);BL([[x0-40,(y0+y1)/2],[x1+40,(y0+y1)/2]],50,.4);}
