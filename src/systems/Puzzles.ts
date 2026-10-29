import { ACCESS, LAMP, clamp } from '../data/opening.ts';

export class LampPuzzle {
  x: number = LAMP.initial;
  on = true;
  alignment = 0;

  projection(playerX: number): number {
    return playerX + (playerX - this.x) * LAMP.projection;
  }
  distance(playerX: number): number {
    return Math.abs(this.projection(playerX) - LAMP.target);
  }
  move(x: number): void {
    if (Number.isFinite(x)) this.x = clamp(x, LAMP.min, LAMP.max);
  }

  update(dt: number, playerX: number, solved: boolean): boolean {
    if (solved) {
      this.alignment = 0;
      return false;
    }
    this.alignment =
      this.on && this.distance(playerX) < LAMP.tolerance
        ? Math.min(1, this.alignment + dt / LAMP.holdSeconds)
        : Math.max(0, this.alignment - dt * 2);
    return this.alignment >= 1;
  }
}

export class AccessPuzzle {
  input: number[] = [];
  time = 0;
  reset(): void {
    this.input = [];
    this.time = 0;
  }

  enter(symbol: number): 'invalid' | 'wrong' | 'progress' | 'complete' {
    if (!Number.isInteger(symbol) || symbol < 0 || symbol >= ACCESS.symbols.length)
      return 'invalid';
    if (ACCESS.sequence[this.input.length] !== symbol) {
      this.reset();
      return 'wrong';
    }
    this.input.push(symbol);
    return this.input.length === ACCESS.sequence.length ? 'complete' : 'progress';
  }
}
