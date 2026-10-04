// helpers shared through p.h
const H = p.h = {};
H.S = o => p.stroke(o);
H.crest=[[110,472],[165,444],[215,405],[270,360],[330,334],[385,330],[440,346],[520,368],[650,380],[800,388],[920,397],[1000,410]];
H.base=[[100,528],[300,524],[500,532],[700,526],[900,512],[1000,506]];
H.lerp = (a,b,t)=>a+(b-a)*t;
// sample polyline y at x (pts sorted by x)
H.at = (pts,x)=>{ if(x<=pts[0][0])return pts[0][1]; for(let i=1;i<pts.length;i++){ if(x<=pts[i][0]){const t=(x-pts[i-1][0])/(pts[i][0]-pts[i-1][0]);const s=t*t*(3-2*t);return pts[i-1][1]+(pts[i][1]-pts[i-1][1])*s;}} return pts[pts.length-1][1]; };
// path along a curve with gentle wobble
H.path = (pts,x0,x1,dy,wob=2,n=8)=>{ const r=[]; for(let i=0;i<=n;i++){const x=H.lerp(x0,x1,i/n); r.push([x,H.at(pts,x)+dy+p.rand(-wob,wob),0.55+0.4*Math.sin(i/n*Math.PI)]);} return r; };
// fill the band between curves top and bot with rows of broken strokes
H.fill = (top,bot,x0,x1,rows,col,size,o={})=>{
  for(let r=0;r<rows;r++){
    const t=(r+0.5)/rows;
    let x=x0+p.rand(-30,10);
    while(x<x1){
      const len=p.rand(o.minLen||120,o.maxLen||320);
      const xe=Math.min(x1+20,x+len);
      const pts=[]; const n=5;
      for(let i=0;i<=n;i++){const xx=H.lerp(x,xe,i/n);
        const yt=H.at(top,xx),yb=H.at(bot,xx);
        pts.push([xx,H.lerp(yt,yb,t)+p.rand(-(o.wob||3),(o.wob||3)),o.pr||0.7]);}
      const c=typeof col==='function'?col(t,x):col;
      H.S(Object.assign({points:pts,color:c,size:size*p.rand(0.8,1.2),brush:o.brush||'flat',load:o.load||0.9,thin:o.thin===undefined?0.3:o.thin},o.extra||{}));
      x=xe-p.rand(10,50);
    }
  }
};
const D=()=>[['burnt_umber',2],['ultramarine',1.5],['viridian',0.3]];
const L=(pts,w,col=D(),o={})=>H.S(Object.assign({points:pts,color:col,brush:'round',size:w,thin:0.8,load:0.5},o));
// horizon
L([[0,256,.6],[300,258,.7],[700,255,.7],[1000,256,.6]],5);
// headland
L([[0,205,.6],[70,182,.7],[150,168,.8],[240,172,.8],[300,196,.8],[350,228,.7],[392,254,.6]],7);
L([[392,254,.5],[372,268,.6],[330,300,.6],[260,340,.6],[150,380,.5],[0,400,.5]],6);
// wave crest and face
L(H.crest.map(a=>[a[0],a[1],.7]),8);
L([[120,525,.5],[300,520,.6],[500,530,.7],[700,524,.7],[900,508,.6],[1000,502,.6]],6);
// foam wash in front
L([[0,606,.5],[200,585,.6],[420,590,.6],[600,612,.6],[800,596,.6],[1000,588,.6]],6);
// cloud masses
L([[0,118,.5],[200,130,.6],[430,112,.6],[700,98,.6],[1000,90,.5]],8);
L([[600,222,.5],[760,200,.6],[940,218,.5]],6);
p.dry();
// blender: long soft drags along curves between top and bot
H.blend = (top,bot,x0,x1,rows,size,o={})=>{
  for(let r=0;r<rows;r++){
    const t=(r+p.rand(.1,.9))/rows;
    let x=x0+p.rand(-40,20);
    while(x<x1){
      const len=p.rand(o.minLen||180,o.maxLen||420); const xe=Math.min(x1+30,x+len);
      const pts=[]; for(let i=0;i<=5;i++){const xx=H.lerp(x,xe,i/5); pts.push([xx,H.lerp(H.at(top,xx),H.at(bot,xx),t)+p.rand(-(o.wob||3),(o.wob||3)),.7]);}
      H.S({points:pts,brush:o.brush||'filbert',size:size*p.rand(.8,1.2),load:0,color:'titanium_white'});
      x=xe-p.rand(20,80);
    }
  }
};
H.cluster=(cx,cy,rx,ry,n,colf,smin,smax,ang,o={})=>{
  for(let i=0;i<n;i++){
    const u=(p.random()+p.random()+p.random())/3*2-1, v=(p.random()+p.random()+p.random())/3*2-1;
    const x=cx+u*rx, y=cy+v*ry; const a=ang+p.rand(-.5,.5)+(o.curve?v*o.curve:0); const L=p.rand(o.l0||12,o.l1||40);
    H.S({points:[[x-Math.cos(a)*L/2,y-Math.sin(a)*L/2,.5],[x,y+p.rand(-2,2),.8],[x+Math.cos(a)*L/2,y+Math.sin(a)*L/2,.4]],color:colf(),size:p.rand(smin,smax),brush:o.brush||'filbert',load:o.load||.8,thin:o.thin||.2});
  }
};
