# Chasing Shadows

A playable first opening for an atmospheric, single-player 2D mystery. You wake on an empty tram. Your shadow knows the way out—and remembers people you don't.

## Play locally

Requires a current desktop browser and Node.js 20 or newer. There are no dependencies to install.

```powershell
npm start
```

Open **http://127.0.0.1:4173** and select **Begin the journey**. Keep the terminal running while playing; Ctrl+C stops the server. If the port is already occupied, use the existing preview or set a different port:

```powershell
$env:PORT = 4174
npm start
```

The game works offline once the local server is running. Artwork is drawn with Canvas/SVG, fonts are supplied by the operating system, and audio is synthesized with Web Audio. It makes no external requests and uses no remote assets or services. Browser storage holds a single local checkpoint; clearing site data clears the checkpoint. Continue uses the last checkpoint. Begin/replay starts a new opening and replaces that checkpoint.

## Controls

| Action | Input |
| --- | --- |
| Move | A / D or left / right arrows |
| Jump | Space, W, or up arrow |
| Interact / leave a puzzle | E, or click the interaction prompt |
| Journal | J |
| Pause | Escape |
| Sound | M or the speaker button; initially muted |
| Fullscreen | F or the fullscreen button, where supported |
| Walk to a point | Click the ground |
| Slide the lamp | Drag its slider, use arrow keys while focused, or A / D |
| Access symbols | Click the symbols or press 1 / 2 / 3 |

Touch devices also have hold-to-walk, jump, and interact buttons. The desktop/landscape composition is the primary presentation. Reduced ambient motion is available in Controls & settings and respects the operating system's initial preference. HTML dialogs and controls support keyboard focus; the spatial canvas game itself is not a full nonvisual mode.

## What's playable

1. Wake inside Tram 07, jump over an abandoned suitcase, and open the door.
2. See the shadow turn independently on the platform. Read the service notice or continue toward the shutter.
3. Slide a maintenance lamp until your shadow reaches the latch's shadow. Hold alignment briefly to open the real shutter.
4. Cross Mercer Street and see the shadow perform a remembered knock.
5. Follow its four gestures at the maintenance access panel. A wrong attempt resets without punishment; a persistent sequence hint is available.
6. Enter the maintenance room, examine the staff photograph, and discover who the shadow reaches for.
7. Review discoveries in the journal, explore after the ending, or replay.

This is a compact first playable slice, not the full game or a measured 10–15 minute chapter. Final illustration/animation quality, long-term narrative, hardware minimums, and human playtest pacing remain to be established.

## Development

```powershell
npm test
npm run check
```

- `src/game.js`: engine-independent movement, collisions, story progression, puzzles, checkpoint validation.
- `src/render.js`: layered city, tram, lighting, character/shadow poses, and photograph artwork.
- `src/main.js`: input, accessible UI, dialogs, journal, storage, and the animation loop.
- `src/audio.js`: procedural ambience and interaction sounds.
- `tests/game.test.mjs`: deterministic gameplay and checkpoint tests.
- `docs/opening-design.md`: the implemented narrative and interaction contract.
- `docs/verification.md`: checks performed and their limits.

The server binds to loopback only. No build, account, or network connection is required. This prototype deliberately establishes the playable scene and shadow behaviour before choosing a desktop game-engine port.
