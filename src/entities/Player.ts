import Phaser from 'phaser';
import { CHARACTER, POSE } from '../art/CharacterArt.ts';
import { MOVEMENT, WORLD } from '../data/opening.ts';
import { Movement } from '../systems/Movement.ts';
import type { MotionInput } from '../systems/Movement.ts';
import type { GameEvents, PlayerState } from '../core/types.ts';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private motion = new Movement();
  private landing = 0;
  private lastFootstep = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, WORLD.startX, WORLD.floor, 'traveller', POSE.idle);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, CHARACTER.footY / CHARACTER.height).setDepth(20);
    this.body.setSize(28, 120).setOffset(50, 44);
    this.body.setMaxVelocity(MOVEMENT.speed, MOVEMENT.maxFallSpeed).setCollideWorldBounds(true);
  }

  resetAt(state: PlayerState): void {
    this.body.enable = true;
    this.body.reset(state.x, state.y);
    this.body.setVelocity(0, 0);
    this.motion.reset();
    this.landing = 0;
    this.lastFootstep = 0;
    this.setFlipX(false);
  }

  drive(dt: number, input: MotionInput, events: GameEvents, time: number): void {
    const grounded = this.body.blocked.down || this.body.touching.down;
    const command = this.motion.update(
      dt,
      { vx: this.body.velocity.x, vy: this.body.velocity.y, grounded },
      input,
    );
    this.body.setVelocity(command.vx, command.vy);
    this.setFlipX(command.facing < 0);
    this.landing = Math.max(0, this.landing - dt);
    if (command.jumped) events.emit({ type: 'sound', value: 'jump' });
    if (command.landed) {
      this.landing = 0.11;
      events.emit({ type: 'sound', value: 'land' });
    }
    if (grounded && Math.abs(command.vx) > 65 && time - this.lastFootstep > 0.34) {
      this.lastFootstep = time;
      events.emit({ type: 'sound', value: 'step' });
    }
    this.animate(grounded, command.vx, command.vy);
  }

  private animate(grounded: boolean, vx: number, vy: number): void {
    if (!grounded) {
      this.anims.stop();
      this.setFrame(vy < -30 ? POSE.rise : POSE.fall);
    } else if (this.landing > 0) {
      this.anims.stop();
      this.setFrame(POSE.land);
    } else if (Math.abs(vx) > 15) {
      this.play('traveller-walk', true);
      this.anims.timeScale = Math.max(0.35, Math.abs(vx) / MOVEMENT.speed);
    } else {
      this.play('traveller-idle', true);
      this.anims.timeScale = 1;
    }
  }

  sample(): PlayerState {
    return {
      x: this.x,
      y: this.y,
      vx: this.body.velocity.x,
      vy: this.body.velocity.y,
      grounded: this.body.blocked.down || this.body.touching.down,
      facing: this.motion.facing,
    };
  }
}
