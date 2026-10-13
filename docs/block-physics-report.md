# Solid cubes and forgiving climbing — 2026-10-02

The screenshot bug came from collision checking only the hero while rendering the carried cube at a separate forward offset. Full upright box bodies now share their position and rotation with rendering. Oriented overlap and short swept samples guard walking, turning, jumping, pickup and placement, including another hero's held cube. Obstructed actions retain the cube; forward placement never searches to the side.

Room 7 supports centered stacks of small and large cubes. Forward aim tolerates imprecision, but the complete placement path and destination must be clear. Cubes resting on a support must be removed from the top first. A shared base-height helper keeps untouched floor cubes, placed cubes and stack tops aligned. Previously dropped cubes now receive the plate's actual height when placed, so they cannot become embedded and unretrievable.

The landing footprint extends .28 units beyond each top edge. Jumping toward a reachable cube grants one bounded assist per jump, with maximum supported rise of 1.85 units. It does not enlarge solid sides or allow repeated midair jumps. Both heroes can climb the large cube with an offset approach, then jump onto the cube stacked above it.

Lift and ferry movement carry complete support chains and grounded riders. Transport sweeps the group against stationary scenery and other cubes, pausing before contact and resuming when the obstruction clears. Co-moving cargo and lift rails retain their relative positions. This closes a reviewed case in which platform movement could intersect a held cube with the gallery or shore cargo and strand its carrier.

Occupied plates must be emptied before replacement; the interaction message explains the sequence. Existing browser routes now leave room for the full carried cube and turn around parked cargo. These are stable kinematic solids and supported stacks; they do not tumble or bounce.

Evidence is under `output/block-physics`, including the original source backup in `before-src`. The focused keyboard test earns JUMP, holds it against HEAVY, verifies no intersection, stacks it, and climbs both boxes from an offset approach. Actual contact, stacking and climbing screenshots were inspected. The existing smooth input, continuous facing and centered two-hand pose remain in use. Automated coverage does not replace a child playtest of the final feel.

Final core validation: 274/274 unit tests pass; production build passes with the existing bundle-size advisory. Focused jump/input and centered-carry browser tests pass. Independent transport review reran both reported failures at normal and one-second frame intervals and found no unresolved important issue. Full Room 5 and Room 7 keyboard playthroughs pass after the transport guard change. The develop-web-game smoke client completed and its screenshot was inspected.

Full keyboard routes for Rooms 1–7 passed during this change. Room 6's final run verifies three-cube lift cargo, incorrect/reversed pairs, removal and replacement of correct answers, team reunion/exit, zoom and reset. Its route now unloads the front cube first, exits through the open cabin side before turning, and approaches plates from the front.
