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

// ---- 21_far_cumulus.body.js ----
// 21: recession: tiny thin pink far rows at the horizon (8-18 px strokes, melted), then the middle deck as flat horizontal drifts of thin cloud, tops warm toward the sun at left.
p.wipe();
const W=2400;
// far rows: many tiny strokes, pink-cream over a thin violet underside
const rows=[[200,1006,260,7],[620,1012,300,8],[1050,1004,240,6],[1500,1013,330,9],[1950,1006,260,7],[2300,1012,220,8],[-60,1018,200,6],[850,1026,160,5],[1250,1030,200,5],[1750,1028,190,5],[2150,1032,160,5],[420,1038,180,5],[1400,1042,220,5],[2000,1045,160,4]];
for(const r of rows){const [cx,cy,rx,ry]=r;const far=cy<1016;const w=clamp(1-cx/1800,0,1);
  for(let i=0;i<Math.round(rx/25);i++)S(cx+R(-rx,rx),cy+ry*R(.8,1.8),R(40,90),R(-.02,.02),CL.pinkgrey(),R(8,14),{brush:'flat',load:.8,thin:.65,edge:.5,taper:[.2,.2],opacity:.8});
  for(let i=0;i<Math.round(rx/13);i++){const x=cx+R(-rx,rx),y=cy+R(-ry,ry);S(x,y,R(30,80),R(-.02,.02),far?CL.haze():CL.pinkgrey(),R(8,16),{brush:'flat',load:R(.8,.95),thin:.5,edge:.5,taper:[.2,.25],stir:.5,opacity:far?.95:.85});}
  for(let i=0;i<Math.round(rx/22);i++)S(cx-rx*R(-.4,.8),cy-ry*R(0,.8),R(40,90),R(-.015,.015),CL.lit(.3+.5*w),R(8,15),{brush:'flat',load:1,thin:.45,edge:.4,taper:[.25,.3],stir:.4});
  BL([[cx-rx,cy+ry*1.5],[cx,cy+ry*2],[cx+rx,cy+ry*1.6]],ry*3.5,.5);BL([[cx-rx,cy-ry*1.4],[cx,cy-ry*1.8],[cx+rx,cy-ry*1.3]],ry*3,.4);
}
blendPoly(RECT(0,995,W,1060),40,.45,0,80);
// middle deck: flat horizontal drifts of thin cloud, each a long low lens: violet underside, pale body, warm lit top edge toward the sun
const drifts=[[90,1120,200,14],[500,1100,160,10],[760,1165,240,16],[1000,1148,170,12],[1300,1132,150,10],[1650,1190,230,16],[1870,1168,170,12],[2080,1125,160,11],[2300,1150,200,14],[300,1190,180,13],[1150,1205,200,14],[2200,1205,180,12],[600,1215,150,11]];
for(const d of drifts){const [cx,cy,rx,ry]=d;const w=clamp(1-cx/1900,0,1),dim=ISL(cx,cy);
  const und=()=>{const c=CL.shad();if(dim)c.push(['ultramarine',dim*.1]);return c;};
  for(let i=0;i<Math.round(rx/32);i++)S(cx+R(-rx,rx),cy+ry*R(.3,1.3),R(160,320),R(-.015,.015),und(),R(12,22),{brush:'flat',load:.8,thin:.65,edge:.5,taper:[.2,.2],opacity:.7,stir:.7});
  for(let i=0;i<Math.round(rx/20);i++){const x=cx+R(-rx,rx),y=cy+R(-ry*.6,ry*.5);const c=p.random()<.6?CL.half():CL.halfD();if(dim)c.push(['ultramarine',dim*.1],['cobalt_violet',dim*.1]);S(x,y,R(160,340),R(-.02,.02),c,R(14,28),{brush:'flat',load:R(.85,1),thin:.5,edge:.45,taper:[.2,.25],stir:.45});}
  for(let i=0;i<Math.round(rx/40*(0.6+w));i++){const x=cx-rx*R(-.6,.9),y=cy-ry*R(.3,1.1);const c=CL.lit(.3+.6*w);if(dim)c.push(['cobalt_violet',dim*.1]);S(x,y,R(120,280),R(-.02,.02),c,R(16,30),{brush:'flat',load:1.15,thin:.38,edge:.3,taper:[.2,.25],stir:.5});}
  BL([[cx-rx,cy+ry*1.6],[cx,cy+ry*2],[cx+rx,cy+ry*1.6]],ry*3,.5);BL([[cx-rx,cy-ry*1.2],[cx,cy-ry*1.5],[cx+rx,cy-ry*1.1]],ry*2.5,.35);
  for(let i=0;i<3;i++)BL(seg(cx+R(-rx,rx),cy,ry*R(3,5),R(-.1,.1),0,3),ry*2.5,.4);
}
// a few haze veils to push the whole middle row back

