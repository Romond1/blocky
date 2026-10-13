# Student accounts implementation plan

Goal: ship student nickname/PIN sign-in and cloud saves on existing Xserver hosting. Teacher dashboard explicitly deferred.

- [ ] Add API integration tests for registration, PIN verification, save/restore, account isolation and stale saves; run against a PHP endpoint.
- [ ] Add public/api/index.php with SQLite outside web root, hashed credentials, session cookie, login throttling, save validation and optimistic revisions.
- [ ] Add src/account.ts and src/account.css: nickname/PIN splash, account storage adapter, serialized saves and logout.
- [ ] Add src/bootstrap.ts to authenticate before importing main.ts; wire economy/progress persistence and logout into the existing menu.
- [ ] Run npm test and npm run build. Verify desktop and mobile account screens and gameplay loading.
- [ ] Upload a release zip to Xserver file manager, preserve current release, extract the release, verify live registration and cross-session saves, and provide the game URL.

No Git repository exists in this workspace, so changes and documentation stay in the existing directory.
