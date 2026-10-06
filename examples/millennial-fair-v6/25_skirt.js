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
// 24 skirt, fascia, posts, steps: the stage front in shade. Vertical boards with dark seams, the deck's overhang shadow at the top, warm bounce from the sunlit plaza at the foot, a thin cold reflection of the gate across the middle; steps as timber blocks with a lit tread and nosing.
p.wipe();p.dry();const pk=a=>a[Math.floor(R(0,a.length))%a.length];
const yb=x=>1362-40*x/2400;
const FY=1097,SY=1130;
// fascia: horizontal front boards of the deck, in short pieces with staggered end joints
for(let x=-20;x<2440;){const w=R(120,260);const x1=Math.min(2440,x+w);const ym=(FY+SY)/2+1;
 p.stroke({points:[[x,ym,.9],[(x+x1)/2,ym+R(-.5,.5),.95],[x1,ym,.9]],color:M(pk([[['van_dyke_brown',1],['burnt_sienna',.55],['alizarin_crimson',.08],['titanium_white',.1]],[['raw_umber',1],['burnt_sienna',.5],['titanium_white',.14]],[['burnt_umber',1],['venetian_red',.4],['titanium_white',.1]]]),.2),brush:'flat',size:34,angle:Math.PI/2,load:1.05,thin:.35,taper:0,edge:.1,stir:.4});
 p.stroke({points:[[x1,FY+1],[x1+R(-.5,.5),SY-1]],color:M([['van_dyke_brown',1],['ultramarine',.12]],.2),brush:'flat',size:2.6,load:1,thin:.3,opacity:.85,taper:.05});
 x=x1;}
// sunlit top edge of the fascia and the shadow under it
p.stroke({points:[[0,FY+1.5],[800,FY+1],[1600,FY+1.5],[2400,FY+1]],color:M([['burnt_sienna',1],['titanium_white',1.1],['yellow_ochre',.3]],.2),brush:'flat',size:3.2,angle:Math.PI/2,load:1,thin:.3,opacity:.7,taper:0});
// skirt boards
for(let x=-10;x<2430;){const w=R(34,44);const xc=x+w/2;const y0=SY,y1=yb(xc)+2;
 const dk=R(0,1);const top=M([['van_dyke_brown',1],['ivory_black',.35],['dioxazine_purple',.08],['burnt_sienna',.18]],.2);
 const mid=M([['van_dyke_brown',1],['ivory_black',.55],['burnt_sienna',.2],['alizarin_crimson',.05],['ultramarine',.05]],.2);
 const low=M([['burnt_umber',1],['burnt_sienna',.7],['raw_sienna',.15],['titanium_white',.12]],.2);
 const h=y1-y0;
 p.stroke({points:[[xc,y0,.9],[xc+R(-.6,.6),y0+h*.5,.95],[xc+R(-.6,.6),y1,.9]],color:dk<.5?mid:M([['burnt_umber',1],['van_dyke_brown',.7],['ivory_black',.35],['burnt_sienna',.12]],.2),brush:'flat',size:w*.96,angle:0,load:1.1,thin:.35,taper:0,edge:.1,stir:.4,clean:true});
 // seam to the right of this board and a lit bevel on its left edge
 p.stroke({points:[[x+w,y0],[x+w+R(-.5,.5),y0+h*.5],[x+w,y1]],color:M([['ivory_black',1],['van_dyke_brown',.6]],.2),brush:'flat',size:R(2.2,3.4),load:1,thin:.3,opacity:R(.6,.9),taper:[.05,.1]});
 if(R(0,1)<.7)p.stroke({points:[[x+2,y0+h*R(.05,.3)],[x+2+R(-.5,.5),y0+h*R(.5,.95)]],color:M([['burnt_sienna',1],['titanium_white',.6],['yellow_ochre',.1]],.3),brush:'flat',size:1.8,load:.9,thin:.3,opacity:R(.18,.4),taper:[.3,.4]});
 x+=w+R(0,1.5);}
// grain streaks and warm/cool mottling on the skirt (dry, low)
for(let i=0;i<260;i++){const x=R(0,2400),y=R(SY+10,yb(x)-10),l=R(30,120);const lt=R(0,1)<.35;
 p.stroke({points:[[x,y,.7],[x+R(-1.5,1.5),y+l*.5,.8],[x+R(-2,2),y+l,.6]],color:lt?M([['burnt_sienna',1],['titanium_white',.7],['alizarin_crimson',.1]],.3):M([['ivory_black',1],['van_dyke_brown',.8]],.3),brush:'flat',size:R(2,6),load:R(.3,.6),thin:.3,opacity:R(.2,.45),taper:[.3,.4],scumble:lt});}
// posts: near-black battens with a lit left edge
for(const px of [133,353,780,993,1196,1400,1600,1797,1987,2184,2373]){const x=px+R(-2,2);const b=yb(x)-4;
 p.stroke({points:[[x,SY-3,.9],[x+R(-.7,.7),(SY+b)/2,.95],[x,b,.9]],color:M([['ivory_black',1],['van_dyke_brown',.4],['dioxazine_purple',.08]],.2),brush:'flat',size:R(17,21),angle:0,load:1.1,thin:.3,taper:0,edge:.05});
 p.stroke({points:[[x-8,SY],[x-8.5,(SY+b)/2],[x-8,b]],color:M([['burnt_sienna',1],['titanium_white',.4]],.3),brush:'flat',size:2.2,load:.9,thin:.3,opacity:.32,taper:[.2,.4]});}
p.dry();
// overhang shadow: dark glaze at the top of the skirt, warm bounce glaze at the foot, a cold reflection of the gate across the middle
for(let x=-60;x<2440;x+=R(45,70))p.stroke({points:[[x,SY+8],[x+R(120,180),SY+12]],color:M([['ivory_black',1],['van_dyke_brown',.6],['dioxazine_purple',.2]],.2),brush:'flat',size:R(26,34),angle:Math.PI/2,load:.9,thin:.55,opacity:R(.3,.5),taper:[.2,.2],edge:.5});
for(let x=-40;x<2440;x+=R(60,120)){const y=yb(x)-12;p.stroke({points:[[x,y],[x+R(70,130),y+R(-2,2)]],color:M([['burnt_sienna',1],['raw_sienna',.4],['titanium_white',.25]],.2),brush:'flat',size:R(24,36),angle:Math.PI/2,load:.8,thin:.55,opacity:R(.07,.14),taper:[.25,.25],edge:.5});}
// contact band: the foot of the stage in shadow, hiding the ragged ends of the boards
for(let x=-60;x<2440;x+=180)p.stroke({points:[[x,yb(x)+2],[x+90,yb(x+90)+2],[x+200,yb(x+200)+2]],color:M([['ivory_black',1],['van_dyke_brown',.8],['dioxazine_purple',.2]],.2),brush:'flat',size:16,angle:Math.PI/2,load:1,thin:.35,opacity:.9,taper:[.1,.1],edge:.2});
p.dry();
// steps: upper block (x560-1104) and lower block (x444-1107): treads lit warm, risers in shade, nosing catches light, contact shadow below
const step=(x0,x1,yt0,yt1,yr1)=>{
 // tread: one broad warm stroke each way, then a few grain streaks
 p.stroke({points:[[x0,(yt0+yt1)/2],[(x0+x1)/2,(yt0+yt1)/2+R(-.4,.4)],[x1,(yt0+yt1)/2]],color:M([['burnt_sienna',1],['titanium_white',.8],['yellow_ochre',.25],['cadmium_orange',.06]],.2),brush:'flat',size:yt1-yt0+3,angle:Math.PI/2,load:1.15,thin:.3,taper:0,edge:.05,stir:.4});
 for(let i=0;i<5;i++){const y=R(yt0+2,yt1-2),x=R(x0,x1-120);p.stroke({points:[[x,y],[x+R(80,260),y+R(-.6,.6)]],color:M([['burnt_sienna',1],['van_dyke_brown',.5]],.3),brush:'flat',size:R(1.6,2.6),load:.6,thin:.3,opacity:.4,taper:[.3,.4]});}
 // riser: two boards with a seam, shaded warm brown
 const rm=(yt1+yr1)/2;
 for(const [ya,yb2] of [[yt1,rm],[rm,yr1]]){for(let x=x0;x<x1;){const w=R(200,360);const xe=Math.min(x1,x+w);const ym=(ya+yb2)/2;p.stroke({points:[[x,ym],[(x+xe)/2,ym+R(-.5,.5)],[xe,ym]],color:M([['van_dyke_brown',1],['burnt_sienna',.75],['titanium_white',.12],['dioxazine_purple',.05]],.15),brush:'flat',size:yb2-ya+2,angle:Math.PI/2,load:1.1,thin:.35,taper:0,edge:.05,stir:.5});
  p.stroke({points:[[xe,ya],[xe+R(-.5,.5),yb2]],color:M([['ivory_black',1],['van_dyke_brown',.5]],.2),brush:'flat',size:2.2,load:1,thin:.3,opacity:.75,taper:.05});x=xe;}}
 p.stroke({points:[[x0,rm],[(x0+x1)/2,rm+R(-.4,.4)],[x1,rm]],color:M([['ivory_black',1],['van_dyke_brown',.5]],.2),brush:'flat',size:2.6,angle:Math.PI/2,load:1,thin:.3,opacity:.8,taper:0});
 p.stroke({points:[[x0,rm+2.6],[(x0+x1)/2,rm+2.6],[x1,rm+2.6]],color:M([['burnt_sienna',1],['titanium_white',.7]],.2),brush:'flat',size:1.8,angle:Math.PI/2,load:.9,thin:.3,opacity:.3,taper:.2});
 p.stroke({points:[[x0,yt1+1.5],[(x0+x1)/2,yt1+1.5],[x1,yt1+1.5]],color:M([['titanium_white',1],['burnt_sienna',.7],['yellow_ochre',.35]],.2),brush:'flat',size:3.4,angle:Math.PI/2,load:1.1,thin:.25,opacity:.85,taper:0});
 p.stroke({points:[[x0,yt1+10],[x1,yt1+10]],color:M([['ivory_black',1],['van_dyke_brown',.7]],.2),brush:'flat',size:10,angle:Math.PI/2,load:.8,thin:.55,opacity:.3,taper:0,edge:.6});
 p.stroke({points:[[x0,yr1-9],[x1,yr1-9]],color:M([['burnt_sienna',1],['raw_sienna',.5],['titanium_white',.3]],.2),brush:'flat',size:12,angle:Math.PI/2,load:.8,thin:.55,opacity:.22,taper:0,edge:.6});
 for(let i=0;i<24;i++){const x=R(x0,x1),y=R(yt1+4,yr1-3);p.stroke({points:[[x,y,.7],[x+R(40,140),y+R(-1,1),.8]],color:R(0,1)<.4?M([['burnt_sienna',1],['titanium_white',.6]],.3):M([['ivory_black',1],['van_dyke_brown',.8]],.3),brush:'flat',size:R(1.6,3.2),load:R(.3,.6),thin:.3,opacity:R(.15,.3),taper:[.3,.4]});}
};
step(560,1104,1193,1210,1313);
step(444,1107,1311,1327,1449);
// contact shadows under the lower step and on the ground in front
p.stroke({points:[[444,1456],[800,1458],[1130,1452]],color:M([['dioxazine_purple',1],['van_dyke_brown',1],['ultramarine',.3]],.2),brush:'flat',size:18,angle:Math.PI/2,load:.8,thin:.5,opacity:.4,taper:[.1,.2],edge:.6});
