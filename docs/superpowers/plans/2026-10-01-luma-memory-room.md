# Luma Memory Room Implementation Plan

**Goal:** Add a hidden FOX memory puzzle beside Room 5's pear picture by sharing Kage's room design.

**Architecture:** Parameterize memory-room logic and its Three.js adapter with character, correct animal, socket, transform and picture data. Integrate the mirrored Luma layout with Room 5 while retaining existing fruit and elevator indices.

**Tech Stack:** TypeScript, Three.js, Vite, Node tests, existing Playwright scripts.

- [x] Add failing unit regressions for the ground-floor route, both heroes, FOX-only unlocking, fruit/lift independence, locked visible crystal and persistence/reset.
- [x] Add mirrored Luma layout data and parameterize shared memory state/view, keeping Kage defaults.
- [x] Register Room 5 animal blocks, optional areas/walls, plate 5, collectible and images. Exclude optional socket from fruit circuit and lift controls.
- [x] Cut an unobtrusive ground-floor rear opening beside the pear, preserve upper boundaries, and derive camera bounds from the active memory room.
- [x] Verify all unit tests and production build. Exercise Luma through keyboard input and inspect screenshots; rerun Kage and fruit/lift browser playthroughs.
- [x] Save verification report and mark this plan complete. The workspace has no Git repository.

