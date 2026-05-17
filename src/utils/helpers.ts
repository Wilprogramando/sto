/**
 * Formata uma data ISO (YYYY-MM-DD) para o formato brasileiro DD/MM/AAAA.
 */
export function formatarData(dataISO: string): string {
  if (!dataISO) return '';
  // Aceita tanto YYYY-MM-DD quanto ISO completo
  const partes = dataISO.split('T')[0].split('-');
  if (partes.length !== 3) return dataISO;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata data + hora para exibição.
 */
export function formatarDataHora(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Compara datas no formato YYYY-MM-DD.
 * Retorna negativo se a < b, positivo se a > b, zero se iguais.
 */
export function compararDatas(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Verifica se uma data (YYYY-MM-DD) é hoje ou futura.
 */
export function ehHojeOuFutura(data: string): boolean {
  const hoje = new Date().toISOString().split('T')[0];
  return data >= hoje;
}

/**
 * Remove acentos e converte para minúsculas (para busca).
 */
export function normalizarBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Faz download de um conteúdo string como arquivo.
 */
export function downloadArquivo(
  conteudo: string,
  nomeArquivo: string,
  tipo: string = 'application/json'
): void {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Lê um arquivo selecionado pelo usuário e retorna seu conteúdo em texto.
 */
export function lerArquivoTexto(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(arquivo);
  });
}

/**
 * Parse de CSV simples: número, nome
 * Formato esperado: cada linha como "numero,nome do hino"
 */
export function parseCSVHarpa(
  csv: string
): { numero: number; nome: string }[] {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim());
  const resultado: { numero: number; nome: string }[] = [];

  for (const linha of linhas) {
    // Tenta separar por vírgula ou ponto e vírgula
    const partes = linha.split(/[,;]/).map((p) => p.trim());
    if (partes.length < 2) continue;

    // Ignora cabeçalho
    const num = parseInt(partes[0], 10);
    if (isNaN(num)) continue;

    // Junta o restante das partes (caso o nome tenha vírgula)
    const nome = partes
      .slice(1)
      .join(',')
      .trim()
      .replace(/^"|"$/g, ''); // remove aspas

    if (nome) {
      resultado.push({ numero: num, nome });
    }
  }
  return resultado;
}
