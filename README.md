# Chasing Shadows

A browser-first, single-player 2D mystery. You wake on an empty tram. Your shadow knows the way out—and remembers people you don't.

The playable first chapter uses **TypeScript (strict mode), Phaser 4.2.1, and Vite**. The original Canvas game has been migrated to Phaser scenes, sprites, animations, camera, input, and Arcade Physics.

AI contributors should start with [AGENTS.md](AGENTS.md) for project context, accepted design decisions, architecture, validation, and handoff instructions.

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

Dependencies are fetched during setup. Once installed, local play works without an internet connection. No game asset, font, analytics script, or audio sample is fetched from a CDN. Browser storage holds a room-aware chapter checkpoint, including discoveries and lamp settings. New saves use `chasing-shadows:chapter-one:v2`; the original opening key is retained unchanged and imported when no valid chapter checkpoint exists. Existing v1 checkpoints from the original prototype are accepted on the same browser origin.

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

## Chapter One

Escape Tram 07, operate the station shutter, explore the courtyard and maintenance workshop, recover Thomas’s name, escape an unstable service trolley, recall Daniel in the shelter hall, climb above rising water, and find Daniel in the upper rest room. The photograph is a mid-chapter discovery. Doorways use E or the interaction button; release movement after entering a room, then choose your direction. Death opens a YOU DIED screen. Choose Try again to restore the safe encounter checkpoint, or Return to title to leave.

Refinements in v0.2:

- The maintenance lamp remains usable after solving its puzzle. Adjusting it or switching it off never relocks the latched shutter. Its saved position and power survive reloads.
- The player walks to the lamp's operating position instead of teleporting there. The interaction can be cancelled.
- The access rhythm can be recalled after unlocking, with no duplicate journal rewards.
- Variable-height jumps, coyote time, buffered input, controlled acceleration/braking, and landing poses make movement more forgiving.
- The traveller has articulated arms/legs, a distinct storm coat, scarf, satchel, hair profile, boots, and torn cuff. The shadow shares its silhouette and adds gesture poses.
- Static illustrations are generated once into chunked textures; Phaser draws the scene and resolves collisions.

Chapter One is complete as a playable prototype. The user reported completing a full playthrough and finding it satisfactory on 2026-11-08. Final art, target-device performance, and the original 10–15 minute pacing target remain unverified.

## Chapter Two direction

The approved continuation follows Thomas from Daniel's loss toward his family home in a damaged residential district. It develops Grace's personality and their relationship, ending with recognition that she is his fiancée and evidence suggesting she survived the initial disaster and left the neighbourhood. Her current whereabouts and fate remain unknown to Thomas; neither parent's death is confirmed in this chapter.

Chapter Two is planned, not playable. See [docs/chapter-two-design.md](docs/chapter-two-design.md) for the approved sequence and remaining route, clue, and encounter decisions.

## Code structure

`ChapterModel` extends the original pure opening rules with room progression, memory/death sequences, and environmental hazards. `data/rooms.ts` defines entrances and destinations; `RoomView` draws reusable interior scenery. Interior illustration and Daniel’s poses remain procedural prototype art.

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

See [CHANGELOG.md](CHANGELOG.md) for version history. Update its Unreleased section alongside future changes, then move entries into a dated version section when the next version is completed.

See [docs/story-and-world.md](docs/story-and-world.md) for story decisions and planned world expansion, `docs/opening-design.md` for the implemented interaction contract, `docs/architecture.md` for migration decisions, and `docs/verification.md` for evidence and limits.

### Chapter review refinements (2026-10-30)

Walking right past the unlocked workshop stays on Mercer Street. Only E/the interaction button enters the building; the forecourt remains explorable through to the rubble barrier. The main shelter service route still goes through the workshop. An Employee of the Month portrait names Thomas in both the forecourt and workshop, with a readable close-up interaction. The automatic observation remains available without opening a dialog.

Daniel’s memory is now an 18-second sequence: recognition, handle repair, objection, bag handoff, and departure with timed captions. It pauses with gameplay and records completion once. Daniel has a brown-coat sheet and the rest-room body is purpose-painted horizontally, supported by bedding and a pillow, with a slack arm and dried blood. No new explanation for his death or Grace’s fate is added.

### Death and retry (2026-10-30)

Death freezes the failed encounter and opens an explicit YOU DIED screen with its cause, a checkpoint explanation, Try again, and Return to title. The player chooses when to retry; there is no automatic respawn timer. Escape cannot dismiss the death screen into a dead game state. Returning to title preserves the pre-encounter save; Continue starts there safely. Earlier journal discoveries remain intact.
