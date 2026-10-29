import { LAMP, OBSTACLES, SHUTTER, TRAM, WORLD, ACCESS, clamp } from '../data/opening.ts';
import type { Flags, Flag, NoteId, SaveData } from '../core/types.ts';

export const SAVE_KEY = 'chasing-shadows:opening:v1';
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
  const data = value as Record<string, unknown>;
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
  return {
    version: 1,
    flags,
    x: safeCheckpointX(clamp(rawX, WORLD.minX, maxX)),
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
      this.cache = validateSave(JSON.parse(this.storage?.getItem(SAVE_KEY) ?? 'null'));
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
      this.storage.setItem(SAVE_KEY, JSON.stringify(checkpoint));
      this.available = true;
    } catch {
      this.available = false;
    }
  }
}
