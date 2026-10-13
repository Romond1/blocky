import type {Position} from './split-mechanics.ts';

export const ACTION_JUMPS=Array.from({length:5},(_,i)=>({x:0,z:21.4-i*2.3,y:(i+1)*.95}));
export const STEP_COLUMNS=[-1.3,1.3];
export const STEP_HALF_WIDTH=.75,STEP_HALF_DEPTH=.7;
export const SUMMIT_BARRIERS=[{x:0,z:10.95,width:6.8,depth:.25}];
export const RUN_START={x:-10,z:23},RUN_END={x:-10,z:10.3};
export const jumpStation=(p:Position)=>Math.abs(p.x)<3.4&&p.z>=9.5&&p.z<=24.8;
// Shared footprints keep rendered tops, floor support and solid sides identical.
export const ACTION_STEPS=ACTION_JUMPS.flatMap((a,i)=>i===4
 ?[{...a,x:0,halfWidth:2.05,halfDepth:STEP_HALF_DEPTH}]
 :STEP_COLUMNS.map(x=>({...a,x,halfWidth:STEP_HALF_WIDTH,halfDepth:STEP_HALF_DEPTH})));
export function stairHeight(p:Position){
 return ACTION_STEPS.find(a=>Math.abs(p.x-a.x)<=a.halfWidth&&Math.abs(p.z-a.z)<=a.halfDepth)?.y??0;
}

export const LIFT_LEDGE={x:12,z:12,y:3.8,halfWidth:2.7,halfDepth:1.2};
export const RUN_PAD={x:-10,z:10.3,y:.3,halfWidth:1.6,halfDepth:1};
export const STATION_SURFACES=[...ACTION_STEPS,LIFT_LEDGE,RUN_PAD];
export const CONVEYOR_SPEED=5.5;
export const onConveyor=(p:Position)=>p.x>-12.15&&p.x< -7.85&&p.z>11.35&&p.z<24.5;
export function stationHeight(p:Position){return STATION_SURFACES.find(a=>Math.abs(p.x-a.x)<=a.halfWidth&&Math.abs(p.z-a.z)<=a.halfDepth)?.y??0;}
