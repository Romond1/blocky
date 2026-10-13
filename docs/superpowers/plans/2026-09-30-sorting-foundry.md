# Sorting Foundry Implementation Plan

> Execute inline in the authorized workspace using executing-plans. This workspace has no Git repository; commits and worktrees are unavailable.

**Goal:** Build the approved Room 6 using familiar machines and ordered color/fruit pairs.

**Architecture:** Extract Room 5's lift transport and cabin renderer, keeping its defaults. Add a room-specific foundry coordinator and geometry; integrate with Game, HeroTeam and the existing main loop.

**Tech Stack:** TypeScript, Three.js, Vite, node:test, Playwright.

- [x] Add failing `tests/sorting-foundry.test.ts` for room registration, ordered removable pairs, decoys, heavy activation, safe crossing, lift passengers/cargo, holds, reset and exit. Run `node --experimental-strip-types --test tests/sorting-foundry.test.ts` and confirm missing Room 6 behavior.
- [x] Extract `src/lift-transport.ts` from FruitLift and `src/lift-view.ts` from its room renderer. Keep `Elevator` unchanged. Run existing fruit tests after extraction.
- [x] Add `src/sorting-foundry.ts`, the Room 6 puzzle/layout in `src/puzzles.ts`, and Game/Team hooks. Pairs are RED/APPLE, GREEN/PEAR, YELLOW/BANANA, with six independently removable sockets. Reuse Bridge and Elevator. Run the new tests plus `npm test`.
- [x] Add `src/sorting-foundry-chamber.ts` using volcanicBuilder, buildMovingBridge, shared lift view, fruitPicture and buildPuzzleCircuit. Extend the circuit helper to optionally use smaller paired pads and a coarse segment length for the large room.
- [x] Register replay/transition/render/state hooks in `src/main.ts`. Add `src/camera-distance.ts` and wheel input with bounded exponential smoothing. Test default, limits and reset; run `npm run build`.
- [x] Add `tests/sorting-foundry-playthrough.mjs` using real keyboard controls and deterministic stepping. Run the full Room 6 route, chaos checks and screenshot inspection; run existing Room 3–5 browser regressions and the web-game skill client.
- [x] Update README, progress and `docs/room6-report.md` with actual validation and remaining practical limits.

Commands use existing npm/Node installations. Verification must assert physical team reunion, not merely the solved flag. All requested chaos cases must be covered or explicitly reported as unverified.
