import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, FLOOR, LAMP_TARGET, ACCESS_SEQUENCE, validateSave } from '../src/game.js';

function simulate(game, seconds) { for (let i = 0; i < Math.ceil(seconds * 60); i++) game.update(1 / 60); }
function atPlatform(emit) {
  const game = new Game(emit);
  game.start({ version: 1, flags: { doorOpen: true }, x: 2330 });
  return game;
}

test('the suitcase blocks walking, but a jump clears it and lands safely', () => {
  const game = new Game(); game.start(); game.input.right = true;
  simulate(game, 3);
  assert.ok(game.player.x <= 735);
  game.jump(); simulate(game, .65); game.input.right = false; simulate(game, 1);
  assert.ok(game.player.x > 842);
  assert.equal(game.player.y, FLOOR);
  assert.equal(game.player.grounded, true);
});

test('the tram door cannot be walked through; interaction opens it', () => {
  const game = new Game(); game.start(); game.player.x = 1000; game.input.right = true;
  simulate(game, 2); assert.equal(game.player.x, 1090);
  game.interact(); assert.equal(game.flags.doorOpen, true);
  game.input.right = true; simulate(game, 1);
  assert.ok(game.player.x > 1200);
});

test('the first shadow deviation creates one journal entry and one event', () => {
  const notes = []; const game = atPlatform((type, value) => { if (type === 'note') notes.push(value); });
  simulate(game, 1); assert.equal(game.shadow.mode, 'linger');
  simulate(game, 10);
  assert.equal(notes.filter(note => note === 'shadow').length, 1);
  assert.equal(game.shadow.mode, 'follow');
});

test('a mismatched light cannot unlock the shutter; alignment must be held', () => {
  const game = atPlatform(); game.interact(); assert.equal(game.mode, 'lamp');
  simulate(game, 4); assert.equal(game.flags.gateOpen, false);
  game.setLamp(2360 - (LAMP_TARGET - 2360) / 1.15);
  simulate(game, .7); assert.equal(game.flags.gateOpen, false);
  game.setLamp(2220); simulate(game, .5); assert.equal(game.alignment, 0);
  game.setLamp(2360 - (LAMP_TARGET - 2360) / 1.15); simulate(game, 1.5);
  assert.equal(game.flags.gateOpen, true); assert.equal(game.mode, 'walk');
  assert.ok(game.notes.includes('light'));
});

test('the closed shutter blocks movement until its animation clears the passage', () => {
  const game = atPlatform(); game.player.x = 2800; game.input.right = true;
  simulate(game, 1); assert.equal(game.player.x, 2840);
  game.flags.gateOpen = true; game.gateAmount = 0;
  simulate(game, .5); assert.equal(game.player.x, 2840);
  simulate(game, 2); assert.ok(game.player.x > 2900);
});

test('a wrong access gesture resets the attempt and the correct rhythm unlocks', () => {
  const game = new Game(); game.start({ version: 1, flags: { gateOpen: true }, x: 5120 });
  game.interact(); assert.equal(game.mode, 'panel');
  game.enterSymbol(0); game.enterSymbol(1);
  assert.equal(game.sequenceInput.length, 0); assert.equal(game.flags.panelOpen, false);
  for (const symbol of ACCESS_SEQUENCE) game.enterSymbol(symbol);
  assert.equal(game.flags.panelOpen, true); assert.equal(game.mode, 'walk');
});

test('pause freezes movement, puzzle progress, and story time', () => {
  const game = atPlatform(); game.interact();
  game.setLamp(2360 - (LAMP_TARGET - 2360) / 1.15);
  const x = game.player.x, time = game.time;
  game.paused = true; simulate(game, 10);
  assert.equal(game.player.x, x); assert.equal(game.time, time); assert.equal(game.alignment, 0);
});

test('the access demonstration stays visible even when the earlier knock has not finished', () => {
  const game = new Game(); game.start({ version: 1, flags: { gateOpen: true }, x: 5120 });
  game.shadow.mode = 'knock'; game.shadow.x = 4310;
  game.interact();
  assert.equal(game.shadow.mode, 'code'); assert.equal(game.shadow.x, 5220);
});

test('checkpoint restore preserves discoveries without replaying them', () => {
  const game = atPlatform();
  game.flags.gateOpen = true; game.flags.knocked = true; game.flags.panelOpen = true; game.player.x = 5920;
  game.finish(); const snapshot = game.snapshot();
  const restored = new Game(); restored.start(snapshot);
  assert.equal(restored.flags.finished, true); assert.equal(restored.player.x, 5920);
  assert.deepEqual(restored.notes, ['waking', 'shadow', 'light', 'knock', 'access', 'photo']);
  restored.start(); assert.equal(restored.flags.finished, false); assert.deepEqual(restored.notes, ['waking']);
});

test('damaged saves are rejected or normalized to a playable checkpoint', () => {
  assert.equal(validateSave(null), null); assert.equal(validateSave({ version: 7 }), null);
  assert.equal(validateSave({ version: 1, flags: {}, x: NaN }).x, 440);
  assert.equal(validateSave({ version: 1, flags: {}, x: 999999 }).x, 1010);
  assert.equal(validateSave({ version: 1, flags: {}, x: 800 }).x, 700);
  const result = validateSave({ version: 1, flags: { finished: true }, x: 5900 });
  assert.equal(result.flags.doorOpen, true); assert.equal(result.flags.gateOpen, true);
});

test('airborne checkpoints restore beside obstacles instead of inside them', () => {
  const game = atPlatform(); game.flags.gateOpen = true; game.player.x = 3500; game.player.y = 590; game.player.grounded = false;
  const checkpoint = game.snapshot(); assert.equal(checkpoint.x, 3435);
  const restored = new Game(); restored.start(checkpoint); simulate(restored, 1);
  assert.equal(restored.player.y, FLOOR); assert.equal(restored.player.x, 3435);
});
