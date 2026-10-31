import type { Facility, RoomKind } from './types';

export interface FacilitySummary {
  capacity: number;
  rooms: number;
  roomsByKind: Record<RoomKind, number>;
  bedsByFloor: { level: number; name: string; unit?: string; rooms: number; beds: number }[];
}

export function summarize(f: Facility): FacilitySummary {
  const roomsByKind: Record<RoomKind, number> = { individual: 0, casal: 0, duplo: 0, triplo: 0, nao_permitido: 0 };
  for (const r of f.floors.flatMap((fl) => fl.rooms)) roomsByKind[r.kind] += 1;
  return {
    capacity: f.capacity,
    rooms: Object.values(roomsByKind).reduce((a, b) => a + b, 0),
    roomsByKind,
    bedsByFloor: f.floors.map((fl) => ({
      level: fl.level,
      name: fl.name,
      unit: fl.functionalUnit,
      rooms: fl.rooms.length,
      beds: fl.rooms.reduce((s, r) => s + r.beds.length, 0),
    })),
  };
}
