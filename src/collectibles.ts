import type {Game} from './game.ts';
import type {Economy} from './economy.ts';
import {ROOM_COLLECTIBLES,type CollectibleDefinition} from './collectible-data.ts';

export function collectibleAvailable(c:CollectibleDefinition,g:Game,e:Economy){return !e.has(c.id)&&(c.access!=='raisedFruitLift'||g.fruit?.lift.state==='UP')&&(c.type==='memoryCrystal'?!!g.memory?.solved&&g.memory.gateLift>2.8:c.type!=='heartShard'||g.solved&&g.doorLift>2.8);}
/** Locked rewards can be glimpsed before their path is available. */
export function collectibleVisible(c:CollectibleDefinition,g:Game,e:Economy){return c.type==='heartShard'?collectibleAvailable(c,g,e):!e.has(c.id);}
/** Deliberately receives Game.player, never the autonomous companion. */
export function collectNearby(g:Game,e:Economy):CollectibleDefinition[]{
 const collected:CollectibleDefinition[]=[];
 for(const c of ROOM_COLLECTIBLES[g.puzzle.id]??[]){
  if(!collectibleAvailable(c,g,e))continue;
  if(Math.abs(g.motion[g.controlledHero].y-c.position.y)>1.05)continue;
  if(Math.hypot(g.player.x-c.position.x,g.player.z-c.position.z)>(c.type==='heartShard'?1.6:1))continue;
  // Static walls may not be bypassed with a generous pickup radius.
  const blocked=g.layout.obstacles?.some(o=>{
   for(let i=0;i<=10;i++){const t=i/10,x=g.player.x+(c.position.x-g.player.x)*t,z=g.player.z+(c.position.z-g.player.z)*t;
    if(Math.abs(x-o.x)<o.width/2&&Math.abs(z-o.z)<o.depth/2)return true;
   }return false;
  });
  if(blocked)continue;
  if(e.collect(c)){collected.push(c);g.emit(c.type==='coin'?'HERO_COIN_COLLECTED':c.type==='memoryCrystal'?'MEMORY_CRYSTAL_COLLECTED':'HEART_SHARD_COLLECTED');}
 }
 return collected;
}
