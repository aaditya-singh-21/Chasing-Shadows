# Chapter Two: playable-sequence draft

Implementation status, 2026-11-08: the user authorized starting implementation from this sequence. The first slice implements campaign continuation/import, the six-second farewell, the shelter/lane return connection, lane prototype art and an optional domestic observation. It ends with a clearly labelled development boundary. All later beats below remain a design plan; there is no playable home, puzzle, escape, or Grace reveal yet. See [verification.md](verification.md). The v3 campaign currently retains compatible checkpoint fields and validated continuation marks; separate puzzle state will be added when those mechanics are implemented.

Drafted 2026-11-08 for review before implementation. Read [chapter-two-design.md](chapter-two-design.md) for approved narrative direction. The user selected **one short environmental escape, with more exploration** during this planning discussion. The address, layout, puzzle, clue texts, dialogue, and technical proposals below are recommendations, not newly approved canon or playable features. No subtitle or chapter runtime is selected.

## Proposed experience

Thomas leaves Daniel, tries to get home, discovers that the shadow's familiar route no longer works, and finds another way through the residential block. Inside the family home, Grace becomes someone with a voice and plans of her own. He recognizes that they were going to marry, then finds evidence suggesting that she survived the initial disaster and left. He can follow her first direction; he cannot know where she is now.

The playable rhythm is farewell → exploration → failed remembered route → light puzzle → short escape → quiet home exploration → relationship recognition → departure evidence. The home has no timed threat. Neither parent's death is disclosed, and Daniel's loss remains real.

## Geography and room graph

Recommend confirming **the existing No. 14 on Mercer Street as the family home**. Its front door is the one at approximately world x = 4320, where the shadow already knocks. The existing `courtyard` is already titled “No. 14 · courtyard”; reuse it as the rear court of the same property. Do not create a second No. 14 or move the Chapter One facade.

The residential lane runs behind the Mercer Street block. Its different side-on view represents the rear of those buildings, rather than a distant second neighbourhood. The new shelter upper exit leads onto this lane. The apartment and utility room connect to a covered gallery around damage at the back of No. 14. The existing courtyard remains reachable from Mercer Street during Chapter One, but the home's rear door is above it on a raised landing. A folded service stair can only be released from that landing. This explains the earlier lack of home access without a door that refuses to work solely because the chapter number changed.

Logical room names below are design labels, not committed code IDs. All connections use E/the interaction button. Movement across the escape trigger is the exception: it starts the hazard inside a room, not a room transition.

| Space                      | Connections and first-visit access                                                                                        | Role                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Existing shelter rest room | New upper exit ↔ residential lane, available after the farewell                                                           | Chapter handoff; keep Daniel here                               |
| Residential lane           | Shelter exit ↔ apartment entrance; visible blocked direct approach toward No. 14                                          | New exterior hub, address recognition, optional exploration     |
| Apartment stair hall       | Lane ↔ utility room via ground-floor service door                                                                         | Failed upper landing, optional domestic alcove, alternate route |
| Communal utility room      | Apartment ↔ covered gallery; gallery door latched until the light puzzle is solved                                        | Useful interior and quiet pre-encounter checkpoint              |
| Covered gallery            | Utility room ↔ No. 14 rear landing                                                                                        | The sole short escape; permanently safe after completion        |
| Existing No. 14 courtyard  | Existing Mercer Street connections stay; new stairs ↔ rear landing once lowered                                           | Familiar landmark, optional earlier discovery, return shortcut  |
| No. 14 ground floor        | Rear landing ↔ kitchen/sitting room; stairs ↔ upper room; front door ↔ existing Mercer Street facade once unbolted inside | Central discovery space and second way home                     |
| No. 14 upper room          | Ground floor ↔ shared planning/packing room                                                                               | Required relationship recognition and final departure evidence  |

Six new spaces are proposed: lane, apartment, utility room, gallery, home ground floor, home upper room. The shelter, Mercer Street, and courtyard are reused. The rear landing belongs to the gallery/courtyard connection rather than becoming a separate loading screen. The home stairs can be an authored connector between side-scrolling rooms; no free-form climbing system is required.

The required first approach is:

`Rest room → lane → apartment → utility → gallery → rear landing → home ground floor → home upper room`

Two loops become available after arrival:

- Lower the service stair: rear landing ↔ existing courtyard ↔ Mercer Street. The courtyard pump is optional texture; its Chapter One tool mark is not reassigned to Grace.
- Unbolt the front door from inside: home ground floor ↔ the original No. 14 facade. The player can revisit the unanswered knock from the other side.

The gallery floor remains usable after its overhead structure finishes falling. Returning through it never restarts the escape or requires crossing an impossible gap. Both loops are optional conveniences, not prerequisites for the final evidence. The lane's blocked approach remains a readable reason for the first detour; avoid a row of unrelated locked doors.

## Detailed playable sequence

### 1. Stay with Daniel, then leave deliberately

**Entry:** Chapter One's body discovery and completion remain unchanged. Its ending dialog gains a proposed “Continue to Chapter Two” action alongside staying, journal, replay, and title. A completed Chapter One save can use the same action after Continue; it does not need to replay the death reveal. Starting Chapter Two begins in the rest room rather than cutting directly to a new street.

**Action:** Near the cot, E offers “Cover Daniel.” Thomas draws the blanket over him in a brief, mostly silent authored action. The shadow initially reaches to help Daniel up, then lowers its hand when it sees Thomas cover him. No standing Daniel appears in the present. Allow the player to linger afterward; the scene does not push him toward hope immediately.

**New understanding:** Daniel is still dead. The shadow can change its response to what happens now. It does not reveal another casualty or direct Thomas to Grace.

**Lead:** At the upper exit Thomas notices the rear of the Mercer Street block and the familiar No. 14 roofline: “That door on Mercer. Home. They might have gone home.” This is partial place recognition, not recovered knowledge of his parents' fate. A journal entry records the concrete address and why he wants to check it.

**Recovery:** Save before the action and immediately after it finishes. Reload midway returns to the uncovered cot and offers the action again; reload afterward preserves the blanket and changed shadow response. The upper exit becomes usable after completion. No timed farewell, long forced wait, or repeat grief scene on hazard retry.

### 2. Read the lane and choose what to investigate

**Action:** Walk along the residential lane. Show No. 14's roof and raised rear landing beyond damage, an apartment service sign pointing around the block, and an unmistakable broken direct approach. The player can investigate the obstruction, then enter the apartment deliberately. The objective is “Find another way to No. 14,” without a floating quest arrow.

**Optional branch:** A shallow bicycle/store alcove within the lane offers a small example of Thomas's practical care: an old maintenance tag in his handwriting beside a repaired carrier. It adds character without identifying another survivor or holding a necessary tool. No inventory pickup is required. The branch loops back to the same apartment sightline.

**Shadow:** Pauses at the apartment entrance and looks toward the upper landing. It recognizes a habit, not the current safest route.

**Recovery:** Safe spawn outside the shelter and at the apartment threshold. The lane stays quiet and freely explorable. A blocked-route observation is recorded once; returning does not repeatedly interrupt movement.

### 3. Let remembered knowledge fail visibly

**Action:** Enter the apartment stair hall and follow broad steps to a landing. From solid footing, both player and shadow see that the old connecting walkway has broken away. The shadow performs the beginning of its old door-opening/turning gesture at the missing connection, then stops. It does not walk on an invisible platform or demand that Thomas make a lethal leap.

**Response:** Thomas: “That used to lead across. It doesn't now.” Let the player turn back immediately. A visible service conduit and a ground-floor sign lead to the utility door below. The alternate route can also be noticed and taken before watching the full gesture; progression does not require pretending to be fooled.

**Optional exploration:** An open apartment alcove contains ordinary domestic interruption, such as a half-repaired chair and an unfinished meal setting. It adds absence, without proving a resident's current fate or repeating the chapter's essential information as a note.

**New understanding:** The shadow remembers an earlier city and must observe the present. Once Thomas takes the utility route, it abandons the old gesture and follows. It does not magically know the repair or alternative exit in advance.

**Recovery:** No lethal gap is reachable from the observation marker. Record the failed-route beat once; save at the utility entrance. Skipping the optional alcove or landing observation cannot block home access or the ending.

### 4. Solve a light problem in a changed arrangement

**Action:** The gallery door has an interior latch Thomas cannot reach directly. A service lamp slides along a short rail. Its projection reaches the latch's shadow, using the established authored light rule. A hanging opaque maintenance screen initially blocks the useful projection.

The player can try the lamp first and see the shadow cut off on the screen. Thomas can step away, use a nearby pull handle to retract the screen, then return to the lamp and align the reach. Show the latch and interrupted silhouette together in the puzzle framing. Feedback must distinguish “blocked by screen” from “not aligned” in text and silhouette, not color alone. The screen handle and lamp remain separately reachable in either order.

**Rules:** Reuse the walking approach, cancel/step-away behavior, lamp power control, sustained 1.35-second alignment, and permanent latch opening. Turning off or moving the lamp afterward never relocks the door. Screen position, lamp position/power, and latch state persist independently. This is an authored obstruction test, not a new general lighting or shadow-physics simulation.

**Payoff:** The player finds a present-day solution while the shadow supplies a familiar capability. No code sequence, key hunt, item combination, or new shadow power is added.

**Recovery:** The room is safe. Save the completed puzzle and establish the encounter checkpoint on solid floor near the gallery entrance, before its trigger. Retry must never require re-solving the lamp.

### 5. Cross the covered gallery: the only escape

**Threat:** The gallery's damaged overhead canopy begins failing behind Thomas. A moving front of falling masonry follows him toward a clearly visible solid-walled rear alcove. No creature, trolley, rising water, or survival-mechanism lore is introduced.

**Player action:** Crossing a marked section starts the warning. Run toward the alcove and jump two low, broad obstructions. Use familiar horizontal movement and forgiving jumps; no ladder, precise hanging, puzzle input, or door interaction during danger. Reaching the alcove's safe floor completes the encounter before the player chooses a doorway.

**First greybox targets:** Approximately 1,300 world units from trigger to safety, a 3-second audiovisual/text warning, and a falling front slower than Thomas's 245-unit/s full running speed, initially around 170 units/s. Place the two obstructions at most about 60 units high, with generous landing space. These are tuning proposals, not measured escape duration or final acceptance values. Test acceleration, a delayed reaction, one untidy landing, and short jumps rather than balancing against a perfect sprint.

**Readability:** Show cracks, falling dust, a clear forward sightline, and the safe alcove before lethal debris advances. Caption: “The roof is coming down. The stone doorway!” Essential threat motion and the front boundary remain visible under reduced ambient motion and portrait framing. Do not require sound to react.

**Failure:** Contact with the visible falling front opens the existing persistent YOU DIED flow, with “The gallery roof collapsed on you.” Gameplay remains frozen. Try again restores the quiet entrance checkpoint, with the utility puzzle solved and earlier discoveries intact. Return to title preserves that checkpoint; Escape cannot dismiss death. Pause, focus loss, journal, and dialogs freeze the hazard clock and physics.

**Retreat:** The utility doorway remains usable while Thomas can physically reach it. Leaving that way cancels the unfinished attempt and restores its safe pre-encounter state; re-entry offers a fresh warning. Do not create a magically locked exit, carry an active collapse into another room, or mark retreat as success. After debris cuts off the doorway, the visible falling front makes the forward alcove the available escape.

**Success:** The collapse exhausts its unstable canopy; the intact floor gains settled, traversable debris. Save only on the alcove's stable floor after the threat stops. Re-entry uses this settled state and cannot trigger another chase. This needs visible aftermath so safety does not look like a silently disabled timer.

### 6. Reach the familiar courtyard from above

**Action:** From the alcove, reach No. 14's rear landing and lower the folded service stair. Looking down reveals the same courtyard and pump the player may have visited in Chapter One. If they never explored it, nothing essential is missing. The stair creates a permanent, safe loop to Mercer Street.

**Required trace:** At the rear stair catch, ordinary passage frames an improvised bracket fitted across a broken mounting. Thomas notices it automatically: “The catch broke with the wall. Someone braced it afterward.” An E close-up can repeat the observation, but skipping it cannot lose the journal fact. Show the fracture, the bracket crossing it, and the improvised packing made to fit the broken edge. Decoration alone must not carry the chronology.

**What it means now:** Someone used this route after that damage. A strip of patterned cloth suggests a personal connection, but neither Thomas nor the journal credits Grace yet. There is no claim about how recently the repair happened or whether its maker is alive now. The old courtyard pump/tool mark remains a separate observation with no new attribution.

**Actionable value:** The braced catch makes the service stairs usable. The clue is part of the route Thomas actually takes, rather than a collectible solely announcing possible survival.

**Recovery:** Save on the landing after success and after lowering the stairs. Stairs remain lowered, the encounter remains complete, and the trace is not awarded twice. No home scene has to be replayed after a later reload.

### 7. Enter the family home and let it become a place

**Action:** Enter No. 14 through the rear door. Thomas recognizes the entry rail and the kitchen layout in fragments. The player can explore the kitchen and sitting area, inspect domestic objects, unbolt the front door, or take the stairs. The home is quiet and safe; no clock or threat pushes the player through its discoveries.

**Parents:** Two familiar places at the table and mundane household details establish that this was his family home. Thomas can say, “Mum and Dad. Have they been back?” Empty rooms are not proof of their deaths. Avoid blood, farewell letters, casualty records, named parent histories, or a second body reveal.

**Front-door payoff:** Opening it reveals the original Mercer Street frontage. The shadow begins the old two-knock/pause/one-knock habit from inside, recognizes Thomas has already opened it, and stops. No answer is heard. The interaction reinterprets Chapter One without changing what happened there.

**Optional detail:** A repeatedly repaired chair or pencilled height marks adds domestic life. Essential Grace evidence is not hidden among these objects. Give optional details short captions and space between them instead of modal documents at every step.

### 8. Meet Grace through an ordinary disagreement

**Required trigger:** On the route to the upstairs connector, a table holds a small planning box beside a chair with the same patterned cloth as the stair repair. E offers “Look at the table.” It begins a brief domestic memory; the upper-room recognition interaction waits for this scene to finish. The player may explore elsewhere first. Reuse a compact side-on staging rather than a new cinematic system.

**Proposed memory, about 20 seconds of staged action:**

1. Thomas is adjusting the chair's loose fitting. Grace opens the planning box and places a walking-route sketch on the table.
2. Grace: “You've fixed that chair three times. Sit down before it becomes a career.”
3. Thomas: “It still wobbles.”
4. Grace folds a piece of the patterned cloth under the short leg: “There. Now it doesn't. Come and look.”
5. She indicates a walk beside the canal: “The long way. I like the water. You can survive ten minutes without repairing something.”
6. Thomas sets down the tool and sits beside her. Grace moves the sketch where they can both see it.

This shows her humour, preferences, and initiative, and Thomas's way of expressing care. She is arranging something she wants, not only helping him or discussing his problems. Her ordinary wish to walk beside water does not foretell the catastrophe or grant special survival knowledge.

**New understanding:** Thomas recognizes her face as the woman in the staff photograph and recovers her name: “Grace. That's her name.” If the optional Chapter One photo was skipped, the scene still names and establishes her directly. He remembers this small shared moment, not his entire history or her present fate.

**Recovery and access:** Memory timing, poses, and captions pause together. Save its completion once. Reload midway restarts this short scene from its safe pre-memory state; reload afterward keeps it complete. Required dialogue must remain readable and reviewable through a journal memory transcript; final caption duration needs human review. Revisit can offer replay without duplicating progress. A future skip control, if included, must retain the same discovery and readable transcript.

### 9. Recognize the engagement before reading the departure

**Action:** Upstairs, the same planning box's papers are spread beside an open packing space. A required close-up shows a pre-disaster wedding invitation proof naming **Thomas and Grace**. It is separate from the later departure note. Thomas: “We were going to be married. Grace… my fiancée.” The shadow sits or reaches toward the empty second place, recalling attachment rather than pointing to someone it knows is alive.

**Meaning:** The invitation establishes the relationship explicitly; cloth and a romantic gesture alone would not. Use no newly fixed wedding date, surname, workplace role for Grace, or claim that this room was their permanent shared residence. They were preparing here in the family home; the rest of their domestic history remains open.

**Recovery:** Save the relationship discovery immediately on a safe floor. Close-up can be reopened. A player who reads this before examining optional household details still understands it. The departure note becomes the next clearly framed interaction; the ending never relies on discovering the two documents in an arbitrary order.

### 10. Connect the repair to Grace, then leave with a lead

**Action:** Beside the invitation is a small folded household note, written for whoever returned to the house, with a practical route sketch rather than a message mysteriously aimed at an amnesiac Thomas. Proposed text:

> The courtyard wall has split. I braced the stair catch. Trying the canal footpath for a way across. — Grace

The sketch points from No. 14 through the lane to a signed canal-footpath entrance. It records an intended first direction, not a destination where she promises to wait. The note is not a live communication or an invitation to an operating refuge.

**Evidence chain:** The player has seen the broken masonry and a repair made to fit it; the note specifically describes that damaged approach and the stair-catch repair; the cloth matches a domestic object associated with Grace in the memory; the written name connects the account to the woman Thomas now recognizes. The note supplies attribution, and the physical state supplies independent corroboration. Repair style, handwriting intuition, an undated signature, or a conveniently stopped clock alone are insufficient.

**Limits of the conclusion:** The evidence suggests Grace acted after the damage Thomas associates with the disaster and then left the neighbourhood. It does not give an exact time, prove that all damage occurred in one event, or establish her current survival. Proposed response: “She may have made it out of here. The canal path. I can try that.” Do not change it to “She is alive” in captions, journal, objective, or ending UI.

**Actionable lead and ending:** The sketch identifies a previously visible, easy-to-miss lane turn as the canal-footpath approach. The player can stay in the home, revisit the courtyard, and deliberately return through the safe gallery to the lane. At the signed footpath entrance, E offers “Follow the canal path.” Choosing it completes Chapter Two and opens its ending dialog at a safe checkpoint. The route beyond is not playable in this chapter. Do not require a long return through the station or another hazard.

**Proposed journal conclusion:** “Grace and I were going to marry. A note signed by her describes the damaged courtyard catch and its repair. It suggests she left after the disaster, heading toward the canal path. I don't know what happened to her afterward.” Daniel's entry remains intact; neither parent's status changes.

If the player finds the lane turn before reading the note, it can be inspected as a route beyond this neighbourhood; the chapter-ending action is offered only after its meaning is established. Avoid an invisible wall presented as a physical obstacle that disappears when a document is read. The end interaction is a deliberate decision to pursue this lead, not the only physically possible direction Thomas could ever walk.

## Progression, persistence, and replay contract

These are proposed logical milestones, not additions already made to `ChapterModel`:

| Milestone                                   | Required condition                                  | Persisted effect                                                         |
| ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Farewell complete                           | Chapter One complete; cover action finishes         | Blanket and learned shadow response; upper exit available                |
| Home identified                             | Recognize existing No. 14 from shelter exit/lane    | Address and reason to search in journal                                  |
| Old route observed                          | Optional landing approach                           | Failed-route gesture stops repeating; not a progression gate             |
| Gallery latch open                          | Screen retracted and powered reach sustained        | Door stays open; lamp and screen remain independently adjustable         |
| Gallery escaped                             | Reach stable alcove                                 | Permanent safe aftermath; hazard cannot restart                          |
| Stair trace observed                        | First passage at braced catch                       | Neutral post-damage observation; no Grace attribution yet                |
| Service stair lowered / front door unbolted | Separate deliberate interactions from inside/above  | Persistent optional shortcuts                                            |
| Grace memory complete                       | Table interaction finishes                          | Name, ordinary shared memory, transcript; recognition close-up available |
| Engagement recognized                       | Invitation examined after memory                    | Explicit fiancée relationship; departure close-up available              |
| Departure understood                        | Note examined after recognition and stair trace     | Cautious survival inference, route sketch and next objective             |
| Chapter Two complete                        | Follow canal-path action after departure understood | Safe completed checkpoint and ending; exploration remains available      |

The essential chain is farewell → home lead → latch → escape → stair trace → memory → engagement → departure → chosen exit. Optional landing, apartment/lane alcoves, courtyard history, front-door payoff, and shortcuts never substitute for essential evidence. Required observations use normal passage or clearly framed interactions on the route; there is no collectible count.

Checkpoint every completed milestone and safe room arrival. During the escape or any staged action, snapshots return the most recent safe checkpoint; do not persist a running hazard clock, death, midair position, or half-finished gesture. A safe retry does not duplicate captions, journal entries, or chapter endings. Door arrival clears movement/interaction input and requires a fresh press to reverse direction.

### Proposed save compatibility

Recommend a new campaign envelope under `chasing-shadows:campaign:v3`, retaining the existing opening and Chapter One keys as import sources. This is a proposal to review before implementation, not an existing format. Do not simply add Chapter Two rooms to the current Chapter One validator: its room whitelist and milestone filtering would otherwise discard them.

- Carry forward the complete compatible Chapter One state, including its completion, discoveries, lamp settings, and shortcuts. Chapter Two has an explicit active-chapter discriminator, room/entry identity, safe position, typed milestones, and its own puzzle state. Its completion is distinct from the existing `chapterComplete` mark.
- Load a valid campaign first, then a valid Chapter One v2 save, then legacy v1. Importing a completed Chapter One save offers the new continuation; it does not invent farewell/memory completion. Importing an unfinished save resumes Chapter One. Legacy `finished` still means the photograph, never chapter completion.
- Write future play to the campaign key and preserve old keys unchanged. Begin/replay explicitly replaces the active campaign with a fresh Chapter One state, including empty Chapter Two progress, so valid old Chapter Two data cannot win on the next Continue. Use the existing new-game replacement semantics; do not add a second unexplained save slot.
- Treat stored data as unknown. Validate chapter, rooms, puzzle ranges, milestone prerequisites, and safe spawn geometry. Normalize inconsistent Chapter Two state to the latest justified safe milestone; an unknown format must not unlock future content. An invalid campaign falls back to validated older keys, without overwriting them during reading.
- Keep a valid in-memory campaign when storage is unavailable, with the existing honest persistence message. Settings retain their current key. Changing browser/host/port does not transfer saves.

## Implementation scope after design review

Keep this pass documentation-only. After the sequence is agreed, first greybox the room connections, landing/courtyard reuse, and gallery escape before detailed art or final dialogue. Exact widths, elevations, camera framing, collision geometry, and physical timing must be chosen and tested in that pass.

Recommend a separate pure Chapter Two rules module, composed with campaign progression rather than a deeper `OpeningModel → ChapterModel → another subclass` chain. Reuse the existing player, input, lamp controls, sound synthesis, dialog conventions, and room lifecycle where practical. Decide the scene/model adapter boundary in an implementation plan after inspecting how chapter dispatch fits `main.ts` and `AppController`; this draft does not claim the current scene already supports these rooms. Keep gameplay geometry in shared data, one Phaser game loop, local assets, and bounded reusable textures.

Build in reviewable slices:

1. Campaign continuation/import and the rest-room farewell, with existing Chapter One regressions protected.
2. Greybox lane/apartment/utility/gallery/home connections and persistent shortcuts; verify all return routes.
3. Light-screen puzzle, old-route response, and one warning/escape/retry encounter.
4. Home objects, Grace staging, ordered evidence, journal, and deliberate chapter ending.
5. Visual/audio refinement and production-browser acceptance, then human pacing/readability review.

No combat, enemy, inventory system, general shadow simulation, map UI, catastrophe explanation, parent reveal, later playable canal district, or extra chapter is required by this plan.

## Acceptance checks for the eventual implementation

- Fresh and imported games preserve Chapter One's exact ending. Completed saves can continue without replaying Daniel's death; the farewell learns once and pauses correctly.
- First-visit and return routes match the graph. Enter/exit every connection from both sides; no stair, latch, shortcut, or held key strands Thomas. Chapter One courtyard access cannot enter the home early.
- Try lamp-first and screen-first orders; interrupt alignment, switch off, cancel approach, revisit after solving, and reload. The two lamps' settings and permanent door states remain independent.
- Reach the apartment utility route without watching the failed landing gesture. Skip every optional branch and both optional shortcuts; still understand and complete the chapter.
- In the gallery, verify warning visibility, a forgiving successful run, deliberate death, waiting indefinitely at YOU DIED, keyboard retry, title/Continue, pause/focus loss, and safe reload. Completed gallery traversal stays safe in both directions.
- Inspect chronology at the stair catch before the note. Read/revisit each home interaction and reload between them. Check missing/skipped Chapter One photo, memory replay, evidence ordering, ending once, and completed-game exploration.
- Review every caption, journal entry, objective, and ending for accidental current-survival claims, either parent's death, new catastrophe lore, or omniscient shadow behavior.
- Exercise valid v3, v2, legacy v1, corrupt/unknown formats, inconsistent progression, blocked storage, and Begin/replay followed by reload. Never test on the user's port-4173 save.
- Run strict types, focused state/save regressions, formatting, production build and bundle budget. Use isolated port 4174 for actual input in the production preview, including portrait 390 × 844 and short landscape 854 × 390. Check essential puzzle/hazard framing and dialog focus; physical touch and other browsers require their own evidence.
- Ask human players whether they understood why Thomas seeks home, why the shadow's route failed, who Grace is, and exactly what the final evidence does and does not prove. Measure exploration and encounter time before choosing a duration target.

## Review decisions

The one-escape/exploration balance is selected. The main recommendations still requiring design agreement are using the existing No. 14 as home, the utility/gallery approach, the screen-and-lamp arrangement, the canopy collapse, and the physical-repair-plus-note evidence. Dialogue and tuning are editable execution details. The campaign format and model boundary need an implementation review before code changes. None of these proposals changes the approved limits on Grace, the parents, the shadow, or survival by luck.
