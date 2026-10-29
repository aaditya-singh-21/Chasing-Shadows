import { OBSTACLES, WORLD, LAMP } from '../data/opening.ts';
const FLOOR = WORLD.floor;
const LAMP_TARGET = LAMP.target;
import { Painter, type Paint } from './Painter.ts';
const seeded = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Original environment illustration, painted once into Phaser textures. */
export class EnvironmentArt extends Painter {
  distantStreet() {
    this.rect(0, 680, 6620, 80, '#233b3f');
    this.line(0, 682, 6620, 682, '#84968433', 2);
    for (let x = 100; x < 6620; x += 130) {
      this.rect(x, 653, 6, 29, '#1c343c');
      this.line(x - 60, 655, x + 65, 655, '#30494a', 2);
      this.line(x - 60, 667, x + 65, 667, '#30494a', 2);
    }
  }
  tiles(x: number, y: number, width: number, height: number, colour = '#53645e') {
    this.rect(x, y, width, height, colour);
    for (let yy = y; yy < y + height; yy += 28) {
      this.line(x, yy, x + width, yy, '#203d3e29');
      const offset = Math.floor((yy - y) / 28) % 2 ? 42 : 0;
      for (let xx = x + offset; xx < x + width; xx += 84)
        this.line(xx, yy, xx, Math.min(yy + 28, y + height), '#203d3e29');
    }
  }
  arch(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: Paint | null,
    stroke: string | null = null,
  ) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x, y + height);
    c.lineTo(x, y + width / 2);
    c.arc(x + width / 2, y + width / 2, width / 2, Math.PI, 0);
    c.lineTo(x + width, y + height);
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 3;
      c.stroke();
    }
  }
  platform() {
    this.tiles(1160, 315, 1840, 385, '#6b796e');
    this.rect(1160, 555, 1840, 145, '#435951');
    this.rect(1160, 548, 1840, 9, '#8c978077');
    for (const x of [1260, 1700, 2100]) {
      this.arch(x, 270, 255, 240, '#223e46', '#849082');
      this.arch(x + 9, 279, 237, 222, '#2a454c', '#3e5755');
      for (let i = 1; i < 4; i++) this.line(x + i * 63, 290, x + i * 63, 509, '#8b97804a', 3);
      this.line(x, 385, x + 255, 385, '#8b97804a', 4);
      this.rect(x - 8, 507, 271, 13, '#3c514b', '#93a08444');
      this.path(
        [
          [x + 12, 500],
          [x + 232, 309],
          [x + 232, 500],
        ],
        '#a0b9a009',
      );
    }
    this.rect(1160, 233, 1840, 28, '#1b333c', '#74827644');
    for (let x = 1180; x < 3000; x += 170) {
      this.path(
        [
          [x, 262],
          [x + 60, 262],
          [x, 320],
        ],
        '#233b42',
      );
      this.line(x, 260, x + 6, 700, '#203a3c', 13);
      this.line(x + 10, 260, x + 16, 700, '#8a967544', 2);
      this.rect(x - 11, 680, 36, 20, '#2d4546');
    }
    this.rect(1450, 385, 192, 112, '#3b504b', '#9aa58a88');
    this.rect(1457, 392, 178, 98, '#b3b39a');
    this.text('TRAM SERVICE', 1546, 413, 13, '#354b47', 'Georgia', 'center');
    this.line(1475, 424, 1618, 424, '#53685b88');
    this.text('RESUMES AT', 1546, 445, 10, '#596959', 'Arial', 'center');
    this.text('FIRST LIGHT', 1546, 467, 15, '#354b47', 'Georgia', 'center');
    this.rect(1790, 594, 190, 10, '#344a44', '#a0a18144');
    this.rect(1780, 640, 210, 12, '#2f4540');
    this.line(1804, 652, 1797, 699, '#233b37', 8);
    this.line(1970, 652, 1977, 699, '#233b37', 8);
    for (let y = 605; y < 637; y += 12) this.rect(1793, y, 184, 6, '#4e5f4e');
    // The shutter and the high physical latch.
    this.rect(2818, 304, 180, 396, '#152e35');
    this.rect(2808, 290, 200, 19, '#263e43', '#85907577');
    this.rect(2820, 310, 8, 390, '#1c343b', '#7e8f7155');
    this.rect(2983, 310, 8, 390, '#1c343b', '#7e8f7155');
    this.rect(2788, 434, 30, 12, '#a1a181', '#d2c38b66');
    this.line(2799, 441, 2799, 476, '#192f34', 6);
    this.line(2799, 441, 2816, 453, '#d5bc85', 4);
    this.text('EXIT', 2907, 276, 14, '#c5c3a0', 'Arial', 'center');
    this.line(2874, 270, 2851, 270, '#b8bc99');
    this.rect(2580, 336, 146, 41, '#263e41', '#a0aa8577');
    this.text('PLATFORM  02', 2653, 363, 13, '#c1c5a3', 'Arial', 'center');
    // Rail and lamp carriage: a deliberately bounded light interaction.
    this.line(1900, 687, 2220, 687, '#182e32', 5);
    this.line(1900, 682, 2220, 682, '#a3a78166', 2);
    for (let x = 1900; x <= 2220; x += 40) this.line(x, 680, x, 691, '#a3a78188');
    // The latch's cast shadow, which the player's shadow can touch.
    this.rect(LAMP_TARGET + 61, 556, 34, 10, '#132b2fbb');
    this.line(LAMP_TARGET + 72, 562, LAMP_TARGET + 72, 593, '#132b2fcc', 7);
  }
  tram() {
    this.line(150, 210, 1170, 210, '#142c37', 2);
    this.path(
      [
        [550, 352],
        [640, 268],
        [785, 210],
        [800, 210],
      ],
      null,
      '#263a40',
      7,
    );
    this.path(
      [
        [550, 352],
        [660, 310],
        [785, 210],
      ],
      null,
      '#73817055',
      2,
    );
    this.round(170, 348, 981, 365, [38, 60, 12, 12], '#354945', '#8a977888');
    this.round(181, 360, 960, 343, [30, 46, 7, 7], '#6d7860', '#1a373a');
    this.rect(190, 592, 944, 102, '#435747');
    this.line(185, 609, 1135, 609, '#b6ae7c77', 3);
    this.line(185, 620, 1135, 620, '#253e3d', 2);
    this.line(190, 687, 1135, 687, '#a0a47e66', 3);
    for (let x = 220; x < 1020; x += 155) {
      this.round(x, 414, 129, 171, 16, '#1d353d', '#acaf8e88');
      this.round(x + 7, 422, 115, 155, 12, '#2d4547');
      this.rect(x + 12, 548, 106, 25, '#263c3b');
      this.path(
        [
          [x + 12, 428],
          [x + 110, 428],
          [x + 12, 555],
        ],
        '#98a58c0b',
      );
      this.line(x + 8, 456, x + 122, 456, '#95a18233');
      this.line(x + 65, 425, x + 65, 580, '#6c816533', 3);
      this.rect(x + 9, 577, 115, 5, '#142f34');
    }
    this.round(371, 369, 387, 31, 3, '#283d3e', '#a5a77777');
    this.text(
      '07    ·    OLD QUARTER    ·    TERMINUS',
      566,
      389,
      13,
      '#c3c5a2',
      'Arial',
      'center',
    );
    this.rect(1032, 408, 98, 292, '#152e35', '#9b9d7766');
    this.rect(1033, 415, 12, 272, '#6c7960', '#a6aa8166');
    this.rect(1119, 415, 9, 272, '#6c7960', '#a6aa8166');
    this.rect(1019, 700, 128, 10, '#7a8162', '#1b3437');
    for (const x of [307, 932]) {
      this.ellipse(x, 721, 41, 34, '#142b32');
      this.ellipse(x, 721, 22, 20, '#2c4545');
      this.ellipse(x, 721, 8, 8, '#122830');
    }
    const suitcase = OBSTACLES[0];
    this.ctx.save();
    this.ctx.translate(suitcase.left - 752, suitcase.top - 660);
    this.rect(752, 660, 72, 40, '#675b42', '#aaa07988');
    this.rect(758, 666, 60, 28, '#706348', '#3b4438');
    this.line(769, 661, 769, 699, '#aea17c', 2);
    this.line(806, 661, 806, 699, '#aea17c', 2);
    this.path(
      [
        [778, 660],
        [778, 654],
        [798, 654],
        [798, 660],
      ],
      null,
      '#263b35',
      3,
    );
    this.rect(778, 674, 8, 6, '#b3aa81');
    this.ctx.restore();
    this.text('07', 241, 660, 23, '#b9b28a', 'Georgia');
    this.glow(550, 445, 330, '210,190,132', 0.065);
  }
  window(x: number, y: number, width = 78, height = 120, lit = false) {
    this.rect(x - 5, y - 5, width + 10, height + 12, '#58675a', '#8a947344');
    this.rect(x, y, width, height, lit ? '#6f7653' : '#203b40', '#9aa17d44');
    if (lit) this.glow(x + width / 2, y + height / 2, 110, '212,185,111', 0.065);
    this.line(x + width / 2, y, x + width / 2, y + height, '#84917477', 3);
    this.line(x, y + height * 0.43, x + width, y + height * 0.43, '#84917477', 3);
    this.rect(x - 10, y + height, width + 20, 8, '#233d3b', '#92977755');
    this.path(
      [
        [x + 6, y + 5],
        [x + width * 0.43, y + 5],
        [x + width * 0.32, y + height - 4],
        [x + 6, y + height - 4],
      ],
      '#99a58c14',
    );
    this.path(
      [
        [x + width - 6, y + 5],
        [x + width * 0.6, y + 5],
        [x + width * 0.7, y + height - 4],
        [x + width - 6, y + height - 4],
      ],
      '#99a58c14',
    );
  }
  buildings() {
    // A cutaway street assembled from reusable, shallow 2D facades.
    this.tiles(3080, 120, 540, 580, '#465e59');
    this.rect(3070, 110, 560, 18, '#1c373e', '#7b8a7366');
    this.rect(3080, 158, 540, 10, '#273f42', '#80907444');
    for (const y of [200, 383])
      for (const x of [3130, 3282, 3434]) this.window(x, y, 84, 114, x === 3434 && y === 200);
    this.rect(3100, 550, 500, 150, '#334d47');
    this.rect(3130, 577, 160, 123, '#27413e', '#8e97735e');
    for (let y = 587; y < 700; y += 13) this.line(3133, y, 3287, y, '#88947428');
    this.rect(3320, 556, 270, 38, '#273e3e', '#81906c88');
    this.text('MERCER & SONS', 3455, 582, 18, '#b1b38b', 'Georgia', 'center');
    this.rect(3330, 604, 247, 96, '#1d383e', '#80916d55');
    for (let y = 611; y < 700; y += 12) this.line(3331, y, 3576, y, '#7e8f6e33');
    this.rect(3600, 190, 486, 510, '#687668');
    this.rect(3590, 174, 505, 20, '#2e4745', '#9ba17c66');
    this.rect(3590, 341, 505, 12, '#344d47', '#87957455');
    this.rect(3590, 510, 505, 12, '#344d47', '#87957455');
    for (const y of [219, 390]) for (const x of [3630, 3790, 3940]) this.window(x, y, 87, 109);
    this.rect(3630, 550, 190, 150, '#213b3e', '#a6ab7f55');
    this.rect(3839, 550, 215, 150, '#263f40', '#a6ab7f55');
    this.line(3947, 550, 3947, 700, '#80907077', 4);
    this.rect(3620, 538, 444, 22, '#29423f');
    this.text('REPAIRS', 3840, 538, 13, '#c4bc91', 'Arial', 'center');
    this.path(
      [
        [3617, 540],
        [3617, 559],
        [4070, 559],
        [4070, 540],
      ],
      null,
      '#97a17b88',
      3,
    );
    this.rect(4090, 80, 620, 620, '#4e6258');
    this.rect(4080, 68, 640, 22, '#213e40', '#98a07c88');
    for (const y of [135, 315]) for (const x of [4130, 4310, 4490]) this.window(x, y, 110, 125);
    this.rect(4087, 472, 626, 15, '#233f3c', '#94a07b55');
    this.arch(4245, 486, 159, 214, '#2a403a', '#81906d');
    this.arch(4257, 498, 135, 202, '#263c36', '#b0ad7d55');
    this.line(4324, 504, 4324, 700, '#63745a77', 3);
    for (const x of [4268, 4332]) {
      this.rect(x, 573, 49, 107, '#233a32', '#6c7d5d77');
      this.rect(x + 3, 532, 43, 29, '#324c41', '#9da27b55');
    }
    this.ellipse(4334, 617, 4, 4, '#c5b67f');
    this.rect(4301, 516, 42, 20, '#263d36', '#b8b08477');
    this.text('14', 4322, 532, 13, '#c4bd8e', 'Georgia', 'center');
    this.rect(4470, 536, 185, 105, '#2b443c', '#91a17855');
    for (let x = 4490; x < 4650; x += 25) this.line(x, 529, x, 656, '#1d3834', 3);
    this.line(4464, 579, 4664, 579, '#1c3733', 3);
    this.line(4464, 623, 4664, 623, '#1c3733', 3);
    this.rect(4710, 215, 620, 485, '#56685d');
    this.rect(4700, 202, 640, 23, '#203c3e', '#a3a17a66');
    this.rect(4720, 393, 600, 13, '#2e4943');
    for (const x of [4770, 4930, 5090]) this.window(x, 253, 90, 104);
    this.rect(4770, 441, 405, 45, '#2d453d', '#a3a37b77');
    this.text('CITY TRANSIT AUTHORITY', 4973, 470, 17, '#c1bd91', 'Georgia', 'center');
    this.rect(5168, 513, 141, 187, '#1b3437', '#869873');
    this.rect(5180, 524, 116, 176, '#10272f', '#718b69');
    this.rect(5095, 565, 47, 63, '#2a403b', '#a4ac7c99');
    for (let i = 0; i < 3; i++) this.ellipse(5107 + i * 11, 594, 3, 3, '#7c8c68');
    this.text('MAINTENANCE', 5238, 503, 9, '#b7ba91', 'Arial', 'center');
    // Low boxes give jumping a use without blocking the main narrative.
    for (const o of OBSTACLES.filter((item) => item.id !== 'suitcase').map((item) => ({
      x: item.left,
      y: item.top,
      w: item.right - item.left,
    }))) {
      this.rect(o.x, o.y, o.w, FLOOR - o.y, '#3c5142', '#8c987366');
      this.line(o.x + 6, o.y + 6, o.x + o.w - 6, 693, '#72836566', 3);
      this.line(o.x + o.w - 6, o.y + 6, o.x + 6, 693, '#72836566', 3);
      this.rect(o.x - 3, o.y, o.w + 6, 6, '#67785c', '#233d38');
    }
    this.lampPost(3190, FLOOR, 350);
    this.lampPost(3980, FLOOR, 402);
    this.lampPost(4770, FLOOR, 337);
    this.line(4074, 80, 4074, FLOOR, '#1d3937', 9);
    this.line(4702, 215, 4702, FLOOR, '#1d3937', 8);
    for (const [x, y] of [
      [4074, 340],
      [4074, 490],
      [4702, 400],
    ] as const)
      this.line(x - 7, y, x + 7, y, '#83916d66', 3);
  }
  maintenance() {
    this.rect(5330, 190, 1290, 510, '#52645a');
    this.tiles(5330, 470, 1290, 230, '#455c50');
    this.rect(5330, 457, 1290, 12, '#8a957166');
    this.rect(5330, 185, 1290, 25, '#203b3e', '#9ca28055');
    this.line(5380, 263, 6450, 263, '#263f3b', 8);
    this.line(5380, 270, 6450, 270, '#8c99704d', 2);
    this.window(5420, 320, 180, 135);
    this.window(6110, 320, 180, 135);
    this.rect(5440, 616, 270, 16, '#7c8261', '#b5b58b66');
    this.rect(5460, 633, 17, 67, '#2b4339');
    this.rect(5678, 633, 17, 67, '#2b4339');
    this.rect(5575, 580, 18, 34, '#a4ac86', '#d6cd9d66');
    this.round(5590, 586, 12, 17, 5, null, '#a4ac86');
    this.rect(5485, 602, 48, 8, '#c3c2a0');
    this.rect(5480, 609, 52, 5, '#71836a');
    this.rect(5634, 592, 38, 24, '#31493d', '#91a17a66');
    this.rect(5795, 385, 250, 162, '#263d37', '#bcb78b88');
    this.rect(5804, 394, 232, 144, '#aaa88a');
    this.rect(5814, 403, 212, 123, '#6f7d6b');
    for (let i = 0; i < 4; i++) {
      const x = 5840 + i * 49;
      this.ellipse(x, 441, 9, 12, '#354b40');
      this.path(
        [
          [x - 8, 455],
          [x + 8, 455],
          [x + 15, 501],
          [x - 15, 501],
        ],
        i === 1 ? '#5e5144' : '#354b40',
      );
      this.line(x - 5, 501, x - 6, 522, '#354b40', 5);
      this.line(x + 5, 501, x + 6, 522, '#354b40', 5);
    }
    this.rect(5814, 522, 212, 7, '#bbb392');
    this.glow(5920, 445, 180, '230,201,134', 0.11);
    this.line(5920, 210, 5920, 291, '#192f32', 3);
    this.path(
      [
        [5880, 310],
        [5903, 288],
        [5937, 288],
        [5960, 310],
      ],
      '#263e39',
      '#8b9872',
    );
    this.line(5880, 310, 5960, 310, '#d8cb95', 3);
    this.glow(5920, 325, 270, '231,206,148', 0.14);
    this.rect(6350, 500, 160, 200, '#263f36', '#a3a57766');
    this.rect(6360, 513, 140, 50, '#304a3c', '#85957166');
    this.rect(6360, 578, 140, 50, '#304a3c', '#85957166');
    this.rect(6360, 643, 140, 48, '#304a3c', '#85957166');
    for (const y of [540, 605, 668]) this.line(6415, y, 6445, y, '#b9af7e', 3);
    this.text('STAFF ONLY', 6480, 415, 11, '#a8b58b', 'Arial', 'center');
    this.rect(6580, 190, 40, 510, '#142d31');
  }
  ground() {
    const c = this.ctx;
    const gradient = c.createLinearGradient(0, 700, 0, 980);
    gradient.addColorStop(0, '#273e3c');
    gradient.addColorStop(0.08, '#1c3335');
    gradient.addColorStop(1, '#0c1c27');
    this.rect(0, 700, 6700, 400, gradient);
    this.line(0, 700, 6700, 700, '#a4a78288', 2);
    this.line(0, 711, 6700, 711, '#132c32', 3);
    this.line(0, 716, 6700, 716, '#60765a44');
    for (let x = 0; x < 6700; x += 53) {
      this.line(x, 701, x + 3, 711, '#071f2a88');
      if (seeded(x) > 0.3)
        this.line(
          x + 13,
          740 + seeded(x + 1) * 110,
          x + 34,
          739 + seeded(x + 1) * 110,
          '#70866a15',
        );
    }
    for (const x of [1300, 3220, 3980, 4780]) {
      this.ellipse(x + 55, 737, 125, 7, '#819d7816');
      this.line(x - 65, 734, x + 120, 734, '#b9bb8820');
      this.line(x + 25, 743, x + 149, 743, '#b9bb8818');
    }
    this.line(150, 769, 1190, 769, '#77876755', 3);
    this.line(150, 778, 1190, 778, '#142c33', 5);
    for (let x = 160; x < 1190; x += 64)
      this.path(
        [
          [x, 760],
          [x + 20, 760],
          [x + 36, 802],
          [x + 15, 802],
        ],
        '#1a3033',
      );
    for (const x of [1195, 3100, 3900, 4880]) {
      this.path(
        [
          [x, 690],
          [x + 25, 687],
          [x + 37, 693],
          [x + 10, 696],
        ],
        '#a9b19b88',
      );
      this.line(x + 4, 691, x + 26, 690, '#344d4233');
    }
  }
  lampPost(x: number, y: number, height: number) {
    this.rect(x - 8, y - 15, 16, 15, '#152f32', '#6f836457');
    this.line(x, y - 15, x, y - height, '#18343a', 9);
    this.line(x + 3, y - 18, x + 3, y - height, '#97a17b44', 2);
    this.path(
      [
        [x, y - height + 15],
        [x + 14, y - height - 9],
        [x + 52, y - height - 9],
        [x + 66, y - height + 15],
      ],
      null,
      '#1b363c',
      6,
    );
    this.path(
      [
        [x + 32, y - height - 6],
        [x + 50, y - height - 6],
        [x + 61, y - height + 15],
        [x + 23, y - height + 15],
      ],
      '#2f4943',
      '#9aa27877',
    );
    this.rect(x + 28, y - height + 15, 30, 5, '#d7c48d');
    this.glow(x + 43, y - height + 22, 170, '219,194,127', 0.17);
    this.path(
      [
        [x + 28, y - height + 22],
        [x - 125, y],
        [x + 204, y],
        [x + 58, y - height + 22],
      ],
      '#ddc37806',
    );
    this.ellipse(x + 43, y, 150, 7, '#d0be8120');
  }
  stationLights() {
    for (const x of [1380, 1890, 2490]) {
      this.line(x, 260, x, 320, '#172f36', 3);
      this.path(
        [
          [x - 33, 338],
          [x - 15, 318],
          [x + 15, 318],
          [x + 33, 338],
        ],
        '#283e3d',
        '#9d9f7666',
      );
      this.line(x - 30, 339, x + 30, 339, '#c3b986', 2);
      this.glow(x, 345, 205, '222,198,130', 0.085);
    }
  }
}
