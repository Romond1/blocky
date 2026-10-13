import { Game } from './game.ts';
import { powerPuzzle } from './puzzles.ts';
import { paintRoomMap } from './split-map.ts';

/** Demonstration state is independent of the playable room. */
export function helpFrame(seconds:number){
 const t=seconds%16;
 return {t,step:t<4?0:t<8?1:t<12?2:3,first:t>=2,second:t>=10,
  extension:t<2?0:t<3?t-2:t<6?1:t<7?7-t:t<9?0:t<10?t-9:1,
  door:Math.max(0,Math.min(1,(t-12)/1.5))};
}

export function createRoomHelp(onClose:()=>void){
 const dialog=document.createElement('dialog');dialog.className='room-help';dialog.setAttribute('aria-label','Room 3 animated solution');
 dialog.innerHTML=`<button class="help-close" aria-label="Close explanation">×</button><canvas width="1240" height="630" role="img" aria-label="Yuki places STRONG, the bridge extends, Mia crosses and places M, then both heroes return to the open door."></canvas><div class="help-steps" aria-label="Solution steps"><span>1 · STRONG</span><span>2 · MIA →</span><span>3 · M</span><span>4 · 🚪</span></div><button class="help-replay" aria-label="Replay animation">↻</button>`;
 document.body.append(dialog);
 const canvas=dialog.querySelector('canvas')!,c=canvas.getContext('2d')!;
 const map=document.createElement('canvas');map.width=1400;map.height=1100;const mc=map.getContext('2d')!;
 const demo=new Game(powerPuzzle);let elapsed=0;
 const x=(n:number)=>700+n*34,z=(n:number)=>215+n*29;
 const lerp=(a:number,b:number,p:number)=>a+(b-a)*Math.max(0,Math.min(1,p));
 const marker=(px:number,pz:number,color:string,label:string)=>{
  mc.fillStyle='#111a23';mc.beginPath();mc.arc(x(px),z(pz),29,0,Math.PI*2);mc.fill();
  mc.strokeStyle=color;mc.lineWidth=6;mc.stroke();mc.fillStyle=color;mc.font='bold 28px sans-serif';mc.textAlign='center';mc.textBaseline='middle';mc.fillText(label,x(px),z(pz));
 };
 const block=(px:number,pz:number,label:string,size:number)=>{
  mc.fillStyle='#303d46';mc.fillRect(x(px)-size/2,z(pz)-25,size,50);mc.strokeStyle='#ffac55';mc.lineWidth=4;mc.strokeRect(x(px)-size/2,z(pz)-25,size,50);
  mc.fillStyle='#fff1c7';mc.textAlign='center';mc.textBaseline='middle';mc.font='bold 24px sans-serif';mc.fillText(label,x(px),z(pz));
 };
 function draw(){
  const f=helpFrame(elapsed);demo.stageSolved=[f.first,f.second];demo.solved=f.t>=12;demo.bridge.extension=f.extension;
  paintRoomMap(mc,demo);
  // Large plate halos make each cause/effect beat visible without paragraphs.
  const plate=f.step<2?powerPuzzle.room!.sockets[0]:powerPuzzle.room!.sockets[1];
  if(f.step===0||f.step===2){mc.strokeStyle=(f.step===0?f.first:f.second)?'#49eaff':'#ffac55';mc.lineWidth=7;mc.beginPath();mc.arc(x(plate.x),z(plate.z),55+Math.sin(elapsed*4)*5,0,Math.PI*2);mc.stroke();}
  let miaX=-4,miaZ=1;
  if(f.t>=4&&f.t<6){miaX=lerp(-4,10,(f.t-4)/2);miaZ=-2;}
  else if(f.t>=6&&f.t<8){miaX=10;miaZ=-2;}
  else if(f.t>=8&&f.t<12){miaX=13;miaZ=2;}
  else if(f.t>=12){miaX=lerp(13,-14,(f.t-12)/3);miaZ=f.t<14.6?-2:lerp(-2,-5,(f.t-14.6)/1.4);}
  marker(-13,f.t>=14?lerp(5,-5,(f.t-14)/2):5,'#66bce9','Y');marker(miaX,miaZ,'#ff8475','M');
  if(f.t<2)block(-12,lerp(6,3,f.t/2),'STRONG',116);
  if(f.t>=8&&f.t<10)block(14,lerp(3,-1,(f.t-8)/2),'M',48);
  // The door visibly slides open only after the second plate powers up.
  if(f.t>=12){mc.fillStyle='#090e16';mc.fillRect(x(-15.2),z(-5.35),2.4*34,.85*29);mc.fillStyle='#49eaff';mc.fillRect(x(-15.2),z(-5.35),2.4*34*(1-f.door),.85*29);}
  c.clearRect(0,0,1240,630);c.drawImage(map,80,20,1240,630,0,0,1240,630);
  dialog.querySelectorAll('.help-steps span').forEach((el,i)=>{el.classList.toggle('active',i===f.step);el.setAttribute('aria-current',i===f.step?'step':'false');});
 }
 function close(){if(!dialog.open)return;dialog.close();onClose();}
 dialog.querySelector<HTMLButtonElement>('.help-close')!.onclick=close;
 dialog.querySelector<HTMLButtonElement>('.help-replay')!.onclick=()=>{elapsed=0;draw();};
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 return {get open(){return dialog.open;},get time(){return elapsed;},get step(){return helpFrame(elapsed).step;},
  show(){elapsed=0;draw();dialog.showModal();dialog.querySelector<HTMLButtonElement>('.help-close')!.focus();},close,
  update(dt:number){if(dialog.open){elapsed+=dt;draw();}}
 };
}
