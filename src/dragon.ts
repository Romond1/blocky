import {DRAGON_RAILS} from './dragon-terrain.ts';
import {DragonWest,WEST} from './dragon-west.ts';
import {Elevator} from './elevator.ts';
import {LavaFerry} from './lava-ferry.ts';
import {SentenceCarousel} from './sentence-carousel.ts';
import {heroOnPlate} from './pressure-plates.ts';
import {bodyClear,restingBody} from './carry-collision.ts';
import {transportGuard} from './transport-collision.ts';
import {onTopOf} from './block-stacking.ts';
import {dropPoints} from './block-placement.ts';
import {DRAGON_CAROUSEL,DRAGON_PANELS,DRAGON_CHECKPOINTS,DRAGON_ALTAR,DRAGON_SLABS,DRAGON_GATE,DRAGON_GATE_SHOULDERS,DRAGON_PILLARS,DRAGON_WALLS,dragonFloor,onFinalBridge,angle} from './dragon-layout.ts';
import {boxesOverlap} from './block-collision.ts';
import {DRAGON_ENDING_Z,DRAGON_LIFT} from './dragon-layout.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Finale} from './finale.ts';
import type {Position,Hero} from './split-mechanics.ts';
import type {BoxBody} from './block-collision.ts';
const crew=['yuki','mia'] as const;
const distance=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.z-b.z);
export type FinalChoice='continue_adventure'|'leave_block_world';
export class Dragon {
 readonly west=new DragonWest();
 readonly carousel=new SentenceCarousel(DRAGON_CAROUSEL);
 readonly lift=new Elevator(DRAGON_LIFT.half,DRAGON_LIFT.top);readonly ferry=new LavaFerry();
 liftBoarding=false;liftUnlocked=false;
 locks=[false,false,false,false];language=[false,false,false];gateLift=0;slabsActive=false;elapsed=0;responseTime=0;
 restored=false;heartPlacementTime=0;choice:FinalChoice|null=null;choiceTime=0;
 readonly continueLeft=false;
 private previous:boolean[]=[];private safe={yuki:{...DRAGON_CHECKPOINTS[0]},mia:{...DRAGON_CHECKPOINTS[0]}};
 private ferryCrew=new Set<Hero>();private ferryGoods=new Set<number>();
 constructor(){this.ferry.z=-14.5;}
 get bridgeReady(){return this.locks.every(Boolean)&&this.responseTime>=3;}
 get ferryZ(){return this.ferry.z+7.5;}
 get liftY(){return this.lift.y;}
 ferryContains(p:Position,margin=0){return this.ferry.contains({x:p.x-33,z:p.z-7.5},margin);}
 liftContains(p:Position,margin=0){return this.lift.contains({x:p.x-DRAGON_LIFT.x+9,z:p.z-DRAGON_LIFT.z},margin);}
 attached(id:number){return this.carousel.attached.has(id);}
 available(b:LetterBlock,p:Position){return !this.attached(b.id)||this.carousel.canRetrieve(b.id,p,b.size);}
 bind(g:Game){for(const id of this.carousel.attached){const p=this.carousel.pose(id)!;Object.assign(g.blocks[id],p,{y:5.36});}}
 ground(p:Position,h:number){
  const floor=Math.max(dragonFloor(p),this.west.ground(p,h));
  if(floor===5)return floor;
  if(this.bridgeReady&&onFinalBridge(p))return 5;
  if(this.restored&&(Math.abs(p.x-7)<=2.5||Math.abs(p.x+7)<=2.5)&&Math.abs(p.z-DRAGON_ENDING_Z)<=3)return 5;
  if(this.liftContains(p)&&h>=this.lift.y-.2)return this.lift.y;
  if(this.ferryContains(p)&&h>=-.2)return 0;
  if(this.slabsActive&&DRAGON_SLABS.some(s=>Math.abs(p.x-s.x)<s.width/2&&Math.abs(p.z-s.z)<s.depth/2))return 0;
  return floor;
 }
 canMove(p:Position,h:number,grounded:boolean,from?:Position){
  const hero={...p,y:h+1.35,halfX:.38,halfY:1.35,halfZ:.38,yaw:0};
  if(this.solids().some(s=>s.y+s.halfY>h+.18&&boxesOverlap(hero,s)))return false;
  if(distance(p,DRAGON_CAROUSEL.position)<2.8)return false;
  if(from&&this.ferryContains(from,.38)&&this.ferry.moving)return grounded&&this.ferryContains(p,.38);
  if(from&&this.liftContains(from,.38)&&this.lift.moving)return grounded&&this.liftContains(p,.38);
  if(this.liftContains(p)&&h<this.lift.y-.18)return false;
  const floor=this.ground(p,h);
  // Lava gaps remain traversable in the air; recovery handles a missed landing.
  return floor<=h+.18&&Math.hypot(p.x,p.z)<48.8;
 }
 solids(ignoreTransport=false):BoxBody[]{
  const box=(x:number,y:number,z:number,w:number,h:number,d:number,yaw=0):BoxBody=>({x,y,z,halfX:w/2,halfY:h/2,halfZ:d/2,yaw});
  return [box(-31,this.west.gateLift+3,26,20,6,.5),
 ...(!ignoreTransport?[box(WEST.x,this.west.lift.y-.25,WEST.liftZ,7,.5,7),...(this.west.crossing?[box(this.west.shuttleX,4.75,-10,5,.5,4)]:[])]:[]),{...DRAGON_GATE,y:this.gateLift+DRAGON_GATE.y},...DRAGON_GATE_SHOULDERS,...DRAGON_RAILS,...DRAGON_PILLARS,...DRAGON_WALLS,box(-26,14,-19,3.5,18,4),box(25.8,3.65,-16,3.6,.7,10),box(27,2,-18.5,5,4,1.1),
   ...(!ignoreTransport?[box(DRAGON_LIFT.x,this.lift.y-.25,DRAGON_LIFT.z,DRAGON_LIFT.half*2,.5,DRAGON_LIFT.half*2),box(33,-.25,this.ferryZ,5,.5,5)]:[])];
 }
 hold(g:Game,h:Hero){return g.blocks.some(b=>b.carrier===h&&b.state==='carried')||!this.locks.every(Boolean)||this.liftContains(g.actors![h])||this.ferryContains(g.actors![h]);}
 companionSafe(g:Game,p:Position,h:Hero){return this.ground(p,g.motion[h].y)>=0&&this.canMove(p,g.motion[h].y,true,g.actors![h])&&
  !g.layout.sockets.some(s=>s.acceptedActivator==='HERO'&&distance(s,p)<1.8)&&!(this.restored&&Math.abs(p.z-DRAGON_ENDING_Z)<3&&Math.abs(p.x)>4);}
 drop(g:Game,b:LetterBlock,f:Finale){
  if(b===f.heart&&this.bridgeReady&&distance(g.player,DRAGON_ALTAR)<2.7&&Math.abs(g.motion[g.controlledHero].y-5)<.3){
   if(this.restored)return;
   Object.assign(b,DRAGON_ALTAR,{state:'socket',carrier:undefined,slot:undefined,support:undefined});f.heartArrived=true;this.restored=true;this.heartPlacementTime=this.elapsed;
   g.emit('FINAL_HEART_PLACED');g.say('THE HEART OF THE FOREST IS RESTORED.');return;
  }
  const height=g.motion[g.controlledHero].y;
  for(const p of dropPoints(b,g.blocks,g.player,g.facing)){const y=this.ground(p,height);
   if(y<0||Math.abs(y-height)>.2||!g.canPlaceBlock(b,{...p,y},true))continue;
   if(this.lift.moving&&this.liftContains(g.player)&&!this.liftContains(p,b.size/2)||this.ferry.moving&&this.ferryContains(g.player)&&!this.ferryContains(p,b.size/2))continue;
   Object.assign(b,p,{y,state:'floor',carrier:undefined,slot:undefined,support:undefined});return;
  }g.say('Move into a little more space to place it.');
 }
 choiceZone(p:Position){if(!this.restored||this.choice||Math.abs(p.z-DRAGON_ENDING_Z)>2.5)return null;return Math.abs(p.x+7)<2?'left':Math.abs(p.x-7)<2?'right':null;}
 choose(g:Game){const side=this.choiceZone(g.player);if(!side||!g.motion[g.controlledHero].grounded||g.carried)return false;
  this.choice=(side==='left')===this.continueLeft?'continue_adventure':'leave_block_world';this.choiceTime=this.elapsed;g.emit('room10_final_choice');
  g.say(this.choice==='continue_adventure'?'THE ADVENTURE CONTINUES...':'BLOCK WORLD COMPLETE');g.messageTime=100000;return true;
 }
 tick(dt:number,g:Game,f:Finale){
  this.elapsed+=dt;if(this.locks.every(Boolean))this.responseTime+=dt;
  if(this.bridgeReady&&f.checkpointIndex===4)f.checkpoint={...DRAGON_ALTAR};
  const actors=g.actors!;
  const controls=g.layout.sockets.slice(10).map(s=>crew.some(h=>heroOnPlate(s,actors[h],g.motion[h])));f.controls=controls;
  // Never award a forward respawn while a hero is still falling through a gap.
  const teamSafe=crew.every(h=>g.motion[h].grounded&&g.motion[h].y>=0&&this.ground(actors[h],g.motion[h].y)>=0);
  const body=g.blockBody(f.heart),teamBeyond=teamSafe&&crew.every(h=>angle(actors[h])>.7&&angle(actors[h])<3.14);
  const open=this.locks[0]||controls[0]||controls[1];
  const passage={...DRAGON_GATE,y:0,halfY:1};
  const beneath=(b:BoxBody)=>boxesOverlap(passage,{...b,y:0,halfY:1});
  const clearance=Math.max(0,...crew.filter(h=>beneath({...actors[h],y:0,halfX:.38,halfY:1.35,halfZ:.38,yaw:0})).map(h=>g.motion[h].y+2.8),beneath(body)?body.y+body.halfY:0);
  // Anti-crush can retain an existing opening, never create one by approaching the bars.
  this.gateLift=open?Math.min(6,this.gateLift+dt*8):Math.min(this.gateLift,Math.max(clearance,this.gateLift-dt*10));
  if(!this.locks[0]&&teamBeyond&&angle(body)>.7&&angle(body)<3.14)this.complete(0,g,f);
  // Either hero can hold the pad while the other crosses; there is no countdown.
  this.slabsActive=controls[2];
  if(this.locks[0]&&controls[3]&&!this.previous[3]&&!this.ferry.moving&&heroOnPlate(g.layout.sockets[13],actors[g.controlledHero],g.motion[g.controlledHero])){
   this.ferryCrew=new Set(crew.filter(h=>this.ferryContains(actors[h],.38)&&g.motion[h].grounded&&Math.abs(g.motion[h].y)<.15));
   this.ferryGoods=new Set(g.blocks.filter(b=>b.state==='floor'&&this.ferryContains(b,b.size/2-.08)&&Math.abs(b.y??0)<.15).map(b=>b.id));
   this.ferry.toggle();g.emit('FERRY_TOGGLE');
  }
  this.transport(g,dt,'ferry');
  if(teamSafe&&this.locks[0]&&!this.locks[1]&&crew.every(h=>actors[h].z<-8&&actors[h].x>15)&&body.z<-8&&body.x>15)this.complete(1,g,f);
  // First climb the blocks to the upper plate; lower calls cannot bypass the climb.
  if(this.locks[1]&&controls[4])this.liftUnlocked=true;
  // Once unlocked, either partner can call and board without a countdown.
  if(this.liftUnlocked&&controls[6]&&!this.previous[6]){
   this.liftBoarding=true;
   if(this.lift.state==='UP')this.lift.state='MOVING_DOWN';
  }
  this.lift.activate([this.liftUnlocked&&controls[4]]);
  if(this.lift.moving&&this.lift.state==='MOVING_UP')this.liftBoarding=false;
  if(this.liftBoarding&&this.lift.state==='DOWN'){
   const local=(p:Position)=>({x:p.x-DRAGON_LIFT.x+9,z:p.z-DRAGON_LIFT.z});
   const cargo=g.blocks.filter(b=>!b.hidden&&!this.attached(b.id)).map(b=>({...b,...local(b)}));
   const aboard=crew.some(h=>this.lift.aboard({...local(actors[h]),...g.motion[h]},cargo));
   const heartAboard=this.liftContains(body,body.halfX)&&(f.heart.state==='carried'||Math.abs(body.y-body.halfY-this.lift.y)<.15);
   if(aboard&&heartAboard){this.lift.state='MOVING_UP';this.liftBoarding=false;g.emit('ELEVATOR_TOGGLE');}
  }
  this.transport(g,dt,'lift');
  if(teamSafe&&this.locks[1]&&!this.locks[2]&&crew.every(h=>g.motion[h].y>=4.9&&actors[h].z<-18)&&body.y-body.halfY>=4.9&&body.z<-18)this.complete(2,g,f);
  this.carousel.tick(dt,controls[5],e=>g.emit(e));for(const id of this.carousel.attached){Object.assign(g.blocks[id],this.carousel.pose(id),{y:5.36});}
  DRAGON_PANELS.forEach((p,i)=>{if(this.language[i]||!p.slots.every(s=>g.placed[s]))return;
   if(p.slots.every((s,n)=>g.placed[s]?.text===p.answer[n])){this.language[i]=true;g.emit('FINAL_SENTENCE_COMPLETE');g.say(p.answer.join(' ')+'.');}
  });
  this.west.tick(dt,g,this.language[0]);
  if(!this.locks[2]&&crew.every(h=>actors[h].x<-26&&actors[h].z<10&&actors[h].z>1.5&&g.motion[h].grounded&&g.motion[h].y===0))f.checkpoint={x:-29,y:0,z:3};
  if(!this.locks[2]&&crew.every(h=>actors[h].x<-26&&actors[h].z<-5.5&&actors[h].z>-8&&g.motion[h].grounded&&g.motion[h].y===5))f.checkpoint={x:-30,y:5,z:-7};
  if(this.west.complete&&!this.locks[2]){this.locks[0]=this.locks[1]=true;this.complete(2,g,f);f.checkpoint={x:-18,y:5,z:-14};for(const h of crew)this.safe[h]={...f.checkpoint,x:f.checkpoint.x+(h==='mia'?1:-1)};}
  if(this.locks[2]&&!this.locks[3]&&this.language.slice(1).every(Boolean))this.complete(3,g,f);
  g.solved=this.locks.every(Boolean);this.previous=controls;
  if(this.restored&&this.choice){g.message=this.choice==='continue_adventure'?'THE ADVENTURE CONTINUES...':'BLOCK WORLD COMPLETE';g.messageTime=100000;}
  for(const h of crew){const p=actors[h],m=g.motion[h];if(p.x<-24&&m.grounded&&dragonFloor(p)>=0&&Math.abs(dragonFloor(p)-m.y)<.15)this.safe[h]={...p,y:m.y};if(m.y<-2||!Number.isFinite(p.x+p.z+m.y)){Object.assign(p,this.safe[h]);Object.assign(m,{y:this.safe[h].y,vy:0,grounded:true});g.emit('FALL_SAFE');if(f.heart.carrier===h)f.recover(g,f.heart);}}
 }
 private complete(i:number,g:Game,f:Finale){this.locks[i]=true;f.sections=this.locks.slice(0,3);f.language=[...this.language];f.checkpointIndex=i+1;f.checkpoint={...DRAGON_CHECKPOINTS[i+1]};
  for(const h of crew)this.safe[h]={...f.checkpoint,x:f.checkpoint.x+(h==='mia'?1:-1)};g.emit(`ROOM10_LOCK_${i+1}`);
  if(i===3)g.emit('FINAL_PUZZLE_COMPLETE');
 }
 private transport(g:Game,dt:number,kind:'lift'|'ferry'){
  const lift=kind==='lift',machine=lift?this.lift:this.ferry,offset={x:lift?DRAGON_LIFT.x-9:33,z:lift?DRAGON_LIFT.z:7.5};
  const people=crew.map(h=>({...g.actors![h],...g.motion[h],x:g.actors![h].x-offset.x,z:g.actors![h].z-offset.z}));
  if(!lift)people.forEach((p,i)=>{if(!this.ferryCrew.has(crew[i]))p.grounded=false;});
  const goods=g.blocks.filter(b=>!b.hidden&&!this.attached(b.id)&&(lift||this.ferryGoods.has(b.id))).map(b=>({...b,x:b.x-offset.x,z:b.z-offset.z}));
  // Guard uses IDs and original world bodies; the translated passenger array preserves hero order.
  machine.advance(dt,people,goods,transportGuard(g,people));
  people.forEach((p,i)=>{g.actors![crew[i]].x=p.x+offset.x;g.actors![crew[i]].z=p.z+offset.z;g.motion[crew[i]].y=p.y;});
  goods.forEach(b=>{const original=g.blocks[b.id];original.x=b.x+offset.x;original.z=b.z+offset.z;original.y=b.y;});
 }
 cargoValid(g:Game,b:LetterBlock){if(this.attached(b.id))return true;if(b.support!==undefined){const parent=g.blocks[b.support];return !!parent&&onTopOf(b,parent)&&bodyClear(g,b,restingBody(b));}return false;}
 snapshot(){return {west:this.west.snapshot(),locks:this.locks,language:this.language,gateLift:this.gateLift,slabsActive:this.slabsActive,lift:{y:this.lift.y,state:this.lift.state,boarding:this.liftBoarding,unlocked:this.liftUnlocked},ferry:{z:this.ferryZ,state:this.ferry.state},carousel:this.carousel.snapshot(),bridgeReady:this.bridgeReady,responseTime:this.responseTime,restored:this.restored,continueLeft:this.continueLeft,choice:this.choice,timeToChoiceMs:this.choice?Math.round((this.choiceTime-this.heartPlacementTime)*1000):null,elapsed:this.elapsed};}
}

