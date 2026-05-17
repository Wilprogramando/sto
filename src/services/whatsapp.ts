import { formatarData } from '../utils/helpers';
import type { Hino, Repertorio } from '../types';

/**
 * Tenta compartilhar um PDF usando a Web Share API (mobile).
 * Retorna true se conseguiu compartilhar, false caso contrário.
 */
export async function compartilharPDFWebShare(
  blob: Blob,
  nomeArquivo: string,
  mensagem: string,
  titulo: string
): Promise<boolean> {
  try {
    const arquivo = new File([blob], nomeArquivo, { type: 'application/pdf' });
    const nav = navigator as any;
    if (nav.canShare && nav.canShare({ files: [arquivo] })) {
      await nav.share({
        files: [arquivo],
        title: titulo,
        text: mensagem,
      });
      return true;
    }
    return false;
  } catch (e) {
    // Usuário cancelou ou erro
    console.log('Web Share não disponível ou cancelado:', e);
    return false;
  }
}

/**
 * Abre o WhatsApp Web/App com mensagem pré-preenchida.
 */
export function abrirWhatsAppComMensagem(mensagem: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

/**
 * Gera a mensagem padrão para compartilhar um repertório.
 */
export function mensagemRepertorio(rep: Repertorio, nomeIgreja: string): string {
  let msg = `🎵 *${nomeIgreja || 'Repertório da Igreja'}*\n\n`;
  msg += `📋 Repertório: *${rep.nome}*\n`;
  msg += `📅 Data: ${formatarData(rep.data)}\n`;
  if (rep.horario) msg += `🕐 Horário: ${rep.horario}\n`;
  msg += `\n*Hinos:*\n`;

  const hinos = [...rep.hinos].sort((a, b) => a.ordem - b.ordem);
  hinos.forEach((h) => {
    let linha = `${h.ordem}. `;
    if (h.tipo === 'harpa' && h.numeroHarpa) {
      linha += `[H${h.numeroHarpa}] `;
    }
    linha += h.nome;
    if (h.tom) linha += ` (${h.tom})`;
    if (h.cantor) linha += ` - ${h.cantor}`;
    msg += linha + '\n';
  });

  if (rep.observacoes) {
    msg += `\n_${rep.observacoes}_`;
  }

  msg += `\n\n📄 O PDF foi baixado/compartilhado.`;
  return msg;
}

/**
 * Gera a mensagem padrão para compartilhar uma letra de hino.
 */
export function mensagemHino(hino: Hino, nomeIgreja: string): string {
  let msg = `🎵 *${nomeIgreja || 'Repertório da Igreja'}*\n\n`;
  if (hino.tipo === 'harpa' && hino.numeroHarpa) {
    msg += `📖 Harpa Cristã nº *${hino.numeroHarpa}*\n`;
  }
  msg += `🎶 *${hino.nome}*\n`;
  if (hino.tom) msg += `🎼 Tom: ${hino.tom}\n`;
  if (hino.cantor) msg += `🎤 Cantor: ${hino.cantor}\n`;
  msg += `\n📄 Veja a letra completa no PDF.`;
  return msg;
}
