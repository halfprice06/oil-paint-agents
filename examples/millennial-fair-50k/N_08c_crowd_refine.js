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
// ===== native crowd library: varied fairgoers, three levels of finish =====
const nzc=(x,y)=>Math.sin(x*.043+1.3)*Math.sin(y*.051+.4)+.6*Math.sin(x*.11+y*.07)+.4*Math.sin(x*.19-y*.13);
// shade amount 0 (sun) .. 1 (deep shade) in native coords (old-coordinate logic ported)
const sdn=(X,Y)=>{const x=X/2,y=Y/2;let b=0;if(x>640&&y>600)b+=.32;if(x>330&&x<650&&y>560)b-=.3;
  if(inPoly([[110,448],[300,448],[580,480],[430,496],[100,474]],x,y))b+=.7;
  if(inPoly([[470,440],[610,446],[700,500],[520,474]],x,y))b+=.5;
  const n=nzc(x*.8+50,y*1.6)*.4;return Math.max(0,Math.min(1,.42+b+n));};
const CG=[
 [['titanium_white',1.6],['naples_yellow',.45],['yellow_ochre',.1]],
 [['ultramarine',.4],['cobalt_blue',.4],['titanium_white',.9]],
 [['ultramarine',.55],['paynes_grey',.3],['titanium_white',.4]],
 [['vermilion',.7],['alizarin_crimson',.12],['titanium_white',.3]],
 [['quinacridone_rose',.6],['titanium_white',1]],
 [['sap_green',.6],['viridian',.2],['titanium_white',.6]],
 [['viridian',.4],['cerulean',.4],['titanium_white',.7]],
 [['yellow_ochre',.7],['cadmium_yellow',.25],['titanium_white',.4]],
 [['cadmium_orange',.6],['titanium_white',.5],['yellow_ochre',.2]],
 [['cobalt_violet',.7],['titanium_white',.8],['ultramarine',.15]],
 [['burnt_sienna',.7],['burnt_umber',.35],['titanium_white',.25]],
 [['burnt_umber',.8],['ultramarine',.25],['titanium_white',.3]],
 [['paynes_grey',.5],['titanium_white',.9],['cobalt_violet',.1]],
 [['sap_green',.5],['yellow_ochre',.5],['burnt_umber',.15],['titanium_white',.4]],
 [['titanium_white',2.2],['cerulean',.08]],
 [['yellow_ochre',.4],['naples_yellow',.5],['titanium_white',1],['raw_sienna',.15]],
 [['alizarin_crimson',.5],['burnt_sienna',.4],['cobalt_violet',.2],['titanium_white',.3]],
 [['cerulean',.7],['titanium_white',1.2]]];
const CDARK=[CG[2],CG[11],CG[12],CG[10],CG[13],CG[15],CG[16],CG[11],CG[2]]; // trousers / skirts range
// tone k: 0 highlight, 1 lit, 2 mid, 3 shade, 4 core shadow
let HZ=0;
function tn(b,k){k=k+R(-.45,.45);if(HZ>0)b=b.concat([['titanium_white',HZ*.7],['cobalt_violet',HZ*.18],['cerulean',HZ*.12]]);
 if(k<.5)return M(b.concat([['titanium_white',.55],['naples_yellow',.12]]));
 if(k<1.5)return M(b.concat([['titanium_white',.22],['naples_yellow',.06],['raw_umber',.05]]));
 if(k<2.5)return M(b.concat([['raw_umber',.1]]));
 if(k<3.5)return M(b.concat([['cobalt_violet',.38],['ultramarine',.12],['burnt_umber',.12]]));
 return M(b.concat([['ultramarine',.3],['burnt_umber',.35],['cobalt_violet',.25]]));}
const skT=k=>k<1?M([['flesh_tint',1],['titanium_white',1],['naples_yellow',.1]]):k<2?M([['flesh_tint',1],['titanium_white',.65],['naples_yellow',.05]]):k<3?M([['flesh_tint',1],['titanium_white',.35],['burnt_sienna',.1]]):k<4?M([['flesh_tint',.9],['burnt_sienna',.25],['cobalt_violet',.2],['titanium_white',.2]]):skinS();
const hrT=()=>{const k=R(0,1);return k<.26?M([['burnt_umber',1],['ultramarine',.25],['titanium_white',.25]]):k<.5?M([['burnt_sienna',.8],['burnt_umber',.4],['titanium_white',.2]]):k<.7?M([['yellow_ochre',.8],['naples_yellow',.5],['raw_sienna',.3]]):k<.85?M([['burnt_umber',.7],['ultramarine',.35],['titanium_white',.4]]):k<.94?M([['titanium_white',1.2],['paynes_grey',.4]]):M([['ivory_black',.5],['burnt_umber',.4]]);};
const deepS=()=>M([['ultramarine',.4],['cobalt_violet',.45],['burnt_sienna',.25],['burnt_umber',.15],['titanium_white',.7]]);
const hatC=(kind)=>{
 if(kind==='straw')return [()=>M([['naples_yellow',.8],['yellow_ochre',.4],['titanium_white',1]]),()=>M([['yellow_ochre',.7],['naples_yellow',.4],['raw_sienna',.2],['titanium_white',.3]])];
 if(kind==='white')return [()=>M([['titanium_white',2],['cerulean',.1]]),()=>M([['titanium_white',1.4],['cobalt_violet',.3],['ultramarine',.05]])];
 if(kind==='dark')return [()=>M([['burnt_umber',.8],['ultramarine',.3],['titanium_white',.35]]),()=>M([['burnt_umber',.8],['ultramarine',.4],['ivory_black',.2]])];
 const b=CG[Math.floor(R(0,CG.length))];return [()=>tn(b,1),()=>tn(b,3)];};
const nearest=(arr,x)=>arr;
// ---- one fairgoer. (x,y) = feet, h = height in native px.
function fig(x,y,h,o){o=o||{};HZ=o.haze!==undefined?o.haze:clamp((1020-y)/320,0,.5);
 const lit=o.lit===undefined?1-sdn(x,y):o.lit;const sh=lit>.6?0:lit>.35?.8:1.7;
 const kind=o.kind||(h<90?(R(0,1)<.3?'child':'adult'):(R(0,1)<.12?'child':'adult'));
 const fem=o.fem===undefined?R(0,1)<.5:o.fem;
 const w=(o.w||R(.82,1.3))*(kind==='child'?.85:1);
 const lean=o.lean===undefined?R(-.07,.07):o.lean;
 const rf=R(0,1);const face=o.face||(rf<.5?'back':rf<.82?'right':rf<.94?'front':'left');
 const top=o.top||CG[Math.floor(R(0,CG.length))];
 const bot=o.bot||(fem?(R(0,1)<.6?CG[Math.floor(R(0,CG.length))]:CDARK[Math.floor(R(0,CDARK.length))]):CDARK[Math.floor(R(0,CDARK.length))]);
 const pose=o.pose||(()=>{const r=R(0,1);return r<.5?'stand':r<.72?'walk':r<.82?'wave':r<.9?'hat':r<.95?'hips':'point';})();
 const hs=(kind==='child'?.19:.142)*h;           // head diameter
 const fx=f=>x+lean*h*f;                          // x at height fraction f of feet
 const sw=.25*h*w*(kind==='child'?.85:1);         // shoulder width
 const Ty=y-.83*h;                                 // shoulder line
 const tier=h<92?0:h<190?1:2;
 const hairBack=face==='back'||face==='right'||face==='left';
 // cast shadow on the ground, toward the lower right
 S(x+.3*h,y+.01*h,.5*h,R(-.04,.08),deepS(),Math.max(3,.1*h*w),{brush:'flat',opacity:R(.4,.65),load:.8,thin:.5,bend:0});
 const hatKind=o.hat===undefined?(R(0,1)<.5?(R(0,1)<.5?'straw':R(0,1)<.5?'white':R(0,1)<.5?'dark':'col'):null):o.hat;
 const hx=fx(.9)+(face==='right'?.012*h:face==='left'?-.012*h:0),hy=y-.9*h-(o.up?.015*h:0);
 // --- LEGS / SKIRT
 const wk=pose==='walk'?R(.06,.1)*h:R(-.012,.03)*h;
 if(fem&&R(0,1)<.72||o.skirt){ // skirt, A-line, hem near the ankles
   const hemW=.34*h*w;
   if(tier===0){S(fx(.3),y-.3*h,.5*h,1.57,tn(bot,1.2+sh),.26*h*w,{brush:'filbert',load:1,thin:.45});}
   else{S(fx(.3)-.05*h*w,y-.3*h,.52*h,1.57+R(-.05,.05),tn(bot,1.1+sh),.2*h*w,{brush:'filbert',load:1,thin:.45});
     S(fx(.3)+.06*h*w,y-.3*h,.52*h,1.57+R(-.05,.05),tn(bot,2.8+sh*.5),.15*h*w,{brush:'filbert',load:1,thin:.45,opacity:.92});
     if(tier>=1)for(let k=0;k<(tier===2?4:2);k++){const dx=R(-.13,.13)*h*w;S(fx(.28)+dx,y-.24*h,.34*h,1.57+R(-.06,.06),tn(bot,dx<0?.8:3.2+sh*.4),Math.max(2,.04*h),{brush:'filbert',load:1,thin:.45,opacity:.85});}
     S(fx(.04)+R(-.01,.01)*h,y-.04*h,hemW*.9,0,tn(bot,3+sh*.3),Math.max(2,.025*h),{brush:'flat',load:.95,thin:.5,opacity:.6,bend:1});}
   // feet peeking
   if(tier>=1)for(const sx of [-1,1]){S(fx(.02)+sx*(.05*h+wk*.4*sx)+.015*h,y-.008*h,.075*h,R(-.15,.15),M([['burnt_umber',1],['ultramarine',.3],['titanium_white',R(0,.2)]]),Math.max(2.4,.04*h),{brush:'filbert',load:1,thin:.45,bend:0});}
 }else{ // trousers, two legs with a stride
   const l1=fx(.02)-.05*h*w-wk*.5,l2=fx(.02)+.05*h*w+wk*.5;
   for(const [lx,k] of [[l1,1.4+sh],[l2,2.8+sh*.5]]){S((lx+fx(.5))/2,y-.26*h,.52*h,1.57+(lx-fx(.5))/(.52*h)*.9,tn(bot,k),Math.max(2.8,.12*h*w),{brush:'filbert',load:1,thin:.45,bend:R(-2,2)});}
   if(tier>=1){for(const lx of [l1,l2])S(lx+.015*h,y-.008*h,.085*h,R(-.15,.15),M([['burnt_umber',1],['ivory_black',.3],['titanium_white',R(0,.2)]]),Math.max(2.6,.045*h),{brush:'filbert',load:1,thin:.45,bend:0});}
 }
 // --- TORSO (bodice / jacket / shirt)
 const tc1=tn(top,1+sh),tc2=tn(top,2+sh*.8),tc3=tn(top,3+sh*.5);
 if(tier===0){S(fx(.66),y-.66*h,.34*h,1.57-lean,tc2,.24*h*w,{brush:'filbert',load:1,thin:.45});S(fx(.7)-.04*h*w,y-.7*h,.28*h,1.57-lean,tc1,.1*h*w,{brush:'filbert',load:1.05,thin:.42,opacity:.9});}
 else{
   const ty=tier===2?.65:.66;
   S(fx(ty)-.06*sw,y-ty*h,.36*h,1.57-lean+R(-.14,.14),tc1,.18*h*w,{brush:'filbert',load:1,thin:.45});
   S(fx(ty)+.07*sw,y-ty*h,.34*h,1.57-lean+R(-.14,.14),tc3,.14*h*w,{brush:'filbert',load:1,thin:.45,opacity:.95});
   S(fx(ty+.03),y-(ty+.03)*h,.3*h,1.57-lean,tc2,.14*h*w,{brush:'filbert',load:1,thin:.45,opacity:.9});
   // sloping shoulders
   for(const sg of [-1,1])S(fx(.84)+sg*sw*.28,Ty+.015*h,sw*.55,sg*.3,sg<0?tc1:tc3,Math.max(2.6,.07*h),{brush:'filbert',load:1,thin:.45,bend:0});
   // shoulders: a cap of light on the lit shoulder, collar, apron or sash variants
   S(fx(.8)+.01*h,Ty+.02*h,sw*1.05,R(-.12,.12),tn(top,.6+sh*.5),Math.max(2.4,.05*h),{brush:'filbert',load:1.1,thin:.4,opacity:.9});
   const acc=R(0,1);
   if(acc<.18){S(fx(.5),y-.5*h,.3*h*w,R(-.1,.1),tn(R(0,1)<.5?CG[14]:CG[0],1.2+sh),Math.max(2.4,.04*h),{brush:'flat',load:1,thin:.45,bend:1});} // sash / belt
   else if(acc<.34&&fem){S(fx(.55),y-.56*h,.3*h,1.57,tn(CG[14],1.2+sh),.11*h*w,{brush:'filbert',load:1,thin:.45,opacity:.85});} // apron
   if(tier===2){for(let k=0;k<3;k++)S(fx(.62)+R(-.08,.08)*h,y-.62*h,.2*h,1.57+R(-.2,.2),tn(top,R(1,3.6)+sh*.5),Math.max(2,.025*h),{brush:'filbert',load:1,thin:.45,opacity:.7});}
 }
 // --- ARMS
 const hand=(ax,ay)=>DB(ax,ay,Math.max(2.4,.052*h),skT(1.5+sh*.5),{pressure:.8});
 for(const sg of [-1,1]){const ax=fx(.8)+sg*sw*.5,ay=Ty+.03*h;const sc=sg<0?tn(top,1.2+sh):tn(top,2.8+sh*.5);
   let mode=pose==='wave'&&sg>0?'up':pose==='hat'&&sg<0?'hat':pose==='hips'?'hips':pose==='point'&&sg>0?'point':'down';
   if(tier===0&&mode!=='up'&&mode!=='point')continue;
   if(mode==='down'){const ex=ax+sg*R(.01,.05)*h,ey=ay+.13*h,wx=ex+sg*R(0,.04)*h,wy=ay+.25*h;F([[ax,ay,.8],[ex,ey,.85],[wx,wy,.5]],sc,Math.max(2.6,.082*h),{brush:'filbert',load:1,thin:.45});hand(wx,wy+.015*h);}
   else if(mode==='up'){const ex=ax+sg*.07*h,ey=ay-.08*h,wx=ex+sg*.04*h,wy=ey-.17*h;F([[ax,ay,.8],[ex,ey,.85],[wx,wy,.55]],sc,Math.max(2.6,.082*h),{brush:'filbert',load:1,thin:.45});DB(wx,wy-.02*h,Math.max(3,.06*h),skT(1.3),{pressure:.85});if(tier>=1)for(let f=-1;f<=1;f++)S(wx+f*.014*h,wy-.05*h,.05*h,-1.57+f*.35,skT(1.6),Math.max(1.4,.016*h),{brush:'round',load:1,thin:.45,bend:0});}
   else if(mode==='point'){const wx=ax+sg*.22*h,wy=ay-.2*h;F([[ax,ay,.8],[ax+sg*.1*h,ay-.08*h,.85],[wx,wy,.5]],sc,Math.max(2.6,.082*h),{brush:'filbert',load:1,thin:.45});DB(wx+sg*.015*h,wy-.015*h,Math.max(2.6,.05*h),skT(1.3),{pressure:.85});}
   else if(mode==='hat'){const wx=hx-.04*h,wy=hy+.01*h;F([[ax,ay,.8],[ax-.07*h,ay+.1*h,.85],[wx,wy,.5]],sc,Math.max(2.6,.082*h),{brush:'filbert',load:1,thin:.45,bend:3});hand(wx,wy);}
   else{const ex=ax+sg*.1*h,ey=ay+.14*h,wx=ax+sg*.02*h,wy=ay+.26*h;F([[ax,ay,.8],[ex,ey,.85],[wx,wy,.5]],sc,Math.max(2.6,.082*h),{brush:'filbert',load:1,thin:.45});hand(wx,wy);}}
 // --- NECK and HEAD
 if(tier>=1&&!(hatKind&&R(0,1)<0))S(fx(.84),y-.835*h,.04*h,1.57,skT(2.4+sh*.3),Math.max(2.4,.05*h),{brush:'filbert',load:1,thin:.45});
 const sk1=skT(1.4+sh*.4),sk2=skT(2.6+sh*.4);
 if(face==='back'){DB(hx,hy,hs,hrT(),{pressure:.9,load:1.05});if(tier>=1)DB(hx-.14*hs,hy-.18*hs,hs*.55,M([['burnt_sienna',.4],['titanium_white',.7],['yellow_ochre',.2]]),{pressure:.7,opacity:.55,load:.9});
   if(tier>=1&&!hatKind&&R(0,1)<.55)DB(hx+.38*hs,hy+.35*hs,hs*.28,sk2,{pressure:.7}); // ear
 }else if(face==='right'){DB(hx,hy,hs,sk1,{pressure:.9,load:1.05});DB(hx-.22*hs,hy-.14*hs,hs*.86,hrT(),{pressure:.85,load:1.05});if(tier>=1)DB(hx+.34*hs,hy+.1*hs,hs*.34,skT(1.1),{pressure:.7,load:1.1});}
 else if(face==='left'){DB(hx,hy,hs,sk2,{pressure:.9,load:1.05});DB(hx+.22*hs,hy-.14*hs,hs*.86,hrT(),{pressure:.85,load:1.05});}
 else{DB(hx,hy,hs,sk1,{pressure:.9,load:1.05});DB(hx,hy-.3*hs,hs*.9,hrT(),{pressure:.8,load:1.05});if(tier>=1){DB(hx+.2*hs,hy+.15*hs,hs*.5,sk2,{pressure:.6,opacity:.6});if(tier===2){for(const ex of [-.2,.2])DB(hx+ex*hs,hy+.02*hs,Math.max(1.4,hs*.1),M([['burnt_umber',1],['ultramarine',.3]]),{pressure:.6});DB(hx,hy+.28*hs,Math.max(1.6,hs*.18),M([['alizarin_crimson',.5],['flesh_tint',.8],['burnt_sienna',.2]]),{pressure:.6,opacity:.8});}}}
 // --- HAT
 if(hatKind){const hc=hatC(hatKind);const wide=hatKind==='straw'||hatKind==='white';
   if(wide){S(hx-.01*h,hy-.03*h,(.2+R(0,.06))*h,R(-.15,.1),hc[R(0,1)<.6?0:1](),Math.max(2.4,.05*h),{brush:'flat',load:1.1,thin:.4,bend:2});
     if(tier>=1)DB(hx-.02*h,hy-.07*h,.1*h,hc[0](),{pressure:.9,load:1.1});}
   else{DB(hx-.005*h,hy-.05*h,hs*1.05,hc[0](),{pressure:.9,load:1.1});if(tier>=1)S(hx,hy-.01*h,.12*h,0,hc[1](),Math.max(2,.03*h),{brush:'flat',load:1,thin:.45,bend:1});}
   if(tier>=1&&lit>.4)S(hx-.05*h,hy-.075*h,.1*h,R(-.4,.1),M([['titanium_white',2],['naples_yellow',.5]]),Math.max(1.8,.022*h),{brush:'flat',load:1.2,thin:.38,opacity:.8});
 }else if(tier>=1&&lit>.45&&face==='back')S(hx-.2*hs,hy-.36*hs,.5*hs,-.3,M([['naples_yellow',.6],['titanium_white',1.2]]),Math.max(1.8,hs*.16),{brush:'flat',load:1.15,thin:.4,opacity:.7});
 // --- props
 if(o.basket||(tier>=1&&R(0,1)<.05)){const bx=fx(.5)+.2*h,by=y-.4*h;DB(bx,by,.12*h,M([['yellow_ochre',.7],['raw_sienna',.4],['titanium_white',.3]]),{pressure:.9});}
 return {x,y,h,hx,hy,hs};
}
// loose, suggestive crowd dab for the far back: head, shoulders, one mass, nothing more
function dabPerson(x,y,h,o){o=o||{};HZ=o.haze===undefined?.35:o.haze;const top=CG[Math.floor(R(0,CG.length))];const lit=o.lit===undefined?1-sdn(x,y):o.lit;const sh=lit>.6?0:lit>.35?.8:1.7;
 S(x+.3*h,y,.5*h,0,deepS(),Math.max(3,.08*h),{brush:'flat',opacity:.45,load:.8,thin:.5,bend:0});
 S(x+R(-.04,.04)*h,y-.38*h,.62*h,1.57,tn(R(0,1)<.7?top:CDARK[Math.floor(R(0,CDARK.length))],1.4+sh),.26*h*R(.8,1.2),{brush:'filbert',load:1,thin:.45});
 S(x+.03*h,y-.55*h,.34*h,1.57,tn(top,2.8+sh*.5),.12*h,{brush:'filbert',load:1,thin:.45,opacity:.85});
 const hy=y-.9*h;DB(x+R(-.01,.02)*h,hy,.14*h,R(0,1)<.5?hrT():skT(1.8+sh*.3),{pressure:.9});
 if(R(0,1)<.5){const k=R(0,1);S(x-.01*h,hy-.05*h,.2*h,R(-.15,.1),k<.5?M([['naples_yellow',.8],['yellow_ochre',.4],['titanium_white',1]]):k<.75?M([['titanium_white',2],['cerulean',.1]]):M([['burnt_umber',.8],['ultramarine',.3],['titanium_white',.4]]),Math.max(2.4,.05*h),{brush:'flat',load:1.1,thin:.4,bend:2});}
}
// ---- a fully modelled figure for the nearest ones (form-following patches, hands, shoes, hats)
const ccols=(b,sh,hz)=>({hi:()=>tn(b,0+sh),lit:()=>tn(b,1+sh),mid:()=>tn(b,2+sh*.6),half:()=>tn(b,2.6+sh*.5),shade:()=>tn(b,3+sh*.3),core:()=>tn(b,4),refl:()=>tn(b,1.7)});
const skcols=sh=>({hi:()=>skT(0),lit:()=>skT(1+sh*.3),mid:()=>skT(2+sh*.3),half:()=>skT(3),shade:()=>skT(4),core:()=>skT(4),refl:()=>skT(1.4)});
function hairCols(){const k=R(0,1);const m=k<.3?[['burnt_umber',1],['ultramarine',.25]]:k<.6?[['burnt_sienna',.8],['burnt_umber',.4]]:k<.8?[['yellow_ochre',.8],['raw_sienna',.4],['naples_yellow',.3]]:[['burnt_umber',.7],['ultramarine',.35]];
 return {hi:()=>M(m.concat([['titanium_white',.9],['naples_yellow',.2]])),lit:()=>M(m.concat([['titanium_white',.4]])),mid:()=>M(m),half:()=>M(m.concat([['cobalt_violet',.2]])),shade:()=>M(m.concat([['ultramarine',.3],['burnt_umber',.3]])),core:()=>M(m.concat([['ivory_black',.4],['ultramarine',.3]]))};}
function bigFig(x,y,h,o){o=o||{};HZ=0;const lit=o.lit===undefined?1-sdn(x,y):o.lit;const sh=lit>.6?0:lit>.35?.8:1.6;
 const fem=o.fem,w=o.w||1,lean=o.lean===undefined?R(-.05,.05):o.lean,face=o.face||'back',pose=o.pose||'stand';
 const top=o.top||CG[Math.floor(R(0,CG.length))],bot=o.bot||CDARK[Math.floor(R(0,CDARK.length))];
 const fx=f=>x+lean*h*f;const sw=.25*h*w;const hs=.145*h;
 const TC=ccols(top,sh),BC=ccols(bot,sh),SK2=skcols(sh);
 // shadow
 for(let i=0;i<5;i++)S(x+R(.18,.5)*h,y+R(-.01,.02)*h,R(.25,.5)*h,R(-.04,.08),deepS(),R(.03,.06)*h,{brush:'flat',load:.85,thin:.55,opacity:R(.3,.6),bend:0});
 const wk=pose==='walk'?.09*h:.015*h;
 // legs or skirt
 if(fem){const sk=form({axis:[[fx(.56),y-.55*h],[fx(.32),y-.32*h],[fx(.06),y-.07*h]],w:[.2*h*w,.3*h*w,.4*h*w],cols:BC,dens:.9,pf:.45});
   for(let k=0;k<5;k++){const u=lerp(-.85,.85,(k+R(.2,.8))/5);const a=sk.pos(.3,u),b=sk.pos(.95,u*1.04);crease([[a[0],a[1]],[(a[0]+b[0])/2+R(-3,3),(a[1]+b[1])/2],[b[0]+R(-3,3),b[1]]],u>0?(()=>tn(bot,4)):(()=>tn(bot,3)),u<-.3?(()=>tn(bot,.8)):null,Math.max(3,.014*h));}
   for(const sx of [-1,1])form({axis:[[fx(.05)+sx*.05*h-.01*h,y-.05*h],[fx(.02)+sx*.06*h,y-.015*h],[fx(.01)+sx*.07*h+.03*h,y-.004*h]],w:[.05*h,.05*h,.04*h],cols:{lit:()=>M([['burnt_umber',1],['ultramarine',.3],['titanium_white',.25]]),mid:()=>M([['burnt_umber',1],['ultramarine',.3]]),shade:()=>M([['ivory_black',.6],['burnt_umber',.5]]),core:()=>M([['ivory_black',.7],['burnt_umber',.3]])},dens:.5,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06}]});}
 else{for(const [sx,st] of [[-1,-1],[1,1]]){const hipx=fx(.52)+sx*.05*h*w;const kx=fx(.28)+sx*.05*h*w+st*wk*.55,ax=fx(.04)+sx*.05*h*w+st*wk;
   const L1=form({axis:[[hipx,y-.52*h],[kx,y-.28*h],[ax,y-.06*h]],w:[.13*h*w,.11*h*w,.085*h*w],cols:ccols(bot,sh+(sx>0?.5:0)),dens:.7,pf:.5});
   crease([[kx-.05*h,y-.3*h],[kx,y-.275*h],[kx+.05*h,y-.3*h]],()=>tn(bot,4),()=>tn(bot,.8),Math.max(3,.016*h));
   form({axis:[[ax-.01*h,y-.05*h],[ax+.01*h,y-.015*h],[ax+.045*h,y-.006*h]],w:[.06*h,.06*h,.045*h],cols:{hi:()=>M([['burnt_sienna',.4],['raw_sienna',.4],['titanium_white',.8]]),lit:()=>M([['burnt_umber',1],['ultramarine',.3],['titanium_white',.3]]),mid:()=>M([['burnt_umber',1],['ultramarine',.3]]),shade:()=>M([['ivory_black',.6],['burnt_umber',.5]]),core:()=>M([['ivory_black',.7],['burnt_umber',.3]])},dens:.6,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06}]});}}
 // torso with sloping shoulders
 const tor=form({axis:[[fx(.88),y-.88*h],[fx(.8),y-.8*h],[fx(.68),y-.68*h],[fx(.56),y-.56*h]],w:[sw*.42,sw*1.04,sw*.92,sw*(fem?.74:.86)],cols:TC,dens:.9,pf:.46});
 if(fem)S(fx(.55),y-.56*h,sw*.8,R(-.04,.04),tn(R(0,1)<.5?CG[14]:bot,2+sh*.5),Math.max(4,.022*h),{brush:'flat',load:1,thin:.45,bend:2});
 for(let k=0;k<3;k++){const u=lerp(-.7,.7,(k+R(.2,.8))/3);const a=tor.pos(.2,u),b=tor.pos(.95,u);crease([[a[0],a[1]],[(a[0]+b[0])/2+R(-2,2),(a[1]+b[1])/2],[b[0],b[1]]],()=>tn(top,u>0?4:3),u<0?()=>tn(top,.6):null,Math.max(2.4,.012*h));}
 // arms
 const arms=[];for(const sg of [-1,1]){const ax=fx(.8)+sg*sw*.5,ay=y-.81*h;const AC=ccols(top,sh+(sg>0?.4:0));let m=pose==='wave'&&sg>0?'up':pose==='hat'&&sg<0?'hat':pose==='point'&&sg>0?'point':'down';
   let el,wr;if(m==='down'){el=[ax+sg*.025*h,ay+.14*h];wr=[el[0]+sg*.012*h,el[1]+.13*h];}else if(m==='up'){el=[ax+sg*.08*h,ay-.06*h];wr=[el[0]+sg*.05*h,el[1]-.14*h];}else if(m==='point'){el=[ax+sg*.1*h,ay-.05*h];wr=[el[0]+sg*.12*h,el[1]-.12*h];}else{el=[ax-.01*h,ay+.1*h];wr=[fx(.9)-.04*h,y-.9*h+.02*h];}
   form({axis:[[ax,ay],[(ax+el[0])/2+sg*.006*h,(ay+el[1])/2],el],w:[.095*h,.085*h,.072*h],cols:AC,dens:.7,pf:.5});
   form({axis:[el,[(el[0]+wr[0])/2,(el[1]+wr[1])/2],wr],w:[.072*h,.062*h,.05*h],cols:AC,dens:.7,pf:.5});
   const ang=Math.atan2(wr[1]-el[1],wr[0]-el[0]);hand(wr[0]+Math.cos(ang)*.006*h,wr[1]+Math.sin(ang)*.006*h,ang,.08*h,{lit:SK2.lit,mid:SK2.mid,shade:SK2.shade},{open:m==='up'?.8:.3,side:sg,fist:m==='down'&&R(0,1)<.5});}
 // neck and head
 form({axis:[[fx(.86),y-.85*h],[fx(.87),y-.88*h]],w:[.07*h,.065*h],cols:SK2,dens:.6,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06}]});
 const hx=fx(.93)+(o.tilt||0)*h,hy=y-.94*h-(o.up?.012*h:0);const HC=hairCols();
 if(face==='back'){form({axis:[[hx,hy-.07*h],[hx,hy],[hx+.003*h,hy+.065*h]],w:[.08*h,.125*h,.1*h],cols:HC,dens:.8,pf:.45});
   if(R(0,1)<.5)hand(0,0,0,0.001,{lit:skinL,mid:skinM,shade:skinS},{}); // no-op placeholder
 }else{form({axis:[[hx,hy-.07*h],[hx,hy],[hx+.004*h,hy+.065*h]],w:[.085*h,.13*h,.1*h],cols:{hi:()=>skT(0),lit:()=>skT(1+sh*.3),mid:()=>skT(2+sh*.3),half:()=>skT(3),shade:()=>skT(4),core:()=>skT(4),refl:()=>skT(1.4)},dens:.8,pf:.45});
   form({axis:[[hx-.01*h,hy-.075*h],[hx+.005*h,hy-.06*h],[hx+.03*h,hy-.03*h]],w:[.09*h,.1*h,.05*h],cols:HC,dens:.6,blend:false,lv:[{k:1,d:1,op:1,len:[1.6,3],j:.08},{k:.5,d:1.2,op:.95,len:[1.4,3],j:.06}]});
   if(face==='right'){for(const [dx,dy,s2] of [[.04,-.008,.014],[.04,.018,.016]])DB(hx+dx*h,hy+dy*h,Math.max(1.6,s2*h),M([['burnt_umber',1],['ultramarine',.3]]),{pressure:.6});S(hx+.045*h,hy+.04*h,.025*h,0,M([['alizarin_crimson',.5],['flesh_tint',.8]]),Math.max(1.6,.008*h),{brush:'round',load:1,thin:.45,bend:0});}}
 // hat
 const hk=o.hat===undefined?null:o.hat;if(hk){const hc=hatC(hk);const wide=hk==='straw'||hk==='white';
   if(wide){form({axis:[[hx-.14*h,hy-.045*h],[hx,hy-.032*h],[hx+.15*h,hy-.05*h]],w:[.03*h,.04*h,.03*h],cols:{hi:hc[0],lit:hc[0],mid:hc[0],shade:hc[1],core:hc[1]},dens:.8,blend:false});form({axis:[[hx,hy-.03*h],[hx,hy-.085*h]],w:[.105*h,.085*h],cols:{hi:hc[0],lit:hc[0],mid:hc[0],shade:hc[1],core:hc[1]},dens:.7,blend:false});}
   else form({axis:[[hx,hy-.03*h],[hx,hy-.085*h]],w:[.13*h,.11*h],cols:{hi:hc[0],lit:hc[0],mid:hc[0],shade:hc[1],core:hc[1]},dens:.7});}
}
// LIGHT OVER THE CROWD (native), on dry paint: a few leaf-shadow dapples, warm sun on hats and shoulders at the sun side, cool gate-light on the nearest people
FD_=1;
for(let c=0;c<26;c++){const cx=R(0,1300),cy=R(900,1160);const m=Math.round(R(3,6)),a0=R(-.6,.2);
  for(let j=0;j<m;j++)S(cx+R(-60,60),cy+R(-24,24),R(30,80),a0+R(-.3,.3),M([['cobalt_violet',.55],['ultramarine',.2],['burnt_sienna',.2],['titanium_white',.5]]),R(12,28),{brush:'filbert',load:.75,thin:.6,opacity:R(.1,.2),bend:R(-6,6)});
  for(let j=0;j<Math.round(m*.5);j++)S(cx+R(-50,50),cy+R(-20,20),R(14,36),a0+R(-.3,.3),M([['naples_yellow',.4],['titanium_white',2],['cadmium_yellow',.1]]),R(5,11),{brush:'filbert',load:1.05,thin:.45,opacity:R(.3,.55)});}
for(let i=0;i<24;i++){const x=R(20,1280),y=R(880,1120);if(sdn(x,y)>.55&&R(0,1)<.7)continue;const k=R(0,1);
  S(x,y,R(7,16),R(-.7,.1),k<.55?M([['titanium_white',2.4],['naples_yellow',.6]]):k<.85?M([['cadmium_yellow',.4],['titanium_white',1.8]]):M([['vermilion',.4],['titanium_white',1.5]]),R(2.4,5),{brush:'flat',load:1.2,thin:.38,opacity:R(.55,.95)});}
for(let i=0;i<22;i++){const x=R(1100,1290),y=R(960,1130);S(x+R(0,6),y,R(7,16),R(-.5,.2),M([['titanium_white',2],['cerulean',.5],['cobalt_violet',.2]]),R(2,4),{brush:'flat',load:1.2,thin:.4,opacity:R(.35,.7)});}
p.dry();
