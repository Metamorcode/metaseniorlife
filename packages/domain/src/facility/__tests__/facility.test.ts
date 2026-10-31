import { describe, expect, it } from 'vitest';
import piloto from '../../../../../templates/lar-piloto-simulado.json';
import briefing from '../../../../../templates/lar-40-quartos-briefing.json';
import { expandFacility, summarize, validateErpi, type FacilityTemplate } from '..';

const tpl = (t: unknown) => t as FacilityTemplate;
const errors = (t: FacilityTemplate) => validateErpi(expandFacility(t)).filter((f) => f.severity === 'erro');

function base(rooms: FacilityTemplate['floors'][number]['rooms'], unit = 'Unidade A'): FacilityTemplate {
  return {
    schemaVersion: 1,
    id: 't',
    name: 't',
    regime: 'ERPI',
    floors: [
      {
        level: 1,
        name: 'Piso 1',
        functionalUnit: unit,
        rooms,
        spaces: [
          { kind: 'sujos', areaM2: 6 },
          { kind: 'banho_geriatrico', areaM2: 12 },
          { kind: 'sala_estar_copa', areaM2: 20 },
        ],
      },
    ],
  };
}

describe('expandFacility', () => {
  it('Dado o lar piloto simulado, então tem 3 pisos, 50 quartos e 100 camas', () => {
    const f = expandFacility(tpl(piloto));
    const s = summarize(f);
    expect(f.floors).toHaveLength(3);
    expect(s.rooms).toBe(50);
    expect(s.capacity).toBe(100);
    expect(s.roomsByKind).toMatchObject({ individual: 10, duplo: 30, triplo: 10 });
  });

  it('gera códigos estáveis de quarto e cama', () => {
    const room = expandFacility(tpl(piloto)).floors[1]!.rooms[0]!;
    expect(room.code).toBe('1.01');
    expect(room.beds.map((b) => b.code)).toEqual(['1.01-A']);
    const triple = expandFacility(tpl(piloto)).floors[2]!.rooms.at(-1)!;
    expect(triple.code).toBe('2.25');
    expect(triple.beds.map((b) => b.code)).toEqual(['2.25-A', '2.25-B', '2.25-C']);
  });

  it('usa o intervalo de limpeza por omissão e aceita o do template', () => {
    const f = expandFacility({
      ...base([{ beds: 1, count: 1, areaM2: 12, wc: 'privativo' }]),
      floors: [{ level: 0, name: 'R/C', spaces: [{ kind: 'wc_comum' }, { kind: 'refeitorio', cleaningIntervalMin: 90 }] }],
    });
    expect(f.floors[0]!.spaces.map((s) => s.cleaningIntervalMin)).toEqual([180, 90]);
  });
});

describe('validateErpi (Portaria 67/2012)', () => {
  it('Dado o lar piloto simulado, então não tem erros', () => {
    expect(errors(tpl(piloto))).toEqual([]);
  });

  it('Dado o briefing de 40 quartos com quartos de 4 camas, então aponta os quartos não permitidos e o excesso de triplos', () => {
    const e = errors(tpl(briefing));
    expect(expandFacility(tpl(briefing)).capacity).toBe(100);
    expect(e.filter((x) => x.message.includes('4 camas'))).toHaveLength(8);
    expect(e.some((x) => x.message.includes('triplos'))).toBe(true);
  });

  it('recusa quartos abaixo da área mínima', () => {
    const e = errors(base([{ beds: 2, count: 30, areaM2: 15.9, wc: 'privativo' }, { beds: 1, count: 10, areaM2: 10, wc: 'privativo' }]));
    expect(e.filter((x) => x.rule === 'Anexo I, Ficha 6.3.1')).toHaveLength(30);
  });

  it('exige pelo menos 20% de quartos individuais acima de 20 residentes', () => {
    const e = errors(base([{ beds: 2, count: 20, areaM2: 16, wc: 'privativo' }, { beds: 1, count: 4, areaM2: 10, wc: 'privativo' }]));
    expect(e.some((x) => x.message.includes('20% dos quartos têm de ser individuais'))).toBe(true);
  });

  it('aceita o casal como quarto individual com 12 m²', () => {
    const e = errors(base([{ beds: 2, count: 8, areaM2: 16, wc: 'privativo' }, { beds: 2, casal: true, count: 2, areaM2: 12, wc: 'privativo' }]));
    expect(e).toEqual([]);
  });

  it('acima de 80 residentes exige unidades funcionais de no máximo 60', () => {
    const big = base([{ beds: 2, count: 34, areaM2: 16, wc: 'privativo' }, { beds: 1, count: 13, areaM2: 10, wc: 'privativo' }]);
    expect(expandFacility(big).capacity).toBe(81);
    expect(errors(big).some((x) => x.rule === 'Art. 6.º, n.º 3')).toBe(true);
  });

  it('acima de 120 residentes recusa a capacidade', () => {
    const huge: FacilityTemplate = {
      ...base([]),
      floors: [1, 2, 3].map((level) => ({
        level,
        name: `Piso ${level}`,
        functionalUnit: `U${level}`,
        rooms: [{ beds: 2, count: 16, areaM2: 16, wc: 'privativo' as const }, { beds: 1, count: 9, areaM2: 10, wc: 'privativo' as const }],
        spaces: [{ kind: 'sujos' as const }],
      })),
    };
    expect(expandFacility(huge).capacity).toBe(123);
    expect(errors(huge).some((x) => x.rule === 'Art. 6.º, n.º 1')).toBe(true);
  });

  it('acima de 80 residentes recusa pisos com quartos sem unidade funcional', () => {
    const t = base([{ beds: 2, count: 34, areaM2: 16, wc: 'privativo' }, { beds: 1, count: 13, areaM2: 10, wc: 'privativo' }]);
    t.floors[0]!.functionalUnit = undefined;
    expect(errors(t).some((x) => x.rule === 'Art. 6.º, n.os 2 a 4')).toBe(true);
  });

  it('abaixo de 4 residentes recusa a capacidade', () => {
    expect(errors(base([{ beds: 1, count: 3, areaM2: 10, wc: 'privativo' }])).some((x) => x.rule === 'Art. 6.º, n.º 1')).toBe(true);
  });

  it('num lar pequeno exige um individual e no máximo um triplo', () => {
    const e = errors(base([{ beds: 3, count: 2, areaM2: 21, wc: 'privativo' }, { beds: 2, count: 2, areaM2: 16, wc: 'privativo' }]));
    expect(e.map((x) => x.rule)).toEqual(['Anexo I, Ficha 6.3.7', 'Anexo I, Ficha 6.3.7']);
  });

  it('acima de 20 residentes exige compartimento de sujos, banho geriátrico e sala de estar com copa', () => {
    const t = base([{ beds: 2, count: 16, areaM2: 16, wc: 'privativo' }, { beds: 1, count: 5, areaM2: 10, wc: 'privativo' }]);
    t.floors[0]!.spaces = [];
    const rules = errors(t).map((x) => x.rule);
    expect(rules).toEqual(expect.arrayContaining(['Anexo I, Ficha 6.3.2', 'Anexo I, Ficha 6.4', 'Anexo I, Ficha 6.5']));
  });

  it('assinala banho geriátrico pequeno como erro e sala de estar pequena como aviso', () => {
    const t = base([{ beds: 2, count: 16, areaM2: 16, wc: 'privativo' }, { beds: 1, count: 5, areaM2: 10, wc: 'privativo' }]);
    t.floors[0]!.spaces = [{ kind: 'sujos' }, { kind: 'banho_geriatrico', areaM2: 8 }, { kind: 'sala_estar_copa', areaM2: 10 }];
    const all = validateErpi(expandFacility(t));
    expect(all.find((x) => x.rule === 'Anexo I, Ficha 6.4')?.severity).toBe('erro');
    expect(all.find((x) => x.rule === 'Anexo I, Ficha 6.5')?.severity).toBe('aviso');
  });

  it('com WC partilhado exige uma instalação sanitária por cada 4 residentes', () => {
    const e = errors(base([{ beds: 2, count: 4, areaM2: 16, wc: 'partilhado' }, { beds: 1, count: 2, areaM2: 10, wc: 'privativo' }]));
    expect(e.some((x) => x.rule === 'Anexo I, Ficha 6.3.1 d)')).toBe(true);
  });
});
