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
// 26 telepods: brass coils built ring by ring (dark core, tube body lit from the left, hot specular crest, reflected ground light, dark groove), polished steel domes that mirror the sky above and the dark trees and warm plaza below, with the gate's violet on the side that faces it.
p.wipe();p.dry();
const SKYT=[[0,'#c0c8e0'],[.5,'#9aa8d0'],[1,'#e4eaf8']];
function pod(o){const {cx,rx,cy,ry,colY,colRx,top,pitch,n,T,cHalf,brass,gateSide,seed,baseY}=o;
 // ---- coil core: dark interior seen in the grooves
 p.stroke({points:[[cx-cHalf,top+n*pitch*.5],[cx,top+n*pitch*.5],[cx+cHalf,top+n*pitch*.5]],color:M([['van_dyke_brown',1],['ivory_black',.6],['dioxazine_purple',.1]],.2),brush:'flat',size:n*pitch+T*.4,angle:Math.PI/2,load:1.1,thin:.3,taper:0,edge:0});
 // ---- rings
 for(let i=0;i<n;i++){const y0=top+i*pitch+T/2;const amp=(y0-830)*.075;const sag=t=>y0+amp*(1-Math.pow(2*t-1,2))*-1*-1*0+(-amp)*(1-Math.pow(2*t-1,2))*-1;
  const yAt=t=>y0+amp*(Math.pow(2*t-1,2)-1)*-1*-1; // arch above the horizon, sag below
  const path=(t0,t1,dy,k)=>{const pts=[];const m=k||6;for(let j=0;j<m;j++){const t=lerp(t0,t1,j/(m-1));pts.push([cx-cHalf+2*cHalf*t,yAt(t)+(dy||0),pr(j,m)]);}return pts;};
  const dark=brass.dark,mid=brass.mid,lit=brass.lit;
  // body in three runs, left lit, centre mid, right in shade
  p.stroke({points:path(.02,.98,T*.02,7).map((q,j,a)=>[q[0],q[1],.9]),color:M(mid,.18),brush:'filbert',size:T*.9,load:1.15,thin:.3,taper:[.04,.04],edge:.1,stir:.5});
  p.stroke({points:path(.02,.5,-T*.05,5).map(q=>[q[0],q[1],.9]),color:M(lit,.18),brush:'filbert',size:T*.62,load:1.15,thin:.3,taper:[.04,.5],edge:.3,stir:.45});
  p.stroke({points:path(.5,.99,T*.12,5).map(q=>[q[0],q[1],.9]),color:M(dark,.18),brush:'filbert',size:T*.6,load:1.1,thin:.3,taper:[.5,.04],edge:.3,stir:.45});
  // upper crest (sky reflection, warm pale) and the hot specular streak, left of centre
  const s0=R(.14,.26),s1=s0+R(.28,.42);
  p.stroke({points:path(s0-.04,s1+.1,-T*.2,5).map(q=>[q[0],q[1],.8]),color:M([['titanium_white',1],['cadmium_yellow',.18],['burnt_sienna',.1]],.2),brush:'filbert',size:T*.2,load:1.3,thin:.2,taper:[.3,.5],opacity:.8,clean:true});
  p.stroke({points:path(s0,s1,-T*.22,4).map(q=>[q[0],q[1],.9]),color:M([['titanium_white',3],['yellow_ochre',.1]],.2),brush:'filbert',size:T*.1,load:1.4,thin:.15,taper:[.3,.4],opacity:R(.85,1),clean:true});
  // reflected warm ground light low on the tube, then the dark groove under it
  p.stroke({points:path(.04,.9,T*.3,6).map(q=>[q[0],q[1],.8]),color:M([['cadmium_orange',1],['burnt_sienna',.8],['yellow_ochre',.3]],.25),brush:'filbert',size:T*.13,load:.9,thin:.3,taper:[.2,.3],opacity:R(.35,.6)});
  p.stroke({points:path(0,1,T*.5,6).map(q=>[q[0],q[1],.9]),color:M([['ivory_black',1],['van_dyke_brown',.6],['dioxazine_purple',.1]],.2),brush:'filbert',size:T*.16,load:1.1,thin:.3,taper:[.03,.03]});
  // ends of the ring turn away: darker, and violet from the gate on the gate side
  const ge=gateSide>0?[.8,1]:[0,.2];
  p.stroke({points:path(ge[0],ge[1],-T*.05,4).map(q=>[q[0],q[1],.9]),color:M([['dioxazine_purple',1],['ultramarine',.6],['titanium_white',.5],['quinacridone_rose',.15]],.25),brush:'filbert',size:T*.5,load:.8,thin:.45,taper:gateSide>0?[.6,.05]:[.05,.6],opacity:R(.22,.4),edge:.5});
  for(const [t0,t1] of [[0,.05],[.95,1]])p.stroke({points:path(t0,t1,0,3).map(q=>[q[0],q[1],.9]),color:M([['van_dyke_brown',1],['ivory_black',.5]],.2),brush:'filbert',size:T*.62,load:.9,thin:.4,taper:.4,opacity:.35,edge:.6});
 }
 // ---- dome: rows following the latitude, colour from what the steel mirrors (sky above, dark trees at the horizon, warm plaza below), lit from the left
 const dcol=(nx,ny)=>{ // nx -1..1 across, ny 0 (collar) .. 1 (crown)
  const sky=G(SKYT,ny*1.1);const tree=G([[0,'#3a4a48'],[1,'#566a66']],nx*.5+.5);const plaza=mixh('#a8805a','#6a5a58',nx*.5+.5);
  let c=ny>.38?sky:ny>.12?mixh(tree,sky,clamp((ny-.12)/.26,0,1)):mixh(plaza,tree,clamp(ny/.12,0,1));
  const lit=clamp(.55-nx*.62,0,1);c=mixh(c,'#fff4e0',lit*.28*(ny>.3?1:.4));c=mixh(c,'#242438',clamp(nx*.8-.1,0,.65));
  const g=gateSide>0?clamp(nx,0,1):clamp(-nx,0,1);c=mixh(c,'#8c78ff',g*g*.5);return c;};
 for(let ny=.015;ny<.99;ny+=o.rowStep||.05){const hw=rx*Math.sqrt(Math.max(.02,1-ny*ny));const y=cy-ry*ny;const sz=clamp(ry*.095,14,24);
  for(let x=cx-hw;x<cx+hw-4;){const len=R(70,150);const x1=Math.min(cx+hw,x+len);const nxm=((x+x1)/2-cx)/rx;const k=Math.pow(2*(((x+x1)/2-cx)/(2*hw)),2);
   const pts=[[x,y+3*Math.sin((x-cx)/hw*1.2)+R(-1,1),.8],[(x+x1)/2,y+R(-1,1),.9],[x1,y+3*Math.sin((x1-cx)/hw*1.2)+R(-1,1),.8]];
   p.stroke({points:pts,color:M([[dcol(nxm,ny+R(-.03,.03)),1],[dcol(nxm,ny+.06),.4]].map(a=>a),.3),brush:'filbert',size:sz*R(.9,1.2),load:1.1,thin:.35,taper:[.15,.15],edge:.2,stir:.5});if(x1>=cx+hw-1)break;x=x1-R(8,20);}}
 for(let ny=.05;ny<.95;ny+=.09){const hw=rx*Math.sqrt(Math.max(.02,1-ny*ny));const y=cy-ry*ny;for(let q=0;q<2;q++){const pts=[];for(let k=0;k<6;k++){const t=k/5;pts.push([cx-hw*.95+2*hw*.95*t,y+3*Math.sin((t*2-1)*1.2)+R(-2,2),.8]);}BL(pts,R(28,44),R(.45,.65));}}
 for(let k=0;k<16;k++){const x=cx+R(-.9,.9)*rx;const hw=Math.max(8,rx*Math.sqrt(Math.max(.02,1-Math.pow((x-cx)/rx,2))));BL([[x,cy-4,.8],[x+R(-10,10),cy-ry*.35*Math.sqrt(1-Math.pow((x-cx)/rx,2)),.8],[x+R(-14,14),cy-ry*.75*Math.sqrt(1-Math.pow((x-cx)/rx,2)),.8]],R(26,40),R(.3,.5));}
 // contour: the dome's own edge, a dark rim on the shade side and a thin lit one on the sun side, so the silhouette is drawn by form not by row ends
 {const pts=(a0,a1)=>{const q=[];for(let k=0;k<7;k++){const a=lerp(a0,a1,k/6);q.push([cx+Math.cos(a)*rx*.985,cy+Math.sin(a)*ry*.985,pr(k,7)]);}return q;};
  p.stroke({points:pts(-Math.PI*.5,-.05),color:M([['paynes_grey',1],['ivory_black',.5],['ultramarine',.3]],.2),brush:'filbert',size:13,load:1,thin:.35,taper:[.3,.1],opacity:.7,edge:.4});
  p.stroke({points:pts(-Math.PI*.98,-Math.PI*.5),color:M([['titanium_white',1],['ultramarine',.2],['dioxazine_purple',.1]],.2),brush:'filbert',size:7,load:1.1,thin:.3,taper:[.2,.5],opacity:.55,edge:.4});}
 p.dry();
 // soft sheen: broad glaze-like veils for the sun's side, the dark reflected band, and the shadow side
 for(let k=0;k<10;k++){const ny=R(.1,.8);const hw=rx*Math.sqrt(1-ny*ny);const y=cy-ry*ny;p.stroke({points:[[cx-hw*.8,y+R(-6,6)],[cx-hw*.3,y+R(-6,6)],[cx+hw*.1,y]],color:M([['titanium_white',1],['ultramarine',.12],['cadmium_yellow',.05]],.3),brush:'filbert',size:R(24,42),load:.7,thin:.45,opacity:R(.1,.2),taper:[.3,.6],edge:.6});}
 // specular: the sun's reflection low on the sun side, hot core with a soft halo
 const hx=cx-rx*.5,hy=cy-ry*.26;
 for(let k=0;k<4;k++)p.stroke({points:[[hx-26+R(-4,4),hy+R(-4,4)],[hx,hy+R(-3,3)],[hx+30,hy+R(-4,4)]],color:M([['titanium_white',2],['quinacridone_rose',.06],['yellow_ochre',.08]],.3),brush:'filbert',size:R(14,26),load:1,thin:.4,opacity:R(.25,.4),taper:[.3,.4],edge:.5});
 p.stroke({points:[[hx-12,hy-1],[hx,hy],[hx+14,hy+1]],color:M([['titanium_white',5],['yellow_ochre',.04]],.2),brush:'filbert',size:15,load:1.4,thin:.15,opacity:1,taper:[.3,.4],clean:true});
 p.stroke({points:[[hx-4,hy],[hx+5,hy]],color:'#ffffff',brush:'round',size:8,load:1.5,thin:.1,opacity:1,clean:true});
 // collar flange: a steel ring with a bright sheen on the sun side and a dark underside
 const cw=colRx;const cy2=colY;
 p.stroke({points:[[cx-cw,cy2,.9],[cx,cy2+3,.95],[cx+cw,cy2,.9]],color:M([['paynes_grey',1],['titanium_white',2.2],['ultramarine',.25],['dioxazine_purple',.1]],.2),brush:'filbert',size:24,load:1.15,thin:.3,taper:[.03,.03],edge:.1,stir:.6});
 p.stroke({points:[[cx-cw*.9,cy2-4,.8],[cx-cw*.3,cy2-3,.9],[cx+cw*.1,cy2-2,.7]],color:M([['titanium_white',3],['dioxazine_purple',.2],['ultramarine',.2]],.2),brush:'filbert',size:10,load:1.3,thin:.2,taper:[.1,.7],opacity:.9});
 p.stroke({points:[[cx-cw,cy2+11,.8],[cx,cy2+13,.9],[cx+cw,cy2+11,.8]],color:M([['ivory_black',1],['ultramarine',.3],['dioxazine_purple',.2]],.2),brush:'filbert',size:8,load:1,thin:.3,taper:[.03,.03],opacity:.8});
 p.stroke({points:[[cx+cw*.1,cy2-2],[cx+cw*.9,cy2-2]],color:M([['paynes_grey',1],['ultramarine',.4]],.2),brush:'filbert',size:12,load:.9,thin:.4,opacity:.5,taper:[.3,.1],edge:.5});
 // base plate: dark steel with a thin lit lip
 const by=top+n*pitch+T*.1;
 p.stroke({points:[[cx-cHalf-14,by+16],[cx,by+16],[cx+cHalf+14,by+16]],color:M([['ivory_black',1],['ultramarine',.4],['dioxazine_purple',.3]],.2),brush:'flat',size:34,angle:Math.PI/2,load:1.1,thin:.3,taper:0,edge:.05});
 p.stroke({points:[[cx-cHalf-14,by+3],[cx,by+3],[cx+cHalf+14,by+3]],color:M([['paynes_grey',1],['titanium_white',2],['dioxazine_purple',.2]],.2),brush:'flat',size:6,angle:Math.PI/2,load:1.2,thin:.25,opacity:.85,taper:0});
}
pod({cx:-8,rx:268,cy:588,ry:196,colY:594,colRx:282,top:582,pitch:37.5,n:9,T:40,cHalf:268,gateSide:1,
 brass:{dark:[['van_dyke_brown',1],['burnt_sienna',.4],['ultramarine',.08]],mid:[['burnt_sienna',1],['yellow_ochre',.45],['burnt_umber',.3],['titanium_white',.12]],lit:[['yellow_ochre',1],['burnt_sienna',.6],['titanium_white',.6],['cadmium_orange',.12]]}});
pod({cx:2147,rx:185,cy:598,ry:172,colY:603,colRx:200,top:612,pitch:36,n:9,T:38,cHalf:183,gateSide:-1,
 brass:{dark:[['burnt_umber',1],['burnt_sienna',.5],['yellow_ochre',.2]],mid:[['yellow_ochre',1],['burnt_sienna',.6],['raw_umber',.4],['titanium_white',.12]],lit:[['cadmium_yellow',.5],['yellow_ochre',1],['titanium_white',.5],['cadmium_orange',.12]]}});
p.dry();
