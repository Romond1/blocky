import {KageAlcove,insideArea} from './kage-alcove.ts';
import {Finale} from './finale.ts';
import {carryPoint,turnToward} from './movement.ts';
import {blockBody,carrySweep,pickupClear,heldBy,bodyClear} from './carry-collision.ts';
import {sweepClear,type BoxBody} from './block-collision.ts';
import {LUMA_MEMORY} from './luma-alcove.ts';
import {SortingFoundry} from './sorting-foundry.ts';
import {AbilityHall} from './ability-hall.ts';
import {ActionChamber} from './action-chamber.ts';
import {FruitLift} from './fruit-lift.ts';
import {CooperationChamber,cooperationGround} from './cooperation.ts';
import {heroOnPlate,objectOnPlate} from './pressure-plates.ts';
import {tryStack} from './block-stacking.ts';
import {dropPoints} from './block-placement.ts';
import { LIGHT_BLOCK, acceptsPlate, type BlockDefinition } from './blocks.ts';
import { TrainingTutorial } from './training.ts';
import { Bridge, newMotion, ground, tutorialGap, safeBlockFloor, TUTORIAL_GAP, type Hero, type Position } from './split-mechanics.ts';
import { canHeroInteract, HERO_ABILITIES } from './heroes.ts';
import { heroPuzzle, volcanoLayout, type PuzzleDefinition, type RoomLayout } from './puzzles.ts';

export type BlockState = 'floor' | 'carried' | 'socket';
export interface LetterBlock extends BlockDefinition {
  id: number; text: string; x: number; z: number; state: BlockState;
  y?:number; support?:number;
  slot?: number;
  carrier?: 'yuki' | 'mia';
  objective?:'heart'; hidden?:boolean;
}
export const PRESSURE_PLATE_TOP = .2825;
export const socket = volcanoLayout.sockets[0];
const distance = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

/** Flat collision footprint. The exit tunnel is accessible only after gate clearance. */
export function canStand(x: number, z: number, gateOpen: boolean, radius = 0.38, room: RoomLayout = volcanoLayout, footHeight = 0): boolean {
  const optional=room.optionalAreas?.some(a=>insideArea({x,z},a,radius));
  if (!optional&&(Math.abs(x) > room.halfWidth - radius || z > room.halfDepth - radius || z < (room.exitZ??-room.halfDepth) - 4 + radius)) return false;
  if (!optional&&z < (room.exitZ??-room.halfDepth) + radius && (!gateOpen || Math.abs(x-(room.exitCenterX??0)) > room.exitHalfWidth - radius)) return false;
  // Answer pedestal is solid, as are the low plinths along the lava edges.
  if (footHeight < PRESSURE_PLATE_TOP - .001 && room.sockets.some(s => s.acceptedActivator!=='HERO' && Math.abs(x - s.x) < (s.halfSize ?? room.pedestalHalfWidth) + radius && Math.abs(z - s.z) < (s.halfSize ?? room.pedestalHalfDepth) + radius)) return false;
  if (room.obstacles?.some(o => Math.abs(x - o.x) < o.width / 2 + radius && Math.abs(z - o.z) < o.depth / 2 + radius)) return false;
  return true;
}

/** Shared interaction/drop visibility: solid structures cannot be reached through. */
export function clearPath(a: { x: number; z: number }, b: { x: number; z: number }, room: RoomLayout): boolean {
  const steps = Math.max(1, Math.ceil(distance(a, b) / 0.1));
  for (let i = 0; i <= steps; i++) {
    const x = a.x + (b.x - a.x) * i / steps, z = a.z + (b.z - a.z) * i / steps;
    if (room.obstacles?.some(o => Math.abs(x - o.x) < o.width / 2 + 0.05 && Math.abs(z - o.z) < o.depth / 2 + 0.05)) return false;
  }
  return true;
}

export class Game {
  finale:Finale|null=null;
  memory:KageAlcove|null=null;
  actors:Record<Hero,Position>|null=null;
  cooperation:CooperationChamber|null=null;
  fruit:FruitLift|null=null;
  sorting:SortingFoundry|null=null;
  ability:AbilityHall|null=null;
  actionChamber:ActionChamber|null=null;
  get transport(){return this.actionChamber??this.sorting??this.fruit;}
  readonly requiredDevices=new Map<string,{hero:Hero;anchor:Position;radius:number}>();
  requirePresence(device:string,hero:Hero,radius=.65){this.requiredDevices.set(device,{hero,anchor:{...(this.actors?.[hero]??this.player)},radius});}
  releasePresence(device:string){this.requiredDevices.delete(device);}
  plateRequired(index:number){if(this.finale?.dragon)return index>=10&&(index!==10&&index!==11||!this.finale.dragon.locks[0]);if(this.finale)return index>=12&&index<14&&!this.finale.sections[0]||index===16&&!this.finale.sections[2];if(this.ability)return this.ability.plateRequired(index);if(this.memory&&index===this.memory.definition.slot)return false;if(this.actionChamber)return index>=3;return this.sorting?index>=7:this.fruit?index>=3:this.cooperation?this.cooperation.plateRequired(index,this):!this.solved;}
  presenceRequired(hero:Hero){const p=this.actors?.[hero];return [...this.requiredDevices.values()].some(d=>d.hero===hero&&!!p&&distance(p,d.anchor)<=d.radius)||!!p&&this.layout.sockets.some((s,i)=>heroOnPlate(s,p,this.motion[hero],this.plateRequired(i)));}
  refreshDevices(dt=0){this.finale?.tick(dt,this);this.ability?.tick(dt,this);if(this.actionChamber&&this.actors)this.actionChamber.tick(dt,this,this.actors);this.memory?.tick(dt,this);for(const [id,d] of this.requiredDevices){const p=this.actors?.[d.hero];if(p&&distance(p,d.anchor)>d.radius)this.requiredDevices.delete(id);}if(this.cooperation&&this.actors)this.cooperation.tick(dt,this,this.actors);if(this.fruit&&this.actors)this.fruit.tick(dt,this,this.actors);if(this.sorting&&this.actors)this.sorting.tick(dt,this,this.actors);}
  motion={yuki:newMotion(),mia:newMotion()};
  private jumpStart={yuki:0,mia:0};
  private climbAssisted={yuki:false,mia:false};
  bridge=new Bridge();
  events:string[]=[];
  get split(){return this.puzzle.id==='power';}
  emit(event:string){this.events.push(event);if(this.events.length>24)this.events.shift();}
  jump(){
    if(this.finale?.paused||this.finale?.assembly==='waiting')return false;
    const m=this.motion[this.controlledHero];
    if(!m.grounded||this.action||this.escaped)return false;
    if(this.actionChamber?.lift.moving&&this.actionChamber.riding(this,this.controlledHero))return false;
    if(this.fruit&&m.y<-.4&&this.fruit.lift.contains(this.player,-.38)&&this.fruit.lift.y-.5<m.y+2.8+1.4)return false;
    this.jumpStart[this.controlledHero]=m.y;this.climbAssisted[this.controlledHero]=false;
    m.grounded=false;m.vy=6.5;this.emit('JUMP');
    return true;
  }
  tickMotion(hero:Hero,p:Position,dt:number){
    const m=this.motion[hero];
    const oldY=m.y;
    const plate=(this.split||!!this.cooperation||!!this.transport||!!this.ability)&&m.y>=PRESSURE_PLATE_TOP-.001&&this.layout.sockets.some(s=>s.acceptedActivator!=='HERO'&&Math.abs((s.y??0)-m.y)<.5&&Math.abs(p.x-s.x)<(s.halfSize??this.layout.pedestalHalfWidth)+.38&&Math.abs(p.z-s.z)<(s.halfSize??this.layout.pedestalHalfDepth)+.38);
    const heroPlate=this.layout.sockets.some(s=>heroOnPlate(s,p,{...m,grounded:true,y:0}));
    let floor=this.finale?this.finale.ground(p,m.y):this.ability?(plate?PRESSURE_PLATE_TOP:this.ability.ground(p)+(heroPlate?.08:0)):this.transport?(plate?(this.layout.sockets.find(s=>s.acceptedActivator!=='HERO'&&Math.abs(p.x-s.x)<(s.halfSize??1.05)+.38&&Math.abs(p.z-s.z)<(s.halfSize??1.05)+.38)?.y??0)+PRESSURE_PLATE_TOP:this.transport.ground(p,m.y)):plate?PRESSURE_PLATE_TOP:this.cooperation?cooperationGround(p,this.bridge.extension,m.y<-.4)+(heroPlate?.08:0):heroPlate?.08:this.split?(this.memory?.contains(p)?0:ground(p,this.bridge,m.y<-.4)):0;
    // A box's y is its base; only tops below the feet can support a landing.
    for(const b of this.blocks){
      if(b.hidden||this.finale?.dragon?.attached(b.id)||this.ability?.attached(b.id)||b.state==='carried'||this.actionChamber&&!this.actionChamber.blockVisible(b.id))continue;
      const top=(b.y??(b.state==='socket'?.29:.015))+b.size;
      if(top<=m.y+.025&&Math.abs(p.x-b.x)<=b.size/2+.28&&Math.abs(p.z-b.z)<=b.size/2+.28)floor=Math.max(floor,top);
    }
    if(m.grounded&&floor<m.y-.1)m.grounded=false;
    if(!m.grounded){m.vy-=16*dt;m.y+=m.vy*dt;if(m.y<=floor&&m.vy<=0){m.y=floor;m.vy=0;m.grounded=true;this.emit(floor< -2?'FALL_SAFE':'LAND');}}
    else m.y=floor;
    const cargo=heldBy(this,hero);
    if(cargo&&m.y!==oldY){
      const facing=hero===this.controlledHero?this.facing:(p as Position&{facing?:number}).facing??Math.PI;
      const from={...p,facing,y:oldY},target=m.y;
      if(!carrySweep(this,cargo,from,{...from,y:target})){
        let safe=oldY,blocked=target;
        for(let i=0;i<14;i++){const y=(safe+blocked)/2;if(carrySweep(this,cargo,from,{...from,y}))safe=y;else blocked=y;}
        m.y=safe;m.vy=0;m.grounded=target<oldY;
      }
    }
    // A mistimed running jump returns to the lip instead of standing on lava.
    if(this.split&&m.grounded&&p.x< -3&&tutorialGap(p)){p.z=TUTORIAL_GAP.stop+.05;this.emit('JUMP_RETRY');}
    if(this.split&&p.z<TUTORIAL_GAP.far-.2&&m.grounded)m.crossed=true;
  }
  controlledHero: 'yuki' | 'mia' = 'yuki';
  readonly puzzle: PuzzleDefinition;
  player = { x: 0, z: 4 };
  facing = Math.PI;
  blocks: LetterBlock[] = [];
  solved = false;
  escaped = false;
  doorLift = 0;
  conduitProgress:number[]=[];
  doorCharge=0;
  get doorConduits(){if(this.finale)return this.conduitProgress.slice(0,12);if(this.ability)return this.conduitProgress.slice(0,14);return this.actionChamber?this.conduitProgress.slice(0,3):this.sorting?this.conduitProgress.slice(0,6):this.fruit?this.conduitProgress.slice(0,3):this.split?this.conduitProgress.slice(0,2):this.conduitProgress;}
  get doorPowered(){return this.solved && this.doorConduits.every(p=>p>=1);}
  message = '';
  messageTime = 0;
  rejectionTime = 0;
  attempts = 0;
  stageSolved: boolean[] = [];
  revealTime = 0;
  training:TrainingTutorial|null=null;
  action:{kind:'HEAVY_STRUGGLE'|'HEAVY_LIFT'|'HEAVY_DROP';hero:'yuki'|'mia';blockId:number;time:number;duration:number}|null=null;
  heavyImpact=0;
  lastHeavyEvent:''|'HEAVY_THUD'='';
  get heroWordSolved(){return this.training?.heroSolved ?? this.solved;}
  cancelAction(){if(this.action?.kind==='HEAVY_STRUGGLE'||this.action?.kind==='HEAVY_DROP'){this.training?.failedHeavy();this.heavyImpact=.35;this.lastHeavyEvent='HEAVY_THUD';}this.action=null;}
  dropStruggle(){if(!this.action)return;this.action={...this.action,kind:'HEAVY_DROP',time:0,duration:.28};this.training?.failedHeavy();}


  constructor(puzzle = heroPuzzle) { this.puzzle = puzzle; this.reset(); }
  get layout() { return this.puzzle.room ?? volcanoLayout; }
  get carried() { return this.blocks.find(b => b.state === 'carried' && (b.carrier ?? this.controlledHero) === this.controlledHero); }
  blockBody(block:LetterBlock){return blockBody(this,block);}
  private carryPose(){return {...this.player,facing:this.facing,y:this.motion[this.controlledHero].y};}
  private canCarryTo(x:number,z:number,facing=this.facing){const b=this.carried;if(!b)return true;const from=this.carryPose();return carrySweep(this,b,from,{...from,x,z,facing});}
  /** Placement never teleports a physical cube through another solid. */
  canPlaceBlock(block:LetterBlock,point:{x:number;y:number;z:number},lift=false){
    if(Object.entries(this.actors??{[this.controlledHero]:this.player}).some(([hero,a])=>{
      const feet=this.motion[hero as Hero].y;
      return point.y<feet+2.7&&point.y+block.size>feet+.025&&Math.hypot(Math.max(0,Math.abs(point.x-a.x)-block.size/2),Math.max(0,Math.abs(point.z-a.z)-block.size/2))<.38;
    }))return false;
    const to:BoxBody={...point,y:point.y+block.size/2,yaw:0,halfX:block.size/2,halfY:block.size/2,halfZ:block.size/2};
    const from=blockBody(this,block),clear=(p:BoxBody)=>bodyClear(this,block,p);
    // Cube faces repeat every quarter turn: never spin a square through its neighbor.
    to.yaw=Math.round(from.yaw/(Math.PI/2))*(Math.PI/2);
    if(sweepClear(from,to,clear))return true;
    if(!lift||point.y>this.motion[this.controlledHero].y+(block.weightClass==='light'?2.4:1.9))return false;
    const high=Math.max(from.y,to.y)+.06,up={...from,y:high},over={...to,y:high};
    return sweepClear(from,up,clear)&&sweepClear(up,over,clear)&&sweepClear(over,to,clear);
  }
  get socketBlock() { return this.blocks.find(b => b.state === 'socket'); }
  get placed() { return this.layout.sockets.map((_, i) => this.blocks.find(b => b.state === 'socket' && b.slot === i)); }
  get nearbySlot() {
    const heavy=this.carried?.weightClass==='heavy';
    const finaleWord=!!this.finale?.dragon&&this.carried?.weightClass==='light'&&this.carried.objective!=='heart';
    const anchor=carryPoint({...this.player,facing:this.facing},this.carried?.size??.95);
    return this.layout.sockets.map((s,index)=>({s,index,d:distance(this.player,s),front:distance(anchor,s)}))
      .filter(({s,d,front})=>(!this.transport||Math.abs((s.y??0)-this.motion[this.controlledHero].y)<.5)&&s.acceptedActivator!=='HERO'&&(finaleWord?(d<3.1&&front<1.75&&Math.abs((s.y??0)-this.motion[this.controlledHero].y)<.6):heavy?(d<3.35||front<2.05):d<(s.reach??(this.puzzle.sequence||this.puzzle.stages?2.5:2.15)))&&clearPath(this.player,s,this.layout)&&(!heavy||clearPath(anchor,s,this.layout)))
      .sort((a,b)=>finaleWord?a.front-b.front:(heavy?Math.min(a.d,a.front):a.d)-(heavy?Math.min(b.d,b.front):b.d))[0]?.index??-1;
  }
  canMoveTo(x:number,z:number){
    if(this.finale&&!this.finale.canMove({x,z},this.motion[this.controlledHero].y,this.motion[this.controlledHero].grounded,this.player))return false;
    if(this.ability&&!this.ability.canMove({x,z},this.motion[this.controlledHero].y))return false;
    if(!this.canCarryTo(x,z))return false;
    if(this.memory&&!this.memory.canPass({x,z},this.motion[this.controlledHero].y))return false;
    if(this.transport&&!this.transport.canMove({x,z},this.motion[this.controlledHero].y,this.motion[this.controlledHero].grounded,this.player))return false;
    if(this.cooperation){
      const m=this.motion[this.controlledHero];
      if(!this.cooperation.canPassGate({x,z},m.y))return false;
      if(cooperationGround({x,z},this.bridge.extension,m.y<-.4)>m.y+.18)return false;
    }
    if(this.split){
      const m=this.motion[this.controlledHero];
      if(x<9&&z>15&&(x< -13.1||x> -6.9))return false;
      if(m.grounded&&x< -3&&(tutorialGap({x,z})||(this.player.z>=TUTORIAL_GAP.stop&&z<TUTORIAL_GAP.stop&&z>TUTORIAL_GAP.far-.4)))return false;
      if((this.memory?.contains({x,z})?0:ground({x,z},this.bridge,m.y<-.4))>m.y+.18)return false;
    }
    if(!canStand(x,z,this.doorLift>2.8,.38,this.layout,this.motion[this.controlledHero].y))return false;
    return this.blocks.every(b=>{
      if(b.hidden||b.state==='carried'&&(b.carrier??this.controlledHero)===this.controlledHero||this.actionChamber&&!this.actionChamber.blockVisible(b.id))return true;
      const body=blockBody(this,b),height=this.motion[this.controlledHero].y;
      if(height>=body.y+body.halfY-.025||body.y-body.halfY>height+2.7)return true;
      const clearance=(px:number,pz:number)=>{
        const x=px-body.x,z=pz-body.z,c=Math.cos(body.yaw),s=Math.sin(body.yaw);
        const dx=Math.abs(x*c-z*s)-body.halfX,dz=Math.abs(x*s+z*c)-body.halfZ;
        return Math.hypot(Math.max(dx,0),Math.max(dz,0))+Math.min(Math.max(dx,dz),0);
      };
      const current=clearance(this.player.x,this.player.z),next=clearance(x,z);
      return next>=.38||current<.38&&next>current+1e-6;
    });
  }
  slotStage(index: number) { return this.puzzle.stages?.findIndex(stage => stage.slots.includes(index)) ?? -1; }
  slotActive(index: number) { if(this.ability)return this.ability.active(index); if(this.actionChamber)return index<3; if(this.memory&&index===this.memory.definition.slot)return true; if(this.sorting)return index<7; if(this.fruit)return index<3; if(this.cooperation)return index===2; const stage = this.slotStage(index); return stage <= 0 || this.stageSolved[stage - 1]; }
  slotLocked(index: number) { if(this.finale)return this.finale.locked(index); if(this.ability)return this.ability.locked(index); if(this.actionChamber)return false; if(this.memory&&index===this.memory.definition.slot)return false; if(this.sorting)return false; if(this.fruit)return !!this.fruit.matches[index]; if(this.cooperation)return false; if(this.training)return false;return this.solved || !!this.stageSolved[this.slotStage(index)]; }
  slotFeedback(index: number): 'inactive' | 'empty' | 'correct' | 'wrong' {
    if(this.finale)return this.finale.feedback(this,index);
    if(this.ability)return this.ability.feedback(this,index);
    if(this.actionChamber){if(index<3)return this.actionChamber.matches[index]?'correct':this.placed[index]?'wrong':'empty';return this.actionChamber.controls[index-3]?'correct':'empty';}
    if(this.memory&&index===this.memory.definition.slot)return this.memory.solved?'correct':this.placed[index]?'wrong':'empty';
    if(this.sorting)return this.sorting.feedback(this,index);
    if(this.fruit){if(index>=3)return this.fruit.controls[index-3]?'correct':'empty';return this.fruit.matches[index]?'correct':this.placed[index]?'wrong':'empty';}
    if(this.cooperation){if(index<2&&this.stageSolved[0]||index===3&&this.cooperation.bridgeLocked||index===2&&this.cooperation.bridgeLocked)return 'correct';if(index===2)return this.cooperation.heavyActive?'correct':'empty';return this.cooperation.heroActive[index]?'correct':'empty';}
    if(this.training){const b=this.placed[index];return (index===0?this.training.heroSolved:this.training.heavyActivated)?'correct':!b?'empty':'wrong';}
    if (!this.slotActive(index)) return 'inactive';
    const block = this.placed[index]; if (!block) return 'empty';
    const stage = this.puzzle.stages?.[this.slotStage(index)];
    if (!stage) return this.solved ? 'correct' : 'empty';
    return block.text === stage.answers[stage.slots.indexOf(index)] ? 'correct' : 'wrong';
  }
  get activeStage() { return this.puzzle.stages?.[Math.max(0, this.stageSolved.findIndex(solved => !solved))]; }
  get nearSocket() { return this.nearbySlot >= 0; }
  get word() { return this.puzzle.display.map(s => s === '_' && this.heroWordSolved ? this.puzzle.answer : s).join(' '); }
  private supportsHero(b:LetterBlock){
    const m=this.motion[this.controlledHero];
    return m.grounded&&Math.abs(m.y-(b.y??0)-b.size)<.1&&Math.abs(this.player.x-b.x)<=b.size/2+.28&&Math.abs(this.player.z-b.z)<=b.size/2+.28;
  }
  get nearest() {
    return this.blocks.filter(b => !b.hidden && b.state !== 'carried' && !(b.state === 'socket' && this.slotLocked(b.slot ?? 0)))
      .filter(b=>!this.finale?.dragon||this.finale.dragon.available(b,this.player)&&Math.abs((b.y??0)-this.motion[this.controlledHero].y)<2.7&&!(b===this.finale.heart&&this.finale.dragon.restored))
      .filter(b=>!this.ability||this.ability.available(b,this.player))
      .filter(b=>!this.supportsHero(b)&&(!this.actionChamber||this.actionChamber.available(b)))
      .filter(b => (!this.transport||Math.abs((b.y??0)-this.motion[this.controlledHero].y)<(b.weightClass==='light'?2.7:1.9)&&this.transport.interactionClear(this.player,b,this.motion[this.controlledHero].y))&&distance(this.player, b) < (b.size > 1 || b.state === 'socket' && this.puzzle.sequence ? 2.5 : 1.8) && clearPath(this.player, b, this.layout))
      .sort((a, b) => distance(this.player, a) - distance(this.player, b)||(b.y??0)-(a.y??0))[0];
  }
  get hint() {
    if(this.finale?.dragon?.choiceZone(this.player))return '[E] TO CHOOSE';
    if(this.finale?.dragon?.restored)return this.finale.dragon.choice==='continue_adventure'?'THE ADVENTURE CONTINUES...':'';
    if(this.finale){if(this.finale.paused)return '';if(this.finale.assembly==='waiting')return 'Step into the golden circle.';if(this.carried)return '[E] Place';if(this.nearest)return `[E] Pick up ${this.nearest.text}`;return this.finale.cave?'TAKE THE HEART OF THE FOREST TO THE END.':'';}
    if(this.ability){if(this.escaped)return 'Room complete · R to play again';if(this.carried)return '[E] Place';if(this.nearest)return `[E] Pick up ${this.nearest.text}`;return '';}
    if(this.actionChamber){if(this.escaped)return 'Room complete · R to play again';if(this.action?.kind==='HEAVY_STRUGGLE')return 'Try to move with the heavy block';if(this.carried)return '[E] Place';if(this.nearest)return `[E] Pick up ${this.nearest.text||(this.nearest.weightClass==='heavy'?'heavy block':'block')}`;return this.actionChamber.stationHint(this.player);}
    if(this.memory?.contains(this.player)){if(this.carried)return this.nearbySlot===this.memory.definition.slot?'[E] Place animal block':'[E] Drop';if(this.nearest)return `[E] Pick up ${this.nearest.text}`;return this.memory.solved?'A memory awakens.':`What animal is ${this.memory.definition.character}?`;}
    if(this.sorting){if(this.escaped)return 'Room complete · R to play again';if(this.carried)return '[E] Place';if(this.nearest)return `[E] Pick up ${this.nearest.text}`;return '';}
    if(this.fruit){if(this.escaped)return 'Room complete · R to play again';if(this.carried)return '[E] Place';if(this.nearest)return `[E] Pick up ${this.nearest.text}`;return '';}
    if(this.cooperation){if(this.escaped)return 'Room complete · R to play again';if(this.action)return this.action.kind==='HEAVY_STRUGGLE'?'Try to move with the heavy block':'';if(this.carried)return this.nearbySlot===2&&this.carried.weightClass==='heavy'?'[E] Place':'[E] Place / stack';if(this.nearest)return `[E] Pick up ${this.nearest.text}`;return '';}
    if(this.split&&!this.carried&&!this.nearest){
      if(this.player.z>16&&!this.motion[this.controlledHero].crossed)return 'Press Space to jump';
      if(!this.motion.yuki.crossed||!this.motion.mia.crossed)return '[TAB] Switch hero — both heroes must jump';
      if(this.motion[this.controlledHero].y<-.5)return 'Safe landing. Follow the ramp back to Yuki’s side.';
      if(this.solved)return 'The path is safe. Return to the exit together.';
      return this.stageSolved[0]?`Platforms: ${this.bridge.state} · Mia is fast!`:'Read the floor map. Find Yuki’s heavy answer plate.';
    }
    if(this.action?.kind==='HEAVY_STRUGGLE')return 'Try to move with the heavy block';
    if(this.action?.kind==='HEAVY_LIFT')return 'Lift!';
    if (this.escaped) return 'Room complete · R to play again';
    if (this.carried) {
      const slot = this.nearbySlot;
      if (slot >= 0 && !this.slotActive(slot)) return 'This station needs power. Solve the heroes first.';
      if (slot >= 0 && !this.slotLocked(slot) && this.puzzle.stages) {
        const stage = this.puzzle.stages[this.slotStage(slot)], label = stage.labels[stage.slots.indexOf(slot)];
        return this.placed[slot] ? `[E] Swap ${label} answer` : `[E] Place ${label} answer`;
      }
      if (slot >= 0 && !this.slotLocked(slot)) return this.placed[slot]
        ? `[E] Swap with ${this.puzzle.sequence ? `pedestal ${slot + 1}` : 'the answer slot'}`
        : `[E] Place ${this.puzzle.sequence ? `on pedestal ${slot + 1}` : 'in the answer slot'}`;
      return '[E] Drop';
    }
    const block = this.nearest;
    if (block) return `[E] Pick up ${block.text}`;
    return this.solved ? 'Walk through the glowing doorway' : this.puzzle.stages ? this.stageSolved[0] ? 'The armor-memory station is awake. Find an episode block.' : 'Explore the chamber. Find words for Mia and Yuki.' : this.puzzle.sequence ? 'Find the story blocks. Arrange them from 1 to 3.' : 'Walk up to a letter block';
  }
  refreshTrainingPlates(){
    if(!this.training)return;
    const [letter,heavy]=this.placed;
    this.training.heroOnPlate=!!letter&&letter.weightClass==='light'&&letter.text===this.puzzle.answer;
    this.training.heavyOnPlate=!!heavy&&heavy.weightClass==='heavy';
    if(this.training.heroSolved)this.training.emit('HERO_WORD_COMPLETED');
    if(this.training.heavyActivated)this.training.emit('HEAVY_BLOCK_PLATE_ACTIVATED');
    this.solved=this.training.heroSolved&&(this.layout.sockets.length===1||this.training.heavyActivated);
    this.conduitProgress=this.conduitProgress.map((p,i)=>this.slotFeedback(i)==='correct'?p:0);
    if(!this.solved)this.doorCharge=0;
    if(this.solved)this.training.emit('ROOM_EXIT_UNLOCKED');
  }
  say(message: string) { this.message = message; this.messageTime = 3.5; }
  reset() {
    this.finale=this.puzzle.id==='heart'||this.puzzle.id==='dragon'?new Finale(this.puzzle.id==='dragon'):null;
    this.ability=this.puzzle.id==='ability'?new AbilityHall():null;
    this.memory=this.split?new KageAlcove():this.puzzle.id==='fruit'?new KageAlcove(LUMA_MEMORY):null;
    this.sorting=this.puzzle.id==='sorting'?new SortingFoundry():null;
    this.actionChamber=this.puzzle.id==='action'?new ActionChamber():null;
    this.fruit=this.puzzle.id==='fruit'?new FruitLift():null;this.cooperation=this.puzzle.id==='cooperation'?new CooperationChamber():null;this.requiredDevices.clear();
    this.motion={yuki:newMotion(),mia:newMotion()};this.bridge=new Bridge();this.events=[];
    this.jumpStart={yuki:0,mia:0};this.climbAssisted={yuki:false,mia:false};
    this.player = { ...this.layout.spawn }; this.facing = Math.PI;
    this.training=this.puzzle.training?new TrainingTutorial(this.layout.sockets.length>1):null;this.action=null;this.heavyImpact=0;this.lastHeavyEvent='';
    this.blocks = this.puzzle.choices.map((text, id) => ({ ...LIGHT_BLOCK, size:this.puzzle.blockSize??(text.length>1?1.65:.95), ...this.puzzle.blocks?.[id], id, text, ...(this.layout.blockPositions[id] ?? { x: id * 2 - 3, z: 2 }), state: 'floor' }));
    if(this.ability)for(const c of this.ability.carousels)for(const id of c.attached)Object.assign(this.blocks[id],c.pose(id));
    this.finale?.bind(this);
    // Shuffle letters among three spaced, reachable floor locations; never place a block in a wall or on a plate.
    if(this.training)for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1)),a=this.blocks[i],b=this.blocks[j];const point={x:a.x,z:a.z};a.x=b.x;a.z=b.z;b.x=point.x;b.z=point.z;}
    this.solved = false; this.escaped = false; this.doorLift = 0; this.conduitProgress=this.layout.sockets.map(()=>0);this.doorCharge=0;
    this.message = ''; this.messageTime = 0;
    this.rejectionTime = 0; this.attempts = 0;
    this.stageSolved = this.ability?this.ability.completed.map(()=>false):this.cooperation?[false,false,false]:this.puzzle.stages?.map(() => false) ?? []; this.revealTime = 0;
  }
  interact() {
    if(this.finale?.dragon?.choose(this))return;
    if(this.finale?.paused||this.finale?.assembly==='waiting')return;
    if (this.escaped) return;
    if((this.split||this.cooperation||this.transport||this.ability)&&(!this.motion[this.controlledHero].grounded||!this.sorting&&this.motion[this.controlledHero].y<-.1))return;
    if(this.action){if(this.action.kind==='HEAVY_STRUGGLE')this.dropStruggle();return;}
    const block = this.carried;
    if (!block) {
      const nearest = this.nearest;
      if (nearest) {
        if(this.actionChamber&&Math.abs(this.motion[this.controlledHero].y-(nearest.y??0)-nearest.size)<.1&&Math.abs(this.player.x-nearest.x)<nearest.size/2+.38&&Math.abs(this.player.z-nearest.z)<nearest.size/2+.38){this.say('Step off the block before picking it up.');return;}
        if(this.blocks.some(b=>b.support===nearest.id&&b.state!=='carried')){this.say('Pick up the top block first.');return;}
        if(canHeroInteract(this.controlledHero,nearest)&&!pickupClear(this,nearest)){this.say('Make room in front before picking up the block.');return;}
        if(nearest.weightClass==='heavy'){
          this.messageTime=0;
          if(canHeroInteract(this.controlledHero,nearest)){
            this.action={kind:'HEAVY_LIFT',hero:this.controlledHero,blockId:nearest.id,time:0,duration:.45};
          }else{
            this.action={kind:'HEAVY_STRUGGLE',hero:this.controlledHero,blockId:nearest.id,time:0,duration:2.8};
            this.training?.emit('HEAVY_BLOCK_INTERACTED_MIA');
          }
          return;
        }
        if(this.finale?.dragon?.attached(nearest.id)&&!this.finale.dragon.carousel.detach(nearest.id,e=>this.emit(e)))return;
        if(this.ability&&!this.ability.detach(this,nearest.id))return;
        nearest.state = 'carried'; nearest.carrier = this.controlledHero; nearest.slot = undefined;nearest.support=undefined;
        this.actionChamber?.collect(this,nearest.id);
        if(this.actionChamber&&nearest.id>=3)this.actionChamber.stationStats.constructionMoves++;
        this.training?.emit('LIGHT_BLOCK_PICKED_UP');this.refreshTrainingPlates();this.memory?.tick(0,this);this.sorting?.refreshMatches(this);
      }
      return;
    }
    if(block.objective!=='heart'&&this.nearbySlot<0&&tryStack(block,this.blocks,{...this.player,y:this.motion[this.controlledHero].y},this.facing,
      b=>b.objective!=='heart'&&(!this.actionChamber||this.actionChamber.blockVisible(b.id))&&!this.finale?.dragon?.attached(b.id)&&!this.ability?.attached(b.id)&&clearPath(this.player,b,this.layout),
      p=>p.y<=this.motion[this.controlledHero].y+(block.weightClass==='light'?2.4:1.9)&&this.canPlaceBlock(block,p,true),true,!!this.actionChamber&&block.id>=3||!!this.finale?.dragon)){this.refreshDevices();return;}
    if(this.finale&&(block.objective==='heart'||this.nearbySlot<0)){this.finale.drop(this,block);return;}
    if(this.actionChamber&&block){const slot=this.nearbySlot;if(slot>=0&&(slot<3&&block.id<3&&block.weightClass==='light'))this.actionChamber.place(this,block,slot);else this.actionChamber.drop(this,block);return;}
    if(this.sorting&&block&&this.nearbySlot<0){this.sorting.drop(this,block);return;}
    if(this.memory&&this.nearbySlot===this.memory.definition.slot){if(block.weightClass==='light')this.memory.place(this,block);else this.say('Use a small animal block.');return;}
    if(this.fruit&&block&&!this.memory?.contains(this.player)){const slot=this.nearbySlot;if(slot>=0&&slot<3&&!this.slotLocked(slot))this.fruit.place(this,block,slot);else this.fruit.drop(this,block);return;}
    const slot = this.nearbySlot;
    if(!this.training&&slot>=0&&!acceptsPlate(block,this.layout.sockets[slot])){this.say(this.ability?(block.weightClass==='heavy'?'Use a small word for Mia.':'Use a large word for Yuki.'):(block.weightClass==='heavy'?'Use the large amber plate.':'This plate needs a heavy block.'));return;}
    if (slot >= 0 && !this.slotActive(slot)) { this.say(this.ability?'Finish the panels nearby.':'Restore the heroes’ powers to activate this station.'); return; }
    if (slot >= 0 && !this.slotLocked(slot)) {
      const target=this.layout.sockets[slot];
      if(this.placed[slot]){this.say('Set your block down, then remove the block on the plate.');return;}
      if(!this.canPlaceBlock(block,{...target,y:(target.y??0)+.29})){this.say('The block needs a clear path to the plate.');return;}
      block.state = 'socket'; block.carrier = undefined; block.slot = slot;
      block.x = this.layout.sockets[slot].x; block.z = this.layout.sockets[slot].z;
      block.y=(target.y??0)+.29;block.support=undefined;
      if(this.finale){this.refreshDevices();if(this.finale.dragon&&this.slotFeedback(slot)==='wrong'){this.rejectionTime=1;this.say('Try another word.');}return;}
      if(this.ability){this.ability.validate(this,slot);this.refreshDevices();return;}
      if(this.sorting){block.y=.29;this.sorting.placedPair(this,slot);this.refreshDevices();return;}
      if(this.cooperation){block.y=.29;this.refreshDevices();return;}
      if(this.training){
        this.attempts++;
        if(block.weightClass==='light')this.training.emit('LIGHT_BLOCK_PLACED');
        this.refreshTrainingPlates();
        if(this.solved)this.say('Power is flowing to the door! Escape together.');
        else if(this.slotFeedback(slot)==='correct')this.say(slot===0?'HERO! One plate powered.':'Heavy plate powered. Complete HERO on the left.');
        else {this.rejectionTime=1.5;this.say(this.layout.sockets.length===1?'Try another block. Find the missing letter in HERO.':'Try another block. E goes left; HEAVY goes right.');}
        return;
      }
      const stageIndex = this.slotStage(slot), stage = this.puzzle.stages?.[stageIndex];
      if (stage) {
        this.attempts++;
        const correct = this.slotFeedback(slot) === 'correct';
        this.stageSolved[stageIndex] = stage.slots.every(index => this.slotFeedback(index) === 'correct');
        this.solved = this.stageSolved.every(Boolean);
        if(this.split&&this.stageSolved[stageIndex]){this.emit(stageIndex===0?'YUKI_PUZZLE_SOLVED':'MIA_PUZZLE_SOLVED');if(this.solved){this.emit('PLATFORM_LOCKED');this.emit('DOOR_UNLOCK');}}
        if(!correct)this.rejectionTime=1.5;
        this.say(this.stageSolved[stageIndex] ? stage.success : correct ? `${stage.labels[stage.slots.indexOf(slot)]} — correct!` : stage.wrong);
        return;
      }
      // Never reveal partial correctness: evaluate only a complete arrangement.
      if (this.placed.every(Boolean)) {
        this.attempts++;
        const answer = this.puzzle.sequence ?? [this.puzzle.answer];
        this.solved = this.placed.every((b, index) => b?.text === answer[index]);
        this.rejectionTime = this.solved ? 0 : 1.5;
        this.say(this.puzzle.sequence
          ? this.solved ? 'MEMORY RESTORED' : "THAT’S NOT HOW THE STORY HAPPENED..."
          : this.solved ? 'CORRECT! The door is opening.' : 'Try again! Pick it up and try another letter.');
      }
      return;
    }
    // Never relocate a blocked drop to the hero's side or behind them.
    const radius = block.size/2;
    for (const point of dropPoints(block,this.blocks,this.player,this.facing)) {
        if ((!this.cooperation||this.cooperation.safeDrop(point))&&(!this.split||this.memory?.contains(point)||safeBlockFloor(point))&&canStand(point.x, point.z, this.doorLift > 2.8, radius, this.layout) &&
          clearPath(this.player, point, this.layout) && distance(this.player,point)>=radius+.38 &&
          this.canPlaceBlock(block,{...point,y:0},true)) {
          Object.assign(block, point, { state: 'floor', slot: undefined, carrier: undefined, y:0, support:undefined });if(block.weightClass==='light')this.training?.emit('LIGHT_BLOCK_PLACED'); return;
        }
    }
    this.say('Move into a little more space to drop the block.');
  }
  update(dt: number, dx = 0, dz = 0, allowSoloExit = true) {
    this.refreshDevices(dt);
    if(this.finale?.dragon?.choice==='leave_block_world')return;
    if(this.finale?.paused)return;
    if(this.split){const old=this.bridge.extension;this.bridge.update(dt,!!this.stageSolved[0],!!this.stageSolved[1]);if(old===0&&this.bridge.extension>0)this.emit('PLATFORM_EXTEND');if(old===1&&this.bridge.extension<1)this.emit('PLATFORM_RETRACT');}
    const before={...this.player};
    this.heavyImpact=Math.max(0,this.heavyImpact-dt);
    if(this.training)this.training.tick(dt);
    if(this.training)this.training.failureNotice=Math.max(0,this.training.failureNotice-dt);
    if(this.action){
      this.action.time+=dt;
      if(this.action.kind==='HEAVY_STRUGGLE'){
        if(Math.hypot(dx,dz)>0){this.dropStruggle();}
        else if(this.action.time>=this.action.duration)this.dropStruggle();
      }else if(this.action.kind==='HEAVY_LIFT'){
        dx=0;dz=0;
        const lifting=this.blocks[this.action.blockId];
        if(!bodyClear(this,lifting,blockBody(this,lifting))){this.action=null;this.say('Make room to lift the block.');}
        if(!this.action)return;
        if(this.action.time>=this.action.duration){const b=this.blocks[this.action.blockId];b.state='carried';if(this.actionChamber&&b.id>=3)this.actionChamber.stationStats.constructionMoves++;b.carrier=this.action.hero;b.slot=undefined;b.support=undefined;this.training?.emit('HEAVY_BLOCK_PICKED_UP_YUKI');this.action=null;this.refreshTrainingPlates();}
      }else if(this.action.time>=this.action.duration){this.heavyImpact=.35;this.lastHeavyEvent='HEAVY_THUD';this.action=null;}
    }
    this.messageTime = Math.max(0, this.messageTime - dt);
    this.rejectionTime = Math.max(0, this.rejectionTime - dt);
    if (this.stageSolved[0]) this.revealTime = Math.min(1, this.revealTime + dt * 0.8);
    const chargeRemaining=Math.max(0,...this.doorConduits.map(p=>(1-p)*1.8));
    const doorRemaining=(1-this.doorCharge)*.65;
    this.conduitProgress=this.conduitProgress.map((p,i)=>this.slotFeedback(i)==='correct'?Math.min(1,p+dt/1.8):0);
    if(!this.doorPowered){this.doorCharge=0;const occupants=(this.sorting||this.actionChamber)&&this.actors?(['yuki','mia'] as const).filter(h=>Math.abs(this.actors![h].x-(this.layout.exitCenterX??0))<this.layout.exitHalfWidth+.38&&Math.abs(this.actors![h].z-(this.layout.exitZ??-this.layout.halfDepth))<.75):[];const clearance=occupants.length?Math.max(2.9,...occupants.map(h=>this.motion[h].y+2.7)):0;this.doorLift=Math.max(clearance,this.doorLift-dt*2.3);}
    else this.doorCharge=Math.min(1,this.doorCharge+Math.max(0,dt-chargeRemaining)/.65);
    if (this.doorPowered) this.doorLift = Math.min(this.layout.doorTravel, this.doorLift + Math.max(0,dt-chargeRemaining-doorRemaining) * 2.3);
    if (this.escaped) return;
    const length = Math.hypot(dx, dz);
    if (length > 0) {
      dx /= Math.max(1,length); dz /= Math.max(1,length);
      // A near-edge jump gets one small boost onto a reachable box, never a wall.
      const m=this.motion[this.controlledHero];
      if(!m.grounded&&!this.climbAssisted[this.controlledHero]&&m.y>this.jumpStart[this.controlledHero]+.55&&m.vy>-2){
        const ledge=this.blocks.filter(b=>b.state!=='carried'&&(!this.actionChamber||this.actionChamber.blockVisible(b.id)))
          .map(b=>({b,top:(b.y??(b.state==='socket'?.29:.015))+b.size}))
          .find(({b,top})=>top>m.y+.04&&top<=m.y+.9&&top<=this.jumpStart[this.controlledHero]+1.85&&
            Math.abs(this.player.x+dx*.35-b.x)<=b.size/2+.28&&Math.abs(this.player.z+dz*.35-b.z)<=b.size/2+.28&&
            (b.x-this.player.x)*dx+(b.z-this.player.z)*dz>0);
        if(ledge){m.vy=Math.sqrt(32*(ledge.top-m.y+.12));this.climbAssisted[this.controlledHero]=true;this.emit('CLIMB_ASSIST');}
      }
      const target=turnToward(this.facing,Math.atan2(dx,dz),dt),angle=target-this.facing;
      const turns=Math.max(1,Math.ceil(Math.abs(angle)*(this.carried?this.carried.size*1.5+.5:1)/.025));
      for(let i=0;i<turns;i++){const next=this.facing+angle/turns;if(!this.canCarryTo(this.player.x,this.player.z,next))break;this.facing=next;}
      const speed=!this.motion[this.controlledHero].grounded&&this.motion[this.controlledHero].y>0?5:3.5*HERO_ABILITIES[this.controlledHero].speedMultiplier;
      const step = dt * speed * (this.carried?.carrySpeedMultiplier??1) * (this.action?.kind==='HEAVY_DROP'?.15:1);
      // Short steps prevent fast Mia or a long frame tunnelling through a solid item.
      const count=Math.max(1,Math.ceil(step/.1));
      for(let i=0;i<count;i++){
        if(this.canMoveTo(this.player.x+dx*step/count,this.player.z))this.player.x+=dx*step/count;
        if(this.canMoveTo(this.player.x,this.player.z+dz*step/count))this.player.z+=dz*step/count;
      }
    }
    this.training?.move(distance(before,this.player),this.controlledHero);
    if (allowSoloExit && this.solved && !this.layout.optionalAreas?.some(a=>insideArea(this.player,a)) && this.player.z < (this.layout.exitZ??-this.layout.halfDepth) - 1.6) { this.escaped = true; this.say(this.puzzle.stages ? 'ROOM ESCAPED! Training complete.' : this.puzzle.sequence ? 'You escaped the Memory Vault!' : 'You escaped the first room!'); }
  }
}


