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
// SKY REFINE: fresh wet gradient (deeper overhead, warm and pale at the horizon), then real cumulus masses built lobe by lobe
// back to front: a cool shadow crescent on the lee side, a lit cream cap on the sun side (upper left), soft terminators,
// small cauliflower sub-lobes on the lit rim, a flat cool belly, and broken edges into the sky.
const SKY2=[[0,'#2c62ae'],[.22,'#3d79c2'],[.45,'#6aa0d3'],[.68,'#a8cbe4'],[.86,'#e2dcc6'],[1,'#f3e0b6']];
const sk2=(x,y,j)=>{let c=G(SKY2,y/790);const w=clamp(1-Math.hypot(x+80,(y-60)*.9)/1700,0,1);c=mixh(c,'#f2e4c0',w*.22);c=mixh(c,'#2a56a0',clamp(1-y/330,0,1)*clamp((x-900)/1500,0,1)*.2);return K(c,j===undefined?.02:j);};
// gradient laid in broad, slightly slanting strokes that vary in length, crossed, then melted
const FASTSKY=typeof FASTSKY_==='undefined'?0:1;
if(!FASTSKY)for(let y=-30;y<830;y+=44){for(let x=-200;x<2500;x+=R(200,340)){const yy=y+R(-14,14);S(x+R(-40,40),yy,R(280,520),R(-.05,.09),sk2(x,yy),R(88,128),{load:1,thin:.6,edge:.45,taper:[.2,.3],bend:R(-14,14)});}}
if(!FASTSKY)for(let i=0;i<70;i++){const x=R(-100,2500),y=R(-20,800);S(x,y,R(200,480),R(-.18,.2),sk2(x,y,.035),R(50,100),{load:R(.55,.95),thin:.55,edge:.55,taper:[.3,.4],opacity:R(.5,.9)});}
for(let i=0;i<70;i++){const x=R(-100,2500),y=R(-20,800);SBs(x,y,R(500,900),R(-.1,.12),88,.55);}
// pale warm haze band low on the sky, cooler blue-violet veil high up, both soft
for(let i=0;i<26;i++){const x=R(-100,2400),y=R(560,780);S(x,y,R(300,600),R(-.03,.05),K(R(0,1)<.5?'#f4e4bc':'#efe0cc',.03),R(40,70),{load:.6,thin:.7,edge:.8,opacity:R(.25,.5),taper:[.3,.5]});}
for(let i=0;i<14;i++){const x=R(-100,2400),y=R(-10,200);S(x,y,R(300,600),R(-.04,.06),K('#2c5ea8',.03),R(40,80),{load:.5,thin:.7,edge:.8,opacity:R(.2,.4),taper:[.3,.5]});}
for(let i=0;i<30;i++){const x=R(-100,2500),y=R(0,800);SBs(x,y,R(500,800),R(-.06,.08),88,.45);}

const CPAL={hi:'#fffcf6',lit:'#f7efe8',mid:'#d0cce2',shade:'#aaa6c8',deep:'#8c88b6',belly:'#a09dc2',refl:'#dcc0c8'};
// one lobe: an occluding body (a few big overlapping blobs), a lee side deepening to cool violet, and on the sun side a pile of
// overlapping lit strokes that follow the form (brighter toward the upper-left rim), then a soft terminator melt.
function lobe(cx,cy,r,L,pal,base){
  const body=K(mixh(mixh(pal.shade,pal.mid,clamp(.25+L*.5+R(-.1,.1),0,1)),pal.deep,clamp((cy-(base-r))/r*.12,0,.3)),.02);
  for(let k=0;k<3;k++){S(cx+R(-.2,.2)*r,cy+R(-.18,.18)*r,r*R(.5,1.0),R(-.4,.4),body,r*R(.95,1.25),{load:1.05,thin:.45,edge:.3,taper:[.25,.25]});}
  // lee side: darker, cooler strokes along the form
  for(let k=0;k<Math.max(3,Math.round(r/9));k++){const a=R(-.4,2.5),d=r*R(.25,.85);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;
    S(x,y,r*R(.3,.6),a+1.57+R(-.4,.4),K(mixh(pal.shade,pal.deep,clamp(.55-L*.5+R(-.2,.25),0,1)),.025),r*R(.14,.26),{load:.95,thin:.5,edge:.5,taper:[.3,.5],opacity:R(.6,.9)});}
  // sun side: overlapping lit strokes that follow the curvature (broad and heavily overlapped, so they read as a lit mass), melted twice, then a small second layer of lights on the crown
  for(let k=0;k<Math.max(4,Math.round(r/6));k++){const a=R(3.0,5.6),d=r*R(.2,.9);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;
    const rim=clamp((d/r-.2)/.7,0,1)*clamp(1-Math.abs(a-4.2)/1.6,0,1);const t=clamp(.2+rim*.6+L*.2+R(-.1,.1),0,1);
    S(x,y,r*R(.4,.8),a+1.57+R(-.35,.35),K(G([[0,pal.mid],[.5,pal.lit],[1,pal.hi]],t),.012),r*R(.22,.4),{load:R(1,1.2),thin:.45,edge:.2,taper:[.1,.2]});}
  for(let k=0;k<3;k++)SB([[cx+Math.cos(3.3+k*.45)*r*.75,cy+Math.sin(3.3+k*.45)*r*.75],[cx+Math.cos(4.2+k*.4)*r*.55,cy+Math.sin(4.2+k*.4)*r*.55],[cx+Math.cos(5.2+k*.2)*r*.75,cy+Math.sin(5.2+k*.2)*r*.75]],Math.min(88,r*.8),.55);
  for(let k=0;k<Math.max(2,Math.round(r/12));k++){const a=R(3.4,5.0),d=r*R(.45,.85);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;
    S(x,y,r*R(.25,.45),a+1.57+R(-.4,.4),K(G([[0,pal.lit],[1,pal.hi]],R(.4,1)),.01),r*R(.1,.16),{load:R(1.1,1.3),thin:.35,edge:.3,taper:[.15,.3]});}
  // terminator melt across the form
  SB([[cx+Math.cos(3.6)*r*.5,cy+Math.sin(3.6)*r*.5],[cx,cy],[cx+Math.cos(.4)*r*.5,cy+Math.sin(.4)*r*.5]],Math.min(88,r*.8),R(.35,.55));
  // a few crisp thick crests at the very top of the sun side
  for(let k=0;k<Math.round(r/32);k++){const a=R(3.7,4.9),d=r*R(.6,.88);S(cx+Math.cos(a)*d,cy+Math.sin(a)*d,r*R(.3,.5),a+1.57+R(-.3,.3),K(pal.hi,.01),r*R(.07,.12),{load:1.3,thin:.3,edge:.6,taper:[.35,.5]});}
}
function cumulus(base,lobes,pal){
  const ys=lobes.map(l=>l[1]-l[2]),top=Math.min(...ys);const x0=Math.min(...lobes.map(l=>l[0]-l[2])),x1=Math.max(...lobes.map(l=>l[0]+l[2]));
  // 1 mass: connect the lobes so there are no holes, and block in the flat belly
  for(let i=0;i<lobes.length;i++){const a=lobes[i];const ds=lobes.map((l,j)=>[Math.hypot(a[0]-l[0],a[1]-l[1]),j]).filter(q=>q[1]!==i).sort((u,v)=>u[0]-v[0]).slice(0,2);
    for(const [dd,j] of ds){const nb=lobes[j];F([[a[0],a[1],.9],[(a[0]+nb[0])/2,(a[1]+nb[1])/2,.9],[nb[0],nb[1],.9]],K(pal.shade,.02),Math.min(a[2],nb[2])*1.9,{load:1.05,thin:.45,edge:.3});}}
  for(let k=0;k<Math.round((x1-x0)/60);k++){const x=R(x0+20,x1-20);S(x,base-R(8,30),R(120,240),R(-.03,.03),K(R(0,1)<.7?pal.belly:pal.deep,.03),R(30,50),{load:1,thin:.5,edge:.3,taper:[.25,.4]});}
  const order=lobes.slice().sort((a,b)=>(a[1]-a[2]*.4)-(b[1]-b[2]*.4));
  for(const [cx,cy,r] of order){lobe(cx,cy,r,clamp(1-(cy-top)/(base-top),0,1),pal,base);}
  // 2 belly: cool and flat, darker toward the lee (right), a faint warm bounce under the lit left
  for(let k=0;k<Math.round((x1-x0)/60);k++){const x=R(x0+20,x1-20),t=(x-x0)/(x1-x0);S(x,base-R(6,26),R(80,200),R(-.04,.04),K(mixh(pal.deep,pal.shade,.3+.5*(1-t)),.03),R(20,36),{load:.9,thin:.5,edge:.55,taper:[.3,.4],opacity:.8});}
  for(let k=0;k<4;k++){const x=R(x0+30,x0+(x1-x0)*.5);S(x,base-R(4,12),R(60,140),R(-.03,.03),K(pal.refl,.03),R(10,18),{load:.8,thin:.5,edge:.7,taper:[.3,.5],opacity:.6});}
  // 3 melt: soft passes along the outer rim, and a few through the mass
  for(const [cx,cy,r] of lobes){const a=R(3.0,3.5);SB([[cx+Math.cos(a)*r*.95,cy+Math.sin(a)*r*.95],[cx+Math.cos(a+.9)*r,cy+Math.sin(a+.9)*r],[cx+Math.cos(a+1.8)*r,cy+Math.sin(a+1.8)*r]],Math.min(88,r*.6),.5);}
  for(let k=0;k<Math.round((x1-x0)/110);k++)SBs(R(x0,x1),R(base-80,base-8),R(120,260),R(-.06,.06),70,.4);
  // 4 broken edge: only on true silhouette points (not inside a neighbouring lobe): cloud colour dragged out into the sky, sky scumbled back at the rim
  const outside=(x,y)=>lobes.every(l=>Math.hypot(x-l[0],y-l[1])>l[2]*.93);
  for(const [cx,cy,r] of lobes){for(let k=0;k<Math.max(3,Math.round(r/14));k++){const a=R(0,TAU);if(Math.sin(a)>.5)continue;const px=cx+Math.cos(a)*r*1.0,py=cy+Math.sin(a)*r*1.0;if(!outside(px+Math.cos(a)*6,py+Math.sin(a)*6))continue;
    const tang=a+Math.PI/2+R(-.4,.4);const lit=Math.cos(a-3.9)>0;const out=R(0,1)<.6;const c=out?K(lit?pal.lit:pal.mid,.025):sk2(px,py-20,.03);
    S(px+(out?Math.cos(a)*4:-Math.cos(a)*6),py+(out?Math.sin(a)*4:-Math.sin(a)*6),R(30,r*.9),tang,c,R(10,20),{load:R(.3,.5),thin:.5,edge:.7,taper:[.3,.6],opacity:R(.45,.8)});}}
}
// farther clouds first
cumulus(262,[[1590,218,40],[1655,200,46],[1700,232,34],[1625,245,32],[1560,246,26]],Object.assign({},CPAL,{mid:'#e4e2f0',shade:'#c6c4de',deep:'#aeadd0',belly:'#b6b4d4'}));
cumulus(280,[[1248,161,99],[1323,86,83],[1422,55,74],[1400,168,110],[1510,192,83],[1290,242,69],[1455,252,57],[1554,234,48]],CPAL);
cumulus(160,[[15,34,94],[144,8,80],[116,91,76],[245,75,62],[-41,112,67],[329,114,44]],Object.assign({},CPAL,{hi:'#fff6e4'}));
cumulus(300,[[819,-14,81],[984,-33,105],[904,69,124],[709,115,112],[1112,73,112],[1222,165,95],[587,210,83],[782,201,117],[972,197,122],[1130,242,83],[685,258,66],[1039,258,61]],CPAL);
// low strato-cumulus strips near the horizon, flatter and warmer
cumulus(330,[[1290,314,24],[1375,306,32],[1460,313,26],[1545,318,22]],Object.assign({},CPAL,{lit:'#fbe6cc',mid:'#e8dae4',shade:'#c8bcd4'}));
cumulus(448,[[690,424,22],[765,413,32],[835,426,22]],Object.assign({},CPAL,{lit:'#fbe6cc',mid:'#eadbe2',shade:'#cdbfd4',belly:'#bdb2cc'}));
cumulus(552,[[2255,520,26],[2312,508,36],[2372,524,28]],Object.assign({},CPAL,{lit:'#fbe6cc',mid:'#e2d8e6',shade:'#c4b8d0',belly:'#b8aecc'}));
// glints of deeper blue and a few thin wisps across the open sky
for(let i=0;i<20;i++){const x=R(1500,2400),y=R(100,420);S(x,y,R(120,300),R(-.05,.1),K(R(0,1)<.5?'#8cb4de':'#4f86c6',.04),R(22,44),{load:.6,thin:.6,edge:.7,taper:[.4,.6],opacity:.55});}
p.dry();
