import type {Game} from './game.ts';
import type {Economy} from './economy.ts';
import {allCollectibles} from './collectible-data.ts';
/** Use the project's browser-event analytics boundary; no network or backend. */
export function createDragonEnding(parent:HTMLElement){
 const opened=new WeakSet<object>(),selected=new WeakSet<object>();
 const start=performance.now();
 const fade=document.createElement('div');fade.className='dragon-exit';fade.innerHTML='<strong>BLOCK WORLD COMPLETE</strong>';fade.hidden=true;parent.append(fade);
 return {update(g:Game,economy:Economy){const d=g.finale?.dragon;
  fade.hidden=d?.choice!=='leave_block_world';
  if(!d)return;
  if(d.restored&&!opened.has(d)){opened.add(d);window.dispatchEvent(new CustomEvent('FINAL_HEART_PLACED'));window.dispatchEvent(new CustomEvent('choice_screen_opened',{detail:{roomId:'dragon',timestamp:new Date().toISOString(),continuePosition:d.continueLeft?'left':'right'}}));}
  if(d.choice&&!selected.has(d)){selected.add(d);const detail={choice:d.choice,timestamp:new Date().toISOString(),position:(d.choice==='continue_adventure')===d.continueLeft?'left':'right',timeToChoiceMs:Math.round((d.choiceTime-d.heartPlacementTime)*1000),heroCoins:economy.heroCoins,totalAvailableHeroCoins:allCollectibles.filter(c=>c.type==='coin').length,memoryCrystals:economy.memoryCrystalsCollected,totalPlayTimeMs:Math.round(performance.now()-start),roomCompletionTimeMs:Math.round(d.heartPlacementTime*1000)};
   window.dispatchEvent(new CustomEvent('room10_final_choice',{detail}));window.dispatchEvent(new CustomEvent('choice_selected',{detail}));
   if(d.choice==='leave_block_world')window.dispatchEvent(new CustomEvent('blockWorldExitCutscene',{detail}));
  }
 }};
}
