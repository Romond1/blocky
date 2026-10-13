# Room 8 — Sentence Carousel rework

The second/main section now uses two physical machines. The introductory chamber teaches both full sentences using three labeled orange plates per sentence and six matching small cubes staged directly in front. Mia remains on the left and Yuki on the right. The corner portcullis, CAN curriculum, hero controls, nine coins, exit Heart Shard and economy persistence remain intact. Rooms 1–7 retain their authored layouts and mechanics.

## Layout and camera

The main chamber spans x=4.2…48 and z=-33.6…14: **43.8 × 47.6 world units**, widened from 29.4 units (49%). It adds 685.44 square units eastward without uniformly scaling the intro, blocks or pads. The overall footprint keeps its L corner and hidden chamber reveal. The exit is centered at (25,-33.6); its Heart Shard follows it with the same persistent ID. Existing coin coordinates and low coin-support steps are preserved.

Carousel A sits at (25,0); B at (25,-22). Both use a 5.3-unit tray radius, an 11.9-unit visible base diameter and a 13.28-unit hero exclusion diameter. First sentence stations are centered at (10,-4.5) and (40,-5.5); final stations at (12,-25) and (40,-26). Station centers are 28–30 units apart, with 3.36-unit socket spacing. Construction requires carrying words away from machinery, with clear walking paths on both sides. The phase gate spans the enlarged chamber.

Room 8 uses a 65° default field of view, retaining camera distance 6 and optional wheel zoom. The introductory chamber also uses this wider framing to show its six labeled plates and staged cubes. Screenshots cover both machines at normal distance, plus 960×640 and 1440×900 views. At the smaller viewport, the existing HUD partially covers the distant left picture from the brake viewpoint; ordinary mouse look can reveal it. Nearby moving words and the purple brake remain readable.

## Reusable machinery and trays

`src/sentence-carousel.ts` is scene-independent. Each configuration defines id, position, radius, speed, direction, word block IDs, brake socket ID and optional initial angle. It owns signed velocity, continuous angle, brake state and attachment membership. It supports arbitrary word pools and slot counts. `src/sentence-carousel-view.ts` builds an octagonal base/hub, axle, rotating ring, radial arms, gears, individual metal trays and bearings, brake clamps and a purple control conduit. Trays swivel to keep their cubes aligned/readable while their carriers orbit. Orange and cyan accents distinguish the machines.

| Machine | Pool | Direction viewed from above | Speed | Revolution |
| --- | --- | --- | --- | --- |
| A | MIA, YUKI, CAN, CAN, RUN, JUMP decoy, LIFT | Clockwise | 0.22 rad/s (~12.6°/s) | ~28.6 s |
| B | MIA, YUKI, CAN, CAN, JUMP, JUMP, RUN decoy, LIFT decoy | Counterclockwise | 0.264 rad/s (~15.1°/s), 20% faster | ~23.8 s |

Both run from room entry, including while the second area is gated. There is no step-to-advance activation or automatic stopping.

## Brake, switching and word ownership

Purple HERO plates at (25,8.3) and (25,-13.3) brake their corresponding machine while a grounded hero occupies them. Stopping and acceleration each take 0.3 seconds. Leaving, jumping off or otherwise releasing a plate restarts rotation. TAB reuses existing presence-based HOLD_POSITION, so a brake operator remains still while the other hero retrieves and constructs sentences. Rapid switching preserves brake state and cargo ownership.

Each machine now has a **1.24-unit-high see-through fence with exactly two openings**, angled toward its left and right sentence stations. Each opening spans about 41° and is approximately 4.37 units wide at the fence radius of 6.2. The word pickup window is about 36° total, more than twice the original narrow allowance. A stopped word visibly within the opening can be retrieved off-center; the hero must approach through that same opening. Other fence sectors remain unavailable, including while jumping. Fence rails and posts share the simulation's exact complementary arcs for rendering and carried-cube collision. The tall hall-spire beside the second machine's right opening was removed from both scenery and collision.

Moving attachments have no normal E pickup prompt. E uses existing pickup-volume checks when the machine is effectively stopped, removes attachment ownership and creates ordinary carried language cargo. The tray remains empty through subsequent rotations. Completed socket words stay locked and never return to the carousel. **All main words are LIGHT, size 0.95, requiredStrength 1**; both heroes can carry them. Only the preserved introductory LIFT boulder is heavy.

Ordered validation, independent locks, cyan socket success, sentence periods, action pictures, conduits, phase gate still use existing puzzle rules. Completing both final JUMP sentences opens the centered door directly, without final hero plates. No new grammar or controls were added.

## Collision, companion and recovery

A simple swept-footprint exclusion keeps heroes outside both machines at every height. Central machinery also has carried-block volume collision. Words cannot serve as moving landing platforms. There is no damage, crushing, riding or flinging mechanic.

Companion navigation excludes machinery and approaching brake plates, including after a phase completes. In Room 8, the secondary hero stays parked throughout the main puzzle area and near all pressure pads until the door opens; team-exit navigation then resumes. Companions never write puzzle blocks or activate brakes autonomously. Existing held-cargo and airborne/platform hold behavior remains.

Removed words recover to safe floor-marked zones at (39,9) or (39,-14), choosing nearby free space when occupied. Recovery handles lava/excessive height, walls, closed gates, machinery and bounds; completed sentences stay intact. Recovered words remain detached rather than being restored to a moving tray.

Room reset creates fresh carousel instances, restoring initial angles, configured signed speeds, every tray attachment, all blocks, brakes, sentence state, gates, actor motion, companion state and exit. Existing collected coins/shards stay collected.

Event hooks: CAROUSEL_RUNNING, CAROUSEL_BRAKE, CAROUSEL_STOPPED, CAROUSEL_RELEASE and WORD_REMOVED_FROM_CAROUSEL. These use existing Game events; no new mechanical sound assets were sourced.

## Files changed

- New: `src/sentence-carousel.ts`, `src/sentence-carousel-view.ts`, `tests/sentence-carousel.test.ts`, `tests/carousel-ports.test.ts`.
- Room 8: `src/ability-layout.ts`, `src/ability-hall.ts`, `src/ability-hall-view.ts`.
- Shared integration guarded by Room 8: `src/game.ts` (pickup/hold/reset/landing), `src/main.ts` (camera, shadows, inspection bounds), `src/team.ts` (Room 8 parking and completion release).
- Updated verification: `tests/ability-hall.test.ts`, `tests/ability-hall-browser.mjs`.
- Documentation: `README.md`, `progress.md`, this report, `docs/superpowers/specs/2026-10-02-sentence-carousel-design.md`, `docs/superpowers/plans/2026-10-02-sentence-carousel.md`.

## Verification

- `npm test`: **326 passed**, zero failures. Includes preserved intro/cooperation/economy checks, ordered wrong variants, independent completion, recovery, final exit, both hero brake operators, rapid TAB, moving pickup rejection, empty trays, exact reset poses, frame-step rotation equivalence and alternate slot counts.
- `npm run build`: passed TypeScript and Vite production build. Existing large-bundle advisory remains (~746 kB minified, ~213 kB gzip).
- Full Room 8 keyboard route: passed starting as both Mia and Yuki with the final fence and forgiving opening settings. Each attached word is timed into its station-facing opening by physically releasing the brake, waiting for rotation, walking back onto the plate, switching heroes and retrieving it. This includes wrong-order correction, automatic final-sentence door opening, companion release, centered team exit and persistent reset.
- `npm run test:action`: passed the full Room 7 construction, conveyor, jump, ferry cargo, matching, team-exit and reset regression route.
- Required develop-web-game skill client: passed, entrance screenshot inspected; no captured application errors.
- Inspected both machines and completed sentences at default camera distance. Browser route records a small-screen brake view, centered final exit, persistent reset and console errors.

Artifacts: `output/sentence-carousel/mia/`, `output/sentence-carousel/yuki/`, `output/sentence-carousel/smoke/`, `output/sentence-carousel/fenced-smoke/`.

## Practical limits

Mechanical sound hooks are present without new sound recordings. Machines use simple collision and visual bearings, rather than rigid-body rotating platforms. Only words aligned with the two openings can be retrieved. The remaining words require releasing the brake and timing another stop. A single familiar JUMP decoy remains on the first machine after its required sentences are built. Children may still use ordinary mouse look to inspect side stations, particularly on smaller screens.

Room 8 ends after the team exits. No Room 9 was created.

## Final exit and companion revision
The exit is now centered at (25,-33.6), between the JUMP stations and directly beyond the second carousel. Both final sentence conduits converge on it. The old final purple pads were removed; MIA CAN JUMP and YUKI CAN JUMP completion directly opens the door. The Heart Shard retains its ID and persistence and follows the relocated exit.
Room 8 companions stay where left throughout the main puzzle area and within three units of a pressure pad until the exit opens. This includes pickup mouths, brake plates and sentence stations. On completion they resume normal exit navigation; other rooms retain their original behavior. The first corner cooperation gate is preserved.

Introductory teaching stations now match the later left/right arrangement: Mia on the left, Yuki on the right, both at z=23.8. Each picture, fixed sentence, action pad and loose block follows its station. Existing heavy LIFT and corner cooperation remain intact. Verified 326 tests, production build, full keyboard route and visual smoke capture.

First carousel completion now lifts the dividing gate gradually over 2.2 seconds using smooth easing, gold highlights and rising gold sparks. Gate collision follows its visible height. The second carousel now carries eight matching light word cubes: MIA, YUKI, CAN, CAN, JUMP, JUMP, RUN and LIFT; RUN and LIFT are decoys and do not solve either JUMP station.

The latest introductory revision replaces fixed prefixes and the large LIFT boulder with six equal small, light word cubes. Ordered validation requires MIA/CAN/RUN and YUKI/CAN/LIFT on their three corresponding plates. Earlier notes about the heavy introductory LIFT reflect the previous revision. Full keyboard playthrough validates the new six placements, both carousels, animated gate, team exit and persistent reset.

Wrong-word helper: each occupied orange plate compares its word to the sentence position immediately, even before all three slots are filled. A mismatch gets a subdued reddish-orange plate tint (0xf04418), sustained until removed or corrected. No success swell, beam, particles or red conduit effect; matching partial words retain orange and full sentence success retains cyan. Verified 327 unit tests and production build; inspected wrong-order screenshot showing two reddish plates beside the correctly placed orange RUN plate.
