import type Phaser from 'phaser';
import { EnvironmentArt } from './EnvironmentArt.ts';
import { WORLD, SHUTTER } from '../data/opening.ts';

export function makeTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  paint: (art: EnvironmentArt) => void,
): void {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) throw new Error(`Could not create the ${key} texture.`);
  paint(new EnvironmentArt(texture.context));
  texture.refresh();
}

export function createWorldTextures(scene: Phaser.Scene): void {
  const chunk = 1024;
  for (let x = 0; x < WORLD.width; x += chunk) {
    const width = Math.min(chunk, WORLD.width - x);
    makeTexture(scene, `street-${x}`, width, 920, (art) => {
      art.ctx.translate(-x, 0);
      art.distantStreet();
      art.platform();
      art.tram();
      art.buildings();
      art.maintenance();
      art.ground();
      art.stationLights();
    });
  }
  makeTexture(scene, 'shutter', SHUTTER.width, SHUTTER.height, (a) => {
    a.rect(0, 0, SHUTTER.width, SHUTTER.height, '#43544d');
    for (let y = 6; y < SHUTTER.height; y += 14) {
      a.line(0, y, SHUTTER.width, y, '#132e354d', 3);
      a.line(0, y + 3, SHUTTER.width, y + 3, '#a3a48725');
    }
    a.rect(13, SHUTTER.height - 19, 120, 10, '#1c3638', '#8d957577');
  });
  makeTexture(scene, 'tram-door', 82, 271, (a) => {
    a.rect(0, 0, 82, 271, '#4c6054', '#a6aa8166');
    a.round(8, 14, 65, 134, 9, '#2a4144', '#7e957266');
    a.line(41, 0, 41, 271, '#1c373b', 3);
    a.rect(32, 171, 4, 35, '#b4b08a');
    a.rect(48, 171, 4, 35, '#b4b08a');
  });
  makeTexture(scene, 'access-door', 116, 176, (a) => {
    a.rect(0, 0, 116, 176, '#354e43', '#718b69');
    a.rect(9, 8, 98, 52, '#19373b', '#a7ac7e44');
    for (let x = 25; x < 106; x += 20) a.line(x, 10, x, 58, '#718b6955', 2);
    a.rect(100, 94, 8, 25, '#aea87d');
  });
  makeTexture(scene, 'lamp', 110, 160, (a) => {
    const x = 35;
    a.ellipse(x, 148, 24, 5, '#15292e');
    a.line(x, 146, x, 59, '#1e3338', 7);
    a.line(x, 143, x - 23, 153, '#273f3e', 4);
    a.line(x, 143, x + 23, 153, '#273f3e', 4);
    a.round(x - 21, 19, 42, 45, 6, '#293e3d', '#b3ac7e');
    a.rect(x + 9, 25, 12, 30, '#e5d7a7');
    a.path(
      [
        [x + 23, 24],
        [x + 35, 15],
        [x + 35, 69],
        [x + 23, 60],
      ],
      '#43554a',
      '#8b9877',
    );
    a.ellipse(x - 8, 40, 4, 4, '#a1966a');
  });
  makeTexture(scene, 'light-glow', 256, 256, (a) => a.glow(128, 128, 128, '225,197,125', 0.25));
  makeTexture(scene, 'contact', 96, 24, (a) => a.ellipse(48, 12, 44, 6, '#06131e70'));
  makeTexture(scene, 'mote', 8, 8, (a) => a.ellipse(4, 4, 2, 2, '#d1d9b8aa'));
  makeTexture(scene, 'sky', 32, 900, (a) => {
    const gradient = a.ctx.createLinearGradient(0, 0, 0, 900);
    gradient.addColorStop(0, '#172936');
    gradient.addColorStop(0.45, '#4d6566');
    gradient.addColorStop(0.75, '#667e72');
    gradient.addColorStop(1, '#1c3439');
    a.rect(0, 0, 32, 900, gradient);
  });
  for (let layer = 0; layer < 3; layer++) {
    makeTexture(scene, `skyline-${layer}`, 2048, 900, (a) => {
      const random = (n: number): number => {
        const s = Math.sin(n * 17.13 + layer * 133) * 3471;
        return s - Math.floor(s);
      };
      const base = 603 + layer * 20,
        fill = ['#435c5e', '#334f53', '#263f47'][layer]!;
      for (let i = 0; i < 16; i++) {
        const x = i * 128,
          width = 105 + random(i) * 23,
          height = 110 + random(i + 10) * (210 + layer * 30);
        a.rect(x, base - height, width, height, fill);
        a.rect(x - 3, base - height - 7, width + 6, 8, fill);
        if (random(i + 19) > 0.5)
          a.path(
            [
              [x + 20, base - height - 7],
              [x + width / 2, base - height - 40],
              [x + width - 20, base - height - 7],
            ],
            fill,
          );
        for (let row = 0; row < Math.floor(height / 37) - 1; row++)
          for (let col = 0; col < 3; col++)
            a.rect(x + 15 + col * 30, base - height + 25 + row * 37, 11, 17, '#142e373b');
        if (random(i + 2) > 0.6) {
          a.line(x + 20, base - height - 9, x + 20, base - height - 65, fill, 2);
          a.line(x, base - height - 47, x + 40, base - height - 47, fill, 2);
        }
      }
    });
  }
}
