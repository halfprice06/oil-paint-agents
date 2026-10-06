// 21: recession: tiny thin pink far rows at the horizon (8-18 px strokes, melted), then the middle deck as flat horizontal drifts of thin cloud, tops warm toward the sun at left.
p.wipe();
const W=2400;
// far rows: many tiny strokes, pink-cream over a thin violet underside
const rows=[[200,1006,260,7],[620,1012,300,8],[1050,1004,240,6],[1500,1013,330,9],[1950,1006,260,7],[2300,1012,220,8],[-60,1018,200,6],[850,1026,160,5],[1250,1030,200,5],[1750,1028,190,5],[2150,1032,160,5],[420,1038,180,5],[1400,1042,220,5],[2000,1045,160,4]];
for(const r of rows){const [cx,cy,rx,ry]=r;const far=cy<1016;const w=clamp(1-cx/1800,0,1);
  for(let i=0;i<Math.round(rx/25);i++)S(cx+R(-rx,rx),cy+ry*R(.8,1.8),R(40,90),R(-.02,.02),CL.pinkgrey(),R(8,14),{brush:'flat',load:.8,thin:.65,edge:.5,taper:[.2,.2],opacity:.8});
  for(let i=0;i<Math.round(rx/13);i++){const x=cx+R(-rx,rx),y=cy+R(-ry,ry);S(x,y,R(30,80),R(-.02,.02),far?CL.haze():CL.pinkgrey(),R(8,16),{brush:'flat',load:R(.8,.95),thin:.5,edge:.5,taper:[.2,.25],stir:.5,opacity:far?.95:.85});}
  for(let i=0;i<Math.round(rx/22);i++)S(cx-rx*R(-.4,.8),cy-ry*R(0,.8),R(40,90),R(-.015,.015),CL.lit(.3+.5*w),R(8,15),{brush:'flat',load:1,thin:.45,edge:.4,taper:[.25,.3],stir:.4});
  BL([[cx-rx,cy+ry*1.5],[cx,cy+ry*2],[cx+rx,cy+ry*1.6]],ry*3.5,.5);BL([[cx-rx,cy-ry*1.4],[cx,cy-ry*1.8],[cx+rx,cy-ry*1.3]],ry*3,.4);
}
blendPoly(RECT(0,995,W,1060),40,.45,0,80);
// middle deck: flat horizontal drifts of thin cloud, each a long low lens: violet underside, pale body, warm lit top edge toward the sun
const drifts=[[300,1125,420,16,1],[1000,1150,380,15,.6],[1500,1180,450,18,1],[2050,1135,360,14,.6],[2330,1190,300,13,1]];
for(const d of drifts){const [cx,cy,rx,ry,vis]=d;const w=clamp(1-cx/1900,0,1),dim=ISL(cx,cy);const lost=vis<1;
  const und=()=>{const c=CL.shad();if(dim)c.push(['ultramarine',dim*.1]);return c;};
  for(let i=0;i<Math.round(rx/32);i++)S(cx+R(-rx,rx),cy+ry*R(.3,1.3),R(200,420),R(-.012,.012),und(),R(14,24),{brush:'flat',load:.8,thin:.65,edge:.5,taper:[.2,.2],opacity:lost?.45:.7,stir:.7});
  for(let i=0;i<Math.round(rx/20);i++){const x=cx+R(-rx,rx),y=cy+R(-ry*.6,ry*.5);const c=p.random()<.6?CL.half():CL.halfD();if(dim)c.push(['ultramarine',dim*.1],['cobalt_violet',dim*.1]);S(x,y,R(220,460),R(-.015,.015),c,R(16,30),{brush:'flat',load:R(.85,1),thin:.5,edge:.45,taper:[.2,.25],stir:.45,opacity:lost?.6:1});}
  for(let i=0;i<Math.round(rx/40*(0.6+w));i++){const x=cx-rx*R(-.6,.9),y=cy-ry*R(.3,1.1);const c=CL.lit(.3+.6*w);if(dim)c.push(['cobalt_violet',dim*.1]);S(x,y,R(160,340),R(-.015,.015),c,R(16,32),{brush:'flat',load:1.15,thin:.38,edge:.3,taper:[.2,.25],stir:.5,opacity:lost?.6:1});}
  BL([[cx-rx,cy+ry*1.6],[cx,cy+ry*2],[cx+rx,cy+ry*1.6]],ry*3,.5);BL([[cx-rx,cy-ry*1.2],[cx,cy-ry*1.5],[cx+rx,cy-ry*1.1]],ry*2.5,.35);
  for(let i=0;i<3;i++)BL(seg(cx+R(-rx,rx),cy,ry*R(3,5),R(-.1,.1),0,3),ry*2.5,.4);
  // lost ends
  BL([[cx-rx*1.15,cy-ry],[cx-rx*.75,cy+ry*.5]],ry*4,.6);BL([[cx+rx*.75,cy-ry],[cx+rx*1.15,cy+ry*.5]],ry*4,.6);if(lost){for(let i=0;i<4;i++)S(cx+R(-rx,rx),cy+R(-ry,ry),R(240,420),R(-.01,.01),CL.haze(),R(30,46),{brush:'flat',load:.7,thin:.65,edge:.6,opacity:.3,taper:[.2,.2]});}
}
// a few haze veils to push the whole middle row back

