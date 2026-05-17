import jsPDF from 'jspdf';
import type { Hino, Repertorio, Configuracoes } from '../types';
import { formatarData, formatarDataHora } from '../utils/helpers';

const MARGEM_X = 15;
const LARGURA_PAGINA = 210;
const ALTURA_PAGINA = 297;
const LARGURA_UTIL = LARGURA_PAGINA - 2 * MARGEM_X;

/**
 * Adiciona o cabeçalho padrão de uma página do PDF.
 */
function adicionarCabecalho(
  doc: jsPDF,
  nomeIgreja: string,
  titulo: string
): number {
  // Faixa azul superior
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, LARGURA_PAGINA, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(nomeIgreja || 'Igreja', MARGEM_X, 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, MARGEM_X, 20);

  doc.setTextColor(0, 0, 0);
  return 35; // posição Y para conteúdo
}

/**
 * Adiciona rodapé com data de geração e numeração.
 */
function adicionarRodape(
  doc: jsPDF,
  totalPaginas: number,
  textoRodape: string
): void {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    const dataGeracao = `Gerado em ${formatarDataHora(new Date().toISOString())}`;
    doc.text(dataGeracao, MARGEM_X, ALTURA_PAGINA - 8);

    const pag = `Página ${i} de ${totalPaginas}`;
    doc.text(pag, LARGURA_PAGINA - MARGEM_X - 25, ALTURA_PAGINA - 8);

    if (textoRodape) {
      doc.text(textoRodape, LARGURA_PAGINA / 2, ALTURA_PAGINA - 8, {
        align: 'center',
      });
    }
  }
}

/**
 * Quebra texto longo em múltiplas linhas dentro da largura da página.
 * Lida com salto de página automaticamente.
 */
function escreverParagrafo(
  doc: jsPDF,
  texto: string,
  y: number,
  fontSize: number = 11,
  espacoLinha: number = 5.5
): number {
  doc.setFontSize(fontSize);
  const linhas = doc.splitTextToSize(texto, LARGURA_UTIL);
  for (const linha of linhas) {
    if (y > ALTURA_PAGINA - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(linha, MARGEM_X, y);
    y += espacoLinha;
  }
  return y;
}

/**
 * Gera o PDF da letra de um hino e retorna o Blob.
 */
export function gerarPDFHino(hino: Hino, config: Configuracoes): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const tituloPagina =
    hino.tipo === 'harpa' && hino.numeroHarpa
      ? `Harpa Cristã - Nº ${hino.numeroHarpa}`
      : 'Letra do Hino';

  let y = adicionarCabecalho(doc, config.nomeIgreja, tituloPagina);

  // Nome do hino
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  const nomeLinhas = doc.splitTextToSize(hino.nome, LARGURA_UTIL);
  for (const linha of nomeLinhas) {
    doc.text(linha, MARGEM_X, y);
    y += 8;
  }

  y += 2;

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGEM_X, y, LARGURA_PAGINA - MARGEM_X, y);
  y += 6;

  // Informações
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);

  doc.text('Tom:', MARGEM_X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(hino.tom || '—', MARGEM_X + 18, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Cantor:', MARGEM_X + 60, y);
  doc.setFont('helvetica', 'normal');
  doc.text(hino.cantor || '—', MARGEM_X + 80, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Categoria:', MARGEM_X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(hino.categoria || '—', MARGEM_X + 22, y);
  y += 8;

  // Observações
  if (hino.observacoes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Observações:', MARGEM_X, y);
    y += 5;
    doc.setFont('helvetica', 'italic');
    y = escreverParagrafo(doc, hino.observacoes, y, 10, 5);
    y += 3;
  }

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGEM_X, y, LARGURA_PAGINA - MARGEM_X, y);
  y += 8;

  // Letra
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.text('Letra:', MARGEM_X, y);
  y += 7;

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Preserva quebras de linha originais da letra
  const linhasLetra = (hino.letra || '(Letra não cadastrada)').split('\n');
  for (const linha of linhasLetra) {
    if (linha.trim() === '') {
      y += 4;
      continue;
    }
    const subLinhas = doc.splitTextToSize(linha, LARGURA_UTIL);
    for (const sl of subLinhas) {
      if (y > ALTURA_PAGINA - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(sl, MARGEM_X, y);
      y += 5.5;
    }
  }

  adicionarRodape(doc, doc.getNumberOfPages(), config.rodapePdf);

  return doc.output('blob');
}

/**
 * Gera o PDF de um repertório completo.
 */
export function gerarPDFRepertorio(
  repertorio: Repertorio,
  config: Configuracoes,
  incluirLetras: boolean = false
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = adicionarCabecalho(doc, config.nomeIgreja, 'Repertório do Culto');

  // Nome do repertório
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text(repertorio.nome, MARGEM_X, y);
  y += 9;

  // Data e horário
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  let dataStr = `📅 ${formatarData(repertorio.data)}`;
  if (repertorio.horario) {
    dataStr += `   🕐 ${repertorio.horario}`;
  }
  doc.text(dataStr, MARGEM_X, y);
  y += 8;

  // Observações gerais
  if (repertorio.observacoes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    y = escreverParagrafo(doc, repertorio.observacoes, y, 10, 5);
    y += 3;
  }

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGEM_X, y, LARGURA_PAGINA - MARGEM_X, y);
  y += 8;

  // Cabeçalho da lista
  doc.setFillColor(243, 244, 246);
  doc.rect(MARGEM_X, y - 5, LARGURA_UTIL, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('#', MARGEM_X + 2, y);
  doc.text('Hino', MARGEM_X + 12, y);
  doc.text('Tom', MARGEM_X + 110, y);
  doc.text('Cantor', MARGEM_X + 130, y);
  y += 8;

  // Lista de hinos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const hinosOrdenados = [...repertorio.hinos].sort(
    (a, b) => a.ordem - b.ordem
  );

  for (const item of hinosOrdenados) {
    if (y > ALTURA_PAGINA - 25) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${item.ordem}`, MARGEM_X + 2, y);

    doc.setFont('helvetica', 'normal');
    let nomeExibicao = item.nome;
    if (item.tipo === 'harpa' && item.numeroHarpa) {
      nomeExibicao = `[H${item.numeroHarpa}] ${item.nome}`;
    }
    const nomeLinhas = doc.splitTextToSize(nomeExibicao, 95);
    doc.text(nomeLinhas[0], MARGEM_X + 12, y);

    doc.text(item.tom || '—', MARGEM_X + 110, y);

    const cantorLinhas = doc.splitTextToSize(item.cantor || '—', 60);
    doc.text(cantorLinhas[0], MARGEM_X + 130, y);

    y += 6;

    // Linhas extras se nome longo
    if (nomeLinhas.length > 1) {
      for (let i = 1; i < nomeLinhas.length; i++) {
        if (y > ALTURA_PAGINA - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(nomeLinhas[i], MARGEM_X + 12, y);
        y += 5;
      }
    }

    if (item.observacoes) {
      if (y > ALTURA_PAGINA - 20) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const obsLinhas = doc.splitTextToSize(
        `Obs: ${item.observacoes}`,
        LARGURA_UTIL - 12
      );
      for (const ol of obsLinhas) {
        if (y > ALTURA_PAGINA - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(ol, MARGEM_X + 12, y);
        y += 4.5;
      }
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    }

    y += 2;
  }

  // Letras completas (opcional)
  if (incluirLetras) {
    for (const item of hinosOrdenados) {
      doc.addPage();
      y = adicionarCabecalho(
        doc,
        config.nomeIgreja,
        `Letra ${item.ordem} de ${hinosOrdenados.length}`
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      let titulo = item.nome;
      if (item.tipo === 'harpa' && item.numeroHarpa) {
        titulo = `Harpa Nº ${item.numeroHarpa} - ${item.nome}`;
      }
      const tituloLinhas = doc.splitTextToSize(titulo, LARGURA_UTIL);
      for (const tl of tituloLinhas) {
        doc.text(tl, MARGEM_X, y);
        y += 7;
      }
      y += 2;

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(
        `Tom: ${item.tom || '—'}    |    Cantor: ${item.cantor || '—'}`,
        MARGEM_X,
        y
      );
      y += 8;

      doc.setDrawColor(200, 200, 200);
      doc.line(MARGEM_X, y, LARGURA_PAGINA - MARGEM_X, y);
      y += 6;

      const letra = item.letra || '(Letra não disponível)';
      const linhasLetra = letra.split('\n');
      for (const linha of linhasLetra) {
        if (linha.trim() === '') {
          y += 4;
          continue;
        }
        const subLinhas = doc.splitTextToSize(linha, LARGURA_UTIL);
        for (const sl of subLinhas) {
          if (y > ALTURA_PAGINA - 20) {
            doc.addPage();
            y = 20;
          }
          doc.text(sl, MARGEM_X, y);
          y += 5.5;
        }
      }
    }
  }

  adicionarRodape(doc, doc.getNumberOfPages(), config.rodapePdf);

  return doc.output('blob');
}

/**
 * Faz o download do Blob de PDF com nome especificado.
 */
export function baixarPDF(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo.endsWith('.pdf')
    ? nomeArquivo
    : `${nomeArquivo}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // pequeno delay antes de revogar URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
