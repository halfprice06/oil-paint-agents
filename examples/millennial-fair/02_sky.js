const R=(a,b)=>p.rand(a,b);
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.8,1.2)]);
const pr=(i,n)=>{const f=i/(n-1);return .35+.65*Math.sin(Math.PI*Math.min(1,Math.max(0,f*.9+.05)));};
function seg(x,y,len,ang,bend,n){n=n||4;const pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;const b=bend*(t*t-.08);pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*b,y+Math.sin(ang)*len*t+Math.cos(ang)*b,pr(i,n)]);}return pts;}
const F=(pts,c,size,o)=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size:size,load:1,thin:.5},o||{}));
const S=(x,y,len,ang,c,size,o)=>{o=o||{};const b=o.bend===undefined?R(-5,5):o.bend;const n=o.n||4;delete o.bend;delete o.n;return F(seg(x,y,len,ang,b,n),c,size,o);};
const BL=(pts,size,brush)=>p.stroke({points:pts,brush:brush||'filbert',size:size,load:0,color:'titanium_white'});
// polyline through points -> multi-point stroke with pressure
const PL=(pts,c,size,o)=>F(pts.map((q,i)=>[q[0],q[1],q[2]===undefined?pr(i,pts.length):q[2]]),c,size,o);
const area=poly=>{let a=0;for(let i=0;i<poly.length;i++){const q=poly[i],r=poly[(i+1)%poly.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
const inPoly=(poly,x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
function cover(poly,size,col,o){o=o||{};const dens=o.dens||1,lenf=o.len||2.5;const n=Math.max(1,Math.round(area(poly)*dens*1.5/(size*size*lenf*.7)));
 const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 let k=0,g=0;while(k<n&&g++<n*40){const x=R(x0,x1),y=R(y0,y1);if(!inPoly(poly,x,y))continue;k++;
  const a=(o.ang||0)+R(-1,1)*(o.angJ===undefined?.3:o.angJ);const sz=size*R(.75,1.25);
  const oo=Object.assign({brush:'flat'},o.o||{});if(o.brush)oo.brush=o.brush;
  let L=sz*lenf*R(.7,1.3);const ok=()=>inPoly(poly,x+Math.cos(a)*L/2,y+Math.sin(a)*L/2)&&inPoly(poly,x-Math.cos(a)*L/2,y-Math.sin(a)*L/2);while(L>sz*.5&&!ok())L*=.85;
  F(seg(x,y,L,a,R(-4,4)*size/20),col(x,y),sz,oo);}
 return n;}
const ELL=(cx,cy,rx,ry,rot,n)=>{n=n||20;rot=rot||0;const pts=[];for(let i=0;i<n;i++){const a=i/n*6.2832;const x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return pts;};
const lerp=(a,b,t)=>a+(b-a)*t;
// wobbling line from a to b
function WL(x0,y0,x1,y1,c,size,o){const n=4,pts=[];for(let i=0;i<n;i++){const t=i/(n-1);pts.push([lerp(x0,x1,t)+R(-1.2,1.2),lerp(y0,y1,t)+R(-1.2,1.2),.5+.4*Math.sin(Math.PI*t)]);}return F(pts,c,size,o);}
// tapered limb/tube painted as light / mid / shade strips along its length (light from the left)
function tube(p0,p1,w0,w1,cols,o){o=o||{};const dx=p1[0]-p0[0],dy=p1[1]-p0[1];const L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L;let nx=-uy,ny=ux;if(nx>0){nx=-nx;ny=-ny;}
  const ang=Math.atan2(dy,dx);const n=Math.max(2,Math.round(L/((o.step||9)*1.8)));
  for(let i=0;i<n;i++){const t=(i+.5)/n;const w=lerp(w0,w1,t);const cx=lerp(p0[0],p1[0],t),cy=lerp(p0[1],p1[1],t);const seglen=L/n*1.8;
    const strips=[[-.27,cols.lit,.42,.95],[0,cols.mid,.5,1],[.3,cols.shade,.38,.9]];
    for(const [off,cf,wf,ld] of strips){S(cx+nx*w*off+R(-.4,.4),cy+ny*w*off+R(-.4,.4),seglen*R(.9,1.3),ang+R(-.04,.04),cf(),Math.max(1.5,w*wf*R(.85,1.15)),Object.assign({brush:'filbert',load:ld,thin:.45,bend:R(-1,1)},o.o||{}));}
  }
  if(!o.noblend&&Math.max(w0,w1)>7){for(let k=0;k<3;k++){const off=(k==1?.12:k==2?0:-.1)*Math.max(w0,w1);BL([[p0[0]+nx*off,p0[1]+ny*off,.7],[lerp(p0[0],p1[0],.5)+nx*off,lerp(p0[1],p1[1],.5)+ny*off,.8],[p1[0]+nx*off,p1[1]+ny*off,.5]],Math.max(3,Math.max(w0,w1)*.42));}}
  if(cols.rim){for(let i=0;i<Math.max(2,Math.round(L/22));i++){const t=R(.1,.9);const w=lerp(w0,w1,t);S(lerp(p0[0],p1[0],t)-nx*w*.36,lerp(p0[1],p1[1],t)-ny*w*.36,R(8,16),ang,cols.rim(),Math.max(1.4,w*.13),{brush:'filbert',load:1.1,thin:.4,opacity:R(.6,.95),bend:0});}}
}
// SKY: gradient broken colour, cumulus clouds, balloons
const sky=(x,y)=>{const t=Math.min(1,y/340);return M([['cerulean',1-t*.75],['ultramarine',.45*(1-t)],['titanium_white',.5+t*2.6],['naples_yellow',t*t*1.1],['quinacridone_rose',t*t*.16+.02],['cobalt_violet',.12*(1-t)]]);};
cover([[-20,-20],[1220,-20],[1220,350],[-20,350]],34,sky,{ang:-.12,angJ:.35,dens:1.1,len:2.8,o:{load:.85,thin:.55}});
// broken-colour accents across sky (before clouds)
for(let i=0;i<420;i++){const x=R(0,1200),y=R(0,330),t=y/340;
  const k=R(0,1);let c;
  if(k<.68)c=sky(x,y);
  else if(k<.84)c=M([['titanium_white',2.2],['cerulean',.6],['naples_yellow',.3*t]]);
  else if(k<.96)c=M([['cerulean',1],['cobalt_blue',.3],['titanium_white',1+t*2]]);
  else c=M([['quinacridone_rose',.2],['titanium_white',2.4],['naples_yellow',.5]]);
  S(x,y,R(35,90),R(-.3,.12),c,R(9,18),{load:R(.5,.9),thin:.6,opacity:R(.5,.9),brush:'flat'});}
// clouds
function cloud(cx,cy,w,h,sz,tint){
  const np=Math.round(w/65)+3;const puffs=[];
  for(let i=0;i<np;i++){const f=(i+.5)/np;const px=cx+(f-.5)*w*.9+R(-12,12);const bump=Math.sin(f*3.14);const rr=h*(.32+.3*bump)*R(.8,1.15);const py=cy-bump*h*.2+R(-h*.1,h*.12);puffs.push([px,py,rr*1.5,rr]);}
  puffs.sort((a,b)=>b[1]-a[1]);
  for(const [px,py,rx,ry] of puffs){
    const poly=ELL(px,py,rx,ry,R(-.15,.15),16);
    cover(poly,sz,(x,y)=>{const ny=(y-py)/ry,nx=(x-px)/rx;let L=.55-.55*ny-.25*nx;L=Math.max(0,Math.min(1,L+R(-.12,.12)));
      return M([['titanium_white',.6+3*L],['naples_yellow',.12+.5*L*L],['cadmium_orange',.02*L],['cobalt_violet',.3*(1-L)*tint],['cerulean',.4*(1-L)],['quinacridone_rose',.16*(1-L)+.04*L],['yellow_ochre',.05]]);},
      {ang:R(-.35,.15),angJ:.5,dens:1.4,len:2.2,brush:'filbert',o:{load:.9,thin:.45}});
    for(let h=0;h<3;h++){const a0=R(3.5,4.6),n=5,pts=[];for(let i=0;i<n;i++){const a=a0+i*.22;pts.push([px+Math.cos(a)*rx*.8,py+Math.sin(a)*ry*.72,.5+.5*Math.sin(Math.PI*i/(n-1))]);}
      F(pts,M([['titanium_white',3.5],['naples_yellow',.25],['cerulean',.05]]),R(8,13),{load:1.2,thin:.35,brush:'filbert',opacity:R(.65,1)});}
  }
}
cloud(470,62,420,96,22,1);cloud(900,74,300,80,20,1);cloud(70,64,240,78,18,1);
cloud(700,205,340,66,18,1.3);cloud(340,225,280,56,16,1.3);cloud(1010,250,260,50,16,1.2);
cloud(150,305,260,40,14,1.4);cloud(580,298,220,36,14,1.4);cloud(230,150,170,42,14,1);cloud(790,22,220,40,14,1);
// soft edges: blender along cloud margins
for(let i=0;i<90;i++){const x=R(0,1200),y=R(10,300);BL(seg(x,y,R(50,110),R(-.4,.3),R(-8,8),4),R(14,24));}
// BALLOONS drifting up from the fair
const balloons=[[420,120,15,'r'],[458,88,12,'y'],[503,152,14,'b'],[545,104,12,'g'],[588,174,15,'p'],[632,66,12,'o'],[668,136,14,'w'],[382,190,12,'t'],[724,92,14,'r'],[692,216,11,'y'],[300,98,11,'v'],[564,226,12,'r'],[790,150,10,'b']];
const bc={r:[['cadmium_red',1],['alizarin_crimson',.15],['titanium_white',.1]],y:[['cadmium_yellow',1],['titanium_white',.3],['cadmium_orange',.1]],b:[['cobalt_blue',1],['ultramarine',.3],['titanium_white',.2]],g:[['viridian',.5],['sap_green',.5],['titanium_white',.4]],p:[['quinacridone_rose',.8],['titanium_white',.8]],o:[['cadmium_orange',1],['cadmium_red',.2],['titanium_white',.1]],w:[['titanium_white',2],['naples_yellow',.3],['cerulean',.1]],t:[['cerulean',.8],['viridian',.3],['titanium_white',.3]],v:[['cobalt_violet',.8],['ultramarine',.3],['titanium_white',.5]]};
for(const [bx,by,r,k] of balloons){
  const base=bc[k];
  // string first
  const sw=R(-6,6);F([[bx,by+r*1.15,.6],[bx+sw,by+r*1.15+14,.5],[bx-sw*.5,by+r*1.15+30,.4],[bx+sw*.8,by+r*1.15+48,.25]],M([['burnt_umber',1],['ultramarine',.5],['titanium_white',.5]]),1.6,{brush:'round',load:.6,thin:.7});
  // body: shadow side, body, light
  F(seg(bx+r*.25,by+r*.15,r*1.5,1.57+R(-.2,.2),r*.3,4),M(base.concat([['burnt_umber',.15],['ultramarine',.12]])),r*1.5,{brush:'filbert',load:1,thin:.4});
  F(seg(bx-r*.2,by-r*.1,r*1.5,1.57+R(-.2,.2),r*.2,4),M(base),r*1.25,{brush:'filbert',load:1,thin:.4});
  F(seg(bx-r*.35,by-r*.35,r*.8,.9,0,3),M([['titanium_white',2],['naples_yellow',.2]].concat(base.slice(0,1).map(a=>[a[0],a[1]*.25]))),r*.5,{brush:'round',load:1.1,thin:.35});
  p.dab({x:bx-r*.4,y:by-r*.45,size:r*.28,color:'titanium_white',brush:'round',load:1.3});
  // knot
  F([[bx-2,by+r*1.12],[bx,by+r*1.3],[bx+2,by+r*1.12]],M(base.concat([['burnt_umber',.3]])),3.5,{brush:'round',load:.9});
  // reflected cool light underside
  S(bx+r*.2,by+r*.85,r*.8,0,M([['cerulean',.6],['titanium_white',1]]),r*.35,{brush:'round',load:.6,opacity:.6});
}
p.dry();
