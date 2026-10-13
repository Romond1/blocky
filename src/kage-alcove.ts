import type {Game,LetterBlock} from './game.ts';
import type {PressurePlate,RoomObstacle,WalkArea} from './puzzles.ts';
export const KAGE_ENTRANCE={x:-17,z:-4.5};
export const KAGE_PLATE={x:-5,z:-18.8,halfSize:.7,reach:2.2,accepts:'light' as const,acceptedActivator:'OBJECT' as const};
export const KAGE_GATE={x:-12,z:-23.1,halfWidth:1.8};
export const KAGE_CRYSTAL={x:-12,y:0,z:-26};
export const KAGE_WALL_HEIGHT=6.5;
export const KAGE_AREAS:WalkArea[]=[
 {left:-17.8,right:-16.2,back:-14.3,front:-3.5},
 {left:-17.8,right:-14,back:-14.3,front:-12.3},
 {left:-15,right:2,back:-23,front:-11.5},
 {left:-13.8,right:-10.2,back:-28,front:-22.2},
];
const wall=(id:string,x:number,z:number,width:number,depth:number):RoomObstacle=>({id:`kage-${id}`,x,z,width,depth,height:KAGE_WALL_HEIGHT,kind:'wall'});
export const KAGE_WALLS:RoomObstacle[]=[
 wall('passage-west',-18,-9.4,.4,9.8),wall('passage-east',-16,-8.4,.4,7.8),
 wall('turn-north',-16.5,-14.5,3,.4),wall('turn-south',-15.6,-12.1,1.2,.4),
 wall('room-west-front',-15.2,-11.8,.4,1),wall('room-west-back',-15.2,-18.75,.4,8.9),
 wall('room-south',-6.5,-11.3,17.8,.4),wall('room-east',2.2,-17.25,.4,11.9),
 wall('room-north-west',-14.6,-23.2,1.6,.4),wall('room-north-east',-3.9,-23.2,12.6,.4),
 wall('reward-west',-14,-25.6,.4,5.2),wall('reward-east',-10,-25.6,.4,5.2),wall('reward-north',-12,-28.2,4.4,.4),
];
export interface MemoryRoomDefinition {
 character:string;answer:string;slot:number;eventPrefix:string;
 areas:WalkArea[];walls:RoomObstacle[];entrance:{x:number;z:number};plate:PressurePlate;
 gate:{x:number;z:number;halfWidth:number};crystal:{x:number;y:number;z:number};
 transform:{scaleX:number;offsetX:number;offsetZ:number};pictures:{file:string;height:number;width?:number}[];assetFolder:string;
}
export const KAGE_MEMORY:MemoryRoomDefinition={character:'Kage',answer:'WOLF',slot:2,eventPrefix:'KAGE',areas:KAGE_AREAS,walls:KAGE_WALLS,entrance:KAGE_ENTRANCE,plate:KAGE_PLATE,gate:KAGE_GATE,crystal:KAGE_CRYSTAL,transform:{scaleX:1,offsetX:0,offsetZ:0},assetFolder:'kage',pictures:[{file:'portrait.jpeg',height:.64*3.4/1.48},{file:'decides.jpeg',height:.64*3.4/1.48},{file:'armor.png',height:.85*3.4/1.48}]};
export function insideArea(p:{x:number;z:number},area:WalkArea,margin=0){return p.x>=area.left+margin&&p.x<=area.right-margin&&p.z>=area.back+margin&&p.z<=area.front-margin;}
export function inKageAlcove(p:{x:number;z:number}){return KAGE_AREAS.some(a=>insideArea(p,a));}
/** Optional puzzle: never writes Game.solved, main stages or bridge state. */
export class KageAlcove {
 readonly definition:MemoryRoomDefinition;
 constructor(definition:MemoryRoomDefinition=KAGE_MEMORY){this.definition=definition;}
 solved=false;gateLift=0;
 contains(p:{x:number;z:number}){return this.definition.areas.some(a=>insideArea(p,a));}
 tick(dt:number,g:Game){
  const {slot,answer,gate}=this.definition;
  this.solved=g.placed[slot]?.text===answer&&g.placed[slot]?.weightClass==='light';
  const under=(Object.entries(g.actors??{[g.controlledHero]:g.player}) as ['yuki'|'mia',{x:number;z:number}][]).filter(([,p])=>Math.abs(p.z-gate.z)<.5&&Math.abs(p.x-gate.x)<gate.halfWidth+.38);
  const clearance=under.length?Math.max(...under.map(([hero])=>g.motion[hero].y+2.8)):0;
  this.gateLift=this.solved?Math.min(3.6,this.gateLift+dt*5):Math.max(clearance,this.gateLift-dt*5);
 }
 canPass(p:{x:number;z:number},height:number){
  const {gate}=this.definition;
  if(Math.abs(p.z-gate.z)<.65&&Math.abs(p.x-gate.x)<gate.halfWidth+.38&&this.gateLift<height+2.8)return false;
  return true;
 }
 place(g:Game,b:LetterBlock){
  const {slot,plate,character,answer,eventPrefix}=this.definition;
  if(g.placed[slot]){g.say('Set your block down, then remove the block on the plate.');return;}
  if(!g.canPlaceBlock(b,{...plate,y:.29})){g.say('The block needs a clear path to the plate.');return;}
  Object.assign(b,{state:'socket',carrier:undefined,slot,x:plate.x,z:plate.z,y:.29});
  this.tick(0,g);g.attempts++;g.emit(`${eventPrefix}_MEMORY_${this.solved?'SOLVED':'WRONG'}`);
  if(!this.solved)g.rejectionTime=1.2;
  g.say(this.solved?`${character} is a ${answer}. A memory awakens!`:`What animal is ${character}? Try another block.`);
 }
 snapshot(){return {solved:this.solved,gateLift:this.gateLift};}
}
