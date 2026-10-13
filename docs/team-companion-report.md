# Team companions and hero switching

## Files changed

- src/companions/companion.ts — shared deterministic companion states, named interest points, grid navigation, avoidance, reactions and recovery.
- src/team.ts — persistent actors, input ownership, switching, spawn placement, event bridge and team-exit coordination.
- src/game.ts — per-hero carried-block ownership and an explicit option to defer the old single-player exit check to the team coordinator. Puzzle answers and validation are unchanged.
- src/main.ts — two persistent hero views, Switch hero overlay, camera blend, per-owner carry rendering, team update, waiting prompt and debug data.
- tests/team.test.ts, tests/team-browser.mjs — new simulation/browser regression coverage.
- tests/playthrough.mjs, tests/memory-playthrough.mjs, tests/power-playthrough.mjs — exit assertions allow time for the teammate to arrive.
- Production dist rebuilt. Character models, room geometry and materials are unchanged.

## Ownership and switching

Exactly two actor records and two model hierarchies exist throughout the adventure. HeroTeam selects one input owner; its single HeroCompanion controller operates the other actor. Changing selection rebinds ownership without allocating another model, resetting the room or altering puzzle/block state. The newly controlled hero starts at their own current position and facing. Initial selection alone assigns the chosen hero to the room's player spawn.

The existing selector is now reopened by Switch hero. Simulation, input, companion timers, door movement and environment time pause underneath it. Selecting the current hero simply resumes. Switching interpolates camera position and look target for 0.55 seconds while allowing immediate movement; ordinary follow/orbit controls remain as before. A block already carried remains attached to its original holder and becomes interactable again when that hero is controlled. The companion never initiates any pickup, drop, swap, placement or validation.

## Autonomous behavior and navigation

States: IDLE, EXPLORE, INSPECT, WATCH_PLAYER, LOOSE_FOLLOW, CATCH_UP, REACT, GO_TO_EXIT, WAIT_AT_EXIT and ROOM_TRANSITION. Mia explores somewhat farther/faster; Yuki watches more and favors generic mechanisms. Interest points do not use block labels, answer IDs or solution values. Seven authored points in Room 1, eight in Room 2 and nine in Room 3 cover lava viewpoints, rock/pillars, generic puzzle viewing areas, entrance and door architecture. Inspections last 2–6 seconds.

Navigation uses a half-meter four-neighbor grid, collision checks shared with the game and conservative footprints for movable blocks. Each search is capped at 9,000 visited cells. Short segment checks prevent crossing solid corners. Plans occur on decisions or obstruction retries, with a one-second retry cooldown, rather than every frame. The NPC yields around the player and avoids the camera-player corridor. The player is never blocked by an NPC collider.

Blocked movement accumulates for three seconds before reselection/retry. Repeated failures permit repositioning only to a validated, nearby off-camera point. Recovery is not used during ordinary travel. Exit candidates are also considered when the exit is available.

## Team exits

Opening the gate emits a reaction event. After a short look/pause, the companion routes to the exit and waits to one side, facing the player. If the player arrives first, the contextual hint says Wait for Mia/Yuki; player movement remains available. Only solved puzzle + cleared gate + both actor positions in the exit zone permits transition or final completion. Both persistent heroes receive separate valid spawns in the next room (normally two meters apart). Reset restores both actors and the current room.

## Debug and future extension points

Debug displays selected hero, companion, state, target, distance and both exit flags alongside existing puzzle diagnostics. Read-only render_game_to_text also includes both actor positions, current route, plan/recovery counters and last event.

Companion events have a subscribe/unsubscribe hook for future subtitles/audio without a dialogue tree. The controller is explicitly a hero-companion role and receives spatial data, not puzzle solutions or mutating puzzle APIs. A future guide/scout should be a separate role/controller with its own hint policy, reusing navigation as needed. No Kage, hints, combat, dialogue content or Room 4 added.

## Validation and limitations

26 unit/simulation tests cover both configurations in all rooms, independent exploration/inspection, unchanged blocks and attempts, atomic position switching, carried ownership, legal interest points, pillar routes, both exit arrival orders, bounded replanning, catch-up and delayed off-camera recovery. Browser team tests cover six room/hero configurations, paused overlay, input ownership, camera interpolation, reset, held blocks and preservation of a genuinely solved puzzle/door state. Picker tests cover keyboard and narrow viewport. Full keyboard playthroughs run sequentially for both heroes across all rooms, with console errors collected.

The navigation grid produces simple deliberate routes rather than full crowd simulation. The companion is non-solid and may briefly overlap the player if the player walks directly into them; it then yields. Camera transfer blends between valid follow-camera poses but does not perform a cinematic collision sweep between the endpoints. Last-resort recovery waits for a safe off-camera candidate rather than visibly popping. A carried object remains with its original hero, including while they walk autonomously; AI cannot manipulate it or use it as a hint. Two animated characters cost more than one; no additional lights, effects or model copies are created by switching. Further device-specific performance and behavior tuning awaits user playtesting.
