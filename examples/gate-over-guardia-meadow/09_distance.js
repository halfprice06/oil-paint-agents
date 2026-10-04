const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.8,1.2)]);
const cl01=v=>Math.max(0,Math.min(1,v));
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1,thin:.5},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function crv(x,y,len,ang,bend,n){n=n||5;const pts=[];const pk=R(.35,.65),e=Math.log(.5)/Math.log(pk);const ca=Math.cos(ang),sa=Math.sin(ang);
 for(let i=0;i<n;i++){const f=i/(n-1),t=f-.5;const off=bend*(1-4*t*t);const jx=R(-.6,.6),jy=R(-.6,.6)*Math.min(1,len/20);
  const pr=.22+.78*Math.pow(Math.sin(Math.PI*Math.pow(f,e)),.7);
  pts.push([x+ca*len*t-sa*off+jx,y+sa*len*t+ca*off+jy,pr]);}
 return pts;}
const St=(x,y,len,ang,bend,col,size,o)=>F(crv(x,y,len,ang,bend),col,size,o);
p.dry();
const yR=x=>334-Math.sin(x/130)*4-(x>650?6:0);
// far ridge: layered atmospheric strokes, flat, lighter and bluer into the distance
const rc=(k)=>M([['titanium_white',1.6+k*.8],['cerulean',.35],['cobalt_violet',.28],['viridian',.1*(1-k)+.05],['ultramarine',.05*(1-k)],['naples_yellow',.1*k]]);
for(let i=0;i<200;i++){const x=R(-20,1020),k=R(0,1);St(x,yR(x)+R(-3,6),R(20,80),R(-.08,.08),R(-1.5,1.5),rc(k),R(3,9),{load:R(.6,.95),thin:.65});}
for(let i=0;i<60;i++){const x=R(-20,1020);St(x,yR(x)+R(4,10),R(30,90),R(-.05,.05),R(-1,1),M([['viridian',.25],['cerulean',.2],['titanium_white',1.2],['sap_green',.15],['cobalt_violet',.1]]),R(3,7),{load:.7,thin:.7});}
// tiny tree clumps on the ridge
for(let i=0;i<50;i++){const x=R(-10,1010);const h=R(5,14);St(x,yR(x)-h*.3,h,R(-1.9,-1.2),R(-1.5,1.5),M([['viridian',.4],['ultramarine',.2],['titanium_white',.8],['sap_green',.2],['cobalt_violet',.1]]),R(3,7),{load:.9,thin:.55});}
// castle: soft towers and keep, close in value to the ridge, warm touches on the sunward (right) side
const cv=()=>M([['titanium_white',1.6],['cobalt_violet',.5],['cerulean',.2],['ultramarine',.18],['burnt_umber',.04]]);
const cd=()=>M([['titanium_white',1.2],['cobalt_violet',.6],['ultramarine',.3],['cerulean',.12]]);
const cw=()=>M([['titanium_white',2.2],['naples_yellow',.5],['quinacridone_rose',.2],['cadmium_orange',.03]]);
const T=[[236,252,282,0],[262,274,292,0],[285,303,250,1],[314,328,278,0],[340,354,292,0]];
for(const [x0,x1,top,keep] of T){const w=x1-x0,cx=(x0+x1)/2;
 for(let i=0;i<14;i++){const x=x0+R(.1,.65)*w;St(x,R(top+6,332)-R(0,0)+0,R(10,34),1.57+R(-.06,.06),R(-.8,.8),R(0,1)<.8?cv():cd(),R(2.6,5.2),{load:R(.7,1),thin:.6});}
 for(let i=0;i<10;i++){const x=x1-R(1,w*.3);St(x,R(top+8,330),R(10,30),1.57+R(-.05,.05),R(-.5,.5),cw(),R(1.8,3.2),{load:R(.8,1.1),thin:.55});}
 // battlements
 for(let i=0;i<4;i++)p.dab({x:x0+w*(.12+.25*i),y:top+R(-1,2),color:i>2?cw():cv(),size:R(2,3.4),brush:'round',load:1});
 // conical roof
 for(let i=0;i<7;i++){const a=R(-.5,.5);St(cx+a*w*.35,top-R(3,10),R(8,16),-1.57+a*.35,R(-.5,.5),M([['quinacridone_rose',.15],['titanium_white',1.5],['cobalt_violet',.5],['cerulean',.1]]),R(1.8,4.4),{load:.9,thin:.55});}
 if(keep)for(let i=0;i<6;i++)St(cx+R(-1,1),top-R(12,22),R(10,16),-1.57,R(-.5,.5),cv(),R(1.8,3.6),{load:.9,thin:.55});
 // windows
 p.dab({x:cx-w*.12,y:top+R(14,26),color:M([['ultramarine',.6],['cobalt_violet',.4],['titanium_white',.3]]),size:2,brush:'round',load:1});
}
// curtain wall between and haze across the base
for(let i=0;i<24;i++){const x=R(232,358);St(x,R(322,330),R(14,40),R(-.05,.05),R(-.6,.6),R(0,1)<.7?cv():cw(),R(2.6,5),{load:.8,thin:.6});}
for(let i=0;i<30;i++){const x=R(220,370);St(x,R(322,336),R(30,70),R(-.05,.05),R(-1,1),M([['naples_yellow',.9],['titanium_white',2],['quinacridone_rose',.08]]),R(3,8),{load:.5,thin:.75,opacity:R(.3,.55)});}
// Millennial Fair balloons: tiny irregular touches with a hint of string
for(let i=0;i<14;i++){const x=R(410,500),y=R(228,286);const c=['cadmium_red','cadmium_yellow','cerulean','quinacridone_rose','cobalt_violet','cadmium_orange'][Math.floor(R(0,6))];
 p.dab({x,y,color:[[c,1],['titanium_white',R(.3,.9)]],size:R(2.2,4.4),brush:'round',load:1});
 if(R(0,1)<.5)St(x,y+6,R(5,9),1.57+R(-.3,.3),0,M([['burnt_umber',.3],['cobalt_violet',.5],['titanium_white',1]]),1.2,{load:.7});}

// far meadow edge: small flat strokes to settle the ridge into the grass
for(let i=0;i<260;i++){const x=R(-20,1020),y=R(338,372);const t=(y-338)/34;const L=R(0,1);
 St(x,y,R(10,38),R(-.1,.1),R(-1.5,1.5),L<.45?M([['sap_green',.6],['cadmium_yellow',.25],['titanium_white',.6],['cerulean',.08]]):L<.75?M([['viridian',.2],['sap_green',.5],['cobalt_violet',.1],['titanium_white',.7]]):M([['naples_yellow',.5],['sap_green',.4],['titanium_white',.8]]),R(2.6,6),{load:R(.6,.95),thin:.6});}
