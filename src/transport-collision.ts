import {bodyClear,blockBody,heldBy} from './carry-collision.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Passenger,TransportGuard} from './elevator.ts';

/** The platform, riders and supported towers move as a single collision group. */
export function transportGuard(g:Game,people:Passenger[]):TransportGuard{
 return (delta,riders,goods)=>{
  const moving=new Set<LetterBlock>(goods as LetterBlock[]);
  for(const p of riders){
   const hero=people.indexOf(p)===0?'yuki':'mia',held=heldBy(g,hero);
   if(held)moving.add(held);
  }
  const ignore=[...moving].map(b=>b.id);
  return [...moving].every(b=>{
   const body=blockBody(g,b);
   return bodyClear(g,b,{...body,y:body.y+delta.y,z:body.z+delta.z},ignore,true);
  });
 };
}
