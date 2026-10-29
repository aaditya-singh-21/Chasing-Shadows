export type Facing = -1 | 1;
export type Mode = 'walk' | 'approach-lamp' | 'lamp' | 'panel';
export type ShadowMode = 'follow' | 'linger' | 'project' | 'reach' | 'knock' | 'code';
export type NoteId = 'waking' | 'shadow' | 'light' | 'knock' | 'access' | 'photo';
export type Flag = 'doorOpen' | 'deviationSeen' | 'gateOpen' | 'knocked' | 'panelOpen' | 'finished';
export type Flags = Record<Flag, boolean>;
export type SoundId =
  'step' | 'jump' | 'land' | 'knock' | 'symbol' | 'unlock' | 'unease' | 'gate' | 'door' | 'switch';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: Facing;
}

export interface ShadowState {
  x: number;
  y: number;
  mode: ShadowMode;
  timer: number;
  facing: Facing;
}

export interface SaveData {
  version: 1;
  flags: Flags;
  x: number;
  lampX: number;
  lampOn?: boolean;
}

export interface Interaction {
  id: 'tram' | 'lamp' | 'notice' | 'door' | 'panel' | 'photo' | 'mug';
  label: string;
}

export type GameEvent =
  | { type: 'start' }
  | { type: 'sound'; value: SoundId }
  | { type: 'say'; value: { text: string; seconds: number } }
  | { type: 'save' | 'autosave'; value: SaveData }
  | { type: 'note'; value: NoteId }
  | { type: 'puzzle'; value: 'lamp' | 'panel' | null }
  | { type: 'sequence'; value: number }
  | { type: 'sequence-wrong' }
  | { type: 'photo' };

export type GameListener = (event: GameEvent) => void;

export class GameEvents {
  private listeners = new Set<GameListener>();

  on(listener: GameListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: GameEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}
