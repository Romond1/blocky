# Room 1 free-play revision — 2026-09-29

## Requested changes delivered

- HEAVY is now 1.65 units, matching the existing word blocks in Rooms 2–3. Its material matches those blocks and the extra oversized reinforcement bands were removed. Letters retain the Room 2 small-block size of 0.95 units.
- Room 1 floor area increased exactly 40% by scaling both floor dimensions by sqrt(1.4). The shell, lava boundaries, floor, gate/tunnel and collision bounds follow the enlarged layout.
- Two equal-sized plates are centered at X=-3.2 and X=3.2, both Z=-6.8, symmetrically beside the exit. Left sign: H, blank, R, O. Right sign: HEAVY only.
- A/E/X shuffle among three safe scattered floor locations whenever Room 1 starts or resets. HEAVY retains a clear accessible starting location.
- Normal launch starts immediately as Mia. The switch button and Tab are available immediately. The original picker remains accessible with `?choose=1`; `?hero=yuki` supports a direct Yuki start.
- Removed every tutorial prerequisite from heavy interactions. Mia can struggle with HEAVY immediately. Yuki can lift it immediately without a prior Mia attempt, speed demonstration, camera movement or HERO completion.
- Either plate can be completed first. Any block can be placed on either plate; incorrect placements simply do not activate it. Correct blocks can also be picked up and rearranged. The gate follows the current plate contents instead of permanently latching tutorial achievements.
- Brief movement/look tips are optional and expire. Interaction prompts take priority; afterward the panel shows the two-objective mission. Tutorial events observe gameplay and never authorize it.

## Files

Gameplay and visuals: `src/blocks.ts`, `src/puzzles.ts`, `src/game.ts`, `src/training.ts`, `src/training-ui.ts`, `src/main.ts`, `src/room.ts`.
Tests: new `tests/free-room.test.ts`; updated `tests/training.test.ts`, `tests/training-playthrough.mjs`, `tests/puzzle.test.ts`, `tests/team.test.ts`, `tests/hero-switch.test.ts`, `tests/team-browser.mjs`, `tests/hero-switch-browser.mjs`, `tests/hero-picker.mjs`.
Documentation/build: `README.md`, `progress.md`, this report and regenerated `dist/`.

## Verification

- 47/47 simulation tests passed; production build passed.
- Browser playthrough passed as Mia and Yuki: immediate HEAVY interaction, heavy-first solving without lessons, wrong-plate placement and retrieval, wrong-letter recovery, correct-block removal/replacement, live door response and team exit.
- Switching suite (both heroes / all three rooms), companion/team suite and optional picker suite passed.
- Rooms 2–3 complete browser puzzle playthroughs passed.
- Develop-web-game Playwright smoke passed; screenshots reviewed for sizes, symmetrical layout and contextual guidance.
- No browser errors in completed tests. Existing Vite bundle-size advisory remains.

## Notes

Randomization uses three spaced, validated spawn locations rather than arbitrary wall-adjacent coordinates. Rooms 2–3 were not redesigned and retain their previous block handling. Both heroes are still required for exit, and Mia still cannot carry a heavy block.

This report supersedes the mandatory tutorial order and latched-plate behavior in the previous Training Chamber report.
