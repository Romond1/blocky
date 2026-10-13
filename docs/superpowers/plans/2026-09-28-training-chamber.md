# Room 1 Training Chamber Implementation Plan

Goal: implement the approved two-plate onboarding room without redesigning Rooms 2–3.
Architecture: a pure TrainingTutorial event/state class owns lesson progression. Game owns explicit block weight, temporary lift/struggle actions and plate occupancy. HeroTeam cancels transient actions on switch and supplies companion exclusion zones. Three.js adapts simulation state into plates, energy paths, lift poses and feedback. DOM shows one current instruction.
Tech stack: existing TypeScript, Three.js, Vite, node:test and Playwright.

- [x] Add failing Room 1 tests: E alone leaves exit closed; Mia cannot normally carry heavy; movement drops a struggling block; Yuki places heavy after ability discovery; wrong plate rejected; reset restores all state.
- [x] Implement explicit block specifications and centralized weight requirements. Existing rooms retain explicit light defaults; all block sizes stay compatible.
- [x] Implement TrainingTutorial events and meaningful movement/look thresholds, credit earlier actions, require post-HERO switch and Mia trial before the heavy objective.
- [x] Implement safe heavy actions: stationary small lift, movement-triggered drop, timed fallback drop, short Yuki lift, switch/reset interruption. Preserve block origin and carrying ownership.
- [x] Add Room 1 plate metadata and separate HERO completion from final solved. Validate weight-based plate activation independently of printed word. Preserve two-hero exit.
- [x] Render two distinct plates, lowered activated plate surfaces, two lock indicators, illuminated second zone and channels, heavy block construction, lift/struggle poses and impact feedback.
- [x] Replace Room 1 persistent controls with staged prompts, key highlighting, mouse cue, contextual interaction text and learned hero identity. Keep other rooms UI intact.
- [x] Test both starting heroes, rapid E/Tab, wrong blocks/plates, early approach, carrying switches, reset in action, companion spacing, both exits, and full Rooms 2–3 regressions.
- [x] Build, inspect gameplay screenshots, document changed files/architecture/limits, then stop for user testing.

No git repository is present; changes are made directly in the shared workspace.
