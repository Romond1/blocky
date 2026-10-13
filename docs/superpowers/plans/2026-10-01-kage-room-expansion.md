# Kage Secret Room Expansion Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement and review this plan.

**Goal:** Relocate and enlarge Kage's optional room with cave walls, an open entrance, larger pictures and a visible crystal behind bars.

**Architecture:** Keep collision and puzzle state in kage-alcove.ts and adapt the Three.js scene to the same coordinates. Reuse WorldMaterials from the parent chamber. Keep crystal rendering independent of its pickup authorization.

**Tech Stack:** TypeScript, Three.js, Vite, Node test runner, existing Playwright playthrough.

---

### Task 1: Regression coverage and route

- [x] Update tests/kage-alcove.test.ts with the new left passage and gallery, permanently open entrance, safe spawns and locked reward behavior.
- [x] Use createCollectibleView with a THREE.Group to assert the uncollected crystal is visible while collectNearby rejects pickup before solving.
- [x] Run `node --experimental-strip-types --test tests/kage-alcove.test.ts`; confirm failures against the old layout and crystal visibility.
- [x] Update tests/kage-alcove-browser.mjs to walk from the stable bridge across the left bank, through (-17, -13.3), then right into the gallery. Exercise FOX rejection, WOLF success and collection at (-12, -26).

### Task 2: World and simulation

- [x] In src/kage-alcove.ts define the specified areas, walls, plate, gate and reward position. Remove entranceLift and the entrance branch in canPass; derive gate collision width from KAGE_GATE.halfWidth.
- [x] In src/puzzles.ts move the three animal block positions into the gallery. In src/collectible-data.ts reuse the new reward position and keep its ID.
- [x] In src/power-chamber.ts carve the left rear-wall opening, close the right opening and exclude decorative rocks from the portal.
- [x] In src/kage-alcove-view.ts reuse the parent WorldMaterials, build basalt floors/rock walls and an open stone doorway, replace the opaque gate with a group of iron bars, and increase picture width from 1.48 to 3.4 units.
- [x] In src/collectible-view.ts render the memory crystal whenever it has not been collected, retaining collectibleAvailable for pickup. In src/main.ts apply only optional-area camera bounds while inside the room.
- [x] Inspect src/team.ts navigation for the relocated optional areas and adjust only obstructions that prevent following through the entrance or reward gate.

### Task 3: Verification and review

- [x] Run `npm test` and `npm run build`; require zero failures and a successful build.
- [x] Run `npm run test:kage` against port 5188; require a completed keyboard playthrough with no browser errors.
- [x] Inspect screenshots of the entrance, expanded room, closed gate with crystal visible and collected crystal.
- [x] Review requirement coverage and collision/render alignment. Save verification results in docs/kage-room-expansion-report.md. No Git commit step applies because this workspace is not a repository.

