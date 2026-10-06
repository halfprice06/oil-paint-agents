// 43: tower spires raised into slender ogees (apex 395 / 445), the lantern's little spire; shaded as cones with a melted turn
p.wipe();
const TAB=[[0,0],[.085,.042],[.19,.092],[.31,.15],[.44,.233],[.615,.458],[.75,.65],[.85,.825],[.94,.95],[1,1]];
const prof=t=>{t=clamp(t,0,1);for(let i=0;i<TAB.length-1;i++){if(t<=TAB[i+1][0]){const s=(t-TAB[i][0])/(TAB[i+1][0]-TAB[i][0]);return lerp(TAB[i][1],TAB[i+1][1],s*s*(3-2*s)*.5+s*.5);}}return 1;};
const SP_L=()=>M([['titanium_white',2.7],['cerulean',1],['viridian',.28],['naples_yellow',.14]],.22);
const SP_H=()=>M([['titanium_white',1.5],['cerulean',.9],['cobalt_blue',.45],['viridian',.22]],.22);
const SP_B=()=>M([['titanium_white',1.1],['cerulean',.55],['cobalt_blue',.7],['ultramarine',.3]],.25);
const SP_T=()=>M([['titanium_white',.7],['cobalt_blue',.7],['ultramarine',.7]],.2);
const SP_C=()=>M([['ultramarine',1.3],['cobalt_blue',.3],['titanium_white',.4],['dioxazine_purple',.12]],.2);
const SP_R=()=>M([['ultramarine',.8],['cobalt_violet',.4],['titanium_white',.9]],.2);
function zone(u){u+=R(-.05,.05);
 if(u<-.92)return{c:SP_H(),o:{load:1,thin:.4}};
 if(u<-.1)return{c:SP_L(),o:{load:1.3,thin:.3,clean:true}};
 if(u<.2)return{c:SP_H(),o:{load:1.1,thin:.38}};
 if(u<.42)return{c:SP_B(),o:{load:1,thin:.4}};
 if(u<.58)return{c:SP_T(),o:{load:.9,thin:.45}};
 if(u<.88)return{c:SP_C(),o:{load:.8,thin:.55}};
 return{c:SP_R(),o:{load:.85,thin:.5}};}
function spire(cx,apexY,baseY,r,ry,n){
 const W=y=>r*prof((y-apexY)/(baseY-apexY));const rimY=u=>baseY+ry*Math.sqrt(Math.max(0,1-u*u));
 const items=[];for(let i=0;i<n;i++){const yc=R(apexY+8,baseY+4);items.push([R(-1,1),yc,R(14,46)*(yc<apexY+(baseY-apexY)*.35?.5:1)]);}items.sort((a,b)=>b[0]-a[0]);
 for(const [u,yc,len] of items){const ya=Math.max(apexY+3,yc-len/2),yb=Math.min(rimY(u)-1,yc+len/2);if(yb-ya<5)continue;
  const pts=[];for(let i=0;i<4;i++){const y=lerp(ya,yb,i/3);pts.push([cx+u*W(y)+R(-.6,.6),y,pr(i,4)]);}
  const z=zone(u);L(pts,z.c,clamp(W(yc)*.2,2.5,10)*R(.8,1.2),Object.assign({edge:R(0,.2),taper:R(0,.2)},z.o));}
 for(let k=0;k<6;k++){const u=(k<3?.35:.55)+R(-.07,.07);const pts=[];for(let i=0;i<4;i++){const y=lerp(apexY+(baseY-apexY)*.3,baseY,i/3);pts.push([cx+u*W(y),y]);}SB(pts,R(10,16)*(r/52),.5);}
 for(let k=0;k<2;k++){const u=-.15+R(-.1,.1);const pts=[];for(let i=0;i<4;i++){const y=lerp(apexY+(baseY-apexY)*.3,baseY,i/3);pts.push([cx+u*W(y),y]);}SB(pts,R(8,12)*(r/52),.3);}
}
spire(1232,395,560,52,12,340);
spire(1772,445,600,52,12,320);
spire(1878,540,600,20,5,100);
p.dry();
