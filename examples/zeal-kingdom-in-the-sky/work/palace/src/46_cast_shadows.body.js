// 46: cast shadows as transparent glazes over dried paint
p.wipe();
const GLZ=()=>M([['ultramarine',.75],['cobalt_violet',.5],['alizarin_crimson',.08]],.2);
const GLG=()=>M([['ultramarine',.7],['cobalt_violet',.3],['sap_green',.25],['burnt_umber',.08]],.2);
function glaze(poly,size,col,op,o){fill(poly,size,()=>col(),{step:R(.95,1.05),brush:'filbert',tilt:.02,jy:2,so:Object.assign({load:.9,thin:.5,opacity:op,edge:.3,taper:[.05,.12]},o||{})});}
// plateau: the drum, the right tower and the pavilions throw one long shadow to the lower right
const SH1=[[1676,748],[1880,770],[2050,800],[1900,816],[1690,822],[1562,792],[1600,766]];
glaze(SH1,11,GLG,.26);
glaze([[1676,748],[1840,765],[1900,790],[1800,814],[1690,822],[1562,792],[1600,766]],12,GLG,.24);
glaze([[1680,712],[1722,712],[1722,770],[1680,770]],9,GLZ,.2);
glaze([[1720,716],[1826,748],[1826,772],[1720,772]],10,GLZ,.16,{edge:.6});
// the right tower's shadow on the right pavilion's left part and the lantern's base
glaze([[1880,690],[1940,690],[1975,760],[1880,760]],9,GLZ,.16,{edge:.6});
glaze([[1286,762],[1385,795],[1330,812],[1250,774]],12,GLG,.22);
glaze([[1300,705],[1324,722],[1352,765],[1300,765]],8,GLZ,.12,{edge:.6});
glaze([[1826,774],[1966,790],[2012,812],[1905,818],[1802,804]],12,GLG,.2);
glaze([[1160,770],[1232,790],[1182,802],[1120,778]],10,GLG,.2);
glaze([[2050,760],[2112,776],[2080,792],[2000,770]],10,GLG,.18);
glaze([[1548,600],[1612,602],[1678,610],[1674,628],[1640,638],[1586,636],[1550,622]],9,GLZ,.22);
// long shadows of the two towers to the lower right: on the terrace's left part, the drum's lower wall, and across the plateau
glaze([[1300,574],[1352,588],[1396,636],[1300,636]],8,GLZ,.14,{edge:.6});
glaze([[1286,766],[1304,766],[1490,826],[1440,838],[1330,804]],10,GLG,.22,{edge:.5});
glaze([[1826,774],[1850,774],[2060,816],[2100,836],[2030,842],[1900,818]],10,GLG,.2,{edge:.5});
// the stair's shadow on the plateau to its lower right
glaze([[1398,768],[1430,790],[1470,800],[1440,806],[1400,792]],8,GLG,.2,{edge:.5});
// under the cornice overhang on the lit side, and inside the arcade (deepen the openings' tops)
for(let a=2.9;a>1.2;a-=R(.2,.3)){earc(1490,612,186,36,a-R(.15,.25),a,GLZ(),5,{load:.7,thin:.55,opacity:.2,edge:.5,taper:[.2,.3]});}
for(let a=0.2;a<Math.PI-.15;a+=R(.15,.22)){const x=1490+190*Math.cos(a)*.985;if(Math.abs(x-1372)<42)continue;S(x,R(712,722),R(10,16),Math.PI/2,GLZ(),R(8,11),{load:.7,thin:.55,opacity:.25,edge:.4,taper:[.2,.3]});}
