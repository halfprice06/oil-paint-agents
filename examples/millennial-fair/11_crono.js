const R=(a,b)=>p.rand(a,b);
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.8,1.2)]);
const pr=(i,n)=>{const f=i/(n-1);return .35+.65*Math.sin(Math.PI*Math.min(1,Math.max(0,f*.9+.05)));};
function seg(x,y,len,ang,bend,n){n=n||4;const pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;const b=bend*(t*t-.08);pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*b,y+Math.sin(ang)*len*t+Math.cos(ang)*b,pr(i,n)]);}return pts;}
const F=(pts,c,size,o)=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size:size,load:1,thin:.5},o||{}));
const S=(x,y,len,ang,c,size,o)=>{o=o||{};const b=o.bend===undefined?R(-5,5):o.bend;const n=o.n||4;delete o.bend;delete o.n;return F(seg(x,y,len,ang,b,n),c,size,o);};
const BL=(pts,size,brush)=>p.stroke({points:pts,brush:brush||'filbert',size:size,load:0,color:'titanium_white'});
// polyline through points -> multi-point stroke with pressure
const PL=(pts,c,size,o)=>F(pts.map((q,i)=>[q[0],q[1],q[2]===undefined?pr(i,pts.length):q[2]]),c,size,o);
const area=poly=>{let a=0;for(let i=0;i<poly.length;i++){const q=poly[i],r=poly[(i+1)%poly.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
const inPoly=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
function cover(poly,size,col,o){o=o||{};const dens=o.dens||1,lenf=o.len||2.5;const n=Math.max(1,Math.round(area(poly)*dens*1.5/(size*size*lenf*.7)));
 const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 let k=0,g=0;while(k<n&&g++<n*40){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;
  const a=(o.ang||0)+R(-1,1)*(o.angJ===undefined?.3:o.angJ);const sz=size*R(.75,1.25);
  const oo=Object.assign({brush:'flat'},o.o||{});if(o.brush)oo.brush=o.brush;
  let L=sz*lenf*R(.7,1.3);const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  F(seg(x,y,L,a,R(-4,4)*size/20),col(x,y),sz,oo);}
 return n;}
const ELL=(cx,cy,rx,ry,rot,n)=>{n=n||20;rot=rot||0;const pts=[];for(let i=0;i<n;i++){const a=i/n*6.2832;const x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return pts;};
const lerp=(a,b,t)=>a+(b-a)*t;
// wobbling line from a to b
function WL(x0,y0,x1,y1,c,size,o){const n=4,pts=[];for(let i=0;i<n;i++){const t=i/(n-1);pts.push([lerp(x0,x1,t)+R(-1.2,1.2),lerp(y0,y1,t)+R(-1.2,1.2),.5+.4*Math.sin(Math.PI*t)]);}return F(pts,c,size,o);}
// tapered limb/tube painted as light / mid / shade strips along its length (light from the left)
function tube(p0,p1,w0,w1,cols,o){o=o||{};const dx=p1[0]-p0[0],dy=p1[1]-p0[1];const L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L;let nx=-uy,ny=ux;if(nx>0){nx=-nx;ny=-ny;}
  const ang=Math.atan2(dy,dx);const n=Math.max(2,Math.round(L/((o.step||9)*1.8)));
  for(let i=0;i<n;i++){const t=(i+.5)/n;const w=lerp(w0,w1,t);const cx=lerp(p0[0],p1[0],t),cy=lerp(p0[1],p1[1],t);const seglen=L/n*1.8;
    const strips=[[-.27,cols.lit,.42,.95],[0,cols.mid,.5,1],[.3,cols.shade,.38,.9]];
    for(const [off,cf,wf,ld] of strips){S(cx+nx*w*off+R(-.4,.4),cy+ny*w*off+R(-.4,.4),seglen*R(.9,1.3),ang+R(-.04,.04),cf(),Math.max(1.5,w*wf*R(.85,1.15)),Object.assign({brush:'filbert',load:ld,thin:.45,bend:R(-1,1)},o.o||{}));}
  }
  if(!o.noblend&&Math.max(w0,w1)>7){for(let k=0;k<3;k++){const off=(k==1?.12:k==2?0:-.1)*Math.max(w0,w1);BL([[p0[0]+nx*off,p0[1]+ny*off,.7],[lerp(p0[0],p1[0],.5)+nx*off,lerp(p0[1],p1[1],.5)+ny*off,.8],[p1[0]+nx*off,p1[1]+ny*off,.5]],Math.max(3,Math.max(w0,w1)*.42));}}
  if(cols.rim){for(let i=0;i<Math.max(2,Math.round(L/22));i++){const t=R(.1,.9);const w=lerp(w0,w1,t);S(lerp(p0[0],p1[0],t)-nx*w*.36,lerp(p0[1],p1[1],t)-ny*w*.36,R(8,16),ang,cols.rim(),Math.max(1.4,w*.13),{brush:'filbert',load:1.1,thin:.4,opacity:R(.6,.95),bend:0});}}
}
// CRONO: running toward the stage, three-quarter back view, reaching out
const skinL=()=>M([['flesh_tint',1],['titanium_white',.45],['cadmium_orange',.12],['naples_yellow',.1]]);
const skinM=()=>M([['flesh_tint',1],['titanium_white',.15],['cadmium_orange',.15],['burnt_sienna',.12]]);
const skinS=()=>M([['flesh_tint',.8],['burnt_sienna',.3],['cobalt_violet',.3],['titanium_white',.1]]);
const skinR=()=>M([['flesh_tint',.7],['cerulean',.2],['cobalt_violet',.25],['titanium_white',.9]]);
const hD=()=>M([['alizarin_crimson',.5],['vermilion',.6],['burnt_sienna',.25],['cobalt_violet',.08]]);
const hM=()=>M([['vermilion',.8],['cadmium_red',.4],['cadmium_orange',.3]]);
const hL=()=>M([['cadmium_orange',.8],['cadmium_yellow',.4],['vermilion',.3],['titanium_white',.1]]);
const hR=()=>M([['quinacridone_rose',.5],['cerulean',.2],['titanium_white',1],['vermilion',.3]]);
const tL=()=>M([['cerulean',.5],['titanium_white',1.6],['cobalt_blue',.25],['naples_yellow',.08]]);
const tM=()=>M([['cerulean',.7],['cobalt_blue',.4],['titanium_white',.9]]);
const tS=()=>M([['ultramarine',.55],['cobalt_violet',.3],['cerulean',.2],['titanium_white',.7]]);
const tR=()=>M([['titanium_white',2.4],['cerulean',.5],['cobalt_violet',.1]]);
const gL=()=>M([['sap_green',.5],['viridian',.2],['titanium_white',.7],['cadmium_yellow',.1]]);
const gM=()=>M([['sap_green',.8],['viridian',.3],['titanium_white',.3]]);
const gS=()=>M([['viridian',.5],['ultramarine',.3],['sap_green',.3],['paynes_grey',.15]]);
const aL=()=>M([['cadmium_orange',.9],['cadmium_yellow',.3],['titanium_white',.2]]);
const aM=()=>M([['cadmium_orange',.9],['vermilion',.3]]);
const aS=()=>M([['vermilion',.5],['burnt_sienna',.5],['cobalt_violet',.2]]);
const pL=()=>M([['naples_yellow',.6],['yellow_ochre',.3],['titanium_white',1.5]]);
const pM=()=>M([['yellow_ochre',.6],['naples_yellow',.3],['raw_sienna',.15],['titanium_white',.9]]);
const pS=()=>M([['raw_sienna',.45],['cobalt_violet',.35],['burnt_sienna',.15],['titanium_white',.7]]);
const bL=()=>M([['burnt_sienna',.6],['raw_sienna',.4],['titanium_white',.25]]);
const bM=()=>M([['burnt_umber',.9],['burnt_sienna',.3]]);
const bS=()=>M([['burnt_umber',.8],['ivory_black',.4],['ultramarine',.3]]);
const blt=()=>M([['ivory_black',.6],['burnt_umber',.4],['ultramarine',.2]]);
const wL=()=>M([['titanium_white',3],['naples_yellow',.1]]);
const wM=()=>M([['titanium_white',2],['cerulean',.2],['cobalt_violet',.1]]);
const wS=()=>M([['cobalt_violet',.5],['ultramarine',.2],['titanium_white',1.5]]);
const dpC=()=>M([['ultramarine',.4],['cobalt_violet',.45],['burnt_sienna',.25],['burnt_umber',.15],['titanium_white',.7]]);

const plane=(f,L,M_,S_,Rf)=>f<.26?L():f<.56?M_():f<.86?S_():Rf();
const rfl=base=>()=>M([['cerulean',.25],['cobalt_violet',.25],['titanium_white',.9],['burnt_sienna',.1]]);
// ---- cast shadow on the ground, long toward the right
for(let i=0;i<26;i++){const t=R(0,1);S(lerp(330,520,t)+R(-10,10),lerp(772,790,t)+R(-6,6),R(50,100),R(-.05,.1),dpC(),R(8,15),{brush:'flat',load:.9,thin:.5,opacity:R(.45,.8)});}
S(300,774,80,.05,dpC(),15,{brush:'flat',load:1,thin:.5,opacity:.8});S(405,776,60,0,dpC(),10,{brush:'flat',load:1,thin:.5,opacity:.8});
// ---- katana sheath trailing from the left hip: red cord wraps, white tsuba, gold chape
tube([322,668],[248,694],10,7,{lit:()=>M([['burnt_umber',.8],['burnt_sienna',.4],['titanium_white',.3]]),mid:bM,shade:bS},{step:8});
S(285,679,64,.33,M([['titanium_white',1.2],['burnt_sienna',.5],['yellow_ochre',.3]]),1.8,{brush:'flat',load:1.1,thin:.4,opacity:.8});
for(const [x,y] of [[304,673],[290,678],[268,686]])S(x,y,10,1.9,M([['cadmium_red',1],['alizarin_crimson',.3]]),3,{brush:'flat',load:1.1,thin:.4});
p.dab({x:247,y:695,size:7,color:M([['cadmium_yellow',.8],['yellow_ochre',.5],['titanium_white',.3]]),brush:'round',load:1.2});
S(323,664,10,1.9,M([['titanium_white',2],['yellow_ochre',.3]]),5,{brush:'flat',load:1.2,thin:.4});
// ---- trailing leg (our left), kicked up behind
tube([320,682],[303,730],33,24,{lit:pL,mid:pM,shade:pS},{step:7});
tube([303,730],[281,760],24,16,{lit:pL,mid:pM,shade:pS},{step:7});
tube([301,738],[277,764],22,17,{lit:bL,mid:bM,shade:bS},{step:6});
S(262,768,28,.5,bM(),14,{brush:'filbert',load:1.05,thin:.4});S(254,770,14,1.2,bS(),10,{brush:'filbert',load:1.05,thin:.4});
S(284,748,18,.9,bL(),3.4,{brush:'flat',load:1.15,thin:.4,opacity:.9});
S(294,738,26,.35,M([['raw_sienna',.6],['titanium_white',.6],['burnt_sienna',.3]]),6,{brush:'flat',load:1.1,thin:.4});
// ---- forward, planted leg (our right)
tube([358,682],[388,728],34,25,{lit:pL,mid:pM,shade:pS},{step:7});
tube([388,728],[404,766],25,17,{lit:pL,mid:pM,shade:pS},{step:7});
tube([390,740],[405,768],23,18,{lit:bL,mid:bM,shade:bS},{step:6});
S(416,771,40,.05,bM(),15,{brush:'filbert',load:1.05,thin:.4});S(410,775,22,0,bS(),9,{brush:'filbert',load:1.05,thin:.4,opacity:.9});
S(397,752,16,1.1,bL(),3.4,{brush:'flat',load:1.15,thin:.4,opacity:.9});
S(394,742,28,.7,M([['raw_sienna',.6],['titanium_white',.6],['burnt_sienna',.3]]),6,{brush:'flat',load:1.1,thin:.4});
for(const [x0,y0,x1,y1] of [[316,700,306,726],[330,700,326,728],[366,700,378,722],[376,706,388,730]])S((x0+x1)/2,(y0+y1)/2,Math.hypot(x1-x0,y1-y0),Math.atan2(y1-y0,x1-x0),pS(),4,{brush:'filbert',load:.9,thin:.5,opacity:.6});
// hips / seat in tan trousers (baggy)
cover([[302,668],[368,666],[376,696],[356,712],[318,712],[298,696]],6,(x)=>{const f=(x-298)/78;return plane(f,pL,pM,pS,pM);},{ang:1.4,angJ:.5,dens:1.5,len:2,brush:'filbert',o:{load:1,thin:.45}});
// ---- left arm (back swing): green sleeve, fist
tube([300,618],[281,652],22,18,{lit:gL,mid:gM,shade:gS},{step:7});tube([281,652],[270,678],18,14,{lit:gL,mid:gM,shade:gS},{step:7});
S(276,666,18,.3,M([['titanium_white',1.5],['naples_yellow',.3]]),4,{brush:'flat',load:1.1,thin:.4,opacity:.9});
cover(ELL(268,684,9,9,0,10),3,()=>R(0,1)<.5?skinL():skinM(),{ang:1,angJ:1,dens:1.8,brush:'filbert',o:{load:1,thin:.4}});S(264,689,10,1.2,skinS(),3.4,{brush:'filbert',load:1,thin:.4});
// ---- torso: blue tunic, tapering from broad shoulders, with a flared hem; clear planes
const TUN=[[296,614],[318,604],[338,600],[360,603],[378,610],[372,640],[368,660],[385,696],[338,706],[292,700],[306,662],[300,640]];
cover(TUN,13,(x,y)=>{const f=(x-292)/96+R(-.03,.03);return plane(f,tL,tM,tS,rfl());},{ang:1.5,angJ:.3,dens:1.5,len:2.4,brush:'filbert',o:{load:1,thin:.45}});
cover(TUN,7,(x,y)=>{const f=(x-292)/96+R(-.06,.06);return plane(f,tL,tM,tS,rfl());},{ang:1.45,angJ:.4,dens:.45,len:2,brush:'filbert',o:{load:1.02,thin:.42}});
cover(TUN,4,(x,y)=>{const f=(x-292)/96+R(-.08,.08);return f<.2?tR():f<.5?tL():f<.8?tM():tS();},{ang:1.4,angJ:.55,dens:.05,len:1.8,brush:'filbert',o:{load:1.1,thin:.4,opacity:.9}});
// shoulder caps of the tunic (light on the top) and back panel fold
S(318,610,36,-.15,tL(),9,{brush:'filbert',load:1.05,thin:.4,bend:3});S(364,608,30,.25,tM(),9,{brush:'filbert',load:1.05,thin:.4,bend:-3});
for(let k=0;k<5;k++){const x=lerp(306,376,k/4)+R(-5,5);S(x,R(676,690),R(26,36),1.57+R(-.1,.1),k<2?tL():tS(),R(5,9),{brush:'filbert',load:1,thin:.45,opacity:.85});}
S(338,702,92,.03,M([['ultramarine',.5],['cobalt_violet',.4],['titanium_white',.5]]),6,{brush:'flat',load:1,thin:.45,bend:4,opacity:.9});
S(316,698,40,.02,tR(),3,{brush:'flat',load:1.1,thin:.4,opacity:.85,bend:3});
// green shirt hem peeking at the side slit
S(300,702,16,1.2,gL(),5,{brush:'filbert',load:1,thin:.45});S(380,700,14,1.2,gS(),5,{brush:'filbert',load:1,thin:.45});
// belt with buckle
S(337,665,84,.0,blt(),10,{brush:'flat',load:1.05,thin:.45,bend:3});S(332,661,60,0,M([['burnt_umber',.6],['titanium_white',.5],['raw_sienna',.3]]),2.2,{brush:'flat',load:1.1,thin:.4,opacity:.7,bend:3});
p.dab({x:347,y:666,size:8,color:M([['cadmium_yellow',.8],['yellow_ochre',.5],['titanium_white',.3]]),brush:'round',load:1.2,pressure:.9});
// ---- right arm: reaching toward the stage, hand open
tube([374,614],[408,604],22,18,{lit:gL,mid:gM,shade:gS,rim:tR},{step:7});tube([408,604],[440,584],18,13,{lit:gL,mid:gM,shade:gS,rim:tR},{step:7});
S(441,583,13,.6,M([['titanium_white',1.5],['naples_yellow',.3]]),6,{brush:'flat',load:1.1,thin:.4});
cover(ELL(451,577,11,10,.5,12),3,(x)=>x<449?skinL():x<455?skinM():skinR(),{ang:.5,angJ:1.2,dens:1.8,brush:'filbert',o:{load:1.05,thin:.4}});
for(let f=0;f<4;f++){const a=-.3-f*.3-.1;const bx=456+Math.cos(a)*5,by=573+Math.sin(a)*5;S(bx+Math.cos(a)*8,by+Math.sin(a)*8,16,a,f%2?skinM():skinL(),3.6,{brush:'filbert',load:1.05,thin:.4,bend:R(-1,1)});}
S(459,583,12,.9,skinM(),4,{brush:'filbert',load:1.05,thin:.4});
for(let i=0;i<6;i++)S(R(446,468),R(565,583),R(5,9),R(-1.2,0),tR(),1.4,{brush:'filbert',load:1.2,thin:.4,opacity:.8});
// ---- neck, ear, nape
tube([337,602],[338,590],16,15,{lit:skinM,mid:skinM,shade:skinS},{step:6});
S(346,597,14,1.57,skinS(),5,{brush:'filbert',load:1,thin:.45,opacity:.85});
cover(ELL(321,579,4.5,6.5,0,10),2.4,()=>R(0,1)<.6?skinL():skinM(),{ang:1.2,angJ:1,dens:1.8,brush:'filbert',o:{load:1,thin:.4}});S(322,580,6,1.5,skinS(),1.8,{brush:'round',load:.9,thin:.5,opacity:.8});
cover([[351,576],[357,578],[355,590],[347,594],[345,583]],3,()=>R(0,1)<.5?skinR():skinS(),{ang:1.5,angJ:.7,dens:1.8,brush:'filbert',o:{load:1,thin:.4}});
// head mass under the hair (red)
cover(ELL(338,571,19,19,0,18),6,(x,y)=>{const f=(x-313)/50;return f<.3?hL():f<.7?hM():hD();},{ang:1.2,angJ:.9,dens:1.4,len:1.8,brush:'filbert',o:{load:1.02,thin:.42}});
// bandana with tails
F([[321,582,.7],[327,588,.9],[339,592,1],[351,590,.9],[357,583,.7]],wM(),10,{brush:'filbert',load:1.1,thin:.4});
F([[322,580,.6],[329,585,.8],[340,588,.9],[349,586,.8]],wL(),4.6,{brush:'filbert',load:1.2,thin:.38,opacity:.95});
F([[341,594,.6],[352,593,.8],[358,586,.6]],wS(),4,{brush:'filbert',load:1.05,thin:.42,opacity:.9});
F([[324,588,.9],[308,594,.8],[290,590,.6],[274,598,.35]],wM(),8,{brush:'filbert',load:1.1,thin:.4,bend:4});
F([[324,586,.8],[308,591,.7],[292,587,.5]],wL(),3,{brush:'filbert',load:1.2,thin:.38,opacity:.95});
F([[326,593,.9],[308,603,.7],[294,611,.45],[283,608,.25]],wS(),6.5,{brush:'filbert',load:1.1,thin:.4,bend:-4});
// ---- hair: wind-swept clumps of spikes. back ones first.
function spike(b,t,w,bend,o){o=o||{};const ang=Math.atan2(t[1]-b[1],t[0]-b[0]);const nx=-Math.sin(ang),ny=Math.cos(ang);
  const path=(off,f0,f1,pr)=>{const pts=[];for(let i=0;i<=4;i++){const f=lerp(f0,f1,i/4);const bb=bend*Math.sin(Math.PI*Math.min(1,f)*.9)*1.0;pts.push([lerp(b[0],t[0],f)+nx*(off*(1-.6*f)+bb)+R(-.8,.8),lerp(b[1],t[1],f)+ny*(off*(1-.6*f)+bb)+R(-.8,.8),Math.max(.1,pr*(1-.85*f))]);}return pts;};
  F(path(w*.1,0,1,1),o.dark||hD(),w,{brush:'filbert',load:1.02,thin:.42});
  F(path(-w*.04,.02,.92,.95),hM(),w*.7,{brush:'filbert',load:1.02,thin:.42});
  F(path(-w*.24,.05,.8,.9),hL(),w*.34,{brush:'filbert',load:1.15,thin:.38,opacity:.95});
  if(!o.back){F(path(-w*.3,.5,.95,.7),M([['cadmium_yellow',.5],['cadmium_orange',.5],['titanium_white',.3]]),Math.max(2,w*.14),{brush:'filbert',load:1.2,thin:.36,opacity:.9});
    if(t[0]>345)F(path(w*.36,.15,.8,.6),hR(),Math.max(1.5,w*.1),{brush:'filbert',load:1.1,thin:.4,opacity:.75});}}
const dk2=()=>M([['alizarin_crimson',.6],['vermilion',.4],['burnt_umber',.2],['cobalt_violet',.12]]);
for(const [b,t,w,bd] of [[[336,552],[334,506],9,2],[[326,553],[300,502],9,-4],[[346,553],[364,512],9,3],[[332,551],[324,500],9,-3]])spike(b,t,w,bd,{back:true,dark:dk2()});
for(const [b,t,w,bd] of [[[340,555],[347,498],14,5],[[330,555],[318,494],14,-5],[[322,559],[292,512],13,-8],[[350,558],[376,507],13,8],[[316,568],[276,543],11,-6],[[354,568],[392,549],11,6],[[312,580],[272,587],8,5],[[344,554],[360,521],10,5],[[335,552],[339,489],10,-2],[[324,554],[306,521],10,-4],[[358,564],[386,536],9,4],[[318,563],[298,530],9,-3]])spike(b,t,w,bd);
// clumps and strands between spikes, over the crown and nape
for(let i=0;i<40;i++){const a=R(3.3,6.1),r=R(.2,1);const x=338+Math.cos(a)*19*r*1.05,y=562+Math.sin(a)*16*r;S(x,y,R(10,26),a+1.57*R(.4,1.2)+R(-.4,.4),R(0,1)<.4?hL():R(0,1)<.6?hM():hD(),R(3,6),{brush:'filbert',load:1.02,thin:.42,bend:R(-3,3)});}
for(let i=0;i<24;i++){const x=R(298,316),y=R(562,594);S(x,y,R(8,16),R(1.2,2),R(0,1)<.5?hM():hD(),R(3,5),{brush:'filbert',load:1,thin:.42});}
for(let i=0;i<14;i++){const x=R(322,350),y=R(500,540);S(x,y,R(8,16),R(-1.9,-1.2),R(0,1)<.5?hL():hM(),R(2,4),{brush:'filbert',load:1.1,thin:.4,opacity:.9});}
// ---- ascot at the neck: orange knot and tail flapping back
F([[320,602,.7],[336,609,.9],[353,608,1],[366,601,.7]],aM(),13,{brush:'filbert',load:1.08,thin:.4});
F([[320,600,.6],[336,606,.8],[350,605,.8]],aL(),5.5,{brush:'filbert',load:1.15,thin:.38,opacity:.95});
F([[350,610,.7],[362,608,.7]],aS(),5.5,{brush:'filbert',load:1.05,thin:.42,opacity:.9});
F([[320,606,.9],[304,612,.8],[288,608,.6],[275,617,.3]],aM(),10,{brush:'filbert',load:1.08,thin:.4,bend:4});
F([[320,604,.8],[304,609,.7],[290,605,.4]],aL(),3.4,{brush:'filbert',load:1.2,thin:.38,opacity:.95});
F([[322,612,.8],[306,620,.6],[292,622,.3]],aS(),5,{brush:'filbert',load:1.05,thin:.42,opacity:.9});
S(337,612,32,.03,gM(),5,{brush:'flat',load:1,thin:.45,bend:2});
// ---- final lights: sun on his left edges, cool rim from the gate on right edges
for(let i=0;i<22;i++){const y=R(616,694);S(299+(y-616)*.1+R(-1,2),y,R(8,18),1.57+R(-.1,.1),M([['titanium_white',2.2],['naples_yellow',.5]]),R(2,3.4),{brush:'filbert',load:1.2,thin:.4,opacity:R(.5,.9)});}
for(let i=0;i<9;i++){const y=R(616,690);S(370+(y-614)*.1+R(-1,1),y,R(8,16),1.57+R(-.1,.1),tR(),R(1.6,2.6),{brush:'filbert',load:1.2,thin:.4,opacity:R(.6,.9)});}
for(let i=0;i<7;i++){const y=R(704,764);S((y<745?389:404)+R(-1,3)+(y-700)*.18,y,R(8,14),1.4,tR(),R(1.6,2.4),{brush:'filbert',load:1.2,thin:.4,opacity:R(.5,.85)});}
p.dry();
