# Blocky World welcome screen

Goal: A beginner welcome before gameplay without character selection.

Design: Two responsive DOM panels with the supplied Room 1 video and easy English controls, mission and Play Game. English lang and translate attributes allow browser translation. Muted autoplay loops with sound and native controls. Play skips any time, pauses media, clears input and focuses gameplay. Existing started checks gate input and updates.

Alternative: Sequential video and instructions adds steps; two panels keep everything visible.

Plan: Add welcome.ts, replace the picker in main.ts, style the welcome and update the page title. Verify build and browser video playback, end/error states, input freeze, keyboard start and narrow layout.

Revision: Use Assets/volcanic_lair.jpg under a dark fade. Match existing game font and warm colors with a raised uppercase title, square stone panels, beveled key caps and gold Play Game button. Browser verification passed for actual loop restart, sound, input freeze, start, skip and narrow layout; production build includes the background.

Character selection revision: Show front-facing CSS crops of the supplied Yuki and Mia character sheets below the video. Each card states its power. Highlight Tab switching beneath the cards. Play uses a cyan door glow with reduced-motion support. Enter anywhere on the welcome starts with the selected hero; the listener is removed when gameplay starts. main.ts assigns the selected team hero before entering the room. Verified both selections, Enter from a character card, Tab in gameplay, looping video, narrow layout, media fallback and reduced motion.

Viewport revision: Hero choices beside controls/start, with tutorial below. Fit the entire measured welcome stage to the visible viewport with no scrolling. Observe resized content (including browser-translated text), window size and visual viewport zoom/pan. Fit the gameplay HUD to available width and height; update render dimensions, pixel ratio and camera projection on viewport changes. Preserve horizontal camera framing for narrow aspect ratios. Verified 1920x1080, 1366x768, 1280x720, 1024x600, 800x600, 640x360, 390x844 and 320x568, plus 150% visual viewport zoom. Small windows scale text down to keep all content visible.
