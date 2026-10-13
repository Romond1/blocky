# Room 7 station implementation plan — completed

Goal: physical visible word goals and the user's final small/big/small construction progression.
Architecture: station simulation in ActionChamber, shared action-layout surfaces, action-chamber-view visuals, Game interactions and HeroTeam ownership. Reuse existing carry collision, stacking and economy.
Tech stack: TypeScript, Three.js, Node tests, Playwright.

- [x] Add failing initial-word, conveyor, collection, ledge, recovery, switching and weight regressions.
- [x] Replace timer/reveal behavior with continuously simulated belt and physical pickup collection; remove orange station plate and moving gate.
- [x] Author final LIFT set: one 2.2 heavy base, three .8 light pieces; slow base movement at multiplier .4; platform Y=3.8.
- [x] Allow elevated neighboring-block selection and pickup, stable aimed offsets, multiple small pieces per support, and actor-aware placement.
- [x] Fix near-wall padded drops and redundant 180-degree cube placement/pickup sweeps.
- [x] Raise LIFT sign behind its word and shrink JUMP sign. Retain jump geometry, ferry and matching puzzle.
- [x] Run complete Node suite and production build; keyboard-test both heroes' LIFT route, RUN/JUMP, elevated pickup, near-wall placement, ferry/matching/exit/reset; inspect screenshots and console errors.
- [x] Update design, report and progress with latest user revisions and measured outcomes.
