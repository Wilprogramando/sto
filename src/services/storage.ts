import type {
  Hino,
  Repertorio,
  Configuracoes,
  HarpaItem,
  BackupCompleto,
} from '../types';
import { harpaCristaBaseInicial } from '../data/harpaBase';

// Chaves de armazenamento
const KEYS = {
  HINOS: 'repertorio_hinos',
  REPERTORIOS: 'repertorio_repertorios',
  CONFIGURACOES: 'repertorio_configuracoes',
  HARPA_BASE: 'repertorio_harpa_base',
} as const;

// Configurações padrão
const configuracoesPadrao: Configuracoes = {
  nomeIgreja: 'Igreja',
  responsavel: '',
  rodapePdf: 'Repertório da Igreja - Gerado pelo sistema',
};

/**
 * Função utilitária para ler dados do localStorage com tratamento de erro.
 */
function ler<T>(chave: string, padrao: T): T {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return padrao;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Erro ao ler ${chave}:`, e);
    return padrao;
  }
}

/**
 * Função utilitária para gravar dados no localStorage.
 */
function gravar<T>(chave: string, valor: T): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (e) {
    console.error(`Erro ao gravar ${chave}:`, e);
    throw new Error('Não foi possível salvar os dados. Espaço esgotado?');
  }
}

// ===== HINOS =====
export const storageHinos = {
  listar(): Hino[] {
    return ler<Hino[]>(KEYS.HINOS, []);
  },
  salvar(hinos: Hino[]): void {
    gravar(KEYS.HINOS, hinos);
  },
};

// ===== REPERTÓRIOS =====
export const storageRepertorios = {
  listar(): Repertorio[] {
    return ler<Repertorio[]>(KEYS.REPERTORIOS, []);
  },
  salvar(repertorios: Repertorio[]): void {
    gravar(KEYS.REPERTORIOS, repertorios);
  },
};

// ===== CONFIGURAÇÕES =====
export const storageConfiguracoes = {
  obter(): Configuracoes {
    return ler<Configuracoes>(KEYS.CONFIGURACOES, configuracoesPadrao);
  },
  salvar(config: Configuracoes): void {
    gravar(KEYS.CONFIGURACOES, config);
  },
};

// ===== BASE DA HARPA =====
export const storageHarpaBase = {
  listar(): HarpaItem[] {
    const dados = ler<HarpaItem[] | null>(KEYS.HARPA_BASE, null);
    if (dados === null) {
      // Primeira vez - grava a base inicial
      gravar(KEYS.HARPA_BASE, harpaCristaBaseInicial);
      return harpaCristaBaseInicial;
    }
    return dados;
  },
  salvar(base: HarpaItem[]): void {
    // Ordena por número e remove duplicados (mantém o último)
    const mapa = new Map<number, HarpaItem>();
    base.forEach((item) => mapa.set(item.numero, item));
    const ordenado = Array.from(mapa.values()).sort(
      (a, b) => a.numero - b.numero
    );
    gravar(KEYS.HARPA_BASE, ordenado);
  },
  buscarPorNumero(numero: number): HarpaItem | undefined {
    const base = storageHarpaBase.listar();
    return base.find((item) => item.numero === numero);
  },
};

// ===== BACKUP =====
export const storageBackup = {
  exportar(): BackupCompleto {
    return {
      hinos: storageHinos.listar(),
      repertorios: storageRepertorios.listar(),
      configuracoes: storageConfiguracoes.obter(),
      harpaBase: storageHarpaBase.listar(),
      versao: '1.0.0',
      exportadoEm: new Date().toISOString(),
    };
  },
  importar(backup: BackupCompleto): void {
    if (!backup || typeof backup !== 'object') {
      throw new Error('Backup inválido');
    }
    if (Array.isArray(backup.hinos)) storageHinos.salvar(backup.hinos);
    if (Array.isArray(backup.repertorios))
      storageRepertorios.salvar(backup.repertorios);
    if (backup.configuracoes)
      storageConfiguracoes.salvar(backup.configuracoes);
    if (Array.isArray(backup.harpaBase))
      storageHarpaBase.salvar(backup.harpaBase);
  },
  limparTudo(): void {
    localStorage.removeItem(KEYS.HINOS);
    localStorage.removeItem(KEYS.REPERTORIOS);
    localStorage.removeItem(KEYS.CONFIGURACOES);
    localStorage.removeItem(KEYS.HARPA_BASE);
  },
};
