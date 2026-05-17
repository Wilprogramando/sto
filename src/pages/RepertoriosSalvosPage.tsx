import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListMusic,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy as CopyIcon,
  Download,
  MessageCircle,
  Calendar,
  Clock,
  Music,
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
import { Modal, ConfirmModal } from '../components/Modal';
import type { Repertorio } from '../types';
import {
  normalizarBusca,
  formatarData,
  formatarDataHora,
  compararDatas,
  ehHojeOuFutura,
} from '../utils/helpers';
import { gerarPDFRepertorio, baixarPDF } from '../services/pdf';
import {
  compartilharPDFWebShare,
  abrirWhatsAppComMensagem,
  mensagemRepertorio,
} from '../services/whatsapp';

export function RepertoriosSalvosPage() {
  const navigate = useNavigate();
  const { repertorios, configuracoes, excluirRepertorio, duplicarRepertorio } =
    useApp();
  const toast = useToast();

  const [busca, setBusca] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<
    'todos' | 'futuros' | 'passados'
  >('todos');

  const [confirmExcluir, setConfirmExcluir] = useState<Repertorio | null>(null);
  const [modalPDF, setModalPDF] = useState<Repertorio | null>(null);
  const [incluirLetras, setIncluirLetras] = useState(false);

  // Lista filtrada e ordenada
  const repertoriosFiltrados = useMemo(() => {
    let lista = [...repertorios];

    // Filtro de período
    if (filtroPeriodo === 'futuros') {
      lista = lista.filter((r) => ehHojeOuFutura(r.data));
    } else if (filtroPeriodo === 'passados') {
      lista = lista.filter((r) => !ehHojeOuFutura(r.data));
    }

    // Filtro de busca
    if (busca.trim()) {
      const b = normalizarBusca(busca);
      lista = lista.filter((r) => {
        return (
          normalizarBusca(r.nome).includes(b) ||
          normalizarBusca(r.observacoes || '').includes(b) ||
          r.hinos.some((h) => normalizarBusca(h.nome).includes(b))
        );
      });
    }

    // Ordenação: futuros mais próximos primeiro, depois passados decrescentes
    lista.sort((a, b) => {
      const aFut = ehHojeOuFutura(a.data);
      const bFut = ehHojeOuFutura(b.data);
      if (aFut && !bFut) return -1;
      if (!aFut && bFut) return 1;
      // Ambos futuros: mais próximos primeiro (asc)
      // Ambos passados: mais recentes primeiro (desc)
      return aFut ? compararDatas(a.data, b.data) : compararDatas(b.data, a.data);
    });

    return lista;
  }, [repertorios, busca, filtroPeriodo]);

  // === Ações ===

  function confirmarExcluir() {
    if (!confirmExcluir) return;
    excluirRepertorio(confirmExcluir.id);
    toast.sucesso('Repertório excluído.');
    setConfirmExcluir(null);
  }

  function duplicar(rep: Repertorio) {
    const copia = duplicarRepertorio(rep.id);
    if (copia) {
      toast.sucesso('Repertório duplicado.');
      navigate(`/repertorio/${copia.id}`);
    }
  }

  function abrirModalPDF(rep: Repertorio) {
    setIncluirLetras(false);
    setModalPDF(rep);
  }

  async function baixarRepertorioPDF() {
    if (!modalPDF) return;
    try {
      const blob = gerarPDFRepertorio(modalPDF, configuracoes, incluirLetras);
      const nomeArquivo = `repertorio-${normalizarBusca(modalPDF.nome).replace(
        /\s+/g,
        '-'
      )}-${modalPDF.data}.pdf`;
      baixarPDF(blob, nomeArquivo);
      toast.sucesso('PDF gerado com sucesso.');
      setModalPDF(null);
    } catch (e) {
      console.error(e);
      toast.erro('Erro ao gerar PDF.');
    }
  }

  async function compartilharWhatsApp(rep: Repertorio) {
    try {
      const blob = gerarPDFRepertorio(rep, configuracoes, false);
      const nomeArquivo = `repertorio-${normalizarBusca(rep.nome).replace(
        /\s+/g,
        '-'
      )}-${rep.data}.pdf`;

      const msg = mensagemRepertorio(rep, configuracoes.nomeIgreja);
      const compartilhado = await compartilharPDFWebShare(
        blob,
        nomeArquivo,
        msg,
        rep.nome
      );

      if (!compartilhado) {
        baixarPDF(blob, nomeArquivo);
        setTimeout(() => abrirWhatsAppComMensagem(msg), 500);
        toast.info('PDF baixado. Anexe-o manualmente no WhatsApp.');
      } else {
        toast.sucesso('Compartilhado.');
      }
    } catch (e) {
      console.error(e);
      toast.erro('Erro ao compartilhar.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Repertórios Salvos"
        descricao="Visualize, edite e compartilhe seus repertórios."
        icone={<ListMusic className="w-7 h-7" />}
        acoes={
          <Button
            onClick={() => navigate('/repertorio/novo')}
            icone={<Plus className="w-4 h-4" />}
          >
            Novo Repertório
          </Button>
        }
      />

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Buscar por nome, observações ou hinos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filtroPeriodo === 'todos' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroPeriodo('todos')}
            >
              Todos
            </Button>
            <Button
              variant={filtroPeriodo === 'futuros' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroPeriodo('futuros')}
            >
              Futuros
            </Button>
            <Button
              variant={filtroPeriodo === 'passados' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFiltroPeriodo('passados')}
            >
              Passados
            </Button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          {repertoriosFiltrados.length}{' '}
          {repertoriosFiltrados.length === 1
            ? 'repertório encontrado'
            : 'repertórios encontrados'}
        </div>
      </Card>

      {/* Lista */}
      {repertoriosFiltrados.length === 0 ? (
        <EmptyState
          icone={<ListMusic className="w-10 h-10" />}
          titulo={
            repertorios.length === 0
              ? 'Nenhum repertório criado'
              : 'Nenhum repertório encontrado'
          }
          descricao={
            repertorios.length === 0
              ? 'Comece criando seu primeiro repertório.'
              : 'Tente outros termos de busca ou filtros.'
          }
          acao={
            repertorios.length === 0 ? (
              <Button
                onClick={() => navigate('/repertorio/novo')}
                icone={<Plus className="w-4 h-4" />}
              >
                Criar Repertório
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {repertoriosFiltrados.map((rep) => {
            const futuro = ehHojeOuFutura(rep.data);
            return (
              <Card key={rep.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {rep.nome}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatarData(rep.data)}
                      </span>
                      {rep.horario && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {rep.horario}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Music className="w-4 h-4" />
                        {rep.hinos.length}{' '}
                        {rep.hinos.length === 1 ? 'hino' : 'hinos'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={futuro ? 'success' : 'default'}>
                    {futuro ? 'Futuro' : 'Passado'}
                  </Badge>
                </div>

                {rep.observacoes && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {rep.observacoes}
                  </p>
                )}

                {rep.hinos.length > 0 && (
                  <div className="mb-4">
                    <ol className="text-sm text-gray-700 space-y-1">
                      {rep.hinos.slice(0, 3).map((h, i) => (
                        <li key={h.id} className="truncate">
                          <span className="text-gray-400">{i + 1}.</span>{' '}
                          {h.nome}
                          {h.tom && (
                            <span className="text-gray-400"> ({h.tom})</span>
                          )}
                        </li>
                      ))}
                      {rep.hinos.length > 3 && (
                        <li className="text-gray-400 italic text-xs">
                          + {rep.hinos.length - 3} hinos
                        </li>
                      )}
                    </ol>
                  </div>
                )}

                <div className="text-xs text-gray-400 mb-3">
                  Criado em {formatarDataHora(rep.criadoEm)}
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/repertorio/${rep.id}`)}
                    icone={<Edit className="w-4 h-4" />}
                  >
                    Abrir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirModalPDF(rep)}
                    icone={<Download className="w-4 h-4" />}
                  >
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => compartilharWhatsApp(rep)}
                    icone={<MessageCircle className="w-4 h-4" />}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicar(rep)}
                    icone={<CopyIcon className="w-4 h-4" />}
                  >
                    Duplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmExcluir(rep)}
                    icone={<Trash2 className="w-4 h-4" />}
                  >
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        aberto={!!confirmExcluir}
        titulo="Excluir repertório?"
        mensagem={
          confirmExcluir
            ? `Tem certeza que deseja excluir o repertório "${confirmExcluir.nome}"? Esta ação não pode ser desfeita.`
            : ''
        }
        textoConfirmar="Excluir"
        perigo
        onConfirmar={confirmarExcluir}
        onCancelar={() => setConfirmExcluir(null)}
      />

      {/* Modal de PDF */}
      <Modal
        aberto={!!modalPDF}
        titulo="Gerar PDF"
        onFechar={() => setModalPDF(null)}
        largura="sm"
      >
        {modalPDF && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Repertório: <strong>{modalPDF.nome}</strong>
            </p>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirLetras}
                onChange={(e) => setIncluirLetras(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Incluir letras dos hinos
                </span>
                <p className="text-xs text-gray-500">
                  Marque para gerar um PDF completo com letras (mais páginas).
                </p>
              </div>
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setModalPDF(null)}>
                Cancelar
              </Button>
              <Button
                onClick={baixarRepertorioPDF}
                icone={<Download className="w-4 h-4" />}
              >
                Baixar PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
