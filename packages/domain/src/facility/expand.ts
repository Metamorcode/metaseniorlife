import type {
  Facility,
  FacilityTemplate,
  Floor,
  Room,
  RoomGroupTemplate,
  RoomKind,
  Space,
  SpaceKind,
} from './types';

/** Intervalos de limpeza por omissão (minutos). Cada lar pode sobrepor no template. */
export const DEFAULT_CLEANING_INTERVAL_MIN: Record<SpaceKind | 'quarto', number> = {
  quarto: 24 * 60,
  rececao: 8 * 60,
  direcao: 24 * 60,
  gabinete_tecnico: 24 * 60,
  refeitorio: 4 * 60,
  cozinha: 4 * 60,
  despensa: 24 * 60,
  lavandaria: 12 * 60,
  sala_convivio: 6 * 60,
  sala_atividades: 8 * 60,
  sala_estar_copa: 6 * 60,
  enfermaria: 8 * 60,
  posto_enfermagem: 8 * 60,
  fisioterapia: 8 * 60,
  cabeleireiro: 24 * 60,
  vestiario_pessoal: 12 * 60,
  wc_comum: 3 * 60,
  banho_geriatrico: 4 * 60,
  sujos: 6 * 60,
  arrecadacao: 7 * 24 * 60,
  bastidor_rede: 7 * 24 * 60,
  corredor: 8 * 60,
  jardim: 7 * 24 * 60,
};

const SPACE_LABEL: Record<SpaceKind, string> = {
  rececao: 'Receção',
  direcao: 'Direção',
  gabinete_tecnico: 'Gabinete técnico',
  refeitorio: 'Refeitório',
  cozinha: 'Cozinha',
  despensa: 'Despensa',
  lavandaria: 'Lavandaria',
  sala_convivio: 'Sala de convívio',
  sala_atividades: 'Sala de atividades',
  sala_estar_copa: 'Sala de estar com copa',
  enfermaria: 'Enfermaria',
  posto_enfermagem: 'Posto de enfermagem',
  fisioterapia: 'Fisioterapia',
  cabeleireiro: 'Cabeleireiro',
  vestiario_pessoal: 'Vestiário do pessoal',
  wc_comum: 'WC comum',
  banho_geriatrico: 'Banho geriátrico',
  sujos: 'Compartimento de sujos',
  arrecadacao: 'Arrecadação',
  bastidor_rede: 'Bastidor de rede',
  corredor: 'Corredor',
  jardim: 'Jardim',
};

export function roomKindOf(group: Pick<RoomGroupTemplate, 'beds' | 'casal'>): RoomKind {
  if (group.casal && group.beds === 2) return 'casal';
  if (group.beds === 1) return 'individual';
  if (group.beds === 2) return 'duplo';
  if (group.beds === 3) return 'triplo';
  return 'nao_permitido';
}

const pad = (n: number) => String(n).padStart(2, '0');
const bedLetter = (i: number) => String.fromCharCode(65 + i);

/** Expande um template num lar concreto. Códigos estáveis: quarto "1.07", cama "1.07-B", espaço "1.WC-2". */
export function expandFacility(template: FacilityTemplate): Facility {
  const floors: Floor[] = template.floors
    .slice()
    .sort((a, b) => a.level - b.level)
    .map((f) => {
      let n = 0;
      const rooms: Room[] = (f.rooms ?? []).flatMap((g) =>
        Array.from({ length: g.count }, () => {
          n += 1;
          const code = `${f.level}.${pad(n)}`;
          return {
            code,
            floorLevel: f.level,
            kind: roomKindOf(g),
            areaM2: g.areaM2,
            wc: g.wc,
            beds: Array.from({ length: g.beds }, (_, i) => ({ code: `${code}-${bedLetter(i)}` })),
            cleaningIntervalMin: DEFAULT_CLEANING_INTERVAL_MIN.quarto,
          };
        }),
      );
      const perKind = new Map<SpaceKind, number>();
      const spaces: Space[] = (f.spaces ?? []).flatMap((s) =>
        Array.from({ length: s.count ?? 1 }, () => {
          const i = (perKind.get(s.kind) ?? 0) + 1;
          perKind.set(s.kind, i);
          const base = s.name ?? SPACE_LABEL[s.kind];
          return {
            code: `${f.level}.${s.kind}-${i}`,
            floorLevel: f.level,
            kind: s.kind,
            name: (s.count ?? 1) > 1 ? `${base} ${i}` : base,
            areaM2: s.areaM2,
            cleaningIntervalMin: s.cleaningIntervalMin ?? DEFAULT_CLEANING_INTERVAL_MIN[s.kind],
          };
        }),
      );
      return { level: f.level, name: f.name, functionalUnit: f.functionalUnit, rooms, spaces };
    });

  const capacity = floors.reduce((t, f) => t + f.rooms.reduce((s, r) => s + r.beds.length, 0), 0);
  return { id: template.id, name: template.name, regime: template.regime, floors, capacity };
}
