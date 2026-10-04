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
// PASS 6: over dry paint. Repair halos, model the apples, handle, lights and accents.
function hpt(t,off=0){const P=[[JC+44,346],[JC+135,300],[JC+205,410],[JC+112,490]];
 const u=1-t;const x=u*u*u*P[0][0]+3*u*u*t*P[1][0]+3*u*t*t*P[2][0]+t*t*t*P[3][0];
 const y=u*u*u*P[0][1]+3*u*u*t*P[1][1]+3*u*t*t*P[2][1]+t*t*t*P[3][1];
 const dx=3*u*u*(P[1][0]-P[0][0])+6*u*t*(P[2][0]-P[1][0])+3*t*t*(P[3][0]-P[2][0]);
 const dy=3*u*u*(P[1][1]-P[0][1])+6*u*t*(P[2][1]-P[1][1])+3*t*t*(P[3][1]-P[2][1]);
 const m=Math.hypot(dx,dy);return [x+off*(dy/m),y-off*(dx/m)];}
const hpath=(a,b,off,n=10)=>{const pts=[];for(let q=0;q<=n;q++){const t=a+(b-a)*q/n;const P=hpt(t,off);pts.push([P[0],P[1],.4+.55*Math.sin(Math.PI*(q+.5)/(n+1))]);}return pts;};
// ---- handle, repainted in long continuous strokes
S(hpath(0,1,0,14),jcol(-.15),23,{brush:'round',load:1.1,thin:.3});
S(hpath(.0,.55,-6.5,10),jcol(.3),10,{brush:'round',load:1.2,thin:.25});
S(hpath(.45,.95,-6,8),jcol(.05),9,{brush:'round',load:1.1,thin:.3});
S(hpath(.1,.98,7.5,12),jcol(-.5),8,{brush:'round',load:1,thin:.4});
S(hpath(.15,.5,-8,6),jcol(.8),4.5,{brush:'round',load:1.3,thin:.2});
// join of handle to neck and to shoulder: a shadow beneath
S([[JC+40,356],[JC+62,358],[JC+84,350]],jcol(-.6),9,{brush:'round',load:1,thin:.4});
// ---- JUG: one crisp, thick highlight on the shoulder
S([[jp(-52,408)[0],408,.3],[jp(-50,440)[0],440,.9],[jp(-47,480)[0],484,.9],[jp(-44,512)[0],516,.3]],M([['titanium_white',7],['naples_yellow',.15]]),16,{brush:'filbert',load:1.6,thin:.08});
// dark accent under the lip, and the contact with the table
S([[JC-52,266,.4],[JC,274,.8],[JC+52,266,.4]],M([['burnt_umber',1.5],['ultramarine',1]]),7,{brush:'round',load:.9,thin:.5,opacity:.6});
// ---- APPLES
const APD=()=>M([['alizarin_crimson',1.2],['burnt_umber',1.4],['ultramarine',.6]]);
for(const A of AP){
 const red=A.kind==='red';const base=acol(A,-.55);
 // reflected light on the limb from the table
 const rl=smer(A,80,-55,25,6,.5);if(rl.ok)S(rl.pts,red?M([['burnt_sienna',1],['cadmium_red',1],['titanium_white',.4]]):M([['yellow_ochre',1],['sap_green',.6],['titanium_white',.4]]),A.r*.12,{brush:'filbert',load:.9,thin:.4,opacity:.6});
 // lights, thick, following the form
 for(let lat=5;lat<=62;lat+=R(10,16)){const m=sarc(A,-62+R(-6,6),-8+R(-8,8),lat,5,.6);if(m.ok)S(m.pts,acol(A,.85+R(-.05,.1)),A.r*.19,{brush:'filbert',load:1.3,thin:.2});}
 // highlight (soft window reflection) 
 const hs=sph(A,-38,42);
 S([[hs.x-5,hs.y+3,.4],[hs.x,hs.y,.9],[hs.x+9,hs.y-3,.4]],M([['titanium_white',4],['cerulean',.08],['naples_yellow',.1]]),A.r*.13,{brush:'round',load:1.5,thin:.1});
 // dimple and stem
 const top=sph(A,0,80);
 S([[top.x-24,top.y+2,.3],[top.x-6,top.y+7,.8],[top.x+22,top.y+1,.3]],red?APD():M([['burnt_umber',2],['sap_green',1]]),A.r*.16,{brush:'filbert',load:1,thin:.5,opacity:.8});
 S([[top.x-1,top.y+6,.6],[top.x+2,top.y-8,.8],[top.x+8,top.y-18,.4]],M([['burnt_umber',2],['raw_umber',1],['yellow_ochre',.3]]),5,{brush:'round',load:1,thin:.3});
 // contact: dark crescent where the apple touches the table
 const cp=[];for(let q=0;q<=7;q++){const l=-30+q*(120/7);const s=sph(A,l-10,-72);cp.push([s.x,s.y+3,.4+.5*Math.sin(Math.PI*(q+.5)/8)]);}
 S(cp,M([['burnt_umber',2],['ultramarine',1],['alizarin_crimson',.2]]),A.r*.17,{brush:'filbert',load:1,thin:.4,opacity:.85});
}
