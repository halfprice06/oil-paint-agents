const H=p.h, S=H.S;
const flat=y=>[[0,y],[1000,y]];
const W=(a,b)=>[['titanium_white',a],...b];
const skyCol=(t)=>{
  if(t<0.25) return [['titanium_white',2.2+p.rand(0,.5)],['paynes_grey',1.2],['burnt_umber',.15],['alizarin_crimson',.04]];
  if(t<0.5) return [['titanium_white',4+p.rand(0,1)],['paynes_grey',1],['burnt_umber',.12],['alizarin_crimson',.05]];
  if(t<0.78) return [['titanium_white',6],['paynes_grey',.55],['naples_yellow',.7],['alizarin_crimson',.05]];
  return [['titanium_white',7],['naples_yellow',1.3],['cadmium_orange',.06],['paynes_grey',.15]];
};
H.fill(flat(-30),flat(262),-40,1040,6,t=>skyCol(t),100,{wob:6,load:1,thin:.5,minLen:300,maxLen:700,brush:'flat'});
// blend base vertically a little
for(let i=0;i<8;i++){const x=i*130+p.rand(-30,30);S({points:[[x,-10,.7],[x+p.rand(-30,30),130,.8],[x+p.rand(-30,30),262,.6]],brush:'flat',size:120,load:0,color:'titanium_white'});}
// cloud masses as broad sweeps with ragged lower edge
const dkc=()=>[['titanium_white',2+p.rand(0,.8)],['paynes_grey',1.3],['burnt_umber',.2],['alizarin_crimson',.05]];
const mdc=()=>[['titanium_white',3.5+p.rand(0,1)],['paynes_grey',1],['burnt_umber',.15],['naples_yellow',.2]];
const ltc=()=>[['titanium_white',6],['naples_yellow',.9+p.rand(0,.5)],['paynes_grey',.15],['cadmium_orange',.04]];
const tilt=-0.09;
function bank(yTop,yBot,xa,xb,rows,colf,size,o={}){
  for(let r=0;r<rows;r++){
    const t=r/(rows-1||1); const y=H.lerp(yTop,yBot,t);
    let x=xa+p.rand(-60,0);
    while(x<xb){
      const len=p.rand(o.l0||140,o.l1||340);
      const yy=y+p.rand(-10,10)+(x-xa)*tilt*(o.tl||1);
      S({points:[[x,yy,.6],[x+len*.5,yy+p.rand(-8,8)+len*.5*tilt,.85],[x+len,yy+len*tilt+p.rand(-6,6),.55]],color:colf(t),size:size*p.rand(.8,1.2),brush:p.random()<.6?'flat':'filbert',load:.95,thin:.3});
      x+=len*p.rand(.6,.9);
    }
  }
}
bank(15,100,xa=-20,1020,5,t=>dkc(),70,{tl:.6});          // heavy dark mass
bank(90,150,-20,560,4,t=>t<.5?dkc():mdc(),55,{tl:.5});     // sagging lower edge left
bank(115,175,420,1020,4,t=>mdc(),50,{tl:.5});
// luminous break
for(let i=0;i<10;i++){const x=p.rand(520,950),y=p.rand(208,244);
  S({points:[[x-60,y+p.rand(-4,4),.6],[x,y+p.rand(-5,5),.8],[x+p.rand(60,130),y+p.rand(-5,5),.6]],color:[['titanium_white',7],['naples_yellow',2],['cadmium_orange',.1]],size:p.rand(16,28),load:1.1,thin:.2});}
// horizon strata
for(let i=0;i<4;i++){const y=238+i*7;S({points:[[-20,y,.7],[300,y-3+p.rand(-3,3),.8],[620,y+3,.8],[1020,y,.7]],color:[['titanium_white',4],['paynes_grey',.6],['alizarin_crimson',.1],['naples_yellow',.3]],size:16,load:.8,thin:.3});}
// blend: diagonal drags along the cloud tilt, plus soft vertical pulls
for(let i=0;i<40;i++){const x=p.rand(-60,900),y=p.rand(0,250),L=p.rand(160,380);
  S({points:[[x,y,.7],[x+L/2,y+tilt*L/2+p.rand(-14,14),.8],[x+L,y+tilt*L+p.rand(-10,10),.5]],brush:'filbert',size:p.rand(36,70),load:0,color:'titanium_white'});}
for(let i=0;i<14;i++){const x=p.rand(0,1000),y=p.rand(20,200);
  S({points:[[x,y,.7],[x+p.rand(-20,20),y+40,.8],[x+p.rand(-30,30),y+90,.5]],brush:'filbert',size:p.rand(40,70),load:0,color:'titanium_white'});}
