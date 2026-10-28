import { FLOOR, LAMP_TARGET, ACCESS_SEQUENCE } from './game.js';

const C = { dark: '#101d24', black: '#09131b', stone: '#707a70', trim: '#4c5c57', light: '#d5bd87', paper: '#abb4a1' };
const seeded = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mix = (a, b, t) => a + (b - a) * t;

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false }); this.game = game;
    if (!this.ctx) throw new Error('This browser does not support the 2D canvas needed by the game.');
    this.camera = 0; this.clock = 0; this.reducedMotion = false;
    this.resize();
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * this.pixelRatio);
    this.canvas.height = Math.round(rect.height * this.pixelRatio);
    this.scale = rect.height / 900;
    if (rect.width / rect.height < .85) this.scale *= .7;
    this.width = rect.width / this.scale; this.height = rect.height / this.scale;
    this.offsetY = this.height * .778 - FLOOR;
  }
  rect(x, y, w, h, fill, stroke = null) {
    const c = this.ctx;
    if (fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, w, h); }
  }
  path(points, fill, stroke = null, line = 1) {
    const c = this.ctx; c.beginPath();
    for (let i = 0; i < points.length; i++) i ? c.lineTo(...points[i]) : c.moveTo(...points[i]);
    if (fill) { c.closePath(); c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = line; c.stroke(); }
  }
  line(x, y, xx, yy, colour, width = 1) { this.path([[x, y], [xx, yy]], null, colour, width); }
  ellipse(x, y, rx, ry, fill, stroke = null) {
    const c = this.ctx; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.stroke(); }
  }
  round(x, y, w, h, radius, fill, stroke = null) {
    const c = this.ctx; c.beginPath(); c.roundRect(x, y, w, h, radius);
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  }
  text(text, x, y, size, fill, font = 'Georgia', align = 'left') {
    const c = this.ctx; c.fillStyle = fill; c.font = `${size}px ${font}`; c.textAlign = align; c.fillText(text, x, y);
  }
  glow(x, y, radius, colour = '226,190,120', strength = .2) {
    const c = this.ctx, gradient = c.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${colour},${strength})`); gradient.addColorStop(.3, `rgba(${colour},${strength * .35})`); gradient.addColorStop(1, `rgba(${colour},0)`);
    this.rect(x - radius, y - radius, radius * 2, radius * 2, gradient);
  }
  draw(dt, menu = false) {
    this.clock += Math.min(dt, .04);
    const c = this.ctx, g = this.game;
    c.setTransform(this.pixelRatio * this.scale, 0, 0, this.pixelRatio * this.scale, 0, 0);
    c.lineCap = 'round'; c.lineJoin = 'round';
    const focus = menu ? 3980 : g.mode === 'lamp' ? 2570 : g.mode === 'panel' ? 5180 : g.player.x + 115;
    const target = Math.max(0, Math.min(6620 - this.width, focus - this.width * (menu ? .72 : .46)));
    if (this.camera === undefined || this.snap) { this.camera = target; this.snap = false; }
    else this.camera += (target - this.camera) * Math.min(1, dt * (this.reducedMotion ? 20 : 3));
    this.sky();
    c.save(); c.translate(-this.camera, this.offsetY);
    this.distantStreet(); this.platform(); this.tram(); this.buildings(); this.maintenance(); this.ground();
    this.stationLights();
    if (menu) {
      this.character(3980, FLOOR, 1.15, false, 'idle', this.reducedMotion ? 0 : Math.sin(this.clock) * .3, 1);
      c.save(); c.globalAlpha = .79; this.character(4150, FLOOR, 1.85, true, 'look', 0, -1); c.restore();
    } else {
      this.drawShadow();
      const p = g.player;
      this.ellipse(p.x, FLOOR + 3, 30, 5, '#07121866');
      this.character(p.x, p.y, 1.15, false, Math.abs(p.vx) > 10 && p.grounded ? 'walk' : p.grounded ? 'idle' : 'jump', p.stride, p.facing);
      if (g.walkTarget !== null) {
        const a = .18 + Math.sin(this.clock * 4) * .08;
        this.ellipse(g.walkTarget, FLOOR - 2, 11, 3, `rgba(219,190,133,${a})`);
        this.line(g.walkTarget, FLOOR - 9, g.walkTarget, FLOOR - 16, '#d9bd8580');
      }
    }
    this.foreground();
    c.restore();
    this.atmosphere();
    const veil = c.createLinearGradient(0, 0, 0, this.height);
    veil.addColorStop(0, '#06131e66'); veil.addColorStop(.27, '#06131e00'); veil.addColorStop(.72, '#06131e00'); veil.addColorStop(1, '#06131eaa');
    this.rect(0, 0, this.width, this.height, veil);
  }
  sky() {
    const c = this.ctx, w = this.width, h = this.height;
    const gradient = c.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#172936'); gradient.addColorStop(.45, '#4d6566'); gradient.addColorStop(.75, '#667e72'); gradient.addColorStop(1, '#1c3439');
    this.rect(0, 0, w, h, gradient);
    this.glow(w * .78, 185, 220, '190,209,185', .12);
    this.ellipse(w * .78, 185, 29, 29, '#bdcab728');
    for (let layer = 0; layer < 3; layer++) {
      const parallax = [.12, .24, .4][layer];
      const base = 605 + this.offsetY * .4 + layer * 19;
      const fill = ['#435c5e', '#334f53', '#263f47'][layer];
      const shift = (this.camera * parallax) % 180;
      const start = Math.floor(this.camera * parallax / 180);
      for (let i = -2; i < w / 150 + 3; i++) {
        const n = i + start + layer * 500, x = i * 180 - shift;
        const width = 115 + seeded(n) * 65, height = 115 + seeded(n + 4) * (210 + layer * 40);
        this.rect(x, base - height, width, height, fill);
        this.rect(x - 4, base - height - 7, width + 8, 8, fill);
        if (seeded(n + 8) > .5) {
          this.path([[x + width * .2, base - height - 7], [x + width * .5, base - height - 35], [x + width * .8, base - height - 7]], fill);
          this.line(x + width * .5, base - height - 35, x + width * .5, base - height - 70, fill, 2);
        }
        if (seeded(n + 12) > .7) {
          this.rect(x + 17, base - height - 35, 22, 30, fill);
          this.line(x + 19, base - height - 35, x + 16, base - height - 38, '#74817655');
        }
        for (let row = 0; row < Math.floor(height / 37) - 1; row++) for (let col = 0; col < 3; col++) {
          const wx = x + 18 + col * (width - 20) / 3, wy = base - height + 25 + row * 37;
          this.rect(wx, wy, 12, 18, seeded(n * 17 + row * 7 + col) > .97 ? '#a69b6838' : '#142e373b');
          this.line(wx + 6, wy, wx + 6, wy + 18, `${fill}aa`);
        }
        if (layer === 2 && seeded(n + 6) > .6) {
          this.line(x + 20, base - height - 10, x + 20, base - height - 50, fill, 2);
          this.line(x, base - height - 38, x + 40, base - height - 38, fill, 2);
        }
      }
      const fog = c.createLinearGradient(0, base - 90, 0, base + 40);
      fog.addColorStop(0, '#778c7800'); fog.addColorStop(1, '#68867633');
      this.rect(0, base - 90, w, 130, fog);
    }
    // Long hanging tram cables make the empty streets feel connected.
    const cableShift = this.camera * .55;
    for (let n = -1; n < 7; n++) {
      const x = n * 510 - cableShift % 510;
      c.beginPath(); c.moveTo(x, 235); c.quadraticCurveTo(x + 260, 340, x + 510, 235);
      c.strokeStyle = '#142c3880'; c.lineWidth = 1; c.stroke();
    }
  }
  distantStreet() {
    this.rect(0, 680, 6620, 80, '#233b3f');
    this.line(0, 682, 6620, 682, '#84968433', 2);
    for (let x = 100; x < 6620; x += 130) {
      this.rect(x, 653, 6, 29, '#1c343c');
      this.line(x - 60, 655, x + 65, 655, '#30494a', 2);
      this.line(x - 60, 667, x + 65, 667, '#30494a', 2);
    }
  }
  tiles(x, y, width, height, colour = '#53645e') {
    this.rect(x, y, width, height, colour);
    for (let yy = y; yy < y + height; yy += 28) {
      this.line(x, yy, x + width, yy, '#203d3e29');
      const offset = Math.floor((yy - y) / 28) % 2 ? 42 : 0;
      for (let xx = x + offset; xx < x + width; xx += 84) this.line(xx, yy, xx, Math.min(yy + 28, y + height), '#203d3e29');
    }
  }
  arch(x, y, width, height, fill, stroke = null) {
    const c = this.ctx;
    c.beginPath(); c.moveTo(x, y + height); c.lineTo(x, y + width / 2); c.arc(x + width / 2, y + width / 2, width / 2, Math.PI, 0); c.lineTo(x + width, y + height); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 3; c.stroke(); }
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
      this.path([[x + 12, 500], [x + 232, 309], [x + 232, 500]], '#a0b9a009');
    }
    this.rect(1160, 233, 1840, 28, '#1b333c', '#74827644');
    for (let x = 1180; x < 3000; x += 170) {
      this.path([[x, 262], [x + 60, 262], [x, 320]], '#233b42');
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
    this.line(1804, 652, 1797, 699, '#233b37', 8); this.line(1970, 652, 1977, 699, '#233b37', 8);
    for (let y = 605; y < 637; y += 12) this.rect(1793, y, 184, 6, '#4e5f4e');
    // The shutter and the high physical latch.
    this.rect(2818, 304, 180, 396, '#152e35');
    this.rect(2808, 290, 200, 19, '#263e43', '#85907577');
    const bottom = 700 - this.game.gateAmount * 355;
    if (bottom > 314) {
      this.rect(2830, 310, 153, bottom - 310, '#43544d');
      for (let y = 316; y < bottom; y += 14) {
        this.line(2831, y, 2982, y, '#132e354d', 3);
        this.line(2831, y + 3, 2982, y + 3, '#a3a48725');
      }
      this.rect(2843, bottom - 19, 120, 10, '#1c3638', '#8d957577');
    }
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
    this.line(1900, 687, 2220, 687, '#182e32', 5); this.line(1900, 682, 2220, 682, '#a3a78166', 2);
    for (let x = 1900; x <= 2220; x += 40) this.line(x, 680, x, 691, '#a3a78188');
    const lx = this.game.lampX;
    this.ellipse(lx, 694, 24, 5, '#15292e');
    this.line(lx, 692, lx, 605, '#1e3338', 7);
    this.line(lx, 689, lx - 23, 699, '#273f3e', 4); this.line(lx, 689, lx + 23, 699, '#273f3e', 4);
    this.round(lx - 21, 565, 42, 45, 6, '#293e3d', '#b3ac7e');
    this.rect(lx + 9, 571, 12, 30, '#e5d7a7');
    this.path([[lx + 23, 570], [lx + 35, 561], [lx + 35, 615], [lx + 23, 606]], '#43554a', '#8b9877');
    const light = this.ctx.createLinearGradient(lx, 590, 2890, 590);
    light.addColorStop(0, '#e4cb7d11'); light.addColorStop(.5, '#e4cb7d21'); light.addColorStop(1, '#e4cb7d00');
    this.path([[lx + 25, 574], [2870, 330], [2870, 700], [lx + 25, 606]], light);
    // The latch's cast shadow, which the player's shadow can touch.
    this.rect(LAMP_TARGET + 61, 556, 34, 10, '#132b2fbb');
    this.line(LAMP_TARGET + 72, 562, LAMP_TARGET + 72, 593, '#132b2fcc', 7);
    if (this.game.mode === 'lamp' && this.game.alignmentDistance < 25) this.glow(LAMP_TARGET + 73, 563, 50, '236,209,144', .28);
  }
  tram() {
    this.line(150, 210, 1170, 210, '#142c37', 2);
    this.path([[550, 352], [640, 268], [785, 210], [800, 210]], null, '#263a40', 7);
    this.path([[550, 352], [660, 310], [785, 210]], null, '#73817055', 2);
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
      this.path([[x + 12, 428], [x + 110, 428], [x + 12, 555]], '#98a58c0b');
      this.line(x + 8, 456, x + 122, 456, '#95a18233');
      this.line(x + 65, 425, x + 65, 580, '#6c816533', 3);
      this.rect(x + 9, 577, 115, 5, '#142f34');
    }
    this.round(371, 369, 387, 31, 3, '#283d3e', '#a5a77777');
    this.text('07    ·    OLD QUARTER    ·    TERMINUS', 566, 389, 13, '#c3c5a2', 'Arial', 'center');
    this.rect(1032, 408, 98, 292, '#152e35', '#9b9d7766');
    const open = this.game.flags.doorOpen;
    if (!open) {
      this.rect(1039, 415, 82, 271, '#4c6054', '#a6aa8166');
      this.round(1047, 429, 65, 134, 9, '#2a4144', '#7e957266');
      this.line(1080, 415, 1080, 687, '#1c373b', 3);
      this.rect(1071, 586, 4, 35, '#b4b08a'); this.rect(1087, 586, 4, 35, '#b4b08a');
    } else {
      this.rect(1033, 415, 12, 272, '#6c7960', '#a6aa8166');
      this.rect(1119, 415, 9, 272, '#6c7960', '#a6aa8166');
    }
    this.rect(1019, 700, 128, 10, '#7a8162', '#1b3437');
    for (const x of [307, 932]) { this.ellipse(x, 721, 41, 34, '#142b32'); this.ellipse(x, 721, 22, 20, '#2c4545'); this.ellipse(x, 721, 8, 8, '#122830'); }
    this.rect(752, 660, 72, 40, '#675b42', '#aaa07988');
    this.rect(758, 666, 60, 28, '#706348', '#3b4438');
    this.line(769, 661, 769, 699, '#aea17c', 2); this.line(806, 661, 806, 699, '#aea17c', 2);
    this.path([[778, 660], [778, 654], [798, 654], [798, 660]], null, '#263b35', 3);
    this.rect(778, 674, 8, 6, '#b3aa81');
    this.text('07', 241, 660, 23, '#b9b28a', 'Georgia');
    this.glow(550, 445, 330, '210,190,132', .065);
  }
  window(x, y, width = 78, height = 120, lit = false) {
    this.rect(x - 5, y - 5, width + 10, height + 12, '#58675a', '#8a947344');
    this.rect(x, y, width, height, lit ? '#6f7653' : '#203b40', '#9aa17d44');
    if (lit) this.glow(x + width / 2, y + height / 2, 110, '212,185,111', .065);
    this.line(x + width / 2, y, x + width / 2, y + height, '#84917477', 3);
    this.line(x, y + height * .43, x + width, y + height * .43, '#84917477', 3);
    this.rect(x - 10, y + height, width + 20, 8, '#233d3b', '#92977755');
    this.path([[x + 6, y + 5], [x + width * .43, y + 5], [x + width * .32, y + height - 4], [x + 6, y + height - 4]], '#99a58c14');
    this.path([[x + width - 6, y + 5], [x + width * .6, y + 5], [x + width * .7, y + height - 4], [x + width - 6, y + height - 4]], '#99a58c14');
  }
  buildings() {
    // A cutaway street assembled from reusable, shallow 2D facades.
    this.tiles(3080, 120, 540, 580, '#465e59');
    this.rect(3070, 110, 560, 18, '#1c373e', '#7b8a7366');
    this.rect(3080, 158, 540, 10, '#273f42', '#80907444');
    for (const y of [200, 383]) for (const x of [3130, 3282, 3434]) this.window(x, y, 84, 114, x === 3434 && y === 200);
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
    this.path([[3617, 540], [3617, 559], [4070, 559], [4070, 540]], null, '#97a17b88', 3);
    this.rect(4090, 80, 620, 620, '#4e6258');
    this.rect(4080, 68, 640, 22, '#213e40', '#98a07c88');
    for (const y of [135, 315]) for (const x of [4130, 4310, 4490]) this.window(x, y, 110, 125);
    this.rect(4087, 472, 626, 15, '#233f3c', '#94a07b55');
    this.arch(4245, 486, 159, 214, '#2a403a', '#81906d');
    this.arch(4257, 498, 135, 202, '#263c36', '#b0ad7d55');
    this.line(4324, 504, 4324, 700, '#63745a77', 3);
    for (const x of [4268, 4332]) { this.rect(x, 573, 49, 107, '#233a32', '#6c7d5d77'); this.rect(x + 3, 532, 43, 29, '#324c41', '#9da27b55'); }
    this.ellipse(4334, 617, 4, 4, '#c5b67f');
    this.rect(4301, 516, 42, 20, '#263d36', '#b8b08477'); this.text('14', 4322, 532, 13, '#c4bd8e', 'Georgia', 'center');
    this.rect(4470, 536, 185, 105, '#2b443c', '#91a17855');
    for (let x = 4490; x < 4650; x += 25) this.line(x, 529, x, 656, '#1d3834', 3);
    this.line(4464, 579, 4664, 579, '#1c3733', 3); this.line(4464, 623, 4664, 623, '#1c3733', 3);
    this.rect(4710, 215, 620, 485, '#56685d');
    this.rect(4700, 202, 640, 23, '#203c3e', '#a3a17a66');
    this.rect(4720, 393, 600, 13, '#2e4943');
    for (const x of [4770, 4930, 5090]) this.window(x, 253, 90, 104);
    this.rect(4770, 441, 405, 45, '#2d453d', '#a3a37b77');
    this.text('CITY TRANSIT AUTHORITY', 4973, 470, 17, '#c1bd91', 'Georgia', 'center');
    this.rect(5168, 513, 141, 187, '#1b3437', '#869873');
    this.rect(5180, 524, 116, 176, this.game.flags.panelOpen ? '#10272f' : '#354e43', '#718b69');
    if (!this.game.flags.panelOpen) {
      this.rect(5189, 532, 98, 52, '#19373b', '#a7ac7e44');
      for (let x = 5205; x < 5285; x += 20) this.line(x, 534, x, 582, '#718b6955', 2);
      this.rect(5280, 618, 8, 25, '#aea87d');
    }
    this.rect(5095, 565, 47, 63, '#2a403b', '#a4ac7c99');
    [0, 1, 2].forEach((symbol, i) => {
      const active = this.game.mode === 'panel' && ACCESS_SEQUENCE[Math.floor(this.game.sequenceTime / .85) % 7] === symbol;
      this.ellipse(5107 + i * 11, 594, 3, 3, active ? '#e4ce91' : '#7c8c68');
      if (active) this.glow(5107 + i * 11, 594, 14, '236,209,144', .2);
    });
    this.text('MAINTENANCE', 5238, 503, 9, '#b7ba91', 'Arial', 'center');
    // Low boxes give jumping a use without blocking the main narrative.
    for (const o of [{ x: 3460, y: 650, w: 90 }, { x: 3670, y: 610, w: 120 }]) {
      this.rect(o.x, o.y, o.w, FLOOR - o.y, '#3c5142', '#8c987366');
      this.line(o.x + 6, o.y + 6, o.x + o.w - 6, 693, '#72836566', 3);
      this.line(o.x + o.w - 6, o.y + 6, o.x + 6, 693, '#72836566', 3);
      this.rect(o.x - 3, o.y, o.w + 6, 6, '#67785c', '#233d38');
    }
    this.lampPost(3190, FLOOR, 350); this.lampPost(3980, FLOOR, 402); this.lampPost(4770, FLOOR, 337);
    this.line(4074, 80, 4074, FLOOR, '#1d3937', 9);
    this.line(4702, 215, 4702, FLOOR, '#1d3937', 8);
    for (const [x, y] of [[4074, 340], [4074, 490], [4702, 400]]) this.line(x - 7, y, x + 7, y, '#83916d66', 3);
  }
  maintenance() {
    this.rect(5330, 190, 1290, 510, '#52645a');
    this.tiles(5330, 470, 1290, 230, '#455c50');
    this.rect(5330, 457, 1290, 12, '#8a957166');
    this.rect(5330, 185, 1290, 25, '#203b3e', '#9ca28055');
    this.line(5380, 263, 6450, 263, '#263f3b', 8);
    this.line(5380, 270, 6450, 270, '#8c99704d', 2);
    this.window(5420, 320, 180, 135); this.window(6110, 320, 180, 135);
    this.rect(5440, 616, 270, 16, '#7c8261', '#b5b58b66');
    this.rect(5460, 633, 17, 67, '#2b4339'); this.rect(5678, 633, 17, 67, '#2b4339');
    this.rect(5575, 580, 18, 34, '#a4ac86', '#d6cd9d66');
    this.round(5590, 586, 12, 17, 5, null, '#a4ac86');
    this.rect(5485, 602, 48, 8, '#c3c2a0'); this.rect(5480, 609, 52, 5, '#71836a');
    this.rect(5634, 592, 38, 24, '#31493d', '#91a17a66');
    this.rect(5795, 385, 250, 162, '#263d37', '#bcb78b88');
    this.rect(5804, 394, 232, 144, '#aaa88a');
    this.rect(5814, 403, 212, 123, '#6f7d6b');
    for (let i = 0; i < 4; i++) {
      const x = 5840 + i * 49;
      this.ellipse(x, 441, 9, 12, '#354b40');
      this.path([[x - 8, 455], [x + 8, 455], [x + 15, 501], [x - 15, 501]], i === 1 ? '#5e5144' : '#354b40');
      this.line(x - 5, 501, x - 6, 522, '#354b40', 5); this.line(x + 5, 501, x + 6, 522, '#354b40', 5);
    }
    this.rect(5814, 522, 212, 7, '#bbb392');
    this.glow(5920, 445, 180, '230,201,134', .11);
    this.line(5920, 210, 5920, 291, '#192f32', 3);
    this.path([[5880, 310], [5903, 288], [5937, 288], [5960, 310]], '#263e39', '#8b9872');
    this.line(5880, 310, 5960, 310, '#d8cb95', 3);
    this.glow(5920, 325, 270, '231,206,148', .14);
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
    gradient.addColorStop(0, '#273e3c'); gradient.addColorStop(.08, '#1c3335'); gradient.addColorStop(1, '#0c1c27');
    this.rect(0, 700, 6700, 400, gradient);
    this.line(0, 700, 6700, 700, '#a4a78288', 2);
    this.line(0, 711, 6700, 711, '#132c32', 3);
    this.line(0, 716, 6700, 716, '#60765a44');
    for (let x = 0; x < 6700; x += 53) {
      this.line(x, 701, x + 3, 711, '#071f2a88');
      if (seeded(x) > .3) this.line(x + 13, 740 + seeded(x + 1) * 110, x + 34, 739 + seeded(x + 1) * 110, '#70866a15');
    }
    for (const x of [1300, 3220, 3980, 4780]) {
      this.ellipse(x + 55, 737, 125, 7, '#819d7816');
      this.line(x - 65, 734, x + 120, 734, '#b9bb8820');
      this.line(x + 25, 743, x + 149, 743, '#b9bb8818');
    }
    this.line(150, 769, 1190, 769, '#77876755', 3);
    this.line(150, 778, 1190, 778, '#142c33', 5);
    for (let x = 160; x < 1190; x += 64) this.path([[x, 760], [x + 20, 760], [x + 36, 802], [x + 15, 802]], '#1a3033');
    for (const x of [1195, 3100, 3900, 4880]) {
      this.path([[x, 690], [x + 25, 687], [x + 37, 693], [x + 10, 696]], '#a9b19b88');
      this.line(x + 4, 691, x + 26, 690, '#344d4233');
    }
  }
  lampPost(x, y, height) {
    this.rect(x - 8, y - 15, 16, 15, '#152f32', '#6f836457');
    this.line(x, y - 15, x, y - height, '#18343a', 9);
    this.line(x + 3, y - 18, x + 3, y - height, '#97a17b44', 2);
    this.path([[x, y - height + 15], [x + 14, y - height - 9], [x + 52, y - height - 9], [x + 66, y - height + 15]], null, '#1b363c', 6);
    this.path([[x + 32, y - height - 6], [x + 50, y - height - 6], [x + 61, y - height + 15], [x + 23, y - height + 15]], '#2f4943', '#9aa27877');
    this.rect(x + 28, y - height + 15, 30, 5, '#d7c48d');
    this.glow(x + 43, y - height + 22, 170, '219,194,127', .17);
    this.path([[x + 28, y - height + 22], [x - 125, y], [x + 204, y], [x + 58, y - height + 22]], '#ddc37806');
    this.ellipse(x + 43, y, 150, 7, '#d0be8120');
  }
  stationLights() {
    for (const x of [1380, 1890, 2490]) {
      this.line(x, 260, x, 320, '#172f36', 3);
      this.path([[x - 33, 338], [x - 15, 318], [x + 15, 318], [x + 33, 338]], '#283e3d', '#9d9f7666');
      this.line(x - 30, 339, x + 30, 339, '#c3b986', 2);
      this.glow(x, 345, 205, '222,198,130', .085);
    }
  }
  drawShadow() {
    const s = this.game.shadow, p = this.game.player, c = this.ctx;
    let pose = Math.abs(p.vx) > 10 && p.grounded ? 'walk' : p.grounded ? 'idle' : 'jump';
    let stride = p.stride, facing = p.facing;
    if (s.mode === 'linger') { pose = 'look'; facing = -1; stride = 0; }
    if (s.mode === 'project' || s.mode === 'reach') { pose = this.game.alignmentDistance < 55 || s.mode === 'reach' ? 'reach' : 'look'; facing = 1; stride = 0; }
    if (s.mode === 'knock') { pose = 'knock'; stride = s.timer; facing = 1; }
    if (s.mode === 'code') { pose = 'code'; stride = this.game.sequenceTime; facing = 1; }
    c.save(); c.globalAlpha = .78;
    const scale = s.mode === 'project' || s.mode === 'reach' ? 1.72 : 1.65;
    this.character(s.x, s.y, scale, true, pose, stride, facing);
    c.restore();
    // The thin contact shadow is always anchored to the player.
    this.ellipse(p.x + 13, FLOOR + 2, 37, 5, '#07131c4d');
  }
  character(x, y, size, shadow, pose = 'idle', stride = 0, facing = 1) {
    const c = this.ctx;
    c.save(); c.translate(x, y); c.scale(size * facing, size);
    const step = pose === 'walk' ? Math.sin(stride) : 0;
    const breath = !this.reducedMotion && pose === 'idle' ? Math.sin(this.clock * 1.6) * .6 : 0;
    const colour = shadow ? '#07131c' : '#273b3d';
    const coat = shadow ? colour : '#687166';
    // Long legs and a coat make a human silhouette readable at a distance.
    this.path([[-10, -25], [-3, -24], [-4 + step * 15, -3], [-15 + step * 15, -3]], colour);
    this.path([[3, -24], [11, -24], [13 - step * 15, -3], [3 - step * 15, -3]], shadow ? colour : '#20363a');
    this.round(-18 + step * 15, -6, 17, 7, 2, colour);
    this.round(2 - step * 15, -6, 19, 7, 2, colour);
    const sway = !this.reducedMotion && !shadow ? Math.sin(this.clock * 1.3) * 1.4 : 0;
    this.path([[-13, -78 + breath], [10, -78 + breath], [17, -65], [17 + sway, -25], [8, -17], [-19, -23], [-17, -58]], coat, shadow ? null : '#aab39b55');
    if (!shadow) {
      this.path([[-12, -77], [-4, -62], [0, -47], [4, -66], [10, -78]], '#80907a');
      this.line(0, -59, 1, -24, '#273b3655');
      this.line(-11, -43, -4, -43, '#b9b69655');
      this.ellipse(4, -50, 1, 1, '#b4b291');
      this.path([[-11, -77], [-7, -68], [8, -70], [12, -77]], '#9c8160');
      this.path([[-7, -70], [-4, -58], [0, -61], [1, -72]], '#aa8e65');
    }
    this.round(-7, -84 + breath, 12, 12, 2, shadow ? colour : '#b2b09a');
    const headTurn = pose === 'look' ? -5 : 0;
    this.ellipse(headTurn, -94 + breath, 12, 16, shadow ? colour : '#b1b5a1');
    this.path([[-12 + headTurn, -94], [-12 + headTurn, -105], [-6 + headTurn, -112], [4 + headTurn, -112], [12 + headTurn, -103], [12 + headTurn, -94], [7 + headTurn, -99], [2 + headTurn, -103], [-4 + headTurn, -98]], shadow ? colour : '#23373b');
    if (!shadow) {
      this.line(6 + headTurn, -94, 9 + headTurn, -94, '#33433d');
      this.path([[10, -96], [15, -91], [10, -89]], '#b1b5a1');
    }
    let arm = [[9, -70], [18, -51 + step * 4], [15, -36 + step * 8]];
    if (pose === 'reach') arm = [[9, -70], [25, -77], [41, -80]];
    if (pose === 'knock') {
      const beats = [1.2, 1.5, 2.7, 5.4, 5.8, 7.2];
      const tap = beats.some(t => Math.abs(stride - t) < .11) ? 5 : 0;
      arm = [[9, -70], [23, -66], [31 + tap, -84]];
    }
    if (pose === 'code') {
      const symbol = ACCESS_SEQUENCE[Math.floor(stride / .85) % 7];
      arm = [[9, -70], [22, -65], [symbol === 0 ? 36 : symbol === 1 ? 25 : 43, symbol === 0 ? -66 : symbol === 1 ? -90 : -82]];
    }
    this.path(arm, null, shadow ? colour : '#687166', 8);
    const hand = arm.at(-1); this.ellipse(hand[0], hand[1], 4.5, 4.8, shadow ? colour : '#b3b39a');
    this.path([[-12, -70], [-21, -50 - step * 5], [-17, -34 - step * 7]], null, shadow ? colour : '#59685e', 8);
    if (!shadow) this.line(-24, -40 - step * 7, -16, -40 - step * 7, '#d0c5a0', 2);
    c.restore();
  }
  foreground() {
    for (const x of [1190, 3028, 5340]) {
      this.rect(x - 7, 220, 14, 503, '#102b31');
      this.rect(x - 17, 690, 34, 33, '#122b31');
      this.line(x - 3, 225, x - 3, 680, '#45635155', 2);
    }
    for (const x of [1230, 3020, 4110, 4680, 5320]) {
      for (let i = 0; i < 8; i++) {
        const sway = this.reducedMotion ? 0 : Math.sin(this.clock + x + i) * 3;
        this.path([[x + i * 4, 703], [x - 7 + i * 4 + sway, 681 - seeded(x + i) * 14], [x + i * 4 + 5, 703]], '#193b33');
      }
    }
  }
  atmosphere() {
    if (this.reducedMotion) return;
    const c = this.ctx, w = this.width, h = this.height;
    c.save();
    for (let i = 0; i < 46; i++) {
      const x = ((seeded(i + 51) * w + this.clock * (3 + seeded(i) * 7) - this.camera * .1) % w + w) % w;
      const y = (seeded(i + 131) * h + Math.sin(this.clock * .3 + i) * 15) % h;
      this.ellipse(x, y, seeded(i + 19) + .4, seeded(i + 19) + .4, `rgba(204,214,177,${.08 + seeded(i + 11) * .15})`);
    }
    const fogY = h * .76;
    for (let i = 0; i < 5; i++) {
      const x = ((i * w / 4 + this.clock * 8) % (w + 600)) - 300;
      const fog = c.createRadialGradient(x, fogY, 10, x, fogY, 270);
      fog.addColorStop(0, '#a4bb9a08'); fog.addColorStop(1, '#a4bb9a00');
      c.save(); c.translate(x, fogY); c.scale(1, .15); this.rect(-270, -270, 540, 540, fog); c.restore();
    }
    c.restore();
  }
  worldPoint(clientX, clientY) {
    const bounds = this.canvas.getBoundingClientRect();
    return { x: (clientX - bounds.left) / this.scale + this.camera, y: (clientY - bounds.top) / this.scale - this.offsetY };
  }
}

export function photographSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 310" aria-hidden="true">
    <defs><linearGradient id="photo-bg" x2="0" y2="1"><stop stop-color="#777b67"/><stop offset="1" stop-color="#434e43"/></linearGradient><filter id="grain"><feTurbulence baseFrequency=".6" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".14"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs>
    <g filter="url(#grain)"><path fill="url(#photo-bg)" d="M0 0h600v310H0z"/><path fill="#3c4b42" d="M0 45h600v12H0zm35 0h14v265H35zm512 0h14v265h-14z"/>
    <path fill="#adb095" d="M139 18h322v36H139z"/><text x="300" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#354b42">CITY TRANSIT AUTHORITY</text>
    <g stroke="#a6ad8a" stroke-width="2" fill="#31483f"><path d="M70 72h95v107H70zm394 0h65v107h-65z"/><path d="M117 72v107m-47-56h95m332-51v107m-33-56h65"/></g>
    <path fill="#8d977b" d="M0 260h600v50H0z"/>
    ${[110, 245, 370, 495].map((x, i) => `<g transform="translate(${x} 266)"><path fill="#263d34" d="m-22-19 5 66h15l4-61 4 61h16l5-66z"/><path fill="${i === 1 ? '#696851' : '#3a5141'}" stroke="#899376" d="m-21-129 40 0 14 111-64 0z"/><ellipse cx="0" cy="-152" rx="21" ry="29" fill="#a4ac8e"/><path d="m-22-151 1-23 16-11 18 3 11 17-5 15-7-15-12-5-13 12z" fill="#2a3d34"/><path d="m-18-122-20 62 5 30m50-92 17 62-5 30" fill="none" stroke="${i === 1 ? '#696851' : '#3a5141'}" stroke-width="14"/>${i === 1 ? '<path d="m-16-129 10 18 22-7 4-12z" fill="#a39167"/><path d="m-6-112 5 27 8-4-3-30z" fill="#a39167"/><path d="m-42-44 14 3" stroke="#c7bea0" stroke-width="4"/>' : '<path d="m-14-127 14 17 13-17" fill="none" stroke="#acb18e" stroke-width="2"/>'}</g>`).join('')}
    <path d="m22 12 560 283M25 285 570 27" stroke="#ccc6a4" stroke-opacity=".07"/><path d="M409 0q-13 51 3 104t-7 112l4 94" fill="none" stroke="#ddd4ae" stroke-opacity=".17"/>
    </g><g class="photo-hand" fill="#091720"><path d="M600 310H351l-5-42-17-44q-5-16 4-17 10-2 18 23l-1-92q0-15 8-15 9 0 9 15l6 53 6-71q1-12 8-11 8 1 7 15l-1 74 7-63q2-13 10-12 7 1 5 17l-3 66 8-45q3-11 9-8 7 2 5 15l-7 77-12 40 16 40z"/></g>
    </svg>`;
}
