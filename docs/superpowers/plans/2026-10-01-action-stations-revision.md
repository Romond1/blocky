# Action station revision implementation plan

**Goal:** Make Room 7's action tasks immediately readable and improve traversal and rewards.

**Architecture:** Keep ActionChamber and the existing room builder. Add a reusable reward-hatch state machine, use split grounded step columns for support and render the same trapdoor mechanics at each station. Restrict new camera framing to the entrance.

**Tech Stack:** TypeScript, Three.js, Vite, Node tests and Playwright keyboard verification.

- [x] Update/add failing tests for five split tiers and missed-jump floor landings, summit reward, descent, hatch animation, RUN preview/timeout/retry and open ferry entry.
- [x] Implement reward-hatch.ts, ActionChamber support and reward transitions, and Game pickup availability.
- [x] Update room layout, marked station boundaries, trapdoor meshes, stair guards, flat ferry and entrance camera.
- [x] Adapt the keyboard browser test to the staircase and physical rewards, including cargo transport and matching.
- [x] Run targeted tests, the full suite, build and browser verification; inspect screenshots and update room7-report.md.

