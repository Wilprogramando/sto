import { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Upload,
  Database,
  Hash,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Button,
  Input,
  Card,
  Badge,
  PageHeader,
  EmptyState,
} from '../components/ui';
import { ConfirmModal, Modal } from '../components/Modal';
import { VisualizarHino } from '../components/VisualizarHino';
import { FormHino } from '../components/FormHino';
import type { Hino, HarpaItem } from '../types';
import { normalizarBusca, lerArquivoTexto, parseCSVHarpa } from '../utils/helpers';

export function HarpaPage() {
  const { hinos, excluirHino, harpaBase, atualizarHarpaBase, adicionarItemHarpa } =
    useApp();
  const { sucesso, erro, info } = useToast();

  const hinosHarpa = useMemo(
    () => hinos.filter((h) => h.tipo === 'harpa'),
    [hinos]
  );

  const [busca, setBusca] = useState('');
  const [buscaNumero, setBuscaNumero] = useState('');

  const [hinoVisualizando, setHinoVisualizando] = useState<Hino | null>(null);
  const [hinoEditando, setHinoEditando] = useState<Hino | null>(null);
  const [hinoExcluindo, setHinoExcluindo] = useState<Hino | null>(null);

  const [modalNovo, setModalNovo] = useState(false);
  const [numeroPreenchimento, setNumeroPreenchimento] = useState<number | undefined>();
  const [nomePreenchimento, setNomePreenchimento] = useState<string | undefined>();

  const [modalBase, setModalBase] = useState(false);

  const hinosFiltrados = useMemo(() => {
    let lista = hinosHarpa;
    if (busca.trim()) {
      const norm = normalizarBusca(busca);
      lista = lista.filter((h) => normalizarBusca(h.nome).includes(norm));
    }
    if (buscaNumero.trim()) {
      lista = lista.filter((h) =>
        h.numeroHarpa?.toString().includes(buscaNumero.trim())
      );
    }
    return [...lista].sort(
      (a, b) => (a.numeroHarpa || 0) - (b.numeroHarpa || 0)
    );
  }, [hinosHarpa, busca, buscaNumero]);

  const handleExcluir = () => {
    if (hinoExcluindo) {
      excluirHino(hinoExcluindo.id);
      sucesso(`Hino excluído`);
      setHinoExcluindo(null);
    }
  };

  // Cadastro rápido a partir de número (lookup automático)
  const [numeroRapido, setNumeroRapido] = useState('');
  const handleCadastrarPorNumero = () => {
    const num = parseInt(numeroRapido, 10);
    if (isNaN(num) || num <= 0) {
      erro('Informe um número válido');
      return;
    }
    const itemBase = harpaBase.find((i) => i.numero === num);
    setNumeroPreenchimento(num);
    setNomePreenchimento(itemBase?.nome);
    setModalNovo(true);
    setNumeroRapido('');
    if (!itemBase) {
      info(
        `Hino nº ${num} não está na base. Você pode cadastrar manualmente.`
      );
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Hinos da Harpa"
        descricao="Cadastre e gerencie hinos da Harpa Cristã"
        icone={<BookOpen className="w-6 h-6" />}
        acoes={
          <>
            <Button
              variant="outline"
              onClick={() => setModalBase(true)}
              icone={<Database className="w-4 h-4" />}
            >
              Gerenciar Base
            </Button>
            <Button
              onClick={() => {
                setNumeroPreenchimento(undefined);
                setNomePreenchimento(undefined);
                setModalNovo(true);
              }}
              icone={<Plus className="w-4 h-4" />}
            >
              Cadastrar Hino
            </Button>
          </>
        }
      />

      {/* Cadastro rápido por número */}
      <Card className="mb-4 bg-purple-50 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Cadastro rápido por número</h3>
        </div>
        <p className="text-sm text-purple-700 mb-3">
          Digite o número do hino da Harpa Cristã. Se estiver na base, o nome será preenchido automaticamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            min={1}
            value={numeroRapido}
            onChange={(e) => setNumeroRapido(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCadastrarPorNumero()}
            placeholder="Ex: 137"
            className="flex-1 px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <Button
            onClick={handleCadastrarPorNumero}
            disabled={!numeroRapido}
            icone={<Plus className="w-4 h-4" />}
          >
            Cadastrar Nº {numeroRapido || ''}
          </Button>
        </div>
        <p className="text-xs text-purple-600 mt-2">
          Base atual: {harpaBase.length} hino(s) registrado(s)
        </p>
      </Card>

      {/* Busca */}
      <Card className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por nome..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <input
            type="number"
            value={buscaNumero}
            onChange={(e) => setBuscaNumero(e.target.value)}
            placeholder="Buscar por número"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Lista */}
      {hinosFiltrados.length === 0 ? (
        <Card>
          <EmptyState
            icone={<BookOpen className="w-8 h-8" />}
            titulo={
              hinosHarpa.length === 0
                ? 'Nenhum hino da Harpa cadastrado'
                : 'Nenhum hino encontrado'
            }
            descricao={
              hinosHarpa.length === 0
                ? 'Use o cadastro rápido por número acima ou clique em Cadastrar Hino'
                : 'Tente outra busca'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hinosFiltrados.map((hino) => (
            <Card
              key={hino.id}
              className="hover:shadow-md transition cursor-pointer"
            >
              <div onClick={() => setHinoVisualizando(hino)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                    Nº {hino.numeroHarpa}
                  </span>
                  {hino.tom && <Badge variant="primary">{hino.tom}</Badge>}
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-2">
                  {hino.nome}
                </h3>
                {hino.cantor && (
                  <p className="text-xs text-gray-600 mt-2">
                    🎤 {hino.cantor}
                  </p>
                )}
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHinoVisualizando(hino);
                  }}
                  icone={<Eye className="w-4 h-4" />}
                >
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHinoEditando(hino);
                  }}
                  icone={<Edit className="w-4 h-4" />}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHinoExcluindo(hino);
                  }}
                  icone={<Trash2 className="w-4 h-4 text-red-500" />}
                  className="ml-auto"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Visualização */}
      {hinoVisualizando && (
        <VisualizarHino
          hino={hinoVisualizando}
          aberto={!!hinoVisualizando}
          onFechar={() => setHinoVisualizando(null)}
          onEditar={() => {
            setHinoEditando(hinoVisualizando);
            setHinoVisualizando(null);
          }}
        />
      )}

      {/* Edição */}
      <Modal
        aberto={!!hinoEditando}
        onFechar={() => setHinoEditando(null)}
        titulo="Editar Hino da Harpa"
        largura="lg"
      >
        {hinoEditando && (
          <FormHino
            hino={hinoEditando}
            tipoFixo="harpa"
            onSalvo={() => setHinoEditando(null)}
            onCancelar={() => setHinoEditando(null)}
          />
        )}
      </Modal>

      {/* Novo */}
      <Modal
        aberto={modalNovo}
        onFechar={() => setModalNovo(false)}
        titulo="Cadastrar Hino da Harpa"
        largura="lg"
      >
        <FormHino
          tipoFixo="harpa"
          numeroHarpaInicial={numeroPreenchimento}
          nomeInicial={nomePreenchimento}
          onSalvo={() => {
            setModalNovo(false);
            setNumeroPreenchimento(undefined);
            setNomePreenchimento(undefined);
          }}
          onCancelar={() => setModalNovo(false)}
        />
      </Modal>

      {/* Confirmação */}
      <ConfirmModal
        aberto={!!hinoExcluindo}
        titulo="Excluir Hino"
        mensagem={`Deseja excluir "${hinoExcluindo?.nome}"?\n\nEsta ação não pode ser desfeita.`}
        textoConfirmar="Sim, Excluir"
        onConfirmar={handleExcluir}
        onCancelar={() => setHinoExcluindo(null)}
      />

      {/* Gerenciar Base */}
      <Modal
        aberto={modalBase}
        onFechar={() => setModalBase(false)}
        titulo="Base de Dados da Harpa Cristã"
        largura="xl"
      >
        <GerenciarBase
          base={harpaBase}
          onSalvarBase={atualizarHarpaBase}
          onAdicionar={adicionarItemHarpa}
          onErro={erro}
          onSucesso={sucesso}
        />
      </Modal>
    </div>
  );
}

// ============================================
// Componente para gerenciar a base de hinos da Harpa
// ============================================
interface GerenciarBaseProps {
  base: HarpaItem[];
  onSalvarBase: (b: HarpaItem[]) => void;
  onAdicionar: (item: HarpaItem) => void;
  onErro: (m: string) => void;
  onSucesso: (m: string) => void;
}

function GerenciarBase({
  base,
  onSalvarBase,
  onAdicionar,
  onErro,
  onSucesso,
}: GerenciarBaseProps) {
  const [novoNumero, setNovoNumero] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [busca, setBusca] = useState('');
  const [editingNum, setEditingNum] = useState<number | null>(null);
  const [editingNome, setEditingNome] = useState('');

  const filtrada = useMemo(() => {
    if (!busca.trim()) return base;
    const norm = normalizarBusca(busca);
    return base.filter(
      (i) =>
        normalizarBusca(i.nome).includes(norm) ||
        i.numero.toString().includes(busca.trim())
    );
  }, [base, busca]);

  const handleAdd = () => {
    const num = parseInt(novoNumero, 10);
    if (isNaN(num) || num <= 0) {
      onErro('Número inválido');
      return;
    }
    if (!novoNome.trim()) {
      onErro('Nome é obrigatório');
      return;
    }
    onAdicionar({ numero: num, nome: novoNome.trim() });
    onSucesso(`Nº ${num} adicionado à base`);
    setNovoNumero('');
    setNovoNome('');
  };

  const handleRemover = (numero: number) => {
    onSalvarBase(base.filter((i) => i.numero !== numero));
    onSucesso(`Nº ${numero} removido da base`);
  };

  const handleSalvarEdicao = (numero: number) => {
    if (!editingNome.trim()) {
      onErro('Nome não pode ficar vazio');
      return;
    }
    const novo = base.map((i) =>
      i.numero === numero ? { ...i, nome: editingNome.trim() } : i
    );
    onSalvarBase(novo);
    setEditingNum(null);
    setEditingNome('');
    onSucesso('Alterado');
  };

  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      const conteudo = await lerArquivoTexto(arquivo);
      let itens: HarpaItem[] = [];

      if (arquivo.name.endsWith('.json')) {
        const parsed = JSON.parse(conteudo);
        if (Array.isArray(parsed)) {
          itens = parsed
            .filter(
              (i: any) =>
                i &&
                typeof i.numero === 'number' &&
                typeof i.nome === 'string' &&
                i.nome.trim()
            )
            .map((i: any) => ({ numero: i.numero, nome: i.nome.trim() }));
        }
      } else {
        // CSV
        itens = parseCSVHarpa(conteudo);
      }

      if (itens.length === 0) {
        onErro('Nenhum item válido encontrado no arquivo');
        return;
      }

      // Mescla: substitui existentes, adiciona novos
      const mapa = new Map(base.map((i) => [i.numero, i]));
      itens.forEach((i) => mapa.set(i.numero, i));
      const final = Array.from(mapa.values()).sort(
        (a, b) => a.numero - b.numero
      );
      onSalvarBase(final);
      onSucesso(`${itens.length} hino(s) importado(s)`);
    } catch (err: any) {
      onErro('Erro ao importar: ' + (err.message || 'arquivo inválido'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
        <strong>⚠️ Importante:</strong> A Harpa Cristã possui 640 hinos. A base
        inicial contém apenas alguns exemplos conhecidos. Importe um arquivo
        JSON ou CSV completo, ou adicione os nomes manualmente conforme
        precisar.
      </div>

      {/* Importar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Importar Base (JSON ou CSV)
        </h4>
        <p className="text-xs text-blue-800 mb-3">
          <strong>JSON:</strong>{' '}
          <code>[{`{"numero":1,"nome":"..."}`}]</code>
          <br />
          <strong>CSV:</strong> uma linha por hino: <code>1,Nome do hino</code>
        </p>
        <label className="inline-block">
          <input
            type="file"
            accept=".json,.csv,.txt"
            onChange={handleImportar}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            Selecionar Arquivo
          </span>
        </label>
      </div>

      {/* Adicionar manualmente */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">
          Adicionar / Atualizar manualmente
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-2">
          <Input
            type="number"
            value={novoNumero}
            onChange={(e) => setNovoNumero(e.target.value)}
            placeholder="Nº"
          />
          <Input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome do hino"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} icone={<Plus className="w-4 h-4" />}>
            Adicionar
          </Button>
        </div>
      </div>

      {/* Lista */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">
            Base ({base.length} hinos)
          </h4>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-48"
          />
        </div>
        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto divide-y divide-gray-100">
          {filtrada.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-500">
              Nenhum item na base
            </p>
          ) : (
            filtrada.map((item) => (
              <div
                key={item.numero}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
              >
                <span className="font-bold text-purple-600 w-12 flex-shrink-0">
                  {item.numero}
                </span>
                {editingNum === item.numero ? (
                  <>
                    <input
                      type="text"
                      value={editingNome}
                      onChange={(e) => setEditingNome(e.target.value)}
                      autoFocus
                      className="flex-1 px-2 py-1 border border-primary-400 rounded text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSalvarEdicao(item.numero);
                        if (e.key === 'Escape') {
                          setEditingNum(null);
                          setEditingNome('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSalvarEdicao(item.numero)}
                    >
                      OK
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingNum(null);
                        setEditingNome('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800 truncate">
                      {item.nome}
                    </span>
                    <button
                      onClick={() => {
                        setEditingNum(item.numero);
                        setEditingNome(item.nome);
                      }}
                      className="text-gray-400 hover:text-primary-600 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemover(item.numero)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
