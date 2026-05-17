import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Music,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  PageHeader,
  EmptyState,
} from '../components/ui';
import { ConfirmModal } from '../components/Modal';
import { VisualizarHino } from '../components/VisualizarHino';
import { FormHino } from '../components/FormHino';
import { Modal } from '../components/Modal';
import { TONS_MUSICAIS } from '../types';
import type { Hino, TipoHino } from '../types';
import { normalizarBusca } from '../utils/helpers';

interface HinosPageProps {
  tipoFiltro?: TipoHino;
}

export function HinosPage({ tipoFiltro }: HinosPageProps = {}) {
  const { hinos, excluirHino } = useApp();
  const { sucesso } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [busca, setBusca] = useState('');
  const [filtroTom, setFiltroTom] = useState('');
  const [filtroCantor, setFiltroCantor] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [hinoVisualizando, setHinoVisualizando] = useState<Hino | null>(null);
  const [hinoEditando, setHinoEditando] = useState<Hino | null>(null);
  const [hinoExcluindo, setHinoExcluindo] = useState<Hino | null>(null);
  const [modalNovo, setModalNovo] = useState(false);

  // Abre modal automaticamente quando rota /hinos/novo
  useEffect(() => {
    if (location.pathname === '/hinos/novo') {
      setModalNovo(true);
    }
  }, [location.pathname]);

  function fecharModalNovo() {
    setModalNovo(false);
    if (location.pathname === '/hinos/novo') {
      navigate('/hinos', { replace: true });
    }
  }

  const hinosFiltrados = useMemo(() => {
    let lista = hinos;

    if (tipoFiltro) {
      lista = lista.filter((h) => h.tipo === tipoFiltro);
    }

    if (busca.trim()) {
      const buscaNorm = normalizarBusca(busca);
      lista = lista.filter((h) => {
        if (normalizarBusca(h.nome).includes(buscaNorm)) return true;
        if (h.numeroHarpa?.toString().includes(buscaNorm)) return true;
        return false;
      });
    }

    if (filtroTom) {
      lista = lista.filter((h) => h.tom === filtroTom);
    }

    if (filtroCantor.trim()) {
      const cantorNorm = normalizarBusca(filtroCantor);
      lista = lista.filter((h) =>
        normalizarBusca(h.cantor).includes(cantorNorm)
      );
    }

    return [...lista].sort((a, b) => {
      // Hinos da Harpa primeiro por número, depois alfabético
      if (a.tipo === 'harpa' && b.tipo === 'harpa') {
        return (a.numeroHarpa || 0) - (b.numeroHarpa || 0);
      }
      return a.nome.localeCompare(b.nome);
    });
  }, [hinos, tipoFiltro, busca, filtroTom, filtroCantor]);

  // Cantores únicos para filtro
  const cantoresUnicos = useMemo(() => {
    const set = new Set<string>();
    hinos.forEach((h) => h.cantor && set.add(h.cantor));
    return Array.from(set).sort();
  }, [hinos]);

  const handleExcluir = () => {
    if (hinoExcluindo) {
      excluirHino(hinoExcluindo.id);
      sucesso(`"${hinoExcluindo.nome}" foi excluído`);
      setHinoExcluindo(null);
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroTom('');
    setFiltroCantor('');
  };

  const temFiltros = busca || filtroTom || filtroCantor;

  const titulo = tipoFiltro === 'harpa' ? 'Hinos da Harpa' : 'Hinos';
  const descricao =
    tipoFiltro === 'harpa'
      ? 'Hinos da Harpa Cristã cadastrados'
      : 'Todos os hinos cadastrados';

  return (
    <div>
      <PageHeader
        titulo={titulo}
        descricao={descricao}
        icone={<Music className="w-6 h-6" />}
        acoes={
          <Button onClick={() => setModalNovo(true)} icone={<Plus className="w-4 h-4" />}>
            Cadastrar Hino
          </Button>
        }
      />

      {/* Barra de busca e filtros */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar pelo nome ou número da Harpa..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Button
            variant={mostrarFiltros ? 'primary' : 'outline'}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            icone={<Filter className="w-4 h-4" />}
          >
            Filtros
            {(filtroTom || filtroCantor) && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded text-xs">
                {[filtroTom, filtroCantor].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {mostrarFiltros && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
            <Select
              label="Tom"
              value={filtroTom}
              onChange={(e) => setFiltroTom(e.target.value)}
              placeholder="Todos os tons"
              opcoes={TONS_MUSICAIS.map((t) => ({ valor: t, rotulo: t }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cantor
              </label>
              <input
                type="text"
                list="cantores-list"
                value={filtroCantor}
                onChange={(e) => setFiltroCantor(e.target.value)}
                placeholder="Buscar por cantor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <datalist id="cantores-list">
                {cantoresUnicos.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            {temFiltros && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={limparFiltros}
                  icone={<X className="w-4 h-4" />}
                  fullWidth
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Lista */}
      {hinosFiltrados.length === 0 ? (
        <Card>
          <EmptyState
            icone={<Music className="w-8 h-8" />}
            titulo={
              hinos.length === 0
                ? 'Nenhum hino cadastrado ainda'
                : 'Nenhum hino encontrado'
            }
            descricao={
              hinos.length === 0
                ? 'Comece cadastrando seu primeiro hino'
                : 'Tente ajustar os filtros ou termos de busca'
            }
            acao={
              hinos.length === 0 && (
                <Button
                  onClick={() => setModalNovo(true)}
                  icone={<Plus className="w-4 h-4" />}
                >
                  Cadastrar Primeiro Hino
                </Button>
              )
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
                {hino.tipo === 'harpa' && hino.numeroHarpa && (
                  <p className="text-xs font-bold text-purple-600">
                    HARPA Nº {hino.numeroHarpa}
                  </p>
                )}
                <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">
                  {hino.nome}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {hino.tom && (
                    <Badge variant="primary">{hino.tom}</Badge>
                  )}
                  <Badge variant="default">{hino.categoria}</Badge>
                </div>
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

      {/* Modal de visualização */}
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

      {/* Modal de edição */}
      <Modal
        aberto={!!hinoEditando}
        onFechar={() => setHinoEditando(null)}
        titulo="Editar Hino"
        largura="lg"
      >
        {hinoEditando && (
          <FormHino
            hino={hinoEditando}
            onSalvo={() => setHinoEditando(null)}
            onCancelar={() => setHinoEditando(null)}
          />
        )}
      </Modal>

      {/* Modal de novo hino */}
      <Modal
        aberto={modalNovo}
        onFechar={fecharModalNovo}
        titulo={
          tipoFiltro === 'harpa'
            ? 'Cadastrar Hino da Harpa'
            : 'Cadastrar Novo Hino'
        }
        largura="lg"
      >
        <FormHino
          tipoFixo={tipoFiltro}
          onSalvo={fecharModalNovo}
          onCancelar={fecharModalNovo}
        />
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmModal
        aberto={!!hinoExcluindo}
        titulo="Excluir Hino"
        mensagem={`Deseja realmente excluir "${hinoExcluindo?.nome}"?\n\nEsta ação não pode ser desfeita.`}
        textoConfirmar="Sim, Excluir"
        onConfirmar={handleExcluir}
        onCancelar={() => setHinoExcluindo(null)}
      />
    </div>
  );
}
