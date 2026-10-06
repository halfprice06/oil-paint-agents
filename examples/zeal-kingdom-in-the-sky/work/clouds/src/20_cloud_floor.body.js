// 20: the cloud floor in layers: big flat lay, medium lay, small broken-colour strokes, melted; the island's big soft shadow on the deck; the near band bluer and softer.
p.wipe();
const W=2400,H=1600;
const floorMix=(x,y)=>{const u=clamp((y-985)/615,0,1),w=clamp(1-x/1600,0,1)*.5,d=ISL(x,y);
  const pink=M([['titanium_white',3.2],['cobalt_violet',.22],['raw_umber',.12],['quinacridone_rose',.04],['naples_yellow',.16*w]],.2);
  const vio=M([['titanium_white',2.7],['cobalt_violet',.36],['ultramarine',.22],['raw_umber',.15],['naples_yellow',.1*w]],.2);
  const blu=M([['titanium_white',2.8],['ultramarine',.3],['cobalt_violet',.2],['raw_umber',.15],['cerulean',.08]],.2);
  const a=u<.45?pink:vio,b=u<.45?vio:blu,t=u<.45?u/.45:(u-.45)/.55;
  const out=[];for(let i=0;i<Math.max(a.length,b.length);i++){const pa=a[i]||[b[i][0],0],pb=b[i]||[a[i][0],0];out.push([pa[0],lerp(pa[1],pb[1],t)]);}
  if(d>0){out.push(['ultramarine',d*.06],['cobalt_violet',d*.05]);}return out;};
cover(RECT(-40,985,W+40,H+30),95,floorMix,{dens:2.5,len:5,ang:0,angJ:.03,o:{brush:'flat',load:1.1,thin:.6,edge:.3,taper:[.08,.12],stir:.75}});
cover(RECT(-40,1030,W+40,H+30),55,floorMix,{dens:.8,len:5,ang:.02,angJ:.08,o:{brush:'flat',load:.95,thin:.6,edge:.45,taper:[.15,.25],stir:.7}});
blendPoly(RECT(0,1000,W,H),88,.55,0,260);
blendPoly(RECT(0,1000,W,H),80,.45,.4,120);
blendPoly(RECT(0,1000,W,H),80,.45,-.4,120);
// small broken-colour strokes over the melted deck so it reads as paint, denser lower down
cover(RECT(-40,1060,W+40,H+30),44,(x,y)=>floorMix(x,y),{dens:.35,len:7,ang:.005,angJ:.05,o:{brush:'flat',load:1,thin:.5,edge:.4,taper:[.15,.25],stir:.4}});
blendPoly(RECT(0,1000,W,H),80,.4,0,160);
// island's cast shadow: big, soft, violet-blue, melted into the deck (the masses and the glaze restate it)
// (the island's cast shadow is carried by floorMix's tint and the glaze pass: broad and smooth, no separate strokes)
// faint warm glow of the waterfalls' mist on the deck below the falls
for(const g of [[1250,1200],[1715,1150],[1030,1120]]){for(let i=0;i<5;i++){S(g[0]+R(-60,60),g[1]+R(-20,60),R(80,160),R(-.05,.05),CL.refl(),R(30,50),{load:.8,thin:.6,edge:.6,opacity:R(.18,.3),taper:[.3,.3]});}}
// nearest band: bluer, softer, below the viewer
for(let i=0;i<60;i++){const x=R(-100,W);const y=R(1440,1615);S(x,y,R(240,480),R(-.03,.03),p.random()<.65?CL.blue():CL.shad(),R(55,95),{brush:'flat',load:.9,thin:.6,edge:.5,opacity:R(.5,.8),taper:[.15,.2],stir:.7});}
// two or three large soft cloud shoulders seen from above: cool, low contrast, lit edges only at the left
const nearLit=()=>M([['titanium_white',3.4],['cobalt_violet',.15],['ultramarine',.1],['naples_yellow',.16]],.2);
const nearShad=()=>M([['titanium_white',2.1],['ultramarine',.38],['cobalt_violet',.3],['raw_umber',.15]],.2);
for(const sh of [[520,1545,520,72,1],[1350,1580,620,80,.5],[2120,1535,460,66,.3]]){const [cx,cy,rx,ry,w]=sh;
  // shadow lower-right, big thin strokes
  for(let i=0;i<10;i++){const a=SHA+R(-1,1),ww=R(.8,1.4);arcOn(cx,cy,rx,ry,null,a-ww/2,a+ww/2,R(.5,1.0),nearShad(),R(60,100),{brush:'flat',load:.85,thin:.6,edge:.5,taper:[.15,.25],stir:.7});}
  // lit upper-left shoulder, cooler cream, big strokes
  for(let i=0;i<12;i++){const a=SUNA+R(-.8,.8),ww=R(.8,1.4);const c=nearLit();if(w<1)c.push(['cobalt_violet',(1-w)*.15],['ultramarine',(1-w)*.1]);arcOn(cx,cy,rx,ry,null,a-ww/2,a+ww/2,R(.4,.98),c,R(60,110),{brush:'flat',load:1.05,thin:.4,edge:.3,taper:[.12,.2],stir:.55});}
  // melt the turn
  for(let i=0;i<6;i++){const u=R(-.8,.8);const ta=SUNA+Math.PI/2;BL(seg(cx+Math.cos(ta)*rx*u*.8,cy+Math.sin(ta)*ry*u*.8,R(120,200),SUNA+R(-.3,.3),0,3),70,.45);}
  for(let i=0;i<4;i++){const a=SHA+R(-1,1),ww=R(.6,1);const pts=[];for(let j=0;j<4;j++){const aa=lerp(a-ww/2,a+ww/2,j/3);pts.push([cx+Math.cos(aa)*rx*R(.95,1.08),cy+Math.sin(aa)*ry*R(.95,1.08)]);}BL(pts,70,.5);}
  // lit edge only on the left shoulder
  if(w>=1)for(let i=0;i<4;i++){const a=SUNA+R(-.6,.3),ww=R(.3,.6);arcOn(cx,cy,rx,ry,null,a-ww/2,a+ww/2,R(.9,.98),CL.lit(.4),R(26,40),{load:1.3,thin:.25,edge:.05,taper:[.1,.2],stir:.5,clean:true});}
}
blendPoly(RECT(0,1430,W,H),88,.35,0,40);
cover(RECT(-40,1450,W+40,H+30),36,(x,y)=>floorMix(x,y),{dens:.25,len:6,ang:.005,angJ:.04,o:{brush:'flat',load:.95,thin:.55,edge:.5,taper:[.2,.3],stir:.4,opacity:.8}});
blendPoly(RECT(0,1430,W,H),88,.5,0,100);
