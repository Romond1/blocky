/** Bounded, frame-rate independent shortest-path turn. Release leaves the current aim intact. */
export function turnToward(current:number,target:number,dt:number){
 const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 const step=Math.min(Math.abs(delta),Math.max(0,dt)*10);
 return current+Math.sign(delta)*step;
}

/** Centered carry anchor: the back face stays within reach of both hands. */
export function carryPoint(actor:{x:number;z:number;facing:number},size:number){
 const reach=size/2+.5;
 return {x:actor.x+Math.sin(actor.facing)*reach,y:1.12,z:actor.z+Math.cos(actor.facing)*reach};
}

/** Blend added directions into a chord. A released or reversed axis never retains old motion. */
export class MovementInput {
 private x=0;private z=0;
 clear(){this.x=this.z=0;}
 update(dt:number,x:number,z:number){
  const axis=(current:number,target:number)=>target===0?0:
   Math.sign(target)*Math.min(Math.abs(target),1,(Math.sign(current)===Math.sign(target)?Math.abs(current):0)+Math.max(0,dt)/.07);
  this.x=axis(this.x,x);this.z=axis(this.z,z);
  const length=Math.max(1,Math.hypot(this.x,this.z));
  return {x:this.x/length,z:this.z/length};
 }
}
