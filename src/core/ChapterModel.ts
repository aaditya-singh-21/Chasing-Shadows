import { MEMORY_DURATION, MEMORY_BEATS } from '../data/memory.ts';
import { OpeningModel } from './OpeningModel.ts';
import type { DeathCause, Flag, Interaction, RoomId, SaveData } from './types.ts';
import { ROOMS, floorAt } from '../data/rooms.ts';
import { validateSave } from '../systems/SaveStore.ts';
import { ChapterTwo } from './ChapterTwo.ts';

export class ChapterModel extends OpeningModel {
  readonly chapterTwo = new ChapterTwo(this);
  room: RoomId = 'street';
  marks = new Set<string>();
  hazardTime = -1;
  sequenceTime = 0;
  sequence: 'memory' | 'ending' | 'death' | 'farewell' | null = null;
  private safe: SaveData | null = null;
  get trolleyX(): number {
    return Math.min(2400, 80 + Math.max(0, this.hazardTime - 2.5) * 210);
  }
  get waterY(): number {
    return Math.max(930, 1430 - Math.max(0, this.hazardTime - 2.5) * 35);
  }
  get danger(): boolean {
    return this.hazardTime >= 0;
  }
  private raw(): SaveData {
    return {
      ...super.snapshot(),
      x: this.player.x,
      chapter: { room: this.room, y: this.player.y, marks: [...this.marks] },
    };
  }
  checkpoint(): void {
    this.safe = this.raw();
    this.events.emit({ type: 'save', value: this.safe });
  }
  override snapshot(): SaveData {
    return this.danger || this.sequence ? (this.safe ?? this.raw()) : this.raw();
  }
  override start(raw: unknown = null): void {
    const save = validateSave(raw);
    this.room = save?.chapter?.room ?? 'street';
    this.marks = new Set(save?.chapter?.marks ?? []);
    this.hazardTime = -1;
    this.sequence = null;
    this.sequenceTime = 0;
    super.start(save);
    this.player.y = save?.chapter?.y ?? floorAt(this.room, this.player.x);
    this.safe = this.raw();
    this.events.emit({ type: 'room' });
  }
  travel(room: RoomId, x: number): void {
    this.room = room;
    this.player = { x, y: floorAt(room, x), vx: 0, vy: 0, grounded: true, facing: 1 };
    this.walkTarget = null;
    this.mode = 'walk';
    this.hazardTime = -1;
    this.shadow.reset(x);
    this.events.emit({ type: 'room' });
    this.checkpoint();
  }
  private mark(id: string, text: string): void {
    if (this.marks.has(id)) return;
    this.marks.add(id);
    this.say(text, 7);
    this.checkpoint();
  }
  override get interaction(): Interaction | null {
    if (this.sequence || this.paused || !this.started || !this.player.grounded) return null;
    if (this.mode !== 'walk') return super.interaction;
    const x = this.player.x;
    const continuation = this.chapterTwo.interaction;
    if (continuation) return continuation;
    const door = ROOMS[this.room].doors.find(
      (d) =>
        Math.abs(d.x - x) < 100 &&
        (!d.requires || this.marks.has(d.requires) || this.flags[d.requires as Flag]),
    );
    if (door) return { id: 'travel', label: door.label };
    if (
      (this.room === 'street' && Math.abs(x - 5920) < 150) ||
      (this.room === 'workshop' && Math.abs(x - 500) < 150)
    )
      return { id: 'identity', label: 'Read Employee of the Month — Thomas' };
    if (this.room === 'workshop' && Math.abs(x - 1250) < 140)
      return {
        id: 'power',
        label: this.marks.has('power') ? 'Service power restored' : 'Restore service power',
      };
    if (this.room === 'workshop' && Math.abs(x - 700) < 140)
      return { id: 'photo', label: 'Examine staff photograph' };
    return this.room === 'street' ? super.interaction : null;
  }
  override interact(): void {
    if (this.sequence || this.paused) return;
    const target = this.interaction;
    if (target && this.chapterTwo.interact(target.id)) return;
    if (target?.id === 'travel') {
      const door = ROOMS[this.room].doors.find(
        (d) =>
          Math.abs(d.x - this.player.x) < 100 &&
          (!d.requires || this.marks.has(d.requires) || this.flags[d.requires as Flag]),
      );
      if (!door) return;
      if (this.room === 'shelter-hall' && door.to === 'street') this.marks.add('shortcut');
      this.travel(door.to, door.spawn);
      return;
    }
    if (target?.id === 'identity') {
      this.mark('identity', 'THOMAS. Employee of the Month. The man in the portrait… that is me.');
      this.events.emit({ type: 'identity' });
      return;
    }
    if (target?.id === 'power') {
      this.mark('power', 'Emergency supply restored. The service route is open.');
      return;
    }
    if (target?.id === 'photo') {
      this.events.emit({ type: 'photo' });
      return;
    }
    super.interact();
  }
  override finish(): void {
    super.finish();
    this.mark('photoExamined', 'The shadow reaches for the woman beside me. It remembers her.');
  }
  retry(): boolean {
    if (this.sequence !== 'death' || !this.safe) return false;
    this.start(this.safe);
    return true;
  }
  die(cause: DeathCause = 'unknown'): void {
    if (this.sequence) return;
    this.sequence = 'death';
    this.sequenceTime = 0;
    this.walkTarget = null;
    this.say('');
    this.events.emit({ type: 'death', value: cause });
  }
  override update(dt: number, axis = 0): void {
    if (this.paused || !this.started || this.inTitle) return;
    if (this.sequence === 'death') return;
    dt = Math.min(dt, 0.05);
    if (this.chapterTwo.update(dt)) return;
    if (this.sequence) {
      this.time += dt;
      const previous = this.sequenceTime;
      this.sequenceTime += dt;
      if (this.sequence === 'memory')
        for (const beat of MEMORY_BEATS)
          if (previous < beat.at && this.sequenceTime >= beat.at) this.say(beat.text, 4);
      if (this.sequence === 'memory' && this.sequenceTime > MEMORY_DURATION) {
        this.sequence = null;
        this.mark('brother', 'Daniel. My younger brother. I remember him.');
      } else if (this.sequence === 'ending' && this.sequenceTime > 9) {
        this.sequence = null;
        this.mark('chapterComplete', 'Daniel is dead. My brother is dead.');
        this.events.emit({ type: 'chapter-end' });
      }
      return;
    }
    if (this.room === 'street') {
      if (this.player.x > 620 && !this.marks.has('suitcase'))
        this.mark('suitcase', 'A dark red mark on the handle. Is that blood?');
      super.update(dt, axis);
      if (this.player.x > 5750 && this.player.x < 6100)
        this.mark('identity', 'THOMAS. Employee of the Month. My face, my scarf… that is my name.');
      if (this.player.x > 6240 && !this.marks.has('road-end'))
        this.mark(
          'road-end',
          'The passage ends in rubble. The maintenance workshop may have another way through.',
        );
      return;
    }
    this.time += dt;
    const x = this.player.x;
    this.shadow.state.x = x + 70;
    this.shadow.state.y = this.player.y;
    this.shadow.state.facing = this.player.facing;
    if (this.room === 'workshop' && x > 350)
      this.mark('identity', 'Employee of the Month: THOMAS. My face, my scarf… that is my name.');
    if (this.room === 'courtyard' && x > 600)
      this.mark(
        'courtyard',
        'A repaired pump. The same little mark as the tools in the workshop. Someone cared for this place.',
      );
    if (this.room === 'shelter-hall' && x > 650 && !this.marks.has('brother')) {
      this.sequence = 'memory';
      this.sequenceTime = 0;
      this.walkTarget = null;
      this.say(MEMORY_BEATS[0].text, 3);
    }
    if (this.room === 'service-passage' && !this.marks.has('trolley')) {
      if (x > 450 && this.hazardTime < 0) {
        this.hazardTime = 0;
        this.say('The brake is slipping. Move! Reach the side doorway beyond the rail buffer.');
        this.events.emit({ type: 'sound', value: 'gate' });
      }
      if (this.hazardTime >= 0) this.hazardTime += dt;
      if (x > 2510) {
        this.hazardTime = -1;
        this.mark('trolley', 'The buffer caught it. The shelter is ahead.');
      } else if (this.hazardTime > 2.5 && Math.abs(x - this.trolleyX) < 150 && this.player.y > 450)
        this.die('trolley');
    }
    if (this.room === 'shelter-lower' && !this.marks.has('flood')) {
      if (x > 420 && this.hazardTime < 0) {
        this.hazardTime = 0;
        this.say('The pipe is giving way. Take the rising steps!');
        this.events.emit({ type: 'sound', value: 'gate' });
      }
      if (this.hazardTime >= 0) this.hazardTime += dt;
      if (x > 1600 && this.player.y < 920) {
        this.hazardTime = -1;
        this.mark('flood', 'Above the water. A rest room at the top.');
      } else if (this.hazardTime > 2.5 && this.waterY < this.player.y - 20) this.die('flood');
    }
    if (
      this.room === 'shelter-rest' &&
      x > 820 &&
      !this.marks.has('chapterComplete') &&
      this.marks.has('brother')
    ) {
      this.sequence = 'ending';
      this.sequenceTime = 0;
      this.walkTarget = null;
      this.say('Daniel. No… not you.', 9);
    }
  }
  override get location(): string {
    return this.room === 'street'
      ? this.player.x > 5280
        ? 'MERCER STREET · TRANSIT FORECOURT'
        : super.location
      : ROOMS[this.room].title;
  }
  override get objective(): string {
    if (this.room === 'residential-lane') return 'Find No. 14 beyond the residential lane.';
    if (this.room === 'shelter-rest' && this.marks.has('chapterTwoStarted'))
      return this.marks.has('farewell')
        ? 'Take the upper exit. Look for home.'
        : 'Stay with Daniel. Cover him before leaving.';
    const objectives: Partial<Record<RoomId, string>> = {
      workshop: 'Look for something familiar. Restore service power.',
      'service-passage': 'Reach the shelter side doorway.',
      'shelter-hall': this.marks.has('brother')
        ? 'Find a way through the lower shelter.'
        : 'Look at the photograph under the lamp.',
      'shelter-lower': 'Take the rising steps. Stay above the water.',
      'shelter-rest': this.marks.has('chapterComplete')
        ? 'Daniel. My brother.'
        : 'Approach the emergency cot.',
      courtyard: 'Explore the courtyard passage.',
    };
    return objectives[this.room] ?? super.objective;
  }
}
