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
// 09 the six small fairgoers (and a sliver of a seventh behind the pod). Each is a few value masses: warm sun on the left side, violet shade on the right; tapered limbs, no outlines, soft violet cast shadows. Built from joints so each one has its own weight and gesture.
const SKN=['#d99c70','#9a5a4a'];
const lit=(c,a)=>mixh(c,'#fff0d0',a),shd=(c,a)=>mixh(c,'#34285a',a);
function limb(pts,w,c,o){o=o||{};const n=pts.length;const P=pts.map((q,i)=>[q[0],q[1],(o.p0||.9)+((o.p1||.55)-(o.p0||.9))*i/(n-1)]);
 L(P,M([[shd(c,.28),1],[c,.4]],.15),w,{brush:'filbert',load:1,thin:.3,taper:[.05,.12]});
 const Q=P.map(q=>[q[0]-w*.18,q[1]-w*.02,q[2]]);L(Q,M([[lit(c,.22),1],[c,.4]],.15),w*.55,{brush:'filbert',load:1.1,thin:.3,taper:[.1,.15]});}
function headP(x,y,r,o){o=o||{};
 L([[x-r*.1,y-r*.9],[x,y],[x+r*.05,y+r*.9]],M([[SKN[1],1],[SKN[0],.4]],.15),r*1.7,{brush:'filbert',load:1,thin:.3,taper:[.15,.15]});
 L([[x-r*.35,y-r*.7],[x-r*.3,y],[x-r*.2,y+r*.7]],M([[SKN[0],1],[lit(SKN[0],.3),.4]],.15),r*1.05,{brush:'filbert',load:1.1,thin:.3,taper:[.15,.15]});
 if(o.hat){const c=o.hatc||'#d8b868';L([[x-r*1.7,y-r*.5],[x,y-r*.78],[x+r*1.7,y-r*.5]],M([[c,1],[shd(c,.4),.3]],.2),r*.55,{brush:'filbert',load:1.1,thin:.3,taper:[.1,.1]});L([[x-r*.7,y-r*.7],[x,y-r*1.15],[x+r*.7,y-r*.7]],M([[lit(c,.15),1],[c,.5]],.2),r*.9,{brush:'filbert',load:1.1,thin:.3,taper:[.2,.2]});}
 else if(o.hair){const c=o.hair;L([[x-r*.9,y-r*.2],[x-r*.4,y-r*.95],[x+r*.8,y-r*.5]],M([[c,1],[shd(c,.4),.3]],.2),r*.95,{brush:'filbert',load:1.05,thin:.3,taper:[.1,.3]});if(o.longhair)L([[x+r*.7,y-r*.3],[x+r*.9,y+r*.8],[x+r*.8,y+r*2.2]],M([[c,1],[shd(c,.3),.3]],.2),r*.7,{brush:'filbert',load:1,thin:.3,taper:[.1,.5]});}}
function shadowF(x,y,len,w){L([[x-4,y+2],[x+len*.5,y+4],[x+len,y+7]],M([['#7a5a66',1],['#6a5070',.5]],.25),w||7,{brush:'filbert',load:.8,thin:.5,edge:.5,opacity:.55,taper:[.1,.5]});}
function person(o){const u=o.u,hx=o.hx,hy=o.hy,sh=hy+u*1.15,hp=hy+u*3.7,kn=hy+u*5.4,ft=o.feet||hy+u*7.2,st=o.stride===undefined?.3*u:o.stride;
 shadowF(hx+u*.2,ft,o.shadow||u*3.4,u*.42);
 const lc=o.legC||'#2a2024';
 limb([[hx-.22*u,hp],[hx-.3*u-st*.2,kn],[hx-.34*u-st*.4,ft-u*.15]],u*.4,lc,{p0:.95,p1:.6});
 limb([[hx+.22*u,hp],[hx+.28*u+st*.2,kn],[hx+.36*u+st*.4,ft-u*.15]],u*.4,shd(lc,.2),{p0:.95,p1:.6});
 for(const dx of [-.34*u-st*.4,.36*u+st*.4]){S(hx+dx+(dx>0?u*.12:-u*.05),ft-u*.05,u*.55,0,M([[o.shoe||'#1a1214',1],['#2a1c1e',.4]],.2),u*.26,{load:1,thin:.3,taper:[.1,.4]});}
 if(o.skirt){const c=o.skirt,hem=o.hem||kn+u*.3;L([[hx-.5*u,hp-u*.3],[hx-.8*u,(hp+hem)/2],[hx-.95*u,hem]],M([[lit(c,.15),1],[c,.4]],.2),u*.9,{brush:'filbert',load:1.05,thin:.3,taper:[.05,.05]});L([[hx+.45*u,hp-u*.3],[hx+.7*u,(hp+hem)/2],[hx+.9*u,hem]],M([[shd(c,.35),1],[shd(c,.2),.4]],.2),u*.95,{brush:'filbert',load:1.05,thin:.3,taper:[.05,.05]});L([[hx,hp-u*.3],[hx-.05*u,(hp+hem)/2],[hx-.05*u,hem-u*.05]],M([[c,1],[lit(c,.1),.4]],.2),u*1.0,{brush:'filbert',load:1,thin:.3,taper:[.05,.05]});}
 else if(o.bottom){const c=o.bottom;L([[hx-.3*u,hp-u*.2],[hx-.32*u,hp+u*.5]],M([[lit(c,.12),1],[c,.4]],.2),u*.8,{brush:'filbert',load:1.05,thin:.3,taper:[.05,.1]});L([[hx+.28*u,hp-u*.2],[hx+.3*u,hp+u*.5]],M([[shd(c,.35),1],[c,.3]],.2),u*.7,{brush:'filbert',load:1.05,thin:.3,taper:[.05,.1]});}
 // torso: tapering from shoulders to waist, lit left, shaded right
 const tc=o.top;L([[hx-.45*u,sh],[hx-.38*u,(sh+hp)/2],[hx-.3*u,hp-u*.15]],M([[lit(tc,.25),1],[tc,.5]],.2),u*1.0,{brush:'filbert',load:1.1,thin:.3,taper:[.05,.1]});
 L([[hx+.35*u,sh],[hx+.3*u,(sh+hp)/2],[hx+.25*u,hp-u*.15]],M([[shd(tc,.4),1],[shd(tc,.2),.4]],.2),u*.85,{brush:'filbert',load:1.05,thin:.3,taper:[.05,.1]});
 L([[hx-.05*u,sh+u*.1],[hx-.05*u,hp-u*.2]],M([[tc,1],[lit(tc,.1),.4]],.2),u*.8,{brush:'filbert',load:1,thin:.3,taper:[.1,.1],opacity:.9});
 // neck and head
 L([[hx,hy+u*.5],[hx,sh]],M([[SKN[1],1],[SKN[0],.3]],.15),u*.3,{brush:'filbert',load:1,thin:.3,taper:[.05,.05]});
 headP(hx,hy,u*.46,o.head||{});
 // arms: absolute point lists from the shoulder
 for(const [pts,c] of (o.arms||[])){limb(pts,u*.3,c||tc,{p0:.9,p1:.5});const e=pts[pts.length-1];p.dab({x:e[0],y:e[1],color:M([[SKN[0],1],[SKN[1],.3]],.15),size:u*.28,brush:'round',load:1});}
}
// couple man: straw hat, white blouse, navy shorts; left arm up, right arm out
person({hx:324,hy:811,u:21,top:'#e4dacc',bottom:'#1e2644',legC:'#2a2024',stride:5,head:{hat:true},arms:[[[[316,830],[303,814],[287,798]],'#e4dacc'],[[[339,832],[372,838],[411,841]],'#d8ccc4']]});
// couple woman, sliver behind the pod: red dress, straw hat
L([[272,823],[272,850],[270,900]],M([['#a0302a',1],['#7a2424',.5]],.25),16,{brush:'filbert',load:1,thin:.3,taper:[.05,.1]});L([[270,885],[270,925],[271,940]],M([['#5a2434',1],['#40202c',.5]],.25),18,{brush:'filbert',load:1,thin:.3,taper:[.05,.05]});
L([[258,821],[266,818],[278,821]],M([['#d4b468',1],['#b8964a',.4]],.2),8,{brush:'filbert',load:1,thin:.3});p.dab({x:269,y:828,color:M([[SKN[0],1]],.2),size:9,brush:'round',load:1});
// boy cheering: mustard jersey, arms in a V
person({hx:469,hy:837,u:15,top:'#b8861e',bottom:'#1a1416',legC:'#1c1416',stride:4,head:{hair:'#2a1c18'},arms:[[[[463,849],[452,832],[442,814]],'#b8861e'],[[[477,849],[491,832],[500,814]],'#a87a1a']]});
// woman shielding her eyes: pink-white blouse, plum skirt, grey hair
person({hx:893,hy:836,u:17,top:'#e8d8de',skirt:'#6a3048',hem:933,legC:'#c88a68',stride:2,shoe:'#14101a',head:{hair:'#c8c0d0'},arms:[[[[903,850],[912,868],[914,890]],'#e0d0d6'],[[[886,850],[880,838],[889,830]],'#e0d0d6']]});
// pointer man: red shirt, black trousers, hand at his brow
person({hx:1698,hy:818,u:17,top:'#c03230',bottom:'#1a1414',legC:'#1c1616',stride:3,head:{hair:'#1e1c34'},arms:[[[[1708,834],[1719,862],[1721,886]],'#b02a28'],[[[1688,834],[1681,823],[1689,818]],'#c03230']]});
// pointer woman: cream blouse, navy skirt, strawberry-blond hair falling to the right
person({hx:1771,hy:827,u:17,top:'#f0e4c8',skirt:'#26305a',hem:929,legC:'#c88a68',stride:2,shoe:'#14101a',head:{hair:'#d4965a',longhair:true},arms:[[[[1761,846],[1753,868],[1751,888]],'#e8dcc0'],[[[1781,846],[1785,866],[1783,884]],'#d8caa8']]});
