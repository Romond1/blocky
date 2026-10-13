import {WEST_CONTROLS} from './dragon-west.ts';
import type {SentenceCarouselConfig} from './sentence-carousel.ts';
import type {BoxBody} from './block-collision.ts';
export {dragonFloor,dragonRadii,dragonHeight} from './dragon-terrain.ts';
export const DRAGON_GATE_ANGLE=.64;
export const DRAGON_GATE={x:Math.sin(DRAGON_GATE_ANGLE)*31,z:Math.cos(DRAGON_GATE_ANGLE)*31,y:3,halfX:13,halfY:3,halfZ:.4,yaw:DRAGON_GATE_ANGLE-Math.PI/2} satisfies BoxBody;
export const DRAGON_PILLARS=[[-16,-7],[17,5],[-5,17],[8,-17]].map(([x,z])=>({x,y:8,z,halfX:1.75,halfY:12.5,halfZ:2,yaw:0}));
export const DRAGON_WALLS=Array.from({length:84},(_,i)=>{const a=i*Math.PI*2/84,courtSpace=5.5*Math.max(0,1-Math.abs(a-1.96)/.4),r=47.3+Math.sin(a*5)*1.7+courtSpace;return {x:Math.sin(a)*r,z:Math.cos(a)*r,y:14,halfX:(4.2+Math.sin(i*7)*.6)/2,halfY:16,halfZ:2.1,yaw:a};});
// Basalt shoulders continue the gate into the lava and the cavern wall so its ends cannot be jumped around.
export const DRAGON_GATE_SHOULDERS=[{radius:46,half:2}].map(({radius,half})=>({x:Math.sin(DRAGON_GATE_ANGLE)*radius,z:Math.cos(DRAGON_GATE_ANGLE)*radius,y:4.5,halfX:half,halfY:4.5,halfZ:.7,yaw:DRAGON_GATE.yaw}));
export const DRAGON_WORDS=['RED','APPLE','MIA','CAN','RUN','FAST','YUKI','CAN','LIFT','BLOCKS'];
export const DRAGON_PANELS=[
 {slots:[0,1],answer:['RED','APPLE'],x:-38,z:-2,y:0,picture:'APPLE'},
 {slots:[2,3,4,5],answer:['MIA','CAN','RUN','FAST'],x:-27,z:-30,y:5,picture:'RUN'},
 {slots:[6,7,8,9],answer:['YUKI','CAN','LIFT','BLOCKS'],x:-15,z:-34,y:5,picture:'LIFT'},
];
export const DRAGON_CONTROLS=[
 {x:13,z:28,y:0,activationMode:'HOLD' as const},
 {x:22,z:22,y:0,activationMode:'HOLD' as const},
 {x:28,z:13,y:0,activationMode:'HOLD' as const},
 {x:34,z:-10,y:0,activationMode:'TOGGLE' as const},
 {x:25,z:-15,y:4,activationMode:'TOGGLE' as const},
 {x:-19,z:-23,y:5,activationMode:'HOLD' as const},
 {x:31.1,z:-9.2,y:0,activationMode:'TOGGLE' as const},
 ...WEST_CONTROLS,
];
export const DRAGON_LIFT={x:31.1,z:-14,half:3.5,top:4};
export const DRAGON_CHECKPOINTS=[{x:0,z:31,y:0},{x:26,z:17,y:0},{x:31,z:-11,y:0},{x:21,z:-25,y:5},{x:-21,z:-25,y:5}];
export const DRAGON_ALTAR={x:0,z:-20,y:5};
export const DRAGON_ENDING_Z=DRAGON_ALTAR.z-2;
export const DRAGON_CAROUSEL:SentenceCarouselConfig={id:'dragon-pillar',position:{x:-26,z:-19},radius:4.5,speed:.24,direction:1,wordBlocks:DRAGON_WORDS.map((_,i)=>i).slice(2),brakeControlId:15};
export const angle=(p:{x:number;z:number})=>Math.atan2(p.x,p.z);
export const DRAGON_SLABS=[10,6.3,2.6,-1.1,-4.8,-8.5].map(z=>({x:29,z,width:3,depth:2.7}));
export const DRAGON_BRIDGE=[{x:0,z:-29},{x:0,z:-22.5}];
export function onFinalBridge(p:{x:number;z:number}){return DRAGON_BRIDGE.slice(1).some((b,i)=>{const a=DRAGON_BRIDGE[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),along=((p.x-a.x)*dx+(p.z-a.z)*dz)/length,across=((p.x-a.x)*dz-(p.z-a.z)*dx)/length;return along>=-.2&&along<=length+.2&&Math.abs(across)<=3.2;});}

