# Room 4 — The Cooperation Chamber

Implemented 2026-09-30. Play at http://127.0.0.1:5188/?room=4 or continue through Room 3. The replay navigation now includes Room 4.

## Playable behavior

One continuous volcanic chamber connects three sections. Either hero holds a clearly purple plate while the other passes through the visible barred gate. The opposite plate holds the gate for the returning hero. Both heroes reaching the second court permanently opens the gate cyan and releases presence holds. Plate distance and rapid closure prevent a solo sprint; closure maintains safe head clearance above an occupied doorway, including during a jump. Standing outside a closed gate does not activate its safety sensor.

Yuki carries the existing heavy block onto the orange object plate. The existing Bridge cycle and shared four-slab renderer power a northbound 12-unit crossing. Mia's normal speed completes the timed route; Yuki's walking attempt falls to a safe lower floor with a lit return stair. The far purple plate permanently stabilizes the bridge cyan. Both heroes must reach the far bank before the color puzzle can complete.

The workshop contains matching physical colors and English labels RED, BLUE, GREEN and YELLOW. All four are 0.95-unit LIGHT blocks with requiredStrength 1. E placement snaps a carried block onto a nearby light block's top with forgiving aim. Stable support data avoids jitter and scattering; the upper block is picked first, and removing a support settles the remaining tower. GREEN directly resting ON RED inside the workshop solves; reverse, adjacent, unsupported, carried, outside-area and wrong-color arrangements do not. BLUE and YELLOW are optional. Success activates cyan block feedback, the sign, architectural seals and exit conduit, with the existing success sound. The existing team-exit rule requires both physical heroes.

## Reused systems and extensions

- `src/pressure-plates.ts` filters HERO and OBJECT activators; existing plates default to OBJECT behavior.
- `Game.requirePresence` / `releasePresence` provide shared presence-device hold reasons with an activation position. Tab preserves the outgoing hero's hold. Moving away under player control, device release, reset or transition ends it.
- `HeroTeam` keeps ordinary companion exploration in safe areas. Autonomous routes exclude temporary slabs; the far companion can roam its bank while awaiting reunion. Off-camera recovery cannot bypass chamber geometry.
- `src/cooperation.ts` owns the gate and section rules; `src/cooperation-chamber.ts` adapts that state into the existing volcanic material, cave, basalt, text and circuit helpers.
- Retracted slabs are enclosed in solid volcanic housing with visible mechanism outlets and a foundation matching recovery-floor collision.
- `src/moving-bridge.ts` is shared by Rooms 3 and 4; timing remains in the existing Bridge class.
- `src/block-stacking.ts` manages deterministic support and placement. Existing room carry/drop and heavy-struggle behavior remains in Game.
- Room resets clear stage flags, gate, bridge, holds, block supports, carried objects and hero motion, and spawn the two actors separately.

## Verification

- `npm test`: 105 unit tests pass, including 29 new cooperation, activator, hold/release, stacking, timing, reset and exit checks.
- `npm run build`: TypeScript and production bundle pass. Vite retains the existing bundle-size advisory; no new dependencies were added.
- `npm run test:cooperation`: real WASD/E/Tab route passes through all sections, Yuki's failed crossing and recovery, Mia's timed crossing, GREEN ON RED, team exit, reset, reversed first-section roles and Mia's heavy struggle. Both heroes also jump onto and walk off the empty object plate without activating it. No browser console or page errors.
- `node tests/power-playthrough.mjs`: Room 3's complete keyboard route, safe falling, both puzzles, transition into Room 4 and reset regression pass.
- `node tests/training-playthrough.mjs`: Rooms 1/2 keyboard puzzle routes and room transitions pass.
- Inspected desktop and 960×640 screenshots for entrance, opposite plate, heavy mechanism, stable crossing, color stack, recovery, role reversal and reset. Images and diagnostic snapshots are under `output/cooperation`.

Independent read-only review identified the gate-jump clearance issue; it was fixed with regression coverage. The reviewer reported no remaining concrete actionable bugs.

## Practical limits

This is a local implementation with no deployment. Child playtesting remains useful for judging discovery, timing comfort and vocabulary reading distance. The supplied request was truncated after the gate-safety Preferred: line; the approved implementation pauses closure above occupied passage space.

## Follow-up refinements

Moved both starting heroes two units farther from the first plate and changed the shared hero-plate color to deeper purple. The heavy plate now activates immediately, before section-one reunion; the far hero plate can stabilize the bridge immediately. Both heroes are still required for chamber completion. Split the near-bank floor around the recovery staircase so the incline and entire hero remain visible.

Validation: all 105 unit tests pass, production build succeeds, and the complete Room 4 keyboard playthrough passes. Visually inspected the entrance color and a new mid-stair screenshot (`output/cooperation/06-stair-opening.png`).
