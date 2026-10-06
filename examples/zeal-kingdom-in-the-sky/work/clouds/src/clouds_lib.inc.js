// ---- cloud helpers (clouds area, round 2) ----
const SUNA=Math.atan2(-0.78,-0.62); // direction to the sun, screen angle (upper left)
const SHA=SUNA+Math.PI;
const CL={
 // lit cream, broken colour: white, naples, a touch of orange and rose; w = warmth/closeness to the sun (0..1)
 lit:(w)=>{w=w===undefined?.5:w;return M([['titanium_white',3.4],['naples_yellow',.3+.15*w],['cadmium_orange',.01+.025*w],['quinacridone_rose',.01+.02*w]],.25);},
 litPink:()=>M([['titanium_white',3.4],['naples_yellow',.3],['quinacridone_rose',.04],['cadmium_orange',.012]],.25),
 litR:()=>M([['titanium_white',3.4],['naples_yellow',.3],['cobalt_violet',.06],['quinacridone_rose',.015]],.25),
 half:()=>M([['titanium_white',3.6],['naples_yellow',.24],['cobalt_violet',.2],['raw_umber',.06],['quinacridone_rose',.02]],.25),
 halfD:()=>M([['titanium_white',3],['naples_yellow',.12],['cobalt_violet',.35],['raw_umber',.1],['ultramarine',.08]],.25),
 shad:()=>M([['titanium_white',2.2],['cobalt_violet',.5],['ultramarine',.3],['raw_umber',.15]],.2),
 trough:()=>M([['titanium_white',1.4],['ultramarine',.55],['cobalt_violet',.45],['raw_umber',.3],['alizarin_crimson',.04]],.2),
 refl:()=>M([['titanium_white',2.4],['cobalt_violet',.35],['naples_yellow',.26],['cadmium_orange',.03],['raw_umber',.06]],.25),
 haze:()=>M([['titanium_white',3],['naples_yellow',.28],['quinacridone_rose',.07],['cobalt_violet',.18],['raw_umber',.05]],.2),
 pinkgrey:()=>M([['titanium_white',3],['cobalt_violet',.25],['raw_umber',.12],['quinacridone_rose',.04]],.2),
 blue:()=>M([['titanium_white',2.1],['ultramarine',.42],['cobalt_violet',.3],['raw_umber',.2],['cerulean',.08]],.2),
 islShad:()=>M([['titanium_white',1.7],['ultramarine',.6],['cobalt_violet',.4],['raw_umber',.2],['cerulean',.06]],.2),
};
// arc stroke on an ellipse (cx,cy,rx,ry) with an irregular radius function rf(a)
function arcOn(cx,cy,rx,ry,rf,a0,a1,rr,c,size,o){const n=6,pts=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));const r=rr+R(-.025,.025);const k=rf?rf(a):1;pts.push([cx+Math.cos(a)*rx*r*k,cy+Math.sin(a)*ry*r*k,pr(i,n)]);}F(pts,c,size,o);}
// one big cloud form (a bulge of a mass): a solid lit cap on the upper-left face (strokes following the bulge), a thin cool lower-right, the turn melted. B={cx,cy,rx,ry,near,dim,warm,sz,right,k1,k2,n}
function bulge(B){
 const k1=B.k1===undefined?.1:B.k1,k2=B.k2===undefined?.05:B.k2,ph1=R(0,TAU),ph2=R(0,TAU);
 const rf=a=>1+k1*Math.sin(3*a+ph1)+k2*Math.sin(5*a+ph2);
 const sz=B.sz||clamp(Math.sqrt(B.rx*B.ry)*.6,28,120);
 const dim=B.dim||0,near=!!B.near,nb=B.n||1;
 const litc=()=>{const c=B.right?CL.litR():(p.random()<.25?CL.litPink():CL.lit(B.warm));if(dim)c.push(['ultramarine',dim*.1],['cobalt_violet',dim*.12],['raw_umber',dim*.05]);return c;};
 const A=(a0,a1,rr,c,size,o)=>arcOn(B.cx,B.cy,B.rx,B.ry,rf,a0,a1,rr,c,size,o);
 const P=(a,rr)=>[B.cx+Math.cos(a)*B.rx*rr*rf(a),B.cy+Math.sin(a)*B.ry*rr*rf(a)];
 const sector=(a0,a1,rr0,rr1)=>{const pts=[];for(let i=0;i<=10;i++)pts.push(P(lerp(a0,a1,i/10),rr1));for(let i=10;i>=0;i--)pts.push(P(lerp(a0,a1,i/10),rr0));return pts;};
 const tang=(x,y)=>Math.atan2((y-B.cy)/B.ry,(x-B.cx)/B.rx)+Math.PI/2;
 // whole form in halftone, strokes following the bulge
 cover(sector(-Math.PI,Math.PI,0,1.0),sz*.55,()=>p.random()<.7?CL.half():CL.halfD(),{dens:1.7,len:2.6,angJ:.2,angf:tang,o:{load:1,thin:.42,edge:.3,taper:[.12,.2],stir:.6}});
 // shadow side: lower right, thin, deepest near the base
 cover(sector(SHA-.9,SHA+.9,.55,1.02),sz*.5,(x,y)=>{const a=Math.atan2((y-B.cy)/B.ry,(x-B.cx)/B.rx);return Math.cos(a-SHA)>.6&&(y-B.cy)>B.ry*.5?CL.trough():CL.shad();},{dens:1.5,len:2.8,angJ:.2,angf:tang,o:{load:.8,thin:.6,edge:.45,taper:[.2,.3],stir:.65}});
 if(sz>50)for(let i=0;i<Math.round(2*nb);i++){const a=SHA+R(-.6,.6),w=R(.7,1.1);A(a-w/2,a+w/2,R(.3,.55),CL.halfD(),sz*R(.5,.8),{load:.9,thin:.5,edge:.5,taper:[.25,.35],stir:.65});}
 // lit cap: solid, upper-left face, then a few very large sweeps over it
 cover(sector(SUNA-1.2,SUNA+1.2,.2,1.0),sz*.6,litc,{dens:1.8,len:2.4,angJ:.2,angf:tang,o:{load:near?1.3:1.1,thin:near?.22:.35,edge:.15,taper:[.1,.2],stir:.55,clean:true}});
 for(let i=0;i<Math.round(6*nb);i++){const a=SUNA+R(-.5,.5),w=R(.9,1.5),rr=R(.5,.97);A(a-w/2,a+w/2,rr,litc(),sz*R(.8,1.25),{load:near?R(1.3,1.45):R(1.05,1.2),thin:near?.22:.35,edge:.15,taper:[.1,.2],stir:.5,clean:i<2});}
 // flat-lit top plane: long strokes across the crown
 for(let i=0;i<Math.round(4*nb);i++){const a=-Math.PI/2+R(-.35,.35),w=R(1.0,1.7),rr=R(.62,.95);A(a-w/2,a+w/2,rr,litc(),sz*R(.7,1.1),{load:near?R(1.3,1.45):R(1.1,1.25),thin:near?.22:.32,edge:.12,taper:[.08,.15],stir:.5,clean:i<1});}
 // melt only the turning edge (the band perpendicular to the sun) with a few soft strokes, and a touch on the far rim
 const ta=SUNA+Math.PI/2,nb2=Math.round(sz*.025*nb)+1;
 for(let i=0;i<nb2;i++){const u=R(-.9,.9);const c=[B.cx+Math.cos(ta)*B.rx*u*.8,B.cy+Math.sin(ta)*B.ry*u*.8];const l=sz*R(.7,1.1);BL(seg(c[0],c[1],l,SUNA+R(-.3,.3),R(-.1,.1)*l,3),Math.min(50,sz*R(.4,.55)),R(.3,.4));}
 for(let i=0;i<1;i++){const a=SHA+R(-.8,.8),w=R(.6,1);const pts=[];for(let j=0;j<4;j++){const aa=lerp(a-w/2,a+w/2,j/3);const r=R(.95,1.06)*rf(aa);pts.push([B.cx+Math.cos(aa)*B.rx*r,B.cy+Math.sin(aa)*B.ry*r]);}BL(pts,Math.min(60,sz*R(.4,.6)),R(.4,.5));}
 // strokes laid back after blending: found edge on the sun side, a couple of half-tone sweeps
 for(let i=0;i<Math.round(3*nb);i++){const a=SUNA+R(-.7,.5),w=R(.4,.8);A(a-w/2,a+w/2,R(.86,.98),litc(),sz*R(.35,.6),{load:near?1.4:1.15,thin:.22,edge:0,taper:[.1,.2],stir:.5,clean:true});}
 for(let i=0;i<Math.round(2*nb);i++){const a=R(-Math.PI,Math.PI),w=R(.6,1.1);A(a-w/2,a+w/2,R(.4,.8),CL.half(),sz*R(.45,.7),{load:1,thin:.4,edge:.3,taper:[.2,.3],stir:.5});}
}
// body of a mass: halftone above, shadow below, long strokes following the horizontal
function massFill(poly,size,o){o=o||{};const [x0,y0,x1,y1]=bbox(poly);
 cover(poly,size,(x,y)=>{const u=(y-y0)/(y1-y0)+R(-.1,.1);const c=u<.5?CL.half():u<.72?CL.halfD():CL.shad();if(o.dimf){const d=o.dimf(x,y);if(d>0)c.push(['ultramarine',d*.03],['cobalt_violet',d*.03]);}return c;},
  {dens:o.dens||1.3,len:3,ang:0,angJ:.25,o:{brush:'flat',load:1,thin:.45,edge:.35,taper:[.12,.2],stir:.6}});
 blendPoly(poly,size*.9,.45,.2,Math.round(area(poly)/(size*size*5)));}
// shadow belly under a mass: thin cool paint, deepest right under the lit mass, warm reflected light low down
function belly(poly,size,o){o=o||{};const [x0,y0,x1,y1]=bbox(poly);
 cover(poly,size,(x,y)=>{const u=(y-y0)/(y1-y0);const c=u<.78?CL.shad():(p.random()<.5?CL.refl():CL.shad());if(o.dimf){const d=o.dimf(x,y);if(d>0)c.push(['ultramarine',d*.03],['cobalt_violet',d*.03]);}return c;},
  {dens:o.dens||1.4,len:3.4,ang:.02,angJ:.1,o:{brush:'flat',load:.9,thin:.6,edge:.5,taper:[.2,.3],stir:.7}});
 // smaller broken strokes of reflected light low down
 const n=Math.round((x1-x0)/110);for(let i=0;i<n;i++){const x=R(x0,x1),y=lerp(y0,y1,R(.65,.95));S(x,y,R(100,220),R(-.03,.03),CL.refl(),size*R(.4,.6),{load:.9,thin:.5,edge:.5,taper:[.3,.3],stir:.4,opacity:.8});}
 blendPoly(poly,size*.8,.45,0,Math.round(area(poly)/(size*size*6)));}
// island cast shadow factor on the deck (0..1): soft ellipse
const ISL=(x,y)=>{const dx=(x-1620)/440,dy=(y-1300)/190;const d=Math.sqrt(dx*dx+dy*dy);return clamp(1-(d-.3)/.75,0,1);};
