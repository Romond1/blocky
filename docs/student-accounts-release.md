# Student account release — 11 October 2026

Live: https://beahero.fun/blocky/

Students select New player, choose a unique nickname (2–16 Latin letters, digits, underscore or hyphen) and numeric PIN (4–8 digits). Later use Log in with the same details on another device. Menu includes save status and Save & log out. Teacher dashboard deferred by explicit request.

SQLite database lives at beahero.fun/blocky-private/students.sqlite, outside public_html. PINs use PHP password_hash/password_verify; sessions use HttpOnly, Secure on HTTPS, SameSite Strict cookies. API uses prepared statements, request origin checks, login throttling, payload validation and optimistic save revisions. A stale tab cannot overwrite a newer save. No student list or dashboard is public.

Saves include unlocked/completed rooms, coin balance and collected coin/shard/crystal identities. Resume is at the latest unlocked room, not the exact position or partially solved room. No independent points metric existed in the game. Anonymous local progress is not imported into new accounts. Local pending state is isolated by account ID and retried; concurrent revisions require a reload.

Validation: npm run build passed; 401 unit tests passed. Live API integration tests passed registration, incorrect PIN, authenticated session, account isolation, cross-session save restoration, conflict rejection and logout. Browser verified login, hero screen, live gameplay start, account save indicator and logout. Screenshot capture timed out, and the browser viewport override did not take effect, so physical mobile layout testing remains unverified; existing touch controls are preserved.

Previous public assets and entry page retained as assets-before-accounts and index-before-accounts.html. Full release archive and extracted source remain in blocky-students.zip and blocky-students. Test accounts use test-prefixed nicknames; LaunchCheck1011 is an explicit smoke-test account, not a teacher account.
