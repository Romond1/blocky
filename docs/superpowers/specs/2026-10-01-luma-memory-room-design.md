# Luma memory room

Room 5 gets an optional memory room underneath the balcony, through a dim, permanently open passage at (10.8, -12), to the right of PEAR. Mirror Kage's room horizontally and offset it to this entrance, so the hallway turns left. Reuse the same basalt gallery, large framed images, question sign, independent pressure plate and barred crystal recess. Cut only the required opening in the main cave's rear geology.

Use all three supplied images from Assets/Characters/Memory Christals/Luma, copied into public/memories/luma with stable descriptive filenames. Ask "What animal is Luma?" WOLF and SPIDER remain removable incorrect answers; FOX opens the memory gate. Put three standard light animal blocks in the gallery. Keep the blue crystal visible when locked, with stable identity room5_memory_crystal_luma, using the existing shared collection/persistence system.

Keep the fruit plate indices 0–2 and lift control indices 3–4 unchanged; reserve index 5 for Luma. Optional puzzle progress never changes fruit matches, door power or lift control state. Both heroes can enter and solve independently of the main puzzle. Keep upper balcony boundaries closed, so the room is accessible from the ground floor only. Share the existing room logic/view with data for the character, answer, slot, assets and mirrored coordinates instead of maintaining a divergent copy.

Verify entrance and turn movement, both heroes, wrong/correct answers, gate safety, visible but locked reward, independent fruit/lift behavior, return route, save persistence and reset. Re-run Kage's playthrough after sharing its logic, and Room 5's fruit/lift playthrough after extending its layout.
