import test from 'node:test';
import assert from 'node:assert/strict';
import { Movement } from '../src/systems/Movement.ts';
import { MOVEMENT } from '../src/data/opening.ts';

const neutral = { axis: 0, jumpPressed: false, jumpReleased: false };

test('a released jump is shorter than a held jump', () => {
  const movement = new Movement();
  const launch = movement.update(
    1 / 60,
    { vx: 0, vy: 0, grounded: true },
    { ...neutral, jumpPressed: true },
  );
  assert.equal(launch.vy, -MOVEMENT.jumpSpeed);
  const cut = movement.update(
    1 / 60,
    { vx: 0, vy: -510, grounded: false },
    { ...neutral, jumpReleased: true },
  );
  assert.equal(cut.vy, -MOVEMENT.jumpCutSpeed);
  const held = new Movement().update(1 / 60, { vx: 0, vy: -510, grounded: false }, neutral);
  assert.equal(held.vy, -510);
});

test('coyote time permits a jump shortly after leaving a ledge', () => {
  const movement = new Movement();
  movement.update(1 / 60, { vx: 100, vy: 0, grounded: true }, neutral);
  movement.update(0.04, { vx: 100, vy: 40, grounded: false }, neutral);
  assert.equal(
    movement.update(0.02, { vx: 100, vy: 60, grounded: false }, { ...neutral, jumpPressed: true })
      .jumped,
    true,
  );
});

test('a buffered press launches on landing, but never produces a midair double jump', () => {
  const movement = new Movement();
  movement.update(0.02, { vx: 0, vy: 100, grounded: false }, { ...neutral, jumpPressed: true });
  const landing = movement.update(0.02, { vx: 0, vy: 0, grounded: true }, neutral);
  assert.equal(landing.jumped, true);
  assert.equal(
    movement.update(0.02, { vx: 0, vy: -500, grounded: false }, { ...neutral, jumpPressed: true })
      .jumped,
    false,
  );
});

test('walking accelerates to its cap and stops without drifting', () => {
  const movement = new Movement();
  let vx = 0;
  for (let i = 0; i < 60; i++)
    vx = movement.update(1 / 60, { vx, vy: 0, grounded: true }, { ...neutral, axis: 1 }).vx;
  assert.equal(vx, MOVEMENT.speed);
  for (let i = 0; i < 20; i++)
    vx = movement.update(1 / 60, { vx, vy: 0, grounded: true }, neutral).vx;
  assert.equal(vx, 0);
});

test('expired buffered jumps do not launch unexpectedly after a long fall', () => {
  const movement = new Movement();
  movement.update(0.02, { vx: 0, vy: 100, grounded: false }, { ...neutral, jumpPressed: true });
  movement.update(0.2, { vx: 0, vy: 300, grounded: false }, neutral);
  assert.equal(movement.update(0.02, { vx: 0, vy: 0, grounded: true }, neutral).jumped, false);
});
