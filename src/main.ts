import Phaser from 'phaser';
import { OpeningModel } from './core/OpeningModel.ts';
import { OpeningScene } from './scenes/OpeningScene.ts';
import { AppController } from './ui/AppController.ts';
import { MOVEMENT } from './data/opening.ts';
import { ui } from './ui/dom.ts';

function fatal(error: unknown): void {
  ui('fatal-error').hidden = false;
  ui('fatal-error').textContent =
    `The city could not start: ${error instanceof Error ? error.message : String(error)}. Reload to try again.`;
  ui('begin-button').disabled = true;
}

try {
  const model = new OpeningModel();
  const scene = new OpeningScene(model);
  new AppController(model, scene);
  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    canvas: ui('world'),
    parent: 'game-shell',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#14252f',
    banner: false,
    render: { antialias: true, roundPixels: false },
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: MOVEMENT.gravity }, fps: 120, fixedStep: true, debug: false },
    },
    input: { keyboard: { capture: [] } },
    audio: { noAudio: true },
    scene: [scene],
  });
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      game.destroy(false);
      window.location.reload();
    });
  window.addEventListener('error', (event) => fatal(event.error ?? event.message));
} catch (error) {
  fatal(error);
}
