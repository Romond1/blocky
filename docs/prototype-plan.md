# Prototype 0.1

The user approved the attached single-room brief and clarified that block manipulation, not terrain editing, is the core mechanic.

Use Three.js + TypeScript + Vite. A small simulation owns player position, blocks, socket, door and completion. Render objects mirror that state. Simple circles against static rectangles suffice for a flat room without jumps or physical stacking. No physics engine or general game framework is needed.

1. Test puzzle validation, recovery, reset, wall/door collision, and safe block drops.
2. Implement the simulation and data definition independently of rendering.
3. Build primitive volcanic room, third-person camera, placeholder model, readable dynamic letter textures and concise DOM feedback.
4. Browser-test keyboard movement, camera, pickup/drop, wrong-answer retrieval, success, doorway and reset. Inspect screenshots and console.
5. Document commands, controls, model replacement and scope; leave local server running for user testing.

Keep controls camera-relative, using mouse drag to orbit without trapping the pointer. E picks up/drops or snaps into a nearby empty socket. Wrong answers stay immediately retrievable. Correct answers lock and raise the exit gate; escape occurs only when walking through the doorway.
