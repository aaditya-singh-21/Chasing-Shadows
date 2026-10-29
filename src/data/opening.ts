import type { NoteId } from '../core/types.ts';

/** All gameplay geometry is in world units, shared by physics, art and interactions. */
export const WORLD = { floor: 700, width: 6620, minX: 160, maxX: 6440, startX: 440 } as const;
export const MOVEMENT = {
  speed: 245,
  groundAcceleration: 1600,
  airAcceleration: 900,
  groundDrag: 2000,
  gravity: 1500,
  jumpSpeed: 550,
  jumpCutSpeed: 230,
  maxFallSpeed: 850,
  coyoteSeconds: 0.11,
  bufferSeconds: 0.14,
} as const;
export const OBSTACLES = [
  { id: 'suitcase', left: 752, right: 824, top: 660 },
  { id: 'crate-low', left: 3460, right: 3550, top: 650 },
  { id: 'crate-high', left: 3670, right: 3790, top: 610 },
] as const;
export const TRAM = { interactX: 1040, bodyX: 1110, width: 20, top: 408, bottom: 700 } as const;
export const SHUTTER = {
  x: 2830,
  y: 310,
  width: 153,
  height: 390,
  lift: 355,
  clearAt: 0.86,
} as const;
export const LAMP = {
  min: 1900,
  max: 2220,
  initial: 2180,
  standX: 2360,
  target: 2770,
  projection: 1.15,
  tolerance: 25,
  holdSeconds: 1.35,
  speed: 115,
  interactLeft: 2100,
  interactRight: 2720,
} as const;
export const ACCESS = {
  x: 5110,
  shadowX: 5180,
  doorX: 5240,
  top: 520,
  width: 24,
  height: 180,
  sequence: [0, 2, 1, 0],
  symbols: ['Circle', 'Line', 'Triangle'],
  beatSeconds: 0.85,
} as const;
export const LANDMARKS = { notice: 1560, familiarDoor: 4320, desk: 5570, photo: 5920 } as const;

export const NOTES: Record<NoteId, { title: string; text: string }> = {
  waking: {
    title: 'The last stop',
    text: 'An empty tram. An empty city. Someone left their bag behind, as if they expected to come back. I can’t remember getting on.',
  },
  shadow: {
    title: 'A movement of its own',
    text: 'It turned its head. I didn’t. For a moment it stayed behind, looking toward the platform. I am certain I saw it.',
  },
  light: {
    title: 'A borrowed reach',
    text: 'I moved the lamp. It reached for the shadow of the latch, and the real latch moved. The shutter caught open. The lamp still works.',
  },
  knock: {
    title: 'Two. Then one.',
    text: 'It knew this door. Two knocks, a pause, then one more. It waited for an answer. It waited longer than I did.',
  },
  access: {
    title: 'A familiar rhythm',
    text: 'Circle. Triangle. Line. Circle. The maintenance door opened. How many times have these hands done that before?',
  },
  photo: {
    title: 'Someone you knew',
    text: 'I am in the staff photograph. The same coat, the same torn cuff. But my shadow reached for the person beside me. Who did we come back for?',
  },
};

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
