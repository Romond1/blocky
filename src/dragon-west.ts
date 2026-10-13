import {bodyClear} from './carry-collision.ts';
import {Elevator} from './elevator.ts';
import {heroOnPlate} from './pressure-plates.ts';
import {transportGuard} from './transport-collision.ts';
import type {Game} from './game.ts';
const heroes=['yuki','mia'] as const;
export const WEST={x:-30,wheelZ:12,radius:5,deckHalfX:3,deckHalfZ:2,liftZ:-2};
export const WEST_FLOORS=[
 {left:-40,right:-22,near:19,far:29,y:0},
 {left:-43,right:-20,near:-5.5,far:7,y:0},
 {left:-40,right:-22,near:-8,far:-5.5,y:5},
];
export const WEST_CONTROLS=[
 {x:-25,z:33,y:0,activationMode:'HOLD' as const},
 {x:-37,z:21,y:0,activationMode:'HOLD' as const},
 {x:-25,z:21,y:0,activationMode:'TOGGLE' as const},
 {x:-25,z:3.5,y:0,activationMode:'TOGGLE' as const},
 {x:-35,z:-6.7,y:5,activationMode:'TOGGLE' as const},
 {x:-25,z:0,y:0,activationMode:'TOGGLE' as const},
];
export class IndexedWheel {
 angle=0;target=0;private pressed=false;
 get moving(){return this.target-this.angle>1e-7;}
 pose(i:number,angle=this.angle){const a=angle+i*Math.PI/2;return {x:WEST.x,y:Math.sin(a)*WEST.radius,z:WEST.wheelZ+Math.cos(a)*WEST.radius};}
 activate(pressed:boolean){const step=pressed&&!this.pressed&&!this.moving;this.pressed=pressed;if(step)this.target+=Math.PI/2;return step;}
 advance(dt:number){this.angle=Math.min(this.target,this.angle+Math.max(0,dt)*Math.PI/4);}
}
export class DragonWest {
 wheel=new IndexedWheel();lift=new Elevator(3.5);gateOpen=false;gateLift=0;crossing=false;complete=false;liftUnlocked=false;shuttleX=-30;shuttleTarget=-18;shuttleWait=2;liftBoarding=false;private lowerWasDown=false;
 ground(p:{x:number;z:number},height:number){
  if(this.crossing&&Math.abs(p.x-this.shuttleX)<=2.5&&Math.abs(p.z+10)<=2&&height>=4.8)return 5;
  if(Math.abs(p.x-WEST.x)<=3.5&&Math.abs(p.z-WEST.liftZ)<=3.5&&height>=this.lift.y-.2)return this.lift.y;
  for(let i=0;i<4;i++){const q=this.wheel.pose(i);if(Math.abs(p.x-q.x)<=WEST.deckHalfX&&Math.abs(p.z-q.z)<=WEST.deckHalfZ&&Math.abs(height-q.y)<.25)return q.y;}
  return -8;
 }
 tick(dt:number,g:Game,apple:boolean){
  const down=(i:number)=>heroes.some(h=>heroOnPlate(g.layout.sockets[17+i],g.actors![h],g.motion[h]));
  const gateHeart=g.blockBody(g.finale!.heart);
  if(heroes.every(h=>g.motion[h].grounded&&g.actors![h].z<25&&g.actors![h].x<-21)&&gateHeart.z<25&&gateHeart.x<-21)this.gateOpen=true;
  const under=heroes.some(h=>Math.abs(g.actors![h].z-26)<.8&&g.actors![h].x>-41.5&&g.actors![h].x<-20.5);
  this.gateLift=Math.min(6,Math.max(under?this.gateLift:0,this.gateLift+(this.gateOpen||down(0)||down(1)?8:-8)*dt));
  if(this.wheel.activate(down(2)||down(3)))g.emit('WEST_WHEEL_STEP');
  const poses=Array.from({length:4},(_,i)=>this.wheel.pose(i));
  const deck=(p:{x:number;z:number},y:number)=>poses.findIndex(q=>Math.abs(p.x-q.x)<WEST.deckHalfX-.35&&Math.abs(p.z-q.z)<WEST.deckHalfZ-.3&&Math.abs(y-q.y)<.18);
  const riders=heroes.map(h=>g.motion[h].grounded?deck(g.actors![h],g.motion[h].y):-1);
  const goods=g.blocks.filter(b=>b.state==='floor').map(b=>({b,i:deck(b,b.y??0)}));
  this.wheel.advance(dt);
  heroes.forEach((h,n)=>{const i=riders[n];if(i<0)return;const p=this.wheel.pose(i);g.actors![h].z+=p.z-poses[i].z;g.motion[h].y+=p.y-poses[i].y;});
  for(const {b,i} of goods)if(i>=0){const p=this.wheel.pose(i);b.z+=p.z-poses[i].z;b.y=(b.y??0)+p.y-poses[i].y;}
  this.liftUnlocked=apple;
  const local=(p:{x:number;z:number})=>({x:p.x-WEST.x+9,z:p.z-WEST.liftZ});
  const people=heroes.map(h=>({...local(g.actors![h]),...g.motion[h]}));
  const cargo=g.blocks.filter(b=>b.state==='floor').map(b=>({...b,...local(b)}));
  const heart=g.blockBody(g.finale!.heart);
  this.lift.activate([apple&&down(4)]);
  const lower=apple&&down(5);
  if(lower&&!this.lowerWasDown&&!this.lift.moving){if(this.lift.state==='UP')this.lift.state='MOVING_DOWN';else this.liftBoarding=true;}
  this.lowerWasDown=lower;
  if(this.liftBoarding&&this.lift.state==='DOWN'&&people.some(p=>this.lift.aboard(p,cargo))){this.lift.state='MOVING_UP';this.liftBoarding=false;}

  this.lift.advance(dt,people,cargo,transportGuard(g,people));
  people.forEach((p,i)=>{g.motion[heroes[i]].y=p.y;});
  cargo.forEach(b=>{g.blocks[b.id].y=b.y;});
  this.crossing=apple;
  if(this.crossing){
   const onDeck=(p:{x:number;z:number},y:number,margin=.35)=>Math.abs(p.x-this.shuttleX)<=2.5-margin&&Math.abs(p.z+10)<=2-margin&&Math.abs(y-5)<.15;
   const riders=heroes.filter(h=>g.motion[h].grounded&&onDeck(g.actors![h],g.motion[h].y));
   const goods=g.blocks.filter(b=>b.state==='floor'&&onDeck(b,b.y??0,b.size/2));
   if(this.shuttleWait>0)this.shuttleWait=Math.max(0,this.shuttleWait-dt);
   else {const dx=Math.sign(this.shuttleTarget-this.shuttleX)*Math.min(dt*2.4,Math.abs(this.shuttleTarget-this.shuttleX));
    const carried=g.blocks.filter(b=>b.state==='carried'&&riders.includes(b.carrier!));
    const moving=[...goods,...carried],ignore=moving.map(b=>b.id);
    if(!moving.every(b=>{const body=g.blockBody(b);return bodyClear(g,b,{...body,x:body.x+dx},ignore,true);}))return;
    this.shuttleX+=dx;for(const h of riders)g.actors![h].x+=dx;for(const b of goods)b.x+=dx;
    if(this.shuttleX===this.shuttleTarget){this.shuttleTarget=this.shuttleTarget===-18?-30:-18;this.shuttleWait=2;}
   }
  }
  if(this.crossing&&heroes.every(h=>g.motion[h].grounded&&g.motion[h].y>=4.9&&g.actors![h].z<-12&&g.actors![h].x<-14)&&heart.z<-12&&heart.x<-14&&heart.y-heart.halfY>=4.9)this.complete=true;

 }
 snapshot(){return {gateOpen:this.gateOpen,gateLift:this.gateLift,wheel:{angle:this.wheel.angle,target:this.wheel.target,moving:this.wheel.moving,decks:Array.from({length:4},(_,i)=>this.wheel.pose(i))},lift:{y:this.lift.y,state:this.lift.state,unlocked:this.liftUnlocked,boarding:this.liftBoarding},crossing:this.crossing,shuttle:{x:this.shuttleX,z:-10,y:5,target:this.shuttleTarget,wait:this.shuttleWait},complete:this.complete};}
}
