import type { ChapterModel } from './ChapterModel.ts';
import type { Interaction } from './types.ts';

export const FAREWELL_SECONDS = 6;
export const CHAPTER_TWO_NOTES: Record<string, string> = {
  farewell:
    'I covered Daniel with the blanket. My shadow offered him a hand, then stopped. It saw what I saw.',
  homeLead:
    'No. 14 on Mercer Street. Home. Mum and Dad might have gone back there. The upper shelter exit leads to the lane behind the block.',
  laneAlcove:
    'A repaired bicycle carrier. An old maintenance tag with my name. I used to look after things here.',
};

/** Pure continuation rules. Rendering and dialog ownership stay outside this module. */
export class ChapterTwo {
  private readonly model: ChapterModel;
  constructor(model: ChapterModel) {
    this.model = model;
  }

  begin(): boolean {
    const m = this.model;
    if (!m.started || m.inTitle || m.sequence || !m.marks.has('chapterComplete')) return false;
    if (m.marks.has('chapterTwoStarted')) return false;
    m.marks.add('chapterTwoStarted');
    m.travel('shelter-rest', 800);
    m.say('Daniel. I cannot leave you like this.', 7);
    return true;
  }

  get interaction(): Interaction | null {
    const m = this.model;
    if (!m.marks.has('chapterTwoStarted')) return null;
    if (m.room === 'shelter-rest' && !m.marks.has('farewell') && Math.abs(m.player.x - 980) < 200)
      return { id: 'farewell', label: 'Cover Daniel' };
    if (m.room === 'residential-lane' && m.player.x > 1550)
      return { id: 'lane-look', label: 'Look toward No. 14' };
    return null;
  }

  interact(id: string): boolean {
    const m = this.model;
    if (id === 'farewell') {
      m.checkpoint();
      m.sequence = 'farewell';
      m.sequenceTime = 0;
      m.walkTarget = null;
      m.say('');
      return true;
    }
    if (id === 'lane-look') {
      m.events.emit({ type: 'chapter-two-preview' });
      return true;
    }
    return false;
  }

  update(dt: number): boolean {
    const m = this.model;
    if (m.sequence === 'farewell') {
      m.time += dt;
      m.sequenceTime += dt;
      m.shadow.state.mode = m.sequenceTime < 3 ? 'reach' : 'linger';
      m.shadow.state.x = 1080;
      m.shadow.state.y = 700;
      if (m.sequenceTime >= FAREWELL_SECONDS) {
        m.sequence = null;
        m.marks.add('farewell');
        m.marks.add('homeLead');
        m.checkpoint();
        m.say('That door on Mercer. No. 14. Home. They might have gone home.', 9);
      }
      return true;
    }
    if (m.room !== 'residential-lane') return false;
    m.time += dt;
    m.shadow.state.x = m.player.x + 70;
    m.shadow.state.y = m.player.y;
    m.shadow.state.facing = m.player.facing;
    m.shadow.state.mode = 'follow';
    if (m.player.x > 700 && m.player.x < 1000 && !m.marks.has('laneAlcove')) {
      m.marks.add('laneAlcove');
      m.checkpoint();
      m.say(CHAPTER_TWO_NOTES.laneAlcove!, 7);
    }
    return true;
  }
}
