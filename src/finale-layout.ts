import type {RoomLayout,PuzzleDefinition} from './puzzles.ts';
import {LIGHT_BLOCK,HEAVY_BLOCK} from './blocks.ts';
import {DRAGON_WORDS,DRAGON_PANELS,DRAGON_CONTROLS,DRAGON_CAROUSEL,dragonRadii,dragonHeight} from './dragon-layout.ts';

export const HEART_WORDS=['MIA','CAN','RUN','FAST','YUKI','CAN','LIFT','BLOCKS','RED','APPLE','GREEN','PEAR'];
export const HEART_PANELS=[
 {slots:[0,1,2,3],answer:HEART_WORDS.slice(0,4),x:-7,z:-47,picture:'RUN'},
 {slots:[4,5,6,7],answer:HEART_WORDS.slice(4,8),x:7,z:-47,picture:'LIFT'},
 {slots:[8,9],answer:['RED','APPLE'],x:-7,z:-55,picture:'APPLE'},
 {slots:[10,11],answer:['GREEN','PEAR'],x:7,z:-55,picture:'PEAR'},
];
export const HEART_PEDESTAL={x:0,y:0,z:-59};
export const heartLayout:RoomLayout={
 halfWidth:14,halfDepth:42,exitZ:-62,exitHalfWidth:2.1,spawn:{x:0,z:38},doorTravel:6,
 pedestalHalfWidth:.65,pedestalHalfDepth:.65,
 sockets:[...HEART_PANELS.flatMap(p=>p.slots.map((_,i)=>({x:p.x+(i-(p.slots.length-1)/2)*2.1,z:p.z,halfSize:.65,reach:1.55,accepts:'light' as const,acceptedActivator:'OBJECT' as const}))),
 {x:-6,z:27,acceptedActivator:'HERO',activationMode:'HOLD'},
 {x:6,z:21,acceptedActivator:'HERO',activationMode:'HOLD'},
 {x:5,z:3,acceptedActivator:'HERO',activationMode:'TOGGLE'},
 {x:5,z:-5,y:5,acceptedActivator:'HERO',activationMode:'TOGGLE'},
 {x:-10,z:-21,acceptedActivator:'HERO',activationMode:'HOLD'},
 {x:5,z:-39,acceptedActivator:'HERO',activationMode:'TOGGLE'}],
 blockPositions:[{x:-3.5,z:19},{x:3.5,z:19},{x:5,z:-8,y:5},{x:12,z:-8,y:5},
 {x:-10,z:-42},{x:-10,z:-44},{x:11,z:-42},{x:11,z:-44},
 {x:-11,z:-51},{x:-4,z:-42},{x:11,z:-51},{x:4,z:-42},{x:0,z:32}],
 obstacles:[
 {id:'gate-west',x:-8.25,z:24,width:11.5,depth:.8,height:9,kind:'wall'},
 {id:'gate-east',x:8.25,z:24,width:11.5,depth:.8,height:9,kind:'wall'},
 {id:'bridge-housing',x:-12,z:-30,width:4,depth:14,height:8,kind:'wall'},
 {id:'lift-west',x:-4.25,z:-3,width:19.5,depth:.8,height:12,kind:'wall'},
 {id:'lift-east',x:13.25,z:-3,width:1.5,depth:.8,height:12,kind:'wall'},
 ...HEART_PANELS.map((p,i)=>({id:`finale-image-${i}`,x:p.x,z:p.z-2.35,width:4.3,depth:.3,height:5.95,kind:'wall' as const})),
 ],
};
export const heartPuzzle:PuzzleDefinition={id:'heart',prompt:'TAKE THE HEART OF THE FOREST TO THE END.',display:[],answer:'',room:heartLayout,choices:[...HEART_WORDS,'HEART OF THE FOREST'],blocks:[...HEART_WORDS.map(()=>({...LIGHT_BLOCK})),{...LIGHT_BLOCK,size:1.15}]};

export const dragonLayout:RoomLayout={halfWidth:49,halfDepth:49,exitZ:-43,exitHalfWidth:2,
 spawn:{x:0,z:32},doorTravel:6,pedestalHalfWidth:.6,pedestalHalfDepth:.6,
 sockets:[...DRAGON_PANELS.flatMap(p=>p.slots.map((_,i)=>({x:p.x+(i-(p.slots.length-1)/2)*2.5,z:p.z,y:p.y,halfSize:.95,reach:1.8,accepts:'light' as const,acceptedActivator:'OBJECT' as const}))),...DRAGON_CONTROLS.map(s=>({...s,halfSize:.9,acceptedActivator:'HERO' as const}))],
 blockPositions:[...DRAGON_WORDS.map((_,i)=>{const a=i*Math.PI*2/DRAGON_WORDS.length;if(i<2)return {x:i===0?-34:-41,z:3,y:0};return {x:DRAGON_CAROUSEL.position.x+Math.cos(a)*4.5,z:DRAGON_CAROUSEL.position.z+Math.sin(a)*4.5,y:5.36};}),{x:37.5,z:-11.5,y:0},{x:37.5,z:-14.2,y:0},{x:37.5,z:-16.9,y:0},{x:37.1,z:-8.9,y:0},{x:34,z:-17.9,y:0},{x:-37,z:.5,y:0},{x:-40,z:.5,y:0},{x:-34,z:.5,y:0},{x:-37,z:3,y:0},{x:0,z:29,y:0}],
 obstacles:[{id:'dragon-carousel-pillar',x:-26,z:-19,width:3.5,depth:4,height:29,kind:'wall'},...DRAGON_PANELS.map((p,i)=>({id:`dragon-image-${i}`,x:p.x,z:p.z-2.4,width:4.3,depth:.35,height:p.y+4.95,kind:'wall' as const}))]};
export const dragonPuzzle:PuzzleDefinition={id:'dragon',prompt:'TAKE THE HEART OF THE FOREST TO THE END.',display:[],answer:'',room:dragonLayout,choices:[...DRAGON_WORDS,'','','','','','GREEN','YELLOW','PEAR','BANANA','HEART OF THE FOREST'],blocks:[...DRAGON_WORDS.map(()=>({...LIGHT_BLOCK})),{...HEAVY_BLOCK,size:1.8},{...HEAVY_BLOCK,size:1.8},{...HEAVY_BLOCK,size:1.8},{...LIGHT_BLOCK,size:1.2},{...LIGHT_BLOCK,size:1.2},...Array.from({length:4},()=>({...LIGHT_BLOCK})),{...LIGHT_BLOCK,size:1.15}]};
/** Polar outline shared by visible architecture and navigation. */
export function caveRadii(angle:number){return dragonRadii(angle);}
export function caveHeight(p:{x:number;z:number}){return dragonHeight(p);}
export const CAVE_ZONES=[{id:'A',x:30,z:9},{id:'B',x:23,z:-23},{id:'C',x:-26,z:-20},{id:'D',x:-30,z:10}];

