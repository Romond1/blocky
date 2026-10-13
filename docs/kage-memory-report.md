# Kage memory enclave and testing reset

Implemented Room 4's right-hand starting court at (6, 22), with a wider initial camera view that shows the controlled hero and first pressure plate. The introductory coin follows the new spawn.

Room 3's far jump-bank wall conceals a proximity-opening basalt door at (16.4, -4.5). A dark, character-width corridor turns left into a blue-and-gold enclave using all three supplied Kage images. WOLF, FOX and SPIDER are light blocks usable by either hero. Only WOLF on the optional plate opens the separate memory gate. A large blue crystal behind it awards a persistent shared memoryCrystal identity. It never contributes to the main two locks, bridge, exit, coin count or Heart Shard total.

The memory HUD remains hidden at zero; after collection it displays only the collected count, without a total. Normal room reset preserves collectibles. The visible Reset ALL · TEST button clears the entire shared economy, resets the team tutorial and returns to Room 1. Remove the clearly commented temporary testing-control block in src/main.ts when testing ends.

Verification:
- npm test: 177 passed.
- npm run build: passed.
- node tests/kage-alcove-browser.mjs: actual keyboard route through Room 3, optional entrance, FOX rejection, WOLF success, blue crystal collection, return route, team exit, persistence across rooms/reload and full testing reset passed. No browser errors.
- node tests/cooperation-playthrough.mjs: Room 4 mechanics and exit passed with relocated spawn.
- node tests/collectibles-browser.mjs: all six rooms, ordinary resets, reload persistence and economy reset passed.
- node tests/jump-input-browser.mjs: both heroes' Space-only lunge and released/stale/focus-loss movement checks passed.

Screenshots: output/kage/12-hidden-room.png, output/kage/14-crystal-collected.png, output/kage/room4-start.png.
