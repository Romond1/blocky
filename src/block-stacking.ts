import type {LetterBlock} from './game.ts';
import {blockBase} from './blocks.ts';
/** Deterministic resting support, with forgiving placement instead of unstable rigid-body stacks. */
export function onTopOf(top:LetterBlock,bottom:LetterBlock){
 return top.state==='floor'&&bottom.state==='floor'&&top.support===bottom.id&&Math.abs((top.y??0)-(bottom.y??0)-bottom.size)<.08&&Math.abs(top.x-bottom.x)<bottom.size*.55&&Math.abs(top.z-bottom.z)<bottom.size*.55;
}
export function detachSupport(block:LetterBlock,blocks:LetterBlock[]){
 const parent=blocks.find(b=>b.id===block.support&&b.state==='floor');
 function lowerTower(base:LetterBlock,delta:number){
  base.y=Math.max(0,(base.y??0)-delta);
  for(const child of blocks.filter(b=>b.support===base.id))lowerTower(child,delta);
 }
 for(const child of blocks.filter(b=>b.support===block.id)){
  const height=parent?(parent.y??0)+parent.size:0;
  lowerTower(child,(child.y??0)-height);child.support=parent?.id;
 }
 block.support=undefined;block.y=0;
}
export function tryStack(block:LetterBlock,blocks:LetterBlock[],player:{x:number;z:number;y?:number},facing:number,allowed:(b:LetterBlock)=>boolean,clear:(p:{x:number;y:number;z:number})=>boolean=()=>true,allSizes=false,softOffset=false){
 if(!allSizes&&block.weightClass!=='light')return false;
 const reach=block.size/2+.5,aim={x:player.x+Math.sin(facing)*reach,z:player.z+Math.cos(facing)*reach};
 // The aiming ray must enter the visible base, not an expanded collision halo.
 const aimed=(b:LetterBlock)=>{
  // Stop just beyond the carried cube's front face. Clear ground before a distant
  // base is still a floor placement, even when the hero faces that base.
  let near=.1,far=Math.min(2.5,block.size+.75);
  for(const [position,center,direction] of [[player.x,b.x,Math.sin(facing)],[player.z,b.z,Math.cos(facing)]]){
   if(Math.abs(direction)<1e-8){if(Math.abs(position-center)>b.size/2)return false;continue;}
   const a=(center-b.size/2-position)/direction,c=(center+b.size/2-position)/direction;
   near=Math.max(near,Math.min(a,c));far=Math.min(far,Math.max(a,c));
  }
  return near<=far;
 };
 const bases=blocks.filter(b=>b!==block&&!b.hidden&&b.state==='floor'&&b.size+.001>=block.size&&(allSizes||b.weightClass==='light')&&allowed(b)&&(softOffset||!blocks.some(top=>top!==block&&top.state!=='carried'&&top.support===b.id)))
  .filter(aimed)
  .sort((a,b)=>Math.abs(blockBase(a)+a.size-(player.y??0)-1.12)-Math.abs(blockBase(b)+b.size-(player.y??0)-1.12)||Math.hypot(a.x-aim.x,a.z-aim.z)-Math.hypot(b.x-aim.x,b.z-aim.z));
 for(const base of bases){
  const limit=softOffset?Math.min(base.size,block.size)*.4:0;
  const fullSupport=softOffset?Math.max(limit,(base.size-block.size)/2):0;
  // Try the gentle settling offset first; wider aimed placement allows several pieces on a large base.
  for(const offset of [limit,fullSupport]){
   const clamp=(v:number)=>Math.max(-offset,Math.min(offset,v));
   const x=base.x+clamp(aim.x-base.x),z=base.z+clamp(aim.z-base.z);
   if(!clear({x,z,y:blockBase(base)+base.size}))continue;
   Object.assign(block,{x,z,y:blockBase(base)+base.size,support:base.id,state:'floor',carrier:undefined,slot:undefined});return true;
  }
 }
 return false;
}
