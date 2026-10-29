import test from 'node:test';
import assert from 'node:assert/strict';
import { OpeningModel } from '../src/core/OpeningModel.ts';
import type { GameEvent, SaveData } from '../src/core/types.ts';
import { ACCESS, LAMP, WORLD } from '../src/data/opening.ts';
import { SaveStore, validateSave, safeCheckpointX } from '../src/systems/SaveStore.ts';

function tick(model: OpeningModel, seconds: number): void {
  for (let frame = 0; frame < Math.ceil(seconds * 60); frame++) model.update(1 / 60);
}
function platform(flags: Record<string, boolean> = {}): OpeningModel {
  const model = new OpeningModel();
  model.start({ version: 1, flags: { doorOpen: true, ...flags }, x: LAMP.standX });
  return model;
}
function align(model: OpeningModel): void {
  model.setLamp(model.player.x - (LAMP.target - model.player.x) / LAMP.projection);
}

test('the light puzzle requires uninterrupted alignment and powered light', () => {
  const model = platform();
  model.interact();
  assert.equal(model.mode, 'lamp');
  tick(model, 3);
  assert.equal(model.flags.gateOpen, false);
  align(model);
  tick(model, 0.7);
  assert.equal(model.flags.gateOpen, false);
  model.setLamp(LAMP.max);
  tick(model, 0.5);
  assert.equal(model.lamp.alignment, 0);
  align(model);
  model.toggleLamp();
  tick(model, 2);
  assert.equal(model.flags.gateOpen, false);
  model.toggleLamp();
  tick(model, 1.5);
  assert.equal(model.flags.gateOpen, true);
});

test('the lamp stays usable after solving, without relocking or duplicate discoveries', () => {
  const model = platform(),
    events: GameEvent[] = [];
  model.events.on((event) => events.push(event));
  model.interact();
  align(model);
  tick(model, 1.5);
  assert.equal(model.mode, 'walk');
  assert.equal(model.interaction?.id, 'lamp');
  assert.equal(model.interaction?.label, 'Adjust the maintenance lamp');
  model.interact();
  model.setLamp(LAMP.max);
  model.toggleLamp();
  tick(model, 2);
  assert.equal(model.flags.gateOpen, true);
  assert.equal(model.lamp.on, false);
  assert.ok(model.gateAmount > 0.99);
  model.toggleLamp();
  align(model);
  tick(model, 2);
  assert.equal(model.mode, 'lamp');
  assert.equal(
    events.filter((event) => event.type === 'note' && event.value === 'light').length,
    1,
  );
});

test('revisiting from the street approaches the lamp marker instead of teleporting', () => {
  const model = platform({ gateOpen: true });
  model.player.x = 2700;
  model.interact();
  assert.equal(model.player.x, 2700);
  assert.equal(model.mode, 'approach-lamp');
  assert.equal(model.walkTarget, LAMP.standX);
  model.player.x = LAMP.standX;
  model.update(1 / 60);
  assert.equal(model.mode, 'lamp');
  assert.equal(model.walkTarget, null);
});

test('stepping away saves light position and power; resume restores both', () => {
  const model = platform({ gateOpen: true });
  let checkpoint: SaveData | undefined;
  model.events.on((event) => {
    if (event.type === 'save') checkpoint = event.value;
  });
  model.interact();
  model.setLamp(2137);
  model.toggleLamp();
  model.leavePuzzle();
  assert.ok(checkpoint);
  const restored = new OpeningModel();
  restored.start(checkpoint);
  assert.equal(restored.lamp.x, 2137);
  assert.equal(restored.lamp.on, false);
  assert.equal(restored.mode, 'walk');
  assert.equal(restored.flags.gateOpen, true);
});

test('old Canvas v1 checkpoints remain compatible, with the light on by default', () => {
  const save = validateSave({ version: 1, flags: { gateOpen: true }, x: 3000, lampX: 2003 });
  assert.ok(save);
  assert.equal(save.lampOn, true);
  assert.equal(save.flags.doorOpen, true);
  const model = new OpeningModel();
  model.start(save);
  assert.deepEqual(model.notes, ['waking', 'shadow', 'light']);
  assert.equal(model.player.x, 3000);
});

test('pause freezes narrative timers, gate lift and light puzzle progress', () => {
  const model = platform();
  model.interact();
  align(model);
  model.paused = true;
  const time = model.time;
  tick(model, 5);
  assert.equal(model.time, time);
  assert.equal(model.lamp.alignment, 0);
  assert.equal(model.gateAmount, 0);
});

test('wrong access input resets, and the panel remains reusable after unlocking', () => {
  const model = platform({ gateOpen: true });
  model.player.x = ACCESS.x;
  model.interact();
  model.enterSymbol(0);
  model.enterSymbol(1);
  assert.deepEqual(model.access.input, []);
  assert.equal(model.flags.panelOpen, false);
  for (const symbol of ACCESS.sequence) model.enterSymbol(symbol);
  assert.equal(model.flags.panelOpen, true);
  assert.equal(model.mode, 'walk');
  model.interact();
  assert.equal(model.mode, 'panel');
  for (const symbol of ACCESS.sequence) model.enterSymbol(symbol);
  assert.equal(model.flags.panelOpen, true);
  assert.equal(model.notes.filter((note) => note === 'access').length, 1);
});

test('the access demonstration is moved beside the panel even during a remembered knock', () => {
  const model = platform({ gateOpen: true });
  model.player.x = ACCESS.x;
  model.shadow.pose('knock', 4310);
  model.interact();
  assert.equal(model.shadow.state.mode, 'code');
  assert.equal(model.shadow.state.x, ACCESS.shadowX);
});

test('discoveries are ordered, persisted, and reset by a new opening', () => {
  const model = platform();
  model.update(1 / 60);
  model.interact();
  align(model);
  tick(model, 1.5);
  model.player.x = 4000;
  model.update(1 / 60);
  model.player.x = ACCESS.x;
  model.interact();
  for (const symbol of ACCESS.sequence) model.enterSymbol(symbol);
  model.player.x = 5920;
  model.finish();
  assert.deepEqual(model.notes, ['waking', 'shadow', 'light', 'knock', 'access', 'photo']);
  const restored = new OpeningModel();
  restored.start(model.snapshot());
  assert.deepEqual(restored.notes, model.notes);
  assert.equal(restored.flags.finished, true);
  restored.start();
  assert.deepEqual(restored.notes, ['waking']);
  assert.equal(restored.player.x, WORLD.startX);
});

test('corrupt and non-finite saved values are safely rejected or bounded', () => {
  assert.equal(validateSave(null), null);
  assert.equal(validateSave({ version: 7 }), null);
  assert.equal(validateSave({ version: 1, flags: {}, x: NaN })?.x, WORLD.startX);
  assert.equal(validateSave({ version: 1, flags: {}, lampX: Infinity })?.lampX, LAMP.initial);
  assert.ok((validateSave({ version: 1, flags: {}, x: 100000 })?.x ?? Infinity) < 1090);
  assert.equal(safeCheckpointX(800), 727);
  assert.equal(safeCheckpointX(3500), 3435);
});

test('blocked browser storage falls back to an in-memory checkpoint', () => {
  const unavailable = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  } as unknown as Storage;
  const store = new SaveStore(unavailable),
    checkpoint = platform().snapshot();
  store.write(checkpoint);
  assert.equal(store.available, false);
  assert.equal(store.checkpoint?.x, checkpoint.x);
});

test('a light projection remains responsive during a repeated interaction', () => {
  const model = platform({ gateOpen: true });
  model.interact();
  model.setLamp(LAMP.max);
  model.update(1 / 60);
  const previous = model.shadow.state.x;
  model.setLamp(LAMP.min);
  model.update(1 / 60);
  assert.ok(model.shadow.state.x > previous);
  assert.equal(model.flags.gateOpen, true);
});
