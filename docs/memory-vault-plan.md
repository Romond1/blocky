# Room 2 — The Memory Vault

Approved request: a substantially larger volcanic chamber; three phrase blocks (SAVE KAGE, MEET LUMA, MEET ARACHNE); numbered pedestals 1–3; movable letter decoys; only full arrangements validate. All pedestals flash together on failure with no partial correctness hints. The correct sequence opens a massive stone door with MEMORY RESTORED and a low impact sound.

User-confirmed chronology: SAVE KAGE → MEET LUMA → MEET ARACHNE.

Implementation: extend the existing data definition with layout and sequence; keep pickup/drop and slot logic shared. Add a hand-authored larger room renderer. Transition into it when leaving Room 1; support ?room=2 as a development shortcut. R resets the current room. Occupied-slot swaps avoid unnecessary dropping while rearranging. Do not expand into Room 3 or introduce an inventory, mining, combat or deployment.

Verification: rule tests for partial/full validation, recovery, swaps, decoys, safe drops and collision boundaries; real keyboard browser playthrough of both rooms; inspect screenshots of phrases, shared rejection, open doorway and smaller viewport.
