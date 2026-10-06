// 37_edges (round 2): dark notches under the lip, the broken bright turf edge, a soft lost passage on the right back edge against the sky, cloud veils on the lowest tips, found edges on the lit facets and the main fall, white touches on the crests and the stream.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const Edge=[['cadmium_lemon',.5],['yellow_ochre',.6],['titanium_white',2],['sap_green',.25]];
const EdgeC=[['titanium_white',1.6],['sap_green',.6],['yellow_ochre',.4],['cerulean',.15]];
const Notch=[['burnt_umber',.8],['sap_green',.6],['ultramarine',.5],['titanium_white',.15]];
const Cloud=[['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.3],['quinacridone_rose',.08]];
const SkyR=[['titanium_white',2.6],['naples_yellow',.6],['cobalt_violet',.3],['sap_green',.2]];
const Lpink=[['titanium_white',2.6],['naples_yellow',.6],['quinacridone_rose',.12],['yellow_ochre',.4]];
const Wlit=[['titanium_white',4],['cerulean',.12],['naples_yellow',.06]];
const lipY=x=>x<980?lerp(780,800,(x-860)/120):x<1200?lerp(800,825,(x-980)/220):x<1500?lerp(825,830,(x-1200)/300):x<1800?lerp(830,815,(x-1500)/300):x<2050?lerp(815,790,(x-1800)/250):lerp(790,760,(x-2050)/110);
for(let x=875;x<2150;x+=R(28,60)){const y=lipY(x);const d=R(6,18);
  p.stroke({points:[[x+R(-3,3),y-2,.8],[x+R(-4,4),y+d*.5,.7],[x+R(-6,6),y+d,.2]],color:M(Notch,.2),brush:'filbert',size:R(5,9),load:.85,thin:.5,taper:[0,.6],stir:.8});}
for(let x=866;x<2150;x+=R(40,110)){const y=lipY(x)-R(0,3);const len=R(30,90);const a=Math.atan2(lipY(x+30)-lipY(x-30),60);const u=clamp((x-860)/1300,0,1);
  if(p.random()<.3)continue;const v=R(0,1);
  p.stroke({points:[[x-Math.cos(a)*len/2,y-Math.sin(a)*len/2,.4],[x+R(-5,5),y+R(-1,1),.9],[x+Math.cos(a)*len/2,y+Math.sin(a)*len/2,.35]],color:M(ML(ML(Edge,EdgeC,u),[['sap_green',1],['yellow_ochre',.7],['titanium_white',1]],v*.7),.12),brush:'filbert',size:R(3,6),load:1.2,thin:.35,taper:[.35,.35],edge:.3,stir:.6,clean:x<900});}
// lost passage: the right part of the back edge melts into the sky with a few thin sky-coloured veils laid across the contour
for(let i=0;i<9;i++){const x=R(1900,2150);const y=x<2100?lerp(670,710,(x-1900)/200):lerp(710,760,(x-2100)/60);S(x,y+R(-6,6),R(60,120),Math.atan2(x<2100?.2:.8,1)+R(-.1,.1),M(SkyR,.15),R(10,18),{load:.7,thin:.65,opacity:R(.2,.35),edge:.9,taper:[.4,.4],stir:.9});}
for(const t of [[1362,1372],[1325,1300],[1600,1267],[1640,1237],[1960,1002],[2010,902]]){
  S(t[0]+R(-10,10),t[1]-R(0,15),R(30,50),R(-.4,.4),M(Cloud,.15),R(22,30),{load:.7,thin:.7,opacity:R(.14,.22),edge:.95,taper:[.4,.4],stir:.9});}
for(const e of [[870,846,906,906],[906,906,944,934]])p.stroke({points:[[e[0],e[1],.6],[(e[0]+e[2])/2+R(-2,2),(e[1]+e[3])/2,1],[e[2],e[3],.5]],color:M(Lpink,.08),brush:'filbert',size:R(6,9),load:1.35,thin:.25,taper:[.2,.3],clean:true});
p.stroke({points:[[1218,840,.6],[1222,900,.95],[1226,960,.9],[1230,1000,.4]],color:M(Wlit,.06),brush:'flat',size:R(8,11),load:1.4,thin:.2,taper:[.1,.5],clean:true});
p.stroke({points:[[1226,1020,.6],[1228,1080,.9],[1226,1140,.4]],color:M(Wlit,.06),brush:'flat',size:R(6,9),load:1.4,thin:.2,taper:[.1,.5],clean:true});
p.stroke({points:[[1696,828,.6],[1700,890,.9],[1708,960,.4]],color:M(Wlit,.06),brush:'flat',size:R(5,8),load:1.35,thin:.2,taper:[.1,.5],clean:true});
for(const c of [[1240,826],[1275,826],[1705,815],[1012,803]])for(let k=0;k<2;k++)p.dab({x:c[0]+R(-12,12),y:c[1]+R(-3,2),color:M(Wlit,.06),size:R(6,10),brush:'filbert',load:1.4,pressure:.9});
for(const q of [[1410,806],[1300,815]])p.dab({x:q[0],y:q[1],color:M([['titanium_white',4]],.05),size:R(3,4.5),brush:'filbert',load:1.4,pressure:.9});
