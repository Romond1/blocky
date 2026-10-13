# Room 9 clarity and sound — 2026-10-11

Published at https://beahero.fun/blocky/.

- Forest-heart movie plays with sound by default after circle activation and shard assembly. Browser autoplay rejection exposes Play video; load failures expose retry/continue rather than silently skipping.
- Five taps on Adventure paused reveal the existing teacher code, 1001, on every account. Room jumps still do not grant unlocks. Reset confirmation names the signed-in account and explains the online save impact.
- Persistent contextual Room 9 guidance covers carrying all words and the Heart, loading transport, bridge timing, and the final four picture puzzles. Browser languages: English, Japanese, Spanish, Portuguese, French, German, Italian, Korean, Chinese, Russian, Arabic and Hindi; other languages fall back to English. English puzzle tokens remain unchanged.
- First two word blocks moved closer to the first doorway. Ferry/elevator decks use a stable material; overlapping dock faces removed.
- Bridge retracts behind a solid side wall and is hidden when fully retracted. Movement cannot enter its lane until fully extended. Existing timing and completed-crossing stability remain.
- HTML now revalidates on reload, avoiding stale entry-page caching. Reloading remains necessary for an already-running game.

Validation: 410 tests pass; TypeScript/Vite build passes. New regressions cover language selection, guidance stages, bridge access, sound default and blocked-autoplay recovery. Local browser verified playback unmuted, guidance layout, and bridge/ferry geometry. Live signed-in account verified five-tap teacher unlock, Room 9 jump, and video playback (muted=false, paused=false, readyState=4). No student reset was performed. Production assets return HTTP 200 and HTML cache policy is no-cache, must-revalidate.

Release: index-q7wiWfG8.js, main-BYI9TUj3.js, main-DLKpBlN1.css. Existing video asset unchanged. Previous entry page: output/index-before-room9-clarity.html; previous bundles retained remotely. No API/database migration.
