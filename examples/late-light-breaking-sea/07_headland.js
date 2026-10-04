const H=p.h,S=H.S;
p.dry();
const ridge=[[0,200],[70,180],[150,166],[240,170],[300,194],[350,226],[392,254]];
const baseL=[[0,298],[200,300],[330,298],[370,286],[395,260]];
const dk=()=>[['paynes_grey',1.4],['burnt_umber',.55],['titanium_white',.12+p.rand(0,.2)],['viridian',.08]];
const md=()=>[['paynes_grey',1],['burnt_umber',.45],['titanium_white',.55+p.rand(0,.3)]];
const warm=()=>[['titanium_white',1.5+p.rand(0,.4)],['yellow_ochre',.12],['burnt_umber',.4],['paynes_grey',.55]];
const warm2=()=>[['titanium_white',2.2],['yellow_ochre',.15],['burnt_umber',.3],['naples_yellow',.1],['paynes_grey',.4]];
// cool dark mass first (opaque)
H.fill(ridge.map(a=>[a[0],a[1]-2]),baseL,-25,400,7,t=>dk(),32,{wob:4,minLen:80,maxLen:200,load:1,thin:.35,brush:'filbert'});
// cool dark faces: short steep strokes, with value shifts
for(let i=0;i<34;i++){const x=p.rand(-10,385);const yt=H.at(ridge,x)+22, yb=H.at(baseL,x);
  const y=H.lerp(yt,yb-8,p.random()); const L=p.rand(24,56); const a=1.35+p.rand(-.3,.3);
  S({points:[[x,y,.3],[x+Math.cos(a)*L/2,y+Math.sin(a)*L/2,.8],[x+Math.cos(a)*L,y+Math.sin(a)*L,.25]],color:p.random()<.6?dk():md(),size:p.rand(12,22),brush:'filbert',load:.95,thin:.3});}
// ledges: diagonal halftone strokes stepping down toward the sea
for(let i=0;i<9;i++){const x=p.rand(30,330);const y=H.at(ridge,x)+p.rand(40,80);const L=p.rand(40,80);const a=p.rand(.35,.7);
  S({points:[[x,y,.3],[x+Math.cos(a)*L/2,y+Math.sin(a)*L/2,.8],[x+Math.cos(a)*L,y+Math.sin(a)*L,.25]],color:md(),size:p.rand(10,18),brush:'filbert',load:.95,thin:.3});}
// lit tops, warm grey-ochre facing the gap: along the slope, concentrated to the right
for(let i=0;i<9;i++){const x=Math.min(335,p.rand(40,390)*0.35+p.rand(0,200)+40);const y=H.at(ridge,x)+p.rand(3,22);
  const sl=Math.atan((H.at(ridge,x+30)-H.at(ridge,x-30))/60)+p.rand(-.25,.25);const L=p.rand(55,110);
  const c=Math.cos(sl),s=Math.sin(sl);
  S({points:[[x,y+6,.3],[x+c*L/2,y+6+s*L/2,.85],[x+c*L,y+6+s*L,.25]],color:x>200?warm2():warm(),size:p.rand(14,22),brush:'filbert',load:.95,thin:.3});}
// blend planes softly (small), then the base is lost in spray
H.blend([[0,205],[200,185],[392,258]],[[0,296],[330,298],[392,270]],-20,392,5,14,{minLen:50,maxLen:110,wob:4});
for(let i=0;i<8;i++){const x=p.rand(0,330),y=p.rand(296,314);
  S({points:[[x,y,.4],[x+p.rand(60,120),y+p.rand(-4,3),.8],[x+p.rand(120,200),y+p.rand(-3,4),.4]],color:[['paynes_grey',1],['viridian',.3],['burnt_umber',.4],['titanium_white',.3+p.rand(0,.4)]],size:p.rand(14,24),brush:'filbert',load:.9,thin:.35});}
for(let i=0;i<14;i++){const x=p.rand(0,330),y=p.rand(284,306);
  S({points:[[x,y,.3],[x+p.rand(30,70),y+p.rand(-6,2),.7],[x+p.rand(70,110),y+p.rand(-6,4),.2]],color:[['titanium_white',4],['paynes_grey',.5],['naples_yellow',.15]],size:p.rand(10,20),brush:'filbert',load:.4,thin:.3});}
H.scum(352,288,26,10,8,()=>[['titanium_white',4],['paynes_grey',.4],['naples_yellow',.2]],7,16,-.5,{load:.4});
H.scum(120,298,90,6,16,()=>[['titanium_white',4],['paynes_grey',.5],['burnt_umber',.15]],8,14,-.05,{load:.35});
for(let i=0;i<3;i++){const x=p.rand(20,300),y=p.rand(286,304);
  S({points:[[x,y,.5],[x+p.rand(-10,20),y-p.rand(6,14),.7],[x+p.rand(-14,24),y-p.rand(16,26),.3]],brush:'filbert',size:p.rand(12,20),load:0,color:'titanium_white'});}

for(let i=0;i<4;i++){const y=p.rand(290,304);S({points:[[0,y,.5],[200,y+p.rand(-3,3),.7],[400,y+p.rand(-3,3),.4]],brush:'filbert',size:p.rand(10,16),load:0,color:'titanium_white'});}
