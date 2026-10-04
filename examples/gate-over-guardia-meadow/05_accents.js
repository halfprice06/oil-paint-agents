const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.85,1.15)]);
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1.0,thin:.5},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function arc(x,y,len,ang,bend){const n=5,pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*bend*(t*t-.1),y+Math.sin(ang)*len*t+Math.cos(ang)*bend*(t*t-.1)]);}return pts;}
// thin loose drawing in warm earth + violet
// ---- FOREGROUND: sunlit-to-shadow meadow, directional strokes, vertical flicks, wildflowers
const PX=610,PY=398;
const lit=()=>M([['cadmium_yellow',.4],['cadmium_lemon',.15],['sap_green',.5],['titanium_white',.9],['yellow_ochre',.08]]);
const mid=()=>M([['sap_green',.8],['cadmium_yellow',.2],['ultramarine',.12],['titanium_white',.5]]);
const shd=()=>M([['ultramarine',.35],['cobalt_violet',.3],['sap_green',.55],['viridian',.1],['titanium_white',.55]]);
// broad masses: lit swathe from centre to right, shadow tongues lower-left and lower-right, at varied angles
for(let i=0;i<22;i++){const x=R(300,1040),y=R(540,720);F(arc(x,y,R(150,260),R(-.35,.05),R(-8,8)),lit(),R(26,42),{load:.9,thin:.65});}
for(let i=0;i<12;i++){const x=R(-40,500),y=R(560,750);F(arc(x,y,R(130,230),R(-.5,-.05),R(-8,8)),R(0,1)<.5?mid():shd(),R(26,40),{load:.85,thin:.65});}
for(let i=0;i<9;i++){const x=R(520,1040),y=R(690,760);F(arc(x,y,R(150,240),R(-.45,-.1),R(-8,8)),shd(),R(26,38),{load:.8,thin:.7});}
// soften a little
for(let i=0;i<6;i++){const x=R(100,800),y=R(560,740);BL(arc(x+60,y,R(120,180),R(-.3,.05),0),R(24,34));}
