import {cooperationGround} from './cooperation.ts';
import { HERO_SWITCH_DURATION } from './heroes.ts';
import { Game } from './game.ts';
import { HeroCompanion, atTeamExit, navigable, type Actor, type HeroId, type CompanionWorld, type Point } from './companions/companion.ts';

/** Persistent actor identities; exactly one input owner and one autonomous controller. */
export class HeroTeam {
 actors:Record<HeroId,Actor>={yuki:{x:0,z:0,facing:Math.PI},mia:{x:0,z:0,facing:Math.PI}};
 selected:HeroId;
 companion:HeroCompanion;
 private doorNotified=false;
 private handoffTime=0;
 private holds=new Set<HeroId>();
 readonly tutorial={switchCount:0,hasSwitched:false,promptRequested:false};
 requestSwitchTutorial(){this.tutorial.promptRequested=true;}
 private switchListeners=new Set<(event:{type:'HERO_SWITCHED';from:HeroId;to:HeroId})=>void>();
 onHeroSwitched(listener:(event:{type:'HERO_SWITCHED';from:HeroId;to:HeroId})=>void){this.switchListeners.add(listener);return()=>this.switchListeners.delete(listener);}
 get ownershipValid(){return this.game.player===this.actors[this.selected]&&this.game.controlledHero===this.selected&&this.companion.hero===this.other&&this.companion.actor===this.actors[this.other]&&this.game.player!==this.companion.actor;}
 holdPosition(hero:HeroId){this.holds.add(hero);if(hero===this.other)this.companion.hold('HOLD_POSITION');}
 releasePosition(hero:HeroId){this.holds.delete(hero);if(hero===this.other)this.companion.releaseHold();}

 game:Game;
 constructor(game:Game, selected:HeroId='yuki') {this.game=game;this.selected=selected;this.companion=new HeroCompanion(this.other,this.actors[this.other]);this.enter(game);}
 get reunited(){return this.game.split&&this.game.solved&&(['yuki','mia'] as const).every(h=>this.game.motion[h].crossed&&this.game.motion[h].grounded&&this.game.motion[h].y===0&&this.actors[h].x< -8);}
 get other():HeroId{return this.selected==='yuki'?'mia':'yuki';}
 get playerAtExit(){return (!this.game.finale||this.game.finale.exitReady)&&this.game.solved&&this.game.doorLift>2.8&&(!this.game.transport||this.game.motion[this.selected].grounded&&Math.abs(this.game.motion[this.selected].y)<.15)&&atTeamExit(this.game.player,this.game.layout);}
 get companionAtExit(){return (!this.game.finale||this.game.finale.exitReady)&&this.game.solved&&this.game.doorLift>2.8&&(!this.game.transport||this.game.motion[this.other].grounded&&Math.abs(this.game.motion[this.other].y)<.15)&&atTeamExit(this.actors[this.other],this.game.layout);}
 world(camera?:Point,visible?:(p:Point)=>boolean):CompanionWorld {
  return {roomId:this.game.puzzle.id,layout:this.game.split?{...this.game.layout,obstacles:[...(this.game.layout.obstacles??[]),{id:'companion-bank-limit',x:7,z:10.25,width:30,depth:29.5,height:1,kind:'wall' as const}]}:this.game.layout,player:{...this.game.player,facing:this.game.facing},gateOpen:this.game.doorLift>2.8,solved:this.game.solved,
   canNavigate:this.game.finale?(p)=>this.game.finale!.companionSafe(this.game,p,this.other):this.game.transport?(p)=>{
    const chamber=this.game.transport!,height=this.game.motion[this.other].y;
    if(this.game.memory&&!this.game.memory.canPass(p,height))return false;
    if(chamber.lift.contains(p,-.6)||this.game.layout.sockets.some(s=>s.activationMode==='TOGGLE'&&Math.abs((s.y??0)-height)<.5&&Math.hypot(s.x-p.x,s.z-p.z)<1.8&&Math.hypot(s.x-this.actors[this.other].x,s.z-this.actors[this.other].z)>1.8))return false;
    if(this.game.sorting&&!this.game.sorting.companionSafe(this.game,p,height))return false;
    if(this.game.actionChamber&&!this.game.actionChamber.companionSafe(p))return false;
    return chamber.canMove(p,height,true,this.actors[this.other])&&Math.abs(chamber.ground(p,height)-height)<.18;
   }:this.game.ability?(p)=>this.game.ability!.companionSafe(this.game,p):this.game.cooperation?(p)=>{
    const chamber=this.game.cooperation!,height=this.game.motion[this.other].y,actor=this.actors[this.other];
    if(!chamber.canPassGate(p,height))return false;
    if(p.z>-9.4&&p.z<3.4&&height>=-.4&&(!chamber.bridgeLocked||Math.abs(p.x)>1.6))return false;
    if(!this.game.stageSolved[1]&&actor.z<=-9.4&&p.z>-9.4)return false;
    return Math.abs(cooperationGround(p,this.game.bridge.extension,height<-.4)-height)<.18;
   }:this.game.split?(p)=>!!this.game.memory?.canPass(p,this.game.motion[this.other].y):undefined,
   blocks:[...this.game.blocks.filter(b=>!b.hidden&&!(b.state==='carried'&&b.carrier===this.other)&&(!this.game.actionChamber||this.game.actionChamber.blockVisible(b.id))).map(b=>this.game.blockBody(b)).filter(b=>b.y+b.halfY>this.game.motion[this.other].y+.025&&b.y-b.halfY<this.game.motion[this.other].y+2.7).map(b=>({x:b.x,z:b.z,halfSize:b.halfX*(Math.abs(Math.cos(b.yaw))+Math.abs(Math.sin(b.yaw)))})),...(this.game.training?this.game.layout.sockets.map(s=>({...s,halfSize:(s.halfSize??.7)})):[])],camera,visible:this.game.sorting?undefined:visible};
 }
 enter(game:Game){
  this.game=game;game.actors=this.actors;this.doorNotified=false;this.handoffTime=0;this.holds.clear();const p=game.layout.spawn;
  Object.assign(this.actors[this.selected],p,{facing:Math.PI});game.player=this.actors[this.selected];game.facing=Math.PI;game.controlledHero=this.selected;
  // Discard the previous room/bank before evaluating spawn navigation.
  Object.assign(this.actors[this.other],p,{facing:Math.PI});
  const choices=[{x:p.x+2,z:p.z},{x:p.x-2,z:p.z},{x:p.x+2,z:p.z-1.5},{x:p.x-2,z:p.z-1.5}];
  const spawn=choices.find(q=>navigable(q,this.world()))??p;
  Object.assign(this.actors[this.other],spawn,{facing:Math.PI});this.companion.reset(this.other,this.actors[this.other]);
 }
 select(next:HeroId){
  if(this.game.finale?.paused)return false;
  if(next===this.selected||this.game.escaped)return false;
  const from=this.selected;this.game.cancelAction();
  this.actors[this.selected].facing=this.game.facing;this.selected=next;
  this.game.player=this.actors[next];this.game.facing=this.actors[next].facing;this.game.controlledHero=next;
  this.companion.reset(this.other,this.actors[this.other]);this.handoffTime=HERO_SWITCH_DURATION;
  this.game.refreshDevices();
  this.companion.hold(this.game.blocks.some(b=>b.state==='carried'&&b.carrier===this.other)?'HOLDING_OBJECT':'HOLD_POSITION');
  this.game.training?.switched(next);
  this.tutorial.promptRequested=false;this.tutorial.switchCount++;this.tutorial.hasSwitched=true;
  this.switchListeners.forEach(listener=>listener({type:'HERO_SWITCHED',from,to:next}));return true;
 }
 interact(){
  const held=this.game.carried?.id,attempts=this.game.attempts,stages=this.game.stageSolved.filter(Boolean).length,solved=this.game.solved;
  this.game.interact();
  if(this.game.carried?.id!==held)this.companion.emit(this.game.carried?'PLAYER_PICKED_UP_BLOCK':'PLAYER_DROPPED_BLOCK');
  if(!solved&&this.game.solved)this.companion.emit('PUZZLE_COMPLETE');
  else if(this.game.stageSolved.filter(Boolean).length>stages)this.companion.emit('PUZZLE_STAGE_COMPLETE');
  else if(this.game.attempts>attempts)this.companion.emit(this.game.rejectionTime>0||this.game.slotFeedback(this.game.nearbySlot)==='wrong'?'WRONG_ANSWER':'CORRECT_ANSWER');
 }
 update(dt:number,dx=0,dz=0,camera?:Point,visible?:(p:Point)=>boolean){
  this.game.update(dt,dx,dz,false);
  if(this.game.finale?.paused){this.companion.hold('HOLD_POSITION');return;}
  for(const hero of ['yuki','mia'] as const)this.game.tickMotion(hero,this.actors[hero],dt);
  if(this.game.doorLift>2.8&&!this.doorNotified){this.doorNotified=true;this.companion.emit('DOOR_OPENED');}
  this.actors[this.selected].facing=this.game.facing;
  if(this.game.escaped)return;
  this.handoffTime=Math.max(0,this.handoffTime-dt);
  if(this.game.finale?.holdCompanion(this.game,this.other))this.companion.hold('HOLD_POSITION');
  else if(this.game.transport?.riding(this.game,this.other))this.companion.hold(this.game.transport.lift.moving?'RIDE_ELEVATOR':'HOLD_POSITION');
  else if(!this.game.ability?.exitOpen&&this.game.blocks.some(b=>b.state==='carried'&&b.carrier===this.other))this.companion.hold('HOLDING_OBJECT');
  else if(this.game.ability?.holdCompanion(this.actors[this.other],this.game)||(this.game.ability&&(!this.game.motion[this.other].grounded||this.game.ability.ground(this.actors[this.other])>0))||(this.game.actionChamber&&!this.game.actionChamber.companionSafe(this.actors[this.other]))||this.holds.has(this.other)||this.game.presenceRequired(this.other)||this.handoffTime>0||(this.game.sorting&&(!this.game.motion[this.other].grounded||!this.game.sorting.bridgeLocked&&this.actors[this.other].z>8))||(this.game.split&&!this.reunited))this.companion.hold('HOLD_POSITION');
  else this.companion.releaseHold();
  this.game.refreshDevices();
  this.companion.update(dt,this.world(camera,this.game.transport?undefined:visible));
  if(this.playerAtExit&&this.companionAtExit){this.companion.state='ROOM_TRANSITION';this.game.escaped=true;this.game.training?.emit('TEAM_EXIT_COMPLETE');this.game.say('Both heroes escaped!');}
 }
 reset(){this.game.reset();this.enter(this.game);Object.assign(this.tutorial,{switchCount:0,hasSwitched:false,promptRequested:false});}
}
