import {activeAccount,addAccountMenu} from './account.ts';
import type {AdventureProgress} from './adventure-progress.ts';
import {ROOM_NAMES} from './adventure-progress.ts';
import type {ControlPreference} from './input-device.ts';

export function createPlayerMenu(parent:HTMLElement,progress:AdventureProgress,callbacks:{pause:()=>void;resume:()=>void;reset:()=>boolean;replay:(room:number)=>void;visitRoom:(room:number)=>boolean;lockTeacher:()=>void;resetAll:()=>void;debug:()=>void;controlMode:(mode:ControlPreference)=>void;quality:(quality:string)=>void}){
 const dialog=document.createElement('dialog');dialog.className='player-menu';
 dialog.innerHTML=`<div class="menu-heading"><h2 tabindex="0">Adventure paused</h2><button type="button" data-menu="resume" aria-label="Close menu">✕</button></div>
 <div class="menu-primary"><button type="button" data-menu="resume">Keep playing</button><button type="button" id="reset">Reset Room</button></div>
 <label>Controls <select id="control-mode"><option value="auto">Automatic</option><option value="touch">Touch</option><option value="keyboard">Keyboard &amp; mouse</option></select></label>
 <label>Graphics <select id="graphics-quality"><option value="auto">Automatic</option><option value="low">Battery saver</option><option value="high">Full detail</option></select></label>
 <details class="replay-menu"><summary>Replay unlocked rooms</summary><nav aria-label="Replay unlocked rooms"></nav></details>
 <details><summary>How to play</summary><p class="menu-control-help">WASD / arrows: move · Drag: look · Space: jump · E: action · Q / Tab: hero · R: reset · You can also click the action buttons.</p><p>Mia runs fast. Yuki lifts heavy blocks. Work together!</p></details>
 <form class="teacher-unlock" hidden><label>Teacher code <input inputmode="numeric" type="password" maxlength="4" autocomplete="off" aria-label="Teacher code"></label><button type="submit">Open teacher controls</button><p class="teacher-message" role="status"></p></form>
 <section class="teacher-controls" hidden><h3>Teacher tools · current player</h3><p>Room visits are for testing. Reset All clears the current player’s saved rooms, coins and treasures.</p><div class="teacher-room-jump"><label for="teacher-room-select">Go to any room</label><select id="teacher-room-select"></select><button type="button" id="teacher-room-go">Go to room</button><p>Teacher room visits do not unlock player progress.</p></div><button type="button" id="debug-toggle">Debug</button><button type="button" id="reset-all-testing">Reset All Progress</button><button type="button" data-menu="lock">Hide teacher tools</button></section>`;
 parent.append(dialog);addAccountMenu(dialog);
 const form=dialog.querySelector<HTMLFormElement>('form')!,teacher=dialog.querySelector<HTMLElement>('.teacher-controls')!,input=form.querySelector('input')!;
 const roomSelect=dialog.querySelector<HTMLSelectElement>('#teacher-room-select')!;
 ROOM_NAMES.forEach((name,index)=>roomSelect.add(new Option(`${index+1}. ${name}`,String(index+1))));
 let unlocked=false,taps=0,lastTap=0;
 function close(){if(dialog.open)dialog.close();}
 dialog.addEventListener('close',callbacks.resume);
 dialog.querySelectorAll<HTMLElement>('[data-menu="resume"]').forEach(b=>b.onclick=close);
 dialog.querySelector<HTMLElement>('h2')!.onclick=()=>{const now=performance.now();taps=now-lastTap<1500?taps+1:1;lastTap=now;if(taps>=5){form.hidden=false;input.focus();taps=0;}};
 form.onsubmit=event=>{event.preventDefault();if(input.value==='1001'){unlocked=true;teacher.hidden=false;form.hidden=true;input.value='';}else form.querySelector('p')!.textContent='Try that code again.';};
 dialog.querySelector<HTMLElement>('[data-menu="lock"]')!.onclick=()=>{unlocked=false;teacher.hidden=true;form.hidden=true;callbacks.lockTeacher();};
 dialog.querySelector<HTMLElement>('#teacher-room-go')!.onclick=()=>{if(unlocked&&callbacks.visitRoom(Number(roomSelect.value)))close();};
 dialog.querySelector<HTMLElement>('#debug-toggle')!.onclick=()=>{if(unlocked){callbacks.debug();close();}};
 dialog.querySelector<HTMLElement>('#reset')!.onclick=()=>{if(callbacks.reset())close();};
 dialog.querySelector<HTMLElement>('#reset-all-testing')!.onclick=()=>{if(unlocked&&confirm(activeAccount()?`Reset all rooms, coins and treasures for ${activeAccount()!.user.name}? This changes this account’s online save and cannot be undone.`:'Erase ALL adventure progress and collectibles in THIS browser? This cannot be undone.')){callbacks.resetAll();close();}};
 dialog.querySelector<HTMLSelectElement>('#control-mode')!.onchange=event=>callbacks.controlMode((event.target as HTMLSelectElement).value as ControlPreference);
 dialog.querySelector<HTMLSelectElement>('#graphics-quality')!.onchange=event=>callbacks.quality((event.target as HTMLSelectElement).value);
 return {get open(){return dialog.open;},get teacher(){return unlocked;},dialog,
  updateControls(touch:boolean){dialog.querySelector('.menu-control-help')!.textContent=touch?'Left stick: move · Drag the right side: look · JUMP: hop · ACTION: pick up, place or use · HERO: switch heroes':'WASD / arrows: move · Drag: look · Space: jump · E: action · Q / Tab: hero · R: reset · You can also click the action buttons.';},
  show(room:number,mode:ControlPreference){
   callbacks.pause();dialog.querySelector<HTMLSelectElement>('#control-mode')!.value=mode;roomSelect.value=String(room);
   const nav=dialog.querySelector('nav')!;nav.replaceChildren();
   for(let n=1;n<=progress.unlocked;n++){
    const button=document.createElement('button');button.type='button';button.textContent=`${n}. ${ROOM_NAMES[n-1]}`;
    if(n===room)button.setAttribute('aria-current','page');
    button.onclick=()=>{if(progress.canReplay(n)){callbacks.replay(n);close();}};nav.append(button);
   }
   form.hidden=true;input.value='';teacher.hidden=!unlocked;dialog.showModal();
  },close,
 };
}
