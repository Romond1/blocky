import type {Game} from './game.ts';

export const isHeroSwitchKey=(code:string)=>code==='KeyQ'||code==='Tab';
/** Contextual suggestions only: buttons remain usable even without a hint. */
export function actionCues(game:Game,extraAction=false){
 const nearest=game.nearest,carried=game.carried,t=game.training;
 const introductory=game.puzzle.id==='hero'||game.puzzle.id==='memory'||game.puzzle.id==='power';
 const other=game.controlledHero==='mia'?'yuki':'mia';
 const firstSwap=!!t&&(t.requiresHeavy?!t.setupComplete:t.setupComplete&&!t.has('HERO_SWITCHED'));
 const needsStrength=introductory&&game.controlledHero==='mia'&&!carried&&(nearest?.weightClass==='heavy'||game.action?.kind==='HEAVY_STRUGGLE'||(t?.failureNotice??0)>0);
 const waitingAtGap=game.split&&game.motion[game.controlledHero].crossed&&!game.motion[other].crossed;
 return {switchSuggested:!game.escaped&&!game.solved&&!!(firstSwap||needsStrength||waitingAtGap),
  actionAvailable:!!nearest||!!carried||extraAction,
  actionLabel:carried?'Place':nearest?'Pick up':'Action'};
}
