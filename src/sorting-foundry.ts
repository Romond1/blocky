import {LiftTransport} from './lift-transport.ts';
import {heroOnPlate,objectOnPlate} from './pressure-plates.ts';
import type {Game} from './game.ts';
import type {Hero,Position} from './split-mechanics.ts';

export const SORTING_PAIRS=[['RED','APPLE'],['GREEN','PEAR'],['YELLOW','BANANA']] as const;
// The west portion overlaps the cabin landing so the upper control is reachable.
export const SORTING_GALLERY={left:3,right:15.5,back:-14.5,front:-2.5};
export const SORTING_CROSSING={left:-9,right:3,back:12,front:16};
export function foundryChannel(p:Position){return p.x> -9&&p.x<3&&p.z>8&&p.z<=28;}
export function foundryRamp(p:Position){return p.x>=-9&&p.x<=-4&&p.z>=23&&p.z<=27;}

/** Room-specific recombination only: Bridge and Elevator retain their shared timelines. */
export class SortingFoundry extends LiftTransport {
 heavyActive=false;bridgeLocked=false;bridgeExtension=0;matches=[false,false,false];
 constructor(){super(SORTING_GALLERY,8);}
 ground(p:Position,height:number){
  if(foundryRamp(p))return p.x===-9?0:-(p.x+9)*.6;
  if(foundryChannel(p))return height>=-.4&&p.z>=12&&p.z<=16&&this.bridgeExtension>=.98?0:-3;
  return super.ground(p,height);
 }
 tick(dt:number,g:Game,actors:Record<Hero,Position>){
  this.heavyActive=g.blocks.some(b=>objectOnPlate(g.layout.sockets[6],b));
  if(this.heavyActive&&(['yuki','mia'] as const).some(h=>heroOnPlate(g.layout.sockets[7],actors[h],g.motion[h])))this.bridgeLocked=true;
  const extension=g.bridge.extension;g.bridge.update(dt,this.heavyActive,this.bridgeLocked);this.bridgeExtension=g.bridge.extension;
  if(extension===0&&g.bridge.extension>0)g.emit('PLATFORM_EXTEND');
  if(extension===1&&g.bridge.extension<1)g.emit('PLATFORM_RETRACT');
  this.tickLift(dt,g,actors);
  this.refreshMatches(g);
 }
 refreshMatches(g:Game){
  const old=[...this.matches],wasSolved=g.solved;
  this.matches=SORTING_PAIRS.map((pair,i)=>pair.every((word,j)=>g.placed[i*2+j]?.text===word&&g.placed[i*2+j]?.weightClass==='light'));
  this.matches.forEach((on,i)=>{if(on&&!old[i])g.emit('SORTING_PAIR_MATCHED');});
  g.stageSolved=[...this.matches];g.solved=this.matches.every(Boolean);
  // Immediately revoke removed pairs rather than leaving stale power during a handoff.
  for(let i=0;i<6;i++)if(!this.matches[Math.floor(i/2)])g.conduitProgress[i]=0;
  if(g.solved&&!wasSolved){g.emit('SORTING_COMPLETE');g.say('SORTING COMPLETE');}
 }
 feedback(g:Game,index:number):'correct'|'empty'|'wrong'{
  if(index<6)return this.matches[Math.floor(index/2)]?'correct':g.placed[index]?'wrong':'empty';
  if(index===6)return this.heavyActive||this.bridgeLocked?'correct':'empty';
  if(index===7)return this.bridgeLocked?'correct':'empty';
  return this.controls[index-8]?'correct':'empty';
 }
 placedPair(g:Game,slot:number){
  this.refreshMatches(g);g.attempts++;
  if(slot<6&&!this.matches[Math.floor(slot/2)]&&g.placed[Math.floor(slot/2)*2]&&g.placed[Math.floor(slot/2)*2+1]){g.rejectionTime=1.2;g.say('Try another pair.');}
 }
 companionSafe(g:Game,p:Position,height:number){
  if(foundryChannel(p)&&height>=-.4&&!this.bridgeLocked)return false;
  if(g.layout.sockets.some(s=>s.acceptedActivator==='HERO'&&Math.abs((s.y??0)-height)<.5&&Math.hypot(s.x-p.x,s.z-p.z)<1.8))return false;
  return this.canMove(p,height,true)&&Math.abs(this.ground(p,height)-height)<.18;
 }
}
