# Room 7 — The Action Chamber

Reuse the cave shell, basalt floors, lava material, volcanic builder, circuit, gate, heavy interaction, team controller and collectible registry. Compose a wide chamber with three asymmetric action routes on the entrance bank, a broad central lava chasm and a visible picture wall on the far bank.

RUN is a forgiving timed lane, favoring Mia's existing speed. JUMP requires four airborne landings using the existing jump. LIFT uses Yuki's existing heavy carry and an orange plate. Each independently releases one standard light word block. Locked blocks remain unavailable. Falling preserves progress and restores heroes and loose words to safe positions.

The ferry uses the elevator's support displacement pattern in the horizontal axis, over four seconds. Each dock has purple SEND and CALL plates with arrows showing their destination. Only the controlled hero triggers these on a fresh step; inputs during movement are ignored. Sequence: load one hero, send from A, call from B to return empty, board the remaining hero, switch to B and call the ferry to B. Loose cargo and carried words travel with heroes.

The far bank has unlabelled running, jumping and lifting pictograms. Independent matching energizes three conduits and the existing gate. Existing team exit requires both heroes. Companion navigation excludes challenges, controls and lava; aboard the ferry it holds position. Add nine coins and one exit shard through the existing economy, without a memory room.

Validation covers transport, control edges, recovery, challenge eligibility, independent matching, reset and two-hero exit. Build and existing tests must pass; browser verification checks rendering and actual movement.
