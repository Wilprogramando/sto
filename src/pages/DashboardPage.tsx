import { Link } from 'react-router-dom';
import {
  Music,
  BookOpen,
  ListMusic,
  Library,
  Plus,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui';
import { formatarData, compararDatas, ehHojeOuFutura } from '../utils/helpers';
import { useMemo } from 'react';

export function DashboardPage() {
  const { hinos, repertorios, configuracoes } = useApp();

  const hinosComuns = useMemo(
    () => hinos.filter((h) => h.tipo === 'comum'),
    [hinos]
  );
  const hinosHarpa = useMemo(
    () => hinos.filter((h) => h.tipo === 'harpa'),
    [hinos]
  );

  // Próximo repertório: data mais próxima hoje ou futura
  const proximoRepertorio = useMemo(() => {
    const futuros = repertorios
      .filter((r) => ehHojeOuFutura(r.data))
      .sort((a, b) => compararDatas(a.data, b.data));
    return futuros[0];
  }, [repertorios]);

  // Últimos 5 repertórios criados
  const ultimosRepertorios = useMemo(() => {
    return [...repertorios]
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .slice(0, 5);
  }, [repertorios]);

  const stats = [
    {
      titulo: 'Hinos Cadastrados',
      valor: hinosComuns.length,
      cor: 'from-blue-500 to-blue-600',
      bgCor: 'bg-blue-50',
      icone: <Music className="w-6 h-6" />,
      link: '/hinos',
    },
    {
      titulo: 'Hinos da Harpa',
      valor: hinosHarpa.length,
      cor: 'from-purple-500 to-purple-600',
      bgCor: 'bg-purple-50',
      icone: <BookOpen className="w-6 h-6" />,
      link: '/harpa',
    },
    {
      titulo: 'Repertórios',
      valor: repertorios.length,
      cor: 'from-green-500 to-green-600',
      bgCor: 'bg-green-50',
      icone: <Library className="w-6 h-6" />,
      link: '/repertorios',
    },
    {
      titulo: 'Total de Hinos',
      valor: hinos.length,
      cor: 'from-amber-500 to-amber-600',
      bgCor: 'bg-amber-50',
      icone: <Sparkles className="w-6 h-6" />,
      link: '/hinos',
    },
  ];

  const acoesRapidas = [
    {
      titulo: 'Cadastrar Hino',
      descricao: 'Adicionar um novo hino',
      icone: <Plus className="w-5 h-5" />,
      link: '/hinos/novo',
      cor: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      titulo: 'Hinos da Harpa',
      descricao: 'Cadastrar hino da Harpa Cristã',
      icone: <BookOpen className="w-5 h-5" />,
      link: '/harpa',
      cor: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      titulo: 'Montar Repertório',
      descricao: 'Novo repertório de culto',
      icone: <ListMusic className="w-5 h-5" />,
      link: '/repertorio/novo',
      cor: 'bg-green-500 hover:bg-green-600',
    },
    {
      titulo: 'Repertórios Salvos',
      descricao: 'Ver todos os repertórios',
      icone: <Library className="w-5 h-5" />,
      link: '/repertorios',
      cor: 'bg-amber-500 hover:bg-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold">
          Bem-vindo ao Repertório da Igreja
        </h1>
        <p className="mt-2 text-primary-100">
          {configuracoes.nomeIgreja
            ? `${configuracoes.nomeIgreja} · `
            : ''}
          Gerencie hinos e monte repertórios para os cultos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.titulo}
            to={stat.link}
            className="group"
          >
            <Card className="hover:shadow-md transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">
                    {stat.titulo}
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                    {stat.valor}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${stat.cor} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition`}
                >
                  {stat.icone}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {acoesRapidas.map((acao) => (
            <Link
              key={acao.titulo}
              to={acao.link}
              className={`${acao.cor} text-white rounded-xl p-4 shadow-sm hover:shadow-md transition group`}
            >
              <div className="flex items-center justify-between">
                <div>{acao.icone}</div>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="mt-3 font-semibold">{acao.titulo}</h3>
              <p className="text-xs opacity-90 mt-0.5">{acao.descricao}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Próximo Repertório + Últimos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximo */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-gray-900">Próximo Repertório</h2>
          </div>
          {proximoRepertorio ? (
            <Link
              to={`/repertorio/${proximoRepertorio.id}`}
              className="block p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200 hover:border-primary-400 hover:shadow-md transition"
            >
              <h3 className="font-bold text-primary-900">
                {proximoRepertorio.nome}
              </h3>
              <p className="text-sm text-primary-700 mt-1">
                📅 {formatarData(proximoRepertorio.data)}
                {proximoRepertorio.horario && ` · 🕐 ${proximoRepertorio.horario}`}
              </p>
              <p className="text-xs text-primary-600 mt-2">
                {proximoRepertorio.hinos.length} hino(s) no repertório
              </p>
            </Link>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum repertório futuro agendado</p>
              <Link
                to="/repertorio/novo"
                className="inline-block mt-3 text-sm text-primary-600 font-medium hover:underline"
              >
                Montar novo repertório →
              </Link>
            </div>
          )}
        </Card>

        {/* Últimos */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Library className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-gray-900">Últimos Repertórios</h2>
            </div>
            {repertorios.length > 0 && (
              <Link
                to="/repertorios"
                className="text-xs text-primary-600 font-medium hover:underline"
              >
                Ver todos
              </Link>
            )}
          </div>
          {ultimosRepertorios.length > 0 ? (
            <div className="space-y-2">
              {ultimosRepertorios.map((rep) => (
                <Link
                  key={rep.id}
                  to={`/repertorio/${rep.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {rep.nome}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatarData(rep.data)}
                        {rep.horario && ` · ${rep.horario}`} ·{' '}
                        {rep.hinos.length} hino(s)
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum repertório criado ainda</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
