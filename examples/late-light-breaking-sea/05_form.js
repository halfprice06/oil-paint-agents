const H=p.h,S=H.S;
const crest=H.crest, base=H.base;
const dkG=()=>[['paynes_grey',1.4],['viridian',.35],['burnt_umber',.35],['titanium_white',.1+p.rand(0,.3)]];
const midG=()=>[['paynes_grey',1],['viridian',.35],['titanium_white',.8+p.rand(0,.3)],['burnt_umber',.15]];
const teal=()=>[['titanium_white',2.2+p.rand(0,.5)],['viridian',.18],['cerulean',.18],['paynes_grey',.3],['naples_yellow',.3]];
const clear=()=>[['titanium_white',1.4],['viridian',.3],['cerulean',.3],['paynes_grey',.3]];
// left gap
H.fill([[-20,455],[110,472]],[[-20,550],[110,545]],-30,130,4,t=>[['paynes_grey',1.2],['burnt_umber',.4],['viridian',.25],['titanium_white',.7+t*.4]],34,{wob:3,minLen:80,maxLen:150,load:.95,thin:.4});
// ---- the face as one big plane: dark and green at the base of the curl, lighter teal toward the lip
const faceTop=crest.map(a=>[a[0],a[1]+14]);
H.fill(faceTop,base,100,1010,5,t=>t<.28?teal():(t<.6?midG():dkG()),46,{wob:3,minLen:200,maxLen:420,load:1,thin:.4});
// darker, greener under the curl (left-centre): the hollow
for(let i=0;i<9;i++){const x=p.rand(215,400),y=H.at(crest,x)+p.rand(40,95);
  S({points:[[x-50,y+14,.4],[x,y+p.rand(-5,5),.85],[x+p.rand(60,110),y+p.rand(-14,-2),.5]],color:dkG(),size:p.rand(24,40),brush:'filbert',load:1,thin:.4});}
// lighter translucent teal near the lip, following the swell upward to the right
for(let i=0;i<9;i++){const x=p.rand(380,950),y=H.at(crest,x)+p.rand(10,30);
  S({points:[[x,y,.3],[x+p.rand(70,130),y+p.rand(-5,-1)+(H.at(crest,x+100)-H.at(crest,x))*.5,.8],[x+p.rand(140,230),y+(H.at(crest,x+190)-H.at(crest,x)),.3]],color:teal(),size:p.rand(14,24),brush:'filbert',load:.95,thin:.35});}
// curved strokes following the face: ribs sweeping down-left from the crest, bowing with the form
for(let i=0;i<10;i++){const x=p.rand(230,900);const y=H.at(crest,x)+p.rand(24,60);const L=p.rand(80,170);const bow=p.rand(10,26);
  const dark=x<500;
  S({points:[[x,y,.3],[x-L*.45,y+L*.22+bow*.4,.8],[x-L,y+L*.5+bow,.3]],color:dark?dkG():midG(),size:p.rand(14,26),brush:'filbert',load:.9,thin:.4});}
// ---- lip: translucent green light through the curl (highest, most transparent), left-centre
const lip=[[398,334],[350,327],[298,337],[255,362],[230,397],[218,430]];
S({points:lip.map(a=>[a[0],a[1]+8,.7]),color:clear(),size:26,brush:'filbert',load:1,thin:.3});
S({points:lip.map(a=>[a[0]+6,a[1]+22,.6]),color:teal(),size:22,brush:'filbert',load:1,thin:.3});
S({points:lip.slice(1,5).map(a=>[a[0]+14,a[1]+40,.6]),color:[['paynes_grey',2],['viridian',.4],['burnt_umber',.3]],size:30,brush:'filbert',load:1,thin:.4});
// blend the face along its curves and gently down
H.blend(faceTop,base,100,1010,5,26,{minLen:140,maxLen:300});
for(let i=0;i<8;i++){const x=p.rand(240,900);const y=H.at(crest,x)+p.rand(30,60);
  S({points:[[x,y,.6],[x-p.rand(10,40),y+40,.7],[x-p.rand(10,50),y+90,.4]],brush:'filbert',size:p.rand(22,34),load:0,color:'titanium_white'});}
