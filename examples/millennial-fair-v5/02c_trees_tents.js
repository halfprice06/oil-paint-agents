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
// TREES and TENTS, second and third layers. Foliage is built from big lobes (masses) each with a lit crown (upper left) and a cool
// shadowed lee; broken leaf-clump marks of varied size and shape on top, bright only where the mass faces the sun.
// Tents: every gore is a slightly convex panel (lit on its sunward side, darker on the other), seams, sag folds, a violet shade glaze on the lee half.
const TR=[[1730,-10],[2410,-10],[2410,440],[2300,466],[2200,432],[2130,470],[2020,424],[1930,452],[1880,364],[1790,330],[1760,220],[1715,100]];
const BT=[[1130,745],[1118,650],[1186,600],[1218,505],[1330,470],[1400,412],[1500,440],[1600,402],[1720,420],[1830,410],[1900,482],[2002,522],[2040,622],[2062,745]];
const FC2=[[0,'#16303a'],[.18,'#234c4a'],[.38,'#3b6c44'],[.58,'#689a40'],[.78,'#a2bd52'],[.92,'#d4d870'],[1,'#eee89a']];
function foliage2(poly,lobes,o){o=o||{};
  const [x0,y0,x1,y1]=bbox(poly);
  const mark=(x,y,size,L,ang,lenf,op)=>{const c=R(0,1)<.12?K(G(FC2,clamp(L+R(-.1,.25),0,1)),.06):R(0,1)<.14?K(mixh(G(FC2,L),'#3a6a7a',.45),.04):K(G(FC2,L),.045);
    const len=size*lenf*R(.8,1.4);S(x,y,len,ang,c,size,{load:R(.9,1.15),thin:.35,edge:R(.2,.5),taper:[.2,.45],bend:R(-.4,.4)*len,opacity:op===undefined?1:op});};
  for(const [cx,cy,r,Lb] of lobes){
    const Ls=(x,y)=>{const u=(x-cx)/r,v=(y-cy)/r;return clamp(Lb+.34*(-(u*.6+v*.8))+R(-.06,.06),0,1);};
    const pt=(rr)=>{for(let g=0;g<10;g++){const a=R(0,TAU),d=Math.sqrt(R(0,1))*r*rr;const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(inPoly(poly,x,y))return [x,y];}return null;};
    // A: broad masses, tangential, shade crescent first
    for(let k=0;k<Math.max(3,Math.round(r/18));k++){const q=pt(.95);if(!q)continue;const L=Ls(q[0],q[1])*.9;mark(q[0],q[1],r*R(.26,.4),L,Math.atan2(q[1]-cy,q[0]-cx)+1.57+R(-.5,.5),R(1.2,2),.9);}
    // B: mid clumps
    for(let k=0;k<Math.max(6,Math.round(r/6));k++){const q=pt(.95);if(!q)continue;mark(q[0],q[1],r*R(.14,.24),Ls(q[0],q[1]),R(0,TAU),R(1,1.9));}
    // C: small clumps, denser on the lit side
    for(let k=0;k<Math.max(10,Math.round(r/3));k++){const q=pt(.98);if(!q)continue;const L=Ls(q[0],q[1]);if(L<.35&&R(0,1)<.5)continue;mark(q[0],q[1],r*R(.07,.13)+3,L,R(0,TAU),R(1,2.2));}
    // D: sunlit touches only on the crown
    for(let k=0;k<Math.max(4,Math.round(r/8));k++){const a=R(3.1,5.2),d=r*R(.35,.9);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(!inPoly(poly,x,y))continue;mark(x,y,r*R(.05,.1)+3,clamp(Lb*.4+.62+R(0,.25),0,1),R(-.5,.5)+1.57*R(0,1),R(1,1.8),.92);}
    // E: dark accents tucked under clumps on the lee
    for(let k=0;k<Math.max(3,Math.round(r/14));k++){const a=R(.2,2.8),d=r*R(.4,.95);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(!inPoly(poly,x,y))continue;mark(x,y,r*R(.06,.12)+3,clamp(Lb*.3+R(0,.12),0,1),R(0,TAU),R(1,2),.85);}
  }
  // ragged silhouette: leaf clumps overlapping the edge, lit on the upper-left
  for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];const Ln=Math.hypot(b[0]-a[0],b[1]-a[1]);if(a[1]>y1-20&&b[1]>y1-20&&o.skipBottom)continue;
    for(let k=0;k<Ln/(o.edgeStep||26);k++){const u=R(0,1);const x=lerp(a[0],b[0],u),y=lerp(a[1],b[1],u);if(x<-5||x>2405||y<-5)continue;let best=lobes[0],bd=1e9;for(const l of lobes){const d=Math.hypot(l[0]-x,l[1]-y)-l[2];if(d<bd){bd=d;best=l;}}
      const [cx,cy,r,Lb]=best;const L=clamp(Lb+.34*(-(((x-cx)/r)*.6+((y-cy)/r)*.8))+R(-.1,.1),0,1);mark(x+R(-6,6),y+R(-6,6),R(10,22),L,R(0,TAU),R(1,1.8));}}
  // soft unifying touches, only on the shade side and between masses, so a few edges melt (lost and found)
  for(const [cx,cy,r,Lb] of lobes){if(R(0,1)<.7){const a=R(.3,2.4);SB([[cx+Math.cos(a)*r*.5,cy+Math.sin(a)*r*.5],[cx+Math.cos(a+.6)*r*.55,cy+Math.sin(a+.6)*r*.55],[cx+Math.cos(a+1.2)*r*.5,cy+Math.sin(a+1.2)*r*.5]],clamp(r*.5,24,70),.3);}}
}
const LB=(row,x)=>clamp(.62-row*.12-(x-1700)/1400*.08,.2,.8);
const TRL=[[1790,50,110,LB(0,1790)+.1],[1930,30,130,LB(0,1930)+.1],[2080,40,130,LB(0,2080)+.1],[2230,30,130,LB(0,2230)+.1],[2370,60,120,LB(0,2370)+.1],
 [1790,170,95,LB(1,1790)],[1930,150,130,LB(1,1930)],[2090,160,120,LB(1,2090)],[2230,165,130,LB(1,2230)],[2370,200,110,LB(1,2370)],
 [1850,290,100,LB(2,1850)],[1990,280,115,LB(2,1990)],[2130,290,105,LB(2,2130)],[2270,300,115,LB(2,2270)],[2380,330,90,LB(2,2380)],
 [1960,395,75,LB(3,1960)],[2070,405,72,LB(3,2070)],[2180,415,72,LB(3,2180)],[2300,430,70,LB(3,2300)]];
foliage2(TR,TRL);
// small gaps of sky showing through, irregular, edged with leaves
for(let i=0;i<9;i++){const x=R(1800,2350),y=R(250,440);if(inPoly(TR,x,y)){S(x,y,R(22,42),R(-.5,.5),K(G([[0,'#5e94d0'],[1,'#8cb8e0']],R(0,1)),.03),R(10,18),{load:1,thin:.4,edge:.5,taper:[.3,.4]});for(let k=0;k<4;k++)S(x+R(-18,18),y+R(-10,12),R(14,24),R(0,TAU),K(G(FC2,R(.3,.8)),.05),R(8,13),{load:1,thin:.35,taper:[.2,.4]});}}
const BTL=[[1180,690,60,.3],[1180,580,70,.38],[1270,520,72,.42],[1350,560,75,.34],[1400,480,62,.5],[1250,640,70,.28],[1340,650,70,.26],[1200,500,50,.4],
 [1470,470,74,.5],[1560,440,72,.52],[1660,430,80,.52],[1780,440,80,.5],[1880,480,76,.44],[1960,540,68,.38],[2020,610,62,.3],[2030,690,52,.26],[1500,540,50,.3],[1900,590,60,.28],[1700,500,50,.34]];
foliage2(BT,BTL,{edgeStep:20});
// light of the gate spills a cool cyan-white onto the nearest leaves
for(let i=0;i<60;i++){const a=R(Math.PI*.9,Math.PI*2.1),d=R(285,410);const x=1760+Math.cos(a)*d,y=790+Math.sin(a)*d*.95;if(!inPoly(BT,x,y)&&!inPoly(TR,x,y))continue;
  S(x,y,R(14,34),a+1.57+R(-.5,.5),K(pick(['#b8ecf6','#d4f4fc','#a8d8f0']),.03),R(7,14),{load:R(.7,1.1),thin:.35,edge:.5,taper:[.3,.5],opacity:R(.35,.75)});}
// ---------- tents ----------
function tent2(ax,ay,L,Rg,by,n,cA,cB,shadeFrom,fmax,o){o=o||{};
  const gw=(Rg-L)/n;
  for(let i=0;i<n;i++){const t=(i+.5)/n,bx=lerp(L,Rg,t);const base=i%2?cB:cA;
    const sh=clamp((t-shadeFrom)/(1-shadeFrom+.001),0,1)*.9+(t>shadeFrom?.1:0);
    const lit=t<shadeFrom?clamp((shadeFrom-t)/shadeFrom,0,1):0;
    const isW=(base===cB);const cLit=mixh(base,'#fff0d0',(isW?.25:.1)+lit*.2),cMid=mixh(base,isW?'#9a8cb4':'#5a2a4a',sh*(isW?.5:.42));
    for(const [f0,f1] of [[0,.36],[.3,.66],[.6,fmax]]){if(f0>=fmax)continue;
      const x0=lerp(ax,bx,f0),y0=lerp(ay,by,f0),x1=lerp(ax,bx,f1),y1=lerp(ay,by,f1);const w=Math.max(6,gw*(f0+f1)/2*.95);const nx=-(y1-y0),ny=x1-x0;const nl=Math.hypot(nx,ny);const ox=nx/nl*w*.2,oy=ny/nl*w*.2;
      // convex panel: sunward half lighter, the other half darker, then a core between
      F([[x0-ox,y0-oy,.6],[(x0+x1)/2-ox,(y0+y1)/2-oy,.9],[x1-ox,y1-oy,.6]],K(sh>.05?mixh(cMid,'#d8c8e0',.12):cLit,.035),w*.5,{load:1.1,thin:.35,edge:.35,taper:[.12,.25],opacity:.92});
      F([[x0+ox,y0+oy,.6],[(x0+x1)/2+ox,(y0+y1)/2+oy,.9],[x1+ox,y1+oy,.6]],K(mixh(sh>.05?cMid:base,'#4a3060',.22+sh*.25),.035),w*.42,{load:1.05,thin:.35,edge:.4,taper:[.12,.25],opacity:.88});}
    // a touch of cream sheen on the sunward panels near the apex
    if(t<shadeFrom&&R(0,1)<.6){const f0=R(.04,.2),f1=f0+R(.15,.3);const x0=lerp(ax,bx,f0),y0=lerp(ay,by,f0),x1=lerp(ax,bx,f1),y1=lerp(ay,by,f1);F([[x0,y0,.6],[x1,y1,.8]],K('#fff6e0',.02),Math.max(4,gw*f0*.28),{load:1.25,thin:.3,taper:[.2,.5],opacity:.8});}
    // seam: a darker broken line between panels
    const sx=lerp(L,Rg,i/n);for(const [f0,f1] of [[.06+R(0,.05),.4],[.46,Math.min(fmax,.8)]]){const x0=lerp(ax,sx,f0),y0=lerp(ay,by,f0),x1=lerp(ax,sx,f1),y1=lerp(ay,by,f1);F([[x0,y0,.6],[x1,y1,.7]],K(mixh(base===cA?cA:cB,'#3a2448',.5),.03),R(2.5,4.2),{load:.95,thin:.35,taper:[.25,.4],opacity:R(.3,.55)});}
  }
  // violet shade glaze over the lee half (transparent, so the stripes stay visible)
  for(let k=0;k<16;k++){const f0=R(.1,.5),f1=Math.min(fmax,f0+R(.3,.5));const t=R(shadeFrom,1);const bx=lerp(L,Rg,t);const x0=lerp(ax,bx,f0),y0=lerp(ay,by,f0),x1=lerp(ax,bx,f1),y1=lerp(ay,by,f1);
    F([[x0,y0,.6],[(x0+x1)/2,(y0+y1)/2,.9],[x1,y1,.6]],K('#4a3a78',.04),gw*R(.7,1.4)*(f0+f1)/2,{load:.5,thin:.7,edge:.8,opacity:R(.2,.35),taper:[.3,.5]});}
  // sag folds: a few long shallow creases crossing several gores (dark under, a faint light above), never tiny smiles
  for(let k=0;k<(o.folds||3);k++){const f=R(.45,fmax-.05);const i0=R(0,n/2),span=R(4,n*.6);const xa=lerp(L,Rg,i0/n),xb=lerp(L,Rg,Math.min(n,i0+span)/n);const pa=[lerp(ax,xa,f),lerp(ay,by,f)],pb=[lerp(ax,xb,f),lerp(ay,by,f)];
    const sag=R(8,16);const pm=[(pa[0]+pb[0])/2,(pa[1]+pb[1])/2+sag];const t=(i0+span/2)/n;const dk=t>shadeFrom;
    F([[pa[0],pa[1]+2,.4],[(pa[0]+pm[0])/2,(pa[1]+pm[1])/2+3,.8],[pm[0],pm[1]+2,.9],[(pb[0]+pm[0])/2,(pb[1]+pm[1])/2+3,.8],[pb[0],pb[1]+2,.4]],K(dk?'#4a3058':'#8a4a50',.04),R(6,10),{load:.8,thin:.5,edge:.6,taper:[.3,.4],opacity:R(.22,.4)});
    F([[pa[0],pa[1]-6,.4],[pm[0],pm[1]-6,.8],[pb[0],pb[1]-6,.4]],K(dk?'#b8a8d0':'#fff0d8',.03),R(3,6),{load:1,thin:.3,edge:.6,taper:[.3,.4],opacity:R(.2,.4)});}
}
tent2(880,540,664,1098,848,17,'#e04838','#f8ecd8',.52,.7,{folds:3});
// apex: lit cap and the shade side of the finial
F([[872,552,.7],[879,562,.8],[884,580,.6]],K('#ffe8c8',.02),9,{load:1.2,thin:.3,taper:[.2,.4],opacity:.9});
tent2(2200,575,2022,2410,850,11,'#f4ead0','#7e84c4',.5,.98,{folds:4});
F([[2192,588,.7],[2198,600,.8],[2203,616,.6]],K('#fffbe8',.02),9,{load:1.2,thin:.3,taper:[.2,.4],opacity:.9});
// soften a few of the gores so the cone turns, then the stripes are restated lightly at the lit edge
for(const [ax,ay,bx,by] of [[880,540,800,740],[880,540,960,740],[880,560,720,720],[880,560,1040,720],[2200,575,2100,840],[2200,575,2300,840]])SB([[ax,ay+30],[(ax+bx)/2,(ay+by)/2],[bx,by]],50,.25);
p.dry();
