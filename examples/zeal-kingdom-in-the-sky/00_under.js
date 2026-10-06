// ---- shared helpers (prepended to every pass by build.sh) ----
const R=(a,b)=>p.rand(a,b),TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const hx2=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const toHex=a=>'#'+a.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
const mixh=(a,b,t)=>{const A=hx2(a),B=hx2(b);return toHex(A.map((v,i)=>lerp(v,B[i],t)));};
// broken colour from a hex: small value/hue jitter and a second near-colour streak
function K(h,j,st){j=j===undefined?.05:j;const c=hx2(h);const d=R(-1,1)*j*255;const base=toHex(c.map(v=>v+d+R(-1,1)*j*110));
  if(st===false)return base;const alt=toHex(c.map(v=>v+d*.5+R(-1,1)*j*260));return [[base,1],[alt,R(.15,.6)]];}
// gradient stops [[t,hex],...]
function G(stops,t){t=clamp(t,0,1);for(let i=0;i<stops.length-1;i++){if(t<=stops[i+1][0]){const u=(t-stops[i][0])/(stops[i+1][0]-stops[i][0]);return mixh(stops[i][1],stops[i+1][1],clamp(u,0,1));}}return stops[stops.length-1][1];}
const pr=(i,n)=>{const f=i/(n-1);return .4+.6*Math.sin(Math.PI*clamp(f*.9+.05,0,1));};
function seg(x,y,len,ang,bend,n){n=n||4;const pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;const b=bend*(t*t-.08);pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*b,y+Math.sin(ang)*len*t+Math.cos(ang)*b,pr(i,n)]);}return pts;}
const F=(pts,c,size,o)=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size:size,load:1,thin:.4},o||{}));
const S=(x,y,len,ang,c,size,o)=>{o=Object.assign({},o||{});const b=o.bend===undefined?R(-.12,.12)*len:o.bend;const n=o.n||4;delete o.bend;delete o.n;return F(seg(x,y,len,ang,b,n),c,size,o);};
const SB=(pts,size,op,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],q[2]===undefined?.8:q[2]]),brush:'soft',size:Math.min(size,88),opacity:op===undefined?.5:op,color:'titanium_white'},o||{}));
const SBs=(x,y,len,ang,size,op)=>SB(seg(x,y,len,ang,R(-.05,.05)*len,3),size,op);
const area=poly=>{let a=0;for(let i=0;i<poly.length;i++){const q=poly[i],r=poly[(i+1)%poly.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
const inPoly=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const bbox=poly=>{const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};
// cover a polygon with overlapping patches; col(x,y) -> colour; o.ang, o.angJ, o.len, o.dens, o.o (stroke opts), o.angf(x,y)
function cover(poly,size,col,o){o=o||{};const dens=o.dens||1,lenf=o.len||2.2;const n=Math.max(1,Math.round(area(poly)*dens*1.4/(size*size*lenf*.7)));
 const [x0,y0,x1,y1]=bbox(poly);let k=0,g=0;
 while(k<n&&g++<n*50){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;
  const a=(o.angf?o.angf(x,y):(o.ang||0))+R(-1,1)*(o.angJ===undefined?.3:o.angJ);const sz=size*R(.75,1.25);
  let L=sz*lenf*R(.7,1.3);const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  S(x,y,L,a,col(x,y),sz,Object.assign({brush:'filbert'},o.o||{}));}
 return n;}
const ELL=(cx,cy,rx,ry,rot,n)=>{n=n||20;rot=rot||0;const pts=[];for(let i=0;i<n;i++){const a=i/n*TAU;const x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return pts;};
// arc stroke around (cx,cy) radius r from angle a0 to a1 (radians, screen coords)
function arc(cx,cy,r,a0,a1,c,size,o){const n=5,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,pr(i,n)]);}return F(pts,c,size,o);}
const SUN=[-0.7,-0.7]; // direction toward the sun: upper left
// wobbling thin-ish line (a few slightly offset pieces)
function WL(x0,y0,x1,y1,c,size,o){const n=4,pts=[];for(let i=0;i<n;i++){const t=i/(n-1);pts.push([lerp(x0,x1,t)+R(-1.2,1.2),lerp(y0,y1,t)+R(-1.2,1.2),.5+.4*Math.sin(Math.PI*t)]);}return F(pts,c,size,o);}
// ---- v6 helpers ----
const P=(pts)=>pts; // polygon literal
// dense stroke along polyline with taper; thin wrapper
const L=(pts,c,size,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],q[2]===undefined?pr(i,pts.length):q[2]]),color:c,brush:'filbert',size:size,load:1,thin:.4},o||{}));
// pigment-mix colour with jitter in parts (broken, marbling)
const M=(arr,j)=>{j=j===undefined?.25:j;return arr.map(a=>[a[0],a[1]*(1+R(-j,j))]);};
// soft blend along path
const BL=(pts,size,op,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],.8]),brush:'soft',size:Math.min(size,90),opacity:op===undefined?.5:op,color:'titanium_white'},o||{}));
// blender bristle drag (load 0)
const DR=(pts,size,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0],q[1],.7]),brush:'filbert',size:size,load:0,color:'titanium_white'},o||{}));
// polygon scatter blend: zigzag soft strokes inside polygon
function blendPoly(poly,size,op,ang,n){const [x0,y0,x1,y1]=bbox(poly);let k=0,g=0;while(k<n&&g++<n*40){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;const a=ang+R(-.5,.5),l=size*R(1.2,2.2);BL(seg(x,y,l,a,R(-.1,.1)*l,3),size,op);}}
const hexA=(c,t,a)=>mixh(c,t,a);
// light from upper-left: L in [-1,1] over an ellipse (cx,cy,rx,ry)
const LIGHTD=[-.62,-.78];
const Lof=(x,y,cx,cy,rx,ry)=>{const nx=(x-cx)/rx,ny=(y-cy)/ry;return -(nx*LIGHTD[0]*-1*-1)*0+(-(nx*(-LIGHTD[0]))*-1)*0+(-(nx*.62+ny*.78));};
// shaded blob: cover an ellipse with strokes coloured from a ramp by position (lit upper-left, core shadow lower-right, a touch of reflected light at the rim)
function lobe(cx,cy,rx,ry,ramp,size,o){o=o||{};const poly=ELL(cx,cy,rx,ry,o.rot||0,o.n||22);
 return cover(poly,size,(x,y)=>{const L=-(((x-cx)/rx)*.62+((y-cy)/ry)*.78);const t=clamp(.5+L*.5+R(-1,1)*(o.jit===undefined?.12:o.jit)+(o.bias||0),0,1);return K(G(ramp,t),o.kj===undefined?.04:o.kj);},
  Object.assign({dens:1.2,len:1.8,angJ:.7,ang:o.ang===undefined?-.3:o.ang,o:Object.assign({load:1,thin:.35,edge:.2},o.so||{})},o.cv||{}));}
// scanline fill with crisp square-ended flat strokes (architecture, planes, boards). colfn(x,y)->colour.
// o.vert: columns instead of rows. o.seg: max piece length (in sizes). o.brush, o.jx (jitter of ends), o.so: stroke opts
function fill(poly,size,colfn,o){o=o||{};const vert=!!o.vert;const P=vert?poly.map(q=>[q[1],q[0]]):poly;const [x0,y0,x1,y1]=bbox(P);const step=size*(o.step||.78);let n=0;
 const maxL=size*(o.seg||14);
 for(let y=y0+size*.5;y<=y1+size*.4;y+=step){const yc=clamp(y+R(-1,1)*(o.jy||0),y0,y1);const xs=[];
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc)){xs.push(a[0]+(yc-a[1])*(b[0]-a[0])/(b[1]-a[1]));}}
  xs.sort((a,b)=>a-b);
  for(let k=0;k+1<xs.length;k+=2){let xa=xs[k],xb=xs[k+1];if(xb-xa<2)continue;const pieces=Math.max(1,Math.ceil((xb-xa)/maxL));
   for(let m=0;m<pieces;m++){const pa=xa+(xb-xa)*m/pieces-(m?size*.3:0),pb=xa+(xb-xa)*(m+1)/pieces+(m<pieces-1?size*.3:0);const mid=(pa+pb)/2;
    const tl=R(-1,1)*(o.tilt===undefined?.012:o.tilt)*(pb-pa);const pts=vert?[[yc+R(-1,1)*(o.jy||0)*.3-tl/2,pa,.85],[yc,mid,.9],[yc+tl/2,pb,.85]]:[[pa,yc-tl/2,.85],[mid,yc+R(-1,1)*(o.wob||0),.9],[pb,yc+tl/2,.85]];
    const cx=vert?yc:mid,cy=vert?mid:yc;
    p.stroke(Object.assign({points:pts,color:colfn(cx,cy),brush:o.brush||"flat",size:size*R(.96,1.1),load:1,thin:.4,taper:0,edge:0},o.so||{}));n++;}}}
 return n;}
// rectangle helper
const RECT=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
// elliptical arc stroke
function earc(cx,cy,rx,ry,a0,a1,c,size,o){const n=5,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));pts.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,pr(i,n)]);}return F(pts,c,size,o);}

// ---- 00_under.body.js ----
// 00_under: block-in of the whole scene from study_color.svg, big brushes, dark to light, palette mixes. Then dry.
p.wipe();
const W=2400,H=1600;
// --- sky: bands from lavender-blue at the top to warm gold at the horizon, laid as long overlapping horizontal strokes, then melted
const skyMix=t=>{ // t 0 top .. 1 horizon
  const top=[['ultramarine',1],['cobalt_blue',.4],['titanium_white',2.2],['alizarin_crimson',.12]];
  const mid=[['cobalt_blue',.35],['cobalt_violet',.25],['titanium_white',3],['naples_yellow',.3]];
  const low=[['naples_yellow',1],['titanium_white',2.6],['cadmium_orange',.12],['cobalt_violet',.08]];
  const a=t<.5?top:mid,b=t<.5?mid:low,u=t<.5?t*2:(t-.5)*2;
  const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
for(let y=-40;y<1040;y+=58){const t=clamp((y+40)/1000,0,1);
  for(let x=-80;x<W+80;x+=R(520,760)){const len=R(600,820);
    p.stroke({points:[[x,y+R(-8,8)],[x+len*.5,y+R(-10,10)],[x+len,y+R(-8,8)]],color:M(skyMix(t),.15),brush:'flat',size:R(70,92),load:1.1,thin:.5,taper:0,edge:.3,stir:.7});}}
// sun glow: warm pale lemon wedge at upper left, wet into the sky
for(let i=0;i<60;i++){const a=R(0,TAU),r=R(0,1)**.5*330;const x=260+Math.cos(a)*r*1.5,y=420+Math.sin(a)*r;if(y>980)continue;
  S(x,y,R(160,300),R(-.3,.3),M([['titanium_white',3],['cadmium_lemon',.5],['naples_yellow',.6]],.2),R(60,80),{load:.9,thin:.5,opacity:R(.35,.7),edge:.5,taper:[.3,.3],stir:.8});}
// melt the sky
for(let y=20;y<1000;y+=70)for(let x=0;x<W;x+=400)SB([[x,y+R(-20,20)],[x+250,y+R(-30,30)],[x+480,y+R(-20,20)]],88,.5);
p.dry();
// --- cloud sea: violet-grey floor, then lit cumulus tops as warm cream masses, shadow bellies cooler
fill(RECT(0,990,W,H),80,(x,y)=>M([['ultramarine',.5],['cobalt_violet',.5],['titanium_white',2.6],['raw_umber',.25],['alizarin_crimson',.1]],.2),{step:.8,tilt:.01,so:{load:1,thin:.5,edge:.2}});
const cum=[[-50,1250,300,1090,600,1110,860,1200],[820,1340,1120,1220,1440,1250,1740,1330],[1740,1300,2100,1180,2400,1220,2400,1420]];
for(const c of cum){const poly=[[c[0],c[1]],[c[2],c[3]],[c[4],c[5]],[c[6],c[7]],[c[6],c[7]+120],[c[0],c[1]+100]];
  cover(poly,70,(x,y)=>{const top=y<(c[3]+c[5])/2+60;return top?M([['titanium_white',3],['naples_yellow',.6],['cadmium_orange',.06]],.15):M([['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.3],['raw_umber',.15]],.2);},{dens:.9,len:2.2,ang:-.1,angJ:.4,o:{load:1,thin:.45,edge:.4,taper:[.25,.35]}});}
// far horizon haze band: pinkish cream
for(let x=-40;x<W;x+=R(300,420))S(x+150,R(1000,1030),R(360,460),R(-.03,.03),M([['titanium_white',3],['naples_yellow',.5],['quinacridone_rose',.12],['cobalt_violet',.15]],.15),R(40,56),{load:.8,thin:.6,edge:.6,opacity:.7,taper:[.3,.3]});
for(let x=0;x<W;x+=380)SB([[x,1060],[x+200,1080],[x+420,1060]],80,.5);
// --- far island (Enhasa): hazy lavender-grey, flat planes
const far=[[140,860],[240,845],[330,820],[420,832],[520,820],[600,840],[660,870],[640,920],[560,990],[450,1020],[330,1000],[220,950]];
cover(far,44,(x,y)=>y>930?M([['cobalt_violet',.6],['ultramarine',.4],['titanium_white',2],['raw_umber',.3]],.15):M([['cobalt_violet',.4],['titanium_white',2.6],['raw_umber',.25],['naples_yellow',.2]],.15),{dens:1,len:2,ang:0,angJ:.3,o:{load:.9,thin:.5,edge:.3}});
// --- main island underside: dark cool rock, warmer lit left faces
const under=[[860,780],[980,800],[1200,825],[1500,830],[1800,815],[2050,790],[2160,760],[2120,850],[2000,900],[1960,1000],[1880,1040],[1800,1120],[1700,1140],[1640,1230],[1560,1260],[1480,1180],[1400,1250],[1320,1290],[1260,1200],[1180,1150],[1100,1060],[1040,1080],[980,960],[900,900],[870,840]];
cover(under,60,(x,y)=>M([['ultramarine',1],['burnt_umber',.9],['dioxazine_purple',.35],['titanium_white',.55]],.2),{dens:1,len:2.2,ang:1.2,angJ:.35,o:{load:.9,thin:.45,edge:.2}});
const litL=[[860,780],[980,800],[1200,825],[1250,900],[1200,1000],[1120,1040],[1040,1080],[980,960],[900,900],[870,840]];
cover(litL,50,(x,y)=>M([['raw_umber',1],['yellow_ochre',.5],['titanium_white',1.1],['ultramarine',.2]],.2),{dens:1,len:2,ang:1.1,angJ:.3,o:{load:1,thin:.4,edge:.2}});
const litR=[[1500,830],[1800,815],[1760,900],[1700,1000],[1640,1230],[1560,1260],[1480,1180],[1520,1000]];
cover(litR,50,(x,y)=>M([['ultramarine',.8],['burnt_umber',.6],['cobalt_violet',.3],['titanium_white',1]],.2),{dens:1,len:2,ang:1.3,angJ:.3,o:{load:1,thin:.4,edge:.2}});
// waterfalls: pale sheets
for(const wf of [[1230,830,1300,832,1240,1180,1200,1100],[1690,820,1740,818,1700,1120,1670,1020],[1000,805,1030,808,1040,980,1010,940]]){
  const poly=[[wf[0],wf[1]],[wf[2],wf[3]],[wf[4],wf[5]],[wf[6],wf[7]]];
  cover(poly,22,(x,y)=>M([['titanium_white',3],['cerulean',.25],['cobalt_blue',.1]],.15),{dens:1.1,len:3,ang:Math.PI/2,angJ:.08,o:{load:1,thin:.4,edge:.3,taper:[.2,.5]}});}
// --- plateau: green with a lit yellow-green left field
const plat=[[820,740],[960,690],[1150,660],[1400,645],[1650,650],[1900,670],[2100,710],[2160,760],[2050,790],[1800,815],[1500,830],[1200,825],[980,800],[860,780]];
cover(plat,46,(x,y)=>x<1200&&y<760?M([['yellow_ochre',1],['sap_green',.5],['titanium_white',1.2],['cadmium_lemon',.2]],.2):M([['sap_green',1],['yellow_ochre',.5],['ultramarine',.25],['titanium_white',.7]],.2),{dens:1,len:2.2,ang:.1,angJ:.25,o:{load:1,thin:.45,edge:.2}});
cover([[1680,740],[1880,770],[2050,800],[1900,815],[1680,820],[1560,790]],40,(x,y)=>M([['sap_green',.8],['ultramarine',.6],['burnt_umber',.3],['titanium_white',.35]],.2),{dens:1,len:2,ang:.15,angJ:.2,o:{load:.9,thin:.5,edge:.3}});
// --- palace masses: cream lit, lavender shadow; dome blue-green
const cream=()=>M([['titanium_white',3],['naples_yellow',.7],['yellow_ochre',.15]],.15),lav=()=>M([['titanium_white',2.2],['ultramarine',.5],['cobalt_violet',.6],['raw_umber',.1]],.15);
fill([[1300,640],[1490,570],[1680,640],[1680,760],[1300,760]],34,(x,y)=>x>1560?lav():cream(),{step:.8,so:{load:1.05,thin:.4,edge:.1}});
fill([[1370,520],[1490,470],[1610,520],[1610,600],[1370,600]],26,(x,y)=>x>1540?lav():cream(),{step:.8,so:{load:1.05,thin:.4,edge:.1}});
// spire: only a thin, flat wash (no relief), so the sky and palace passes cover it without a ghost
fill([[1370,520],[1420,340],[1490,240],[1560,340],[1610,520]],30,(x,y)=>x>1535?M([['ultramarine',1],['cobalt_blue',.5],['titanium_white',1.2],['viridian',.1]],.15):M([['cerulean',1],['viridian',.3],['titanium_white',2.2]],.15),{step:.8,so:{load:.5,thin:.9,edge:.3,opacity:.6}});
for(const t of [[1180,560,1285,760,1250],[1720,600,1825,770,1790]])fill(RECT(t[0],t[1],t[2],t[3]),26,(x,y)=>x>t[4]?lav():cream(),{vert:true,step:.8,so:{load:1.05,thin:.4,edge:.1}});
fill([[1180,560],[1215,470],[1285,560]],18,(x,y)=>x>1250?M([['ultramarine',1],['titanium_white',1.2]],.15):M([['cerulean',1],['titanium_white',2]],.15),{so:{load:.5,thin:.9,edge:.3,opacity:.6}});
fill([[1720,600],[1755,520],[1825,600]],18,(x,y)=>x>1790?M([['ultramarine',1],['titanium_white',1.2]],.15):M([['cerulean',1],['titanium_white',2]],.15),{so:{load:.5,thin:.9,edge:.3,opacity:.6}});
fill(RECT(960,700,1160,770),24,(x,y)=>x>1120?lav():cream(),{so:{load:1,thin:.4}});
fill(RECT(1880,690,2050,760),24,(x,y)=>M([['titanium_white',2],['raw_umber',.4],['naples_yellow',.4],['cobalt_violet',.15]],.15),{so:{load:1,thin:.4}});
for(const t of [[1030,680,70,45],[1960,665,80,50],[1150,770,60,35],[1860,780,55,30]])lobe(t[0],t[1],t[2],t[3],[[0,'#2f4a2c'],[.5,'#4e6e38'],[1,'#8aa24a']],Math.max(16,t[2]*.35),{jit:.1});
// --- the Epoch: gold wings, cream body, dark canopy (block only)
cover([[360,1180],[560,1140],[660,1170],[700,1195],[660,1215],[560,1230],[370,1210]],22,(x,y)=>M([['titanium_white',2],['yellow_ochre',.6],['raw_umber',.25]],.15),{dens:1.1,len:2.5,ang:-.1,angJ:.15,o:{load:1,thin:.4}});
cover([[500,1200],[290,1150],[330,1230],[480,1215]],18,(x,y)=>M([['cadmium_yellow',1],['yellow_ochre',.4],['titanium_white',.8]],.15),{dens:1.1,len:2.5,ang:.25,angJ:.15,o:{load:1,thin:.4}});
cover([[560,1215],[640,1320],[520,1260],[500,1215]],16,(x,y)=>M([['yellow_ochre',1],['burnt_umber',.6],['titanium_white',.3]],.15),{dens:1.1,len:2.5,ang:1,angJ:.15,o:{load:1,thin:.4}});
cover([[430,1165],[470,1125],[540,1120],[590,1150],[560,1168],[450,1172]],14,(x,y)=>M([['ultramarine',1],['paynes_grey',.5],['titanium_white',.9]],.15),{dens:1.1,len:2.2,ang:-.2,angJ:.2,o:{load:1,thin:.4}});
p.dry();
