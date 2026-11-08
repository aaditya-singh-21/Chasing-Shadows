import type { RoomId } from '../core/types.ts';
export interface Door {
  x: number;
  to: RoomId;
  spawn: number;
  label: string;
  requires?: string;
}
export interface Room {
  width: number;
  floor: number;
  title: string;
  doors: Door[];
}
export const ROOMS: Record<RoomId, Room> = {
  street: {
    width: 6620,
    floor: 700,
    title: 'Mercer Street',
    doors: [
      { x: 5100, to: 'workshop', spawn: 180, label: 'Enter workshop', requires: 'panelOpen' },
      { x: 3980, to: 'shelter-hall', spawn: 180, label: 'Enter shelter', requires: 'shortcut' },
      { x: 4480, to: 'courtyard', spawn: 160, label: 'Enter courtyard' },
      { x: 4850, to: 'courtyard', spawn: 1400, label: 'Take courtyard passage' },
    ],
  },
  workshop: {
    width: 1800,
    floor: 700,
    title: 'Maintenance workshop',
    doors: [
      { x: 100, to: 'street', spawn: 5010, label: 'Return to street' },
      {
        x: 1600,
        to: 'service-passage',
        spawn: 300,
        label: 'Enter service passage',
        requires: 'power',
      },
    ],
  },
  'service-passage': {
    width: 2900,
    floor: 700,
    title: 'Shelter service passage',
    doors: [
      { x: 100, to: 'workshop', spawn: 1500, label: 'Return to workshop' },
      { x: 2650, to: 'shelter-hall', spawn: 300, label: 'Enter shelter' },
    ],
  },
  'shelter-hall': {
    width: 1800,
    floor: 700,
    title: 'Station shelter · hall',
    doors: [
      { x: 100, to: 'street', spawn: 3980, label: 'Unbolt front door / return outside' },
      {
        x: 1600,
        to: 'shelter-lower',
        spawn: 200,
        label: 'Enter lower shelter',
        requires: 'brother',
      },
    ],
  },
  'shelter-lower': {
    width: 1900,
    floor: 1300,
    title: 'Station shelter · utilities',
    doors: [
      { x: 100, to: 'shelter-hall', spawn: 1500, label: 'Return upstairs' },
      { x: 1720, to: 'shelter-rest', spawn: 180, label: 'Enter upper rest room' },
    ],
  },
  'shelter-rest': { width: 1500, floor: 700, title: 'Station shelter · rest room', doors: [] },
  courtyard: {
    width: 1600,
    floor: 700,
    title: 'No. 14 · courtyard',
    doors: [
      { x: 100, to: 'street', spawn: 4480, label: 'Return to street' },
      { x: 1450, to: 'street', spawn: 4850, label: 'Open courtyard gate' },
    ],
  },
};
export const LOWER_STEPS = Array.from({ length: 7 }, (_, i) => ({
  left: 650 + i * 130,
  top: 1300 - (i + 1) * 60,
}));
export const SERVICE_OBSTACLES = [1100, 1770] as const;
export function floorAt(room: RoomId, x: number): number {
  let floor = ROOMS[room].floor;
  if (room === 'shelter-lower')
    for (const step of LOWER_STEPS) if (x >= step.left) floor = step.top;
  return floor;
}
