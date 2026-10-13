# Cooperation Chamber Implementation Plan

**Goal:** Build the approved continuous Room 4 and preserve Rooms 1–3.
**Architecture:** Add a chamber rules module and renderer; extend shared plate, placement and team systems. Reuse the existing Bridge and volcanic environment kit.
**Tech stack:** TypeScript, Three.js, Vite, Node tests, Playwright. Execute inline in this workspace; Git is unavailable.

- [x] Add failing tests in tests/cooperation.test.ts for Room 4 registration, light color definitions and physical hero plate holds across Tab.
  Run `node --experimental-strip-types --test tests/cooperation.test.ts` and confirm missing behavior.
- [x] Extend src/puzzles.ts plate categories; create src/pressure-plates.ts presence filtering and src/cooperation.ts for gate, section state and transformed Bridge ground/recovery surfaces. Keep physical state separate from rendering.
- [x] Integrate device occupancy before AI movement in src/team.ts. Persist device holds across select; use navigable callbacks for chamber gates/surfaces. Test both role orders, release and ordinary roaming.
- [x] Extend src/game.ts and add src/block-stacking.ts for block elevation, support and forgiving placement. Test incorrect spatial relationships, support removal, carry ownership and reset. Reuse heavy interactions and Bridge cycle.
- [x] Create src/cooperation-chamber.ts using existing palette, shell, basaltFloor, bridgeRunes, textMaterial and buildPuzzleCircuit. Extend circuit colors by activator and build shared labeled color materials.
- [x] Register Room 4, Room 3 transition, labels and diagnostics in src/main.ts. Render block height and success feedback without changing existing rooms.
- [x] Run `npm test` and `npm run build`. Add tests/cooperation-playthrough.mjs for real E/Tab/WASD route, safe recovery, stacking, both-hero exit and reset. Inspect rendered screenshots and run existing Room 3 and Rooms 1/2 browser routes.
- [x] Save docs/room4-report.md with implementation, verified routes and limitations; update plan checkboxes.
