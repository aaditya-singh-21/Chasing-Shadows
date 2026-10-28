# Opening design: The Last Stop

## Narrative contract

An abandoned city, an amnesiac protagonist, and a shadow that retains traces of their former self. The opening establishes familiarity and attachment. It does not establish guilt, explain the disappearance, or identify the person the protagonist previously wanted to save.

The accepted direction is an identity mystery: the player gradually suspects who they used to be. The working larger premise is that the shadow wants to finish an attempt to save someone. That person's relationship to the protagonist and the cost of saving them remain undecided.

## Visual direction

Side-scrolling 2D with a shallow, layered city. Muted blue-grey distance, olive stone and plaster, pale tiles, and restrained amber light. The protagonist has a coat, scarf, and torn cuff that can be recognised in the photograph. Human proportions are simplified for readable silhouettes. The shadow is larger and darker, with matching features but independent gestures.

This is original code-drawn prototype artwork. The reference to Hollow Knight informs readable silhouettes, layered depth, and exploration; its characters, world, assets, and combat system are not reproduced.

## The implemented sequence

| Space | Player action | Shadow behaviour | New information |
| --- | --- | --- | --- |
| Tram 07 | Walk, jump a suitcase, open the door | Follows movement with a small stylised delay | People appear to have left belongings behind |
| Platform | Walk beneath station lights | Remains behind and turns its head independently | It can act without the player |
| Station shutter | Slide a lamp along a bounded rail | Projection extends, then reaches for the latch's shadow | It can affect a physical latch through its shadow |
| Mercer Street | Traverse boxes and approach No. 14 | Knocks twice, waits, then knocks once; repeats | It has a personal attachment to this place |
| Maintenance entrance | Watch and repeat four gestures | Demonstrates Circle, Triangle, Line, Circle | It knows a restricted access routine |
| Maintenance room | Examine a staff photograph in two stages | Reaches toward the person beside the protagonist | The protagonist worked here; someone else matters to the shadow |

The location/objective HUD gives direction without explaining the shadow's identity. Short first-person captions describe the protagonist's observations. A journal preserves discoveries. Puzzles have no damage or time pressure.

## Mechanics

Movement uses acceleration, gravity, buffered jumping, a small coyote window, and collision against a flat floor and three authored obstacles. Closed doors/shutters block progression. Mouse walking follows a destination until obstructed or overridden by directional input.

The shadow is a separate actor with follow, linger, project, reach, knock, and code poses. Its interactions are authored; environmental lighting is not a universal physical shadow simulation.

The lamp has a constrained range. Its position controls the shadow projection. The player must align the projection within a tolerance and keep it there for 1.35 seconds. Breaking alignment drains progress. The gate animates open before it can be crossed. The puzzle is repeatable after stepping away until solved.

The access panel repeats four gestures with a pause between cycles. Wrong input clears the attempt. A text cue accompanies each gesture, and an optional full-rhythm hint remains available. The earlier knock cannot leave the demonstration offscreen when entering this puzzle.

## Scope and next decisions

The slice is a local browser implementation with no dependencies. It tests readability, movement, the relationship with the shadow, and the two interactions. It is not yet a commitment to the full game's runtime.

Evaluate with human playtests before expanding:

- Do players notice the first independent movement without being told what it means?
- Does the lamp interaction communicate a rule they can explain afterward?
- Does the knock create attachment or curiosity?
- Does the photograph make them ask who the other person is?
- Are jumping and travel helping the mood, and how long does an unaided run take?

Future work should follow those observations: refine character art/animation, tune atmosphere and sound, adjust traversal/pacing, and then decide on a longer chapter and engine. Combat, branching endings, an open city, and the disappearance's explanation remain outside this opening.
