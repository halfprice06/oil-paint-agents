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
const PX=610,PY=398;
const tOf=y=>cl01((y-338)/412);
const shadows=[[300,430,210,30],[830,505,270,44],[560,650,320,60],[90,590,170,46],[950,380,160,22]];
const patches=[[480,540,200,40],[720,610,240,50],[250,470,180,26],[880,430,140,20]];
function Lf(x,y){let L=.55+.16*Math.sin(x/130+1.3)*Math.cos(y/55)+(x-500)/2800;
 for(const [sx,sy,rx,ry] of shadows){const d=((x-sx)/rx)**2+((y-sy)/ry)**2;if(d<1)L-=.5*(1-d);}
 for(const [sx,sy,rx,ry] of patches){const d=((x-sx)/rx)**2+((y-sy)/ry)**2;if(d<1)L+=.3*(1-d);}
 return L;}
function slopeA(x,y){const t=tOf(y);return .09*Math.sin(x/170+y/80)+(x-520)/1700*(.2+t);}
function gcol(L){const r=R(0,1);
 if(L>.62){
  if(r<.09)return M([['cadmium_orange',.14],['naples_yellow',.7],['titanium_white',.7],['yellow_ochre',.1]]);
  if(r<.18)return M([['quinacridone_rose',.1],['naples_yellow',.6],['titanium_white',.9],['sap_green',.2]]);
  if(r<.27)return M([['cobalt_violet',.14],['sap_green',.6],['titanium_white',.6],['cadmium_lemon',.2]]);
  return M([['cadmium_yellow',.4+R(0,.2)],['cadmium_lemon',.15],['sap_green',.45],['titanium_white',.7+R(0,.3)],['yellow_ochre',.08]]);}
 if(L>.4){
  if(r<.12)return M([['yellow_ochre',.3],['sap_green',.5],['cadmium_yellow',.2],['titanium_white',.4]]);
  if(r<.22)return M([['cobalt_violet',.2],['sap_green',.6],['ultramarine',.1],['titanium_white',.5]]);
  return M([['sap_green',.8],['cadmium_yellow',.2+R(0,.15)],['ultramarine',.1],['titanium_white',.5],['viridian',.05]]);}
 if(r<.1)return M([['cobalt_violet',.2],['quinacridone_rose',.05],['sap_green',.5],['titanium_white',.5]]);
 if(r<.2)return M([['cerulean',.3],['sap_green',.4],['titanium_white',.6],['cobalt_violet',.1]]);
 return M([['ultramarine',.3+R(0,.15)],['cobalt_violet',.28],['sap_green',.5],['viridian',.1],['titanium_white',.5+R(0,.2)]]);}
function lay(n,s0,s1,l0,l1,o,flick){for(let i=0;i<n;i++){const y=338+412*Math.pow(R(0,1),1.2),x=R(-20,1020);const t=tOf(y);const tm=.28+.72*t;const L=Lf(x,y)+R(-.08,.08);
  const size=Math.max(2,R(s0,s1)*tm),len=R(l0,l1)*Math.pow(tm,.8);
  let a=slopeA(x,y)+R(-.3,.3);if(flick){if(t<.2)continue;a=-1.5+R(-.5,.5);}
  St(x,y,len,a,R(-4,4)*tm,gcol(L),size,Object.assign({load:R(.5,.95),thin:R(.5,.8)},o||{}));}}
lay(100,30,46,90,170);lay(700,13,22,40,90);lay(1500,6,11,20,46);lay(500,2.8,5,10,22,{load:R(.6,1)});
lay(700,3,6,16,34,{},true);
// glints and dapples: bright warm touches on lit ground, tiny cool ones in shade
for(let i=0;i<500;i++){const y=338+412*Math.pow(R(0,1),1.2),x=R(-20,1020);const t=tOf(y),tm=.28+.72*t,L=Lf(x,y);
 const col=L>.6?M([['naples_yellow',.6],['titanium_white',1.2],['cadmium_orange',R(0,.1)],['cadmium_lemon',.2]]):M([['cobalt_violet',.25],['cerulean',.2],['titanium_white',.8],['sap_green',.2]]);
 St(x,y,R(8,22)*tm,slopeA(x,y)+R(-.8,.8),R(-2,2),col,Math.max(1.8,R(2.2,4.8)*tm),{load:R(.7,1)});}
// gate light spilling on the grass
for(let i=0;i<250;i++){const th=R(0,6.28),r=Math.sqrt(R(0,1));const x=PX+Math.cos(th)*r*250,y=PY+75+Math.sin(th)*r*62;const k=1-r;
 St(x,y,R(8,34),R(-.5,.5),R(-3,3),M([['cobalt_violet',.4],['cerulean',.4],['ultramarine',.1],['titanium_white',.9+k*1.6],['quinacridone_rose',R(0,.12)]]),R(2.5,9)*(.7+k*.5),{load:R(.45,.9),thin:.65,opacity:R(.4,.85)});}
// wildflowers: irregular multicolour clusters
const fl=[[['titanium_white',1],['naples_yellow',.12]],[['cadmium_red',1],['quinacridone_rose',.15]],[['cadmium_yellow',1],['titanium_white',.2]],[['cobalt_violet',.8],['titanium_white',.7]],[['quinacridone_rose',.7],['titanium_white',.8]],[['cadmium_orange',.8],['cadmium_yellow',.3]]];
function cluster(x,y,n,spread,sc,main,alt){for(let i=0;i<n;i++){const c=R(0,1)<.7?main:alt;const px=x+R(-spread,spread),py=y+R(-spread*.55,spread*.55);
  St(px,py+4*sc,R(5,10)*sc,-1.5+R(-.4,.4),R(-1,1),M([['sap_green',.8],['viridian',.15],['titanium_white',.2]]),R(1.6,2.6)*sc,{load:.8});
  St(px,py,R(2.5,6)*sc,R(0,6.28),R(-1,1),M(fl[c]),R(2.6,5.2)*sc,{load:R(.85,1.1)});
  if(R(0,1)<.35)p.dab({x:px+R(-2,2),y:py+R(-2,2),color:M([['cadmium_yellow',.8],['titanium_white',.3]]),size:1.8*sc,brush:'round',load:1});}}
const cl=[[250,700,9,34],[290,725,8,30],[340,690,8,28],[395,720,9,34],[320,660,7,24],[430,670,7,24],[225,735,6,22],[560,730,9,34],[690,700,8,30],[820,730,9,36],[930,700,8,30],[610,640,7,26],[760,640,7,24],[120,690,8,30],[70,640,7,26],[480,600,6,18],[870,610,7,20],[160,560,6,16],[700,560,6,16],[930,560,6,14]];
for(const [x,y,n,s] of cl){const t=tOf(y);const sc=.5+.9*t;const m=Math.floor(R(0,6));cluster(x,y,n,s,sc,m,Math.floor(R(0,6)));}
