// 13b_kajar: a second, smaller floating island in the middle distance at right (x 2000-2360, y 800-950), hanging just
// above the horizon haze and in front of it; nearer than Enhasa so a little firmer, still lower in contrast than the
// main island. Hazy lavender-grey mass, warm pale lit top plane at left, cool underside lost into the haze, a few small
// pale buildings and one slender tower as planes. Its left part (x < 2160) is later covered by the main island's rim.
const mixW=(a,b,u)=>{const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
const HAZE=[['titanium_white',3.2],['naples_yellow',.45],['quinacridone_rose',.1],['cobalt_violet',.14]];
const MASS=[['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.26],['raw_umber',.3],['naples_yellow',.1]];
const LIT=[['titanium_white',3],['naples_yellow',.55],['cobalt_violet',.14],['quinacridone_rose',.05],['raw_umber',.06],['cadmium_orange',.03]];
const UNDER=[['titanium_white',1.5],['cobalt_violet',.6],['ultramarine',.48],['raw_umber',.34],['alizarin_crimson',.04]];
const HALF=[['titanium_white',2.6],['cobalt_violet',.4],['ultramarine',.14],['raw_umber',.16],['naples_yellow',.22]];
const K1=[[2000,832],[2060,808],[2140,800],[2230,810],[2300,820],[2360,842],[2352,882],[2300,926],[2220,950],[2130,944],[2060,914],[2010,872]];
const topP=[[2000,832],[2060,808],[2140,800],[2230,810],[2300,820],[2360,842],[2300,852],[2200,846],[2100,844],[2030,848]];
const botP=[[2352,882],[2300,926],[2220,950],[2130,944],[2060,914],[2010,872],[2080,888],[2180,900],[2280,890]];
// 1. the mass, laid in big overlapping strokes with a little haze mixed in, darker toward the bottom
cover(K1,42,(x,y)=>{const d=clamp((y-810)/140,0,1);return M(mixW(mixW(MASS,UNDER,d*.8),HAZE,.08+d*.06),.12);},{dens:1.2,len:4.2,ang:-.03,angJ:.08,o:{load:R(.9,1.05),thin:.5,edge:.5,taper:[.2,.25],stir:.7}});
// melt the interior so the lay-in reads as one mass, not dabs
for(let i=0;i<18;i++){const x=R(2020,2340),y=R(820,930);if(!inPoly(K1,x,y))continue;SB(seg(x,y,R(100,200),R(-.12,.12),0,3),R(50,70),R(.4,.55));}
// the shadow band just under the lit top: the mass turning down, clearly darker than the top plane
for(let i=0;i<9;i++){const x=R(2020,2340),y=R(848,874);p.stroke({points:seg(x,y,R(90,180),R(-.03,.03),R(-.02,.02)*100,4),color:M(mixW(MASS,UNDER,.3),.12),brush:'flat',size:R(20,30),load:1,thin:.48,edge:.45,taper:[.25,.3],stir:.65});}
// 2. underside: long cool strokes following the lower planes, then melted along the contour and lost at the bottom
const run=(pts,size,col,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0]+R(-4,4),q[1]+R(-3,3),pr(i,pts.length)]),color:col,brush:'filbert',size:size,load:.95,thin:.5,edge:.55,taper:[.2,.25],stir:.6},o||{}));
const UC=u=>M(mixW(UNDER,HAZE,u),.14);
run([[2020,878],[2090,905],[2170,922],[2250,920]],40,UC(.1));run([[2200,925],[2280,912],[2340,878]],36,UC(.14));
run([[2040,862],[2140,880],[2240,884],[2330,862]],44,M(mixW(mixW(MASS,UNDER,.5),HAZE,.1),.14));
run([[2070,918],[2150,942],[2230,948],[2300,926]],30,UC(.2),{edge:.65});
for(let i=0;i<16;i++){const u=R(0,1);const x=lerp(2030,2340,u),y=lerp(900,890,u)+Math.sin(u*Math.PI)*40+R(-12,12);SB(seg(x,y,R(120,200),R(-.15,.15)+(u<.3?.3:u>.7?-.5:0),0,3),R(44,60),R(.35,.5));}
for(let i=0;i<16;i++){const x=R(2040,2360),y=R(925,985);SB(seg(x,y,R(90,170),R(-.25,.25),0,3),R(50,70),R(.4,.55));}
for(let i=0;i<8;i++){const x=R(2320,2390),y=R(840,930);SB(seg(x,y,R(60,120),R(.9,1.4),0,3),R(40,56),R(.35,.5));}
// 3. the lit top plane: warm, pale, firmer, palest at the left (toward the sun); strokes flat and horizontal
for(let i=0;i<18;i++){const x=R(2020,2340),y=R(806,850);const u=(x-2000)/360;const col=mixW(LIT,HAZE,.03+u*.1);
 p.stroke({points:seg(x,y,R(60,150),R(-.04,.04),R(-.02,.02)*100,4),color:M(col,.12),brush:'flat',size:R(18,32),load:R(1,1.15),thin:.42,edge:.35,taper:[.2,.3],stir:.7,clean:true});}
// half-tone step where the top turns down to the cliff on the right
for(let i=0;i<5;i++){const x=R(2290,2350),y=R(836,870);S(x,y,R(40,64),R(.35,.6),M(mixW(HALF,HAZE,.1),.14),R(20,28),{load:.9,thin:.5,edge:.65,taper:[.35,.35]});}
// a found edge along the lit top at left, and a cooler note under it
for(const [pts,sz] of [[[[2004,832],[2060,810],[2140,802],[2230,812]],12],[[[2100,804],[2190,808],[2290,820]],9]]){
 p.stroke({points:pts.map((q,i)=>[q[0],q[1]+R(-1.5,1.5),[.6,.9,.9,.6][i]||.8]),color:M(mixW(LIT,[['titanium_white',3],['naples_yellow',.5]],.4),.08),brush:'flat',size:sz,load:1.2,thin:.35,edge:.1,taper:[.15,.3],stir:.85,clean:true});}
p.stroke({points:[[2020,842,.6],[2100,826,.8],[2180,822,.6]],color:M(mixW(MASS,HAZE,.12),.1),brush:'filbert',size:11,load:.9,thin:.5,edge:.6,taper:[.3,.3]});
// 4. broken colour over the mass: half-stirred strokes, warm on the top, cool violet below, few
for(let i=0;i<40;i++){const x=R(2020,2350),y=R(815,930);if(!inPoly(K1,x,y))continue;const top=y<850;
 const col=(top?LIT:MASS).concat(top?[['quinacridone_rose',R(.02,.06)],['titanium_white',R(.2,.5)]]:[['cobalt_violet',R(.08,.18)],['ultramarine',R(.02,.06)]]);
 p.stroke({points:seg(x,y,R(40,110),R(-.1,.1),R(-.05,.05)*60,4),color:M(mixW(col,HAZE,.08),.1),brush:R(0,1)<.5?'flat':'filbert',size:R(12,26),load:R(.85,1.05),thin:.45,edge:R(.4,.6),taper:[.3,.4],stir:R(.3,.45),opacity:R(.7,.95)});}
// 5. buildings as planes: a slender tower, a dome, two walls; light face warm pale, shadow face cool; 8-20 px strokes
const BW=[['titanium_white',3.2],['naples_yellow',.38],['cobalt_violet',.08]];
const BS=[['titanium_white',1.9],['cobalt_violet',.5],['ultramarine',.24],['raw_umber',.14]];
// tower at x ~2252: light face, shadow face, a small cap
S(2249,788,46,-Math.PI/2,M(BW,.08),10,{load:1.15,thin:.35,taper:[.05,.12],brush:'flat',bend:0,clean:true});
S(2258,790,42,-Math.PI/2,M(BS,.08),7,{load:.95,thin:.4,taper:[.05,.12],brush:'flat',bend:0});
p.dab({x:2252,y:763,color:M(mixW(BW,[['naples_yellow',1],['titanium_white',2]],.3),.08),size:11,brush:'round',load:1.1,pressure:.7});
S(2253,758,10,-Math.PI/2,M(BS,.08),5,{load:.9,thin:.4,taper:[.1,.6],brush:'round',bend:0});
// dome at (2180,806)
arc(2180,812,13,Math.PI*1.05,Math.PI*1.55,M(BW,.08),9,{load:1.1,thin:.35,taper:[.1,.3],clean:true});arc(2180,812,13,Math.PI*1.55,Math.PI*2.0,M(BS,.08),8,{load:.95,thin:.4,taper:[.1,.3]});
S(2180,818,30,0,M(mixW(BW,BS,.4),.08),8,{load:1,thin:.4,taper:0,brush:'flat',bend:0});
// walls
S(2300,822,44,0,M(BW,.08),11,{load:1.1,thin:.35,taper:0,brush:'flat',bend:0,clean:true});S(2325,825,14,1.2,M(BS,.08),8,{load:.95,thin:.4,taper:0,brush:'flat',bend:0});
S(2110,810,34,0,M(mixW(BW,HAZE,.15),.08),10,{load:1.05,thin:.4,taper:0,brush:'flat',bend:0,clean:true});S(2130,812,12,1.3,M(BS,.08),7,{load:.9,thin:.4,taper:0,brush:'flat',bend:0});
for(let i=0;i<4;i++){const x=R(2150,2320),y=R(808,822);p.dab({x:x,y:y,color:M(mixW(BW,HAZE,.25),.1),size:R(6,9),brush:'round',load:1,pressure:.6});}
