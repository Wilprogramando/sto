import { ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Music,
  BookOpen,
  ListMusic,
  Library,
  Settings,
  Menu,
  X,
  Church,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
}

const menuItens = [
  { caminho: '/', nome: 'Início', icone: Home },
  { caminho: '/hinos', nome: 'Hinos', icone: Music },
  { caminho: '/harpa', nome: 'Hinos da Harpa', icone: BookOpen },
  { caminho: '/repertorio/novo', nome: 'Montar Repertório', icone: ListMusic },
  { caminho: '/repertorios', nome: 'Repertórios Salvos', icone: Library },
  { caminho: '/configuracoes', nome: 'Configurações', icone: Settings },
];

export function Layout({ children }: LayoutProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const { configuracoes } = useApp();
  const location = useLocation();

  // Fecha menu mobile ao navegar
  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white shadow-xl fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-6 border-b border-primary-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Church className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Repertório</h1>
              <p className="text-xs text-primary-200">da Igreja</p>
            </div>
          </div>
          {configuracoes.nomeIgreja && (
            <p className="mt-3 text-xs text-primary-200 truncate">
              {configuracoes.nomeIgreja}
            </p>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItens.map((item) => {
            const Icone = item.icone;
            return (
              <NavLink
                key={item.caminho}
                to={item.caminho}
                end={item.caminho === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm font-medium ${
                    isActive
                      ? 'bg-white text-primary-800 shadow'
                      : 'text-primary-100 hover:bg-white/10'
                  }`
                }
              >
                <Icone className="w-5 h-5" />
                {item.nome}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-6 py-4 text-xs text-primary-300 border-t border-primary-700/50">
          v1.0.0 · Dados salvos localmente
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-primary-800 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Church className="w-6 h-6" />
            <span className="font-bold">Repertório</span>
          </div>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Menu Mobile Overlay */}
      {menuAberto && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={fecharMenu}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-primary-800 to-primary-900 text-white shadow-2xl flex flex-col animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-primary-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Church className="w-6 h-6" />
                <div>
                  <h1 className="font-bold">Repertório</h1>
                  <p className="text-xs text-primary-200">da Igreja</p>
                </div>
              </div>
              <button onClick={fecharMenu} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItens.map((item) => {
                const Icone = item.icone;
                return (
                  <NavLink
                    key={item.caminho}
                    to={item.caminho}
                    end={item.caminho === '/'}
                    onClick={fecharMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                        isActive
                          ? 'bg-white text-primary-800'
                          : 'text-primary-100 hover:bg-white/10'
                      }`
                    }
                  >
                    <Icone className="w-5 h-5" />
                    {item.nome}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <div key={location.pathname} className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
