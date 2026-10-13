import {LiftTransport,FRUIT_GALLERY} from './lift-transport.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Hero,Position} from './split-mechanics.ts';
export const FRUIT_ANSWERS=['APPLE','BANANA','PEAR'];
export const BALCONY=FRUIT_GALLERY;
export const FRUIT_BANKS=[[-14,14,2.5,12],[-14,3,-12,2.5],[3,6.5,-12,2.5],[13.5,14,-2.5,2.5],[6.5,14,-12,-2.5]];
export function balcony(p:Position){return p.x>=BALCONY.left&&p.x<=BALCONY.right&&p.z>=BALCONY.back&&p.z<=BALCONY.front;}
export class FruitLift extends LiftTransport {
 constructor(){super(FRUIT_GALLERY,3,true);}
 matches=[false,false,false];
 tick(dt:number,g:Game,actors:Record<Hero,Position>){this.tickLift(dt,g,actors);}
 place(g:Game,b:LetterBlock,index:number){
  if(g.placed[index]){g.say('Set your block down, then remove the block on the plate.');return;}
  if(!g.canPlaceBlock(b,{...g.layout.sockets[index],y:.29})){g.say('The block needs a clear path to the plate.');return;}
  Object.assign(b,{state:'socket',carrier:undefined,slot:index,x:g.layout.sockets[index].x,z:g.layout.sockets[index].z,y:.29});
  const correct=b.text===FRUIT_ANSWERS[index];this.matches[index]=correct;g.attempts++;
  if(!correct){g.rejectionTime=1.2;g.say('Try another picture.');}else g.emit('FRUIT_MATCHED');
  g.solved=this.matches.every(Boolean);if(g.solved)g.emit('FRUIT_PUZZLE_COMPLETE');
 }
}
