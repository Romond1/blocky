# Room 7 — The Action Chamber

Current station design supersedes the historical station notes below: see [action-stations-report.md](action-stations-report.md). All words now exist initially; RUN is a conveyor and LIFT uses one large base plus three small blocks.

Open `http://127.0.0.1:5188/?room=7`. Room 6 now continues into Room 7; replay navigation also includes 7.

## Reused elements

- `volcanic-kit.ts`: basalt floor rectangles, slab construction, metal trim and exit architecture.
- `cave-shell.ts` and `world-materials.ts`: jagged walls and ceiling, lava falls, stone/lava materials and animated environment.
- `puzzle-visuals.ts`: orange object plates, purple hero mechanisms, cyan solved circuits, gate and engraved block materials.
- `LiftTransport` and `Elevator`: moving-surface interface and grounded passenger/cargo support sampling. `LavaFerry` changes displacement to Z across the chasm over four seconds.
- Existing hero strength, speed, Space jump, E interaction, TAB switching, companion hold states, camera, reset and team exit.
- Existing economy registry: nine coins, one exit Heart Shard, no Memory Crystal or secret room.

## Play

The timed gate lane rewards RUN and favors Mia's existing speed. Five ascending tiers, each split into two grounded columns, reward JUMP only at the summit for either hero. The step columns have no guardrails; gaps and missed jumps lead to normal floor, without respawning. Children walk back to retry. Moving HEAVY onto the orange mechanism rewards the standard light LIFT block. Challenges are independent. Lava falls recover safely while retaining completed challenges and word matches; unsupported loose words return to their pedestals after one second.

Purple SEND and CALL plates at each dock show directional arrows. Load a rider, send from A, use B to return the ferry, board the remaining hero and call from B. Multiple trips and loose or carried word transport work. Companion exploration avoids action routes, controls and lava; riders hold safely aboard.

Match words to the three unlabelled silhouettes. Correct stations glow cyan independently. Wrong words remain removable, including swapping with carried words. Removing a correct word clears only its station. The gate uses the existing energy travel/charge sequence, and both heroes must leave together.

## Verification

`npm test`: 217 passed, zero failures. `npm run build`: passed. `npm run test:action`: complete keyboard playthrough passed. The browser test uses actual keyboard input and deterministic frame stepping: all three actions, multiple ferry trips, loose JUMP cargo, carried RUN/LIFT, a wrong match and replacement, cyan gate, team exit, reset and 960×640 viewport. Screenshots and state captures are in `output/action-chamber/`.

The build retains the existing Vite large-bundle advisory. The workspace has no Git repository, so no commits were created.


## Revised stations and entrance

The entrance forecourt is three times its previous depth: 10.5 units between station fronts and the back wall. Both heroes spawn in this shared space, facing the station row. Station signs and coloured floor boundaries identify LIFT, JUMP and RUN. The ferry deck has no side walls or fences. All three cubes rise gradually from animated trapdoors; RUN previews its cube on entry and lowers it after timeout. JUMP is collected at the summit and carried back down.

The updated keyboard playthrough covers the expanded spawn, rising LIFT reward, RUN, a deliberately missed jump without respawn, a complete split-step ascent and descent with JUMP, three loose cubes transported on the flat ferry, matching, two-hero crossing, team exit, reset and the small viewport. Current screenshots include 01-expanded-forecourt.png, 04-missed-jump-normal-floor.png and 05-split-steps-summit.png in output/action-chamber/.



## Crossing visibility and step collision revision

Moved both shores, the lava river and ferry docks six units toward the far bank. Each dock now has one purple toggle plate with a conduit to the ferry; separate SEND/CALL plates and signs are removed. Fresh entry toggles travel, standing and switching do not retrigger it. The exit and its cave opening now sit at x=12 on the right of the far bank.

Step columns are 1.5 units wide, with a one-unit central gap. Shared visual/collision dimensions and hero-radius side collision prevent walking through the posts while allowing jumps onto their tops. The top hatch fits the narrower post; step coins sit on the tops, and the far-bank coin stays on dry ground.

Validation: production build, unit suite, and complete keyboard browser playthrough through rewards, missed jumps, cargo transport, matching, repeat toggle travel, both-hero exit and reset. Screenshots: output/action-chamber.


## Jump sightline and gap revision

Moved the jump sign and instruction board beside the station, clearing the camera approach. Shifted the first step 1.4 units farther into the station, spread the two columns to x=±1.5, and increased row spacing to 2.7 with 1.4-deep tops. The 1.3-unit row gaps now accommodate the hero collision body. The top reward hatch and coins follow their steps.

A regression test reproduced the old trapped-between-rows behavior before the change and now verifies sideways escape from all four gaps. Both heroes still complete ascent and descent. Validation: 220 passing unit tests, production build, full Room 7 keyboard browser playthrough and rendered screenshot inspection.


## Easier jump route and shared summit

Reduced row spacing from 2.7 to 2.3 units and moved the two lanes from x=±1.5 to ±1.3, retaining walkable floor gaps. The fifth step is now one 4.1-unit-wide solid landing with a centered JUMP reward hatch. Shared step footprints drive rendering, support and side collision. The large JUMP STATION sign and instruction board stand overhead on outer supports.

Validation: 221 unit tests, production build and complete browser playthrough pass. Regression coverage checks floor-gap escape and cube pickup from both summit lanes.


## Shared box platforms and jump input

All rooms now use stationary box tops as hero support. Small, heavy, socketed and stacked boxes use base height plus size; carried and hidden boxes do not support heroes. Side collision permits movement above the actual top while remaining solid below it. Walking off or removing support resumes gravity.

Movement keydown takes keyboard focus into the game and immediately cancels automatic jump steering. Every direction is recognized when Space is pressed on focused UI; capture-phase keyup clears direction state even when UI consumes events. Space-alone jump behavior is retained. Added small-to-large climbs for both heroes, stacked/socket support and removed-support coverage, plus browser input checks for eight directions, key order, button focus and rapid release.


## Lost keyboard release recovery

Reproduced persistent movement by withholding the direction keyup after a Space chord. KeyboardState now expires a movement key after 1.2 seconds without a keydown/repeat signal; normal OS repeats renew genuinely held keys. Keyup also clears logical-key aliases if event.code differs. Repeats cannot resurrect inputs cleared by focus loss or reset. Uses wall time so deterministic advanceTime tests do not expire held keys artificially.

Browser checks cover missing releases, continued held-key repeats, immediate reversal, all eight directions, both chord orders and rapid key release. Room 7 full keyboard playthrough still passes.
