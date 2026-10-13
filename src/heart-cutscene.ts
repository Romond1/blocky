import type {Game} from './game.ts';
import {instruction} from './instructions.ts';
export interface FinaleConfig {heartAssemblyVideo?:string;}
declare global {interface Window {BLOCK_WORLD_CONFIG?:FinaleConfig;}}
/** Circle assembly first, then an audible movie with a user-gesture fallback. */
export function createHeartCutscene(parent:HTMLElement){
 const overlay=document.createElement('div');overlay.className='heart-video';overlay.hidden=true;
 const video=document.createElement('video');video.playsInline=true;video.preload='auto';video.controls=false;video.muted=false;
 const sound=document.createElement('button');sound.className='heart-video-sound';sound.textContent=instruction('Sound off');sound.onclick=()=>{video.muted=!video.muted;sound.textContent=instruction(video.muted?'Sound on':'Sound off');};
 const recovery=document.createElement('div');recovery.className='heart-video-recovery';recovery.hidden=true;
 const message=document.createElement('p'),play=document.createElement('button'),skip=document.createElement('button');
 play.textContent=instruction('Play video');skip.textContent=instruction('Continue playing');recovery.append(message,play,skip);
 overlay.append(video,sound,recovery);parent.append(overlay);
 let owner:Game|null=null,attempted=false,stall=0,lastTime=0,total=0,waitingForTap=false,preloaded='';
 const hide=()=>{video.pause();overlay.hidden=true;recovery.hidden=true;waitingForTap=false;video.removeAttribute('src');video.load();preloaded='';};
 const finish=()=>{if(owner?.finale?.paused)owner.finale.finishAssembly(owner);hide();};
 const offerPlay=(failed=false)=>{if(overlay.hidden)return;waitingForTap=true;recovery.hidden=false;message.textContent=instruction(failed?'Video could not load. Try again or continue playing.':'Tap Play video to watch with sound.');};
 const start=()=>{waitingForTap=false;recovery.hidden=true;stall=0;lastTime=video.currentTime;void video.play().catch(()=>offerPlay());};
 play.onclick=()=>{if(video.error){video.load();}start();};skip.onclick=finish;
 video.addEventListener('error',()=>offerPlay(true));video.addEventListener('ended',finish);
 return {
  update(g:Game,dt:number){
   if(owner!==g){hide();owner=g;attempted=false;stall=0;total=0;lastTime=0;video.muted=false;sound.textContent=instruction('Sound off');}
   const asset=window.BLOCK_WORLD_CONFIG?.heartAssemblyVideo;
   if(g.finale?.assembly==='waiting'){
    g.finale.videoPending=Boolean(asset);
    if(asset&&asset!==preloaded){video.src=asset;preloaded=asset;video.load();}
   }
   if(!g.finale?.paused){if(!overlay.hidden)hide();return;}
   if(g.finale.assemblyTime<6)return;
   if(!attempted){attempted=true;g.finale.videoPending=false;if(asset){g.finale.videoActive=true;if(preloaded!==asset){video.src=asset;preloaded=asset;}overlay.hidden=false;start();}}
   if(g.finale.videoActive&&!waitingForTap){total+=dt;stall=video.currentTime>lastTime+.001?0:stall+dt;lastTime=video.currentTime;if(stall>12||total>90){video.pause();offerPlay(true);total=0;}}
  },
  reset(){hide();owner=null;attempted=false;},
 };
}
