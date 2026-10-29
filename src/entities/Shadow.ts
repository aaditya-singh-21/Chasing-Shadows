import Phaser from 'phaser';
import { CHARACTER, POSE } from '../art/CharacterArt.ts';
import { ACCESS, LAMP, WORLD } from '../data/opening.ts';
import type { OpeningModel } from '../core/OpeningModel.ts';

export class Shadow extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 520, WORLD.floor, 'traveller', POSE.idle);
    scene.add.existing(this);
    this.setOrigin(0.5, CHARACTER.footY / CHARACTER.height)
      .setTint(0x07131c)
      .setTintMode(Phaser.TintModes.FILL)
      .setAlpha(0.79)
      .setScale(1.55)
      .setDepth(15);
  }

  present(model: OpeningModel): void {
    const s = model.shadow.state,
      p = model.player;
    this.setPosition(s.x, s.y);
    this.setFlipX(s.facing < 0);
    const projecting = s.mode === 'project' || s.mode === 'reach';
    this.setScale(projecting ? 1.72 : 1.55);
    this.setAlpha(s.mode === 'project' && !model.lamp.on ? 0.08 : 0.79);
    if (projecting) {
      this.anims.stop();
      this.setFlipX(false);
      this.setFrame(
        model.lamp.on && (model.lamp.distance(p.x) < 55 || s.mode === 'reach')
          ? POSE.reach
          : POSE.look,
      );
    } else if (s.mode === 'linger') {
      this.anims.stop();
      this.setFrame(POSE.look);
      this.setFlipX(true);
    } else if (s.mode === 'knock') {
      const tapping = [1.2, 1.5, 2.7, 5.4, 5.8, 7.2].some(
        (beat) => Math.abs(s.timer - beat) < 0.12,
      );
      this.anims.stop();
      this.setFrame(tapping ? POSE.tap : POSE.knock);
      this.setFlipX(false);
    } else if (s.mode === 'code') {
      const symbol = ACCESS.sequence[Math.floor(model.access.time / ACCESS.beatSeconds) % 7];
      this.anims.stop();
      this.setFrame(symbol === undefined ? POSE.look : POSE.circle + symbol);
      this.setFlipX(false);
    } else if (!p.grounded) {
      this.anims.stop();
      this.setFrame(p.vy < 0 ? POSE.rise : POSE.fall);
    } else if (Math.abs(p.vx) > 15) {
      this.play('traveller-walk', true);
      this.anims.timeScale = Math.max(0.35, Math.abs(p.vx) / 245);
    } else {
      this.play('traveller-idle', true);
      this.anims.timeScale = 1;
    }
    // Keep a projected silhouette in the authored station wall region.
    if (s.mode === 'project') this.x = Math.min(LAMP.target + 300, this.x);
  }
}
