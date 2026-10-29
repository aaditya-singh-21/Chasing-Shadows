# Story and world progression

Design record updated 2026-10-29. This document separates user-approved story/world decisions from proposed execution. It contains spoilers. These decisions have not yet been implemented as new dialogue, rooms, transitions, or checkpoint fields in the playable opening.

## Confirmed direction

- The protagonist is **Thomas**. He begins without access to his personal memories, and his independently acting shadow recognizes parts of his former life.
- Thomas is in his late twenties, expresses care through practical actions, and struggles to communicate emotionally. His family consists of his parents and his younger brother **Daniel**, around 19. Daniel is becoming independent while Thomas still instinctively looks after him, creating affection and occasional friction. The parents' names/ages and further family history remain undecided.
- The woman in the staff photograph is **Grace**, his fiancée. She replaces the previously suggested character Mara and the colleague/friend-only relationship. Shared work history is compatible with the existing photograph; its details are not settled.
- The catastrophe killed the other citizens, including Thomas's family. Their absence is not explained by a successful evacuation. Thomas gradually discovers that they are dead.
- Grace is the intended living exception alongside Thomas. This is author knowledge: neither Thomas nor the shadow knows her present fate. Later discoveries can establish her survival. Her location does not need to be announced or fixed as the player's initial destination.
- The setting is the physical city altered by a supernatural catastrophe. **Thomas and Grace survived by luck.** Their survival does not require connected rescue actions, special protection, a bargain, or a shadow-based survival mechanism. They are separated, and the player follows local leads rather than knowing Grace's location.
- The shadow is part of Thomas's conscience formed from his old memories. It remembers what the catastrophe made inaccessible to him, carries unfinished intentions, and can learn from present events. Emotional memories can cause it to repeat an action that is no longer useful. It has no privileged knowledge of the city's casualties or Grace's current fate.
- Keep the identity mystery and the shadow's unfinished rescue intention. Its remembered attachment to Grace is not evidence that it knows she survived. The player must discover Thomas's relationship to her rather than receive all this information at the start.
- Navigation follows local leads through branching, explorable routes. The user cited Limbo as inspiration for proceeding without knowing the ultimate destination. Preserve that uncertainty while making nearby affordances and reasons to explore readable.
- **Chapter One ends when Thomas finds proof that his younger brother died**, establishing that people died rather than merely vanished. The brother's body may appear in this scene. The chapter does not end with a live signal, proof Grace is alive, or someone explicitly trying to contact Thomas. His parents' deaths are discovered individually later; do not disclose the entire family loss at once.
- Thomas recovers part of his identity before finding his brother. Establish his name and his relationship to his younger brother through earlier encounters, with room for additional fragments of his work/family life. The body discovery confirms a loss he can already understand; it does not instantly restore his identity or all his memories.
- The suitcase receives a small reddish/blood-like mark that Thomas notices automatically during ordinary passage. This is a natural story beat without an inspection prompt or optional-interaction dependency. Its abandonment amid the catastrophe needs no separate explanation. Exact visual execution and its proposed personal connection to the brother still need implementation/design.
- The game has a survival/pursuit direction. Death restarts the player from the last checkpoint. Gameplay and story take priority over difficulty; the pursuing threat, encounter rules, and exact checkpoint placement are not yet decided.
- Expand selected buildings into enterable, traversable interiors while retaining side-scrolling 2D movement. Doors should lead to meaningful spaces and routes, not just animate while the player walks past their facades.

## Working world model and unresolved rules

The city is a physical place altered by the catastrophe, with supernatural rules. An afterimage may describe its altered condition; a separate parallel world or a purely memory-sustained world has not been chosen. The previous account in which residents escaped into another real city is superseded by their deaths.

Before writing the late-game reveal, settle:

- What caused the catastrophe, and what physical/supernatural changes did it leave behind?
- How did the catastrophe divide Thomas's personal memories from his conscious access to them? What are the limits of the shadow's perception and learning?
- How do bodies, elapsed time, and the altered city account for the apparent emptiness? A possible visible body at Chapter One's end must fit those rules.
- What prevents Thomas and Grace from meeting immediately, and how will later evidence of her survival work without announcing her location up front?
- What does escape require, and what does it cost?

Do not introduce a new supernatural rule at the climax simply to force a sacrifice. The earlier memory-sacrifice ending, four-chapter structure, colleague falling-out, and exact disaster mechanism are proposals, not approved canon.

Keep the premise simple. Their lucky survival is a settled answer, not another mystery requiring an elaborate explanation. The proposed continuing catastrophe that hunts survivors and a pursuer targeting a special survival mechanism were not adopted. Detailed catastrophe lore is not a prerequisite for outlining Chapter One's traversal, story beats, and pursuit encounters.

## Chapter One: approved discovery arc

The chapter's broad progression and ending are approved. Exact locations, scene order within the middle, puzzles, and duration still need design. The current playable slice ends at the staff photograph; the full chapter extends beyond it.

Approved scope for the first complete chapter:

- Retain and expand the existing tram, station, and street opening.
- Add two enterable buildings, a connecting passage, and one optional exploration branch.
- Establish identity and family details before the final discovery.
- Include two short pursuit encounters with nearby checkpoints; the pursuer itself remains undecided.
- End with Daniel's confirmed death.
- Tune duration through playtesting rather than committing to an unmeasured runtime.

| Phase                      | Thomas's understanding                                                             | Design purpose                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Wake and navigate          | He does not remember arriving and needs to understand his surroundings             | Existing tram and station teach movement and observation                                            |
| Recognize the gap          | Familiar objects and places fail to produce complete memories                      | Let Thomas discover his memory loss through specific encounters                                     |
| Recognize the shadow       | It performs familiar routines and remembers things he cannot                       | Establish the connection to his old memories without an explanatory lecture                         |
| Recover identity fragments | He learns his name and recognizes that he has a younger brother                    | Build personal knowledge and attachment before the death reveal; leave substantial memories missing |
| Explore the absence        | He follows local evidence into selected interiors and finds no living person       | Offer meaningful branches, reconnecting paths, and personal clues; no live-response payoff          |
| Find his brother           | A recognizable discovery provides unequivocal proof of his younger brother's death | End the chapter on a personal loss and the knowledge that the absence includes death                |

Reveal deaths through recognizable lives, not just a rising casualty count. Establish the brother relationship and ordinary personal details before the ending. Do not delay Thomas's first understanding of who he is until he sees the body. Discover the parents' deaths separately in later progression; their order is not decided. Preserve Daniel's established name and approximate age; the parents' names/ages, precise causes of death, and further history remain open.

Essential proof belongs on a required route; optional exploration adds texture rather than holding the only explanation. If the brother's body is shown, recognizable identity and clear context must establish the death without depending on an optional note. This proves a personal death; it does not give Thomas immediate omniscient knowledge of every citizen's fate.

## Suitcase story beat and proposed personal significance

Implementation today: the tram suitcase is a jump obstacle and an environmental indication that someone left belongings behind. Thomas comments on the bag, but there is no established owner, inspection puzzle, inventory item, or later payoff in code.

Confirmed refinement direction: add a small reddish/blood-like mark and let Thomas notice it automatically as he approaches or passes the suitcase. Integrate a brief look, reaction, or observation into ordinary play. Do not add an inspection button, make the story depend on opting into an interaction, or turn this into an inventory puzzle. The mark foreshadows injury/death; its presence alone does not establish whose blood it is or prove the brother's death.

The proposed connection to the younger brother can use a repair Thomas made to the handle, a remembered gesture, or another recognizable detail. Its exact form is still a proposal. If used, let its personal meaning become clear as Thomas recovers identity fragments before the ending. The catastrophe accounts for the abandoned luggage: do not require a separate explanation of how it was left on Tram 07 or a detailed luggage timeline.

Keep the movement tutorial functional. Automatic presentation removes the need for optional-inspection contingencies in this beat. Do not imply that the reddish mark, automatic reaction, brother discovery, or related save flags have already been implemented.

## Survival, pursuit, and checkpoint recovery

The approved direction includes survival and pursuit, with death returning the player to the last checkpoint. Prioritize the experience of exploration, tension, movement, and story over high difficulty or repeated punishment. The current opening does not yet implement this death/restart or pursuit system.

Proposed encounter principles: introduce a threat with enough information to react, use readable escape routes, restart quickly, and place checkpoints to avoid replaying lengthy traversal or emotional scenes. Alternate tense encounters with spaces where Thomas can explore and process discoveries. Automatic story beats should not repeatedly interrupt retries; specify their checkpoint/replay behavior during implementation.

The nature of the pursuer, whether there are multiple threat types, how the shadow helps during pursuit, and the first encounter's placement remain open. Do not assume a particular monster, combat system, chase timer, or supernatural explanation for player respawns without a design decision.

Pursuit and survival are the gameplay motive. The previously described shadow-like presence is an unapproved enemy proposal. A threat can be designed around understandable danger and escape behavior without making it responsible for Thomas and Grace's survival or the whole catastrophe.

## Grace's presence and agency

Grace's survival is not Chapter One's payoff. Early details can connect Thomas to her without confirming present activity. Later evidence can become harder to explain as an old memory, but its timing and mechanism remain undecided.

The opening's two-knocks/pause/one-knock rhythm can remain a remembered habit. Do not add a live answer or an explicit attempt to contact Thomas to Chapter One. Any later responsive exchange would be a separate proposal requiring established world rules.

Every major clue should change the player's available action or destination: identify a building, explain a route, open a passage, or reinterpret an earlier location. Avoid a chain of collectible notes that all merely say she might be alive.

Grace should have made decisions and affected the environment during Thomas's absence. Her route, repairs, and attempts at communication should explain how Thomas can progress. She is a participant with her own objective, not only the reward at the end of his grief.

The family losses remain real even if Grace is found. Her survival does not undo the catastrophe. Let hope and grief coexist without requiring every location to add another death reveal.

## Enterable buildings and exploration

The user-approved direction is a network of selected exterior and interior spaces. The particular topology below is a proposal.

Keep ordinary movement side-on. Near a usable facade door, the player deliberately interacts to enter a separate side-scrolling room. Show a short transition and spawn beside the corresponding interior doorway. Exit through a clear doorway to return to the matching street entrance. Stairs, ladders, or authored connectors can link floors while preserving 2D movement.

| Example location     | Reason to enter                                                     | Possible connection                                            |
| -------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Station shelter      | Restore emergency lighting and investigate abandoned belongings     | Rear service corridor reaches the far side of a blocked street |
| No. 14               | Investigate the shadow's remembered knock and a personal connection | Upper floor or courtyard offers a return route                 |
| Maintenance building | Use known access routines and trace the lighting network            | Unlock a permanent shortcut back to the station                |

Names and contents beyond the implemented opening are illustrative. Do not assume No. 14 is already confirmed as Thomas's home, or that a shelter already exists as a playable room.

Keep the lamp-controlled station shutter a meaningful physical passage. A facade entrance and a barrier across a route serve different purposes; not every existing opening needs to become a room transition.

Start with one exterior, a small useful interior, and an alternate exit that reconnects to a recognizable landmark. Prove that loop before expanding to many buildings. A building should offer a route, interaction, meaningful story scene, or discovery that earns the transition; avoid many empty rooms or repeated locked-door dead ends.

Essential progression should be legible without a quest arrow pointing at every step. Use signage, distinct landmarks, sightlines, light, shadow interest, and specific journal observations. Make usable doors recognizable without relying only on color. Consider a simple discovered-room map once the number of connections warrants it; a map is not implemented yet.

## Implementation considerations for future room work

These are planning requirements, not claims of existing functionality. Current architecture is described in `architecture.md`.

- Define stable room IDs, door IDs, destination doors, entry positions, and progression conditions in data. Do not derive connectivity from decorative artwork coordinates.
- Use reusable room/transition handling rather than duplicating the full opening scene for every small room. Choose scene lifecycle and loading strategy when implementing the first connected interior.
- Keep discoveries, solved puzzles, and world flags outside any single room's display lifecycle. Returning to a room must not reset solved mechanisms or award duplicate notes.
- A checkpoint must eventually identify a location as well as a safe local position. Existing v1 saves contain an opening-world x coordinate; design an explicit compatible migration/default room before adding room saves.
- A transition must clear held input, prevent repeated doorway activation, restore controls/focus, and place Thomas and the shadow safely. Do not immediately trigger the reverse doorway on arrival.
- Validate enter/exit, both sides of a shortcut, return visits, pause, save/reload in each room, legacy checkpoints, and relevant touch/keyboard behavior on an isolated test origin.
- Keep rooms lightweight and release resources appropriately. More rooms should not require keeping the entire city's textures and physics active.

## Next design work

Outline the approved chapter scope's exact routes, including identity fragments before Daniel's discovery and the automatic suitcase observation. Develop the brothers' shared history before writing that reveal. Define the pursuit threat, escape affordances, and checkpoint recovery for the two short encounters. Keep the physical setting and body discovery coherent without inventing a special survival explanation. Leave the parents' later reveal order, Grace's later survival clues, and the final ending open until their progression is designed. No new gameplay is implemented by this record.
