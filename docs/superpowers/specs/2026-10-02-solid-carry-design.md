# Solid carried blocks

User request: cubes must behave as physical objects; carried JUMP visibly intersected HEAVY in Room 7.

Root cause: collision considers the hero footprint and skips every carried block. Rendering independently attaches cubes at a forward offset. Smooth yaw rotates that offset through solids without any query. Pickup and placement also change block state without testing the swept volume.

Use stable kinematic collision bodies matching cube size, yaw and height, with oriented-box SAT and short swept steps. Bodies remain in simulation; rendering consumes the same pose. Reject obstructed pickup/placement, stop carried movement/turns at contact, allow retreat and sliding, and include the other hero's carried cube. Check vertical jump motion so landing cannot lower cargo into another block. Validate room walls/obstacles and cube volumes. Preserve authored stable support/stacking rather than adding bouncing rigid-body dynamics to word puzzles.

Tests: screenshot-equivalent light/heavy contact, corner rotations, long-frame sweeping, held-vs-held, pickup paths, vertical landings, walls, placement and unobstructed movement. Then browser reproduction and relevant room completion regressions. Preserve a source backup in output/block-physics/before-src.

Expanded user scope: make small and large cubes easier to climb, with generous top hitboxes, and support building stacks in Room 7. Add .28 units to the landing footprint, one bounded assist per jump toward a reachable cube (maximum rise 1.85), forgiving forward stack aim with centered stable support, and top-first removal. Do not expand the solid side volume, which would make approaching boxes harder. Move the entire support chain and grounded riders together on transport; guard platform-driven cube motion against static scenery and other cubes.
