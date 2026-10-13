# Room 1 — Training Chamber report

Implemented 2026-09-28 from the approved two-pressure-plate brief. The large block reads **HEAVY**.

## Room layout and objectives

The existing volcanic shell, floor dimensions, exit and character models are retained. Room 1 now has two distinct block-operated floor plates:

- Small cyan HERO plate at (-2.7, -2), with the H _ R O clue above it. Both heroes can place the small E block here. A and X remain removable wrong answers.
- Large amber heavy plate at (2.7, -5.8). The reinforced 1.9-unit HEAVY block starts at (3, -0.7), noticeably larger than the 0.95-unit letters.

Solving HERO completes the cyan lock and lights the strength area and floor guide. It does not open the exit. Placing a valid heavy block completes the amber lock. Plates depress, energy channels brighten and both lock indicators light. Only both objectives together open the gate. Team exit still depends on both physical heroes reaching the doorway.

## Tutorial state and UI

`TrainingTutorial` is a Room 1-only, renderer-independent event/state class. It records completed events once, accumulates actual movement and camera rotation, and derives the current lesson. Earlier valid actions remain credited, so unexpected action order does not lose progress.

The flow is movement (1.4 units), mouse look (0.38 radians accumulated), light-block interaction, HERO, a post-HERO switch, Mia movement (4 units), heavy struggle, switch to Yuki, heavy lift, heavy plate and team exit. Starting as Mia may require switching to Yuki and back to Mia; it uses the same normal switch mechanic.

The DOM shows one current instruction at the lower left. Movement keys highlight while pressed; look uses an animated mouse with drag instructions. Lessons transition with a short fade. The full control bar stays hidden in Room 1. The controlled hero's name stays visible; ability text and the visible switch button appear when switching is introduced. Contextual prompts recover from carried decoys and blocks held by the companion. The exit prompt becomes WAIT FOR the companion if necessary. Reduced-motion preferences disable nonessential tutorial animation.

All requested tutorial events are represented, including movement, look, pickup/place, word completion, switching, speed discovery, Mia interaction/drop, Yuki pickup, plate activation, unlock and team exit. Reset creates a fresh tutorial instance.

## Block weight and ability rules

`src/blocks.ts` defines explicit size, weightClass, requiredStrength and optional requiredAbility. Letters are light/strength 1; HEAVY is heavy/strength 2. The existing centralized hero strengths determine normal heavy carrying. Text length does not determine weight. The heavy plate checks weight class rather than the printed answer, and tests confirm a renamed heavy block still activates it.

This Room 1 change preserves existing Rooms 2–3 block handling and puzzle content. Their legacy blocks receive explicit light defaults. Retrofitting their large word blocks with strength requirements is outside this room redesign.

## Mia struggle and Yuki carry

Mia enters HEAVY_STRUGGLE rather than normal carry. Her arms reach forward, her knees bend, her torso leans, and the block rises about 0.2 units and wobbles. Movement input remains accepted: it produces a small attempted step and triggers a quick drop. E can also release it, and an idle 2.8-second timeout prevents indefinite holding. Landing adds a subtle camera impact and a HEAVY_THUD diagnostic hook. The full TOO HEAVY / Yuki lesson appears only on the first failure.

Yuki uses a 0.45-second crouch/lift into a two-arm carry pose. Carrying retains his normal walking speed. E drops safely or places near the matching plate. Room 1 asks the child to try Mia first; it does not misrepresent Yuki as too weak. Until HERO and Mia's speed lesson are complete, early heavy interaction gives a short relevant prompt.

Switching cancels unfinished lift/struggle actions safely at the block's floor origin. Switching away while already carrying preserves the block with that hero and uses the existing stationary HOLDING_OBJECT companion behavior. A later switch restores control of the carried block.

## Companion and reset behavior

The companion never writes puzzle state. Both plates are excluded by navigation footprints, floor blocks remain navigation obstacles, and Room 1 inspection points were moved away from the new plates. Existing exploration and team exit remain active.

Reset restores all four blocks, both plates, HERO letters, both gate locks, door travel, tutorial events/distances, first-failure notice, action/impact state, switch-tutorial counters, both hero positions and companion ownership/state. Reset was tested during struggle, dropping and lifting.

## Files changed

New files:
- `src/blocks.ts`: explicit block definitions and plate compatibility.
- `src/training.ts`: tutorial event/state progression.
- `src/training-ui.ts`: staged DOM prompts and input highlighting.
- `tests/training.test.ts`: simulation and edge-case coverage.
- `tests/training-playthrough.mjs`: full browser routes for both starting heroes.
- `docs/superpowers/plans/2026-09-28-training-chamber.md` and this report.

Updated files:
- `src/puzzles.ts`: Room 1 plate/block definitions and optional typed metadata.
- `src/game.ts`: separate Room 1 objectives, explicit block state, heavy actions, capability checks, reset and event integration.
- `src/team.ts`: action cancellation on switch, tutorial events, plate navigation exclusions and reset.
- `src/companions/companion.ts`: Room 1 interest points compatible with the plates.
- `src/room.ts`: two plate surfaces, clue relocation, light activation, channels and gate indicators.
- `src/main.ts`: explicit-size block visuals, lift/drop rendering, plate feedback, tutorial UI integration and debug state.
- `src/characters/BlockHero.ts`: heavy carry, lift and struggle poses.
- `src/style.css`: sparse staged tutorial UI and responsive/reduced-motion rules.
- `tests/puzzle.test.ts`: new first-plate completion and four-block reset expectations.
- `tests/playthrough.mjs`: routes the Room 1 browser entrypoint to the new tutorial playthrough.
- `tests/team-browser.mjs`, `tests/hero-switch-browser.mjs`: adapt Room 1 assertions to staged UI and two-plate progress.
- `package.json`: adds `test:training`.
- `README.md`, `progress.md`: updated controls, room flow, architecture and verification notes.
- `dist/`: regenerated production build.

## Tests performed

- `npm test`: 44/44 passed.
- `npm run build`: passed.
- Full Room 1 browser playthrough independently starting as Yuki and Mia, using actual keyboard and mouse events. Includes early repeated Tab/reset, early HEAVY attempt, A as wrong answer, recovery to E, switching while holding E, post-HERO switch, Mia speed, visible struggle, movement-triggered drop, Yuki lift, switching with HEAVY, placement and team transition to Room 2.
- Simulation edge cases: wrong plate, repeated E, timeout, repeated Mia attempts without repeated full tutorial, switching during struggle/lift, reset during each action, arbitrary heavy block text, light letters/numbers/symbols, out-of-order facts, stationary carriers and single-event delivery.
- Existing switching browser suite across both heroes and all three rooms; companion/team browser suite; splash picker and mobile picker checks: passed.
- Full Rooms 2 and 3 keyboard playthroughs as Yuki and Mia: passed with their existing puzzles, collisions, recovery, exits and reset.
- Develop-web-game Playwright smoke passed; screenshots and text state inspected. Full tutorial screenshots are in `output/training/`, with final pass summary in `output/training/result.json`.
- No browser errors in completed playthroughs. A test helper was corrected to recognize a successful room transition during its final movement assertion.

## Known limitations

- Plates latch completed objectives and keep their correct blocks locked in place; this is a tutorial progression puzzle, not a continuous mass/physics simulation.
- Heavy lifting is procedural animation over safe simulation positions. There is no rigid-body stacking or new sound asset; HEAVY_THUD is a future sound hook.
- Rooms 2–3 keep their previous block weights/handling, as noted above; they have not been converted into strength challenges.
- The existing Vite bundle-size warning remains. No new room, combat, hero, dialogue or ability was added.

Ready for user testing. Stop before further room work.
