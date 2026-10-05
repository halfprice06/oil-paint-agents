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
// ---- people: busts for the crowd mass, figures for nearer people. Light from upper left; shade side is cool violet. ----
const CLOTH=['#b8483a','#4a6eaa','#e0c050','#f0e6d0','#4e8a5a','#8a5aa0','#6a4a38','#d8784a','#d89aa0','#35456a','#c9684a','#7a9ac8','#a8584a','#e8d8b0','#5a8a8a'];
const PANTS=['#3a3048','#4a3a34','#2e3a58','#5a4a3a','#6a5a6a','#7a6a50','#3a4a40'];
const SKIN=[['#ecb896','#a8667a'],['#d99f7c','#955a68'],['#b87e5a','#6e4458'],['#f0c4a4','#b4707e']];
const HAIR=['#2e2020','#5a3a28','#8a5a30','#c89a50','#a8502e','#d8c090','#1e1a28'];
const STRAW=['#f0d27a','#e8c466','#f4dc92','#dcb85a'];
const pick=a=>a[Math.floor(R(0,a.length))%a.length];
const Tn=(c,t,a)=>mixh(c,t,a);
const LITC=(c,a)=>Tn(c,'#fff1cc',a),SHC=(c,a)=>Tn(c,'#34285a',a);
const mkPal=(o,haze)=>{const H=c=>haze?Tn(c,'#b9b4d4',haze):c;const base=Tn(o.cloth||pick(CLOTH),'#8a7c88',R(.04,.18));return {H,base,lit:H(LITC(base,R(.3,.42))),mid:H(base),sh:H(SHC(base,R(.42,.55)))};};
// head with planes: lit forehead/cheek, half-shaded face, hat or hair
function head(hx,hy,hr,o){
  o=o||{};const H=o.H||(c=>c),sk=o.sk||pick(SKIN),lvl=o.lvl===undefined?1:o.lvl;
  const tl={load:1,thin:.3};
  S(hx,hy,hr*1.7,1.57,H(sk[0]),hr*1.55,tl);
  S(hx+hr*.5,hy+hr*.12,hr*1.4,1.57,H(sk[1]),hr*.95,{load:.95,thin:.3,opacity:.85});
  if(lvl>=1)S(hx-hr*.18,hy-hr*.28,hr*.8,1.2,H(Tn(sk[0],'#fff0d8',.45)),hr*.5,{load:1.1,thin:.25});
  if(lvl>=2&&hr>9){S(hx+hr*.2,hy+hr*.02,hr*1.0,0,H(Tn(sk[1],'#3a1a30',.35)),hr*.22,{load:.8,thin:.3,opacity:.8});S(hx+hr*.55,hy+hr*.52,hr*.4,0,H(Tn('#c85a60',sk[0],.3)),hr*.14,{load:.9,thin:.3});}
  const r0=R(0,1);const hat=o.hat||(r0<(o.pStraw===undefined?.2:o.pStraw)?'straw':r0<.42?'cap':'hair');
  if(hat==='straw'){const y0=hy-hr*.6,sz=R(.9,1.25),an=R(-.15,.1),sc=pick(STRAW);S(hx-hr*.4,y0,hr*2.1*sz,an,H(sc),hr*.85,tl);S(hx+hr*.95,y0+hr*.1,hr*1.5*sz,an+.1,H(Tn(sc,'#6a4a80',.4)),hr*.7,{load:1,thin:.3});if(lvl>=1&&R(0,1)<.5)S(hx,y0-hr*.5,hr*1.1,0,H(pick(['#c8483a','#3a4a7a','#6a4a38'])),hr*.5,tl);}
  else if(hat==='cap'){const cc=pick(['#35456a','#6a4a38','#4a4a52','#8a6a48','#7a3a38']);S(hx-hr*.1,hy-hr*.75,hr*2,0,H(LITC(cc,.3)),hr*.9,tl);S(hx+hr*.85,hy-hr*.6,hr*.9,0,H(SHC(cc,.4)),hr*.55,tl);}
  else{const hc=pick(HAIR);S(hx-hr*.25,hy-hr*.6,hr*1.9,.3,H(LITC(hc,.2)),hr*1.05,tl);S(hx+hr*.75,hy-hr*.15,hr*1.2,1.4,H(SHC(hc,.3)),hr*.6,tl);}
}
// head and shoulders only: the crowd mass. Rows behind hide the rest.
function bust(x,yb,h,o){
  o=o||{};const lvl=o.lvl===undefined?0:o.lvl,haze=o.haze||0;const P=mkPal(o,haze);const H=P.H;
  const w=h*R(.25,.31),lean=R(-.04,.04)*h,ysh=yb-h*.8,hr=h*R(.072,.088),hx=x+lean*1.4,hy=yb-h*.915;
  const bs={thin:.4,edge:.5};
  F([[x+lean*.3,ysh+h*.12,.8],[x+lean*.2,ysh+h*.3,.9],[x,ysh+h*.46,.5]],P.sh,w*.95,Object.assign({load:.95,taper:[.1,.6]},bs));
  // chest/shoulder mass: lit left, shaded right, one broad stroke each and a soft touch to join them
  F([[x-w*.5,ysh+h*.07,.7],[x-w*.2,ysh+h*.02,.9],[x+w*.2,ysh+h*.015,.9],[x+w*.52,ysh+h*.07,.7]],P.mid,w*.36,Object.assign({load:1.05},bs));
  F([[x-w*.38,ysh+h*.05,.8],[x-w*.34,ysh+h*.16,.9],[x-w*.25,ysh+h*.25,.5]],P.lit,w*.45,Object.assign({load:1.05,taper:[.1,.5]},bs));
  F([[x+w*.1,ysh+h*.05,.8],[x+w*.2,ysh+h*.16,.9],[x+w*.3,ysh+h*.26,.5]],P.sh,w*.6,Object.assign({load:.95,taper:[.1,.55]},bs));
  if(lvl>=1&&R(0,1)<.55)SB([[x-w*.45,ysh+h*.12,.7],[x,ysh+h*.14,.8],[x+w*.45,ysh+h*.12,.6]],Math.max(14,w*.5),.4);
  if(o.arm){const dir=o.arm;const sx=x+dir*w*.5,sy=ysh+h*.07,ex=sx+dir*h*.1,ey=sy-h*.26;F([[sx,sy,.8],[(sx+ex)/2+dir*3,(sy+ey)/2,.9],[ex,ey,.6]],dir>0?P.sh:P.lit,w*.22,{load:1,thin:.35,edge:.4});F([[ex,ey,.8],[ex+dir*2,ey-h*.04,.8]],pick(SKIN)[dir>0?1:0],w*.22,{load:1,thin:.3});}
  head(hx,hy,hr,{H:H,lvl:lvl});
  if(lvl>=1&&R(0,1)<.5)F([[x-w*.48,ysh+h*.07,.6],[x-w*.5,ysh+h*.14,.8],[x-w*.45,ysh+h*.22,.4]],H(LITC(P.lit,.5)),w*.1,{load:1.25,thin:.25,opacity:.85}); // sun on the shoulder
}
// polygon around a centreline with varying half-widths
function ribbon(pts,ws){const L=[],Rr=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;L.push([pts[i][0]-dy*ws[i],pts[i][1]+dx*ws[i]]);Rr.push([pts[i][0]+dy*ws[i],pts[i][1]-dx*ws[i]]);}return L.concat(Rr.reverse());}
// a limb or garment piece: polygon filled with strokes along its length; colour changes across it (lit side first)
function limb(pts,ws,cols,o){o=o||{};const poly=ribbon(pts,ws);const mw=Math.max(...ws);const dir=Math.atan2(pts[pts.length-1][1]-pts[0][1],pts[pts.length-1][0]-pts[0][0]);
  const cx=pts.reduce((a,q)=>a+q[0],0)/pts.length;
  const planes=cols;return cover(poly,Math.max(3,mw*(o.sz||.8)),(x,y)=>{const t=clamp((x-cx)/(mw*2)+.5+R(-.06,.06),0,1);return K(G(planes,t),.025);},{ang:dir,angJ:o.angJ===undefined?.06:o.angJ,len:o.len||3.2,dens:o.dens||2.3,o:Object.assign({thin:.38,edge:.25,load:1},o.o||{})});}
// cloth planes across a form: lit, mid, half-shade, shade, reflected
const planes=(P,refl)=>[[0,P.lit],[.28,P.mid],[.55,Tn(P.mid,P.sh,.45)],[.8,P.sh],[1,Tn(P.sh,refl||'#d89870',.25)]];
// full figure built from polygons of cloth and limb planes: sloping shoulders, torso narrowing to the waist, coat or skirt or trousers, arms, hands, neck, head
function figure(x,yb,h,o){
  o=o||{};const P=mkPal(o,o.haze||0),H=P.H,lvl=o.lvl===undefined?2:o.lvl;
  const skirt=o.skirt!==undefined?o.skirt:R(0,1)<.3,sk=pick(SKIN),pc=pick(PANTS);const coat=o.coat!==undefined?o.coat:R(0,1)<.7;
  const lean=R(-.03,.03)*h,sw=h*R(.125,.14),hr=h*R(.076,.085);const ysh=yb-h*.81,hx=x+lean*1.6,hy=yb-h*.925;
  const Y=f=>yb-h*f;
  const pr_=R(0,1);const pose=o.pose||(pr_<.34?'down':pr_<.5?'bent':pr_<.62?'akimbo':pr_<.78?'pocket':'down');const stride=(o.stride!==undefined?o.stride:R(0,1)<.4)?R(.03,.075):0;const tilt=R(-.012,.012)*h;
  // cast shadow
  F([[x-h*.04,yb,.6],[x+h*.3,yb+h*.04,.8],[x+h*.62,yb+h*.075,.4]],'#6a5480',h*.05,{load:.9,thin:.6,edge:.8,opacity:.5,taper:[.15,.85]});
  const SCOL=H(Tn(o.skirtC||pick(CLOTH),'#8a7c88',.12));
  const hem=skirt||coat;
  // legs (trousers) or hem: drawn first so the garment overlaps
  if(!skirt){
    const lc=coat?.44:.52;
    for(const [sd,cols] of [[-1,[[0,H(Tn(pc,'#d8c8b0',.2))],[1,H(Tn(pc,'#403050',.2))]]],[1,[[0,H(Tn(pc,'#403050',.15))],[1,H(Tn(pc,'#201830',.45))]]]]){
      limb([[x+sd*h*.04,Y(lc)],[x+sd*h*(.05+stride*.5),Y(.27)],[x+sd*h*(.055+stride)+(sd>0?h*.02:0),Y(.05)]],[h*.052,h*.045,h*.036],cols,{sz:.9,len:3.6});
      F([[x+sd*h*(.055+stride)-h*.02+(sd>0?h*.02:0),Y(.02),.7],[x+sd*h*(.055+stride)+h*.035+(sd>0?h*.02:0),Y(.012),.8]],H(sd<0?'#40364a':'#2a2234'),h*.04,{load:1,thin:.3}); // shoe
    }
  }
  // torso: sloped shoulders, narrowing at the waist; coat/skirt flares to the hem
  const wst=Y(.55),hipy=Y(.5);
  const tor=[[x-h*.045+lean,Y(.865)],[x-sw*.62+lean,Y(.835)],[x-sw*1.0+lean,Y(.80)],[x-sw*.98+lean*.6,Y(.72)],[x-h*.095,wst],[x-h*.105,hipy],[x+h*.105,hipy],[x+h*.095,wst],[x+sw*.98+lean*.6,Y(.72)],[x+sw*1.0+lean,Y(.80)],[x+sw*.62+lean,Y(.835)],[x+h*.045+lean,Y(.865)]];
  if(skirt){const sp=[[x-h*.1,Y(.52)],[x+h*.1,Y(.52)],[x+h*.19,Y(.06)],[x+h*.1,Y(.035)],[x-h*.1,Y(.035)],[x-h*.19,Y(.06)]];
    cover(sp,Math.max(4,h*.04),(xx,yy)=>{const t=clamp((xx-(x-h*.19))/(h*.38)+R(-.05,.05),0,1);return K(G(planes({lit:H(LITC(SCOL,.28)),mid:H(SCOL),sh:H(SHC(SCOL,.5))}),t),.025);},{angf:(xx,yy)=>1.57+(xx-x)/h*.9,angJ:.06,len:3.2,dens:2.4,o:{thin:.38,edge:.25}});
    for(let k=0;k<4;k++){const fx=x+R(-.13,.13)*h;F([[fx*.8+x*.2,Y(.45),.6],[fx,Y(.25),.8],[fx*1.05-x*.05,Y(.07),.5]],H(SHC(SCOL,.6)),h*.014,{load:.9,thin:.4,opacity:.45,taper:[.2,.5]});}
  }else if(coat){const sp=[[x-h*.105,hipy],[x+h*.105,hipy],[x+h*.14,Y(.37)],[x-h*.14,Y(.37)]];
    cover(sp,Math.max(4,h*.04),(xx,yy)=>{const t=clamp((xx-(x-h*.14))/(h*.28)+R(-.05,.05),0,1);return K(G(planes(P),t),.025);},{ang:1.57,angJ:.07,len:3,dens:2.3,o:{thin:.38,edge:.25}});}
  cover(tor,Math.max(4,h*.04),(xx,yy)=>{const t=clamp((xx-(x-sw*1.0))/(sw*2)+R(-.05,.05),0,1);return K(G(planes(P),t),.025);},{ang:1.57,angJ:.1,len:2.8,dens:2.6,o:{thin:.38,edge:.25}});
  // collar / lapel V and waist or hem accents
  F([[hx-h*.03,Y(.86),.7],[x+lean*.8,Y(.78),.8],[hx+h*.035,Y(.86),.7]],H(SHC(P.mid,.6)),h*.018,{load:.95,thin:.3,opacity:.7});
  if(R(0,1)<.6)S(x,wst,h*.2,R(-.04,.04),H(SHC(P.mid,.6)),h*.02,{load:1,thin:.3,opacity:.65});
  if(hem)S(x,Y(coat&&!skirt?.37:.04),h*(skirt?.38:.28),R(-.03,.03),H(SHC(skirt?SCOL:P.mid,.55)),h*.015,{load:.9,thin:.3,opacity:.5});
  SB([[x-sw*.8,Y(.72)],[x,Y(.7)],[x+sw*.8,Y(.72)]],40,.4);
  SB([[x-sw*.6,Y(.62)],[x,Y(.6)],[x+sw*.6,Y(.62)]],36,.35);
  // arms: sleeves as tapered limbs, lit on the sun side; hands as mittens with a light and a shade plane
  const g=o.gesture||'down';
  let aL,aR;const gx=(g==='wave'||g==='both'),gr=(g==='wave'||g==='point'||g==='both');
  aL=gx?[[x-sw*.95+lean,Y(.79)],[x-sw*1.7,Y(.74)],[x-sw*1.9,Y(.92)]]:[[x-sw*.95+lean,Y(.79)],[x-sw*1.08,Y(.62)],[x-sw*.98,Y(.46)]];
  aR=gr?[[x+sw*.95+lean,Y(.79)],[x+sw*1.7,Y(.76)],[x+sw*2.2,Y(.9)]]:[[x+sw*.95+lean,Y(.79)],[x+sw*1.08,Y(.62)],[x+sw*.98,Y(.46)]];
  if(g==='down'){
    if(pose==='bent')aR=[[x+sw*.95+lean,Y(.79)],[x+sw*1.25,Y(.62)],[x+sw*.35,Y(.66)]];
    else if(pose==='akimbo'){aL=[[x-sw*.95+lean,Y(.79)],[x-sw*1.5,Y(.64)],[x-sw*.75,Y(.52)]];aR=[[x+sw*.95+lean,Y(.79)],[x+sw*1.5,Y(.64)],[x+sw*.75,Y(.52)]];}
    else if(pose==='pocket'){aL=[[x-sw*.95+lean,Y(.79)],[x-sw*1.05,Y(.64)],[x-sw*.8,Y(.52)]];aR=[[x+sw*.95+lean,Y(.79)],[x+sw*1.05,Y(.64)],[x+sw*.8,Y(.52)]];}
  }
  for(const [A_,cols,sd] of [[aL,[[0,P.lit],[.6,P.mid],[1,Tn(P.mid,P.sh,.4)]],0],[aR,[[0,Tn(P.mid,P.sh,.35)],[.5,P.sh],[1,Tn(P.sh,'#d89870',.2)]],1]]){
    limb(A_,[h*.034,h*.03,h*.024],cols,{sz:.9,len:3.4,dens:2.6});
    const e=A_[2];const up=A_[2][1]<A_[1][1]?-1:1;
    if(pose==='pocket'&&g==='down'){continue;}
    F([[e[0],e[1],.8],[e[0]+(sd?.6:-.4),e[1]+up*h*.05,.8]],H(sk[sd]),h*.05,{load:1,thin:.3});
    if(h>140)F([[e[0]-h*.012,e[1]+up*h*.008,.7],[e[0]-h*.01,e[1]+up*h*.035,.6]],H(Tn(sk[0],'#fff0d8',.4)),h*.018,{load:1.1,thin:.25});
  }
  // neck, head
  limb([[hx-lean*.3,Y(.88)],[x+lean*.9,Y(.845)]],[h*.026,h*.03],[[0,H(sk[0])],[.5,H(Tn(sk[0],sk[1],.5))],[1,H(sk[1])]],{sz:1,len:2,dens:2});
  head(hx+tilt,hy+Math.abs(tilt)*.3,hr,{H:H,sk:sk,lvl:lvl,pStraw:o.pStraw,hat:o.hat});
  // sun on the shoulder and the sunward sleeve
  F([[x-sw*.95+lean,Y(.80),.6],[x-sw*1.0+lean*.6,Y(.72),.8],[x-sw*1.05,Y(.6),.4]],H(LITC(P.lit,.55)),h*.014,{load:1.25,thin:.25,opacity:.85});
}
// BELL TOWER: a square stone tower seen corner-on. Sun from upper left: left faces lit warm, right faces in cool violet shade.
// Hipped roof (two planes), stone belfry with a dark arched opening and a bell, projecting cornice with a cast shadow,
// stone shaft whose courses are suggested by broken colour (long runs of slightly different value), quoins at the corner.
const SKYT=(x,y)=>K(G([[0,'#2c62ae'],[.22,'#3d79c2'],[.45,'#6aa0d3'],[.68,'#a8cbe4'],[.86,'#e2dcc6'],[1,'#f3e0b6']],clamp(y/790,0,1)),.025);
const RFL=[[0,'#8a4a36'],[.35,'#b8683e'],[.7,'#d8904e'],[1,'#f2bd70']];
const RFS=[[0,'#46304c'],[.45,'#6c4658'],[.8,'#8e6260'],[1,'#b88478']];
const STL=[[0,'#8c6c62'],[.3,'#b99874'],[.62,'#dcc08a'],[1,'#f6e4b0']];
const STS=[[0,'#4a3f5e'],[.4,'#6c5a7c'],[.75,'#8d7890'],[1,'#b49a9a']];
const AX=388,CORN=390;           // corner x
// ---------- ROOF ----------
const APEX=[386,90],RL=[142,330],RC=[394,342],RR=[618,330];
const roofL=[APEX,RL,[RL[0]+30,336],RC,[CORN+4,336]];
const roofR=[APEX,[CORN+4,336],RC,[RR[0]-24,338],RR];
// base planes: strokes run down the rafters from the apex
cover([APEX,[RL[0]+14,322],[CORN-6,330]],24,(x,y)=>{const t=clamp((y-90)/250,0,1);return K(G(RFL,clamp(.78-t*.38+R(-.1,.1)+(x<300?-.05:.05),0,1)),.04);},{angf:(x,y)=>Math.atan2(y-APEX[1],x-APEX[0]),angJ:.05,len:3.4,dens:3.6,o:{load:1.1,thin:.35,edge:.15}});
cover([APEX,[CORN+8,330],[RR[0]-16,322]],24,(x,y)=>{const t=clamp((y-90)/250,0,1);return K(G(RFS,clamp(.12+t*.5+R(-.1,.1),0,1)),.04);},{angf:(x,y)=>Math.atan2(y-APEX[1],x-APEX[0]),angJ:.05,len:3.4,dens:3.6,o:{load:1.05,thin:.4,edge:.15}});
// shingle courses: broken bands across each plane, never a full stripe; lighter on the lit plane, darker lines in shade
for(let k=0;k<26;k++){const t=R(.1,.97);const yy=lerp(100,330,t);const xl=lerp(APEX[0],RL[0],t),xr=lerp(CORN,xl,.0);const w=(CORN-xl)*R(.2,.6);const x0=lerp(xl,CORN-10,R(0,.7));
  S(x0+w/2,yy,w,R(-.015,.02)+(-.06*(1-t)),K(G(RFL,clamp(R(.62,.95)-t*.2,0,1)),.04),R(8,13),{load:1.1,thin:.3,edge:.3,taper:[.2,.4],opacity:.85});}
for(let k=0;k<22;k++){const t=R(.1,.97);const yy=lerp(100,330,t);const xr=lerp(CORN,RR[0],t);const w=(xr-CORN)*R(.2,.5);const x0=lerp(CORN+14,xr-10,R(0,.8));
  S(x0+w/2,yy+(x0-CORN)*.02,w,R(.01,.05),K(G(RFS,R(.05,.6)),.04),R(7,12),{load:1,thin:.3,edge:.3,taper:[.2,.4],opacity:.8});}
// rafter streaks: tonal lines running from apex to eave, longer and thinner, a few of them lit
for(let k=0;k<22;k++){const t=R(.05,.95);const ex=lerp(CORN,RL[0],t),ey=lerp(342,330,t);const a=Math.atan2(ey-APEX[1],ex-APEX[0]);const f0=R(.1,.4),f1=f0+R(.3,.55);
  const x0=lerp(APEX[0],ex,f0),y0=lerp(APEX[1],ey,f0),x1=lerp(APEX[0],ex,f1),y1=lerp(APEX[1],ey,f1);F([[x0,y0,.6],[(x0+x1)/2,(y0+y1)/2,.9],[x1,y1,.6]],K(G(RFL,R(R(0,1)<.4?.05:.7,1)),.03),R(5,9),{load:1.05,thin:.3,edge:.35,taper:[.2,.4],opacity:.75});}
for(let k=0;k<18;k++){const t=R(.05,.95);const ex=lerp(CORN,RR[0],t),ey=lerp(342,330,t);const f0=R(.1,.4),f1=f0+R(.3,.55);
  const x0=lerp(APEX[0],ex,f0),y0=lerp(APEX[1],ey,f0),x1=lerp(APEX[0],ex,f1),y1=lerp(APEX[1],ey,f1);F([[x0,y0,.6],[(x0+x1)/2,(y0+y1)/2,.9],[x1,y1,.6]],K(G(RFS,R(0,.55)),.03),R(5,9),{load:1,thin:.3,edge:.35,taper:[.2,.4],opacity:.7});}
// lit hip (ridge) between the planes: thick, broken, brightest near the apex; and a dark core line right beside it
for(let k=0;k<5;k++){const f0=k*.2+R(0,.05);const f1=f0+R(.16,.24);const q=f=>[lerp(APEX[0],RC[0],f)+R(-1.5,1.5)-3,lerp(APEX[1],RC[1],f)];
  F([[...q(f0),.6],[...q((f0+f1)/2),.9],[...q(f1),.6]],K(G(RFL,R(.85,1)),.02),R(7,10),{load:1.25,thin:.25,taper:[.2,.4],opacity:.95});
  F([[q(f0)[0]+7,q(f0)[1],.6],[q((f0+f1)/2)[0]+7,q((f0+f1)/2)[1],.8],[q(f1)[0]+7,q(f1)[1],.5]],K('#3a2438',.03),R(5,8),{load:1,thin:.3,taper:[.3,.4],opacity:.75});}
SB([[APEX[0]-6,100],[CORN-6,230],[CORN-4,330]],40,.3);
// sun on the lit plane's upper reaches: warm thick touches near the apex
for(let k=0;k<8;k++){const t=R(.05,.4);S(lerp(APEX[0],RL[0],t)+R(5,40),lerp(90,330,t)+R(0,8),R(30,70),R(.3,.9),K(R(0,1)<.5?'#f6c878':'#ecaa5e',.03),R(8,14),{load:1.2,thin:.3,taper:[.2,.5],opacity:.8});}
// eave: a lit lip on top of a dark underside; the left plane overhangs the wall
F([[RL[0]+6,329,.5],[RL[0]+120,333,.9],[CORN,341,.8]],K('#f4c27a',.03),12,{load:1.2,thin:.3,edge:.2,taper:[.1,.25]});
F([[RL[0]+10,339,.5],[RL[0]+120,342,.9],[CORN,350,.8]],K('#4a2a38',.03),16,{load:1.05,thin:.35,edge:.3,taper:[.1,.25]});
F([[CORN,350,.7],[CORN+110,347,.9],[RR[0]-12,341,.6]],K('#2e2036',.03),16,{load:1.05,thin:.35,edge:.3,taper:[.1,.25]});
F([[CORN,340,.7],[CORN+110,337,.9],[RR[0]-8,330,.6]],K('#8a5a58',.03),11,{load:1.05,thin:.35,edge:.3,taper:[.1,.25],opacity:.9});
// finial
F([[APEX[0],92,.8],[APEX[0]+1,70,.8],[APEX[0]-1,52,.5]],K('#3c2a30',.03),6,{load:1,thin:.3,taper:[.1,.4]});
F([[APEX[0]-2,86,.7],[APEX[0]-2,64,.6]],K('#e8bd78',.03),3.4,{load:1.2,thin:.3,taper:[.2,.4],opacity:.9});
F([[APEX[0]-1,50,.9]],K('#e4b050',.03),9,{brush:'round',load:1.2,thin:.3});
// ---------- courses helper: runs of broken colour in horizontal rows ----------
function courses(x0,x1,y0,y1,rowh,valf,ramp,o){o=o||{};
  let y=y0+rowh*.5;while(y<y1){const rh=rowh*R(.85,1.15);const roff=R(-.07,.07);let x=x0-R(0,40);
    while(x<x1){const len=R(o.minL||50,o.maxL||150);const w=Math.min(len,x1-Math.max(x,x0));
      if(w>12){const t=clamp(valf(Math.max(x,x0)+w/2,y)+roff+R(-.12,.12),0,1);S(Math.max(x,x0)+w/2,y+R(-1.5,1.5),w,R(-.02,.02),K(G(ramp,t),o.j||.035),rh*R(.78,1.02),Object.assign({brush:'flat',load:1.05,thin:.4,edge:.2},o.o||{}));}
      x+=len*R(.7,.95);}
    y+=rh;}}
// ---------- BELFRY ----------
const BL=[[208,346],[CORN,346],[CORN,470],[208,470]],BR=[[CORN,346],[528,346],[528,470],[CORN,470]];
cover(BL,20,(x,y)=>K(G(STL,clamp(.8-(y-346)/124*.15-(x-208)/180*.08,0,1)),.04),{ang:0,angJ:.06,len:3,dens:3.4,o:{load:1.1,thin:.4,edge:.15}});
cover(BR,20,(x,y)=>K(G(STS,clamp(.42+(y-346)/124*.2+R(-.06,.06),0,1)),.04),{ang:0,angJ:.06,len:3,dens:3.4,o:{load:1.05,thin:.4,edge:.15}});
courses(208,CORN,350,466,22,(x,y)=>.82-(y-346)/124*.16-(x-208)/180*.1,STL,{minL:40,maxL:110});
courses(CORN,523,350,466,22,(x,y)=>.45+(y-346)/124*.18,STS,{minL:40,maxL:100});
// shadow cast by the roof overhang on the lit wall: deep under the eave, stepping to the right, melting downward
for(let k=0;k<9;k++)S(208+k*20+R(-6,6),R(350,364),R(50,110),R(-.02,.03),K(R(0,1)<.5?'#5c4660':'#6e5468',.04),R(12,18),{load:1,thin:.4,edge:.45,opacity:R(.55,.85),taper:[.2,.4]});
SB([[210,356],[300,366],[388,364]],44,.45);SB([[210,372],[300,380],[388,376]],40,.35);
// belfry faces: broken colour before the openings are cut in
for(let k=0;k<22;k++){const x=R(214,380),y=R(352,466);const c=pick(['#e6c27c','#dba288','#b9b19a','#c89c5c','#f0d8a0']);S(x,y,R(24,60),R(-.04,.04),K(c,.03),R(10,18),{load:.9,thin:.45,edge:.5,opacity:R(.3,.55),taper:[.25,.45]});}
for(let k=0;k<14;k++){const x=R(400,518),y=R(352,466);const c=pick(['#7a6a90','#8e7a98','#a28aa0','#6a5c80']);S(x,y,R(24,50),R(-.04,.04),K(c,.03),R(10,16),{load:.9,thin:.45,edge:.5,opacity:R(.3,.5),taper:[.25,.45]});}
// arched opening on the lit face
const ACX=306,ACY=422,AR=44;
const archPoly=ELL(ACX,ACY,AR,AR,0,28).filter(q=>q[1]<=ACY+2).concat([[ACX+AR,470],[ACX-AR,470]]);
// stone surround: lit voussoir ring, broken, then the dark interior
for(let k=0;k<16;k++){const a=R(3.3,6.1);const r=AR+R(4,9);arc(ACX,ACY,r,a,a+R(.2,.4),K(G(STL,R(.55,1)),.03),R(8,12),{load:1.1,thin:.35,edge:.3,taper:[.15,.3]});}
for(let k=0;k<8;k++){const a=R(.0,3.3);const r=AR+R(4,8);arc(ACX,ACY,r,a,a+R(.2,.4),K(G(STL,R(.15,.5)),.03),R(8,12),{load:1,thin:.35,edge:.3,taper:[.15,.3],opacity:.8});}
cover(archPoly,12,(x,y)=>K(G([[0,'#1a1220'],[.55,'#2c1e2c'],[1,'#4a3030']],clamp((y-376)/94,0,1)),.03),{ang:1.57,angJ:.1,len:3,dens:3.5,o:{load:1.1,thin:.3,edge:.1}});
// lit reveal on the right inner wall (it faces the sun), shadowed soffit under the arch
F([[ACX+AR-5,438,.6],[ACX+AR-5,452,.9],[ACX+AR-5,468,.7]],K('#e6c78c',.03),9,{load:1.2,thin:.3,taper:[.15,.25]});
arc(ACX,ACY,AR-6,5.4,6.1,K('#c89c6c',.03),8,{load:1.1,thin:.3,taper:[.25,.35],opacity:.85});
// the bell: bronze, lit on the left shoulder, a warm bounce under the lip, hung from a dark yoke
F([[ACX-34,399,.8],[ACX+34,397,.8]],K('#3a2418',.03),9,{load:1.1,thin:.3});
const bellP=[[ACX-9,403],[ACX+9,403],[ACX+15,418],[ACX+23,440],[ACX+28,452],[ACX-28,452],[ACX-23,440],[ACX-15,418]];
cover(bellP,8,(x,y)=>K(G([[0,'#f2cc6a'],[.3,'#d0983a'],[.65,'#8a5a22'],[1,'#44281a']],clamp((x-(ACX-26))/54+R(-.04,.04),0,1)),.03),{ang:1.57,angJ:.08,len:2.4,dens:3,o:{load:1.15,thin:.3,edge:.1}});
F([[ACX-14,410,.7],[ACX-18,428,.9],[ACX-24,448,.7]],K('#fff0b4',.02),5,{load:1.3,thin:.25,taper:[.15,.35],opacity:.95});
F([[ACX-27,451,.7],[ACX,454,.9],[ACX+26,451,.6]],K('#e0a850',.03),6,{load:1.15,thin:.3,taper:[.15,.2]});
F([[ACX-2,456,.9]],K('#3a2420',.03),9,{brush:'round',load:1.1,thin:.3});
F([[ACX+8,425,.7],[ACX+12,440,.8]],K('#3a2414',.03),5,{load:1,thin:.3,opacity:.6});
// right (shadow) face: a narrower louvred opening, only a cool glow in its sill
const BCX=470,BCY=428,BR2=19;
const arch2=ELL(BCX,BCY,BR2,BR2,0,20).filter(q=>q[1]<=BCY+2).concat([[BCX+BR2,466],[BCX-BR2,466]]);
for(let k=0;k<8;k++){const a=R(3.2,6.2);arc(BCX,BCY,BR2+R(4,7),a,a+R(.3,.5),K(G(STS,R(.5,.95)),.03),R(6,9),{load:1,thin:.35,edge:.3,taper:[.15,.3]});}
cover(arch2,9,(x,y)=>K(G([[0,'#201830'],[1,'#3a2c44']],clamp((y-390)/76,0,1)),.03),{ang:1.57,angJ:.1,len:3,dens:3.5,o:{load:1.1,thin:.3,edge:.1}});
for(let k=0;k<4;k++)S(BCX,432+k*8,32,R(-.05,.05),K('#4a3c58',.03),4,{load:1,thin:.3,opacity:.7});
// corner quoins: alternating long and short pale blocks down the lit edge, a lit edge line
for(let y=350,k=0;y<466;y+=22,k++){const L=k%2?R(26,34):R(14,20);S(CORN-L/2-1,y+10,L,R(-.02,.02),K(G(STL,R(.82,1)),.025),R(15,19),{brush:'flat',load:1.15,thin:.35,edge:.15});S(CORN+(k%2?8:14),y+10,k%2?14:26,R(-.02,.02),K(G(STS,R(.55,.8)),.03),R(15,19),{brush:'flat',load:1.05,thin:.35,edge:.15});}
// ---------- CORNICE and its shadow ----------
const CY=470;
F([[188,CY+1,.7],[300,CY,.9],[CORN+2,CY+6,.8]],K('#f4dcaa',.02),11,{brush:'flat',load:1.2,thin:.3,edge:.15,taper:[.05,.15]});          // lit top lip
F([[188,CY+12,.7],[300,CY+11,.9],[CORN+2,CY+17,.8]],K(G(STL,.35),.03),14,{brush:'flat',load:1.1,thin:.3,edge:.2,taper:[.05,.15]});          // fascia
F([[188,CY+21,.7],[300,CY+21,.9],[CORN+2,CY+27,.8]],K('#4e3a50',.03),9,{brush:'flat',load:1.05,thin:.35,edge:.3,taper:[.05,.15]});         // dark soffit line
F([[CORN+2,CY+6,.8],[470,CY+3,.9],[552,CY+1,.6]],K(G(STS,.8),.03),11,{brush:'flat',load:1.05,thin:.3,edge:.15,taper:[.05,.15]});
F([[CORN+2,CY+16,.8],[470,CY+13,.9],[552,CY+11,.6]],K(G(STS,.45),.03),14,{brush:'flat',load:1,thin:.3,edge:.2,taper:[.05,.15]});
F([[CORN+2,CY+26,.8],[470,CY+23,.9],[552,CY+21,.6]],K('#2e2438',.03),9,{brush:'flat',load:1.05,thin:.35,edge:.3,taper:[.05,.15]});
// ---------- SHAFT ----------
const SL=[[192,498],[CORN,498],[CORN,800],[192,800]],SR=[[CORN,498],[546,498],[546,800],[CORN,800]];
cover(SL,22,(x,y)=>K(G(STL,clamp(.84-(y-498)/300*.3-(x-192)/200*.1+R(-.05,.05),0,1)),.045),{ang:0,angJ:.06,len:3,dens:3.4,o:{load:1.1,thin:.4,edge:.15}});
cover(SR,22,(x,y)=>K(G(STS,clamp(.4+(y-498)/300*.2+R(-.06,.06),0,1)),.045),{ang:0,angJ:.06,len:3,dens:3.4,o:{load:1.05,thin:.4,edge:.15}});
// cast shadow of the cornice onto the top of the shaft: darkest at the lip, stepping and melting down
for(let k=0;k<10;k++)S(192+k*19+R(-6,6),R(498,512),R(50,110),R(-.02,.03),K(R(0,1)<.5?'#6a5470':'#7e6478',.04),R(14,22),{load:1,thin:.4,edge:.45,opacity:R(.5,.85),taper:[.2,.4]});
courses(192,CORN,498,800,27,(x,y)=>.84-(y-498)/300*.3-(x-192)/200*.12,STL,{minL:34,maxL:100});
courses(CORN,541,498,800,27,(x,y)=>.42+(y-498)/300*.22,STS,{minL:34,maxL:90});
// broken colour on the faces: warm ochre, pinkish and cool grey patches laid over the courses
for(let k=0;k<70;k++){const x=R(200,380),y=R(498,790);const c=pick(['#e6c27c','#dba288','#b9b19a','#c89c5c','#f0d8a0','#c8b08c']);
  S(x,y,R(24,70),R(-.05,.05),K(c,.03),R(10,22),{load:.9,thin:.45,edge:.5,opacity:R(.3,.6),taper:[.25,.45]});}
for(let k=0;k<40;k++){const x=R(420,520),y=R(498,790);const c=pick(['#7a6a90','#5e5278','#8e7a98','#a28aa0','#6a5c80']);
  S(x,y,R(24,60),R(-.05,.05),K(c,.03),R(10,20),{load:.9,thin:.45,edge:.5,opacity:R(.3,.55),taper:[.25,.45]});}
// weathering: darker runs and pale chipped runs, scattered and irregular
for(let k=0;k<34;k++){const lit=R(0,1)<.65;const x=lit?R(225,355):R(425,515);const y=R(510,780);const dark=R(0,1)<.5;
  S(x,y,R(26,60),R(-.03,.03),K(lit?G(STL,dark?R(.2,.45):R(.8,1)):G(STS,dark?R(.05,.3):R(.65,.9)),.04),R(9,16),{brush:'flat',load:1,thin:.4,edge:.35,opacity:R(.45,.75),taper:[.2,.4]});}
// vertical stain streaks below the cornice and under sills
for(let k=0;k<7;k++){const x=R(205,375);S(x,R(520,560),R(50,110),1.57+R(-.04,.04),K(G(STL,R(.15,.4)),.03),R(8,16),{load:.9,thin:.45,edge:.6,opacity:.5,taper:[.3,.6]});}
// a few joints: short vertical dark ticks on some courses only
for(let k=0;k<28;k++){const lit=R(0,1)<.65;const x=lit?R(200,380):R(398,540);const y=R(505,790);S(x,y,R(10,17),1.57+R(-.1,.1),K(lit?G(STL,R(.1,.3)):G(STS,R(0,.2)),.03),R(3,4.5),{load:.9,thin:.4,opacity:R(.35,.6),taper:[.2,.3]});}
// arrow slits on the lit face and the shadow face (dark, with a warm reveal on the sunward-facing side)
for(const [sx,sy,sh,face] of [[270,560,58,0],[300,690,52,0],[470,590,52,1]]){
  F([[sx,sy-4,.9],[sx,sy+sh/2,1],[sx,sy+sh,.9]],K(face?'#241a30':'#1c1420',.02),10,{load:1.1,thin:.3,taper:[.05,.12]});
  if(!face)F([[sx+7,sy+4,.7],[sx+7,sy+sh/2,.9],[sx+7,sy+sh-2,.6]],K('#e8cc90',.03),4,{load:1.15,thin:.3,taper:[.2,.3]});}
// corner quoins down the shaft
for(let y=500,k=0;y<780;y+=29,k++){const L=k%2?R(30,40):R(16,22);S(CORN-L/2-1,y+13,L,R(-.02,.02),K(G(STL,R(.82,1)-(y-500)/900),.025),R(18,23),{brush:'flat',load:1.15,thin:.35,edge:.15});S(CORN+(k%2?9:16),y+13,k%2?16:30,R(-.02,.02),K(G(STS,R(.5,.78)),.03),R(18,23),{brush:'flat',load:1.05,thin:.35,edge:.15});}
// sunlit left edge: broken thick glints; warm bounce on the shadow face's lower reaches; cool sky light on its top
for(let k=0;k<9;k++)S(R(193,198),R(505,775),R(30,70),1.57+R(-.03,.03),K('#fff2c0',.02),R(3.5,6),{load:1.25,thin:.3,taper:[.2,.5],opacity:.8});
for(let k=0;k<14;k++)S(R(440,520),R(660,790),R(50,80),R(-.04,.04),K('#b8948e',.04),R(14,26),{load:.9,thin:.45,edge:.6,opacity:R(.35,.6),taper:[.3,.5]});
for(let k=0;k<8;k++)S(R(440,510),R(505,570),R(50,80),R(-.04,.04),K('#8a84a8',.04),R(12,20),{load:.9,thin:.45,edge:.6,opacity:R(.3,.5),taper:[.3,.5]});
// melt the planes: soft passes down each face (the turning edge at the corner is left crisp)
for(const [x,y0,y1,w] of [[230,500,790,80],[330,500,790,80],[450,500,790,70],[505,500,790,50]])SB([[x,y0],[x+R(-4,4),(y0+y1)/2],[x,y1]],w,.3);
for(const [y,xa,xb] of [[520,196,380],[640,196,380],[760,196,380],[560,400,540],[700,400,540]])SB([[xa,y],[(xa+xb)/2,y+R(-6,6)],[xb,y]],40,.25);
SB([[CORN-14,500],[CORN-12,650],[CORN-14,790]],26,.3); // slightly soften the highlight side of the corner
p.dry();
