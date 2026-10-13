import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TrainingTutorial} from '../src/training.ts';
test('onboarding waits for real actions rather than elapsed time, then docks after a brief mission',()=>{const t=new TrainingTutorial(false);t.tick(60);assert.equal(t.step,'move');assert.equal(t.docked,false);t.move(.01,'mia');assert.equal(t.step,'look');t.tick(60);assert.equal(t.step,'look');t.look(0);assert.equal(t.step,'look');t.look(.01);assert.equal(t.step,'mission');t.tick(2.7);assert.equal(t.docked,false);t.tick(.11);assert.equal(t.docked,true);t.heroOnPlate=true;assert.equal(t.step,'exit');t.heroOnPlate=false;assert.equal(t.docked,true);assert.equal(new TrainingTutorial(false).docked,false);});
