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
// PASS 7: dry now. Glazes to deepen the shadows, warm the lights, ground the objects; scumbles for surface life.
p.dry();
const UM=()=>M([['burnt_umber',1.6],['ultramarine',1],['alizarin_crimson',.25]]);
// jug: core shadow deepened with two broad curved glazes
for(const [th,op,sz] of [[56,.28,30],[70,.3,26]]){
 const pts=[];for(let y=300;y<=735;y+=40){const P=jp(th+R(-2,2),y);pts.push([P[0],P[1],.5+.4*Math.sin(Math.PI*(y-300)/435)]);}
 S(pts,UM(),sz,{brush:'filbert',load:.6,thin:.9,opacity:op});}
// apples: core shadow glaze following the meridians
for(const A of AP){const red=A.kind==='red';
 for(const [lon,op] of [[52,.3],[68,.32]]){const m=smer(A,lon+R(-3,3),-72,82,8,.4);if(m.ok)S(m.pts,red?M([['alizarin_crimson',1.4],['burnt_umber',1.2],['ultramarine',.6]]):M([['burnt_umber',1.5],['sap_green',1],['alizarin_crimson',.3]]),A.r*.24,{brush:'filbert',load:.6,thin:.9,opacity:op});}
 if(red){for(const [lon,dr,la,lb] of [[-45,18,-35,62],[-18,-14,-48,70],[8,12,-20,55]]){const m=smd(A,lon+R(-4,4),dr,la,lb,8,.5);if(m.ok)S(m.pts,M([['cadmium_orange',1],['cadmium_red',.9],['naples_yellow',.45]]),A.r*R(.11,.14),{brush:'filbert',load:.45,thin:.85,opacity:.2});}
  const rl=smer(A,78,-60,10,6,.4);if(rl.ok)S(rl.pts,M([['burnt_sienna',1],['cadmium_orange',.6],['titanium_white',.3]]),A.r*.11,{brush:'filbert',load:.6,thin:.6,opacity:.4});}
 else{for(const [lon,dr,la,lb] of [[-40,16,-30,58],[-8,-12,-40,60]]){const m=smd(A,lon+R(-4,4),dr,la,lb,8,.5);if(m.ok)S(m.pts,M([['cadmium_lemon',1],['naples_yellow',.6],['sap_green',.2]]),A.r*R(.1,.14),{brush:'filbert',load:.45,thin:.85,opacity:.2});}}
}
// table: deepen the cast shadows near their objects, then light pool and fall-off
const SD=()=>M([['burnt_umber',2],['ultramarine',1.1],['alizarin_crimson',.15]]);
S([[300,752,.3],[360,750,.8],[410,748,.8],[450,744,.3]],SD(),30,{brush:'filbert',load:.7,thin:.7,opacity:.45});
S([[320,772,.3],[400,770,.8],[470,768,.6],[520,764,.3]],SD(),20,{brush:'filbert',load:.7,thin:.7,opacity:.4});
S([[560,826,.3],[630,832,.8],[710,828,.3]],SD(),22,{brush:'filbert',load:.7,thin:.7,opacity:.45});
S([[425,934,.3],[490,940,.8],[560,940,.3]],SD(),18,{brush:'filbert',load:.7,thin:.7,opacity:.45});
for(let y=800;y<=930;y+=R(30,45)){const x0=R(-80,-20);S([[x0,y,.3],[x0+160,y+R(-8,8),.8],[x0+330,y+R(-8,8),.3]],M([['yellow_ochre',1],['titanium_white',.8],['burnt_sienna',.6]]),R(50,70),{brush:'filbert',load:.45,thin:.9,opacity:.25});}
for(let k=0;k<9;k++){const y=R(895,1005);const x0=R(250,340);S([[x0,y,.3],[x0+250,y+R(-6,6),.8],[x0+540,y+R(-6,6),.3]],M([['yellow_ochre',1.2],['titanium_white',1.3],['burnt_sienna',.5]]),R(60,90),{brush:'filbert',load:.45,thin:.9,opacity:.17});}
// soft reflections in the polished top: red apple, green apple and the jug's base, fading downward
S([[565,828,.3],[562,858,.8],[566,890,.3]],M([['alizarin_crimson',1],['burnt_umber',1],['cadmium_red',.5]]),52,{brush:'filbert',load:.5,thin:.9,opacity:.22});
S([[430,936,.3],[430,960,.8],[432,984,.3]],M([['sap_green',1],['burnt_umber',1],['yellow_ochre',.6]]),36,{brush:'filbert',load:.5,thin:.9,opacity:.26});
S([[270,766,.3],[272,790,.8],[274,812,.3]],M([['titanium_white',1.6],['burnt_umber',1],['ultramarine',.3]]),70,{brush:'filbert',load:.5,thin:.9,opacity:.22});
// far ends of the cast shadows fade softly away from the light
S([[560,746,.3],[640,748,.7],[720,752,.3]],SD(),30,{brush:'filbert',load:.5,thin:.9,opacity:.15});
S([[700,828,.3],[760,830,.7],[800,832,.3]],SD(),26,{brush:'filbert',load:.5,thin:.9,opacity:.14});
for(let y=640;y<=1000;y+=R(40,60)){S([[560,y,.3],[680,y+R(-8,8),.8],[820,y+R(-8,8),.3]],M([['burnt_umber',2],['ultramarine',.5]]),R(50,70),{brush:'filbert',load:.4,thin:.9,opacity:.16});}
// surface life on the table only: a few broad dry scumbles
for(let i=0;i<18;i++){const x=R(-50,700),y=R(650,1000);const L=R(200,360);if(Math.hypot(x+L/2-290,y-750)<260||Math.hypot(x+L/2-565,y-735)<190||Math.hypot(x+L/2-430,y-870)<170)continue;
 S([[x,y,.3],[x+L*.5,y+R(-4,4),.7],[x+L,y+R(-8,8),.3]],tabc(x+L/2,y),R(40,70),{brush:'filbert',load:.3,thin:.5,opacity:.3});}
