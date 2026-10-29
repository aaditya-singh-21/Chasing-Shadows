# Chasing Shadows

A browser-first, single-player 2D mystery. You wake on an empty tram. Your shadow knows the way out—and remembers people you don't.

The playable opening uses **TypeScript (strict mode), Phaser 4.2.1, and Vite**. The original Canvas game has been migrated to Phaser scenes, sprites, animations, camera, input, and Arcade Physics.

## Run locally

Development requires **Node.js 22.19+**. Players of a hosted build only need a modern browser with WebGL support.

```powershell
npm ci
npm start
```

Open **http://127.0.0.1:4173**. Begin starts a new opening; Continue restores the existing checkpoint. Keep the terminal running during local play. Ctrl+C stops the server. To use another port:

```powershell
npm run dev -- --port 4174
```

Dependencies are fetched during setup. Once installed, local play works without an internet connection. No game asset, font, analytics script, or audio sample is fetched from a CDN. Browser storage holds one local checkpoint, including the lamp's position and power. Existing v1 checkpoints from the original prototype are accepted on the same browser origin.

## Build for a website

```powershell
npm run build
npm run preview
```

Deploy the generated `dist/` folder to static hosting. The relative asset base supports hosting inside a subdirectory. No Node gameplay server or account system is required. A hosted version needs an initial network load; offline reopening is not automatically guaranteed because a service worker has not been added.

The build performs strict type checking and enforces a **500 KiB gzip runtime-JavaScript budget**. Its compression figure is a build estimate, not a measured connection time. The production host needs to enable compression. Source maps are emitted for debugging and are excluded from that runtime budget.

## Controls

| Action               | Input                                             |
| -------------------- | ------------------------------------------------- |
| Move                 | A / D or left / right arrows                      |
| Jump                 | Space, W, or up arrow; hold for a higher jump     |
| Interact / step away | E or the interaction prompt                       |
| Journal / pause      | J / Escape                                        |
| Sound / fullscreen   | M / F, or the corresponding buttons               |
| Walk to a point      | Click the ground                                  |
| Slide the lamp       | Drag its slider, use focused arrow keys, or A / D |
| Lamp power           | L or its switch button                            |
| Access symbols       | Click the symbols or press 1 / 2 / 3              |

Touch controls provide movement, jump, and interaction. Desktop/landscape remains the primary presentation. Reduced ambient motion is available in settings. HTML dialogs support keyboard focus; the spatial game is not a complete nonvisual mode.

## The opening

Escape Tram 07, witness an independent shadow movement, operate a station shutter through its cast shadow, cross Mercer Street, follow a remembered knock, repeat an access rhythm, and examine a staff photograph.

Refinements in v0.2:

- The maintenance lamp remains usable after solving its puzzle. Adjusting it or switching it off never relocks the latched shutter. Its saved position and power survive reloads.
- The player walks to the lamp's operating position instead of teleporting there. The interaction can be cancelled.
- The access rhythm can be recalled after unlocking, with no duplicate journal rewards.
- Variable-height jumps, coyote time, buffered input, controlled acceleration/braking, and landing poses make movement more forgiving.
- The traveller has articulated arms/legs, a distinct storm coat, scarf, satchel, hair profile, boots, and torn cuff. The shadow shares its silhouette and adds gesture poses.
- Static illustrations are generated once into chunked textures; Phaser draws the scene and resolves collisions.

This is a compact first playable slice. Final art, target-device performance, and the original 10–15 minute pacing target still need human playtesting.

## Code structure

| Path                         | Responsibility                                                           |
| ---------------------------- | ------------------------------------------------------------------------ |
| `src/main.ts`                | Boot Phaser and attach the interface                                     |
| `src/scenes/OpeningScene.ts` | World assembly, colliders, camera, scene lifecycle                       |
| `src/core/OpeningModel.ts`   | Story state and interaction orchestration                                |
| `src/core/types.ts`          | Typed state, save format, and event contracts                            |
| `src/data/opening.ts`        | Shared gameplay geometry, tuning, dialogue, puzzle data                  |
| `src/entities/`              | Player and independent shadow presentation                               |
| `src/systems/`               | Movement intent, puzzles, shadow behaviour, saving, input, audio         |
| `src/art/`                   | Original texture illustration, character sheet, photograph               |
| `src/ui/`                    | Accessible HTML interface, dialogs, and organised styles                 |
| `tests/`                     | Pure TypeScript movement, puzzle, progression, and save regression tests |

Phaser Arcade Physics handles integration and collisions. The pure movement module calculates intent/jump assistance so it can be tested without importing a browser engine. The story model and puzzle rules are independent of Phaser. Physical collision acceptance is checked in the browser.

```powershell
npm run check
npm test
npm run format:check
npm run build
```

See `docs/opening-design.md` for the interaction contract, `docs/architecture.md` for migration decisions, and `docs/verification.md` for evidence and limits.
