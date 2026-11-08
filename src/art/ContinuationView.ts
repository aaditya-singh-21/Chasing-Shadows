import Phaser from 'phaser';
import type { ChapterModel } from '../core/ChapterModel.ts';

/** Disposable room illustration; no gameplay clocks or progression live here. */
export class ContinuationView {
  private blanket: Phaser.GameObjects.Rectangle | null = null;
  private readonly model: ChapterModel;
  constructor(scene: Phaser.Scene, model: ChapterModel) {
    this.model = model;
    const rect = (x: number, y: number, w: number, h: number, color: number) =>
      scene.add.rectangle(x, y, w, h, color).setOrigin(0).setDepth(8);
    const text = (x: number, y: number, copy: string, size = 20) =>
      scene.add
        .text(x, y, copy, {
          fontFamily: 'Georgia',
          fontSize: size,
          color: '#d3c9a6',
          lineSpacing: 8,
        })
        .setDepth(9);
    if (model.room === 'shelter-rest') {
      this.blanket = rect(855, 600, 252, 64, 0x737a67).setDepth(20).setVisible(false);
      text(1220, 395, 'UPPER EXIT\nRESIDENTIAL LANE', 16);
    }
    if (model.room !== 'residential-lane') return;
    rect(0, 60, 1900, 420, 0x223c44);
    for (let x = 300; x < 1900; x += 350) {
      rect(x, 180, 270, 360, 0x46544a);
      scene.add.triangle(x + 135, 150, 0, 100, 135, 0, 270, 100, 0x243b3b).setDepth(9);
      for (const y of [255, 370]) {
        rect(x + 35, y, 60, 80, 0x172e33);
        rect(x + 165, y, 60, 80, 0x172e33);
        rect(x + 32, y + 80, 68, 5, 0x83866e);
      }
    }
    text(1395, 235, '14', 30);
    text(1220, 330, 'MERCER STREET\nREAR OF THE BLOCK', 15);
    rect(0, 560, 1900, 140, 0x48564b);
    rect(0, 554, 1900, 9, 0x92917a);
    // A shallow store alcove remains on the walking floor: no hidden collision geometry.
    rect(680, 480, 360, 220, 0x1d3537);
    text(720, 430, 'CYCLE STORE', 18);
    for (const x of [760, 920])
      scene.add.circle(x, 660, 33).setStrokeStyle(5, 0x9b9e84).setDepth(9);
    scene.add.line(0, 0, 760, 660, 850, 600, 0x9b9e84).setOrigin(0).setLineWidth(4).setDepth(9);
    scene.add.line(0, 0, 850, 600, 920, 660, 0x9b9e84).setOrigin(0).setLineWidth(4).setDepth(9);
    rect(875, 584, 75, 10, 0x95876b);
    text(910, 545, 'THOMAS\nMAINTENANCE', 12);
    text(1560, 475, 'NO. 14 →\nLook toward home · E', 19);
    text(50, 390, 'SHELTER\nUPPER EXIT', 16);
  }
  update(): void {
    if (!this.blanket) return;
    const m = this.model;
    const progress = m.marks.has('farewell')
      ? 1
      : m.sequence === 'farewell'
        ? Math.min(1, m.sequenceTime / 4)
        : 0;
    this.blanket.setVisible(progress > 0).setDisplaySize(252 * progress, 64);
  }
}
