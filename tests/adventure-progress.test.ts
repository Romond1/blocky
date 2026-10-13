import test from 'node:test';
import assert from 'node:assert/strict';
import {AdventureProgress,PROGRESS_KEY} from '../src/adventure-progress.ts';
import {allCollectibles} from '../src/collectible-data.ts';
const storage=()=>{const values=new Map<string,string>();return {getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};};
test('URL and completing an unvisited room never grant unlocks',()=>{
 const p=new AdventureProgress();assert.equal(p.resolve('10'),1);assert.equal(p.resolve('-1'),1);
 p.complete(8);assert.equal(p.unlocked,1);p.complete(1);assert.equal(p.unlocked,2);assert.equal(p.resolve('10'),2);
 p.complete(1);assert.equal(p.unlocked,2);p.complete(2);assert.equal(p.unlocked,3);assert.equal(p.resolve('1'),1);
});
test('sequential progress persists and replay cannot lower it',()=>{
 const s=storage(),p=new AdventureProgress(s);for(let i=1;i<=5;i++)p.complete(i);
 assert.equal(new AdventureProgress(s).unlocked,6);p.complete(2);assert.equal(p.unlocked,6);
 p.reset();assert.equal(new AdventureProgress(s).unlocked,1);
});
test('migration uses known saved collectibles rather than arbitrary room ids',()=>{
 const known=allCollectibles.find(c=>c.roomId==='fruit')!;
 assert.equal(new AdventureProgress(undefined,[known]).unlocked,5);
 assert.equal(new AdventureProgress(undefined,[{id:'fake',roomId:'dragon',type:'coin'}]).unlocked,1);
 assert.equal(new AdventureProgress(undefined,[{...known,roomId:'dragon'}]).unlocked,1);
});
test('corrupt saves and unavailable storage keep a playable in-memory session',()=>{
 const s=storage();s.setItem(PROGRESS_KEY,'{"version":1,"unlocked":999}');assert.equal(new AdventureProgress(s).unlocked,1);
 const p=new AdventureProgress({getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}});
 p.complete(1);assert.equal(p.unlocked,2);
});
