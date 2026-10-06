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

// ---- 22_near_cumulus.body.js ----
// 22: the three near masses, each one big form with its own silhouette: left = a tall tower with wide shoulders (nearest the sun), centre = a long flat-topped bank under the island (largest, its right end in the island's shadow), right = a low rolling one. Deep violet valleys between them.
p.wipe();
const dimf=(x,y)=>ISL(x,y);
// ---- LEFT MASS
const leftPoly=[[-60,1230],[40,1180],[150,1150],[260,1170],[330,1110],[380,1060],[430,1040],[480,1055],[530,1100],[580,1130],[680,1150],[780,1170],[840,1210],[870,1260],[870,1345],[-60,1350]];
massFill(leftPoly,70,{dens:1.4});
bulge({cx:170,cy:1225,rx:250,ry:95,warm:.8,sz:110,n:1.3,k1:.06,k2:.03});           // wide flat shoulder, huge strokes
bulge({cx:720,cy:1215,rx:170,ry:75,warm:.6,sz:80,n:1.1,k1:.1});                      // right shoulder
bulge({cx:440,cy:1145,rx:125,ry:105,warm:.75,sz:90,near:true,n:1.4,k1:.12,k2:.06});  // the tall crown, brightest and thickest
bulge({cx:585,cy:1135,rx:60,ry:45,warm:.65,sz:34,n:.8,k1:.14});                      // a small lump (3x smaller)
belly([[-60,1262],[150,1255],[400,1265],[650,1258],[840,1262],[880,1300],[850,1350],[-60,1355]],56,{dens:1.5});
// ---- CENTRE MASS: a long, low, flat-topped bank under the island (x 900-1700, top near y 1230), one crisp lit top edge, its right half in the island's soft shadow
const bankTop=[[900,1262],[940,1240],[1000,1230],[1120,1224],[1250,1222],[1400,1226],[1540,1234],[1640,1250],[1700,1290]];
const bankPoly=bankTop.concat([[1725,1340],[1730,1455],[890,1455],[880,1340]]);
const bankDim=(x)=>clamp((x-1250)/400,0,1)*.5;
const bankLit=(x)=>{const c=p.random()<.3?CL.litPink():CL.lit(.55);const d=bankDim(x);if(d>0)c.push(['cobalt_violet',d*.2],['ultramarine',d*.12],['raw_umber',d*.05]);return c;};
massFill(bankPoly,80,{dens:1.3});
// body: halftone and the shadow belly in long horizontal strokes
cover([[900,1300],[1700,1310],[1725,1340],[1730,1455],[890,1455],[880,1340]],80,(x,y)=>{const u=(y-1300)/155;const c=u<.35?CL.halfD():CL.shad();const d=bankDim(x);if(d>0)c.push(['ultramarine',d*.08],['cobalt_violet',d*.08]);return c;},{dens:1.4,len:4,ang:.01,angJ:.06,o:{brush:'flat',load:.9,thin:.6,edge:.45,taper:[.15,.2],stir:.7}});
// the flat-lit top plane: big horizontal strokes, cream at left, cooler toward the right
for(let i=0;i<52;i++){const x=R(930,1660),y=R(1226,1300);const len=R(250,480),sz=R(50,90);S(x,y,len,R(-.03,.03),bankLit(x),sz,{brush:'flat',load:R(1.15,1.4),thin:.28,edge:.15,taper:[.1,.15],stir:.5,clean:i<4});}
// rounded front edge of the bank: strokes curving down from the top plane into the halftone
for(let i=0;i<14;i++){const x=R(920,1680);const pts=[[x+R(-30,30),1250+R(-10,10),.6],[x+R(-10,10),1285,.95],[x+R(-20,20),1320+R(-10,10),.5]];F(pts,p.random()<.5?CL.half():bankLit(x),R(30,50),{load:1.05,thin:.4,edge:.35,taper:[.2,.4],stir:.55});}
// melt the terminator (top plane into halftone) along the bank, only there
for(let i=0;i<10;i++){const x=R(900,1700);BL([[x-120,1292+R(-6,6)],[x,1300+R(-6,6)],[x+120,1294+R(-6,6)]],44,.4);}
// the crisp lit top edge against the violet valley behind it (thick, taper 0, clean), brighter at the left
for(let i=0;i<bankTop.length-1;i++){const a=bankTop[i],b=bankTop[i+1];for(let k=0;k<2;k++){const o=k*R(6,12);F([[a[0],a[1]+o+R(0,4),.85],[(a[0]+b[0])/2,(a[1]+b[1])/2+o+R(-2,4),.95],[b[0],b[1]+o+R(0,4),.75]],bankLit((a[0]+b[0])/2),R(20,32),{load:1.45,thin:.2,edge:0,taper:0,stir:.5,clean:true});}}
belly([[890,1372],[1100,1368],[1300,1380],[1500,1372],[1725,1368],[1730,1455],[890,1455]],60,{dens:1.4});
// island's soft shadow over the bank's right half: a few thin cool veils, melted
for(let i=0;i<8;i++){const x=R(1320,1720),y=R(1300,1420);S(x,y,R(160,320),R(-.03,.03),CL.islShad(),R(50,80),{brush:'flat',load:.8,thin:.6,edge:.6,opacity:R(.1,.18),taper:[.2,.2]});}
blendPoly([[1300,1300],[1730,1300],[1730,1450],[1300,1450]],80,.35,0,20);
// ---- RIGHT: the dominant form, a tall cumulus tower (x 1850-2350, crown near y 1040), built from very large strokes
const towerPoly=[[1800,1432],[1840,1330],[1860,1240],[1890,1170],[1930,1095],[1990,1050],[2070,1036],[2150,1058],[2220,1115],[2280,1200],[2330,1300],[2350,1432]];
const litT=()=>{const c=CL.lit(.5);c.push(['titanium_white',.4]);return c;};
massFill(towerPoly,90,{dens:1.2});
// the tower as one big rounded form: lit cap upper-left, halftone, deep violet right flank, from very large strokes
bulge({cx:2085,cy:1275,rx:265,ry:235,warm:.5,sz:135,near:true,n:2.2,k1:.14,k2:.07});
// its right flank and base restated darker, big strokes curving down the form
for(let i=0;i<16;i++){const t=R(0,1);const x0=lerp(2170,2310,t)+R(-30,30),y0=lerp(1110,1330,t);const pts=[[x0-30*(1-t),y0-R(30,70),.6],[x0+R(-10,10),y0,.95],[x0+R(10,30),y0+R(50,100),.5]];F(pts,t>.5?CL.trough():CL.shad(),R(70,115),{load:.85,thin:.6,edge:.45,taper:[.15,.25],stir:.7,opacity:.85});}
for(let i=0;i<8;i++){S(R(1850,2320),R(1345,1420),R(200,380),R(-.03,.03),CL.shad(),R(60,95),{brush:'flat',load:.85,thin:.6,edge:.5,taper:[.15,.2],stir:.7});}
// rounded shoulder on the left, half-lit
for(let i=0;i<8;i++){const a=R(-3.0,-2.0),w=R(.5,.9);arcOn(1935,1260,115,115,null,a-w/2,a+w/2,R(.6,1.0),p.random()<.5?CL.half():litT(),R(60,95),{load:1.1,thin:.35,edge:.25,taper:[.12,.2],stir:.55});}
// the bright flat-lit top plane at the upper left: 80-150 px strokes
const litPlane=[[1905,1150],[1950,1075],[2010,1045],[2090,1038],[2160,1062],[2140,1130],[2060,1175],[1960,1215]];
cover(litPlane,100,litT,{dens:1.5,len:2.2,ang:-.3,angJ:.3,o:{brush:'flat',load:1.35,thin:.22,edge:.12,taper:[.08,.15],stir:.7,clean:true}});
for(let i=0;i<3;i++){const a=R(-2.6,-1.8),w=R(.6,.9);arcOn(2085,1275,265,235,null,a-w/2,a+w/2,R(.8,.96),litT(),R(90,140),{load:R(1.3,1.45),thin:.22,edge:.1,taper:[.08,.15],stir:.7,clean:true});}
// the top plane is flat: big near-horizontal strokes across the crown
for(let i=0;i<14;i++){const x=R(1930,2140),y=R(1050,1150);S(x,y,R(160,320),R(-.25,.05),litT(),R(70,120),{brush:'flat',load:R(1.3,1.45),thin:.22,edge:.12,taper:[.08,.15],stir:.7,clean:i<3});}
// terminator: a few soft strokes down the diagonal only
for(let i=0;i<6;i++){const t=R(0,1);const x=lerp(2160,2000,t),y=lerp(1090,1310,t);BL(seg(x,y,R(90,150),SUNA+R(-.3,.3),0,3),60,.38);}
// the sharp found edge along the lit crown against the sky haze: thick, crisp, clean
const crown=[[1925,1100],[1960,1068],[2010,1046],[2070,1038],[2130,1050],[2170,1072]];
for(let i=0;i<crown.length-1;i++){const a=crown[i],b=crown[i+1];for(let k=0;k<2;k++){const o=k*R(8,14);F([[a[0],a[1]+o,.85],[(a[0]+b[0])/2,(a[1]+b[1])/2+o+R(-2,3),.95],[b[0],b[1]+o,.75]],CL.lit(.6),R(22,34),{load:1.45,thin:.2,edge:0,taper:0,stir:.5,clean:true});}}
belly([[1800,1350],[2000,1340],[2200,1352],[2360,1340],[2360,1432],[1790,1432]],64,{dens:1.5});
for(let i=0;i<12;i++){const x=R(1800,2360);BL([[x-140,1340+R(-10,10)],[x,1352+R(-10,10)],[x+140,1342+R(-10,10)]],70,.5);}
for(let i=0;i<6;i++){const x=R(2240,2370);BL([[x-30,1150+R(0,40)],[x+10,1250],[x-20,1340]],60,.45);}
// one found edge on the left tower's crown
for(let i=0;i<3;i++){arcOn(440,1145,125,105,null,SUNA-.5+R(-.2,.2),SUNA+.3+R(-.2,.2),R(.9,.98),CL.lit(.8),R(22,34),{load:1.45,thin:.2,edge:0,taper:[.05,.15],stir:.5,clean:true});}
// ---- valleys: deep violet troughs between the masses, curved, melted
for(const v of [[850,1200,900,1330],[1745,1240,1790,1370]]){const [x0,y0,x1,y1]=v;
  for(let i=0;i<5;i++){const t0=R(0,.3),t1=R(.7,1);const pts=[[lerp(x0,x1,t0)+R(-14,14),lerp(y0,y1,t0),.5],[(x0+x1)/2+R(-20,20),(y0+y1)/2+R(-10,10),.9],[lerp(x0,x1,t1)+R(-14,14),lerp(y0,y1,t1),.5]];F(pts,CL.shad(),R(30,50),{load:.85,thin:.6,edge:.6,taper:[.3,.4],stir:.7,opacity:.7});}
  BL([[x0-10,y0],[(x0+x1)/2,(y0+y1)/2],[x1+10,y1]],60,.5);BL([[x0-40,(y0+y1)/2],[x1+40,(y0+y1)/2]],50,.4);}
