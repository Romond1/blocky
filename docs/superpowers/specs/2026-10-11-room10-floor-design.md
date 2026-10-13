# Room 10 usable floor repair

The user requests usable wall-side ground, more room near the blocks/lift, and removal of moving floor overlap artifacts. The user explicitly chose to keep the bridge as the required crossing.

Use a shared, non-overlapping static floor layout for rendering and physical support. Extend the ring to the cave walls, widen the lower construction court from nine to twelve units, retain the elevated gallery, and keep the bridge/ferry and return-route lava cuts. Add collision for the existing outer rock wall so reaching the perimeter stops movement instead of causing a fall. Cover intentional holes with visible lava below the floor.

Alternatives considered: increasing collision bounds alone would preserve misleading visual holes; depth bias alone would hide overlapping floors without fixing their physical boundaries. Shared clipped floor patches address both reported faults. Machinery deck surfaces are separated slightly from the static floor to avoid coplanar faces when docked.

Preserve existing blocks, lift/ferry travel, held-pad bridge behavior, gate barriers, Heart ownership, checkpoints and language puzzle. Do not change other rooms or deploy. Validate floor support, wall collision, lava recovery, no bridge/gate bypass, construction/lift compatibility, and desktop/touch render views from several angles. No Git metadata exists in this workspace.

User follow-up expands this repair: move the carousel brake outside the RED APPLE panel into the clear approach at (-19, -23). Replace the two bright middle-of-lake paths with one short bridge from the north perimeter to an isolated Heart landing. The north perimeter remains connected from the lift to the language gallery. Shift the Heart landing inward to (0, -20, height 5) to create a real visible lava gap; keep that gap wider than the heroes' jump range, including diagonal approaches. All four locks and the existing response delay activate the direct bridge. Preserve deliberate Heart placement and both ending choices, relocating their platforms with the landing. Add a return-to-Heart objective after completion.
