# Student accounts and urgent publishing

Scope updated by user: defer teacher dashboard. Publish nickname and PIN accounts with database-backed progress within the classroom deadline.

Use the existing Xserver PHP 8.3 hosting and a SQLite database outside public_html. Hash PINs, use HttpOnly same-site sessions, rate-limit sign-in and reject stale save versions. Load account progress before importing the game. Keep economy and room unlocks in a shared account storage adapter. Never import anonymous browser progress into a student account. Preserve offline pending changes per account and show save status. Progress resumes at the unlocked room boundary; incomplete room geometry is not serialized.

Keep desktop and mobile gameplay unchanged. Add a responsive account splash before the existing hero picker, and save-and-sign-out in the game menu. Verify account creation, incorrect PIN, two-account isolation, cross-session persistence, unauthorized API access, build, existing tests and desktop/mobile rendering. Publish only the blocky directory and retain a copy of its current files.
