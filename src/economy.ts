export interface CollectibleIdentity {id:string;roomId:string;type:string;value?:number;}
export interface EconomyStorage {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void;}
export const ECONOMY_SAVE_KEY='be-a-hero:economy';
const amountValid=(n:number)=>Number.isSafeInteger(n)&&n>=0;

/** Shared progression; persistence is an adapter rather than part of room state. */
export class Economy {
 private balance=0;
 private collected=new Map<string,CollectibleIdentity>();
 private storage:EconomyStorage|undefined;
 constructor(storage?:EconomyStorage){this.storage=storage;this.load();}
 get memoryCrystalsCollected(){return [...this.collected.values()].filter(c=>c.type==='memoryCrystal').length;}
 get heroCoins(){return this.balance;}
 get heartShardsCollected(){return new Set([...this.collected.values()].filter(c=>c.type==='heartShard').map(c=>c.roomId)).size;}
 has(id:string){return this.collected.has(id);}
 canAfford(cost:number){return amountValid(cost)&&this.balance>=cost;}
 addCoins(amount:number){if(!amountValid(amount)||!amountValid(this.balance+amount))throw new RangeError('Coins must remain a nonnegative safe integer');this.balance+=amount;this.save();}
 spendCoins(cost:number){if(!this.canAfford(cost))return false;this.balance-=cost;this.save();return true;}
 collect(c:CollectibleIdentity){
  if(this.has(c.id))return false;
  if(!c.id||!c.roomId||!c.type)throw new Error('Collectibles need stable identity');
  if(c.type==='heartShard'&&[...this.collected.values()].some(old=>old.type==='heartShard'&&old.roomId===c.roomId))return false;
  const reward=c.type==='coin'?(c.value??1):0;
  if(!amountValid(reward)||!amountValid(this.balance+reward))throw new RangeError('Invalid collectible reward');
  // Award and ID ownership are committed synchronously before any feedback fires.
  this.collected.set(c.id,{id:c.id,roomId:c.roomId,type:c.type});this.balance+=reward;this.save();return true;
 }
 roomProgress(roomId:string,definitions:readonly CollectibleIdentity[]){
  const coins=definitions.filter(c=>c.roomId===roomId&&c.type==='coin');
  return {coinsCollected:coins.filter(c=>this.has(c.id)).length,coinsTotal:coins.length,shardCollected:definitions.some(c=>c.roomId===roomId&&c.type==='heartShard'&&this.has(c.id))};
 }
 snapshot(){return {version:1,heroCoins:this.balance,heartShards:this.heartShardsCollected,memoryCrystals:this.memoryCrystalsCollected,collected:[...this.collected.values()]};}
 reset(){this.balance=0;this.collected.clear();this.save();}
 private save(){try{this.storage?.setItem(ECONOMY_SAVE_KEY,JSON.stringify(this.snapshot()));}catch{/* Session progression survives unavailable storage. */}}
 private load(){
  try{
   const raw=this.storage?.getItem(ECONOMY_SAVE_KEY);if(!raw)return;
   const data=JSON.parse(raw);if(!data||data.version!==1||!amountValid(data.heroCoins)||!Array.isArray(data.collected))return;
   const entries=new Map<string,CollectibleIdentity>(),shards=new Set<string>();
   for(const c of data.collected){
    if(!c||typeof c.id!=='string'||!c.id||typeof c.roomId!=='string'||!c.roomId||typeof c.type!=='string'||!c.type||entries.has(c.id))return;
    if(c.type==='heartShard'){if(shards.has(c.roomId))return;shards.add(c.roomId);}
    entries.set(c.id,{id:c.id,roomId:c.roomId,type:c.type});
   }
   this.balance=data.heroCoins;this.collected=entries;
  }catch{/* Corrupt or unsupported save starts a fresh session. */}
 }
}
export function browserEconomy(accountStorage?:EconomyStorage){let storage:EconomyStorage|undefined=accountStorage;if(!storage)try{storage=window.localStorage;}catch{/* Private browser policy. */}return new Economy(storage);}
