// 32_waterfalls (round 3): water, not icicles. Each fall: a crest of broken white at the lip (short thick touches), a body of 3-5 ribbons of varied width that wander, merge and split, thin bluer sheets in the rock's shadow, feathered ends that turn into drifting spray; the main fall bursts on the second stratum and is the brightest, thickest white on the island. Then dry.
p.wipe();
const ML=(a,b,t)=>{t=clamp(t,0,1);const o={};for(const [n,w] of a)o[n]=(o[n]||0)+w*(1-t);for(const [n,w] of b)o[n]=(o[n]||0)+w*t;return Object.keys(o).map(n=>[n,o[n]]);};
const Wlit=[['titanium_white',4],['cerulean',.1],['naples_yellow',.08]];
const Wmid=[['titanium_white',3],['cerulean',.35],['cobalt_blue',.1]];
const Wsh=[['titanium_white',1.8],['cerulean',.5],['cobalt_blue',.4],['cobalt_violet',.35]];
const Mist=[['titanium_white',2.5],['cobalt_violet',.4],['cerulean',.2],['ultramarine',.15]];
const MistW=[['titanium_white',2.6],['naples_yellow',.5],['cobalt_violet',.2]];
const Rockdk=[['ultramarine',1],['dioxazine_purple',.5],['burnt_umber',.4],['titanium_white',.3]];
// cl: [[x,y,halfwidth],...] lip to foot; b: brightness/scale; o.top crest; o.foot spray; o.n ribbons
function sheet(cl,b,o){o=o||{};const last=cl[cl.length-1],first=cl[0];
  const at=t=>{const k=Math.min(cl.length-2,Math.max(0,Math.floor(t*(cl.length-1))));const u=t*(cl.length-1)-k;return [lerp(cl[k][0],cl[k+1][0],u),lerp(cl[k][1],cl[k+1][1],u),lerp(cl[k][2],cl[k+1][2],u)];};
  // dark wet rock beside the sheet near the top, and a thin blue shadow sheet behind the ribbons on the right
  for(const s of [-1,1])p.stroke({points:[[first[0]+s*(first[2]+10),first[1]+8,.6],[at(.35)[0]+s*(at(.35)[2]+12),at(.35)[1],.9],[at(.65)[0]+s*(at(.65)[2]+10),at(.65)[1],.4]],color:M(Rockdk,.15),brush:'filbert',size:R(12,18),load:.75,thin:.6,edge:.6,taper:[.1,.5],stir:.85});
  {const pts=[];for(let k=0;k<6;k++){const q=at(k/5);pts.push([q[0]-q[2]*.15+R(-2,2),q[1],k===0?.6:k===5?.35:.9]);}p.stroke({points:pts,color:M(Wmid,.1),brush:'flat',size:first[2]*1.3,load:1.2,thin:.35,opacity:o.foot?.75:.85,taper:[.05,o.foot?.55:.3],edge:.5,stir:.8,clean:true});
   const ps=[];for(let k=0;k<5;k++){const q=at(k/4);ps.push([q[0]+q[2]*.5,q[1],k===0?.5:k===4?.3:.8]);}p.stroke({points:ps,color:M(Wsh,.12),brush:'flat',size:first[2]*.8,load:.8,thin:.5,opacity:.6,taper:[.05,.5],edge:.6,stir:.85});}
  // ribbons: 3-5, varied width, each wanders sideways so neighbours merge and split; lit left ones thick white, right ones thin blue
  const n=o.n||(3+Math.floor(R(0,2.6)));
  for(let r=0;r<n;r++){const f=(r+R(.2,.8))/n;const lit=f<.5;const c=lit?ML(Wlit,Wmid,f*1.4):ML(Wmid,Wsh,(f-.5)/.5);
    const w=(lit?R(8,22):R(4,10))*Math.sqrt(b);const ph=R(0,TAU),amp=first[2]*R(.3,.7),fr=R(.8,2.2),ph2=R(0,TAU);const tend=o.foot?R(.55,1):R(.8,1);
    const pts=[];const m=7;for(let k=0;k<m;k++){const t=lerp(0,tend,k/(m-1));const q=at(t);const x=q[0]+(f*2-1)*q[2]*.8+Math.sin(ph+t*fr*Math.PI)*amp*(.3+t)+Math.sin(ph2+t*5)*amp*.2*t;pts.push([x+R(-1.5,1.5),q[1],k===0?.55:lerp(.95,.3,t)]);}
    p.stroke({points:pts,color:M(c,.1),brush:'flat',size:w,load:lit?1.45:1,thin:lit?.2:.45,taper:[.1,o.foot?.6:.45],edge:lit?.1:.35,stir:.8,clean:r===0});
    // a split: a short second strand peeling off part way
    if(p.random()<.8){const t0=R(.15,.6);const q0=at(t0),q1=at(Math.min(1,t0+.3));const side=p.random()<.5?-1:1;
      p.stroke({points:[[pts[Math.floor(t0*(m-1))][0],q0[1],.5],[pts[Math.floor(t0*(m-1))][0]+side*w*.8,lerp(q0[1],q1[1],.5),.85],[pts[Math.floor(t0*(m-1))][0]+side*w*1.6,q1[1],.25]],color:M(c,.1),brush:'flat',size:w*R(.4,.7),load:lit?1.2:.8,thin:lit?.3:.5,taper:[.15,.6],edge:.2,stir:.8});}}
  // sun-catching lights down the lit edge, thickest paint
  for(let i=0;i<Math.round(5*b)+1;i++){const t=R(.05,.5);const q=at(t);const x=q[0]-q[2]*R(.5,.85),y=q[1];
    p.stroke({points:[[x,y,.6],[x+R(-2,2),y+R(30,60),.95],[x+R(-3,3),y+R(70,120),.3]],color:M(Wlit,.06),brush:'filbert',size:R(6,11),load:1.45,thin:.2,taper:[.1,.6],clean:true});}
  if(o.top){// crest: broken white at the lip, short thick touches, a shadow line under
    p.stroke({points:[[first[0]-first[2]-8,first[1]+6,.6],[first[0]-first[2]*.3,first[1]+1,.95],[first[0]+first[2]*.4,first[1]+2,.9],[first[0]+first[2]+6,first[1]+7,.5]],color:M(Rockdk,.1),brush:'filbert',size:9,load:.7,thin:.6,taper:[.2,.2],stir:.9});
    for(let i=0;i<Math.round(first[2]/3)+5;i++){const x=first[0]+R(-first[2]-6,first[2]+6),y=first[1]-R(0,12);S(x,y,R(8,20),R(-.6,.6),M(i%3===2?Wmid:Wlit,.06),R(7,14)*Math.sqrt(b),{load:1.5,thin:.15,taper:[.25,.3],edge:.05,stir:.7,clean:i===0});}}
  if(o.foot){// spray: feathered ends become drifting veils, warm on the left, melted
    const k=Math.round(8*b)+4;
    for(let i=0;i<k;i++){const d=R(0,1);const x=last[0]+R(-1,1)*(15+50*d)*b,y=last[1]-40+R(0,70)*d;const warm=x<last[0];
      S(x,y,R(70,150)*b,R(-.15,.15),M(warm?ML(Mist,MistW,.6):Mist,.15),R(8,16),{load:.7,thin:.6,opacity:R(.14,.28),edge:.9,taper:[.45,.45],stir:.9});}
    for(let i=0;i<5;i++)SB(seg(last[0]+R(-40,40)*b,last[1]+R(-20,50),R(60,110),R(-.5,.5),0,3),50,.45);}}
sheet([[1268,832,52],[1270,900,50],[1272,1004,46]],1,{top:true,n:5});
// the burst on the second stratum: thick white thrown up, with veils
for(let i=0;i<16;i++){const x=R(1212,1328),y=R(996,1022);S(x,y,R(14,34),R(-.5,.5),M(i%4===3?Wmid:Wlit,.08),R(6,13),{load:1.5,thin:.15,taper:[.2,.3],edge:.05,stir:.7,clean:i===0});}
for(let i=0;i<10;i++){const x=R(1215,1325);p.stroke({points:[[x,1004,.9],[x+R(-6,6),1004-R(12,30),.6],[x+R(-10,10),1004-R(30,50),.15]],color:M(Wlit,.06),brush:'round',size:R(3,6),load:1.3,thin:.2,taper:[0,.6]});}
for(let i=0;i<5;i++)S(R(1200,1340),R(990,1036),R(50,100),R(-.15,.15),M(Mist,.15),R(8,13),{load:.7,thin:.6,opacity:R(.15,.25),edge:.9,taper:[.4,.4],stir:.9});
sheet([[1248,1014,27],[1245,1080,25],[1240,1150,21],[1232,1215,15]],1,{foot:true,n:4});
sheet([[1296,1014,20],[1300,1080,18],[1297,1150,15],[1292,1205,11]],.9,{foot:true,n:3});
sheet([[1715,820,24],[1720,890,23],[1730,960,21],[1728,1030,19],[1720,1090,16],[1708,1140,13]],.8,{top:true,foot:true,n:4});
sheet([[1015,807,13],[1022,860,13],[1033,920,12],[1033,975,10],[1026,1025,8]],.6,{top:true,foot:true,n:3});
p.dry();
