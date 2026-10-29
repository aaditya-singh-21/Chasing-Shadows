# Changelog

Notable changes to Chasing Shadows, newest first. Versioned entries describe completed implementation milestones; they do not imply a public release or deployment.

Record future changes under **Unreleased** as part of the same work. Use Added, Changed, Fixed, and Removed where applicable, describe player-visible effects, and note save compatibility or development requirements when they change. When a new version is completed, move those entries into a dated section matching `package.json`. Keep detailed verification evidence in [docs/verification.md](docs/verification.md).

## Unreleased

### Added

- This changelog, linked from the README and included in formatting checks.
- A repository-wide `AGENTS.md` handoff guide covering the game's direction, implemented opening, architecture, development workflow, save compatibility, and verification limits for future AI contributors.

## 0.2.0 - 2026-10-29

### Added

- Lamp power controls through the L key or an on-screen button. Lamp position and power persist in checkpoints.
- Variable-height jumps, coyote time, jump buffering, acceleration/braking, and landing poses.
- A redesigned traveller with a storm coat, amber scarf, satchel, articulated limbs, and walking, jumping, breathing, and interaction animations.
- Strict TypeScript checks, Vite development and static production builds, formatting checks, and a 500 KiB gzip runtime-JavaScript budget.
- Seventeen regression tests covering movement, puzzles, progression, and checkpoint handling. Browser playthrough evidence is recorded in the verification document.
- Architecture documentation describing scene, gameplay, artwork, input, storage, audio, and UI ownership.

### Changed

- Migrated the JavaScript/Canvas opening to TypeScript and Phaser 4.2.1. Phaser now manages scene rendering, sprites, animation, camera, input, and Arcade Physics; story and puzzle rules remain independent of the engine.
- Generate environment illustrations and character textures once for reuse during rendering.
- Walk to the lamp's operating position with a cancellable approach.
- Allow the access rhythm to be replayed after unlocking, without duplicate discoveries.
- Improve portrait composition and short-landscape puzzle layouts. Reduced ambient motion preserves essential walking and interaction animations.
- Development now requires Node.js 22.19+ and dependency installation. Hosted builds use static files; local play works offline after setup. Hosted offline reopening still requires a future caching solution.

### Fixed

- Keep the maintenance lamp usable after its puzzle is solved. Moving it or switching it off leaves the shutter latched open and does not award duplicate discoveries.
- Require powered, sustained lamp alignment to open the shutter.
- Preserve motion correctly through pause and prevent puzzle progression while paused.
- Accept original v1 checkpoints using the existing storage key, default missing lamp power to on, and recover safely from corrupt or unavailable storage.

### Removed

- The custom JavaScript rendering/game loop and development server, replaced by Phaser and Vite.

## 0.1.0 - 2026-10-29

### Added

- The first playable opening: escape Tram 07, witness independent shadow movement, solve the lamp/shutter puzzle, cross Mercer Street, follow the remembered knock, repeat the access rhythm, and examine the staff photograph.
- A discovery journal, local checkpoints, Continue, and replay.
- Keyboard, click-to-walk, and touch controls; pause, sound, fullscreen, reduced ambient motion, and keyboard-operable HTML dialogs.
- Locally generated Canvas/SVG artwork and synthesized Web Audio, with no remote game assets.
- Deterministic gameplay tests, a local development server, and opening design/verification documentation.
