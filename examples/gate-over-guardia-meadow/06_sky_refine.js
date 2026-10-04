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
const clouds=[{x:790,y:112,w:500,h:130},{x:640,y:196,w:300,h:56},{x:210,y:148,w:380,h:100},{x:400,y:208,w:210,h:38},{x:935,y:205,w:200,h:42},{x:120,y:46,w:260,h:44},{x:500,y:66,w:240,h:40},{x:350,y:116,w:180,h:34}];
function cloudCol(l){l+=R(-.07,.07);
 if(l>.55)return M([['titanium_white',4],['naples_yellow',.45+R(0,.3)],['cadmium_yellow',.03],['quinacridone_rose',.03]]);
 if(l>.28)return M([['titanium_white',3.2],['naples_yellow',.3],['quinacridone_rose',.1],['cadmium_orange',.015]]);
 if(l>.02)return M([['titanium_white',3.4],['cerulean',.12],['cobalt_violet',.1],['naples_yellow',.12]]);
 if(l>-.25)return M([['titanium_white',2.6],['cobalt_violet',.3],['quinacridone_rose',.12],['cerulean',.12],['ultramarine',.05]]);
 return M([['titanium_white',2.1],['cobalt_violet',.45],['ultramarine',.16],['quinacridone_rose',.14],['burnt_sienna',.05]]);}
function inCloud(c,x,y,k){const dx=(x-c.x)/(c.w/2*k),dr=(y-c.y)/(c.h/2*k),dy=dr>0?dr*1.8:dr;return dx*dx+dy*dy<1+.12*Math.sin(x/17+c.x);}
function cstroke(c,sz,len,o,nz){nz=nz||.28;for(let t=0;t<30;t++){const x=c.x+R(-.5,.5)*c.w*1.05,y=c.y+R(-.5,.5)*c.h*1.1;if(!inCloud(c,x,y,1))continue;
 const dx=(x-c.x)/(c.w/2),dr=(y-c.y)/(c.h/2);const l=-dr*.7+dx*.4+R(-nz,nz)+.12;
 const slope=Math.atan(Math.max(-1.2,Math.min(1.2,dx/Math.sqrt(Math.max(.15,1-dx*dx))*c.h/c.w)));
 const a=slope*(dr<0?.8:-.3)+R(-.2,.2);
 St(x,y,len*R(.7,1.3),a,R(-5,5)*Math.min(1,len/60),cloudCol(l),sz*R(.8,1.2),Object.assign({load:R(.55,1),thin:R(.5,.8)},o||{}));return;}}
// blue sky between
function skyCol(y){const t=cl01(y/335);const r=R(0,1);
 return M([['titanium_white',3+t*2.6],['cerulean',.35*(1-t)+.1],['cobalt_blue',(1-t)*.4+.04],['ultramarine',(1-t)*.08],['quinacridone_rose',t*t*.07+.01],['naples_yellow',t*t*1.1],['cobalt_violet',(1-t)*.06]]);}
function skyStrokes(n,s0,s1,l0,l1){for(let i=0,k=0;k<n&&i<n*8;i++){const x=R(-40,1040),y=R(-10,335);let bad=false;for(const c of clouds)if(inCloud(c,x,y,.92)){bad=true;break;}if(bad)continue;k++;
 St(x,y,R(l0,l1),R(-.45,.2)+(y<80?.1:0),R(-6,6),skyCol(y),R(s0,s1),{load:R(.55,.95),thin:R(.55,.8)});}}
skyStrokes(60,44,60,200,340);skyStrokes(200,22,34,100,200);skyStrokes(400,9,16,40,90);skyStrokes(200,3,7,14,36);
// horizon glow
for(let i=0;i<250;i++){const y=R(245,335),x=R(-20,1020);const t=(y-245)/90;const r=R(0,1);
 const c=r<.12?M([['cerulean',.4],['titanium_white',2],['cobalt_violet',.15]]):r<.3?M([['quinacridone_rose',.1],['naples_yellow',.7],['titanium_white',1.5],['cadmium_orange',.05]]):M([['naples_yellow',1.1],['titanium_white',2],['cadmium_orange',.02+t*.03],['quinacridone_rose',.06]]);
 St(x,y,R(60,200),R(-.09,.09),R(-3,3),c,R(8,26),{load:R(.5,.9),thin:.7,opacity:R(.35,.7)});}

const layers=[[1800,30,48,110,190,.3],[600,16,28,60,110,.22],[130,8,14,28,56,.14],[95,4,8,14,30,.09],[110,2.5,5,8,18,.07]];
for(const [div,s0,s1,l0,l1,nz] of layers)for(const c of clouds){const n=Math.round(c.w*c.h*.6/div);for(let i=0;i<n;i++)cstroke(c,R(s0,s1),R(l0,l1),div<200&&R(0,1)<.2?{opacity:R(.55,.85)}:{},nz);}
// lost-edge scumbles crossing cloud boundaries
for(const c of clouds)for(let i=0;i<8;i++){const th=R(0,6.28);const x=c.x+Math.cos(th)*c.w*.5,y=c.y+Math.sin(th)*c.h*.5;
 St(x,y,R(30,60),R(-.3,.2),R(-3,3),M([['titanium_white',2.2],['cerulean',.3],['cobalt_violet',.1],['naples_yellow',.15]]),R(12,22),{load:.4,thin:.8,opacity:R(.3,.5)});}
