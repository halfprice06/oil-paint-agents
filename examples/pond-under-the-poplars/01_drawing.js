// DRAWING: thin dark lines placing the big masses, kept inside the shapes so no ridges ghost into the sky
const R=p.rand;
const D=()=>[['burnt_umber',R(1.5,2)],['ultramarine',R(.7,1.1)],['alizarin_crimson',R(0,.15)]];
const S=(pts,size,o={})=>p.stroke(Object.assign({points:pts,color:D(),brush:'round',size,load:.5,thin:.8},o));
// big tree: inset outline and the light/shadow division
S([[110,400],[80,330],[84,250],[110,170],[170,90],[230,70],[290,90],[340,150],[360,250],[350,340],[330,400]],8);
S([[250,100],[300,170],[330,260],[350,330]],7);
// trunks
S([[214,470],[214,410]],8);S([[262,470],[258,420]],7);
// second tree, inset
S([[460,440],[462,330],[490,290],[508,340],[510,440]],7);
// horizon and bank lines
S([[0,470],[300,452],[560,478],[800,470],[1000,490]],8);
S([[0,600],[150,570],[330,580],[420,600]],9);
S([[520,640],[700,610],[850,600],[1000,612]],9);
p.dry();
