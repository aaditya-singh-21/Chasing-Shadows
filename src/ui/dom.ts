interface Elements {
  world: HTMLCanvasElement;
  'game-shell': HTMLElement;
  'title-screen': HTMLElement;
  'begin-button': HTMLButtonElement;
  'continue-button': HTMLButtonElement;
  'game-hud': HTMLElement;
  'pause-button': HTMLButtonElement;
  'touch-controls': HTMLElement;
  'lamp-controls': HTMLElement;
  'panel-controls': HTMLElement;
  interaction: HTMLButtonElement;
  'interaction-label': HTMLElement;
  'lamp-slider': HTMLInputElement;
  'lamp-status': HTMLElement;
  'lamp-power': HTMLButtonElement;
  'lamp-copy': HTMLElement;
  'alignment-fill': HTMLElement;
  'sequence-progress': HTMLElement;
  'sequence-cue': HTMLElement;
  'show-sequence': HTMLButtonElement;
  photograph: HTMLElement;
  'photo-title': HTMLElement;
  'photo-description': HTMLElement;
  'photo-next': HTMLButtonElement;
  subtitle: HTMLElement;
  'save-indicator': HTMLElement;
  'journal-dot': HTMLElement;
  'screen-reader-status': HTMLElement;
  'checkpoint-note': HTMLElement;
  'journal-entries': HTMLElement;
  'reduced-motion': HTMLInputElement;
  'sound-button': HTMLButtonElement;
  'fullscreen-button': HTMLButtonElement;
  'home-link': HTMLAnchorElement;
  'title-controls': HTMLButtonElement;
  'help-button': HTMLButtonElement;
  'journal-button': HTMLButtonElement;
  'pause-journal': HTMLButtonElement;
  'menu-button': HTMLButtonElement;
  'leave-lamp': HTMLButtonElement;
  'leave-panel': HTMLButtonElement;
  'keep-exploring': HTMLButtonElement;
  'replay-button': HTMLButtonElement;
  location: HTMLElement;
  objective: HTMLElement;
  'fatal-error': HTMLElement;
  'pause-dialog': HTMLDialogElement;
  'help-dialog': HTMLDialogElement;
  'journal-dialog': HTMLDialogElement;
  'photo-dialog': HTMLDialogElement;
  'ending-dialog': HTMLDialogElement;
}

export type DialogId =
  'pause-dialog' | 'help-dialog' | 'journal-dialog' | 'photo-dialog' | 'ending-dialog';
const cache = new Map<keyof Elements, HTMLElement>();

export function ui<K extends keyof Elements>(id: K): Elements[K] {
  let element = cache.get(id);
  if (!element) {
    element = document.getElementById(id) ?? undefined;
    if (!element) throw new Error(`Missing interface element: ${id}`);
    cache.set(id, element);
  }
  return element as Elements[K];
}
