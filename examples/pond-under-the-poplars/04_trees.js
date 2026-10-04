// TREES: lumpy asymmetric crown; scrubbed dark mass, half-tone, lit clusters of overlapping strokes, sky holes, trunk and limbs; a sliver of distance between the two trees
const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.88,1.12)]);
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
const DEEP=()=>M([['ultramarine',1],['cadmium_yellow',.35],['burnt_umber',.45],['alizarin_crimson',.2],['prussian_blue',.2]]);
const SHD=()=>M([['ultramarine',.8],['cadmium_yellow',.35],['burnt_umber',.4],['alizarin_crimson',.1],['titanium_white',.12]]);
const HALF=()=>M([['ultramarine',.65],['cadmium_yellow',.45],['burnt_umber',.3],['titanium_white',.2]]);
const MID=()=>M([['ultramarine',.45],['cadmium_yellow',.4],['yellow_ochre',.2],['burnt_umber',.25],['titanium_white',.42]]);
const LIT=()=>M([['ultramarine',.28],['cadmium_yellow',.5],['yellow_ochre',.3],['titanium_white',.7],['burnt_umber',.12]]);
function xs(poly,y){const r=[];for(let i=0;i<poly.length;i++){const [x1,y1]=poly[i],[x2,y2]=poly[(i+1)%poly.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))r.push(x1+(y-y1)/(y2-y1)*(x2-x1));}return r.sort((a,b)=>a-b);}
function inside(poly,x,y){const r=xs(poly,y);for(let i=0;i+1<r.length;i+=2)if(x>=r[i]&&x<=r[i+1])return true;return false;}
const S=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:.9,thin:.55},o));
// lumpy, asymmetric crown with protruding clumps (right, upper left, lower left); lower foliage ends high enough to show trunk and limbs
const BIGP=[[100,418],[62,398],[44,358],[68,334],[24,300],[30,264],[64,246],[46,208],[70,172],[62,138],[100,120],[108,86],[148,70],[168,36],[214,16],[248,34],[286,26],[314,52],[316,84],[352,90],[378,116],[368,150],[410,168],[424,206],[398,226],[384,258],[412,284],[394,320],[370,346],[378,380],[350,404],[326,424],[292,410],[268,428],[232,412],[198,430],[152,414],[122,428]];
const SECP=[[436,462],[432,410],[438,356],[448,316],[460,290],[480,266],[502,262],[522,282],[532,322],[538,368],[540,412],[532,452],[522,466]];
const BB=[20,14,430,432],SB=[428,258,545,470];
function scrub(poly,bb,n,sz,cf){let k=0,t=0;while(k<n&&t<n*50){t++;const x=R(bb[0],bb[2]),y=R(bb[1],bb[3]);if(!inside(poly,x,y))continue;k++;
  const a=R(-1.5,1.5),L=R(50,90);S([[x-Math.cos(a)*L/2,y-Math.sin(a)*L/2],[x,y+R(-5,5)],[x+Math.cos(a)*L/2,y+Math.sin(a)*L/2]],cf(),R(sz[0],sz[1]),{load:.85,thin:.6});}}
function mass(poly,bb,cx,cy,hx,hy,n,thr,colf,sz,len,bend){let k=0,t=0;while(k<n&&t<n*60){t++;const x=R(bb[0],bb[2]),y=R(bb[1],bb[3]);if(!inside(poly,x,y))continue;
  const l=((x-cx)/hx*.6-(y-cy)/hy*.8)+R(-.2,.2);if(l<thr[0]||l>=thr[1])continue;k++;
  const tg=Math.atan2(y-cy,x-cx)+Math.PI/2+R(-.5,.5),L=R(len[0],len[1]);
  S([[x-Math.cos(tg)*L/2,y-Math.sin(tg)*L/2],[x+Math.cos(tg)*bend*.1,y+Math.sin(tg)*bend*.1],[x+Math.cos(tg)*L/2,y+Math.sin(tg)*L/2]],colf(),R(sz[0],sz[1]),{load:R(.7,.95),thin:.55});}}
// a lit mass: 1-3 big slightly curved strokes, a few small broken touches at its outer edge, blended once toward the halftone side
function cluster(cx,cy,spread,colf,base){const n=Math.round(R(1,3.4));for(let i=0;i<n;i++){const x=cx+R(-spread,spread)*.8,y=cy+R(-spread,spread)*.6;const a=base+R(-.9,.9),L=R(34,70),bd=R(-8,8);
  const nx=-Math.sin(a),ny=Math.cos(a);
  S([[x-Math.cos(a)*L/2,y-Math.sin(a)*L/2],[x+nx*bd,y+ny*bd],[x+Math.cos(a)*L/2,y+Math.sin(a)*L/2]],colf(),R(25,45),{load:R(.7,.9),thin:.55});}
  for(let i=0;i<3;i++){const ang=R(-2.4,.2),r=spread*R(1.1,1.7);const x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;const a=R(-1,1);
    S([[x,y],[x+Math.cos(a)*R(8,14),y+Math.sin(a)*R(8,14)]],colf(),R(7,12),{load:.8,thin:.45});}
  BL([[cx,cy],[cx-Math.cos(.6)*34,cy+Math.sin(.6)*34]],R(16,22));}
function clusters(poly,bb,cx,cy,hx,hy,n,thr,colf,spread){let k=0,t=0;while(k<n&&t<n*60){t++;const x=R(bb[0],bb[2]),y=R(bb[1],bb[3]);if(!inside(poly,x,y))continue;
  const l=((x-cx)/hx*.6-(y-cy)/hy*.8)+R(-.2,.2);if(l<thr[0]||l>=thr[1])continue;k++;cluster(x,y,spread,colf,-.5);}}
// 1. scrubbed dark mass, every direction, blended
scrub(BIGP,BB,300,[40,60],DEEP);scrub(SECP,SB,60,[30,44],SHD);
for(let i=0;i<80;i++){const x=R(20,430),y=R(14,430);if(!inside(BIGP,x,y))continue;const a=R(-1.6,1.6),L=R(40,80);BL([[x,y],[x+Math.cos(a)*L,y+Math.sin(a)*L]],R(26,38));}
for(let i=0;i<20;i++){const x=R(428,545),y=R(258,468);if(!inside(SECP,x,y))continue;const a=R(-1.6,1.6),L=R(30,60);BL([[x,y],[x+Math.cos(a)*L,y+Math.sin(a)*L]],R(22,30));}
// 2. shadow planes and broad half-tone
mass(BIGP,BB,225,225,185,200,14,[-.55,-.1],()=>SHD(),[26,44],[40,80],10);
mass(SECP,SB,486,365,55,105,5,[-.5,-.1],()=>SHD(),[20,30],[36,60],8);
mass(BIGP,BB,225,225,185,200,16,[-.3,.5],HALF,[40,64],[70,120],14);
// 3. lit foliage: clusters of overlapping strokes, close in value to the mass
clusters(BIGP,BB,225,225,185,200,13,[-.1,.42],MID,16);
clusters(BIGP,BB,225,225,185,200,6,[.42,2],LIT,14);
clusters(SECP,SB,486,365,55,105,4,[-.1,.35],MID,10);
clusters(SECP,SB,486,365,55,105,3,[.35,2],LIT,8);
// 4. soften: short straight blender strokes over the lit side
for(let i=0;i<26;i++){const x=R(120,400),y=R(30,320);if(!inside(BIGP,x,y))continue;const l=(x-225)/185*.6-(y-225)/200*.8;if(l<0)continue;const a=R(-.9,.2),L=R(24,44);BL([[x,y],[x+Math.cos(a)*L,y+Math.sin(a)*L]],R(14,22));}
// 5. re-assert a few lit clusters after softening so edges stay found where light hits
clusters(BIGP,BB,225,225,185,200,3,[.55,2],LIT,12);
// 6. sky holes punched into the silhouette on the lit/upper side, then softened
const SKY=y=>M([['titanium_white',1.9],['cobalt_blue',.55],['ultramarine',.1],['burnt_umber',.12],['naples_yellow',Math.max(0,(y-120)/600)],['alizarin_crimson',.05]]);
let hk=0,ht=0;while(hk<6&&ht<4000){ht++;const x=R(60,420),y=R(30,330);if(!inside(BIGP,x,y))continue;const l=(x-225)/185*.6-(y-225)/200*.8;if(l<-.1)continue;
  const d=R(12,24),a=R(0,6.28);if(inside(BIGP,x+Math.cos(a)*d,y+Math.sin(a)*d))continue;hk++;
  const q=R(-1,1);S([[x-Math.cos(q)*10,y-Math.sin(q)*10],[x+Math.cos(q)*R(14,22),y+Math.sin(q)*R(14,22)]],SKY(y),R(7,11),{load:.85,thin:.5});
  BL([[x+Math.cos(a)*6,y+Math.sin(a)*6],[x+Math.cos(a)*(d+8),y+Math.sin(a)*(d+8)]],10);}
// 7. trunks: varied width, darker at the base, a lit sliver on the right; one dies into the foliage
const TD=()=>M([['burnt_umber',1],['ultramarine',.7],['prussian_blue',.1]]);
const TR=()=>M([['burnt_umber',.9],['ultramarine',.5],['titanium_white',.3],['raw_sienna',.05]]);
const TL=()=>M([['burnt_umber',.5],['yellow_ochre',.3],['titanium_white',.8],['ultramarine',.2]]);
function trunk(x,yb,yt,w,sliver){const dx=R(-6,6);
  S([[x,yb+4],[x+dx*.4,yb-(yb-yt)*.2],[x+dx*.5,yb-(yb-yt)*.5]],TD(),w*1.05,{load:.95,thin:.4});
  S([[x+dx*.5,yb-(yb-yt)*.3],[x+dx,yb-(yb-yt)*.65],[x+dx*1.2,yt]],TR(),w*.72,{load:.9,thin:.45});
  if(sliver)S([[x+w*.3,yb-8],[x+dx*.5+w*.26,yb-(yb-yt)*.5]],TL(),w*.2,{load:.8,thin:.4});}
trunk(216,480,372,26,true);
trunk(266,480,404,19,true);
trunk(160,478,436,15,false);
trunk(328,478,448,12,false);
S([[220,396],[196,370],[166,346]],TR(),R(9,12),{load:.85,thin:.45});
S([[222,386],[256,360],[292,340]],TR(),R(8,11),{load:.85,thin:.45});
S([[262,410],[286,394],[312,386]],TR(),R(7,9),{load:.85,thin:.45});
trunk(484,480,420,15,true);
// 8. small touches along the silhouette against the sky only
function sprigs(poly,n){for(let i=0;i<poly.length;i++){const [x1,y1]=poly[i],[x2,y2]=poly[(i+1)%poly.length];const L=Math.hypot(x2-x1,y2-y1);const m=Math.floor(L/(1000/n));
  for(let k=0;k<m;k++){const t=R(0,1);const x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;let nx=(y2-y1)/L,ny=-(x2-x1)/L;if(inside(poly,x+nx*3,y+ny*3)){nx=-nx;ny=-ny;}if(y>400)continue;
   const lit=nx*.6+ny*.8;const col=lit>.25?(R(0,1)<.6?MID():LIT()):(R(0,1)<.7?SHD():DEEP());const a=Math.atan2(ny,nx)+R(-.8,.8),len=R(10,20),off=R(-2,7);
   S([[x+nx*off,y+ny*off],[x+nx*off+Math.cos(a)*len*.5,y+ny*off+Math.sin(a)*len*.5],[x+nx*off+Math.cos(a)*len,y+ny*off+Math.sin(a)*len]],col,R(9,14),{load:.85,thin:.45});}}}
sprigs(BIGP,40);sprigs(SECP,12);
