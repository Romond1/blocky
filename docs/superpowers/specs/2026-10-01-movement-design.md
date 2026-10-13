# Smooth movement and centered carrying

The request authorizes correcting keyboard chords, smoothing turns and animation, and holding/placing cubes directly ahead with both hands.

Use physical key down/up state, cleared on focus loss, hidden page, resets and switches. Do not infer release from OS repeat: only the latest held key may repeat. Space must jump even when a HUD button had focus. Remove automatic jump travel; direction keys own horizontal motion throughout a jump.

Use continuous shortest-path facing with a bounded angular speed. Translation remains responsive and stops on release; blend added diagonal input in the browser adapter and ease the walking animation without adding release drift. Brief taps retain intermediate facing. Mouse camera yaw already supports arbitrary world headings. Both hands blend into a symmetric carrying pose, with equipment stowed while carrying. Carry anchor and drop aim share the hero's facing. Free drops search only ahead, retaining the cube if blocked; existing nearby puzzle plate snapping remains a deliberate accessibility aid.

Alternatives considered: 16-way snapping still produces abrupt turns; inertial movement adds overshoot and makes child precision harder. Continuous facing plus immediate release is preferred.

Verify key chords, no-repeat holds, focus changes, jump stopping, continuous turns, centered carried geometry, both-hand poses, blocked drops across room families, existing puzzle routes and browser errors. No room layout, speed-ability or lighting changes. This folder is not a Git checkout, so preserve source backup locally.
