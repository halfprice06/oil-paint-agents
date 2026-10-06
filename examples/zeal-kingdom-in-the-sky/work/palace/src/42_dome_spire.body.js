// 42: the great spire: a slender ogee (waist ~110 px wide at y 400, swelling to the drum rim at y 500), tiled blue-green,
// lit left face warm turquoise, right face deep ultramarine, the turn melted; one crisp highlight ridge comes in pass 47
p.wipe();
const CX=1490,TIP=240,BY=500,RY=26,RB=120;
const TAB=[[240,0],[262,5],[290,11],[320,18],[355,28],[400,55],[435,78],[462,99],[484,114],[500,120]];
const W=y=>{if(y<=TAB[0][0])return 0;for(let i=0;i<TAB.length-1;i++){if(y<=TAB[i+1][0]){const t=(y-TAB[i][0])/(TAB[i+1][0]-TAB[i][0]);return lerp(TAB[i][1],TAB[i+1][1],t*t*(3-2*t)*.5+t*.5);}}return RB;};
const rimY=u=>BY+RY*Math.sqrt(Math.max(0,1-u*u));
// (the sky patch over the block-in's old dome was removed in round 5: the block-in is now a thin wash and the sky painter covers it)
const SP_L=()=>M([['titanium_white',2.7],['cerulean',1],['viridian',.28],['naples_yellow',.14]],.22);
const SP_LT=()=>M([['titanium_white',2.9],['cerulean',.8],['viridian',.2],['naples_yellow',.25]],.2);
const SP_H=()=>M([['titanium_white',1.5],['cerulean',.9],['cobalt_blue',.45],['viridian',.22]],.22);
const SP_B=()=>M([['titanium_white',1.1],['cerulean',.55],['cobalt_blue',.7],['ultramarine',.3],['viridian',.1]],.25);
const SP_T=()=>M([['titanium_white',.7],['cobalt_blue',.7],['ultramarine',.7],['viridian',.08]],.2);
const SP_C=()=>M([['ultramarine',1.3],['cobalt_blue',.3],['titanium_white',.4],['dioxazine_purple',.12]],.2);
const SP_R=()=>M([['ultramarine',.8],['cobalt_violet',.4],['titanium_white',.9]],.2);
function zone(u,y){u+=R(-.05,.05);const nearTip=y<330;
 if(u<-.92)return{c:SP_H(),o:{load:1,thin:.4}};
 if(u<-.1)return{c:nearTip?SP_LT():(y>455&&p.random()<.4?SP_H():SP_L()),o:{load:1.3,thin:.3,clean:true}};
 if(u<.2)return{c:SP_H(),o:{load:1.1,thin:.38}};
 if(u<.42)return{c:SP_B(),o:{load:1,thin:.4}};
 if(u<.58)return{c:SP_T(),o:{load:.9,thin:.45}};
 if(u<.88)return{c:SP_C(),o:{load:.8,thin:.55}};
 return{c:SP_R(),o:{load:.85,thin:.5}};}
function merid(u,ya,yb,size,o){const n=5,pts=[];for(let i=0;i<n;i++){const y=lerp(ya,yb,i/(n-1));pts.push([CX+u*W(y)+R(-.8,.8),Math.min(y,rimY(u)-2),pr(i,n)]);}
 const z=zone(u,(ya+yb)/2);L(pts,z.c,size,Object.assign({edge:R(0,.2),taper:R(0,.25),brush:p.random()<.3?'flat':'filbert'},z.o,o||{}));}
const items=[];
for(let i=0;i<820;i++){const u=R(-1,1);const yc=R(255,520);const len=R(20,70)*(yc<340?.45:1);items.push([u,yc,len]);}
items.sort((a,b)=>b[0]-a[0]);
for(const [u,yc,len] of items){const ya=Math.max(TIP+6,yc-len/2),yb=Math.min(rimY(u)-1,yc+len/2);if(yb-ya<6)continue;
 const w=W(yc);const size=clamp(w*.15,3.5,16)*R(.8,1.25);merid(u,ya,yb,size);}
// the narrow upper shaft: thin strokes up to the tip
for(let i=0;i<40;i++){const u=R(-.95,.95);const ya=R(244,300),yb=ya+R(14,40);merid(u,ya,yb,R(3,5));}
// melt the turn along the surface (three bands), then the reflected edge and the lit edge a little
for(let k=0;k<14;k++){const u=(k<5?.3:(k<10?.48:.64))+R(-.07,.07);const pts=[];for(let i=0;i<5;i++){const y=lerp(300,500,i/4);pts.push([CX+u*W(y),y]);}SB(pts,R(22,38)*(k<5?.8:1),.55);}
for(let k=0;k<3;k++){const u=.9+R(-.04,.04);const pts=[];for(let i=0;i<4;i++){const y=lerp(360,500,i/3);pts.push([CX+u*W(y),y]);}SB(pts,R(10,14),.4);}
for(let k=0;k<3;k++){const u=-.15+R(-.1,.1);const pts=[];for(let i=0;i<4;i++){const y=lerp(320,500,i/3);pts.push([CX+u*W(y),y]);}SB(pts,R(16,24),.3);}
// a few warm reflected touches low on the shadow side (the plateau and clouds light it)
for(let i=0;i<5;i++){const u=R(.72,.95),y=R(445,498);merid(u,y-R(10,18),y+R(4,8),R(5,8),{color:M([['ultramarine',.7],['cobalt_violet',.5],['naples_yellow',.15],['titanium_white',.6]],.2),load:.85,thin:.5,clean:false,edge:.4});}
p.dry();
