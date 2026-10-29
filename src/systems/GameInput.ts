import type Phaser from 'phaser';
import type { OpeningModel } from '../core/OpeningModel.ts';
import type { MotionInput } from './Movement.ts';

export class GameInput {
  private held = new Set<string>();
  private pressed = false;
  private released = false;
  private jumpHeld = false;

  constructor(scene: Phaser.Scene, model: OpeningModel) {
    const down = (event: KeyboardEvent): void => {
      if (model.paused || model.inTitle || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (event.target instanceof HTMLInputElement && !['a', 'd'].includes(key)) return;
      if (event.target instanceof HTMLButtonElement && key === ' ') return;
      if (['a', 'd', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
        this.held.add(key);
      }
      if ([' ', 'w', 'arrowup'].includes(key) && model.mode === 'walk') {
        event.preventDefault();
        if (!event.repeat && !this.jumpHeld) {
          this.pressed = true;
          this.jumpHeld = true;
        }
      }
    };
    const up = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();
      this.held.delete(key);
      if ([' ', 'w', 'arrowup'].includes(key)) {
        this.released = true;
        this.jumpHeld = false;
      }
    };
    scene.input.keyboard?.on('keydown', down);
    scene.input.keyboard?.on('keyup', up);
    scene.events.once('shutdown', () => {
      scene.input.keyboard?.off('keydown', down);
      scene.input.keyboard?.off('keyup', up);
    });
  }

  get axis(): number {
    return (
      (this.held.has('d') || this.held.has('arrowright') || this.held.has('right') ? 1 : 0) -
      (this.held.has('a') || this.held.has('arrowleft') || this.held.has('left') ? 1 : 0)
    );
  }
  setHold(direction: 'left' | 'right', held: boolean): void {
    if (held) this.held.add(direction);
    else this.held.delete(direction);
  }
  jump(held: boolean): void {
    if (held && !this.jumpHeld) this.pressed = true;
    if (!held) this.released = true;
    this.jumpHeld = held;
  }
  consume(axis = this.axis): MotionInput {
    const input = { axis, jumpPressed: this.pressed, jumpReleased: this.released };
    this.pressed = false;
    this.released = false;
    return input;
  }
  clear(): void {
    this.held.clear();
    this.pressed = false;
    this.released = false;
    this.jumpHeld = false;
  }
}
