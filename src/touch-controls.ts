import {joystickVector} from './input-device.ts';
import {instruction} from './instructions.ts';
export type GameAction='jump'|'interact'|'switchHero';
/** Each finger owns only its control; no synthetic keyboard events. */
export function createTouchControls(parent:HTMLElement,perform:(action:GameAction)=>void,look:(dx:number,dy:number)=>void,canPlay:()=>boolean){
 const root=document.createElement('div');root.className='touch-controls';root.hidden=true;
 root.innerHTML='<div class="touch-look" aria-label="Drag here to look around"></div><div class="joystick" role="group" aria-label="Movement joystick"><span class="joystick-knob"></span><small>MOVE</small></div><div class="touch-actions"><button type="button" data-action="switchHero" aria-label="Switch hero"><span class="action-icon" aria-hidden="true">⇄</span><kbd translate="no">Q / Tab</kbd><span class="action-label">HERO</span></button><button type="button" data-action="interact" aria-label="Action: pick up, place or use"><span class="action-icon" aria-hidden="true">✋</span><kbd translate="no">E</kbd><span class="action-label">ACTION</span></button><button type="button" data-action="jump" aria-label="Jump"><span class="action-icon" aria-hidden="true">↑</span><kbd translate="no">Space</kbd><span class="action-label">JUMP</span></button></div>';
 parent.append(root);
 const stick=root.querySelector<HTMLElement>('.joystick')!,knob=root.querySelector<HTMLElement>('.joystick-knob')!,camera=root.querySelector<HTMLElement>('.touch-look')!;
 let stickId:number|undefined,lookId:number|undefined,lastX=0,lastY=0,x=0,z=0,labelState='';
 const owners=new Map<number,HTMLElement>();
 function own(event:PointerEvent,element:HTMLElement){event.preventDefault();event.stopPropagation();owners.set(event.pointerId,element);element.setPointerCapture(event.pointerId);element.classList.add('pressed');}
 function move(event:PointerEvent){const b=stick.getBoundingClientRect(),radius=b.width*.34,dx=event.clientX-b.x-b.width/2,dy=event.clientY-b.y-b.height/2;({x,z}=joystickVector(dx,dy,radius));knob.style.transform=`translate(${x*radius}px,${-z*radius}px)`;}
 stick.onpointerdown=event=>{if(!canPlay()||stickId!==undefined)return;stickId=event.pointerId;own(event,stick);move(event);};
 stick.onpointermove=event=>{if(event.pointerId===stickId)move(event);};
 camera.onpointerdown=event=>{if(!canPlay()||lookId!==undefined)return;lookId=event.pointerId;lastX=event.clientX;lastY=event.clientY;own(event,camera);};
 camera.onpointermove=event=>{if(event.pointerId!==lookId)return;look(event.clientX-lastX,event.clientY-lastY);lastX=event.clientX;lastY=event.clientY;};
 function release(event:PointerEvent){
  const element=owners.get(event.pointerId);owners.delete(event.pointerId);
  if(element&&![...owners.values()].includes(element))element.classList.remove('pressed');
  if(stickId===event.pointerId){stickId=undefined;x=z=0;knob.style.transform='';}
  if(lookId===event.pointerId)lookId=undefined;
  if(element?.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);
 }
 root.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{
  button.onpointerdown=event=>{if(event.button!==0||!canPlay()||button.disabled)return;own(event,button);perform(button.dataset.action as GameAction);};
  // Assistive technology / keyboard button activation has no pointerdown.
  button.onclick=event=>{if(event.detail===0&&canPlay()&&!button.disabled)perform(button.dataset.action as GameAction);};
 });
 root.addEventListener('pointerup',release);root.addEventListener('pointercancel',release);root.addEventListener('lostpointercapture',release);
 function clear(){
  stickId=lookId=undefined;x=z=0;knob.style.transform='';
  const captured=[...owners];owners.clear();for(const [id,element] of captured){element.classList.remove('pressed');if(element.hasPointerCapture(id))element.releasePointerCapture(id);}
 }
 return {root,get vector(){return {x,z};},clear,
  update(visible:boolean,disabled:boolean,actionAvailable:boolean,touch=true,switchSuggested=false,actionLabel='Action'){
   if(root.hidden===visible){clear();root.hidden=!visible;}
   root.classList.toggle('desktop-controls',!touch);
   const nextLabels=`${touch}:${actionLabel}`;
   if(nextLabels!==labelState){
    labelState=nextLabels;
    const labels:Record<string,string>=touch?{switchHero:'HERO',interact:'ACTION',jump:'JUMP'}:{switchHero:'Switch hero',interact:actionLabel,jump:'Jump'};
    root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{b.querySelector('.action-label')!.textContent=instruction(labels[b.dataset.action!]);});
   }
   root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{b.disabled=disabled;b.classList.toggle('action-ready',b.dataset.action==='interact'&&actionAvailable);b.classList.toggle('switch-suggested',!disabled&&b.dataset.action==='switchHero'&&switchSuggested);});
  },
 };
}
