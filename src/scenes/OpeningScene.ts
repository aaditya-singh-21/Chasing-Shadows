import Phaser from 'phaser';
import type { OpeningModel } from '../core/OpeningModel.ts';
import { createWorldTextures } from '../art/WorldTextures.ts';
import { createCharacterTexture, POSE } from '../art/CharacterArt.ts';
import { Player } from '../entities/Player.ts';
import { Shadow } from '../entities/Shadow.ts';
import { GameInput } from '../systems/GameInput.ts';
import { WORLD, OBSTACLES, TRAM, SHUTTER, ACCESS, LAMP, clamp } from '../data/opening.ts';

export class OpeningScene extends Phaser.Scene {
  readonly model: OpeningModel;
  controls!: GameInput;
  private traveller!: Player;
  private silhouette!: Shadow;
  private contact!: Phaser.GameObjects.Image;
  private shutter!: Phaser.GameObjects.Image;
  private tramDoor!: Phaser.GameObjects.Image;
  private accessDoor!: Phaser.GameObjects.Image;
  private lamp!: Phaser.GameObjects.Image;
  private beam!: Phaser.GameObjects.Polygon;
  private glow!: Phaser.GameObjects.Image;
  private switchLight!: Phaser.GameObjects.Arc;
  private lampLens!: Phaser.GameObjects.Rectangle;
  private targetGlow!: Phaser.GameObjects.Image;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private gateCollider!: Phaser.GameObjects.Zone;
  private tramCollider!: Phaser.GameObjects.Zone;
  private accessCollider!: Phaser.GameObjects.Zone;
  private skylines: Phaser.GameObjects.TileSprite[] = [];
  private sky!: Phaser.GameObjects.Image;
  private moon!: Phaser.GameObjects.Arc;
  private ready = false;
  private snapCamera = true;
  private lookAhead = 110;
  onFrame: () => void = () => {};
  onReady: () => void = () => {};

  constructor(model: OpeningModel) {
    super('opening');
    this.model = model;
  }

  create(): void {
    createWorldTextures(this);
    createCharacterTexture(this);
    this.cameras.main.setOrigin(0, 0);
    this.sky = this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDepth(-100);
    this.moon = this.add.circle(0, 185, 29, 0xbdcab7, 0.13).setScrollFactor(0).setDepth(-95);
    for (let layer = 0; layer < 3; layer++)
      this.skylines.push(
        this.add
          .tileSprite(0, 0, 2048, 900, `skyline-${layer}`)
          .setOrigin(0)
          .setScrollFactor(0)
          .setDepth(-90 + layer),
      );
    for (let x = 0; x < WORLD.width; x += 1024)
      this.add.image(x, 0, `street-${x}`).setOrigin(0).setDepth(0);
    this.shutter = this.add.image(SHUTTER.x, SHUTTER.y, 'shutter').setOrigin(0).setDepth(3);
    this.tramDoor = this.add.image(1039, 415, 'tram-door').setOrigin(0).setDepth(3);
    this.accessDoor = this.add.image(5180, 524, 'access-door').setOrigin(0).setDepth(3);
    this.lamp = this.add
      .image(LAMP.initial - 35, 546, 'lamp')
      .setOrigin(0)
      .setDepth(12);
    this.beam = this.add
      .polygon(
        0,
        0,
        [LAMP.initial + 25, 574, 2870, 330, 2870, 700, LAMP.initial + 25, 606],
        0xe4cb7d,
        0.07,
      )
      .setOrigin(0)
      .setDepth(6);
    this.glow = this.add
      .image(LAMP.initial + 30, 587, 'light-glow')
      .setScale(1.4)
      .setDepth(7);
    this.switchLight = this.add.circle(LAMP.initial - 8, 586, 3, 0xe4ce95, 0.8).setDepth(14);
    this.lampLens = this.add.rectangle(LAMP.initial + 15, 586, 12, 30, 0xe5d7a7).setDepth(13);
    this.targetGlow = this.add
      .image(LAMP.target + 72, 563, 'light-glow')
      .setScale(0.4)
      .setDepth(8);
    this.contact = this.add.image(WORLD.startX, WORLD.floor + 3, 'contact').setDepth(14);
    this.silhouette = new Shadow(this);
    this.traveller = new Player(this);
    this.makeColliders();
    this.particles = this.add
      .particles(0, 0, 'mote', {
        x: { min: 0, max: WORLD.width },
        y: { min: 200, max: 680 },
        lifespan: 16000,
        speedX: { min: 2, max: 10 },
        speedY: { min: -2, max: 2 },
        frequency: 230,
        alpha: { start: 0.13, end: 0 },
        scale: { start: 0.6, end: 0.2 },
        maxParticles: 65,
      })
      .setDepth(25);
    // A small foreground layer adds depth without repainting the world every frame.
    for (const x of [1190, 3028, 5340]) {
      this.add.rectangle(x, 470, 14, 503, 0x102b31).setDepth(30);
      this.add.rectangle(x, 706, 34, 33, 0x122b31).setDepth(30);
    }
    this.controls = new GameInput(this, this.model);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.model.paused || this.model.mode !== 'walk' || this.model.inTitle) return;
      const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      if (point.y > 560) this.model.walkTarget = clamp(point.x, WORLD.minX, WORLD.maxX);
    });
    const remove = this.model.events.on((event) => {
      if (event.type === 'start') {
        this.traveller.resetAt(this.model.player);
        this.snapCamera = true;
        this.controls.clear();
      }
      if (event.type === 'puzzle') {
        this.controls.clear();
        this.traveller.body.setVelocityX(0);
      }
    });
    this.events.once('shutdown', remove);
    this.scale.on('resize', this.resizeWorld, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.resizeWorld, this));
    this.ready = true;
    this.resizeWorld();
    this.onReady();
  }

  private staticBody(x: number, y: number, width: number, height: number): Phaser.GameObjects.Zone {
    const object = this.add.zone(x, y, width, height);
    this.physics.add.existing(object, true);
    this.physics.add.collider(this.traveller, object);
    return object;
  }

  private makeColliders(): void {
    this.physics.world.setBounds(WORLD.minX - 14, -350, WORLD.maxX - WORLD.minX + 28, 1500);
    this.staticBody(WORLD.width / 2, WORLD.floor + 40, WORLD.width, 80);
    for (const obstacle of OBSTACLES)
      this.staticBody(
        (obstacle.left + obstacle.right) / 2,
        (obstacle.top + WORLD.floor) / 2,
        obstacle.right - obstacle.left,
        WORLD.floor - obstacle.top,
      );
    this.tramCollider = this.staticBody(
      TRAM.bodyX,
      (TRAM.top + TRAM.bottom) / 2,
      TRAM.width,
      TRAM.bottom - TRAM.top,
    );
    this.gateCollider = this.staticBody(
      SHUTTER.x + SHUTTER.width / 2,
      SHUTTER.y + SHUTTER.height / 2,
      SHUTTER.width,
      SHUTTER.height,
    );
    this.accessCollider = this.staticBody(
      ACCESS.doorX,
      ACCESS.top + ACCESS.height / 2,
      ACCESS.width,
      ACCESS.height,
    );
  }

  private resizeWorld(): void {
    if (!this.ready) return;
    let zoom = this.scale.height / 900;
    if (this.scale.width / this.scale.height < 0.85) zoom *= 0.7;
    this.cameras.main.setZoom(zoom);
    const width = this.scale.width / zoom,
      height = this.scale.height / zoom;
    this.sky.setDisplaySize(width, height);
    this.moon.setPosition(width * 0.78, 185);
    for (const layer of this.skylines) layer.setSize(width, 900).setY(height * 0.778 - WORLD.floor);
    this.snapCamera = true;
  }

  update(_time: number, delta: number): void {
    if (!this.ready) return;
    const dt = Math.min(delta / 1000, 0.04),
      model = this.model;
    const active = model.started && !model.paused && !model.inTitle;
    const physicsActive = active && (model.mode === 'walk' || model.mode === 'approach-lamp');
    if (physicsActive) {
      this.physics.world.resume();
      this.traveller.body.enable = true;
      let axis = this.controls.axis;
      if (axis !== 0 && model.mode === 'walk') model.walkTarget = null;
      if (model.walkTarget !== null && (axis === 0 || model.mode === 'approach-lamp')) {
        const distance = model.walkTarget - this.traveller.x;
        axis = Math.abs(distance) < 7 ? 0 : Math.sign(distance);
        if (axis === 0) {
          model.walkTarget = null;
          this.traveller.body.setVelocityX(0);
        }
      }
      this.traveller.drive(dt, this.controls.consume(axis), model.events, model.time);
      model.player = this.traveller.sample();
    } else {
      this.physics.world.pause();
      if (active) this.traveller.body.setVelocity(0, 0);
    }
    if (active) model.update(dt, model.mode === 'lamp' ? this.controls.axis : 0);
    if (model.inTitle) {
      this.traveller.body.enable = false;
      this.traveller.setPosition(3980, WORLD.floor).setFlipX(false);
      this.traveller.play('traveller-idle', true);
      this.traveller.anims.timeScale = 1;
      this.silhouette
        .setPosition(4150, WORLD.floor)
        .setFrame(POSE.look)
        .setScale(1.55)
        .setAlpha(0.79)
        .setFlipX(true);
      this.silhouette.anims.stop();
    } else {
      this.silhouette.present(model);
      if (active && !physicsActive) {
        this.traveller.play('traveller-idle', true);
        this.traveller.anims.timeScale = 1;
      }
    }
    if (model.paused && !model.inTitle) {
      this.traveller.anims.pause();
      this.silhouette.anims.pause();
    } else {
      this.traveller.anims.resume();
      this.silhouette.anims.resume();
      // Reduce ambient breathing, not the essential walking and gesture feedback.
      if (model.reducedMotion) {
        if (this.traveller.anims.currentAnim?.key === 'traveller-idle')
          this.traveller.anims.pause();
        if (this.silhouette.anims.currentAnim?.key === 'traveller-idle')
          this.silhouette.anims.pause();
      }
    }
    this.presentMechanisms();
    this.updateCamera(dt);
    this.onFrame();
  }

  private presentMechanisms(): void {
    const m = this.model;
    this.tramDoor.setVisible(!m.flags.doorOpen);
    (this.tramCollider.body as Phaser.Physics.Arcade.StaticBody).enable = !m.flags.doorOpen;
    this.shutter.setCrop(0, 0, SHUTTER.width, SHUTTER.height - m.gateAmount * SHUTTER.lift);
    (this.gateCollider.body as Phaser.Physics.Arcade.StaticBody).enable =
      m.gateAmount < SHUTTER.clearAt;
    this.accessDoor.setVisible(!m.flags.panelOpen);
    (this.accessCollider.body as Phaser.Physics.Arcade.StaticBody).enable = !m.flags.panelOpen;
    this.lamp.setX(m.lamp.x - 35);
    this.switchLight
      .setPosition(m.lamp.x - 8, 586)
      .setFillStyle(m.lamp.on ? 0xe4ce95 : 0x596663, 0.8);
    this.lampLens.setPosition(m.lamp.x + 15, 586).setFillStyle(m.lamp.on ? 0xe5d7a7 : 0x283e3d);
    this.beam.setVisible(m.lamp.on);
    this.glow.setPosition(m.lamp.x + 30, 587).setVisible(m.lamp.on);
    // Updating the polygon changes the projection without redrawing any environment textures.
    this.beam.setTo([m.lamp.x + 25, 574, 2870, 330, 2870, 700, m.lamp.x + 25, 606]);
    this.targetGlow.setVisible(
      m.mode === 'lamp' && m.lamp.on && m.lamp.distance(m.player.x) < LAMP.tolerance,
    );
    this.contact
      .setPosition(this.traveller.x, WORLD.floor + 3)
      .setAlpha(this.traveller.y < WORLD.floor - 5 ? 0.45 : 1);
    this.particles.setVisible(!m.reducedMotion);
    this.particles.setActive(!m.reducedMotion && (!m.paused || m.inTitle));
    this.particles.emitting = !m.reducedMotion && (!m.paused || m.inTitle);
  }

  private updateCamera(dt: number): void {
    const camera = this.cameras.main,
      model = this.model;
    const width = this.scale.width / camera.zoom,
      height = this.scale.height / camera.zoom;
    this.lookAhead += (model.player.facing * 85 + 25 - this.lookAhead) * (1 - Math.exp(-dt * 3));
    const focus = model.inTitle
      ? 3980
      : model.mode === 'lamp'
        ? 2570
        : model.mode === 'panel'
          ? 5180
          : this.traveller.x + this.lookAhead;
    const titleAnchor = this.scale.width / this.scale.height < 0.85 ? 0.5 : 0.72;
    const desired = clamp(
      focus - width * (model.inTitle ? titleAnchor : 0.46),
      0,
      Math.max(0, WORLD.width - width),
    );
    camera.scrollX = this.snapCamera
      ? desired
      : camera.scrollX +
        (desired - camera.scrollX) * (1 - Math.exp(-dt * (model.reducedMotion ? 18 : 4)));
    camera.scrollY = WORLD.floor - height * 0.778;
    for (const [index, layer] of this.skylines.entries())
      layer.tilePositionX = camera.scrollX * [0.12, 0.24, 0.4][index]!;
    this.snapCamera = false;
  }

  clearInput(): void {
    this.controls?.clear();
    this.model.walkTarget = null;
    if (this.model.mode === 'approach-lamp') this.model.mode = 'walk';
  }
}
