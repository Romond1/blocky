import test from 'node:test';import assert from 'node:assert/strict';import {Game} from '../src/game.ts';import {HeroTeam} from '../src/team.ts';import {dragonPuzzle} from '../src/finale-layout.ts';
test('one big block and one small block reach the lowered right landing',()=>{
 for(const hero of ['mia','yuki'] as const){const g=new Game(dragonPuzzle),t=new HeroTeam(g,hero),d=g.finale!.dragon!;d.locks[0]=d.locks[1]=true;
 Object.assign(g.blocks[10],{x:28.8,z:-14,y:0});Object.assign(g.blocks[13],{x:28.5,z:-14,y:1.8,support:10});Object.assign(t.actors[hero],{x:30.5,z:-14});Object.assign(t.actors[t.other],{x:38,z:-10});t.select(hero);
 const jump=(x:number)=>{g.jump();for(let i=0;i<110;i++)t.update(1/60,Math.abs(g.player.x-x)>.06?Math.sign(x-g.player.x):0,0);};
 jump(29.55);assert.equal(g.motion[hero].y,1.8,'big block');jump(28.5);assert.equal(g.motion[hero].y,3,'small block');jump(26.5);assert.equal(g.motion[hero].y,4,'upper landing');
 }
});
