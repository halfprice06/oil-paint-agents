const H=p.h,S=H.S;
p.dry();
function scum(cx,cy,rx,ry,n,colf,size,ang,o={}){
  for(let i=0;i<n;i++){
    const u=p.rand(-1,1); const top=cy-ry*Math.pow(Math.max(0,1-u*u),.6);
    const y=H.lerp(cy,top,Math.pow(p.random(),o.pow||1.0)); const x=cx+u*rx+(o.lean||0)*(cy-y);
    const lit=(cy-y)/ry+(u*.3);
    const a=ang+p.rand(-.28,.28); const L=p.rand(o.l0||140,o.l1||360);
    const c=Math.cos(a),s=Math.sin(a);
    S({points:[[x-c*L/2,y-s*L/2+p.rand(-6,6),.3],[x+p.rand(-10,10),y+p.rand(-8,8),.75],[x+c*L/2,y+s*L/2+p.rand(-6,6),.3]],color:colf(lit),size:size*p.rand(.6,1.4),brush:'filbert',load:o.load||.5,opacity:o.op||.75,thin:.2});
  }
}
const LT=lit=>lit>.55?[['titanium_white',6],['naples_yellow',1.1],['paynes_grey',.08]]:(lit>.25?[['titanium_white',5],['naples_yellow',.5],['paynes_grey',.35]]:[['titanium_white',3],['paynes_grey',.8],['burnt_umber',.1],['alizarin_crimson',.06]]);
const MD=lit=>lit>.4?[['titanium_white',4],['paynes_grey',.55],['naples_yellow',.3]]:[['titanium_white',2.6],['paynes_grey',.9],['burnt_umber',.1],['alizarin_crimson',.05]];
const DK=()=>[['titanium_white',2.2],['paynes_grey',1],['alizarin_crimson',.08],['burnt_umber',.12]];
// warm glow low in the sky first, broad, then softened
for(let i=0;i<6;i++){const y=p.rand(222,250);
  S({points:[[480+p.rand(-40,40),y,.4],[760,y+p.rand(-3,3),.8],[1010,y+p.rand(-3,3),.4]],color:[['titanium_white',5],['naples_yellow',1.5],['cadmium_orange',.1]],size:p.rand(18,30),brush:'filbert',load:1,opacity:.7,thin:.35});}
// underbellies of the banks (dark, wide, various angles), melted downward afterwards
function belly(cx,cy,rx,n,ang){for(let i=0;i<n;i++){const x=cx+p.rand(-rx,rx),y=cy+p.rand(-6,10);const L=p.rand(120,300);const a=ang+p.rand(-.15,.15);
  S({points:[[x-L/2,y-Math.sin(a)*L/2,.3],[x,y,.7],[x+L/2,y+Math.sin(a)*L/2,.3]],color:DK(),size:p.rand(24,46),brush:'filbert',load:.6,opacity:.6,thin:.3});}}
belly(800,222,240,9,-.04); belly(560,198,120,4,-.1); belly(560,222,80,3,0);
// masses of different size and angle
scum(820,210,240,78,50,l=>LT(l+.35),80,-.05,{lean:.5,load:.6,op:.85});
scum(995,125,70,26,10,LT,60,.1,{load:.5});
scum(600,190,130,40,14,MD,60,-.12,{load:.45,op:.6});
scum(560,218,90,26,12,MD,50,.04,{load:.5});
scum(780,64,200,34,12,MD,65,.1,{load:.4,op:.5});
scum(280,40,170,26,10,MD,65,-.1,{load:.4,op:.5});

// melt the bases into the sky: blender drags down and slightly diagonal, then along
for(let i=0;i<20;i++){const x=p.rand(380,1000),y=p.rand(196,222);
  S({points:[[x,y,.6],[x+p.rand(-14,24),y+24,.7],[x+p.rand(-20,40),y+p.rand(48,74),.3]],brush:'filbert',size:p.rand(30,52),load:0,color:'titanium_white'});}
for(let i=0;i<8;i++){const y=p.rand(222,250);
  S({points:[[470,y,.6],[760,y+p.rand(-2,2),.7],[1010,y+p.rand(-2,2),.4]],brush:'filbert',size:p.rand(18,28),load:0,color:'titanium_white'});}
