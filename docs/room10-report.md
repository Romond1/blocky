# Room 10 — The Dragon’s Cave

The existing volcanic shell, central lava lake, giant pillars, entry overlook and opposite Heart destination are preserved. The pale continuous arena route is now a narrow, broken basalt gallery with four connected mastery sectors.

- Cooperation: reciprocal purple HOLD plates open a gate; both heroes and the Heart must pass before the first lock latches.
- Speed and transport: a temporary route combines running and forgiving jumps. Mia reaches the far control and commands the existing cargo ferry for Yuki and the Heart. Departure captures its manifest so an arriving empty ferry cannot pull waiting passengers or cargo forward.
- Construction: three familiar heavy blocks and two small blocks allow offset stacks to reach the upper gallery. Existing jump assistance and elevator transport are retained, including loose and carried Heart support.
- Language: the existing continuous SentenceCarousel wraps a monumental volcanic pillar. A purple brake lets the second hero retrieve light words. RED APPLE, MIA CAN RUN FAST and YUKI CAN LIFT BLOCKS reuse vocabulary established in Room 9. Correct panels remain cyan and wrong words remain retrievable.

Four physical sanctuary crystals show sector progress. The fourth lock starts perimeter energy propagation, pillar illumination and altar activation, then reveals a permanent wide ceremonial crossing through the lava basin. E places and locks the Heart; restoration changes cavern light, pillar energy and rising ember color without teleporting the heroes.

After restoration, equal in-world portals offer CONTINUE THE ADVENTURE / More Block World challenges and LEAVE THE BLOCK WORLD / Continue the Be a Hero story. Their shared geometry, materials and label sizes match, with left/right randomized per fresh run. Entering a zone does not select it: E is required. Continue keeps the restored cave playable with existing room replay links; Leave fades to BLOCK WORLD COMPLETE and dispatches the future `blockWorldExitCutscene` hook. Neither choice awards coins. Room 10 has twelve persistent Hero Coins and no Memory Crystal room.

Heart checkpoints advance with completed sectors and finally reach the activated sanctuary. Heroes recover independently without resetting locks. Detached carousel words recover onto the upper gallery rather than their elevated tray height. NPCs remain stationary in unsolved sectors and while carrying objects, and avoid controls and choice zones during safe exploration.

Telemetry follows the existing browser CustomEvent architecture: `FINAL_HEART_PLACED`, `choice_screen_opened`, `room10_final_choice`, `choice_selected`, and `blockWorldExitCutscene`. Choice details include timestamp, selected left/right position, time to choice, coins collected/available, Memory Crystals, elapsed play time in the current page and room completion time. No analytics backend or new player identity system was added; an existing host listener can consume these events.

Validation: Node tests cover ordered team/Heart locks, separate recovery, loose/carried elevator cargo, ferry manifests, carousel braking, word recovery, ordered language, permanent bridge, deliberate choice, Mia/Yuki timed traversal, both heroes climbing a valid offset staircase, and floor support for every plate and coin. Browser integration fixtures stage sector completion, then exercise actual E interactions for Heart placement and both final choices, checking telemetry and capturing all sector views. These fixtures are development-only and do not constitute a complete child playtest. Screenshots and logs are in `output/dragon`.

Run `npm test`, `npm run build`, and `npm run test:dragon` (with the Vite server on port 5188). Open `http://127.0.0.1:5188/?room=10` to play.
