import type {Economy} from './economy.ts';
import {ROOM_COLLECTIBLES,totalHeartShards,type CollectibleDefinition} from './collectible-data.ts';

export function createCollectibleUI(hud:HTMLElement,economy:Economy){
 const panel=document.createElement('section');panel.className='collectible-hud';panel.setAttribute('aria-label','Team collectibles');
 panel.innerHTML='<div class="collectible-totals"><span class="coin-total" aria-label="Hero Coins"><span class="coin-icon" aria-hidden="true">H</span> <b>0</b><i></i></span><span aria-label="Heart Shards">❤️ <b class="shard-total"></b></span></div><small class="room-coins"></small>';
 const toast=document.createElement('div');toast.className='shard-found';toast.hidden=true;toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
 hud.append(panel,toast);
 const coin=panel.querySelector<HTMLElement>('.coin-total')!,coinCount=coin.querySelector('b')!,plus=coin.querySelector('i')!,shards=panel.querySelector('.shard-total')!,room=panel.querySelector('.room-coins')!;
 const memories=document.createElement('div');memories.className='memory-total';memories.hidden=true;panel.append(memories);
 let pulse=0,shardTime=0,bonus=0;
 return {
  collected(c:CollectibleDefinition){
   if(c.type==='coin'){bonus=pulse>0?bonus+(c.value??1):(c.value??1);pulse=.55;plus.textContent=`+${bonus}`;}
   else if(c.type==='memoryCrystal'){toast.classList.add('memory-found');shardTime=3.5;toast.innerHTML=`<strong>MEMORY CRYSTAL COLLECTED</strong><span>◆ ${economy.memoryCrystalsCollected}</span>`;}
   else {toast.classList.remove('memory-found');shardTime=3.5;toast.innerHTML=`<strong>HEART SHARD FOUND</strong><span>❤️ ${economy.heartShardsCollected} / ${totalHeartShards}</span>`;}
  },
  update(dt:number,roomId:string){
   memories.hidden=economy.memoryCrystalsCollected===0;memories.textContent=`◆ MEMORY CRYSTALS ${economy.memoryCrystalsCollected}`;
   pulse=Math.max(0,pulse-dt);shardTime=Math.max(0,shardTime-dt);
   coin.classList.toggle('coin-pulse',pulse>0);plus.hidden=pulse===0;toast.hidden=shardTime===0;
   const count=String(economy.heroCoins);if(coinCount.textContent!==count)coinCount.textContent=count;
   const total=`${economy.heartShardsCollected} / ${totalHeartShards}`;if(shards.textContent!==total)shards.textContent=total;
   const progress=economy.roomProgress(roomId,ROOM_COLLECTIBLES[roomId]??[]);
   const text=`ROOM COINS ${progress.coinsCollected} / ${progress.coinsTotal}`;if(room.textContent!==text)room.textContent=text;
  },
  reset(){pulse=0;shardTime=0;bonus=0;},
 };
}
