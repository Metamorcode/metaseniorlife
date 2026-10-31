import type { Facility, Room } from './types';

/**
 * Regras de instalação de ERPI — Portaria n.º 67/2012, na redação republicada pela
 * Portaria n.º 349/2023. Cada achado indica a norma, para a direção poder confirmar
 * com o arquiteto. Não substitui o parecer do ISS: é uma verificação prévia.
 */
export type Severity = 'erro' | 'aviso';

export interface Finding {
  severity: Severity;
  rule: string;
  message: string;
  where?: string;
}

const MIN_AREA_M2: Record<Exclude<Room['kind'], 'nao_permitido'>, number> = {
  individual: 10,
  casal: 12,
  duplo: 16,
  triplo: 20.5,
};
const MAX_CAPACITY = 120;
const MIN_CAPACITY = 4;
const UNITS_REQUIRED_ABOVE = 80;
const MAX_PER_UNIT = 60;
const SMALL_ERPI = 20;
const MAX_RESIDENTS_PER_WC = 4;

const pct = (part: number, total: number) => (total === 0 ? 0 : (part * 100) / total);

export function validateErpi(f: Facility): Finding[] {
  const out: Finding[] = [];
  const rooms = f.floors.flatMap((fl) => fl.rooms);
  const spaces = f.floors.flatMap((fl) => fl.spaces);
  const large = f.capacity > SMALL_ERPI;

  if (f.capacity < MIN_CAPACITY || f.capacity > MAX_CAPACITY) {
    out.push({
      severity: 'erro',
      rule: 'Art. 6.º, n.º 1',
      message: `A capacidade tem de estar entre ${MIN_CAPACITY} e ${MAX_CAPACITY} residentes; este lar tem ${f.capacity}.`,
    });
  }

  if (f.capacity > UNITS_REQUIRED_ABOVE) {
    const perUnit = new Map<string, number>();
    for (const fl of f.floors) {
      if (!fl.rooms.length) continue;
      if (!fl.functionalUnit) {
        out.push({
          severity: 'erro',
          rule: 'Art. 6.º, n.os 2 a 4',
          message: `Acima de ${UNITS_REQUIRED_ABOVE} residentes os quartos têm de estar organizados em unidades funcionais.`,
          where: fl.name,
        });
        continue;
      }
      const beds = fl.rooms.reduce((s, r) => s + r.beds.length, 0);
      perUnit.set(fl.functionalUnit, (perUnit.get(fl.functionalUnit) ?? 0) + beds);
    }
    for (const [unit, n] of perUnit) {
      if (n > MAX_PER_UNIT) {
        out.push({
          severity: 'erro',
          rule: 'Art. 6.º, n.º 3',
          message: `Cada unidade funcional pode ter no máximo ${MAX_PER_UNIT} residentes; ${unit} tem ${n}.`,
          where: unit,
        });
      }
    }
  }

  for (const r of rooms) {
    if (r.kind === 'nao_permitido') {
      out.push({
        severity: 'erro',
        rule: 'Anexo I, Ficha 6.3.3',
        message: `Quarto com ${r.beds.length} camas: só são permitidos quartos individuais, duplos ou triplos.`,
        where: r.code,
      });
      continue;
    }
    const min = MIN_AREA_M2[r.kind];
    if (r.areaM2 < min) {
      out.push({
        severity: 'erro',
        rule: 'Anexo I, Ficha 6.3.1',
        message: `Quarto ${r.kind} com ${r.areaM2} m²; o mínimo é ${min} m².`,
        where: r.code,
      });
    }
  }

  const individual = rooms.filter((r) => r.kind === 'individual' || r.kind === 'casal').length;
  const triple = rooms.filter((r) => r.kind === 'triplo').length;
  if (large) {
    if (pct(individual, rooms.length) < 20) {
      out.push({
        severity: 'erro',
        rule: 'Anexo I, Ficha 6.3.3',
        message: `Pelo menos 20% dos quartos têm de ser individuais; há ${individual} de ${rooms.length} (${pct(individual, rooms.length).toFixed(0)}%).`,
      });
    }
    if (pct(triple, rooms.length) > 20) {
      out.push({
        severity: 'erro',
        rule: 'Anexo I, Ficha 6.3.3',
        message: `No máximo 20% dos quartos podem ser triplos; há ${triple} de ${rooms.length} (${pct(triple, rooms.length).toFixed(0)}%).`,
      });
    }
  } else {
    if (individual < 1) out.push({ severity: 'erro', rule: 'Anexo I, Ficha 6.3.7', message: 'É preciso pelo menos um quarto individual.' });
    if (triple > 1) out.push({ severity: 'erro', rule: 'Anexo I, Ficha 6.3.7', message: 'No máximo um quarto triplo.' });
  }

  for (const fl of f.floors) {
    const sharedResidents = fl.rooms.filter((r) => r.wc === 'partilhado').reduce((s, r) => s + r.beds.length, 0);
    if (sharedResidents > 0) {
      const wcs = fl.spaces.filter((s) => s.kind === 'wc_comum').length;
      const needed = Math.ceil(sharedResidents / MAX_RESIDENTS_PER_WC);
      if (wcs < needed) {
        out.push({
          severity: 'erro',
          rule: 'Anexo I, Ficha 6.3.1 d)',
          message: `${sharedResidents} residentes sem WC privativo precisam de pelo menos ${needed} instalações sanitárias próximas; há ${wcs}.`,
          where: fl.name,
        });
      }
    }
    if (large && fl.rooms.length && !fl.spaces.some((s) => s.kind === 'sujos')) {
      out.push({
        severity: 'erro',
        rule: 'Anexo I, Ficha 6.3.2',
        message: 'Cada piso com quartos precisa de um compartimento de sujos.',
        where: fl.name,
      });
    }
  }

  if (large) {
    const bath = spaces.filter((s) => s.kind === 'banho_geriatrico');
    if (!bath.length) {
      out.push({ severity: 'erro', rule: 'Anexo I, Ficha 6.4', message: 'Acima de 20 residentes é obrigatório um banho geriátrico.' });
    } else if (bath.every((s) => (s.areaM2 ?? 0) < 10)) {
      out.push({ severity: 'erro', rule: 'Anexo I, Ficha 6.4', message: 'O banho geriátrico tem de ter pelo menos 10 m².' });
    }
    const lounge = spaces.filter((s) => s.kind === 'sala_estar_copa');
    if (!lounge.length) {
      out.push({ severity: 'erro', rule: 'Anexo I, Ficha 6.5', message: 'Falta uma sala de estar com copa.' });
    } else if (lounge.every((s) => (s.areaM2 ?? 0) < 12)) {
      out.push({ severity: 'aviso', rule: 'Anexo I, Ficha 6.5', message: 'A sala de estar com copa deve ter pelo menos 12 m².' });
    }
  }

  return out;
}
