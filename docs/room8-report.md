# Room 8: The Ability Hall

Room 8 is implemented, including both subsequent user revisions. Replay at http://127.0.0.1:5188/?room=8. Room 7 transitions into Room 8; Room 8 ends at the completion screen.

## Layout and visual systems

The west introduction wing turns east around a tall solid volcanic mass and then north into the language hall. The mass prevents seeing the whole room at entry. Horizontal coordinates initially expanded 40%; the east hall was widened further to separate sentence banks. The east hall is now 29.4 world units wide. Mia and Yuki sentence centers are 16.8 units apart. Standard neighboring pads have 1.06 units of floor between their edges; the two sentence banks have a 7.78-unit gap between their nearest pads. Independent floor frames and circuit outlets distinguish the sentences.

Reused volcanicBuilder, basalt floors, cave shell, world materials, volcanic ribs, lava edges, lighting, embers, existing heroes, orange object circuits, cyan solved energy, purple hero mechanisms and the existing exit doorway. Character-colored action drawings use the established action-picture canvas approach. No new visual theme or external generated art assets.

## Familiar gameplay and cooperation

The corner uses Room 4's portcullis pattern. After both intro sentences, a hero must remain on the near purple plate to hold the see-through barred gate open. Leaving closes it. The second hero crosses to the far purple plate and holds it while the first joins them. Both heroes reaching the far side latches it open, as in Room 4. The gate pauses above a hero inside, following their current height. The next gate also uses visible bars and opens after both complete RUN/LIFT sentences.

Two optional low stepping stones reuse ordinary jumping and are unnecessary for language progress. Heavy blocks reuse Yuki's existing strength, Mia's struggle feedback and the heavy pickup animation. Final cooperation uses two purple hero plates; all six sentences and both plates latch the exit. Both heroes must pass through the existing doorway.

The user's later instruction explicitly overrides the original light-only language-block requirement. The introductory LIFT boulder and the supplied YUKI/CAN/LIFT and YUKI/CAN/JUMP sets are existing 1.65-unit heavy blocks. Mia's words remain .95-unit light blocks. Weight-matched pads prevent a solved bank from consuming the other bank's required CAN/JUMP inventory. Both block types retain familiar controls.

## Sentence architecture and teaching progression

SentenceDefinition supplies id, hero, action picture, section, ordered answer, fixed prefix length, physical slots and panel position. One AbilityHall validator evaluates every panel; validation is not duplicated per sentence.

1. MIA CAN RUN: fixed MIA and CAN; place RUN.
2. YUKI CAN LIFT: fixed YUKI and CAN; Yuki places the heavy LIFT boulder.
3. Independently build MIA / CAN / RUN and YUKI / CAN / LIFT, in either order.
4. Independently build MIA / CAN / JUMP and YUKI / CAN / JUMP.

Only complete arrangements are validated. Wrong order gives brief non-punitive feedback and leaves the blocks retrievable. Correct sentences lock independently, glow cyan, briefly activate the picture and energy path, and display their period automatically. No grammatical terminology, translations, CAN'T, questions or future lesson combinations.

## Companion and recovery

The companion explores safe floor and reacts, but never moves word blocks or places answers. Navigation avoids required hero plates. A manually parked operator holds position while switched away; carried blocks stay with their hero. A hero switched away on an optional step or in the air holds position instead of completing movement autonomously. Holds release when their mechanism has latched, permitting the teammate to walk to the exit.

Required unsolved words recover from lava/low falls, bounds, architecture, closed mechanisms or excessive height. Recovery prefers original staging and searches nearby free floor when those locations are occupied. It checks physical collision and avoids overlapping words or heroes. Completed sentences are preserved. A completely crowded recovery area retries rather than stacking words invisibly.

## Collectibles and reset

Nine Phase 1 Hero Coins: entrance approach, west exploration edge, corner-pillar side, corner passage, language-hall approach, east hall edge, optional upper step, tucked final-hall side, and exit approach. Exactly one Heart Shard appears in the final corridor once the room and door are solved. It is optional for escape. No Memory Crystal or secret room.

R restores all blocks, six panels, sentence locks, corner hold/reunion state, gates, final mechanism, hero spawn positions, motion and companion state. Optional steps are static. Economy collection remains persistent under the existing rules.

## Files changed

New source: src/ability-layout.ts, src/ability-hall.ts, src/ability-hall-view.ts.

Integration: src/puzzles.ts, src/game.ts, src/main.ts, src/carry-collision.ts, src/team.ts, src/companions/companion.ts, src/collectible-data.ts.

Tests/tooling: tests/ability-hall.test.ts, tests/ability-hall-browser.mjs, tests/collectibles.test.ts, tests/action-chamber-browser.mjs, package.json. The Room 7 browser expectation now verifies its transition to Room 8 before reloading Room 7 to check reset.

Documentation: README.md, progress.md, docs/room8-report.md, docs/superpowers/specs/2026-10-02-ability-hall-design.md, docs/superpowers/plans/2026-10-02-ability-hall.md. dist was regenerated by the production build. Generated screenshots/state/logs are in output/ability-hall and output/ability-skill.

## Verification

- Final npm test: 306 passed, zero failures, including 16 Room 8 tests and existing Rooms 1-7 rules.
- Final npm run build: passed.
- Full Room 8 keyboard route passed from both initial hero selections: light RUN, heavy LIFT, repeated Tab with cargo, near/far gate cooperation, reverse sentence-bank completion, CAN-first arrangement, physical wrong-word removal and correction, heavy Yuki words, both JUMP sentences, final cooperation, automatic teammate exit and persistent reset.
- Room 7 full keyboard route, ferry/cargo, all matching, reset and Room 8 transition passed.
- Skill Playwright client passed; screenshot and text-state output inspected.
- Visual inspection covered entrance, far hold, corner reveal, separated banks, wrong order, both JUMP panels, team completion, reset and 960x640 display. The resize harness waits for the resize event before manually rendering.
- Additional rule checks: RUN/MIA/CAN, MIA/RUN/CAN, JUMP replacing RUN, cross-section cargo, lava/wall/bounds/high-word recovery, occupied staging, halfway reset, Mia struggling with heavy LIFT, both heroes' optional jumps, companion restrictions, gate closure/head clearance, architectural bypass prevention, collectible support and final exit without requiring rewards.

## Limits

The game retains the existing single-controller/Tab hero-team model. Yuki word blocks are intentionally heavy per the user's revision. The optional movement route has no elevator or new transport mechanism. Vite retains its existing bundle-size advisory (about 737 kB minified / 209 kB gzip); build succeeds. No Room 9, combat, health, trampoline, new abilities or new controls were added. Await user playtesting.
