import type {Game} from './game.ts';
import type {HeroId} from './companions/companion.ts';
/** Onboarding observes actions, then docks; it never controls gameplay permission. */
export function createTrainingUI(hud:HTMLElement){
 const panel=document.createElement('section');panel.className='training-prompt';panel.setAttribute('aria-live','polite');panel.hidden=true;hud.append(panel);
 let previous='',tutorial:Game['training']=null;
 const title=(text:string)=>`<strong>${text}</strong>`;
 const key=(label:string,code=label)=>`<kbd data-key="${code}">${label}</kbd>`;
 function update(game:Game,keys:Set<string>,hero:HeroId,other:HeroId,waiting=false,touch=false){
  const t=game.training;hud.classList.toggle('training-hud',!!t);panel.hidden=!t;
  hud.querySelector<HTMLElement>('.controls')!.hidden=!!t;
  hud.querySelector<HTMLElement>('.hero-status')!.hidden=false;
  hud.querySelector<HTMLElement>('#switch-hero')!.hidden=false;
  // The docked mission replaces the duplicate objective card in these rooms.
  hud.querySelector<HTMLElement>('.objective')!.hidden=!!t;
  if(!t){previous='';tutorial=null;return;}
  if(touch){
   panel.classList.remove('tutorial-docked');panel.dataset.phase=t.step;
   const lesson=t.requiresHeavy&&!t.setupComplete?'HERO · Switch to your teammate':!t.requiresHeavy&&!t.has('PLAYER_MOVED')?'Move the left stick to walk':!t.requiresHeavy&&!t.has('CAMERA_LOOKED')?'Drag the right side to look around':game.carried?'ACTION · Place your block':game.nearest?'ACTION · Pick up a block':game.solved?'Walk through the glowing doorway':'JUMP to hop · ACTION to pick up · HERO to switch';
   const content=`<p>${lesson}</p>`;if(content!==previous){panel.innerHTML=content;previous=content;}
   panel.hidden=t.docked&&!game.carried&&!game.nearest;return;
  }
  if(tutorial!==t){panel.classList.remove('tutorial-docked');previous='';tutorial=t;}
  panel.hidden=t.transitionGap;
  const phase=t.docked?'checklist':t.transitionGap?'transition':t.setupComplete?'mission':t.step;
  if(panel.dataset.phase!==phase){panel.dataset.phase=phase;panel.classList.toggle('mission-arrival',phase==='mission');}
  panel.classList.toggle('tutorial-docked',t.docked);panel.dataset.step=t.step;
  const moved=t.has('PLAYER_MOVED'),looked=t.has('CAMERA_LOOKED');
  let content='';
  if(!t.docked){
   if(t.requiresHeavy&&!t.setupComplete)content=title('SWITCH HERO')+`<p>Click the flashing Switch hero button.</p><p>Or press ${key('Q')} / ${key('Tab')}.</p>`;
   else if(!t.requiresHeavy&&!moved)content=title('MOVE')+`<div class="tutorial-keys"><div>${key('W')}</div><div>${key('A')}${key('S')}${key('D')}</div></div><p>Forward, left, back, right · arrows work too</p>`;
   else if(!t.requiresHeavy&&!looked)content=title('LOOK AROUND')+'<div class="tutorial-mouse" aria-hidden="true"><i></i></div><p>Hold the left mouse button and drag</p>';
   else if(game.layout.sockets.length===1)content=title('COMPLETE H _ R O')+'<p>Find the missing letter. Place it on the glowing plate.<br>Click the buttons, or use E to pick up / place and Q / Tab to switch.</p>';
   else content='<div class="mission-eyebrow">YOUR MISSION</div>'+title('POWER BOTH PLATES')+'<p>Complete H _ R O on the letter plate.<br>Place HEAVY on its plate. Either order works.</p>';
  }else{
   const row=(label:string,done:boolean)=>`<li class="${done?'task-done':''}" data-complete="${done}"><span aria-hidden="true">${done?'✓':'○'}</span><span>${label}</span></li>`;
   content=title('YOUR TASKS')+'<ul class="tutorial-checklist">'+(t.requiresHeavy?row('Switch hero',t.setupComplete):row('Move',moved)+row('Look around',looked))+row(t.requiresHeavy?'Activate both pressure plates.':'Complete HERO. Power the doorway.',game.doorPowered&&game.doorCharge===1)+'</ul>';
   if(t.requiresHeavy)content+='<p class="task-detail">Complete H _ R O on the letter plate.<br>Place HEAVY on its plate. Either order works.</p>';
  }
  let context='';
  if(game.action?.kind==='HEAVY_STRUGGLE')context=title('TOO HEAVY FOR MIA')+`<p>${key('Q')} / ${key('Tab')} · Switch to Yuki</p>`;
  else if(game.action?.kind==='HEAVY_LIFT')context=title('YUKI IS SUPER STRONG!');
  else if(t.failureNotice>0&&hero==='mia')context=title('YUKI CAN LIFT THIS')+`<p>${key('Q')} / ${key('Tab')} · Switch to Yuki</p>`;
  else if(t.docked){
   if(game.carried)context=title(`CARRYING ${game.carried.text}`)+`<p>${key('E')} Drop / place · ${key('Q')} / ${key('Tab')} Switch hero</p>`;
   else if(game.solved)context=waiting?title(`WAIT FOR ${other.toUpperCase()}`)+'<p>Your teammate is on the way.</p>':title('ESCAPE TOGETHER')+'<p>Both heroes through the glowing doorway.</p>';
   else if(game.nearest?.weightClass==='heavy'&&hero==='mia')context=`<p>${key('Q')} / ${key('Tab')} · Switch to Yuki</p>`;
   else if(game.nearest)context=`<p>${key('E')} ${game.nearest.weightClass==='heavy'?'Try lifting':'Pick up'} ${game.nearest.text}</p>`;
   else context='<p>Click the buttons, or use E to pick up / place and Q / Tab to switch.</p>';
  }
  if(context)content+=`<div class="tutorial-context">${context}</div>`;
  if(content!==previous){panel.innerHTML=content;previous=content;}
  panel.querySelectorAll<HTMLElement>('kbd').forEach(el=>{const code=el.dataset.key!;const arrow:Record<string,string>={W:'ArrowUp',A:'ArrowLeft',S:'ArrowDown',D:'ArrowRight'};el.classList.toggle('pressed',keys.has(code.length===1?'Key'+code:code)||keys.has(arrow[code]));});
 }
 return {update};
}
