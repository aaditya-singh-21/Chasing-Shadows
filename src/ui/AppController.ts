import type { OpeningModel } from '../core/OpeningModel.ts';
import type { GameEvent, SaveData } from '../core/types.ts';
import type { OpeningScene } from '../scenes/OpeningScene.ts';
import { ACCESS, NOTES } from '../data/opening.ts';
import { photographSVG } from '../art/photograph.ts';
import { Soundscape } from '../systems/Soundscape.ts';
import { SaveStore, SETTINGS_KEY, notesFromFlags } from '../systems/SaveStore.ts';
import { ui, type DialogId } from './dom.ts';

export class AppController {
  private readonly sound = new Soundscape();
  private readonly store = new SaveStore();
  private readonly model: OpeningModel;
  private readonly scene: OpeningScene;
  private subtitleUntil = 0;
  private saveUntil = 0;
  private photoStage = 0;
  private helpReturn: DialogId | null = null;
  private lastLocation = '';
  private lastObjective = '';
  private lastCue = '';
  private showWholeSequence = false;
  private accessFeedbackUntil = 0;
  private switchingDialogs = false;

  constructor(model: OpeningModel, scene: OpeningScene) {
    this.model = model;
    this.scene = scene;
    model.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      const preferences: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
      if (
        preferences &&
        typeof preferences === 'object' &&
        'reduced' in preferences &&
        typeof preferences.reduced === 'boolean'
      )
        model.reducedMotion = preferences.reduced;
    } catch {
      /* Use the system setting when storage is unavailable. */
    }
    ui('begin-button').disabled = true;
    ui('continue-button').disabled = true;
    ui('continue-button').hidden = !this.store.checkpoint;
    scene.onReady = () => {
      ui('begin-button').disabled = false;
      ui('continue-button').disabled = false;
    };
    scene.onFrame = () => this.update();
    model.events.on((event) => this.handle(event));
    this.bind();
  }

  private handle(event: GameEvent): void {
    switch (event.type) {
      case 'sound':
        this.sound.play(event.value);
        break;
      case 'say': {
        const span = document.createElement('span');
        span.textContent = event.value.text;
        ui('subtitle').replaceChildren(span);
        this.subtitleUntil = this.model.time + event.value.seconds;
        break;
      }
      case 'save':
      case 'autosave':
        this.save(event.value, event.type === 'save');
        break;
      case 'note':
        ui('journal-dot').hidden = false;
        ui('screen-reader-status').textContent =
          `Journal updated: ${NOTES[event.value].title.replace(/[.!?]+$/, '')}.`;
        break;
      case 'puzzle':
        this.puzzle(event.value);
        break;
      case 'sequence':
        this.accessFeedbackUntil = 0;
        this.updateSequence();
        break;
      case 'sequence-wrong':
        this.accessFeedbackUntil = this.model.time + 2;
        this.updateSequence();
        break;
      case 'photo':
        this.openPhoto();
        break;
      case 'start':
        break;
    }
  }

  private save(checkpoint: SaveData, announce: boolean): void {
    this.store.write(checkpoint);
    if (announce) {
      ui('save-indicator').textContent = this.store.available
        ? '◇  DISCOVERY SAVED'
        : 'Save unavailable · keep this tab open';
      this.saveUntil = this.model.time + (this.store.available ? 3 : 5);
    }
    ui('continue-button').hidden = false;
  }

  private begin(resume = false): void {
    this.helpReturn = null;
    this.closeDialogs();
    ui('title-screen').hidden = true;
    ui('game-hud').hidden = false;
    ui('pause-button').hidden = false;
    ui('touch-controls').hidden = false;
    ui('lamp-controls').hidden = true;
    ui('panel-controls').hidden = true;
    this.model.start(resume ? this.store.checkpoint : null);
    this.save(this.model.snapshot(), false);
    this.lastLocation = '';
    this.lastObjective = '';
    ui('journal-dot').hidden = true;
    this.scene.clearInput();
    ui('world').focus({ preventScroll: true });
    this.sound.suspend(false);
  }

  private closeDialogs(): void {
    this.switchingDialogs = true;
    document
      .querySelectorAll<HTMLDialogElement>('dialog[open]')
      .forEach((dialog) => dialog.close());
    this.switchingDialogs = false;
  }
  private openDialog(id: DialogId): void {
    this.scene.clearInput();
    this.model.paused = true;
    ui('interaction').hidden = true;
    this.sound.suspend(true);
    this.closeDialogs();
    ui(id).showModal();
  }
  private pause(): void {
    if (!this.model.started || this.model.inTitle || document.querySelector('dialog[open]')) return;
    this.save(this.model.snapshot(), false);
    ui('checkpoint-note').textContent = this.store.available
      ? 'Progress saved on this device.'
      : 'Browser storage is unavailable. Keep this tab open to retain progress.';
    this.openDialog('pause-dialog');
  }

  private journal(): void {
    const entries = ui('journal-entries');
    entries.replaceChildren();
    const ids = this.model.started
      ? this.model.notes
      : this.store.checkpoint
        ? notesFromFlags(this.store.checkpoint.flags)
        : (['waking'] as const);
    ids.forEach((id, index) => {
      const entry = document.createElement('article');
      entry.className = 'journal-entry';
      const number = document.createElement('span');
      number.className = 'entry-number';
      number.textContent = `${String(index + 1).padStart(2, '0')} / ${id === 'waking' ? 'THE TERMINUS' : 'A DISCOVERY'}`;
      const title = document.createElement('h3');
      title.textContent = NOTES[id].title;
      const text = document.createElement('p');
      text.textContent = NOTES[id].text;
      entry.append(number, title, text);
      entries.append(entry);
    });
    ui('journal-dot').hidden = true;
    this.openDialog('journal-dialog');
  }

  private showHelp(from: DialogId | null = null): void {
    this.helpReturn = from;
    ui('reduced-motion').checked = this.model.reducedMotion;
    this.openDialog('help-dialog');
  }
  private updateSequence(): void {
    ui('sequence-progress').setAttribute(
      'aria-label',
      `${this.model.access.input.length} of 4 gestures entered`,
    );
    [...ui('sequence-progress').children].forEach((dot, index) =>
      dot.classList.toggle('filled', index < this.model.access.input.length),
    );
  }

  private puzzle(mode: 'lamp' | 'panel' | null): void {
    ui('lamp-controls').hidden = mode !== 'lamp';
    ui('panel-controls').hidden = mode !== 'panel';
    ui('interaction').hidden = true;
    this.scene.clearInput();
    if (mode === 'lamp') {
      ui('lamp-slider').value = String(this.model.lamp.x);
      ui('lamp-copy').textContent = this.model.flags.gateOpen
        ? 'The shutter is latched open. You can still move the light.'
        : 'Bring your shadow’s hand to the shadow of the latch.';
      ui('lamp-slider').focus({ preventScroll: true });
    } else if (mode === 'panel') {
      this.showWholeSequence = false;
      this.accessFeedbackUntil = 0;
      this.lastCue = '';
      this.updateSequence();
      ui('show-sequence').textContent = 'Show the whole rhythm';
      document
        .querySelector<HTMLButtonElement>('[data-symbol="0"]')
        ?.focus({ preventScroll: true });
    } else ui('world').focus({ preventScroll: true });
  }

  private openPhoto(): void {
    this.photoStage = 0;
    ui('photograph').innerHTML = photographSVG();
    ui('photograph').classList.remove('remembering');
    ui('photograph').setAttribute(
      'aria-label',
      'An old staff photograph: four transit workers. One wears your distinctive scarf and coat, with its torn cuff.',
    );
    ui('photo-title').textContent = 'You were here before.';
    ui('photo-description').textContent =
      'The same scarf. The same torn cuff. You are standing among people you don’t remember.';
    this.setPhotoButton('Look closer');
    this.openDialog('photo-dialog');
    ui('photo-dialog').scrollTop = 0;
  }
  private setPhotoButton(text: string): void {
    const label = ui('photo-next').querySelector('[data-label]');
    if (label) label.textContent = text;
  }

  private async toggleSound(): Promise<void> {
    const enabled = await this.sound.toggle();
    ui('sound-button').classList.toggle('sound-on', enabled);
    ui('sound-button').setAttribute('aria-label', enabled ? 'Mute sound' : 'Enable sound');
    ui('sound-button').setAttribute('aria-pressed', String(enabled));
    if (enabled) this.sound.suspend(this.model.paused);
  }
  private async fullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await ui('game-shell').requestFullscreen();
    } catch {
      this.model.say('Fullscreen is unavailable here. You can still play in this window.');
    }
  }

  private bind(): void {
    const m = this.model;
    ui('begin-button').addEventListener('click', () => this.begin());
    ui('continue-button').addEventListener('click', () => this.begin(true));
    ui('sound-button').addEventListener('click', () => {
      void this.toggleSound();
    });
    ui('fullscreen-button').addEventListener('click', () => {
      void this.fullscreen();
    });
    document.addEventListener('fullscreenchange', () =>
      ui('fullscreen-button').setAttribute(
        'aria-label',
        document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen',
      ),
    );
    ui('pause-button').addEventListener('click', () => this.pause());
    ui('home-link').addEventListener('click', (event) => {
      event.preventDefault();
      this.pause();
    });
    ui('title-controls').addEventListener('click', () => this.showHelp());
    ui('help-button').addEventListener('click', () => this.showHelp('pause-dialog'));
    ui('journal-button').addEventListener('click', () => this.journal());
    ui('pause-journal').addEventListener('click', () => this.journal());
    ui('interaction').addEventListener('click', () => m.interact());
    ui('menu-button').addEventListener('click', () => {
      this.save(m.snapshot(), false);
      this.helpReturn = null;
      this.closeDialogs();
      m.paused = true;
      m.inTitle = true;
      this.scene.clearInput();
      ui('title-screen').hidden = false;
      ui('game-hud').hidden = true;
      ui('pause-button').hidden = true;
      ui('touch-controls').hidden = true;
      ui('lamp-controls').hidden = true;
      ui('panel-controls').hidden = true;
      ui('begin-button').focus();
    });
    ui('lamp-slider').addEventListener('input', () => m.setLamp(Number(ui('lamp-slider').value)));
    ui('lamp-power').addEventListener('click', () => m.toggleLamp());
    ui('leave-lamp').addEventListener('click', () => m.leavePuzzle());
    ui('leave-panel').addEventListener('click', () => m.leavePuzzle());
    document
      .querySelectorAll<HTMLButtonElement>('[data-symbol]')
      .forEach((button) =>
        button.addEventListener('click', () => m.enterSymbol(Number(button.dataset.symbol))),
      );
    ui('show-sequence').addEventListener('click', () => {
      this.showWholeSequence = !this.showWholeSequence;
      ui('show-sequence').textContent = this.showWholeSequence
        ? 'Watch the shadow again'
        : 'Show the whole rhythm';
    });
    ui('reduced-motion').addEventListener('change', () => {
      m.reducedMotion = ui('reduced-motion').checked;
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ reduced: m.reducedMotion }));
      } catch {
        /* Session settings still apply. */
      }
    });
    document
      .querySelectorAll<HTMLButtonElement>('[data-close]')
      .forEach((button) =>
        button.addEventListener('click', () => button.closest('dialog')?.close()),
      );
    document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) =>
      dialog.addEventListener('close', () => {
        if (this.switchingDialogs || document.querySelector('dialog[open]')) return;
        if (dialog.id === 'help-dialog' && this.helpReturn) {
          const previous = this.helpReturn;
          this.helpReturn = null;
          this.openDialog(previous);
          return;
        }
        m.paused = !m.started || m.inTitle;
        this.sound.suspend(m.paused);
        if (!m.paused) ui('world').focus({ preventScroll: true });
      }),
    );
    ui('photo-next').addEventListener('click', () => {
      if (this.photoStage === 0) {
        this.photoStage = 1;
        ui('photograph').classList.add('remembering');
        ui('photograph').setAttribute(
          'aria-label',
          'Your shadow’s hand reaches across the photograph to the person beside you.',
        );
        ui('photo-title').textContent = 'It doesn’t reach for you.';
        ui('photo-description').textContent =
          'Its hand settles on the person beside you. You don’t recognise them. Your shadow does.';
        this.setPhotoButton('Remember this');
        this.sound.play('unease');
      } else {
        m.finish();
        this.openDialog('ending-dialog');
      }
    });
    ui('keep-exploring').addEventListener('click', () => ui('ending-dialog').close());
    ui('replay-button').addEventListener('click', () => this.begin());
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]'))
        return;
      const key = event.key.toLowerCase();
      if (key === 'escape') {
        event.preventDefault();
        this.pause();
      }
      if (key === 'm' && !event.repeat) {
        event.preventDefault();
        void this.toggleSound();
      }
      if (key === 'f' && !event.repeat) {
        event.preventDefault();
        void this.fullscreen();
      }
      if (!m.started || m.paused || m.inTitle) return;
      if (key === 'j' && !event.repeat) {
        event.preventDefault();
        this.journal();
      }
      if (key === 'e' && !event.repeat) {
        event.preventDefault();
        m.interact();
      }
      if (key === 'l' && m.mode === 'lamp' && !event.repeat) {
        event.preventDefault();
        m.toggleLamp();
      }
      if (m.mode === 'panel' && ['1', '2', '3'].includes(key) && !event.repeat) {
        event.preventDefault();
        m.enterSymbol(Number(key) - 1);
      }
    });
    window.addEventListener('blur', () => {
      this.scene.clearInput();
      this.pause();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.scene.clearInput();
        this.pause();
      }
    });
    document.querySelectorAll<HTMLButtonElement>('[data-hold]').forEach((button) => {
      const direction = button.dataset.hold === 'left' ? 'left' : 'right';
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.scene.controls?.setHold(direction, true);
      });
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
        button.addEventListener(type, () => this.scene.controls?.setHold(direction, false));
    });
    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        if (button.dataset.action === 'jump') {
          button.setPointerCapture(event.pointerId);
          this.scene.controls?.jump(true);
        } else m.interact();
      });
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
        button.addEventListener(type, () => {
          if (button.dataset.action === 'jump') this.scene.controls?.jump(false);
        });
    });
  }

  private update(): void {
    const m = this.model;
    if (!m.started || m.inTitle) return;
    if (this.lastLocation !== m.location) {
      this.lastLocation = m.location;
      ui('location').textContent = m.location;
    }
    if (this.lastObjective !== m.objective) {
      this.lastObjective = m.objective;
      ui('objective').textContent = m.objective;
    }
    const interaction = m.interaction;
    ui('interaction').hidden = !interaction;
    if (interaction) ui('interaction-label').textContent = interaction.label;
    ui('subtitle').classList.toggle(
      'visible',
      m.time < this.subtitleUntil && !m.paused && m.mode === 'walk',
    );
    ui('save-indicator').classList.toggle('visible', m.time < this.saveUntil);
    if (m.mode === 'lamp') {
      ui('lamp-slider').value = String(Math.round(m.lamp.x));
      ui('lamp-power').textContent = m.lamp.on ? 'Switch light off' : 'Switch light on';
      ui('lamp-power').setAttribute('aria-pressed', String(m.lamp.on));
      const status = !m.lamp.on
        ? 'The light is off.'
        : m.flags.gateOpen
          ? 'The shutter stays open. The shadow still follows the light.'
          : m.lamp.distance(m.player.x) < 25
            ? 'Hold the light. It’s reaching…'
            : m.lamp.distance(m.player.x) < 80
              ? 'Almost. A little further.'
              : 'The shadows are apart.';
      if (ui('lamp-status').textContent !== status) ui('lamp-status').textContent = status;
      ui('alignment-fill').style.width = `${m.lamp.alignment * 100}%`;
    }
    if (m.mode === 'panel') {
      const index = Math.floor(m.access.time / ACCESS.beatSeconds) % 7,
        symbol = ACCESS.sequence[index];
      const cue =
        m.time < this.accessFeedbackUntil
          ? 'The rhythm slips away. Watch once more.'
          : this.showWholeSequence
            ? '○ Circle · △ Triangle · │ Line · ○ Circle'
            : symbol === undefined
              ? 'A pause. Then it begins again.'
              : `${index + 1} / 4 · ${['○', '│', '△'][symbol]} ${ACCESS.symbols[symbol]}`;
      if (this.lastCue !== cue) {
        this.lastCue = cue;
        ui('sequence-cue').textContent = cue;
      }
      document
        .querySelectorAll<HTMLButtonElement>('[data-symbol]')
        .forEach((button) =>
          button.classList.toggle(
            'cue',
            !this.showWholeSequence && Number(button.dataset.symbol) === symbol,
          ),
        );
    }
  }
}
