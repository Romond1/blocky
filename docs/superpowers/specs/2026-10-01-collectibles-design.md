# Phase 1 collectibles

Approved in chat on October 1, 2026. Add 5/6/7/8/8/9 Hero Coins and one Heart Shard to each existing room without changing puzzles or geometry. A registry provides stable IDs, room IDs, positions, configurable values and placement categories. Heart Shards become visible when the exit opens and sit in its natural approach.

An isolated Economy owns the shared integer wallet and collected IDs. Collection is synchronous and idempotent. A single versioned localStorage document persists progression; unavailable or malformed storage falls back to session state. Room reset and replay preserve progression. Explicit development-only economy reset clears it. Currency exposes addCoins, canAfford and spendCoins.

Only the controlled hero collects through forgiving horizontal proximity and height checks. Rendering shares geometry and materials per room. Coins spin and bob; irregular translucent golden shards glow and bob. Short attraction/flash effects do not pause gameplay. Collection emits audio event hooks. Compact HUD shows wallet, shard total derived from content, and room coin progress. Shard feedback lasts across room transitions.

Verify persistence, duplicate protection, spending validation, controlled hero ownership, vertical separation, exit gating, safe placements, reset/replay and transitions using unit tests and browser checks. No shop, abilities, Memory Crystals, secrets, accounts or database work.
