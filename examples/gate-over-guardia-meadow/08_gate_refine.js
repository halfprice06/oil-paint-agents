const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.8,1.2)]);
const cl01=v=>Math.max(0,Math.min(1,v));
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1,thin:.5},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function crv(x,y,len,ang,bend,n){n=n||5;const pts=[];const pk=R(.35,.65),e=Math.log(.5)/Math.log(pk);const ca=Math.cos(ang),sa=Math.sin(ang);
 for(let i=0;i<n;i++){const f=i/(n-1),t=f-.5;const off=bend*(1-4*t*t);const jx=R(-.6,.6),jy=R(-.6,.6)*Math.min(1,len/20);
  const pr=.22+.78*Math.pow(Math.sin(Math.PI*Math.pow(f,e)),.7);
  pts.push([x+ca*len*t-sa*off+jx,y+sa*len*t+ca*off+jy,pr]);}
 return pts;}
const St=(x,y,len,ang,bend,col,size,o)=>F(crv(x,y,len,ang,bend),col,size,o);
p.dry();
const PX=610,PY=398,tilt=-.35,ex=1.0,ey=.8;
function sp(r,ang){const x=Math.cos(ang)*r*ex,y=Math.sin(ang)*r*ey;return [PX+x*Math.cos(tilt)-y*Math.sin(tilt),PY+x*Math.sin(tilt)+y*Math.cos(tilt)];}
const wt=(a,b)=>M(a.concat(b));
// 1. scumbled halo, pale violet/blue, asymmetric (bulges up-right)
for(let i=0;i<350;i++){const th=R(0,6.28),f=Math.pow(R(0,1),.8),r=44+f*115*(1+.25*Math.cos(th+.8));
 const [x,y]=sp(r,th);const ox=-8+(Math.cos(th+.8)>0?6:0);
 St(x+ox,y-4,R(20,70),th+1.57+R(-.6,.6),R(-6,6),M([['cobalt_violet',.5-.3*f],['cerulean',.3],['titanium_white',1.2+2.2*f],['quinacridone_rose',R(0,.08)],['ultramarine',.06*(1-f)]]),R(7,26)*(1-f*.45),{load:R(.35,.6),thin:.75,opacity:R(.16,.42)*(1.15-f)});}
// 2. long spiral arms inward, broken colour
const pick=()=>{const r=R(0,1);return r<.14?0:r<.4?1:r<.6?2:r<.75?3:4;};
const pal=[[['ultramarine',1],['dioxazine_purple',.12],['cobalt_violet',.4]],[['cobalt_violet',1],['ultramarine',.25],['titanium_white',.4]],[['cerulean',.8],['titanium_white',.8],['cobalt_violet',.2]],[['cobalt_violet',.8],['quinacridone_rose',.3],['titanium_white',1]],[['titanium_white',2],['cobalt_violet',.3],['cerulean',.2]]];
function arm(a0,turns,r0,rEnd,sz,pc,o){const n=12,pts=[];for(let j=0;j<n;j++){const f=j/(n-1);const a=a0+f*turns*6.28;const r=rEnd+(r0-rEnd)*Math.pow(1-f,.9)+R(-1.2,1.2);const [x,y]=sp(r,a);pts.push([x,y,.25+.75*Math.pow(Math.sin(Math.PI*Math.pow(f,.7)),.7)]);}
 F(pts,M(pc),sz,Object.assign({load:R(.7,1),thin:.5},o||{}));}
for(let k=0;k<200;k++){const pc=pal[pick()];arm(R(0,6.28),R(.5,1.6),R(32,76),R(5,14),R(2.2,9),pc,{opacity:R(.7,1)});}
// 3. short broken segments along the spiral, finer
for(let k=0;k<500;k++){const r=R(7,72),a=R(0,6.28),span=R(.25,1.0);const pts=[];const n=4;const core=r<22;
 for(let j=0;j<n;j++){const f=j/(n-1);const [x,y]=sp(r-f*R(1,6),a+f*span);pts.push([x,y,.3+.7*Math.sin(Math.PI*f)]);}
 const pc=core?(R(0,1)<.5?[['titanium_white',2],['naples_yellow',.3],['cerulean',.1]]:pal[2]):pal[pick()];
 F(pts,M(pc),R(2,7)*(core?.8:1),{load:R(.6,1),thin:.5});}
// 4. outward streamers sweeping off the rim
for(let k=0;k<60;k++){const a=R(0,6.28);const pts=[];for(let j=0;j<6;j++){const f=j/5;const [x,y]=sp(62+f*R(30,60),a+f*R(.6,1.3));pts.push([x,y,.3+.7*Math.sin(Math.PI*Math.min(1,f*1.1))]);}
 F(pts,M([['cobalt_violet',.6],['cerulean',.4],['titanium_white',1.6],['quinacridone_rose',R(0,.1)]]),R(3,9),{load:R(.5,.9),thin:.6,opacity:R(.4,.8)});}
// 5. bright core with warm yellow
for(let k=0;k<45;k++){const a=R(0,6.28),r0=R(0,4),r1=R(6,13);St(PX+Math.cos(a)*(r0+r1)/2,PY+Math.sin(a)*(r0+r1)/2,r1-r0,a,R(-1,1),M([['titanium_white',3],['naples_yellow',R(.2,.8)],['cadmium_yellow',R(0,.2)]]),R(2.4,6),{load:R(.9,1.3),thin:.4});}
p.dab({x:PX+1,y:PY,color:M([['titanium_white',4],['naples_yellow',.5],['cadmium_yellow',.06]]),size:10,brush:'round',load:1.3});
p.dab({x:PX-3,y:PY+2,color:M([['titanium_white',4],['cadmium_yellow',.2]]),size:5,brush:'round',load:1.4});
// 6. dark accents for depth between the light arms
for(let k=0;k<26;k++){arm(R(0,6.28),R(.4,.9),R(30,62),R(14,30),R(2,5),[['ultramarine',1],['dioxazine_purple',.3],['cobalt_violet',.3]],{opacity:R(.45,.7)});}
// 7. sparks
for(let k=0;k<26;k++){const r=R(30,150),a=R(0,6.28);const [x,y]=sp(r,a);const c=R(0,1);
 St(x,y,R(2,5),R(0,6.28),R(-1,1),c<.4?M([['titanium_white',3],['cerulean',.2]]):c<.7?M([['titanium_white',2],['cobalt_violet',.4]]):c<.88?M([['titanium_white',2],['naples_yellow',.5]]):M([['quinacridone_rose',.5],['titanium_white',2]]),R(1.2,2.4),{load:1,thin:.4,opacity:R(.5,.85)});}
