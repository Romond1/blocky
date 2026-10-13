# Mia and hero picker

Mia is a code-built red/gold variant of the articulated BlockHero builder. Brown shoulder-length block hair, warm eyes, shiny red armor with golden inserts, layered hip guards, red collar, rigid segmented cape and right-hand flaming sword. Fire uses fixed orange emissive voxel tongues and gold cores; no fire simulation, extra lights or cloth animation. Carrying uses Mia's left arm and Yuki's right arm.

Startup now offers an accessible DOM hero picker with static rendered model portraits. Keyboard activation works; gameplay input and HUD are gated until selection. The chosen character persists through automatic room transitions and reset; replay-room links carry hero choice explicitly. Fresh entry offers the picker again. No account or save system was added.

Files: src/characters/BlockHero.ts (shared existing Yuki construction and animation), Yuki.ts and Mia.ts (factories), preview.ts (Mia inspection via ?hero=mia), src/main.ts, src/style.css, public/heroes/yuki.png and mia.png. Browser tests now choose a hero and run sequentially without forcing CPU software rendering; TEST_HERO=mia chooses Mia. Added tests/hero-picker.mjs and tests/mia-stress.mjs. Production dist rebuilt.

Mia: 3,888 triangles, 78 model color-pass draw calls, 12 shared materials. Yuki remains 3,034 triangles / 80 draws / 11 materials. Portraits are 480x600 PNGs rendered from the actual code models. Neither model loads external 3D assets. Material reflection map remains procedural.

Validation: production build, 10 gameplay unit tests, ten-minute simulated animation stress for each hero, complete Rooms 1–3 keyboard playthroughs for Mia; picker tests cover keyboard selection, both choices, paused input, reset, replay persistence, 390px viewport and browser errors. Yuki regression playthroughs run after extraction. Browser tests use one browser at a time. Gameplay simulation, camera and room architecture are unchanged.

Simplified reference details: geometric gold chest motif and sparse runes, stepped brown hair, rigid cape panels, stylized fire tongues instead of particles or animated fire. Awaiting user visual review.
