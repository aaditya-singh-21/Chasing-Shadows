import type Phaser from 'phaser';
import { Painter } from './Painter.ts';

export const CHARACTER = { width: 128, height: 176, footY: 164, frames: 24, columns: 8 } as const;
export const POSE = {
  idle: 8,
  rise: 12,
  fall: 13,
  land: 14,
  reach: 15,
  look: 16,
  knock: 17,
  tap: 18,
  circle: 19,
  line: 20,
  triangle: 21,
  brake: 22,
} as const;

/** Art is generated locally once; Phaser animates the resulting sprite sheet. */
export function createCharacterTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('traveller')) return;
  const canvas = document.createElement('canvas');
  canvas.width = CHARACTER.width * CHARACTER.columns;
  canvas.height = CHARACTER.height * Math.ceil(CHARACTER.frames / CHARACTER.columns);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Character illustration requires Canvas 2D.');
  const art = new Painter(ctx);
  for (let frame = 0; frame < CHARACTER.frames; frame++) {
    ctx.save();
    ctx.translate(
      (frame % CHARACTER.columns) * CHARACTER.width + CHARACTER.width / 2,
      Math.floor(frame / CHARACTER.columns) * CHARACTER.height + CHARACTER.footY,
    );
    drawTraveller(art, frame);
    ctx.restore();
  }
  const texture = scene.textures.addCanvas('traveller', canvas);
  if (!texture) throw new Error('Could not create the traveller sprite sheet.');
  scene.textures.addSpriteSheet('traveller', texture, {
    frameWidth: CHARACTER.width,
    frameHeight: CHARACTER.height,
  });
  scene.anims.create({
    key: 'traveller-walk',
    frames: scene.anims.generateFrameNumbers('traveller', { start: 0, end: 7 }),
    frameRate: 11,
    repeat: -1,
  });
  scene.anims.create({
    key: 'traveller-idle',
    frames: scene.anims.generateFrameNumbers('traveller', { start: 8, end: 11 }),
    frameRate: 2,
    repeat: -1,
  });
}

function drawTraveller(a: Painter, frame: number): void {
  const c = a.ctx;
  const phase = frame < 8 ? (frame * Math.PI) / 4 : 0;
  const walking = frame < 8;
  const stride = walking ? Math.sin(phase) : 0;
  const crouch = frame === POSE.land ? 7 : frame === POSE.brake ? 2 : 0;
  const airborne = frame === POSE.rise || frame === POSE.fall;
  const breath = frame >= 8 && frame < 12 ? Math.sin(((frame - 8) * Math.PI) / 2) * 0.9 : 0;
  const bob = (walking ? -Math.abs(Math.cos(phase)) * 1.6 : breath) + crouch;
  const lean = frame === POSE.brake ? -0.05 : walking ? 0.035 : airborne ? -0.03 : 0;
  const coat = '#4e6360',
    coatLight = '#6d8174',
    skin = '#c3b9a0';
  c.save();
  c.translate(0, bob);
  c.rotate(lean);

  // Articulated boots, knees and hips; each foot lifts during its swing.
  for (const side of [-1, 1] as const) {
    const swing = stride * side;
    const lift = walking ? Math.max(0, swing) * 8 : airborne ? (side === 1 ? 10 : 3) : 0;
    const hip: [number, number] = [side * 6, -38];
    const knee: [number, number] = [side * 4 + swing * 9, -20 - lift * 0.45 - crouch];
    const foot: [number, number] = [side * 5 + swing * 17, -lift - crouch];
    a.path([hip, knee, foot], null, side === -1 ? '#233b40' : '#304a4b', 9);
    a.round(foot[0] - 7, foot[1] - 4, 20, 7, [3, 5, 2, 2], '#162e35', '#6b7b683b');
    a.line(foot[0] - 5, foot[1] + 2, foot[0] + 11, foot[1] + 2, '#a4a48655', 1);
  }

  // The back arm has a different value from the front to preserve depth.
  const armSwing = stride * 8;
  a.path(
    [
      [-11, -91],
      [-19 - armSwing * 0.3, -70],
      [-16 - armSwing, -49],
    ],
    null,
    '#344e4f',
    8,
  );
  a.ellipse(-16 - armSwing, -48, 3.5, 4.5, '#a3aa94');

  // An asymmetric storm coat, central seam, pockets and a recognisable torn cuff.
  const hemSway = walking ? Math.sin(phase - 0.6) * 3 : airborne ? -3 : 0;
  a.path(
    [
      [-13, -98],
      [11, -98],
      [17, -86],
      [12, -64],
      [19 + hemSway, -33],
      [10 + hemSway, -28],
      [-6, -30],
      [-21 + hemSway, -35],
      [-14, -68],
      [-17, -86],
    ],
    coat,
    '#9aa58c77',
  );
  a.path(
    [
      [-11, -96],
      [-5, -81],
      [-2, -64],
      [3, -86],
      [10, -97],
      [1, -94],
      [-3, -87],
    ],
    coatLight,
  );
  a.line(0, -80, 1 + hemSway * 0.2, -32, '#243e3d99');
  a.line(-13, -58, -6, -56, '#a4ae8e88');
  a.line(7, -59, 13, -61, '#213e3f99');
  for (const y of [-73, -62, -51]) a.ellipse(4, y, 1, 1.3, '#b5b094');
  a.line(-17 + hemSway, -36, 9 + hemSway, -31, '#b1b09633');

  // Satchel and strap create a distinct silhouette without a large asset budget.
  a.path(
    [
      [-9, -96],
      [12, -51],
    ],
    null,
    '#293f3e',
    3,
  );
  a.round(9, -56, 15, 19, 3, '#6a644d', '#ab9b7055');
  a.line(11, -49, 22, -49, '#b09e7355');
  a.rect(15, -48, 4, 4, '#bca577');

  a.round(-6, -105, 11, 12, 2, skin);
  const looking = frame === POSE.look ? -3 : 0;
  a.ellipse(looking + 1, -119, 10.5, 14, skin, '#cdd0b555');
  a.path(
    [
      [9 + looking, -121],
      [15 + looking, -116],
      [10 + looking, -113],
    ],
    skin,
  );
  a.path(
    [
      [-10 + looking, -117],
      [-12 + looking, -126],
      [-6 + looking, -135],
      [-1 + looking, -137],
      [3 + looking, -134],
      [9 + looking, -135],
      [14 + looking, -126],
      [9 + looking, -120],
      [7 + looking, -127],
      [1 + looking, -128],
      [-3 + looking, -123],
      [-5 + looking, -113],
    ],
    '#1b333c',
    '#6a7c7044',
  );
  a.line(7 + looking, -119, 10 + looking, -119, '#384b46', 1.4);
  a.line(8 + looking, -110, 11 + looking, -111, '#8c937e', 0.7);
  a.path(
    [
      [-11, -100],
      [-4, -92],
      [11, -96],
      [10, -103],
      [1, -99],
    ],
    '#bda071',
    '#d7c18b55',
  );
  a.path(
    [
      [-3, -95],
      [-8 + hemSway, -75],
      [-1 + hemSway, -78],
      [3, -96],
    ],
    '#ac8c60',
  );
  a.line(-5, -78, -2, -80, '#d8bc7b66');

  let arm: [number, number][] = [
    [12, -90],
    [20, -69 + armSwing * 0.3],
    [16 + armSwing, -49],
  ];
  if (frame === POSE.reach)
    arm = [
      [12, -90],
      [27, -87],
      [41, -80],
    ];
  if (frame === POSE.knock || frame === POSE.tap)
    arm = [
      [12, -90],
      [26, -79],
      [frame === POSE.tap ? 39 : 34, -96],
    ];
  if (frame >= POSE.circle && frame <= POSE.triangle) {
    const hands: [number, number][] = [
      [36, -80],
      [27, -105],
      [43, -96],
    ];
    arm = [[12, -90], [24, -78], hands[frame - POSE.circle]!];
  }
  a.path(arm, null, coatLight, 8);
  const hand = arm[2]!;
  a.line(hand[0] - 3, hand[1] - 7, hand[0] + 4, hand[1] - 6, '#d9d0aa', 2.3);
  a.line(hand[0] - 3, hand[1] - 5, hand[0] - 5, hand[1] - 1, '#d9d0aa', 1);
  a.ellipse(hand[0], hand[1], 3.5, 4.5, skin);
  c.restore();
}
