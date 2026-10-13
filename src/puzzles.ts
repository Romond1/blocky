import {abilityLayout,ABILITY_WORDS,ABILITY_BLOCKS} from './ability-layout.ts';
export {heartPuzzle,dragonPuzzle} from './finale-layout.ts';
export {abilityLayout} from './ability-layout.ts';
import {KAGE_AREAS,KAGE_WALLS,KAGE_PLATE} from './kage-alcove.ts';
import {LUMA_MEMORY,LUMA_BLOCK_POSITIONS} from './luma-alcove.ts';
import { LIGHT_BLOCK, HEAVY_BLOCK, type BlockDefinition, type WeightClass } from './blocks.ts';
export interface PuzzleDefinition {
  id: string;
  prompt: string;
  display: string[];
  answer: string;
  choices: string[];
  sequence?: string[];
  room?: RoomLayout;
  stages?: PuzzleStage[];
  blockSize?: number;
  blocks?: BlockDefinition[];
  training?: boolean;
}

export interface PuzzleStage {
  id: string; title: string; prompt: string; slots: number[]; labels: string[];
  answers: string[]; success: string; wrong: string;
}
export interface RoomObstacle {
  id: string; x: number; z: number; width: number; depth: number; height: number;
  kind: 'pillar' | 'wall' | 'platform';
}

export interface PressurePlate {
 x:number; z:number; halfSize?:number; reach?:number; accepts?:WeightClass;
 acceptedActivator?:'HERO'|'OBJECT';
 y?:number; activationMode?:'HOLD'|'TOGGLE';
}

export interface WalkArea {left:number;right:number;back:number;front:number;}
export interface RoomLayout {
  optionalAreas?:WalkArea[];
  halfWidth: number; halfDepth: number; exitHalfWidth: number; exitCenterX?:number;
  /** Optional nearer north wall; halfDepth still defines the south entrance. */
  exitZ?:number;
  sockets: PressurePlate[];
  pedestalHalfWidth: number; pedestalHalfDepth: number;
  spawn: { x: number; z: number };
  blockPositions: { x: number; z: number; y?:number }[];
  doorTravel: number;
  obstacles?: RoomObstacle[];
}

export const volcanoLayout: RoomLayout = {
 halfWidth:5.8*Math.sqrt(1.4),halfDepth:7.8*Math.sqrt(1.4),exitHalfWidth:1.5,
 sockets:[{x:-3.2,z:-3.9,halfSize:1.05,reach:2.5,accepts:'light'}],pedestalHalfWidth:.75,pedestalHalfDepth:.7,
 spawn:{x:0,z:4},blockPositions:[{x:-4.6,z:1.4},{x:.6,z:-2.2},{x:4.5,z:3.3}],doorTravel:4.6,
};

// A broad, asymmetric hall: northwest exit, staggered stations and a clear central route.
export const strengthLayout: RoomLayout = {
 halfWidth:9,halfDepth:8,exitHalfWidth:1.5,exitCenterX:-3.5,
 sockets:[{x:-4.4,z:0,halfSize:1.05,reach:2.5,accepts:'light'},{x:2.6,z:-2.8,halfSize:1.05,reach:2.5,accepts:'heavy'}],
 pedestalHalfWidth:.75,pedestalHalfDepth:.7,spawn:{x:1.5,z:5.3},
 blockPositions:[{x:-5.8,z:3.2},{x:-.8,z:-3.6},{x:5.9,z:4.7},{x:6.1,z:-.3}],doorTravel:4.6,
 obstacles:[{id:'western-rock-ledge',x:-7,z:-4,width:2,depth:3,height:1.3,kind:'platform'},
 {id:'eastern-rock-pillar',x:6.5,z:-5.5,width:1.6,depth:1.6,height:4,kind:'pillar'}],
};

export const memoryLayout: RoomLayout = {
  halfWidth: 11.8, halfDepth: 15.8, exitHalfWidth: 2.5,
  sockets: [{ x: -5, z: -10 }, { x: 0, z: -10 }, { x: 5, z: -10 }],
  pedestalHalfWidth: 1.25, pedestalHalfDepth: 1,
  spawn: { x: 0, z: 10 },
  blockPositions: [
    { x: -6, z: 5 }, { x: 6, z: 1 }, { x: -2, z: -2 },
    { x: 4, z: 8 }, { x: -7, z: -3 }, { x: 8, z: -5 }, { x: -4, z: 10 }, { x: 2, z: 4 },
  ],
  doorTravel: 7.8,
};

export const heroPuzzle: PuzzleDefinition = {
  id: 'hero',
  prompt: 'Complete HERO. Power the doorway.',
  display: ['H', '_', 'R', 'O'],
  answer: 'E',
  choices: ['A', 'E', 'X'],
  blocks: [LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK], training:true,
};

export const memoryPuzzle: PuzzleDefinition = { ...heroPuzzle, id:'memory', prompt:'Two plates. One team.', room:strengthLayout, choices:['A','E','X','HEAVY'], blocks:[LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,HEAVY_BLOCK] };

export const legacyMemoryPuzzle: PuzzleDefinition = {
  id: 'memory',
  prompt: 'Put these events in the order they happened.',
  display: ['1', '2', '3'],
  answer: '',
  // Story order is separate from the deliberately shuffled physical block positions.
  sequence: ['SAVE KAGE', 'MEET LUMA', 'MEET ARACHNE'],
  choices: ['MEET LUMA', 'SAVE KAGE', 'MEET ARACHNE', 'R', 'A', 'X', 'H', 'E'],
  room: memoryLayout,
};

export const powerLayout: RoomLayout = {
 optionalAreas:KAGE_AREAS,
 halfWidth:18,halfDepth:30,exitHalfWidth:1.5,exitCenterX:-14,exitZ:-4.5,
 sockets:[{x:-12,z:3,halfSize:1.1,accepts:'heavy'},{x:14,z:-1,halfSize:1.1,accepts:'light'},KAGE_PLATE],
 pedestalHalfWidth:1.1,pedestalHalfDepth:1.1,spawn:{x:-10,z:23},doorTravel:4.6,
 blockPositions:[{x:-14,z:0},{x:-9,z:1},{x:12,z:1},{x:15,z:3},{x:15,z:7},{x:-10,z:-16.1},{x:-5,z:-15},{x:.1,z:-19.6}],
 obstacles:[{id:'hall-west',x:-14,z:22.5,width:1,depth:15,height:3.7,kind:'wall'},{id:'hall-east',x:-6,z:22.5,width:1,depth:15,height:3.7,kind:'wall'},...KAGE_WALLS],
};
export const powerPuzzle: PuzzleDefinition = {
 id:'power',prompt:'THE SPLIT CHAMBER',display:[],answer:'',room:powerLayout,
 choices:['STRONG','FAST','M','N','S','WOLF','FOX','SPIDER'],blocks:[HEAVY_BLOCK,HEAVY_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK],
 stages:[
 {id:'yuki-strength',title:'YUKI SIDE',prompt:'YUKI IS SUPER ____.',slots:[0],labels:['YUKI'],answers:['STRONG'],success:'First lock powered. The platforms are moving!',wrong:'Try another word. Yuki is super ____.'},
 {id:'mia-jump',title:'MIA SIDE',prompt:'COMPLETE THE WORD: J U _ P',slots:[1],labels:['JUMP'],answers:['M'],success:'JUMP! The path is now safe. Return and leave together.',wrong:'Try another letter: J U _ P.'},
 ],
};


export const cooperationLayout:RoomLayout={
 halfWidth:11,halfDepth:26,exitHalfWidth:1.8,spawn:{x:6,z:22},doorTravel:4.6,
 sockets:[
  {x:-3,z:21,halfSize:1.05,acceptedActivator:'HERO'},
  {x:3,z:11,halfSize:1.05,acceptedActivator:'HERO'},
  {x:-5,z:6,halfSize:1.1,acceptedActivator:'OBJECT',accepts:'heavy'},
  {x:0,z:-12,halfSize:1.05,acceptedActivator:'HERO'},
 ],
 pedestalHalfWidth:1.1,pedestalHalfDepth:1.1,
 blockPositions:[{x:-7,z:8},{x:-3,z:-19},{x:3,z:-19},{x:-3,z:-22},{x:3,z:-22}],
 obstacles:[
  {id:'gate-west',x:-6.5,z:15,width:9,depth:.8,height:7,kind:'wall'},
  {id:'gate-east',x:6.5,z:15,width:9,depth:.8,height:7,kind:'wall'},
  {id:'bridge-housing',x:-7.05,z:-3,width:7.9,depth:12,height:7,kind:'wall'},
  {id:'workshop-west-pillar',x:-9,z:-16,width:1.4,depth:1.4,height:6,kind:'pillar'},
  {id:'workshop-east-pillar',x:9,z:-16,width:1.4,depth:1.4,height:6,kind:'pillar'},
 ],
};
export const cooperationPuzzle:PuzzleDefinition={
 id:'cooperation',prompt:'THE COOPERATION CHAMBER',display:[],answer:'',room:cooperationLayout,
 choices:['HEAVY','RED','BLUE','GREEN','YELLOW'],blocks:[HEAVY_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK],
};

/** A broad atrium with a five-unit-high north-east balcony. */
export const fruitLayout:RoomLayout={
 optionalAreas:LUMA_MEMORY.areas,
 halfWidth:14,halfDepth:12,exitHalfWidth:1.8,exitCenterX:-10,spawn:{x:-5,z:9},doorTravel:4.6,
 pedestalHalfWidth:1.1,pedestalHalfDepth:1.1,
 sockets:[
  {x:-5,z:-9,accepts:'light',acceptedActivator:'OBJECT',reach:2.5},
  {x:0,z:-9,accepts:'light',acceptedActivator:'OBJECT',reach:2.5},
  {x:5,z:-9,accepts:'light',acceptedActivator:'OBJECT',reach:2.5},
  {x:5,z:1,acceptedActivator:'HERO',activationMode:'TOGGLE'},
  {x:5,z:-5,y:5,acceptedActivator:'HERO',activationMode:'TOGGLE'},
  LUMA_MEMORY.plate,
 ],
 blockPositions:[{x:-8,z:3,y:0},{x:6,z:-3.3,y:5},{x:10.5,z:-3.3,y:5},{x:12.3,z:-3.3,y:5},{x:-1,z:4,y:0},...LUMA_BLOCK_POSITIONS],
 obstacles:[{id:'west-pillar',x:-12,z:0,width:1.2,depth:1.2,height:10,kind:'pillar'},...LUMA_MEMORY.walls],
};
export const fruitPuzzle:PuzzleDefinition={id:'fruit',prompt:'THE FRUIT LIFT',display:[],answer:'',choices:['APPLE','BANANA','PEAR','ORANGE','GRAPE','WOLF','FOX','SPIDER'],room:fruitLayout,blocks:Array.from({length:8},()=>({...LIGHT_BLOCK}))};

/** Sideways crossing into a long northbound processing hall and offset upper gallery. */
export const sortingLayout:RoomLayout={
 halfWidth:16,halfDepth:28,exitHalfWidth:1.8,exitCenterX:-12,spawn:{x:-13,z:24},doorTravel:4.6,
 pedestalHalfWidth:1.05,pedestalHalfDepth:1.05,
 sockets:[
  ...[-8,-1,6].flatMap(x=>[-1.25,1.25].map(dx=>({x:x+dx,z:-19,halfSize:1.05,reach:2.5,accepts:'light' as const,acceptedActivator:'OBJECT' as const}))),
  {x:-13,z:12,halfSize:1.1,accepts:'heavy',acceptedActivator:'OBJECT'},
  {x:5,z:14,halfSize:1.05,acceptedActivator:'HERO'},
  {x:5,z:1,acceptedActivator:'HERO',activationMode:'TOGGLE'},
  {x:5,z:-5,y:5,acceptedActivator:'HERO',activationMode:'TOGGLE'},
 ],
 blockPositions:[{x:-13,z:18,y:0},{x:7,z:-3.5,y:5},{x:4.5,z:5,y:0},{x:12,z:-4,y:5},{x:7,z:7,y:0},{x:10,z:-7,y:5},{x:13,z:4,y:0},{x:5,z:19,y:0},{x:13,z:-10,y:5},{x:12,z:20,y:0}],
 obstacles:[
  {id:'west-divider',x:-6.5,z:8,width:19,depth:1,height:9,kind:'wall'},
  {id:'slab-housing',x:-3,z:9.9,width:12,depth:3.2,height:8,kind:'wall'},
  {id:'gallery-centre-support',x:9.25,z:-8.5,width:.8,depth:.8,height:5.15,kind:'pillar'},
  {id:'gallery-pillar',x:14.5,z:-13,width:1.1,depth:1.1,height:8,kind:'pillar'},
  {id:'foundry-west-pillar',x:-14,z:-13,width:1.3,depth:1.3,height:8,kind:'pillar'},
 ],
};
export const sortingPuzzle:PuzzleDefinition={id:'sorting',prompt:'THE SORTING FOUNDRY',display:[],answer:'',room:sortingLayout,
 choices:['HEAVY','RED','APPLE','PEAR','GREEN','YELLOW','BANANA','BLUE','ORANGE','GRAPE'],
 blocks:[HEAVY_BLOCK,...Array.from({length:9},()=>({...LIGHT_BLOCK}))],
};

export const actionLayout:RoomLayout={
 halfWidth:18,halfDepth:35,exitZ:-28,exitCenterX:12,exitHalfWidth:1.8,spawn:{x:1,z:31.5},doorTravel:4.6,
 pedestalHalfWidth:1.05,pedestalHalfDepth:1.05,
 sockets:[...[-7,0,7].map(x=>({x,z:-21,accepts:'light' as const,acceptedActivator:'OBJECT' as const,reach:2.5})),
 ...[{x:-4,z:2.5},{x:-4,z:-14.5}].map(p=>({...p,acceptedActivator:'HERO' as const,activationMode:'TOGGLE' as const}))],
 blockPositions:[{x:-11,z:10.3,y:.3},{x:0,z:12.4,y:4.75},{x:12,z:12,y:3.8},{x:10,z:21,y:0},{x:13,z:22.2,y:0},{x:14.4,z:21,y:0},{x:15.8,z:22.2,y:0}],
 obstacles:[{id:'run-west',x:-12.5,z:17,width:.7,depth:15,height:2.5,kind:'wall'},
 {id:'run-east',x:-7.5,z:17,width:.7,depth:15,height:2.5,kind:'wall'},
 {id:'run-end',x:-10,z:8.8,width:5.7,depth:.6,height:5.5,kind:'wall'},
 {id:'east-spire',x:16,z:16,width:1.5,depth:1.5,height:8,kind:'pillar'},
 {id:'far-west-spire',x:-16,z:-17,width:1.5,depth:1.5,height:9,kind:'pillar'},
 ...[-7,0,7].map((x,i)=>({id:`action-image-${i}`,x,z:-23.5,width:4,depth:.5,height:4.4,kind:'wall' as const}))],
};
export const actionPuzzle:PuzzleDefinition={id:'action',prompt:'Collect RUN, JUMP and LIFT. Match the words across the lava.',display:[],answer:'',room:actionLayout,
 choices:['RUN','JUMP','LIFT','','','',''],blocks:[LIGHT_BLOCK,LIGHT_BLOCK,LIGHT_BLOCK,{...HEAVY_BLOCK,size:2.2,carrySpeedMultiplier:.4},{...LIGHT_BLOCK,size:.8},{...LIGHT_BLOCK,size:.8},{...LIGHT_BLOCK,size:.8}]};

export const abilityPuzzle:PuzzleDefinition={id:'ability',prompt:'',display:[],answer:'',room:abilityLayout,choices:ABILITY_WORDS,blocks:ABILITY_BLOCKS};
