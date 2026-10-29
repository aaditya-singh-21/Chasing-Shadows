import { LAMP, WORLD } from '../data/opening.ts';
import type { GameEvents, PlayerState, ShadowMode, ShadowState } from '../core/types.ts';

export class ShadowBehavior {
  state: ShadowState = { x: 520, y: WORLD.floor, mode: 'follow', timer: 0, facing: 1 };
  private lastTimer = 0;

  reset(x: number): void {
    this.state = { x: x + 90, y: WORLD.floor, mode: 'follow', timer: 0, facing: 1 };
    this.lastTimer = 0;
  }
  pose(mode: ShadowMode, x?: number): void {
    this.state.mode = mode;
    this.state.timer = 0;
    this.lastTimer = 0;
    if (x !== undefined) this.state.x = x;
  }

  update(
    dt: number,
    player: PlayerState,
    lamp: { x: number; on: boolean },
    events: GameEvents,
  ): void {
    const s = this.state;
    this.lastTimer = s.timer;
    s.timer += dt;
    if (s.mode === 'knock') {
      for (const beat of [1.2, 1.5, 2.7, 5.4, 5.8, 7.2]) {
        if (this.lastTimer < beat && s.timer >= beat)
          events.emit({ type: 'sound', value: 'knock' });
      }
    }
    const durations: Partial<Record<ShadowMode, number>> = { linger: 4, reach: 3.5, knock: 9 };
    const duration = durations[s.mode];
    if (duration !== undefined && s.timer > duration) s.mode = 'follow';
    if (s.mode !== 'follow') return;
    const nearLamp = player.x > LAMP.interactLeft && player.x < 2860 && lamp.on;
    const desired = nearLamp
      ? Math.min(player.x + (player.x - lamp.x) * LAMP.projection, 2990)
      : player.x + 100;
    s.x += (desired - s.x) * (1 - Math.exp(-dt * 7));
    s.y += (player.y - s.y) * (1 - Math.exp(-dt * 12));
    s.facing = player.facing;
  }
}
