# Verification

Environment: Windows / PowerShell, Node.js, and the Codex in-app browser. Checks performed during implementation on 2026-10-29.

## Automated checks

All 11 `npm test` cases passed. They cover collision/jump traversal, the locked tram door, one-time shadow discoveries, sustained light alignment and reset, shutter animation blocking, incorrect/correct access input, paused simulation, the access demonstration's position, checkpoint restore/replay, malformed saves, and airborne checkpoint recovery.

`npm run check` checks all runtime JavaScript files and the local server with Node's syntax checker.

## Browser playthrough

The opening was played through with actual keyboard/UI input from Begin to the ending:

- Reached the suitcase, jumped it, opened the tram, and saw the platform discovery.
- Entered the lamp controls, changed the range slider, and crossed the unlocked shutter.
- Jumped the street obstacles and saw the remembered knock.
- Entered an incorrect access symbol, recovered with the correct sequence, and entered the maintenance room.
- Examined both photograph stages and reached the end-of-opening dialog.
- Reloaded, continued from the maintenance room, and verified all six journal entries were present.
- Opened/dismissed the journal, paused, opened settings, toggled reduced ambient motion, and returned to pause before resuming.
- Enabled audio successfully; no browser error or warning logs were recorded at that check. Sound quality still needs listening evaluation.
- Inspected the title and photograph at 390 × 844. This is a browser viewport check, not a physical-phone playtest. Restored the browser viewport override afterward.

The first visual pass identified and corrected a lamp overlay that obscured the actors, a caption that assumed the player had stopped, and a photograph modal that needed more vertical space. Checkpoint tests also cover a fast route that reaches the access puzzle before the knock finishes.

## Limits

This is functional and visual verification by an agent, not independent human acceptance. No minimum-spec hardware benchmark or full assistive-technology audit has been performed. The original 10–15 minute pacing target has not been validated; this version is a compact prototype. The next evaluation is an unaided human playthrough.
