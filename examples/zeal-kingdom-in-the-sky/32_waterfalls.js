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

// ---- 32_waterfalls.body.js ----
// 32_waterfalls (round 3): water, not icicles. Each fall: a crest of broken white at the lip (short thick touches), a body of 3-5 ribbons of varied width that wander, merge and split, thin bluer sheets in the rock's shadow, feathered ends that turn into drifting spray; the main fall bursts on the second stratum and is the brightest, thickest white on the island. Then dry.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const Wlit=[['titanium_white',4],['cerulean',.1],['naples_yellow',.08]];
const Wmid=[['titanium_white',3],['cerulean',.35],['cobalt_blue',.1]];
const Wsh=[['titanium_white',1.8],['cerulean',.5],['cobalt_blue',.4],['cobalt_violet',.35]];
const Mist=[['titanium_white',2.5],['cobalt_violet',.4],['cerulean',.2],['ultramarine',.15]];
const MistW=[['titanium_white',2.6],['naples_yellow',.5],['cobalt_violet',.2]];
const Rockdk=[['ultramarine',1],['dioxazine_purple',.5],['burnt_umber',.4],['titanium_white',.3]];
// cl: [[x,y,halfwidth],...] lip to foot; b: brightness/scale; o.top crest; o.foot spray; o.n ribbons
function sheet(cl,b,o){o=o||{};const last=cl[cl.length-1],first=cl[0];
  const at=t=>{const k=Math.min(cl.length-2,Math.max(0,Math.floor(t*(cl.length-1))));const u=t*(cl.length-1)-k;return [lerp(cl[k][0],cl[k+1][0],u),lerp(cl[k][1],cl[k+1][1],u),lerp(cl[k][2],cl[k+1][2],u)];};
  // dark wet rock beside the sheet near the top, and a thin blue shadow sheet behind the ribbons on the right
  for(const s of [-1,1])p.stroke({points:[[first[0]+s*(first[2]+10),first[1]+8,.6],[at(.35)[0]+s*(at(.35)[2]+12),at(.35)[1],.9],[at(.65)[0]+s*(at(.65)[2]+10),at(.65)[1],.4]],color:M(Rockdk,.15),brush:'filbert',size:R(12,18),load:.75,thin:.6,edge:.6,taper:[.1,.5],stir:.85});
  {const pts=[];for(let k=0;k<6;k++){const q=at(k/5);pts.push([q[0]-q[2]*.15+R(-2,2),q[1],k===0?.6:k===5?.35:.9]);}p.stroke({points:pts,color:M(Wmid,.1),brush:'flat',size:first[2]*1.3,load:1.2,thin:.35,opacity:o.foot?.75:.85,taper:[.05,o.foot?.55:.3],edge:.5,stir:.8,clean:true});
   const ps=[];for(let k=0;k<5;k++){const q=at(k/4);ps.push([q[0]+q[2]*.5,q[1],k===0?.5:k===4?.3:.8]);}p.stroke({points:ps,color:M(Wsh,.12),brush:'flat',size:first[2]*.8,load:.8,thin:.5,opacity:.6,taper:[.05,.5],edge:.6,stir:.85});}
  // ribbons: 3-5, varied width, each wanders sideways so neighbours merge and split; lit left ones thick white, right ones thin blue
  const n=o.n||(3+Math.floor(R(0,2.6)));
  for(let r=0;r<n;r++){const f=(r+R(.2,.8))/n;const lit=f<.5;const c=lit?ML(Wlit,Wmid,f*1.4):ML(Wmid,Wsh,(f-.5)/.5);
    const w=(lit?R(8,22):R(4,10))*Math.sqrt(b);const ph=R(0,TAU),amp=first[2]*R(.3,.7),fr=R(.8,2.2),ph2=R(0,TAU);const tend=o.foot?R(.55,1):R(.8,1);
    const pts=[];const m=7;for(let k=0;k<m;k++){const t=lerp(0,tend,k/(m-1));const q=at(t);const x=q[0]+(f*2-1)*q[2]*.8+Math.sin(ph+t*fr*Math.PI)*amp*(.3+t)+Math.sin(ph2+t*5)*amp*.2*t;pts.push([x+R(-1.5,1.5),q[1],k===0?.55:lerp(.95,.3,t)]);}
    p.stroke({points:pts,color:M(c,.1),brush:'flat',size:w,load:lit?1.45:1,thin:lit?.2:.45,taper:[.1,o.foot?.6:.45],edge:lit?.1:.35,stir:.8,clean:r===0});
    // a split: a short second strand peeling off part way
    if(p.random()<.8){const t0=R(.15,.6);const q0=at(t0),q1=at(Math.min(1,t0+.3));const side=p.random()<.5?-1:1;
      p.stroke({points:[[pts[Math.floor(t0*(m-1))][0],q0[1],.5],[pts[Math.floor(t0*(m-1))][0]+side*w*.8,lerp(q0[1],q1[1],.5),.85],[pts[Math.floor(t0*(m-1))][0]+side*w*1.6,q1[1],.25]],color:M(c,.1),brush:'flat',size:w*R(.4,.7),load:lit?1.2:.8,thin:lit?.3:.5,taper:[.15,.6],edge:.2,stir:.8});}}
  // sun-catching lights down the lit edge, thickest paint
  for(let i=0;i<Math.round(5*b)+1;i++){const t=R(.05,.5);const q=at(t);const x=q[0]-q[2]*R(.5,.85),y=q[1];
    p.stroke({points:[[x,y,.6],[x+R(-2,2),y+R(30,60),.95],[x+R(-3,3),y+R(70,120),.3]],color:M(Wlit,.06),brush:'filbert',size:R(6,11),load:1.45,thin:.2,taper:[.1,.6],clean:true});}
  if(o.top){// crest: broken white at the lip, short thick touches, a shadow line under
    p.stroke({points:[[first[0]-first[2]-8,first[1]+6,.6],[first[0]-first[2]*.3,first[1]+1,.95],[first[0]+first[2]*.4,first[1]+2,.9],[first[0]+first[2]+6,first[1]+7,.5]],color:M(Rockdk,.1),brush:'filbert',size:9,load:.7,thin:.6,taper:[.2,.2],stir:.9});
    for(let i=0;i<Math.round(first[2]/3)+5;i++){const x=first[0]+R(-first[2]-6,first[2]+6),y=first[1]-R(0,12);S(x,y,R(8,20),R(-.6,.6),M(i%3===2?Wmid:Wlit,.06),R(7,14)*Math.sqrt(b),{load:1.5,thin:.15,taper:[.25,.3],edge:.05,stir:.7,clean:i===0});}}
  if(o.foot){// spray: feathered ends become drifting veils, warm on the left, melted
    const k=Math.round(8*b)+4;
    for(let i=0;i<k;i++){const d=R(0,1);const x=last[0]+R(-1,1)*(15+50*d)*b,y=last[1]-40+R(0,70)*d;const warm=x<last[0];
      S(x,y,R(70,150)*b,R(-.15,.15),M(warm?ML(Mist,MistW,.6):Mist,.15),R(8,16),{load:.7,thin:.6,opacity:R(.14,.28),edge:.9,taper:[.45,.45],stir:.9});}
    for(let i=0;i<5;i++)SB(seg(last[0]+R(-40,40)*b,last[1]+R(-20,50),R(60,110),R(-.5,.5),0,3),50,.45);}}
sheet([[1268,832,52],[1270,900,50],[1272,1004,46]],1,{top:true,n:5});
// the burst on the second stratum: thick white thrown up, with veils
for(let i=0;i<16;i++){const x=R(1212,1328),y=R(996,1022);S(x,y,R(14,34),R(-.5,.5),M(i%4===3?Wmid:Wlit,.08),R(6,13),{load:1.5,thin:.15,taper:[.2,.3],edge:.05,stir:.7,clean:i===0});}
for(let i=0;i<10;i++){const x=R(1215,1325);p.stroke({points:[[x,1004,.9],[x+R(-6,6),1004-R(12,30),.6],[x+R(-10,10),1004-R(30,50),.15]],color:M(Wlit,.06),brush:'round',size:R(3,6),load:1.3,thin:.2,taper:[0,.6]});}
for(let i=0;i<5;i++)S(R(1200,1340),R(990,1036),R(50,100),R(-.15,.15),M(Mist,.15),R(8,13),{load:.7,thin:.6,opacity:R(.15,.25),edge:.9,taper:[.4,.4],stir:.9});
sheet([[1248,1014,27],[1245,1080,25],[1240,1150,21],[1232,1215,15]],1,{foot:true,n:4});
sheet([[1296,1014,20],[1300,1080,18],[1297,1150,15],[1292,1205,11]],.9,{foot:true,n:3});
sheet([[1715,820,24],[1720,890,23],[1730,960,21],[1728,1030,19],[1720,1090,16],[1708,1140,13]],.8,{top:true,foot:true,n:4});
sheet([[1015,807,13],[1022,860,13],[1033,920,12],[1033,975,10],[1026,1025,8]],.6,{top:true,foot:true,n:3});
p.dry();
