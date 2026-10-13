import {Elevator} from './elevator.ts';
import {dropPoints} from './block-placement.ts';
import {onTopOf} from './block-stacking.ts';
import {Dragon} from './dragon.ts';
import {DRAGON_WORDS} from './dragon-layout.ts';
import {LavaFerry,FERRY} from './lava-ferry.ts';
import {heroOnPlate} from './pressure-plates.ts';
import {transportGuard} from './transport-collision.ts';
import {bodyClear,restingBody} from './carry-collision.ts';
import {HEART_PANELS,HEART_PEDESTAL} from './finale-layout.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Hero,Position} from './split-mechanics.ts';
import type {BoxBody} from './block-collision.ts';
const heroes=['yuki','mia'] as const;
const separation=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.z-b.z);
/** Translate the proven ferry without changing its rider/cargo displacement contract. */
export class HeartFerry extends LavaFerry {
 constructor(){super();this.z=FERRY.b;}
 get worldZ(){return this.z-24;}
 override contains(p:Position,margin=0){return super.contains({x:p.x,z:p.z+24},margin);}
}
export class Finale {
 dragon:Dragon|null=null;
 readonly cave:boolean;
 assembly:'waiting'|'playing'|'complete';assemblyTime=0;shardCount=0;videoActive=false;videoPending=false;
 lift=new Elevator();ferry=new HeartFerry();gateLift=0;sections=[false,false,false];language=[false,false,false,false];
 controls:boolean[]=[];private previousControls:boolean[]=[];
 private ferryCrew=new Set<Hero>();private ferryGoods=new Set<number>();
 checkpoint={x:0,y:0,z:32};checkpointIndex=0;heartArrived=false;recoveries=0;
 private safeHeroes:Record<Hero,{x:number;y:number;z:number}>;
 heart!:LetterBlock;
 constructor(cave=false){this.cave=cave;this.dragon=cave?new Dragon():null;this.assembly=cave?'complete':'waiting';this.checkpoint=cave?{x:0,y:0,z:29}:{x:0,y:0,z:32};this.safeHeroes={yuki:{x:2,y:0,z:cave?32:38},mia:{x:0,y:0,z:cave?32:38}};}
 get paused(){return this.assembly==='playing';}
 get exitReady(){return !this.cave&&this.sections.every(Boolean)&&this.language.every(Boolean)&&this.heartArrived;}
 bind(g:Game){this.heart=g.blocks[g.blocks.length-1];this.heart.objective='heart';this.dragon?.bind(g);if(this.assembly==='waiting')this.heart.hidden=true;}
 startAssembly(g:Game){if(this.assembly!=='waiting')return;this.assembly='playing';this.assemblyTime=0;g.emit('HEART_ASSEMBLY_STARTED');}
 finishAssembly(g:Game){if(this.assembly==='complete')return;this.assembly='complete';this.videoActive=false;this.videoPending=false;this.heart.hidden=false;Object.assign(this.heart,this.checkpoint,{state:'floor',carrier:undefined});g.say('TAKE THE HEART OF THE FOREST TO THE END.');g.messageTime=7;g.emit('HEART_ASSEMBLED');}
 ground(p:Position,height:number){
  if(this.dragon)return this.dragon.ground(p,height);
  if(this.lift.contains(p)&&height>=this.lift.y-.2)return this.lift.y;
  if(p.z<-2.5&&p.z>=-10)return 5;
  if(p.z<-10&&p.z>-20)return (p.z+20)*.5;
  if(p.z<-24&&p.z>-36){if(this.ferry.contains(p)&&height>=-.2)return 0;if(p.x>-9&&p.x<-5&&this.bridgeExtension>=.98&&height>=-.2)return 0;return -8;}
  return 0;
 }
 bridgeExtension=0;
 canMove(p:Position,height:number,grounded:boolean,from?:Position){
  if(this.assembly!=='complete'&&p.z<29)return false;
  if(this.dragon)return this.dragon.canMove(p,height,grounded,from);
  if(Math.abs(p.z-24)<.8&&this.gateLift<height+2.7)return false;
  if(this.bridgeExtension<.98&&p.x>-9&&p.x<-5&&p.z<-24&&p.z>-36)return false;
  if(from&&this.lift.contains(from,.38)&&this.lift.moving)return this.lift.contains(p,.38)&&grounded;
  if(this.lift.contains(p)&&height<this.lift.y-.18)return false;
  if(from&&this.ferry.contains(from,.38)&&this.ferry.moving)return this.ferry.contains(p,.38)&&grounded;
  // Limit slope step size using the same grounded movement tolerance as earlier rooms.
  return this.ground(p,height)<=height+.18;
 }
 solids(ignoreTransport=false):BoxBody[]{
  if(this.dragon)return this.dragon.solids(ignoreTransport);
  const box=(x:number,y:number,z:number,w:number,h:number,d:number):BoxBody=>({x,y,z,halfX:w/2,halfY:h/2,halfZ:d/2,yaw:0});
  return [box(0,this.gateLift+3,24,5,6,.8),box(0,4.65,-6.25,28,.7,7.5),
   ...(!ignoreTransport?[box(9,this.lift.y-.25,0,5,.5,5),box(0,-.25,this.ferry.worldZ,5,.5,5)]:[])];
 }
 holdCompanion(g:Game,h:Hero){if(this.dragon)return this.dragon.hold(g,h);const p=g.actors![h],m=g.motion[h];return this.paused||!this.cave&&(this.lift.aboard({...p,...m},g.blocks)||this.ferry.aboard({...p,...m},g.blocks)||m.y>0||p.z>-36&&p.z<-20);}
 companionSafe(g:Game,p:Position,h:Hero){if(this.dragon)return this.dragon.companionSafe(g,p,h);const m=g.motion[h];return this.canMove(p,m.y,true,g.actors?.[h])&&this.ground(p,m.y)>=0&&Math.abs(this.ground(p,m.y)-m.y)<.18&&
  !g.layout.sockets.some(s=>s.activationMode==='TOGGLE'&&separation(p,s)<1.8)&&!(p.z<-24&&p.z>-36&&!this.sections[2]);}
 feedback(g:Game,index:number):'correct'|'wrong'|'empty'{if(this.dragon){if(index>=10)return this.controls[index-10]?'correct':'empty';return !g.placed[index]?'empty':g.placed[index]!.text===DRAGON_WORDS[index]?'correct':'wrong';}if(index>=12)return this.controls[index-12]?'correct':'empty';const panel=HEART_PANELS.findIndex(p=>p.slots.includes(index));return this.language[panel]?'correct':g.placed[index]?'wrong':'empty';}
 locked(index:number){if(this.dragon)return index<10&&this.dragon.language[index<2?0:index<6?1:2];return index<12&&this.language[HEART_PANELS.findIndex(p=>p.slots.includes(index))];}
 drop(g:Game,b:LetterBlock){
  if(this.dragon){this.dragon.drop(g,b,this);return;}
  const height=g.motion[g.controlledHero].y;
  const pedestal=b===this.heart&&!this.cave&&separation(g.player,HEART_PEDESTAL)<2.6;
  const points=pedestal?[HEART_PEDESTAL]:dropPoints(b,g.blocks,g.player,g.facing);
  for(const p of points){const y=this.ground(p,height);
   if(y<0||Math.abs(y-height)>.2||this.lift.moving&&this.lift.contains(g.player)&&!this.lift.contains(p,b.size/2)||this.ferry.moving&&this.ferry.contains(g.player)&&!this.ferry.contains(p,b.size/2))continue;
   if(!g.canPlaceBlock(b,{...p,y},true))continue;
   Object.assign(b,p,{y,state:'floor',carrier:undefined,slot:undefined,support:undefined});return;
  }g.say('Move into a little more space to place it.');
 }
 tick(dt:number,g:Game){
  const actors=g.actors;if(!actors)return;
  if(this.assembly==='waiting'){
   if(heroes.some(h=>separation(actors[h],{x:0,z:33})<4&&g.motion[h].grounded))this.startAssembly(g);
   return;
  }
  if(this.paused){this.assemblyTime+=dt;if(!this.videoActive&&!this.videoPending&&this.assemblyTime>=6)this.finishAssembly(g);return;}
  // Validate the objective before any section/checkpoint can acknowledge its position.
  if(this.invalidCargo(g,this.heart))this.recover(g,this.heart);
  if(this.dragon){this.dragon.tick(dt,g,this);for(const b of g.blocks)if(b.state!=='socket'&&this.invalidCargo(g,b))this.recover(g,b);return;}
  if(!this.cave){
   this.controls=g.layout.sockets.slice(12).map(s=>heroes.some(h=>heroOnPlate(s,actors[h],g.motion[h])));
   const heartPose=g.blockBody(this.heart);
   if(heroes.every(h=>actors[h].z<23)&&heartPose.z<23)this.sections[0]=true;
   const open=this.sections[0]||this.controls[0]||this.controls[1];
   const under=heroes.filter(h=>Math.abs(actors[h].z-24)<.85);
   const heartClear=Math.abs(heartPose.z-24)<1?heartPose.y+heartPose.halfY:0;
   this.gateLift=open?Math.min(6,this.gateLift+dt*8):Math.max(heartClear,0,...under.map(h=>g.motion[h].y+2.8),this.gateLift-dt*12);
   this.lift.activate(this.controls.slice(2,4));
   const people=heroes.map(h=>({...actors[h],...g.motion[h]}));
   this.lift.advance(dt,people,g.blocks.filter(b=>!b.hidden),transportGuard(g,people));
   people.forEach((p,i)=>g.motion[heroes[i]].y=p.y);
   if(this.controls[5]&&!this.previousControls[5]&&!this.ferry.moving&&heroOnPlate(g.layout.sockets[17],actors[g.controlledHero],g.motion[g.controlledHero])){
    this.ferryCrew=new Set(heroes.filter(h=>this.ferry.aboard({...actors[h],...g.motion[h]},g.blocks)));
    this.ferryGoods=new Set(g.blocks.filter(b=>b.state==='floor'&&this.ferry.contains(b,b.size/2-.08)&&Math.abs((b.y??0)-this.ferry.y)<.15).map(b=>b.id));
    this.ferry.toggle();g.emit('FERRY_TOGGLE');
   }
   const riders=heroes.map(h=>({...actors[h],...g.motion[h]}));
   riders.forEach((p,i)=>{if(!this.ferryCrew.has(heroes[i]))p.grounded=false;});
   this.ferry.advance(dt,riders,g.blocks.filter(b=>!b.hidden&&this.ferryGoods.has(b.id)),transportGuard(g,riders));
   riders.forEach((p,i)=>actors[heroes[i]].z=p.z);
   this.previousControls=[...this.controls];
   if(heroes.every(h=>actors[h].z<-20)&&heartPose.z<-20)this.sections[1]=true;
   if(heroes.every(h=>actors[h].z<-36)&&heartPose.z<-36)this.sections[2]=true;
   g.bridge.update(dt,this.controls[4],this.sections[2]);this.bridgeExtension=g.bridge.extension;
   HEART_PANELS.forEach((p,i)=>{if(this.language[i]||!p.slots.every(s=>!!g.placed[s]))return;
    if(p.slots.every((s,n)=>g.placed[s]?.text===p.answer[n])){this.language[i]=true;g.emit('FINAL_SENTENCE_COMPLETE');g.say(p.answer.join(' ')+'.');}
   });
   g.solved=this.sections.every(Boolean)&&this.language.every(Boolean);
   if(this.heart.state==='floor'&&separation(this.heart,HEART_PEDESTAL)<1&&Math.abs(this.heart.y??0)<.2){this.heartArrived=true;this.advanceCheckpoint(5,HEART_PEDESTAL);}
   if(heartPose.z<23&&this.sections[0])this.advanceCheckpoint(1,{x:0,y:0,z:19});
   if(heartPose.z<-3&&heartPose.z>-10&&heartPose.y>4.8)this.advanceCheckpoint(2,{x:6,y:5,z:-7});
   if(heartPose.z<-20&&heartPose.z>-24)this.advanceCheckpoint(3,{x:0,y:0,z:-21});
   if(heartPose.z<-36)this.advanceCheckpoint(4,{x:0,y:0,z:-40});
  }
  for(const h of heroes){const a=actors[h],m=g.motion[h],floor=this.ground(a,m.y);
   if(m.grounded&&floor>=0&&!this.lift.contains(a)&&!this.ferry.contains(a))this.safeHeroes[h]={...a,y:m.y};
   if(m.y<-2||!Number.isFinite(a.x+a.z+m.y)){Object.assign(a,this.safeHeroes[h]);Object.assign(m,{y:this.safeHeroes[h].y,vy:0,grounded:true});g.emit('FALL_SAFE');if(this.heart.carrier===h)this.recover(g,this.heart);}
  }
  for(const b of g.blocks){if(!b.hidden&&b.state!=='socket'&&this.invalidCargo(g,b))this.recover(g,b);}
 }
 private invalidCargo(g:Game,b:LetterBlock){const body=g.blockBody(b),base=body.y-body.halfY,floor=this.ground(body,base);
  if(this.dragon?.cargoValid(g,b))return false;
  if(b.support!==undefined&&g.blocks[b.support]&&onTopOf(b,g.blocks[b.support])&&bodyClear(g,b,body))return false;
  if(this.dragon?.restored&&b===this.heart)return false;
  return !Number.isFinite(body.x+body.y+body.z)||base<-2||Math.abs(body.x)>g.layout.halfWidth||body.z>g.layout.halfDepth||body.z<(g.layout.exitZ??-g.layout.halfDepth)-4||
   b.state==='floor'&&(floor<0||Math.abs(base-floor)>.4)||!bodyClear(g,b,body);
 }
 private advanceCheckpoint(index:number,p:{x:number;y:number;z:number}){if(index>this.checkpointIndex){this.checkpointIndex=index;this.checkpoint={...p};}}
 recover(g:Game,b:LetterBlock){
  const home=b===this.heart?this.checkpoint:this.dragon&&b.id>=2&&b.id<10?{...g.layout.blockPositions[b.id],y:5}:g.layout.blockPositions[b.id];
  const points=[home];for(const r of [1.7,3.4,5.1])for(let i=0;i<16;i++)points.push({...home,x:home.x+Math.cos(i*Math.PI/8)*r,z:home.z+Math.sin(i*Math.PI/8)*r});
  const p=points.find(p=>{const y=this.ground(p,p.y??0);return y>=0&&Math.abs(y-(p.y??0))<.3&&bodyClear(g,b,restingBody({...b,...p,y,state:'floor'}))&&!Object.values(g.actors??{}).some(a=>separation(a,p)<b.size/2+.4);});
  if(!p)return;Object.assign(b,p,{y:this.ground(p,p.y??0),state:'floor',carrier:undefined,slot:undefined,support:undefined});if(b===this.heart){this.recoveries++;g.emit('HEART_RECOVERED');}else g.emit('WORD_RECOVERED');
 }
 snapshot(){return {dragon:this.dragon?.snapshot()??null,assembly:this.assembly,assemblyTime:this.assemblyTime,shards:this.shardCount,sections:this.sections,language:this.language,gateLift:this.gateLift,lift:{y:this.lift.y,state:this.lift.state},ferry:{z:this.ferry.worldZ,state:this.ferry.state},controls:this.controls,lastSafeHeartPosition:this.checkpoint,heartArrived:this.heartArrived,exitReady:this.exitReady,recoveries:this.recoveries};}
}
