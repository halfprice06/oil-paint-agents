const H=p.h, S=H.S;
// ---------- HEADLAND underpaint: dark cool mass ----------
const ridge=[[0,200],[70,180],[150,166],[240,170],[300,194],[350,226],[392,254]];
H.fill(ridge.map(a=>[a[0],a[1]+2]),[[0,310],[392,290]],-20,396,6,t=>[['paynes_grey',1],['burnt_umber',1.1],['titanium_white',.25+t*.3+p.rand(0,.3)],['viridian',.1]],42,{wob:5,minLen:90,maxLen:220,load:.95,thin:.4});
// ---------- SEA beyond: strokes shrink and crowd toward the horizon ----------
const N=11;
for(let j=0;j<N;j++){const t=j/(N-1); const y=258+(76)*Math.pow(t,1.5); const size=7+30*Math.pow(t,1.2);
  let x=-30; const L0=60+160*t, L1=140+280*t;
  while(x<1020){const L=p.rand(L0,L1);const yy=y+p.rand(-2,2)*(1+t*2);
    if(x>380||t>.5) S({points:[[x,yy,.4],[x+L/2,yy+p.rand(-2,2),.8],[x+L,yy+p.rand(-2,2),.4]],color:[['titanium_white',3.4-t*1.6+p.rand(0,.4)],['paynes_grey',1],['cerulean',.4],['naples_yellow',.12+(1-t)*.15]],size:size*p.rand(.85,1.2),brush:'flat',load:.95,thin:.45});
    x+=L*p.rand(.7,.95);}}
// shadowed water under the headland
H.fill([[0,282],[390,268],[1000,300]],[[0,405],[300,345],[400,300]],-20,385,6,t=>[['paynes_grey',1.2],['burnt_umber',.6],['viridian',.3],['titanium_white',.5+p.rand(0,.2)]],36,{wob:4,minLen:100,maxLen:220,load:.9,thin:.4});
// a few lighter streaks catching the light gap (right), long and soft
for(let i=0;i<9;i++){const y=p.rand(262,318),x=p.rand(560,860);const L=p.rand(80,180);const k=(y-258)/70;
  S({points:[[x,y,.2],[x+L/2,y+p.rand(-1,1),.7],[x+L,y+p.rand(-1,1),.2]],color:[['titanium_white',4],['naples_yellow',1.2],['paynes_grey',.2]],size:3+k*8,brush:'filbert',load:.6,thin:.3});}
// soften horizon except under the light gap; and the sea body
for(let i=0;i<5;i++){const y=p.rand(256,262);S({points:[[-20,y,.5],[200,y+1,.7],[570,y+p.rand(-1,1),.4]],brush:'filbert',size:10,load:0,color:'titanium_white'});}
// trough between far sea and wave
H.fill([[0,340],[300,345],[1000,352]],[[130,470],[330,340],[1000,412]],-20,1010,7,t=>[['paynes_grey',1],['viridian',.35],['burnt_umber',.25],['titanium_white',1.1-t*.5+p.rand(0,.3)]],36,{wob:3,minLen:140,maxLen:300,load:.95,thin:.4});
// ---------- WAVE body underpaint ----------
const crest=H.crest, base=H.base;
H.fill(crest.map(a=>[a[0],a[1]+20]),base,95,1010,8,t=>[['paynes_grey',1.2],['viridian',.5+t*.2],['burnt_umber',.3+t*.2],['titanium_white',.9-t*.6+p.rand(0,.3)]],40,{wob:3,minLen:100,maxLen:260,load:1,thin:.4});
// ---------- FOREGROUND sand ----------
const sand=t=>[['titanium_white',3.5-t*2.2+p.rand(0,.4)],['paynes_grey',.5+t*.5],['burnt_umber',.35+t*.2],['naples_yellow',.45-t*.2]];
H.fill([[0,560],[400,522],[1000,520]],[[0,720],[1000,720]],-20,1020,9,sand,50,{wob:4,minLen:140,maxLen:360,load:.95,thin:.4});
