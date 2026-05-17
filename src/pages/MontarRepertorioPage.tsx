import { useState, useMemo, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  ListMusic,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Music,
  BookOpen,
  Download,
  MessageCircle,
  Copy as CopyIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Badge,
  PageHeader,
  EmptyState,
} from '../components/ui';
import { Modal, ConfirmModal } from '../components/Modal';
import { TONS_MUSICAIS } from '../types';
import type { Hino, HinoRepertorio, Repertorio } from '../types';
import { normalizarBusca, formatarData } from '../utils/helpers';
import { gerarPDFRepertorio, baixarPDF } from '../services/pdf';
import {
  compartilharPDFWebShare,
  abrirWhatsAppComMensagem,
  mensagemRepertorio,
} from '../services/whatsapp';

export function MontarRepertorioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    hinos,
    obterRepertorio,
    salvarRepertorio,
    atualizarRepertorio,
    excluirRepertorio,
    duplicarRepertorio,
    configuracoes,
  } = useApp();
  const { sucesso, erro, info } = useToast();

  const repertorioExistente = id ? obterRepertorio(id) : undefined;
  const ehEdicao = !!repertorioExistente;

  const [nome, setNome] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [hinosSelecionados, setHinosSelecionados] = useState<HinoRepertorio[]>([]);

  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [incluirLetras, setIncluirLetras] = useState(false);
  const [modalPDF, setModalPDF] = useState(false);
  const [gerando, setGerando] = useState(false);

  // Carrega dados se for edição
  useEffect(() => {
    if (repertorioExistente) {
      setNome(repertorioExistente.nome);
      setData(repertorioExistente.data);
      setHorario(repertorioExistente.horario || '');
      setObservacoes(repertorioExistente.observacoes || '');
      setHinosSelecionados(
        [...repertorioExistente.hinos].sort((a, b) => a.ordem - b.ordem)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const adicionarHino = (hino: Hino) => {
    const ordem = hinosSelecionados.length + 1;
    const novo: HinoRepertorio = {
      id: uuidv4(),
      hinoId: hino.id,
      ordem,
      nome: hino.nome,
      tom: hino.tom,
      cantor: hino.cantor,
      letra: hino.letra,
      numeroHarpa: hino.numeroHarpa,
      observacoes: undefined,
      tipo: hino.tipo,
    };
    setHinosSelecionados([...hinosSelecionados, novo]);
    sucesso(`"${hino.nome}" adicionado`);
  };

  const removerHino = (id: string) => {
    const novo = hinosSelecionados
      .filter((h) => h.id !== id)
      .map((h, i) => ({ ...h, ordem: i + 1 }));
    setHinosSelecionados(novo);
  };

  const moverHino = (id: string, direcao: 'cima' | 'baixo') => {
    const idx = hinosSelecionados.findIndex((h) => h.id === id);
    if (idx < 0) return;
    const novoIdx = direcao === 'cima' ? idx - 1 : idx + 1;
    if (novoIdx < 0 || novoIdx >= hinosSelecionados.length) return;
    const arr = [...hinosSelecionados];
    [arr[idx], arr[novoIdx]] = [arr[novoIdx], arr[idx]];
    setHinosSelecionados(arr.map((h, i) => ({ ...h, ordem: i + 1 })));
  };

  const atualizarHinoRep = (id: string, campos: Partial<HinoRepertorio>) => {
    setHinosSelecionados(
      hinosSelecionados.map((h) => (h.id === id ? { ...h, ...campos } : h))
    );
  };

  const handleSalvar = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      erro('Informe o nome do repertório');
      return;
    }
    if (!data) {
      erro('Informe a data');
      return;
    }
    if (hinosSelecionados.length === 0) {
      erro('Adicione ao menos um hino');
      return;
    }

    const dados = {
      nome: nome.trim(),
      data,
      horario: horario || undefined,
      observacoes: observacoes.trim() || undefined,
      hinos: hinosSelecionados,
    };

    try {
      if (ehEdicao && repertorioExistente) {
        atualizarRepertorio(repertorioExistente.id, dados);
        sucesso('Repertório atualizado!');
      } else {
        const novo = salvarRepertorio(dados);
        sucesso('Repertório criado!');
        navigate(`/repertorio/${novo.id}`, { replace: true });
      }
    } catch (e: any) {
      erro(e.message || 'Erro ao salvar');
    }
  };

  const handleExcluir = () => {
    if (repertorioExistente) {
      excluirRepertorio(repertorioExistente.id);
      sucesso('Repertório excluído');
      navigate('/repertorios');
    }
  };

  const handleDuplicar = () => {
    if (repertorioExistente) {
      const dup = duplicarRepertorio(repertorioExistente.id);
      if (dup) {
        sucesso('Repertório duplicado');
        navigate(`/repertorio/${dup.id}`);
      }
    }
  };

  // PDF
  const repAtual: Repertorio = {
    id: repertorioExistente?.id || 'novo',
    nome: nome || 'Repertório',
    data,
    horario: horario || undefined,
    observacoes: observacoes || undefined,
    hinos: hinosSelecionados,
    criadoEm: repertorioExistente?.criadoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  const handleBaixarPDF = () => {
    if (hinosSelecionados.length === 0) {
      erro('Adicione hinos antes de gerar o PDF');
      return;
    }
    try {
      setGerando(true);
      const blob = gerarPDFRepertorio(repAtual, configuracoes, incluirLetras);
      const nomeArq = `Repertorio_${(nome || 'culto').replace(/[^\w-]/g, '_')}_${data}.pdf`;
      baixarPDF(blob, nomeArq);
      sucesso('PDF baixado!');
      setModalPDF(false);
    } catch (e: any) {
      erro('Erro ao gerar PDF: ' + e.message);
    } finally {
      setGerando(false);
    }
  };

  const handleWhatsApp = async () => {
    if (hinosSelecionados.length === 0) {
      erro('Adicione hinos antes de compartilhar');
      return;
    }
    try {
      setGerando(true);
      const blob = gerarPDFRepertorio(repAtual, configuracoes, incluirLetras);
      const nomeArq = `Repertorio_${(nome || 'culto').replace(/[^\w-]/g, '_')}_${data}.pdf`;
      const msg = mensagemRepertorio(repAtual, configuracoes.nomeIgreja);

      const ok = await compartilharPDFWebShare(blob, nomeArq, msg, repAtual.nome);
      if (!ok) {
        baixarPDF(blob, nomeArq);
        setTimeout(() => abrirWhatsAppComMensagem(msg), 500);
        info('PDF baixado. Anexe-o no WhatsApp que abrirá em seguida.');
      } else {
        sucesso('Compartilhado!');
      }
      setModalPDF(false);
    } catch (e: any) {
      erro('Erro: ' + e.message);
    } finally {
      setGerando(false);
    }
  };

  return (
    <div>
      <PageHeader
        titulo={ehEdicao ? 'Editar Repertório' : 'Montar Repertório'}
        descricao={
          ehEdicao
            ? 'Faça alterações no repertório'
            : 'Crie um novo repertório para o culto'
        }
        icone={<ListMusic className="w-6 h-6" />}
        acoes={
          ehEdicao ? (
            <>
              <Button
                variant="outline"
                onClick={handleDuplicar}
                icone={<CopyIcon className="w-4 h-4" />}
              >
                Duplicar
              </Button>
              <Button
                variant="danger"
                onClick={() => setExcluindo(true)}
                icone={<Trash2 className="w-4 h-4" />}
              >
                Excluir
              </Button>
            </>
          ) : null
        }
      />

      <form onSubmit={handleSalvar} className="space-y-5">
        {/* Dados gerais */}
        <Card>
          <h2 className="font-bold text-gray-900 mb-4">Dados do Repertório</h2>
          <div className="space-y-4">
            <Input
              label="Nome do Repertório"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Culto de Domingo"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
              <Input
                label="Horário (opcional)"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
            <Textarea
              label="Observações Gerais"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Observações sobre o culto..."
            />
          </div>
        </Card>

        {/* Hinos */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Sequência de Hinos</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {hinosSelecionados.length} hino(s) no repertório
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setModalAdicionar(true)}
              icone={<Plus className="w-4 h-4" />}
            >
              Adicionar Hino
            </Button>
          </div>

          {hinosSelecionados.length === 0 ? (
            <EmptyState
              icone={<Music className="w-8 h-8" />}
              titulo="Nenhum hino adicionado"
              descricao="Clique em Adicionar Hino para começar"
              acao={
                <Button
                  type="button"
                  onClick={() => setModalAdicionar(true)}
                  icone={<Plus className="w-4 h-4" />}
                >
                  Adicionar Primeiro Hino
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {hinosSelecionados.map((h, idx) => (
                <HinoNoRepertorio
                  key={h.id}
                  item={h}
                  primeiro={idx === 0}
                  ultimo={idx === hinosSelecionados.length - 1}
                  onMoverCima={() => moverHino(h.id, 'cima')}
                  onMoverBaixo={() => moverHino(h.id, 'baixo')}
                  onRemover={() => removerHino(h.id)}
                  onAtualizar={(campos) => atualizarHinoRep(h.id, campos)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            size="lg"
            icone={<Save className="w-5 h-5" />}
          >
            {ehEdicao ? 'Salvar Alterações' : 'Salvar Repertório'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setModalPDF(true)}
            icone={<Download className="w-5 h-5" />}
            disabled={hinosSelecionados.length === 0}
          >
            Gerar PDF
          </Button>
          <Button
            type="button"
            variant="success"
            size="lg"
            onClick={() => {
              setIncluirLetras(false);
              setModalPDF(true);
            }}
            icone={<MessageCircle className="w-5 h-5" />}
            disabled={hinosSelecionados.length === 0}
          >
            Compartilhar
          </Button>
        </div>
      </form>

      {/* Modal Selecionar Hinos */}
      <ModalSelecionarHinos
        aberto={modalAdicionar}
        onFechar={() => setModalAdicionar(false)}
        hinos={hinos}
        jaAdicionados={hinosSelecionados.map((h) => h.hinoId)}
        onAdicionar={adicionarHino}
      />

      {/* Modal PDF */}
      <Modal
        aberto={modalPDF}
        onFechar={() => setModalPDF(false)}
        titulo="Gerar PDF do Repertório"
        largura="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Escolha como deseja gerar o PDF:
          </p>
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={incluirLetras}
              onChange={(e) => setIncluirLetras(e.target.checked)}
              className="w-4 h-4 text-primary-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Incluir letra completa dos hinos
              </p>
              <p className="text-xs text-gray-500">
                O PDF terá uma página para cada letra
              </p>
            </div>
          </label>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleBaixarPDF}
              disabled={gerando}
              icone={<Download className="w-4 h-4" />}
            >
              Baixar PDF
            </Button>
            <Button
              variant="success"
              onClick={handleWhatsApp}
              disabled={gerando}
              icone={<MessageCircle className="w-4 h-4" />}
            >
              Baixar e Compartilhar no WhatsApp
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        aberto={excluindo}
        titulo="Excluir Repertório"
        mensagem={`Deseja excluir "${repertorioExistente?.nome}"?\n\nEsta ação não pode ser desfeita.`}
        textoConfirmar="Sim, Excluir"
        onConfirmar={handleExcluir}
        onCancelar={() => setExcluindo(false)}
      />
    </div>
  );
}

// ============================================
// Linha de hino no repertório (com edição inline)
// ============================================
interface HinoNoRepertorioProps {
  item: HinoRepertorio;
  primeiro: boolean;
  ultimo: boolean;
  onMoverCima: () => void;
  onMoverBaixo: () => void;
  onRemover: () => void;
  onAtualizar: (campos: Partial<HinoRepertorio>) => void;
}

function HinoNoRepertorio({
  item,
  primeiro,
  ultimo,
  onMoverCima,
  onMoverBaixo,
  onRemover,
  onAtualizar,
}: HinoNoRepertorioProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-3 bg-gray-50">
        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
          {item.ordem}
        </div>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setExpandido(!expandido)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {item.tipo === 'harpa' && item.numeroHarpa && (
              <Badge variant="info">H{item.numeroHarpa}</Badge>
            )}
            <span className="font-medium text-gray-900 truncate">
              {item.nome}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 flex-wrap">
            {item.tom && <span className="font-medium">🎼 {item.tom}</span>}
            {item.cantor && <span>🎤 {item.cantor}</span>}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onMoverCima}
            disabled={primeiro}
            className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Mover para cima"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoverBaixo}
            disabled={ultimo}
            className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Mover para baixo"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemover}
            className="p-1.5 hover:bg-red-100 text-red-600 rounded"
            title="Remover"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expandido && (
        <div className="p-3 border-t border-gray-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tom (para este repertório)"
            value={item.tom}
            onChange={(e) => onAtualizar({ tom: e.target.value })}
            opcoes={TONS_MUSICAIS.map((t) => ({ valor: t, rotulo: t }))}
            placeholder="—"
          />
          <Input
            label="Cantor (para este repertório)"
            value={item.cantor}
            onChange={(e) => onAtualizar({ cantor: e.target.value })}
            placeholder="Quem vai cantar"
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Observações"
              value={item.observacoes || ''}
              onChange={(e) => onAtualizar({ observacoes: e.target.value })}
              rows={2}
              placeholder="Observações sobre este hino..."
            />
          </div>
          <p className="sm:col-span-2 text-xs text-gray-500 italic">
            ℹ️ Alterações aqui valem apenas para este repertório, sem afetar o cadastro original.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Modal para selecionar hinos
// ============================================
interface ModalSelecionarHinosProps {
  aberto: boolean;
  onFechar: () => void;
  hinos: Hino[];
  jaAdicionados: string[];
  onAdicionar: (hino: Hino) => void;
}

function ModalSelecionarHinos({
  aberto,
  onFechar,
  hinos,
  jaAdicionados,
  onAdicionar,
}: ModalSelecionarHinosProps) {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'comum' | 'harpa'>(
    'todos'
  );

  const filtrados = useMemo(() => {
    let lista = hinos;
    if (filtroTipo !== 'todos') {
      lista = lista.filter((h) => h.tipo === filtroTipo);
    }
    if (busca.trim()) {
      const norm = normalizarBusca(busca);
      lista = lista.filter((h) => {
        if (normalizarBusca(h.nome).includes(norm)) return true;
        if (h.numeroHarpa?.toString().includes(busca.trim())) return true;
        return false;
      });
    }
    return [...lista].sort((a, b) => {
      if (a.tipo === 'harpa' && b.tipo === 'harpa') {
        return (a.numeroHarpa || 0) - (b.numeroHarpa || 0);
      }
      if (a.tipo !== b.tipo) return a.tipo === 'comum' ? -1 : 1;
      return a.nome.localeCompare(b.nome);
    });
  }, [hinos, busca, filtroTipo]);

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Selecionar Hinos"
      largura="lg"
    >
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou número..."
              autoFocus
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['todos', 'comum', 'harpa'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                  filtroTipo === t
                    ? 'bg-white shadow text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t === 'todos' ? 'Todos' : t === 'comum' ? 'Comuns' : 'Harpa'}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-1">
          {filtrados.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-500">
              Nenhum hino encontrado. Cadastre hinos primeiro.
            </p>
          ) : (
            filtrados.map((hino) => {
              const jaAdicionado = jaAdicionados.includes(hino.id);
              return (
                <div
                  key={hino.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                    jaAdicionado
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      hino.tipo === 'harpa'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {hino.tipo === 'harpa' ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <Music className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {hino.tipo === 'harpa' && hino.numeroHarpa && (
                      <p className="text-xs font-bold text-purple-600">
                        Nº {hino.numeroHarpa}
                      </p>
                    )}
                    <p className="font-medium text-gray-900 truncate">
                      {hino.nome}
                    </p>
                    <div className="flex gap-2 text-xs text-gray-600 mt-0.5">
                      {hino.tom && <span>🎼 {hino.tom}</span>}
                      {hino.cantor && <span>🎤 {hino.cantor}</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={jaAdicionado ? 'secondary' : 'primary'}
                    onClick={() => !jaAdicionado && onAdicionar(hino)}
                    disabled={jaAdicionado}
                    icone={<Plus className="w-4 h-4" />}
                  >
                    {jaAdicionado ? 'Adicionado' : 'Adicionar'}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
