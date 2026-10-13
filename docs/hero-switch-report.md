# Instant hero switching and ability foundation

Implemented 2026-09-28. Rooms 1–3 and their puzzle definitions are unchanged.

## Files changed

- `src/heroes.ts` (new): centralized abilities, capability helper and switch duration.
- `src/team.ts`: atomic ownership handoff, position locks, switching events and tutorial state.
- `src/companions/companion.ts`: stationary hold states, navigation cancellation and safe resumption.
- `src/game.ts`: data-driven player speed multiplier.
- `src/main.ts`: initial-only picker, shared Tab/button action, camera transfer, input gating, HUD and debug output.
- `src/characters/BlockHero.ts`: velocity-driven run lean and arm motion.
- `src/style.css`: compact hero identity card and cyan switching pulse.
- `tests/hero-switch.test.ts` (new): speed, carrying, holds, all requested AI handoff states, ownership stress, tutorial events, capability configuration and team exits.
- `tests/hero-switch-browser.mjs` (new): six room/start combinations, camera, focus, rapid switching, speed and carrying.
- `tests/team-browser.mjs`: replace obsolete menu-switch assertions with instant switching; retain exploration, reset and solved-puzzle checks.
- `tests/hero-picker.mjs`: align test URL with the project port, 5188.
- `tests/playthrough.mjs`, `tests/memory-playthrough.mjs`, `tests/power-playthrough.mjs`: derive movement timing from the controlled hero's speed.
- `progress.md` and this report.
- `dist/`: regenerated production build.

## Switching architecture and controller ownership

Both existing actor objects and both rendered hero instances remain alive. The splash picker chooses the initial hero only. Tab and the visible Switch hero button both call `switchHero()`, which calls `HeroTeam.select()`.

The transfer synchronously saves facing, rebinds `game.player` to the incoming actor, restores its facing and identity, and rebinds the single companion controller to the outgoing actor. Companion reset clears navigation, targets, timers and speed. No hero is recreated or repositioned. The existing Game update is the player controller; a separate PlayerController class was unnecessary. `ownershipValid` checks the actor identities and both controller bindings. Debug displays one player owner and one companion owner.

Repeated Tab keydown events are ignored. Each distinct press can switch immediately, including during an existing transfer. There is no cooldown; a new transfer starts at the camera's currently rendered position. Gameplay Tab prevents browser focus movement and returns focus to the canvas.

## Camera and responsiveness

Camera position and look target use smoothstep interpolation over 0.45 seconds. Player movement and E interactions are suppressed during this interval; inputs and mouse dragging are cleared at handoff. The outgoing NPC also holds its exact pose during the handoff, then resumes ordinary autonomous behavior. Room resets and transitions cancel the blend.

## Abilities and animation

Edit `HERO_ABILITIES.mia.speedMultiplier` in `src/heroes.ts` to try 1.75, 2.0, 2.25 or 2.5. Default is exactly 2.0. Yuki retains 3.5 world units/second; Mia uses 7.0. Companion movement rates are unchanged.

Animation receives measured player velocity. Leg phase already scales with distance traveled, so it runs twice as fast at Mia's full speed. Added speed-dependent torso lean and arm swing make running more legible.

Yuki strength is 2; Mia strength is 1. `canHeroInteract(heroId, {requiredStrength})` compares centralized strength with a default requirement of 1. It is deliberately not applied to existing blocks or puzzles.

## Companion handoff, holds and carried objects

`holdPosition(heroId)` records an explicit lock; `releasePosition(heroId)` releases it. Locks survive switching and are cleared by reset/room entry. They take priority over exploration, crowd avoidance, following, recovery and exit navigation. A future pressure plate can call this API; no plate was added.

Without a lock or carried block, the outgoing hero resumes autonomous decisions after the brief handoff. The new player has no residual AI route.

Preferred carrying behavior is implemented: blocks remain attached to their original hero. An NPC carrying a block enters `HOLDING_OBJECT` and retains exact position and orientation, even if the gate opens. Switching back restores access to that block. Both heroes may hold separate blocks. The exit still requires both heroes' actual positions.

## UI, tutorial and debugging

The compact HUD shows hero name, SUPER FAST / SUPER STRONG, and [TAB] SWITCH HERO, with a subtle cyan pulse during transfer. The debug panel includes hero roles, Mia's multiplier, Yuki's strength, companion state, switch availability and ownership validity.

`requestSwitchTutorial()` requests the future tutorial prompt. `onHeroSwitched(listener)` emits `{type: 'HERO_SWITCHED', from, to}`; the returned callback unsubscribes. Tutorial state tracks `hasSwitched`, `switchCount` and `promptRequested`; a successful switch clears the prompt. Initial selection does not count as switching. Counts persist for the page session. No room triggers the tutorial yet.

## Verification

- Regression tests first reproduced missing 2x speed and the moving-carrier bug, then passed after implementation.
- `npm test`: 32/32 passed.
- `npm run build`: passed; existing Vite warning about a bundle larger than 500 kB remains.
- New browser suite: both splash choices across all three rooms; exact actor/block preservation; camera start/midpoint/completion; movement suppression; no splash reopening; canvas focus; button parity; 20 rapid switches per configuration; measured 2x displacement; six-second carrier hold. No browser errors.
- Updated team browser suite and initial picker/mobile suite passed.
- Full keyboard puzzle playthroughs for Rooms 1, 2 and 3 passed separately as Yuki and Mia, including wrong-answer recovery, correct answers, collisions, gate/team exit, reset and camera checks. No browser errors.
- Develop-web-game Playwright client smoke passed; gameplay screenshots and state reviewed. Artifacts: `output/hero-switch/`, `output/team/`, and existing room playthrough directories.

## Known limitations

- Position locks are an API foundation; there is no child-facing stay/follow command or automatic meaningful-position detection yet.
- A stationary NPC carrying an unused block must be controlled again and moved or have its block dropped to reach an exit.
- Camera destination retains existing collision correction; the short interpolated path does not route around pillars and may briefly cross intervening scenery.
- Strength is data only. No strength puzzles, new rooms, room redesigns or additional heroes were implemented.

Ready for user testing. Stop here before room redesign work.
