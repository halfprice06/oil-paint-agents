const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.85,1.15)]);
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1.0,thin:.5},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function arc(x,y,len,ang,bend){const n=5,pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*bend*(t*t-.1),y+Math.sin(ang)*len*t+Math.cos(ang)*bend*(t*t-.1)]);}return pts;}
const PX=610,PY=398;
// rolling ridge and distant tree clumps
const rg=()=>M([['cerulean',.5],['titanium_white',1.5],['viridian',.3],['cobalt_violet',.3],['burnt_umber',.06]]);
for(let x=-40;x<1040;x+=R(70,120)){const y=334+Math.sin(x/110)*-5-(x>650?6:0);F([[x,y],[x+80,y+R(-4,2)],[x+160,y+R(-2,3)]],rg(),R(12,18),{load:.9,thin:.55});}
for(const [x,y] of [[120,342],[168,340],[780,336],[840,334],[905,338],[560,338]]){F(arc(x,y,R(30,50),R(-.3,.3),0),M([['viridian',.4],['ultramarine',.2],['titanium_white',1],['sap_green',.2]]),R(10,16),{load:.9,thin:.5});}
// mid rise: sunlit crest, shadowed fall (soft, wet)
const sunG=()=>M([['cadmium_yellow',.3],['cadmium_lemon',.15],['titanium_white',1.2],['sap_green',.3],['cadmium_orange',.05],['yellow_ochre',.1]]);
const shG=()=>M([['ultramarine',.3],['sap_green',.45],['viridian',.1],['cobalt_violet',.12],['titanium_white',.6],['burnt_umber',.08]]);
for(let i=0;i<9;i++){const x=R(-30,900),y=470+Math.sin(x/260)*-18+R(-6,6);F(arc(x+100,y,R(160,260),R(-.1,.06),R(-6,6)),sunG(),R(14,22),{load:.7,thin:.75});}
for(let i=0;i<9;i++){const x=R(-30,900),y=502+Math.sin(x/260)*-18+R(-8,12);F(arc(x+100,y,R(160,260),R(-.1,.06),R(-6,6)),shG(),R(18,28),{load:.65,thin:.75});}
// broken colour: longer tapering strokes, dry-ish, varied angles
for(let i=0;i<55;i++){const x=R(0,1000),y=R(350,740),t=(y-340)/410;
  const a=R(-.5,.35);const len=R(50,100)+t*110;
  F(arc(x,y,len,a,R(-6,6)),R(0,1)<.6?sunG():M([['cadmium_orange',.1],['yellow_ochre',.25],['naples_yellow',.7],['titanium_white',.9],['sap_green',.15]]),R(8,13)+t*12,{load:.55,thin:.8});}
for(let i=0;i<40;i++){const x=R(0,1000),y=R(360,740),t=(y-340)/410;
  F(arc(x,y,R(50,100)+t*110,R(-.4,.3),R(-6,6)),M([['ultramarine',.5],['cobalt_violet',.45],['viridian',.2],['titanium_white',.45],['sap_green',.3]]),R(8,13)+t*12,{load:.5,thin:.8});}
// ---- TIME GATE: asymmetric luminous vortex
const S=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:.45,thin:.75,opacity:.4},o));
// halo: scumbled pale violet/blue, offset a little up-left, blended
for(let i=0;i<70;i++){const th=R(0,6.28),r=R(40,140);const f=r/135;
  S(arc(PX-6+Math.cos(th)*r*1.05,PY-4+Math.sin(th)*r*.9,R(40,90),th+1.57+R(-.5,.5),R(-8,8)),M([['cobalt_violet',.5-.25*f],['cerulean',.35],['titanium_white',1.2+2*f],['ultramarine',.08]]),R(14,28),{opacity:R(.4,.7)*(1.15-f)});}
for(let i=0;i<9;i++){const th=R(0,6.28),r=R(55,110);BL(arc(PX+Math.cos(th)*r,PY+Math.sin(th)*r,R(50,90),th+1.57,0),R(14,22));}
// vortex body: deep violet-blue mass, broken
for(let i=0;i<3;i++){const a=R(0,6.28),r=R(20,40);F(arc(PX+Math.cos(a)*r,PY+Math.sin(a)*r,R(36,56),a+1.9,R(-6,6)),M([['ultramarine',1],['cobalt_violet',.7],['dioxazine_purple',.12],['titanium_white',.5]]),R(16,26),{load:.9,thin:.5});}
// long sweeping spirals inward, varying widths and tilt
const cols=[[['ultramarine',1],['cobalt_violet',.5],['titanium_white',.3]],[['cobalt_violet',1],['titanium_white',1.3],['cerulean',.2]],[['cerulean',.8],['titanium_white',1.6],['cobalt_violet',.2]],[['ultramarine',1],['dioxazine_purple',.2],['cobalt_violet',.4]]];
for(let k=0;k<6;k++){const a0=R(0,6.28),turns=R(.7,1.25),r0=R(54,78),sx=1,sy=R(.8,.95),tilt=R(-.2,.2);const pts=[];const n=11;
  for(let j=0;j<n;j++){const f=j/(n-1);const a=a0+f*turns*6.28;const r=r0*(1-f*.92)+R(-1.5,1.5);const x=Math.cos(a)*r*sx,y=Math.sin(a)*r*sy;pts.push([PX+x*Math.cos(tilt)-y*Math.sin(tilt),PY+x*Math.sin(tilt)+y*Math.cos(tilt),.35+.65*Math.sin(Math.PI*Math.min(1,f*1.15))]);}
  F(pts,M(cols[k%4]),R(6,17),{load:.95,thin:.5});}
for(let k=0;k<3;k++){const a=R(0,6.28);F([[PX+Math.cos(a)*58,PY+Math.sin(a)*52],[PX+Math.cos(a+.5)*80,PY+Math.sin(a+.5)*70],[PX+Math.cos(a+1.0)*108,PY+Math.sin(a+1.0)*92]],M([['cobalt_violet',.8],['cerulean',.4],['titanium_white',1.5]]),R(5,9),{load:.7,thin:.6,opacity:.7});}
// warm-white core with a hint of yellow
F([[PX-9,PY+4],[PX-2,PY-8],[PX+9,PY-2],[PX+3,PY+8]],M([['titanium_white',4],['naples_yellow',.6]]),16,{load:1.2,thin:.4});
p.dab({x:PX+1,y:PY,color:M([['titanium_white',4],['naples_yellow',.5],['cadmium_yellow',.06]]),size:14,brush:'round',load:1.4});
// coloured light spilling on the grass: violet-blue strokes, irregular, clustered below and to the sides
for(let i=0;i<30;i++){const th=R(0,6.28),r=R(.1,1);const x=PX+Math.cos(th)*r*190,y=PY+68+Math.sin(th)*r*36;
  S(arc(x,y,R(24,70),R(-.7,.6),R(-6,6)),M([['cobalt_violet',.5],['cerulean',.45],['ultramarine',.1],['titanium_white',1.2]]),R(8,16),{opacity:R(.3,.65),load:.55});}
