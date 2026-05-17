import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Building2,
  User,
  FileText,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Button,
  Input,
  Textarea,
  Card,
  PageHeader,
} from '../components/ui';
import { ConfirmModal } from '../components/Modal';
import { storageBackup } from '../services/storage';
import { downloadArquivo, lerArquivoTexto } from '../utils/helpers';
import type { Configuracoes, BackupCompleto } from '../types';

export function ConfiguracoesPage() {
  const { configuracoes, atualizarConfiguracoes, recarregarTudo, hinos, repertorios, harpaBase } =
    useApp();
  const toast = useToast();

  const [form, setForm] = useState<Configuracoes>(configuracoes);
  const [salvando, setSalvando] = useState(false);

  const [confirmLimpar1, setConfirmLimpar1] = useState(false);
  const [confirmLimpar2, setConfirmLimpar2] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState('');

  const inputArquivoRef = useRef<HTMLInputElement>(null);

  // Sincroniza form com configuracoes ao carregar / mudar
  useEffect(() => {
    setForm(configuracoes);
  }, [configuracoes]);

  function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      atualizarConfiguracoes(form);
      toast.sucesso('Configurações salvas com sucesso.');
    } catch (err) {
      console.error(err);
      toast.erro('Erro ao salvar configurações.');
    } finally {
      setSalvando(false);
    }
  }

  function handleExportarBackup() {
    try {
      const backup = storageBackup.exportar();
      const conteudo = JSON.stringify(backup, null, 2);
      const dataStr = new Date().toISOString().split('T')[0];
      downloadArquivo(
        conteudo,
        `backup-repertorio-igreja-${dataStr}.json`,
        'application/json'
      );
      toast.sucesso('Backup exportado.');
    } catch (err) {
      console.error(err);
      toast.erro('Erro ao exportar backup.');
    }
  }

  async function handleImportarBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      const texto = await lerArquivoTexto(arquivo);
      const dados = JSON.parse(texto) as BackupCompleto;

      if (
        !dados ||
        typeof dados !== 'object' ||
        !Array.isArray(dados.hinos) ||
        !Array.isArray(dados.repertorios)
      ) {
        throw new Error('Arquivo de backup inválido ou corrompido.');
      }

      storageBackup.importar(dados);
      recarregarTudo();
      toast.sucesso('Backup importado com sucesso.');
    } catch (err) {
      console.error(err);
      toast.erro(
        err instanceof Error
          ? `Erro: ${err.message}`
          : 'Erro ao importar backup.'
      );
    } finally {
      // limpa input para permitir reimportação do mesmo arquivo
      if (inputArquivoRef.current) inputArquivoRef.current.value = '';
    }
  }

  function abrirSelecaoArquivo() {
    inputArquivoRef.current?.click();
  }

  function iniciarLimpeza() {
    setConfirmLimpar1(true);
  }

  function confirmarPrimeiroPasso() {
    setConfirmLimpar1(false);
    setTextoConfirmacao('');
    setConfirmLimpar2(true);
  }

  function confirmarLimpezaFinal() {
    if (textoConfirmacao.trim().toUpperCase() !== 'APAGAR') {
      toast.aviso('Digite "APAGAR" exatamente para confirmar.');
      return;
    }
    try {
      storageBackup.limparTudo();
      recarregarTudo();
      setConfirmLimpar2(false);
      setTextoConfirmacao('');
      toast.sucesso('Todos os dados foram apagados.');
    } catch (err) {
      console.error(err);
      toast.erro('Erro ao apagar dados.');
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        titulo="Configurações"
        descricao="Personalize informações da igreja e gerencie seus dados."
        icone={<Settings className="w-6 h-6" />}
      />

      {/* Dados da Igreja */}
      <Card>
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            Dados da Igreja
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Informações que aparecem no cabeçalho dos PDFs gerados.
          </p>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
          <Input
            label="Nome da Igreja"
            value={form.nomeIgreja}
            onChange={(e) =>
              setForm({ ...form, nomeIgreja: e.target.value })
            }
            placeholder="Ex.: Igreja Cristã Vida Nova"
            required
          />
          <Input
            label="Responsável / Pastor"
            value={form.responsavel}
            onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
            placeholder="Ex.: Pr. João Silva"
            hint="Aparece como subtítulo no PDF (opcional)."
          />
          <Textarea
            label="Rodapé do PDF"
            value={form.rodapePdf}
            onChange={(e) => setForm({ ...form, rodapePdf: e.target.value })}
            rows={2}
            placeholder="Ex.: Igreja Cristã Vida Nova - Ministério de Louvor"
            hint="Texto exibido no rodapé de todos os PDFs."
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              icone={<Save className="w-4 h-4" />}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Resumo dos dados */}
      <Card>
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            Resumo dos Dados
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Quantidade de informações armazenadas localmente neste dispositivo.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-2xl font-bold text-blue-700">
              {hinos.filter((h) => h.tipo === 'comum').length}
            </div>
            <div className="text-xs text-blue-900 mt-1">Hinos comuns</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
            <div className="text-2xl font-bold text-purple-700">
              {hinos.filter((h) => h.tipo === 'harpa').length}
            </div>
            <div className="text-xs text-purple-900 mt-1">Hinos da Harpa</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="text-2xl font-bold text-green-700">
              {repertorios.length}
            </div>
            <div className="text-xs text-green-900 mt-1">Repertórios</div>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
            <div className="text-2xl font-bold text-amber-700">
              {harpaBase.length}
            </div>
            <div className="text-xs text-amber-900 mt-1">Itens na Harpa Base</div>
          </div>
        </div>
      </Card>

      {/* Backup e restore */}
      <Card>
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Backup e Restauração
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Exporte todos os dados em um único arquivo JSON. Útil para mover entre
            dispositivos ou fazer cópia de segurança.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              icone={<Download className="w-4 h-4" />}
              onClick={handleExportarBackup}
            >
              Exportar Backup (JSON)
            </Button>
            <Button
              variant="outline"
              icone={<Upload className="w-4 h-4" />}
              onClick={abrirSelecaoArquivo}
            >
              Importar Backup (JSON)
            </Button>
            <input
              ref={inputArquivoRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportarBackup}
              className="hidden"
            />
          </div>
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Atenção:</strong> a importação substitui todos os dados
              atuais (hinos, repertórios, configurações e base da Harpa). Faça um
              backup antes, se necessário.
            </span>
          </div>
        </div>
      </Card>

      {/* Zona de perigo */}
      <Card className="border-red-200">
        <div className="mb-4 pb-4 border-b border-red-100">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Operação irreversível que apaga TODOS os dados do sistema.
          </p>
        </div>

        <Button
          variant="danger"
          icone={<Trash2 className="w-4 h-4" />}
          onClick={iniciarLimpeza}
        >
          Apagar todos os dados
        </Button>
      </Card>

      {/* Modal 1: aviso inicial */}
      <ConfirmModal
        aberto={confirmLimpar1}
        titulo="Apagar TODOS os dados?"
        mensagem={
          'Esta ação vai apagar permanentemente:\n\n' +
          `• ${hinos.length} hinos cadastrados\n` +
          `• ${repertorios.length} repertórios\n` +
          `• Configurações da igreja\n` +
          `• Base da Harpa Cristã\n\n` +
          'Não há como desfazer. Deseja continuar?'
        }
        textoConfirmar="Sim, quero continuar"
        textoCancelar="Cancelar"
        perigo
        onConfirmar={confirmarPrimeiroPasso}
        onCancelar={() => setConfirmLimpar1(false)}
      />

      {/* Modal 2: confirmação por digitação */}
      {confirmLimpar2 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setConfirmLimpar2(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Confirmação Final
                  </h3>
                  <p className="mt-2 text-sm text-gray-700">
                    Para confirmar, digite <strong>APAGAR</strong> no campo
                    abaixo:
                  </p>
                  <Input
                    value={textoConfirmacao}
                    onChange={(e) => setTextoConfirmacao(e.target.value)}
                    placeholder="Digite APAGAR"
                    className="mt-3"
                    autoFocus
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setConfirmLimpar2(false);
                    setTextoConfirmacao('');
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarLimpezaFinal}
                  disabled={textoConfirmacao.trim().toUpperCase() !== 'APAGAR'}
                  className="px-4 py-2 rounded-lg text-white font-medium transition bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  Apagar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
