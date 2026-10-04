// WATER (big horizontal strokes, reflections dragged down wet) and dark simple banks
const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.88,1.12)]);
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1.0,thin:.55},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function xs(poly,y){const r=[];for(let i=0;i<poly.length;i++){const [x1,y1]=poly[i],[x2,y2]=poly[(i+1)%poly.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))r.push(x1+(y-y1)/(y2-y1)*(x2-x1));}return r.sort((a,b)=>a-b);}
function inside(poly,x,y){const r=xs(poly,y);for(let i=0;i+1<r.length;i+=2)if(x>=r[i]&&x<=r[i+1])return true;return false;}
// pond: sky reflected, pale warm at the far edge, bluer and darker toward the viewer
function wat(y){const t=Math.max(0,Math.min(1,(y-478)/200));
 return M([['titanium_white',3.9-t*1.8],['cobalt_blue',.1+t*.2],['ultramarine',.08+t*.25],['burnt_umber',.07+t*.1],['alizarin_crimson',.05],['naples_yellow',(1-t)*.6],['cadmium_orange',(1-t)*.04],['viridian',t*.06]]);}
for(let row=0;row<12;row++){const y=480+row*21;let x=-80+R(-30,0);while(x<1010){const L=R(260,420);
  F([[x,y+R(-3,3)],[x+L/2,y+R(-5,5)],[x+L,y+R(-3,3)]],wat(y),R(30,42),{load:.9,thin:.6});x+=L*R(.6,.8);}}
// broken horizontal strokes of slightly different values, and soft ripple lines
for(let i=0;i<30;i++){const y=R(484,700),x=R(-20,1000),len=R(60,170);const t=Math.max(0,Math.min(1,(y-478)/200));const dark=R(0,1)<.45;
  const c=dark?M([['titanium_white',2.2],['ultramarine',.3+t*.2],['burnt_umber',.1],['cobalt_blue',.1]]):M([['titanium_white',3.8-t*1.2],['cobalt_blue',.12],['naples_yellow',(1-t)*.3]]);
  F([[x,y],[x+len/2,y+R(-2,2)],[x+len,y+R(-2,2)]],c,R(9,16),{load:.8,thin:.6});}
for(let i=0;i<12;i++){const y=R(488,690),x=R(480,1000);BL([[x,y],[x+R(50,110),y+R(-2,2)]],R(8,12));}
// far-shore reflection: pale olive just under the meadow
for(let i=0;i<5;i++){const x=R(420,800);F([[x,R(482,490)],[x+R(160,260),R(484,492)]],M([['yellow_ochre',.2],['ultramarine',.2],['titanium_white',2.2],['sap_green',.15],['burnt_umber',.1]]),R(16,22),{load:.85,thin:.6});}
// tree reflections: soft dark masses under the trees, pulled down wet
const refl=()=>M([['ultramarine',.7],['cadmium_yellow',.25],['burnt_umber',.35],['titanium_white',1.1],['alizarin_crimson',.05]]);
const reflL=()=>M([['ultramarine',.4],['cadmium_yellow',.4],['burnt_umber',.2],['titanium_white',1.5]]);
for(const [x,w,c] of [[100,70,refl],[160,80,refl],[225,90,refl],[290,80,refl],[350,70,reflL],[400,50,reflL]])F([[x+R(-6,6),482],[x+R(-8,8),520],[x+R(-8,8),568]],c(),w,{load:.9,thin:.6});
for(const x of [490,520])F([[x,486],[x+R(-4,4),520],[x+R(-4,4),556]],refl(),R(46,60),{load:.9,thin:.6});
F([[846,486],[848,510],[846,532]],M([['ultramarine',.35],['alizarin_crimson',.08],['burnt_umber',.15],['titanium_white',2.8]]),R(50,70),{load:.9,thin:.6});
for(let i=0;i<14;i++){const x=R(70,540);p.stroke({points:[[x,484],[x+R(-8,8),530],[x+R(-10,10),578]],brush:'filbert',size:R(22,36),load:0,color:'titanium_white'});}
BL([[836,486],[840,540]],30);BL([[856,486],[854,540]],26);
for(let i=0;i<9;i++){const y=496+i*10;BL([[R(60,160),y],[R(260,420),y+R(-2,2)]],R(14,20));}
for(const [x,y,l] of [[140,516,120],[300,538,110],[470,500,90]])F([[x,y],[x+l,y+R(-2,2)]],M([['titanium_white',3],['cobalt_blue',.12],['naples_yellow',.3]]),R(6,9),{load:.9,thin:.4});
// a couple of thin light streaks on the open water (sky catching)
for(const [x,y,l] of [[560,520,200],[640,548,260],[760,506,170]]){F([[x,y],[x+l/2,y+R(-3,3)],[x+l,y+R(-3,3)]],M([['titanium_white',3.6],['naples_yellow',.4],['cobalt_blue',.08]]),R(9,13),{load:1.05,thin:.4});}
for(let i=0;i<5;i++){const y=496+i*16;BL([[R(500,640),y],[R(760,880),y+R(-3,3)],[R(900,1010),y+R(-3,3)]],R(18,26));}
// ---- near banks: lit warm-olive top edge, darker cool face, diagonal strokes following the slope, reflection in the water
const KNOLL=[[-20,730],[-20,590],[60,572],[140,560],[220,556],[300,562],[360,576],[410,596],[430,620],[390,650],[320,690],[300,730]];
const RBANK=[[430,720],[452,664],[520,632],[620,608],[740,596],[860,592],[1020,600],[1020,720]];
const dk=()=>M([['ultramarine',.9],['cadmium_yellow',.22],['burnt_umber',.85],['alizarin_crimson',.08],['titanium_white',.1]]);
const cool=()=>M([['ultramarine',.8],['cadmium_yellow',.3],['burnt_umber',.5],['titanium_white',.2]]);
const lit=()=>M([['cadmium_yellow',.4],['ultramarine',.18],['yellow_ochre',.25],['burnt_umber',.15],['titanium_white',.6]]);
const litm=()=>M([['cadmium_yellow',.3],['ultramarine',.3],['burnt_umber',.3],['yellow_ochre',.1],['titanium_white',.3]]);
function fill(poly,top,bot,step,size,left){for(let y=top;y<=bot;y+=step){const r=xs(poly,y);if(r.length<2)continue;
  const a=left?-50:r[0]-4,b=left?r[r.length-1]+4:1050;const pts=[];const n=4;for(let k=0;k<n;k++)pts.push([a+(b-a)*k/(n-1),y+R(-5,5)]);
  F(pts,R(0,1)<.6?dk():cool(),size+R(-6,10),{load:1.1,thin:.3});}}
fill(KNOLL,572,730,30,60,true);
fill(RBANK,604,730,30,60,false);
// knoll: one clear form. warm lit top plane, cool shadow face with a lighter plane, dark foot where it meets the water
F([[-30,596],[40,580],[130,566],[220,562],[300,568],[372,584]],lit(),30,{load:1,thin:.35});
F([[-30,618],[60,600],[150,588],[250,586],[340,596],[390,610]],litm(),22,{load:.9,thin:.4});
F([[-30,650],[100,636],[240,636],[350,650],[400,664]],cool(),34,{load:.95,thin:.4});
for(const [x,y,l,sz,c] of [[540,640,110,18,litm],[620,616,150,20,lit],[740,602,150,20,lit],[860,598,150,18,litm],[930,614,100,16,litm]])
  F([[x,y],[x+l/2,y+R(-4,1)],[x+l,y+R(-5,0)]],c(),sz,{load:.8,thin:.55});
for(let i=0;i<3;i++){const x=R(480,560),y=R(640,690);F([[x,y],[x+R(-40,-24),y+R(30,50)]],R(0,1)<.5?cool():dk(),R(18,26),{load:.9,thin:.45});}
// reflection of the knoll in the water at its right and foot: one soft dark mass dragged down
F([[430,628],[438,662],[432,700]],M([['ultramarine',.7],['burnt_umber',.4],['cadmium_yellow',.15],['titanium_white',.9]]),R(40,54),{load:.9,thin:.6});
for(const x of [418,434,450])BL([[x,620],[x+R(-4,4),692]],R(24,32));
