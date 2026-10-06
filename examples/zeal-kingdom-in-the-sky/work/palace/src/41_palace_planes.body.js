// 41: cornices (varied bands, no ring of blocks), plinths and contact shadows, bridges to the towers, a few broken stone courses on the lit sides only
p.wipe();
const LD={cx:1490,r:190,cy:600,ry:36,bot:765},UD={cx:1490,r:120,cy:500,ry:26,bot:605};
const CRM=()=>M([['titanium_white',3.2],['naples_yellow',.8],['yellow_ochre',.1]],.18);
const LAV=()=>M([['titanium_white',2],['ultramarine',.45],['cobalt_violet',.6]],.18);
const UNL=()=>M([['ultramarine',.5],['cobalt_violet',.45],['burnt_umber',.3],['titanium_white',1]],.2);
const DKS=()=>M([['ultramarine',.8],['cobalt_violet',.6],['burnt_umber',.3],['titanium_white',.6]],.2);
function cornice(d,size,term){
 for(let a=0.05;a<Math.PI-.05;a+=R(.15,.35)){if(p.random()<.3)continue;const u=Math.cos(a);
  earc(d.cx,d.cy+size*.8,d.r,d.ry,a-R(.02,.05),a+R(.12,.3),u>term?DKS():UNL(),size*R(.3,.5),{load:.6,thin:.6,edge:.4,opacity:.7,taper:[.2,.3]});}
 for(let a=0.06;a<Math.PI-.05;a+=R(.1,.3)){const u=Math.cos(a);const lit=u<term;if(!lit&&p.random()<.35)continue;
  earc(d.cx,d.cy+R(-1,1),d.r,d.ry,a-R(0,.04),a+R(.08,.3),lit?CRM():LAV(),size*R(.7,1.3),{load:lit?1.3:.9,thin:lit?.3:.5,clean:lit,taper:[.1,.3],brush:p.random()<.5?'flat':'filbert'});}
}
cornice(LD,10,.42);
cornice(UD,8,.4);
// tower cornices under the spires, and the lantern's
for(const t of [[1232,560,52,12],[1772,600,52,12],[1878,600,20,5]]){const d={cx:t[0],cy:t[1],r:t[2],ry:t[3]};
 for(let a=0.1;a<Math.PI-.1;a+=R(.3,.6)){const u=Math.cos(a);if(p.random()<.4)continue;earc(d.cx,d.cy+5,d.r,d.ry,a,a+R(.2,.4),u>.4?DKS():UNL(),3.5,{load:.6,thin:.6,edge:.4,opacity:.7});}
 for(let a=0.1;a<Math.PI-.1;a+=R(.25,.5)){const u=Math.cos(a);const lit=u<.4;if(!lit&&p.random()<.4)continue;earc(d.cx,d.cy,d.r,d.ry,a,a+R(.2,.45),lit?CRM():LAV(),R(5,7.5)*(d.r/52+.4),{load:lit?1.3:.9,thin:.35,clean:lit});}}
// plinths and contact shadows
const PL=()=>M([['titanium_white',2.4],['naples_yellow',.4],['cobalt_violet',.3],['raw_umber',.12]],.2);
const CT=()=>M([['ultramarine',.7],['burnt_umber',.5],['sap_green',.3],['titanium_white',.2]],.2);
function plinth(x0,x1,yb,term){for(let x=x0;x<x1;x+=R(26,44)){const l=R(30,56);const lit=x<term;S(x+l/2,yb-6+R(-1,1),l,0,lit?PL():LAV(),R(7,10),{load:.9,thin:.45,brush:'flat',taper:[.1,.2]});}
 for(let x=x0-2;x<x1+2;x+=R(28,48)){const l=R(34,60);S(x+l/2,yb+3+R(-1,1),l,R(-.02,.02),CT(),R(5,8),{load:.7,thin:.6,edge:.4,taper:[.15,.3]});}}
plinth(1300,1680,765,1560);plinth(1180,1285,765,1255);plinth(1720,1825,772,1795);plinth(960,1160,770,1118);plinth(1880,2050,760,1985);
// bridges: a slender deck joining each tower to the drum, lit top, shadowed underside, small arches below
function bridge(x0,x1,y,lit){const c=lit?CRM():LAV();
 S((x0+x1)/2,y,x1-x0+6,0,c,6,{brush:'flat',load:1.2,thin:.35,clean:lit});
 S((x0+x1)/2,y+7,x1-x0+2,0,lit?UNL():DKS(),5,{load:.7,thin:.55,edge:.3,opacity:.8});
 const n=Math.max(1,Math.round((x1-x0)/18));for(let i=0;i<n;i++){const x=lerp(x0,x1,(i+.5)/n);L([[x,y+22,.8],[x,y+10,.7]],M([['burnt_umber',.8],['ultramarine',.7],['titanium_white',.3]],.2),R(7,9),{brush:'round',load:.8,thin:.5,taper:[0,.3]});}
 for(let i=1;i<n;i++){const x=lerp(x0,x1,i/n);L([[x,y+24],[x,y+9]],c,R(4,5),{brush:'round',load:1.1,thin:.4});}}
bridge(1680,1722,644,false);
bridge(1283,1302,626,true);
// broken dry-brush stone courses: three or four per form, lit side only, varied length and spacing
const CO=()=>M([['titanium_white',2.6],['naples_yellow',.5],['cobalt_violet',.25],['raw_umber',.12]],.25);
function courses(d,ys,aRange){for(const y0 of ys){let a=aRange[0]+R(0,.2);while(a<aRange[1]){const len=R(.08,.3);if(p.random()<.4){a+=len+R(.05,.2);continue;}
  earc(d.cx,y0+R(-2,2),d.r*.985,d.ry*.95,a,a+len,CO(),R(3.5,5.5),{load:R(.25,.45),thin:.45,edge:.35,taper:[.2,.3],brush:'flat'});a+=len+R(.05,.25);}}}
courses({cx:1490,r:190,ry:36},[656,672,690,744],[1.4,2.95]);
courses({cx:1490,r:120,ry:26},[548,566,586],[1.4,2.9]);
courses({cx:1232,r:52,ry:12},[598,640,684,728],[1.5,2.9]);
courses({cx:1772,r:52,ry:12},[636,678,722],[1.5,2.9]);
