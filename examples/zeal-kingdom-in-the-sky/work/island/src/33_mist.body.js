// 33_mist (round 2): thin drifting veils of spray at each plunge and at the ledge burst, long horizontal tapered strokes at low opacity, warm on their left where the sun catches them, melted; a faint haze in the deepest pocket. Then dry.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const Mist=[['titanium_white',2.5],['cobalt_violet',.4],['cerulean',.2],['ultramarine',.15]];
const MistW=[['titanium_white',2.8],['naples_yellow',.6],['cobalt_violet',.15],['quinacridone_rose',.06]];
const Haze=[['titanium_white',2],['cobalt_violet',.6],['ultramarine',.3],['naples_yellow',.2]];
for(const g of [[1240,1215,130,1],[1296,1205,80,.7],[1708,1150,95,.8],[1026,1030,55,.6],[1270,1010,90,.7]]){
  for(let i=0;i<Math.round(22*g[3])+6;i++){const d=R(0,1);const x=g[0]+R(-1,1)*g[2]*(.3+d*.9),y=g[1]-20+R(-30,70)*d;const warm=x<g[0]-10;
    S(x,y,R(30,60)*g[3],R(-.6,.6),M(warm?ML(Mist,MistW,R(.5,.9)):Mist,.15),R(10,20),{load:.7,thin:.65,opacity:R(.14,.26),edge:.9,taper:[.4,.4],stir:.9});}
  for(let i=0;i<2;i++)S(g[0]+R(20,60)*g[3],g[1]-R(0,40),R(30,60),R(-.4,-.1),M(Mist,.15),R(8,14),{load:.6,thin:.65,opacity:R(.12,.2),edge:.9,taper:[.4,.4],stir:.9});
  for(let i=0;i<4;i++)SB(seg(g[0]+R(-g[2],g[2])*.5,g[1]+R(-g[2]*.3,g[2]*.4),R(40,70),R(-.6,.6),0,3),44,.4);}
// (pocket haze removed: it streaked the core)
p.dry();
