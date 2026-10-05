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
// CRONO (native 2400x1600): running toward the stage, back three-quarter view, reaching out with his right arm
FD_=.4;
const hD=()=>M([['alizarin_crimson',.5],['vermilion',.6],['burnt_sienna',.25],['cobalt_violet',.08]]);
const hC=()=>M([['alizarin_crimson',.7],['burnt_sienna',.35],['cobalt_violet',.2],['burnt_umber',.15]]);
const hM=()=>M([['vermilion',.8],['cadmium_red',.4],['cadmium_orange',.3]]);
const hL=()=>M([['cadmium_orange',.8],['cadmium_yellow',.4],['vermilion',.3],['titanium_white',.1]]);
const hH=()=>M([['cadmium_orange',.5],['cadmium_yellow',.6],['titanium_white',.4]]);
const hR=()=>M([['quinacridone_rose',.5],['cerulean',.2],['titanium_white',1],['vermilion',.3]]);
const tH=()=>M([['titanium_white',2.6],['cerulean',.3],['naples_yellow',.1]]);
const tL=()=>M([['cerulean',.5],['titanium_white',1.6],['cobalt_blue',.25],['naples_yellow',.08]]);
const tM=()=>M([['cerulean',.7],['cobalt_blue',.4],['titanium_white',.9]]);
const tHf=()=>M([['cobalt_blue',.6],['cerulean',.3],['titanium_white',.7],['cobalt_violet',.12]]);
const tS=()=>M([['ultramarine',.55],['cobalt_violet',.3],['cerulean',.2],['titanium_white',.7]]);
const tC=()=>M([['ultramarine',.7],['cobalt_violet',.4],['paynes_grey',.15],['titanium_white',.35]]);
const tR=()=>M([['titanium_white',2.4],['cerulean',.5],['cobalt_violet',.1]]);
const rfl=()=>M([['cerulean',.25],['cobalt_violet',.25],['titanium_white',.9],['burnt_sienna',.1]]);
const gH=()=>M([['cadmium_lemon',.3],['sap_green',.4],['titanium_white',1.1]]);
const gL=()=>M([['sap_green',.5],['viridian',.2],['titanium_white',.7],['cadmium_yellow',.1]]);
const gM=()=>M([['sap_green',.8],['viridian',.3],['titanium_white',.3]]);
const gS=()=>M([['viridian',.5],['ultramarine',.3],['sap_green',.3],['paynes_grey',.15]]);
const gC=()=>M([['viridian',.5],['ultramarine',.45],['paynes_grey',.3],['sap_green',.1]]);
const gRf=()=>M([['cerulean',.3],['viridian',.3],['titanium_white',.8]]);
const aL=()=>M([['cadmium_orange',.9],['cadmium_yellow',.3],['titanium_white',.2]]);
const aM=()=>M([['cadmium_orange',.9],['vermilion',.3]]);
const aS=()=>M([['vermilion',.5],['burnt_sienna',.5],['cobalt_violet',.2]]);
const aH=()=>M([['cadmium_yellow',.6],['cadmium_orange',.4],['titanium_white',.6]]);
const pH=()=>M([['naples_yellow',.5],['titanium_white',2],['yellow_ochre',.1]]);
const pL=()=>M([['naples_yellow',.6],['yellow_ochre',.3],['titanium_white',1.5]]);
const pM=()=>M([['yellow_ochre',.6],['naples_yellow',.3],['raw_sienna',.15],['titanium_white',.9]]);
const pHf=()=>M([['yellow_ochre',.5],['raw_sienna',.3],['cobalt_violet',.1],['titanium_white',.7]]);
const pS=()=>M([['raw_sienna',.45],['cobalt_violet',.35],['burnt_sienna',.15],['titanium_white',.7]]);
const pC=()=>M([['burnt_sienna',.5],['cobalt_violet',.5],['ultramarine',.1],['titanium_white',.5]]);
const pRf=()=>M([['cobalt_violet',.4],['naples_yellow',.3],['titanium_white',1.2],['burnt_sienna',.1]]);
const bH=()=>M([['burnt_sienna',.4],['raw_sienna',.4],['titanium_white',.8]]);
const bL=()=>M([['burnt_sienna',.6],['raw_sienna',.4],['titanium_white',.25]]);
const bM=()=>M([['burnt_umber',.9],['burnt_sienna',.3]]);
const bS=()=>M([['burnt_umber',.8],['ivory_black',.4],['ultramarine',.3]]);
const bC=()=>M([['ivory_black',.6],['burnt_umber',.5],['ultramarine',.3]]);
const blt=()=>M([['ivory_black',.6],['burnt_umber',.4],['ultramarine',.2]]);
const wL=()=>M([['titanium_white',3],['naples_yellow',.1]]);
const wM=()=>M([['titanium_white',2],['cerulean',.2],['cobalt_violet',.1]]);
const wS=()=>M([['titanium_white',1.9],['cobalt_violet',.2],['cerulean',.1],['naples_yellow',.05]]);
const dpC=()=>M([['ultramarine',.4],['cobalt_violet',.45],['burnt_sienna',.25],['burnt_umber',.15],['titanium_white',.7]]);
const TUN={hi:tH,lit:tL,mid:tM,half:tHf,shade:tS,core:tC,refl:rfl,rim:tR};
const SLV={hi:gH,lit:gL,mid:gM,shade:gS,core:gC,refl:gRf,rim:tR};
const PNT={hi:pH,lit:pL,mid:pM,half:pHf,shade:pS,core:pC,refl:pRf};
const BOT={hi:bH,lit:bL,mid:bL,half:bM,shade:bM,core:bC,refl:bS};
const SK={hi:skinHi,lit:skinL,mid:skinM,half:skinH,shade:skinS,core:skinS,refl:skinR};

// ---- cast shadow on the cobbles, long toward the lower right (low sun from the left), broken by stones
for(let i=0;i<46;i++){const t=R(0,1);const x=lerp(560,1000,t)+R(-30,30),y=lerp(1566,1592,t)+R(-14,10);
  S(x,y,R(90,230),R(-.05,.12),dpC(),R(14,34),{brush:'flat',load:.85,thin:.55,opacity:R(.3,.7)});}
for(const [x,y,l] of [[640,1568,200],[760,1580,260],[880,1586,200],[860,1555,140]])S(x,y,l,R(-.03,.08),M([['ultramarine',.5],['cobalt_violet',.55],['burnt_umber',.3],['titanium_white',.2]]),R(18,26),{brush:'flat',load:.9,thin:.55,opacity:.55});

// ---- back leg (his left), pushing off: thigh, shin, boot with the heel lifted
form({axis:[[646,1376],[622,1424],[598,1462]],w:[84,78,60],cols:PNT,dens:.42,rimK:0});
form({axis:[[598,1462],[574,1490],[548,1514]],w:[60,60,48],cols:PNT,dens:.42});
for(let i=0;i<5;i++){const t=R(.05,.95);const q=[lerp(646,598,t),lerp(1376,1462,t)];crease([[q[0]-26,q[1]+R(-4,4)],[q[0],q[1]+R(8,14)],[q[0]+24,q[1]+R(-2,6)]],pS,pH,R(5,8));}
form({axis:[[566,1494],[552,1512],[540,1530]],w:[52,48,42],cols:BOT,dens:.42}); // boot shaft
form({axis:[[546,1520],[530,1546],[504,1560]],w:[44,46,40],cols:BOT,dens:.45}); // foot, toe down on the stones
S(556,1498,56,-.45,M([['burnt_sienna',.6],['raw_sienna',.5],['titanium_white',.4]]),11,{brush:'flat',load:1.1,thin:.4}); // folded boot cuff
S(552,1492,40,-.45,M([['titanium_white',1],['raw_sienna',.6],['yellow_ochre',.3]]),4,{brush:'flat',load:1.2,thin:.38,opacity:.85});
S(512,1566,50,.05,M([['burnt_umber',.8],['ivory_black',.5]]),9,{brush:'flat',load:1,thin:.45});

// ---- front leg (his right): thigh forward, shin nearly vertical, heel about to land
form({axis:[[702,1378],[742,1412],[778,1450]],w:[88,80,62],cols:PNT,dens:.42});
form({axis:[[778,1450],[790,1486],[800,1522]],w:[62,60,46],cols:PNT,dens:.42});
for(let i=0;i<5;i++){const t=R(.05,.95);const q=[lerp(702,778,t),lerp(1378,1450,t)];crease([[q[0]-28,q[1]+R(-4,4)],[q[0],q[1]+R(8,14)],[q[0]+26,q[1]+R(-2,6)]],pS,pH,R(5,8));}
form({axis:[[788,1480],[796,1512],[802,1538]],w:[56,52,44],cols:BOT,dens:.42});
form({axis:[[800,1530],[822,1550],[858,1558]],w:[46,46,38],cols:BOT,dens:.45});
S(790,1488,58,.2,M([['burnt_sienna',.6],['raw_sienna',.5],['titanium_white',.4]]),11,{brush:'flat',load:1.1,thin:.4});
S(788,1482,40,.2,M([['titanium_white',1],['raw_sienna',.6],['yellow_ochre',.3]]),4,{brush:'flat',load:1.2,thin:.38,opacity:.85});
S(836,1566,70,.02,M([['burnt_umber',.8],['ivory_black',.5]]),9,{brush:'flat',load:1,thin:.45});
for(let i=0;i<6;i++)S(R(780,850),R(1500,1556),R(10,26),R(1.2,2),tR(),R(2,4),{brush:'filbert',load:1.2,thin:.38,opacity:R(.5,.85)}); // cool gate-light on the boot edges

// ---- seat / hips under the tunic
form({axis:[[608,1384],[672,1392],[738,1386]],w:[70,86,70],cols:PNT,dens:.4});

// ---- torso: pale-blue tunic, broad at the shoulders, belted, flaring at the hem
const TA=[[676,1232],[676,1290],[672,1340],[672,1404]];
const tun=form({axis:TA,w:[132,136,108,152],cols:TUN,dens:.5,pf:.46});
// shoulder yoke and centre-back seam, folds from the belt to the hem
crease([[622,1244],[664,1232],[706,1236],[740,1244]],tS,tH,6);
crease([[674,1262],[676,1300],[672,1340]],tC,tL,5,{op:.5});
for(let k=0;k<7;k++){const u=lerp(-.8,.8,(k+R(.1,.9))/7);const a=tun.pos(.62,u),b=tun.pos(1,u*1.05);crease([[a[0],a[1]],[(a[0]+b[0])/2+R(-5,5),(a[1]+b[1])/2],[b[0]+R(-4,4),b[1]]],u>0?tC:tS,u<-.2?tL:null,R(5,9));}
// hem: a darker lip with a bright turned edge
S(672,1402,150,.02,M([['ultramarine',.5],['cobalt_violet',.4],['titanium_white',.5]]),9,{brush:'flat',load:1,thin:.45,bend:4,opacity:.9});
S(650,1396,80,.03,tR(),4,{brush:'flat',load:1.15,thin:.4,opacity:.85,bend:3});
// green shirt hem peeking below the tunic at both sides
S(606,1404,36,1.2,gL(),12,{brush:'filbert',load:1,thin:.45});S(752,1402,30,1.2,gS(),12,{brush:'filbert',load:1,thin:.45});
// belt (black leather) with a small lit edge, a loop, and the pouch strap
form({axis:[[618,1334],[672,1344],[728,1336]],w:[22,22,22],cols:{lit:()=>M([['burnt_umber',.6],['titanium_white',.4],['raw_sienna',.3]]),mid:blt,shade:blt,core:blt},dens:1,lv:[{k:1,d:1,op:1,len:[1.6,3]},{k:.5,d:1,op:.95,len:[1.4,3]}],blend:false});

// ---- katana: sheath trailing from the left hip, hilt wrapped, tsuba, red cord wraps
form({axis:[[664,1346],[570,1374],[478,1400]],w:[30,26,20],cols:{hi:bH,lit:bL,mid:bM,shade:bS,core:bC},dens:.42,pf:.5});
S(570,1374,176,2.86,M([['titanium_white',1.2],['burnt_sienna',.5],['yellow_ochre',.3]]),3.4,{brush:'flat',load:1.1,thin:.4,opacity:.7});
for(const [x,y] of [[608,1364],[580,1372],[536,1384]])S(x,y,22,1.9,M([['cadmium_red',1],['alizarin_crimson',.3]]),7,{brush:'flat',load:1.1,thin:.4});
DB(476,1402,13,M([['cadmium_yellow',.8],['yellow_ochre',.5],['titanium_white',.3]]),{pressure:.9});
form({axis:[[672,1342],[700,1334],[728,1328]],w:[16,16,15],cols:{lit:()=>M([['titanium_white',2],['naples_yellow',.3]]),mid:()=>M([['paynes_grey',.6],['titanium_white',1]]),shade:()=>M([['paynes_grey',1],['ultramarine',.3]])},dens:1,lv:[{k:1,d:1,op:1,len:[1.6,3]},{k:.5,d:1,op:.95,len:[1.4,3]}],blend:false});
DB(668,1346,18,M([['titanium_white',2],['yellow_ochre',.4]]),{pressure:.8});

// ---- right arm (our right): forearm first, then the upper arm over the elbow, reaching up toward Marle
form({axis:[[838,1240],[872,1204],[906,1166]],w:[42,34,25],cols:SLV,dens:.5,pf:.5});
form({axis:[[742,1244],[792,1252],[842,1240]],w:[54,48,42],cols:SLV,dens:.5,pf:.5});
S(744,1256,64,.05,gC(),7,{brush:'filbert',load:.9,thin:.5,opacity:.45});
crease([[838,1222],[846,1240],[836,1256]],gC,gH,6);crease([[850,1226],[858,1240],[850,1252]],gC,null,4,{op:.5});
S(904,1170,24,-.8,M([['titanium_white',1.3],['naples_yellow',.3]]),11,{brush:'flat',load:1.1,thin:.4}); // cuff
hand(914,1156,-.82,48,{lit:skinL,mid:skinM,shade:skinS},{open:.7,side:-1});
// ---- left arm (our left): swinging back, fist on the sheath
form({axis:[[580,1318],[566,1352],[552,1384]],w:[38,30,24],cols:SLV,dens:.5,pf:.5});
form({axis:[[616,1248],[596,1284],[580,1318]],w:[52,46,38],cols:SLV,dens:.5,pf:.5});
crease([[566,1296],[584,1316],[600,1308]],gC,gH,6);crease([[558,1302],[574,1324]],gC,null,4,{op:.5});
S(556,1376,32,.2,M([['titanium_white',1.3],['naples_yellow',.3]]),10,{brush:'flat',load:1.1,thin:.4}); // cuff
hand(548,1388,1.9,44,{lit:skinL,mid:skinM,shade:skinS},{fist:true});

// ---- neck, ascot, head
form({axis:[[676,1174],[678,1200],[674,1228]],w:[44,46,52],cols:SK,dens:.4,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.1,op:.95,len:[1.4,3],j:.06},{k:.25,d:1.2,op:.9,len:[1.2,3],j:.04}]});
S(678,1190,48,0,skinS(),12,{brush:'filbert',load:.9,thin:.5,opacity:.7});
form({axis:[[634,1214],[672,1228],[712,1224],[736,1212]],w:[22,26,26,20],cols:{hi:aH,lit:aL,mid:aM,shade:aS,core:aS,refl:aM},dens:.45});
form({axis:[[646,1218],[606,1226],[566,1224],[530,1240]],w:[20,18,13,5],cols:{hi:aH,lit:aL,mid:aM,shade:aS,core:aS},dens:.45,blend:false});
form({axis:[[646,1226],[606,1244],[578,1250],[552,1246]],w:[14,11,8,3],cols:{lit:aM,mid:aS,shade:aS,core:aS},dens:.4,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.1,op:.95,len:[1.4,3],j:.06}]});
function spike(b,t,w,bend,o){o=o||{};const ang=Math.atan2(t[1]-b[1],t[0]-b[0]);const nx=-Math.sin(ang),ny=Math.cos(ang);
 const ax=[];for(let i=0;i<=4;i++){const f=i/4;ax.push([lerp(b[0],t[0],f)+nx*bend*Math.sin(Math.PI*f*.9),lerp(b[1],t[1],f)+ny*bend*Math.sin(Math.PI*f*.9)]);}
 form({axis:ax,w:[w,w*.94,w*.72,w*.44,w*.08],cols:o.back?{lit:hM,mid:hD,shade:hC,core:hC}:{hi:hH,lit:hL,mid:hM,half:hM,shade:hD,core:hC,refl:hR},dens:.4,pf:.55,blend:!o.back,
  lv:[{k:1,d:1,op:1,len:[1.8,3.4],j:.08},{k:.5,d:1.2,op:.95,len:[1.6,3.4],j:.06},{k:.26,d:1.1,op:.9,len:[1.4,3.4],j:.04}],hiK:.7,rimK:0});}
for(const [b,t,w,bd2] of [[[672,1104],[668,1012],18,3],[[652,1108],[600,1004],18,-6],[[692,1108],[728,1024],18,5],[[662,1106],[648,998],18,-5]])spike(b,t,w,bd2,{back:true});
// the skull under the hair
form({axis:[[672,1082],[672,1112],[674,1150],[678,1186]],w:[50,92,98,68],cols:{hi:hH,lit:hL,mid:hM,half:hM,shade:hD,core:hC,refl:hD},dens:.5,pf:.45});
for(const [b,t,w,bd2] of [[[680,1110],[694,994],30,10],[[660,1112],[636,988],30,-10],[[644,1118],[584,1024],28,-16],[[700,1116],[752,1014],28,16],[[632,1136],[552,1086],24,-12],[[708,1136],[784,1098],24,12],[[626,1156],[544,1176],16,10],[[688,1108],[720,1042],22,9],[[670,1106],[678,980],22,-4],[[650,1112],[612,1042],22,-8],[[714,1128],[772,1072],20,8],[[636,1126],[596,1060],20,-6]])spike(b,t,w,bd2);
// flame licks over the crown, following the spikes' direction
for(let i=0;i<46;i++){const a=R(3.5,5.9),r=R(.25,1);const x=672+Math.cos(a)*44*r,y=1114+Math.sin(a)*40*r;const dir=a+R(-.25,.25);S(x,y,R(30,60),dir,R(0,1)<.3?hL():R(0,1)<.65?hM():hD(),R(6,12),{brush:'filbert',load:1.02,thin:.42,bend:R(-5,5)});}
for(let i=0;i<22;i++){const a=R(3.6,5.8);const x=672+Math.cos(a)*38*R(.4,1),y=1112+Math.sin(a)*36*R(.4,1);S(x,y,R(18,34),a+R(-.2,.2),R(0,1)<.5?hH():hL(),R(4,8),{brush:'filbert',load:1.2,thin:.38,opacity:.9});}
// hair below the band down to the nape, curving up into a hairline; short, cut strokes
for(let i=0;i<70;i++){const x=R(630,716),y=R(1136,1190);const edge=Math.abs(x-672)/44;if(y>1186-edge*16)continue;S(x,y,R(14,28),1.57+R(-.4,.4)+(x-672)*.01,R(0,1)<.55?hM():R(0,1)<.5?hD():hC(),R(5,9),{brush:'filbert',load:1,thin:.45});}
// bandana band across the brow and its flying tails
form({axis:[[624,1126],[672,1146],[722,1128]],w:[26,30,26],cols:{hi:wL,lit:wL,mid:wM,shade:wS,core:wS,refl:wM},dens:.5,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06},{k:.25,d:1.2,op:.9,len:[1.2,3],j:.04}]});
form({axis:[[636,1140],[602,1150],[570,1148],[544,1164],[528,1186]],w:[18,22,20,13,4],cols:{hi:wL,lit:wL,mid:wM,shade:wS,core:wS},dens:.45,blend:false});
form({axis:[[642,1150],[606,1170],[582,1196],[570,1226]],w:[16,16,12,4],cols:{lit:wM,mid:wS,shade:wS,core:wS},dens:.4,blend:false});
// ear on our left, tucked at the band; cheek and jaw planes on our right catching the gate-light
cover(ELL(624,1152,8,13,0,10),2.4,()=>R(0,1)<.55?skinL():skinM(),{ang:1.2,angJ:.9,dens:2,brush:'filbert',o:{load:1,thin:.4}});
S(625,1154,12,1.5,skinS(),3,{brush:'round',load:.9,thin:.5,opacity:.8});
cover([[708,1144],[720,1150],[718,1172],[708,1182],[702,1164]],3,()=>R(0,1)<.5?skinR():skinH(),{ang:1.45,angJ:.7,dens:2,brush:'filbert',o:{load:1,thin:.4}});
S(716,1158,24,1.5,skinR(),3,{brush:'filbert',load:1.1,thin:.38,opacity:.7});
for(let i=0;i<5;i++){const a=R(3.4,5.9);const b0=[672+Math.cos(a)*40,1112+Math.sin(a)*38];PL([[b0[0],b0[1]],[b0[0]+Math.cos(a)*22+R(-4,4),b0[1]+Math.sin(a)*26],[b0[0]+Math.cos(a)*46,b0[1]+Math.sin(a)*54]],hH(),R(3,4.5),{brush:'filbert',load:1.2,thin:.35,opacity:R(.5,.85)});}
p.dry();
