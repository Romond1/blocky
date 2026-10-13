# Room 4 — The Cooperation Chamber

Design based on the supplied Room 4 brief, 2026-09-30.

## Architecture

Add Room 4 as one continuous chamber in the existing room registry and transition flow. Keep Rooms 1–3 behavior intact. Use the existing Game, HeroTeam, companion controller, heavy/light definitions, Bridge timing, volcanic material factory, cave shell, basalt flooring, block geometry, text helpers, circuits and team exit.

Extend shared plate definitions with accepted activator types HERO or OBJECT. Hero activation uses either physical hero's grounded position and foot height; objects cannot activate hero plates. Presence requirements provide per-hero hold reasons to HeroTeam. Reconcile requirements before autonomous movement and across ownership switches. Release a hold when its device is no longer required, the controlled hero leaves, or reset/transition occurs. Preserve normal companion exploration elsewhere; navigation must respect gates, banks and the current bridge state.

## Continuous layout

Use a northbound chamber with an entrance court, a central crossing gallery, and a rear color workshop. Frame each section with the existing volcanic kit and visible sightlines. Stage boundaries prevent bypassing cooperation while remaining visible physical architecture. No new tutorial popup or unsolicited solution explanation.

Section 1 has a clearly purple plate in each of two courts separated by a visible barred portcullis. Either plate opens the gate. Place the first plate sufficiently far from the gate and close the gate sufficiently quickly that even Mia cannot traverse alone. Collision follows the rendered gate. Pause closure above an occupied doorway to avoid crushing; resume after clearance. Both heroes safely reaching the second court latches completion, stabilizes the gate cyan and releases plate holds. Either hero can perform either role.

Section 2 has an existing heavy object and orange object plate on the near bank. Both heroes must have completed Section 1. Reuse the four-slab Bridge cycle on a crossing oriented along the chamber's length, with timing and distance verified against each hero's speed. Provide a lower safe landing and lit return ramp. A purple presence plate on the far bank permanently stabilizes the slabs cyan. Section completion requires both heroes safely on the far bank. No deaths, damage or lost blocks.

Section 3 has four letter-sized LIGHT blocks, strength requirement 1: RED, BLUE, GREEN, YELLOW. Physical colors match labels, with contrasting readable English text. The existing sign style displays GREEN ON RED above a bounded stacking area. Add shared block elevation/support state and forgiving E-placement onto nearby block tops, with stable support and retrieval. Validate uncarried GREEN resting directly on RED, appropriate height, forgiving horizontal overlap and both inside the puzzle area. Reverse, adjacent, unsupported, outside-area and wrong-color stacks fail without punishment. BLUE and YELLOW are optional decoys.

Successful stacking latches cyan feedback on GREEN and RED, activates the sign and conduit, plays existing success feedback and unlocks the final exit. Three small architectural energy seals show section progress. The existing both-hero exit rule controls completion.

## Verification

Add meaningful unit coverage for activator filtering, hold persistence and release, both role orders, solo gate timing, occupied-gate safety, stage prerequisites, heavy/light restrictions, timed crossing speeds, safe recovery, correct and incorrect stacking, support/retrieval, reset and team exit. Run the production build and existing unit suite. Add a real-input browser route through Room 4, inspect screenshots and check Rooms 1–3 regressions. Report any unverified behavior explicitly.

## Scope and source limitation

No new dependencies, independent copy of Room 3, new visual theme, fruit vocabulary, mismatched color labels or additional grammar. The supplied attachment ends at the gate-safety heading's Preferred: line; safe gate pausing is the proposed completion of that requirement. This workspace has no Git repository, so the design is saved locally without a commit.
