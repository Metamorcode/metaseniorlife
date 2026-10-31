/**
 * Modelo editável de um lar. Um template descreve o edifício de forma compacta
 * (grupos de quartos iguais por piso) e é expandido para quartos e camas concretos.
 * O mesmo formato serve qualquer cliente: basta um novo ficheiro JSON.
 */

export type WcType = 'privativo' | 'partilhado';

export type SpaceKind =
  | 'rececao'
  | 'direcao'
  | 'gabinete_tecnico'
  | 'refeitorio'
  | 'cozinha'
  | 'despensa'
  | 'lavandaria'
  | 'sala_convivio'
  | 'sala_atividades'
  | 'sala_estar_copa'
  | 'enfermaria'
  | 'posto_enfermagem'
  | 'fisioterapia'
  | 'cabeleireiro'
  | 'vestiario_pessoal'
  | 'wc_comum'
  | 'banho_geriatrico'
  | 'sujos'
  | 'arrecadacao'
  | 'bastidor_rede'
  | 'corredor'
  | 'jardim';

export interface RoomGroupTemplate {
  /** Camas por quarto. A validação ERPI aceita 1 a 3. */
  beds: number;
  count: number;
  areaM2: number;
  wc: WcType;
  /** Quarto de casal: 2 camas num quarto que conta como individual (área mínima própria). */
  casal?: boolean;
}

export interface SpaceTemplate {
  kind: SpaceKind;
  name?: string;
  areaM2?: number;
  /** Quantos espaços iguais (por omissão 1). */
  count?: number;
  /** Minutos entre limpezas; por omissão vem de DEFAULT_CLEANING_INTERVAL_MIN. */
  cleaningIntervalMin?: number;
}

export interface FloorTemplate {
  level: number;
  name: string;
  /** Unidade funcional (obrigatória por lei acima de 80 residentes). */
  functionalUnit?: string;
  rooms?: RoomGroupTemplate[];
  spaces?: SpaceTemplate[];
}

export interface FacilityTemplate {
  schemaVersion: 1;
  id: string;
  name: string;
  regime: 'ERPI';
  floors: FloorTemplate[];
}

export type RoomKind = 'individual' | 'casal' | 'duplo' | 'triplo' | 'nao_permitido';

export interface Bed {
  code: string;
}

export interface Room {
  code: string;
  floorLevel: number;
  kind: RoomKind;
  areaM2: number;
  wc: WcType;
  beds: Bed[];
  cleaningIntervalMin: number;
}

export interface Space {
  code: string;
  floorLevel: number;
  kind: SpaceKind;
  name: string;
  areaM2?: number;
  cleaningIntervalMin: number;
}

export interface Floor {
  level: number;
  name: string;
  functionalUnit?: string;
  rooms: Room[];
  spaces: Space[];
}

export interface Facility {
  id: string;
  name: string;
  regime: 'ERPI';
  floors: Floor[];
  capacity: number;
}
