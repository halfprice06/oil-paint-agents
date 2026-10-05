const R=(a,b)=>p.rand(a,b);
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.8,1.2)]);
const pr=(i,n)=>{const f=i/(n-1);return .35+.65*Math.sin(Math.PI*Math.min(1,Math.max(0,f*.9+.05)));};
function seg(x,y,len,ang,bend,n){n=n||4;const pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;const b=bend*(t*t-.08);pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*b,y+Math.sin(ang)*len*t+Math.cos(ang)*b,pr(i,n)]);}return pts;}
const F=(pts,c,size,o)=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size:size,load:1,thin:.5},o||{}));
const S=(x,y,len,ang,c,size,o)=>{o=o||{};const b=o.bend===undefined?R(-5,5):o.bend;const n=o.n||4;delete o.bend;delete o.n;return F(seg(x,y,len,ang,b,n),c,size,o);};
const BL=(pts,size,brush)=>p.stroke({points:pts,brush:brush||'filbert',size:size,load:0,color:'titanium_white'});
// polyline through points -> multi-point stroke with pressure
const PL=(pts,c,size,o)=>F(pts.map((q,i)=>[q[0],q[1],q[2]===undefined?pr(i,pts.length):q[2]]),c,size,o);
const area=poly=>{let a=0;for(let i=0;i<poly.length;i++){const q=poly[i],r=poly[(i+1)%poly.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
const inPoly=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
function cover(poly,size,col,o){o=o||{};const dens=o.dens||1,lenf=o.len||2.5;const n=Math.max(1,Math.round(area(poly)*dens*1.5/(size*size*lenf*.7)));
 const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 let k=0,g=0;while(k<n&&g++<n*40){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;
  const a=(o.ang||0)+R(-1,1)*(o.angJ===undefined?.3:o.angJ);const sz=size*R(.75,1.25);
  const oo=Object.assign({brush:'flat'},o.o||{});if(o.brush)oo.brush=o.brush;
  let L=sz*lenf*R(.7,1.3);const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  F(seg(x,y,L,a,R(-4,4)*size/20),col(x,y),sz,oo);}
 return n;}
const ELL=(cx,cy,rx,ry,rot,n)=>{n=n||20;rot=rot||0;const pts=[];for(let i=0;i<n;i++){const a=i/n*6.2832;const x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return pts;};
const lerp=(a,b,t)=>a+(b-a)*t;
// wobbling line from a to b
function WL(x0,y0,x1,y1,c,size,o){const n=4,pts=[];for(let i=0;i<n;i++){const t=i/(n-1);pts.push([lerp(x0,x1,t)+R(-1.2,1.2),lerp(y0,y1,t)+R(-1.2,1.2),.5+.4*Math.sin(Math.PI*t)]);}return F(pts,c,size,o);}
// tapered limb/tube painted as light / mid / shade strips along its length (light from the left)
function tube(p0,p1,w0,w1,cols,o){o=o||{};const dx=p1[0]-p0[0],dy=p1[1]-p0[1];const L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L;let nx=-uy,ny=ux;if(nx>0){nx=-nx;ny=-ny;}
  const ang=Math.atan2(dy,dx);const n=Math.max(2,Math.round(L/((o.step||9)*1.8)));
  for(let i=0;i<n;i++){const t=(i+.5)/n;const w=lerp(w0,w1,t);const cx=lerp(p0[0],p1[0],t),cy=lerp(p0[1],p1[1],t);const seglen=L/n*1.8;
    const strips=[[-.27,cols.lit,.42,.95],[0,cols.mid,.5,1],[.3,cols.shade,.38,.9]];
    for(const [off,cf,wf,ld] of strips){S(cx+nx*w*off+R(-.4,.4),cy+ny*w*off+R(-.4,.4),seglen*R(.9,1.3),ang+R(-.04,.04),cf(),Math.max(1.5,w*wf*R(.85,1.15)),Object.assign({brush:'filbert',load:ld,thin:.45,bend:R(-1,1)},o.o||{}));}
  }
  if(!o.noblend&&Math.max(w0,w1)>7){for(let k=0;k<3;k++){const off=(k==1?.12:k==2?0:-.1)*Math.max(w0,w1);BL([[p0[0]+nx*off,p0[1]+ny*off,.7],[lerp(p0[0],p1[0],.5)+nx*off,lerp(p0[1],p1[1],.5)+ny*off,.8],[p1[0]+nx*off,p1[1]+ny*off,.5]],Math.max(3,Math.max(w0,w1)*.42));}}
  if(cols.rim){for(let i=0;i<Math.max(2,Math.round(L/22));i++){const t=R(.1,.9);const w=lerp(w0,w1,t);S(lerp(p0[0],p1[0],t)-nx*w*.36,lerp(p0[1],p1[1],t)-ny*w*.36,R(8,16),ang,cols.rim(),Math.max(1.4,w*.13),{brush:'filbert',load:1.1,thin:.4,opacity:R(.6,.95),bend:0});}}
}
// ===== native 2400x1600 helpers: form-following patches, hands, cloth creases =====
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const LIGHT=[-0.78,-0.62]; // direction TOWARD the sun: upper left
function cr(pts,t){const n=pts.length-1;const f=clamp(t,0,1)*n;const i=Math.min(n-1,Math.floor(f));const u=f-i;
 const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(n,i+2)];
 const c=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*u+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*u*u+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*u*u*u);return [c(0),c(1)];}
function cdir(pts,t){const a=cr(pts,Math.max(0,t-.03)),b=cr(pts,Math.min(1,t+.03));const dx=b[0]-a[0],dy=b[1]-a[1];const L=Math.hypot(dx,dy)||1;return [dx/L,dy/L];}
function alen(pts){let L=0,pv=cr(pts,0);for(let i=1;i<=24;i++){const q=cr(pts,i/24);L+=Math.hypot(q[0]-pv[0],q[1]-pv[1]);pv=q;}return L;}
function wat(ws,t){if(!ws.length)return 10;if(ws.length===1)return ws[0];const n=ws.length-1;const f=clamp(t,0,1)*n;const i=Math.min(n-1,Math.floor(f));const u=f-i;const s=u*u*(3-2*u);return ws[i]+(ws[i+1]-ws[i])*s;}
// plane colour from across-position f in 0..1 (0 = lit edge, 1 = shadow edge)
let FD_=1;
function planeCol(c,f,jt){
 const j=clamp(f+R(-(jt||.06),(jt||.06)),0,1);
 const B=c._b||(c._b=[[.06,c.lit||c.mid],[.32,c.mid],[.5,c.half||c.mid],[.68,c.shade],[.8,c.core||c.shade],[.96,c.refl||c.core||c.shade]]);
 if(j<=B[0][0])return B[0][1]();if(j>=B[5][0])return B[5][1]();
 for(let i=0;i<5;i++){if(j<=B[i+1][0]){const t=(j-B[i][0])/(B[i+1][0]-B[i][0]);return (R(0,1)<t?B[i+1][1]:B[i][1])();}}
 return c.mid();}
// Model a limb / torso / any elongated volume with form-following patches.
// o: axis [[x,y]..], w [widths], cols{hi,lit,mid,half,shade,core,refl,rim}, light, lv (levels), dens, blend, pf
function form(o){
 const ax=o.axis,ws=o.w,Lt=o.light||LIGHT,L=alen(ax);const wmax=Math.max(...ws);
 const a0=cr(ax,0),a1=cr(ax,1);const cd=[a1[0]-a0[0],a1[1]-a0[1]];let sx=-cd[1],sy=cd[0];const flip=(sx*Lt[0]+sy*Lt[1]>0)?-1:1;
 const pos=(t,u)=>{const q=cr(ax,t),d=cdir(ax,t);const w=wat(ws,t);const nx=-d[1]*flip,ny=d[0]*flip;return [q[0]+nx*u*w/2,q[1]+ny*u*w/2];};
 const levels=o.lv||[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3.2],j:.06},{k:.26,d:1.2,op:.9,len:[1.2,3.5],j:.04},{k:.14,d:1.1,op:.85,len:[1.2,3.5],j:.03}];
 const pfBase=o.pf||.5;
 {const nb=Math.max(2,Math.ceil(L/(wmax*.8)));for(let i=0;i<nb;i++){const tc=(i+.5)/nb;const d=.7*wmax/L+.05;const ta=clamp(tc-d,0,1),tb=clamp(tc+d,0,1);const pts=[];for(let k=0;k<3;k++){const tt=lerp(ta,tb,k/2);const q=pos(tt,R(-.08,.08)*2);pts.push([q[0],q[1],.85]);}F(pts,planeCol(o.cols,.4,.12),Math.max(2,wat(ws,tc)*.8),{brush:'filbert',load:1.05,thin:.45});}}
 for(let li=0;li<levels.length;li++){const lv=levels[li];
  let avgw=0;for(let i=0;i<=8;i++)avgw+=wat(ws,i/8);avgw/=9;
  const sz0=Math.max(1.8,avgw*pfBase*lv.k),len0=sz0*(lv.len[0]+lv.len[1])/2;
  const n=Math.max(2,Math.round((o.dens||1)*(li>=2?FD_:Math.max(FD_,.8))*lv.d*1.25*L*avgw/(sz0*len0)));const list=[];
  for(let i=0;i<n;i++){const t0=clamp((i+R(0,1))/n+R(-.05,.05),0,1);const w=wat(ws,t0);const size=Math.max(1.6,w*pfBase*lv.k*R(.7,1.3));
   const umax=Math.max(.15,1-size/Math.max(w,1)*1.0);const u=R(-1,1)*umax;
   const len=size*R(lv.len[0],lv.len[1]);const dt=len/L;const du=R(-.35,.35);const ta=clamp(t0-dt/2,0,1),tb=clamp(t0+dt/2,0,1);
   const f=(u+1)/2;list.push({ta,tb,u,du,size,f});}
  list.sort((a,b)=>b.f-a.f);
  for(const s of list){const pts=[];const m=4;for(let k=0;k<m;k++){const t=lerp(s.ta,s.tb,k/(m-1));const w=wat(ws,t);const uu=clamp(s.u+s.du*(k/(m-1)-.5),-(1-s.size/Math.max(w,1)*.9),(1-s.size/Math.max(w,1)*.9));const q=pos(t,uu);pts.push([q[0],q[1],pr(k,m)]);}
   F(pts,planeCol(o.cols,s.f,lv.j),s.size,{brush:'filbert',load:R(.9,1.1),thin:R(.38,.5),opacity:lv.op});}
  if(li===1&&o.edge!==false){for(const sg of [-1,1]){const sizeE=Math.max(2,avgw*.14);let t=0;while(t<1){const dl=R(.22,.4);const ta=t,tb=Math.min(1,t+dl);const pts=[];for(let k=0;k<4;k++){const tt=lerp(ta,tb,k/3);const w=wat(ws,tt);const uu=sg*(1-sizeE/Math.max(w,1)*.95);const q=pos(tt,uu);pts.push([q[0],q[1],pr(k,4)]);}F(pts,planeCol(o.cols,sg<0?.12:.74,.04),sizeE,{brush:'filbert',load:1,thin:.42,opacity:.95});t+=dl*.8;}}}
  if(li===0&&o.blend!==false){const nb=Math.max(1,Math.round(L/(wmax*1.6)));for(let b=0;b<nb;b++){const t0=R(0,.6),t1=Math.min(1,t0+R(.3,.6));const u=R(-.35,.4);const pts=[];for(let k=0;k<3;k++){const q=pos(lerp(t0,t1,k/2),u+R(-.1,.1));pts.push([q[0],q[1],.7]);}BL(pts,Math.max(2.5,wmax*.3));}}
 }
 // highlights and rim
 const c=o.cols;
 if(c.hi){const nh=Math.max(1,Math.round(L/(wmax*1.3)*(o.hiK||1)));for(let i=0;i<nh;i++){const t0=R(.05,.9);const len=R(.08,.22)*L;const w=wat(ws,t0);const u=R(-.75,-.35);const pts=[];for(let k=0;k<3;k++){const q=pos(clamp(t0+len/L*(k/2),0,1),u+R(-.04,.04));pts.push([q[0],q[1],pr(k,3)]);}F(pts,c.hi(),Math.max(1.6,w*R(.08,.15)),{brush:'filbert',load:1.25,thin:.35,opacity:R(.7,.95)});}}
 if(c.rim){const nr=Math.max(1,Math.round(L/(wmax*2.2)*(o.rimK||1)));for(let i=0;i<nr;i++){const t0=R(.03,.85);const len=R(.25,.6)*L;const w=wat(ws,t0);const u=R(.8,.93);const pts=[];for(let k=0;k<3;k++){const q=pos(clamp(t0+len/L*(k/2),0,1),u);pts.push([q[0],q[1],pr(k,3)]);}F(pts,c.rim(),Math.max(1.5,w*R(.06,.12)),{brush:'filbert',load:1.2,thin:.38,opacity:R(.6,.9)});}}
 return {pos,L};
}
// a crease in cloth: dark line with a lit lip beside it
function crease(pts,dark,lit,size,o){o=o||{};F(pts.map((q,i)=>[q[0],q[1],pr(i,pts.length)]),dark(),size,{brush:'filbert',load:.9,thin:.5,opacity:o.op||.7});
 if(lit){const off=size*.9;F(pts.map((q,i)=>[q[0]-off*.7,q[1]-off*.5,pr(i,pts.length)*.8]),lit(),size*.7,{brush:'filbert',load:1.15,thin:.4,opacity:.8});}}
// hand: palm patch + fingers, as simple painted shapes. ang = direction fingers point.
function hand(x,y,ang,s,cols,o){o=o||{};const ca=Math.cos(ang),sa=Math.sin(ang);let nx=-sa,ny=ca;if(nx*LIGHT[0]+ny*LIGHT[1]<0){nx=-nx;ny=-ny;}
 const open=o.open===undefined?.5:o.open,sd=o.side||1;const P=(t,u,w)=>[x+ca*s*t+nx*s*u,y+sa*s*t+ny*s*u,w===undefined?.8:w];
 // a hand is a mitten of three planes: a mass, a lit plane, a cool shadow plane, with one dark accent and a melted turning edge
 p.dab({x:x-nx*s*.16-ca*s*.04,y:y-ny*s*.16-sa*s*.04,size:s*.55,color:cols.shade(),brush:'round',load:.8,pressure:.6,opacity:.38}); // contact shadow on the sleeve
 if(o.fist){
  p.dab({x:x+ca*s*.4,y:y+sa*s*.4,size:s*.6,color:cols.mid(),brush:'round',load:1,pressure:.9});
  F([P(.2,.05,.7),P(.5,.02,.8),P(.66,-.04,.5)],cols.mid(),s*.46,{brush:'filbert',load:1,thin:.42});
  F([P(.2,.2,.7),P(.5,.2,.8)],cols.lit(),s*.2,{brush:'filbert',load:1.1,thin:.4,opacity:.9});
  F([P(.25,-.2,.7),P(.55,-.2,.7)],cols.shade(),s*.2,{brush:'filbert',load:1,thin:.45,opacity:.85});
  F([P(.5,.16,.6),P(.64,.02,.5),P(.56,-.12,.5)],cols.shade(),s*.05,{brush:'round',load:.9,thin:.5,opacity:.6});
  BL([P(.2,-.22,.6),P(.45,-.2,.7),P(.66,-.1,.5)],s*.14);return;}
 // palm and finger mass in two big touches
 F([P(-.12,0,.7),P(.3,0,.95),P(.62,-.01,.8)],cols.mid(),s*.5,{brush:'filbert',load:1,thin:.42});
 F([P(.5,0,.8),P(.8+.05*open*sd,.03*open*sd,.9),P(1.02+.06*open*sd,.05*open*sd,.35)],cols.mid(),s*.38,{brush:'filbert',load:1,thin:.42});
 // thumb: one tapered mass folding off the palm
 const ta=ang-sd*(.75+.3*open);
 F([[x+nx*s*.1*0-sd*(-ny)*s*.0+Math.cos(ta)*s*.05,y+Math.sin(ta)*s*.05,.8],[x+Math.cos(ta)*s*.3,y+Math.sin(ta)*s*.3,.85],[x+Math.cos(ta+.25*sd)*s*.5,y+Math.sin(ta+.25*sd)*s*.5,.45]],cols.mid(),s*.2,{brush:'filbert',load:1,thin:.42});
 // light plane along the lit side, shadow plane (cooler, darker) on the other
 F([P(-.05,.15,.7),P(.4,.15,.9),P(.9,.12+.04*open,.5)],cols.lit(),s*.16,{brush:'filbert',load:1.1,thin:.4,opacity:.92});
 F([P(.02,-.18,.7),P(.45,-.18,.85),P(.92,-.14,.45)],cols.shade(),s*.15,{brush:'filbert',load:1,thin:.45,opacity:.85});
 // one small dark accent where the fingers part (two if the hand is open)
 for(let k=0;k<(open>.6?2:1);k++){const u=(k?-.06:.06);F([P(.78,u,.6),P(.93,u+.01*sd,.4)],cols.shade(),s*.04,{brush:'round',load:.9,thin:.5,opacity:.65});}
 // melt the turning edge and the thumb root
 BL([P(.0,-.2,.6),P(.4,-.2,.7),P(.85,-.12,.5)],s*.12);
 BL([[x+Math.cos(ta)*s*.1,y+Math.sin(ta)*s*.1],[x+Math.cos(ta)*s*.25+ca*s*.1,y+Math.sin(ta)*s*.25+sa*s*.1]],s*.09);
}
// a small face-plane stroke
const FS=(x,y,len,ang,c,size,o)=>S(x,y,len,ang,c,size,Object.assign({brush:'filbert',load:1,thin:.4,bend:0},o||{}));
// dab shortcut
const DB=(x,y,size,c,o)=>p.dab(Object.assign({x:x,y:y,size:size,color:c,brush:'round',load:1.1,pressure:.85},o||{}));
// wobbling multi-point polyline with pressure
const WPL=(pts,c,size,o)=>F(pts.map((q,i)=>[q[0]+R(-.4,.4),q[1]+R(-.4,.4),pr(i,pts.length)]),c,size,o);
// skin palettes
const skinHi=()=>M([['flesh_tint',1],['titanium_white',.7],['naples_yellow',.12],['cadmium_orange',.05]]);
const skinL=()=>M([['flesh_tint',1],['titanium_white',.45],['cadmium_orange',.1],['naples_yellow',.1]]);
const skinM=()=>M([['flesh_tint',1],['titanium_white',.18],['cadmium_orange',.14],['burnt_sienna',.1]]);
const skinH=()=>M([['flesh_tint',.9],['burnt_sienna',.2],['cadmium_orange',.08],['cobalt_violet',.12],['titanium_white',.1]]);
const skinS=()=>M([['flesh_tint',.8],['burnt_sienna',.28],['cobalt_violet',.3],['titanium_white',.1]]);
const skinR=()=>M([['flesh_tint',.9],['quinacridone_rose',.12],['cobalt_violet',.08],['titanium_white',.6],['cerulean',.05]]);
const SKIN={hi:skinHi,lit:skinL,mid:skinM,half:skinH,shade:skinS,core:skinS,refl:skinR};

// rotate everything painted after this call about (cx,cy) by ang (radians); sizes unchanged
function ROTATE(cx,cy,ang){const _p=p;p=Object.create(_p);const c=Math.cos(ang),s=Math.sin(ang);const tf=(x,y)=>[cx+(x-cx)*c-(y-cy)*s,cy+(x-cx)*s+(y-cy)*c];
 p.stroke=o=>_p.stroke(Object.assign({},o,{points:o.points.map(q=>{const t=tf(q[0],q[1]);return q.length>2?[t[0],t[1],q[2]]:[t[0],t[1]];})}));
 p.dab=o=>{const t=tf(o.x,o.y);return _p.dab(Object.assign({},o,{x:t[0],y:t[1]}));};}
// LUCCA (native): startled beside her telepod, body turned toward the gate, one arm up, one reaching out
FD_=.45;const P0=p;function TR(dx,dy){const _p=p;p=Object.create(_p);p.stroke=o=>_p.stroke(Object.assign({},o,{points:o.points.map(q=>q.length>2?[q[0]+dx,q[1]+dy,q[2]]:[q[0]+dx,q[1]+dy])}));p.dab=o=>_p.dab(Object.assign({},o,{x:o.x+dx,y:o.y+dy}));}
ROTATE(1320,1030,.07);
const mSkL=()=>M([['flesh_tint',1],['titanium_white',.55],['naples_yellow',.1]]);const mSkM=()=>M([['flesh_tint',1],['titanium_white',.28],['cadmium_orange',.08],['naples_yellow',.06]]);const mSkH=()=>M([['flesh_tint',.9],['quinacridone_rose',.1],['cobalt_violet',.1],['burnt_sienna',.1],['titanium_white',.2]]);
const SK={hi:skinHi,lit:mSkL,mid:mSkM,half:mSkH,shade:skinS,core:skinS,refl:skinR};
const SKRm={hi:mSkM,lit:mSkM,mid:mSkM,half:mSkH,shade:skinS,core:skinS,refl:skinR};
const rimC=()=>M([['titanium_white',3],['cerulean',.4],['cobalt_violet',.15]]);
const hairC=()=>M([['cobalt_violet',.6],['burnt_umber',.4],['alizarin_crimson',.25],['ultramarine',.15],['titanium_white',.12]]);
const hairLC=()=>M([['cobalt_violet',.8],['quinacridone_rose',.25],['titanium_white',.5],['burnt_umber',.15]]);
const hairHC=()=>M([['cobalt_violet',.6],['quinacridone_rose',.3],['titanium_white',1.1]]);
const hairDC=()=>M([['ultramarine',.4],['dioxazine_purple',.4],['burnt_umber',.4],['cobalt_violet',.2]]);
const tealH=()=>M([['cerulean',.4],['titanium_white',1.6],['viridian',.15]]);
const tealL=()=>M([['viridian',.5],['cerulean',.4],['titanium_white',1],['naples_yellow',.05]]);
const tealM=()=>M([['viridian',.7],['cerulean',.3],['titanium_white',.45],['paynes_grey',.12]]);
const tealS=()=>M([['viridian',.6],['ultramarine',.35],['paynes_grey',.3],['cobalt_violet',.15],['titanium_white',.12]]);
const tealC=()=>M([['viridian',.5],['ultramarine',.5],['paynes_grey',.4],['cobalt_violet',.2]]);
const orH=()=>M([['cadmium_yellow',.6],['cadmium_orange',.5],['titanium_white',.7]]);
const orL=()=>M([['cadmium_orange',.9],['cadmium_yellow',.35],['titanium_white',.35]]);
const orM=()=>M([['cadmium_orange',.9],['vermilion',.35],['titanium_white',.15]]);
const orS=()=>M([['vermilion',.5],['burnt_sienna',.5],['alizarin_crimson',.15],['cobalt_violet',.25]]);
const orC=()=>M([['alizarin_crimson',.4],['burnt_sienna',.5],['cobalt_violet',.4],['vermilion',.2]]);
const blkL=()=>M([['paynes_grey',.9],['burnt_umber',.3],['titanium_white',.3]]);
const blkM=()=>M([['paynes_grey',.9],['ultramarine',.3],['burnt_umber',.3]]);
const blkS=()=>M([['ivory_black',.7],['ultramarine',.4],['burnt_umber',.2]]);
const yelH=()=>M([['cadmium_lemon',.4],['titanium_white',1.2],['naples_yellow',.3]]);
const yelL=()=>M([['cadmium_yellow',.9],['naples_yellow',.4],['titanium_white',.4]]);
const yelS=()=>M([['yellow_ochre',.8],['raw_sienna',.4],['cadmium_orange',.15]]);
const brH=()=>M([['burnt_sienna',.5],['raw_sienna',.4],['titanium_white',.6]]);
const brL=()=>M([['burnt_sienna',.6],['raw_sienna',.4],['titanium_white',.3]]);
const brS=()=>M([['burnt_umber',1],['ultramarine',.3],['ivory_black',.15]]);
const brC=()=>M([['burnt_umber',.8],['ivory_black',.5],['ultramarine',.3]]);
const hlmL=()=>M([['cerulean',.5],['paynes_grey',.4],['titanium_white',1.4]]);
const hlmM=()=>M([['cobalt_blue',.45],['paynes_grey',.5],['titanium_white',.8]]);
const hlmS=()=>M([['ultramarine',.5],['paynes_grey',.6],['cobalt_violet',.2],['titanium_white',.3]]);
const TEAL={hi:tealH,lit:tealL,mid:tealM,shade:tealS,core:tealC,refl:()=>M([['cerulean',.4],['titanium_white',1.2],['viridian',.15]]),rim:rimC};
const ORG={hi:orH,lit:orL,mid:orM,half:orM,shade:orS,core:orC,refl:()=>M([['cadmium_orange',.4],['titanium_white',.8],['cobalt_violet',.15]]),rim:rimC};
const BLK={lit:blkL,mid:blkM,shade:blkS,core:blkS};
const YEL={hi:yelH,lit:yelL,mid:yelL,shade:yelS,core:yelS};
const BRN={hi:brH,lit:brL,mid:brS,shade:brS,core:brC};
const HLM={hi:()=>M([['titanium_white',3],['cerulean',.2]]),lit:hlmL,mid:hlmM,shade:hlmS,core:hlmS,refl:()=>M([['cerulean',.4],['titanium_white',1.4]]),rim:rimC};
const HAIRC={hi:hairHC,lit:hairLC,mid:hairC,shade:hairDC,core:hairDC};

// ---- cast shadow on the deck, to the right
S(1396,1030,150,.02,M([['burnt_umber',.6],['cobalt_violet',.5],['ultramarine',.25],['titanium_white',.3]]),16,{brush:'flat',load:.9,thin:.5,opacity:.6});
S(1360,1024,70,.03,M([['burnt_umber',.6],['cobalt_violet',.5],['ultramarine',.25]]),9,{brush:'flat',load:.9,thin:.5,opacity:.5});
// scarf tail, flung out behind by the gate wind (behind the body)
form({axis:[[1306,826],[1286,842],[1274,862],[1276,882]],w:[11,10,7,3],cols:YEL,dens:.5,blend:false});

// ---- legs: weight on her left leg (our right), right leg trailing, heel lifted
form({axis:[[1304,904],[1290,944],[1280,984]],w:[34,28,24],cols:SK,dens:.5});          // thigh and knee
form({axis:[[1336,904],[1346,944],[1348,984]],w:[34,28,24],cols:SKRm,dens:.5,rimK:1});
form({axis:[[1280,980],[1277,998],[1276,1014]],w:[26,23,20],cols:BRN,dens:.55});        // boot shaft
form({axis:[[1348,980],[1348,998],[1346,1014]],w:[26,23,20],cols:BRN,dens:.55});
form({axis:[[1276,1010],[1266,1022],[1252,1032]],w:[20,22,14],cols:BRN,dens:.55});      // trailing foot, toe down
form({axis:[[1346,1010],[1354,1022],[1368,1030]],w:[20,22,14],cols:BRN,dens:.55});
for(const [x,y] of [[1280,984],[1348,984]]){S(x,y,28,.04,M([['burnt_sienna',.5],['raw_sienna',.4],['titanium_white',.6]]),7,{brush:'flat',load:1.15,thin:.4});S(x-2,y-3,20,.04,M([['titanium_white',1.2],['raw_sienna',.4]]),2.6,{brush:'flat',load:1.2,thin:.38,opacity:.85});}
for(const [x,y] of [[1290,944],[1348,944]]){S(x,y,16,0,skinS(),5,{brush:'filbert',load:.9,thin:.5,opacity:.5});S(x-3,y-4,10,0,skinHi(),3,{brush:'filbert',load:1.1,thin:.4,opacity:.7});} // knees
// ---- black shorts
form({axis:[[1296,876],[1318,884],[1344,876]],w:[34,42,34],cols:BLK,dens:.55,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06},{k:.26,d:1.2,op:.9,len:[1.2,3],j:.04}]});
form({axis:[[1300,890],[1300,904],[1300,914]],w:[32,34,36],cols:BLK,dens:.5,blend:false});form({axis:[[1340,890],[1342,904],[1342,914]],w:[32,34,36],cols:BLK,dens:.5,blend:false});

// ---- teal shirt body and long sleeves, then the orange tunic over it
const SLa=[[1293,810],[1272,830],[1260,846]],SLa2=[[1260,846],[1254,822],[1248,794]];
const SRa=[[1347,808],[1370,822],[1392,822]],SRa2=[[1392,822],[1414,812],[1432,800]];
form({axis:SLa2,w:[24,21,17],cols:TEAL,dens:.5});form({axis:SLa,w:[28,25,22],cols:TEAL,dens:.5});
form({axis:SRa2,w:[24,21,17],cols:{hi:tealM,lit:tealM,mid:tealM,shade:tealS,core:tealC,refl:TEAL.refl,rim:rimC},dens:.5,rimK:1.2});form({axis:SRa,w:[28,25,22],cols:{hi:tealM,lit:tealM,mid:tealM,shade:tealS,core:tealC,refl:TEAL.refl,rim:rimC},dens:.5,rimK:1.2});
const TUa=[[1320,806],[1320,836],[1320,866],[1321,886]];
form({axis:TUa,w:[56,52,56,72],cols:ORG,dens:.55,pf:.46});
// tunic hem lip, folds and a tie at the waist
S(1321,890,72,0,orC(),6,{brush:'flat',load:1,thin:.45,bend:3,opacity:.85});S(1304,886,34,.03,orH(),3,{brush:'flat',load:1.15,thin:.4,opacity:.85,bend:2});
for(let k=0;k<4;k++){const x=1300+k*14+R(-3,3);crease([[x,852],[x+R(-3,3),868],[x+R(-3,3),886]],k>1?orC:orS,k<2?orH:null,R(3,5));}
// black belt
form({axis:[[1294,846],[1320,852],[1348,846]],w:[10,10,10],cols:BLK,dens:.6,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06}]});
DB(1318,850,5,M([['cadmium_yellow',.5],['yellow_ochre',.5],['titanium_white',.3]]),{pressure:.7});
// ---- yellow scarf at the neck
form({axis:[[1296,800],[1320,810],[1346,800]],w:[11,13,11],cols:YEL,dens:.6});
form({axis:[[1300,806],[1290,818],[1288,830]],w:[9,8,5],cols:YEL,dens:.5,blend:false});

// ---- neck and head
form({axis:[[1320,776],[1321,788],[1320,800]],w:[15,16,20],cols:SK,dens:.5,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06}]});
S(1320,782,20,0,skinS(),7,{brush:'filbert',load:.9,thin:.5,opacity:.7});
// hair behind and beside the face: plum bob
form({axis:[[1298,748],[1296,764],[1300,782]],w:[18,18,16],cols:HAIRC,dens:.5,blend:false});form({axis:[[1344,748],[1346,764],[1342,782]],w:[18,18,16],cols:HAIRC,dens:.5,blend:false});
const HD=form({axis:[[1320,738],[1320,758],[1321,778]],w:[28,40,26],cols:{hi:skinHi,lit:mSkL,mid:mSkM,half:mSkH,shade:skinS,core:skinS,refl:skinR,rim:rimC},dens:.6,pf:.42,rimK:.7});
{const P1=p;TR(8,1);
// brow shadow under the helmet; nose, cheeks
S(1320,746,30,0,skinS(),7,{brush:'filbert',load:.9,thin:.5,opacity:.6});
S(1322,764,8,1.5,skinHi(),2.4,{brush:'filbert',load:1.2,thin:.4,opacity:.8});S(1325,768,6,1.4,skinS(),2,{brush:'round',load:.9,thin:.5,opacity:.6});
DB(1326,769.5,2.4,M([['burnt_sienna',.6],['cobalt_violet',.3],['flesh_tint',.5]]),{pressure:.6,opacity:.8});
DB(1310,770,6.4,M([['quinacridone_rose',.4],['flesh_tint',1],['titanium_white',.4]]),{pressure:.5,opacity:.5});DB(1334,770,5.6,M([['quinacridone_rose',.4],['flesh_tint',1],['titanium_white',.5]]),{pressure:.5,opacity:.4});
// open mouth
DB(1322,776,5,M([['alizarin_crimson',.6],['burnt_umber',.7],['flesh_tint',.3]]),{pressure:.8});S(1322,773.8,7,0,M([['quinacridone_rose',.5],['flesh_tint',.8]]),2,{brush:'round',load:1,thin:.45,bend:1});
// round glasses: lens glow, thin dark frames, eyes behind, glints
for(const [gx,gy,r] of [[1308,758,8.8],[1331,758,6.2]]){
  cover(ELL(gx,gy,r,r,0,10),2.4,()=>M([['titanium_white',2],['cerulean',.5],['flesh_tint',.15]]),{ang:.6,angJ:1,dens:1.3,brush:'filbert',o:{load:1,thin:.45,opacity:.75}});
  DB(gx-.2,gy+.6,r*.5,M([['cobalt_violet',.3],['burnt_umber',.9]]),{pressure:.7,opacity:.8});
  const pts=[];for(let k=0;k<=12;k++){const a=k/12*6.2;pts.push([gx+Math.cos(a)*(r+.6),gy+Math.sin(a)*(r+.6),.7]);}
  F(pts,M([['burnt_umber',.8],['paynes_grey',.6]]),1.5,{brush:'round',load:.9,thin:.55,opacity:.55});
  S(gx-r*.5,gy-r*.55,r*.7,-.5,'titanium_white',1.8,{brush:'round',load:1.4,thin:.35,opacity:.95});}
S(1320.5,757,4,0,M([['burnt_umber',.8],['paynes_grey',.4]]),1.6,{brush:'round',load:.9,thin:.5});

p=P1;}
// three-quarter turn: ear and hair mass on the near (left) side, a lock closing the far cheek
form({axis:[[1300,758],[1299,766],[1301,774]],w:[7,8,7],cols:{hi:skinHi,lit:mSkM,mid:mSkM,half:mSkH,shade:skinS,core:skinS,refl:skinR},dens:.5,blend:false});
S(1300,764,8,1.57,skinS(),2.6,{brush:'filbert',load:.9,thin:.5,opacity:.7});
for(let k=0;k<4;k++)S(1345+R(-2,2),R(752,772),R(14,22),1.57+R(-.15,.15),R(0,1)<.5?hairC():hairDC(),R(3,5),{brush:'filbert',load:1,thin:.45,opacity:.9});
for(let k=0;k<4;k++)S(1297+R(-3,3),R(754,780),R(16,26),1.57+R(-.1,.1),R(0,1)<.5?hairC():hairLC(),R(4,6),{brush:'filbert',load:1,thin:.45,opacity:.9});
// ---- helmet: steel-blue dome, brim over the brow, rim light, antenna on her right side
const HL=form({axis:[[1296,744],[1300,728],[1320,716],[1342,728],[1346,744]],w:[14,16,18,16,14],cols:HLM,dens:.7,pf:.5,blend:false});
cover([[1298,742],[1300,728],[1312,718],[1330,716],[1342,726],[1344,742],[1320,738]],3.4,(x)=>x<1312?hlmL():x<1332?hlmM():hlmS(),{ang:-.1,angJ:1,dens:1.6,len:2,brush:'filbert',o:{load:1.05,thin:.4}});
form({axis:[[1292,744],[1320,750],[1350,744]],w:[8,9,8],cols:{hi:()=>M([['titanium_white',2],['cerulean',.3]]),lit:hlmM,mid:hlmS,shade:hlmS,core:hlmS},dens:.6,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06}]});
S(1308,728,16,-.7,M([['titanium_white',3],['cerulean',.2]]),4,{brush:'filbert',load:1.3,thin:.35});
S(1340,732,12,1.9,rimC(),2.6,{brush:'filbert',load:1.2,thin:.4,opacity:.9});
form({axis:[[1344,736],[1350,722],[1356,708]],w:[5,4,3],cols:{lit:blkL,mid:blkM,shade:blkS,core:blkS},dens:.5,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08}]});
DB(1357,705,9,M([['cadmium_red',1],['alizarin_crimson',.2]]),{load:1.2});DB(1356,704,3.2,'titanium_white',{load:1.3});
// plum fringe peeking under the brim and a few locks
for(let i=0;i<10;i++){S(R(1298,1342),R(745,752),R(8,14),1.57+R(-.4,.4),R(0,1)<.5?hairC():hairLC(),R(2,3.4),{brush:'filbert',load:1.05,thin:.42});}
// ---- hands: our-left hand raised, our-right hand open toward the gate
hand(1250,794,-1.7,32,{lit:mSkL,mid:mSkM,shade:skinS},{open:1,side:1});
hand(1436,798,-.5,32,{lit:mSkM,mid:mSkM,shade:skinS},{open:1,side:-1});
for(const [bx,by] of [[1253,800],[1428,804]]){S(bx,by,12,1.4,M([['titanium_white',1.4],['naples_yellow',.3]]),6,{brush:'flat',load:1.1,thin:.4});}
p.dry();
