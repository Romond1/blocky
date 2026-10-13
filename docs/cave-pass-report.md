# Cave revision — 2026-09-28

Replaced the outer masonry shell in Rooms 1–3 with deterministic overlapping, tilted block-rock strata, overhead crust and hanging crags. The Memory Vault shell supplies the Power Chamber exterior too. Existing puzzle structures and walking surfaces remain.

Removed regular exterior columns, metal lamp collars, wall courses and ceiling beams. Lava now descends through uneven fissures from high rock to widened pools connected to the edge channels. Retained the procedural molten shading; increased its vertical advection to visibly flow downward.

Changed: src/cave-shell.ts (new), src/room.ts, src/memory-vault.ts, src/world-materials.ts. Rebuilt dist. No texture assets, additional lights, or postprocessing. Two instanced environmental batches per shell; no shadow casting on the new geology. Actual device FPS has not been benchmarked.

Validation: production build passed; all 10 unit tests passed; all three existing full browser playthroughs passed sequentially at 960x640 without forcing software rendering. No console errors. Coverage includes wrong answers, swaps, stage gates, collisions, door opening, transitions, reset and camera. Final all-room screenshot smoke also passed. Evidence: output/cave-pass and the updated output/playthrough, output/memory, output/power results. Browser runs are closed.

No changes to game.ts, puzzles.ts, player-model.ts or camera/control code in this cave revision. Further art polish awaits user review.
