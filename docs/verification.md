# Verification: TypeScript + Phaser migration

Environment: Windows / PowerShell, Node.js 22.19.0, and the Codex in-app Chromium browser. Work performed on 2026-10-29. Phaser 4.2.1, TypeScript 7.0.2, and Vite 8.3.5 are fixed in the lockfile.

## Automated checks

- **17 TypeScript regression tests pass.** They cover powered/sustained lamp alignment, interruption, reuse after solving, no relocking/duplicate discoveries, walking to the operating marker, persistent lamp position/power, original v1 save compatibility, paused progression, repeated access input, wrong-sequence recovery, shadow demonstration placement, discovery order, new-game reset, corrupt checkpoints, safe spawn positions, blocked storage, variable-height jumping, coyote time, buffered jumps, no midair double jump, acceleration/braking, and expired input buffers.
- `npm run check` is now real strict TypeScript checking (`tsc --noEmit`), including unchecked-index checks and unused-local/parameter checks. It replaces the old syntax-only check.
- `npm run format:check` checks readable formatting throughout source, styles, tests, and documentation.
- `npm run build` runs type checking, creates the static Vite build, and checks a 500 KiB gzip runtime-JavaScript budget.

Tests for movement intent and puzzle state run without importing Phaser's browser runtime. Phaser collision integration is verified in the browser rather than claimed from the pure unit tests.

The production build's runtime JavaScript is approximately **1,393 KiB raw / 368 KiB gzip estimate**. This excludes source maps and is not a measured load time. The deployed host must enable HTTP compression for the compressed transfer size to apply. No minimum-device performance or GPU-memory benchmark is claimed.

## Browser playthrough

An isolated origin on port 4174 was used so tests did not overwrite the player's existing port-4173 checkpoint.

- Played from Begin through the photograph and end-of-opening dialog using actual keyboard/UI input.
- Walked into the suitcase to check blocking, jumped it, and opened the tram door.
- Reached the platform discovery and entered the lamp interaction through its walking approach.
- Switched the lamp off while aligned: it did not open the shutter. Switched it back on and completed the puzzle.
- Re-entered the lamp after solving, moved it, and switched it off: the shutter remained latched open.
- Stepped away, reloaded, and continued: the lamp restored at position 2220 with power off and the shutter open.
- Crossed the shutter and both street obstacles, saw the remembered knock, entered an incorrect access symbol, recovered with the correct sequence, and entered the maintenance room.
- Examined both photograph stages and reached the ending.
- Switched the isolated server from development mode to the built static preview. Confirmed the page loaded hashed production assets, continued, and found all six journal discoveries.
- Checked journal dismissal, pause, settings, reduced-motion toggle, return to pause, resume, and audio activation in the production build.
- Inspected the title, photograph, and lamp at 390 × 844, plus the lamp at 854 × 390. The phone title keeps both characters visible. The short-landscape puzzle controls leave the reaching hand visible. Temporary viewport overrides were reset.
- No browser errors or warnings were present in the final production-console check.

Two initial Phaser startup integration issues (explicit renderer selection for an existing canvas and an empty polygon) were corrected before the successful playthrough. These are recorded to distinguish the final verified state from the first build-only check.

## Limits

This is agent functional/visual verification, not independent human acceptance. Touch controls have not been tested on a physical phone. No full assistive-technology audit, Safari/Firefox acceptance, low-end hardware benchmark, or verified 10–15 minute pacing claim is included. The next useful evaluation is an unaided human playthrough focused on movement feel, shadow readability, and atmosphere.
