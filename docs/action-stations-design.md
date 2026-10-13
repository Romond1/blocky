# Room 7 action stations — final design, 2026-10-02

Scope: RUN/JUMP/LIFT stations and their integration only. Preserve the ferry, final matching puzzle, other rooms, abilities and economy. Latest user revisions supersede the original four-piece LIFT set and the intermediate large/medium/small proposal.

All three words remain standard light blocks and exist at room load. Pickup marks collection; no activity reveals, hatches, timers or moving RUN gate.

RUN: 5.5 units/sec entrance-directed conveyor, animated strips/chevrons and collision-checked displacement. Actual existing speeds: Yuki 3.5, Mia 7, airborne 5. Mia gains 1.5 units/sec; Yuki cannot overcome it even by jumping. Idle heroes move backward. Closed end behind a fixed goal platform; existing side walls provide safety. RUN sits offset from the existing coin so its word stays readable.

JUMP: keep the existing five rows, split columns, final continuous landing, normal-floor misses and both-hero precision route. JUMP remains visible at the top. Shrink the station sign to 4.4 by .8; compact Room 7 objective leaves the word visible.

LIFT: 3.8-high volcanic ledge. Raise the 4.8 by .8 station sign to Y=5.5, directly behind LIFT. One 2.2-size heavy base (strength 2), three .8-size light pieces. Yuki transports the base at 40% normal speed, 1.4 units/sec. Both heroes need a small step to get onto the base: the existing climb assist caps reachable rises at 1.85. A small piece on the base has top Y=3.0, making the ledge reachable. A third small piece permits alternatives; no arrangement validator.

Use existing deterministic resting support and forgiving stacking. Permit small pieces beside one another on a large support, choosing stable offsets from player aim and checking actual volume. Skip blocked/occupied placement candidates, including the hero's own body. Exclude the current standing support from pickup selection so reachable blocks on neighboring stacks remain highlighted and movable. Keep top-first dismantling and prevent self-support pickup. Near-wall placement settles at the current carrying anchor using visible cube dimensions and the shortest equivalent quarter-turn orientation.

Companion holds inside station areas; conveyor returns switched-away heroes toward the entrance. Placed pieces survive switches. Inaccessible blocks and their support descendants recover individually to clear home/nearby positions. Reset restores all original positions, station state, final puzzle, ferry and both heroes; existing economy reset rules remain.

Validation: initial goals/weights, measured conveyor resistance and idle/jumping/switching, physical pickup progression, both-hero JUMP, small/big/small keyboard construction/climbing, elevated retrieval for both heroes, alternative/multiple supports, recovery, reset, ferry/matching/team-exit regression, browser error checks, screenshots, Node tests and build.
