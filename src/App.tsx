import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { HinosPage } from './pages/HinosPage';
import { HarpaPage } from './pages/HarpaPage';
import { MontarRepertorioPage } from './pages/MontarRepertorioPage';
import { RepertoriosSalvosPage } from './pages/RepertoriosSalvosPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/hinos" element={<HinosPage />} />
              <Route path="/hinos/novo" element={<HinosPage />} />
              <Route path="/harpa" element={<HarpaPage />} />
              <Route path="/repertorio/novo" element={<MontarRepertorioPage />} />
              <Route path="/repertorio/:id" element={<MontarRepertorioPage />} />
              <Route path="/repertorios" element={<RepertoriosSalvosPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
