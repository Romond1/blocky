# Yuki character pass

Files: src/characters/Yuki.ts, src/main.ts, src/characters/preview.ts, character-preview.html, tests/yuki-stress.mjs. Production dist rebuilt. Original unused player-model.ts retained.

Code-built boxes plus polygon shield/wolf silhouettes. Independent body, torso, neck, head/hair, upper arms, elbows, forearms, hands, hips, upper legs, knees, lower legs, feet. Shield is attached to left forearm. Silver/steel, navy, skin, leather, two hair shades, green eyes, eye whites and cyan emissive materials are shared. Static pieces merge per material inside each group.

Idle breathing and slight head motion; walking is driven by actual distance moved, with alternating hips/knees, reduced shield-arm swing, counter-swing and light bounce. Carrying bends the right arm; block presentation shifts right to avoid the left shield. No run mechanic added. Existing facing, camera, controls, colliders and simulation retained.

Budget: 1,990 triangles, 79 model draws per color pass (shadow rendering adds submissions), 11 shared materials, no external models/textures. Placeholder was approximately 19 box draws / 228 triangles. This is a measurable increase in model cost, not a claim of zero performance impact. Bounded browser frame samples are in output/yuki-frame-sample.json; these are local headless measurements, not target-device certification.

Validation: production build; all 10 gameplay tests; full sequential keyboard playthroughs in all 3 rooms with no browser errors, including carry, wrong answers, swaps, gates, transitions, collisions, reset and camera. 36,000 animation steps (10 simulated minutes) pass finite-transform, shield hierarchy, grounded scale checks. Front/side/back/walk screenshots in output/yuki-*.png.

Development inspection: npm run dev then /character-preview.html. Buttons select idle/walk/carry, rotate 90 degrees and show joint axes. No game camera changes.

Deliberate simplifications: larger geometric hair locks, reduced armor runes, flat polygon wolf and shield panels, approximate carrying pose without IK, no skeletal assets, no additional characters. Further refinement awaits user testing.

## Armor and expression refinement

Updated src/characters/Yuki.ts only (plus rebuilt dist). Blue-silver metal is brighter, smoother and uses a character-only procedural 128x64 RGBA reflection map (32 KiB source pixels, generated in memory; no downloaded asset). Scene lighting and environment materials remain unchanged. Added layered shoulder segments, chest and back trim, forearm rails, gauntlet fingers, knee/shin plating, stepped boot tops and shield-rim blocks. Lower, inward-sloping brows, narrower eyes, small facial planes and a restrained smile replace the anxious expression.

Current budget: 3,034 triangles (+1,044), 80 model draws (+1), 11 shared materials. Build and ten-minute animation stress passed. Development front/side/back/walk inspection and all-room browser screenshot smoke passed without errors. Local frame samples refreshed in output/yuki-frame-sample.json. Full gameplay playthroughs were passed in the prior character pass; this refinement changes only model appearance.
