// 38_cloud_wreath (round 4): a few soft rounded puffs of cloud touching the bottom 60 px of the rock, around the stalactite tip and the two plunge points; no streaks across the faces. Over dry paint.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const CloudL=[['titanium_white',3],['naples_yellow',.6],['cobalt_violet',.2],['quinacridone_rose',.06]];
const CloudS=[['titanium_white',2.2],['cobalt_violet',.6],['ultramarine',.3],['naples_yellow',.25]];
const botY=x=>x<940?lerp(900,930,(x-880)/60):x<1000?lerp(930,1000,(x-940)/60):x<1040?1060:x<1100?lerp(1080,1060,(x-1040)/60):x<1180?lerp(1060,1150,(x-1100)/80):x<1290?lerp(1150,1230,(x-1180)/110):x<1358?lerp(1230,1306,(x-1290)/68):x<1400?lerp(1306,1250,(x-1358)/42):x<1480?lerp(1250,1180,(x-1400)/80):x<1600?lerp(1180,1262,(x-1480)/120):x<1700?lerp(1262,1150,(x-1600)/100):x<1800?lerp(1150,1122,(x-1700)/100):x<1870?lerp(1122,1062,(x-1800)/70):x<1935?lerp(1062,950,(x-1870)/65):x<2065?lerp(950,872,(x-1935)/130):lerp(872,800,(x-2065)/75);
// a puff: a cluster of short rounded soft-edged touches, lit cream on its upper left, lavender below
function puff(cx,cy,r,op){for(let i=0;i<6;i++){const a=R(0,TAU),d=R(0,1)*r;const x=cx+Math.cos(a)*d*1.3,y=cy+Math.sin(a)*d*.7;const lit=x<cx&&y<cy+r*.2;
    S(x,y,R(.9,1.5)*r,R(-.3,.3),M(lit?CloudL:CloudS,.15),R(.6,.9)*r,{load:.8,thin:.6,opacity:op*R(.8,1.2),edge:.85,taper:[.4,.4],stir:.9});}
  for(let i=0;i<3;i++)SB(seg(cx+R(-r,r),cy+R(-r*.5,r*.5),r*R(1,1.6),R(-.5,.5),0,3),Math.min(88,r*1.6),.4);}
// along the bottom edge: puffs that touch the silhouette from below, denser at the right (the island's shadow side)
for(let x=960;x<2100;x+=R(70,130)){const y=botY(x)+R(5,35);const u=clamp((x-1000)/1100,0,1);if(p.random()<.25-u*.15)continue;puff(x,y,R(18,30),R(.25,.4));}
// the stalactite tip and the two plunges
puff(1352,1300,30,.4);puff(1335,1318,24,.35);
puff(1238,1232,30,.4);puff(1296,1222,24,.35);
puff(1708,1158,28,.4);puff(1690,1172,22,.3);
puff(1028,1038,18,.35);
