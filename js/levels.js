// Ops: F x w = floor gap | C x w = ceiling gap | B x y w h = block | S x y w = spikes | o x y n = coins | K x = checkpoint | D x1 x2 y = patrol drone
export const T=40,H=14;
export const WORLDS=[
{name:'BOOT SEQUENCE',w:80,par:70,ops:[['o',6,12,3],['B',12,10,3,1],['o',12,9,3],['S',19,12,2],['o',19,10,2],['K',26],['F',30,4],['o',30,1,4],['B',40,11,2,2],['S',46,12,4],['o',46,9,4],['K',54],['B',60,8,2,5],['o',60,1,2],['F',68,3],['o',68,1,3]]},
{name:'COOLANT LINES',w:95,par:90,ops:[['o',7,12,3],['S',12,12,3],['B',18,10,3,1],['S',22,12,5],['F',30,4],['o',30,1,4],['S',34,1,5],['K',40],['S',46,12,8],['o',46,1,8],['S',55,1,4],['o',55,12,4],['B',62,7,2,6],['K',66],['F',70,3],['C',74,3],['o',74,12,3],['S',80,12,3],['B',84,10,2,1],['o',84,9,2],['S',88,12,2]]},
{name:'DRONE FOUNDRY',w:105,par:110,ops:[['o',7,12,3],['D',14,20,11],['S',24,12,2],['F',28,3],['B',34,9,3,1],['D',33,40,11],['K',44],['S',46,12,6],['F',54,4],['C',58,4],['o',54,1,4],['D',62,72,1],['B',66,8,2,5],['K',70],['K',74],['S',78,12,3],['S',84,1,3],['D',80,92,11],['F',92,3],['B',98,10,2,3],['o',100,12,2]]},
{name:'FLIPSHIFT CORE',w:120,par:140,ops:[['o',7,12,3],['S',12,12,4],['F',20,3],['o',20,1,3],['S',23,1,4],['D',26,36,11],['K',38],['B',42,8,2,5],['S',48,12,6],['S',56,1,5],['D',50,62,1],['K',64],['F',68,3],['o',68,1,3],['C',72,3],['F',76,3],['B',82,10,2,1],['S',86,12,5],['D',84,96,11],['K',98],['S',100,1,4],['S',106,12,4],['F',110,3],['o',110,1,3],['B',113,9,2,4]]}
];
export function build(def){
  const w=def.w,g=[];for(let y=0;y<H;y++)g.push(new Uint8Array(w));
  g[0].fill(1);g[H-1].fill(1);
  const L={w,g,coins:[],chk:[],drones:[],start:{x:2*T+8,y:(H-1)*T-32},exit:w-3,def};
  for(const[op,a,b,c,d]of def.ops){
    if(op==='F')for(let i=0;i<b;i++)g[H-1][a+i]=0;
    else if(op==='C')for(let i=0;i<b;i++)g[0][a+i]=0;
    else if(op==='B')for(let y=b;y<b+d;y++)for(let x=a;x<a+c;x++)g[y][x]=1;
    else if(op==='S')for(let i=0;i<c;i++)g[b][a+i]=2;
    else if(op==='o')for(let i=0;i<c;i++)L.coins.push({x:(a+i)*T+20,y:b*T+20});
    else if(op==='K')L.chk.push({x:a});
    else if(op==='D')L.drones.push({x1:a,x2:b,y:c,ph:L.drones.length*1.7});
  }
  for(let y=0;y<H;y++)for(let x=0;x<w;x++)if(g[y][x]===2)g[y][x]=(g[y+1]&&g[y+1][x]===1)?2:(g[y-1]&&g[y-1][x]===1)?3:2; // 2 = base bottom, 3 = base top
  return L;
}
