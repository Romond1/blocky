# Room progression and circuit visuals

Implemented from the September 29 video, screenshots and latest user layout clarification. These supersede the earlier two-plate Room 1 and Memory Vault Room 2 designs.

- Room 1: A/E/X, one plate left of the doorway, E completes HERO.
- Room 2: A/E/X plus HEAVY, two independent plates; only Yuki carries the heavy block. Free-order interactions and optional hints remain.
- Room 3: existing staged puzzle with the same stone blocks, square plates, circuit feedback and patterned gate.
- Introductory word tiles are larger and above the arch; the missing slot has a dashed frame. Plates are several units in front of and beside the door, leaving visible floor conduits.
- Correct placement lights the glyph/plate cyan immediately. The circuit fills over 1.8 seconds. The gate remains orange and closed until all required flows arrive, then lights cyan and rises. Removing a required block resets that circuit and closes the gate.
- Shared implementation: src/puzzle-visuals.ts. Puzzle state/timing: src/game.ts. Future rooms should use the shared circuit builder instead of bespoke plate or gate colours.

Validation: 49 simulation tests; production build; keyboard playthroughs of both introductory rooms with both heroes and of Room 3. Browser screenshots are in output/training and output/power. Build retains the pre-existing bundle-size advisory.

Reward template update: introductory plates moved another 1.4 units away from the door. Correct placement swells the plate and block, emits an expanding square ring and sparks, then sends a bright surge through a 0.22-unit central conduit with parallel tracks and smaller branches. The path bends into view beside the block. After the 1.8-second travel, the door charges cyan for 0.65 seconds before lifting. Plate/door lighting illuminates nearby stone. All effects reset when power is removed and replay on a new correct placement.
