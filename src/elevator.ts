import {blockBase} from './blocks.ts';
export const LIFT={x:9,z:0,half:2.5,top:5,speed:1.25};
export type LiftState='DOWN'|'MOVING_UP'|'UP'|'MOVING_DOWN';
export type Passenger={x:number;z:number;y:number;grounded:boolean};
export type Cargo={id?:number;support?:number;x:number;z:number;y?:number;state:string;size:number};
export type TransportGuard=(delta:{y:number;z:number},riders:Passenger[],goods:Cargo[])=>boolean;
/** Sample the entire displacement before moving any member of the transport group. */
export function clearDisplacement(delta:number,axis:'y'|'z',riders:Passenger[],goods:Cargo[],guard?:TransportGuard){
 if(!guard)return delta;
 const steps=Math.max(1,Math.ceil(Math.abs(delta)/.025));let clear=0;
 for(let i=1;i<=steps;i++){
  const next=delta*i/steps;
  if(!guard({y:axis==='y'?next:0,z:axis==='z'?next:0},riders,goods))break;
  clear=next;
 }
 return clear;
}
/** Deterministic support displacement; rendering never owns lift or passenger state. */
export class Elevator {
 readonly half:number;readonly top:number;
 constructor(half=LIFT.half,top=LIFT.top){this.half=half;this.top=top;}
 y=0;state:LiftState='DOWN';blocked=false;private occupied:boolean[]=[];
 get moving(){return this.state==='MOVING_UP'||this.state==='MOVING_DOWN';}
 contains(p:{x:number;z:number},margin=0){return Math.abs(p.x-LIFT.x)<=this.half-margin&&Math.abs(p.z-LIFT.z)<=this.half-margin;}
 aboard(p:Passenger,cargo:Cargo[]=[]){return this.supportedPassenger(p,this.transportedCargo(cargo));}
 /** Start with deck cargo, then follow physically resting support links in any array order. */
 protected transportedCargo(cargo:Cargo[]){
  const goods=new Set(cargo.filter(b=>b.state==='floor'&&this.contains(b,b.size/2-.08)&&Math.abs((b.y??0)-this.y)<.15));
  let added=true;
  while(added){
   added=false;
   for(const b of cargo){
    if(b.state!=='floor'||b.support===undefined||goods.has(b))continue;
    const parent=[...goods].find(base=>base.id!==undefined&&base.id===b.support);
    if(parent&&Math.abs((b.y??0)-(parent.y??0)-parent.size)<.15&&
     Math.abs(b.x-parent.x)<(b.size+parent.size)/2&&Math.abs(b.z-parent.z)<(b.size+parent.size)/2){goods.add(b);added=true;}
   }
  }
  return [...goods];
 }
 protected supportedPassenger(p:Passenger,goods:Cargo[]){
  return p.grounded&&(this.contains(p,.38)&&Math.abs(p.y-this.y)<.15||goods.some(b=>
   Math.abs(p.y-(b.y??0)-b.size)<.15&&Math.abs(p.x-b.x)<=b.size/2+.28&&Math.abs(p.z-b.z)<=b.size/2+.28));
 }
 activate(occupied:boolean[]){
  const fresh=occupied.some((on,i)=>on&&!this.occupied[i]);this.occupied=[...occupied];
  if(fresh&&!this.moving)this.state=this.state==='DOWN'?'MOVING_UP':'MOVING_DOWN';
 }
 advance(dt:number,people:Passenger[],cargo:Cargo[],guard?:TransportGuard){
  if(dt<=0)return;this.blocked=false;if(!this.moving)return;
  const goods=this.transportedCargo(cargo);
  const riders=[...new Set(people.filter(p=>this.supportedPassenger(p,goods)))];
  // Stop before entering an occupied shaft; never displace an underneath hero.
  if(this.state==='MOVING_DOWN'&&people.some(p=>this.contains(p,-.38)&&!riders.includes(p)&&p.y<this.y&&p.y+2.8+.5+.1>Math.max(0,this.y-LIFT.speed*dt))){this.blocked=true;return;}
  const target=this.state==='MOVING_UP'?Math.min(this.top,this.y+LIFT.speed*dt):Math.max(0,this.y-LIFT.speed*dt);
  const delta=clearDisplacement(target-this.y,'y',riders,goods,guard),next=this.y+delta;
  this.blocked=Math.abs(next-target)>1e-8;
  for(const p of riders)p.y+=delta;for(const b of goods)b.y=blockBase(b)+delta;
  this.y=next;if(this.y===this.top)this.state='UP';if(this.y===0)this.state='DOWN';
 }
}
