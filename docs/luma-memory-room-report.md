# Luma memory room — 2026-10-01

Room 5 now includes a dim, permanently open passage at (10.8, -12), right of the PEAR picture and beneath the upper balcony. The hallway turns left into a mirrored copy of the large Kage gallery. The room shares basalt walls, fractured floor, framed artwork, pressure plate and barred reward gate with Kage's room.

All three provided Luma images were copied into public/memories/luma. Their original aspect ratios are preserved, including the vertical portrait. The question reads "What animal is Luma?" Three light blocks read WOLF, FOX and SPIDER. Only FOX opens the optional gate. The blue memory crystal remains visible through closed bars and uses independent persistent identity room5_memory_crystal_luma.

The existing fruit sockets 0–2 and lift controls 3–4 remain separate from the optional plate at index 5. The secret puzzle does not change fruit matches, main exit power or elevator state. Ground-floor entry is accessible before solving the fruit puzzle; upper balcony rear boundaries remain closed. Camera bounds use the active memory room's coordinates.

Validation:

- `npm test`: 192 passed, zero failures, including both heroes solving FOX, wrong-answer removal, continuous passage/turn movement, independent fruit/lift state, visible locked reward, collection, persistence and reset.
- `npm run build`: successful, with Vite's bundle-size advisory.
- `npm run test:luma`: complete keyboard exploration, WOLF rejection, FOX success, crystal collection, return to PEAR, persistence, small-window view and reset; zero browser errors.
- `npm run test:kage`: complete existing Room 3 playthrough passed.
- `npm run test:fruit`: existing Room 5 transport, cargo, fruit matches, reunion, team exit, reverse rider and reset playthrough passed.
- Inspected output/luma/01-pear-hidden-entrance.png, 02-luma-gallery.png and 03-closed-bars-visible-crystal.png. Confirmed dim entrance placement, readable unmirrored pictures/question and visible crystal behind iron bars.

Changes are saved directly. The workspace has no Git repository.
