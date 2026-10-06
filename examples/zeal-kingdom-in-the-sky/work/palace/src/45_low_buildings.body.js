// 45: terrace balustrade, the grand stair with its balustrades, pavilion parapets and the lantern's details
p.wipe();
const LD={cx:1490,r:190,cy:600,ry:36};
const rim=(d,x)=>{const u=clamp((x-d.cx)/d.r,-1,1);return d.cy+d.ry*Math.sqrt(1-u*u);};
const CRM=()=>M([['titanium_white',3.2],['naples_yellow',.8],['yellow_ochre',.1]],.18);
const CRH=()=>M([['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.2]],.18);
const LAV=()=>M([['titanium_white',2],['ultramarine',.45],['cobalt_violet',.6]],.18);
const DKS=()=>M([['ultramarine',.8],['cobalt_violet',.6],['burnt_umber',.3],['titanium_white',.6]],.2);
const DKW=()=>M([['burnt_umber',1],['ultramarine',.6],['titanium_white',.25]],.2);
const GRM=()=>M([['titanium_white',2.6],['raw_umber',.25],['naples_yellow',.5],['cobalt_violet',.2]],.18);
// ---- terrace balustrade along the front rim: balusters of varied size and spacing, some dropped, the shadow half lost ----
for(let a=0.12;a<Math.PI-.08;a+=R(.04,.13)){const u=Math.cos(a);const lit=u<.42;if(!lit&&p.random()<.75)continue;if(lit&&p.random()<.22)continue;
 const x=LD.cx+LD.r*Math.cos(a),y=rim(LD,x);const h=R(5,11);const sz=R(2.2,4.2);
 L([[x,y-1,.9],[x+R(-.6,.6),y-h,.5]],lit?(p.random()<.6?CRM():CRH()):LAV(),sz,{brush:'round',load:lit?1.2:.8,thin:.4,taper:[0,.4],clean:lit});
 if(lit&&p.random()<.35)L([[x+sz*.5,y-1],[x+sz*.5,y-h*.7]],DKS(),1.8,{brush:'round',load:.6,thin:.6,opacity:.6,taper:[0,.4]});}
// coping: one long lit stroke along the rim (reloaded once), fading out on the shadow side
earc(LD.cx,LD.cy-10,LD.r+1,LD.ry,2.98,1.9,CRM(),4.5,{load:1.35,thin:.3,clean:true,taper:[.05,.15]});
earc(LD.cx,LD.cy-10,LD.r+1,LD.ry,2.0,1.1,CRM(),4.2,{load:1.3,thin:.3,clean:true,taper:[.1,.5]});
earc(LD.cx,LD.cy-10,LD.r+1,LD.ry,1.15,.35,LAV(),3.5,{load:.8,thin:.45,taper:[.2,.6],opacity:.8});
// on the back rim at the sides (visible beside the upper drum)
for(let a=Math.PI+.1;a<Math.PI+.55;a+=R(.07,.1)){const x=LD.cx+LD.r*Math.cos(a),y=LD.cy+LD.ry*Math.sin(a);L([[x,y],[x,y-R(6,8)]],CRH(),3,{brush:'round',load:1.1,thin:.4,taper:[0,.35]});}
for(let a=TAU-.55;a<TAU-.1;a+=R(.08,.12)){const x=LD.cx+LD.r*Math.cos(a),y=LD.cy+LD.ry*Math.sin(a);L([[x,y],[x,y-R(5,7)]],LAV(),3,{brush:'round',load:.8,thin:.45,taper:[0,.35]});}
// ---- the grand stair: it spills from the entrance (x 1372) down onto the plateau; upper treads and both balustrades ----
const EX=1372;
for(let i=0;i<4;i++){const y=766+i*4.5;const half=27+i*9;
 S(EX+R(-1,1),y,half*2,0,i%2?CRH():CRM(),4,{brush:'flat',load:1.25,thin:.32,clean:true,taper:[.05,.1]});
 S(EX+R(-1,1),y+2.3,half*2-4,0,M([['ultramarine',.5],['cobalt_violet',.45],['burnt_umber',.25],['titanium_white',1.2]],.2),2.2,{brush:'flat',load:.6,thin:.6,opacity:.7,taper:[.05,.1]});}
// balustrades: a sloping rail each side with a few balusters and a newel at the foot
function rail(x0,y0,x1,y1,c,cd){L([[x0,y0-9],[(x0+x1)/2,(y0+y1)/2-9],[x1,y1-9]],c,4,{brush:'round',load:1.2,thin:.35,clean:true});
 L([[x0,y0+1],[x1,y1+1]],cd,3,{brush:'round',load:.7,thin:.55,opacity:.7});
 for(let t=.1;t<.95;t+=R(.16,.26)){const x=lerp(x0,x1,t),y=lerp(y0,y1,t);L([[x,y],[x,y-8]],c,R(2.4,3.2),{brush:'round',load:1.1,thin:.4,taper:[0,.3]});}
 L([[x1,y1+2],[x1,y1-13]],c,5,{brush:'round',load:1.25,thin:.35,clean:true});p.dab({x:x1,y:y1-15,color:c,size:6,brush:'round',load:1.2});}
rail(EX-26,766,EX-54,786,CRM(),DKS());
rail(EX+26,766,EX+54,786,CRH(),DKS());
// ---- pavilions ----
function parapet(x0,x1,y,xs,top){for(let x=x0;x<xs;x+=R(30,50)){const l=R(36,60);S(x+l/2,y+6+R(-1,1),l,R(-.01,.01),DKW(),R(4,6),{load:.7,thin:.6,edge:.3,taper:[.1,.25],opacity:.8});}
 for(let x=x0;x<x1;x+=R(26,44)){const l=R(32,54);const lit=x<xs;if(!lit&&p.random()<.3)continue;S(x+l/2,y+R(-1,1),l,R(-.01,.01),lit?top():LAV(),R(7,9),{brush:'flat',load:lit?1.3:.9,thin:.32,clean:lit,taper:[.08,.2]});}}
parapet(960,1160,702,1118,CRM);
parapet(1880,2050,692,1985,GRM);
for(let x=964;x<1150;x+=R(36,56)){const l=R(40,64);S(x+l/2,697,l,0,M([['titanium_white',3],['cobalt_violet',.2],['naples_yellow',.35]],.18),R(4,6),{load:1,thin:.4,taper:[.1,.2]});}
// the dome's drum ring and gold tip on the left pavilion
earc(1062,702,40,8,Math.PI*1.02,Math.PI*1.98,CRM(),4,{load:1.2,thin:.35,clean:true,taper:[.1,.2]});
earc(1062,704,38,7,Math.PI*1.3,Math.PI*1.98,LAV(),3.5,{load:.9,thin:.45,taper:[.1,.2]});
// right pavilion: a lower, duller roof plane, a few halftone planes so it half-dissolves
for(let x=1884;x<2040;x+=R(36,56)){const l=R(40,64);S(x+l/2,687,l,0,M([['titanium_white',2.6],['cobalt_violet',.3],['raw_umber',.15],['naples_yellow',.3]],.18),R(4,6),{load:.95,thin:.42,taper:[.1,.2]});}
for(let i=0;i<10;i++){S(R(1990,2048),R(700,752),R(18,34),Math.PI/2+R(-.1,.1),M([['titanium_white',1.5],['ultramarine',.45],['cobalt_violet',.5],['raw_umber',.2]],.2),R(8,12),{load:.8,thin:.55,edge:.4,taper:[.15,.3]});}
// joining wall (drum to right tower) coping and the lantern's base
S(1701,711,40,0,M([['titanium_white',2.6],['cobalt_violet',.35],['naples_yellow',.3]],.18),5,{brush:'flat',load:1,thin:.4});
fill(RECT(1680,714,1722,768),8,(x,y)=>LAV(),{step:.85,so:{load:.85,thin:.5}});
p.dry();
