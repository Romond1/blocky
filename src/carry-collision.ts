import {boxesOverlap,boxCorners,sweepClear,interpolateBody,type BoxBody} from './block-collision.ts';
import {carryPoint} from './movement.ts';
import {blockBase} from './blocks.ts';
import {STATION_SURFACES,SUMMIT_BARRIERS} from './action-layout.ts';
import type {Game,LetterBlock} from './game.ts';
import type {Hero,Position} from './split-mechanics.ts';

export function carryBody(g:Game,b:LetterBlock,p:Position=g.player,yaw=g.facing,height=g.motion[g.controlledHero].y):BoxBody{
 const point=carryPoint({...p,facing:yaw},b.size);
 return {...point,y:point.y+height,yaw,halfX:b.size/2,halfY:b.size/2,halfZ:b.size/2};
}
export function restingBody(b:LetterBlock):BoxBody{
 return {x:b.x,y:blockBase(b)+b.size/2,z:b.z,yaw:0,halfX:b.size/2,halfY:b.size/2,halfZ:b.size/2};
}
export function blockBody(g:Game,b:LetterBlock):BoxBody{
 const h=b.carrier??g.controlledHero;
 const actor=g.actors?.[h] as (Position&{facing?:number})|undefined;
 const target=()=>carryBody(g,b,actor??g.player,h===g.controlledHero?g.facing:actor?.facing??Math.PI,g.motion[h].y);
 if(b.state==='carried')return target();
 const source=restingBody(b);
 if(g.action?.blockId===b.id&&g.action.kind==='HEAVY_LIFT'){
  const p=Math.min(1,g.action.time/g.action.duration),path=pickupPath(g,b)??[source,target()];
  const progress=p*p*(3-2*p)*(path.length-1),index=Math.min(path.length-2,Math.floor(progress));
  return interpolateBody(path[index],path[index+1],progress-index);
 }
 return source;
}
function box(x:number,y:number,z:number,width:number,height:number,depth:number):BoxBody{return {x,y,z,halfX:width/2,halfY:height/2,halfZ:depth/2,yaw:0};}
/** Authored solid structures use the same dimensions as their visible geometry. */
function structures(g:Game,ignoreMovingLift=false):BoxBody[]{
 const bodies:BoxBody[]=[...(g.finale?.solids(ignoreMovingLift)??[]),...(g.ability?.solidBodies()??[]),...(g.layout.obstacles??[]).map(o=>box(o.x,o.height/2,o.z,o.width,o.height,o.depth))];
 for(const s of g.layout.sockets){const height=s.acceptedActivator==='HERO'?.08:.2825;bodies.push(box(s.x,(s.y??0)+height/2,s.z,(s.halfSize??g.layout.pedestalHalfWidth)*2,height,(s.halfSize??g.layout.pedestalHalfDepth)*2));}
 if(g.cooperation)bodies.push(box(0,g.cooperation.gateLift+2.4,15,4,4.8,.8));
 if(g.actionChamber){
  bodies.push(...STATION_SURFACES.map(s=>box(s.x,s.y/2,s.z,s.halfWidth*2,s.y,s.halfDepth*2)));
  bodies.push(...SUMMIT_BARRIERS.map(s=>box(s.x,4,s.z,s.width,2,s.depth)));
 }else if(g.transport){
  const t=g.transport,gy=t.lift.y;
  if(!ignoreMovingLift){
   bodies.push(box(9,gy-.25,0,5,.5,5),box(9,gy+.65,2.35,5,1.3,.14));
   bodies.push(box(6.65,gy+.65,0,.14,1.3,5),box(11.35,gy+.65,0,.14,1.3,5));
  }
  const a=t.gallery;bodies.push(box((a.left+a.right)/2,4.75,(a.back+a.front)/2,a.right-a.left,.5,a.front-a.back));
 }
 return bodies;
}
export function bodyClear(g:Game,b:LetterBlock,body:BoxBody,ignore:readonly number[]=[],ignoreMovingLift=false):boolean{
 const room=g.layout,exit=room.exitZ??-room.halfDepth;
 // Test all rotated corners against the room and its optional connected alcoves.
 for(const p of boxCorners(body)){
  if(room.optionalAreas?.some(a=>p.x>=a.left&&p.x<=a.right&&p.z>=a.back&&p.z<=a.front))continue;
  if(Math.abs(p.x)>room.halfWidth+1e-6||p.z>room.halfDepth+1e-6||p.z<exit-4)return false;
  if(p.z<exit&&(Math.abs(p.x-(room.exitCenterX??0))>room.exitHalfWidth||body.y+body.halfY>g.doorLift))return false;
 }
 if(structures(g,ignoreMovingLift).some(s=>boxesOverlap(body,s)))return false;
 return g.blocks.every(other=>other===b||other.hidden||ignore.includes(other.id)||g.actionChamber&&!g.actionChamber.blockVisible(other.id)||!boxesOverlap(body,blockBody(g,other)));
}
export function carrySweep(g:Game,b:LetterBlock,from:{x:number;z:number;facing:number;y:number},to:{x:number;z:number;facing:number;y:number}):boolean{
 // Interpolate the HERO pose: the cube center follows an arc during a turn.
 const angle=to.facing-from.facing,travel=Math.hypot(to.x-from.x,to.z-from.z,to.y-from.y)+Math.abs(angle)*(b.size*1.5+.5);
 const n=Math.max(1,Math.ceil(travel/.025));
 for(let i=0;i<=n;i++){const t=i/n,p={x:from.x+(to.x-from.x)*t,z:from.z+(to.z-from.z)*t};
  if(!bodyClear(g,b,carryBody(g,b,p,from.facing+angle*t,from.y+(to.y-from.y)*t)))return false;
 }
 return true;
}
export function pickupClear(g:Game,b:LetterBlock):boolean{
 return pickupPath(g,b)!==null;
}
function pickupPath(g:Game,b:LetterBlock):BoxBody[]|null{
 const source=restingBody(b),target=carryBody(g,b),clear=(p:BoxBody)=>bodyClear(g,b,p);
 target.yaw-=Math.round(target.yaw/(Math.PI/2))*(Math.PI/2);
 if(sweepClear(source,target,clear))return [source,target];
 const high=Math.max(source.y,target.y)+.06,up={...source,y:high},over={...target,y:high};
 if(sweepClear(source,up,clear)&&sweepClear(up,over,clear)&&sweepClear(over,target,clear))return [source,up,over,target];
 return null;
}
export function heldBy(g:Game,hero:Hero){return g.blocks.find(b=>b.state==='carried'&&(b.carrier??g.controlledHero)===hero);}
