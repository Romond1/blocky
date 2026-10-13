import {memoryPuzzle} from '../src/puzzles.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.ts';
import {HeroTeam} from '../src/team.ts';

function pick(g:Game,text:string){const b=g.blocks.find(b=>b.text===text)!;Object.assign(g.player,{x:b.x-(b.weightClass==='heavy'?1.6:0),z:b.z+(b.weightClass==='heavy'?0:1.4)});g.interact();}
function place(g:Game,slot:number){const p=g.layout.sockets[slot];Object.assign(g.player,{x:p.x,z:p.z+1.6});g.interact();}
test('HERO activates its own plate but does not open the final exit',()=>{
 const g=new Game(memoryPuzzle);pick(g,'E');place(g,0);g.update(2);
 assert.equal(g.solved,false);assert.equal(g.doorLift,0);assert.equal(g.word,'H E R O');
});
test('Room 2 contains explicit light letters and a large heavy block',()=>{
 const g=new Game(memoryPuzzle);assert.equal(g.blocks.length,4);
 for(const b of g.blocks.slice(0,3))assert.equal(b.weightClass,'light');
 const heavy=g.blocks[3];assert.equal(heavy.text,'HEAVY');assert.equal(heavy.requiredStrength,2);assert.ok(heavy.size>g.blocks[0].size);
});
test('early heavy approach allows Mia to try immediately',()=>{
 const g=new Game(memoryPuzzle);const t=new HeroTeam(g,'mia');pick(g,'HEAVY');assert.equal(g.carried,undefined);assert.equal(g.action?.kind,'HEAVY_STRUGGLE');assert.equal(t.ownershipValid,true);
});
function teach(g:Game,t:HeroTeam){
 g.training!.emit('TAB_SWITCHED');
 g.training!.look(.5);g.training!.move(2,t.selected);pick(g,'E');place(g,0);
 t.select(t.other);if(t.selected!=='mia')t.select('mia');
 g.training!.move(4,'mia');
}
for(const initial of ['yuki','mia'] as const)test(`${initial}: full two-plate lesson, struggle, weight capability and exit unlock`,()=>{
 const g=new Game(memoryPuzzle),t=new HeroTeam(g,initial);teach(g,t);
 assert.equal(g.training!.step,'mission');const heavy=g.blocks[3],origin={x:heavy.x,z:heavy.z};
 pick(g,'HEAVY');assert.equal(g.action?.kind,'HEAVY_STRUGGLE');assert.equal(g.carried,undefined);
 g.update(.2);assert.equal(g.action?.kind,'HEAVY_STRUGGLE');
 const before={...g.player};g.update(.02,1,0);assert.equal(g.action?.kind,'HEAVY_DROP');assert.notEqual(g.player.x,before.x,'movement input is accepted');g.update(.3);
 assert.equal(g.action,null);assert.deepEqual({x:heavy.x,z:heavy.z},origin);assert.equal(heavy.state,'floor');assert.equal(g.lastHeavyEvent,'HEAVY_THUD');
 assert.ok(g.training!.failureNotice>0);t.select('yuki');
 pick(g,'E');Object.assign(g.player,{x:0,z:5});g.facing=0;g.interact();assert.equal(g.carried,undefined);g.facing=Math.PI;
 pick(g,'HEAVY');assert.equal(g.action?.kind,'HEAVY_LIFT');g.update(.5);assert.equal(g.carried,heavy);
 place(g,0);assert.equal(g.placed[0],heavy,'any block can be placed on an empty plate');g.interact();g.update(.5);assert.equal(g.carried,heavy);
 place(g,1);pick(g,'E');place(g,0);assert.equal(g.solved,true);assert.equal(g.training!.heavyActivated,true);g.update(3);assert.ok(g.doorLift>0);assert.equal(g.training!.step,'exit');
});
test('small block on heavy plate remains removable; wrong letters remain retrievable',()=>{
 const g=new Game(memoryPuzzle);pick(g,'A');place(g,1);assert.equal(g.placed[1]?.text,'A');assert.equal(g.training!.heavyActivated,false);g.interact();assert.equal(g.carried?.text,'A');
 place(g,0);assert.equal(g.training!.heroSolved,false);assert.equal(g.placed[0]?.text,'A');g.interact();assert.equal(g.carried?.text,'A');
});
test('heavy plate accepts capability data rather than the word HEAVY',()=>{
 const g=new Game(memoryPuzzle),t=new HeroTeam(g);teach(g,t);pick(g,'HEAVY');g.update(3);g.update(.3);t.select('yuki');pick(g,'HEAVY');g.update(.5);g.carried!.text='BOULDER';place(g,1);assert.equal(g.solved,true);
});
test('rapid E, timeout, switching during struggle/lift and reset leave no orphaned actions',()=>{
 const g=new Game(memoryPuzzle),t=new HeroTeam(g);teach(g,t);pick(g,'HEAVY');for(let i=0;i<30;i++)g.interact();assert.equal(g.blocks[3].state,'floor');g.update(.4);
 pick(g,'HEAVY');t.select('yuki');assert.equal(g.action,null);assert.equal(g.blocks[3].state,'floor');pick(g,'HEAVY');assert.equal(g.action?.kind,'HEAVY_LIFT');t.select('mia');assert.equal(g.action,null);assert.equal(g.blocks[3].state,'floor');
 t.reset();assert.equal(g.training!.step,'switch');assert.equal(g.action,null);assert.equal(g.blocks.length,4);assert.ok(g.blocks.every(b=>b.state==='floor'));assert.equal(g.solved,false);assert.equal(g.training!.completed.size,0);assert.ok(t.ownershipValid);
});
test('a switched-away heavy carrier holds position and can resume safely',()=>{
 const g=new Game(memoryPuzzle),t=new HeroTeam(g);teach(g,t);pick(g,'HEAVY');g.update(3);g.update(.3);t.select('yuki');pick(g,'HEAVY');g.update(.5);const pose={...t.actors.yuki,facing:g.facing};t.select('mia');for(let i=0;i<300;i++)t.update(1/60);assert.deepEqual(t.actors.yuki,pose);assert.equal(t.companion.state,'HOLDING_OBJECT');t.select('yuki');assert.equal(g.carried?.text,'HEAVY');
});
test('reset during every heavy action restores blocks, both plates and all tutorial lessons',()=>{
 for(const kind of ['HEAVY_STRUGGLE','HEAVY_DROP','HEAVY_LIFT']){
  const g=new Game(memoryPuzzle),t=new HeroTeam(g);teach(g,t);pick(g,'HEAVY');
  if(kind==='HEAVY_DROP')g.interact();
  if(kind==='HEAVY_LIFT'){g.update(3);g.update(.3);t.select('yuki');pick(g,'HEAVY');}
  assert.equal(g.action?.kind,kind);t.reset();assert.equal(g.action,null);assert.equal(g.training!.step,'switch');assert.equal(g.doorLift,0);assert.ok(g.placed.every(b=>!b));assert.ok(g.blocks.every(b=>b.state==='floor'));assert.ok(t.ownershipValid);
 }
});
test('tutorial events are ordered by lessons, repeat-safe and early actions do not softlock',()=>{
 const g=new Game(memoryPuzzle),t=new HeroTeam(g);const events:string[]=[];g.training!.onEvent(e=>events.push(e));
 for(let i=0;i<20;i++)t.select(t.other);assert.equal(g.training!.has('HERO_SWITCHED'),true);
 g.training!.look(1);pick(g,'E');place(g,0);assert.equal(g.training!.step,'mission');g.training!.move(2,'yuki');g.training!.emit('TAB_SWITCHED');assert.equal(g.training!.step,'mission');t.select('mia');g.training!.move(4,'mia');
 pick(g,'HEAVY');g.update(3);g.update(.4);g.training!.failureNotice=0;pick(g,'HEAVY');g.update(3);assert.equal(g.training!.failureNotice,0,'full first-failure message does not repeat');
 assert.equal(events.filter(e=>e==='HERO_WORD_COMPLETED').length,1);assert.equal(events.filter(e=>e==='HEAVY_BLOCK_DROPPED_MIA').length,1);
});
test('either hero carries light letter/number/symbol data; printed words do not assign weight',()=>{
 for(const hero of ['yuki','mia'] as const)for(const text of ['X','7','★','WORD']){
  const g=new Game(memoryPuzzle);new HeroTeam(g,hero);const b=g.blocks[2];b.text=text;Object.assign(g.player,{x:b.x,z:b.z});g.interact();assert.equal(g.carried,b);assert.equal(g.action,null);g.update(.1,1,0);assert.ok(g.player.x>b.x);
 }
});
