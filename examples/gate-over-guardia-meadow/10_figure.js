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
// A young man seen from behind, ~195px tall (hair top y~540, feet y~742). Sun from the right: cream on his right, violet-blue shade on his left; cool gate-light rim.
const CX=203;
const lerp=(a,b,t)=>a+(b-a)*t;
// ---- cast shadow on the grass, falling left and toward the viewer
for(let i=0;i<30;i++){const x=R(60,196),y=R(734,750);St(x,y,R(30,110),R(-.12,.05),R(-2,2),M([['ultramarine',.4],['cobalt_violet',.4],['viridian',.15],['sap_green',.3],['titanium_white',.2]]),R(5,14),{load:R(.5,.85),thin:.7,opacity:R(.5,.85)});}
// ---- trousers: dark with light catching the legs
const legs=[[CX-8,-1,.0],[CX+9,1,.0]];
for(const [lx,side] of legs){for(let i=0;i<46;i++){const y=R(664,736);const f=(y-664)/72;const w=lerp(8,6,f);const cxl=lx+side*lerp(0,2,f)-(side<0?2*f:0);const x=cxl+R(-1,1)*w;
  const l=(x-cxl)/w*(side>0?1:.4);
  const col=l>.4?M([['ultramarine',.5],['cobalt_violet',.4],['titanium_white',.9],['cerulean',.1]]):l>-.2?M([['ultramarine',.6],['burnt_umber',.35],['cobalt_violet',.3],['titanium_white',.3]]):M([['ultramarine',.7],['burnt_umber',.5],['dioxazine_purple',.08],['titanium_white',.1]]);
  St(x,y,R(8,20),1.57+R(-.08,.08)+(side*.02),R(-.8,.8),col,R(2.6,6),{load:R(.7,1),thin:.55,opacity:y>726?R(.5,.8):1});}}
// between the legs: deep shadow
for(let i=0;i<8;i++)St(CX+R(-2,2),R(672,730),R(10,22),1.57,0,M([['ultramarine',.6],['burnt_umber',.6],['dioxazine_purple',.1]]),R(2,3.4),{load:.9});
// boots, lost in grass
for(const bx of [CX-11,CX+12])for(let i=0;i<8;i++)St(bx+R(-4,4),R(728,742),R(6,12),R(-.3,.3)+1.2,R(-.5,.5),M([['burnt_umber',1],['ultramarine',.3],['alizarin_crimson',.05]]),R(3,5.5),{load:.9,thin:.5,opacity:R(.7,1)});
// ---- tunic: back, shoulders to hip, strokes follow the form
const hw=y=>y<612?lerp(20,25,Math.min(1,(y-598)/12)):y<646?lerp(25,18,(y-612)/34):lerp(18,22,(y-646)/26);
function tcol(l,y){const j=R(-.06,.06);l+=j;
 if(l>.55)return M([['titanium_white',3.6],['naples_yellow',.6],['cadmium_orange',.05],['quinacridone_rose',.05]]);
 if(l>.2)return M([['titanium_white',3.6],['naples_yellow',.3],['quinacridone_rose',.05]]);
 if(l>-.2)return M([['titanium_white',3.4],['naples_yellow',.08],['cobalt_violet',.12],['cerulean',.05]]);
 if(l>-.6)return M([['titanium_white',2.4],['cobalt_violet',.5],['cerulean',.2],['ultramarine',.06]]);
 return M([['titanium_white',1.8],['cobalt_violet',.6],['ultramarine',.25],['cerulean',.15],['quinacridone_rose',R(0,.1)]]);}
for(let i=0;i<260;i++){const y=R(597,672);const w=hw(y);const x=CX+R(-1,1)*w;const l=(x-CX)/w;
 const horiz=y<606||y>655;const a=horiz?R(-.25,.25):1.57+l*.28+R(-.15,.15);
 St(x,y,R(8,22),a,R(-1.5,1.5),tcol(l+(y-630)/300*0,y),R(2.6,7.5),{load:R(.7,1.1),thin:.5});}
// folds: violet shadow creases with cream lights beside them
for(const [x0,y0,x1,y1] of [[188,606,196,640],[196,614,206,652],[184,626,190,658],[212,608,206,640],[218,622,214,652]]){const mid=[(x0+x1)/2+R(-1.5,1.5),(y0+y1)/2];
 F([[x0,y0,.4],[mid[0],mid[1],1],[x1,y1,.35]],M([['titanium_white',1.6],['cobalt_violet',.6],['ultramarine',.12],['cerulean',.1]]),R(2.4,4),{load:.9,thin:.5,opacity:.85});
 F([[x0+4,y0+1,.4],[mid[0]+4,mid[1],1],[x1+4,y1,.35]],M([['titanium_white',3.6],['naples_yellow',.3]]),R(1.8,3),{load:1,thin:.45});}
// shoulder line: lit on right, shade on left
for(let i=0;i<14;i++){const l=R(-1,1);St(CX+l*22,R(598,604)+Math.abs(l)*3,R(6,12),l*.4+R(-.2,.2),R(-.5,.5),tcol(l,600),R(2.2,4),{load:1,thin:.45});}
// hem/hip flare
for(let i=0;i<14;i++){const l=R(-1,1);St(CX+l*21,R(662,674),R(6,14),R(-.25,.25),R(-.5,.5),tcol(l,668),R(2.4,4.6),{load:1,thin:.45});}
// ---- arms
function armS(sx,ex,lit){const n=20;for(let i=0;i<n;i++){const f=R(0,1);const x=lerp(sx,ex,f)+R(-3.2,3.2),y=lerp(602,650,f);const l=lit?R(.1,.7):R(-.9,-.3);
  St(x,y,R(8,16),1.57+(ex-sx)/60+R(-.12,.12),R(-.8,.8),tcol(l,y),R(2.6,5.5),{load:R(.8,1.1),thin:.5});}}
armS(CX-26,CX-29,false);armS(CX+26,CX+29,true);
for(const [x,y,lit] of [[CX-29,652,0],[CX+29,652,1]])for(let i=0;i<3;i++)p.dab({x:x+R(-1.5,1.5),y:y+R(-2,2),color:M(lit?[['flesh_tint',1],['yellow_ochre',.25],['cadmium_orange',.08],['titanium_white',.1]]:[['flesh_tint',.8],['cobalt_violet',.4],['burnt_sienna',.1]]),size:R(3.2,4.6),brush:'round',load:1});
// ---- belt and katana
for(let i=0;i<12;i++)St(CX+R(-20,20),R(659,664),R(8,16),R(-.15,.15),R(-.5,.5),M([['burnt_umber',1],['ultramarine',.3],['alizarin_crimson',.05],['titanium_white',R(0,.2)]]),R(2.4,3.6),{load:.95,thin:.45});
const kt=M([['burnt_umber',.5],['ultramarine',.8],['cobalt_violet',.2]]);
F([[CX-8,666,.5],[CX+4,680,1],[CX+14,692,.6]],kt,3.4,{load:.9,thin:.45});
F([[CX+20,700,.5],[CX+30,712,1],[CX+40,726,.4]],kt,3.2,{load:.85,thin:.45});
F([[CX+44,732,.5],[CX+50,740,.4]],kt,2.6,{load:.8,thin:.45,opacity:.7});
F([[CX-17,661,.7],[CX-24,650,1],[CX-29,641,.6]],M([['burnt_umber',.8],['ultramarine',.3],['alizarin_crimson',.1]]),3.6,{load:.95,thin:.45});
for(const [x,y] of [[CX-21,654],[CX-25,647]])p.dab({x,y,color:M([['yellow_ochre',.6],['cadmium_yellow',.3],['titanium_white',.3]]),size:2.2,brush:'round',load:1});
p.dab({x:CX-30,y:640,color:M([['cadmium_yellow',.5],['yellow_ochre',.5]]),size:2.8,brush:'round',load:1});
p.dab({x:CX+27,y:708,color:'titanium_white',size:2.2,brush:'round',load:1.3});
p.dab({x:CX+12,y:690,color:M([['titanium_white',3],['cerulean',.2]]),size:1.8,brush:'round',load:1.3});
// ---- neck (in shade, warm lit side)
for(let i=0;i<10;i++){const x=CX+R(-4,4);const l=(x-CX)/4;St(x,R(585,597),R(6,12),1.57+R(-.1,.1),0,M(l>.2?[['flesh_tint',1],['yellow_ochre',.2],['cadmium_orange',.1]]:[['flesh_tint',.9],['cobalt_violet',.4],['burnt_sienna',.15]]),R(2.4,4),{load:1,thin:.5});}
// ---- scarf: collar wrap and a long flowing tail carried right by the wind
const sc=(k)=>k<.25?M([['viridian',.45],['cobalt_blue',.25],['ultramarine',.08],['titanium_white',.3],['burnt_umber',.03]]):k<.75?M([['viridian',.42],['cerulean',.2],['cobalt_blue',.15],['titanium_white',.5],['burnt_umber',.03]]):M([['cerulean',.4],['viridian',.15],['titanium_white',1.5]]);
for(let i=0;i<24;i++){const x=CX+R(-1,1)*14;const y=594+Math.abs((x-CX)/14)*-2+R(-2,2)+2;St(x,y,R(8,20),R(-.25,.25),R(-1,1),sc(R(0,1)),R(2.4,5),{load:1,thin:.45});}
const tail=[[CX+12,596],[CX+26,600],[CX+44,596],[CX+66,586],[CX+86,584],[CX+104,574],[CX+122,576]];
function pt(f){const g=f*(tail.length-1),i=Math.min(tail.length-2,Math.floor(g)),u=g-i;return [lerp(tail[i][0],tail[i+1][0],u),lerp(tail[i][1],tail[i+1][1],u)+Math.sin(f*9)*2];}
for(let i=0;i<70;i++){const f=R(0,1);const [x,y]=pt(f),[x2,y2]=pt(Math.min(1,f+.03));const a=Math.atan2(y2-y,x2-x);const wd=lerp(8,3,f);
 St(x+R(-1,1)*wd*.35,y+R(-1,1)*wd*.35,R(8,20),a+R(-.1,.1),R(-1,1),sc(R(0,1)),R(2,wd),{load:R(.8,1.1),thin:.45,opacity:f>.85?R(.5,.9):1});}
const tail2=[[CX+10,598],[CX+24,608],[CX+40,616],[CX+56,628]];
for(let i=0;i<24;i++){const f=R(0,1),g=f*3,k=Math.min(2,Math.floor(g)),u=g-k;const x=lerp(tail2[k][0],tail2[k+1][0],u),y=lerp(tail2[k][1],tail2[k+1][1],u)+Math.sin(f*7)*1.5;St(x,y,R(7,14),.5+R(-.2,.2),R(-1,1),sc(R(0,1)),R(2,4.4)*(1-f*.4),{load:.9,thin:.5});}
// ---- hair: flame of crimson shadow / cadmium red / orange light, leaning with the wind
const hs=()=>M([['alizarin_crimson',.9],['cadmium_red',.5],['cobalt_violet',R(0,.25)],['burnt_sienna',.1]]);
const hm=()=>M([['cadmium_red',1],['vermilion',.3],['alizarin_crimson',R(.05,.25)],['cadmium_orange',R(0,.15)]]);
const hl=()=>M([['cadmium_orange',.9],['cadmium_red',.5],['cadmium_yellow',R(.05,.3)],['vermilion',.2]]);
const HX=CX,HY=574;
// skull mass
for(let i=0;i<55;i++){const th=R(0,6.28),r=Math.sqrt(R(0,1));const x=HX+Math.cos(th)*r*13,y=HY+Math.sin(th)*r*14-1;if(y>588)continue;const l=(x-HX)/13+(HY-y)/30;
 St(x,y,R(7,15),R(-1.2,1.2)+(x-HX)/20,R(-1.5,1.5),l>.4?hl():l>-.3?hm():hs(),R(3,7.5),{load:R(.8,1.1),thin:.45});}
// spikes
const nsp=9;for(let k=0;k<nsp;k++){const ph=-2.75+k*(2.3/(nsp-1));const bx=HX+Math.cos(ph)*10,by=HY+Math.sin(ph)*11;
 let dx=Math.cos(ph)*.7+.5,dy=Math.sin(ph)*1.0-.2;const dl=Math.hypot(dx,dy);dx/=dl;dy/=dl;const L=R(15,27)*(1-Math.abs(k-nsp/2)/nsp*.5);
 const side=(k/(nsp-1));for(let j=0;j<8;j++){const f=R(0,1);const x=bx+dx*L*f+R(-1.2,1.2),y=by+dy*L*f+R(-1.2,1.2);const wd=lerp(6.5,1.8,f);
  const c=side<.3?hs():side>.7?hl():(f>.6&&R(0,1)<.5?hl():hm());
  St(x,y,R(7,16)*(1-f*.4),Math.atan2(dy,dx)+R(-.15,.15),R(-1,1),c,R(1.6,wd),{load:R(.85,1.15),thin:.4});}}
// dark accents between spikes and warm lit tips
for(let i=0;i<14;i++){const x=HX+R(-12,12),y=HY+R(-20,-4);St(x,y,R(5,10),R(-1.8,-.9),0,M([['alizarin_crimson',1],['burnt_umber',.2],['cobalt_violet',.2]]),R(1.4,2.6),{load:.9,thin:.4,opacity:R(.6,.9)});}
for(let i=0;i<14;i++){const x=HX+R(2,16),y=HY+R(-24,-8);St(x,y,R(4,9),R(-1.4,-.2),0,M([['cadmium_yellow',.5],['cadmium_orange',1],['titanium_white',R(0,.2)]]),R(1.4,2.8),{load:1.1,thin:.4});}
// ear on the lit side, hint of nape under hair
p.dab({x:HX+14,y:HY+6,color:M([['flesh_tint',1],['cadmium_orange',.2],['yellow_ochre',.1]]),size:3.2,brush:'round',load:1});
// ---- cool gate-light rim on the right edge (opposite the warm sun, painter's complement)
for(const [x0,y0,x1,y1] of [[CX+24,604,CX+27,648],[CX+10,668,CX+13,722],[CX+13,578,CX+15,568]])for(let i=0;i<5;i++){const f=R(0,1);St(lerp(x0,x1,f)+1.5,lerp(y0,y1,f),R(5,11),1.57+R(-.1,.1),0,M([['cobalt_violet',.4],['cerulean',.4],['titanium_white',2]]),R(1.4,2.4),{load:1,thin:.45,opacity:.85});}
// ---- lost edges: a few tiny drags where he meets the meadow
for(const [x,y] of [[CX-24,620],[CX-20,700],[CX+22,704],[CX-2,744],[CX+26,640]])BL([[x-7,y-1],[x+7,y+2]],7);
// ---- grass over the boots and flicks in front of the legs
for(let i=0;i<60;i++){const x=R(160,252),y=R(722,752);const c=R(0,1);St(x,y,R(8,20),-1.57+R(-.45,.45),R(-1.5,1.5),c<.4?M([['sap_green',.7],['cadmium_yellow',.3],['titanium_white',.4]]):c<.7?M([['viridian',.3],['ultramarine',.3],['sap_green',.5],['titanium_white',.3]]):M([['naples_yellow',.6],['titanium_white',.7],['sap_green',.3]]),R(1.8,4.6),{load:.8,thin:.5});}
// a few wildflowers beside him
for(const [x,y] of [[240,730],[256,738],[228,744],[270,724],[248,716]]){const c=[['cadmium_red',1],['titanium_white',1],['cadmium_yellow',1],['quinacridone_rose',.8],['cobalt_violet',.7]][Math.floor(R(0,5))];
 for(let j=0;j<4;j++)St(x+R(-5,5),y+R(-4,4),R(2.5,5),R(0,6.28),0,M([c,['titanium_white',.2]]),R(2.4,4),{load:1.05});}
