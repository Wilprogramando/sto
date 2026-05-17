import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Hino,
  Repertorio,
  Configuracoes,
  HarpaItem,
  HinoRepertorio,
} from '../types';
import {
  storageHinos,
  storageRepertorios,
  storageConfiguracoes,
  storageHarpaBase,
} from '../services/storage';

interface AppContextType {
  // Estado
  hinos: Hino[];
  repertorios: Repertorio[];
  configuracoes: Configuracoes;
  harpaBase: HarpaItem[];

  // Hinos
  salvarHino: (
    hino: Omit<Hino, 'id' | 'criadoEm' | 'atualizadoEm'>
  ) => Hino;
  atualizarHino: (id: string, dados: Partial<Hino>) => void;
  excluirHino: (id: string) => void;
  obterHino: (id: string) => Hino | undefined;

  // Repertórios
  salvarRepertorio: (
    rep: Omit<Repertorio, 'id' | 'criadoEm' | 'atualizadoEm'>
  ) => Repertorio;
  atualizarRepertorio: (id: string, dados: Partial<Repertorio>) => void;
  excluirRepertorio: (id: string) => void;
  duplicarRepertorio: (id: string) => Repertorio | undefined;
  obterRepertorio: (id: string) => Repertorio | undefined;

  // Configurações
  atualizarConfiguracoes: (config: Configuracoes) => void;

  // Harpa
  atualizarHarpaBase: (base: HarpaItem[]) => void;
  adicionarItemHarpa: (item: HarpaItem) => void;
  buscarNomeHarpa: (numero: number) => string | undefined;

  // Recarregar (após import)
  recarregarTudo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hinos, setHinos] = useState<Hino[]>([]);
  const [repertorios, setRepertorios] = useState<Repertorio[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    nomeIgreja: '',
    responsavel: '',
    rodapePdf: '',
  });
  const [harpaBase, setHarpaBase] = useState<HarpaItem[]>([]);

  // Carrega tudo do localStorage no início
  const recarregarTudo = useCallback(() => {
    setHinos(storageHinos.listar());
    setRepertorios(storageRepertorios.listar());
    setConfiguracoes(storageConfiguracoes.obter());
    setHarpaBase(storageHarpaBase.listar());
  }, []);

  useEffect(() => {
    recarregarTudo();
  }, [recarregarTudo]);

  // ===== HINOS =====
  const salvarHino = useCallback(
    (dados: Omit<Hino, 'id' | 'criadoEm' | 'atualizadoEm'>): Hino => {
      const agora = new Date().toISOString();
      const novo: Hino = {
        ...dados,
        id: uuidv4(),
        criadoEm: agora,
        atualizadoEm: agora,
      };
      const atualizados = [...storageHinos.listar(), novo];
      storageHinos.salvar(atualizados);
      setHinos(atualizados);
      return novo;
    },
    []
  );

  const atualizarHino = useCallback((id: string, dados: Partial<Hino>) => {
    const atuais = storageHinos.listar();
    const atualizados = atuais.map((h) =>
      h.id === id
        ? { ...h, ...dados, id: h.id, atualizadoEm: new Date().toISOString() }
        : h
    );
    storageHinos.salvar(atualizados);
    setHinos(atualizados);
  }, []);

  const excluirHino = useCallback((id: string) => {
    const atuais = storageHinos.listar();
    const filtrados = atuais.filter((h) => h.id !== id);
    storageHinos.salvar(filtrados);
    setHinos(filtrados);
  }, []);

  const obterHino = useCallback(
    (id: string) => hinos.find((h) => h.id === id),
    [hinos]
  );

  // ===== REPERTÓRIOS =====
  const salvarRepertorio = useCallback(
    (
      dados: Omit<Repertorio, 'id' | 'criadoEm' | 'atualizadoEm'>
    ): Repertorio => {
      const agora = new Date().toISOString();
      const novo: Repertorio = {
        ...dados,
        id: uuidv4(),
        criadoEm: agora,
        atualizadoEm: agora,
      };
      const atualizados = [...storageRepertorios.listar(), novo];
      storageRepertorios.salvar(atualizados);
      setRepertorios(atualizados);
      return novo;
    },
    []
  );

  const atualizarRepertorio = useCallback(
    (id: string, dados: Partial<Repertorio>) => {
      const atuais = storageRepertorios.listar();
      const atualizados = atuais.map((r) =>
        r.id === id
          ? {
              ...r,
              ...dados,
              id: r.id,
              atualizadoEm: new Date().toISOString(),
            }
          : r
      );
      storageRepertorios.salvar(atualizados);
      setRepertorios(atualizados);
    },
    []
  );

  const excluirRepertorio = useCallback((id: string) => {
    const atuais = storageRepertorios.listar();
    const filtrados = atuais.filter((r) => r.id !== id);
    storageRepertorios.salvar(filtrados);
    setRepertorios(filtrados);
  }, []);

  const duplicarRepertorio = useCallback(
    (id: string): Repertorio | undefined => {
      const original = storageRepertorios.listar().find((r) => r.id === id);
      if (!original) return undefined;

      const agora = new Date().toISOString();
      const copia: Repertorio = {
        ...original,
        id: uuidv4(),
        nome: `${original.nome} (cópia)`,
        criadoEm: agora,
        atualizadoEm: agora,
        hinos: original.hinos.map((h: HinoRepertorio) => ({
          ...h,
          id: uuidv4(),
        })),
      };
      const atualizados = [...storageRepertorios.listar(), copia];
      storageRepertorios.salvar(atualizados);
      setRepertorios(atualizados);
      return copia;
    },
    []
  );

  const obterRepertorio = useCallback(
    (id: string) => repertorios.find((r) => r.id === id),
    [repertorios]
  );

  // ===== CONFIGURAÇÕES =====
  const atualizarConfiguracoes = useCallback((config: Configuracoes) => {
    storageConfiguracoes.salvar(config);
    setConfiguracoes(config);
  }, []);

  // ===== HARPA =====
  const atualizarHarpaBase = useCallback((base: HarpaItem[]) => {
    storageHarpaBase.salvar(base);
    setHarpaBase(storageHarpaBase.listar());
  }, []);

  const adicionarItemHarpa = useCallback((item: HarpaItem) => {
    const atual = storageHarpaBase.listar();
    const idx = atual.findIndex((i) => i.numero === item.numero);
    let novo: HarpaItem[];
    if (idx >= 0) {
      novo = [...atual];
      novo[idx] = item;
    } else {
      novo = [...atual, item];
    }
    storageHarpaBase.salvar(novo);
    setHarpaBase(storageHarpaBase.listar());
  }, []);

  const buscarNomeHarpa = useCallback(
    (numero: number) => {
      const item = harpaBase.find((i) => i.numero === numero);
      return item?.nome;
    },
    [harpaBase]
  );

  const value: AppContextType = {
    hinos,
    repertorios,
    configuracoes,
    harpaBase,
    salvarHino,
    atualizarHino,
    excluirHino,
    obterHino,
    salvarRepertorio,
    atualizarRepertorio,
    excluirRepertorio,
    duplicarRepertorio,
    obterRepertorio,
    atualizarConfiguracoes,
    atualizarHarpaBase,
    adicionarItemHarpa,
    buscarNomeHarpa,
    recarregarTudo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
