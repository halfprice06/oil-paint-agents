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

// ---- cloud helpers (clouds area, round 2) ----
const SUNA=Math.atan2(-0.78,-0.62); // direction to the sun, screen angle (upper left)
const SHA=SUNA+Math.PI;
const CL={
 // lit cream, broken colour: white, naples, a touch of orange and rose; w = warmth/closeness to the sun (0..1)
 lit:(w)=>{w=w===undefined?.5:w;return M([['titanium_white',3.4],['naples_yellow',.3+.15*w],['cadmium_orange',.01+.025*w],['quinacridone_rose',.01+.02*w]],.25);},
 litPink:()=>M([['titanium_white',3.4],['naples_yellow',.3],['quinacridone_rose',.04],['cadmium_orange',.012]],.25),
 litR:()=>M([['titanium_white',3.4],['naples_yellow',.3],['cobalt_violet',.06],['quinacridone_rose',.015]],.25),
 half:()=>M([['titanium_white',3.6],['naples_yellow',.24],['cobalt_violet',.2],['raw_umber',.06],['quinacridone_rose',.02]],.25),
 halfD:()=>M([['titanium_white',3],['naples_yellow',.12],['cobalt_violet',.35],['raw_umber',.1],['ultramarine',.08]],.25),
 shad:()=>M([['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.3],['raw_umber',.15]],.2),
 trough:()=>M([['titanium_white',1.4],['ultramarine',.55],['cobalt_violet',.45],['raw_umber',.3],['alizarin_crimson',.04]],.2),
 refl:()=>M([['titanium_white',2.4],['cobalt_violet',.35],['naples_yellow',.26],['cadmium_orange',.03],['raw_umber',.06]],.25),
 haze:()=>M([['titanium_white',3],['naples_yellow',.28],['quinacridone_rose',.07],['cobalt_violet',.18],['raw_umber',.05]],.2),
 pinkgrey:()=>M([['titanium_white',3],['cobalt_violet',.25],['raw_umber',.12],['quinacridone_rose',.04]],.2),
 blue:()=>M([['titanium_white',2.1],['ultramarine',.42],['cobalt_violet',.3],['raw_umber',.2],['cerulean',.08]],.2),
 islShad:()=>M([['titanium_white',1.7],['ultramarine',.6],['cobalt_violet',.4],['raw_umber',.2],['cerulean',.06]],.2),
};
// arc stroke on an ellipse (cx,cy,rx,ry) with an irregular radius function rf(a)
function arcOn(cx,cy,rx,ry,rf,a0,a1,rr,c,size,o){const n=6,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));const r=rr+R(-.025,.025);const k=rf?rf(a):1;pts.push([cx+Math.cos(a)*rx*r*k,cy+Math.sin(a)*ry*r*k,pr(i,n)]);}F(pts,c,size,o);}
// one big cloud form (a bulge of a mass): a solid lit cap on the upper-left face (strokes following the bulge), a thin cool lower-right, the turn melted. B={cx,cy,rx,ry,near,dim,warm,sz,right,k1,k2,n}
function bulge(B){
 const k1=B.k1===undefined?.1:B.k1,k2=B.k2===undefined?.05:B.k2,ph1=R(0,TAU),ph2=R(0,TAU);
 const rf=a=>1+k1*Math.sin(3*a+ph1)+k2*Math.sin(5*a+ph2);
 const sz=B.sz||clamp(Math.sqrt(B.rx*B.ry)*.6,28,120);
 const dim=B.dim||0,near=!!B.near,nb=B.n||1;
 const litc=()=>{const c=B.right?CL.litR():(p.random()<.25?CL.litPink():CL.lit(B.warm));if(dim)c.push(['ultramarine',dim*.1],['cobalt_violet',dim*.12],['raw_umber',dim*.05]);return c;};
 const A=(a0,a1,rr,c,size,o)=>arcOn(B.cx,B.cy,B.rx,B.ry,rf,a0,a1,rr,c,size,o);
 const P=(a,rr)=>[B.cx+Math.cos(a)*B.rx*rr*rf(a),B.cy+Math.sin(a)*B.ry*rr*rf(a)];
 const sector=(a0,a1,rr0,rr1)=>{const pts=[];for(let i=0;i<=10;i++)pts.push(P(lerp(a0,a1,i/10),rr1));for(let i=10;i>=0;i--)pts.push(P(lerp(a0,a1,i/10),rr0));return pts;};
 const tang=(x,y)=>Math.atan2((y-B.cy)/B.ry,(x-B.cx)/B.rx)+Math.PI/2;
 // whole form in halftone, strokes following the bulge
 cover(sector(-Math.PI,Math.PI,0,1.0),sz*.55,()=>p.random()<.7?CL.half():CL.halfD(),{dens:1.7,len:2.6,angJ:.2,angf:tang,o:{load:1,thin:.42,edge:.3,taper:[.12,.2],stir:.6}});
 // shadow side: lower right, thin, deepest near the base
 cover(sector(SHA-.9,SHA+.9,.55,1.02),sz*.5,(x,y)=>{const a=Math.atan2((y-B.cy)/B.ry,(x-B.cx)/B.rx);return Math.cos(a-SHA)>.6&&(y-B.cy)>B.ry*.5?CL.trough():CL.shad();},{dens:1.5,len:2.8,angJ:.2,angf:tang,o:{load:.8,thin:.6,edge:.45,taper:[.2,.3],stir:.65}});
 if(sz>50)for(let i=0;i<Math.round(2*nb);i++){const a=SHA+R(-.6,.6),w=R(.7,1.1);A(a-w/2,a+w/2,R(.3,.55),CL.halfD(),sz*R(.5,.8),{load:.9,thin:.5,edge:.5,taper:[.25,.35],stir:.65});}
 // lit cap: solid, upper-left face, then a few very large sweeps over it
 cover(sector(SUNA-1.2,SUNA+1.2,.2,1.0),sz*.6,litc,{dens:1.8,len:2.4,angJ:.2,angf:tang,o:{load:near?1.3:1.1,thin:near?.22:.35,edge:.15,taper:[.1,.2],stir:.55,clean:true}});
 for(let i=0;i<Math.round(6*nb);i++){const a=SUNA+R(-.5,.5),w=R(.9,1.5),rr=R(.5,.97);A(a-w/2,a+w/2,rr,litc(),sz*R(.8,1.25),{load:near?R(1.3,1.45):R(1.05,1.2),thin:near?.22:.35,edge:.15,taper:[.1,.2],stir:.5,clean:i<2});}
 // flat-lit top plane: long strokes across the crown
 for(let i=0;i<Math.round(4*nb);i++){const a=-Math.PI/2+R(-.35,.35),w=R(1.0,1.7),rr=R(.62,.95);A(a-w/2,a+w/2,rr,litc(),sz*R(.7,1.1),{load:near?R(1.3,1.45):R(1.1,1.25),thin:near?.22:.32,edge:.12,taper:[.08,.15],stir:.5,clean:i<1});}
 // melt only the turning edge (the band perpendicular to the sun) with a few soft strokes, and a touch on the far rim
 const ta=SUNA+Math.PI/2,nb2=Math.round(sz*.025*nb)+1;
 for(let i=0;i<nb2;i++){const u=R(-.9,.9);const c=[B.cx+Math.cos(ta)*B.rx*u*.8,B.cy+Math.sin(ta)*B.ry*u*.8];const l=sz*R(.7,1.1);BL(seg(c[0],c[1],l,SUNA+R(-.3,.3),R(-.1,.1)*l,3),Math.min(50,sz*R(.4,.55)),R(.3,.4));}
 for(let i=0;i<1;i++){const a=SHA+R(-.8,.8),w=R(.6,1);const pts=[];for(let j=0;j<4;j++){const aa=lerp(a-w/2,a+w/2,j/3);const r=R(.95,1.06)*rf(aa);pts.push([B.cx+Math.cos(aa)*B.rx*r,B.cy+Math.sin(aa)*B.ry*r]);}BL(pts,Math.min(60,sz*R(.4,.6)),R(.4,.5));}
 // strokes laid back after blending: found edge on the sun side, a couple of half-tone sweeps
 for(let i=0;i<Math.round(3*nb);i++){const a=SUNA+R(-.7,.5),w=R(.4,.8);A(a-w/2,a+w/2,R(.86,.98),litc(),sz*R(.35,.6),{load:near?1.4:1.15,thin:.22,edge:0,taper:[.1,.2],stir:.5,clean:true});}
 for(let i=0;i<Math.round(2*nb);i++){const a=R(-Math.PI,Math.PI),w=R(.6,1.1);A(a-w/2,a+w/2,R(.4,.8),CL.half(),sz*R(.45,.7),{load:1,thin:.4,edge:.3,taper:[.2,.3],stir:.5});}
}
// body of a mass: halftone above, shadow below, long strokes following the horizontal
function massFill(poly,size,o){o=o||{};const [x0,y0,x1,y1]=bbox(poly);
 cover(poly,size,(x,y)=>{const u=(y-y0)/(y1-y0)+R(-.1,.1);const c=u<.5?CL.half():u<.72?CL.halfD():CL.shad();if(o.dimf){const d=o.dimf(x,y);if(d>0)c.push(['ultramarine',d*.03],['cobalt_violet',d*.03]);}return c;},
  {dens:o.dens||1.3,len:3,ang:0,angJ:.25,o:{brush:'flat',load:1,thin:.45,edge:.35,taper:[.12,.2],stir:.6}});
 blendPoly(poly,size*.9,.45,.2,Math.round(area(poly)/(size*size*5)));}
// shadow belly under a mass: thin cool paint, deepest right under the lit mass, warm reflected light low down
function belly(poly,size,o){o=o||{};const [x0,y0,x1,y1]=bbox(poly);
 cover(poly,size,(x,y)=>{const u=(y-y0)/(y1-y0);const c=u<.78?CL.shad():(p.random()<.5?CL.refl():CL.shad());if(o.dimf){const d=o.dimf(x,y);if(d>0)c.push(['ultramarine',d*.03],['cobalt_violet',d*.03]);}return c;},
  {dens:o.dens||1.4,len:3.4,ang:.02,angJ:.1,o:{brush:'flat',load:.9,thin:.6,edge:.5,taper:[.2,.3],stir:.7}});
 // smaller broken strokes of reflected light low down
 const n=Math.round((x1-x0)/110);for(let i=0;i<n;i++){const x=R(x0,x1),y=lerp(y0,y1,R(.65,.95));S(x,y,R(100,220),R(-.03,.03),CL.refl(),size*R(.4,.6),{load:.9,thin:.5,edge:.5,taper:[.3,.3],stir:.4,opacity:.8});}
 blendPoly(poly,size*.8,.45,0,Math.round(area(poly)/(size*size*6)));}
// island cast shadow factor on the deck (0..1): soft ellipse
const ISL=(x,y)=>{const dx=(x-1620)/440,dy=(y-1300)/190;const d=Math.sqrt(dx*dx+dy*dy);return clamp(1-(d-.3)/.75,0,1);};

// ---- 50_epoch.body.js ----
// 50: the Epoch (round 2, about 480 px wide): a streamlined cream-gold teardrop hull painted as a cylinder (light, halftone, core shadow, warm reflected light from the clouds), a bubble canopy of dark blue-grey glass with the sky reflected and one glint, swept-back wings with thickness (lit gold top, dark leading edge, cool underside on the banked near wing), a tail fin, the canopy's cast shadow on the hull. Nose right, lit from the upper left.
p.dry();p.wipe();
const EP={
 gold:()=>M([['cadmium_yellow',.8],['yellow_ochre',.7],['titanium_white',1],['naples_yellow',.35],['raw_umber',.05]],.2),
 goldHi:()=>M([['cadmium_yellow',.7],['naples_yellow',.7],['titanium_white',1.6]],.15),
 goldHalf:()=>M([['yellow_ochre',1],['cadmium_yellow',.25],['titanium_white',.5],['raw_umber',.18],['cobalt_violet',.08]],.2),
 goldS:()=>M([['yellow_ochre',1],['raw_umber',.45],['cobalt_violet',.3],['ultramarine',.15],['titanium_white',.4]],.2),
 edgeD:()=>M([['raw_umber',1],['yellow_ochre',.4],['ultramarine',.3],['titanium_white',.15]],.15),
 under:()=>M([['titanium_white',1.2],['cobalt_violet',.5],['ultramarine',.35],['raw_umber',.25],['yellow_ochre',.15]],.2),
 hullHi:()=>M([['titanium_white',3.2],['naples_yellow',.5]],.1),
 hull:()=>M([['titanium_white',2.6],['naples_yellow',.6],['yellow_ochre',.12]],.15),
 hullHalf:()=>M([['titanium_white',1.3],['naples_yellow',.6],['yellow_ochre',.5],['cobalt_violet',.15],['raw_umber',.06]],.2),
 hullS:()=>M([['yellow_ochre',.45],['raw_umber',.4],['ultramarine',.42],['cobalt_violet',.3],['titanium_white',.45]],.2),
 hullRefl:()=>M([['titanium_white',1.1],['cobalt_violet',.4],['naples_yellow',.35],['cadmium_orange',.04],['ultramarine',.15]],.2),
 glass:()=>M([['ultramarine',1],['paynes_grey',.8],['titanium_white',.3]],.15),
 glassD:()=>M([['paynes_grey',1],['ultramarine',.6],['burnt_umber',.25],['titanium_white',.1]],.15),
 glassRefl:()=>M([['titanium_white',1.1],['ultramarine',.45],['paynes_grey',.3],['naples_yellow',.12],['cobalt_violet',.15]],.2),
 glassSky:()=>M([['titanium_white',1.6],['cobalt_violet',.25],['naples_yellow',.2],['ultramarine',.25]],.2),
 glint:()=>M([['titanium_white',2.5],['cerulean',.2]],.1),
};
// strokes along a plane given by its root edge (a->b) and tip edge (c->d)
function plane(a,b,c,d,n,col,size,o,t0r,t1r){o=o||{};t0r=t0r||[0,.12];t1r=t1r||[.86,1];
 for(let i=0;i<n;i++){const u=clamp((i+R(.15,.85))/n,0,1);const s=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],e=[lerp(c[0],d[0],u),lerp(c[1],d[1],u)];
  const t0=R(t0r[0],t0r[1]),t1=R(t1r[0],t1r[1]);const m=R(.4,.6);
  const pts=[[lerp(s[0],e[0],t0),lerp(s[1],e[1],t0),.7],[lerp(s[0],e[0],m)+R(-2,2),lerp(s[1],e[1],m)+R(-2,2),.95],[lerp(s[0],e[0],t1),lerp(s[1],e[1],t1),.6]];
  F(pts,col(),size*R(.85,1.15),Object.assign({load:1.05,thin:.35,edge:.15,taper:[.12,.2]},o));}}
// ---- far wing (raised toward the sun): lit gold top, lighter near the root, dark leading edge, tip lost in the cloud
plane([505,1174],[600,1167],[268,1088],[296,1079],8,EP.gold,20,{stir:.4});
plane([540,1171],[598,1167],[312,1084],[330,1081],4,EP.goldHi,12,{load:1.2,stir:.4});
plane([505,1174],[528,1172],[270,1088],[282,1086],2,EP.goldHalf,9,{thin:.45});
plane([594,1167],[602,1166],[292,1078],[300,1077],3,EP.edgeD,6,{thin:.5,load:.9});
BL([[268,1090],[300,1082],[340,1090]],28,.55);BL([[262,1082],[290,1092]],22,.5);
// ---- tail fin: lit left face, shadow right face, a bright leading edge
plane([386,1203],[416,1200],[404,1122],[418,1120],5,EP.hull,12,{stir:.6,load:1.15,clean:true});
plane([416,1200],[440,1197],[418,1120],[432,1118],3,EP.goldS,9,{thin:.45});
F([[404,1124,.6],[394,1165,.9],[387,1200,.5]],EP.hullHi(),4,{load:1.2,thin:.3,taper:[.1,.3],clean:true});
// ---- hull as a cylinder: strokes run along the pod; bands from the top (light) to the bottom (core shadow, then reflected light)
const top=[[360,1200],[420,1160],[500,1148],[580,1143],[660,1155],[700,1170],[740,1190]];
const bot=[[360,1210],[440,1238],[540,1244],[620,1236],[700,1212],[740,1190]];
const atT=(A,u)=>{const k=Math.min(A.length-2,Math.floor(u*(A.length-1))),f=u*(A.length-1)-k;return [lerp(A[k][0],A[k+1][0],f),lerp(A[k][1],A[k+1][1],f)];};
const along=(t,n,col,size,o)=>{for(let i=0;i<n;i++){const u0=R(0,.55),u1=Math.min(1,u0+R(.3,.5));const pts=[];for(let j=0;j<4;j++){const u=lerp(u0,u1,j/3);const a=atT(top,u),b=atT(bot,u);const w=t+R(-.05,.05);pts.push([lerp(a[0],b[0],w),lerp(a[1],b[1],w),pr(j,4)]);}F(pts,col(),size,o);}};
along(.75,10,EP.hullS,15,{load:.9,thin:.5,edge:.3,taper:[.15,.25],stir:.7});
along(.62,6,EP.hullS,10,{load:.85,thin:.55,edge:.4,taper:[.15,.25],stir:.7});
along(.93,5,EP.hullRefl,7,{load:.95,thin:.45,edge:.4,taper:[.2,.3],stir:.5});
along(.48,7,EP.hullHalf,13,{load:1,thin:.4,edge:.3,taper:[.15,.25],stir:.6});
along(.26,9,EP.hull,15,{load:1.25,thin:.3,edge:.15,taper:[.1,.2],stir:.6,clean:true});
along(.1,5,EP.hullHi,8,{load:1.3,thin:.25,edge:.1,taper:[.1,.2],clean:true});
// the nose: converging strokes to a point
F([[640,1152,.5],[700,1170,.9],[740,1190,.4]],EP.hull(),11,{load:1.2,thin:.3,taper:[.1,.3],clean:true});
F([[650,1230,.5],[700,1212,.9],[740,1191,.4]],EP.hullS(),9,{load:.9,thin:.5,taper:[.1,.3]});
F([[690,1178,.5],[720,1186,.9],[740,1190,.3]],EP.hullHalf(),7,{load:1,thin:.4,taper:[.1,.4]});
// melt the turns: light into halftone, halftone into core shadow (soft brush along the length)
BL([[400,1190],[520,1192],[660,1186]],16,.45);BL([[420,1215],[540,1222],[660,1212]],16,.45);
// ---- canopy cast shadow on the hull and the seam at its base
F([[452,1184,.5],[530,1189,.9],[612,1184,.6],[648,1194,.3]],EP.hullS(),9,{load:.85,thin:.55,edge:.4,taper:[.15,.3]});
F([[470,1194,.5],[560,1198,.8],[640,1198,.3]],EP.hullHalf(),6,{load:.85,thin:.5,edge:.4,taper:[.2,.3]});
// ---- canopy bubble: solid dark glass, the sky reflected in a pale band on the upper left, darkest lower right, one glint
const dome=[];for(let i=0;i<=12;i++){const a=lerp(-Math.PI,0,i/12);dome.push([528+Math.cos(a)*84,1181+Math.sin(a)*62]);}

const darc=(a0,a1,rr,col,size,o)=>{const n=5,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));pts.push([528+Math.cos(a)*84*rr,1181+Math.sin(a)*62*rr,pr(i,n)]);}F(pts,col(),size,o);};
for(let i=0;i<16;i++)darc(R(-3.1,-2.4),R(-.6,0),R(.15,1.0),EP.glass,R(12,18),{load:1,thin:.45,edge:.2,taper:[.1,.15],stir:.85});
for(let i=0;i<6;i++)darc(R(-1.0,-.6),R(-.2,.0),R(.55,1),EP.glassD,R(12,18),{load:.95,thin:.45,edge:.25,taper:[.15,.2],stir:.8});
for(let i=0;i<4;i++)darc(R(-2.9,-2.6),R(-2.0,-1.7),R(.6,.95),EP.glassRefl,R(10,15),{load:1,thin:.4,edge:.25,taper:[.15,.25],stir:.6});
for(let i=0;i<3;i++)darc(R(-2.7,-2.5),R(-1.9,-1.7),R(.78,.95),EP.glassSky,R(7,10),{load:1.05,thin:.4,edge:.3,taper:[.2,.3],stir:.6});
darc(-2.2,-.9,.35,EP.glass,14,{load:.9,thin:.45,edge:.3});
BL([[455,1178],[500,1135],[560,1125],[608,1176]],16,.45);BL([[470,1170],[528,1140],[590,1165]],14,.4);
F([[446,1182,.4],[500,1185,.7],[560,1185,.7],[612,1181,.4]],EP.glassD(),5,{load:.75,thin:.6,taper:[.2,.3]});
p.stroke({points:[[476,1150,.5],[486,1142,.9],[498,1138,.4]],color:EP.glint(),brush:'round',size:6,load:1.3,taper:[.2,.4],clean:true});
p.dab({x:484,y:1144,color:EP.glint(),size:5,brush:'round',load:1.3});
// ---- near wing (banked down): upper surface in half-light, a cool underside strip along the trailing edge, dark leading edge; root over the hull's lower side
plane([520,1222],[612,1214],[380,1344],[420,1350],8,EP.goldHalf,19,{thin:.42,stir:.45});
plane([556,1218],[612,1214],[470,1280],[500,1284],3,EP.gold,12,{thin:.4,stir:.45,load:1.1});
plane([520,1222],[546,1221],[380,1344],[398,1346],4,EP.under,11,{thin:.45,stir:.5});
plane([596,1214],[612,1214],[416,1349],[426,1350],3,EP.edgeD,6,{thin:.5,load:.9});
BL([[380,1348],[400,1340]],18,.4);
// ---- highlights: knife on the far wing's leading edge (left of the canopy only), the hull's top ridge, a bright touch on the nose
p.stroke({points:[[432,1118,.6],[380,1104,.9],[320,1086,.4]],color:EP.goldHi(),brush:'knife',size:6,load:1.25,taper:[.1,.4],clean:true});
p.stroke({points:[[395,1186,.5],[420,1172,.9],[444,1166,.4]],color:EP.hullHi(),brush:'knife',size:5,load:1.2,taper:[.1,.4],clean:true});
p.stroke({points:[[616,1150,.5],[670,1158,.9],[716,1176,.3]],color:EP.hullHi(),brush:'knife',size:5,load:1.2,taper:[.2,.4],clean:true});
