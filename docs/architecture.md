# Architecture and migration decisions

## Target

Chasing Shadows is browser-first. TypeScript provides checked state and event contracts, Phaser provides the game runtime, and Vite provides development and static builds. The versioned lockfile fixes the dependency graph. There are no runtime CDN dependencies.

## Boundaries

`main.ts` creates a `ChapterModel`, an `OpeningScene`, and an `AppController`, then boots Phaser. It does not contain gameplay or a second requestAnimationFrame loop.

`OpeningModel` owns discoveries, the journal, the current interaction, and checkpoint state. It composes `LampPuzzle`, `AccessPuzzle`, and `ShadowBehavior`. Its event union constrains event names and payloads at compile time. It imports no Phaser or DOM implementation.

`OpeningScene` owns Phaser objects and the scene lifecycle. Its static zones use Arcade Physics collision, and a `Player` sprite uses a small pure `Movement` controller to request velocity/jump changes. Phaser integrates the body at a fixed 120 Hz; rendering and the controller sample follow the scene update. Coyote time and jump buffering are measured in seconds. Jump release caps upward velocity for a shorter hop.

`Shadow` is a separate sprite, not a physically simulated environmental shadow. `ShadowBehavior` supplies authored modes and position. Lighting changes its projection during the station interaction. This keeps the supernatural rule deliberate and readable.

`AppController` owns HTML menus, journal, puzzle controls, focus, and accessibility announcements. UI never runs the physics loop. `SaveStore` validates unknown JSON, normalises progression, supports the original v1 save key, and retains an in-memory checkpoint when storage is blocked.

`data/opening.ts` is the source of truth for physical obstacles, movement tuning, lamp bounds/projection, the shutter, and access geometry. Decorative illustration coordinates stay in the art module; gameplay placement does not depend on those decorative coordinates.

## Art and rendering

Original environment illustration is preserved as texture-generation code. At startup, it paints seven world chunks and reusable textures. Phaser renders those images; the full environment is not redrawn by Canvas every frame. Skyline TileSprites provide parallax. Mechanisms, the traveller, the shadow, and dust are independent Phaser game objects.

The traveller's 24-frame sheet is generated locally once. It includes walking, breathing, rising, falling, landing, looking, reaching, knocking, and access gestures. New proportions, articulated limbs, scarf, satchel, boots, and the torn cuff refine the design while preserving the photograph clue. This is procedural prototype illustration, not final hand-drawn production art.

Chunking limits individual texture dimensions, not total GPU memory. Runtime memory, actual startup time, and low-end-device performance still need measurement. The build checks compressed JavaScript size separately from visual quality.

## Reusable interactions

The light puzzle separates **persistent world state** from **temporary interaction state**:

- The shutter's solved flag is permanent in the checkpoint.
- The lamp's x position and on/off state remain adjustable and persist independently.
- Alignment is temporary, drains when interrupted, and has no effect on the latched shutter.
- Revisiting never reissues the light discovery or relocks the exit.
- Stepping away saves the adjusted lamp, and approaching its marker uses ordinary movement.

The access panel is repeatable after solving. Correct repetition recalls the rhythm without duplicating journal entries. A wrong attempt resets only the input sequence.

## Deliberate limits

The chapter uses one reusable Phaser scene. A room event restarts that scene with the same ChapterModel. Shutdown removes room objects, colliders, input listeners, and subscriptions. Seven room definitions describe doors and safe entry locations; interior graphics are recreated per visit. Shared character and original street textures are cached, with a fixed texture set rather than a growing cache per visit. No GPU-memory benchmark is claimed.

ChapterModel extends OpeningModel to preserve the original puzzle contracts. It owns room travel, chapter milestones, hazard clocks, and memory/ending/death sequences. The trolley warns for 2.5 seconds and moves at 210 units/s; water warns for 2.5 seconds and rises at 35 units/s. The lower shelter uses the shared floorAt staircase geometry and vertical camera following.

SaveStore writes a version-2 envelope (`{ version: 2, checkpoint }`) under the new chapter key; the internal checkpoint retains the compatible opening fields plus room, marks, and safe floor height. Validation reconstructs safe floor positions and moves unfinished encounter saves to their entrance. During danger or a sequence, snapshot returns the last safe checkpoint. Legacy finished means photo examined, never chapter complete. The old save key is not overwritten by chapter play.

The HTML interface is retained for keyboard-accessible controls and dialogs. No React dependency is needed for this scope. The UI controller remains larger than the individual systems; split it further if journal/menu features grow.

The build is static and does not add a service worker or hosting account. No desktop engine port, multiplayer, backend, or cloud save is included.

Death is a model event carrying a typed cause. The model enters a terminal-for-this-attempt death sequence and stops advancing until retry() is called. AppController owns the death dialog, keyboard focus, non-dismissal on Escape, and title navigation. retry() accepts only the dead state and restores the last safe checkpoint through the normal start/room lifecycle. Death is not persisted as a resumable checkpoint.
