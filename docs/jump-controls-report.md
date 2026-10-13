# Jump lunge and movement input

Implemented October 1, 2026.

Space alone launches either hero 1.5 world units along their current facing over 0.3 seconds. Jump height/gravity remain unchanged. Horizontal lunge movement uses existing collision checks and short substeps. Movement input takes over steering and cancels the automatic lunge for that jump, so releasing W does not resume automatic forward drift or stack extra speed on a running jump. Reset and hero switching cancel the lunge. The companion does not inherit it.

The stuck-input regression reproduced movement restarting from a repeated W keydown after focus loss and release. `main.ts` now rejects repeated keydowns before mutating the held-key set. Losing canvas focus also clears held input and dragging, in addition to the existing window blur and visibility handlers.

Validation:

- `npm test`: 172 tests pass. New cases cover both heroes, lunge distance/direction, collisions, frame-rate independence, steering/release, reset/switch cancellation and the existing safe ditch crossing/retry.
- `npm run build`: TypeScript and production build pass.
- `node tests/jump-input-browser.mjs`: both heroes jump/lunge with Space alone; W+Space release in either order stops movement; stale repeats do not restore released keys; canvas focus loss stops movement. Screenshots saved in `output/jump-controls/`.
- `node tests/entrance-playthrough.mjs`: English/Japanese/French prompts and real forward/sideways steering with W+Space pass for both heroes.
- `node tests/power-playthrough.mjs`: complete Room 3 keyboard playthrough passes.
- `node tests/cooperation-playthrough.mjs`: complete Room 4 keyboard playthrough passes.

Existing tests that expected an in-place second jump were updated to exercise the requested forward lunge. Gate clearance remains checked while the hero occupies the gate, and the test also verifies the lunge clears it safely. Puzzle/room geometry was not changed.

The user also requested removal of mandatory design approval from `C:/Users/user/.agents/skills/superpowers/brainstorming/SKILL.md`. Its hard gate, section/spec approval requirements and approval flowchart were replaced with design explanation, optional feedback and continued execution within authorized scope. Material clarification and genuinely necessary authorization remain distinct from design approval.
