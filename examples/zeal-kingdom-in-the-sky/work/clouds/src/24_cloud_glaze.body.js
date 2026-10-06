// 24: dry, then warm scumbles over the dried bellies (reflected light), a thin violet glaze in the troughs and the island shadow, haze veils over the far rows, a cool veil on the near band.
p.dry();p.wipe();
const GL=()=>M([['ultramarine',1],['dioxazine_purple',.4],['alizarin_crimson',.15]],.15);
const SC=()=>M([['titanium_white',2.4],['naples_yellow',.22],['cadmium_orange',.03],['cobalt_violet',.2]],.25);
// warm scumbles over the bellies, catching the ridges of the dried paint
for(const b of [[-60,1285,870,1350],[850,1395,1760,1455],[1810,1375,2350,1430]]){const n=Math.round((b[2]-b[0])/55);
  for(let i=0;i<n;i++){const x=R(b[0],b[2]),y=R(b[1],b[3]);S(x,y,R(120,260),R(-.03,.03),SC(),R(22,40),{brush:'flat',load:.75,thin:.55,edge:.6,opacity:R(.18,.3),taper:[.2,.3]});}}
// thin violet glaze in the troughs and under the lit rims
for(const t of [[0,1262,840,1292],[860,1372,1740,1398],[2200,1150,2340,1330],[850,1200,900,1330],[1745,1240,1790,1370]]){
  for(let i=0;i<4;i++){const x=R(t[0],t[2]);S(x,R(t[1],t[3]),R(120,260),R(-.03,.03),GL(),R(28,44),{brush:'flat',load:.8,thin:.5,opacity:R(.04,.07),taper:[.2,.3],edge:.6});}}
// island cast shadow restated as a soft cool glaze
for(let i=0;i<40;i++){const x=R(1250,2000),y=R(1150,1450);const d=ISL(x,y);if(d<.2)continue;S(x,y,R(160,320),R(-.08,.08),GL(),R(40,70),{brush:'flat',load:.8,thin:.5,opacity:R(.015,.03)*d,taper:[.2,.3],edge:.5});}
// haze veils over the far rows and the middle deck
const HZ=()=>M([['titanium_white',3],['naples_yellow',.25],['quinacridone_rose',.05]],.15);


// cool veil on the nearest band
const CV=()=>M([['titanium_white',2],['ultramarine',.45],['cobalt_violet',.3]],.15);
for(let i=0;i<16;i++){const x=R(-100,2400),y=R(1470,1610);S(x,y,R(300,520),R(-.03,.03),CV(),R(50,80),{brush:'flat',load:.7,thin:.6,opacity:R(.08,.14),taper:[.2,.2],edge:.5});}
