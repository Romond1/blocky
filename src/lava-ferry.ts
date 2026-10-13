import {Elevator,clearDisplacement} from './elevator.ts';
import type {Passenger,Cargo,TransportGuard} from './elevator.ts';
export const FERRY={half:2.5,a:2.5,b:-14.5,travelTime:4};
/** Room 5 support contract, with horizontal displacement instead of vertical motion. */
export const RIVER={near:0,far:-12,center:-6};
export class LavaFerry extends Elevator {
 toggle(){this.command(this.z===FERRY.a?FERRY.b:FERRY.a);}
 z:number=FERRY.a;
 private destination:number=FERRY.a;
 command(destination:number){
  if(this.moving||destination===this.z)return;
  this.destination=destination;this.state=destination===FERRY.b?'MOVING_UP':'MOVING_DOWN';
 }
 override contains(p:{x:number;z:number},margin=0){return Math.abs(p.x)<=FERRY.half-margin&&Math.abs(p.z-this.z)<=FERRY.half-margin;}
 override advance(dt:number,people:Passenger[],cargo:Cargo[],guard?:TransportGuard){
  if(dt<=0)return;this.blocked=false;if(!this.moving)return;
  const goods=this.transportedCargo(cargo);
  const riders=[...new Set(people.filter(p=>this.supportedPassenger(p,goods)))];
  const distance=this.destination-this.z,requested=Math.sign(distance)*Math.min(Math.abs(distance),dt*(FERRY.a-FERRY.b)/FERRY.travelTime);
  const delta=clearDisplacement(requested,'z',riders,goods,guard);this.blocked=Math.abs(delta-requested)>1e-8;
  for(const p of riders)p.z+=delta;for(const b of goods)b.z+=delta;
  this.z+=delta;if(this.z===this.destination)this.state=this.z===FERRY.a?'DOWN':'UP';
 }
}
