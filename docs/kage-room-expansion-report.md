# Kage room expansion verification — 2026-10-01

The Kage Secret Room now opens from the left/Yuki bank through a permanently open entrance. The gallery is 17 × 11.5 units (about 4.6 times the former floor area), with higher basalt walls sharing the main cave's procedural materials. Three framed pictures are 3.4 units wide. A visible blue memory crystal sits behind an iron-bar gate and remains unavailable for collection until WOLF opens the gate.

The hallway's dedicated light was removed following the screenshot feedback. The turn light now sits deeper in the gallery with a shorter range, leaving the entrance dim while preserving lighting around the pictures and puzzle. Distance and close-up screenshots were inspected.

Camera bounds preserve the viewing angle inside the enlarged room and keep the reward camera behind the gate header. Floor render sections do not overlap. Optional room positions are excluded from exit detection, companions respect the closed reward gate, and approaching a closed gate cannot activate its safety lift.

Validation:

- `npm test`: 187 tests passed, zero failures.
- `npm run build`: succeeded; Vite reports its existing bundle-size advisory.
- `npm run test:kage`: full Room 3 keyboard playthrough passed with no browser errors. Covers main puzzle, relocated entrance, visible locked crystal, closed-gate collision, FOX rejection, WOLF success, crystal collection, return, team exit, persistence, small window and full reset.
- Visual inspection: output/kage/12a-distant-entrance.png, 12a-open-entrance.png, 12-hidden-room.png, 12b-closed-barred-gate.png and 14-crystal-collected.png.

Changes are saved directly; the workspace is not a Git repository.
