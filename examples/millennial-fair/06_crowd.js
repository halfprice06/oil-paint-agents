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
// CROWD: Renoir-ish fairgoers, painter's-algorithm back to front
const nz=(x,y)=>Math.sin(x*.043+1.3)*Math.sin(y*.051+.4)+.6*Math.sin(x*.11+y*.07)+.4*Math.sin(x*.19-y*.13);
const sd=(x,y)=>{let b=0;if(x>640&&y>600)b+=.32;if(x>330&&x<650&&y>560)b-=.3;
  if(inPoly([[110,448],[300,448],[580,480],[430,496],[100,474]],x,y))b+=.7;
  if(inPoly([[470,440],[610,446],[700,500],[520,474]],x,y))b+=.5;
  const n=nz(x*.8+50,y*1.6)*.4;return Math.max(0,Math.min(1,.42+b+n));};
const deepC=()=>M([['ultramarine',.4],['cobalt_violet',.4],['burnt_sienna',.3],['burnt_umber',.15],['titanium_white',.8]]);
const garb=[[['ultramarine',.5],['titanium_white',.9],['cobalt_blue',.3]],[['vermilion',.7],['titanium_white',.45],['alizarin_crimson',.1]],[['titanium_white',2],['naples_yellow',.3],['cerulean',.1]],[['yellow_ochre',.7],['naples_yellow',.5],['titanium_white',.6]],[['viridian',.4],['sap_green',.3],['titanium_white',1]],[['quinacridone_rose',.6],['titanium_white',1.1]],[['cobalt_violet',.7],['titanium_white',.9],['ultramarine',.2]],[['burnt_umber',.8],['ultramarine',.3],['titanium_white',.3]],[['cerulean',.6],['titanium_white',1],['viridian',.15]],[['burnt_sienna',.7],['yellow_ochre',.3],['titanium_white',.4]],[['paynes_grey',.5],['titanium_white',.6],['cobalt_violet',.2]],[['cadmium_orange',.4],['titanium_white',.7],['yellow_ochre',.3]]];
const gm=(base,lit,side)=>side===0?M(base.concat([['titanium_white',.3*lit],['naples_yellow',.12*lit],['raw_umber',.18]])):M(base.concat([['cobalt_violet',.4],['ultramarine',.15],['burnt_umber',.14]]));
const skinC=lit=>M([['flesh_tint',1],['titanium_white',.4*lit],['cadmium_orange',.12],['burnt_sienna',.12*(1-lit)],['cobalt_violet',.08*(1-lit)]]);
const hairC=()=>{const k=R(0,1);return k<.3?M([['burnt_umber',1],['ultramarine',.25],['titanium_white',.25]]):k<.6?M([['burnt_sienna',.8],['burnt_umber',.4],['titanium_white',.2]]):k<.8?M([['yellow_ochre',.8],['naples_yellow',.5],['raw_sienna',.3]]):M([['burnt_umber',.7],['ultramarine',.35],['titanium_white',.3]]);};
const strawC=()=>M([['naples_yellow',.8],['yellow_ochre',.5],['titanium_white',.8]]);
function person(x,y,h,o){o=o||{};const lit=o.lit===undefined?1-sd(x,y):o.lit;const skirt=o.skirt===undefined?R(0,1)<.5:o.skirt;
  const pa=garb[o.pal===undefined?Math.floor(R(0,garb.length)):o.pal],pb=garb[o.pal2===undefined?Math.floor(R(0,garb.length)):o.pal2];
  const tilt=R(-.12,.12);const sm=h<46;const wf=o.wf||R(.8,1.3);
  S(x+.3*h,y+.012*h,.55*h,R(-.04,.1),deepC(),Math.max(3,.1*h),{brush:'flat',opacity:.55,load:.8,thin:.5});
  if(skirt){S(x-.03*h,y-.27*h,.56*h,1.57+tilt,gm(pb,lit,0),.3*h*wf,{brush:'filbert',load:1,thin:.45});if(!sm)S(x+.1*h,y-.25*h,.5*h,1.57,gm(pb,lit,1),.15*h,{brush:'filbert',load:1,thin:.45,opacity:.85});}
  else{const tc=[garb[7],garb[10],garb[9],garb[7]][Math.floor(R(0,4))];S(x-.05*h,y-.24*h,.48*h,1.57+tilt,gm(tc,lit,0),Math.max(3,.1*h),{brush:'flat',load:1,thin:.45});S(x+.05*h,y-.24*h,.48*h,1.57-tilt,gm(tc,lit,1),Math.max(3,.1*h),{brush:'flat',load:1,thin:.45});}
  S(x+tilt*h,y-.64*h,.32*h,1.57+tilt,gm(pa,lit,0),.2*h*wf,{brush:'filbert',load:1,thin:.45});
  if(!sm){S(x+.06*h+tilt*h,y-.64*h,.28*h,1.57,gm(pa,lit,1),.09*h,{brush:'filbert',load:1,thin:.45,opacity:.9});
    if(h>70){S(x-.1*h,y-.55*h,.25*h,1.57+R(-.15,.15),gm(pa,lit,0),.06*h,{brush:'filbert',load:1,thin:.45});S(x+.11*h,y-.55*h,.25*h,1.57+R(-.15,.15),gm(pa,lit,1),.06*h,{brush:'filbert',load:1,thin:.45});}
    S(x-.07*h+tilt*h,y-.72*h,.14*h,1.57,M([['titanium_white',2],['naples_yellow',.4]]),Math.max(2,.035*h),{brush:'flat',load:1.1,thin:.4,opacity:.7*lit+.2});}
  if(h>=70){ // shoulders, neck, arms with hands, skirt folds
    S(x+tilt*h,y-.745*h,.27*h,R(-.08,.08),gm(pa,lit,0),.075*h,{brush:'filbert',load:1,thin:.45});
    S(x+tilt*h*1.3,y-.80*h,.05*h,1.57,skinC(lit*.8),.05*h,{brush:'round',load:1,thin:.4});
    for(const sg of [-1,1]){const ax=x+sg*.13*h,ay=y-.69*h;F([[ax,ay,.8],[ax+sg*R(.01,.05)*h,ay+.14*h,.8],[ax+sg*R(0,.06)*h,ay+.27*h,.5]],gm(pa,lit,sg<0?0:1),.055*h,{brush:'filbert',load:1,thin:.45});
      p.dab({x:ax+sg*.04*h,y:ay+.29*h,size:.045*h,color:skinC(lit),brush:'round',load:1,pressure:.8});}
    if(skirt)for(let f=0;f<3;f++){const fx=x+R(-.12,.12)*h;S(fx,y-.2*h,.36*h,1.57+R(-.08,.08),gm(pb,lit*R(.5,1),f==2?1:0),.06*h,{brush:'filbert',load:1,thin:.45,opacity:.85});}}
  if(!sm&&R(0,1)<(o.point===undefined?.13:o.point)){const sg=x<885?1:-1;F([[x+sg*.12*h,y-.72*h,.8],[x+sg*.22*h,y-.92*h,.8],[x+sg*.27*h,y-1.07*h,.5]],gm(pa,lit,0),.06*h,{brush:'filbert',load:1,thin:.45});p.dab({x:x+sg*.28*h,y:y-1.1*h,size:.05*h,color:skinC(lit),brush:'round',load:1,pressure:.8});}
  const hx=x+tilt*h*1.5,hy=y-.88*h;
  const back=o.back===undefined?R(0,1)<.6:o.back;
  p.dab({x:hx,y:hy,size:Math.max(3,(h>=70?.14:.12)*h),color:back?hairC():skinC(lit),brush:'round',load:1.05,pressure:.9});
  if(!back&&h>60){p.dab({x:hx-.01*h,y:hy-.02*h,size:.09*h,color:hairC(),brush:'round',load:1,pressure:.8});}
  if(o.hat!==false&&R(0,1)<(o.hat||.42)){const kk=R(0,1);const dark=kk<.2,white=kk>=.2&&kk<.32,col=kk>=.32&&kk<.46;
    const hc=dark?M([['burnt_umber',.8],['ultramarine',.3],['titanium_white',.25]]):white?M([['titanium_white',2],['cerulean',.1]]):col?M(garb[Math.floor(R(0,6))]):strawC();
    S(hx,hy-.05*h,.22*h,R(-.12,.12),hc,Math.max(2.5,.055*h),{brush:'flat',load:1.1,thin:.4,bend:2});
    if(h>50)p.dab({x:hx-.02*h,y:hy-.075*h,size:.1*h,color:dark?M([['burnt_umber',.8],['ultramarine',.3]]):white?M([['titanium_white',2],['cobalt_violet',.15]]):col?M(garb[Math.floor(R(0,6))]):M([['naples_yellow',.8],['titanium_white',1.2]]),brush:'round',load:1.1,pressure:.9});}
  else if(back&&R(0,1)<.5)p.dab({x:hx-.02*h,y:hy-.03*h,size:Math.max(3,.1*h),color:hairC(),brush:'round',load:1,pressure:.8});
}
function parasol(x,y,h,col){const hx=x+.1*h,hy=y-1.0*h;
  F([[hx-.25*h,hy+.04*h,.5],[hx-.1*h,hy-.06*h,.9],[hx+.1*h,hy-.07*h,.9],[hx+.26*h,hy+.04*h,.5]],gm(col,.9,0),Math.max(4,.13*h),{brush:'filbert',load:1.1,thin:.4});
  F([[hx+.02*h,hy-.02*h,.8],[hx+.26*h,hy+.04*h,.5]],gm(col,.9,1),Math.max(3,.08*h),{brush:'filbert',load:1.1,thin:.4,opacity:.9});
  S(hx-.1*h,hy-.03*h,.2*h,.2,M([['titanium_white',2],['naples_yellow',.3]]),Math.max(2,.03*h),{brush:'flat',load:1.2,thin:.4,opacity:.8});}
// Poisson-ish placement
const placed=[];const ok=(x,y,h)=>{for(const q of placed){if(Math.hypot((x-q[0])*1.0,(y-q[1])*1.6)<Math.min(h,q[2])*.34)return false;}return true;};
const list=[];
function scatter(n,x0,x1,y0,y1,hf,opt){let k=0,g=0;while(k<n&&g++<n*40){const x=R(x0,x1),y=R(y0,y1);const h=hf(y)*R(.8,1.25);if(opt&&opt.avoid&&opt.avoid(x,y))continue;if(!ok(x,y,h))continue;placed.push([x,y,h]);list.push([x,y,h,opt||{}]);k++;}}
const hL=y=>.30*(y-300)+8;
// far small ones near tent bases and stage-left
scatter(16,330,600,408,446,y=>26+(y-404)*.55,{});
scatter(12,560,640,424,470,y=>34+(y-420)*.4,{});
// main left/mid back crowd
scatter(88,-10,330,448,562,hL,{});
scatter(40,330,430,452,520,hL,{avoid:(x,y)=>x>340&&x<420&&y>500});
scatter(34,430,640,470,566,hL,{});
// lane wanderers (mid-ground), sparse
list.push([528,648,112,{pal:2,pal2:0,back:true,skirt:true,hat:.95,lit:.7,parasolCol:garb[0]}]);
list.push([590,612,100,{pal:4,pal2:3,back:true,skirt:false,hat:.99,lit:.6}]);
list.push([618,668,112,{pal:5,pal2:5,back:true,skirt:true,hat:.95,lit:.55}]);
// child with balloon at left foreground
list.push([95,790,118,{pal:1,pal2:4,back:true,skirt:true,hat:.95,lit:.9}]);
list.sort((a,b)=>a[1]-b[1]);
for(const [x,y,h,o] of list){
  const par=(o.parasolCol)||(h>40&&R(0,1)<.09?garb[Math.floor(R(0,garb.length))]:null);
  if(par&&h<=40){person(x,y,h,o);continue;}
  person(x,y,h,o);if(par)parasol(x,y,h,par);}
// the child's balloon (red) on a string
{const bx=118,by=660;S(108,722,110,-1.5,M([['burnt_umber',1],['titanium_white',.6]]),1.6,{brush:'round',load:.6,thin:.7,bend:8});
 F(seg(bx,by,34,1.57,6,4),M([['cadmium_red',1],['alizarin_crimson',.2]]),30,{brush:'filbert',load:1,thin:.4});
 F(seg(bx+7,by+3,30,1.57,4,4),M([['alizarin_crimson',1],['cadmium_red',.5],['burnt_umber',.15]]),12,{brush:'filbert',load:1,thin:.4,opacity:.85});
 S(bx-7,by-6,16,1.2,M([['titanium_white',2],['vermilion',.3]]),6,{brush:'filbert',load:1.2,thin:.35});}
// sun-struck hats and shoulders over the crowd: warm dabs; coloured accents
for(let i=0;i<260;i++){const q=list[Math.floor(R(0,list.length))];const [x,y,h]=q;if(h>110)continue;if(sd(x,y)>.6&&R(0,1)<.6)continue;
  const k=R(0,1);const c=k<.5?M([['titanium_white',2],['naples_yellow',.6]]):k<.8?M([['cadmium_yellow',.4],['titanium_white',1.6],['cadmium_orange',.08]]):M([['vermilion',.4],['titanium_white',1.4]]);
  S(x-.06*h,y-R(.6,.95)*h,R(.1,.22)*h,R(-.5,.2),c,Math.max(2.2,R(.025,.05)*h),{brush:'flat',load:1.2,thin:.35,opacity:R(.7,1)});}

// melt the crowd: blender drags in many directions so figures lose edges, then fresh accents on top
for(let i=0;i<230;i++){const x=R(-10,640),y=R(412,566);const k=R(0,1);const a=k<.5?R(-.3,.3):k<.8?1.57+R(-.4,.4):R(.3,1.2);
  BL(seg(x,y,R(20,50),a,R(-5,5),4),R(8,16));}
for(let i=0;i<190;i++){const q=list[Math.floor(R(0,list.length))];const [x,y,h]=q;if(h>110)continue;if(sd(x,y)>.6&&R(0,1)<.6)continue;
  const k=R(0,1);const c=k<.5?M([['titanium_white',2],['naples_yellow',.6]]):k<.8?M([['cadmium_yellow',.4],['titanium_white',1.6],['cadmium_orange',.08]]):M([['vermilion',.4],['titanium_white',1.4]]);
  S(x-.06*h,y-R(.6,.95)*h,R(.1,.22)*h,R(-.5,.2),c,Math.max(2.2,R(.025,.05)*h),{brush:'flat',load:1.2,thin:.35,opacity:R(.7,1)});}
// broken-colour flecks of costume colour over the mass of the crowd (confident dabs, not figures)
for(let i=0;i<150;i++){const x=R(0,640),y=R(420,560);const g=garb[Math.floor(R(0,garb.length))];
  S(x,y,R(8,22),R(-.9,.9),gm(g,R(.3,1),R(0,1)<.7?0:1),R(3,7),{brush:'filbert',load:1,thin:.45,opacity:R(.55,.9)});}
// larger foreground fairgoers at the right edge, painted with the same hand but bigger and darker
for(const [x,y,h,o] of [[1010,790,150,{pal:5,pal2:2,back:true,skirt:true,hat:.99,lit:.45,parasolCol:garb[8]}],[1118,806,168,{pal:8,pal2:9,back:true,skirt:false,hat:.99,lit:.35}]]){person(x,y,h,o);if(o.parasolCol)parasol(x,y,h,o.parasolCol);}
person(1010+4,790-.86*150,150*.34,{back:true,hat:.9,lit:.4,skirt:true,pal:1,pal2:1,point:0});person(470,529-.84*62,62*.34,{back:true,hat:.9,lit:.8,skirt:false,pal:1,point:0});
p.dry();
