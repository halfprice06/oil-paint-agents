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
// SKY (native 2400x1600): a few large soft overlapping strokes forming a true gradient, then 5 big cloud masses (lit top, cool grey-violet belly, blender-softened edges)
FD_=1;
const clampv=(v,a,b)=>Math.max(a,Math.min(b,v));
const skyAt=(y)=>{const t=clampv(y/820,0,1);return M([['cerulean',1.05-t*.8],['ultramarine',.42*(1-t)],['titanium_white',.45+t*2.4],['naples_yellow',t*t*.7],['cadmium_orange',.02*t*t],['quinacridone_rose',t*t*.1+.015],['cobalt_violet',.1*(1-t)+.12*t]]);};
// layer 1: big flat sweeps, row by row, loose lengths and tilts
{let y=-30;while(y<860){const rowh=R(46,70);let x=R(-300,-120);while(x<2500){const L=R(520,900);S(x+L/2,y+R(-10,10),L,R(-.1,.05),skyAt(y+R(-22,22)),R(80,120),{brush:R(0,1)<.5?'flat':'filbert',load:R(.7,1),thin:.45,opacity:R(.85,1),bend:R(-18,18)});x+=L*R(.5,.75);}y+=rowh;}}
// soften: long horizontal blender drags
for(let i=0;i<46;i++){const y=R(-20,840),x=R(-200,1800);BL(seg(x+450,y,R(700,1100),R(-.08,.05),R(-20,20),5),R(70,110),'flat');}
// layer 2: broken colour on top, medium strokes at varied tilts (deeper blue aloft, rose-gold near the horizon)
for(let i=0;i<190;i++){const x=R(-50,2450),y=R(-20,830),t=y/830,k=R(0,1);
  const c=k<.5?skyAt(y+R(-30,30)):k<.68?M([['ultramarine',.45],['cerulean',.85],['titanium_white',.7+t*2],['cobalt_violet',.07]]):k<.84?M([['naples_yellow',.3],['quinacridone_rose',.06],['titanium_white',2.2],['cerulean',.15]]):M([['cerulean',.9],['cobalt_blue',.2],['titanium_white',1+t*2]]);
  S(x,y,R(220,480),R(-.35,.12),c,R(36,66),{brush:R(0,1)<.5?'filbert':'flat',load:R(.6,.95),thin:.5,opacity:R(.28,.6),bend:R(-26,26)});}
for(let i=0;i<14;i++){BL(seg(R(300,2100),R(-10,820),R(500,800),R(-.15,.1),R(-18,18),5),R(60,90),'flat');}
// warm horizon glow
for(let i=0;i<26;i++){S(R(0,2400),R(640,830),R(380,700),R(-.05,.05),M([['naples_yellow',.4],['quinacridone_rose',.05],['titanium_white',2.6],['cobalt_violet',.05]]),R(50,80),{brush:'flat',load:.8,thin:.5,opacity:R(.3,.55),bend:R(-10,10)});}
// ---------- clouds
function cmass(cx,cy,w,h,o){o=o||{};const tint=o.tint||1;const np=Math.round(w/120)+2;const puffs=[];
  for(let i=0;i<np;i++){const f=(i+R(.2,.8))/np;const bump=Math.sin(f*3.14);const rr=h*(.3+.32*bump)*R(.85,1.12);puffs.push([cx+(f-.5)*w*.86,cy-h*.18-bump*h*.22+R(-h*.05,h*.05),rr*1.55,rr]);}
  const polys=puffs.map(q=>ELL(q[0],q[1],q[2],q[3],R(-.1,.1),18));polys.push(ELL(cx,cy+h*.12,w*.47,h*.3,0,22));
  const top=cy-h*.78,bot=cy+h*.42;
  const col=(x,y)=>{const v=clampv((y-top)/(bot-top),0,1);const nx=(x-cx)/(w*.5);let L=clampv(1.08-1.25*v-.18*nx+R(-.1,.1),0,1);
    return M([['titanium_white',.7+3*L],['naples_yellow',.04+.3*L*L],['cadmium_orange',.015*L],['cobalt_violet',.42*(1-L)*tint],['cerulean',.38*(1-L)],['quinacridone_rose',.12*(1-L)+.04*L],['burnt_sienna',.015*(v>.8?1:0)]]);};
  for(const pl of polys)cover(pl,R(38,48),col,{ang:R(-.25,.12),angJ:.4,dens:1.3,len:2.4,brush:'filbert',o:{load:.9,thin:.4}});
  // big lit crown strokes riding the dome
  for(const q of puffs){for(let k=0;k<3;k++){const a0=R(3.5,4.9),n=4,pts=[];for(let j=0;j<n;j++){const a=a0+j*.3;pts.push([q[0]+Math.cos(a)*q[2]*.85,q[1]+Math.sin(a)*q[3]*.8,.5+.5*Math.sin(Math.PI*j/(n-1))]);}
    F(pts,M([['titanium_white',3.4],['naples_yellow',.3],['quinacridone_rose',.04]]),R(22,36),{brush:'filbert',load:1.3,thin:.34,opacity:R(.7,1)});}}
  // cool belly
  for(let k=0;k<7;k++){S(cx+R(-.4,.4)*w,cy+h*R(.18,.4),R(.3,.55)*w,R(-.06,.06),M([['cobalt_violet',.5],['cerulean',.35],['titanium_white',1.3],['quinacridone_rose',.1]]),R(26,44),{brush:'filbert',load:.8,thin:.5,opacity:R(.4,.7),bend:R(-8,8)});}
  // blender: soften the dome contour and belly, lose edges into the sky
  for(const q of puffs){const a0=R(3.5,4.4),n=5,pts=[];for(let j=0;j<n;j++){const a=a0+j*.32;pts.push([q[0]+Math.cos(a)*q[2]*1.02,q[1]+Math.sin(a)*q[3]*.98,.7]);}BL(pts,R(18,28));}
  for(let k=0;k<8;k++)BL(seg(cx+R(-.42,.42)*w,cy+h*R(.05,.42),R(.25,.5)*w,R(-.05,.05),R(-8,8),4),R(28,48));
  for(let k=0;k<5;k++)BL(seg(cx+R(-.5,.5)*w,cy-h*R(.2,.6),R(100,220),R(-.7,.3),R(-10,10),4),R(16,26));
  // sky-coloured strokes crossing the margin: lost-and-found edge
  for(let k=0;k<10;k++){const a=R(0,6.28);S(cx+Math.cos(a)*w*.5,cy+Math.sin(a)*h*.5,R(70,160),R(-.4,.3),skyAt(cy+Math.sin(a)*h),R(20,34),{brush:'filbert',load:.7,thin:.6,opacity:R(.35,.65),bend:R(-8,8)});}
  // a few thick sunlit touches
  for(let k=0;k<4;k++){const q=puffs[Math.floor(R(0,puffs.length))];S(q[0]+R(-.3,.3)*q[2],q[1]-q[3]*R(.4,.8),R(40,90),R(-.5,.2),M([['titanium_white',3.5],['naples_yellow',.35]]),R(14,24),{brush:'filbert',load:1.4,thin:.32,opacity:R(.8,1),bend:R(-6,6)});}
}
cmass(1060,190,980,270);
cmass(150,150,460,150);
cmass(430,460,720,130,{tint:1.3});
cmass(1560,350,620,120,{tint:1.2});
cmass(1150,650,820,80,{tint:1.4});
p.dry();
