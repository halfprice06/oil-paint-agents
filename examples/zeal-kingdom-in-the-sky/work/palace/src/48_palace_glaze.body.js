// 48: unify: faint cool glaze on the shadow sides, warm reflected veil low down, lose the right contours into the sky
p.wipe();
const COOL=()=>M([['ultramarine',.6],['cobalt_violet',.5],['dioxazine_purple',.05]],.2);
const WARM=()=>M([['naples_yellow',1],['yellow_ochre',.3],['titanium_white',.5]],.2);
const SKY=()=>M([['titanium_white',2.4],['cobalt_blue',.45],['cobalt_violet',.35],['naples_yellow',.25]],.2);
const SKYH=()=>M([['titanium_white',2.6],['naples_yellow',.5],['cobalt_violet',.25],['cobalt_blue',.2]],.2);
function vglaze(x0,x1,y0,y1,n,col,op,sz){for(let i=0;i<n;i++){const x=R(x0,x1);S(x,R(y0,y1),R(40,90),Math.PI/2+R(-.1,.1),col(),sz*R(.8,1.2),{load:.8,thin:.6,opacity:op,edge:.65,taper:[.25,.35]});}}
vglaze(1605,1676,640,760,14,COOL,.12,24);
vglaze(1560,1606,530,600,6,COOL,.11,16);
vglaze(1260,1283,572,760,7,COOL,.11,13);
vglaze(1800,1823,612,768,7,COOL,.11,13);
vglaze(1990,2048,696,756,6,COOL,.1,12);
// reflected warmth low on the shadow sides
for(let i=0;i<10;i++){S(R(1600,1672),R(725,758),R(30,60),R(-.1,.1),WARM(),R(10,14),{load:.8,thin:.5,opacity:.16,edge:.5,taper:[.2,.3]});}
for(let i=0;i<4;i++){S(R(1800,1822),R(730,765),R(18,30),Math.PI/2,WARM(),R(8,10),{load:.8,thin:.5,opacity:.15,edge:.5,taper:[.2,.3]});}
for(let i=0;i<3;i++){S(R(1258,1282),R(725,760),R(18,30),Math.PI/2,WARM(),R(8,10),{load:.8,thin:.5,opacity:.15,edge:.5,taper:[.2,.3]});}
for(let i=0;i<4;i++){S(R(1560,1600),R(470,500),R(14,24),Math.PI/2+R(-.3,.3),WARM(),R(6,9),{load:.8,thin:.5,opacity:.14,edge:.5,taper:[.2,.3]});}
// lose the right contours into the sky
for(let i=0;i<7;i++){S(1826+R(-3,5),R(620,760),R(30,60),Math.PI/2+R(-.1,.1),SKYH(),R(7,10),{load:.55,thin:.4,scumble:true,opacity:.5,edge:.5,taper:[.2,.3]});}
for(let i=0;i<4;i++){S(1682+R(-3,4),R(650,720),R(24,44),Math.PI/2+R(-.1,.1),SKYH(),R(6,9),{load:.55,thin:.4,scumble:true,opacity:.45,edge:.5,taper:[.2,.3]});}
for(let i=0;i<5;i++){S(2050+R(-3,4),R(696,756),R(20,36),Math.PI/2+R(-.1,.1),SKYH(),R(6,9),{load:.55,thin:.4,scumble:true,opacity:.5,edge:.5,taper:[.2,.3]});}
const TAB=[[240,0],[262,5],[290,11],[320,18],[355,28],[400,55],[435,78],[462,99],[484,114],[500,120]];
const W=y=>{if(y<=240)return 0;for(let i=0;i<TAB.length-1;i++){if(y<=TAB[i+1][0]){const t=(y-TAB[i][0])/(TAB[i+1][0]-TAB[i][0]);return lerp(TAB[i][1],TAB[i+1][1],t*t*(3-2*t)*.5+t*.5);}}return 120;};
for(let i=0;i<6;i++){const y=R(340,480);const pts=[];for(let k=0;k<3;k++){const yy=y+k*14;pts.push([1490+W(yy)+R(-2,3),yy]);}L(pts,SKY(),R(5,8),{load:.5,thin:.4,scumble:true,opacity:.4,edge:.5,taper:[.2,.3]});}
