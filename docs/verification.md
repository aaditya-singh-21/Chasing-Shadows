# User playthrough and design approval — 2026-11-08

The user reports completing Chapter One's full playthrough and says it "felt alright." This supports treating Chapter One as complete as a playable prototype with first user acceptance. The report does not identify the browser, viewport, device, elapsed time, or individual encounter/retry checks; do not infer those results or final-art approval from it. Broader playtesting and the previously recorded device/performance/accessibility limits remain open.

The user also approved Chapter Two's narrative direction, now recorded in chapter-two-design.md and story-and-world.md. This is design approval, not implementation or gameplay verification. This update changes documentation only; historical automated and browser checks below are not fresh checks for this update.

# Death-screen verification — 2026-10-30

The latest death flow replaces the historical automatic respawn recorded below. Forty regression tests cover the chapter and opening, including waiting indefinitely after death, a single cause event, explicit safe retry, repeated-retry guards, and title/Continue checkpoint preservation. Strict TypeScript, formatting, production build, and bundle checks pass.

Targeted in-app Chromium checks use synthetic pre-encounter checkpoints on isolated port 4174. Actual input triggers trolley and flood deaths, verifies cause-specific YOU DIED content, Escape protection, keyboard retry, and title/Continue behavior. These are targeted encounter checks, not a new full-chapter playthrough. Physical-phone touch and other browsers remain unverified.

# Chapter review verification — 2026-10-30

- 38 tests pass, including explicit-only workshop entry, name portrait discovery without chapter completion, and the longer memory’s dialogue ordering and pause behavior. Strict TypeScript, formatting, production build and gzip budget checks pass.
- Targeted in-app Chromium review uses synthetic checkpoint fixtures on isolated port 4174. These fixture-based checks do not constitute a fresh full-chapter playthrough.
- Actual keyboard/UI input walked past the unlocked workshop into the forecourt, read the Thomas portrait close-up, viewed multiple memory actions and dialogue beats, paused/resumed the memory, and approached Daniel’s revised body scene. The standing character is no longer rotated to form the body.
- Artwork remains procedural illustration. Physical-phone, Firefox/Safari, independent human emotional acceptance, and hardware performance checks remain unverified.

The following records earlier chapter acceptance and migration history; its old memory duration and body-art limitations have been superseded by this refinement.

# Verification: Chapter One

Environment: Windows / PowerShell, Node.js 22.19+, in-app Chromium. Implementation checks performed 2026-10-29.

## Current automated checks

- 35 regression tests cover retained opening puzzles/movement and chapter room destinations, every door’s transition, automatic suitcase discovery, name-before-brother progression, photograph versus chapter completion, repeated endings, trolley/flood warning and recovery, pause, safe snapshots/reloads, legacy migration, v2 precedence, corrupt storage fallback, legacy-key preservation, and progression-safe spawn validation.
- Strict TypeScript, Prettier formatting, production build, and the 500 KiB gzip runtime-JavaScript budget pass.
- Latest runtime bundle is approximately 373 KiB gzip estimate, excluding source maps. This is not measured transfer time or GPU performance.

## Browser evidence

Tests used isolated port 4174; the user’s port-4173 checkpoint was not used for playtesting.

Development-browser input verified the tram/station puzzles, optional courtyard loop, workshop identity, service trolley, shelter shortcut, Daniel memory, flood staircase, and body/ending. Intentional trolley collision and waiting in the flood both returned Thomas to their safe entrance checkpoints. Pause was exercised during pursuit. Browser work exposed and corrected street-return placement, interior camera origin, and staircase visibility issues.

The static production preview was then played from Begin through the ending with actual keyboard/UI actions. It covered both successful escapes, automatic identity/memory ordering, the body scene, ending journal controls, reload to title, and Continue availability. The optional courtyard and intentional deaths were exercised in the development build, not repeated as part of the production run. The final production console check returned no errors or warnings.

The production flood escape completed using keyboard input at 390 × 844. The body scene was inspected at 390 × 844 and 854 × 390, and the viewport override was reset. Desktop staging was inspected at the normal browser size. These are viewport checks, not physical-phone touch acceptance.

## Limits

Art and memory staging remain procedural prototypes, with Daniel based on a tinted/scaled shared character sheet. No voice acting, final character illustration, measured unaided runtime, independent human acceptance, physical-phone touch test, Safari/Firefox acceptance, GPU-memory test, or full accessibility audit is claimed. Room shutdown uses Phaser scene cleanup and scoped subscriptions; no long-duration memory profiling was performed. The original street texture set is cached for reuse rather than unloaded between visits.

## Historical opening-migration evidence

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
