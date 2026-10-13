import {heroOnPlate,objectOnPlate} from './pressure-plates.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Hero,Position} from './split-mechanics.ts';
import {onTopOf} from './block-stacking.ts';
export const COOP_GATE={z:15,halfWidth:2,halfDepth:.4,travel:4.8};
export const COOP_CROSSING={near:3,far:-9,left:-2,right:2};
export const STACK_AREA={left:-6,right:6,back:-24,front:-17};
export function inStackArea(p:Position){return p.x>=STACK_AREA.left&&p.x<=STACK_AREA.right&&p.z>=STACK_AREA.back&&p.z<=STACK_AREA.front;}
/** Same bridge timeline as Room 3, with a longitudinal crossing and a side recovery stair. */
export function cooperationGround(p:Position,extension:number,below=false){
 if(p.x>=5&&p.x<=9&&p.z>=3&&p.z<=8)return (p.z-8)*.6;
 if(p.z>COOP_CROSSING.far&&p.z<COOP_CROSSING.near){
  if(!below&&p.x>=-2&&p.x<=2&&extension>=.98)return 0;
  return -3;
 }
 return 0;
}
export class CooperationChamber {
 gateLift=0;heroActive=[false,false,false,false];heavyActive=false;bridgeLocked=false;
 plateRequired(index:number,g:Game){return index<2?!g.stageSolved[0]:index===3?!this.bridgeLocked:false;}
 tick(dt:number,g:Game,actors:Record<Hero,Position>){
  const previous=[...g.stageSolved];
  this.heroActive=g.layout.sockets.map((s,i)=>(['yuki','mia'] as const).some(h=>heroOnPlate(s,actors[h],g.motion[h],this.plateRequired(i,g))));
  const onBank=(h:Hero,z:number)=>actors[h].z<z&&g.motion[h].grounded&&Math.abs(g.motion[h].y)<.15;
  if(!g.stageSolved[0]&&(['yuki','mia'] as const).every(h=>onBank(h,14.1)))g.stageSolved[0]=true;
  const open=g.stageSolved[0]||this.heroActive[0]||this.heroActive[1];
  if(g.stageSolved[0])this.gateLift=COOP_GATE.travel;
  else if(open)this.gateLift=Math.min(COOP_GATE.travel,this.gateLift+dt*8);
  else {
   const under=(['yuki','mia'] as const).filter(h=>Math.abs(actors[h].z-COOP_GATE.z)<COOP_GATE.halfDepth+.38-.001&&Math.abs(actors[h].x)<2.4);
   const clearance=under.length?Math.max(...under.map(h=>g.motion[h].y+2.7)):0;
   // A hero already inside may jump: safety must follow their rising head.
   const floor=clearance;
   this.gateLift=Math.max(floor,this.gateLift-dt*16);
  }
  this.heavyActive=g.blocks.some(b=>objectOnPlate(g.layout.sockets[2],b));
  if(this.heroActive[3])this.bridgeLocked=true;
  const old=g.bridge.extension;g.bridge.update(dt,this.heavyActive,this.bridgeLocked);
  if(old===0&&g.bridge.extension>0)g.emit('PLATFORM_EXTEND');
  if(old===1&&g.bridge.extension<1)g.emit('PLATFORM_RETRACT');
  if(this.bridgeLocked&&(['yuki','mia'] as const).every(h=>onBank(h,-9.6)))g.stageSolved[1]=true;
  const red=g.blocks.find(b=>b.text==='RED'),green=g.blocks.find(b=>b.text==='GREEN');
  if(g.stageSolved[1]&&red&&green&&inStackArea(red)&&inStackArea(green)&&onTopOf(green,red))g.stageSolved[2]=true;
  g.solved=g.stageSolved.every(Boolean);
  g.stageSolved.forEach((done,i)=>{if(done&&!previous[i])g.emit(['COOPERATION_COMPLETE','PLATFORM_LOCKED','COLOR_PUZZLE_SOLVED'][i]);});
 }
 canPassGate(p:Position,height:number){return Math.abs(p.z-COOP_GATE.z)>=COOP_GATE.halfDepth+.38||this.gateLift>=height+2.5;}
 safeDrop(p:Position){return p.z>=4||p.z<=-10;}
 blockSolved(b:LetterBlock,g:Game){return g.stageSolved[2]&&(b.text==='RED'||b.text==='GREEN');}
}
