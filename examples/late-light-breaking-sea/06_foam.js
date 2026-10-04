const H=p.h,S=H.S;
p.dry();
const crest=H.crest, base=H.base;
const fw=()=>[['titanium_white',6+p.rand(0,1)],['naples_yellow',.25],['burnt_umber',.03]];
const fh=()=>[['titanium_white',4],['paynes_grey',.4+p.rand(0,.2)],['burnt_umber',.2],['naples_yellow',.2]];
const fs=()=>[['titanium_white',2.6],['paynes_grey',.8],['burnt_umber',.3],['cerulean',.12]];
H.veil=(cx,cy,rx,ry,n,colf,size,ang,o={})=>{
  for(let i=0;i<n;i++){
    const u=(p.random()+p.random())-1, v=(p.random()+p.random())-1;
    const x=cx+u*rx, y=cy+v*ry; const a=ang+p.rand(-.3,.3)+(o.curve?u*o.curve:0); const L=p.rand(o.l0||50,o.l1||130);
    const c=Math.cos(a),s=Math.sin(a);
    S({points:[[x-c*L/2,y-s*L/2,.3],[x+p.rand(-4,4),y+p.rand(-6,6),.8],[x+c*L/2,y+s*L/2,.3]],color:colf(),size:size*p.rand(.7,1.3),brush:'filbert',load:o.load||1,opacity:(o.op||.3)*.85,thin:o.thin||.45});
  }
};
// scumble cloud: low-load broken marks inside an ellipse, flicked in direction ang
H.scum=(cx,cy,rx,ry,n,colf,smin,smax,ang,o={})=>{
  for(let i=0;i<n;i++){const u=(p.random()+p.random()+p.random())/3*2-1,v=(p.random()+p.random()+p.random())/3*2-1;
    const x=cx+u*rx,y=cy+v*ry;const a=ang+p.rand(-.6,.6);const L=p.rand(o.l0||22,o.l1||70);const c=Math.cos(a),s=Math.sin(a);
    S({points:[[x-c*L/2,y-s*L/2,.25],[x+p.rand(-3,3),y+p.rand(-3,3),.7],[x+c*L/2,y+s*L/2,.2]],color:colf(),size:p.rand(smin,smax),brush:'filbert',load:(o.load||.4)*.95,thin:.25});}
};
// ---- the lip: foam rides the outer edge of the curl, broken and thinner toward its tip
const lip=[[398,331],[350,324],[298,334],[255,359],[230,394],[218,428]];
for(let i=0;i<lip.length-1;i++){const a=lip[i],b=lip[i+1];
  H.veil((a[0]+b[0])/2,(a[1]+b[1])/2-4,18,12,5,fw,14,Math.atan2(b[1]-a[1],b[0]-a[0]),{op:.38,l0:26,l1:60});}
// thick foam at the break where the lip lands, left
H.veil(212,432,22,20,7,fw,16,1.3,{op:.35,l0:30,l1:70});
H.veil(190,458,36,12,7,fw,14,.5,{op:.3,l0:40,l1:90});
// ---- foam thrown up in a soft irregular cloud above the break, drifting right-to-left on the wind
H.scum(305,302,115,30,60,fw,9,20,-.3,{load:.38});
H.scum(250,322,55,24,26,fh,8,16,-.8,{load:.35});
H.scum(420,318,60,16,22,fw,10,20,-.15,{load:.35});
H.scum(185,385,40,34,14,fw,8,14,-.9,{load:.4});
// soften it: blender flicks following the throw
for(let i=0;i<9;i++){const x=p.rand(190,430),y=p.rand(285,335);
  S({points:[[x,y,.6],[x-p.rand(20,50),y-p.rand(0,14),.7],[x-p.rand(50,90),y-p.rand(-6,12),.3]],brush:'filbert',size:p.rand(14,24),load:0,color:'titanium_white'});}
// ---- shoulder: translucent unbroken, only a thin soft foam line, patchy, lower
for(let x=470;x<990;x+=p.rand(110,200)){const yc=H.at(crest,x)-1;const sl=(H.at(crest,x+30)-H.at(crest,x-30))/60;
  H.veil(x,yc,18,2,4,fw,6,Math.atan(sl),{op:.3,l0:20,l1:50});}
// ---- foam sliding down the face: broad translucent veils, steep and bowing, fading out
for(const [x,len] of [[205,90],[255,60],[640,26]]){const y0=H.at(crest,x)+20;
  H.veil(x-len*.15,y0+len*.5,18,len*.55,10,fw,28,1.9,{op:.2,l0:len*.5,l1:len*1.1,thin:.65});}
H.veil(210,470,50,24,8,fh,22,1.5,{op:.22,l0:40,l1:90,thin:.6});
// ---- base foam: ragged masses, greyer underside
let bx=100;
while(bx<940){const w=p.rand(70,210);const cy=H.at(base,bx)+p.rand(-10,12);
  H.veil(bx+w/2,cy+8,w/2,10,10,fs,24,p.rand(-.06,.06),{op:.28,l0:50,l1:130});
  H.veil(bx+w/2,cy-2,w/2,10,12,fh,22,p.rand(-.06,.06),{op:.35,l0:50,l1:120});
  H.veil(bx+w/2,cy-6,w*.42,8,12,fw,18,p.rand(-.08,.08),{op:.5,l0:40,l1:110});
  if(p.random()<.6)H.veil(bx+w/2,cy-10,w*.25,5,7,fw,12,p.rand(-.1,.1),{op:.6,l0:30,l1:70});
  bx+=w*p.rand(.55,.95)+(p.random()<.25?p.rand(20,50):0);}
// few crisp thick lights: the lip tip, the break, two on the base foam
for(const [x,y,L,s,a] of [[372,327,40,7,-.15],[560,525,30,6,0]]){
  const c=Math.cos(a),sn=Math.sin(a);
  S({points:[[x,y,.2],[x+c*L/2,y+sn*L/2,.8],[x+c*L,y+sn*L,.2]],color:fw(),size:s,brush:'filbert',load:1.3,thin:.1});}
