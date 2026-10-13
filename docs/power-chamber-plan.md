# Room 3 — final training chamber

Build the attached brief within the existing game. Latest user direction: Rooms 1–3 are training; stop after training completion. No Room 4.

Reuse player, camera, block meshes/text, pickup/drop/swaps, door animation, feedback and transition cleanup. Add only optional stage definitions, obstacle footprints, blocked interaction/drop paths and camera obstruction handling. Reuse the Memory Vault shell at larger dimensions, shared pedestals, and its existing door. Add deliberate interior pillars, low walls and an alcove/platform.

Room 2 floor bounds: 23.6 × 31.6 = 745.76 square units. Room 3: 34 × 46 = 1564; interior structures occupy 93.6, leaving 1470.4 before pedestal footprints — about 1.97× Room 2.

Powers: two labeled slots (Mia/FAST, Yuki/STRONG), with per-slot correctness. Both must be correct simultaneously. Completion freezes those two blocks, activates Lock 1 and reveals the episode station while exit remains shut. Episode stage accepts 1; wrong numbers remain retrievable. Both completed stages activate Lock 2 and unlock exit; crossing it shows training complete.

All ten blocks use the same system and 1.65-unit size. Deliberate positions and obstacle footprints live in src/puzzles.ts. FAST is beyond southwest pillar; STRONG is in east gallery; 1 is around central-west pillar. Remaining choices occupy entrance/wall/alcove/platform areas.

Verify state gates and reset, every solid footprint and block spawn, reachability around obstacles, no pickup through walls, Room 1/2 regressions and both room transitions. Browser walkthrough must use actual keyboard pickup/drop and inspect screenshots for correct/incorrect per-slot colors, hidden/revealed panel, two door locks and final completion.
