# Kage Memory Enclave Implementation Plan

**Goal:** Improve Room 4's start, add a temporary full testing reset, and add Room 3's first optional memory puzzle.

**Architecture:** Separate authored enclave layout and simulation from its Three.js view. Integrate optional blocks/plate using existing interactions; extend collectible types and persistent IDs without changing main puzzle solutions.

**Tech Stack:** TypeScript, Three.js, Vite, Node tests, Playwright.

- [x] Add failing tests for secret navigation, independent WOLF-only plate/gate, shared persisted crystal and Room 4 spawn.
- [x] Implement src/kage-alcove.ts, optional RoomLayout walk areas, Game and Team integration. Keep main door conduits limited to main puzzle slots.
- [x] Build src/kage-alcove-view.ts with supplied local pictures copied into public/memories/kage, dark bent hallway, stone hatch and blue/gold walls; carve the JUMP wall opening in power-chamber.ts.
- [x] Extend collectible-data.ts, collectibles.ts, collectible-view.ts, economy.ts and collectible-ui.ts for one gated blue crystal and a hidden-at-zero count without a denominator.
- [x] Add src/testing-controls.ts flag and Reset ALL / TEST button in main.ts, resetting all progression and entering Room 1; fix camera bounds for the optional hallway.
- [x] Run full unit tests/build, complete both-hero keyboard secret puzzle tests, inspect screenshots and verify current Room 3/4 routes and full reset.

Execute inline in the shared workspace; this directory has no Git checkout.
