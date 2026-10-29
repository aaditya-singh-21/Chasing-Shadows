import { GameEvents } from './types.ts';
import type { Flag, Flags, Interaction, NoteId, PlayerState, SaveData } from './types.ts';
import { ACCESS, LAMP, LANDMARKS, TRAM, WORLD } from '../data/opening.ts';
import { AccessPuzzle, LampPuzzle } from '../systems/Puzzles.ts';
import { ShadowBehavior } from '../systems/ShadowBehavior.ts';
import { freshFlags, notesFromFlags, safeCheckpointX, validateSave } from '../systems/SaveStore.ts';

export class OpeningModel {
  readonly events = new GameEvents();
  readonly lamp = new LampPuzzle();
  readonly access = new AccessPuzzle();
  readonly shadow = new ShadowBehavior();
  flags: Flags = freshFlags();
  notes: NoteId[] = ['waking'];
  player: PlayerState = {
    x: WORLD.startX,
    y: WORLD.floor,
    vx: 0,
    vy: 0,
    grounded: true,
    facing: 1,
  };
  mode: 'walk' | 'approach-lamp' | 'lamp' | 'panel' = 'walk';
  paused = true;
  started = false;
  inTitle = true;
  time = 0;
  gateAmount = 0;
  walkTarget: number | null = null;
  reducedMotion = false;
  private seen = new Set<string>();
  private checkpointTime = 0;
  private lampTime = 0;

  start(raw: unknown = null): void {
    const saved = validateSave(raw);
    this.flags = saved?.flags ?? freshFlags();
    this.notes = notesFromFlags(this.flags);
    this.player = {
      x: saved?.x ?? WORLD.startX,
      y: WORLD.floor,
      vx: 0,
      vy: 0,
      grounded: true,
      facing: 1,
    };
    this.lamp.x = saved?.lampX ?? LAMP.initial;
    this.lamp.on = saved?.lampOn !== false;
    this.lamp.alignment = 0;
    this.access.reset();
    this.shadow.reset(this.player.x);
    this.gateAmount = this.flags.gateOpen ? 1 : 0;
    this.time = 0;
    this.mode = 'walk';
    this.seen.clear();
    this.checkpointTime = 0;
    this.walkTarget = null;
    this.paused = false;
    this.started = true;
    this.inTitle = false;
    this.events.emit({ type: 'start' });
    this.say(saved ? 'The city is still waiting.' : 'I don’t remember getting on.');
  }

  snapshot(): SaveData {
    return {
      version: 1,
      flags: { ...this.flags },
      x: safeCheckpointX(this.player.x),
      lampX: this.lamp.x,
      lampOn: this.lamp.on,
    };
  }
  say(text: string, seconds = 5): void {
    this.events.emit({ type: 'say', value: { text, seconds } });
  }
  private once(id: string, action: () => void): void {
    if (!this.seen.has(id)) {
      this.seen.add(id);
      action();
    }
  }
  private discover(flag: Flag, note?: NoteId): void {
    if (this.flags[flag]) return;
    this.flags[flag] = true;
    if (note && !this.notes.includes(note)) {
      this.notes.push(note);
      this.events.emit({ type: 'note', value: note });
    }
    this.events.emit({ type: 'save', value: this.snapshot() });
  }

  get interaction(): Interaction | null {
    if (!this.started || this.paused || this.mode !== 'walk' || !this.player.grounded) return null;
    const x = this.player.x;
    if (!this.flags.doorOpen && Math.abs(x - TRAM.interactX) < 145)
      return { id: 'tram', label: 'Open the tram door' };
    if (x > LAMP.interactLeft && x < LAMP.interactRight)
      return {
        id: 'lamp',
        label: this.flags.gateOpen ? 'Adjust the maintenance lamp' : 'Move the maintenance lamp',
      };
    if (Math.abs(x - LANDMARKS.notice) < 100)
      return { id: 'notice', label: 'Read the platform notice' };
    if (this.flags.gateOpen && Math.abs(x - LANDMARKS.familiarDoor) < 145)
      return { id: 'door', label: 'Listen at the door' };
    if (this.flags.gateOpen && Math.abs(x - ACCESS.x) < 180)
      return {
        id: 'panel',
        label: this.flags.panelOpen ? 'Recall the access rhythm' : 'Examine the access panel',
      };
    if (this.flags.panelOpen && Math.abs(x - LANDMARKS.photo) < 180)
      return { id: 'photo', label: 'Examine the staff photograph' };
    if (this.flags.panelOpen && Math.abs(x - LANDMARKS.desk) < 100)
      return { id: 'mug', label: 'Examine the desk' };
    return null;
  }

  interact(): void {
    if (this.paused) return;
    if (this.mode !== 'walk') {
      this.leavePuzzle();
      return;
    }
    const target = this.interaction;
    if (!target) return;
    this.walkTarget = null;
    switch (target.id) {
      case 'tram':
        this.discover('doorOpen');
        this.events.emit({ type: 'sound', value: 'door' });
        this.say('No footsteps. Not even in the distance.');
        break;
      case 'lamp':
        this.mode = 'approach-lamp';
        this.walkTarget = LAMP.standX;
        if (Math.abs(this.player.x - LAMP.standX) < 8) this.beginLamp();
        break;
      case 'notice':
        this.say('“Service resumes at first light.” There’s no date.');
        break;
      case 'door':
        this.shadow.pose('knock', 4310);
        this.say('Nothing. But it still seems to be listening.');
        break;
      case 'panel':
        this.mode = 'panel';
        this.access.reset();
        this.shadow.pose('code', ACCESS.shadowX);
        this.events.emit({ type: 'puzzle', value: 'panel' });
        break;
      case 'photo':
        this.events.emit({ type: 'photo' });
        break;
      case 'mug':
        this.say('Two cups. One has never been washed.');
        break;
    }
  }

  private beginLamp(): void {
    this.mode = 'lamp';
    this.walkTarget = null;
    this.lampTime = 0;
    this.lamp.alignment = 0;
    this.shadow.pose('project');
    this.events.emit({ type: 'puzzle', value: 'lamp' });
  }

  leavePuzzle(): void {
    this.mode = 'walk';
    this.walkTarget = null;
    this.lamp.alignment = 0;
    this.shadow.pose('follow');
    this.events.emit({ type: 'puzzle', value: null });
    // Keep adjustments made after solving, including whether the light was switched off.
    this.events.emit({ type: 'save', value: this.snapshot() });
  }

  setLamp(x: number): void {
    if (this.mode === 'lamp' && !this.paused) this.lamp.move(x);
  }
  toggleLamp(): void {
    if (this.mode !== 'lamp' || this.paused) return;
    this.lamp.on = !this.lamp.on;
    this.events.emit({ type: 'sound', value: 'switch' });
  }
  enterSymbol(symbol: number): void {
    if (this.mode !== 'panel' || this.paused) return;
    const result = this.access.enter(symbol);
    if (result === 'invalid') return;
    this.events.emit({ type: 'sound', value: 'symbol' });
    if (result === 'wrong') {
      this.events.emit({ type: 'sequence-wrong' });
      return;
    }
    this.events.emit({ type: 'sequence', value: this.access.input.length });
    if (result === 'complete') {
      const repeated = this.flags.panelOpen;
      this.discover('panelOpen', 'access');
      this.leavePuzzle();
      this.events.emit({ type: 'sound', value: 'unlock' });
      this.say(repeated ? 'The rhythm is still there.' : 'How did it know that?');
    }
  }
  finish(): void {
    this.discover('finished', 'photo');
  }

  update(dt: number, lampAxis = 0): void {
    if (!this.started || this.paused || this.inTitle) return;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this.gateAmount = Math.min(1, this.gateAmount + (this.flags.gateOpen ? dt * 0.65 : 0));
    if (
      this.mode === 'approach-lamp' &&
      Math.abs(this.player.x - LAMP.standX) < 8 &&
      this.player.grounded
    )
      this.beginLamp();
    if (this.mode === 'lamp') {
      this.lampTime += dt;
      this.lamp.move(this.lamp.x + lampAxis * dt * LAMP.speed);
      this.shadow.state.x = this.lamp.projection(this.player.x);
      this.shadow.state.y = WORLD.floor;
      if (this.lamp.update(dt, this.player.x, this.flags.gateOpen)) {
        this.discover('gateOpen', 'light');
        this.leavePuzzle();
        this.shadow.pose('reach', LAMP.target);
        this.events.emit({ type: 'sound', value: 'gate' });
        this.say('It caught open. My hands never touched it.');
      }
      if (!this.flags.gateOpen && this.lampTime > 24 && this.lamp.on)
        this.once('lamp-hint', () => this.say('Move the lamp left. Its hand is almost there.'));
    } else if (this.mode === 'panel') {
      this.access.time += dt;
    } else {
      this.shadow.update(dt, this.player, this.lamp, this.events);
      this.updateNarrative();
    }
    this.checkpointTime += dt;
    if (this.checkpointTime > 8 && this.player.grounded) {
      this.checkpointTime = 0;
      this.events.emit({ type: 'autosave', value: this.snapshot() });
    }
  }

  private updateNarrative(): void {
    const x = this.player.x;
    if (x > 1450 && !this.flags.deviationSeen) {
      this.discover('deviationSeen', 'shadow');
      this.shadow.pose('linger', x + 120);
      this.say('It turned. I didn’t.');
      this.events.emit({ type: 'sound', value: 'unease' });
    }
    if (x > 3980 && !this.flags.knocked) {
      this.discover('knocked', 'knock');
      this.shadow.pose('knock', 4310);
      this.say('It knows this door.');
    }
    if (x > 620 && x < 735) this.once('bag', () => this.say('A bag. Someone was going somewhere.'));
    if (x > 2020 && !this.flags.gateOpen)
      this.once('lamp', () => this.say('The latch is too high. But its shadow…'));
    if (x > 5540) this.once('photo', () => this.say('Something on the wall.'));
  }

  get location(): string {
    const x = this.player.x;
    return x < 1160
      ? 'OLD QUARTER · TRAM 07'
      : x < 3050
        ? 'OLD QUARTER · TRAM TERMINUS'
        : x < 5280
          ? 'OLD QUARTER · MERCER STREET'
          : 'TRANSIT AUTHORITY · MAINTENANCE ROOM';
  }
  get objective(): string {
    return !this.flags.doorOpen
      ? 'Find a way out of the tram.'
      : !this.flags.gateOpen
        ? 'Find a way through the station shutter.'
        : !this.flags.knocked
          ? 'Follow the street. Watch your shadow.'
          : !this.flags.panelOpen
            ? 'Find the maintenance entrance.'
            : !this.flags.finished
              ? 'Look for something familiar.'
              : 'Who did you come back for?';
  }
}
