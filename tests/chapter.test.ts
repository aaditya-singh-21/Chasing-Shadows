import test from 'node:test';
import assert from 'node:assert/strict';
import { ChapterModel } from '../src/core/ChapterModel.ts';
import {
  validateSave,
  SaveStore,
  SAVE_KEY,
  CHAPTER_KEY,
  CAMPAIGN_KEY,
} from '../src/systems/SaveStore.ts';
import { ROOMS } from '../src/data/rooms.ts';
function tick(m: ChapterModel, n: number) {
  for (let t = 0; t < n; t += 0.025) m.update(0.025);
}
function game() {
  const m = new ChapterModel();
  m.start();
  return m;
}
test('all chapter and continuation rooms have safe destinations', () => {
  assert.equal(Object.keys(ROOMS).length, 8);
  for (const r of Object.values(ROOMS))
    for (const d of r.doors) {
      assert.ok(d.spawn > 0 && d.spawn < ROOMS[d.to].width);
    }
});
test('suitcase is automatic, persistent and does not need grounded interaction', () => {
  const m = game();
  m.player.x = 900;
  m.player.grounded = false;
  tick(m, 0.1);
  assert.ok(m.marks.has('suitcase'));
  const n = game();
  n.start(m.snapshot());
  assert.ok(n.marks.has('suitcase'));
});
test('workshop name precedes brother memory and photo is not chapter completion', () => {
  const m = game();
  m.travel('workshop', 500);
  tick(m, 0.1);
  assert.ok(m.marks.has('identity'));
  m.finish();
  assert.ok(!m.marks.has('chapterComplete'));
  m.travel('shelter-hall', 750);
  tick(m, 0.1);
  assert.equal(m.sequence, 'memory');
  tick(m, 18.1);
  assert.ok(m.marks.has('brother'));
});
test('rest room cannot reveal death without earlier brother recognition', () => {
  const m = game();
  m.travel('shelter-rest', 850);
  tick(m, 10);
  assert.ok(!m.marks.has('chapterComplete'));
});
test('ending occurs once after the nine-second recognition', () => {
  const m = game();
  m.marks.add('brother');
  m.travel('shelter-rest', 850);
  let ends = 0;
  m.events.on((e) => {
    if (e.type === 'chapter-end') ends++;
  });
  tick(m, 10);
  tick(m, 10);
  assert.equal(ends, 1);
  assert.ok(m.marks.has('chapterComplete'));
});
test('trolley warns, pause freezes it, death restores safe entry', () => {
  const m = game();
  m.travel('service-passage', 300);
  m.player.x = 500;
  tick(m, 1);
  assert.equal(m.trolleyX, 80);
  const t = m.hazardTime;
  m.paused = true;
  tick(m, 5);
  assert.equal(m.hazardTime, t);
  m.paused = false;
  tick(m, 1.6);
  m.player.x = m.trolleyX;
  tick(m, 0.1);
  assert.equal(m.sequence, 'death');
  tick(m, 20);
  assert.equal(m.sequence, 'death');
  assert.ok(m.retry());
  assert.equal(m.player.x, 300);
  assert.equal(m.hazardTime, -1);
});
test('active encounter snapshot never captures imminent danger', () => {
  const m = game();
  m.travel('service-passage', 300);
  m.player.x = 800;
  tick(m, 1);
  assert.equal(m.snapshot().x, 300);
  m.travel('shelter-lower', 200);
  m.player.x = 500;
  tick(m, 5);
  assert.equal(m.snapshot().x, 200);
});
test('successful trolley passage cannot restart', () => {
  const m = game();
  m.travel('service-passage', 300);
  m.player.x = 2600;
  tick(m, 0.1);
  assert.ok(m.marks.has('trolley'));
  m.travel('service-passage', 500);
  tick(m, 20);
  assert.equal(m.hazardTime, -1);
  assert.equal(m.sequence, null);
});
test('flood warning and recovery preserve the brother memory', () => {
  const m = game();
  m.marks.add('brother');
  m.travel('shelter-lower', 200);
  m.player.x = 500;
  m.player.y = 1300;
  tick(m, 8);
  assert.ok(m.sequence === 'death' || m.player.x === 200);
  assert.equal(m.sequence, 'death');
  assert.ok(m.retry());
  assert.ok(m.marks.has('brother'));
  assert.equal(m.player.x, 200);
});
test('upper landing ends flood and saves safe height', () => {
  const m = game();
  m.travel('shelter-lower', 200);
  m.player.x = 1700;
  m.player.y = 880;
  tick(m, 0.1);
  assert.ok(m.marks.has('flood'));
  assert.equal(m.snapshot().chapter?.y, 880);
});
test('shelter shortcut needs inside operation and power guards service door', () => {
  const m = game();
  m.flags.gateOpen = true;
  m.player.x = 3980;
  assert.notEqual(m.interaction?.id, 'travel');
  m.travel('workshop', 1600);
  assert.equal(m.interaction, null);
  m.travel('shelter-hall', 100);
  m.interact();
  assert.equal(m.room, 'street');
  assert.ok(m.marks.has('shortcut'));
});
test('legacy finish migrates into workshop, not chapter completion', () => {
  const s = validateSave({ version: 1, x: 5920, flags: { finished: true } });
  assert.equal(s?.chapter?.room, 'workshop');
  assert.ok(!s?.chapter?.marks.includes('chapterComplete'));
});
test('new storage preserves legacy bytes and falls back from corrupt v2', () => {
  const map = new Map([
    [SAVE_KEY, JSON.stringify({ version: 1, x: 500, flags: {} })],
    [CHAPTER_KEY, 'broken'],
  ]);
  const storage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => map.set(k, v),
  } as unknown as Storage;
  const before = map.get(SAVE_KEY);
  const store = new SaveStore(storage);
  assert.ok(store.checkpoint);
  const m = game();
  store.write(m.snapshot());
  assert.equal(map.get(SAVE_KEY), before);
  assert.equal(JSON.parse(map.get(CAMPAIGN_KEY)!).version, 3);
  assert.equal(map.get(CHAPTER_KEY), 'broken');
});

test('every authored doorway reaches its matching safe destination', () => {
  const m = game();
  m.flags.panelOpen = true;
  m.marks = new Set(['power', 'brother', 'shortcut', 'flood', 'trolley', 'farewell']);
  for (const [id, r] of Object.entries(ROOMS))
    for (const d of r.doors) {
      m.travel(id as keyof typeof ROOMS, d.x);
      m.interact();
      assert.equal(m.room, d.to);
      assert.equal(m.player.x, d.spawn);
      assert.equal(m.mode, 'walk');
    }
});
test('chapter street saves cannot bypass locked progression', () => {
  const s = validateSave({
    version: 2,
    checkpoint: { version: 1, x: 5000, flags: {}, chapter: { room: 'street', marks: [], y: NaN } },
  });
  assert.ok(s && s.x < 1110);
  assert.equal(s.chapter?.y, 700);
});
test('flood clock freezes under pause and reload restores its dry entrance', () => {
  const m = game();
  m.marks.add('brother');
  m.travel('shelter-lower', 200);
  m.player.x = 500;
  tick(m, 1);
  const t = m.hazardTime;
  m.paused = true;
  tick(m, 20);
  assert.equal(m.hazardTime, t);
  const n = game();
  n.start(m.snapshot());
  assert.equal(n.hazardTime, -1);
  assert.equal(n.player.x, 200);
  assert.ok(n.marks.has('brother'));
});
test('completed memory and chapter ending survive reload without replay', () => {
  const m = game();
  m.marks = new Set(['identity', 'brother', 'chapterComplete']);
  m.travel('shelter-rest', 850);
  const n = game();
  n.start(m.snapshot());
  tick(n, 12);
  assert.equal(n.sequence, null);
  assert.ok(n.marks.has('chapterComplete'));
});
test('valid chapter save takes precedence over a legacy checkpoint', () => {
  const m = game();
  m.travel('workshop', 500);
  tick(m, 0.1);
  const map = new Map([
    [CHAPTER_KEY, JSON.stringify({ version: 2, checkpoint: m.snapshot() })],
    [SAVE_KEY, JSON.stringify({ version: 1, x: 440, flags: {} })],
  ]);
  const store = new SaveStore({ getItem: (k: string) => map.get(k) ?? null } as Storage);
  assert.equal(store.checkpoint?.chapter?.room, 'workshop');
  assert.ok(store.checkpoint?.chapter?.marks.includes('identity'));
});

test('walking past the unlocked workshop never enters automatically', () => {
  const m = game();
  m.flags.panelOpen = true;
  m.player.x = 5400;
  tick(m, 0.2);
  assert.equal(m.room, 'street');
  assert.ok(!m.marks.has('identity'));
  m.player.x = 5100;
  m.interact();
  assert.equal(m.room, 'workshop');
});
test('employee portrait can be read without ending the chapter', () => {
  const m = game();
  m.flags.panelOpen = true;
  m.player.x = 5920;
  tick(m, 0.1);
  let opened = false;
  m.events.on((e) => {
    if (e.type === 'identity') opened = true;
  });
  m.interact();
  assert.ok(opened);
  assert.ok(m.marks.has('identity'));
  assert.ok(!m.marks.has('chapterComplete'));
});
test('memory has multiple timed dialogue beats and freezes under pause', () => {
  const m = game();
  m.travel('shelter-hall', 750);
  const lines: string[] = [];
  m.events.on((e) => {
    if (e.type === 'say') lines.push(e.value.text);
  });
  tick(m, 0.1);
  tick(m, 8);
  assert.equal(m.sequence, 'memory');
  assert.ok(lines.some((l) => l.includes('Hold still')));
  assert.ok(lines.some((l) => l.includes('nineteen')));
  m.paused = true;
  const t = m.sequenceTime;
  tick(m, 5);
  assert.equal(m.sequenceTime, t);
  m.paused = false;
  tick(m, 11);
  assert.equal(m.sequence, null);
  assert.ok(m.marks.has('brother'));
});

test('death emits one cause, waits indefinitely, then retries a safe checkpoint', () => {
  const m = game();
  m.travel('shelter-lower', 200);
  m.player.x = 500;
  const causes: string[] = [];
  m.events.on((e) => {
    if (e.type === 'death') causes.push(e.value);
  });
  m.die('flood');
  m.die('trolley');
  const time = m.time;
  tick(m, 60);
  assert.equal(m.time, time);
  assert.equal(m.sequence, 'death');
  assert.deepEqual(causes, ['flood']);
  assert.equal(m.snapshot().x, 200);
  assert.ok(m.retry());
  assert.equal(m.player.x, 200);
  assert.equal(m.sequence, null);
  assert.equal(m.hazardTime, -1);
  assert.equal(m.retry(), false);
});
test('death checkpoint survives return to title and Continue', () => {
  const m = game();
  m.marks.add('brother');
  m.travel('shelter-lower', 200);
  m.player.x = 550;
  m.die('flood');
  const saved = m.snapshot();
  m.inTitle = true;
  m.paused = true;
  const resumed = game();
  resumed.start(saved);
  assert.equal(resumed.sequence, null);
  assert.equal(resumed.player.x, 200);
  assert.ok(resumed.marks.has('brother'));
});
