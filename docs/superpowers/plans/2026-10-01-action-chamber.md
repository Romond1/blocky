# Action Chamber implementation plan

**Goal:** Build Room 7 from the existing volcanic and cooperation systems.

**Architecture:** A horizontal ferry subclasses the elevator support contract; ActionChamber extends the shared transport interface. A room builder uses volcanic-kit and cave-shell. Game, team, navigation and collectibles register the new room.

**Tech Stack:** TypeScript, Three.js, Vite, Node test runner, Playwright.

- [x] Add failing tests in tests/action-chamber.test.ts for ferry cargo and passenger displacement, ignored moving inputs, locked rewards, matching and reset. Run `node --experimental-strip-types --test tests/action-chamber.test.ts`.
- [x] Implement src/lava-ferry.ts and src/action-chamber.ts; register actionPuzzle and Game hooks. Re-run targeted tests.
- [x] Build src/action-chamber-view.ts using volcanicBuilder, buildCaveShell and buildPuzzleCircuit. Add pictograms, pedestals and ferry guards.
- [x] Register Room 7 in main.ts, team.ts and collectible-data.ts. Preserve team exit and contextual NPC restrictions.
- [x] Run `npm test` and `npm run build`; inspect browser Room 7, movement, unlocks and ferry choreography. Record results in docs/room7-report.md.

