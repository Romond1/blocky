import type {Game,LetterBlock} from './game.ts';
import type {Position} from './split-mechanics.ts';
import {heroOnPlate} from './pressure-plates.ts';
import {ABILITY_SENTENCES,ABILITY_STEPS,ABILITY_SCALE,ABILITY_CAROUSELS,ABILITY_RECOVERY} from './ability-layout.ts';
import {boxesOverlap,type BoxBody} from './block-collision.ts';
import {SentenceCarousel} from './sentence-carousel.ts';
import {bodyClear} from './carry-collision.ts';

/** Ordered sentence logic shared by every panel; fixed prefixes are presentation scaffolds. */
export class AbilityHall {
 readonly sentences=ABILITY_SENTENCES;
 readonly carousels=ABILITY_CAROUSELS.map(c=>new SentenceCarousel(c));
 machine(id:number){return this.carousels.find(c=>c.attached.has(id));}
 attached(id:number){return !!this.machine(id);}
 available(b:LetterBlock,actor:Position){const c=this.machine(b.id);return !c||c.canRetrieve(b.id,actor,b.size);}
 detach(g:Game,id:number){const c=this.machine(id);return !c||c.canRetrieve(id,g.player,g.blocks[id].size)&&c.detach(id,e=>g.emit(e));}
 plateRequired(index:number){if(index===14||index===15)return !this.cornerJoined;if(index===16)return !(this.completed[2]&&this.completed[3]);if(index===17)return !(this.completed[4]&&this.completed[5]);return false;}
 holdCompanion(p:Position,g:Game){return !this.exitOpen&&(p.x>1.2*ABILITY_SCALE||g.layout.sockets.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<3));}


 completed=ABILITY_SENTENCES.map(()=>false);
 wrongTime=ABILITY_SENTENCES.map(()=>0);
 buildProgress=0;buildCelebration=0;
 get buildLift(){const t=this.buildProgress;return 5.2*t*t*(3-2*t);}
 gateLift=0;cornerJoined=false;buildOpen=false;exitOpen=false;
 get cornerOpen(){return this.gateLift>=2.8;}
 heroActive=[false,false,false,false];
 panel(slot:number){return this.sentences.findIndex(d=>d.slots.includes(slot));}
 active(slot:number){const section=this.sentences[this.panel(slot)]?.section;return section===1||section===2&&this.completed[0]&&this.completed[1]||section===3&&this.buildOpen;}
 locked(slot:number){return !!this.completed[this.panel(slot)];}
 feedback(g:Game,slot:number):'correct'|'wrong'|'empty'|'inactive'{
  if(slot>=14&&slot<18)return this.heroActive[slot-14]?'correct':'empty';
  if(!this.active(slot))return 'inactive';const i=this.panel(slot);
  const d=this.sentences[i],block=g.placed[slot];
  return this.completed[i]?'correct':block&&block.text!==d.answer[d.fixed+d.slots.indexOf(slot)]?'wrong':'empty';
 }
 validate(g:Game,slot:number){
  const i=this.panel(slot),d=this.sentences[i];if(i<0||this.completed[i]||!this.active(slot))return;
  if(!d.slots.every(s=>!!g.placed[s]))return;
  g.attempts++;
  if(d.slots.every((s,n)=>g.placed[s]?.text===d.answer[d.fixed+n])){
   this.completed[i]=true;this.wrongTime[i]=0;g.stageSolved=[...this.completed];
   g.say(d.answer.join(' ')+'.');g.emit('SENTENCE_COMPLETE');
  }else{this.wrongTime[i]=1.2;g.rejectionTime=1.2;g.say('Try another order.');}
  if(!this.buildOpen&&this.completed[2]&&this.completed[3]){this.buildOpen=true;this.buildCelebration=3;g.emit('ABILITY_GATE_UNLOCKED');}
 }
 ground(p:Position){return Math.max(0,...ABILITY_STEPS.filter(s=>Math.abs(p.x-s.x)<s.width/2&&Math.abs(p.z-s.z)<s.depth/2).map(s=>s.y));}
 canPass(p:Position,height=0){const x=p.x/ABILITY_SCALE,z=p.z/ABILITY_SCALE;
  return (this.gateLift>=height+2.5||Math.abs(x)>.8||z<3.7||z>10.3)&&(this.buildLift>=height+2.5||z> -6.4||z< -7.6||x<3||x>48/ABILITY_SCALE);
 }
 canMove(p:Position,height:number){return this.canPass(p,height)&&this.ground(p)<=height+.18&&this.carousels.every(c=>Math.hypot(p.x-c.config.position.x,p.z-c.config.position.z)>=c.fenceRadius+.44);}
 solidBodies():BoxBody[]{
  const box=(x:number,z:number,width:number,height:number,depth:number):BoxBody=>({x,z,y:height/2,halfX:width/2,halfY:height/2,halfZ:depth/2,yaw:0});
  return [...[{...box(0,7*ABILITY_SCALE,.8*ABILITY_SCALE,4.8,6*ABILITY_SCALE),y:this.gateLift+2.4}],...([{...box(26.1,-7*ABILITY_SCALE,43.8,4.8,.8*ABILITY_SCALE),y:this.buildLift+2.4}]),...ABILITY_STEPS.map(s=>box(s.x,s.z,s.width,s.y,s.depth)),...this.carousels.map(c=>box(c.config.position.x,c.config.position.z,3.4,1.65,3.4)),...this.carousels.flatMap(c=>c.fenceBodies())];
 }
 companionSafe(g:Game,p:Position){
  return this.canMove(p,g.motion[g.controlledHero==='mia'?'yuki':'mia'].y)&&this.ground(p)===0&&
   !g.layout.sockets.some((s,i)=>{
    if(s.acceptedActivator!=='HERO')return false;const d=Math.hypot(p.x-s.x,p.z-s.z);
    if(i<16)return g.plateRequired(i)&&d<1.8;
    const actor=g.actors?.[g.controlledHero==='mia'?'yuki':'mia'];
    const current=actor?Math.hypot(actor.x-s.x,actor.z-s.z):Infinity;
    return d<1.8&&!(current<1.8&&d>=current-1e-6);
   });
 }
 tick(dt:number,g:Game){
  if(this.buildOpen)this.buildProgress=Math.min(1,this.buildProgress+dt/2.2);
  this.buildCelebration=Math.max(0,this.buildCelebration-dt);
  this.wrongTime=this.wrongTime.map(t=>Math.max(0,t-dt));
  this.heroActive=g.layout.sockets.slice(14,18).map(s=>Object.entries(g.actors??{[g.controlledHero]:g.player}).some(([h,p])=>heroOnPlate(s,p,g.motion[h as 'mia'|'yuki'])));
  for(const c of this.carousels){
   c.tick(dt,this.heroActive[c.config.brakeControlId-14],e=>g.emit(e));
   for(const id of [...c.attached]){const b=g.blocks[id];
    if(b.state!=='floor'){c.attached.delete(id);continue;}
    Object.assign(b,c.pose(id));
   }
  }
  const introDone=this.completed[0]&&this.completed[1];
  if(introDone&&g.actors&&Object.entries(g.actors).every(([h,p])=>p.x>1.2*ABILITY_SCALE&&g.motion[h as 'mia'|'yuki'].grounded&&Math.abs(g.motion[h as 'mia'|'yuki'].y)<.15))this.cornerJoined=true;
  const open=introDone&&(this.cornerJoined||this.heroActive[0]||this.heroActive[1]);
  if(open)this.gateLift=Math.min(4.8,this.gateLift+dt*8);
  else {
   const under=Object.entries(g.actors??{}).filter(([,p])=>Math.abs(p.x)<.4*ABILITY_SCALE+.38&&Math.abs(p.z-7*ABILITY_SCALE)<3*ABILITY_SCALE+.38);
   const clearance=under.length?Math.max(...under.map(([h])=>g.motion[h as 'mia'|'yuki'].y+2.7)):0;
   this.gateLift=Math.max(clearance,this.gateLift-dt*16);
  }
  if(this.completed[4]&&this.completed[5])this.exitOpen=true;
  g.solved=this.exitOpen;
  // A solved block is fixed. Other required blocks may roam, but cannot be lost.
  for(const b of g.blocks){
   if(this.attached(b.id))continue;
   if(b.state==='socket'&&this.locked(b.slot!))continue;
   const body=g.blockBody(b),p={x:body.x,z:body.z},base=body.y-body.halfY;
   const o=g.layout.obstacles??[];
   const trapped=this.solidBodies().some(s=>boxesOverlap(body,s))||o.some(s=>boxesOverlap(body,{x:s.x,z:s.z,y:s.height/2,halfX:s.width/2,halfY:s.height/2,halfZ:s.depth/2,yaw:0}));
   const optional=g.layout.optionalAreas?.some(a=>p.x>=a.left+b.size/2&&p.x<=a.right-b.size/2&&p.z>=a.back+b.size/2&&p.z<=a.front-b.size/2);
   const outside=!optional&&(Math.abs(p.x)>g.layout.halfWidth-b.size/2||p.z>g.layout.halfDepth-b.size/2||p.z<(g.layout.exitZ??-24)-3.5||p.z<g.layout.exitZ!&&Math.abs(p.x-g.layout.exitCenterX!)>g.layout.exitHalfWidth-b.size/2);
   if(outside||trapped||b.state!=='carried'&&!this.canMove(p,base)||base<-.5||base>4)this.recover(g,b);
  }
 }
 recover(g:Game,b:LetterBlock){
  const home=(b.id<2||b.id>=17)?g.layout.blockPositions[b.id]:ABILITY_RECOVERY[b.id<9?0:1];
  // Find an unoccupied staging spot if a child left another word at this home.
  const positions=[home,...((b.id<2||b.id>=17)?g.layout.blockPositions.filter(p=>Math.abs(p.z-home.z)<4):[])];
  for(const radius of [1.6,3.2,4.8])for(let i=0;i<16;i++)positions.push({x:home.x+Math.cos(i*Math.PI/8)*radius,z:home.z+Math.sin(i*Math.PI/8)*radius});
  const p=positions.find(p=>this.ground(p)===0&&this.canMove(p,0)&&
   g.blocks.every(other=>other===b||other.state==='carried'||Math.hypot(p.x-other.x,p.z-other.z)>1.1)&&
   Object.values(g.actors??{}).every(a=>Math.hypot(p.x-a.x,p.z-a.z)>1.1)&&
   bodyClear(g,b,{...p,y:b.size/2,yaw:0,halfX:b.size/2,halfY:b.size/2,halfZ:b.size/2}));
  // A fully crowded staging area retries next frame rather than overlapping words.
  if(!p)return;
  Object.assign(b,p,{y:0,state:'floor',slot:undefined,carrier:undefined,support:undefined});g.emit('WORD_RECOVERED');
 }
 snapshot(){return {carousels:this.carousels.map(c=>c.snapshot()),recoveryZones:ABILITY_RECOVERY,completed:this.completed,cornerOpen:this.cornerOpen,gateLift:this.gateLift,cornerJoined:this.cornerJoined,buildOpen:this.buildOpen,buildLift:this.buildLift,buildProgress:this.buildProgress,buildCelebration:this.buildCelebration,exitOpen:this.exitOpen,heroActive:this.heroActive,sentences:this.sentences.map((d,i)=>({id:d.id,section:d.section,fixed:d.fixed,slots:d.slots,complete:this.completed[i],sentence:this.completed[i]?d.answer.join(' ')+'.':null}))};}
}
