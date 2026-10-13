import {KAGE_MEMORY,type MemoryRoomDefinition} from './kage-alcove.ts';

// Mirror the existing gallery so this corridor turns left from beside PEAR.
const round=(n:number)=>Math.round(n*100)/100;
const point=(p:{x:number;z:number})=>({x:round(-p.x-6.2),z:round(p.z-7.5)});
export const LUMA_MEMORY:MemoryRoomDefinition={
 character:'Luma',answer:'FOX',slot:5,eventPrefix:'LUMA',assetFolder:'luma',
 transform:{scaleX:-1,offsetX:-6.2,offsetZ:-7.5},
 entrance:point(KAGE_MEMORY.entrance),plate:{...KAGE_MEMORY.plate,...point(KAGE_MEMORY.plate)},
 gate:{...KAGE_MEMORY.gate,...point(KAGE_MEMORY.gate)},crystal:{...point(KAGE_MEMORY.crystal),y:0},
 areas:KAGE_MEMORY.areas.map(a=>({left:round(-a.right-6.2),right:round(-a.left-6.2),back:round(a.back-7.5),front:round(a.front-7.5)})),
 walls:KAGE_MEMORY.walls.map(w=>({...w,...point(w),id:w.id.replace('kage-','luma-')})),
 pictures:[{file:'closeup.jpeg',height:3.4*1296/3024},{file:'exit.jpeg',height:3.4*1296/3024},{file:'portrait.png',width:2,height:2*939/748}],
};
export const LUMA_BLOCK_POSITIONS=[{x:3.8,z:-23.6},{x:-1.2,z:-22.5},{x:-6.3,z:-27.1}];
