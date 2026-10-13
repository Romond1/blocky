import type {BoxBody} from './block-collision.ts';
export interface SentenceCarouselConfig {
 id:string; position:{x:number;z:number}; radius:number; speed:number; direction:1|-1;
 pickupPorts?:readonly {angle:number;halfAngle:number}[];
 wordBlocks:readonly number[]; brakeControlId:number; initialAngle?:number;
}
export type CarouselEvent='CAROUSEL_RUNNING'|'CAROUSEL_BRAKE'|'CAROUSEL_STOPPED'|'CAROUSEL_RELEASE'|'WORD_REMOVED_FROM_CAROUSEL';
/** Scene-independent continuous machine. Slot ownership survives braking and release. */
export class SentenceCarousel {
 readonly config:SentenceCarouselConfig;
 angle:number; velocity:number; braked=false; private announced=false;
 readonly attached:Set<number>;private fences?:BoxBody[];
 constructor(config:SentenceCarouselConfig){this.config=config;this.angle=config.initialAngle??0;this.velocity=config.speed*config.direction;this.attached=new Set(config.wordBlocks);}
 get fenceRadius(){return this.config.radius+.9;}
 private angleDistance(a:number,b:number){return Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));}
 portForWord(id:number,size=.95){const p=this.pose(id);if(!p)return undefined;
  const clearance=Math.atan2(size*.25,this.config.radius);
  return this.config.pickupPorts?.find(port=>this.angleDistance(p.angle,port.angle)<=port.halfAngle-clearance);
 }
 canRetrieve(id:number,actor:{x:number;z:number},size=.95){
  if(!this.stopped||!this.attached.has(id))return false;
  if(!this.config.pickupPorts?.length)return true;
  const port=this.portForWord(id,size);if(!port)return false;
  const angle=Math.atan2(actor.z-this.config.position.z,actor.x-this.config.position.x);
  return Math.hypot(actor.x-this.config.position.x,actor.z-this.config.position.z)>=this.config.radius+1.04&&this.angleDistance(angle,port.angle)<=port.halfAngle+.04;
 }
 /** Exact complementary fence arcs, shared by rendering and carried-cube collision. */
 fenceBodies():BoxBody[]{
  if(this.fences)return this.fences;
  if(!this.config.pickupPorts?.length)return [];
  const tau=Math.PI*2,ports=this.config.pickupPorts.map(p=>({...p,angle:(p.angle%tau+tau)%tau})).sort((a,b)=>a.angle-b.angle),bodies:BoxBody[]=[];
  for(let i=0;i<ports.length;i++){
   const start=ports[i].angle+ports[i].halfAngle,end=ports[(i+1)%ports.length].angle-ports[(i+1)%ports.length].halfAngle+(i===ports.length-1?tau:0);
   const count=Math.ceil((end-start)/.16);
   for(let n=0;n<count;n++){
    const a=start+(end-start)*n/count,b=start+(end-start)*(n+1)/count;
    const ax=this.config.position.x+Math.cos(a)*this.fenceRadius,az=this.config.position.z+Math.sin(a)*this.fenceRadius;
    const bx=this.config.position.x+Math.cos(b)*this.fenceRadius,bz=this.config.position.z+Math.sin(b)*this.fenceRadius;
    for(const y of [.4,1.15])bodies.push({x:(ax+bx)/2,z:(az+bz)/2,y,halfX:Math.hypot(bx-ax,bz-az)/2+.025,halfY:.045,halfZ:.045,yaw:-Math.atan2(bz-az,bx-ax)});
    if(n%2===0||n===count-1)for(const [x,z] of n===count-1?[[ax,az],[bx,bz]]:[[ax,az]])bodies.push({x,z,y:.62,halfX:.055,halfY:.62,halfZ:.055,yaw:0});
   }
  }
  return this.fences=bodies;
 }
 get stopped(){return Math.abs(this.velocity)<1e-5;}
 pose(id:number){const slot=this.config.wordBlocks.indexOf(id);if(slot<0)return undefined;
  const a=this.angle+slot*Math.PI*2/this.config.wordBlocks.length;
  return {x:this.config.position.x+Math.cos(a)*this.config.radius,z:this.config.position.z+Math.sin(a)*this.config.radius,y:.36,angle:a};
 }
 tick(dt:number,brake:boolean,emit:(e:CarouselEvent)=>void=()=>{}){
  if(!this.announced){this.announced=true;emit('CAROUSEL_RUNNING');}
  if(brake!==this.braked){this.braked=brake;emit(brake?'CAROUSEL_BRAKE':'CAROUSEL_RELEASE');}
  const target=brake?0:this.config.speed*this.config.direction;
  const delta=target-this.velocity,rate=this.config.speed/.3,time=Math.min(Math.max(0,dt),Math.abs(delta)/rate);
  const previous=this.velocity;
  this.velocity+=Math.sign(delta)*rate*time;
  if(Math.abs(this.velocity-target)<1e-6)this.velocity=target;
  this.angle=(this.angle+(previous+this.velocity)*.5*time+this.velocity*(Math.max(0,dt)-time))%(Math.PI*2);
  if(previous!==0&&this.stopped)emit('CAROUSEL_STOPPED');
  if(previous!==target&&this.velocity===target&&!brake)emit('CAROUSEL_RUNNING');
 }
 detach(id:number,emit:(e:CarouselEvent)=>void=()=>{}){if(!this.stopped||this.config.pickupPorts?.length&&!this.portForWord(id)||!this.attached.delete(id))return false;emit('WORD_REMOVED_FROM_CAROUSEL');return true;}
 reset(){this.angle=this.config.initialAngle??0;this.velocity=this.config.speed*this.config.direction;this.braked=false;this.announced=false;this.attached.clear();this.config.wordBlocks.forEach(id=>this.attached.add(id));}
 snapshot(){return {...this.config,angle:this.angle,fenceRadius:this.fenceRadius,fenceHeight:1.24,velocity:this.velocity,braked:this.braked,stopped:this.stopped,trays:this.config.wordBlocks.map(blockId=>({blockId,attached:this.attached.has(blockId),alignedPort:this.portForWord(blockId)?.angle??null,...this.pose(blockId)}))};}
}
