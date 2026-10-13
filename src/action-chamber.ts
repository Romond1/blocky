import {LiftTransport} from './lift-transport.ts';
import {dropPoints} from './block-placement.ts';
import {LavaFerry,RIVER} from './lava-ferry.ts';
import {heroOnPlate} from './pressure-plates.ts';
import {carrySweep,heldBy,bodyClear,restingBody} from './carry-collision.ts';
import {transportGuard} from './transport-collision.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Hero,Position} from './split-mechanics.ts';
import {STATION_SURFACES,SUMMIT_BARRIERS,jumpStation,stationHeight,onConveyor,CONVEYOR_SPEED} from './action-layout.ts';
export {ACTION_JUMPS,STEP_COLUMNS,STEP_HALF_WIDTH,STEP_HALF_DEPTH,SUMMIT_BARRIERS,RUN_START,RUN_END,jumpStation,ACTION_STEPS,stairHeight} from './action-layout.ts';
export const ACTION_WORDS=['RUN','JUMP','LIFT'];
export class ActionChamber extends LiftTransport {
 override lift=new LavaFerry();
 earned=[false,false,false];matches=[false,false,false];
 get collected(){return this.earned;}
 conveyorTravel=0;
 stationStats={runBackwardSeconds:0,jumpFalls:0,constructionMoves:0};
 private lastRunZ:number|null=null;
 private lastJumpHeight=0;
 private occupied=[false,false];
 private lost:number[]=[];
 private safe:Record<Hero,Position>={yuki:{x:1,z:31.5},mia:{x:3,z:31.5}};
 constructor(){super(undefined,2);}
 override ground(p:Position,height:number){
  if(this.lift.contains(p)&&height>=-.2)return 0;
  if(p.z>RIVER.far&&p.z<RIVER.near)return -5;
  return stationHeight(p);
 }
 override canMove(p:Position,height:number,grounded:boolean,from?:Position){
  // A flat deck is open on all sides at the dock; travel retains stable passengers.
  if(from&&this.lift.contains(from,.38)&&this.lift.moving)return this.lift.contains(p,.38)&&grounded;
  if(height>2.9&&SUMMIT_BARRIERS.some(o=>Math.abs(p.x-o.x)<o.width/2+.38&&Math.abs(p.z-o.z)<o.depth/2+.38))return false;
  for(const a of STATION_SURFACES){
   if(height>=a.y-.1)continue;
   const clearance=(q:Position)=>Math.hypot(Math.max(0,Math.abs(q.x-a.x)-a.halfWidth),Math.max(0,Math.abs(q.z-a.z)-a.halfDepth));
   if(clearance(p)<.38&&(!from||clearance(p)<=clearance(from)))return false;
  }
  return this.ground(p,height)<=height+.18;
 }
 override interactionClear(_a:Position,_b:Position,_height:number){return true;}
 available(_b:LetterBlock){return true;}
 blockVisible(_index:number){return true;}
 stationHint(_p:Position){return '';}
 collect(g:Game,index:number){
  if(index>2||this.earned[index])return;
  this.earned[index]=true;g.emit(`${ACTION_WORDS[index]}_COLLECTED`);
 }
 place(g:Game,b:LetterBlock,index:number){
  if(g.placed[index]){g.say('Set your block down, then remove the block on the plate.');return;}
  if(!g.canPlaceBlock(b,{...g.layout.sockets[index],y:.29})){g.say('The block needs a clear path to the plate.');return;}
  Object.assign(b,{state:'socket',carrier:undefined,slot:index,x:g.layout.sockets[index].x,z:g.layout.sockets[index].z,y:.29});
  g.attempts++;this.matches[index]=b.text===ACTION_WORDS[index];
  if(!this.matches[index]){g.rejectionTime=1.2;g.say('Try another picture.');}else g.emit('ACTION_MATCHED');
  g.solved=this.matches.every(Boolean);if(g.solved)g.emit('ACTION_LANGUAGE_COMPLETE');
 }
 tick(dt:number,g:Game,actors:Record<Hero,Position>){
  const sockets=g.layout.sockets.slice(3);
  const occupied=sockets.map(s=>(['yuki','mia'] as const).some(h=>heroOnPlate(s,actors[h],g.motion[h])));
  for(let i=0;i<sockets.length;i++)if(occupied[i]&&!this.occupied[i]&&heroOnPlate(sockets[i],actors[g.controlledHero],g.motion[g.controlledHero])){
   const before=this.lift.state;this.lift.toggle();
   if(before!==this.lift.state){g.emit('FERRY_DEPART');this.pulse=1;}
  }
  this.occupied=occupied;this.controls=occupied;
  // Actor identity objects move directly; grounded support is sampled before displacement.
  const people=(['yuki','mia'] as const).map(h=>({...actors[h],...g.motion[h]}));
  const moving=this.lift.moving;this.lift.advance(dt,people,g.blocks,transportGuard(g,people));
  people.forEach((p,i)=>{actors[i===0?'yuki':'mia'].z=p.z;});
  if(moving&&!this.lift.moving)g.emit('FERRY_ARRIVED');this.pulse=Math.max(0,this.pulse-dt*.35);
  this.conveyorTravel+=dt*CONVEYOR_SPEED;
  for(const h of ['yuki','mia'] as const){
   const a=actors[h],motion=g.motion[h];
   if(!onConveyor(a)||motion.y>2.2)continue;
   const steps=Math.max(1,Math.ceil(dt*CONVEYOR_SPEED/.05));
   for(let i=0;i<steps;i++){
    const z=Math.min(24.55,a.z+dt*CONVEYOR_SPEED/steps);
    if(h===g.controlledHero){if(g.canMoveTo(a.x,z))a.z=z;}
    else {const cargo=heldBy(g,h),pose={...a,facing:(a as Position&{facing?:number}).facing??Math.PI,y:motion.y};
     if(this.canMove({...a,z},motion.y,motion.grounded,a)&&(!cargo||carrySweep(g,cargo,pose,{...pose,z})))a.z=z;
    }
   }
  }
  const player=actors[g.controlledHero],height=g.motion[g.controlledHero].y;
  if(onConveyor(player)&&this.lastRunZ!==null&&player.z>this.lastRunZ+.001)this.stationStats.runBackwardSeconds+=dt;
  this.lastRunZ=onConveyor(player)?player.z:null;
  if(jumpStation(player)&&this.lastJumpHeight>.5&&height===0)this.stationStats.jumpFalls++;
  this.lastJumpHeight=height;
  this.matches=ACTION_WORDS.map((word,i)=>g.placed[i]?.text===word&&this.earned[i]);g.solved=this.matches.every(Boolean);
  for(const h of ['yuki','mia'] as const){
   const a=actors[h],motion=g.motion[h];
   if(motion.grounded&&motion.y===0&&!jumpStation(a)&&(a.z>RIVER.near+.8||a.z<RIVER.far-.8))this.safe[h]={...a};
   if(motion.y< -2){Object.assign(a,this.safe[h]);Object.assign(motion,{y:0,vy:0,grounded:true});g.emit('FALL_SAFE');}
  }
  g.blocks.forEach((b,i)=>{
   const unsafe=b.state==='floor'&&(this.ground(b,b.y??0)<-1||Math.abs(b.x)>g.layout.halfWidth||Math.abs(b.z)>g.layout.halfDepth);
   this.lost[i]=unsafe?(this.lost[i]??0)+dt:0;
   if(this.lost[i]>1){this.recover(g,b);this.lost[i]=0;}
  });
 }
 recover(g:Game,b:LetterBlock){
  for(const child of g.blocks.filter(o=>o.support===b.id))this.recover(g,child);
  const home=g.layout.blockPositions[b.id];
  const candidates=[home,...[2.5,-2.5,5,-5].flatMap(d=>[{...home,x:home.x+d},{...home,z:home.z+d}])];
  const point=candidates.find(p=>{
   const y=p===home?(home.y??0):this.ground(p,10);
   const candidate={...b,...p,y,state:'floor' as const};
   return y>=0&&bodyClear(g,b,restingBody(candidate))&&!Object.values(g.actors??{}).some(a=>Math.hypot(a.x-p.x,a.z-p.z)<b.size/2+.4);
  });
  if(!point)return;
  Object.assign(b,point,{state:'floor',carrier:undefined,slot:undefined,y:point===home?(home.y??0):this.ground(point,10),support:undefined});g.emit('BLOCK_RECOVERED');
 }
 override drop(g:Game,b:LetterBlock){
  const m=g.motion[g.controlledHero],radius=b.size/2;
  for(const p of dropPoints(b,g.blocks,g.player,g.facing,b.size/2+.5)){
   const y=this.ground(p,m.y);
   if(y<0||Math.abs(y-m.y)>.2||Math.abs(p.x)>g.layout.halfWidth-.7||Math.abs(p.z)>g.layout.halfDepth-.7)continue;
   if(this.lift.contains(g.player)&&!this.lift.contains(p,radius))continue;
   if(!g.canPlaceBlock(b,{...p,y},true))continue;
   Object.assign(b,p,{state:'floor',carrier:undefined,slot:undefined,y,support:undefined});return;
  }
  g.say('Move into a little more space to place the block.');
 }
 companionSafe(p:Position){return (p.z>=RIVER.near+.8||p.z<=RIVER.far-.8)&&!jumpStation(p)&&!(p.x< -7&&p.z>9&&p.z<24.5)&&!(p.x>7&&p.z>10&&p.z<24.5);}
}

