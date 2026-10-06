// 10_sky_gradient: the whole sky laid wet as one luminous gradient, lavender-blue at the top through
// pale violet to warm gold at the horizon; the sun glow at upper left as a pale pool with a pink-violet halo;
// calmer, darker sky around the spire.
p.wipe();
const W=p.width;
const mixW=(a,b,u)=>{const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
const KEYS=[
 [0.00,[['ultramarine',1.1],['cobalt_blue',.5],['titanium_white',2.4],['alizarin_crimson',.12],['raw_umber',.05]]],
 [0.22,[['ultramarine',.6],['cobalt_blue',.4],['cobalt_violet',.25],['titanium_white',2.9],['alizarin_crimson',.08]]],
 [0.45,[['cobalt_violet',.35],['cobalt_blue',.2],['titanium_white',3.3],['naples_yellow',.28],['quinacridone_rose',.05]]],
 [0.66,[['naples_yellow',.7],['titanium_white',3.2],['cobalt_violet',.16],['cadmium_orange',.06],['quinacridone_rose',.05]]],
 [0.86,[['naples_yellow',1],['titanium_white',3],['cadmium_orange',.1],['cobalt_violet',.07],['yellow_ochre',.08]]],
 [1.00,[['naples_yellow',.8],['titanium_white',3.2],['quinacridone_rose',.1],['cobalt_violet',.1],['cadmium_orange',.05]]]];
function skyT(t){t=clamp(t,0,1);for(let i=0;i<KEYS.length-1;i++){if(t<=KEYS[i+1][0]){const u=(t-KEYS[i][0])/(KEYS[i+1][0]-KEYS[i][0]);return mixW(KEYS[i][1],KEYS[i+1][1],u);}}return KEYS[KEYS.length-1][1];}
const SUNX=260,SUNY=420;
const sunF=(x,y)=>{const dx=(x-SUNX)/720,dy=(y-SUNY)/440;const d=Math.sqrt(dx*dx+dy*dy);return clamp(Math.exp(-d*d*1.7)-0.05,0,1);};
const spireF=(x,y)=>{const dx=(x-1500)/560,dy=(y-330)/330;const d=dx*dx+dy*dy;return d>1?0:(1-d)*(1-d);};
const sm=(a,b,v)=>{const u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u);};
const GLOW=[['titanium_white',4],['naples_yellow',.5],['cadmium_orange',.03]];
const HALO=[['titanium_white',3.2],['cobalt_violet',.22],['naples_yellow',.35],['quinacridone_rose',.07]];
function skyCol(x,y,j){const t=y/1000;let m=skyT(t+R(-.02,.02));const s=sunF(x,y);
 if(s>0.02){m=mixW(m,HALO,sm(0,.55,s)*.8);m=mixW(m,GLOW,sm(.35,1,s)*.9);}
 const c=spireF(x,y);if(c>0.01){m=mixW(m,[['ultramarine',.55],['cobalt_violet',.3],['titanium_white',1.6],['raw_umber',.05]],c*.6);}
 return M(m,j===undefined?.18:j);}
// direction field: slow drift across the canvas, flatter near the horizon, a slight lift toward the upper right
function skyAng(x,y){const t=y/1000;const drift=Math.sin(x/700+y/900)*.22+Math.sin(x/260-y/400)*.08;
 const base=lerp(-.12,0,t)+drift*(1-t*.6);return base+R(-.16,.16);}
// 1. lay in wet, big brushes, long overlapping strokes; lower warm strokes sit on top of upper cool ones
{const n=1400;const ys=[];for(let i=0;i<n;i++)ys.push(R(-60,1040));ys.sort((a,b)=>a-b);
 for(const y of ys){const x=R(-60,W+60);const t=y/1000;const s=sunF(x,y);
  const sz=lerp(104,72,t)*R(.78,1.22);const len=sz*R(2.8,4.6);const a=skyAng(x,y);
  const thin=lerp(.58,.4,t)*(1-s*.4);const load=lerp(.95,1.1,t)+s*.3;
  p.stroke({points:seg(x,y,len,a,R(-.08,.08)*len,4),color:skyCol(x,y),brush:R(0,1)<.6?'flat':'filbert',size:sz,load:load,thin:thin,edge:R(.25,.55),taper:[R(.1,.3),R(.1,.3)],stir:(x>1200&&y<280)?R(.8,.95):R(.5,.75),clean:s>.5});}}
// upper right: two or three broad, soft, slightly darker drifts whose edges melt, so the top stays calm
for(const [x0,y0,x1,y1,sz] of [[1250,60,2450,120,120],[1500,170,2450,210,110],[1150,-10,1900,20,100]]){
 for(let k=0;k<3;k++){const u0=R(-.05,.2),u1=R(.8,1.05);const pts=[[lerp(x0,x1,u0),lerp(y0,y1,u0)+R(-20,20),.7],[lerp(x0,x1,(u0+u1)/2),lerp(y0,y1,(u0+u1)/2)+R(-30,30),.9],[lerp(x0,x1,u1),lerp(y0,y1,u1)+R(-20,20),.7]];
  p.stroke({points:pts,color:M([['ultramarine',.85],['cobalt_blue',.4],['cobalt_violet',.22],['titanium_white',2.8],['alizarin_crimson',.08]],.1),brush:'flat',size:sz*R(.85,1.1),load:1,thin:.55,edge:.8,taper:[.3,.3],stir:.9});}}
for(let i=0;i<40;i++){const x=R(1150,2450),y=R(-30,270);SB(seg(x,y,R(300,520),R(-.12,.12),R(-.03,.03)*400,3),88,R(.45,.6));}
// 1. cross the rows: long diagonal and gently curved strokes of the same mixes through the middle sky and the warm band
for(let i=0;i<70;i++){const band=R(0,1)<.55;const y=band?R(380,680):R(780,960);const x=R(-60,W+60);if(spireF(x,y)>.3&&R(0,1)<.6)continue;
 const nearP=x>1500&&y<700;const a=(nearP?R(.03,.1):R(.18,.45))*(R(0,1)<.5?1:-1);const len=nearP?R(500,800):R(380,700);const sz=R(60,95);
 p.stroke({points:seg(x,y,len,a,R(.08,.2)*len*(R(0,1)<.5?1:-1),5),color:skyCol(x,y,.15),brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.95,1.15),thin:R(.4,.5),edge:R(.4,.6),taper:[R(.25,.4),R(.25,.4)],stir:R(.55,.75),clean:sunF(x,y)>.5});}
// 2. the glow itself: thick pale buttery paint, clean brush, broad soft-edged sweeps around the sun centre
for(let i=0;i<70;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*300;const x=SUNX+Math.cos(a)*r*1.55,y=SUNY+Math.sin(a)*r;const s=sunF(x,y);
 const sz=R(70,110),len=sz*R(2.5,4);S(x,y,len,skyAng(x,y)+R(-.2,.2),M(mixW(HALO,GLOW,sm(.3,1,s)),.12),sz,{load:R(1.1,1.35),thin:.3,edge:R(.5,.7),taper:[.3,.3],stir:.85,clean:true});}
// 3. melt: two light soft passes at varied angles, then one long pass along the bands
for(let k=0;k<3;k++){const ang=[-.1,.4,-.55][k];
 for(let i=0;i<120;i++){const x=R(-40,W+40),y=R(-40,1040);const l=R(220,440);SB(seg(x,y,l,ang+R(-.3,.3),R(-.05,.05)*l,3),88,R(.35,.5));}}
for(let y=-20;y<1040;y+=R(65,100)){for(let x=-60;x<W;x+=R(380,560)){SB([[x,y+R(-15,15)],[x+R(200,300),y+R(-25,25)],[x+R(430,560),y+R(-15,15)]],88,R(.4,.55));}}
// soft radial-free melt of the glow: big soft strokes crossing the glow in several directions
for(let i=0;i<100;i++){const a=R(0,TAU),r=Math.sqrt(R(0,1))*420;const x=SUNX+Math.cos(a)*r*1.5,y=SUNY+Math.sin(a)*r;SB(seg(x,y,R(260,420),R(-.5,.5),0,3),88,R(.4,.55));}
// 4. put paint back: fewer, longer, varied visible strokes; sparse around the spire; thick and pale in the glow
for(let i=0;i<300;i++){const x=R(-40,W+40),y=R(-40,1030);const c=spireF(x,y);if(c>.25&&R(0,1)<.7)continue;if(x>1200&&y<280&&R(0,1)<.8)continue;
 const t=y/1000;const s=sunF(x,y);const sz=R(30,80)*(1+s*.3);const len=sz*R(3,6);const a=skyAng(x,y)+R(-.1,.1);
 p.stroke({points:seg(x,y,len,a,R(-.1,.1)*len,4),color:skyCol(x,y,.22),brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.85,1.05)+s*.35,thin:lerp(.5,.35,t),edge:R(.3,.6),taper:[R(.2,.4),R(.2,.4)],stir:R(.4,.65),clean:s>.5});}
// 4b. broken colour: smaller half-stirred strokes of the local mix with a warmer or cooler neighbour streaked in, mid and lower sky; not horizontal only
for(let i=0;i<220;i++){const x=R(-40,W+40),y=R(120,1000);const c=spireF(x,y);if(c>.2&&R(0,1)<.75)continue;if(x>1200&&y<280)continue;
 const t=y/1000;const s=sunF(x,y);let m=skyCol(x,y,.1);const w=R(0,1);
 if(w<.35)m=m.concat([['naples_yellow',R(.05,.12)],['quinacridone_rose',R(.01,.04)]]);else if(w<.7)m=m.concat([['cobalt_violet',R(.06,.12)],['cobalt_blue',R(.02,.05)]]);else m=m.concat([['titanium_white',R(.2,.5)]]);
 const sz=R(34,72)*(1+s*.3);const len=sz*R(3,6);const a=((x>1500&&y<700)?R(-.06,.06):(R(0,1)<.35?R(-.6,.6):skyAng(x,y)+R(-.15,.15)));
 p.stroke({points:seg(x,y,len,a,R(-.12,.12)*len,4),color:m,brush:R(0,1)<.5?'flat':'filbert',size:sz,load:R(.8,1.05)+s*.3,thin:lerp(.5,.35,t),edge:R(.3,.6),taper:[R(.25,.45),R(.25,.45)],stir:R(.35,.5),clean:s>.5});}
for(let i=0;i<70;i++){const x=R(-40,W+40),y=R(100,1000);SB(seg(x,y,R(240,420),R(-.5,.5),0,3),88,R(.3,.45));}
// 4c. a few long non-horizontal strokes back across the middle and the warm band so the rows do not return
for(let i=0;i<40;i++){const y=R(0,1)<.5?R(400,660):R(780,950);const x=R(-40,W+40);if(spireF(x,y)>.3)continue;if(x>1500&&y<700)continue;const a=R(.15,.4)*(R(0,1)<.5?1:-1);const len=R(240,480);
 p.stroke({points:seg(x,y,len,a,R(.05,.15)*len*(R(0,1)<.5?1:-1),5),color:skyCol(x,y,.18),brush:'filbert',size:R(34,60),load:R(.9,1.1),thin:.42,edge:.5,taper:[.35,.35],stir:R(.45,.65),clean:sunF(x,y)>.5});}
// 4d. right of and above the palace: melt the crossing more, then a few long, calm, nearly horizontal strokes so the spire is the sharpest thing there
for(let i=0;i<60;i++){const x=R(1550,W+40),y=R(-20,700);SB(seg(x,y,R(300,520),R(-.08,.08),R(-.02,.02)*400,3),88,R(.45,.6));}
for(let i=0;i<14;i++){const x=R(1600,W+40),y=R(250,660);const len=R(420,760);
 p.stroke({points:seg(x,y,len,R(-.04,.04),R(-.02,.02)*len,5),color:skyCol(x,y,.12),brush:'flat',size:R(44,70),load:R(.95,1.1),thin:.48,edge:R(.55,.7),taper:[.35,.35],stir:R(.7,.85)});}
for(let i=0;i<24;i++){const x=R(1550,W+40),y=R(200,700);SB(seg(x,y,R(300,500),R(-.06,.06),0,3),88,R(.35,.5));}
// 5. a gentle last melt only in places, light touch
for(let i=0;i<90;i++){const x=R(-40,W+40),y=R(-20,1030);const l=R(240,400);SB(seg(x,y,l,R(-.4,.4),R(-.05,.05)*l,3),80,R(.25,.4));}
