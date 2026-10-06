// 15_surface: on the dried sky, a dry-brush scumble of pale warm paint over the lower sky at right (air and light on the
// rough paint), sparse and broken, and a few thick clean touches in the glow heart.
p.wipe();
const W=p.width;
for(let i=0;i<50;i++){const x=R(1150,W+40),y=R(560,990);const t=(y-560)/430;const near=Math.abs(x-1490)<300&&y<700;if(near&&R(0,1)<.7)continue;if(x>1940&&y>770)continue;
 const w=R(0,1);const col=w<.5?[['titanium_white',3],['naples_yellow',R(.5,.9)],['cadmium_orange',R(.03,.08)]]:w<.8?[['titanium_white',3.2],['naples_yellow',.35],['quinacridone_rose',R(.06,.12)]]:[['titanium_white',3],['cobalt_violet',R(.12,.22)],['naples_yellow',.2]];
 p.stroke({points:seg(x,y,R(160,380),R(-.1,.1)+(R(0,1)<.25?R(-.35,.35):0),R(-.05,.05)*200,4),color:M(col,.12),brush:R(0,1)<.6?'flat':'filbert',size:R(34,70),load:R(.3,.55),thin:.3,scumble:true,edge:R(.3,.6),taper:[.3,.4],stir:R(.5,.8),opacity:R(.3,.5)*(.6+t*.4),clean:i%7==0});}
// (thick touches on the dried glow were tried here and read as pale discs; the glow's thick paint lives in pass 11, wet)
