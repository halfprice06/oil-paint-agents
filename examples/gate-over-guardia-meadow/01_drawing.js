const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.85,1.15)]);
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1.0,thin:.5},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function arc(x,y,len,ang,bend){const n=5,pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*bend*(t*t-.1),y+Math.sin(ang)*len*t+Math.cos(ang)*bend*(t*t-.1)]);}return pts;}
// thin loose drawing in warm earth + violet
const D=()=>M([['burnt_sienna',1],['ultramarine',.5],['titanium_white',.6]]);
const dl=(pts,s=6)=>p.stroke({points:pts,color:D(),brush:'round',size:s,load:.5,thin:.85});
dl([[0,338],[200,322],[420,332],[700,320],[1000,334]],7);          // horizon ridge
dl([[0,520],[250,480],[500,470],[800,485],[1000,505]],7);          // near slope
dl([[240,326],[240,276],[252,264],[264,276],[264,326]],4);         // castle
dl([[290,326],[290,254],[304,240],[318,254],[318,326]],4);
dl([[330,326],[330,284],[342,274],[354,284],[354,326]],4);
for(let i=0;i<2;i++)dl(arc(610,400,130,0,i?20:-20).map(([x,y])=>[x+R(-3,3),y+R(-3,3)]),5); // portal ring
for(let a=0;a<6.3;a+=1.2)dl([[610+Math.cos(a)*58,400+Math.sin(a)*58],[610+Math.cos(a+1)*58,400+Math.sin(a+1)*58]],5);
dl([[160,745],[168,640],[190,590],[225,590],[250,640],[268,745]],6); // figure
dl([[178,540],[190,512],[215,510],[230,535]],5);
dl([[760,120],[880,90],[1000,140]],8); dl([[70,170],[220,120],[340,160]],8); // clouds
