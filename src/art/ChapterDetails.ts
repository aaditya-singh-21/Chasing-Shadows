import type Phaser from 'phaser';
import { drawTraveller, POSE } from './CharacterArt.ts';
import { Painter } from './Painter.ts';

/** A horizontal resting pose, painted as anatomy rather than a rotated standing sprite. */
export function createDanielRest(scene: Phaser.Scene): void {
  if (scene.textures.exists('daniel-rest')) return;
  const texture = scene.textures.createCanvas('daniel-rest', 300, 180);
  if (!texture) throw new Error('Could not paint Daniel.');
  const a = new Painter(texture.context);
  a.ellipse(150, 132, 126, 10, '#10242766');
  // Folded blanket, mattress compression, and a pillow supporting his head.
  a.round(20, 110, 260, 24, 9, '#777c6a', '#a1a18b');
  a.path(
    [
      [25, 120],
      [85, 119],
      [112, 128],
      [170, 122],
      [230, 127],
      [275, 120],
      [273, 137],
      [25, 137],
    ],
    '#515e54',
  );
  a.round(227, 94, 55, 25, 10, '#a5a28a');
  a.line(234, 110, 273, 114, '#777b68', 2);
  // Boots and naturally bent legs.
  a.path(
    [
      [126, 104],
      [87, 108],
      [52, 115],
    ],
    null,
    '#293e40',
    14,
  );
  a.path(
    [
      [130, 113],
      [93, 120],
      [54, 120],
    ],
    null,
    '#35494a',
    13,
  );
  a.round(31, 108, 29, 13, 4, '#172e34');
  a.round(31, 117, 31, 13, 4, '#1b3037');
  // An open brown jacket and shirt; Daniel has his own palette and silhouette.
  a.path(
    [
      [119, 97],
      [153, 85],
      [194, 91],
      [220, 105],
      [203, 121],
      [160, 119],
      [128, 123],
    ],
    '#726555',
    '#9c8d72',
  );
  a.path(
    [
      [165, 91],
      [196, 94],
      [208, 107],
      [192, 114],
      [165, 109],
    ],
    '#9c9b82',
  );
  a.line(152, 93, 159, 117, '#443f37', 2);
  a.path(
    [
      [180, 96],
      [164, 109],
      [178, 123],
    ],
    null,
    '#867a62',
    10,
  );
  a.ellipse(180, 123, 6, 4, '#b1ab94');
  // One slack forearm falls over the mattress edge.
  a.path(
    [
      [202, 106],
      [210, 124],
      [202, 150],
    ],
    null,
    '#6c6252',
    10,
  );
  a.ellipse(201, 153, 5, 7, '#ada48f');
  a.line(199, 153, 197, 161, '#ada48f', 2);
  a.round(212, 95, 20, 17, 5, '#b5ac95');
  a.ellipse(241, 97, 18, 13, '#b9ae98');
  a.path(
    [
      [224, 95],
      [226, 83],
      [239, 79],
      [254, 85],
      [258, 95],
      [251, 93],
      [243, 87],
      [231, 93],
    ],
    '#303b39',
  );
  a.line(247, 97, 253, 99, '#53564c', 1.5);
  a.line(251, 106, 255, 105, '#83796a', 1);
  // Dried blood grounds the fatal injury without graphic wounds.
  a.path(
    [
      [177, 97],
      [190, 95],
      [201, 102],
      [195, 113],
      [181, 110],
      [174, 104],
    ],
    '#633b36',
  );
  a.ellipse(192, 125, 14, 5, '#683f37');
  a.ellipse(214, 132, 8, 3, '#6b4138');
  a.line(192, 114, 194, 129, '#774a3e', 2);
  a.line(63, 127, 112, 129, '#a1a38b55', 1);
  texture.refresh();
}

export function employeePortraitSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="#243d3b"/><rect x="14" y="14" width="572" height="372" fill="#b5ac8b" stroke="#776c50" stroke-width="8"/><text x="300" y="52" text-anchor="middle" fill="#293b35" font-family="Georgia" font-size="21">CITY TRANSIT AUTHORITY</text><text x="300" y="85" text-anchor="middle" fill="#534b37" font-family="Georgia" font-size="24">EMPLOYEE OF THE MONTH</text><rect x="210" y="103" width="180" height="195" fill="#5a7068"/><path d="M236 298l9-83 31-24h46l32 24 12 83" fill="#4e6360" stroke="#9ba78b" stroke-width="3"/><path d="M275 193l25 20 25-21-4 31-24 5-26-12z" fill="#ac8c60"/><path d="M293 216l-7 48 13-7 7-39" fill="#ac8c60"/><rect x="287" y="180" width="24" height="25" rx="5" fill="#c3b9a0"/><ellipse cx="301" cy="157" rx="27" ry="35" fill="#c3b9a0"/><path d="M275 160l-5-25 17-21 32 1 17 22-10 22-7-24-22-5-13 17-2 23z" fill="#1b333c"/><path d="M310 159h9" stroke="#384b46" stroke-width="3"/><text x="300" y="339" text-anchor="middle" font-family="Georgia" font-size="33" fill="#243c36">THOMAS</text><text x="300" y="368" text-anchor="middle" font-family="Georgia" font-size="16" fill="#534b37">MAINTENANCE · TERMINUS 07</text></svg>`;
}

export function createEmployeeTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('employee-award')) return;
  const t = scene.textures.createCanvas('employee-award', 400, 420);
  if (!t) throw new Error('Portrait artwork unavailable');
  const a = new Painter(t.context);
  a.rect(0, 0, 400, 420, '#263d37');
  a.rect(10, 10, 380, 400, '#b5ac8b', '#8e8262');
  a.text('CITY TRANSIT AUTHORITY', 200, 39, 15, '#34453c', 'Georgia', 'center');
  a.text('EMPLOYEE OF THE MONTH', 200, 70, 20, '#534b37', 'Georgia', 'center');
  a.rect(115, 90, 170, 220, '#5b7067');
  a.ctx.save();
  a.ctx.beginPath();
  a.ctx.rect(115, 90, 170, 220);
  a.ctx.clip();
  a.ctx.translate(200, 415);
  a.ctx.scale(2.3, 2.3);
  drawTraveller(a, POSE.idle);
  a.ctx.restore();
  a.text('THOMAS', 200, 356, 34, '#243c36', 'Georgia', 'center');
  a.text('MAINTENANCE · TERMINUS 07', 200, 388, 14, '#534b37', 'Georgia', 'center');
  t.refresh();
}
