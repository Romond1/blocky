# Room 7 action station rework — 2026-10-02

Final user revisions: one large block and three small blocks, small → big → small on big → LIFT ledge; faster large-block transport than the intermediate version; raised LIFT sign behind its word; smaller JUMP sign; elevated neighboring pickup and near-wall placement.

All verb blocks exist from room load and remain light. Collection comes from ordinary pickup. Removed timed RUN reveals, hatch animation, moving gate and orange LIFT activation plate. Ferry coordinates/behavior and final word matching remain unchanged.

The belt travels toward the entrance at 5.5 units/sec: Yuki's 3.5 speed loses ground, Mia's 7 gains 1.5, stopping reverses progress. Airborne speed 5 cannot bypass the belt. Companion holds during station switches.

LIFT's base is 2.2 high and requires strength 2. Yuki carries it at 1.4 units/sec. The three .8 pieces use normal light-object rules. The ledge is at Y=3.8. Both heroes need a small first step and can then climb the base, a small piece resting at Y=2.2, and the ledge. No exact placement arrangement is checked. The extra small piece is available for experimentation.

Near-wall drops use the visible cube volume and current carry anchor. Equivalent cube orientations avoid a spurious 180-degree corner sweep. A supporting block does not steal the highlight from another reachable block. Actor-aware settling prevents placing a cube into the hero; when one nearby surface is blocked, stacking tries another candidate. Multiple small pieces can share a large support. Existing top-first support removal prevents floating chains.

Evidence: output/action-stations (initial goals, each station entrance, small/big/small route, elevated retrieval, near-wall drop/pickup, both-hero climbing), output/action-chamber (full ferry/matching/exit/reset route), output/action-stations-tests.log. Browser checks use real keyboard controls and window.advanceTime; no direct browser-state edits. The Node suite covers both heroes, movement values, recovery, support and creative-placement cases. npm run build passes with the existing bundle-size advisory.

The workspace is not a Git repository. Child usability and hardware performance require human playtesting; automated tests establish mechanics and regressions, not those subjective outcomes.

Final validation: 290/290 Node tests, production build, full Room 7 keyboard playthrough, both-hero LIFT progression/elevated pickup, near-wall placement/retrieval, carried-cube collision and final develop-web-game smoke passed. Browser error arrays were empty and final screenshots were opened and inspected.
