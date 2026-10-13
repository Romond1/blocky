# CODEX MASTER TASK — BLOCKY WORLD EXPANSION SYSTEM (ROOMS 11–30)

## Mission

Transform Blocky World from a game where every new room requires extensive individual programming into a scalable, data-driven adventure platform capable of producing distinctive, creative, educational 3D rooms efficiently.

The immediate goal is to design and implement Rooms 11–20, while building reusable architecture that makes Rooms 21–30 and future chapters substantially faster to create.

**We are not building a generic room template that produces nearly identical levels. We are building a reusable gameplay construction system that supports individually designed adventures.**

You have permission to inspect the existing codebase, propose necessary improvements, implement the reusable system, and develop new rooms within the boundaries below.

Do not deploy, merge, or push changes without approval. Preserve existing work and create a safe local checkpoint before major modifications.

---

# PHASE 1 — AUDIT THE EXISTING 10 ROOMS

Before implementing anything, inspect the current Blocky World project thoroughly.

For each existing room, identify:

- Environment and layout
- Existing puzzles and mechanics
- Vocabulary and grammar
- Instructions and learning objectives
- Hero abilities required
- Interaction types
- Collectibles and rewards
- Difficulty level
- Unique elements and scripted events
- Completion triggers
- Dependencies on other rooms
- Reusable code and opportunities for extraction

Produce a Room 1–10 curriculum and mechanics inventory.

Identify what children have already learned and which mechanics can be reused or combined in interesting new ways.

Do not assume any mechanic exists without verifying it in code.

Also inspect the game's rendering engine, scene graph, physics, input handling, progression tracking, asset loading, and current room construction approach.

Determine how much existing code can be reused without a major rewrite.

---

# PHASE 2 — DESIGN A REUSABLE ROOM-CONSTRUCTION SYSTEM

Build a lightweight, extensible system that makes creating future rooms significantly faster.

## 2.1 Data-driven room definitions

Where practical, room configurations should describe:

- Room identification and chapter
- Environment and visual theme
- Geometry and object placement
- Available characters
- Interactive objects
- Existing and custom puzzle mechanics
- Learning objectives
- Vocabulary and grammar
- NPC dialogue and instructions
- Trigger conditions
- Hints
- Win and failure conditions
- Collectibles and rewards
- Unlock requirements
- Optional secrets
- Audio and visual effects
- Difficulty settings

Use JSON, TypeScript configurations, or another appropriate representation based on the existing engine.

Do not force everything into JSON if some mechanics require genuine code.

Support reusable components together with custom room-specific behaviors.

## 2.2 Reusable gameplay components

Extract or generalize existing mechanics where useful:

- Doors and gates
- Switches and pressure plates
- Movable blocks
- Platforms
- Moving hazards
- Letter and word blocks
- Character abilities
- Collectibles
- Timers
- NPCs and dialogue
- Interaction triggers
- Checkpoints
- Teleporters
- Hidden passages
- Environmental clues
- Puzzle completion
- Room transitions

Only implement components that are justified by the existing game or planned rooms.

Avoid constructing an enormous speculative framework.

## 2.3 Modular room layouts

Support reusable environment pieces such as:

- Corridors
- Chambers
- Elevated platforms
- Bridges
- Vertical spaces
- Hidden rooms
- Multi-stage arenas
- Outdoor regions
- Puzzle stations

Allow custom layouts and geometry so rooms do not all share the same structure.

Do not automatically generate ten similar rectangles with different-colored walls.

## 2.4 Unique room behaviors

Create an extension mechanism for individually scripted events and special mechanics.

For example:

- A room that changes shape
- A bridge that appears when a sentence is completed
- A mysterious character giving misleading clues
- A room with reversed gravity
- A puzzle involving environmental transformations
- A chase or escape sequence

These are examples, not mandatory features.

The architecture must permit future creative mechanics without requiring a rewrite of the entire engine.

## 2.5 Validation and development workflow

Create a simple developer-facing workflow for:

1. Creating a new room definition
2. Selecting a layout
3. Adding existing components
4. Assigning learning objectives
5. Adding custom mechanics
6. Previewing the room
7. Checking completion conditions
8. Testing for unreachable objectives
9. Adding the room to progression

A visual editor would be nice eventually, but it is NOT required in this phase.

A reliable configuration-based workflow with validation is preferable to spending days building an editor.

Create a working example and clear documentation for adding future rooms.

---

# PHASE 3 — ENGLISH-LEARNING PROGRESSION

Blocky World is an educational adventure game for approximately ages 5–10, including children who may not yet speak much English.

The next rooms should gradually develop language comprehension while maintaining engaging gameplay.

Use the verified vocabulary and mechanics from Rooms 1–10 as the starting point.

Proposed progression:

### Rooms 11–13: Expansion

- Familiar vocabulary used in new situations
- Colors, shapes, objects, and action verbs where appropriate
- Short instructions
- Simple word recognition
- Combining previously learned concepts

### Rooms 14–16: Connections

- Directions and spatial relationships
- Sequencing
- Descriptions
- Short phrases
- Multi-step instructions
- Reading environmental clues

### Rooms 17–19: Application

- Simple sentence construction
- Questions and answers
- Problem-solving through language
- Combining several language skills
- More complex instructions

### Room 20: Mastery

- A multi-stage final adventure
- Revisiting important language and gameplay skills
- A satisfying challenge and conclusion

Treat this as a starting curriculum, not a rigid specification.

Adapt it based on what the first ten rooms actually teach.

**Difficulty should increase through reasoning and language development, not merely smaller platforms, faster timers, or more frustrating movement.**

Keep language difficulty and physical-gameplay difficulty separately configurable where practical.

Include hints and forgiving recovery mechanisms.

---

# PHASE 4 — DESIGN ALL TEN ROOMS BEFORE IMPLEMENTATION

Produce ten complete room design specifications for Rooms 11–20.

Each specification must include:

1. Room name
2. Visual/environment theme
3. Narrative premise
4. Primary gameplay mechanic
5. Secondary mechanic
6. Unique surprise or twist
7. Vocabulary targets
8. Grammar or language pattern
9. Puzzle sequence
10. Hero abilities involved
11. Interactive objects
12. Collectibles and optional secrets
13. Hint system
14. Failure/recovery behavior
15. Completion condition
16. Estimated play duration
17. Required new code/components
18. Existing components that can be reused

Each room should have a distinct identity.

## Anti-repetition requirements

Avoid designing rooms that differ only by:

- Colors
- Number of switches
- Number of word blocks
- Number of enemies
- Platform speed
- More difficult vocabulary

Introduce meaningful variation across the ten-room sequence.

For example, vary:

- Exploration versus puzzle-solving
- Vertical versus horizontal environments
- Individual hero abilities versus combined abilities
- Environmental manipulation
- Story-driven mysteries
- Timing and coordination
- Hidden discoveries
- Dialogue-based challenges
- Multi-stage puzzles
- Unexpected transformations

Do not introduce ten completely new gameplay systems either. Recombine proven systems creatively, with a limited number of genuinely new mechanics.

Design deliberate pacing: quieter discovery rooms, more demanding puzzle rooms, occasional surprises, and a memorable finale.

The player should not be able to predict exactly what Room 16 will contain merely from playing Room 15.

## Story independence

Rooms 11–20 must NOT be dependent on Be a Hero Season 2.

Blocky World can reference the larger Be a Hero universe, but its adventures must work independently.

Do not introduce fixed Season 2 plot developments or characters that restrict future storytelling.

The transition after Room 10 should offer:

- Return Home — complete the original adventure
- Continue Exploring — unlock the next chapter

Both choices must preserve progress.

Children who have never watched Be a Hero should understand and enjoy Chapter 2.

---

# PHASE 5 — IMPLEMENT THREE REPRESENTATIVE ROOMS

Before mass-producing Chapter 2, implement three rooms that test substantially different capabilities of the new architecture.

Choose representatives with distinct requirements:

**Room A — Component reuse**

Demonstrates building a complete room efficiently from existing mechanics.

**Room B — Custom mechanic**

Demonstrates adding a unique puzzle behavior without modifying large portions of the engine.

**Room C — Complex integration**

Demonstrates combining multiple puzzles, educational objectives, hero abilities, and completion triggers.

These do not have to be Rooms 11, 12, and 13. Choose the best candidates from the ten-room design.

All three must be genuinely playable.

Test movement, collisions, puzzles, win conditions, rewards, progression, and both desktop and mobile input where supported.

Ensure the existing Rooms 1–10 remain functional.

Do not blindly proceed to mass generation if this architectural validation fails.

Repair architecture-level failures first.

---

# PHASE 6 — GENERATE ROOMS 11–20

Once the three representative rooms are working, use the reusable architecture and approved design specifications to implement the remaining rooms.

Create real, playable rooms, not empty placeholders.

Each room should have:

- Its own spatial layout
- Working puzzles
- Interactive objects
- Clear learning objectives
- Functional progression
- Rewards and secrets where specified
- Distinct visuals
- Tested completion logic

Avoid duplicated layouts and superficial variations.

Use available assets, meshes, materials, and effects where appropriate.

Build only the new assets or mechanics actually required.

Run automated structural validation for every room.

Where practical, validate:

- Spawn and exit accessibility
- Object and trigger references
- Required assets
- Collision geometry
- Puzzle state transitions
- Room completion
- Progress saving
- Hero switching
- Touch and keyboard compatibility

Automated validation is not a replacement for real gameplay testing. Flag any rooms whose puzzles require manual verification.

---

# PHASE 7 — DESIGN CHAPTER 3 (ROOMS 21–30)

After Chapter 2 is implemented and validated, generate a complete design document for Rooms 21–30.

Do not implement Chapter 3 yet.

Chapter 3 should:

- Increase English complexity appropriately
- Introduce fresh environmental themes
- Expand previously established mechanics
- Introduce a small number of new mechanics
- Build on earlier language learning
- Have its own distinct ending
- Remain independent from the main Be a Hero series

Explain how the new construction system could implement Chapter 3 efficiently.

---

# PHASE 8 — TESTING AND DOCUMENTATION

Preserve and verify:

- Rooms 1–10
- Existing hero abilities
- Existing collectibles and rewards
- Keyboard gameplay
- Mobile touch gameplay
- Save and resume
- Room unlocking
- Replay previously completed rooms
- Chapter completion
- Transitions between rooms

Do not erase existing progress.

Ensure newly added rooms do not become accessible before meeting the appropriate unlock requirements.

Provide documentation explaining:

- How to create a new room
- How to reuse components
- How to add custom mechanics
- How to define vocabulary and grammar
- How to create hints
- How to configure rewards
- How to test and validate a room
- How to add further chapters

Make future development understandable without needing to rediscover the architecture.

---

# IMPLEMENTATION AUTONOMY AND SAFETY

You may work autonomously through the phases, provided that:

- Existing functionality is preserved.
- You do not deploy or push changes without approval.
- You maintain safe local checkpoints.
- You do not invent dependencies on unavailable assets.
- You do not replace the existing game with an unrelated engine.
- You do not rewrite functioning systems without a concrete reason.
- You keep the public player interface free of development tools.
- You prioritize maintainable systems over excessive abstraction.

If architectural constraints make the proposed system significantly more expensive than expected, explain the tradeoff and implement the smallest viable alternative.

If time or context limits prevent completion, prioritize a working reusable foundation, the complete Chapter 2 design, and the three playable representative rooms over partially broken implementations of ten rooms.

Do not claim a room is finished merely because it renders.

A completed room must support its intended interactions and completion conditions.

---

# FINAL DELIVERABLES

Provide:

1. Audit of Rooms 1–10
2. Reusable architecture summary
3. Complete Rooms 11–20 specifications
4. Working room-construction system
5. Three validated representative rooms
6. Remaining Rooms 11–20 implemented if validation succeeds
7. Chapter 3 design (Rooms 21–30)
8. Testing results
9. Known problems and manual checks
10. Clear instructions for creating Room 31 and beyond

**Ultimate objective: Make future room production much faster without sacrificing creativity, educational progression, or gameplay quality.**

Work systematically. Preserve the existing game. Build something that can grow.