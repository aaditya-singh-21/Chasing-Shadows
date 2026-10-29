import { MOVEMENT, clamp } from '../data/opening.ts';
import type { Facing } from '../core/types.ts';

export interface MotionInput {
  axis: number;
  jumpPressed: boolean;
  jumpReleased: boolean;
}
export interface MotionSample {
  vx: number;
  vy: number;
  grounded: boolean;
}
export interface MotionCommand {
  vx: number;
  vy: number;
  jumped: boolean;
  landed: boolean;
  facing: Facing;
}

/** Intent and jump assistance are pure; Phaser Arcade owns integration and collisions. */
export class Movement {
  private coyote = 0;
  private buffer = 0;
  private wasGrounded = true;
  private jumpReady = true;
  facing: Facing = 1;

  reset(): void {
    this.coyote = 0;
    this.buffer = 0;
    this.wasGrounded = true;
    this.jumpReady = true;
    this.facing = 1;
  }

  update(dt: number, sample: MotionSample, input: MotionInput): MotionCommand {
    const axis = clamp(input.axis, -1, 1);
    if (sample.grounded && !this.wasGrounded) this.jumpReady = true;
    this.coyote =
      sample.grounded && this.jumpReady ? MOVEMENT.coyoteSeconds : Math.max(0, this.coyote - dt);
    this.buffer = input.jumpPressed ? MOVEMENT.bufferSeconds : Math.max(0, this.buffer - dt);
    const target = axis * MOVEMENT.speed;
    const rate =
      axis === 0 && sample.grounded
        ? MOVEMENT.groundDrag
        : sample.grounded
          ? MOVEMENT.groundAcceleration
          : MOVEMENT.airAcceleration;
    const vx = sample.vx + clamp(target - sample.vx, -rate * dt, rate * dt);
    let vy = sample.vy;
    const jumped = this.buffer > 0 && this.coyote > 0 && this.jumpReady;
    if (jumped) {
      vy = -MOVEMENT.jumpSpeed;
      this.buffer = 0;
      this.coyote = 0;
      this.jumpReady = false;
    }
    if (input.jumpReleased && vy < -MOVEMENT.jumpCutSpeed) vy = -MOVEMENT.jumpCutSpeed;
    if (axis !== 0) this.facing = axis < 0 ? -1 : 1;
    const landed = sample.grounded && !this.wasGrounded && !jumped;
    this.wasGrounded = sample.grounded && !jumped;
    return { vx, vy, jumped, landed, facing: this.facing };
  }
}
