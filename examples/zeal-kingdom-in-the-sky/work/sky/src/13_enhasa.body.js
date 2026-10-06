// 13_enhasa: the far floating island, wet into the horizon haze: a hazy lavender-grey mass laid in big overlapping strokes,
// lit top planes warmer and paler, underside cooler, edges lost into the haze; a few tiny pale buildings.
const mixW=(a,b,u)=>{const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
const HAZE=[['titanium_white',3.2],['naples_yellow',.45],['quinacridone_rose',.1],['cobalt_violet',.14]];
const MASS=[['titanium_white',2.4],['cobalt_violet',.5],['ultramarine',.22],['raw_umber',.24],['naples_yellow',.12]];
const LIT=[['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.16],['quinacridone_rose',.06],['raw_umber',.05],['cadmium_orange',.02]];
const UNDER=[['titanium_white',1.7],['cobalt_violet',.6],['ultramarine',.42],['raw_umber',.3],['alizarin_crimson',.04]];
// horizon haze band first (y 925-1045): pale pink-cream, long flat strokes, melting upward into the gold
for(let i=0;i<70;i++){const y=R(925,1045),x=R(-60,2460);const t=(y-925)/120;const col=mixW([['naples_yellow',.8],['titanium_white',3.2],['quinacridone_rose',.08],['cobalt_violet',.1]],HAZE,t);
 p.stroke({points:seg(x,y,R(260,520),R(-.03,.03),R(-.02,.02)*300,4),color:M(col,.14),brush:'flat',size:R(44,70),load:R(.85,1.05),thin:.5,edge:R(.4,.6),taper:[.25,.25],stir:.7,clean:true});}
for(let x=-40;x<2440;x+=R(300,420))SB([[x,R(950,1000)],[x+220,R(940,1010)],[x+440,R(950,1000)]],88,.45);
// the mass: big overlapping strokes with the haze mixed in, slightly darker toward the bottom, at varied angles
const far=[[140,860],[240,845],[330,820],[420,832],[520,820],[600,840],[660,870],[640,920],[560,990],[450,1020],[330,1000],[220,950]];
cover(far,56,(x,y)=>{const d=clamp((y-860)/150,0,1);return M(mixW(mixW(MASS,UNDER,d*.75),HAZE,.16+d*.06),.14);},{dens:1,len:3.6,ang:-.03,angJ:.14,o:{load:R(.9,1.05),thin:.5,edge:.55,taper:[.2,.25],stir:.65}});
// underside: cooler and darker, laid as a few long strokes that follow the lower planes, then melted along the contour
const UC=u=>M(mixW(UNDER,HAZE,u),.14);
const run=(pts,size,col,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0]+R(-4,4),q[1]+R(-3,3),pr(i,pts.length)]),color:col,brush:'filbert',size:size,load:.95,thin:.5,edge:.55,taper:[.2,.25],stir:.6},o||{}));
run([[230,935],[300,952],[380,968],[460,972]],48,UC(.18));run([[420,970],[500,968],[570,950],[640,915]],46,UC(.2));
run([[250,905],[360,920],[470,925],[580,905],[650,880]],52,M(mixW(mixW(MASS,UNDER,.5),HAZE,.15),.14));
run([[225,952],[330,1000],[450,1020]],40,UC(.22));run([[450,1020],[560,990],[635,925]],38,UC(.25));
run([[290,985],[400,1005],[520,1000]],34,UC(.3),{edge:.65});
for(let i=0;i<10;i++){const u=R(0,1);const x=lerp(240,640,u),y=lerp(950,930,u)+Math.sin(u*Math.PI)*60+R(-15,15);SB(seg(x,y,R(90,160),R(-.15,.15)+(u<.3?.35:u>.7?-.6:0),0,3),R(48,66),R(.35,.5));}
// lit top planes: warmer and paler, flat horizontal strokes, palest at the left end nearest the sun
for(let i=0;i<16;i++){const x=R(170,620),y=R(828,880);const u=(x-140)/520;const col=mixW(LIT,HAZE,.04+u*.12);
 p.stroke({points:seg(x,y,R(70,170),R(-.04,.04),R(-.02,.02)*100,4),color:M(col,.13),brush:'flat',size:R(22,36),load:R(1,1.15),thin:.42,edge:.35,taper:[.2,.3],stir:.7,clean:true});}
// the near lit cliff face at the right end: a mid-tone step, strokes going down the face, melted
for(let i=0;i<4;i++){const x=R(585,645),y=R(885,920);S(x,y,R(50,70),R(.35,.6),M(mixW(MASS,LIT,.4),.15),R(22,30),{load:.9,thin:.5,edge:.7,taper:[.35,.35]});}
for(let i=0;i<5;i++)SB(seg(R(580,660),R(880,930),R(60,110),R(.6,1.2),0,3),50,.4);
// lose the edges: bottom and right into the haze, keep the lit top-left edge found
for(let i=0;i<22;i++){const x=R(200,660),y=R(955,1040);SB(seg(x,y,R(90,170),R(-.3,.3),0,3),R(50,70),R(.4,.55));}
for(let i=0;i<10;i++){const x=R(600,690),y=R(860,960);SB(seg(x,y,R(70,130),R(.8,1.4),0,3),R(40,60),R(.4,.5));}
for(let i=0;i<6;i++){const x=R(130,210),y=R(850,960);SB(seg(x,y,R(60,120),R(.8,1.4),0,3),50,.35);}
// a few strokes back after the melt, so the mass is still paint: the top band and a few dark notes under the overhang
for(let i=0;i<6;i++){const x=R(200,560),y=R(850,872);p.stroke({points:seg(x,y,R(80,150),R(-.03,.03),0,4),color:M(mixW(LIT,HAZE,.12),.12),brush:'flat',size:R(18,28),load:1.05,thin:.42,edge:.3,taper:[.2,.3],stir:.7,clean:true});}
for(const [x,y] of [[300,946],[430,966]])p.stroke({points:seg(x,y,R(90,150),R(-.05,.05),0,4),color:M(mixW(UNDER,HAZE,.1),.12),brush:'filbert',size:R(16,24),load:.9,thin:.5,edge:.6,taper:[.35,.35]});
// one found edge along the lit top at left (sun side), crisp and a touch thicker; the rest of the contour stays lost
for(const [pts,sz] of [[[[142,862],[200,850],[262,838],[330,824]],14],[[[250,842],[330,826],[420,834]],11]]){
 p.stroke({points:pts.map((q,i)=>[q[0],q[1]+R(-1.5,1.5),[.6,.9,.9,.6][i]||.8]),color:M(mixW(LIT,[['titanium_white',3],['naples_yellow',.5]],.4),.08),brush:'flat',size:sz,load:1.2,thin:.35,edge:.1,taper:[.15,.3],stir:.85,clean:true});}
// a cooler note just under the found edge so it reads as a plane turning, not a line
p.stroke({points:[[150,872,.6],[230,864,.8],[320,852,.6]],color:M(mixW(MASS,HAZE,.2),.1),brush:'filbert',size:12,load:.9,thin:.5,edge:.6,taper:[.3,.3]});
// small pale planes with a shadow side: a dome, a tower, a wall, a low block (6-14 px strokes)
const BW=[['titanium_white',3.2],['naples_yellow',.34],['cobalt_violet',.1]];
const BS=[['titanium_white',2.5],['cobalt_violet',.42],['ultramarine',.14],['raw_umber',.08]];
// dome at (430,828): lit cap arc left, shadow arc right, a base
arc(430,834,11,Math.PI*1.05,Math.PI*1.55,M(BW,.08),8,{load:1.1,thin:.35,taper:[.1,.3],clean:true});arc(430,834,11,Math.PI*1.55,Math.PI*2.0,M(BS,.08),7,{load:.95,thin:.4,taper:[.1,.3]});
S(430,840,26,0,M(mixW(BW,BS,.4),.08),7,{load:1,thin:.4,taper:0,brush:'flat'});
// tower at (322,830): light face, shadow face, a small warm cap
S(319,822,30,-Math.PI/2,M(BW,.08),9,{load:1.1,thin:.35,taper:[.05,.15],brush:'flat',bend:0,clean:true});S(327,824,26,-Math.PI/2,M(BS,.08),6,{load:.95,thin:.4,taper:[.05,.15],brush:'flat',bend:0});
p.dab({x:321,y:806,color:M(mixW(BW,[['naples_yellow',1],['titanium_white',2]],.3),.08),size:9,brush:'round',load:1.1,pressure:.7});
// wall at (520-560,832): long light plane with a shadow end
S(540,834,40,0,M(BW,.08),10,{load:1.1,thin:.35,taper:0,brush:'flat',bend:0,clean:true});S(563,836,14,1.2,M(BS,.08),7,{load:.95,thin:.4,taper:0,brush:'flat',bend:0});
// low block at (270,846)
S(268,846,20,0,M(mixW(BW,HAZE,.2),.08),8,{load:1,thin:.4,taper:0,brush:'flat',bend:0,clean:true});S(280,848,9,1.3,M(BS,.08),6,{load:.9,thin:.4,taper:0,brush:'flat',bend:0});
