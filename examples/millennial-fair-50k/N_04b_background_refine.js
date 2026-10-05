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
// BACKGROUND, refined (native): dappled foliage in leaf-clusters, branches seen between, tent fabric folds,
// stone and boards on the tower, bell modelling, small town details. Second and third layers of broken colour.
FD_=1;
const P2=poly=>poly.map(q=>[q[0]*2,q[1]*2]);
const T=P2([[555,355],[590,285],[670,240],[760,222],[850,232],[940,236],[1015,275],[1045,355],[1045,470],[555,470]]);
const C=P2([[870,-20],[1220,-20],[1220,235],[1120,205],[1050,155],[960,135],[900,75]]);
const GX=1720,GY=830;
const nz=(x,y)=>Math.sin(x*.0215+1.3)*Math.sin(y*.0255+.4)+.6*Math.sin(x*.055+y*.035)+.4*Math.sin(x*.095-y*.065);
const leafLit=()=>M([['cadmium_lemon',.45],['sap_green',.55],['titanium_white',R(.25,.6)],['yellow_ochre',.1]]);
const leafMid=()=>M([['sap_green',1],['cadmium_yellow',R(.1,.35)],['viridian',.15],['titanium_white',.2]]);
const leafSh=()=>M([['sap_green',.7],['viridian',.3],['ultramarine',.3],['titanium_white',.1]]);
const leafDk=()=>M([['ultramarine',.5],['viridian',.35],['burnt_umber',.3],['sap_green',.3]]);
const leafWarm=()=>M([['yellow_ochre',.4],['cadmium_yellow',.4],['sap_green',.4],['titanium_white',.3]]);
function foliage(poly,n,smin,smax,opts){opts=opts||{};let k=0,g=0;const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 while(k<n&&g++<n*30){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;const dg=Math.hypot(x-GX,y-GY);if(opts.dark&&dg<300&&R(0,1)<(1-dg/300)*.9)continue;k++;
  const nn=nz(x*.9,y*.9)+R(-.5,.5)+(opts.lightBias||0)*(1-(y-y0)/(y1-y0)); // higher = lit
  const c=nn>1.0?leafLit():nn>.35?leafMid():nn>-.35?leafSh():(R(0,1)<.2?leafWarm():leafDk());
  const sz=R(smin,smax),a=R(-2.6,-.4);const m=Math.round(R(2,3.6));
  for(let j=0;j<m;j++){const aa=a+R(-.7,.7);const L=sz*R(1.4,2.6);S(x+R(-sz,sz),y+R(-sz*.7,sz*.7),L,aa,c,sz*R(.5,.9),{brush:'filbert',load:R(.85,1.1),thin:.45,opacity:R(.75,1),bend:R(-6,6)});}}}
foliage(T,200,24,46,{dark:true,lightBias:.6});foliage(T,340,11,24,{dark:true,lightBias:.8});foliage(T,260,5,12,{dark:true,lightBias:.8});
foliage(C,120,24,46,{lightBias:.2});foliage(C,200,11,24,{lightBias:.3});foliage(C,200,5,12,{lightBias:.3});
// sky holes and sun-struck leaves along the canopy edge
for(let i=0;i<70;i++){const x=R(1840,2400),y=R(20,420);if(!inPoly(C,x,y))continue;S(x,y,R(14,34),R(-.8,.8),M([['titanium_white',2],['cerulean',.6],['naples_yellow',.3]]),R(7,16),{brush:'filbert',load:1.1,thin:.4,opacity:R(.7,1)});}
// branches seen between the leaf masses: broken, wobbling, never ruler-straight
for(let b=0;b<9;b++){const bx=R(1240,2020),by=R(560,820);const a=R(-2.2,-.6)+(R(0,1)<.5?3.14:0)*0;let x=bx,y=by,ang=R(-.5,.5)+(R(0,1)<.5?0:3.14);const pts=[];for(let j=0;j<5;j++){pts.push([x,y,.7-.1*j]);ang+=R(-.35,.35);x+=Math.cos(ang)*R(26,46);y+=Math.sin(ang)*R(14,30)-8;}
  if(Math.hypot(bx-GX,by-GY)<340)continue;F(pts,M([['burnt_umber',.8],['ultramarine',.3],['sap_green',.2],['titanium_white',.12]]),R(6,11),{brush:'filbert',load:.9,thin:.5,opacity:.9});
  F(pts.map(q=>[q[0]-2,q[1]-2,.6]),M([['yellow_ochre',.4],['burnt_sienna',.4],['titanium_white',.5]]),2.4,{brush:'filbert',load:1.1,thin:.4,opacity:.7});}
// trunks: stronger bark light and moss
for(const [tx,ty] of [[1296,636],[2012,660]]){for(let k=0;k<12;k++)S(tx+R(-8,8),ty+k*24+R(-6,6),R(26,70),1.57+R(-.08,.08),R(0,1)<.5?M([['burnt_umber',.7],['ultramarine',.3],['cobalt_violet',.2],['titanium_white',.2]]):M([['yellow_ochre',.4],['burnt_sienna',.4],['titanium_white',.5]]),R(5,12),{brush:'filbert',load:1,thin:.45,opacity:R(.5,.9),bend:R(-3,3)});
  for(let k=0;k<5;k++)S(tx+R(-10,10),ty+R(0,300),R(14,40),1.57,M([['sap_green',.6],['cadmium_yellow',.2],['titanium_white',.4]]),R(4,8),{brush:'filbert',load:1,thin:.45,opacity:.7});}
// far town: windows, chimneys, tile strokes, haze
for(let x=-20;x<2400;x+=R(54,100)){if(x>130&&x<600)continue;const y=R(704,736);const w=R(40,70);S(x+w/2,y-R(26,40),w*.7,R(-.05,.05),M([['burnt_sienna',.5],['cobalt_violet',.3],['titanium_white',1.5],['cerulean',.15]]),R(8,16),{brush:'flat',load:.9,thin:.5,opacity:.8});
  for(let k=0;k<2;k++)DB(x+w*(.25+.4*k),y-R(8,16),R(5,9),M([['cobalt_violet',.6],['ultramarine',.3],['titanium_white',.5]]),{pressure:.7,opacity:.8});
  if(R(0,1)<.3)S(x+w*.8,y-R(50,66),R(12,20),1.57,M([['burnt_sienna',.5],['titanium_white',1],['cobalt_violet',.2]]),6,{brush:'flat',load:1,thin:.45});}
for(let i=0;i<80;i++){const hx=R(0,2400);if(hx>110&&hx<620)continue;S(hx,R(676,744),R(40,110),R(-.2,.2),M([['titanium_white',2],['cerulean',.3],['cobalt_violet',.2],['sap_green',.1]]),R(6,14),{brush:'filbert',load:.6,thin:.65,opacity:R(.25,.5),bend:R(-5,5)});}
// tent fabric: folds along the stripes, lit crests, shaded valleys, sag at the base, ropes
function tentRef(ax,ay,x0,x1,by,lightA,n){const wid=(x1-x0)/n;
 for(let i=0;i<n;i++){const xa=x0+i*wid,xb=xa+wid;
  for(let k=0;k<3;k++){const u=R(.15,.85);const bx=lerp(xa,xb,u),bY=by;const t0=R(.12,.4),t1=R(.62,.95);
   const pts=[[lerp(ax,bx,t0)+R(-2,2),lerp(ay,bY,t0)],[lerp(ax,bx,(t0+t1)/2)+R(-3,3),lerp(ay,bY,(t0+t1)/2)],[lerp(ax,bx,t1)+R(-2,2),lerp(ay,bY,t1)]];
   const lit=bx<(x0+x1)*.5;F(pts.map((q,j)=>[q[0],q[1],.4+.5*Math.sin(Math.PI*j/2)]),lit?M([['titanium_white',2],['naples_yellow',.5]]):M([['cobalt_violet',.5],['ultramarine',.25],['burnt_sienna',.2],['titanium_white',.3]]),R(4,9),{brush:'filbert',load:1.1,thin:.42,opacity:R(.35,.7)});}}
 for(let i=0;i<=n;i+=2){const xa=x0+i*wid;F([[ax,ay+6,.7],[(ax+xa)/2+R(-2,2),(ay+by)/2,.8],[xa,by,.6]],M([['burnt_umber',.8],['ultramarine',.3],['titanium_white',.3]]),2.4,{brush:'round',load:.8,thin:.6,opacity:.6});}}
tentRef(884,544,636,1136,872,0,12);tentRef(2170,564,1970,2470,856,0,10);
// tower: stone blocks in many tones, broken mortar, lichen, shadow stains; roof boards; bell
for(const [x0,x1,sh] of [[194,282,0],[440,532,1]]){for(let i=0;i<190;i++){const x=R(x0,x1),y=R(320,890);const k=R(0,1);const lit=sh?0:1;
  const c=sh?(k<.5?M([['burnt_umber',.5],['cobalt_violet',.5],['titanium_white',.9],['yellow_ochre',.15]]):M([['cobalt_violet',.55],['ultramarine',.25],['titanium_white',.9],['burnt_sienna',.15]])):(k<.4?M([['naples_yellow',.5],['titanium_white',1.5],['yellow_ochre',.2]]):k<.75?M([['yellow_ochre',.6],['raw_sienna',.3],['titanium_white',1.1]]):M([['raw_sienna',.5],['cobalt_violet',.2],['titanium_white',1],['yellow_ochre',.3]]));
  S(x,y,R(16,38),R(-.06,.06),c,R(10,18),{brush:'flat',load:1,thin:.5,opacity:R(.45,.85)});}
  for(let y=340;y<890;y+=R(36,52)){const sx=x0+R(-2,6);S(sx+(x1-x0)*.5,y,(x1-x0)*R(.5,.95),R(-.03,.03),M([['burnt_umber',.6],['cobalt_violet',.5],['titanium_white',.5]]),R(3,5),{brush:'flat',load:.7,thin:.6,opacity:.6});}
  for(let i=0;i<10;i++)S(R(x0,x1),R(330,880),R(10,26),R(-.5,.5),M([['sap_green',.4],['yellow_ochre',.4],['titanium_white',.8]]),R(3,6),{brush:'filbert',load:1,thin:.45,opacity:.5});}
for(let i=0;i<60;i++){const x=R(300,370),y=R(340,880);S(x,y,R(14,40),R(-.1,.1),M([['burnt_umber',.4],['cobalt_violet',.5],['titanium_white',1]]),R(6,14),{brush:'flat',load:.7,thin:.6,opacity:R(.2,.4)});}
// bell: vertical form strokes, hot gold highlight, reflected cool sky on the right, dark mouth
for(let k=0;k<70;k++){const u=R(-1,1);const x=360+u*66,y=R(400,540);const lit=u<-.2;S(x,y,R(30,70),1.5+u*.1,lit?M([['cadmium_yellow',.5],['yellow_ochre',.6],['titanium_white',R(.3,.8)]]):u<.5?M([['yellow_ochre',.8],['raw_sienna',.5],['burnt_sienna',.15]]):M([['raw_sienna',.7],['burnt_umber',.5],['cobalt_violet',.2]]),R(5,11),{brush:'filbert',load:1,thin:.45,opacity:R(.6,.95)});}
S(330,470,80,1.45,M([['titanium_white',3],['cadmium_yellow',.2]]),7,{brush:'filbert',load:1.35,thin:.34,opacity:.9});
S(430,490,70,1.3,M([['cerulean',.7],['titanium_white',1],['yellow_ochre',.3]]),8,{brush:'filbert',load:.9,thin:.5,opacity:.6});
p.dry();
