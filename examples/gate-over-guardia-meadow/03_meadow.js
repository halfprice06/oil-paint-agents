const R=p.rand;
const M=a=>a.filter(x=>x[1]>0).map(([n,w])=>[n,w*R(.85,1.15)]);
const F=(pts,c,size,o={})=>p.stroke(Object.assign({points:pts,color:c,brush:'filbert',size,load:1.0,thin:.5},o));
const BL=(pts,size)=>p.stroke({points:pts,brush:'filbert',size,load:0,color:'titanium_white'});
function arc(x,y,len,ang,bend){const n=5,pts=[];for(let i=0;i<n;i++){const t=i/(n-1)-.5;pts.push([x+Math.cos(ang)*len*t-Math.sin(ang)*bend*(t*t-.1),y+Math.sin(ang)*len*t+Math.cos(ang)*bend*(t*t-.1)]);}return pts;}
// RIDGE re-stated, blue-green, a bit darker than haze
const rg=()=>M([['cerulean',.5],['titanium_white',1.8],['viridian',.25],['cobalt_violet',.25],['burnt_umber',.05]]);
for(let x=-40;x<1040;x+=R(80,130)){const y=338+Math.sin(x/130)*-4;F([[x,y+R(-2,2)],[x+90,y+R(-3,2)],[x+180,y+R(-2,3)]],rg(),R(14,22),{load:.9,thin:.55});}
for(let x=0;x<1000;x+=R(150,260)){F([[x,346],[x+120,348],[x+220,346]],M([['titanium_white',1.5],['viridian',.3],['cerulean',.3],['sap_green',.2]]),14,{load:.85,thin:.6});}
// MEADOW BLOCK-IN: horizontal-ish bands, bigger toward viewer
const zone=t=>{ // t 0 far .. 1 near
 return M([['cadmium_yellow',.35-t*.2],['cadmium_lemon',.2-t*.1],['sap_green',.15+t*.45],['viridian',.05+t*.1],['ultramarine',.12+t*.15],['titanium_white',1.7-t*1.1],['yellow_ochre',.15],['burnt_umber',.03+t*.12],['quinacridone_rose',.03]]);};
for(let y=344;y<760;y+=R(14,22)){const t=(y-340)/410,sz=22+t*38,len=120+t*180;
  for(let x=-120+R(0,100);x<1060;x+=len*R(.7,1.0)){
   const a=R(-.14,.14)+(x<500?.02:-.02);
   F([[x,y],[x+Math.cos(a)*len/2,y+Math.sin(a)*len/2+R(-3,3)],[x+Math.cos(a)*len,y+Math.sin(a)*len]],zone(Math.max(0,Math.min(1,t+R(-.12,.12)))),sz*R(.85,1.15),{load:.95,thin:.6});}}
// near slope: darker richer greens, over the lower area, strokes following the curve
for(let k=0;k<70;k++){const x=R(-40,1040),y=R(490,750);const t=(y-480)/270;
  const base=480-Math.sin(x/320+.4)*0;const a=R(-.5,.2)+(x-500)/1400*.3;
  F(arc(x,y,R(110,220),a,R(-8,8)),M([['sap_green',.6],['viridian',.1],['ultramarine',.2],['cadmium_yellow',.15+R(0,.2)],['titanium_white',.7+R(0,.5)],['burnt_umber',.1],['quinacridone_rose',.04]]),R(26,44),{load:.95,thin:.6});}
// blend a few long drags to unify, sparingly
for(let i=0;i<12;i++){const x=R(-20,900),y=R(360,740);BL(arc(x+60,y,R(120,200),R(-.12,.12),0),R(20,34));}
