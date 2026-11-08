# Changelog

Notable changes to Chasing Shadows, newest first. Versioned entries describe completed implementation milestones; they do not imply a public release or deployment.

Record future changes under **Unreleased** as part of the same work. Use Added, Changed, Fixed, and Removed where applicable, describe player-visible effects, and note save compatibility or development requirements when they change. When a new version is completed, move those entries into a dated section matching `package.json`. Keep detailed verification evidence in [docs/verification.md](docs/verification.md).

## Unreleased

### Added

- 2026-11-08: Began Chapter Two with an explicit continuation from completed Chapter One saves, a pause-safe six-second blanket farewell and changing shadow response, a reversible upper exit, residential-lane prototype illustration, optional bicycle discovery, and an honest current-content boundary. The remaining district route and home scenes are not implemented.
- Campaign v3 saves import valid v2/v1 progress while preserving those older storage keys. New-game/replay writes a fresh campaign; unfinished farewell reloads safely before the action, completed farewells and lane discoveries persist. Added continuation and campaign-compatibility regression coverage.
- 2026-11-08: Added a detailed Chapter Two playable-sequence draft for design review, covering reuse of No. 14, residential exploration, a utility light puzzle, one short escape, Grace's relationship/evidence sequence, checkpoints, and proposed save compatibility. The user selected the one-escape/exploration balance; remaining execution details are proposals. No gameplay or storage behavior changes.
- 2026-11-08: Recorded the approved Chapter Two direction in `docs/chapter-two-design.md`: Daniel's quiet farewell, a residential search for home, fallible shadow memories, Grace's relationship reveal, and evidence suggesting her initial survival. Exact routes, clues, and hazards remain to be designed; no Chapter Two gameplay or save changes are included.
- Playable Chapter One: seven connected rooms, enterable workshop and shelter, courtyard loop and inside-opened shelter shortcut.
- Thomas’s automatic name discovery, Daniel’s staged living memory, persistent chapter journal entries, and a separate body-discovery ending.
- Trolley and flood escapes with 2.5-second warnings, automatic death recovery, pause-safe timing, and checkpoints outside active hazards.
- Version-2 chapter storage with validated legacy import and preservation of the original save key, plus chapter regression tests.

- This changelog, linked from the README and included in formatting checks.
- A repository-wide `AGENTS.md` handoff guide covering the game's direction, implemented opening, architecture, development workflow, save compatibility, and verification limits for future AI contributors.
- A story/world design record naming Thomas and his fiancée Grace, establishing the other citizens' deaths including Thomas's family, and recording the approved direction of enterable buildings. Proposed reveal pacing, interior routes, and transition/save requirements are separated from implemented gameplay and unresolved world rules.

### Changed

- 2026-11-08: Recorded the user's satisfactory full Chapter One playthrough and playable-prototype completion, separately from remaining device, performance, pacing, and broader playtest acceptance.
- Replaced automatic blackout/restart with a persistent YOU DIED screen, cause-specific messages, focused Try again button, and Return to title. Death freezes the encounter until the player chooses; retry restores the safe checkpoint without losing earlier discoveries.

- 2026-10-30: Workshop entry now requires E; the street continues past the door to a readable employee portrait and a blocked forecourt. Thomas can discover his name outside or inside the workshop.
- Expanded Daniel’s memory to 18 seconds with staged repair, bag handoff, departure, fades, and timed dialogue. Added Daniel’s own brown-coat character sheet and a dedicated horizontal body illustration with pillow, bedding, slack arm, and dried blood instead of rotating the standing sprite.

- Refined the story design to an altered physical city, a shadow formed from Thomas's old memories, and a family of parents and a younger brother. Chapter One now ends on proof of the brother's death, with the parents' losses revealed individually later. Removed the proposed Chapter One live-response payoff and documented a proposed suitcase/brother connection; these are design updates, not new playable scenes.
- Specified automatic observation of a reddish/blood-like suitcase mark, partial identity recovery before the brother's death reveal, and forgiving survival/pursuit with last-checkpoint recovery. Removed the proposed optional suitcase inspection and need for a luggage-abandonment explanation. These mechanics and scenes remain planned rather than implemented.
- Confirmed Daniel as Thomas's younger brother (around 19), Thomas in his late twenties, and a first-chapter scope of two enterable buildings, a connecting passage, one optional branch, and two short pursuits beyond the existing opening. Pursuer design remains open; no duration or implemented expansion is claimed.
- Simplified the story premise: Thomas and Grace survived by luck. Removed the proposed connected/special survival mechanism and its associated pursuer rationale; pursuit/survival remains the gameplay focus, with enemy design still open.

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
