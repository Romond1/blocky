# Room 6 — The Sorting Foundry

The sixth room follows The Fruit Lift and can be replayed at `http://127.0.0.1:5188/?room=6`. Its asymmetric 32-by-56 chamber connects a southwest arrival bank, a safe lower recovery floor, an eastern lift/gallery and a northern sorting hall. No new gameplay controls are required.

Yuki moves HEAVY onto the object plate to run the existing four-slab bridge cycle. Mia can cross during its extended window and activate the far purple plate, permanently stabilizing the crossing as in Room 4. A failed crossing lands on the lower floor; visible stairs return to the starting bank. The companion holds safely around temporary crossings and never teleports or activates machinery automatically.

The lift uses Room 5's extracted transport and cabin builders, preserving occupancy-edge toggles, passenger motion, multiple word cargo and gallery fences. Light words are scattered across both levels. Downstairs pictured stations require ordered RED APPLE, GREEN PEAR and YELLOW BANANA pairs. Each pair powers its own branch; all three current matches charge the exit. Correct words remain removable. Removal invalidates only that pair, and door closure preserves clearance for an occupant to retreat. Both heroes must physically return downstairs and leave together.

Mouse-wheel zoom now works in all six rooms, smoothly bounded between 4 and 9 units with a default of 6. Camera obstruction handling uses the hero's actual elevation. Reset restores zoom, both actors, every word, lift/control history, bridge timing/lock, pairs, circuits and door state.

## Verification

- `npm test`: 152 tests passed, including ordered/removable pairs, six wrong combinations, strength, both heroes on timed slabs, Tab during falls/travel, reachable recovery cargo, upper-edge placement, repeated cabin placements, multi-passenger/multi-cargo motion, control spam, gallery barriers, team exit, door clearance and resets across lift phases.
- `npm run build`: TypeScript and Vite passed. The existing bundle-size advisory remains.
- `npm run test:sorting`: full real-keyboard route passed, including a failed crossing/recovery, successful Mia crossing/lock, upper rider and lower operator, word transport, out-of-order stations, reversed-word correction, decoy correction, removal/replacement, physical reunion, team exit and reset. Screenshots are in `output/sorting-foundry/`.
- Existing Room 1/2 training and Room 3–5 keyboard regression routes passed. Room 5 now transitions into Room 6.
- `node tests/camera-zoom-browser.mjs`: real mouse wheel, bounds, alternate camera orientation and reset passed in all six rooms.
- The develop-web-game browser smoke client passed without browser errors. Screenshots were inspected at default zoom and a 960-by-640 viewport. A geometry regression verifies that recovery stair meshes stay below the walking surface.

Chaos coverage combines simulation assertions and browser routes; it is not a physical child playtest. Blocks use the existing safe E placement system rather than throwing physics. School-laptop frame rate has not been measured. The room reuses batched volcanic floors, instanced cave scenery and shared materials, and avoids adding dynamic lights per sorting conduit.
