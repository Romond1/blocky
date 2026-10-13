# Dragon’s Cave implementation plan

Goal: Complete the existing Room 10 as a four-sector mastery finale.

Architecture: A cave controller extends the existing Finale through delegation. Shared layout describes broken floors, controls, checkpoints and language panels. A cave view augments the existing cavern shell.

Tech stack: TypeScript, Three.js, Vite, Node tests and browser verification.

- [x] Add behavioral tests for ordered locks, objective recovery, transport, carousel validation and deliberate final choice.
- [x] Author narrow sector floors and existing device definitions in finale-layout and dragon-layout.
- [x] Integrate cave simulation with Finale and Game, retaining Room 9 behavior.
- [x] Update the cavern view with machinery, altar nodes, permanent crossing, restoration and neutral portals.
- [x] Add twelve coins and browser event telemetry using the existing economy.
- [x] Run npm test and npm run build, then inspect Room 10 in the browser and verify both choice paths.
