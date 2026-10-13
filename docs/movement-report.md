# Movement and cube handling — 2026-10-01

Keyboard state previously expired after 1.2 seconds unless that key repeated. Operating systems commonly repeat only the latest held key, so Space or a second direction could interrupt another held direction. Space also added an automatic 1.5-unit lunge, and a focused HUD button could consume Space as a click. These behaviors have been removed. Physical release and focus/page/reset/switch events now own input cancellation; repeated events cannot revive cleared input.

Facing uses bounded continuous shortest-path rotation at 10 radians per second. A 180-degree turn takes about 0.31 seconds, with intermediate angles retained on release for aiming. Adding an axis blends over 70 ms; releasing or reversing an axis removes its old contribution immediately. Walking remains at the existing hero speeds with the existing eased gait. Camera yaw provides arbitrary world headings.

The shared carrying anchor centers every cube in front, with the rear face within reach of both animated hands. Both heroes blend symmetrically into the pose; Yuki stows his shield on his back. Heavy lift animation and plate proximity use the same center anchor. Free drops in all room families search only directly ahead, retaining cargo when blocked. Nearby puzzle plate snapping and stack assistance remain enabled.

Regression coverage includes key orders, quick chords, held keys without repeat, focus-loss cancellation, Space on a focused HUD button, jump-in-place and air steering, intermediate heading and frame-rate consistency, rendered hand/cube positions, front drops, blocked walls, both heroes, heavy lifting, and holding across TAB. Existing route fixtures now deliberately face empty cargo spaces or stack targets instead of relying on instant turns or automatic sideways placement.

Source backup: `output/movement/before-src`. The workspace is not a Git checkout. Automated checks cannot replace a child playtest of the final control feel.

Verified: 242 unit tests pass; production build passes with the existing bundle-size advisory. All seven room keyboard playthroughs pass, as do focused jump/input, carrying and Room 3 help checks. The required skill browser smoke passed. Screenshots were inspected and a focused independent code review found no actionable issue.
