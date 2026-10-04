const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.8,1.2)]);
function grad(stops,t){t=Math.max(stops[0][0],Math.min(stops[stops.length-1][0],t));let i=0;while(i<stops.length-2&&t>stops[i+1][0])i++;const [t0,a]=stops[i],[t1,b]=stops[i+1];const u=(t-t0)/(t1-t0);const w={};for(const [n,v] of a)w[n]=(w[n]||0)+v*(1-u);for(const [n,v] of b)w[n]=(w[n]||0)+v*u;return Object.entries(w);}
const SZ=1.35;
const S=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'flat',size:size*SZ,load:1},o));
const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const HORIZON=612;
// ---- jug
const JC=290;
const JP=[[250,60],[268,58],[300,47],[340,44],[390,58],[450,96],[520,126],[580,136],[650,126],[710,106],[748,96]];
function jhw(y){const n=JP.length;if(y<=JP[0][0])return JP[0][1];if(y>=JP[n-1][0])return JP[n-1][1];
 let i=0;while(i<n-2&&y>JP[i+1][0])i++;const [y0,a]=JP[i],[y1,b]=JP[i+1];const t=(y-y0)/(y1-y0);
 const pa=JP[Math.max(0,i-1)][1],pb=JP[Math.min(n-1,i+2)][1];
 const m1=(b-pa)/2,m2=(pb-a)/2;const t2=t*t,t3=t2*t;
 return (2*t3-3*t2+1)*a+(t3-2*t2+t)*m1+(-2*t3+3*t2)*b+(t3-t2)*m2;}
const K=.2; // ellipse flattening
const D2R=Math.PI/180;
// point on jug surface: th in degrees (-90 left .. +90 right), y section height
function jp(th,y){const h=jhw(y),a=th*D2R;return [JC+h*Math.sin(a),y+K*h*Math.cos(a)];}
const LV=(()=>{const x=-.8,y=.4,z=.45,m=Math.hypot(x,y,z);return [x/m,y/m,z/m];})();
function jt(th,y){const a=th*D2R;const s=(jhw(y+3)-jhw(y-3))/6;let nx=Math.sin(a),ny=s,nz=Math.cos(a);const m=Math.hypot(nx,ny,nz);
 let t=(nx*LV[0]+ny*LV[1]+nz*LV[2])/m;
 t+=.3*sm(62,90,th); // reflected light from the table on the shadow side
 return t;}
const JG=[[-.75,[['burnt_umber',1.6],['burnt_sienna',.5],['titanium_white',.45],['ultramarine',.2]]],
 [-.4,[['burnt_umber',1.4],['ultramarine',.9],['alizarin_crimson',.15],['titanium_white',.35]]],
 [-.05,[['titanium_white',1.0],['burnt_umber',.9],['ultramarine',.65],['alizarin_crimson',.14]]],
 [.3,[['titanium_white',2.6],['burnt_umber',.5],['ultramarine',.25],['alizarin_crimson',.08],['naples_yellow',.3]]],
 [.6,[['titanium_white',4.5],['naples_yellow',.7],['yellow_ochre',.12],['burnt_umber',.15]]],
 [.9,[['titanium_white',7],['naples_yellow',.5],['yellow_ochre',.08]]],
 [1.1,[['titanium_white',9],['zinc_white',1]]]];
const JL=[-.45,-.05,.4,.8];
function jlev(th,y){if(th>76)return -.3;const t=jt(th,y);let b=JL[0],d=9;for(const l of JL){if(Math.abs(l-t)<d){d=Math.abs(l-t);b=l;}}return b;}
const AL=[-.6,-.15,.3,.65,.95];
function alev(t){let b=AL[0],d=9;for(const l of AL){if(Math.abs(l-t)<d){d=Math.abs(l-t);b=l;}}return b;}
function jcol(t){return M(grad(JG,t));}
// arc around the jug at section y from theta a to b
function jarc(a,b,y,n=6,wob=1.2){const pts=[];for(let q=0;q<=n;q++){const th=a+(b-a)*q/n;const P=jp(th,y);pts.push([P[0]+R(-wob,wob),P[1]+R(-wob,wob),.55+.4*Math.sin(Math.PI*(q+.5)/(n+1))]);}return pts;}
// vertical path along jug at fixed theta from y0 to y1
function jvert(th,y0,y1,n=8,wob=1){const pts=[];for(let q=0;q<=n;q++){const y=y0+(y1-y0)*q/n;const P=jp(th,y);pts.push([P[0]+R(-wob,wob),P[1]+R(-wob,wob),.55+.4*Math.sin(Math.PI*(q+.5)/(n+1))]);}return pts;}
// ---- spheres (apples)
const AP=[{cx:565,cy:735,r:88,kind:'red'},{cx:430,cy:870,r:66,kind:'green'}];
const TILT=.33;
const SL=(()=>{const x=-.8,y=.42,z=.45,m=Math.hypot(x,y,z);return [x/m,y/m,z/m];})();
function sph(A,lon,lat){const l=lon*D2R,f=lat*D2R;const P=[Math.cos(f)*Math.sin(l),Math.sin(f),Math.cos(f)*Math.cos(l)];
 const rr=A.r*(1+.06*Math.max(0,Math.sin(f))-.05*Math.max(0,-Math.sin(f))); // broader shoulders, narrower base
 const up=P[1]*Math.cos(TILT)-P[2]*Math.sin(TILT)*1; const depth=P[2]*Math.cos(TILT)+P[1]*Math.sin(TILT);
 const x=A.cx+rr*P[0],y=A.cy-rr*.93*up;
 let t=P[0]*SL[0]+P[1]*SL[1]+P[2]*SL[2];
 t+=.28*sm(55,95,lon)*sm(-30,10,-lat*.0+0)*.9; // reflected light on the shadow side
 return {x,y,t,vis:depth>0.02,depth};}
function sarc(A,lon0,lon1,lat,n=6,wob=1){const pts=[];let tm=0,c=0;for(let q=0;q<=n;q++){const s=sph(A,lon0+(lon1-lon0)*q/n,lat);if(!s.vis)continue;c++;tm+=s.t;pts.push([s.x+R(-wob,wob),s.y+R(-wob,wob),.55+.4*Math.sin(Math.PI*(q+.5)/(n+1))]);}return {pts,t:tm/Math.max(1,c),ok:c>=3};}
function smer(A,lon,lat0,lat1,n=6,wob=1){const pts=[];let tm=0,c=0;for(let q=0;q<=n;q++){const s=sph(A,lon,lat0+(lat1-lat0)*q/n);if(!s.vis)continue;c++;tm+=s.t;pts.push([s.x+R(-wob,wob),s.y+R(-wob,wob),.55+.4*Math.sin(Math.PI*(q+.5)/(n+1))]);}return {pts,t:tm/Math.max(1,c),ok:c>=3};}
function jvd(th,drift,y0,y1,n=8,wob=.8){const pts=[];for(let q=0;q<=n;q++){const y=y0+(y1-y0)*q/n;const t2=Math.max(-86,Math.min(86,th+drift*(q/n-.5)));const P=jp(t2,y);pts.push([P[0]+R(-wob,wob),P[1]+R(-wob,wob),.6+.35*Math.sin(Math.PI*(q+.5)/(n+1))]);}return pts;}
function smd(A,lon,drift,lat0,lat1,n=6,wob=.8){const pts=[];let tm=0,c=0;for(let q=0;q<=n;q++){const s=sph(A,lon+drift*(q/n-.5),lat0+(lat1-lat0)*q/n);if(!s.vis)continue;c++;tm+=s.t;pts.push([s.x+R(-wob,wob),s.y+R(-wob,wob),.6+.35*Math.sin(Math.PI*(q+.5)/(n+1))]);}return {pts,t:tm/Math.max(1,c),ok:c>=3};}
const RG=[[-.6,[['alizarin_crimson',.8],['burnt_umber',1.9],['ultramarine',.3],['burnt_sienna',.3]]],
 [-.2,[['alizarin_crimson',1],['burnt_umber',1.1],['cadmium_red',.5],['burnt_sienna',.4]]],
 [.15,[['cadmium_red',1.4],['alizarin_crimson',.7],['burnt_sienna',.9],['raw_umber',.2]]],
 [.5,[['cadmium_red',1.6],['burnt_sienna',.7],['cadmium_orange',.5],['titanium_white',.35],['alizarin_crimson',.3]]],
 [.8,[['cadmium_orange',1.3],['cadmium_red',.9],['naples_yellow',.6],['titanium_white',.7]]],
 [1.05,[['cadmium_orange',.8],['naples_yellow',1],['titanium_white',2.2],['cadmium_red',.3]]]];
const GG=[[-.6,[['burnt_umber',1.3],['sap_green',1.2],['yellow_ochre',.4],['ultramarine',.15]]],
 [-.2,[['sap_green',1.4],['burnt_umber',.9],['yellow_ochre',.7]]],
 [.15,[['yellow_ochre',1.2],['sap_green',1.3],['cadmium_lemon',.7],['burnt_umber',.2]]],
 [.5,[['cadmium_lemon',1.4],['sap_green',.9],['yellow_ochre',.9],['titanium_white',.5]]],
 [.8,[['cadmium_lemon',1.8],['titanium_white',1.3],['naples_yellow',.7],['sap_green',.4]]],
 [1.05,[['cadmium_lemon',1.2],['titanium_white',3],['naples_yellow',.7]]]];
function acol(A,t){return M(grad(A.kind==='red'?RG:GG,t));}
// ---- wall / table
function wallc(x,y){let g=Math.exp(-(Math.pow(x-450,2)/(2*280*280)+Math.pow(y-430,2)/(2*250*250)));
 const top=(1-sm(0,260,y))*(.2+.3*Math.min(1,Math.abs(x-400)/400));const right=sm(520,800,x)*.4;const left=(1-sm(0,200,x))*.1;
 const edge=top*.5+right+left;
 const band=sm(200,320,y)*(1-sm(560,640,y));
 const dk=Math.exp(-Math.pow(x-175,2)/(2*85*85))*band;   // darker behind the jug's lit side
 const lt=Math.exp(-Math.pow(x-440,2)/(2*75*75))*band;   // lighter behind its shadow side
 return M([['titanium_white',.75+g*2.0-edge*.5-dk*.5+lt*.7],['raw_umber',2.1-g*.8+edge*.8+dk*.8-lt*.4],['burnt_sienna',.4+g*.15],['ultramarine',.5+edge*.15],['yellow_ochre',g*.08],['alizarin_crimson',.04]]);}
function tabc(x,y){const g=Math.exp(-(Math.pow(x-330,2)/(2*330*330)+Math.pow(y-790,2)/(2*170*170)));const f=sm(HORIZON,760,y);const e=sm(560,900,x)*.5+sm(900,1000,y)*.6;
 return M([['burnt_umber',2.2-g*.5-f*.2+e*.8],['burnt_sienna',.5+g*.3],['ultramarine',.3-g*.1+e*.3],['titanium_white',.25+g*.8+f*.15],['yellow_ochre',.25+g*.45]]);}
// PASS 3: block-in of the objects, dark to light, over the dried background; kept wet and blended
function thmax(h,size){return Math.asin(Math.max(.25,1-size*.3/h))/D2R;}
// ---- JUG: broad strokes that follow the curve of the belly (long meridians that drift a little), four value planes
{
 const items=[];
 for(let th=-86;th<=86;){
  const hm=R(100,135);const sz=R(30,38);th+=sz*.62/hm/D2R;if(th>88)break;
  let y=R(250,262);
  while(y<750){const len=R(190,300);const y0=y,y1=Math.min(752,y+len);const last=y1>=750;y=y1-R(40,70);
   const ym=(y0+y1)/2;const drift=R(-14,14);
   const size=Math.max(14,Math.min(sz,jhw(ym)*.34));
   const tt=Math.max(-86,Math.min(86,th));
   items.push({pts:jvd(tt,drift,y0,y1,8,.8),size,l:jlev(tt,ym)});
   if(last)break;}
 }
 items.sort((u,v)=>u.l-v.l);
 for(const it of items){const dark=it.l<0;if(it.l>0)continue;
  S(it.pts,jcol(it.l+R(-.05,.05)),it.size,{brush:'filbert',load:dark?.9:1.1,thin:dark?.5:.3});}
// the lit plane: a few broad, loaded strokes following the curve, chosen colours, left to right
{
 const CR=()=>M([['titanium_white',5],['naples_yellow',.6],['yellow_ochre',.12],['burnt_umber',.1]]);
 const CRw=()=>M([['titanium_white',3.6],['naples_yellow',.6],['yellow_ochre',.2],['burnt_umber',.3]]);
 const CRb=()=>M([['titanium_white',7],['naples_yellow',.4]]);
 const LIM=()=>M([['titanium_white',3],['yellow_ochre',.25],['burnt_umber',.5],['ultramarine',.15]]);
 const TR=()=>M([['titanium_white',3],['naples_yellow',.3],['ultramarine',.2],['burnt_umber',.5]]);
 const HT=()=>M([['titanium_white',2.2],['ultramarine',.35],['alizarin_crimson',.12],['burnt_umber',.55]]);
 const bands=[[-80,LIM,22,3,.9],[-64,CRw,40,6,1.2],[-46,CR,46,6,1.3],[-28,CRb,44,6,1.3],[-30,CR,46,-5,1.3],[-10,CRw,46,5,1.3],[8,CRw,44,-6,1.2],[22,TR,42,5,1.2],[36,HT,38,-5,1.1]];
 for(const [th,col,sz,dr,ld] of bands){
  for(const [y0,y1,k] of [[258,580,.8],[420,752,1]]){
   S(jvd(th+R(-2,2),dr+R(-3,3),y0+R(-4,4),y1+R(-4,4),8,.8),col(),sz*k,{brush:'filbert',load:ld,thin:.2});}
  S(jvd(th,dr,430,640,6,.5),'titanium_white',sz*.5,{brush:'filbert',load:0});
 }
}
 const MD=()=>M([['burnt_umber',2],['ultramarine',1],['raw_umber',.6]]);
 S([[JC-46,248,.4],[JC,246,.8],[JC+46,248,.4]],MD(),14,{brush:'flat',load:1,thin:.4});
 S([[JC-42,255,.4],[JC,258,.8],[JC+42,255,.4]],MD(),12,{brush:'flat',load:1,thin:.4});
}
// handle: cubic bezier on the right of the neck
function hpt(t,off=0){const P=[[JC+44,346],[JC+135,300],[JC+205,410],[JC+112,490]];
 const u=1-t;const x=u*u*u*P[0][0]+3*u*u*t*P[1][0]+3*u*t*t*P[2][0]+t*t*t*P[3][0];
 const y=u*u*u*P[0][1]+3*u*u*t*P[1][1]+3*u*t*t*P[2][1]+t*t*t*P[3][1];
 const dx=3*u*u*(P[1][0]-P[0][0])+6*u*t*(P[2][0]-P[1][0])+3*t*t*(P[3][0]-P[2][0]);
 const dy=3*u*u*(P[1][1]-P[0][1])+6*u*t*(P[2][1]-P[1][1])+3*t*t*(P[3][1]-P[2][1]);
 const m=Math.hypot(dx,dy);return [x+off*(dy/m),y-off*(dx/m)];}
for(let t0=0;t0<.95;t0+=.17){const pts=[];for(let q=0;q<=4;q++){const t=t0+.22*q/4;if(t>1)break;const P=hpt(t,0);pts.push([P[0],P[1],.5+.4*Math.sin(Math.PI*(q+.5)/5)]);}
 S(pts,jcol(-.2+R(-.1,.1)),R(22,27),{brush:'round',load:1,thin:.35});}
for(let t0=.02;t0<.9;t0+=.2){const pts=[];for(let q=0;q<=3;q++){const t=t0+.2*q/3;const P=hpt(t,-7);pts.push([P[0],P[1],.5+.4*Math.sin(Math.PI*(q+.5)/4)]);}
 S(pts,jcol(.3+R(-.1,.1)),11,{brush:'round',load:1.1,thin:.3});}
for(let t0=.05;t0<.9;t0+=.22){const pts=[];for(let q=0;q<=3;q++){const t=t0+.2*q/3;const P=hpt(t,8);pts.push([P[0],P[1],.5+.4*Math.sin(Math.PI*(q+.5)/4)]);}
 S(pts,jcol(-.55+R(-.1,.1)),9,{brush:'round',load:.9,thin:.45});}
// ---- APPLES: meridian strokes banded by value zone
for(const A of AP){
 const items=[];
 for(let lon=-88;lon<=88;){
  const size0=A.r*.27;lon+=size0*.75/A.r/D2R*1.0*R(.85,1.15);if(lon>90)break;
  let lat=-82;
  while(lat<82){const len=R(100,150);const l0=lat,l1=Math.min(84,lat+len);const last=l1>=84;lat=l1-R(20,35);
   const m=smd(A,lon,R(-12,12),l0,l1,6,.8);if(m.ok)items.push({m,size:size0*R(.9,1.1)*(Math.cos((l0+l1)/2*D2R)*.5+.55)});if(last)break;}
 }
 items.sort((u,v)=>u.m.t-v.m.t);
 for(const it of items){const t=it.m.t+R(-.05,.05);const dark=t<0;
  S(it.m.pts,acol(A,alev(t)+R(-.04,.04)),it.size,{brush:'filbert',load:dark?.9:1.1,thin:dark?.5:.3});}
}
