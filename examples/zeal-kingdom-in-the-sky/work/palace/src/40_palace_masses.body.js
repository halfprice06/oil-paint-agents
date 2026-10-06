// 40: palace masses (round 3: taller drum, lantern behind the right tower, domed pavilion). Shadow first, halftone, thick light, melted turns.
p.wipe();
const CR_L=()=>M([['titanium_white',3],['naples_yellow',.8],['yellow_ochre',.12]],.2);
const CR_E=()=>M([['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.1]],.2);
const CR_H=()=>M([['titanium_white',3],['naples_yellow',.45],['cobalt_violet',.22],['yellow_ochre',.06]],.2);
const CR_T=()=>M([['titanium_white',1.6],['cobalt_violet',.5],['ultramarine',.45],['naples_yellow',.1]],.2);
const CR_C=()=>M([['titanium_white',1.1],['ultramarine',.7],['cobalt_violet',.6],['raw_umber',.2]],.2);
const CR_R=()=>M([['titanium_white',1.6],['cobalt_violet',.45],['naples_yellow',.35],['ultramarine',.3]],.2);
const GR_L=()=>M([['titanium_white',2.6],['raw_umber',.25],['naples_yellow',.5],['cobalt_violet',.2]],.2);
const GR_C=()=>M([['titanium_white',1.3],['ultramarine',.5],['cobalt_violet',.5],['raw_umber',.25]],.2);
function zone(u,term,pal){pal=pal||{};const Lc=pal.L||CR_L,Ec=pal.E||CR_E,Hc=pal.H||CR_H,Tc=pal.T||CR_T,Cc=pal.C||CR_C,Rc=pal.R||CR_R;
 u+=R(-.05,.05);
 if(u<-.86)return{c:Ec(),o:{load:1.1,thin:.35}};
 if(u<term-.55)return{c:Lc(),o:{load:1.3,thin:.28,clean:true}};
 if(u<term-.12)return{c:Hc(),o:{load:1.1,thin:.35}};
 if(u<term+.08)return{c:Tc(),o:{load:.9,thin:.45}};
 if(u<.86)return{c:Cc(),o:{load:.8,thin:.55}};
 return{c:Rc(),o:{load:.85,thin:.5}};}
function patch(poly,size,n,fn,angf,ang,lenf){const [x0,y0,x1,y1]=bbox(poly);const pts=[];let g=0;
 while(pts.length<n&&g++<n*60){const x=R(x0,x1),y=R(y0,y1);if(inPoly(poly,x,y))pts.push([x,y]);}
 pts.sort((a,b)=>b[0]-a[0]);
 for(const [x,y] of pts){const a=angf(x,y)+R(-1,1)*ang;const sz=size*R(.7,1.3);let L=sz*lenf*R(.6,1.4);
  const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  const z=fn(x,y);S(x,y,L,a,z.c,sz,Object.assign({brush:p.random()<.3?'flat':'filbert',edge:R(0,.25),taper:R(0,.2)},z.o));}}
const VERT=()=>Math.PI/2;
const LD={cx:1490,r:190,cy:600,ry:36,bot:765},UD={cx:1490,r:120,cy:500,ry:26,bot:605};
const rim=(d,x)=>{const u=clamp((x-d.cx)/d.r,-1,1);return d.cy+d.ry*Math.sqrt(1-u*u);};
const wallPoly=(d,x0,x1)=>{const P=[];for(let i=0;i<=16;i++){const x=lerp(x0,x1,i/16);P.push([x,rim(d,x)]);}P.push([x1,d.bot],[x0,d.bot]);return P;};
function melt(d,x0,x1,term,n,size,op){for(let k=0;k<n;k++){const x=d.cx+d.r*(term+R(-.08,.08));SB([[x+R(-5,5),rim(d,x)+8],[x,(rim(d,x)+d.bot)/2+R(-15,15)],[x+R(-5,5),d.bot-6]],size*R(.85,1.15),op);}}
// ---- LANTERN TOWER behind the right tower (painted first: it is behind) ----
const LT={cx:1878,r:20};
patch(RECT(1858,600,1898,700),7,130,(x,y)=>zone((x-LT.cx)/LT.r,.4),VERT,.15,2.6);
for(let k=0;k<2;k++)SB([[1886,606],[1886,694]],12,.45);
// ---- LOWER DRUM wall ----
const ldW=wallPoly(LD,1300,1680);
patch(ldW,12,1500,(x,y)=>zone((x-LD.cx)/LD.r,.42),VERT,.2,2.6);
for(let i=0;i<16;i++){const u=R(-.95,.95);const a0=Math.acos(u);const z=zone(u,.42);earc(LD.cx,LD.cy+7,LD.r-4,LD.ry,a0,a0+R(.1,.22),z.c,R(8,13),Object.assign({},z.o));}
// warm reflected light low on the shadow side (plateau and cloud light), laid wet before the melts
for(let i=0;i<70;i++){const u=R(.55,.97),x=LD.cx+u*LD.r;const y=R(700,760);S(x,y,R(16,34),Math.PI/2+R(-.25,.25),M([['titanium_white',1.7],['cobalt_violet',.45],['naples_yellow',.5],['yellow_ochre',.1],['ultramarine',.22]],.2),R(7,11),{load:.9,thin:.45,edge:.35,taper:[.15,.3]});}
for(const uu of [-.2,.05,.25])melt(LD,0,0,uu,3,34,.35);
melt(LD,0,0,.34,4,48,.45);melt(LD,0,0,.42,6,44,.5);melt(LD,0,0,.52,4,40,.5);melt(LD,0,0,.64,3,30,.4);
for(let k=0;k<4;k++)SB([[LD.cx+LD.r*.5+R(-10,10),R(700,730)],[LD.cx+LD.r*.95,R(735,760)]],R(20,28),.35);
for(let k=0;k<3;k++){const x=LD.cx+LD.r*(.88+R(-.04,.04));SB([[x,rim(LD,x)+10],[x+R(-4,4),LD.bot-8]],R(18,24),.4);}
for(let k=0;k<2;k++){const x=LD.cx-LD.r*(.88+R(-.04,.04));SB([[x,rim(LD,x)+10],[x+R(-4,4),LD.bot-8]],R(16,22),.35);}
// ---- TERRACE ----
const TER=(()=>{const P=[];for(let i=0;i<=20;i++){const x=lerp(1300,1680,i/20);P.push([x,rim(LD,x)]);}
 const back=x=>{const u=clamp((x-LD.cx)/LD.r,-1,1);return LD.cy-LD.ry*Math.sqrt(1-u*u);};
 for(let i=0;i<=4;i++){const x=lerp(1680,1612,i/4);P.push([x,back(x)]);}P.push([1612,UD.bot],[1368,UD.bot]);
 for(let i=0;i<=4;i++){const x=lerp(1368,1300,i/4);P.push([x,back(x)]);}return P;})();
const TER_L=()=>M([['titanium_white',3],['naples_yellow',.55],['cobalt_violet',.14],['yellow_ochre',.06]],.2);
const TER_S=()=>M([['titanium_white',1.5],['ultramarine',.55],['cobalt_violet',.55],['naples_yellow',.1]],.2);
const terShadow=[[1545,598],[1612,602],[1680,608],[1676,626],[1640,636],[1585,634],[1548,624]];
patch(TER,10,560,(x,y)=>inPoly(terShadow,x,y)?{c:TER_S(),o:{load:.8,thin:.55}}:(x>1600&&y>615?{c:CR_H(),o:{load:1,thin:.4}}:{c:TER_L(),o:{load:1.2,thin:.32,clean:true}}),(x,y)=>(x<LD.cx?-.16:.16),.18,2.8);
for(let k=0;k<3;k++)SB([[1600+R(-8,8),633],[1660,628+R(-4,4)]],R(14,20),.4);
// ---- UPPER DRUM ----
const udW=wallPoly(UD,1370,1610);
patch(udW,9,540,(x,y)=>zone((x-UD.cx)/UD.r,.4),VERT,.18,2.6);
melt(UD,0,0,.4,4,30,.5);melt(UD,0,0,.1,2,24,.3);melt(UD,0,0,.6,2,20,.4);
for(let k=0;k<2;k++){const x=UD.cx+UD.r*(.87+R(-.04,.04));SB([[x,rim(UD,x)+8],[x+R(-3,3),UD.bot-6]],R(12,16),.4);}
// ---- TOWERS ----
function tower(cx,top,bot){const r=52;const poly=RECT(cx-r,top,cx+r,bot);
 patch(poly,9,Math.round(3.5*(bot-top)),(x,y)=>zone((x-cx)/r,.4),VERT,.16,2.8);
 for(let k=0;k<4;k++){const x=cx+r*(.4+R(-.1,.1));SB([[x+R(-3,3),top+6],[x,(top+bot)/2+R(-20,20)],[x+R(-3,3),bot-4]],R(20,26),.5);}
 for(let k=0;k<2;k++){const x=cx+r*(.1+R(-.1,.1));SB([[x+R(-3,3),top+6],[x+R(-3,3),bot-4]],R(16,20),.3);}
 for(let k=0;k<2;k++){const x=cx+r*(.88+R(-.04,.04));SB([[x,top+8],[x+R(-2,2),bot-6]],R(10,14),.4);}
 for(let k=0;k<2;k++){const x=cx-r*(.88+R(-.04,.04));SB([[x,top+8],[x+R(-2,2),bot-6]],R(9,12),.3);}}
tower(1232,560,765);
tower(1772,600,772);
// ---- LOW BUILDINGS ----
function box(x0,y0,x1,y1,xs,L,C,H,dens){const front=RECT(x0,y0,xs,y1),end=RECT(xs,y0,x1,y1);
 patch(end,10,Math.round(40*dens),(x,y)=>({c:C(),o:{load:.8,thin:.55}}),VERT,.15,2.2);
 patch(front,11,Math.round(150*dens),(x,y)=>(y<y0+12?{c:H(),o:{load:1.1,thin:.35}}:{c:L(),o:{load:1.2,thin:.32,clean:true}}),()=>0,.12,2.8);
 for(let k=0;k<2;k++)SB([[xs+R(-4,4),y0+6],[xs+R(-4,4),y1-6]],R(12,16),.35);}
box(960,700,1160,770,1118,CR_L,CR_C,CR_H,1);
// right pavilion: duller stone, lower contrast, its right half sinking into shadow
box(1880,690,2050,760,1985,GR_L,GR_C,()=>M([['titanium_white',2.4],['raw_umber',.25],['naples_yellow',.45],['cobalt_violet',.15]],.2),.9);
for(let k=0;k<3;k++)SB([[1985+R(-10,10),696],[1985+R(-10,10),754]],R(22,30),.45);
// small dome on the left pavilion: a half sphere, lit upper left, in blue-green like the roofs
const DM={cx:1062,cy:702,r:40};
const dpoly=[];for(let i=0;i<=16;i++){const a=Math.PI+Math.PI*i/16;dpoly.push([DM.cx+Math.cos(a)*DM.r,DM.cy+Math.sin(a)*DM.r*.9]);}
patch(dpoly,7,120,(x,y)=>{const u=(x-DM.cx)/DM.r,v=(y-DM.cy)/DM.r;const l=-(u*.62+v*.78)+R(-.1,.1);
 return l>.45?{c:M([['titanium_white',2.6],['cerulean',.9],['viridian',.25],['naples_yellow',.12]],.2),o:{load:1.3,thin:.3,clean:true}}:(l>0?{c:M([['titanium_white',1.5],['cerulean',.8],['cobalt_blue',.5],['viridian',.2]],.2),o:{load:1.1,thin:.4}}:{c:M([['ultramarine',1.2],['cobalt_blue',.3],['titanium_white',.5]],.2),o:{load:.8,thin:.55}});},
 (x,y)=>Math.atan2(y-DM.cy,x-DM.cx)+Math.PI/2,.25,2.4);
for(let k=0;k<3;k++)SB([[DM.cx+R(0,12),DM.cy-DM.r*.85],[DM.cx+DM.r*.55+R(-4,4),DM.cy-DM.r*.5],[DM.cx+DM.r*.9,DM.cy-4]],R(12,16),.5);
p.dry();
