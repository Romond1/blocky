# Phase 1 Collectibles Implementation Plan

**Goal:** Add optional coins and exit shards to all six rooms with durable shared progression.

**Architecture:** Separate content registry, economy state, pickup rules, Three.js view and HUD. Keep Game and HeroTeam puzzle/exit logic unchanged.

**Tech Stack:** TypeScript, Three.js, Vite, Node test runner, Playwright.

- [x] Add tests in tests/economy.test.ts for idempotence, persistence, invalid saves, shared wallet, spending and reset. Run `node --experimental-strip-types --test tests/economy.test.ts` to establish failure.
- [x] Implement src/economy.ts with injectable storage, version 1 save, safe integer validation, stable ID ownership, room progress and spending API; run economy tests.
- [x] Add src/collectible-data.ts with six room definitions and 43 coins plus six shards; add tests for IDs/counts and pickup gating/height in tests/collectibles.test.ts.
- [x] Implement src/collectibles.ts proximity logic and src/collectible-view.ts shared geometry, spinning tokens, golden irregular shards and brief effects.
- [x] Implement src/collectible-ui.ts and CSS for compact counters, coin pulse, shard toast and debug reset; integrate lifecycle, controlled player collection and event hooks in src/main.ts.
- [x] Run `npm test` and `npm run build`. Exercise all rooms in browser, reset, refresh, hero switch, exit collection and unchanged progression. Inspect screenshots and record results in docs/collectibles-report.md.

Workspace has no Git repository; commits and Git worktrees do not apply. Execute inline in this authorized workspace.
