import type { HeroId } from './companions/companion.ts';
export const HERO_ABILITIES = {
 yuki: { speedMultiplier: 1.0, strength: 2, ability: 'SUPER STRONG' },
 mia: { speedMultiplier: 2.0, strength: 1, ability: 'SUPER FAST' },
};
export const HERO_SWITCH_DURATION = 0.45;
export function canHeroInteract(hero: HeroId, object: {requiredStrength?: number}) {
 return HERO_ABILITIES[hero].strength >= (object.requiredStrength ?? 1);
}
