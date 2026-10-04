// SKY, CLOUD MASS, FAR TREES, HILLS, MEADOW: all wet into wet, then dry
const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.88,1.12)]);
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1.0,thin:.55},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function xs(poly,y){const r=[];for(let i=0;i<poly.length;i++){const [x1,y1]=poly[i],[x2,y2]=poly[(i+1)%poly.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))r.push(x1+(y-y1)/(y2-y1)*(x2-x1));}return r.sort((a,b)=>a-b);}
function inside(poly,x,y){const r=xs(poly,y);for(let i=0;i+1<r.length;i+=2)if(x>=r[i]&&x<=r[i+1])return true;return false;}
function arc(x,y,len,ang,bend){const n=5,pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*bend*(t*t-.1),y+Math.sin(ang)*len*t+Math.cos(ang)*bend*(t*t-.1)]);}return pts;}
// ---- sky: cool blue above, pale warm toward the horizon
function skyCol(y){const t=Math.max(0,Math.min(1,y/380));
 return M([['titanium_white',3+t*1.6],['cobalt_blue',(1-t)*.5+.03],['ultramarine',(1-t)*.12],['burnt_umber',.07+(1-t)*.03],['alizarin_crimson',.05+t*(1-t)*.5],['naples_yellow',t*t*.55],['cadmium_orange',t*t*.1]]);}
for(let row=0;row<8;row++){const y=row*52-10;for(let i=0;i<5;i++){const x=-80+i*232+R(-40,40);
  F(arc(x,y+R(-10,10),R(260,420),R(-.2,.2)+(row%2?.1:-.08),R(-5,5)),skyCol(y),R(90,120),{thin:.5});}}
for(let i=0;i<32;i++){const x=R(-40,1040),y=R(0,360);BL(arc(x,y,R(180,320),R(-.35,.35),0),R(90,130));}
for(let i=0;i<10;i++){const x=R(0,1000),y=R(20,340);BL(arc(x,y,R(200,340),R(.15,.4)*(i%2?1:-1),0),R(100,130));}
// ---- cloud: one mass. warm cream top right, cool grey-violet underside, soft edges
const CP=[[470,216],[482,192],[520,172],[560,160],[600,128],[650,112],[700,100],[745,112],[790,128],[830,142],[880,166],[935,186],[962,206],[930,226],[800,236],[650,240],[520,234]];
const CB=[470,100,965,240];
const cLit=(x,y)=>(x-715)/250*.6-(y-170)/70*.8;
const cc=l=>l>.25?M([['titanium_white',3.8],['naples_yellow',.28],['yellow_ochre',.05],['alizarin_crimson',.01]]):
  l>-.1?M([['titanium_white',3.6],['ultramarine',.08],['naples_yellow',.2]]):
  M([['titanium_white',2.7],['ultramarine',.2],['cobalt_violet',.05],['burnt_umber',.08],['naples_yellow',.06]]);
for(let k=0,t=0;k<36&&t<4000;t++){const x=R(CB[0],CB[2]),y=R(CB[1],CB[3]);if(!inside(CP,x,y))continue;k++;
  const l=cLit(x,y)+R(-.3,.3);const a=R(-.3,.2),len=R(60,110);
  F(arc(x,y,len,a,R(-3,3)),cc(l),R(36,56),{load:.85,thin:.65});}
// underside: a flat shadowed plane
F([[500,226],[600,232],[700,230],[820,228],[920,222]],M([['titanium_white',2.5],['ultramarine',.22],['cobalt_violet',.06],['burnt_umber',.1]]),24,{load:.8,thin:.6});
// blend: swirl across the body, along the lower edge, and outward at the top
for(let i=0;i<34;i++){const x=R(500,930),y=R(120,228);BL(arc(x,y,R(70,120),R(-.45,.45),0),R(34,46));}
for(let i=0;i<7;i++){const x=R(490,900);BL([[x,226],[x+R(80,160),228]],R(26,34));}
for(let i=0;i<9;i++){const x=R(520,940),y=R(112,190);BL([[x,y+14],[x+R(-8,8),y-14]],R(22,30));}
for(let i=0;i<6;i++){const x=R(500,900);BL([[x,228],[x+R(-10,10),256]],R(30,40));}
// ---- hills, pale and cool
const hill=()=>M([['titanium_white',3],['ultramarine',.3],['alizarin_crimson',.05],['burnt_umber',.1],['naples_yellow',.3]]);
F([[-20,376],[120,366],[260,360],[400,368]],hill(),48,{load:1.05});
F([[380,370],[520,360],[640,354],[780,361]],hill(),46,{load:1.05});
F([[760,363],[880,358],[1020,367]],hill(),46,{load:1.05});
// ---- far tree: an irregular soft blue-grey mass, darker base, lighter sunlit top, scrubbed wet into the sky
const FP=[[778,392],[782,366],[796,346],[806,322],[826,310],[838,284],[864,288],[874,310],[894,318],[902,340],[916,360],[914,392]];
const FDK=()=>M([['titanium_white',3.3],['ultramarine',.3],['cobalt_blue',.1],['cadmium_yellow',.05],['burnt_umber',.12],['alizarin_crimson',.04]]);
const FLT=()=>M([['titanium_white',4],['ultramarine',.2],['cobalt_blue',.1],['naples_yellow',.12],['burnt_umber',.05]]);
for(let k=0,t=0;k<80&&t<4000;t++){const x=R(776,918),y=R(282,392);if(!inside(FP,x,y))continue;k++;const a=R(-1.3,1.3),L=R(26,50);
  const lit=(x-860)/70*.6-(y-340)/55*.8+R(-.3,.3);const c=lit>.2?FLT():FDK();
  F([[x-Math.cos(a)*L/2,y-Math.sin(a)*L/2],[x+Math.cos(a)*L/2,y+Math.sin(a)*L/2]],c,R(18,32),{load:.65,thin:.92});}
for(let i=0;i<10;i++){const x=R(790,900),y=R(296,380);const a=R(-1.2,1.2);BL([[x,y],[x+Math.cos(a)*34,y+Math.sin(a)*34]],R(16,24));}
F([[770,391],[840,388],[930,392]],FDK(),22,{thin:.6});
BL([[760,386],[950,386]],24);
// ---- meadow: a sunlit band across the middle, cooler/paler in the distance, richer toward the pond
const mead=t=>M([['cadmium_yellow',.07+t*.12],['ultramarine',.2-t*.06],['yellow_ochre',.14+t*.14],['titanium_white',2.1-t*.8],['burnt_umber',.08+t*.1],['alizarin_crimson',.04],['sap_green',.1+t*.1]]);
for(const [y0,y1,sz,n] of [[390,404,26,22],[406,424,30,24],[426,448,32,24],[450,474,32,24]]){const t=(y0-388)/90;
  for(let i=0;i<n;i++){const x=R(-60,1000),y=R(y0,y1);const a=R(-.3,.3);const len=R(60,140);
   F([[x,y],[x+Math.cos(a)*len/2,y+Math.sin(a)*len/2+R(-3,3)],[x+Math.cos(a)*len,y+Math.sin(a)*len]],mead(Math.max(0,Math.min(1,t+R(-.2,.2)))),R(sz-6,sz+4),{load:.9,thin:.6});}}
for(let i=0;i<5;i++){const x=R(-40,900),y=R(392,470);BL([[x,y],[x+R(80,140),y+R(-6,6)]],R(24,32));}
// sunlit band: broken warm strokes at varied angles
const warm=()=>M([['yellow_ochre',.22],['naples_yellow',.3],['titanium_white',1.7],['sap_green',.2],['ultramarine',.06],['burnt_umber',.07]]);
for(let i=0;i<16;i++){const x=R(430,980),y=R(398,470);const a=R(-.55,.5);const len=R(24,50);F([[x,y],[x+Math.cos(a)*len,y+Math.sin(a)*len]],warm(),R(8,13),{load:.85,thin:.55});}
// cool shadow patches under and beside the trees
const cl=()=>M([['ultramarine',.25],['sap_green',.25],['burnt_umber',.12],['titanium_white',1.2],['cadmium_yellow',.05]]);
for(const [x0,x1,y] of [[0,60,452],[0,40,468],[420,560,466],[430,520,474],[772,930,392],[790,900,398]])F([[x0,y],[(x0+x1)/2,y+R(-2,2)],[x1,y+R(-2,2)]],cl(),R(14,22),{load:.85,thin:.6});
for(let i=0;i<4;i++){const x=R(430,900),y=R(400,470);BL([[x,y],[x+R(40,90),y+R(-12,12)]],R(14,20));}
p.dry();
