import { useState } from 'react';
import { Download, MessageCircle, Edit, FileText, Music } from 'lucide-react';
import type { Hino } from '../types';
import { Button, Badge } from './ui';
import { Modal } from './Modal';
import { gerarPDFHino, baixarPDF } from '../services/pdf';
import {
  compartilharPDFWebShare,
  abrirWhatsAppComMensagem,
  mensagemHino,
} from '../services/whatsapp';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface VisualizarHinoProps {
  hino: Hino;
  aberto: boolean;
  onFechar: () => void;
  onEditar?: () => void;
}

export function VisualizarHino({
  hino,
  aberto,
  onFechar,
  onEditar,
}: VisualizarHinoProps) {
  const { configuracoes } = useApp();
  const { sucesso, erro, info } = useToast();
  const [gerando, setGerando] = useState(false);

  const handleBaixarPDF = () => {
    try {
      setGerando(true);
      const blob = gerarPDFHino(hino, configuracoes);
      const nome = `${hino.nome.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}.pdf`;
      baixarPDF(blob, nome);
      sucesso('PDF baixado!');
    } catch (e: any) {
      erro('Erro ao gerar PDF: ' + e.message);
    } finally {
      setGerando(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      setGerando(true);
      const blob = gerarPDFHino(hino, configuracoes);
      const nome = `${hino.nome.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}.pdf`;
      const msg = mensagemHino(hino, configuracoes.nomeIgreja);

      // Tenta Web Share API primeiro
      const compartilhado = await compartilharPDFWebShare(
        blob,
        nome,
        msg,
        hino.nome
      );

      if (!compartilhado) {
        // Fallback: baixa o PDF e abre WhatsApp Web
        baixarPDF(blob, nome);
        setTimeout(() => {
          abrirWhatsAppComMensagem(msg);
        }, 500);
        info('PDF baixado. Anexe-o no WhatsApp que abrirá em seguida.');
      } else {
        sucesso('Compartilhado!');
      }
    } catch (e: any) {
      erro('Erro: ' + e.message);
    } finally {
      setGerando(false);
    }
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} largura="lg">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex gap-3 min-w-0 flex-1">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                hino.tipo === 'harpa'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {hino.tipo === 'harpa' ? (
                <FileText className="w-6 h-6" />
              ) : (
                <Music className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {hino.tipo === 'harpa' && hino.numeroHarpa && (
                <p className="text-xs font-medium text-purple-600 mb-1">
                  HARPA CRISTÃ Nº {hino.numeroHarpa}
                </p>
              )}
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 break-words">
                {hino.nome}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {hino.tom && (
                  <Badge variant="primary">Tom: {hino.tom}</Badge>
                )}
                {hino.categoria && (
                  <Badge variant="default">{hino.categoria}</Badge>
                )}
                {hino.cantor && (
                  <Badge variant="info">🎤 {hino.cantor}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Letra */}
        <div className="py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Letra</h3>
          {hino.letra ? (
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                {hino.letra}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Letra não cadastrada.
            </p>
          )}
        </div>

        {/* Observações */}
        {hino.observacoes && (
          <div className="py-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Observações
            </h3>
            <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3 whitespace-pre-line">
              {hino.observacoes}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 mt-4">
          {onEditar && (
            <Button
              variant="outline"
              onClick={onEditar}
              icone={<Edit className="w-4 h-4" />}
            >
              Editar
            </Button>
          )}
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
            Compartilhar WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
