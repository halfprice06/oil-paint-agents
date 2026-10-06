// 47: thick lights and gold: a few knife touches at cornices and arch crowns, highlight ridges on the roofs, finials
p.wipe();
const CRM=()=>M([['titanium_white',3.4],['naples_yellow',.8],['cadmium_lemon',.08]],.15);
const CRX=()=>M([['titanium_white',3.6],['naples_yellow',.5],['cadmium_lemon',.12]],.12);
const GLD=()=>M([['cadmium_yellow',1],['yellow_ochre',.55],['titanium_white',.45]],.2);
const GLL=()=>M([['cadmium_lemon',.8],['titanium_white',.9],['cadmium_yellow',.4]],.15);
const GLS=()=>M([['yellow_ochre',1],['burnt_sienna',.5],['ultramarine',.12]],.2);
// knife lights on the lit rims: few, varied
for(const a of [2.92,2.5,2.1]){earc(1490,599+R(-1,1),190,36,a,a-R(.1,.3),CRX(),R(5,9),{brush:p.random()<.6?'knife':'flat',load:1.3,thin:.2,clean:true,taper:0});}
for(const a of [2.85,2.3]){earc(1490,499,120,26,a,a-R(.14,.26),CRX(),R(5,7),{brush:'knife',load:1.3,thin:.2,clean:true,taper:0});}
// thickest cream near the lit normal of each cylinder
for(let i=0;i<9;i++){const u=R(-.78,-.45),x=1490+u*190;S(x,R(650,700),R(22,44),Math.PI/2+R(-.08,.08),CRX(),R(10,15),{load:1.4,thin:.25,clean:true,edge:.15,taper:[.15,.3]});}
for(let i=0;i<5;i++){const u=R(-.75,-.45),x=1490+u*120;S(x,R(545,590),R(18,32),Math.PI/2+R(-.08,.08),CRX(),R(8,11),{load:1.4,thin:.25,clean:true,edge:.15,taper:[.15,.3]});}
for(const t of [[1232,590,740],[1772,630,750]])for(let i=0;i<5;i++){const u=R(-.75,-.45),x=t[0]+u*52;S(x,R(t[1],t[2]),R(20,38),Math.PI/2+R(-.06,.06),CRX(),R(7,10),{load:1.4,thin:.25,clean:true,edge:.15,taper:[.15,.3]});}
for(let i=0;i<4;i++){const a=R(2.1,2.9);earc(1490,596,182,32,a,a-R(.12,.22),CRM(),R(6,9),{load:1.3,thin:.3,clean:true});}
// gold: band at the great spire's base (bright left, ochre right), arch crowns, cornice touches
const GDK=()=>M([['burnt_umber',.8],['yellow_ochre',.5],['ultramarine',.3]],.2);
for(const a of [2.9,2.45,2.0]){earc(1490,504,121,27,a-R(.02,.06),a-R(.22,.34),GDK(),R(3.5,4.5),{load:.8,thin:.5,edge:.3,taper:[.2,.4],opacity:.85});}
for(const a of [2.92,2.48,2.02,1.55]){const u=Math.cos(a);earc(1490,500+R(-.5,.5),121,27,a,a-R(.18,.34),u<-.3?GLL():GLD(),R(4.5,6.5),{brush:p.random()<.6?'knife':'filbert',load:1.35,thin:.25,clean:true,taper:[.05,.25]});}
earc(1490,500,121,27,1.0,.72,GLS(),3.5,{load:.8,thin:.45,taper:[.3,.6],opacity:.7});
p.dab({x:1372,y:679,color:GLD(),size:6,brush:'knife',load:1.2,angle:0});p.dab({x:1369,y:677,color:GLL(),size:3.5,brush:'round',load:1.2});
for(const x of [1318,1430,1545]){p.dab({x:x,y:600+36*Math.sqrt(1-Math.pow((x-1490)/190,2))-R(0,2),color:GLL(),size:R(3.5,5),brush:'knife',load:1.2,angle:.2});}
for(const t of [[1232,560],[1772,600]]){for(const a of [2.7,2.1]){const x=t[0]+52*Math.cos(a);p.dab({x:x,y:t[1]+12*Math.sin(a),color:GLD(),size:R(3,4),brush:'round',load:1.1});}}
// finials: gold rods with a lit side, orbs, knife glints
function rod(x,y0,y1,w){WL(x+1,y0,x+1,y1,GLS(),w,{load:1,thin:.35});WL(x-1,y0,x-1,y1,GLD(),w*.8,{load:1.1,thin:.3,clean:true});WL(x-2,y0+(y1-y0)*.1,x-2,y1-(y1-y0)*.15,GLL(),w*.45,{load:1.1,thin:.3,clean:true});}
rod(1490,238,126,6);
p.dab({x:1491,y:232,color:GLD(),size:12,brush:'round',load:1.2});p.dab({x:1488,y:229,color:GLL(),size:5,brush:'knife',load:1.2,angle:-.6});
p.dab({x:1490,y:174,color:GLD(),size:8,brush:'round',load:1.2});p.dab({x:1488,y:172,color:GLL(),size:4,brush:'knife',load:1.2,angle:-.6});
p.dab({x:1490,y:124,color:GLL(),size:5,brush:'round',load:1.2});
for(const t of [[1232,393,34,4],[1772,443,30,4],[1878,538,16,3],[1062,660,14,3]]){rod(t[0],t[1],t[1]-t[2],t[3]);p.dab({x:t[0],y:t[1]-t[2],color:GLL(),size:t[3]+1.5,brush:'round',load:1.2});p.dab({x:t[0],y:t[1]-t[2]*.45,color:GLD(),size:t[3]+1,brush:'round',load:1.1});}
// one crisp lit edge on the spire's left contour, finial to rim (thick, clean, no taper); the right contour stays soft
{const TB2=[[240,0],[262,5],[290,11],[320,18],[355,28],[400,55],[435,78],[462,99],[484,114],[500,120]];
 const W2=y=>{if(y<=240)return 0;for(let i=0;i<TB2.length-1;i++){if(y<=TB2[i+1][0]){const t=(y-TB2[i][0])/(TB2[i+1][0]-TB2[i][0]);return lerp(TB2[i][1],TB2[i+1][1],t*t*(3-2*t)*.5+t*.5);}}return 120;};
 const EDGE=()=>M([['titanium_white',3],['cerulean',.7],['viridian',.1],['naples_yellow',.2]],.12);
 for(const [ya,yb] of [[244,330],[320,420],[410,500]]){const pts=[];for(let i=0;i<6;i++){const y=lerp(ya,yb,i/5);pts.push([1490-W2(y)+2.5+R(-.5,.5),y,.85+.15*Math.sin(Math.PI*i/5)]);}L(pts,EDGE(),R(4,5.5),{load:1.4,thin:.22,clean:true,taper:0,edge:0});}}
// one crisp highlight ridge near the lit edge of each roof, with a few pale touches at the great spire's tip
const TAB=[[240,0],[262,5],[290,11],[320,18],[355,28],[400,55],[435,78],[462,99],[484,114],[500,120]];
const W=y=>{if(y<=240)return 0;for(let i=0;i<TAB.length-1;i++){if(y<=TAB[i+1][0]){const t=(y-TAB[i][0])/(TAB[i+1][0]-TAB[i][0]);return lerp(TAB[i][1],TAB[i+1][1],t*t*(3-2*t)*.5+t*.5);}}return 120;};
const HL=()=>M([['titanium_white',3.2],['cerulean',.55],['naples_yellow',.3],['viridian',.08]],.15);
{const pts=[];for(let i=0;i<7;i++){const y=lerp(262,492,i/6);pts.push([1490-.58*W(y)+R(-.6,.6),y,.6+.4*Math.sin(Math.PI*i/6)]);}L(pts,HL(),R(4.5,6),{load:1.35,thin:.25,clean:true,taper:[.15,.2]});}
for(let i=0;i<5;i++){const y=R(250,300);const u=R(-.7,-.2);L([[1490+u*W(y+10),y+10],[1490+u*W(y),y]],HL(),R(3,4.5),{load:1.3,thin:.3,clean:true,taper:[.1,.3]});}
const TB=[[0,0],[.085,.042],[.19,.092],[.31,.15],[.44,.233],[.615,.458],[.75,.65],[.85,.825],[.94,.95],[1,1]];
const prof=t=>{t=clamp(t,0,1);for(let i=0;i<TB.length-1;i++){if(t<=TB[i+1][0]){const s=(t-TB[i][0])/(TB[i+1][0]-TB[i][0]);return lerp(TB[i][1],TB[i+1][1],s*s*(3-2*s)*.5+s*.5);}}return 1;};
for(const t of [[1232,395,560,52],[1772,445,600,52],[1878,540,600,20]]){const pts=[];for(let i=0;i<6;i++){const y=lerp(t[1]+14,t[2]-4,i/5);pts.push([t[0]-.58*t[3]*prof((y-t[1])/(t[2]-t[1]))+R(-.4,.4),y,.6+.4*Math.sin(Math.PI*i/5)]);}L(pts,HL(),R(3,4)*(t[3]/52+.5),{load:1.3,thin:.25,clean:true,taper:[.15,.2]});}
// the pavilion dome's highlight
L([[1040,680],[1048,670],[1058,665]],HL(),4,{load:1.3,thin:.25,clean:true,taper:[.2,.3]});
// sparkles
p.dab({x:1310,y:598,color:CRX(),size:7,brush:'knife',load:1.3,angle:.3});
p.dab({x:1184,y:558,color:CRX(),size:5,brush:'knife',load:1.3,angle:.3});
