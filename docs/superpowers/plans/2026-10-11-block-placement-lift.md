# Block placement and Room 10 lift implementation plan

**Goal:** Predictable game-wide block placement and an accessible Room 10 elevator.
**Architecture:** Shared placement candidates and visible-footprint stacking; Room 10 composes configurable Elevator dimensions with its own boarding state.
**Tech stack:** TypeScript, Three.js, Node tests, Playwright.

- [x] Add regressions in tests/block-placement.test.ts for side placement, size ordering, wall rejection and adjacent jumps. Run them before implementation.
- [x] Update src/block-stacking.ts aim containment and size ordering; introduce src/block-placement.ts candidates; use them in Game, Dragon, Finale, LiftTransport and ActionChamber drops. Keep physical sweeps and explicit transport boundary checks.
- [x] Add Room 10 boarding tests. Configure Elevator half-width per instance, share lift world dimensions through dragon-layout.ts, resize render/physics together and stage wider blocks away from the cabin. Add lower control and persistent boarding state.
- [x] Update English/Japanese goal guidance. Run all Node tests and production build; inspect failures before changing further code.
- [x] Exercise actual desktop/touch placement, adjacent jumps, lower pad boarding and Heart transport in a browser fixture. Run the develop-web-game client and inspect screenshots. Recheck existing Room 10 and affected prior-room routes.
- [x] Update progress.md and reports with verified results and limits. No Git repository is present.
