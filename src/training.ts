import type {HeroId} from './companions/companion.ts';

export type TrainingEvent = 'TAB_SWITCHED'|'PLAYER_MOVED'|'CAMERA_LOOKED'|'LIGHT_BLOCK_PICKED_UP'|'LIGHT_BLOCK_PLACED'|'HERO_WORD_COMPLETED'|'HERO_SWITCHED'|'MIA_SPEED_EXPERIENCED'|'HEAVY_BLOCK_INTERACTED_MIA'|'HEAVY_BLOCK_DROPPED_MIA'|'SWITCHED_TO_YUKI'|'HEAVY_BLOCK_PICKED_UP_YUKI'|'HEAVY_BLOCK_PLATE_ACTIVATED'|'ROOM_EXIT_UNLOCKED'|'TEAM_EXIT_COMPLETE';
export type TrainingStep = 'switch'|'move'|'look'|'mission'|'exit'|'done';
/** Optional hints and observation events. No lesson is a gameplay prerequisite. */
export class TrainingTutorial {
 readonly requiresHeavy:boolean; constructor(requiresHeavy=true){this.requiresHeavy=requiresHeavy;}
 readonly completed = new Set<TrainingEvent>();
 private listeners = new Set<(event:TrainingEvent)=>void>();
 missionTime=0;
 get transitionGap(){return this.requiresHeavy&&this.setupComplete&&this.missionTime<.45;}
 get docked(){return this.missionTime>=(this.requiresHeavy?3.25:2.8);}
 get setupComplete(){return this.requiresHeavy?(this.has('HERO_SWITCHED')||this.has('TAB_SWITCHED')):this.has('PLAYER_MOVED')&&this.has('CAMERA_LOOKED');}
 tick(dt:number){this.elapsed+=dt;if(this.setupComplete)this.missionTime+=dt;}
 distance=0; lookDistance=0; miaDistance=0; failureNotice=0; elapsed=0; heroOnPlate=false; heavyOnPlate=false;
 onEvent(listener:(event:TrainingEvent)=>void){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
 has(event:TrainingEvent){return this.completed.has(event);}
 emit(event:TrainingEvent){if(this.completed.has(event))return;this.completed.add(event);this.listeners.forEach(listener=>listener(event));}
 move(distance:number,hero:HeroId){
  this.distance+=distance;if(distance>0)this.emit('PLAYER_MOVED');
  if(hero==='mia'){this.miaDistance+=distance;if(this.miaDistance>=4)this.emit('MIA_SPEED_EXPERIENCED');}
 }
 look(amount:number){this.lookDistance+=Math.abs(amount);if(Math.abs(amount)>0)this.emit('CAMERA_LOOKED');}
 switched(to:HeroId){this.emit('HERO_SWITCHED');if(to==='yuki'&&this.has('HEAVY_BLOCK_DROPPED_MIA'))this.emit('SWITCHED_TO_YUKI');}
 failedHeavy(){if(!this.has('HEAVY_BLOCK_DROPPED_MIA'))this.failureNotice=6;this.emit('HEAVY_BLOCK_DROPPED_MIA');}
 get heroSolved(){return this.heroOnPlate;}
 get heavyActivated(){return this.heavyOnPlate;}
 get step():TrainingStep {
  if(this.has('TEAM_EXIT_COMPLETE'))return 'done';
  if(this.requiresHeavy){if(!this.setupComplete)return 'switch';}
  else {if(!this.has('PLAYER_MOVED'))return 'move';if(!this.has('CAMERA_LOOKED'))return 'look';}
  if(this.heroSolved&&(!this.requiresHeavy||this.heavyActivated))return 'exit';
  return 'mission';
 }
 snapshot(){return {step:this.step,docked:this.docked,missionTime:this.missionTime,completed:[...this.completed],distance:this.distance,miaDistance:this.miaDistance,failureNotice:this.failureNotice,heroSolved:this.heroSolved,heavyActivated:this.heavyActivated};}
}

