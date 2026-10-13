import test from 'node:test';
import assert from 'node:assert/strict';
import {KeyboardState,MOVEMENT_KEYS} from '../src/keyboard-state.ts';
test('held chords survive without repeat events until physical release',()=>{
 for(const code of MOVEMENT_KEYS){let now=0;const keys=new KeyboardState(()=>now);keys.add(code);keys.add('Space');now=5000;keys.renew('Space');assert.equal(keys.has(code),true);keys.release(code,'');assert.equal(keys.has(code),false);}
});
test('release accepts the physical code or logical key, repeats cannot resurrect cleared input',()=>{
 let now=0;const keys=new KeyboardState(()=>now);keys.add('KeyA');keys.release('Unidentified','A');assert.equal(keys.has('KeyA'),false);
 keys.add('KeyD');keys.clear();now=100;keys.renew('KeyD');assert.equal(keys.has('KeyD'),false);
});
