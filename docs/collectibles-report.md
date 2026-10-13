# Phase 1 collectibles / economy

Implemented October 1, 2026.

## Content

| Room | Hero Coins | Heart Shards |
|---|---:|---:|
| 1 Training Chamber | 5 | 1 |
| 2 Strength Chamber | 6 | 1 |
| 3 Split Chamber | 7 | 1 |
| 4 Cooperation Chamber | 8 | 1 |
| 5 Fruit Lift | 8 | 1 |
| 6 Sorting Foundry | 9 | 1 |

Edit placements in `src/collectible-data.ts`. Positions specify supporting floor height, with floating visual offsets applied by the view. Stable IDs must remain stable when moving a collectible. Room 3 and Room 6 have safe recovery coins; Room 5 has a stair coin and two upstairs coins. All rooms include obvious, exploration and sneaky placements.

Heart Shards appear when the solved exit clears (door lift > 2.8), directly at the doorway approach. Shard radius is 1.6 units and coin radius 1 unit, with height separation and static wall checks. Only `Game.player`, the controlled hero, collects. Puzzle and team exit logic are unchanged, and collectible state is not an exit requirement.

## Architecture

- `src/economy.ts`: shared integer wallet, stable collected IDs, derived shard/room totals, atomic rewards, `addCoins`, `canAfford`, `spendCoins`, and explicit reset.
- Persistence uses a single `be-a-hero:economy` localStorage key with a version 1 document. Malformed/unsupported saves start fresh; denied reads/writes leave session collection operational. Room reset and replay preserve IDs even after spending coins.
- `src/collectibles.ts`: pickup rules and event emission, independent of rendering.
- `src/collectible-view.ts`: shared room resource kit, original gold H tokens, irregular translucent golden shards, bob/rotation, five lightweight shard sparkles and short attraction/flash effects. Room teardown disposes these resources through the existing lifecycle.
- `src/collectible-ui.ts`: shared wallet, content-derived shard denominator, current-room coin count, coin pulse and shard toast retained through transitions.
- Collection emits Game event strings and window CustomEvents `HERO_COIN_COLLECTED` / `HEART_SHARD_COLLECTED` with ID/room/value details, ready for audio listeners. No sound assets added.
- Development-only reset lives behind the existing Debug toggle. Production has no economy reset element. Debug text and `render_game_to_text` include economy/progress; the latter also reports individual IDs, positions, visibility and collected state.

No Memory Crystals, secret rooms, shop, abilities, accounts or backend integration were added.

## Validation

- `npm test`: 164 tests pass, including persistence, configurable reward values, invalid currency amounts/saves, duplicate protection, controlled hero ownership, vertical separation, shard gating, placement support and zero-collectible exits.
- `npm run build`: TypeScript and Vite production build pass. Vite reports its bundle-size advisory.
- `npm run test:collectibles`: all six rooms pass real-keyboard first pickup, HUD counts, refresh/reset/replay duplicate protection, hero switch and development economy reset checks.
- `node tests/collectibles-production.mjs`: built game collects and persists correctly; economy reset remains absent with Debug open. Test server closes after the check.
- Existing real-keyboard training, power, cooperation, fruit lift and sorting foundry playthroughs pass, covering all six rooms and their current mechanics. Recorded exit snapshots contain the respective shard IDs; the training route asserts both Room 1 and Room 2 shards explicitly.
- Desktop and 960×640 HUD screenshots reviewed. Room 1 screenshots show the golden shard in the open doorway, collection effect and dynamic toast. The coin HUD uses an original H token icon after screenshot review found platform emoji font fallback.
- A stricter movement-support regression test caught a Room 5 placement beneath the cabin. It was moved to the existing east recovery stair without changing geometry.

Evidence is in `output/collectibles/`, `output/training/en-US-room1-shard-visible.png`, and `output/training/en-US-room1-shard-found.png`, with other room playthrough screenshots/state snapshots in their existing output directories. Placements are an initial pass for later tuning; not every optional coin route was individually traversed in browser automation.
