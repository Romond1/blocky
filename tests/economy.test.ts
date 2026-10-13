import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Economy, ECONOMY_SAVE_KEY} from '../src/economy.ts';

const coin={id:'room1_coin_01',roomId:'hero',type:'coin',value:1} as const;
const shard={id:'room1_heart_shard',roomId:'hero',type:'heartShard'} as const;
function storage(){const data=new Map<string,string>();return {data,getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);},removeItem:(key:string)=>{data.delete(key);}};}
test('IDs award once to one team wallet, including after reload and spending',()=>{
 const save=storage(),e=new Economy(save);
 assert.equal(e.collect(coin),true);assert.equal(e.collect(coin),false);
 assert.equal(e.heroCoins,1);assert.equal(e.collect(shard),true);assert.equal(e.collect(shard),false);
 assert.equal(e.heartShardsCollected,1);assert.equal(e.spendCoins(1),true);
 const restored=new Economy(save);assert.equal(restored.heroCoins,0);assert.equal(restored.collect(coin),false);assert.equal(restored.heartShardsCollected,1);
 assert.deepEqual(restored.roomProgress('hero',[coin,shard]),{coinsCollected:1,coinsTotal:1,shardCollected:true});
});
test('currency rejects invalid amounts and insufficient funds without mutation',()=>{
 const e=new Economy();e.addCoins(4);assert.equal(e.canAfford(4),true);assert.equal(e.spendCoins(5),false);
 for(const n of [-1,.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){assert.equal(e.canAfford(n),false);assert.equal(e.spendCoins(n),false);assert.throws(()=>e.addCoins(n));}
 assert.equal(e.heroCoins,4);assert.equal(e.spendCoins(3),true);assert.equal(e.heroCoins,1);
});
test('reset explicitly clears wallet, IDs and persisted shards',()=>{
 const save=storage(),e=new Economy(save);e.collect(coin);e.collect(shard);e.reset();
 const restored=new Economy(save);assert.equal(restored.heroCoins,0);assert.equal(restored.heartShardsCollected,0);assert.equal(restored.collect(coin),true);
});
test('malformed, unknown version and inconsistent saves fall back safely',()=>{
 const save=storage();for(const raw of ['{','null',JSON.stringify({version:2}),JSON.stringify({version:1,heroCoins:-1,collected:[]}),JSON.stringify({version:1,heroCoins:2,collected:[{id:'x',roomId:'hero',type:'coin'},{id:'x',roomId:'hero',type:'coin'}]})]){
 save.data.set(ECONOMY_SAVE_KEY,raw);assert.equal(new Economy(save).heroCoins,0);
 }
});
test('blocked persistence never interrupts session collection',()=>{
 const e=new Economy({getItem(){throw Error('blocked');},setItem(){throw Error('quota');},removeItem(){throw Error('blocked');}});
 assert.equal(e.collect(coin),true);assert.equal(e.heroCoins,1);assert.equal(e.collect(coin),false);e.reset();assert.equal(e.heroCoins,0);
});
test('coin values are configurable and future ID types do not affect the wallet',()=>{
 const e=new Economy();assert.equal(e.collect({...coin,value:5}),true);assert.equal(e.heroCoins,5);
 assert.equal(e.collect({id:'future_reward',roomId:'future_room',type:'futureType'}),true);assert.equal(e.heroCoins,5);
 assert.equal(e.collect({...shard,id:'alternate_shard'}),true);assert.equal(e.collect(shard),false);assert.equal(e.heartShardsCollected,1);
});
