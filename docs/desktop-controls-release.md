# Desktop controls release — 2026-10-11

Published at https://beahero.fun/blocky/.

- Desktop now shows clickable Q / Tab Switch hero, E Pick up / Place / Action, and Space Jump buttons.
- Q and Tab both switch heroes. Room 2 accepts mouse, touch, or keyboard switching.
- Contextual action glow and early-room hero-switch pulses guide players; reduced-motion settings disable pulsing.
- Warm entrance and hallway lamps make the optional memory rooms in Rooms 3 and 5 easier to discover.
- Existing touch controls and student accounts remain supported.

Validation: 406 tests passed; production TypeScript/Vite build passed. Browser checks covered desktop mouse actions, Q/Tab switching, Room 2 lesson advancement, and touch controls at a small landscape viewport. Live account login, mouse hero switching, online save, and logout passed after publication.

Release assets: index-BRCbAgBW.js, main-DvpWE-IJ.js, main-DX_H2Q_s.css. Each fetched successfully from production. Existing account CSS remains index-BNjIiPhe.css.

Rollback: upload output/desktop-controls/index-before-update.html as index.html. Previous hashed assets remain on the server. No API or database migration was made.

Evidence: output/desktop-controls/live-desktop.png, desktop.png, touch.png, and output/desktop-controls-tests.txt.
