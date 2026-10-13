import type {PressurePlate} from './puzzles.ts';
import type {Position,Motion} from './split-mechanics.ts';
import {acceptsPlate,type BlockDefinition} from './blocks.ts';
/** Trigger occupancy is based on feet, not horizontal projection of a jumping hero. */
export function heroOnPlate(plate:PressurePlate,hero:Position,motion:Motion,required=true){
 const half=plate.halfSize??1.05;
 return required&&plate.acceptedActivator==='HERO'&&motion.grounded&&motion.y>=(plate.y??0)-.02&&motion.y<=(plate.y??0)+.34&&Math.abs(hero.x-plate.x)<=half-.12&&Math.abs(hero.z-plate.z)<=half-.12;
}
export function objectOnPlate(plate:PressurePlate,block:BlockDefinition&Position&{state:string;y?:number}){
 return plate.acceptedActivator!=='HERO'&&block.state!=='carried'&&(block.y??0)<.35&&acceptsPlate(block,plate)&&Math.abs(block.x-plate.x)<.6&&Math.abs(block.z-plate.z)<.6;
}
