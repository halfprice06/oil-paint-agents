const H=p.h,S=H.S;
p.dry();
const crest=H.crest;
const fw=()=>[['titanium_white',6+p.rand(0,1)],['naples_yellow',.25],['burnt_umber',.03]];
// deepen the base of the face, thin glazes (curved, following the swell)
for(let i=0;i<5;i++){const x=p.rand(500,960),y=H.at(crest,x)+p.rand(70,100);
  S({points:[[x,y,.3],[x+p.rand(80,150),y+p.rand(-6,0),.7],[x+p.rand(160,240),y+p.rand(-6,4),.3]],color:[['paynes_grey',1.5],['viridian',.35],['burnt_umber',.3]],size:p.rand(22,36),brush:'filbert',load:.7,opacity:.25,thin:.5});}
// sheen on the shoulder: warm sky mirrored, broken
for(let i=0;i<5;i++){const x=p.rand(540,930),y=H.at(crest,x)+p.rand(24,50);
  S({points:[[x,y,.2],[x+p.rand(30,60),y+p.rand(-2,2),.6],[x+p.rand(60,110),y+p.rand(0,4),.2]],color:[['titanium_white',3],['naples_yellow',.8],['paynes_grey',.5]],size:p.rand(4,7),brush:'filbert',load:.6,opacity:.5,thin:.3});}
// fine spray flicks off the lip
for(let i=0;i<40;i++){const u=(p.random()+p.random()+p.random())/3*2-1,v=(p.random()+p.random()+p.random())/3*2-1;
  const x=300+u*130,y=300+v*34;const a=p.rand(-1.4,.2),L=p.rand(3,8);
  S({points:[[x,y,.2],[x+Math.cos(a)*L/2,y+Math.sin(a)*L/2,.6],[x+Math.cos(a)*L,y+Math.sin(a)*L,.15]],color:fw(),size:p.rand(2,4),brush:'round',load:p.rand(.3,.6),opacity:p.rand(.5,.9),thin:.3});}
// soft vignette in the foreground
for(let i=0;i<12;i++){const x=p.rand(-100,800),y=p.rand(660,712);
  S({points:[[x,y,.2],[x+p.rand(150,260),y+p.rand(-10,10),.9],[x+p.rand(300,480),y+p.rand(-10,10),.2]],color:[['paynes_grey',1],['burnt_umber',1],['titanium_white',.4]],size:p.rand(50,80),brush:'filbert',load:.8,opacity:.1,thin:.6});}
