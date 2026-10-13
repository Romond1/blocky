# Room 5 — The Fruit Lift

Implemented the approved vertical atrium and the subsequent visibility, front-fence and companion-hold requests. Room 4 now transitions into Room 5; replay navigation includes Room 5.

## Layout and reused art
The room is 28 by 24 units with a 5-unit-high north-east balcony. The lift sits at its front/right, the matching wall and exit downstairs. A short safe recovery trench and exposed stair reuse the ravine treatment. APPLE and GRAPE start downstairs. BANANA, PEAR and ORANGE start at the front balcony edge, off the lift, visible through open railings. UP/DOWN is mounted on the balcony fascia where it does not obscure the upper hero.

Shared components: createWorldMaterials, buildCaveShell, basaltFloor, bridgeRunes, buildPuzzleCircuit, wallGlyph, existing light-block/text geometry, lighting/particles, hero ownership, physical team exit, and reset. The new volcanic-kit module extracts Room 4’s floor, stair, box and door-surround builders and is used by both rooms. Fruit illustrations are word-free canvas textures within the established panel style.

## Lift and devices
The simulation-only Elevator owns DOWN, MOVING_UP, UP, MOVING_DOWN and a height from 0 to 5. Travel takes four seconds. Occupancy rising edges toggle an idle lift; standing on a plate never repeats the command. Inputs during travel are consumed without a queue. Room 4 devices retain HOLD activation; Room 5 controls explicitly use TOGGLE.

Following the user’s later instruction, activation mode does not determine NPC parking: inactive heroes stay on any active purple control until selected and moved off. This also applies after fruit completion. Cabin passengers use RIDE_ELEVATOR during motion and remain safely parked at a landing until selected. Held blocks retain their original carrier through Tab switches.

Grounded passengers and supported loose blocks receive the exact platform-height delta. Multiple cargo blocks and both heroes are supported. Placement searches for supported, non-overlapping space; partial-edge/shaft drops redirect safely or keep the item carried when space is unavailable. A descending platform pauses for an underneath hero. Front fencing and side rails block movement, reaching and placement through them; the rear is open. Upper heroes cannot enter an absent cabin or fall through its shaft to bypass transport. The lift stays usable after matching is complete.

## Vocabulary and validation
All five fruit blocks explicitly use size .95, weightClass light, requiredStrength 1. Both heroes can carry them. APPLE, BANANA and PEAR each match one unlabeled picture. Each correct match snaps, locks and glows cyan independently. Incorrect/decoy blocks remain retrievable without affecting other matches. All three correct matches power the existing cyan exit sequence; ORANGE and GRAPE are optional. There is no sentence puzzle.

Floor heights are checked for pickup, placement, movement, companion navigation and exit. An upstairs companion cannot teleport or route to the lower exit. Both heroes must physically reach the downstairs doorway.

## Camera and reset
All five rooms now allow a minimum mouse pitch of .154 radians, 30% below the former .22 limit. The maximum remains .95. Laptop views were inspected at 960x640 and 1366x768.

Reset restores original heroes, block coordinates/heights, empty matching slots, the lowered idle lift, activation history, closed door, cleared movement/companion/device state and unsolved circuits, including resets during travel.

## Validation
- 121 unit tests pass, including 16 Room 5 tests.
- Production TypeScript/Vite build passes.
- Room 5 real-keyboard route passes: either rider, Tab during travel, two required cargo blocks in one trip, fruit matching in a different order, retrieval of the upstairs teammate, physical team exit, and reset during motion.
- Room 4 real-keyboard route passes, including its new transition to Room 5.
- Shared camera limit checked through actual mouse input in all five rooms.
- Unit coverage includes five-block E placement without overlap and transport, two passengers, repeated/mid-motion toggle events, underneath pause/resume, jumping early/mid/late in both directions, wrong matches, locked matches, upper-floor pickup isolation, purple-plate holding after completion, release on player departure, front/side fence reach restrictions and absent-cabin bypass prevention.
- Screenshots and state snapshots: output/fruit-lift. A read-only code review was also completed; the final absent-cabin regression was added during local review.

## Files changed
New: src/elevator.ts, src/fruit-lift.ts, src/fruit-lift-chamber.ts, src/fruit-pictures.ts, src/volcanic-kit.ts, tests/fruit-lift.test.ts, tests/fruit-lift-playthrough.mjs, tests/fruit-visibility.mjs, this report, and Room 5 design/plan documents.

Updated: src/puzzles.ts, src/pressure-plates.ts, src/puzzle-visuals.ts, src/game.ts, src/team.ts, src/companions/companion.ts, src/main.ts, src/cooperation-chamber.ts, tests/cooperation-playthrough.mjs, package.json, README.md.

## Limits
This remains the existing deterministic game simulation rather than a general rigid-body physics engine. Blocks use safe placement instead of throwing. Browser verification used desktop Chrome; no physical school laptop was available. Vite retains its existing large-chunk advisory. No Room 6 was built.
