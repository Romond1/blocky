import { canStand } from '../game.ts';
import {insideArea} from '../kage-alcove.ts';
import type { RoomLayout } from '../puzzles.ts';
export type Point = { x:number; z:number };
export type HeroId = 'yuki'|'mia';
export type Actor = Point & { facing:number };
export type CompanionState = 'RIDE_ELEVATOR'|'HOLD_POSITION'|'HOLDING_OBJECT'|'IDLE'|'EXPLORE'|'INSPECT'|'WATCH_PLAYER'|'LOOSE_FOLLOW'|'CATCH_UP'|'REACT'|'GO_TO_EXIT'|'WAIT_AT_EXIT'|'ROOM_TRANSITION';
export type CompanionEvent = 'PLAYER_PICKED_UP_BLOCK'|'PLAYER_DROPPED_BLOCK'|'WRONG_ANSWER'|'CORRECT_ANSWER'|'PUZZLE_STAGE_COMPLETE'|'PUZZLE_COMPLETE'|'DOOR_OPENED'|'ROOM_ENTERED';
export type Interest = Point & { name:string; look:Point; kind:'lava'|'mechanism'|'rock'|'entrance' };
export interface CompanionWorld {
  roomId:string; layout:RoomLayout; player:Actor; gateOpen:boolean; solved:boolean;
  blocks:ReadonlyArray<Point & { halfSize:number }>; camera?:Point;
  // Renderer-provided visibility check is used only for last-resort recovery.
  visible?:(point:Point)=>boolean;
  canNavigate?:(point:Point)=>boolean;
}
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.z-b.z);
export function atTeamExit(p:Point,layout:RoomLayout) {return !layout.optionalAreas?.some(a=>insideArea(p,a))&&p.z < (layout.exitZ??-layout.halfDepth)-1.6 && Math.abs(p.x-(layout.exitCenterX??0))<layout.exitHalfWidth-.38;}
/** Authored viewpoints never reference answer labels, block identities or solution data. */
export function roomInterests(id:string):Interest[] {
 const rows: [string,number,number,number,number,Interest['kind']][] = id==='memory' ? [
 ['West ledge',-6,-1.8,-7,-4,'rock'],['Northwest door',-3.5,-5.8,-3.5,-8,'mechanism'],['Eastern pillar',4.7,-5.5,6.5,-5.5,'rock'],['Entrance',0,5,1.5,8,'entrance'],['East lava',7.5,2,10,2,'lava'],['Middle overlook',0,-.5,2.6,-2.8,'mechanism']
 ] : id==='hero' ? [
 ['West lava',-4.5,0,-6.5,0,'lava'],['East lava',4.5,-2,6.5,-2,'lava'],['Rock ledge',-5,0,-7,-4,'rock'],
 ['Door carving',0,-7.5,0,-8,'mechanism'],['Puzzle view',0,-3.5,-2.7,-2,'mechanism'],['Entrance',-2,5.8,0,8,'entrance'],['East rock',4,5,7,5,'rock']
 ] : id==='dragon'?[
 ['Entry overlook',3,31,0,0,'entrance'],['East gallery',31,0,0,-31,'rock'],['West gallery',-31,0,0,-31,'rock'],['Heart sanctuary',3,-31,0,-33,'mechanism']
 ] : id==='heart'?[
 ['Assembly circle',2,34,0,33,'entrance'],['Gate approach',2,28,0,24,'mechanism'],['Elevator court',0,8,9,0,'mechanism'],['Far bank',7,-41,0,-30,'rock'],['Final approach',0,-57,0,-62,'mechanism']
 ] : id==='ability'?[
 ['Intro overlook',-13,21,-10,17,'entrance'],['Corner rock',-4.5,11,-2.4,11.4,'rock'],['Sentence hall',10.5,3,7,1,'mechanism'],['Jump pictures',10.5,-11,7,-14,'mechanism'],['Exit view',10,-22,10,-24,'mechanism']
 ] : id==='action'?[
 ['Entrance overlook',-4,30,0,20,'entrance'],['Western basalt',-15,8,-10,12,'rock'],['Ferry view',8,10,0,0,'mechanism'],['Far bank',10,-13,0,-21,'mechanism'],['Action wall',-10,-18,0,-23,'mechanism'],['Exit view',0,-26,0,-28,'mechanism']
 ] : id==='sorting'?[
 ['Entrance court',-13,23,-9,14,'entrance'],['Crossing view',6,18,-3,14,'mechanism'],['Lower gallery',1,4,9,0,'mechanism'],['Upper gallery',12,-8,9,0,'rock'],['Sorting hall',-4,-15,-1,-23,'mechanism'],['Exit view',-12,-25,-12,-28,'mechanism']
 ] : id==='fruit'?[
 ['Entrance',-5,8,9,0,'entrance'],['Fruit wall',-7,-5,0,-11,'mechanism'],['Lower court',-3,2,9,0,'rock'],['Balcony',4,-8,9,0,'mechanism'],['Upper overlook',11,-4,0,3,'rock']
 ] : id==='cooperation'?[
 ['Entrance court',-6,23,0,15,'entrance'],['Gate view',0,18,3,11,'mechanism'],['West bank',-8,10,-5,6,'rock'],['Crossing view',3,5,0,-3,'mechanism'],['Far bank',4,-13,0,-12,'mechanism'],['Workshop',-7,-20,0,-21,'rock'],['Exit view',0,-24,0,-26,'mechanism']
 ] : [
 ['Yuki station',-15,4,-12,3,'mechanism'],['Entrance map',-10,12,-10,10,'entrance'],['Exit',-14,-2,-14,-4.5,'mechanism']
 ];return rows.map(([name,x,z,lx,lz,kind])=>({name,x,z,look:{x:lx,z:lz},kind}));
}
export function navigable(p:Point,w:CompanionWorld) {
 return (!w.canNavigate||w.canNavigate(p))&&canStand(p.x,p.z,w.gateOpen,.48,w.layout) && w.blocks.every(b=>Math.abs(b.x-p.x)>b.halfSize+.48 || Math.abs(b.z-p.z)>b.halfSize+.48);
}
export function segmentSafe(a:Point,b:Point,w:CompanionWorld) {
 const steps=Math.max(1,Math.ceil(distance(a,b)/.15));for(let i=1;i<=steps;i++)if(!navigable({x:a.x+(b.x-a.x)*i/steps,z:a.z+(b.z-a.z)*i/steps},w))return false;return true;
}
/** Bounded half-meter BFS; invoked on decisions/obstructions, never every animation frame. */
export function findRoute(start:Point,end:Point,w:CompanionWorld):Point[] {
 const key=(x:number,z:number)=>`${x},${z}`;
 // Find a reachable grid anchor rather than snapping across a nearby wall.
 const anchors:Point[]=[];for(let x=Math.floor(start.x*2)-2;x<=Math.ceil(start.x*2)+2;x++)for(let z=Math.floor(start.z*2)-2;z<=Math.ceil(start.z*2)+2;z++)anchors.push({x:x/2,z:z/2});
 const origin=anchors.filter(p=>navigable(p,w)&&segmentSafe(start,p,w)).sort((a,b)=>distance(a,start)-distance(b,start))[0];if(!origin)return [];
 const queue=[origin],parents=new Map<string,Point|null>([[key(origin.x,origin.z),null]]);let best=origin,found=false;
 for(let cursor=0;cursor<queue.length&&cursor<9000;cursor++) {
  const current=queue[cursor];if(distance(current,end)<distance(best,end))best=current;
  if(distance(current,end)<.36){best=current;found=true;break;}
  for(const [dx,dz]of [[.5,0],[-.5,0],[0,.5],[0,-.5]]) {
   const next={x:current.x+dx,z:current.z+dz},id=key(next.x,next.z);
   if(!parents.has(id)&&navigable(next,w)&&segmentSafe(current,next,w)){parents.set(id,current);queue.push(next);}
  }
 }
 if(!found&&distance(best,end)>.9)return [];
 const path:Point[]=[];let p:Point|null=best;while(p){path.unshift(p);p=parents.get(key(p.x,p.z))??null;}return path;
}
export class HeroCompanion {
 readonly role='hero-companion';
 state:CompanionState='IDLE'; targetName=''; path:Point[]=[]; speed=0; replans=0; recoveries=0;
 lastEvent:CompanionEvent='ROOM_ENTERED';
 private seed=921;private timer=0;private cooldown=0;private blocked=0;private failed=0;private target:Point|null=null;private look:Point|null=null;private exitReaction=false;private previousTarget='';
 private listeners=new Set<(event:CompanionEvent)=>void>();
 hero:HeroId;actor:Actor;
 constructor(hero:HeroId,actor:Actor){this.hero=hero;this.actor=actor;}
 onEvent(listener:(event:CompanionEvent)=>void){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
 emit(event:CompanionEvent){this.lastEvent=event;this.listeners.forEach(l=>l(event));if(['HOLD_POSITION','HOLDING_OBJECT','GO_TO_EXIT','WAIT_AT_EXIT','ROOM_TRANSITION'].includes(this.state))return;
  if(event==='DOOR_OPENED'||event==='PUZZLE_COMPLETE'){this.state='REACT';this.timer=.8;this.exitReaction=true;this.path=[];}
  else if(event!=='ROOM_ENTERED'){this.state='WATCH_PLAYER';this.timer=this.hero==='yuki'?2.2:1.3;this.path=[];}
 }
 reset(hero:HeroId,actor:Actor){this.hero=hero;this.actor=actor;this.state='IDLE';this.path=[];this.timer=.8;this.cooldown=0;this.blocked=0;this.failed=0;this.target=null;this.look=null;this.exitReaction=false;this.targetName='';this.speed=0;this.emit('ROOM_ENTERED');}
 hold(state: 'RIDE_ELEVATOR'|'HOLD_POSITION'|'HOLDING_OBJECT') {this.state=state;this.path=[];this.target=null;this.look=null;this.targetName=state;this.speed=0;}
 releaseHold(){if(this.state==='RIDE_ELEVATOR'||this.state==='HOLD_POSITION'||this.state==='HOLDING_OBJECT')this.reset(this.hero,this.actor);}
 private random(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}
 private plan(point:Point,name:string,state:CompanionState,w:CompanionWorld){this.target=point;this.targetName=name;this.state=state;this.path=findRoute(this.actor,point,distance(this.actor,w.player)>1.1?{...w,blocks:[...w.blocks,{...w.player,halfSize:.42}]}:w);this.cooldown=1;this.replans++;}
 private face(p:Point,dt:number){const target=Math.atan2(p.x-this.actor.x,p.z-this.actor.z);const delta=Math.atan2(Math.sin(target-this.actor.facing),Math.cos(target-this.actor.facing));this.actor.facing+=delta*Math.min(1,dt*5);}
 private cameraBlocked(p:Point,w:CompanionWorld){if(!w.camera)return false;const dx=w.camera.x-w.player.x,dz=w.camera.z-w.player.z,length=dx*dx+dz*dz;if(length<1)return false;const t=((p.x-w.player.x)*dx+(p.z-w.player.z)*dz)/length;return t>.12&&t<.95&&distance(p,{x:w.player.x+t*dx,z:w.player.z+t*dz})<.85;}
 private choose(w:CompanionWorld){
  const far=distance(this.actor,w.player)> (this.hero==='mia'?12:10);
  if(far){const goals=roomInterests(w.roomId).filter(p=>navigable(p,w)&&distance(p,w.player)>2).sort((a,b)=>distance(a,w.player)-distance(b,w.player));if(goals[0]){this.look=w.player;this.plan(goals[0],'Team area',distance(this.actor,w.player)>16?'CATCH_UP':'LOOSE_FOLLOW',w);return;}}
  if(this.random()<(this.hero==='yuki'?.28:.12)){this.state='WATCH_PLAYER';this.timer=2+this.random()*2;this.path=[];return;}
  const options=roomInterests(w.roomId).filter(p=>p.name!==this.previousTarget&&navigable(p,w)&&distance(p,w.player)>1.5&&distance(p,w.player)<(this.hero==='mia'?13:10));
  if(!options.length){this.state='IDLE';this.timer=1.5;return;}
  const preferred=options.filter(p=>p.kind==='mechanism');const list=this.hero==='yuki'&&preferred.length&&this.random()<.5?preferred:options;
  const point=list[Math.floor(this.random()*list.length)];this.previousTarget=point.name;this.look=point.look;this.plan(point,point.name,'EXPLORE',w);
 }
 update(dt:number,w:CompanionWorld){
  this.speed=0;this.timer-=dt;this.cooldown=Math.max(0,this.cooldown-dt);
  if(['RIDE_ELEVATOR','HOLD_POSITION','HOLDING_OBJECT','ROOM_TRANSITION'].includes(this.state))return;
  if(w.gateOpen&&w.solved){
   if(!this.exitReaction){this.emit('DOOR_OPENED');}
   if(this.state==='REACT'&&this.timer>0){this.face({x:w.layout.exitCenterX??0,z:(w.layout.exitZ??-w.layout.halfDepth)},dt);return;}
   if(atTeamExit(this.actor,w.layout)){this.state='WAIT_AT_EXIT';this.path=[];this.face(w.player,dt);return;}
   if(this.state!=='GO_TO_EXIT'){const center=w.layout.exitCenterX??0,lane=Math.min(.95,w.layout.exitHalfWidth-.5),x=center+(w.player.x>=center?-lane:lane);this.plan({x,z:(w.layout.exitZ??-w.layout.halfDepth)-2.2},'Team exit','GO_TO_EXIT',w);}
  }
  if(!w.solved&&distance(this.actor,w.player)>16&&this.cooldown===0&&this.state!=='CATCH_UP')this.choose(w);
  const crowded=distance(this.actor,w.player)<1.15||this.cameraBlocked(this.actor,w);
  if(crowded&&this.cooldown===0&&this.state!=='GO_TO_EXIT'){
   const choices:Point[]=[];for(let i=0;i<8;i++){const a=i*Math.PI/4;choices.push({x:this.actor.x+Math.cos(a)*1.8,z:this.actor.z+Math.sin(a)*1.8});}
   const p=choices.filter(p=>navigable(p,w)&&distance(p,w.player)>1.6&&!this.cameraBlocked(p,w)).sort((a,b)=>distance(a,w.player)-distance(b,w.player))[0];
   if(p)this.plan(p,'Make room','LOOSE_FOLLOW',w);
  }
  if(['IDLE','INSPECT','WATCH_PLAYER','REACT'].includes(this.state)){
   this.face(this.state==='INSPECT'&&this.look?this.look:w.player,dt);if(this.timer<=0)this.choose(w);return;
  }
  if(!this.path.length){
   if(this.target&&distance(this.actor,this.target)>.8&&this.cooldown===0){this.plan(this.target,this.targetName,this.state,w);this.failed++;}
   else if(this.target&&distance(this.actor,this.target)<=.8){this.state='INSPECT';this.timer=2+this.random()*4;this.target=null;this.failed=0;return;}
   this.blocked+=dt;
  } else {
   const next=this.path[0],d=distance(this.actor,next);
   if(d<.06){this.path.shift();return;}
   const rate=this.state==='CATCH_UP'?4.2:this.state==='GO_TO_EXIT'?3.3:this.hero==='mia'?2.45:2.05;
   const step=Math.min(d,rate*dt),p={x:this.actor.x+(next.x-this.actor.x)*step/d,z:this.actor.z+(next.z-this.actor.z)*step/d};
   // Only the NPC yields: it never creates an invisible collision obstacle for the child.
   if(navigable(p,w)&&(distance(p,w.player)>.85||distance(p,w.player)>distance(this.actor,w.player))){this.face(next,dt);Object.assign(this.actor,p);this.speed=rate;this.blocked=0;}
   else {this.blocked+=dt;if(this.cooldown===0&&this.target){this.plan(this.target,this.targetName,this.state,w);this.failed++;}}
  }
  if(this.blocked>3){
   this.path=[];this.cooldown=1;this.failed++;this.blocked=0;
   if(this.state!=='GO_TO_EXIT')this.choose(w);
   // No normal teleporting. After repeated failure, choose a safe off-camera viewpoint.
   if(this.failed>=4&&w.visible){const recoveryPoints:Point[]=[...roomInterests(w.roomId)];
    if(w.gateOpen&&this.state==='GO_TO_EXIT')recoveryPoints.unshift({x:(w.layout.exitCenterX??0)-.9,z:(w.layout.exitZ??-w.layout.halfDepth)-2.5},{x:(w.layout.exitCenterX??0)+.9,z:(w.layout.exitZ??-w.layout.halfDepth)-2.5});
    const safe=recoveryPoints.filter(p=>navigable(p,w)&&(!w.canNavigate||findRoute(this.actor,p,w).length>0)&&distance(p,w.player)>2&&distance(p,w.player)<12&&!w.visible!(p)).sort((a,b)=>distance(a,w.player)-distance(b,w.player))[0];
    if(safe){Object.assign(this.actor,{x:safe.x,z:safe.z});this.recoveries++;this.failed=0;this.path=[];}
   }
  }
 }
}
