import {LIGHT_BLOCK,HEAVY_BLOCK} from './blocks.ts';
import type {SentenceCarouselConfig} from './sentence-carousel.ts';
import type {RoomLayout} from './puzzles.ts';

export interface SentenceDefinition {
 id:string; hero:'mia'|'yuki'; action:'RUN'|'LIFT'|'JUMP'; section:1|2|3;
 answer:readonly string[]; fixed:number; slots:readonly number[]; x:number; z:number;
}
export const ABILITY_SCALE=1.4;
const sentenceDefinitions:SentenceDefinition[]=[
 {id:'see-mia-can-run',hero:'mia',action:'RUN',section:1,answer:['MIA','CAN','RUN'],fixed:0,slots:[18,19,0],x:-17,z:17},
 {id:'see-yuki-can-lift',hero:'yuki',action:'LIFT',section:1,answer:['YUKI','CAN','LIFT'],fixed:0,slots:[20,21,1],x:-7.5,z:17},
 {id:'mia-can-run',hero:'mia',action:'RUN',section:2,answer:['MIA','CAN','RUN'],fixed:0,slots:[2,3,4],x:10/1.4,z:-4.5/1.4},
 {id:'yuki-can-lift',hero:'yuki',action:'LIFT',section:2,answer:['YUKI','CAN','LIFT'],fixed:0,slots:[5,6,7],x:40/1.4,z:-5.5/1.4},
 {id:'mia-can-jump',hero:'mia',action:'JUMP',section:3,answer:['MIA','CAN','JUMP'],fixed:0,slots:[8,9,10],x:12/1.4,z:-25/1.4},
 {id:'yuki-can-jump',hero:'yuki',action:'JUMP',section:3,answer:['YUKI','CAN','JUMP'],fixed:0,slots:[11,12,13],x:40/1.4,z:-26/1.4},
];
export const ABILITY_SENTENCES:readonly SentenceDefinition[]=sentenceDefinitions.map(d=>({...d,x:d.x*ABILITY_SCALE,z:d.z*ABILITY_SCALE}));
export const ABILITY_WORDS=['RUN','LIFT','MIA','YUKI','CAN','CAN','RUN','JUMP','LIFT','MIA','YUKI','CAN','CAN','JUMP','JUMP','RUN','LIFT','MIA','CAN','YUKI','CAN'];
export const ABILITY_HEAVY_IDS:number[]=[];
export const ABILITY_BLOCKS=ABILITY_WORDS.map((_,i)=>({...ABILITY_HEAVY_IDS.includes(i)?HEAVY_BLOCK:LIGHT_BLOCK}));
export const ABILITY_STEPS=[{x:22,z:-4,y:.6,width:2,depth:1.7},{x:22,z:-6,y:1.2,width:2,depth:1.7}].map(s=>({...s,x:s.x*ABILITY_SCALE,z:s.z*ABILITY_SCALE,width:s.width*ABILITY_SCALE,depth:s.depth*ABILITY_SCALE}));
const baseLayout:RoomLayout={
 halfWidth:24,halfDepth:28,exitZ:-24,exitCenterX:10,exitHalfWidth:1.8,spawn:{x:-10,z:22.5},doorTravel:4.6,
 pedestalHalfWidth:1.05,pedestalHalfDepth:1.05,
 sockets:[...Array.from({length:14},(_,slot)=>{const d=sentenceDefinitions.find(d=>d.slots.includes(slot))!;return {x:d.x+(d.slots.indexOf(slot)-1)*2.4,z:d.z,halfSize:1.05,reach:2.3,acceptedActivator:'OBJECT' as const,accepts:'light' as const};}),
 {x:-5,z:7,halfSize:.9,acceptedActivator:'HERO'},{x:5,z:7,halfSize:.9,acceptedActivator:'HERO'}],
 blockPositions:[{x:-14.6,z:20},{x:-5.1,z:20},
 ...[{x:5,z:5.8},{x:17,z:7.8},{x:8,z:5.8},{x:20,z:7.8},{x:11,z:5.8},{x:13,z:7.8},{x:22.5,z:5.8}],
 ...[{x:5,z:-10},{x:17,z:-8.8},{x:8,z:-10},{x:20,z:-8.8},{x:11,z:-10},{x:22.5,z:-8.8},{x:13,z:-10},{x:15,z:-10}],{x:-19.4,z:20},{x:-17,z:20},{x:-9.9,z:20},{x:-7.5,z:20}],
 obstacles:[
 {id:'inner-volcanic-mass',x:-10.5,z:-10,width:27,depth:28,height:13,kind:'wall'},
 {id:'entrance-east-wall',x:10.5,z:19,width:27,depth:18,height:13,kind:'wall'},
 {id:'corner-pillar',x:-2.4,z:11.4,width:1.2,depth:1.2,height:10,kind:'pillar'},
 ],
};

/** Expand spacing, not the familiar light blocks or socket pads. */
export const abilityLayout:RoomLayout={...baseLayout,
 optionalAreas:[{left:4.2,right:48,back:-33.6,front:14}],
 halfWidth:baseLayout.halfWidth*ABILITY_SCALE,halfDepth:baseLayout.halfDepth*ABILITY_SCALE,
 exitZ:baseLayout.exitZ!*ABILITY_SCALE,exitCenterX:25,
 spawn:{x:baseLayout.spawn.x*ABILITY_SCALE,z:baseLayout.spawn.z*ABILITY_SCALE},
 sockets:[...baseLayout.sockets.map(s=>({...s,x:s.x*ABILITY_SCALE,z:s.z*ABILITY_SCALE})),
 {x:25,z:8.3,halfSize:1.05,acceptedActivator:'HERO'},
 {x:25,z:-13.3,halfSize:1.05,acceptedActivator:'HERO'},
 ...sentenceDefinitions.filter(d=>d.section===1).flatMap(d=>d.slots.slice(0,2).map((_,i)=>({x:(d.x+(i-1)*2.4)*ABILITY_SCALE,z:d.z*ABILITY_SCALE,halfSize:1.05,reach:2.3,acceptedActivator:'OBJECT' as const,accepts:'light' as const})))],
 blockPositions:baseLayout.blockPositions.map(p=>({...p,x:p.x*ABILITY_SCALE,z:p.z*ABILITY_SCALE})),
 obstacles:[...baseLayout.obstacles!.map(o=>({...o,x:o.x*ABILITY_SCALE,z:o.z*ABILITY_SCALE,width:o.width*ABILITY_SCALE,depth:o.depth*ABILITY_SCALE})),
 {id:'main-south-extension-wall',x:40.8,z:26.6,width:14.4,depth:25.2,height:13,kind:'wall'}],
};

export const ABILITY_CAROUSELS:readonly SentenceCarouselConfig[]=[
 {id:'ability-words',position:{x:25,z:0},radius:5.3,speed:.22,direction:1,wordBlocks:[2,3,4,5,6,7,8],brakeControlId:16,pickupPorts:[{angle:Math.atan2(-4.5,-15),halfAngle:.36},{angle:Math.atan2(-5.5,15),halfAngle:.36}]},
 {id:'jump-words',position:{x:25,z:-22},radius:5.3,speed:.264,direction:-1,wordBlocks:[9,10,11,12,13,14,15,16],brakeControlId:17,initialAngle:Math.PI/6,pickupPorts:[{angle:Math.atan2(-3,-13),halfAngle:.36},{angle:Math.atan2(-4,15),halfAngle:.36}]},
];
export const ABILITY_RECOVERY=[{x:39,z:9},{x:39,z:-14}];
