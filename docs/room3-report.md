# Room 3 — The Split Chamber

The old Power Chamber is replaced by the approved cooperative room. Play at http://127.0.0.1:5188/?room=3.

The south hallway teaches Space with a safe gap: walkers stop at the edge, each hero must perform their own jump, and Tab transfers control without moving the waiting hero. The large floor schematic sits immediately beyond the hallway. It shows the near heavy plate, far letter plate, four slabs, northwest exit, and connections to both locks. Amber changes to cyan and check marks as the room powers up.

Yuki places STRONG (heavy; FAST is a removable decoy). Four slabs extend together for 2.55 seconds per 5.5-second cycle. Mia can cross at her normal 2× speed. Yuki can try, fall safely, and return on the lit ramp. Mia completes J U _ P with M; N and S remain removable decoys. Both locks activate, the bridge becomes permanent, and both physical heroes must reach the exit. Autonomous movement is held during separation and restored after safe reunion; a hero carrying a block retains the existing hold behavior.

Jump uses the same impulse, gravity and airborne speed for both heroes, with no double jump. The tutorial uses free player-controlled jumping; the former assisted arc has been removed. Falls never remove blocks or reset progress; drops are kept on accessible banks. The lower floor stays below moving slabs and has a lit return route. Space, E, Tab, movement, mouse look and R are the controls.

Implementation: src/split-mechanics.ts holds bridge and surface definitions; Game holds per-hero motion, stages and bounded audio/hint event hooks; HeroTeam advances both heroes and enforces safe companion behavior. power-chamber.ts renders the authored banks, ramp, slabs, labels, two locks and live floor map. Existing shared plate and door visuals remain in use.

Verification: 62 unit tests pass, including stage validation, wrong-answer retrieval, both tutorial jumps, no double jump, equal jump capability, crossing speed, safe falling, return ramp, midair handoff, reset and team exit. The Room 3 browser test uses keyboard input for the full route including wrong answers, Mia's heavy-block struggle, Yuki's failed crossing, recovery, Mia's successful crossing, permanent return path, reunion and reset. Rooms 1 and 2 browser regression and transition into Room 3 pass. Screenshots and state snapshots are saved under output/split. Production build passes with the existing bundle-size advisory.

No deployment or new dependencies. No known blocking issue in the tested routes. Child playtesting is still useful for judging the reading distance and timing comfort.


## Layout and art revision after screenshot review

The overhead jump sign now draws a wide beveled keyboard Space key. The map is 8.5 × 5.4 at (-10, 12); its frame clears the stairs ending at z=9. The recovery incline has 20 visible treads and risers while retaining continuous collision for walking without Space. Bank surfaces use the shared volcanic material with irregular fractured basalt patches.

Yuki's plate moves to (-12, 3). The exit moves to (-14, -4.5) in the full-height rear wall, which closes off the former rear gallery. Four narrow openings house the retracting slabs; each carries angular runes and its own section of Mia's power conduit. The circuit crosses the moving bridge and meets the exit on the near bank. The map uses the same routing. Collision, camera boundary, companion exit targets and both-hero completion use the nearer exit plane. Existing rooms retain their original exit boundaries.

Lighting has not been redesigned in this pass. The new boundary regression brings the unit suite to 63 tests. The updated keyboard playthrough covers both answers, the moving conduit crossing, fall/recovery, nearer exit and reset.

## Reduced reading load and pictorial map

Current wall puzzles use Room 1-style letter/word tiles: J U _ P and YUKI IS SUPER _. The answers fill the blank tile when solved. Floating puzzle/status placards, explanatory map text and repeated success banners have been removed. The map is a filled overhead drawing of the actual banks, rear wall, crossing, ravine, all stair treads, doorway and entry gap. Distinct bank fills and matching ravine stripes support visual orientation. The existing tiled upper floor and lighting are preserved. The four bridge slabs remain identifiable as amber footprints when retracted and animate into place, becoming cyan when stable.

Verified with 63 unit tests, production build, full Room 3 keyboard playthrough and screenshot inspection.


## Entrance help and running jumps — 2026-09-29
- Moved the tutorial ditch 1.2 units farther into the hallway (Z 15.4–16.4), with matching floor-map geometry and animated lava below the lip.
- Added matching large wall-mounted question-mark buttons. E within reach opens a looping 16-second visual solution: STRONG powers the first plate, the temporary bridge extends/retracts while Mia crosses, M powers the second plate, bridge stabilizes and door opens. Both buttons share one screen.
- Explanation uses separate demonstration state, pauses gameplay, supports replay, E/Escape/close, and fits small windows. It never solves the real puzzle.
- Ground-only ditch barrier now permits running jumps; W can remain held while Space is pressed, including when a HUD button had focus. A short jump landing over the lava returns to the near lip. Existing assisted ditch jumps and no-double-jump rules remain.
- Validation: 68 unit tests; new help-screen keyboard playthrough (both buttons, pause, replay, close, 800x600, both heroes holding W + Space); complete Room 3 playthrough; Rooms 1/2 regression; production build and develop-web-game smoke. Screenshots inspected in output/help and output/split-smoke. Build retains existing bundle-size advisory.
- Progression assistance is still a design discussion: consider retry-based bridge timing support and teacher-controlled progression. No skip or automatic solution added.


## Entrance pacing, localized helpers and free jump steering — 2026-09-29
- Moved both heroes back 3.4 units to Z=23. Extended the rear hall/camera clearance to Z=30; moved both info buttons to Z=22.2 and put compact keycap instructions directly above them.
- Reduced the jump sign from 6.3x1.15 to 3.6x0.72. It appears only near the ditch (Z<18.8), so it is absent at the info station. Updated the map entrance marker and footprint.
- New entrance prompts follow navigator.languages for English, Japanese, Spanish, French, German, Italian, Portuguese, Korean and Chinese, with English fallback. These translations apply to the two new prompts; puzzle words remain English.
- Corrected the earlier incomplete jump fix: removed the assisted path and its movement lock entirely. W + Space now combines normal forward movement with jumping, and lateral/reverse input works throughout flight. Space alone jumps in place. No double jump; mistimed landings on the lava still return to the lip.
- Validation: 72 unit tests including continuous forward/lateral/reverse control and stationary jump; browser tests in English/Japanese/French with real simultaneous W + Space + D for both heroes; help modal and full Room 3 puzzle playthroughs pass. Production build and skill smoke pass. Reviewed entrance and localized jump screenshots in output/entrance.


## Room 3 jumpable pressure plates — 2026-09-29
- Room 3 heroes can clear the plate rim during a jump and land at the rendered plate top (Y=0.2825). Standing, jumping again, and walking off use normal gravity and movement. Ground-level plate collision remains; solid puzzle blocks still block the hero.
- Plate activation remains exclusively driven by the correct puzzle blocks. Hero occupancy changes no locks, bridge state or door power. Rooms 1/2 retain their existing plate collision.
- Validation: 76 unit tests (both heroes on both plates, no activation, re-jump and walk-off); complete Room 3 keyboard playthrough including standing on near/far plates then solving normally; production build; skill smoke. Reviewed screenshots output/split/02a-yuki-on-plate.png and 05b-mia-on-far-plate.png.
