// 12_high_clouds: a family of long high cloud streaks, wet into the sky: salmon-pink undersides lit from below,
// lavender tops, thinner and warmer near the sun, soft edges that melt into the sky with a few found edges.
const UND=[['titanium_white',2.9],['cadmium_orange',.06],['quinacridone_rose',.22],['naples_yellow',.22],['cobalt_violet',.06]];
const UND2=[['titanium_white',3.1],['cadmium_orange',.06],['quinacridone_rose',.15],['naples_yellow',.3],['cobalt_violet',.04]];
const TOP=[['titanium_white',2.9],['cobalt_violet',.32],['ultramarine',.12],['quinacridone_rose',.07],['naples_yellow',.12]];
const TOP2=[['titanium_white',3.1],['cobalt_violet',.22],['cobalt_blue',.08],['quinacridone_rose',.09],['naples_yellow',.16]];
const WARM=[['titanium_white',3.4],['naples_yellow',.5],['cadmium_orange',.05],['quinacridone_rose',.05]];
const mixW=(a,b,u)=>{const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
// a streak: centre line from (x0,y0) to (x1,y1) with a gentle sag, half-thickness `thick` at the middle, fading to the ends
function streak(x0,y0,x1,y1,sag,thick,n,opts){opts=opts||{};const ph=opts.ph||0;
 const cx=u=>lerp(x0,x1,u),cy=u=>lerp(y0,y1,u)+sag*Math.sin(Math.PI*u)+Math.sin(u*7+ph)*thick*.3;
 const env=u=>Math.pow(Math.sin(Math.PI*clamp(u,0,1)),opts.env||.6)*(.8+.42*Math.sin(u*11+ph*2)*Math.cos(u*4.3-ph)+.2*Math.sin(u*23+ph*3));
 const sz0=opts.size||28;const calm=opts.calm||(()=>1);const warm=opts.warm||0;const L=x1-x0;
 const tang=u=>Math.atan2(cy(clamp(u+.04,0,1))-cy(clamp(u-.04,0,1)),L*.08);
 // 1. body: two layers of long strokes along the streak; top half lavender, bottom half salmon; ends thin out
 const lay=(m,oo)=>{for(let i=0;i<m;i++){const u=R(.02,.98);const e=env(u);const th=thick*e;if(th<2.5)continue;
  const v=R(-1,1);const x=cx(u),y=cy(u)+v*th*.7;const len=L*R(.1,.26)*(.45+e);const sz=sz0*R(.7,1.3)*(.35+e*.85);
  const k=calm(x);let col=v<-.2?mixW(TOP,TOP2,R(0,1)):v>.15?mixW(UND,UND2,R(0,1)):mixW(TOP2,UND2,R(.3,.7));
  if(warm>0)col=mixW(col,WARM,warm);
  p.stroke(Object.assign({points:seg(x,y,len,tang(u)+R(-.04,.04),R(-.03,.03)*len,4),color:M(col,.15),brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.9,1.15)*k,thin:R(.38,.5),edge:R(.3,.55),taper:[R(.2,.4),R(.2,.4)],stir:R(.45,.7),opacity:lerp(.75,1,e)*k},oo||{}));}};
 lay(Math.round(n*.55),{});
 // 2. melt the top edge and the ends into the sky, lightly
 const nb=Math.round(n*.18);for(let i=0;i<nb;i++){const u=R(0,1);const e=env(u);const x=cx(u),y=cy(u)+R(-1.3,-.5)*thick*e;SB(seg(x,y,R(90,200),tang(u)+R(-.2,.2),0,3),R(44,70),R(.3,.45));}
 for(const u of [R(0,.1),R(.9,1)]){SB(seg(cx(u),cy(u),R(140,240),tang(u),0,3),70,.5);}
 // 3. second layer, the lit underside mainly, thicker paint, on a clean brush
 lay(Math.round(n*.27),{clean:true});
 // broken colour: short half-stirred strokes, warm pink and lemon streaked over the lavender, different per streak
 const bc=opts.bc||[.5,.5];const nbc=Math.round(n*(opts.bcn||.7)*.45);
 for(let i=0;i<nbc;i++){const u=R(.03,.97);const e=env(u);const th=thick*e;if(th<2.5)continue;const v=R(-1,1);const x=cx(u),y=cy(u)+v*th*.75;
  const w=R(0,1);let col=v<0?TOP2:UND;col=col.concat(w<bc[0]?[['quinacridone_rose',R(.05,.12)],['titanium_white',R(.1,.3)]]:w<bc[0]+bc[1]?[['cadmium_lemon',R(.02,.06)],['naples_yellow',R(.08,.2)],['titanium_white',R(.1,.3)]]:[['cobalt_violet',R(.06,.14)],['cobalt_blue',R(.01,.04)]]);
  if(warm>0)col=mixW(col,WARM,warm*.6);const len=L*R(.06,.14)*(.5+e);const sz=sz0*R(.5,.9)*(.4+e*.8);
  p.stroke({points:seg(x,y,len,tang(u)+R(-.12,.12),R(-.05,.05)*len,4),color:M(col,.1),brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.85,1.1)*calm(x),thin:R(.38,.5),edge:R(.35,.6),taper:[R(.3,.45),R(.3,.45)],stir:R(.3,.42),opacity:lerp(.75,1,e)*calm(x)});}
 // 4. a few found edges along the lit underside: long, crisper, pale salmon-cream
 const nf=opts.found||5;for(let i=0;i<nf;i++){const u=R(.18,.82);const e=env(u);const x=cx(u),y=cy(u)+thick*e*R(.45,.85);const len=R(110,240)*(.5+e);
  p.stroke({points:seg(x,y,len,tang(u)+R(-.03,.03),R(-.02,.02)*len,4),color:M(mixW(UND,WARM,.3+warm*.5),.1),brush:'flat',size:R(11,19)*(.5+e),load:R(1.1,1.3),thin:.32,edge:.12,taper:[.2,.35],stir:.85,clean:true});}}
// the calm zone around the spire: lower contrast there
const calmSpire=x=>{const d=Math.abs(x-1490);return d<260?lerp(.78,1,d/260):1;};
// A: thin far streak, high and cool
streak(1300,160,2210,158,-14,13,120,{size:22,env:.5,found:3,ph:1.3,bc:[.6,.1],bcn:.5});
// B: the main streak, long, thickest in the middle, sagging slightly
streak(600,262,2320,250,22,30,300,{size:34,env:.55,found:8,ph:.4,calm:calmSpire,bc:[.4,.4],bcn:.9});
// a second thinner strand under B at left so it is not one bar
streak(760,304,1250,300,8,9,70,{size:18,env:.7,found:2,ph:2.1,warm:.2,bc:[.3,.6],bcn:.6});
// C: near the sun: thin, very warm and pale, half lost in the glow
streak(90,340,730,330,6,11,90,{size:22,env:.6,found:2,ph:.8,warm:.7,bc:[.2,.7],bcn:.6});
// D: right side, mid height, pink-lavender, soft
streak(1760,430,2420,426,8,16,110,{size:26,env:.5,found:3,ph:2.6,bc:[.6,.2],bcn:.8});
// E: a faint cream wisp lower left-centre (mostly behind the palace later)
streak(900,565,1300,560,-5,10,45,{size:20,env:.7,found:1,ph:1.7,warm:.5,bc:[.3,.5],bcn:.5});
// a few free wisps: short, thin, warm near the sun, cool to the right
for(const [x,y,l,w] of [[480,400,220,.7],[300,520,180,.8],[1980,330,260,.1],[2200,560,200,.2],[1100,120,240,0]]){
 for(let i=0;i<5;i++){const xx=x+R(-l*.4,l*.4),yy=y+R(-8,8);const col=mixW(i<2?TOP2:UND2,WARM,w);
  p.stroke({points:seg(xx,yy,R(.35,.7)*l,R(-.08,.08),R(-.02,.02)*l,4),color:M(col,.15),brush:'filbert',size:R(10,20),load:R(.7,.95),thin:.5,edge:.6,taper:[.4,.4],stir:.6,opacity:R(.6,.9)});}
 SB(seg(x,y,l*.8,0,0,3),60,.4);}

// 2. the warm band right of the island: two or three soft pale pink-lavender drifts, lost-edged, like the ones at left
const DRIFT=[['titanium_white',3.2],['cobalt_violet',.24],['quinacridone_rose',.1],['naples_yellow',.3],['cobalt_blue',.03]];
for(const [x0,y0,x1,y1,th,n] of [[1900,735,2440,720,22,26],[2040,776,2440,766,16,22],[1900,958,2440,950,12,16]]){
 for(let i=0;i<n;i++){const u=R(0,1);const e=Math.pow(Math.sin(Math.PI*u),.5);const x=lerp(x0,x1,u),y=lerp(y0,y1,u)+R(-1,1)*th*e+Math.sin(u*6)*6;const len=R(140,320)*(.5+e);
  const col=mixW(DRIFT,i%3==0?UND2:TOP2,R(.1,.4));
  p.stroke({points:seg(x,y,len,R(-.04,.04),R(-.03,.03)*len,4),color:M(col,.14),brush:R(0,1)<.5?'flat':'filbert',size:R(34,62)*(.5+e*.7),load:R(.9,1.1),thin:.48,edge:R(.5,.7),taper:[.35,.4],stir:R(.5,.7),opacity:lerp(.75,1,e)});}
 for(let i=0;i<12;i++){const u=R(0,1);SB(seg(lerp(x0,x1,u),lerp(y0,y1,u)+R(-1.2,1.2)*th,R(200,360),R(-.15,.15),0,3),R(70,88),R(.4,.55));}}
