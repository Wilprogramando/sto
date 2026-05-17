// Tipos principais do sistema

export type TomMusical =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';

export const TONS_MUSICAIS: TomMusical[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export type CategoriaHino =
  | 'Louvor'
  | 'Adoração'
  | 'Coral'
  | 'Congregacional'
  | 'Outro';

export const CATEGORIAS_HINO: CategoriaHino[] = [
  'Louvor',
  'Adoração',
  'Coral',
  'Congregacional',
  'Outro',
];

export type TipoHino = 'comum' | 'harpa';

export interface Hino {
  id: string;
  nome: string;
  tom: string;
  cantor: string;
  letra: string;
  categoria: string;
  observacoes?: string;
  tipo: TipoHino;
  numeroHarpa?: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface HinoRepertorio {
  id: string;
  hinoId: string;
  ordem: number;
  nome: string;
  tom: string;
  cantor: string;
  letra?: string;
  numeroHarpa?: number;
  observacoes?: string;
  tipo: TipoHino;
}

export interface Repertorio {
  id: string;
  nome: string;
  data: string;
  horario?: string;
  observacoes?: string;
  hinos: HinoRepertorio[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface Configuracoes {
  nomeIgreja: string;
  responsavel: string;
  rodapePdf: string;
}

export interface HarpaItem {
  numero: number;
  nome: string;
}

export interface BackupCompleto {
  hinos: Hino[];
  repertorios: Repertorio[];
  configuracoes: Configuracoes;
  harpaBase: HarpaItem[];
  versao: string;
  exportadoEm: string;
}
