export const FLOOR = 700;
export const WORLD_WIDTH = 6620;
export const LAMP_TARGET = 2770;
export const ACCESS_SEQUENCE = [0, 2, 1, 0];
export const SYMBOLS = ['Circle', 'Line', 'Triangle'];
export const NOTES = {
  waking: { title: 'The last stop', text: 'An empty tram. An empty city. Someone left their bag behind, as if they expected to come back. I can’t remember getting on.' },
  shadow: { title: 'A movement of its own', text: 'It turned its head. I didn’t. For a moment it stayed behind, looking toward the platform. I am certain I saw it.' },
  light: { title: 'A borrowed reach', text: 'I moved the lamp. It reached for the shadow of the latch, and the real latch moved. My hands never touched it.' },
  knock: { title: 'Two. Then one.', text: 'It knew this door. Two knocks, a pause, then one more. It waited for an answer. It waited longer than I did.' },
  access: { title: 'A familiar rhythm', text: 'Circle. Triangle. Line. Circle. The maintenance door opened. How many times have these hands done that before?' },
  photo: { title: 'Someone you knew', text: 'I am in the staff photograph. The same coat, the same torn cuff. But my shadow reached for the person beside me. Who did we come back for?' }
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const initialFlags = () => ({ doorOpen: false, deviationSeen: false, gateOpen: false, knocked: false, panelOpen: false, finished: false });

export function validateSave(value) {
  if (!value || value.version !== 1 || !value.flags || typeof value.flags !== 'object') return null;
  const flags = initialFlags();
  for (const key of Object.keys(flags)) flags[key] = value.flags[key] === true;
  // A checkpoint cannot skip the prerequisite discoveries.
  flags.finished && (flags.panelOpen = true);
  flags.panelOpen && (flags.knocked = true);
  flags.knocked && (flags.gateOpen = true);
  flags.gateOpen && (flags.deviationSeen = true);
  flags.deviationSeen && (flags.doorOpen = true);
  const notes = ['waking'];
  for (const [flag, note] of [['deviationSeen', 'shadow'], ['gateOpen', 'light'], ['knocked', 'knock'], ['panelOpen', 'access'], ['finished', 'photo']]) {
    if (flags[flag]) notes.push(note);
  }
  let x = typeof value.x === 'number' && Number.isFinite(value.x) ? value.x : 440;
  x = clamp(x, 160, flags.panelOpen ? 6440 : flags.gateOpen ? 5160 : flags.doorOpen ? 2820 : 1010);
  if (x > 725 && x < 860) x = 700; // Never restore inside the suitcase.
  return { flags, notes, x, lampX: typeof value.lampX === 'number' && Number.isFinite(value.lampX) ? clamp(value.lampX, 1900, 2220) : 2180 };
}

export class Game {
  constructor(emit = () => {}) {
    this.emit = emit;
    this.reset();
  }
  reset(save = null) {
    const clean = validateSave(save);
    this.flags = clean?.flags || initialFlags();
    this.notes = clean?.notes || ['waking'];
    this.player = { x: clean?.x || 440, y: FLOOR, vx: 0, vy: 0, facing: 1, grounded: true, stride: 0 };
    this.lampX = clean?.lampX || 2180;
    this.time = 0;
    this.mode = 'walk';
    this.paused = true;
    this.started = false;
    this.shadow = { x: this.player.x + 100, y: FLOOR, mode: 'follow', timer: 0 };
    this.input = { left: false, right: false };
    this.walkTarget = null;
    this.gateAmount = this.flags.gateOpen ? 1 : 0;
    this.alignment = 0;
    this.lampTime = 0;
    this.sequenceInput = [];
    this.sequenceTime = 0;
    this.lastStep = 0;
    this.coyote = .1;
    this.jumpBuffer = 0;
    this.eventsSeen = new Set();
    this.checkpointTime = 0;
    this.knockTimer = -1;
    this.trigger = null;
  }
  start(save = null) {
    this.reset(save);
    this.started = true;
    this.paused = false;
    this.emit('start');
    this.say(save ? 'The city is still waiting.' : 'I don’t remember getting on.', 5);
  }
  clearInput() { this.input.left = false; this.input.right = false; this.walkTarget = null; }
  snapshot() {
    let x = this.player.x;
    for (const obstacle of [{ left: 752, right: 824 }, { left: 3460, right: 3550 }, { left: 3670, right: 3790 }]) {
      if (x + 18 > obstacle.left && x - 18 < obstacle.right) x = obstacle.left - 25;
    }
    return { version: 1, flags: { ...this.flags }, lampX: this.lampX, x };
  }
  discover(flag, note) {
    this.flags[flag] = true;
    if (note && !this.notes.includes(note)) { this.notes.push(note); this.emit('note', note); }
    this.emit('save', this.snapshot());
  }
  say(text, seconds = 5) { this.emit('say', { text, seconds }); }
  once(key, action) { if (!this.eventsSeen.has(key)) { this.eventsSeen.add(key); action(); } }
  jump() {
    if (!this.started || this.paused || this.mode !== 'walk') return;
    this.jumpBuffer = .14;
  }
  walkTo(x) { if (this.mode === 'walk') this.walkTarget = clamp(x, 160, 6440); }
  setLamp(x) { if (this.mode === 'lamp') this.lampX = clamp(Number.isFinite(x) ? x : this.lampX, 1900, 2220); }
  get shadowProjection() { return 2360 + (2360 - this.lampX) * 1.15; }
  get alignmentDistance() { return Math.abs(this.shadowProjection - LAMP_TARGET); }
  get interaction() {
    if (!this.started || this.paused || this.mode !== 'walk' || !this.player.grounded) return null;
    const x = this.player.x;
    if (!this.flags.doorOpen && Math.abs(x - 1040) < 140) return { id: 'tram', label: 'Open the tram door' };
    if (!this.flags.gateOpen && x > 2120 && x < 2650) return { id: 'lamp', label: 'Move the maintenance lamp' };
    if (Math.abs(x - 1560) < 95) return { id: 'notice', label: 'Read the platform notice' };
    if (this.flags.gateOpen && Math.abs(x - 4320) < 140) return { id: 'door', label: 'Listen at the door' };
    if (this.flags.gateOpen && !this.flags.panelOpen && Math.abs(x - 5120) < 180) return { id: 'panel', label: 'Examine the access panel' };
    if (this.flags.panelOpen && Math.abs(x - 5920) < 180) return { id: 'photo', label: 'Examine the staff photograph' };
    if (this.flags.panelOpen && Math.abs(x - 5570) < 100) return { id: 'mug', label: 'Examine the desk' };
    return null;
  }
  interact() {
    if (this.paused) return;
    if (this.mode !== 'walk') { this.leavePuzzle(); return; }
    const target = this.interaction;
    if (!target) return;
    this.clearInput();
    if (target.id === 'tram') {
      this.discover('doorOpen'); this.emit('sound', 'door'); this.say('No footsteps. Not even in the distance.');
    } else if (target.id === 'lamp') {
      this.mode = 'lamp'; this.player.x = 2360; this.player.vx = 0; this.lampTime = 0;
      this.shadow.mode = 'project'; this.emit('puzzle', 'lamp');
    } else if (target.id === 'notice') {
      this.say('“Service resumes at first light.” There’s no date.');
    } else if (target.id === 'door') {
      this.say('Nothing. But it still seems to be listening.');
    } else if (target.id === 'panel') {
      this.mode = 'panel'; this.player.x = 5110; this.player.vx = 0; this.sequenceInput = []; this.sequenceTime = 0;
      this.shadow.mode = 'code'; this.shadow.x = 5220; this.shadow.y = FLOOR; this.shadow.timer = 0; this.emit('puzzle', 'panel');
    } else if (target.id === 'photo') {
      this.emit('photo');
    } else if (target.id === 'mug') {
      this.say('Two cups. One has never been washed.');
    }
  }
  leavePuzzle() {
    this.mode = 'walk'; this.shadow.mode = 'follow'; this.alignment = 0; this.clearInput(); this.emit('puzzle', null);
  }
  enterSymbol(symbol) {
    if (this.mode !== 'panel' || this.paused || !Number.isInteger(symbol) || symbol < 0 || symbol > 2) return;
    this.emit('sound', 'symbol');
    if (ACCESS_SEQUENCE[this.sequenceInput.length] !== symbol) {
      this.sequenceInput = [];
      this.sequenceTime = 0;
      this.emit('sequence-wrong');
      this.say('The rhythm slips away. Watch its hand again.', 3);
      return;
    }
    this.sequenceInput.push(symbol);
    this.emit('sequence', this.sequenceInput.length);
    if (this.sequenceInput.length === ACCESS_SEQUENCE.length) {
      this.discover('panelOpen', 'access'); this.leavePuzzle(); this.emit('sound', 'unlock');
      this.say('How did it know that?', 5);
    }
  }
  finish() { if (!this.flags.finished) this.discover('finished', 'photo'); }
  get location() {
    const x = this.player.x;
    if (x < 1160) return 'OLD QUARTER · TRAM 07';
    if (x < 3050) return 'OLD QUARTER · TRAM TERMINUS';
    if (x < 5280) return 'OLD QUARTER · MERCER STREET';
    return 'TRANSIT AUTHORITY · MAINTENANCE ROOM';
  }
  get objective() {
    if (!this.flags.doorOpen) return 'Find a way out of the tram.';
    if (!this.flags.gateOpen) return 'Find a way through the station shutter.';
    if (!this.flags.knocked) return 'Follow the street. Watch your shadow.';
    if (!this.flags.panelOpen) return 'Find the maintenance entrance.';
    if (!this.flags.finished) return 'Look for something familiar.';
    return 'Who did you come back for?';
  }
  update(dt) {
    if (!this.started || this.paused) return;
    dt = Math.min(dt, .04);
    this.time += dt;
    this.shadow.timer += dt;
    const p = this.player;
    if (this.mode === 'lamp') {
      this.lampTime += dt;
      this.lampX = clamp(this.lampX + ((this.input.right ? 1 : 0) - (this.input.left ? 1 : 0)) * dt * 115, 1900, 2220);
      this.shadow.x = this.shadowProjection;
      this.shadow.y = FLOOR;
      this.alignment = this.alignmentDistance < 25 ? Math.min(1, this.alignment + dt / 1.35) : Math.max(0, this.alignment - dt * 2);
      if (this.lampTime > 24) this.once('lamp-hint', () => this.say('Move the lamp left. Its hand is almost there.', 6));
      if (this.alignment >= 1) {
        this.discover('gateOpen', 'light'); this.leavePuzzle(); this.gateAmount = 0;
        this.shadow.mode = 'reach'; this.shadow.timer = 0; this.shadow.x = LAMP_TARGET;
        this.emit('sound', 'gate'); this.say('My hands never touched it.', 5);
      }
      return;
    }
    if (this.mode === 'panel') { this.sequenceTime += dt; return; }

    let axis = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    if (axis) this.walkTarget = null;
    if (!axis && this.walkTarget !== null) {
      const delta = this.walkTarget - p.x;
      if (Math.abs(delta) < 8) this.walkTarget = null;
      else axis = Math.sign(delta);
    }
    const targetVX = axis * 245;
    p.vx += (targetVX - p.vx) * Math.min(1, dt * (axis ? 13 : 18));
    if (axis) p.facing = axis;
    this.jumpBuffer -= dt;
    this.coyote = p.grounded ? .1 : this.coyote - dt;
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      p.vy = -550; p.grounded = false; this.coyote = 0; this.jumpBuffer = 0; this.emit('sound', 'jump');
    }
    const oldX = p.x, oldY = p.y;
    p.x += p.vx * dt;
    p.vy = Math.min(850, p.vy + 1500 * dt);
    p.y += p.vy * dt;
    p.grounded = false;
    if (p.y >= FLOOR) { p.y = FLOOR; p.vy = 0; p.grounded = true; }

    const obstacles = [ { left: 752, right: 824, top: 660 }, { left: 3460, right: 3550, top: 650 }, { left: 3670, right: 3790, top: 610 } ];
    for (const o of obstacles) {
      if (p.x + 17 <= o.left || p.x - 17 >= o.right || p.y <= o.top) continue;
      if (oldY <= o.top + 2 && p.vy >= 0) { p.y = o.top; p.vy = 0; p.grounded = true; }
      else if (oldX + 17 <= o.left + 3) { p.x = o.left - 17; p.vx = 0; }
      else if (oldX - 17 >= o.right - 3) { p.x = o.right + 17; p.vx = 0; }
      else if (p.vy < 0) { p.vy = 0; p.y = oldY; }
    }
    p.x = clamp(p.x, 160, 6440);
    if (!this.flags.doorOpen && p.x > 1090) { p.x = 1090; p.vx = 0; }
    if ((!this.flags.gateOpen || this.gateAmount < .82) && p.x > 2840) { p.x = 2840; p.vx = 0; }
    if (!this.flags.panelOpen && p.x > 5220) { p.x = 5220; p.vx = 0; }
    if (Math.abs(p.x - oldX) > .1) {
      p.stride += dt * Math.abs(p.vx) / 29;
      if (p.grounded && this.time - this.lastStep > .37) { this.lastStep = this.time; this.emit('sound', 'step'); }
    }
    this.gateAmount = Math.min(1, this.gateAmount + (this.flags.gateOpen ? dt * .65 : 0));
    if (p.x > 1450 && !this.flags.deviationSeen) {
      this.discover('deviationSeen', 'shadow');
      this.shadow.mode = 'linger'; this.shadow.timer = 0; this.shadow.x = p.x + 120;
      this.say('It turned. I didn’t.', 4); this.emit('sound', 'unease');
    }
    if (p.x > 3980 && !this.flags.knocked) {
      this.discover('knocked', 'knock'); this.shadow.mode = 'knock'; this.shadow.timer = 0;
      this.shadow.x = 4310; this.knockTimer = 0; this.say('It knows this door.', 5);
    }
    if (this.knockTimer >= 0) {
      const before = this.knockTimer; this.knockTimer += dt;
      for (const t of [1.2, 1.5, 2.7, 5.4, 5.8, 7.2]) {
        if (before < t && this.knockTimer >= t) this.emit('sound', 'knock');
      }
      if (this.knockTimer > 8) this.knockTimer = -1;
    }
    const duration = { linger: 4, reach: 3.5, knock: 9 }[this.shadow.mode];
    if (duration && this.shadow.timer > duration) this.shadow.mode = 'follow';
    if (this.shadow.mode === 'follow') {
      let destination = p.x + (p.x < 1160 ? 80 : 110);
      if (p.x > 2120 && p.x < 2860 && !this.flags.gateOpen) destination = p.x + 150;
      this.shadow.x += (destination - this.shadow.x) * Math.min(1, dt * 5);
      this.shadow.y += (p.y - this.shadow.y) * Math.min(1, dt * 10);
    }
    if (p.x > 620 && p.x < 735) this.once('jump-hint', () => this.say('A bag. Someone was going somewhere.', 4));
    if (p.x > 2020 && !this.flags.gateOpen) this.once('lamp-intro', () => this.say('The latch is too high. But its shadow…', 5));
    if (p.x > 5540) this.once('photo-intro', () => this.say('Something on the wall.', 4));
    this.checkpointTime += dt;
    if (this.checkpointTime > 8 && p.grounded) { this.checkpointTime = 0; this.emit('autosave', this.snapshot()); }
  }
}
