const H=p.h,S=H.S;
p.dry();
const top=[[0,556],[250,548],[600,550],[1000,538]];
const bot=[[0,720],[1000,720]];
// wet sand: reflective and pale near the water, darker damp toward the viewer
const sandC=(t,x)=>{const lx=x/1000; return [['titanium_white',3.4+lx*1.4-t*2.4+p.rand(0,.3)],['paynes_grey',.4+(1-lx)*.25+t*.5],['burnt_umber',.3+t*.5],['naples_yellow',.3+lx*.25-t*.15],['alizarin_crimson',.03]];};
H.fill(top,bot,-60,1060,8,sandC,60,{wob:5,minLen:260,maxLen:560,load:1,thin:.5,brush:'filbert'});
// reflections: broad overlapping vertical drags of light colour under the foam and the gap
for(let i=0;i<30;i++){const x=p.rand(100,920),y=p.rand(550,580);const warm=x>560;
  S({points:[[x,y,.3],[x+p.rand(-10,10),y+p.rand(30,60),.8],[x+p.rand(-14,14),y+p.rand(70,130),.15]],color:warm?[['titanium_white',3.4],['naples_yellow',.55],['burnt_umber',.3],['paynes_grey',.1]]:[['titanium_white',3],['paynes_grey',.35],['burnt_umber',.3],['naples_yellow',.15]],size:p.rand(34,70),brush:'filbert',load:.7,thin:.55});}
// darker damp band toward the viewer, uneven
for(let i=0;i<8;i++){const x=p.rand(-60,700),y=p.rand(640,704);
  S({points:[[x,y,.3],[x+p.rand(180,300),y+p.rand(-10,8),.8],[x+p.rand(360,520),y+p.rand(-10,8),.2]],color:[['paynes_grey',1],['burnt_umber',.9],['titanium_white',.5+p.rand(0,.5)]],size:p.rand(34,56),brush:'filbert',load:.85,thin:.5});}
// blend: horizontal drags along the beach, then vertical pulls through the reflections
H.blend(top,bot,-40,1040,8,48,{minLen:200,maxLen:480,wob:4});
for(let i=0;i<26;i++){const x=p.rand(100,920),y=p.rand(556,590);
  S({points:[[x,y,.6],[x+p.rand(-8,8),y+50,.7],[x+p.rand(-10,10),y+110,.3]],brush:'filbert',size:p.rand(30,50),load:0,color:'titanium_white'});}
// foam film edge: scratchy low-load drags along a wavy line with irregular gaps, then softened
const lineY=x=>598+Math.sin(x/60)*9+Math.sin(x/23)*3;
for(let x=90;x<990;){const L=p.rand(50,140);const gap=p.random()<.5?p.rand(10,50):p.rand(-10,5);
  const pts=[];for(let k=0;k<=4;k++){const xx=x+L*k/4;pts.push([xx,lineY(xx)+p.rand(-3,3),.3+.5*Math.sin(k/4*Math.PI)]);}
  S({points:pts,color:[['titanium_white',3.6],['naples_yellow',.35],['burnt_umber',.2],['paynes_grey',.1]],size:p.rand(7,11),brush:'filbert',load:p.rand(.3,.45),thin:.25});
  if(p.random()<.5){const q=pts.map(a=>[a[0]+8,a[1]+p.rand(5,10),a[2]*.8]);S({points:q,color:[['titanium_white',3],['burnt_umber',.3],['naples_yellow',.3]],size:p.rand(5,8),brush:'filbert',load:.3,thin:.3});}
  x+=L+gap;}
for(let x=100;x<980;x+=p.rand(100,200)){const pts=[];for(let k=0;k<=3;k++){const xx=x+k*40;pts.push([xx,lineY(xx)+3,.6]);}
  S({points:pts,brush:'filbert',size:10,load:0,color:'titanium_white'});}
