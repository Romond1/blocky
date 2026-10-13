import {Elevator,LIFT} from './elevator.ts';
import {dropPoints} from './block-placement.ts';
import {heroOnPlate} from './pressure-plates.ts';
import {transportGuard} from './transport-collision.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Hero,Position} from './split-mechanics.ts';
export interface Gallery {left:number;right:number;back:number;front:number;}
export const FRUIT_GALLERY:Gallery={left:3,right:13.5,back:-11.65,front:-2.5};
/** Shared Room 5 support, fences, occupancy toggles and safe multi-cargo placement. */
export class LiftTransport {
 lift=new Elevator();controls=[false,false];pulse=0;
 gallery:Gallery;controlStart:number;underpassEnabled:boolean;
 constructor(gallery=FRUIT_GALLERY,controlStart=3,underpassEnabled=false){this.gallery=gallery;this.controlStart=controlStart;this.underpassEnabled=underpassEnabled;}
 onGallery(p:Position){const b=this.gallery;return p.x>=b.left&&p.x<=b.right&&p.z>=b.back&&p.z<=b.front;}
 ground(p:Position,height:number){
  if(this.lift.contains(p)&&height>=this.lift.y-.2)return this.lift.y;
  if(this.onGallery(p)&&height>=4.8)return 5;
  // Short recovery trench beneath the balcony frontage, with an exposed east stair.
  if(p.x>=11.5&&p.x<=13.5&&p.z>=-2.5&&p.z<=2.5)return (p.z-2.5)*.6;
  if(p.x>=6.5&&p.x<=11.5&&p.z>=-2.5&&p.z<=2.5)return -3;
  return 0;
 }
 canMove(p:Position,height:number,grounded:boolean,from?:Position){
  if(this.lift.contains(p,-.38)){
   if(this.underpassEnabled&&height<-.4){
    const retreat=this.lift.state==='MOVING_DOWN'&&!!from&&this.lift.contains(from,-.38)&&this.lift.y-.5>height+2.8;
    return (this.lift.state==='UP'||retreat)&&this.ground(p,height)<=height+.18;
   }
   // Landing entries face north/south; guard shaft sides and absent cabin.
   if(Math.abs(p.x-LIFT.x)>LIFT.half-.38||p.z>LIFT.half-.38)return false;
   if(height<this.lift.y-.2||height>=4.8&&this.lift.y<4.8&&!this.lift.moving)return false;
   if(this.lift.moving&&(!this.lift.contains(p,.38)||!grounded))return false;
  }
  if(height>3&&this.onGallery(p)&&!this.lift.contains(p)){
   if(p.x<this.gallery.left+.38||p.x>this.gallery.right-.38||p.z<this.gallery.back+.38)return false;
  }
  // Rail all upper edges except the north cabin landing.
  if(height>3&&!this.onGallery(p)&&!this.lift.contains(p))return false;
  return this.ground(p,height)<=height+.18;
 }
 /** Closed cabin edges also block reaching or placing through the fence. */
 interactionClear(a:Position,b:Position,height:number){
  if(Math.abs(height-this.lift.y)>1.2)return true;
  const crosses=(av:number,bv:number,edge:number,otherA:number,otherB:number,low:number,high:number)=>{
   if((av-edge)*(bv-edge)>=0)return false;
   const t=(edge-av)/(bv-av),along=otherA+(otherB-otherA)*t;return along>=low&&along<=high;
  };
  return !crosses(a.z,b.z,2.35,a.x,b.x,6.5,11.5)&&!crosses(a.x,b.x,6.65,a.z,b.z,-2.5,2.5)&&!crosses(a.x,b.x,11.35,a.z,b.z,-2.5,2.5);
 }
 riding(g:Game,hero:Hero){const a=g.actors?.[hero];return !!a&&this.lift.aboard({...a,...g.motion[hero]},g.blocks);}
 tickLift(dt:number,g:Game,actors:Record<Hero,Position>){
  this.controls=g.layout.sockets.slice(this.controlStart,this.controlStart+2).map(s=>(['yuki','mia'] as const).some(h=>heroOnPlate(s,actors[h],g.motion[h])));
  const before=this.lift.state;this.lift.activate(this.controls);
  if(this.lift.state!==before){this.pulse=1;g.emit('ELEVATOR_TOGGLE');}
  const passengers=(['yuki','mia'] as const).map(h=>({x:actors[h].x,z:actors[h].z,y:g.motion[h].y,grounded:g.motion[h].grounded}));
  this.lift.advance(dt,passengers,g.blocks,transportGuard(g,passengers));passengers.forEach((p,i)=>g.motion[i===0?'yuki':'mia'].y=p.y);
  this.pulse=Math.max(0,this.pulse-dt*.35);
  if(this.lift.state!==before&&!this.lift.moving)g.emit('ELEVATOR_ARRIVED');
 }
 drop(g:Game,b:LetterBlock){
  const m=g.motion[g.controlledHero],radius=b.size/2;
  // Deterministic free positions include room for five pieces of cargo and passengers.
  for(const p of dropPoints(b,g.blocks,g.player,g.facing)){
   const y=this.ground(p,m.y),onCabin=this.lift.contains(p,radius);
   if(this.lift.contains(g.player)&&p.z>LIFT.half-radius)continue;
   if(g.player.z>LIFT.half&&onCabin)continue;
   if(!this.interactionClear(g.player,p,m.y)||Math.abs(y-m.y)>.2||!this.canMove(p,m.y,true)||Math.abs(p.x)>g.layout.halfWidth-.6||p.z>g.layout.halfDepth-.6||p.z<(g.layout.exitZ??-g.layout.halfDepth)+.6)continue;
   if(this.lift.contains(p,-radius)&&!onCabin)continue;
   if(g.layout.obstacles?.some(o=>Math.abs(p.x-o.x)<o.width/2+radius&&Math.abs(p.z-o.z)<o.depth/2+radius))continue;
   if(!g.canPlaceBlock(b,{...p,y},true))continue;
   Object.assign(b,p,{y,state:'floor',carrier:undefined,slot:undefined,support:undefined});return;
  }
  g.say('Move into a little more space to place the block.');
 }
}
