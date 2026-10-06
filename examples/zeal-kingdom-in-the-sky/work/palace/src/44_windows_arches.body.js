// 44: the arcade of pointed arches at the base of the lower drum, the grand entrance, grouped windows (fewer, varied, lost in shadow)
p.wipe();
const LD={cx:1490,r:190,cy:600,ry:36,bot:765},UD={cx:1490,r:120,cy:500,ry:26,bot:605};
const rim=(d,x)=>{const u=clamp((x-d.cx)/d.r,-1,1);return d.cy+d.ry*Math.sqrt(1-u*u);};
const WD=()=>M([['burnt_umber',1],['ultramarine',.55],['titanium_white',.15]],.2);
const WDI=()=>M([['burnt_umber',.9],['ultramarine',.5],['cadmium_orange',.12],['titanium_white',.3]],.2); // inside of an arch, a little warmer
const WS=()=>M([['ultramarine',.8],['cobalt_violet',.5],['burnt_umber',.35],['titanium_white',.6]],.2);
const JAMB=()=>M([['titanium_white',3.2],['naples_yellow',.8],['yellow_ochre',.12]],.15);
const JAMBS=()=>M([['titanium_white',2.2],['cobalt_violet',.4],['naples_yellow',.3]],.15);
// pointed arch opening: x centre, y of the sill (bottom), h height, w width; lit: has a lit left jamb
const WDD=()=>M([['burnt_umber',1],['ultramarine',.6],['alizarin_crimson',.12],['titanium_white',.08]],.2); // deep warm dark inside
function arch(x,yb,h,w,lit,deep){const c=lit?(deep?WDD():WD()):WS();
 // body of the opening
 L([[x,yb,.95],[x+R(-.4,.4),yb-h*.5,1],[x,yb-h*.74,.9]],c,w,{brush:'round',load:lit?1:.75,thin:lit?.4:.6,taper:0,edge:.05});
 // crisp pointed top: two short strokes from the shoulders meeting at the apex
 L([[x-w*.42,yb-h*.7,.9],[x-w*.12,yb-h*.93,.8],[x,yb-h,.5]],c,w*.42,{brush:'round',load:lit?1:.75,thin:.45,taper:0});
 L([[x+w*.42,yb-h*.7,.9],[x+w*.12,yb-h*.93,.8],[x,yb-h,.5]],c,w*.42,{brush:'round',load:lit?1:.75,thin:.45,taper:0});
 if(lit){L([[x-w*.66,yb-1,.95],[x-w*.66,yb-h*.45,1],[x-w*.6,yb-h*.72,.8]],JAMB(),R(5,6.5),{brush:'round',load:1.4,thin:.26,clean:true,taper:0});
  if(p.random()<.5)p.dab({x:x-w*.3,y:yb-h*.98,color:JAMB(),size:R(3,4),brush:'round',load:1.2});}
 else if(p.random()<.3){L([[x-w*.62,yb-2],[x-w*.6,yb-h*.5]],JAMBS(),3.5,{brush:'round',load:.9,thin:.45,taper:[0,.3]});}}
// ---- arcade at the base of the lower drum (skips the entrance) ----
const EX=1372;
for(let a=0.18;a<Math.PI-.15;a+=R(.15,.21)){const u=Math.cos(a);const x=LD.cx+LD.r*u*.985;if(Math.abs(x-EX)<42)continue;
 if(u>.42&&p.random()<.4)continue;const h=R(44,62)*(1-.25*Math.abs(u)),w=R(13,17)*(1-.3*Math.abs(u));arch(x,765,h,w,u<.42,true);}
// ---- grand entrance: a taller pointed arch with pale pilasters and a crown of gold (gold in 47) ----
arch(EX,765,84,30,true,true);
L([[EX-21,764,.9],[EX-21,710,.9],[EX-18,690,.6]],JAMB(),6,{brush:'round',load:1.35,thin:.28,clean:true,taper:[0,.25]});
L([[EX+19,764,.8],[EX+20,712,.8],[EX+17,692,.5]],M([['titanium_white',3],['naples_yellow',.5],['cobalt_violet',.2]],.15),5,{brush:'round',load:1.1,thin:.35,taper:[0,.25]});
earc(EX,700,19,15,Math.PI*1.08,Math.PI*1.92,JAMB(),5,{load:1.2,thin:.3,clean:true});
// ---- windows: grouped, varied, dark warm on the lit wall, nearly lost in shadow ----
function win(x,y,h,w,lit,sun){const c=lit?WD():WS();
 L([[x,y+h,.85],[x+R(-.4,.4),y+h*.45,.9],[x,y+w*.4,.6]],c,w,{brush:'round',load:lit?.95:.7,thin:lit?.45:.62,taper:[0,.3],edge:.1});
 if(lit&&sun)p.dab({x:x-w*.72,y:y+h*.6,color:JAMB(),size:R(4.5,6),brush:'round',load:1.35,angle:Math.PI/2});}
// lower drum: three groups above the arcade
for(const g of [[2.55,2],[2.05,3],[1.45,3],[.95,2]]){const n=g[1];for(let i=0;i<n;i++){const a=g[0]+(i-(n-1)/2)*R(.11,.14);const x=LD.cx+LD.r*Math.cos(a)*.98;const u=Math.cos(a);
  const y=rim(LD,x)+R(18,28);win(x,y,R(18,26),R(8,12)*(1-.2*Math.abs(u)),u<.42,u<-.1);}}
// upper drum: a loose band
for(let a=2.75;a>.3;a-=R(.33,.5)){const u=Math.cos(a);if(u>.45&&p.random()<.5)continue;const x=UD.cx+UD.r*u*.97;win(x,rim(UD,x)+R(16,24),R(16,22),R(7,10)*(1-.2*Math.abs(u)),u<.4,u<-.1);}
// towers and lantern: a few scattered, varied
for(const t of [[1232,560,765],[1772,600,772]]){const cx=t[0];
 for(let row=0;row<3;row++){const y=t[1]+R(28,40)+row*R(56,70);if(y>t[2]-28)continue;
  for(const a of [-.6,-.05,.55]){if(p.random()<.45)continue;const x=cx+52*Math.sin(a);win(x+R(-2,2),y+R(-6,6),R(14,22),R(6,8.5),Math.sin(a)<.4,Math.sin(a)<-.1);}}}
for(const y of [618,650]){win(1872+R(-3,3),y,R(14,18),5,true,true);}
// pavilion arcades: three arches on the left one, a lower row on the right one (softer)
for(const x of [995,1040,1095]){arch(x+R(-3,3),768,R(34,42),R(14,17),true,true);}
for(let x=1900;x<2040;x+=R(36,46)){arch(x,760,R(26,34),R(12,15),x<1985,false);}
