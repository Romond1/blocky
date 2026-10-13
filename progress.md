Original prompt: Build Be a Hero — Block World Escape Prototype 0.1, one local third-person volcanic room with pickup/carry/drop letter blocks and H _ R O exit puzzle. Minecraft-like visual language only; no mining or building. Screenshots are a future art target.

## 2026-10-11 — Mobile, public HUD and Room 10 repair

Current request: attached full brief for capability-based mobile controls/rotation, shared input, compact player HUD, unlocked replay/local teacher gate, and conservative Room 10 repair; no production deployment. Design/plan: docs/superpowers/{specs,plans}/2026-10-11-mobile-player-repair.md. Original source snapshots: output/mobile/before-src. This folder has no Git metadata.

Implemented analog movement in existing MovementInput/Game path (keyboard retains prior normalized response), pointer-owned joystick/actions/camera, auto/touch/keyboard selection, portrait prompt, safe-area mobile welcome/HUD, focus/menu/rotation pause, local progress with validated collectible migration and production URL guards. Teacher title five-tap flow uses 1001 as local convenience gate, confirmed destructive reset. New graphics options cap touch pixel ratio and shadows. Japanese HUD/menu instructions retained.

Room10 fixes: shared visible gate/barrier collision closes jump gap; anti-crush preserves already-open gate only; gallery angle normalization; solid pillars/cliff; no checkpoint advancement while falling. Reviewed and regression-tested. Existing repeated jumps let Yuki follow timed slabs too; ferry is the forgiving alternative, not a physically mandatory route. No ability changes or major puzzle redesign. Proposed next pass in docs/mobile-room10-repair.md.

Validation so far: desktop Rooms1–2 full keyboard routes, jump/focus regressions, welcome regression, Chromium touch controls/multitouch/rotation/interruptions/menu/teacher/override, WebKit smoke, real touch-only Room1 solve and natural Room2 unlock against production preview, replay/reload/reset preservation, developer-fixture Room10 endings with desktop and touch. Review found and resolved auto-opening gate, focus pause, touch menu help, Japanese headings/goals. Final build/unit/browser verification follows; see docs/mobile-player-report.md for authoritative final results and physical-device limits.

## 2026-10-02 — Room 7 horizontal lift mechanism

User requested two rails across the lava and mechanical arrival markings so children recognize the ferry as a horizontal elevator. Added steel guides, under-deck carriage rollers, and square gray docking frames with circular insets and corner bolts. Dock markings sit below the parked deck. Simulation and controls remain unchanged; rails are decorative and do not form walkable collision surfaces.

Production build, focused departure/transit/docking/return browser check, complete Room 7 station/cargo/matching/team-exit/reset route and skill smoke passed. Inspected near dock, transit, far dock and smoke screenshots under output/ferry-mechanism. An initial full-route run was interrupted by Vite reloading during a visual correction; rerun passed. Details: docs/ferry-mechanism-design.md. No remaining implementation TODOs.

Approved direction: minimal Three.js + TypeScript + Vite prototype, primitive models, one puzzle, no deployment.

Plan: establish puzzle/collision rules and tests; render room and placeholder player; wire camera/movement/interactions; play through wrong answer, recovery, correct answer, exit, reset; document local use.

Completed: Three.js/TypeScript/Vite scaffold; independent puzzle and collision simulation; primitive room/player; text blocks, highlight, carry, safe drop, wrong-answer retrieval, correct-answer sound and gate animation; exit success; reset/debug; optional GLB loading layer; README.

Verification: npm test (3/3 pass), npm run build (pass), tests/playthrough.mjs (full Chrome keyboard playthrough passes with zero browser errors). Skill Playwright client smoke run passed; screenshots reviewed for starting view, carry, correct answer, escape, resize. Browser screenshots/results are in output/playthrough (ignored generated artifacts).

During verification adjusted camera aim and starting distance to keep the player/blocks readable, and added the missing favicon. Port 5173 was occupied by another process, so this prototype's running Vite server is http://127.0.0.1:5174/.

Intentional limits: primitive art, one answer socket, no physical stacking or final GLBs; no second room, deployment or additional systems. Next step is user testing and feedback. Do not expand scope before that feedback.

## Prototype 0.2 — Memory Vault (user-requested expansion)

User requested Room 2: a larger chamber, chronological phrase-block ordering, three numbered pedestals and movable letter decoys. User explicitly confirmed SAVE KAGE → MEET LUMA → MEET ARACHNE.

Implemented shared multi-slot mechanics and layout-driven collision; about four times the floor area; three large phrase blocks and five decoys; far-wall inscription; uniform timed rejection on full wrong sequences only; occupied-slot swapping; MEMORY RESTORED, low impact sound and enormous gate; automatic entry from Room 1 plus ?room=2 shortcut. Reset affects the current room. Room transitions dispose old visual resources.

Tests: seven rule tests pass. Memory Vault's full Chrome keyboard playthrough passes (decoys, drops, partial-answer silence, uniform rejection, swaps, correct order, door animation, escape, reset, boundaries, orbit and resize), with no browser errors. Found and fixed a drop-distance edge case that prevented immediate re-pickup of a decoy. Reviewed phrase-carry, rejection, open-gate and small-window screenshots. Build passes with Vite's advisory that the combined game/Three.js bundle is just over 500 kB (about 131 kB compressed).

Room 1 regression and automatic transition to Memory Vault passed in Chrome with no browser errors. Adjusted Room 2's initial camera pitch to show the taller chamber and far-wall inscription; final skill-client browser smoke and screenshot inspection passed. Final npm test (7/7) and production build passed. Local Vite is running on http://127.0.0.1:5174/; direct new-room entry is http://127.0.0.1:5174/?room=2. Await user playtest feedback; no Room 3 or deployment.

## Prototype 0.3 — Power Chamber and recovery

User requested Room 3 as the FINAL TRAINING ROOM. Rooms 1 → 2 → 3 remain connected; no Room 4. Added two staged puzzles using existing Game/block/socket/door systems, a scaled existing chamber shell with 10 solid interior structures, 10 word/number blocks, two lock indicators, illuminated conduits, and a revealed episode station. Correct powers FAST/Mia and STRONG/Yuki activate Lock 1; episode 1 activates Lock 2 and opens the exit. Stage 1 gives individual feedback; Memory Vault retains whole-sequence feedback. Reset restores both locks, panel, blocks and gate.

During work the user reported a computer crash/power event. Source inspection found src/main.ts consisted of 18,556 zero bytes; other checked source/test/doc files were intact. Preserved damaged file at output/recovery/main.ts.zeroed.bak, then restored the main module from conversation-visible source and connected the saved Room 3 work. Cause of computer power event is unknown.

User requested a new port: npm run dev now uses 127.0.0.1:5188 with --strictPort. All test defaults and current README links use 5188. The original port notes above are historical. Command Prompt restart instructions are in README.md.

Verification: 10/10 rule tests passed, production build passed. Chrome playthroughs for all three rooms passed with zero browser errors. Room 1 → 2 and Room 2 → 3 transitions verified. Room 3 exercised inactive station gating, word/number carrying, partial feedback, wrong answer removal, panel reveal, two-lock gate, all 10 structure collisions, reset and final training-complete screen. Screenshots inspected for entrance, word block, powered station, revealed memory, exit and completion. Test screenshots/results are in output/power, output/memory and output/playthrough.

Known limitation: primitive art and flat-floor movement are intentional. Vite issues a non-blocking bundle size advisory (~516 kB JS, ~134 kB gzip). Await user testing; do not add Room 4.

Added user-requested Replay Room 1/2/3 navigation, with current-room indicator; each link restarts the selected room while R resets only the current room. Chrome verified 3→2→1→3 plus R; screenshot inspected and build passed. Verified the project Vite process owned port 5188, stopped it at the user's request and confirmed port 5188 free. User will now run npm run dev in their own terminal. Do not restart an agent-owned server without a new need.

2026-09-28 — Instant hero switching and ability foundation complete.
User brief: initial-only splash; Tab/button control transfer between existing heroes; 0.3–0.6s camera; Mia 2x player speed; Yuki strength 2 / Mia 1; companion-safe carrying and HOLD_POSITION; compact HUD/debug and tutorial hook. No room changes.
Implemented shared switch action, 0.45s camera/input handoff, centralized src/heroes.ts config, persistent locks, carried-object stationary state, switch event/tutorial state, velocity-responsive run animation and compact HUD.
Verification: 32 simulation tests and production build pass; six room/start switching browser configurations, team regression and picker tests pass; full Rooms 1–3 keyboard playthroughs pass as both Yuki and Mia with zero browser errors. Skill Playwright smoke and screenshots reviewed. Existing Vite bundle-size warning remains.
Full changed-file list, architecture, API usage and limitations: docs/hero-switch-report.md.
Next: wait for user testing. Do not redesign rooms or implement strength puzzles.

2026-09-28 — Room 1 Training Chamber complete.
Approved update: two pressure plates: small E completes HERO, and a large HEAVY block demonstrates Mia's struggle/Yuki's strength. Both objectives open the exit; both heroes must leave.
Added explicit block data, room-local TrainingTutorial events and staged DOM UI, procedural struggle/lift/drop, first-failure feedback, two physical plates with channels/locks, and safe reset/switch interruptions. Existing Rooms 2–3 retain their block handling and content.
Verification: 44/44 simulation tests; production build; full tutorial keyboard/mouse playthroughs as both starting heroes; early Tab/reset, early heavy approach, wrong A, carrying switches and both plates/team exit; switching/team/picker browser regressions; Rooms 2–3 full playthroughs as Yuki and Mia. All passed, zero browser errors. Skill smoke and gameplay screenshots reviewed in output/training. Corrected browser test helper to accept a completed room transition during the final movement assertion.
Report: docs/training-chamber-report.md. README updated. Existing Vite bundle warning remains.
Next: wait for user testing. Do not redesign other rooms.

2026-09-29 — User-requested Room 1 free-play revision complete.
Matched word block size/material to Rooms 2–3 (1.65), kept small letters at .95; enlarged floor area by 40%; symmetric equal plates near exit with H [blank] R O on left and HEAVY on right; shuffled letters among safe scattered positions on start/reset. Normal start now Mia, optional picker at ?choose=1.
Removed all tutorial prerequisites. Either plate can be solved first; any blocks can occupy either plate; correct blocks remain removable and the gate reflects current occupancy. Only capability constraints remain (Mia struggles, Yuki carries heavy). Movement/look tips are optional and timed; context/mission guidance replaces the forced sequence.
Verification: 47/47 tests and build pass. Free-play browser completion as both heroes, immediate heavy attempts, heavy-first/wrong plate/rearrangement/live gate/team exit pass; switching/team/picker suites and Rooms 2–3 browser regressions pass. Skill smoke screenshots reviewed. Existing bundle-size advisory only.
Details: docs/room1-free-play-report.md. Await user testing.


September 29: split letter lesson (Room 1) and strength lesson (Room 2); common orange/cyan rock glyphs, square plates, animated conduits and patterned gate in all active rooms. User follow-up: plates offset from doorway, larger HERO clue above arch, clear missing-letter frame, camera/HUD moved to preserve visibility. Added circuit timing/reset tests and updated regression fixtures/browser routes. See docs/orange-cyan-circuits.md.

Reward animation update: shared plate/block swell, square shockwave, sparks, wider branched conduits, travelling surge, cyan door aura and light. Introductory plates moved forward 1.4 units; conduit bends around the block for visibility. Simulation now separates 1.8-second flow and 0.65-second door charge before opening. Verified 49 simulation tests, Rooms 1/2 keyboard completion and cancellation, Room 3 keyboard completion, standard skill client smoke and screenshots.


Room 2 visibility/tutorial update: HEAVY spawn X moved from 3 to 4.3. Large centered non-modal tutorial prompts; stronger Mia-too-heavy/TAB-to-Yuki instruction, failed-lift hint extended to six seconds. Added browser-preference English/Japanese localization for tutorial/HUD/control/feedback presentation, preserving English puzzle words and simulation strings. Unsupported locales fall back to English. Added locale resolution/string tests and browser checks for English, Japanese, fallback, centered prompt bounds at 1280x800 and 640x480, and unrestricted switching. Japanese end-to-end Room 1/2 playthrough passed with both heroes; screenshots inspected in output/instructions and output/training/ja-JP-*.png. 52 unit tests passed; production build passed with existing bundle-size advisory.


Tutorial docking correction: removed time-based skipping of MOVE/LOOK. Movement-key input completes MOVE; only real left-drag camera change completes LOOK. Mission displays 2.8 seconds then its panel transitions over .75 seconds to a right-hand checklist. Intro panel raised to upper screen; docked contextual hints replace repeated center prompts and duplicate objective card removed. Checklist reflects actual door power; reset restores onboarding. English/Japanese browser verification passed for waiting, click/hover rejection, drag, mission duration, visible panel travel, dock persistence, small viewport and reset; 53 unit tests passed. Added completion checklist assertion to gameplay playthrough.


Room 2 redesign: separated its layout from Room 1; 18x16 hall, northwest offset exit X=-3.5, staggered plates (-4.4,0)/(2.6,-2.8), four new block locations and two solid rock landmarks. Added shared exitCenterX support through cave shell, arch/tunnel, inscription, conduits, collision, companion targets and camera. Room 2 tutorial is TAB-only then timed mission and two-item checklist, with Japanese equivalents. Full playthrough exposed companion crowding at centered player exit; widened its target side lane to keep 0.85 clearance. All 55 simulation tests pass, English/Japanese tutorial and locale checks pass, Room 1/2 full playthroughs pass with both starting heroes including offset exit. Standard skill client screenshot inspected.


Room 1 interaction cues: added src/interaction-banner.ts with a projected DOM banner over the nearest interactable block when empty-handed, and over the plate whenever the selected hero carries any block. Uses actual rendered block position, current camera matrices, and in-frustum visibility; pointer events pass through. Japanese labels supported. No banners in Rooms 2/3. Browser checks cover A/E placement, pickup range, persistent distant plate cue, camera movement, hero ownership, reset and room scoping; English and Japanese screenshots inspected.


Interaction polish: separate Room 2 TAB/mission transition with .45-second clear interval, highlighted new mission heading, then full 2.8-second hold. Extended floating heavy cues only to Yuki in Room 2; Mia gets switch hint. Added solid floor/socket block collision with .1-unit movement substeps, sliding and overlap recovery; drop placement cannot intersect the carrier. Heavy plate snapping widened and checks rendered carry position without allowing through-wall placement. Mia flaming sword moved to rear hip with rearward blade angle; flame geometry retained. Updated real-keyboard routes to walk around items. Screenshots inspected for mission, Yuki cue, forgiving placement, and compact Mia sword.

Final validation for interaction polish: production build and 60 unit tests passed. Full keyboard playthroughs for Rooms 1, 2 and 3 passed with solid blocks. New HEAVY/mission browser checks, localized Room 1 banner regression, and English/Japanese docking flow passed. Existing bundle-size advisory remains.

## 2026-09-29 — Split Chamber replacement

User approved replacing Room 3 with the supplied plan, corrected to place the live schematic on the floor immediately after the jump hallway and add an overhead “Press Space to jump” helper. Implemented heavy STRONG/FAST and light M/N/S stages; near-bank exit; four synchronous retracting slabs; safe lower floor and lit return ramp; equal universal jumping with individually assisted tutorial jumps; held companion during separation and safe reunion; stateful map, connection lines, locks and solved labels. Reset restores all motion and bridge state. No deaths or extra controls.

Validation: 62 unit tests pass. Full keyboard Room 3 playthrough passes, including wrong answers, heavy struggle, Yuki fall/recovery, Mia crossing, map updates, return and team exit/reset. Existing Rooms 1/2 browser regression passes through the Room 3 transition. Build passes with the existing bundle-size warning. Screenshots reviewed in output/split; floor map and helper verified at entry. See docs/room3-report.md. No known blocking issue; next useful step is a child playtest for map reading and crossing comfort.


## Room 3 screenshot corrections

Implemented all six requested layout/art corrections: Space keycap; schematic clear of stairwell; real visible stair treads with smooth ramp collision; fractured volcanic floor; slab runes and moving Mia conduit; full-height rear wall and nearer Yuki plate/exit. Added optional exitZ and authored circuit paths to shared systems with defaults preserving Rooms 1/2. No lighting redesign. New rear-wall/gated-exit regression and updated route tests pass (63 unit tests). Full Room 3 keyboard route with falls, walk-up stairs, wrong answers, stable return, nearby team exit and reset passes. Screenshots remain in output/split.
Final verification: production build and browser smoke pass; Rooms 1/2 regression still passes. Screenshot review confirmed one continuous Mia conduit across the slabs and no route behind the wall. Also clamped frame delta to zero to prevent backwards automation clocks from reversing animations. Lighting settings are unchanged.

## Room 3 visual language / reading-load revision

Replaced floating sentence and instruction panels with wall-mounted Room 1-style bordered glyph tiles. Mia shows only J U _ P and fills M in cyan; Yuki shows YUKI IS SUPER plus the blank/STRONG answer. Removed room-title placard, bridge-status placards, recovery prose sign, map labels/legend, repeated success banners and idle prose hints. Space onboarding, Tab cue, interaction controls and physical lock indicators remain.

The schematic now draws from room coordinates: distinct filled near/far banks, striped lower ravine, all 20 stair treads, tutorial gap, entrance marker, pressure plates, door locks, connecting circuits and four colored animated bridge slabs. The rear wall ends the diagram immediately behind the crossing. Muted footprints keep the crossing visible while retracted. The real ravine has matching horizontal stripes; existing bank tiles stay unchanged, with subtle corresponding bank-edge colors. Lighting unchanged.

Validation: 63 unit tests and production build pass. Full keyboard Room 3 playthrough (wrong answers, both jumps, Yuki fall, stairs, Mia crossing, solved glyphs/map, team exit and reset) passes. Browser smoke passes; screenshots inspected for map, wall glyphs and solved state. Files: src/split-map.ts, src/power-chamber.ts, src/main.ts, src/style.css. No known blocking issue.


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
# Room 6 — The Sorting Foundry — 2026-09-30

Implemented the attached Room 6 request following the approved design and implementation plan. Added the asymmetric multi-level foundry, shared timed crossing/permanent far-plate lock, safe recovery stairs, extracted Room 5 lift transport/view, ordered removable RED APPLE / GREEN PEAR / YELLOW BANANA pairs, independent circuits, physical downstairs team exit, replay/progression and global bounded smooth wheel zoom. Preserved existing controls and materials.

Validation: 152 unit tests and production build passed; full Room 6 keyboard route, Room 1/2 training and Room 3–5 regressions, all-six-room real wheel tests and develop-web-game smoke passed. Screenshot inspection caught and corrected recovery stair orientation; geometry regression now checks it. Read-only code review caught door-charge aggregation, a camera distance literal and a gallery pillar mismatch; all fixed and verified. Screenshots: output/sorting-foundry. Details and unmeasured child/school-laptop testing limits: docs/room6-report.md.


## 2026-10-01 — Smooth controls and centered cube carrying
User request: fix stuck Space/direction chords and overshoot, smooth turns with finer angles, and carry/drop cubes centered ahead with both hands.

Root causes verified by 10 failing focused regressions: repeat-dependent 1.2-second key expiry, automatic 1.5-unit jump lunge, instant heading changes, one-handed/light and offset/heavy carry poses, and radial side-search drop fallback. HUD buttons also consumed Space when focused. Replaced timeout tracking with physical press/release plus focus/page/reset/switch cleanup; ignored repeat resurrection; Space now jumps in place with direction keys owning travel. Gameplay keydown is captured so HUD focus cannot steal jumping.

Added src/movement.ts for continuous shortest-path turning (10 rad/s), 70ms blending when adding a direction, and shared centered carrying coordinates. Released/reversed axes retain no motion. Preserved existing travel speed and eased walk animation. Both arms blend into matching forward poses; Yuki stows his shield. Heavy lift and socket reach use the same center anchor. Free drops across base/lift/action rooms stay ahead and retain cargo when blocked; nearby plate snap/stack assistance remains.

Validation: 242/242 unit tests; production build; focused real-browser input and carrying checks; full Rooms 1–7 keyboard playthroughs; Room 3 help/jump browser test; required skill browser smoke. No browser errors reported. Opened and inspected actual carrying, heavy-carry and forward-drop screenshots. Updated old route fixtures to deliberately face cargo spaces/stack targets, and Room 6's stale terminal-exit assertion to expect the existing Room 7 transition. Focused read-only review of eight production files found no actionable issues. Build retains the pre-existing bundle-size advisory.

Evidence: output/movement (including source backup before-src), output/split, output/cooperation, output/sorting-foundry, and existing room test output folders. Documentation: docs/movement-report.md. No Git repository in this workspace. No known blocking issue; a child playtest remains the useful next check of subjective feel.

## 2026-10-02 — Solid cubes and forgiving stacking/climbing

Fixed the screenshot's carried JUMP/HEAVY intersection with shared upright box poses, oriented collision and short swept movement/rotation/vertical/pickup/placement checks. Room 7 now centers blocks into stable stacks with forgiving forward aim. Top landing footprints extend .28 beyond each edge; one bounded jump assist helps both heroes climb small/large cubes. Top-first retrieval prevents unsupported towers. Shared base heights keep untouched floor stacks and reused plate blocks aligned.

Support chains and riders travel together. Review reproduced lift/gallery and ferry/shore intersections caused by direct platform displacement; new group sweeps pause before contact and resume after repositioning. Preserved smooth controls, release behavior, intermediate facing and centered two-hand carry. Occupied plates require removing the old cube first; interaction text explains this.

Verified 274 unit tests, production build, focused keyboard-input and carry browser checks, exact Room 7 contact/stack/offset-climb reproduction, final full Room 5 and Room 7 routes, and skill browser smoke. Screenshot evidence inspected under output/block-physics. Independent re-review passed both transport reproductions at normal and one-second frames. Earlier-room route fixtures now reserve space for the full cube and avoid impossible occupied-plate swaps. Details: docs/block-physics-report.md. Existing bundle-size advisory remains; subjective ease still benefits from a child playtest.

Final Room 6 keyboard route passed with physical cargo loading/unloading, all pair correction/removal checks, reunion, exit, zoom and reset. Rooms 1–7 keyboard routes have now passed during this change; no remaining failed room route.

## Room 7 action station rework and live revisions — 2026-10-02

Original request: attached Room 7 station-only rework: visible RUN/JUMP/LIFT from load, conveyor RUN, preserve precision JUMP, construction LIFT; preserve ferry, final matching and other rooms. Follow-up changes: near-wall drop/pickup clearance, elevated pickup of a neighboring highlighted block, clearer size progression, then final revision to one large base plus three small pieces, raised LIFT sign and smaller JUMP sign.

Final design: all three words use existing light behavior and pickup collection; no station reveal/hatch/timer. RUN belt speed 5.5 against normal Yuki 3.5/Mia 7/airborne 5; Mia effective forward speed 1.5. LIFT base size 2.2/strength 2/carry multiplier .4 (Yuki 1.4 units/sec), three .8 light pieces, ledge Y=3.8. Both heroes require small → big → small on big → ledge. LIFT sign is elevated behind the word; JUMP sign is 4.4 by .8. Existing JUMP rows and safe floor remain.

Stable offsets, multiple small pieces per large support, actor-aware placement and alternative support candidates permit experimentation. Standing support is excluded from selection; elevated neighboring blocks remain retrievable. Top-first removal and own-support rejection prevent floating exploits. Near-wall drops use exact visible dimensions/current carry reach and equivalent square orientation, removing the false padding/180-degree sweep failure. Companion holds preserve station ownership and stacks; individual recovery retains unrelated collection.

Validation: 290 Node tests passed; production build passed (existing size advisory); keyboard station route through small/big/small construction and elevated retrieval passed. Full Room 7 ferry/matching/exit/reset and final Mia climb/near-wall checks recorded in output/action-chamber and output/action-stations. No economy or other-room gameplay redesign. The workspace has no Git repository.

Docs: docs/action-stations-design.md, docs/action-stations-plan.md, docs/action-stations-report.md. Human child playtesting remains useful for subjective difficulty.

Final verification: both heroes passed the real keyboard small/big/small LIFT climb and elevated small-piece retrieval; complete Room 7 ferry/matching/team-exit/reset, near-wall drop/retrieval, full-volume carry collision and final skill smoke passed without browser errors. Inspected final sign/entrance, construction, elevated pickup, Mia completion and smoke screenshots. 290/290 Node tests and production build passed. No known blocking issue.

## 2026-10-02 - Room 8: The Ability Hall

Implemented the attached Room 8 brief after inspecting Rooms 1-7 and shared Game, block, plate, transport, companion, volcanic and economy systems. Six data-driven sentence panels scaffold CAN, build RUN/LIFT, then generalize with both JUMP examples. Independent solved locks, ordered validation, automatic periods and recoverable mistakes.

User revisions: spread horizontal layout 40%; widen the hall further and separate sentence banks with distinct floor frames and independent circuits. Corner portcullis follows Room 4 near-hold/far-hold/reunion behavior, with safe closure. User explicitly overrode all-light words: introductory LIFT and all Yuki sentence words are existing large heavy blocks; Mia words stay light. Weight-specific pads protect required inventory.

Reuse volcanic floor/shell/materials, energy, pressure plates, hero models/animations, carry physics, cooperation, safe jump steps, team exit and persistent economy. Nine coins, one exit shard, no secret crystal. Companion avoids required plates and holds manually parked operators, carriers and optional step riders. Recovery selects nearby free staging rather than overlapping another word. Reset restores puzzles/mechanisms/actors, preserves economy. Room 7 now transitions to 8; 8 stops.

Full keyboard Room 8 route passed from both initial heroes, with heavy pickup, repeated switching, reverse completion, wrong-order removal/correction, near/far cooperation, JUMP, both-hero exit and persistent reset. Room 7 full route/reset and transition passed. Skill Playwright smoke passed and screenshots inspected. Updated resize test to wait for the resize event before manual rendering. Final checks and file details are recorded in docs/room8-report.md. Await user testing; no Room 9 or additional scope.

Final Room 8 verification: 306/306 unit tests pass, production build passes, latest full Room 8 browser route and refreshed small-window capture pass. Only the existing Vite bundle-size advisory remains. Implementation complete; await user testing.

## 2026-10-02 — Room 8 Sentence Carousel rework
Reworked only the main sentence-building chamber: east expansion to x=48, two continuous mechanical carousels, .3-second grounded hero brake ramps, stopped-only pickup and permanent detachment, LIGHT main words, safe recovery zones, NPC machinery exclusion and brake HOLD_POSITION. Kept intro LIFT heavy, corner gate, curriculum, collectibles and Rooms 1–7. Default main camera FOV65 (distance6) shows both panels around a machine; optional wheel zoom remains unchanged. Initial full keyboard route passed including wrong-order correction and team exit/reset. Browser harness needed cargo-clearance routing and safe floor staging away from a hero plate; no production pickup/control workaround. Final regression verification underway.

User revisions completed: low see-through carousel fences with exactly two station-facing openings; stopped pickup requires an aligned word and approach through the same opening. Widened openings to halfAngle .36 and made the word/player alignment checks permissive after user screenshots; off-center pickup test passes. Removed hall-spire beside carousel B. Fence geometry is shared with carried-cube collision and cached. Full timed keyboard routes passed from both starting heroes, with brake release/reorientation/retrieval per required word, wrong-order correction and persistent reset. 323 unit tests passed; production build passed; Room 7 full regression passed earlier with Room 8-only changes. Final skill smoke passed. Inspected default-machine/fence screenshots and small-screen views. No remaining implementation TODOs; stop for user testing.

Room 8 final user revision: centered exit at x=25, last two JUMP sentences open it directly, obsolete final HERO pads removed with control indices compacted. Floor conduits converge on centered door. Room 8 NPC holds throughout main puzzle area and near any pressure pad until exit opens, then walks out. First full revised keyboard route passed; final checks follow.

Final validation for centered Room 8 exit and companion parking: npm test passed all 324 tests; npm run build passed; full Room 8 keyboard playthrough with Yuki starting passed through both final sentences, centered team exit, and persistent reset. Develop-web-game smoke screenshot inspected. Revision complete; no outstanding work for this request.

Room 8 introductory chamber now presents MIA CAN RUN on the left and YUKI CAN LIFT on the right at the same depth, with corresponding pictures, pads and staged RUN/LIFT blocks. Heavy LIFT preserved. Updated keyboard route uses layout-derived targets and waits for the existing heavy pickup animation. Verified 324 unit tests, production build, full Room 8 keyboard route including both intro sentences and team exit/reset, and skill smoke screenshot. No outstanding work.

Room 8 requested revision: first carousel completion now starts a 2.2-second smooth gate lift, with gold pulse and rising sparks over three seconds. Physics tracks the actual gate height. Second carousel has eight trays including light RUN and LIFT decoys, with original two JUMP solutions unchanged. Added animation/collision/reset and decoy rejection tests; focused tests and build pass. Full keyboard route and final regression underway.

Latest Room 8 introductory revision complete: each sentence now uses three orange object plates with word labels above, and six matching small light cubes staged at the corresponding x positions. Mia left, Yuki right. Replaces previous fixed prefixes and heavy introductory LIFT at the user’s request. Extra intro sockets retain existing main/control IDs, with hero detection limited to the four HERO controls. Intro word recovery returns to its own staging. Wider Room 8 camera framing. Retained gradual first-carousel gate success animation and second-carousel RUN/LIFT decoys. All 326 unit tests pass; production build passes; full keyboard route passes all six intro placements, both machines, animated gate, final sentences, team exit and reset. Inspected opening, lifting-gate, second-carousel and final smoke screenshots. No outstanding TODOs.

Room 8 orange plate helper: mismatched occupied slots now report wrong immediately, including partial sentences, and remain wrong until removed/corrected. Only that plate takes a subdued reddish-orange tint; circuit paths, purple HERO pads and cyan success effects preserve their existing presentation. Matching partial words remain orange until the full sentence solves. Added persistent per-slot feedback test; all 327 tests and build pass. Browser checks underway.

Wrong-plate helper final validation complete: full Room 8 real-keyboard route passed wrong-order placement, correction, both carousels, completion, team exit and reset. Skill smoke passed and actual screenshots inspected; wrong-order screenshot shows only CAN/MIA mismatched plates tinted reddish-orange while correctly placed RUN stays orange. No remaining TODOs.


## 2026-10-02 — Final sequence foundation

User brief: inspect and reuse Rooms 1–8 systems; build quiet antechamber, Heart assembly/object, playable four-section Room 9 and continuous transition into an irregular, huge Room 10 environment shell. Stop before Room 10 puzzles/ending. User subsequently supplied the Room 9 assembly MP4 and requested smaller playback so its bottom remains visible.

Implemented separate finale layout/controller/view and optional-video adapter; reused Game carrying/collision, HeroTeam handoff/HOLD_POSITION, pressure plates, Elevator, LavaFerry, Bridge, action and fruit pictures, volcanic palette, puzzle circuits and Economy. Room 8 → Room 9 → Room 10 now connects. Heart remains light for both heroes, stays with parked companion on switch, rides transports, recovers alone at reached checkpoints and cannot enter language plates. Room 9 has 10 coins and no new shard. The four physical language locks and Heart pedestal gate team transition. Room 10 is a 76-unit irregular cavern ring with rising perimeter, large lava center, basalt pillars/arches/cracks and inactive golden destination; debug-only future zones.

The actual ten-second video is bundled by Vite and plays automatically at Room 9 entry. Playback is centered within 88vw × 82vh with full aspect ratio. Sound on enables audio without blocking autoplay. Rendering continues while controls/companion/mechanisms pause. Video failure/stall falls back to a six-second procedural sequence sharing real collectible shard geometry/material. R replays the opening; Economy persists.

Verification: 341/341 Node tests pass, production build passes with existing bundle-size advisory, full keyboard browser route passes assembly, gate, carried Heart elevator, bridge/ferry transport, upper/lower word retrieval, all four language targets, Heart delivery, both-hero transition and full Room 10 perimeter carrying. Separate video tests pass frame bounds at 900×650, frozen movement/switch/jump/E, sound, media-error fallback and reset replay. Skill client smoke passes. Screenshots visually inspected under output/finale. Corrected shore passenger scooping by sampling ferry crew/cargo at departure; invalid-object checkpoints now cannot advance; authored language pictures participate in camera/solid collision. Latest cavern reveal camera is inside the playable rim, away from outer rock strata.

Documentation: docs/finale-foundation.md. No Git metadata exists, so no commits or worktree. Next work is user inspection and choosing final Room 10 puzzle placement; do not add final puzzles, ending, extra shards or a Memory Crystal room without a new request.


Final 11 October verification: 368/368 unit tests; TypeScript + production build; production Chromium touch suite and WebKit touch smoke; touch-only Room1 completion/Room2 unlock, replay/reload/reset preservation, fresh-reset/no-confirm and meaningful-reset cancellation, and confirmed teacher local wipe passed. Desktop Room1–2 full routes, jump/focus and welcome regression passed. Room10 45 focused tests and desktop/touch ending fixtures passed after independent gate-bypass review. Final screenshots inspected. Local frame sample median16.7ms/p9516.8ms, not phone hardware. Existing bundle-size advisory remains. Full report: docs/mobile-player-report.md. No deployment. Remaining user validation: physical Android/iPhone, tablet/hybrid, extended performance and unassisted child Room10 play; next-pass puzzle/story proposal requires separate approval.

11 October follow-up: Teacher Tools now includes Go to any room with all ten named rooms. Correct five-tap/1001 unlock is required; hidden handlers also check teacher state. Public replay remains earned-only. Inspection jumps and subsequent room completions do not unlock player progression. Public replay resumes normal progression; hiding tools after inspection returns to the highest earned room, and reload revokes the gate. Production desktop/touch selector checks and actual touch Room1 completion in both normal and teacher modes passed.

11 October requested Room10 obstacle change: replaced the second pad's 5.8-second one-shot timer with grounded HOLD occupancy. Either hero can hold the bridge slabs up indefinitely while the other crosses; switching preserves the holder. Renderer and collision share slabsActive, release lowers the bridge, reset clears it, and English/Japanese room objectives explain the roles. Regression first reproduced expiry/release faults, then verified both heroes carrying the Heart across after long waits. Desktop and touch browser runs staged sector1 then used real Tab/HERO, movement and jumps for all slabs after 30 seconds of holding. Release check passed. Screenshots inspected, no page errors. Full 369/369 unit tests and production build passed; existing chunk advisory only. No deployment. Reports updated under docs/mobile-player-report.md and docs/mobile-room10-repair.md.


## 11 October - Room 10 floor, carousel and Heart route

Shared disjoint terrain patches supply rendered floor triangles and collision. Solid ground extends beneath the outer walls; the court is 12 units wide with an outward wall bulge. The held-bridge channel stays lava and remains required. Removed coplanar ring/court surfaces and separated transport skins. Carousel HOLD pad moved to the open approach (-19,-23). The perimeter passes the inactive Heart entrance; finishing the language puzzles opens one short bridge to the isolated altar (0,-20). Removed the old bright center paths. Portals follow the relocated altar. Raycasts confirm one floor surface per supported point. Physical perimeter travel, failed early-shrine jumps, desktop/touch pad pickup and direct-bridge restoration pass.

## 11 October - Global placement and simpler Room 10 elevator

User request: remove invisible spacing and stacking restrictions, allow adjacent jumpable blocks with larger bases beneath small pieces, and make the elevator easier. Shared drop candidates offer close face alignment; stacks require a short aim into the visible base and size ordering. Clear floor before a distant block remains a floor placement. Removed redundant circular block/plate keep-out zones and needless quarter-turn cube sweeps. Actual solids, hero clearance, answer priority and strength rules remain. Generic rooms now support intentional stacks.

Room 10 lift is 7-by-7 at (31.1,-14). Three large 2.2-unit blocks are staged at x37.5 outside the loading deck. Lower pad (31.1,-9.2) calls the lift or arms an untimed departure once both heroes and the Heart board. Upper return pad (25,-15) leaves a clear walking lane. Cargo riders count as passengers. Elevator defaults in earlier rooms are unchanged. No tower or timed boarding is required; EN/JA goals explain the route.

Final checks: 386/386 Node tests, TypeScript and Vite build pass, existing chunk-size advisory only. Desktop and touch Room 10 fixture uses real movement, switches, ACTION and jumps for waiting, boarding, ascent, both-hero upper checkpoint, adjacent placement, intentional small-on-large stacking and touching-step jumps. Screenshots and final skill smoke were opened and inspected. Floor/brake/Heart-route checks and held-bridge checks pass in both modes. Room 4 keyboard cooperation/stacking/exit/reset and Room 7 small/big/small construction route pass; older harnesses now dismiss the current welcome screen. No deployment. Requested implementation complete; physical-phone and unassisted child playtests remain user validation. Plans/specs are under docs/superpowers; detailed reports are docs/mobile-player-report.md and docs/mobile-room10-repair.md.

## 2026-10-11 — Alternative west route and clear ending doors
User chose either route. Added west pressure gate, a four-deck vertical wheel (one quarter-turn per fresh grounded pad press; controls at both docks), locally staged RED APPLE puzzle and broad cooperative lift, and a latched short exit bridge. The original east route remains usable. Either route plus the two shared sentences unlocks the Heart bridge; RED APPLE is only required for the west lift. Added west recovery positions, return-on-demand lift behavior, shared disjoint floor patches, and cavern-camera pull-in. Ending doors moved three units toward the approach, clearing the pillar.
Validation: 393/393 unit tests, production build, whole west route through actual HeroTeam movement and interaction (including Heart handoff, word pickup/socket placement and both heroes reaching the gallery), desktop/touch wheel input browser checks, existing desktop/touch east elevator/placement checks, and skill-client production smoke. Opened screenshots of wheel, apple court, ending portals and smoke. Browser fixtures stage mechanism approaches; no claim of physical-device testing. Output: output/dragon-west. New test entry points: tests/dragon-west.test.ts, tests/dragon-west-browser.mjs, tests/west-route-walk.ts. No deployment.

## 2026-10-11 — Wider Room 10 obstacle space
Expanded the annular path (typical inner radius 28→24, outer 45→49) and moved cavern walls outward six units. Rebuilt the west entrance as a continuous curved perimeter joining 18-unit-wide landings; intentional wheel, lift and final-bridge gaps remain. Enlarged vertical carousel radius 4→5 and decks 4×3→6×4; shared support/rider bounds and control positions follow the geometry. RED APPLE moved to x-36,z4 with local word homes, leaving the middle clear. Added shared physical/instanced guardrails around actual exposed floor boundaries, with docking and ending openings. Removed the inner basalt gate shoulder requested by the user; extended the bars across the wider route. Replaced entrance banner with a low, large left/right arrow sign in front of the Heart. Moved decorative lava shafts to the expanded walls and removed obsolete floor trim/posts that spilled over seams.
Validation: 394/394 unit tests; build passes. New west floor raycast sweep verifies a single surface matching collision heights and no unintended entrance holes. Whole west route movement/pickup/socket/Heart-handoff walkthrough passes. Desktop and touch wheel input/transport and apple lift browser checks pass. Skill-client Room10 smoke and entrance/wheel/apple/right-gate screenshots opened and inspected. Source and tests updated locally; no deployment.

## 2026-10-11 — Room 10 machinery, reset and sentence spacing
Moved arrow sign behind Heart; separated left gate/wheel controls and moved entrance control clear of wall. Right gate pads retain original coordinates. Left gate requires held pressure until both partners and Heart pass. Added explicit gate, wheel and lift floor conduits. Expanded apple court and mixed RED/APPLE among GREEN/YELLOW/PEAR/BANANA. Apple unlock now turns lift purple; lower call waits for boarding and upper control returns it. Replaced last west bridge with a lateral returning shuttle with endpoint dwell and rider/cargo transport. Room reset rebuilds views against new machinery while preserving economy and progression.
Latest screenshot exposed word cubes (1.65) exceeding old socket pitch (1.6). Increased Room10 pitch to 2.5 and plate half-size to .95, moved sentence panels back and apart. Added real placement regression in both answer orders, including already occupied neighbors. Full west route uses movement, real pickup/socket actions, both lift calls and shuttle crossings. Desktop/touch menu reset checks preserve coins, shards, crystals and storage while resetting model and visuals. Build passes; screenshots reviewed in output/dragon-machinery. No deployment.

## 2026-10-11 — Right lift unlock and physical signs
Right lift starts locked until a grounded hero reaches the upper control after climbing blocks; lower calls then support a single partner with Heart. Reset relocks. Added explicit unlock regression, updated post-unlock access fixtures. Converted Room10 instructions to framed, double-sided posted signs, placed wheel instruction at its control (-25,19.5), and moved HOLD TO OPEN inward from wall to (-31,29). Portal choices are green RETURN HOME with geometric house badge and cyan EXPLORE MORE with compass badge, attached to frames; removed confusing subtitles. Existing destination events retained. HUD matches unlock rule. Validation: 399 unit tests, build, desktop/touch unlock and partner transport browser tests. Reviewed ending, gate sign and skill-smoke screenshots in output/lift-signs.

## 2026-10-11 — Permissive final puzzle placement
Reproduced screenshot failure with a held word at 2.35 units from the target: old foot-distance reach returned no nearby slot and routed ACTION to floor dropping. Room10 light puzzle words now target by held-block anchor within bounded 3.1 player / 1.75 block reach, with same-floor and wall checks; physical placement collision checks remain. Tests cover all ten sockets from centered/diagonal approaches and both complete placement orders. Correct individual words now report correct immediately instead of reporting wrong until the sentence is complete. Desktop/touch browser placements and screenshots verified in output/dragon-machinery.

## 2026-10-11 — Two-block right lift climb
Lowered right lift destination, gallery, upper control, backing/cliff collision and sign from five to four units. Elevator supports an instance-specific top so other room lifts remain unchanged. Right construction large cubes are 1.8 units; small cube stays 1.2, producing a three-unit stack and a one-unit final jump. Updated gallery coin height. New actual HeroTeam jump regression verifies both Mia and Yuki climb big → small → landing with exactly two blocks. Unlock still requires reaching upper plate.
