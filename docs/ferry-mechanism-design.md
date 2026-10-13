# Room 7 horizontal lift appearance

Requested change: make the lava platform read as a moving mechanism, with two rails across the gap and mechanical arrival areas.

Implemented two continuous steel guide tracks aligned with the existing ferry travel, a carriage with four rollers beneath the deck, and square gray docking frames at both banks. Circular inset markings and corner fasteners identify each receiving area. The original purple controls and deck markings remain. Dock insets sit below the deck so their markings disappear naturally while the platform is parked.

This change is visual only: transport simulation, boarding, cargo support, travel timing and control plates retain their existing behavior. Tracks have no walkable collision surface.

Verification: production build passed; focused keyboard browser test covered departure, transit, far docking and return without browser errors; the complete Room 7 station, cargo ferry, matching, team exit and reset route passed. The web-game skill smoke passed. Screenshots inspected in output/ferry-mechanism. The existing production bundle-size advisory remains.
