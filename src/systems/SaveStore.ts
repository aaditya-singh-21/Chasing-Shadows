import { ROOMS, floorAt } from '../data/rooms.ts';
import type { RoomId } from '../core/types.ts';
import { LAMP, OBSTACLES, SHUTTER, TRAM, WORLD, ACCESS, clamp } from '../data/opening.ts';
import type { Flags, Flag, NoteId, SaveData } from '../core/types.ts';

export const SAVE_KEY = 'chasing-shadows:opening:v1';
export const CHAPTER_KEY = 'chasing-shadows:chapter-one:v2';
export const SETTINGS_KEY = 'chasing-shadows:settings:v1';
export const freshFlags = (): Flags => ({
  doorOpen: false,
  deviationSeen: false,
  gateOpen: false,
  knocked: false,
  panelOpen: false,
  finished: false,
});

export function notesFromFlags(flags: Flags): NoteId[] {
  const notes: NoteId[] = ['waking'];
  const pairs: [Flag, NoteId][] = [
    ['deviationSeen', 'shadow'],
    ['gateOpen', 'light'],
    ['knocked', 'knock'],
    ['panelOpen', 'access'],
    ['finished', 'photo'],
  ];
  for (const [flag, note] of pairs) if (flags[flag]) notes.push(note);
  return notes;
}

export function safeCheckpointX(x: number): number {
  let result = clamp(x, WORLD.minX, WORLD.maxX);
  for (const obstacle of OBSTACLES) {
    if (result + 18 > obstacle.left && result - 18 < obstacle.right) result = obstacle.left - 25;
  }
  return result;
}

/** Accept v1 checkpoints from the original Canvas opening; never trust stored JSON. */
export function validateSave(value: unknown): SaveData | null {
  if (!value || typeof value !== 'object') return null;
  let data = value as Record<string, unknown>;
  if (data.version === 2 && data.checkpoint && typeof data.checkpoint === 'object')
    data = data.checkpoint as Record<string, unknown>;
  if (data.version !== 1 || !data.flags || typeof data.flags !== 'object') return null;
  const rawFlags = data.flags as Record<string, unknown>;
  const flags = freshFlags();
  for (const key of Object.keys(flags) as Flag[]) flags[key] = rawFlags[key] === true;
  if (flags.finished) flags.panelOpen = true;
  if (flags.panelOpen) flags.knocked = true;
  if (flags.knocked) flags.gateOpen = true;
  if (flags.gateOpen) flags.deviationSeen = true;
  if (flags.deviationSeen) flags.doorOpen = true;
  const maxX = flags.panelOpen
    ? WORLD.maxX
    : flags.gateOpen
      ? ACCESS.doorX - 40
      : flags.doorOpen
        ? SHUTTER.x - 30
        : TRAM.bodyX - 35;
  const rawX = typeof data.x === 'number' && Number.isFinite(data.x) ? data.x : WORLD.startX;
  const lampX =
    typeof data.lampX === 'number' && Number.isFinite(data.lampX)
      ? clamp(data.lampX, LAMP.min, LAMP.max)
      : LAMP.initial;
  let chapter: import('../core/types.ts').ChapterState | undefined;
  let position = safeCheckpointX(clamp(rawX, WORLD.minX, maxX));
  if (data.chapter && typeof data.chapter === 'object') {
    const c = data.chapter as Record<string, unknown>;
    const room =
      typeof c.room === 'string' && Object.hasOwn(ROOMS, c.room) ? (c.room as RoomId) : 'street';
    position =
      room === 'street'
        ? safeCheckpointX(clamp(rawX, WORLD.minX, Math.min(maxX, ROOMS.street.width - 60)))
        : clamp(rawX, 60, ROOMS[room].width - 60);
    const marks = Array.isArray(c.marks)
      ? c.marks.filter(
          (m): m is string =>
            typeof m === 'string' &&
            [
              'identity',
              'power',
              'brother',
              'shortcut',
              'trolley',
              'flood',
              'chapterComplete',
              'photoExamined',
              'courtyard',
              'suitcase',
              'road-end',
            ].includes(m),
        )
      : [];
    if (marks.includes('chapterComplete') && !marks.includes('brother'))
      marks.splice(marks.indexOf('chapterComplete'), 1);
    chapter = { room, marks, y: floorAt(room, position) };
    if (room === 'service-passage' && !marks.includes('trolley')) position = 300;
    if (room === 'shelter-lower' && !marks.includes('flood')) {
      position = 200;
      chapter.y = 1300;
    }
    if (room === 'shelter-rest' && !marks.includes('brother')) {
      chapter.room = 'shelter-hall';
      position = 300;
      chapter.y = 700;
    }
  } else if (rawX >= 5240 || flags.finished) {
    chapter = { room: 'workshop', marks: flags.finished ? ['photoExamined'] : [], y: 700 };
    position = 180;
  }
  return {
    ...(chapter ? { chapter } : {}),
    version: 1,
    flags,
    x: position,
    lampX,
    lampOn: data.lampOn !== false,
  };
}

export class SaveStore {
  private cache: SaveData | null = null;
  available = true;

  constructor(privateStorage?: Storage) {
    this.storage = privateStorage;
    try {
      this.storage ??= globalThis.localStorage;
      const current = this.storage?.getItem(CHAPTER_KEY);
      try {
        this.cache = validateSave(JSON.parse(current ?? 'null'));
      } catch {
        this.cache = null;
      }
      this.cache ??= validateSave(JSON.parse(this.storage?.getItem(SAVE_KEY) ?? 'null'));
    } catch {
      this.available = false;
    }
  }

  private storage: Storage | undefined;
  get checkpoint(): SaveData | null {
    return this.cache;
  }

  write(checkpoint: SaveData): void {
    this.cache = checkpoint;
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.setItem(
        checkpoint.chapter ? CHAPTER_KEY : SAVE_KEY,
        JSON.stringify(checkpoint.chapter ? { version: 2, checkpoint } : checkpoint),
      );
      this.available = true;
    } catch {
      this.available = false;
    }
  }
}
