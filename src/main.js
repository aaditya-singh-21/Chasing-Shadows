import { Game, NOTES, ACCESS_SEQUENCE, SYMBOLS, validateSave } from './game.js';
import { Renderer, photographSVG } from './render.js';
import { Soundscape } from './audio.js';

const $ = id => document.getElementById(id);
const SAVE_KEY = 'chasing-shadows:opening:v1';
const SETTINGS_KEY = 'chasing-shadows:settings:v1';
const canvas = $('world');
const sound = new Soundscape();
let renderer;
let subtitleUntil = 0, saveUntil = 0, lastNow = performance.now();
let cachedSave = null, photoStage = 0, helpReturn = null, stored = true;
let lastLocation = '', lastObjective = '', lastCue = '', showWholeSequence = false;
let settings = { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };

try {
  const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
  cachedSave = validateSave(raw) ? raw : null;
  const prefs = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if (typeof prefs?.reduced === 'boolean') settings.reduced = prefs.reduced;
} catch { /* A damaged or unavailable browser save must never block starting. */ }

const game = new Game((type, value) => {
  if (type === 'sound') sound.play(value);
  if (type === 'say') {
    const line = document.createElement('span'); line.textContent = value.text;
    $('subtitle').replaceChildren(line); subtitleUntil = game.time + value.seconds;
    $('subtitle').classList.add('visible');
  }
  if (type === 'save' || type === 'autosave') save(value, type === 'save');
  if (type === 'note') { $('journal-dot').hidden = false; $('screen-reader-status').textContent = `Journal updated: ${NOTES[value].title}.`; }
  if (type === 'puzzle') {
    $('lamp-controls').hidden = value !== 'lamp';
    $('panel-controls').hidden = value !== 'panel';
    $('interaction').hidden = true;
    game.clearInput();
    if (value === 'lamp') { $('lamp-slider').value = String(game.lampX); $('lamp-slider').focus({ preventScroll: true }); }
    else if (value === 'panel') {
      showWholeSequence = false; lastCue = ''; updateSequence(); document.querySelector('[data-symbol="0"]').focus({ preventScroll: true });
    } else canvas.focus({ preventScroll: true });
  }
  if (type === 'sequence' || type === 'sequence-wrong') updateSequence();
  if (type === 'photo') {
    photoStage = 0; $('photograph').innerHTML = photographSVG(); $('photograph').classList.remove('remembering');
    $('photo-title').textContent = 'You were here before.';
    $('photo-description').textContent = 'The same coat. The same torn cuff. You are standing among people you don’t remember.';
    $('photo-next').firstChild.textContent = 'Look closer ';
    openDialog('photo-dialog');
  }
});

function save(data, announce = true) {
  cachedSave = data;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data)); stored = true;
    if (announce) { $('save-indicator').textContent = '◇  DISCOVERY SAVED'; saveUntil = game.time + 3; }
  } catch {
    stored = false;
    if (announce) { $('save-indicator').textContent = 'Save unavailable · keep this tab open'; saveUntil = game.time + 5; }
  }
  $('continue-button').hidden = false;
}

function begin(resume = false) {
  closeDialogs();
  $('title-screen').hidden = true; $('game-hud').hidden = false; $('pause-button').hidden = false; $('touch-controls').hidden = false;
  $('lamp-controls').hidden = true; $('panel-controls').hidden = true;
  game.start(resume ? cachedSave : null);
  if (renderer) renderer.snap = true;
  save(game.snapshot(), false);
  lastLocation = ''; lastObjective = '';
  $('journal-dot').hidden = true;
  canvas.focus({ preventScroll: true });
  sound.suspend(false);
}

function closeDialogs() { document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); }
function openDialog(id) {
  game.clearInput(); game.paused = true; $('interaction').hidden = true; sound.suspend(true);
  closeDialogs();
  $(id).showModal();
}
function pause() {
  if (!game.started || !$('title-screen').hidden || document.querySelector('dialog[open]')) return;
  if (game.player.grounded) save(game.snapshot(), false);
  $('checkpoint-note').textContent = stored ? 'Progress saved on this device.' : 'Browser storage is unavailable. Keep this tab open to retain progress.';
  openDialog('pause-dialog');
}
function journal() {
  const entries = $('journal-entries'); entries.replaceChildren();
  const ids = game.started ? game.notes : validateSave(cachedSave)?.notes || ['waking'];
  ids.forEach((id, index) => {
    const entry = document.createElement('article'); entry.className = 'journal-entry';
    const number = document.createElement('span'); number.className = 'entry-number'; number.textContent = `${String(index + 1).padStart(2, '0')} / ${id === 'waking' ? 'THE TERMINUS' : 'A DISCOVERY'}`;
    const title = document.createElement('h3'); title.textContent = NOTES[id].title;
    const text = document.createElement('p'); text.textContent = NOTES[id].text;
    entry.append(number, title, text); entries.append(entry);
  });
  $('journal-dot').hidden = true; openDialog('journal-dialog');
}
function showHelp(from = null) { helpReturn = from; $('reduced-motion').checked = settings.reduced; openDialog('help-dialog'); }
function updateSequence() {
  const progress = $('sequence-progress');
  progress.setAttribute('aria-label', `${game.sequenceInput.length} of 4 gestures entered`);
  [...progress.children].forEach((dot, index) => dot.classList.toggle('filled', index < game.sequenceInput.length));
}
async function toggleSound() {
  const enabled = await sound.toggle();
  $('sound-button').classList.toggle('sound-on', enabled);
  $('sound-button').setAttribute('aria-label', enabled ? 'Mute sound' : 'Enable sound');
  $('sound-button').setAttribute('aria-pressed', String(enabled));
  if (enabled) sound.suspend(game.paused);
}
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('game-shell').requestFullscreen) await $('game-shell').requestFullscreen();
    else game.say('Fullscreen is unavailable in this browser. You can still play here.');
  } catch { game.say('Fullscreen is unavailable here. Try opening the local address in your browser.'); }
}

$('begin-button').addEventListener('click', () => begin(false));
$('continue-button').hidden = !cachedSave;
$('continue-button').addEventListener('click', () => begin(true));
$('sound-button').addEventListener('click', toggleSound);
$('fullscreen-button').addEventListener('click', fullscreen);
document.addEventListener('fullscreenchange', () => $('fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen'));
$('pause-button').addEventListener('click', pause);
$('home-link').addEventListener('click', event => { event.preventDefault(); pause(); });
$('title-controls').addEventListener('click', () => showHelp());
$('help-button').addEventListener('click', () => showHelp('pause-dialog'));
$('journal-button').addEventListener('click', journal);
$('pause-journal').addEventListener('click', journal);
$('interaction').addEventListener('click', () => game.interact());
$('interaction').setAttribute('role', 'button'); $('interaction').tabIndex = 0;
$('interaction').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); game.interact(); } });
$('menu-button').addEventListener('click', () => {
  if (game.player.grounded) save(game.snapshot(), false);
  closeDialogs(); game.paused = true; game.clearInput();
  $('title-screen').hidden = false; $('game-hud').hidden = true; $('pause-button').hidden = true;
  $('touch-controls').hidden = true; $('lamp-controls').hidden = true; $('panel-controls').hidden = true;
  $('begin-button').focus();
});
$('lamp-slider').addEventListener('input', event => game.setLamp(Number(event.target.value)));
$('leave-lamp').addEventListener('click', () => game.leavePuzzle());
$('leave-panel').addEventListener('click', () => game.leavePuzzle());
document.querySelectorAll('[data-symbol]').forEach(button => button.addEventListener('click', () => game.enterSymbol(Number(button.dataset.symbol))));
$('show-sequence').addEventListener('click', () => { showWholeSequence = !showWholeSequence; $('show-sequence').textContent = showWholeSequence ? 'Watch the shadow again' : 'Show the whole rhythm'; });
$('reduced-motion').addEventListener('change', event => {
  settings.reduced = event.target.checked; renderer.reducedMotion = settings.reduced;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* Settings remain active for this session. */ }
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => {
    if (dialog.id === 'help-dialog' && helpReturn && !document.querySelector('dialog[open]')) {
      const previous = helpReturn; helpReturn = null; openDialog(previous); return;
    }
    game.paused = !game.started || !$('title-screen').hidden || Boolean(document.querySelector('dialog[open]'));
    sound.suspend(game.paused);
    if (!game.paused) canvas.focus({ preventScroll: true });
  });
});
$('photo-next').addEventListener('click', () => {
  if (photoStage === 0) {
    photoStage = 1; $('photograph').classList.add('remembering');
    $('photo-title').textContent = 'It doesn’t reach for you.';
    $('photo-description').textContent = 'Its hand settles on the person beside you. You don’t recognise them. Your shadow does.';
    $('photo-next').firstChild.textContent = 'Remember this ';
    sound.play('unease');
  } else { game.finish(); openDialog('ending-dialog'); }
});
$('keep-exploring').addEventListener('click', () => $('ending-dialog').close());
$('replay-button').addEventListener('click', () => begin(false));

const moveKeys = new Map([['a', 'left'], ['arrowleft', 'left'], ['d', 'right'], ['arrowright', 'right']]);
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (document.querySelector('dialog[open]')) return;
  if (key === 'escape') { event.preventDefault(); pause(); return; }
  if (key === 'm' && !event.repeat) { event.preventDefault(); toggleSound(); return; }
  if (key === 'f' && !event.repeat) { event.preventDefault(); fullscreen(); return; }
  if (!game.started || game.paused) return;
  if (key === 'j' && !event.repeat) { event.preventDefault(); journal(); return; }
  if (key === 'e' && !event.repeat) { event.preventDefault(); game.interact(); return; }
  if (event.target instanceof HTMLInputElement) return;
  if (moveKeys.has(key)) { event.preventDefault(); game.input[moveKeys.get(key)] = true; }
  if ([' ', 'w', 'arrowup'].includes(key)) { event.preventDefault(); if (!event.repeat) game.jump(); }
  if (game.mode === 'panel' && ['1', '2', '3'].includes(key) && !event.repeat) { event.preventDefault(); game.enterSymbol(Number(key) - 1); }
});
window.addEventListener('keyup', event => { const direction = moveKeys.get(event.key.toLowerCase()); if (direction) game.input[direction] = false; });
window.addEventListener('blur', () => { game.clearInput(); if (game.started && !game.paused) pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { game.clearInput(); if (game.started && !game.paused) pause(); } });

canvas.addEventListener('pointerdown', event => {
  if (!game.started || game.paused) return;
  canvas.focus({ preventScroll: true });
  const point = renderer.worldPoint(event.clientX, event.clientY);
  if (point.y > 560 && game.mode === 'walk') game.walkTo(point.x);
});
document.querySelectorAll('[data-hold]').forEach(button => {
  button.addEventListener('pointerdown', event => {
    event.preventDefault(); button.setPointerCapture(event.pointerId); game.input[button.dataset.hold] = true;
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => { game.input[button.dataset.hold] = false; });
});
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('pointerdown', event => {
  event.preventDefault(); if (button.dataset.action === 'jump') game.jump(); else game.interact();
}));

try {
  renderer = new Renderer(canvas, game); renderer.reducedMotion = settings.reduced; renderer.snap = true;
  window.addEventListener('resize', () => renderer.resize());
  function frame(now) {
    const dt = Math.min((now - lastNow) / 1000, .04); lastNow = now;
    game.update(dt);
    renderer.draw(dt, !$('title-screen').hidden);
    if (game.started && $('title-screen').hidden) {
      if (lastLocation !== game.location) { lastLocation = game.location; $('location').textContent = lastLocation; }
      if (lastObjective !== game.objective) { lastObjective = game.objective; $('objective').textContent = lastObjective; }
      const target = game.interaction;
      $('interaction').hidden = !target;
      if (target) $('interaction-label').textContent = target.label;
      $('subtitle').classList.toggle('visible', game.time < subtitleUntil && !game.paused && game.mode === 'walk');
      $('save-indicator').classList.toggle('visible', game.time < saveUntil);
      if (game.mode === 'lamp') {
        if (document.activeElement !== $('lamp-slider')) $('lamp-slider').value = String(Math.round(game.lampX));
        const status = game.alignmentDistance < 25 ? 'Hold the light. It’s reaching…' : game.alignmentDistance < 80 ? 'Almost. A little further.' : 'The shadows are apart.';
        if ($('lamp-status').textContent !== status) $('lamp-status').textContent = status;
        $('alignment-fill').style.width = `${game.alignment * 100}%`;
      }
      if (game.mode === 'panel') {
        const cueIndex = Math.floor(game.sequenceTime / .85) % 7;
        const symbol = ACCESS_SEQUENCE[cueIndex];
        const cue = showWholeSequence ? '○ Circle · △ Triangle · │ Line · ○ Circle' : symbol === undefined ? 'A pause. Then it begins again.' : `${cueIndex + 1} / 4  ·  ${['○', '│', '△'][symbol]} ${SYMBOLS[symbol]}`;
        if (lastCue !== cue) { $('sequence-cue').textContent = cue; lastCue = cue; }
        document.querySelectorAll('[data-symbol]').forEach(button => button.classList.toggle('cue', !showWholeSequence && Number(button.dataset.symbol) === symbol));
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
} catch (error) {
  $('fatal-error').hidden = false; $('fatal-error').textContent = `The city could not be drawn: ${error.message}`;
  $('begin-button').disabled = true;
}
