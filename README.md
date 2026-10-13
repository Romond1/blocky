# Be a Hero — Block World Escape

Prototype 0.3: eight connected volcanic rooms. Read → find → carry → arrange → escape. Room 3 introduces jumping and cooperative moving platforms. Room 4 adds hero pressure plates and GREEN ON RED stacking. Room 6 combines a timed crossing, lift transport and ordered color/fruit pairs. There is no mining, building, combat or inventory.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5188/** in Chrome to play Rooms 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. The development port is fixed at **5188**, with strict port checking; it does not use 5173. If 5188 is occupied, Vite reports an error instead of silently changing the URL. Nothing is deployed. To check a production build: `npm run build`, then `npm run preview`.

After restarting Windows, open Command Prompt and run:

```bat
cd /d "D:\AI\SET OUT\GAMES\Blocky World"
npm run dev
```

Keep that terminal running while playing. Dependencies only need `npm install` when first setting up or after dependencies change.

The **Replay Room 1 / 2 / 3 / 4 / 5 / 6** links at the upper left let you return to any training room. Selecting a room restarts it; R resets only the current room. Room progress is not saved when switching rooms.

Only one development server needs to run. If port 5188 is already in use by this game's server, play using the existing URL, or press Ctrl+C in the terminal running that server before starting another. The agent-started server was stopped after adding room navigation so you can run it in your own Command Prompt.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move relative to camera |
| Left mouse drag | Orbit camera / look around |
| Mouse wheel | Smooth camera zoom (bounded; R restores default) |
| Tab / Switch hero | Transfer control to the other hero in place |
| E | Pick up the nearest highlighted block; drop; place near a pedestal; swap with an occupied pedestal |
| Space | Jump (both heroes; taught in Room 3) |
| R / Reset button | Reset the current room, blocks, door and player |
| Backtick / Debug button | Toggle player position, carried block, socket and puzzle state |
| F | Toggle fullscreen; Escape also exits fullscreen |

Room 1 — The Training Chamber: starts as Mia with three scattered letters (A, E, X) and one square plate offset left of the door. Complete the large H _ R O inscription above the doorway with E. Both heroes can carry letters. Movement, looking, switching, picking up and rearranging are available immediately; hints are optional.

Room 2 — The Strength Chamber: repeats the letter puzzle and adds a HEAVY word block and a second plate. Either hero carries letters; only Yuki carries HEAVY. Mia can try it immediately and visibly struggles. Solve the plates in either order. Correct blocks remain removable, and removing one cuts its circuit and closes the gate. Both heroes must exit together to enter Room 3. This replaces the former Memory Vault in the active room sequence; the old chronology definition remains only as a regression fixture.

Room 1 retains its enlarged floor area (40% above the original); Room 2 uses a distinct 18-by-16 hall. Both use 0.95-unit letters and a 1.65-unit heavy block. Letters shuffle among three safe floor positions on reset. Use `?hero=yuki` for a Yuki start or `?choose=1` for the optional character picker.

All seven rooms use the shared circuit in `src/puzzle-visuals.ts`: beveled stone blocks with orange glyphs, square stone plates, visible orange conduits and an engraved stone door. A correct placement turns the glyph and plate cyan. Cyan energy travels toward the door for 1.8 seconds; the door turns cyan and starts opening only after all required circuits arrive. Wrong placements stay orange. Future rooms should use this same builder and the Game conduit state.

Room 3 — The Split Chamber: jump the safe entrance gap with each hero (Space, then Tab). A large floor schematic immediately beyond the hallway shows both pressure plates, the crossing and the two-lock exit, with live amber/cyan connections. Place STRONG on Yuki's heavy plate to cycle four retracting slabs. Mia can run across during their extended window. Complete J U _ P with M on the far bank to lock the platforms permanently and power the second door lock. Return and leave together. Falls land on a safe lower floor; its illuminated route leads to a ramp back to the starting bank. R restores both heroes, tutorial, blocks, slabs, map and locks.

Room 4 — The Cooperation Chamber: one continuous volcanic chamber with three connected sections. Either hero can stand on a purple plate to raise the see-through portcullis; Tab leaves that hero holding the device. A second purple plate holds the gate from the opposite side until both heroes reunite. Yuki moves HEAVY onto the orange object plate to cycle the shared four-slab bridge. Mia runs across and stands on the far purple plate to stabilize the crossing cyan, allowing both heroes to reach the color workshop. RED, BLUE, GREEN and YELLOW are light, letter-sized blocks that either hero can carry. Use E near a block top to stack it; the sign reads GREEN ON RED. The correct resting stack unlocks the final team exit. Falls land on a safe recovery floor and return stair. R resets all three sections, both actors, device holds and block supports. `npm run test:cooperation` runs the real-keyboard route and role reversal, saving screenshots under `output/cooperation`.

For direct testing, append `?room=2`, `?room=3` or `?room=4` to the local URL. The normal URL starts in Room 1. Reloading restarts at the room selected by the URL; R resets whichever room you are currently playing.

Room 3 is 36 units wide, with its entrance at the south end and a nearer solid rear wall at z=-4.5. The exit is at (-14, -4.5), and Yuki’s heavy plate is at (-12, 3). Its 12-unit crossing has a 2.55-second fully extended window, with a 0.8-second extension, 0.7-second retraction and a pause. Mia runs at 7 units/s; Yuki at 3.5. Both have the same jump impulse and air speed. The companion holds safely until both heroes reunite on the starting bank; carrying a block still preserves the existing hold behavior.


## Small architecture

- `src/game.ts`: plain simulation state, flat room collision, carry/drop/socket validation, gate clearance, escape and reset. No rendering dependency.
- `src/training.ts`: event-driven Room 1 lesson progression and first-time feedback.
- `src/training-ui.ts`: one current contextual tutorial instruction, key highlights and mouse cue.
- `src/blocks.ts`: explicit size/weight/strength definitions and plate compatibility.
- `src/puzzles.ts`: typed puzzle content, sequence answers, block choices and per-room layout (boundaries, spawns, pedestals and gate travel).
- `src/room.ts`: primitive volcanic scenery, readable canvas-generated text materials, pedestal and gate.
- `src/memory-vault.ts`: larger chamber, batched floor tiles, three glowing numbered pedestals, far-wall inscription and enormous second gate.
- `src/power-chamber.ts`: reuses the vault shell and pedestal builder, adding interior architecture, hero/episode stations, two locks and activated energy channels.
- `src/player-model.ts`: primitive placeholder and isolated optional GLB replacement loader. Player movement stays on the parent Group.
- `src/cooperation.ts`: Room 4 gate, physical section progression and longitudinal safe-floor definitions.
- `src/cooperation-chamber.ts`: connected Room 4 architecture using the shared volcanic kit and circuits.
- `src/pressure-plates.ts`: HERO/OBJECT activator filtering with grounded hero occupancy.
- `src/block-stacking.ts`: stable block support, forgiving placement and tower settling.
- `src/moving-bridge.ts`: four-slab render assembly shared by Rooms 3 and 4.
- `src/main.ts`: Three.js renderer, input, third-person camera, room transition with resource cleanup, visual state updates, sound and DOM feedback.
- `src/style.css`: sparse HUD and development controls.
- `tests/puzzle.test.ts`: puzzle recovery, reset, collision boundaries and safe drops.
- `tests/memory.test.ts`: sequence validation, no partial hints, swaps, movable decoys and larger-room collisions.
- `tests/power.test.ts`: stage activation, partial correctness, frozen completed stage, wrong-answer recovery, two-lock exit, obstacle/drop boundaries and reset.
- `tests/playthrough.mjs`: actual keyboard-driven browser playthrough with screenshots and error checks.
- `tests/memory-playthrough.mjs`: real keyboard playthrough covering rejection, rearranging, decoys and escaping Room 2.
- `tests/power-playthrough.mjs`: keyboard routes around solids, both staged puzzles, each structure's collision, exit and reset.

Room 3 adds optional `stages`, `blockSize` and `obstacles` to the existing data structures. `powerPuzzle.stages` holds the hero-powers and armor-episode content. The same `Game` handles every block. `stageSolved` represents the two locks: stage 2 accepts placements only after stage 1, and `solved` becomes true only after both stages. Collision footprints also block pickup/drop paths and keep the camera out of pillars. Room 2 retains its whole-sequence feedback rules.

## Future GLB models

Put `player.glb`, `kage.glb`, etc. in `public/models/`. Nothing in that folder is required to run. To opt in, import `replacePlayerModel` alongside `createPlayerModel` in `src/main.ts`, then call:

```ts
void replacePlayerModel(player, '/models/player.glb');
```

Call it after the placeholder is attached. The loader fits the visual to character height, centers its feet, and preserves the placeholder on failure. Models should face +Z, with Y up. No rigging or animation system is provided.

## Verification

```sh
npm test
npm run build
```

With the dev server running and Google Chrome installed, run `npm run test:browser` for Room 1 and its transition, `npm run test:memory` for Room 2 and its transition, and `npm run test:power` for Room 3. All default to `http://127.0.0.1:5188`; override with the `GAME_URL` environment variable if needed. Room 1 can also be tested with `npm run test:training`. Screenshots and results go under `output/training/`, `output/memory/` and `output/power/`. The diagnostic `window.render_game_to_text()` returns state; calling `window.advanceTime(ms)` switches simulation to manual stepping until reload, for reproducible tests only.

## Deliberately left for later

Final screenshot-level art, characters/pets, detailed textures, additional rooms, animation, mobile/touch input, menus, accounts, saves, multiplayer and deployment. This is a desktop mechanics prototype with flat collision and floating carried blocks, not a physical stacking simulation.

Reward template update: introductory plates moved another 1.4 units away from the door. Correct placement swells the plate and block, emits an expanding square ring and sparks, then sends a bright surge through a 0.22-unit central conduit with parallel tracks and smaller branches. The path bends into view beside the block. After the 1.8-second travel, the door charges cyan for 0.65 seconds before lifting. Plate/door lighting illuminates nearby stone. All effects reset when power is removed and replay on a new correct placement.


### Browser-language instructions

Introductory tutorial prompts appear high on screen, then dock in the task sidebar. They never block movement or switching. Browser language preferences select Japanese (`ja`, including `ja-JP`) or English (`en`, including regional variants), with English as the fallback when no supported language is requested. Instructions, control labels, objectives and feedback are localized; the English-learning puzzle letters and answer words stay English. Translations live in `src/instructions.ts` so more languages can be added without changing puzzle logic. Reload after changing the browser language preferences.

Room 2’s HEAVY block starts at X=6.1, Z=-0.3, on the far right with its plate clearly separate. Mia’s failed-lift hint remains visible for six seconds and explicitly says TAB switches to Yuki; switching remains available at any time.

Locale UI checks: `node tests/instructions-browser.mjs`. Japanese keyboard playthrough in PowerShell: `$env:GAME_LOCALE='ja-JP'; node tests/training-playthrough.mjs`.


### Tutorial checklist flow

In Room 1, the opening MOVE prompt appears higher on screen and waits for WASD/an arrow key. LOOK AROUND then waits for actual camera movement with the left mouse button held; neither prompt expires with time. Once both actions are recorded, the mission appears for 2.8 seconds, then the same panel animates into a right-hand checklist (Move, Look around, Complete HERO / power the doorway). The duplicate objective card is hidden in these introductory rooms. Pickup, strength and exit hints live below the docked checklist; the mission does not return to the center. Reset restarts onboarding. These prompts do not lock gameplay actions, and English/Japanese localization is preserved.

Verify this flow with `node tests/tutorial-docking-browser.mjs`.


### Room 2: a separate strength hall

Room 2 now uses a broad 18-by-16 floor plan, an exit offset to the northwest (X=-3.5), staggered letter/HEAVY stations, scattered blocks, a western rock ledge and an eastern pillar. Door visuals, collision, floor circuits, camera bounds and both heroes’ exit routing use the same configured exit center. Room 1 retains its layout.

Room 2 no longer repeats Move or Look around: its sole introductory action is **press TAB to switch hero**. Movement, looking and the on-screen switch button remain available, but do not dismiss the TAB lesson. After a successful TAB switch, the two-plate mission appears for 2.8 seconds and slides into a two-item checklist: switch hero; activate both pressure plates. English/Japanese translations remain active. Reset restarts this room-specific tutorial.


Room 1 also has world-anchored interaction banners: E / Pick up above the nearest reachable block, and E / Drop on the plate above its plate whenever the controlled hero carries any block. The drop cue is shown regardless of whether the letter is correct and does not require being close to the plate. Banners follow the camera, hide when their anchor is off screen, and are disabled in Rooms 2 and 3. Japanese browser settings translate the labels. Verify with `node tests/interaction-banner-browser.mjs`.


### Block interaction polish

Room 2 clears the TAB prompt for 0.45 seconds, then presents a gold-accented YOUR MISSION card for 2.8 seconds before docking. Yuki sees floating pickup/drop cues for HEAVY; Mia gets a TAB-to-Yuki hint instead. Room 1 retains its letter banners.

Floor and placed blocks now block player movement, with short collision steps to prevent tunnelling at Mia’s speed. Carried items do not block their carrier. Heavy placement accepts a wider 3.35-unit hero range or proximity of the rendered carrying position to the plate, while still checking walls. Mia’s flaming sword is mounted along her rear hip to narrow her silhouette. Its flames remain intact.

Checks: `node tests/heavy-polish-browser.mjs`, `npm test`, and the room playthrough scripts.

## Room 5 — The Fruit Lift

Open `http://127.0.0.1:5188/?room=5`. The broad atrium reuses Room 4’s volcanic kit with a visible upper balcony. Either hero can ride the lift and transport light word blocks. A fresh step onto a purple control toggles the lift; standing still never repeats it. The inactive hero holds position on a purple plate until selected and moved off. Board the cabin through its open rear; its front fence and side guards prevent shortcuts.

Match APPLE, BANANA and PEAR to the three downstairs pictures. ORANGE and GRAPE are optional decoys. Correct matches lock individually and turn cyan. Bring the upstairs hero back down before leaving together. R restores the lowered lift, heroes and all five blocks. All rooms allow a camera pitch down to 0.154 radians, 30% below the former minimum, for a better view upward.

`npm run test:fruit` checks the full keyboard route; `npm run test:visibility` checks camera limits and captures laptop views. See `docs/room5-report.md` for implementation and validation details.

## Room 6 — The Sorting Foundry

Open `http://127.0.0.1:5188/?room=6`. Yuki powers the familiar timed crossing with HEAVY; Mia reaches the far purple plate to stabilize it. Falls have a safe lower floor and return stairs. Use the shared lift to collect words from both levels, then arrange RED APPLE, GREEN PEAR and YELLOW BANANA beside their fruit pictures. Each correct pair turns cyan and remains removable; all three current pairs open the exit. Bring both heroes downstairs to leave together.

`src/lift-transport.ts` and `src/lift-view.ts` share Room 5/6 machinery. `src/sorting-foundry.ts` coordinates the crossing and ordered pairs; `src/sorting-foundry-chamber.ts` builds the volcanic room. `src/camera-distance.ts` supplies bounded smooth wheel zoom across every room. Run `npm run test:sorting` for the keyboard route and `node tests/camera-zoom-browser.mjs` for global zoom checks. See `docs/room6-report.md` for validation and practical limits.

## Room 7 — The Action Chamber

Open http://127.0.0.1:5188/?room=7. Reach visible RUN, JUMP and LIFT blocks: Mia overcomes an entrance-directed conveyor, either hero follows the existing jump route, and one large heavy block and three small light pieces build a small → big → small-on-big route to LIFT, transport both heroes and their light word blocks on the lava ferry, then match them to action pictures. Floors, walls, lava, gates, circuits, hero controls and economy reuse the existing room systems. Run npm run test:action for the keyboard playthrough. See docs/room7-report.md for details.

## Movement and carrying

WASD/arrows control travel and stop on release. Space jumps in place; hold a direction with Space to travel during a jump. Key chords remain held independently of keyboard repeat, and changing focus clears input. Space works after clicking a HUD button; Enter still activates a focused button.

Heroes turn continuously through intermediate angles, and adding a diagonal direction blends the travel heading. Brief direction taps allow finer facing adjustments; dragging the camera changes the world heading of movement continuously. Both hands blend into a centered carrying pose, with Yuki's shield stowed on his back. Free drops go directly ahead; a blocked drop keeps the cube in hand. Nearby puzzle plates retain their forgiving snap assistance. Turn toward another free spot when loading several cubes onto a lift.

Checks: `npm test`, `node tests/jump-input-browser.mjs`, `node tests/carry-movement-browser.mjs`. Screenshots and verification notes are in `output/movement` and `docs/movement-report.md`.

## Solid cubes and easier climbing

Carried cubes have their full visible volume: walking, turning, jumping, pickup and placement require clear space. A cube stops at other cubes and solid scenery. Remove an occupied plate's cube before replacing it.

In Room 7, face a nearby box and press E to stack the held box on top. Construction pieces allow stable offsets that expose lower steps; language blocks retain centered stacking. Remove the top box first when dismantling a tower. Small and large boxes have wider landing margins, and jumping toward a reachable box adds a small climb assist. Space plus a direction remains the only jumping control. Supported stacks and heroes standing on them travel together on lifts and the ferry.

Run `node tests/block-physics-browser.mjs` for carried-cube collision, and `node tests/action-stations-browser.mjs` for current station construction, elevated retrieval and climbing in Room 7.


Room 7 station revisions and verification: `docs/action-stations-report.md`. LIFT uses a 2.2-unit base, three .8-unit small pieces and a 3.8-unit ledge. The base moves at 40% of Yuki's usual speed. The elevated LIFT sign stands behind the word; JUMP's sign is compact. While standing on a block, another reachable block can be highlighted and picked up.

## Room 8 - The Ability Hall

Replay directly at http://127.0.0.1:5188/?room=8. The enlarged L-shaped hall teaches CAN through two guided three-word examples, two ordered RUN/LIFT sentences, then two ordered JUMP sentences. Correct sentences lock separately and show periods automatically.

The introduction has MIA CAN RUN on the left and YUKI CAN LIFT on the right. Each word has a labeled orange plate and a matching small cube directly in front; students place all three in order. Every Room 8 sentence cube is light and either hero can carry it. Two mechanical Sentence Carousels carry words on separate trays. Time a word into one of the two wide station-facing fence openings, hold the nearby purple brake, TAB to the other hero, then E to retrieve it. The low fence keeps other stopped words unavailable; release and brake again to align another word. Openings allow off-center pickup, and the pole beside the second machine has been removed. Empty trays stay empty until reset. The first machine turns clockwise at .22 radians/second; the second turns counterclockwise at .264 radians/second (20% faster). Both brake and accelerate over .3 seconds.

The first purple plate holds the open barred corner gate. The other hero crosses to the matching purple plate on the far side, holding the gate while the first joins them. Before reunion, leaving a plate closes the gate. As in Room 4, both heroes reaching the far side latches the gate open. The RUN and LIFT banks have separated floor frames and independent paths. Both completed banks unlock the JUMP area with a gradual gate lift and gold success effect. Its carousel includes RUN and LIFT decoys, while both answers require JUMP. Completing MIA CAN JUMP and YUKI CAN JUMP opens the centered exit directly, without final hero plates; both heroes leave together. In Room 8, the secondary hero stays parked in the main puzzle area and near pressure pads until the room is solved, then walks to the exit.

R restores the room and both heroes; coins and shards remain collected. Required words recover from lava, walls, closed gates and unreachable positions without clearing completed sentences. There are nine coins, one exit Heart Shard and no Memory Crystal. Room 8 ends at completion.

Run `npm run test:ability` for the full keyboard route. Unit coverage is included in `npm test`. The main chamber is 43.8 × 47.6 world units, with separate stations on either side of the machines. Implementation and verification details: [Sentence carousel report](docs/sentence-carousel-report.md).


## Final sequence foundation

Room 8 now leads into the Room 9 opening Heart assembly video and playable Heart Gauntlet. Open [Room 9](http://127.0.0.1:5188/?room=9) or inspect [Room 10 — The Dragon’s Cave](http://127.0.0.1:5188/?room=10) directly. Room 10 is a broad irregular volcanic ring with a large central lava basin and an inactive final Heart destination; final puzzles and ending are reserved for a later task.

Both heroes carry the Heart with E. Tab leaves the original carrier holding position. Lost Hearts recover to the latest safe checkpoint. The supplied assembly MP4 plays automatically at the beginning of Room 9, scaled to fit with margins; use Sound on to enable audio. R resets the room and replays the opening. Economy progress stays in its existing save.

Details and video configuration: [Finale foundation](docs/finale-foundation.md). Tests: `npm test`, `npm run build`, `node tests/finale-browser.mjs`, `node tests/finale-video-browser.mjs`.


## Mobile play and player interface — 11 October 2026

Phones now use a landscape prompt, analog joystick, JUMP / ACTION / HERO buttons and right-side drag camera. Controls can be overridden on the welcome screen or in Menu. Desktop bindings remain. Menu contains Reset Room, unlocked-room replay, control/graphics settings and help. Progress is local and preserved by room resets/replays; production URLs cannot unlock new rooms. Direct room URLs in older sections of this README are development-server fixtures.

Teacher tools are hidden: tap the pause title five times, then enter 1001. This is a local convenience gate, not authentication; destructive reset requires confirmation. Nothing has been deployed.

The current Room 10 includes the existing cooperative gate, timed slabs/ferry, construction/lift, language carousel, Heart altar and endings. Its gate shortcuts, floor/render mismatch, missing scenery collision and falling-checkpoint exploit have been repaired. See [full mobile/player report](docs/mobile-player-report.md) and [Room 10 audit and next-pass proposal](docs/mobile-room10-repair.md) for controls, files, validation and physical-device checks.

Run `npm run test:mobile` against Vite. For built-site verification, run `npm run preview -- --port 5189 --strictPort --base /blocky/`, then `npm run test:touch-puzzle`.
