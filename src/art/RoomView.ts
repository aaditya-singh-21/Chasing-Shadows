import Phaser from 'phaser';
import type { ChapterModel } from '../core/ChapterModel.ts';
import { ROOMS, LOWER_STEPS, SERVICE_OBSTACLES } from '../data/rooms.ts';
import { createDanielRest, createEmployeeTexture } from './ChapterDetails.ts';
import { createDanielTexture } from './CharacterArt.ts';
import { POSE } from './CharacterArt.ts';

export class RoomView {
  private water: Phaser.GameObjects.Rectangle;
  private trolley: Phaser.GameObjects.Container;
  private veil: Phaser.GameObjects.Rectangle;
  private daniel: Phaser.GameObjects.Sprite;
  private memoryThomas: Phaser.GameObjects.Sprite;
  private bag: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private model: ChapterModel;
  constructor(scene: Phaser.Scene, model: ChapterModel) {
    createDanielRest(scene);
    createDanielTexture(scene);
    createEmployeeTexture(scene);
    this.scene = scene;
    this.model = model;
    const room = ROOMS[model.room],
      f = room.floor;
    scene.cameras.main.setBackgroundColor('#15292e');
    const rect = (x: number, y: number, w: number, h: number, c: number) =>
      scene.add.rectangle(x, y, w, h, c).setOrigin(0);
    rect(0, f - 620, room.width, 620, 0x354743);
    for (let x = 0; x < room.width; x += 220) {
      rect(x, f - 600, 12, 600, 0x263b39);
      rect(x + 24, f - 470, 158, 210, 0x203637);
      rect(x + 28, f - 466, 150, 4, 0x788274);
    }
    rect(0, f, room.width, 90, 0x1d3030);
    rect(0, f, room.width, 5, 0x979579);
    const label = (x: number, y: number, text: string, size = 18) =>
      scene.add.text(x, y, text, {
        fontFamily: 'Georgia',
        fontSize: size,
        color: '#d3c9a6',
        lineSpacing: 8,
      });

    for (const door of room.doors) {
      const y = model.room === 'shelter-lower' && door.x > 1000 ? 880 : f;
      rect(door.x - 38, y - 205, 76, 205, 0x102b30);
      rect(door.x - 45, y - 212, 90, 8, 0x999174);
      rect(door.x + 20, y - 100, 5, 24, 0xc8b47d);
      label(
        door.x - 65,
        y - 250,
        door.to === 'street' ? 'MERCER ST.' : door.to === 'shelter-rest' ? 'REST ROOM' : 'PASSAGE',
        12,
      );
    }
    if (model.room === 'workshop') {
      scene.add.image(490, f - 240, 'employee-award').setDisplaySize(240, 252);
      label(375, f - 390, 'Read the portrait · E', 15);
      rect(650, f - 200, 180, 95, 0x8c876e);
      label(665, f - 180, 'STAFF · 07', 14);
      for (let i = 0; i < 4; i++) {
        scene.add
          .sprite(680 + i * 37, f - 122, 'traveller', POSE.idle)
          .setScale(0.28)
          .setTint(i === 1 ? 0xbaa689 : 0x718b82);
      }
      rect(900, f - 90, 220, 12, 0x817963);
      rect(920, f - 78, 12, 78, 0x403e35);
      rect(1080, f - 78, 12, 78, 0x403e35);
      label(925, f - 190, 'Thomas + Daniel', 16);
      rect(925, f - 170, 130, 70, 0x9b967c);
      scene.add.sprite(950, f - 133, 'traveller', POSE.idle).setScale(0.28);
      scene.add
        .sprite(1020, f - 133, 'traveller', POSE.look)
        .setScale(0.25)
        .setTint(0x9bafa2);
      rect(1220, f - 180, 65, 90, 0x697968);
      label(1170, f - 230, 'SERVICE POWER', 14);
    }
    if (model.room === 'shelter-hall') {
      for (let x = 400; x < 1500; x += 350) {
        rect(x, f - 45, 220, 12, 0x777861);
        rect(x + 15, f - 33, 10, 33, 0x323b33);
      }
      rect(690, f - 370, 130, 5, 0xd6c694);
      scene.add.circle(755, f - 220, 150, 0xe6ce8d, 0.045);
      label(700, f - 160, 'A quiet place\nto look again.', 16);
    }
    if (model.room === 'courtyard') {
      rect(700, f - 120, 28, 120, 0x697e73);
      rect(690, f - 130, 70, 12, 0x9c9b7b);
      label(710, f - 190, 'T / 07', 16);
    }
    if (model.room === 'service-passage') {
      for (const x of SERVICE_OBSTACLES) {
        rect(x - 35, f - 40, 70, 40, 0x80775b);
        rect(x - 35, f - 40, 70, 3, 0xc2af7f);
      }
      rect(0, f - 15, 2440, 5, 0xa49a7a);
      rect(2420, f - 80, 25, 80, 0x9e8b60);
      label(2480, f - 320, 'SHELTER →', 20);
    }
    if (model.room === 'shelter-lower') {
      for (const { left, top } of LOWER_STEPS) {
        rect(left, top, room.width - left, 1300 - top, 0x53645c);
        rect(left, top, room.width - left, 4, 0xb0ab88);
      }
      rect(200, f - 390, 1700, 22, 0x6f8073);
      label(350, f - 450, 'DAMAGED MAIN · UPPER EXIT →', 18);
    }
    this.trolley = scene.add
      .container(80, f - 120, [
        scene.add.rectangle(0, 0, 220, 240, 0x535a4a),
        scene.add.rectangle(0, -80, 190, 60, 0x786f55),
        scene.add.circle(-70, 110, 22, 0x101f22),
        scene.add.circle(70, 110, 22, 0x101f22),
      ])
      .setDepth(18);
    this.trolley.setVisible(model.room === 'service-passage');
    this.water = rect(0, 1430, room.width, 600, 0x427775)
      .setAlpha(0.85)
      .setDepth(22)
      .setVisible(model.room === 'shelter-lower');
    this.daniel = scene.add
      .sprite(950, f, 'daniel', POSE.idle)
      .setOrigin(0.5, 164 / 176)
      .setScale(1)
      .setDepth(19);
    this.memoryThomas = scene.add
      .sprite(700, f, 'traveller', POSE.reach)
      .setOrigin(0.5, 164 / 176)
      .setDepth(20)
      .setVisible(false);
    this.daniel.setVisible(false);
    this.bag = scene.add
      .container(770, f - 45, [
        scene.add.rectangle(0, 0, 44, 32, 0x706348),
        scene.add.rectangle(0, -18, 18, 4, 0xb7a37c),
        scene.add.rectangle(-12, 0, 3, 32, 0xaa9975),
        scene.add.rectangle(12, 0, 3, 32, 0xaa9975),
      ])
      .setDepth(21)
      .setVisible(false);
    if (model.room === 'shelter-rest') {
      rect(835, f - 45, 280, 12, 0x535c55);
      rect(850, f - 33, 10, 33, 0x46564f);
      rect(1080, f - 33, 10, 33, 0x46564f);
      scene.add.image(980, f - 75, 'daniel-rest').setDepth(19);
      this.daniel.setVisible(false);
      label(860, f - 290, 'REST ROOM · 02', 17);
    }
    this.veil = rect(0, 0, scene.scale.width, scene.scale.height, 0x000000)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);
  }
  update(): void {
    const m = this.model;
    this.trolley.x = m.marks.has('trolley') ? 2400 : m.trolleyX;
    this.water.y = m.marks.has('flood') ? 930 : m.waterY;
    this.water.setVisible(
      m.room === 'shelter-lower' && (m.hazardTime > 2.5 || m.marks.has('flood')),
    );
    const memory = m.sequence === 'memory';
    this.memoryThomas.setVisible(memory);
    this.bag.setVisible(memory);
    if (m.room === 'shelter-hall') {
      const t = m.sequenceTime;
      const fade = memory ? Math.min(1, t / 1.5, (18 - t) / 2) : 0;
      const walking = t > 12 && t < 16;
      this.daniel
        .setVisible(memory)
        .setPosition(850 + Math.max(0, Math.min(4, t - 12)) * 22, 700)
        .setAngle(0)
        .setFlipX(t < 11)
        .setAlpha(fade)
        .setFrame(walking ? Math.floor(t * 9) % 8 : t < 7 ? POSE.look : POSE.reach);
      this.memoryThomas
        .setPosition(700, 700)
        .setAlpha(fade)
        .setFrame(
          t < 7
            ? Math.floor(t * 2) % 2
              ? POSE.reach
              : POSE.land
            : t < 12
              ? POSE.reach
              : POSE.look,
        );
      const pull = Math.max(0, Math.min(1, (t - 8) / 3));
      this.bag
        .setPosition(748 + pull * 90 + Math.max(0, Math.min(4, t - 12)) * 22, 650 + pull * 8)
        .setAlpha(fade);
      this.bag.setAngle(t > 8 && t < 12 ? Math.sin(t * 3) * 4 : 0);
    }
    this.veil
      .setSize(this.scene.scale.width, this.scene.scale.height)
      .setAlpha(m.sequence === 'death' ? 0.25 : memory ? 0.12 : 0)
      .setFillStyle(memory ? 0xa58b55 : 0x000000);
  }
}
