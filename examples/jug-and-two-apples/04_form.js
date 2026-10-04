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
// PASS 4: turn the form. Soften the transitions between planes wet-into-wet, only across the boundaries.
// jug: drag across each plane boundary, following the curve of the form
for(let y=290;y<=748;y+=R(14,22)){
 const h=jhw(y);const sz=Math.max(14,Math.min(34,h*.26));let prev=jlev(-86,y);
 for(let th=-84;th<=86;th+=2){const l=jlev(th,y);
  if(l!==prev&&th>8&&th<70&&p.random()<.9){const w=R(14,24);
   S(jarc(th-w,th+w,y+R(-4,4),4,.5),'titanium_white',sz,{brush:'filbert',load:0});}
  prev=l;}
}
// a few long curved drags over the lit strokes so they melt without losing their direction
for(const y of [330,420,520,600,690]){S(jarc(-52,18,y,6,.6),'titanium_white',R(22,28),{brush:'filbert',load:0});}
// soften the horizontal seam low on the jug with a few vertical drags
for(let th=-72;th<=50;th+=R(10,15)){S(jvd(th,R(-8,8),620+R(-10,10),736,6,.6),'titanium_white',R(20,28),{brush:'filbert',load:0});}
// apples
for(const A of AP){
 for(let lat=-62;lat<=78;lat+=R(10,16)){let prev=alev(sph(A,-86,lat).t);
  for(let lon=-84;lon<=86;lon+=3){const s=sph(A,lon,lat);if(!s.vis)continue;const q=alev(s.t);
   if(q!==prev&&p.random()<.85){const w=R(14,22);const m=sarc(A,lon-w,lon+w,lat+R(-2,2),4,.4);
    if(m.ok)S(m.pts,'titanium_white',A.r*.3,{brush:'filbert',load:0});}
   prev=q;}}
}
