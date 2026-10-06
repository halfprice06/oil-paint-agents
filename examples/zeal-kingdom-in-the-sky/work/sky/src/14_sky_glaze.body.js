// 14_sky_glaze: the sky dries; a thin warm veil toward the horizon on the right (away from Enhasa and the glow),
// and a handful of fresh visible strokes so the finished sky is still paint. (Dark glazes and scumbles were tried
// here and read as blotches on the dried sky, so they were dropped.)
p.dry();p.wipe();
const W=p.width;
for(let i=0;i<22;i++){const y=R(660,990),x=R(760,W);const t=(y-660)/330;if(x>1960&&y>780)continue;
 p.stroke({points:seg(x,y,R(360,640),R(-.03,.03),R(-.02,.02)*400,4),color:M([['titanium_white',2.6],['naples_yellow',.8],['quinacridone_rose',.08],['cadmium_orange',.05]],.14),brush:'flat',size:R(80,110),load:.85,thin:.6,opacity:R(.09,.16)*(.4+t*.6),edge:.75,taper:[.35,.35],stir:.85});}
for(let i=0;i<0;i++){const x=R(800,2400),y=R(60,200);p.stroke({points:seg(x,y,R(220,380),R(-.12,.12),R(-.04,.04)*300,4),color:M([['ultramarine',.9],['cobalt_blue',.4],['cobalt_violet',.2],['titanium_white',2.5]],.18),brush:'flat',size:R(30,50),load:R(.9,1.05),thin:.5,edge:.5,taper:[.35,.35],stir:.5});}
for(let i=0;i<10;i++){const x=R(760,2400),y=R(700,930);if(x>1900&&y>760)continue;p.stroke({points:seg(x,y,R(220,400),R(-.05,.05),R(-.03,.03)*300,4),color:M([['naples_yellow',.9],['titanium_white',3.1],['cadmium_orange',.08],['cobalt_violet',.06]],.18),brush:'flat',size:R(28,48),load:R(.95,1.15),thin:.4,edge:.45,taper:[.35,.35],stir:.5,clean:true});}
