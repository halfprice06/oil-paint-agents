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

// ---- 13_enhasa.body.js ----
// 13_enhasa: the far floating island, wet into the horizon haze: a hazy lavender-grey mass laid in big overlapping strokes,
// lit top planes warmer and paler, underside cooler, edges lost into the haze; a few tiny pale buildings.
const mixW=(a,b,u)=>{const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-u);for(const [n,w] of b)o[n]=(o[n]||0)+w*u;return Object.keys(o).map(n=>[n,o[n]]);};
const HAZE=[['titanium_white',3.2],['naples_yellow',.45],['quinacridone_rose',.1],['cobalt_violet',.14]];
const MASS=[['titanium_white',2.4],['cobalt_violet',.5],['ultramarine',.22],['raw_umber',.24],['naples_yellow',.12]];
const LIT=[['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.16],['quinacridone_rose',.06],['raw_umber',.05],['cadmium_orange',.02]];
const UNDER=[['titanium_white',1.7],['cobalt_violet',.6],['ultramarine',.42],['raw_umber',.3],['alizarin_crimson',.04]];
// horizon haze band first (y 925-1045): pale pink-cream, long flat strokes, melting upward into the gold
for(let i=0;i<70;i++){const y=R(925,1045),x=R(-60,2460);const t=(y-925)/120;const col=mixW([['naples_yellow',.8],['titanium_white',3.2],['quinacridone_rose',.08],['cobalt_violet',.1]],HAZE,t);
 p.stroke({points:seg(x,y,R(260,520),R(-.03,.03),R(-.02,.02)*300,4),color:M(col,.14),brush:'flat',size:R(44,70),load:R(.85,1.05),thin:.5,edge:R(.4,.6),taper:[.25,.25],stir:.7,clean:true});}
for(let x=-40;x<2440;x+=R(300,420))SB([[x,R(950,1000)],[x+220,R(940,1010)],[x+440,R(950,1000)]],88,.45);
// the mass: big overlapping strokes with the haze mixed in, slightly darker toward the bottom, at varied angles
const far=[[140,860],[240,845],[330,820],[420,832],[520,820],[600,840],[660,870],[640,920],[560,990],[450,1020],[330,1000],[220,950]];
cover(far,56,(x,y)=>{const d=clamp((y-860)/150,0,1);return M(mixW(mixW(MASS,UNDER,d*.75),HAZE,.16+d*.06),.14);},{dens:1,len:3.6,ang:-.03,angJ:.14,o:{load:R(.9,1.05),thin:.5,edge:.55,taper:[.2,.25],stir:.65}});
// underside: cooler and darker, laid as a few long strokes that follow the lower planes, then melted along the contour
const UC=u=>M(mixW(UNDER,HAZE,u),.14);
const run=(pts,size,col,o)=>p.stroke(Object.assign({points:pts.map((q,i)=>[q[0]+R(-4,4),q[1]+R(-3,3),pr(i,pts.length)]),color:col,brush:'filbert',size:size,load:.95,thin:.5,edge:.55,taper:[.2,.25],stir:.6},o||{}));
run([[230,935],[300,952],[380,968],[460,972]],48,UC(.18));run([[420,970],[500,968],[570,950],[640,915]],46,UC(.2));
run([[250,905],[360,920],[470,925],[580,905],[650,880]],52,M(mixW(mixW(MASS,UNDER,.5),HAZE,.15),.14));
run([[225,952],[330,1000],[450,1020]],40,UC(.22));run([[450,1020],[560,990],[635,925]],38,UC(.25));
run([[290,985],[400,1005],[520,1000]],34,UC(.3),{edge:.65});
for(let i=0;i<10;i++){const u=R(0,1);const x=lerp(240,640,u),y=lerp(950,930,u)+Math.sin(u*Math.PI)*60+R(-15,15);SB(seg(x,y,R(90,160),R(-.15,.15)+(u<.3?.35:u>.7?-.6:0),0,3),R(48,66),R(.35,.5));}
// lit top planes: warmer and paler, flat horizontal strokes, palest at the left end nearest the sun
for(let i=0;i<16;i++){const x=R(170,620),y=R(828,880);const u=(x-140)/520;const col=mixW(LIT,HAZE,.04+u*.12);
 p.stroke({points:seg(x,y,R(70,170),R(-.04,.04),R(-.02,.02)*100,4),color:M(col,.13),brush:'flat',size:R(22,36),load:R(1,1.15),thin:.42,edge:.35,taper:[.2,.3],stir:.7,clean:true});}
// the near lit cliff face at the right end: a mid-tone step, strokes going down the face, melted
for(let i=0;i<4;i++){const x=R(585,645),y=R(885,920);S(x,y,R(50,70),R(.35,.6),M(mixW(MASS,LIT,.4),.15),R(22,30),{load:.9,thin:.5,edge:.7,taper:[.35,.35]});}
for(let i=0;i<5;i++)SB(seg(R(580,660),R(880,930),R(60,110),R(.6,1.2),0,3),50,.4);
// lose the edges: bottom and right into the haze, keep the lit top-left edge found
for(let i=0;i<22;i++){const x=R(200,660),y=R(955,1040);SB(seg(x,y,R(90,170),R(-.3,.3),0,3),R(50,70),R(.4,.55));}
for(let i=0;i<10;i++){const x=R(600,690),y=R(860,960);SB(seg(x,y,R(70,130),R(.8,1.4),0,3),R(40,60),R(.4,.5));}
for(let i=0;i<6;i++){const x=R(130,210),y=R(850,960);SB(seg(x,y,R(60,120),R(.8,1.4),0,3),50,.35);}
// a few strokes back after the melt, so the mass is still paint: the top band and a few dark notes under the overhang
for(let i=0;i<6;i++){const x=R(200,560),y=R(850,872);p.stroke({points:seg(x,y,R(80,150),R(-.03,.03),0,4),color:M(mixW(LIT,HAZE,.12),.12),brush:'flat',size:R(18,28),load:1.05,thin:.42,edge:.3,taper:[.2,.3],stir:.7,clean:true});}
for(const [x,y] of [[300,946],[430,966]])p.stroke({points:seg(x,y,R(90,150),R(-.05,.05),0,4),color:M(mixW(UNDER,HAZE,.1),.12),brush:'filbert',size:R(16,24),load:.9,thin:.5,edge:.6,taper:[.35,.35]});
// one found edge along the lit top at left (sun side), crisp and a touch thicker; the rest of the contour stays lost
for(const [pts,sz] of [[[[142,862],[200,850],[262,838],[330,824]],14],[[[250,842],[330,826],[420,834]],11]]){
 p.stroke({points:pts.map((q,i)=>[q[0],q[1]+R(-1.5,1.5),[.6,.9,.9,.6][i]||.8]),color:M(mixW(LIT,[['titanium_white',3],['naples_yellow',.5]],.4),.08),brush:'flat',size:sz,load:1.2,thin:.35,edge:.1,taper:[.15,.3],stir:.85,clean:true});}
// a cooler note just under the found edge so it reads as a plane turning, not a line
p.stroke({points:[[150,872,.6],[230,864,.8],[320,852,.6]],color:M(mixW(MASS,HAZE,.2),.1),brush:'filbert',size:12,load:.9,thin:.5,edge:.6,taper:[.3,.3]});
// small pale planes with a shadow side: a dome, a tower, a wall, a low block (6-14 px strokes)
const BW=[['titanium_white',3.2],['naples_yellow',.34],['cobalt_violet',.1]];
const BS=[['titanium_white',2.5],['cobalt_violet',.42],['ultramarine',.14],['raw_umber',.08]];
// dome at (430,828): lit cap arc left, shadow arc right, a base
arc(430,834,11,Math.PI*1.05,Math.PI*1.55,M(BW,.08),8,{load:1.1,thin:.35,taper:[.1,.3],clean:true});arc(430,834,11,Math.PI*1.55,Math.PI*2.0,M(BS,.08),7,{load:.95,thin:.4,taper:[.1,.3]});
S(430,840,26,0,M(mixW(BW,BS,.4),.08),7,{load:1,thin:.4,taper:0,brush:'flat'});
// tower at (322,830): light face, shadow face, a small warm cap
S(319,822,30,-Math.PI/2,M(BW,.08),9,{load:1.1,thin:.35,taper:[.05,.15],brush:'flat',bend:0,clean:true});S(327,824,26,-Math.PI/2,M(BS,.08),6,{load:.95,thin:.4,taper:[.05,.15],brush:'flat',bend:0});
p.dab({x:321,y:806,color:M(mixW(BW,[['naples_yellow',1],['titanium_white',2]],.3),.08),size:9,brush:'round',load:1.1,pressure:.7});
// wall at (520-560,832): long light plane with a shadow end
S(540,834,40,0,M(BW,.08),10,{load:1.1,thin:.35,taper:0,brush:'flat',bend:0,clean:true});S(563,836,14,1.2,M(BS,.08),7,{load:.95,thin:.4,taper:0,brush:'flat',bend:0});
// low block at (270,846)
S(268,846,20,0,M(mixW(BW,HAZE,.2),.08),8,{load:1,thin:.4,taper:0,brush:'flat',bend:0,clean:true});S(280,848,9,1.3,M(BS,.08),6,{load:.9,thin:.4,taper:0,brush:'flat',bend:0});
