# Agent guide: Chasing Shadows

This file applies to the whole repository. It is a portable handoff for coding assistants; no previous chat, personal memory folder, or particular AI service is required. Follow the user's current request and keep this guide aligned with the code when decisions change.

## Start here

1. Read this guide and `README.md` for setup and controls.
2. Read `CHANGELOG.md`, including Unreleased, to understand recent changes.
3. Read `docs/opening-design.md` before changing narrative, puzzles, or progression; read `docs/architecture.md` before changing ownership or rendering.
4. Read `docs/verification.md` for previous evidence and outstanding acceptance limits. Historical checks are not proof that your new changes pass.
5. Inspect the working tree and relevant source before editing. Preserve existing uncommitted work; do not assume a clean checkout or a running preview.

## Game direction and accepted decisions

**Chasing Shadows** is a browser-first, single-player, side-scrolling 2D mystery. The player wakes in an abandoned city where everyone has disappeared. Their shadow moves independently and remembers things they do not. The central mystery concerns identity: the player gradually suspects who they used to be.

- The working larger premise is that the shadow wants to finish an attempt to save someone. That person's relationship to the protagonist, the cost of saving them, and the disappearance's explanation remain undecided. Do not present guesses as established canon.
- The opening establishes familiarity and attachment, not confirmed guilt or the complete identity reveal.
- The user chose TypeScript + Phaser for a lightweight browser game. Continue with that stack unless the user changes direction. A desktop download, Godot port, backend, multiplayer, and cloud saves are outside the current scope.
- Hollow Knight inspired the choice of 2D exploration, readable silhouettes, and layered depth. This does not commit the project to its combat or reproduce its characters, art, or world.
- Favor atmosphere, readable shadow behavior, responsive movement, and reusable interactions. Muted blue-grey distance, olive architecture, and restrained amber lighting establish the current palette.
- Current artwork is original procedural prototype illustration. Preserve recognizable character details, especially the scarf and torn cuff used by the photograph clue. Visual quality and browser weight both matter.

## Implemented opening

The current version is **0.2.0** (implementation milestone dated 2026-10-29; not a claim of public deployment). Check `package.json` and the changelog for later versions.

The continuous opening, **The Last Stop**, runs through:

1. Wake inside Tram 07, learn movement/jumping, and open the tram door.
2. Witness the shadow linger and turn independently on the platform.
3. Move a maintenance lamp so the shadow reaches the shutter latch.
4. Cross Mercer Street and witness a remembered knock at No. 14.
5. Watch and repeat the maintenance access rhythm: Circle, Triangle, Line, Circle (keys 1, 3, 2, 1).
6. Examine a staff photograph in two stages; the shadow reaches toward someone beside the protagonist.

A discovery journal, pause/settings, local checkpoints, Continue/replay, synthesized audio, keyboard controls, click-to-walk, and touch controls are implemented. Desktop/landscape is the primary presentation.

Preserve these interaction rules unless the requested design changes them:

- The lamp remains usable after solving. Its position and power persist independently of the shutter's permanent solved flag.
- Powered alignment must be sustained for 1.35 seconds; interruption or powering off drains unsolved progress. Once solved, moving or powering off the lamp never relocks the shutter or duplicates discoveries.
- The player walks to the lamp's operating marker rather than teleporting. The approach can be cancelled.
- The access rhythm can be revisited after unlocking; wrong input resets the attempt, and repeated success does not duplicate journal rewards.
- The shadow is a separately authored actor, not a universal physical shadow simulation. Lighting projection and supernatural gestures are deliberate gameplay rules.
- Pause freezes progression and motion correctly. Reduced ambient motion keeps essential walking and interaction animations readable.

## Architecture and file ownership

| Location                                      | Responsibility                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `src/main.ts`                                 | Boot Phaser, model, scene, and HTML interface                            |
| `src/scenes/OpeningScene.ts`                  | Phaser scene lifecycle, world assembly, collision zones, camera, effects |
| `src/core/OpeningModel.ts`                    | Engine-independent story state, discoveries, interactions, checkpoints   |
| `src/core/types.ts`                           | Typed state, events, save contracts                                      |
| `src/data/opening.ts`                         | Shared gameplay geometry, tuning, puzzle data, dialogue, discoveries     |
| `src/entities/Player.ts`, `Shadow.ts`         | Phaser sprite presentation and player body integration                   |
| `src/systems/Movement.ts`                     | Pure movement intent, jump assistance, acceleration/braking              |
| `src/systems/Puzzles.ts`, `ShadowBehavior.ts` | Puzzle rules and authored shadow behavior                                |
| `src/systems/SaveStore.ts`                    | Checkpoint validation and storage fallback                               |
| `src/systems/GameInput.ts`, `Soundscape.ts`   | Game input and local Web Audio synthesis                                 |
| `src/art/`                                    | Startup texture generation, character sheet, environment, photograph     |
| `src/ui/` and `index.html`                    | HTML controls, menus/dialogs, focus, announcements, styles               |
| `tests/`                                      | Pure TypeScript gameplay, movement, and save regression tests            |

Keep story/puzzle rules independent of Phaser and the DOM. Keep physical integration and rendering in Phaser; do not add a second game loop. Arcade Physics uses a fixed 120 Hz step. Gameplay geometry belongs in shared level data, not duplicated decorative coordinates.

Environment illustrations are painted once into seven reusable world chunks; the traveller uses a generated 24-frame sprite sheet. Do not return to repainting the full environment with Canvas every frame. Chunking limits individual texture dimensions, not total GPU memory.

The existing canvas uses explicit `Phaser.WEBGL`; an earlier AUTO renderer configuration failed. Use APIs for the installed Phaser version: for example, the shadow uses `Phaser.TintModes.FILL`. Check dependency typings when adapting examples from other versions. Phaser audio is disabled because `Soundscape` owns audio.

The opening is intentionally one connected scene. Future chapters can get separate scenes and level data. The HTML interface does not currently need a React framework.

## Development and validation

The original environment is Windows/PowerShell. Keep commands and paths portable where practical. Node.js **22.19+** is required for development and direct TypeScript tests. Exact dependency versions are in `package.json` and `package-lock.json`; the migration used Phaser 4.2.1, TypeScript 7.0.2, and Vite 8.3.5. Prefer the lockfile over assumptions about current releases.

```sh
npm ci
npm start
```

The default local URL is `http://127.0.0.1:4173`. Check for an existing server before starting another; strict-port mode will fail if it is occupied. Stop your own dev server before reinstalling dependencies on Windows to avoid file locks.

For gameplay changes, run:

```sh
npm run check
npm test
npm run format:check
npm run build
```

- `check` performs strict TypeScript checking, including unchecked-index and unused-code checks. Preserve these settings; prefer typed contracts over `any` or suppression.
- Tests use Node's type stripping and import pure modules without the Phaser browser runtime. Add focused regression coverage for changed gameplay/state rules; do not mistake unit tests for physics or visual acceptance.
- `build` also type-checks and enforces a **500 KiB gzip runtime-JavaScript budget**. Source maps are excluded. The migration measured about 368 KiB gzip as a build estimate, not a load-time or FPS benchmark.
- For documentation-only changes, formatting and diff checks are sufficient; report the checks actually run.
- Run `npm run preview` after building to inspect the static production output. Vite's relative asset base supports subdirectory hosting. Do not edit generated `dist/` files.

For browser checks, use a separate origin such as `npm run dev -- --port 4174` or `npm run preview -- --port 4174`. Begin/replay replaces that origin's checkpoint. **Do not overwrite the user's port-4173 save during testing.** Do not assume an origin's save follows a change of host, browser profile, or port.

After gameplay changes, check the affected interactions through actual browser input, plus pause/resume and save/reload where relevant. For layout changes, include narrow portrait and short landscape views. Record viewport, browser, observed result, and any checks you could not perform.

## Save compatibility and offline behavior

- `chasing-shadows:opening:v1` is the existing checkpoint key; `chasing-shadows:settings:v1` stores settings. App version 0.2.0 still uses save schema version 1. Do not rename keys or bump schemas casually.
- Validate stored JSON as unknown input, normalize progression and spawn positions, and preserve the blocked-storage in-memory fallback. Legacy checkpoints without `lampOn` default to power on.
- No runtime game asset, audio sample, font, or analytics dependency is fetched from a CDN. Preserve local asset/audio operation unless a requested feature changes this deliberately.
- Local play works offline after dependencies are installed. Hosted offline reopening is **not guaranteed**: there is no service worker. Static hosting needs HTTP compression for gzip estimates to reflect actual transfer sizes.
- No hosting account or deployment is configured by these instructions. Building a static site does not mean it has been published.

## Verification status and remaining decisions

The migration's recorded evidence includes 17 passing regression tests, strict types, formatting, production build/bundle checks, and a full in-app Chromium playthrough. That playthrough covered reusable lamp controls, wrong/correct access inputs, checkpoint reload, journal, photo ending, pause/settings, and layouts at 390 × 844 and 854 × 390.

Read `docs/verification.md` for details and dates. Do not claim fresh validation from that historical record. Physical-phone touch behavior, Safari/Firefox acceptance, assistive-technology auditing, low-end device performance/GPU memory, final art, independent human acceptance, and the original 10–15 minute pacing target remain unverified.

There is no committed next chapter or combat system. Useful next decisions should follow human playtests: whether players notice the shadow's independent movement, understand the lamp rule, feel curiosity about the knock/photo, and enjoy traversal. The larger identity reveal and missing person's relationship remain open design questions.

## Working conventions and handoff upkeep

- Give a brief explanation before substantial edits; carry the user's requested work through implementation and appropriate validation. Resolve routine implementation choices within the accepted scope.
- Preserve existing work and keep changes focused. Do not reset unrelated changes or silently expand the game into a different engine or genre.
- Update **Unreleased** in `CHANGELOG.md` alongside every notable change. Describe the player-visible effect, compatibility impact, and tooling changes where relevant. Do not bump the version just to record routine work.
- Update `README.md` for setup/controls, `docs/opening-design.md` for narrative/interaction contracts, `docs/architecture.md` for ownership changes, and `docs/verification.md` for new evidence. Keep this guide current when project-level decisions change.
- Prefer links to the source of truth over copying large implementation details here. Keep unresolved ideas separate from implemented behavior.
- Keep `node_modules/`, `dist/`, `.vite/`, `coverage/`, and local `artifacts/` out of version control. Screenshots in ignored artifacts may not exist on another checkout; documentation must remain understandable without them.
- End work with what changed, what was checked, and any material remaining limits. Never equate a passing build with a successful playthrough or human acceptance.

If your AI service does not automatically load `AGENTS.md`, start with: **"Read AGENTS.md and the referenced project docs, inspect the working tree, then continue with my request."**
