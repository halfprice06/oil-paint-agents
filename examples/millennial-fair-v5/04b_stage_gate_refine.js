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
// STAGE, FENCE, CURTAIN, TELEPODS and the GATE RIM, second layers.
// Wood: boards with a lit left edge, a dark gap, grain streaks that follow the plank; brass: rings with hot crests and dark grooves,
// a vertical highlight streak, cool sky reflections in the shade; steel dome: curved facets, sky band above, warm ground band below.
// Gate rim: transparent colour first, then thick pale light in broken bursts along a wavering edge, with streamers spiralling out.
const WD2=[[0,'#3a2630'],[.3,'#6a4430'],[.6,'#a8703c'],[1,'#e2b672']];
function board(x,y0,y1,w,t,o){o=o||{};
  const segs=Math.max(2,Math.round((y1-y0)/55));
  for(let k=0;k<segs;k++){const ya=lerp(y0,y1,k/segs)-R(0,6),yb=lerp(y0,y1,(k+1)/segs)+R(0,6);const tt=clamp(t-(k/segs)*.12+R(-.05,.05),0,1);
    F([[x+w/2+R(-1,1),ya,.8],[x+w/2+R(-1.5,1.5),(ya+yb)/2,.9],[x+w/2+R(-1,1),yb,.8]],K(G(WD2,tt),.035),w*1.05,{brush:'flat',load:1.1,thin:.4,edge:.15,taper:[.05,.1]});}
  // grain: a few long wavering streaks along the board, darker and lighter
  for(let k=0;k<R(2,4);k++){const gx=x+R(.15,.85)*w,ga=y0+R(0,.4)*(y1-y0),gb=ga+R(.3,.6)*(y1-y0);
    F([[gx,ga,.5],[gx+R(-1.5,1.5),(ga+gb)/2,.7],[gx+R(-1.5,1.5),gb,.5]],K(R(0,1)<.6?G(WD2,clamp(t-.25,0,1)):G(WD2,clamp(t+.2,0,1)),.04),R(2,4),{load:.9,thin:.4,edge:.5,opacity:R(.3,.55),taper:[.2,.3]});}
  // lit left edge and the dark gap on the right, both broken
  F([[x+2,y0+R(0,10),.6],[x+2,(y0+y1)/2,.8],[x+2,y1-R(0,20),.5]],K(G(WD2,clamp(t+.3,0,1)),.03),Math.max(3,w*.14),{load:1.1,thin:.3,edge:.3,opacity:.75,taper:[.15,.3]});
  F([[x+w-1,y0,.6],[x+w-1,y0+(y1-y0)*R(.35,.6),.8]],K('#241620',.03),3.5,{load:1,thin:.3,opacity:.8,taper:[.1,.4]});
  F([[x+w-1,y0+(y1-y0)*R(.5,.7),.7],[x+w-1,y1,.6]],K('#241620',.03),3.5,{load:1,thin:.3,opacity:.7,taper:[.3,.2]});
  if(R(0,1)<.18){const ky=y0+R(.2,.8)*(y1-y0),kx=x+w*R(.3,.7);F([[kx,ky,.8]],K('#3a2418',.03),R(6,9),{brush:'round',load:1,thin:.3,opacity:.85});F([[kx-1,ky-1,.7]],K(G(WD2,.7),.03),R(10,13),{brush:'round',load:.4,thin:.5,opacity:.3});}
  if(o.nails){F([[x+w/2,y0+6,.8]],K('#2a2024',.03),3.2,{load:1,thin:.3});F([[x+w/2,y1-8,.8]],K('#2a2024',.03),3.2,{load:1,thin:.3});}
}
// ----- right: stage deck edge and the plank front -----
// top rail: a lit lip, a mid face, a shadow line, grain along its length
for(let x=2085;x<2425;x+=R(70,130)){const w=R(80,140);S(Math.min(x+w/2,2420)-w/2+w/2,872,w,R(-.01,.01),K(G(WD2,R(.55,.8)),.035),R(30,38),{brush:'flat',load:1.1,thin:.4,edge:.15});}
for(let k=0;k<7;k++)S(R(2100,2400),R(856,888),R(60,160),R(-.01,.01),K(R(0,1)<.5?G(WD2,.35):G(WD2,.95),.04),R(2,4),{load:.9,thin:.4,edge:.5,opacity:R(.3,.5),taper:[.2,.3]});
S(2255,851,340,0,K('#f0cc88',.03),8,{load:1.2,thin:.3,edge:.2,opacity:.85,taper:[.05,.05]});
S(2255,892,340,0,K('#2a1a22',.03),9,{load:1.05,thin:.35,edge:.3,opacity:.85,taper:[.05,.05]});
for(let x=2085;x<2425;){const w=R(26,36);board(x,893,1034,Math.min(w,2425-x),clamp(.62-(x-2085)/340*.18+R(-.16,.14),.1,.9),{nails:true});x+=w;}
// cast shadow of the rail on the boards, stepping, and cool gate light on the nearest boards
for(let k=0;k<9;k++)S(2090+k*38+R(-8,8),R(896,912),R(40,80),R(-.02,.02),K('#2a1a2a',.04),R(10,16),{load:.9,thin:.5,edge:.55,opacity:R(.4,.7),taper:[.2,.4]});
SB([[2090,900],[2250,906],[2420,900]],40,.35);
for(let k=0;k<7;k++)S(R(2090,2150),R(900,1030),R(40,100),1.57,K('#9ab8ec',.04),R(8,14),{load:.6,thin:.5,edge:.7,opacity:R(.2,.4),taper:[.3,.5]});
SB([[2120,900],[2124,970],[2120,1034]],36,.25);SB([[2250,900],[2252,970],[2250,1034]],40,.22);SB([[2380,900],[2382,970],[2380,1034]],40,.22);
// the base below, in shade: a few vertical boards, darker, with warm bounce light low down
for(let x=2065;x<2425;){const w=R(30,42);board(x,1036,1176,Math.min(w,2425-x),clamp(.28-(x-2065)/360*.1+R(-.1,.1),.05,.5),{nails:false});x+=w;}
for(let k=0;k<8;k++)S(R(2080,2400),R(1130,1176),R(50,110),R(-.02,.02),K('#a05848',.04),R(10,18),{load:.8,thin:.5,edge:.6,opacity:R(.25,.45),taper:[.3,.4]});
// ----- platform (Lucca's) top: boards running along the stage in light, front face boards in violet-brown shade -----
for(const [yb,t0] of [[985,.78],[998,.72],[1011,.68],[1024,.64],[1037,.6]]){
  for(let x=1160;x<2085;){const L=R(120,280);const xe=Math.min(x+L,2085);S((x+xe)/2,yb+(x-1160)/925*-8*0,xe-x,R(-.006,.006),K(G(WD2,clamp(t0-(x-1160)/925*.2+R(-.12,.12),0,1)),.035),R(13,15),{brush:'flat',load:1.1,thin:.4,edge:.15,taper:[.04,.08]});if(xe>=2085)break;x=xe-R(0,16);}
  for(let x=1160;x<2085;){const L=R(100,300);S(x+L/2,yb+6,L,0,K('#2a1a24',.03),2.8,{load:.95,thin:.35,opacity:R(.45,.75),taper:[.2,.3]});x+=L+R(10,60);}
  for(let k=0;k<5;k++)S(R(1170,2070),yb+R(-4,4),R(60,200),R(-.004,.004),K(R(0,1)<.5?G(WD2,.35):G(WD2,.95),.04),R(2,3.4),{load:.9,thin:.4,edge:.5,opacity:R(.3,.5),taper:[.2,.3]});
}
for(let x=1160;x<2085;){const w=R(26,36);board(x,1048,1124,Math.min(w,2085-x),clamp(.32-(x-1160)/925*.12+R(-.1,.1),.05,.55),{nails:false});x+=w;}
S(1620,1042,925,0,K('#2e1e2c',.04),9,{load:1,thin:.4,opacity:.7,taper:[.05,.05]});
SB([[1170,1058],[1600,1062],[2080,1056]],40,.3);
// ----- curtain behind the left of the stage: vertical folds, lit on one side, deep violet in the hollows -----
for(let k=0;k<11;k++){const x=R(1134,1420),y0=R(840,880),y1=R(960,992);const lit=R(0,1)<.4;
  F([[x,y0,.5],[x+R(-6,6),(y0+y1)/2,.9],[x+R(-8,8),y1,.5]],K(lit?pick(['#6a5070','#665068','#745a70']):pick(['#2e2438','#3a2c44','#3a2a38']),.04),R(26,52),{load:.9,thin:.5,edge:.55,opacity:R(.35,.6),taper:[.25,.4]});}
for(let k=0;k<6;k++){const x=R(1134,1420);SB([[x,850],[x+R(-5,5),920],[x+R(-5,5),990]],44,.35);}
for(let k=0;k<5;k++){const x=R(1134,1420);F([[x,880,.5],[x+R(-4,4),940,.8],[x+R(-4,4),990,.5]],K('#b49ab8',.04),R(4,8),{load:1.1,thin:.3,edge:.4,opacity:R(.35,.6),taper:[.3,.4]});}
// ---------- the gate's rim ----------
const GX2=1760,GY2=790,GR2=278;
const rimR=a=>GR2*(1+.034*Math.sin(a*5+1.3)+.022*Math.sin(a*9+.4)+.016*Math.sin(a*3+2.1));
const polar=(a,rf)=>[GX2+Math.cos(a)*rimR(a)*rf,GY2+Math.sin(a)*rimR(a)*rf*.985];
function rimArc(a0,a1,rf,c,size,o,n){n=n||6;const pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));const q=polar(a,rf+R(-.008,.008));pts.push([q[0],q[1],.5+.5*Math.sin(Math.PI*clamp(i/(n-1)*.9+.05,0,1))]);}return F(pts,c,size,o);}
// 1 transparent colour: broad glazes of violet, blue and cyan around the edge, outside and inside, following the flow
for(let k=0;k<110;k++){const a=R(0,TAU),L=R(.2,.6),rf=R(.9,1.12);rimArc(a,a+L,rf,K(pick(['#6a6ae0','#8a82ec','#7ab4f0','#9ad0f8','#a890e8','#5a5ccc']),.04),R(12,30),{load:R(.45,.75),thin:.75,edge:.6,opacity:R(.3,.5),taper:[.3,.5]});}
// dark indigo just inside the edge, so the light above it reads
for(let k=0;k<44;k++){const a=R(0,TAU),L=R(.2,.5);rimArc(a,a+L,R(.78,.93),K(pick(['#2c2c86','#34349a','#3e3ca8']),.03),R(9,18),{load:.95,thin:.45,edge:.35,opacity:R(.55,.8),taper:[.25,.4]});}
// thick pale light in broken bursts (broad, tapering), over the transparent colour; brightest on the upper left, with gaps where indigo shows through
for(let k=0;k<120;k++){const a=R(0,TAU);const w=1+.5*Math.cos(a-3.9);if(R(0,1)>.3+.45*w)continue;const L=R(.14,.34);
  const c=K(pick(['#f4fdff','#d6f4ff','#e8f8ff','#c4ecff','#e4dcff']),.015);rimArc(a,a+L,R(.97,1.03),c,R(6,12),{load:R(1.05,1.3),thin:.3,edge:.4,opacity:R(.55,.9),taper:[.15,.3]},5);}
for(let k=0;k<24;k++){const a=R(0,TAU);const w=1+.5*Math.cos(a-3.9);if(R(0,1)>.3+.4*w)continue;rimArc(a,a+R(.1,.22),R(.985,1.02),K('#ffffff',.005),R(3.5,6),{load:1.35,thin:.25,opacity:R(.6,.9),taper:[.2,.4]},4);}
// streamers: short broad tongues of rim colour spiralling outward, thinning to nothing
for(let k=0;k<20;k++){const a=R(0,TAU);const turn=R(.25,.55),out=R(1.06,1.26);const pts=[];for(let i=0;i<5;i++){const u=i/4;const aa=a+u*turn;const rf=lerp(1.0,out,u);const q=polar(aa,rf);pts.push([q[0],q[1],.9-u*.5]);}
  F(pts,K(pick(['#a8dcfa','#c4ecff','#9a98f0','#d8c8f8']),.03),R(12,26),{load:.7,thin:.6,edge:.7,opacity:R(.25,.45),taper:[.2,.7]});}
// soft glow breathing out of the rim into the surroundings
for(let k=0;k<26;k++){const a=R(0,TAU);const q=polar(a,R(1.0,1.18));S(q[0],q[1],R(60,130),a+1.57+R(-.4,.4),K(pick(['#b4e4fa','#a8a8f4']),.04),R(30,60),{load:.4,thin:.8,edge:.9,opacity:R(.1,.22),taper:[.3,.5]});}
for(let k=0;k<14;k++){const a=R(0,TAU);arc(GX2,GY2,GR2*R(.92,1.04),a,a+R(.3,.6),'titanium_white',60,{brush:'soft',opacity:.35});}
// ---------- telepods, second layer ----------
const BRS=[[0,'#fff2b8'],[.18,'#f4cc66'],[.42,'#d29c3a'],[.68,'#8e5c24'],[.88,'#5c3a18'],[1,'#a07434']];
function podBase(cx){
  // solid base planes first (the gate's arms were laid over the old ones): drum, brass cylinder, steel dome body
  const yb=1030;
  cover([[cx-98,962],[cx+98,962],[cx+98,yb],[cx-98,yb]],26,(x,y)=>K(G([[0,'#bfd0e4'],[.3,'#8ea4c0'],[.65,'#566a8c'],[1,'#33405c']],clamp((x-cx+98)/196,0,1)),.03),{ang:1.57,angJ:.05,len:2.2,dens:2.6,o:{thin:.4,edge:.2}});
  cover([[cx-80,770],[cx+80,770],[cx+80,964],[cx-80,964]],22,(x,y)=>K(G([[0,'#ffeaa4'],[.22,'#e6bb52'],[.55,'#b8802e'],[.85,'#6a4418'],[1,'#8a5c28']],clamp((x-cx+80)/160+R(-.03,.03),0,1)),.03),{ang:1.57,angJ:.04,len:2.2,dens:3,o:{thin:.35,edge:.15}});
  const dpoly0=ELL(cx,772,102,74,0,28).map(q=>[q[0],Math.min(q[1],836)]);
  cover(dpoly0,22,(x,y)=>K(G([[0,'#222a3a'],[.35,'#46526a'],[.7,'#7d8ca4'],[1,'#c6d2e2']],clamp(.5+((cx-x)/102)*.38+((772-y)/74)*.42+R(-.06,.06),0,1)),.03),{angf:(x,y)=>Math.atan2(y-772,x-cx)+Math.PI/2,angJ:.12,len:2.4,dens:3.5,o:{thin:.4,edge:.2}});
}
podBase(1475);podBase(1982);p.dry();
function pod2(cx,gateSide){
  // brass rings: body in five pieces from lit to shade, hot crest on the lit side, dark groove below, cool sky reflection in the shade
  for(let y=806,ri=0;y<962;y+=21,ri++){const bend=7;const yy=(x)=>y+bend*(1-Math.pow((x-cx)/82,2)*1);
    const cuts=[-80,-50,-12,28,62,80];
    for(let c=0;c<5;c++){const xa=cx+cuts[c]+R(-3,3),xb=cx+cuts[c+1]+R(-3,3);const u=((xa+xb)/2-cx+80)/160;
      F([[xa,yy(xa),.7],[(xa+xb)/2,yy((xa+xb)/2),.9],[xb,yy(xb),.7]],K(G(BRS,clamp(u+R(-.04,.04)+(ri%2?.02:-.02),0,1)),.03),R(11,14),{load:1.1,thin:.3,edge:.2,taper:[.08,.12]});}
    F([[cx-82,yy(cx-82)+8,.6],[cx,yy(cx)+8.5,.8],[cx+82,yy(cx+82)+8,.6]],K('#3e2410',.03),R(3.5,5),{load:.95,thin:.35,opacity:R(.55,.8),taper:[.15,.2]});
    const hx=cx-R(60,40);F([[hx-18,yy(hx-18)-3.5,.5],[hx,yy(hx)-3.5,.9],[hx+26,yy(hx+26)-3.5,.5]],K('#fffbd4',.015),R(3.5,5),{load:1.35,thin:.25,opacity:R(.75,1),taper:[.25,.45]});
    if(R(0,1)<.7)F([[cx+36,yy(cx+36)-3,.5],[cx+52,yy(cx+52)-3,.8],[cx+64,yy(cx+64)-2,.5]],K('#98aec0',.04),R(3,4),{load:1,thin:.3,opacity:R(.3,.55),taper:[.3,.4]});
    if(R(0,1)<.6)F([[cx+66,yy(cx+66)+1,.5],[cx+78,yy(cx+78)+1,.6]],K('#c88a44',.04),R(4,6),{load:1,thin:.3,opacity:.6,taper:[.3,.4]});}
  // vertical highlight streak and shade column, in pieces so the rings still break it
  for(const [y0,y1] of [[800,860],[858,912],[908,960]])F([[cx-56+R(-2,2),y0,.5],[cx-56+R(-2,2),(y0+y1)/2,.8],[cx-56+R(-2,2),y1,.5]],K('#fff4c4',.02),R(6,9),{load:1.2,thin:.3,edge:.5,opacity:R(.3,.45),taper:[.25,.35]});
  for(const [y0,y1] of [[800,880],[878,960]])F([[cx+44,y0,.5],[cx+46,(y0+y1)/2,.8],[cx+44,y1,.5]],K('#4a2c14',.03),R(14,22),{load:.8,thin:.5,edge:.7,opacity:R(.3,.45),taper:[.25,.35]});
  S(cx,800,170,0,K('#3a2438',.03),14,{load:.9,thin:.5,edge:.6,opacity:.5,taper:[.1,.1]});   // shade under the dome
  S(cx,957,170,0,K('#2a1c26',.03),10,{load:.9,thin:.5,edge:.6,opacity:.55,taper:[.1,.1]});  // contact shade on the drum top
  SB([[cx-70,810],[cx-68,880],[cx-70,950]],22,.3);SB([[cx+20,810],[cx+22,880],[cx+20,950]],24,.3);
  // steel dome: facets following the curve, light from the upper left, sky band above, warm ground band below, cool rim from the gate
  const dcx=cx,dcy=772,rx=102,ry=74;
  const DST=[[0,'#1e2638'],[.3,'#3e4a64'],[.6,'#6e7e9c'],[.85,'#a4b4cc'],[1,'#dce6f2']];
  const earc=(a0,a1,rr,c,size,o)=>{const pts=[];for(let i=0;i<5;i++){const a=lerp(a0,a1,i/4);pts.push([dcx+Math.cos(a)*rx*rr,Math.min(dcy+Math.sin(a)*ry*rr,832),.5+.5*Math.sin(Math.PI*(i/4*.9+.05))]);}return F(pts,c,size,o);};
  for(const rr of [.88,.64,.4]){for(let a=3.2;a<6.2;a+=R(.9,1.2)){const am=a+.3;const x=dcx+Math.cos(am)*rx*rr,y=dcy+Math.sin(am)*ry*rr;
    const L=clamp(.3+((dcx-x)/rx)*.48+((dcy-y)/ry)*.5+R(-.06,.06),0,1);earc(a,a+R(1.1,1.5),rr,K(G(DST,L),.03),R(11,16),{load:1,thin:.4,edge:.45,taper:[.2,.3],opacity:.92});}}
  for(let a=-.1;a<.9;a+=.5){earc(a,a+.5,.8,K(G(DST,R(.05,.25)),.03),R(14,20),{load:1,thin:.4,edge:.4,taper:[.2,.35],opacity:.85});}
  for(const rr of [.86,.6])SB([[dcx+Math.cos(3.3)*rx*rr,dcy+Math.sin(3.3)*ry*rr],[dcx+Math.cos(4.5)*rx*rr,dcy+Math.sin(4.5)*ry*rr],[dcx+Math.cos(5.8)*rx*rr,dcy+Math.sin(5.8)*ry*rr]],30,.4);
  earc(4.0,5.2,.8,K('#9ab8dc',.03),R(6,9),{load:1,thin:.4,edge:.5,opacity:.4,taper:[.3,.4]});     // sky reflected near the top
  earc(.5,2.4,.84,K('#7a6670',.03),R(8,11),{load:.95,thin:.4,edge:.5,opacity:.45,taper:[.3,.4]});    // warm ground reflected low
  for(let k=0;k<3;k++){const sx=dcx+(gateSide>0?1:-1)*R(80,98),sy=dcy+R(-28,10);F([[sx,sy,.6],[sx-gateSide*R(1,5),sy-R(14,26),.8]],K('#c4eeff',.02),R(4,6),{load:1.2,thin:.3,opacity:R(.55,.8),taper:[.2,.5]});}
  // seam with a few rivets, and the crisp specular
  const seam=[];for(let i=0;i<7;i++){const x=dcx-96+i*32;const t=(x-dcx)/rx;seam.push([x,Math.min(dcy+ry*.62*Math.sqrt(Math.max(0,1-t*t))+4,834),.7]);}
  F(seam,K('#202838',.02),3.6,{load:1,thin:.3,opacity:.6,taper:[.05,.05]});
  for(const q of seam.slice(1,6)){if(R(0,1)<.75){F([[q[0],q[1]-3,.8]],K('#3a4660',.02),R(5,7),{brush:'round',load:1,thin:.3});F([[q[0]-1.5,q[1]-4.5,.8]],K('#e0ecf8',.02),R(2,3.2),{brush:'round',load:1.2,thin:.25});}}
  F([[dcx-64,750,.5],[dcx-40,735,.9],[dcx-14,732,.5]],K('#f4f8fc',.01),R(13,16),{load:1.35,thin:.28,taper:[.3,.5]});
  F([[dcx-74,762,.5],[dcx-62,752,.7]],K('#ffffff',.01),6,{load:1.35,thin:.25});
}
pod2(1475,1);pod2(1982,-1);
p.dry();
