import test from 'node:test';
import assert from 'node:assert/strict';
import { ChapterModel } from '../src/core/ChapterModel.ts';
import {
  CAMPAIGN_KEY,
  CHAPTER_KEY,
  SAVE_KEY,
  SaveStore,
  validateSave,
} from '../src/systems/SaveStore.ts';
function ready() {
  const m = new ChapterModel();
  m.start();
  m.marks = new Set(['identity', 'brother', 'chapterComplete']);
  m.travel('shelter-rest', 900);
  return m;
}
function tick(m: ChapterModel, seconds: number) {
  for (let i = 0; i < seconds * 40; i++) m.update(0.025);
}
test('continuation requires completed Chapter One and starts once without replaying death', () => {
  const m = new ChapterModel();
  m.start();
  assert.equal(m.chapterTwo.begin(), false);
  const n = ready();
  assert.equal(n.chapterTwo.begin(), true);
  assert.equal(n.chapterTwo.begin(), false);
  assert.equal(n.sequence, null);
  assert.equal(n.room, 'shelter-rest');
  assert.equal(n.interaction?.id, 'farewell');
});
test('farewell freezes under pause and unfinished snapshots restore the uncovered cot', () => {
  const m = ready();
  m.chapterTwo.begin();
  m.interact();
  tick(m, 2);
  const before = m.sequenceTime;
  m.paused = true;
  tick(m, 10);
  assert.equal(m.sequenceTime, before);
  const n = new ChapterModel();
  n.start(m.snapshot());
  assert.equal(n.sequence, null);
  assert.equal(n.marks.has('farewell'), false);
  assert.equal(n.interaction?.id, 'farewell');
});
test('farewell completes once, learns from the present, and unlocks a reversible safe exit', () => {
  const m = ready();
  m.chapterTwo.begin();
  m.interact();
  tick(m, 7);
  assert.ok(m.marks.has('farewell'));
  assert.ok(m.marks.has('homeLead'));
  assert.equal(m.sequence, null);
  assert.notEqual(m.shadow.state.mode, 'reach');
  m.player.x = 1370;
  m.interact();
  assert.equal(m.room, 'residential-lane');
  const n = new ChapterModel();
  n.start(m.snapshot());
  assert.equal(n.room, 'residential-lane');
  n.player.x = 100;
  n.interact();
  assert.equal(n.room, 'shelter-rest');
  n.player.x = 980;
  assert.notEqual(n.interaction?.id, 'farewell');
});
test('unfinished and inconsistent lane saves normalize to justified safe progress', () => {
  const base = ready().snapshot();
  assert.ok(base.chapter);
  base.chapter.room = 'residential-lane';
  base.chapter.marks.push('chapterTwoStarted');
  assert.equal(validateSave(base)?.chapter?.room, 'shelter-rest');
  base.chapter.marks = ['farewell', 'homeLead', 'laneAlcove'];
  const s = validateSave(base);
  assert.equal(s?.chapter?.room, 'shelter-hall');
  assert.deepEqual(s?.chapter?.marks, []);
});
test('campaign saves preserve import keys, take precedence, and Begin removes stale continuation', () => {
  const old = JSON.stringify({ version: 2, checkpoint: ready().snapshot() });
  const map = new Map([
    [CHAPTER_KEY, old],
    [SAVE_KEY, 'legacy bytes'],
  ]);
  const storage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } as Storage;
  const store = new SaveStore(storage);
  const m = ready();
  m.chapterTwo.begin();
  store.write(m.snapshot());
  assert.equal(map.get(CHAPTER_KEY), old);
  assert.equal(map.get(SAVE_KEY), 'legacy bytes');
  assert.ok(new SaveStore(storage).checkpoint?.chapter?.marks.includes('chapterTwoStarted'));
  m.start();
  store.write(m.snapshot());
  assert.equal(
    new SaveStore(storage).checkpoint?.chapter?.marks.includes('chapterTwoStarted'),
    false,
  );
  map.set(CAMPAIGN_KEY, '{broken');
  assert.ok(new SaveStore(storage).checkpoint?.chapter?.marks.includes('chapterComplete'));
  map.set(CAMPAIGN_KEY, JSON.stringify({ version: 99, checkpoint: m.snapshot() }));
  assert.ok(new SaveStore(storage).checkpoint?.chapter?.marks.includes('chapterComplete'));
});
test('blocked campaign storage retains continuation in memory', () => {
  const store = new SaveStore({
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  } as unknown as Storage);
  const m = ready();
  m.chapterTwo.begin();
  store.write(m.snapshot());
  assert.equal(store.available, false);
  assert.ok(store.checkpoint?.chapter?.marks.includes('chapterTwoStarted'));
});
