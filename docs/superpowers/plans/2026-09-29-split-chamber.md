# Split Chamber implementation plan

Goal: replace Room 3 with the approved cooperative split chamber and entrance floor-map correction.
Architecture: retain Game, HeroTeam, shared block interactions, plates and team exit. Add independent hero jump state and bridge/recovery simulation.

1. Replace obsolete Room 3 tests with STRONG / M stage, tutorial safety and crossing tests; observe failures.
2. Author near bank west, Mia east, exit northwest, southern jump hallway and entrance floor schematic.
3. Implement grounded jump, individual assisted tutorial crossings, temporary slabs and lower recovery floor with west return ramp. Hold companion until reunion.
4. Render live floor schematic, connections, four slabs, labels, hallway helper and two locks; integrate camera and HUD.
5. Run unit tests, build and browser playthrough. Inspect screenshots and record results.

Timing: 12-unit crossing; Mia 7 units/s, Yuki 3.5; 2.55-second fully extended window. Same vertical jump impulse for both heroes. No death, new inventory, levers or NPC hints. Map does not reveal answers.
