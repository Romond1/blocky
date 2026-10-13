import type {LetterBlock} from './game.ts';
type Point={x:number;z:number};
/** A small face-alignment assist; no grid, broad keep-out circles or remote relocation. */
export function dropPoints(block:LetterBlock,blocks:LetterBlock[],player:Point,facing:number,reach=1.25){
 const forward={x:Math.sin(facing),z:Math.cos(facing)},points:Point[]=[];
 const add=(p:Point)=>{
  const dx=p.x-player.x,dz=p.z-player.z;
  if(dx*forward.x+dz*forward.z<.4||Math.hypot(dx,dz)>2.8||points.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<.005))return;
  points.push(p);
 };
 for(const distance of [Math.max(reach,block.size/2+.5),1.65,2,2.5,block.size/2+.5]){
  const aim={x:player.x+forward.x*distance,z:player.z+forward.z*distance};add(aim);
  const nearby:Point[]=[];
  for(const other of blocks){
   if(other===block||other.hidden||other.state==='carried')continue;
   const half=(block.size+other.size)/2+.015;
   for(const sign of [-1,1]){
    const x=other.x+sign*half,z=other.z+sign*half;
    if(Math.abs(x-aim.x)<=.35&&Math.abs(aim.z-other.z)<half)nearby.push({x,z:aim.z});
    if(Math.abs(z-aim.z)<=.35&&Math.abs(aim.x-other.x)<half)nearby.push({x:aim.x,z});
   }
  }
  nearby.sort((a,b)=>Math.hypot(a.x-aim.x,a.z-aim.z)-Math.hypot(b.x-aim.x,b.z-aim.z)).forEach(add);
 }
 return points;
}
