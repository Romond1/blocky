# Room 6 — The Sorting Foundry

Design for review, based on the supplied Room 6 request and inspection of the existing room simulation, room builders, team controller, companion navigation, bridge, elevator, block placement and volcanic kit.

## Layout

Use a long asymmetric volcanic chamber with three connected spaces. The southwest entrance court contains the heavy boulder and orange plate. A sideways four-slab crossing leads east across a central channel, then the route turns north into an offset gallery and sorting hall. Basalt housing prevents walking around the timed crossing. Lava borders the safe recessed recovery floor; the floor itself never damages heroes.

Reuse the existing bridge cycle unchanged. A purple control on the far bank permanently stabilizes the crossing, following Room 4, so Yuki and transported words can return safely. The lower recovery stair returns only to the entrance bank and cannot bypass the crossing.

The northern gallery has an upper floor five units above the sorting hall. An elevator connects the levels; there is no walking or jumping shortcut to the required upper words. The final door is offset from the entrance axis. Existing floors, jagged cave shell, pillars, slab ports, rails and conduits provide wayfinding.

## Devices and transport

Yuki moves the existing heavy-class boulder onto the orange plate. This powers bridge cycling and its conduit, without powering the final door. Mia retains her existing speed advantage and the same jump behavior.

Reuse Elevator, including occupancy-edge toggling, no queued commands during motion, exact passenger/cargo displacement and underneath obstruction handling. Extract only layout-dependent configuration and shared rendering/transport helpers needed to use the Room 5 implementation in both rooms; retain Room 5 defaults and behavior. Purple controls operate from both landings. Multiple loose blocks and both heroes can ride together.

Upper words: RED, PEAR, YELLOW and ORANGE. Lower words: APPLE, GREEN, BANANA, BLUE and GRAPE. All nine word blocks use LIGHT_BLOCK (.95 units, light, requiredStrength 1). The boulder is the only heavy object. Word blocks carry text; fruit pictures appear only at targets.

## Language stations

Three independent stations display RED APPLE, GREEN PEAR and YELLOW BANANA beside the existing fruit illustrations. Make the pear unmistakably green while preserving Room 5's illustration default. Each station has adjacent left color and right fruit sockets. Placement reuses existing E pickup, forgiving socket snap and swap behavior.

Validate complete ordered pairs. Wrong pairs, reversed order and decoys give brief gentle feedback. Unrelated correct stations retain their state. Correct pairs activate cyan rims, a subtle pulse, the picture illumination, their conduit and one of three environmental indicators.

Correct blocks remain removable. Removing one invalidates only its own pair and its energy branch; replacing the correct pair restores it. The door requires all three current pairs, with the existing charging sequence. Display SORTING COMPLETE when all three become correct. Preserve safe passage clearance if a door begins closing while heroes occupy it.

## Team and recovery

Keep physical hero identity and carrier ownership through Tab. Both actors continue falling safely during handoff. Companion navigation excludes timed slabs, lava, elevator controls and level transitions. Reuse HOLD_POSITION and RIDE_ELEVATOR in critical areas; permit existing exploration at safe interest points. Disable off-camera relocation in Room 6. The companion never manipulates blocks or solves stations.

Both heroes must physically reach the downstairs exit. Upper companions and companions on other banks cannot satisfy the exit through horizontal proximity. Recovery and safe placement must keep words accessible, including placements near the upper edge and recovery floor. No fall resets puzzle state.

## Camera and integration

No mouse-wheel zoom exists in the current implementation. Add global smoothed camera distance, default 6 units and bounded approximately 4–9 units, with wheel up closer and wheel down farther. Preserve mouse look and hero-switch interpolation. Evaluate obstacle clearance at the hero's actual elevation. Default zoom must support completing the room.

Register Room 6 in replay navigation and transition Room 5 into it. Reset restores boulder, word coordinates/heights, sockets, bridge, elevator occupancy history, motion, companion holds, energy, gate and default camera distance. Do not add Room 7 or any new puzzle controls.

## Verification

Add simulation tests for ordered pairs, decoys, removal, arbitrary solve order, heavy struggle, unchanged bridge timing, safe fall/handoff, transport of several blocks and two riders, repeated toggles, reset in partial states and physical team exit across levels. Run existing unit and build checks and Room 3–5 keyboard regressions.

Add a Room 6 keyboard playthrough covering the boulder, failed crossing/recovery, successful Mia crossing, permanent return route, both elevations, multiple cargo, wrong/reversed placement, solving in another order, teammate retrieval and final exit at default zoom. Inspect entrance, crossing/recovery, gallery, targets and small-window screenshots. Report verified outcomes and any untested chaos cases explicitly.

## Alternatives considered

Recommended: sideways crossing followed by an offset upper gallery. It changes path direction and sightlines while retaining existing mechanics.

A northbound crossing would need fewer layout changes but would resemble Room 4. A tall central lift tower would resemble Room 5 and overemphasize verticality. Neither fits the requested architectural distinction as well.
