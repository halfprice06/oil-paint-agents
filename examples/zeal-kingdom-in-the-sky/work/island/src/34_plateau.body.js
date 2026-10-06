// 34_plateau (round 2): a designed garden seen at a shallow angle. Lawn in bands of different greens following the slope (longer, more horizontal toward the back), a pale stone terrace and a broad stair at the palace front (ground only, below y 770), paths, low stone walls dividing terraces, flower beds along them, and the stream that feeds the main fall. Wet, then dry.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const plat=[[820,740],[960,690],[1150,660],[1400,645],[1650,650],[1900,670],[2100,710],[2160,760],[2050,790],[1800,815],[1500,830],[1200,825],[980,800],[860,780]];
const Gsun=[['yellow_ochre',1],['sap_green',.35],['titanium_white',2.2],['cadmium_lemon',.45],['naples_yellow',.3]];
const Glit=[['sap_green',1],['yellow_ochre',.9],['titanium_white',1.4],['cadmium_lemon',.3]];
const Gmid=[['sap_green',1],['yellow_ochre',.45],['ultramarine',.2],['titanium_white',.7]];
const Gcool=[['sap_green',1],['ultramarine',.6],['titanium_white',.7],['yellow_ochre',.25],['cobalt_violet',.15]];
const Ghalf=[['sap_green',.9],['ultramarine',.7],['burnt_umber',.25],['titanium_white',.45]];
const Gfar=[['sap_green',.8],['titanium_white',1.6],['cobalt_violet',.25],['yellow_ochre',.4]];
const Gdeep=[['sap_green',1],['viridian',.2],['burnt_umber',.3],['titanium_white',.5]];
const Stone=[['titanium_white',2.4],['naples_yellow',.5],['raw_umber',.25],['cobalt_violet',.15]];
const StoneSh=[['titanium_white',1.2],['cobalt_violet',.5],['ultramarine',.35],['raw_umber',.3]];
const Path=[['titanium_white',2],['naples_yellow',.8],['yellow_ochre',.3],['cobalt_violet',.1]];
const Wat=[['titanium_white',2.6],['cerulean',.35],['sap_green',.12],['naples_yellow',.1]];
const Wdk=[['ultramarine',.8],['sap_green',.5],['burnt_umber',.3],['titanium_white',.3]];
const lipY=x=>x<980?lerp(780,800,(x-860)/120):x<1200?lerp(800,825,(x-980)/220):x<1500?lerp(825,830,(x-1200)/300):x<1800?lerp(830,815,(x-1500)/300):x<2050?lerp(815,790,(x-1800)/250):lerp(790,760,(x-2050)/110);
const backY=x=>x<960?lerp(740,690,(x-820)/140):x<1150?lerp(690,660,(x-960)/190):x<1400?lerp(660,645,(x-1150)/250):x<1650?lerp(645,650,(x-1400)/250):x<1900?lerp(650,670,(x-1650)/250):x<2100?lerp(670,710,(x-1900)/200):lerp(710,760,(x-2100)/60);
const col=(x,y)=>{const u=clamp((x-820)/1340,0,1);const v=clamp((y-backY(x))/Math.max(20,lipY(x)-backY(x)),0,1);
  let c=u<.35?ML(Gsun,Glit,u/.35):u<.65?ML(Glit,Gmid,(u-.35)/.3):ML(Gmid,Gcool,(u-.65)/.35);
  // bands following the slope: far band pale, a mid band a touch deeper, front band warmer
  const bandv=v<.3?0:v<.62?1:2;if(bandv===0)c=ML(c,Gfar,.6);if(bandv===1)c=ML(c,Gdeep,.3);if(bandv===2)c=ML(c,u<.5?Gsun:Gmid,.35);
  if(x>1560&&x<2060&&y>745)c=ML(c,Ghalf,clamp((y-745)/50,0,1)*.65);// half-light field right of the palace
  return M(c,.18);};
// 1. lawn base: flat long strokes, longer and more horizontal toward the back
cover(plat,28,col,{dens:2.6,len:5.5,angf:(x,y)=>.02+(x-1500)/9000,angJ:.08,o:{brush:'flat',load:1.1,thin:.45,edge:.25,taper:[.08,.12],stir:.75}});
for(let i=0;i<450;i++){const x=R(830,2150),y=R(backY(x)+6,lipY(x)-8);if(!inPoly(plat,x,y))continue;const v=(y-backY(x))/Math.max(20,lipY(x)-backY(x));
  S(x,y,R(90,200)*(1.3-v*.5),R(-.05,.08)+(x-1500)/9000,col(x,y),R(14,24),{brush:'flat',load:R(.9,1.15),thin:.42,edge:.35,taper:[.15,.2],stir:.65});}
// 2. the turf turning down at the lip: darker half-tone band, melted upward
for(let x=870;x<2150;x+=R(40,70)){const y=lipY(x)-R(2,9);S(x,y,R(45,80),Math.atan2(lipY(x+40)-lipY(x-40),80)+R(-.05,.05),M(ML(Gmid,Ghalf,R(.4,.7)),.15),R(10,16),{load:.85,thin:.5,edge:.5,taper:[.3,.3],stir:.75});}
for(let x=900;x<2130;x+=R(90,140))SB(seg(x,lipY(x)-16,R(70,110),Math.atan2(lipY(x+40)-lipY(x-40),80),0,3),30,.4);
// 8. grass strokes: long thin, slight value variety, denser toward the front and the sunlit left
for(let i=0;i<2200;i++){const x=R(830,2150);const v=Math.pow(p.random(),.6);const y=lerp(backY(x)+8,lipY(x)-4,v);if(!inPoly(plat,x,y))continue;if(x>1292&&x<1690&&y>768&&y<798)continue;
  const c=ML(col(x,y),p.random()<.5?Gsun:Ghalf,R(.1,.35));
  S(x,y,R(40,120)*(1.2-v*.4),R(-.05,.07)+(x-1500)/9000,M(c,.15),R(4,9),{brush:'flat',load:R(.8,1.1),thin:.4,edge:.3,taper:[.25,.35],stir:.6});}
p.dry();
// 3. stone terrace at the palace front (ground only, y 770-796) and the broad stair (x 1430-1550, y 770-806)
fill(RECT(1292,770,1690,795),10,(x,y)=>M(ML(Stone,StoneSh,x>1600?.5:R(0,.2)),.12),{step:.85,tilt:.004,jy:1,seg:9,so:{load:1.1,thin:.4,edge:.05,clean:true}});
for(let x=1300;x<1690;x+=R(14,26))p.stroke({points:[[x,R(774,792),.6],[x+R(4,8),R(774,792),.5]],color:M(StoneSh,.15),brush:'round',size:R(2,3.5),load:.8,thin:.5,taper:[.3,.3]});// joints
for(let x=1296;x<1690;x+=R(50,90))S(x,796,R(45,80),0,M(ML(StoneSh,Wdk,.4),.15),R(5,8),{load:.8,thin:.55,edge:.4,taper:[.3,.3]});// front edge shadow line
for(let k=0;k<4;k++){const y=772+k*9;const hw=62+k*8;// risers, wider as they come forward
  p.stroke({points:[[1490-hw,y+4,.8],[1490,y+3,.95],[1490+hw,y+4,.8]],color:M(ML(Stone,[['titanium_white',3],['naples_yellow',.4]],.5),.1),brush:'flat',size:6,load:1.2,thin:.35,taper:0,edge:0,clean:k===0});
  p.stroke({points:[[1490-hw+2,y+8,.7],[1490,y+8,.9],[1490+hw-2,y+8,.7]],color:M(StoneSh,.12),brush:'round',size:2.5,load:.8,thin:.55,taper:[.1,.1]});}
S(1490,810,160,0,M(ML(StoneSh,Gmid,.5),.15),9,{load:.8,thin:.55,edge:.6,taper:[.3,.3]});// stair's shadow on the lawn
// 4. paths: from the stair base to the right terrace, and from the left field to the terrace's left end; pale, with a cool shadow edge below
function path(pts,w){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];for(let k=0;k<2;k++)p.stroke({points:[[a[0]+R(-3,3),a[1]+R(-1,1),.6],[(a[0]+b[0])/2,(a[1]+b[1])/2+R(-1,1),.9],[b[0]+R(-3,3),b[1]+R(-1,1),.5]],color:M(ML(Path,Gsun,k?.3:.05),.12),brush:'filbert',size:w*R(.8,1.1),load:1.15,thin:.4,taper:[.2,.3],edge:.3,stir:.7,clean:k===0});
  p.stroke({points:[[a[0],a[1]+w*.6,.5],[(a[0]+b[0])/2,(a[1]+b[1])/2+w*.6,.8],[b[0],b[1]+w*.6,.4]],color:M(ML(Ghalf,StoneSh,.3),.15),brush:'filbert',size:w*.45,load:.8,thin:.55,taper:[.3,.3],edge:.5});}}
path([[1500,808],[1560,811],[1630,813],[1700,814],[1780,812],[1860,809]],15);
path([[905,766],[980,752],[1060,756],[1130,770],[1190,786],[1250,796],[1292,798]],15);
// 5. low stone walls dividing the terraces: rows of small stones, lit top, shadow on the ground below right
function wall(pts,h){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    // shadow on the ground first
    S((a[0]+b[0])/2+6,(a[1]+b[1])/2+h*.9,len*1.05,ang,M(Ghalf,.15),h*.9,{load:.8,thin:.55,edge:.6,taper:[.15,.15],stir:.8});
    // the face: stones of varied length and value
    for(let d=0;d<len;){const sl=R(6,16);const t=(d+sl/2)/len;const x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);
      p.stroke({points:[[x-Math.cos(ang)*sl/2,y-Math.sin(ang)*sl/2+h*.45,.8],[x+Math.cos(ang)*sl/2,y+Math.sin(ang)*sl/2+h*.45,.8]],color:M(ML(Stone,StoneSh,R(.25,.65)),.15),brush:'flat',size:h*R(.8,1),load:1,thin:.42,taper:0,edge:.1,stir:.7,clean:d===0});d+=sl+R(1,4);}
    // lit top edge, broken
    for(let d=R(0,10);d<len;d+=R(14,30)){const t=d/len;const x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);p.stroke({points:[[x,y,.6],[x+Math.cos(ang)*R(8,16),y+Math.sin(ang)*R(8,16),.9]],color:M(ML(Stone,[['titanium_white',3],['naples_yellow',.3]],.5),.1),brush:'filbert',size:R(2.5,4),load:1.2,thin:.35,taper:[.2,.3],clean:d<10});}}}
wall([[880,752],[960,758],[1040,766],[1120,776],[1180,784]],12);
wall([[1705,792],[1790,788],[1880,782],[1960,778],[2060,772]],11);
wall([[2060,728],[2110,742],[2140,754]],8);
wall([[960,712],[1030,707],[1100,702]],8);
// 5b. hedges right of the palace: dark clipped rows with a lit top, and a pale stone kerb along the path; a stone bench
function hedge(pts,h){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    S((a[0]+b[0])/2+5,(a[1]+b[1])/2+h*.9,len*1.05,ang,M(Ghalf,.15),h*.8,{load:.8,thin:.55,edge:.6,taper:[.15,.15],stir:.8});
    for(let d=0;d<len;){const sl=R(10,24);const t=(d+sl/2)/len;const x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);
      S(x,y+h*.4,sl,ang,M(ML(Gdeep,Ghalf,R(.2,.6)),.15),h*R(.85,1.05),{load:.95,thin:.45,taper:[.2,.2],edge:.2,stir:.7});
      if(p.random()<.7)S(x+R(-3,3),y-h*.1,sl*R(.5,.8),ang,M(ML(Glit,Gsun,R(.2,.6)),.15),h*R(.3,.45),{load:1.15,thin:.35,taper:[.3,.3],stir:.6,clean:d===0});d+=sl+R(0,3);}}}
hedge([[1720,773],[1800,770],[1890,766],[1980,762],[2060,758]],8);
hedge([[1580,790],[1640,793],[1700,796]],7);
hedge([[1900,822],[1980,818],[2040,812]],6);
for(let x=1560;x<1870;x+=R(10,18))p.stroke({points:[[x,816+(x-1560)*.012,.7],[x+R(6,12),816+(x-1560)*.012,.7]],color:M(ML(Stone,StoneSh,R(.2,.5)),.12),brush:'flat',size:R(3,4.5),load:1,thin:.42,taper:0});// kerb along the path
// bench of pale stone
p.stroke({points:[[1612,803,.8],[1640,803,.8]],color:M(Stone,.08),brush:'flat',size:4,load:1.2,thin:.35,taper:0,clean:true});
p.stroke({points:[[1613,806,.6],[1639,806,.6]],color:M(StoneSh,.1),brush:'flat',size:2.5,load:.9,thin:.5,taper:0});
for(const bx of [1616,1636])p.stroke({points:[[bx,806,.7],[bx,811,.5]],color:M(StoneSh,.1),brush:'round',size:2,load:.9,thin:.5});
S(1640,813,34,.1,M(Ghalf,.15),4,{load:.8,thin:.55,edge:.5,taper:[.3,.3]});
// 6. flower beds along the walls and by the terrace: clustered warm accents, varied, a few pale
function bed(x0,y0,x1,y1,n){for(let i=0;i<n;i++){const t=R(0,1);const x=lerp(x0,x1,t)+R(-4,4),y=lerp(y0,y1,t)+R(-3,3);const w=p.random();
    const c=w<.4?[['cadmium_red',.6],['cadmium_orange',.5],['titanium_white',.4]]:w<.65?[['quinacridone_rose',.5],['titanium_white',.9],['cadmium_orange',.1]]:w<.85?[['cadmium_yellow',.6],['titanium_white',.8],['yellow_ochre',.2]]:[['titanium_white',1.2],['naples_yellow',.6]];
    S(x,y,R(5,12),R(-.3,.3),M(c,.2),R(3.5,6.5),{load:1.2,thin:.35,taper:[.3,.3],stir:.5,clean:i===0});}
  for(let i=0;i<n*.4;i++){const t=R(0,1);S(lerp(x0,x1,t),lerp(y0,y1,t)+R(1,5),R(8,16),R(-.2,.2),M(Gdeep,.2),R(4,7),{load:.9,thin:.5,taper:[.3,.3]});}}
bed(890,768,1180,796,80);bed(1710,804,2050,786,70);bed(1300,800,1420,804,34);bed(1560,802,1685,800,32);bed(960,722,1100,714,28);bed(2065,738,2140,760,18);
// 7. the stream: a bright winding channel from below the terrace to the lip at the main fall, dark banks, a sparkle or two
const st=[[1440,803],[1400,808],[1362,805],[1326,811],[1296,818],[1278,826],[1268,832]];
for(let i=0;i<st.length-1;i++){const a=st[i],b=st[i+1];
  p.stroke({points:[[a[0],a[1]+3,.7],[(a[0]+b[0])/2,(a[1]+b[1])/2+3,.9],[b[0],b[1]+3,.6]],color:M(Wdk,.15),brush:'filbert',size:R(5,7),load:.8,thin:.55,taper:[.2,.2],edge:.4,stir:.8});
  p.stroke({points:[[a[0],a[1],.7],[(a[0]+b[0])/2,(a[1]+b[1])/2+R(-1,1),.95],[b[0],b[1],.6]],color:M(Wat,.1),brush:'filbert',size:R(2.5,4),load:1.1,thin:.4,taper:[.3,.3],clean:i===0,opacity:.9});}
for(const q of [[1395,806],[1330,809],[1285,822]])p.dab({x:q[0],y:q[1]-1,color:M([['titanium_white',4]],.05),size:R(3,4.5),brush:'filbert',load:1.4,pressure:.9});
p.dry();
