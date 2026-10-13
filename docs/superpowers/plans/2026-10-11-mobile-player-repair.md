# Mobile and player repair implementation plan

> Execute in this session using superpowers:subagent-driven-development for the independent Room 10 repair and review. All agents share files; Room 10 ownership excludes main.ts and player UI.

**Goal:** Make the existing adventure playable with touch, clean the public HUD, constrain replay and repair existing Room 10 progression.

**Architecture:** Shared Game/HeroTeam actions, MovementInput analog magnitude, separate device/touch controller and player menu/progress modules. Existing Three.js renderer and level systems remain.

**Tech Stack:** TypeScript, Three.js, Vite, Node tests, Playwright.

- [x] Audit main.ts, keyboard-state.ts, movement.ts, welcome.ts, viewport.ts, economy.ts, training UI and Room 10 controllers/layout/view/tests. Record causes before fixes.
- [x] Add failing analog/device/progress regressions; use `node --experimental-strip-types --test tests/mobile-input.test.ts tests/adventure-progress.test.ts`.
- [x] Implement input mode detection, manual override, portrait guard and pointer-ID controls in focused modules. Route main.ts keyboard and touch through shared action functions; analog magnitude reaches the existing team movement.
- [x] Add compact HUD and pause menu; local progress migration/unlocking, replay, teacher convenience gate and confirmed local resets. Adapt welcome and tutorials to touch and preserve localization.
- [x] Repair Room 10 reproduced failures with dedicated regression tests. Reuse visible collision geometry; inspect pickup, independent carrier, recovery, altar gating and ending.
- [x] Run `npm test`, `npm run build`, browser mobile/desktop interaction regressions and existing room playthroughs. Inspect screenshots and console logs. Run the develop-web-game client.
- [x] Review spec coverage then code quality, resolve findings, write a deliverable report with files, mappings, mechanics findings, improvement proposal, validation and physical-device checklist. Update progress.md. Do not deploy.
