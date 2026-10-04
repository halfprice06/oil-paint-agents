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
// PASS 2: block-in of wall, table and cast shadows (wet into wet)
// WALL: an atmosphere. Large strokes at mixed angles (many diagonal), close values, then big blenders.
for(let pass=0;pass<2;pass++){
 const n=pass?120:90;
 for(let i=0;i<n;i++){
  const x=R(-220,800),y=R(-80,HORIZON+10);const ang=R(-.61,.61);const len=pass?R(160,300):R(240,420);
  const xm=x+len*.5*Math.cos(ang),ym=y+len*.5*Math.sin(ang);
  S([[x,y,.4],[xm,ym+R(-5,5),.9],[x+len*Math.cos(ang),y+len*Math.sin(ang),.4]],wallc(xm,ym),pass?R(60,100):R(90,130),{brush:'filbert',thin:pass?.6:.5,load:pass?.75:.95,opacity:pass?.8:1});
 }
}
for(let i=0;i<70;i++){const x=R(-120,780),y=R(-30,HORIZON-20),ang=R(-.6,.6),L=R(250,450);
 S([[x,y,.4],[x+L*.5*Math.cos(ang),y+L*.5*Math.sin(ang),.8],[x+L*Math.cos(ang),y+L*Math.sin(ang),.4]],'titanium_white',R(110,160),{brush:'filbert',load:0});}
for(let i=0;i<22;i++){const x=R(-300,-120),y=R(-60,HORIZON),ang=R(-.55,.55),len=R(420,600);
 S([[x,y,.4],[x+len*.5*Math.cos(ang),y+len*.5*Math.sin(ang),.9],[x+len*Math.cos(ang),y+len*Math.sin(ang),.5]],wallc(Math.max(170,x+len*.5*Math.cos(ang)),Math.max(60,y+len*.5*Math.sin(ang))),R(90,130),{brush:'filbert',thin:.6,load:.85,opacity:.9});}
for(let i=0;i<30;i++){const x=R(-200,300),y=R(-30,HORIZON-30),ang=R(-.6,.6),L=R(300,450);
 S([[x,y,.4],[x+L*.5*Math.cos(ang),y+L*.5*Math.sin(ang),.8],[x+L*Math.cos(ang),y+L*Math.sin(ang),.4]],'titanium_white',R(120,170),{brush:'filbert',load:0});}
// TABLE: fewer, bigger strokes following the plane
for(let pass=0;pass<2;pass++){
 for(let y=HORIZON+22;y<1040;y+=pass?64:80){
  for(let x=R(-300,-150);x<830;x+=R(220,320)){
   const len=R(380,600),yy=y+R(-12,12),tl=R(-.025,.025)+(x+len/2-400)*.00003*(y-HORIZON)/10;
   S([[x,yy,.4],[x+len*.5,yy+len*.5*tl+R(-3,3),.9],[x+len,yy+len*tl,.4]],tabc(x+len/2,yy),R(80,125),{brush:'filbert',thin:pass?.6:.45,load:pass?.75:.95,opacity:pass?.85:1});
  }
 }
}
// lit band near the front edge
for(let i=0;i<5;i++){const y=R(905,975),x=R(-80,60);S([[x,y,.4],[x+300,y+R(-8,8),.9],[x+620,y+R(-8,8),.4]],M([['burnt_umber',1.4],['burnt_sienna',.8],['yellow_ochre',.9],['titanium_white',.7]]),R(70,100),{brush:'filbert',thin:.6,load:.7,opacity:.55});}
// far edge of the table: soft wall-base shadow, then blended into the wall
S([[-20,HORIZON+4],[260,HORIZON],[540,HORIZON+2],[820,HORIZON-2]],M([['burnt_umber',3],['ultramarine',.8]]),24,{brush:'filbert',thin:.5,load:.8,opacity:.7});
for(let x=-20;x<830;x+=R(45,70)){S([[x,HORIZON-45,.4],[x+R(-10,10),HORIZON,.8],[x+R(-10,10),HORIZON+40,.4]],'titanium_white',R(50,70),{brush:'filbert',load:0});}
for(let i=0;i<14;i++){const x=R(-40,600),y=R(HORIZON+20,980),L=R(300,500);
 S([[x,y,.4],[x+L*.5,y+R(-20,20),.8],[x+L,y+R(-15,15),.4]],'titanium_white',R(90,130),{brush:'filbert',load:0});}
// CAST SHADOWS on the table: penumbra first (wide, faint), then deeper core, darkest at the contact
const SH=()=>M([['burnt_umber',2.4],['ultramarine',1],['alizarin_crimson',.12]]);
const SHs=(pts,size,o={})=>S(pts.map((q,i)=>[q[0],q[1],q[2]||(i==0?.35:i==pts.length-1?.3:.9)]),SH(),size,Object.assign({brush:'filbert',thin:.5,load:.95,opacity:.9},o));
// jug: penumbra
SHs([[270,752],[420,746],[580,744],[730,750]],74,{opacity:.28});
SHs([[290,748],[430,744],[600,744],[700,748]],58,{opacity:.3});
SHs([[300,724],[450,720],[600,730],[680,742]],34,{opacity:.3});
// jug: core
SHs([[290,752],[400,746],[520,744],[640,747]],44,{opacity:.6});
SHs([[310,772],[430,768],[550,762],[640,756]],28,{opacity:.6});
SHs([[310,732],[430,726],[540,730],[620,738]],24,{opacity:.55});
SHs([[260,762],[330,768],[430,768]],30,{thin:.35,load:1,opacity:.9});
SHs([[285,754],[380,750],[480,748]],26,{thin:.35,load:1,opacity:.85});
// apples
SHs([[540,826],[640,832],[740,830],[790,832]],62,{opacity:.28});
SHs([[555,824],[620,830],[700,826],[752,828]],38,{opacity:.6});
SHs([[565,826],[620,830],[670,828]],24,{thin:.35,load:1,opacity:.9});
SHs([[400,932],[500,940],[600,940],[670,942]],52,{opacity:.28});
SHs([[425,930],[500,938],[580,938],[630,940]],30,{opacity:.6});
SHs([[420,932],[480,938],[530,938]],22,{thin:.35,load:1,opacity:.9});
p.dry();
