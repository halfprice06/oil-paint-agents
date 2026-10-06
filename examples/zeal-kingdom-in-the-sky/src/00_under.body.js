// 00_under: block-in of the whole scene from study_color.svg, big brushes, dark to light, palette mixes. Then dry.
p.wipe();
const W=2400,H=1600;
// --- sky: bands from lavender-blue at the top to warm gold at the horizon, laid as long overlapping horizontal strokes, then melted
const skyMix=t=>{ // t 0 top .. 1 horizon
  const top=[['ultramarine',1],['cobalt_blue',.4],['titanium_white',2.2],['alizarin_crimson',.12]];
  const mid=[['cobalt_blue',.35],['cobalt_violet',.25],['titanium_white',3],['naples_yellow',.3]];
  const low=[['naples_yellow',1],['titanium_white',2.6],['cadmium_orange',.12],['cobalt_violet',.08]];
  const a=t<.5?top:mid,b=t<.5?mid:low,u=t<.5?t*2:(t-.5)*2;
  const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
for(let y=-40;y<1040;y+=58){const t=clamp((y+40)/1000,0,1);
  for(let x=-80;x<W+80;x+=R(520,760)){const len=R(600,820);
    p.stroke({points:[[x,y+R(-8,8)],[x+len*.5,y+R(-10,10)],[x+len,y+R(-8,8)]],color:M(skyMix(t),.15),brush:'flat',size:R(70,92),load:1.1,thin:.5,taper:0,edge:.3,stir:.7});}}
// sun glow: warm pale lemon wedge at upper left, wet into the sky
for(let i=0;i<60;i++){const a=R(0,TAU),r=R(0,1)**.5*330;const x=260+Math.cos(a)*r*1.5,y=420+Math.sin(a)*r;if(y>980)continue;
  S(x,y,R(160,300),R(-.3,.3),M([['titanium_white',3],['cadmium_lemon',.5],['naples_yellow',.6]],.2),R(60,80),{load:.9,thin:.5,opacity:R(.35,.7),edge:.5,taper:[.3,.3],stir:.8});}
// melt the sky
for(let y=20;y<1000;y+=70)for(let x=0;x<W;x+=400)SB([[x,y+R(-20,20)],[x+250,y+R(-30,30)],[x+480,y+R(-20,20)]],88,.5);
p.dry();
// --- cloud sea: violet-grey floor, then lit cumulus tops as warm cream masses, shadow bellies cooler
fill(RECT(0,990,W,H),80,(x,y)=>M([['ultramarine',.5],['cobalt_violet',.5],['titanium_white',2.6],['raw_umber',.25],['alizarin_crimson',.1]],.2),{step:.8,tilt:.01,so:{load:1,thin:.5,edge:.2}});
const cum=[[-50,1250,300,1090,600,1110,860,1200],[820,1340,1120,1220,1440,1250,1740,1330],[1740,1300,2100,1180,2400,1220,2400,1420]];
for(const c of cum){const poly=[[c[0],c[1]],[c[2],c[3]],[c[4],c[5]],[c[6],c[7]],[c[6],c[7]+120],[c[0],c[1]+100]];
  cover(poly,70,(x,y)=>{const top=y<(c[3]+c[5])/2+60;return top?M([['titanium_white',3],['naples_yellow',.6],['cadmium_orange',.06]],.15):M([['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.3],['raw_umber',.15]],.2);},{dens:.9,len:2.2,ang:-.1,angJ:.4,o:{load:1,thin:.45,edge:.4,taper:[.25,.35]}});}
// far horizon haze band: pinkish cream
for(let x=-40;x<W;x+=R(300,420))S(x+150,R(1000,1030),R(360,460),R(-.03,.03),M([['titanium_white',3],['naples_yellow',.5],['quinacridone_rose',.12],['cobalt_violet',.15]],.15),R(40,56),{load:.8,thin:.6,edge:.6,opacity:.7,taper:[.3,.3]});
for(let x=0;x<W;x+=380)SB([[x,1060],[x+200,1080],[x+420,1060]],80,.5);
// --- far island (Enhasa): hazy lavender-grey, flat planes
const far=[[140,860],[240,845],[330,820],[420,832],[520,820],[600,840],[660,870],[640,920],[560,990],[450,1020],[330,1000],[220,950]];
cover(far,44,(x,y)=>y>930?M([['cobalt_violet',.6],['ultramarine',.4],['titanium_white',2],['raw_umber',.3]],.15):M([['cobalt_violet',.4],['titanium_white',2.6],['raw_umber',.25],['naples_yellow',.2]],.15),{dens:1,len:2,ang:0,angJ:.3,o:{load:.9,thin:.5,edge:.3}});
// --- main island underside: dark cool rock, warmer lit left faces
const under=[[860,780],[980,800],[1200,825],[1500,830],[1800,815],[2050,790],[2160,760],[2120,850],[2000,900],[1960,1000],[1880,1040],[1800,1120],[1700,1140],[1640,1230],[1560,1260],[1480,1180],[1400,1250],[1320,1290],[1260,1200],[1180,1150],[1100,1060],[1040,1080],[980,960],[900,900],[870,840]];
cover(under,60,(x,y)=>M([['ultramarine',1],['burnt_umber',.9],['dioxazine_purple',.35],['titanium_white',.55]],.2),{dens:1,len:2.2,ang:1.2,angJ:.35,o:{load:.9,thin:.45,edge:.2}});
const litL=[[860,780],[980,800],[1200,825],[1250,900],[1200,1000],[1120,1040],[1040,1080],[980,960],[900,900],[870,840]];
cover(litL,50,(x,y)=>M([['raw_umber',1],['yellow_ochre',.5],['titanium_white',1.1],['ultramarine',.2]],.2),{dens:1,len:2,ang:1.1,angJ:.3,o:{load:1,thin:.4,edge:.2}});
const litR=[[1500,830],[1800,815],[1760,900],[1700,1000],[1640,1230],[1560,1260],[1480,1180],[1520,1000]];
cover(litR,50,(x,y)=>M([['ultramarine',.8],['burnt_umber',.6],['cobalt_violet',.3],['titanium_white',1]],.2),{dens:1,len:2,ang:1.3,angJ:.3,o:{load:1,thin:.4,edge:.2}});
// waterfalls: pale sheets
for(const wf of [[1230,830,1300,832,1240,1180,1200,1100],[1690,820,1740,818,1700,1120,1670,1020],[1000,805,1030,808,1040,980,1010,940]]){
  const poly=[[wf[0],wf[1]],[wf[2],wf[3]],[wf[4],wf[5]],[wf[6],wf[7]]];
  cover(poly,22,(x,y)=>M([['titanium_white',3],['cerulean',.25],['cobalt_blue',.1]],.15),{dens:1.1,len:3,ang:Math.PI/2,angJ:.08,o:{load:1,thin:.4,edge:.3,taper:[.2,.5]}});}
// --- plateau: green with a lit yellow-green left field
const plat=[[820,740],[960,690],[1150,660],[1400,645],[1650,650],[1900,670],[2100,710],[2160,760],[2050,790],[1800,815],[1500,830],[1200,825],[980,800],[860,780]];
cover(plat,46,(x,y)=>x<1200&&y<760?M([['yellow_ochre',1],['sap_green',.5],['titanium_white',1.2],['cadmium_lemon',.2]],.2):M([['sap_green',1],['yellow_ochre',.5],['ultramarine',.25],['titanium_white',.7]],.2),{dens:1,len:2.2,ang:.1,angJ:.25,o:{load:1,thin:.45,edge:.2}});
cover([[1680,740],[1880,770],[2050,800],[1900,815],[1680,820],[1560,790]],40,(x,y)=>M([['sap_green',.8],['ultramarine',.6],['burnt_umber',.3],['titanium_white',.35]],.2),{dens:1,len:2,ang:.15,angJ:.2,o:{load:.9,thin:.5,edge:.3}});
// --- palace masses: cream lit, lavender shadow; dome blue-green
const cream=()=>M([['titanium_white',3],['naples_yellow',.7],['yellow_ochre',.15]],.15),lav=()=>M([['titanium_white',2.2],['ultramarine',.5],['cobalt_violet',.6],['raw_umber',.1]],.15);
fill([[1300,640],[1490,570],[1680,640],[1680,760],[1300,760]],34,(x,y)=>x>1560?lav():cream(),{step:.8,so:{load:1.05,thin:.4,edge:.1}});
fill([[1370,520],[1490,470],[1610,520],[1610,600],[1370,600]],26,(x,y)=>x>1540?lav():cream(),{step:.8,so:{load:1.05,thin:.4,edge:.1}});
fill([[1370,520],[1420,340],[1490,240],[1560,340],[1610,520]],24,(x,y)=>x>1535?M([['ultramarine',1],['cobalt_blue',.5],['titanium_white',1.2],['viridian',.1]],.15):M([['cerulean',1],['viridian',.3],['titanium_white',2.2]],.15),{vert:true,step:.8,so:{load:1.05,thin:.4,edge:.1}});
for(const t of [[1180,560,1285,760,1250],[1720,600,1825,770,1790]])fill(RECT(t[0],t[1],t[2],t[3]),26,(x,y)=>x>t[4]?lav():cream(),{vert:true,step:.8,so:{load:1.05,thin:.4,edge:.1}});
fill([[1180,560],[1215,470],[1285,560]],18,(x,y)=>x>1250?M([['ultramarine',1],['titanium_white',1.2]],.15):M([['cerulean',1],['titanium_white',2]],.15),{vert:true,so:{load:1,thin:.4}});
fill([[1720,600],[1755,520],[1825,600]],18,(x,y)=>x>1790?M([['ultramarine',1],['titanium_white',1.2]],.15):M([['cerulean',1],['titanium_white',2]],.15),{vert:true,so:{load:1,thin:.4}});
fill(RECT(960,700,1160,770),24,(x,y)=>x>1120?lav():cream(),{so:{load:1,thin:.4}});
fill(RECT(1880,690,2050,760),24,(x,y)=>M([['titanium_white',2],['raw_umber',.4],['naples_yellow',.4],['cobalt_violet',.15]],.15),{so:{load:1,thin:.4}});
for(const t of [[1030,680,70,45],[1960,665,80,50],[1150,770,60,35],[1860,780,55,30]])lobe(t[0],t[1],t[2],t[3],[[0,'#2f4a2c'],[.5,'#4e6e38'],[1,'#8aa24a']],Math.max(16,t[2]*.35),{jit:.1});
// --- the Epoch: gold wings, cream body, dark canopy (block only)
cover([[360,1180],[560,1140],[660,1170],[700,1195],[660,1215],[560,1230],[370,1210]],22,(x,y)=>M([['titanium_white',2],['yellow_ochre',.6],['raw_umber',.25]],.15),{dens:1.1,len:2.5,ang:-.1,angJ:.15,o:{load:1,thin:.4}});
cover([[500,1200],[290,1150],[330,1230],[480,1215]],18,(x,y)=>M([['cadmium_yellow',1],['yellow_ochre',.4],['titanium_white',.8]],.15),{dens:1.1,len:2.5,ang:.25,angJ:.15,o:{load:1,thin:.4}});
cover([[560,1215],[640,1320],[520,1260],[500,1215]],16,(x,y)=>M([['yellow_ochre',1],['burnt_umber',.6],['titanium_white',.3]],.15),{dens:1.1,len:2.5,ang:1,angJ:.15,o:{load:1,thin:.4}});
cover([[430,1165],[470,1125],[540,1120],[590,1150],[560,1168],[450,1172]],14,(x,y)=>M([['ultramarine',1],['paynes_grey',.5],['titanium_white',.9]],.15),{dens:1.1,len:2.2,ang:-.2,angJ:.2,o:{load:1,thin:.4}});
p.dry();
