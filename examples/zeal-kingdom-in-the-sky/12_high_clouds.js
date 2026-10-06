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

// ---- 12_high_clouds.body.js ----
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
