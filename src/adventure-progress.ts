import {allCollectibles} from './collectible-data.ts';
import type {CollectibleIdentity,EconomyStorage} from './economy.ts';

export const ROOM_IDS=['hero','memory','power','cooperation','fruit','sorting','action','ability','heart','dragon'] as const;
export const ROOM_NAMES=['The Training Chamber','The Strength Chamber','The Split Chamber','The Cooperation Chamber','The Fruit Lift','The Sorting Foundry','The Action Chamber','The Ability Hall','The Heart Gauntlet','The Dragon’s Cave'];
export const PROGRESS_KEY='be-a-hero:adventure';
/** Local convenience progression, not a server authorization boundary. */
export class AdventureProgress {
 unlocked=1;
 completed=0;
 private storage?:EconomyStorage;
 constructor(storage?:EconomyStorage,collected:readonly CollectibleIdentity[]=[]){
  this.storage=storage;
  let loaded=false;
  try{
   const raw=storage?.getItem(PROGRESS_KEY);
   if(raw){const data=JSON.parse(raw);
    if(data.version===1&&Number.isInteger(data.unlocked)&&data.unlocked>=1&&data.unlocked<=10){
     this.unlocked=data.unlocked;
     this.completed=Number.isInteger(data.completed)&&data.completed>=0&&data.completed<=this.unlocked?data.completed:0;
     loaded=true;
    }
   }
  }catch{/* Continue with validated legacy progress or in-memory state. */}
  if(!loaded){
   for(const saved of collected){
    const known=allCollectibles.find(c=>c.id===saved.id&&c.roomId===saved.roomId&&c.type===saved.type);
    if(known)this.unlocked=Math.max(this.unlocked,ROOM_IDS.indexOf(known.roomId as typeof ROOM_IDS[number])+1);
   }
   this.save();
  }
 }
 resolve(requested:string|null){const n=Number(requested);return requested&&/^\d+$/.test(requested)&&n>=1&&n<=this.unlocked?n:this.unlocked;}
 canReplay(room:number){return Number.isInteger(room)&&room>=1&&room<=this.unlocked;}
 complete(room:number){if(!this.canReplay(room)||room<=this.completed)return;this.completed=Math.max(this.completed,room);this.unlocked=Math.max(this.unlocked,Math.min(10,room+1));this.save();}
 reset(){this.unlocked=1;this.completed=0;this.save();}
 snapshot(){return {version:1,unlocked:this.unlocked,completed:this.completed};}
 private save(){try{this.storage?.setItem(PROGRESS_KEY,JSON.stringify(this.snapshot()));}catch{/* Memory remains usable when persistence is unavailable. */}}
}
export function browserProgress(collected:readonly CollectibleIdentity[],accountStorage?:EconomyStorage){let storage:EconomyStorage|undefined=accountStorage;if(!storage)try{storage=localStorage;}catch{}return new AdventureProgress(storage,collected);}
