# Opening design: The Last Stop

## Narrative contract

An abandoned city, an amnesiac protagonist, and a shadow that retains traces of their former self. The opening establishes familiarity and attachment. It does not establish guilt, explain the disappearance, or identify the person the protagonist previously wanted to save.

The accepted direction is an identity mystery: the player gradually suspects who they used to be. The protagonist is Thomas; the woman in the photograph is Grace, his fiancée. The catastrophe killed the other citizens, including Thomas's family. Thomas and Grace survived by luck and are separated; evidence that she is alive will guide later exploration. These truths are author knowledge, not information disclosed by the current opening. The shadow's unfinished rescue intention remains the working larger premise; the final ending is undecided. Keep survival simple rather than inventing a special protection mechanism. See [story-and-world.md](story-and-world.md) for confirmed decisions and proposed progression.

The expanded Chapter One follows local leads without a known final destination and ends on proof that Thomas's younger brother died; the brother's body may be shown. It does not end on a live response or proof of Grace's survival. Thomas's parents' deaths are discovered individually later. His shadow is a part of his conscience formed from old memories, not an informed guide to the catastrophe's aftermath. The currently implemented photograph ending marks the end of the prototype slice, not the planned full chapter.

Thomas recovers part of his identity, including his name and recognition of his younger brother, before the body discovery. Finding the brother confirms his death rather than suddenly revealing Thomas's entire identity. The approved expansion also includes survival/pursuit gameplay with death returning to the last checkpoint, prioritizing story and gameplay over difficulty. Pursuers, death/restart, and their checkpoints are not implemented in the current slice.

## Visual direction

Side-scrolling 2D with a shallow, layered city. Muted blue-grey distance, olive stone and plaster, pale tiles, and restrained amber light. The protagonist has a coat, scarf, and torn cuff that can be recognised in the photograph. Human proportions are simplified for readable silhouettes. The shadow is larger and darker, with matching features but independent gestures.

This is original code-drawn prototype artwork. The reference to Hollow Knight informs readable silhouettes, layered depth, and exploration; its characters, world, assets, and combat system are not reproduced.

## The implemented sequence

| Space                | Player action                            | Shadow behaviour                                        | New information                                                 |
| -------------------- | ---------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Tram 07              | Walk, jump a suitcase, open the door     | Follows movement with a small stylised delay            | People appear to have left belongings behind                    |
| Platform             | Walk beneath station lights              | Remains behind and turns its head independently         | It can act without the player                                   |
| Station shutter      | Slide a lamp along a bounded rail        | Projection extends, then reaches for the latch's shadow | It can affect a physical latch through its shadow               |
| Mercer Street        | Traverse boxes and approach No. 14       | Knocks twice, waits, then knocks once; repeats          | It has a personal attachment to this place                      |
| Maintenance entrance | Watch and repeat four gestures           | Demonstrates Circle, Triangle, Line, Circle             | It knows a restricted access routine                            |
| Maintenance room     | Examine a staff photograph in two stages | Reaches toward the person beside the protagonist        | The protagonist worked here; someone else matters to the shadow |

The location/objective HUD gives direction without explaining the shadow's identity. Short first-person captions describe the protagonist's observations. A journal preserves discoveries. Puzzles have no damage or time pressure.

The suitcase currently teaches jumping and suggests abandoned belongings; no owner or later payoff is implemented. The planned refinement adds a small reddish/blood-like mark that Thomas notices automatically during passage, without an inspection prompt. Its abandonment needs no explanation beyond the catastrophe. A personal connection to the brother through a repair or remembered gesture remains proposed. See the story record for details and implementation boundaries.

## Mechanics

Movement uses Phaser Arcade Physics, controlled acceleration and braking, variable-height jumps, buffered jumping, a small coyote window, and collision against a flat floor and three authored obstacles. Closed doors/shutters block progression. Mouse walking follows a destination until obstructed or overridden by directional input.

The shadow is a separate actor with follow, linger, project, reach, knock, and code poses. Its interactions are authored; environmental lighting is not a universal physical shadow simulation.

The lamp has a constrained range. Its position controls the shadow projection. The player walks to its operating position and must align the projection within a tolerance for 1.35 seconds. Breaking alignment or switching the light off drains progress. The gate animates open before it can be crossed. After solving, the shutter stays latched open and the lamp remains movable and switchable. Its position and power persist through checkpoint restores.

The access panel repeats four gestures with a pause between cycles. Wrong input clears the attempt and gives visible feedback. A text cue accompanies each gesture, and an optional full-rhythm hint remains available. The earlier knock cannot leave the demonstration offscreen when entering this puzzle. The panel can be revisited after unlocking to recall the rhythm without duplicating discoveries.

## Scope and next decisions

The slice uses TypeScript, Phaser, and Vite for browser-first development. It tests readability, movement, the relationship with the shadow, and the two interactions. Static website deployment is supported by the build, while hosting and offline service-worker caching are outside this migration.

Evaluate with human playtests before expanding:

- Do players notice the first independent movement without being told what it means?
- Does the lamp interaction communicate a rule they can explain afterward?
- Does the knock create attachment or curiosity?
- Does the photograph make them ask who the other person is?
- Are jumping and travel helping the mood, and how long does an unaided run take?

The approved expansion direction includes selected enterable buildings, traversable interiors, and connecting routes while preserving side-scrolling movement. These rooms and transitions are not implemented yet. Proposed routes and their save/state requirements are described in [story-and-world.md](story-and-world.md).

Further work should also follow playtest observations: refine character art/animation, tune atmosphere and sound, measure target-device performance, and adjust traversal/pacing. Combat, branching endings, a fully open city, and the catastrophe's exact explanation remain outside this opening.
