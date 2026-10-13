import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';
import {heartPuzzle} from '../src/puzzles.ts';
import {heartGuideLocale,heartGuideText,heartGuideStage} from '../src/heart-guidance.ts';
import {createHeartCutscene} from '../src/heart-cutscene.ts';

test('Room 9 guide follows browser preference and progresses from circle to delivery',()=>{
 assert.equal(heartGuideLocale(['es-MX','en']), 'es');assert.equal(heartGuideLocale(['ja-JP']), 'ja');assert.equal(heartGuideLocale(['xx']), 'en');
 for(const lang of ['en','ja','es','pt','fr','de','it','ko','zh','ru','ar','hi'])for(let i=0;i<5;i++)assert.ok(heartGuideText(i,[lang]).length>8);
 const g=new Game(heartPuzzle);new HeroTeam(g,'mia');assert.equal(heartGuideStage(g),1);g.finale!.startAssembly(g);assert.equal(heartGuideStage(g),-1);g.finale!.finishAssembly(g);assert.equal(heartGuideStage(g),2);g.player.z=-21;assert.equal(heartGuideStage(g),3);g.player.z=-40;assert.equal(heartGuideStage(g),4);
});
test('a retracted or incomplete bridge cannot be entered as walkable ground',()=>{
 const g=new Game(heartPuzzle);new HeroTeam(g,'mia');const f=g.finale!;f.finishAssembly(g);
 for(const extension of [0,.5,.97]){f.bridgeExtension=extension;assert.equal(f.canMove({x:-7,z:-24.1},0,true,{x:-7,z:-23.9}),false);}
 f.bridgeExtension=1;assert.equal(f.canMove({x:-7,z:-24.1},0,true,{x:-7,z:-23.9}),true);
 assert.ok(g.layout.obstacles?.some(o=>o.id==='bridge-housing'&&o.x+o.width/2<=-10));
});
class Element extends EventTarget {children:Element[]=[];hidden=false;className='';textContent='';src='';currentTime=0;muted=true;paused=true;error=null;rejectPlay=false;onclick?:()=>void;plays=0;
 append(...items:Element[]){this.children.push(...items);} removeAttribute(name:string){if(name==='src')this.src='';} load(){} pause(){this.paused=true;} play(){this.plays++;if(this.rejectPlay)return Promise.reject(new Error('autoplay blocked'));this.paused=false;return Promise.resolve();}}
test('heart movie defaults to sound, waits for assembly, and offers tap-to-play on blocked autoplay',async()=>{
 const previousDocument=globalThis.document,previousWindow=globalThis.window;
 const created:Element[]=[];
 Object.assign(globalThis,{document:{createElement:()=>{const el=new Element();created.push(el);return el;}},window:{BLOCK_WORLD_CONFIG:{heartAssemblyVideo:'heart.mp4'}}});
 try{
  const parent=new Element(),cutscene=createHeartCutscene(parent as any),g=new Game(heartPuzzle);new HeroTeam(g,'mia');cutscene.update(g,.1);
  const [overlay,video,sound,recovery,,play]=created;
  assert.equal(video.muted,false);assert.equal(video.plays,0);assert.equal(overlay.hidden,true);assert.equal(video.src,'heart.mp4');
  g.finale!.startAssembly(g);g.finale!.assemblyTime=5.9;cutscene.update(g,.1);assert.equal(video.plays,0);
  video.rejectPlay=true;g.finale!.assemblyTime=6;cutscene.update(g,.1);await Promise.resolve();assert.equal(overlay.hidden,false);assert.equal(recovery.hidden,false);assert.equal(g.finale!.paused,true);
  video.rejectPlay=false;play.onclick!();await Promise.resolve();assert.equal(video.paused,false);assert.equal(video.muted,false);assert.equal(recovery.hidden,true);sound.onclick!();assert.equal(video.muted,true);
  video.dispatchEvent(new Event('ended'));assert.equal(g.finale!.assembly,'complete');assert.equal(overlay.hidden,true);
 }finally{Object.assign(globalThis,{document:previousDocument,window:previousWindow});}
});
