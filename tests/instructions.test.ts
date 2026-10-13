import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveInstructionLocale,instruction} from '../src/instructions.ts';
test('browser instruction locale supports Japanese variants, ordered preferences and English fallback',()=>{assert.equal(resolveInstructionLocale(['ja-JP','en-US']),'ja');assert.equal(resolveInstructionLocale(['en-GB','ja']),'en');assert.equal(resolveInstructionLocale(['fr-FR','ja']),'ja');assert.equal(resolveInstructionLocale(['fr-FR']),'en');assert.equal(resolveInstructionLocale([]),'en');});
test('Japanese strength prompts explain the character switch while preserving the English puzzle word',()=>{assert.equal(instruction('TOO HEAVY FOR MIA','ja'),'ミアには重すぎる！');assert.equal(instruction(' Switch to Yuki','ja'),' ユキに交代しよう');assert.match(instruction('CARRYING HEAVY','ja'),/HEAVY/);assert.equal(instruction('H _ R O','ja'),'H _ R O');assert.equal(instruction('HEAVY','ja'),'HEAVY');assert.equal(instruction('TOO HEAVY FOR MIA','en'),'TOO HEAVY FOR MIA');assert.equal(instruction('[E] Place MIA answer','ja'),'[E] MIA の答えをのせる');});

import {entranceCopy} from '../src/entrance-prompts.ts';
test('entrance prompts follow supported browser languages and keep physical key names',()=>{
 for(const language of ['en','ja','es','fr','de','it','pt','ko','zh']){
  const copy=entranceCopy([`${language}-XX`]);assert.equal(copy.language,language);assert.match(copy.info,/\[E\]/);assert.match(copy.jump,/\[SPACE\]/);
 }
 assert.equal(entranceCopy(['xx','fr-FR','en']).language,'fr');assert.equal(entranceCopy(['xx']).language,'en');
});
