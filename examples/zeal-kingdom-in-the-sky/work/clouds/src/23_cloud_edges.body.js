// 23: edges and lights: thick lemon-pink lights and a few knife touches only on the crowns nearest the viewer, strokes laid back on top after blending, lost edges at the bases.
p.wipe();
const near=[[440,1145,125,105,.75],[2070,1230,230,190,.55],[170,1225,250,95,.8]];
for(const c of near){const [cx,cy,rx,ry,w]=c;const sz=clamp(Math.sqrt(rx*ry)*.5,30,90);
  for(let i=0;i<10;i++){const a=SUNA+R(-.6,.5),ww=R(.4,.9),rr=R(.5,.95);arcOn(cx,cy,rx,ry,null,a-ww/2,a+ww/2,rr,p.random()<.4?CL.litPink():CL.lit(w),sz*R(.4,.8),{load:R(1.3,1.45),thin:.2,edge:.1,taper:[.1,.2],stir:.35,clean:i<3});}
  for(let i=0;i<3;i++){const a=SUNA+R(-.5,.3),ww=R(.2,.4),rr=R(.86,.97);const pts=[];for(let j=0;j<3;j++){const aa=lerp(a-ww/2,a+ww/2,j/2);pts.push([cx+Math.cos(aa)*rx*rr,cy+Math.sin(aa)*ry*rr,.6+.3*(j==1)]);}
    p.stroke({points:pts,color:CL.lit(w+.15),brush:'knife',size:R(10,16),load:R(1.2,1.4),taper:[.15,.35],clean:true});}
}
// lose the bases of the masses into the deck
for(const b of [[-60,1320,900,1375],[820,1430,1790,1480],[1740,1405,2440,1455]])blendPoly(RECT(b[0],b[1],b[2],b[3]),70,.5,0,Math.round((b[2]-b[0])/30));
// strokes laid back on top: halftone and cool strokes over the bellies and bodies so it reads as paint
for(const b of [[-60,1180,870,1340,.75],[900,1300,1720,1450,.5],[1820,1150,2350,1420,.5]]){const n=Math.round((b[2]-b[0])/25);
  for(let i=0;i<n;i++){const x=R(b[0],b[2]),y=R(b[1],b[3]);const u=(y-b[1])/(b[3]-b[1]);if(u>.45&&p.random()<.6)continue;const c=u<.45?CL.lit(b[4]):u<.7?CL.halfD():CL.shad();S(x,y,R(70,170),R(-.12,.12),c,R(20,36),{load:1,thin:.45,edge:.35,taper:[.2,.3],stir:.4,opacity:.9});}}
