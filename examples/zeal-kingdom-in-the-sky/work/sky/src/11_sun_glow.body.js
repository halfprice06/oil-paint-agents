// 11_sun_glow: the brightest value of the painting: a few thick, buttery, pale touches at the heart of the glow,
// wet into the sky, no disc. Then a soft veil so the core melts outward.
const SUNX=260,SUNY=420;
const CORE=[['titanium_white',4.5],['naples_yellow',.35],['cadmium_lemon',.05]];
const CORE2=[['titanium_white',4],['naples_yellow',.5],['cadmium_orange',.04],['quinacridone_rose',.02]];
for(let i=0;i<34;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*150;const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;
 const sz=R(56,96),len=sz*R(2,3.6);const ang=R(-.25,.25)+Math.sin(x/300)*.15;
 S(x,y,len,ang,M(R(0,1)<.6?CORE:CORE2,.1),sz,{load:R(1.25,1.5),thin:.22,edge:R(.45,.7),taper:[.3,.3],stir:.9,clean:true});}
// two knife-less, brush-only lights right at the centre, thickest
for(let i=0;i<6;i++){const x=SUNX+R(-90,90),y=SUNY+R(-50,50);S(x,y,R(120,200),R(-.2,.2),M(CORE,.08),R(60,80),{load:1.5,thin:.15,edge:.5,taper:[.25,.25],stir:.95,clean:true});}
// melt the core outward with the soft blender, several directions, larger reach
for(let i=0;i<70;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*330;const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;SB(seg(x,y,R(240,400),R(-.6,.6),0,3),88,R(.35,.5));}
// and a few visible strokes back so the glow is still paint
for(let i=0;i<14;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*220;const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;
 S(x,y,R(140,260),R(-.2,.2),M(CORE2,.12),R(40,64),{load:R(1.1,1.3),thin:.3,edge:.5,taper:[.3,.3],stir:.8,clean:true});}

// the glow boundary is a gradient, not an edge: half-tone strokes bridging glow to sky around the rim, then very large soft passes
const HALF=[['titanium_white',3.3],['cobalt_violet',.18],['naples_yellow',.4],['cobalt_blue',.06],['quinacridone_rose',.05]];
for(let i=0;i<36;i++){const a=R(0,TAU),r=R(300,470);const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;if(y>960)continue;
 const cool=y<SUNY?R(.1,.35):R(0,.15);const m=M(HALF,.12).concat([['cobalt_blue',cool*.3],['cobalt_violet',cool*.3]]);
 S(x,y,R(160,320),R(-.3,.3)+Math.sin(x/300)*.12,m,R(50,80),{load:R(.9,1.1),thin:.4,edge:R(.6,.8),taper:[.35,.35],stir:.7});}
for(let i=0;i<60;i++){const a=R(0,TAU),r=R(240,520);const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;if(y>980)continue;SB(seg(x,y,R(300,460),a+Math.PI/2+R(-.5,.5),R(-.08,.08)*300,3),R(80,88),R(.4,.6));}
// thick clean-brush touches in the heart, after the melt, so the heart stays the brightest and most loaded paint
for(let i=0;i<10;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*120;const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;
 S(x,y,R(160,300),R(-.25,.25),M(R(0,1)<.5?CORE:CORE2,.08),R(50,80),{load:R(1.3,1.5),thin:.15,edge:R(.6,.8),taper:[.3,.3],stir:.95,clean:true});}
for(let i=0;i<24;i++){const a=R(0,TAU),r=R(60,260);const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;SB(seg(x,y,R(200,340),R(-.6,.6),0,3),88,R(.35,.5));}
