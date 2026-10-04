const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.85,1.15)]);
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1.0,thin:.5},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function arc(x,y,len,ang,bend){const n=5,pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*bend*(t*t-.1),y+Math.sin(ang)*len*t+Math.cos(ang)*bend*(t*t-.1)]);}return pts;}
// SKY
function skyCol(y){const t=Math.max(0,Math.min(1,y/335));
 return M([['titanium_white',2.6+t*2.4],['cobalt_blue',(1-t)*.7+.04],['ultramarine',(1-t)*.15],['cerulean',(1-t)*.25],['cobalt_violet',.05+t*(1-t)*.5],['naples_yellow',t*t*1.2],['cadmium_orange',t*t*t*.1],['quinacridone_rose',t*t*.08]]);}
for(let row=0;row<8;row++){const y=row*46-10;for(let i=0;i<4;i++){const x=-120+i*300+R(-70,70);
  F(arc(x,y+R(-10,10),R(300,480),R(-.4,.15),R(-8,8)),skyCol(y+R(-25,25)),R(60,110)*(row<4?1.1:.9),{thin:.6,load:.95});}}
for(let i=0;i<22;i++){const x=R(-40,1040),y=R(0,330);BL(arc(x,y,R(180,320),R(-.35,.12),0),R(60,90));}
const cl=l=>l>.3?M([['titanium_white',4],['naples_yellow',.45],['cadmium_yellow',.03],['quinacridone_rose',.03]]):
 l>-.1?M([['titanium_white',3.6],['naples_yellow',.15],['cobalt_violet',.1],['cerulean',.1]]):
 M([['titanium_white',2.9],['cobalt_violet',.3],['ultramarine',.1],['quinacridone_rose',.12],['burnt_sienna',.04]]);
function cloud(cx,cy,w,h){const n=Math.floor(w*h/700);
 for(let k=0;k<n;k++){const x=cx+R(-w/2,w/2),y=cy+R(-h/2,h/2)*(1-.35*Math.abs(x-cx)/(w/2));
  const l=-(y-cy)/h*1.3+(x-cx)/w*.5+R(-.25,.25)+.1;const a=R(-.4,.2);
  F(arc(x,y,R(90,200),a,R(-8,8)),cl(l),R(22,46),{load:.9,thin:.65});}}
cloud(790,115,420,100);cloud(650,190,260,46);cloud(210,150,320,80);cloud(390,206,170,30);cloud(930,205,160,34);
for(let i=0;i<20;i++){const x=R(540,990),y=R(70,200);BL(arc(x,y,R(80,140),R(-.4,.2),0),R(20,30));}
for(let i=0;i<12;i++){const x=R(50,400),y=R(110,210);BL(arc(x,y,R(70,120),R(-.35,.2),0),R(18,26));}
for(const [x,y] of [[40,70],[0,20],[990,30],[960,240],[30,140]])F(arc(x,y,R(160,260),R(-.3,.1),R(-6,6)),skyCol(y),R(50,70),{thin:.6,load:.95});
// golden haze, long soft horizontal drags, then blend
for(let i=0;i<24;i++){const x=R(-60,1000),y=R(262,330);F(arc(x,y,R(160,300),R(-.06,.06),0),M([['naples_yellow',1.3],['titanium_white',2.4],['cadmium_orange',.06],['quinacridone_rose',.08]]),R(22,36),{load:.8,thin:.7});}
for(let i=0;i<14;i++){const x=R(-60,1000),y=R(250,330);BL(arc(x,y,R(200,320),R(-.04,.04),0),R(30,40));}
// far ridge
const rg=()=>M([['titanium_white',2.4],['cerulean',.4],['cobalt_violet',.3],['viridian',.1],['burnt_umber',.06]]);
for(let x=-30;x<1040;x+=R(90,140)){const y=334+Math.sin(x/160)*-6;F([[x,y+R(-3,3)],[x+90,y+R(-4,2)],[x+190,y+R(-3,3)]],rg(),R(18,26),{load:.9,thin:.55});}
// castle: soft irregular blue-violet silhouette, close in value to the ridge, warm touches on the sunward (right) side
const cv=()=>M([['titanium_white',1.7],['cobalt_violet',.5],['cerulean',.2],['ultramarine',.2],['burnt_umber',.05]]);
const cw=()=>M([['titanium_white',2.2],['naples_yellow',.5],['quinacridone_rose',.25],['cadmium_orange',.04]]);
F([[236,334],[238,300],[242,282]],cv(),16,{load:.9,thin:.65});
F([[262,334],[262,292],[266,274]],cv(),12,{load:.9,thin:.65});
F([[290,334],[292,280],[296,258],[300,244]],cv(),18,{load:.9,thin:.65});
F([[318,334],[320,284],[324,262]],cv(),14,{load:.9,thin:.65});
F([[342,334],[344,296],[348,284]],cv(),14,{load:.9,thin:.65});
F([[234,330],[290,322],[356,330]],cv(),14,{load:.9,thin:.65});
F([[296,252],[300,238],[303,230]],cv(),7,{load:.9,thin:.6});  // keep spire
F([[240,290],[243,278]],cv(),6,{load:.9,thin:.6});
F([[346,292],[349,282]],cv(),6,{load:.9,thin:.6});
for(const [x,y0,y1] of [[246,300,328],[270,288,326],[304,266,326],[328,282,326],[350,298,328]])F([[x,y0],[x+1,y1]],cw(),4,{load:.9,thin:.6});
[[430,262,'cadmium_red',6],[449,249,'cadmium_yellow',5],[423,240,'cerulean',5],[466,271,'quinacridone_rose',4]].forEach(([x,y,c,sz])=>p.dab({x:x+R(-2,2),y:y+R(-2,2),color:[[c,1],['titanium_white',.8]],size:sz,brush:'round',load:1}));
BL([[226,334],[380,336]],12);
