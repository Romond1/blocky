# Room 5 Under-Lift Coin Path Implementation Plan

**Goal:** Reveal four extra coins under Room 5's raised lift, accessed from the existing side stair.

**Architecture:** Enable optional lower-shaft navigation only for FruitLift, keep LiftTransport's default restrictions for the foundry, and gate pickup independently from rendering. Extend elevator clearance checks to include cabin thickness.

- [ ] Run failing regressions for coin count/identity, both heroes' entry, closed-lift pickup, and lowering/retreat safety.
- [ ] Add opt-in underpass movement and source-position checks to shared lift transport, enabled only for Room 5.
- [ ] Protect occupants using the cabin underside clearance; keep existing platform support and cargo movement.
- [ ] Append four coin definitions, retain the hallway coin, and separate locked pickup from visible coin rendering.
- [ ] Run the full unit suite and production build; exercise lower stairs, raised-path coin collection, return and persistence in the browser.
- [ ] Re-run Room 5 fruit/lift and Luma playthroughs, inspect screenshots, save report and complete this plan.
