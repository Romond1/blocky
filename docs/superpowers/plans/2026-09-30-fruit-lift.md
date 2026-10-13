# Fruit Lift Implementation Plan

> For agentic workers: execute the approved design task by task in this session.

**Goal:** Build Room 5 with cooperative vertical transport and fruit-picture matching.
**Architecture:** Keep lift mechanics and fruit rules in simulation modules; adapt Game/Team to floor height; reuse the volcanic render kit and puzzle circuit.
**Tech Stack:** Existing TypeScript, Three.js, Vite, Node tests, Playwright.

### 1. Elevator simulation
- [x] Add `tests/fruit-lift.test.ts` covering idle edge toggles, ignored moving triggers, passenger/cargo displacement and reset. Run `node --experimental-strip-types --test tests/fruit-lift.test.ts` and observe missing-module failure.
- [x] Create `src/elevator.ts` with endpoint height 5, speed 1.25, captured grounded passengers/cargo, off/on occupancy history and pause-underneath safety. Assert repeated occupied calls do not reverse motion.

### 2. Room data and integration
- [x] Add explicit light fruit data and lower/upper spawn elevations in `src/puzzles.ts`. Add optional plate height and HOLD/TOGGLE mode, defaulting existing mechanisms to HOLD.
- [x] Create `src/fruit-lift.ts` for floor regions, safe navigation, elevator controls, individual matches and reset. Extend `src/game.ts`, `src/team.ts`, `src/companions/companion.ts` for vertical interaction, passenger parking/riding, height-aware exit and autonomous level restrictions.
- [x] Test both rider identities, multiple objects, wrong matches and retained correct matches, inaccessible upper blocks, reset during travel and no upstairs exit.

### 3. Shared art and Room 5 view
- [x] Extract floor, stairs and mesh helpers into `src/volcanic-kit.ts`, use these in Room 4 and Room 5. Create `src/fruit-lift-chamber.ts` and `src/fruit-pictures.ts` for broad atrium, visible balcony, lift, shaft guards, purple circuits and word-free picture targets.
- [x] Register Room 5 and Room 4 transition in `src/main.ts`, with lift diagnostics and a less downward entrance camera. Preserve existing controls and sparse HUD.

### 4. Verify and report
- [x] Run `npm test` and `npm run build`; fix regressions.
- [x] Add `tests/fruit-lift-playthrough.mjs` using actual keyboard movement, pickups, Tab and plate steps. Complete both upper transports, three matches, teammate retrieval and exit; test reverse rider and moving reset.
- [x] Run Room 4 browser regression, inspect entrance/upper/cargo/fruit-wall/stair screenshots, update README and `docs/room5-report.md`. No Git commits: workspace is not a Git repository.
