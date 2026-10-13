# Shared action controls implementation plan

- [ ] Add cue tests and a regression test proving button-driven HeroTeam switching completes Room 2 onboarding.
- [ ] Add src/action-cues.ts; adapt src/touch-controls.ts for desktop key labels, contextual action labels, attention pulse and secondary-click rejection.
- [ ] Wire Q and cues in src/main.ts, update tutorial/welcome/menu instructions and localization.
- [ ] Add entrance and corridor lamps in src/kage-alcove-view.ts, shared with Luma.
- [ ] Run unit suite, build and browser checks for mouse buttons, Q, Tab, pause, hint transitions and rendered entrances.
- [ ] Publish new hashed assets and entry page; verify live game and leave account database intact.
