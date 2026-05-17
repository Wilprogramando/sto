import { useState, FormEvent, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Textarea } from './ui';
import { TONS_MUSICAIS, CATEGORIAS_HINO, TipoHino } from '../types';
import type { Hino } from '../types';
import { Save, X } from 'lucide-react';

interface FormHinoProps {
  hino?: Hino;
  tipoFixo?: TipoHino; // se quiser forçar o tipo (ex: na tela da Harpa)
  onSalvo?: (hino: Hino) => void;
  onCancelar?: () => void;
  numeroHarpaInicial?: number;
  nomeInicial?: string;
}

export function FormHino({
  hino,
  tipoFixo,
  onSalvo,
  onCancelar,
  numeroHarpaInicial,
  nomeInicial,
}: FormHinoProps) {
  const { salvarHino, atualizarHino, buscarNomeHarpa } = useApp();
  const { sucesso, erro } = useToast();

  const ehEdicao = !!hino;
  const tipo: TipoHino = tipoFixo || hino?.tipo || 'comum';

  const [nome, setNome] = useState(hino?.nome || nomeInicial || '');
  const [tom, setTom] = useState(hino?.tom || '');
  const [cantor, setCantor] = useState(hino?.cantor || '');
  const [letra, setLetra] = useState(hino?.letra || '');
  const [categoria, setCategoria] = useState(hino?.categoria || 'Louvor');
  const [observacoes, setObservacoes] = useState(hino?.observacoes || '');
  const [numeroHarpa, setNumeroHarpa] = useState<string>(
    hino?.numeroHarpa?.toString() || numeroHarpaInicial?.toString() || ''
  );
  const [erros, setErros] = useState<Record<string, string>>({});

  // Auto-preencher nome quando número da Harpa é digitado
  useEffect(() => {
    if (tipo !== 'harpa') return;
    const num = parseInt(numeroHarpa, 10);
    if (isNaN(num)) return;
    // Só preenche automaticamente se o campo está vazio
    if (!nome.trim()) {
      const nomeEncontrado = buscarNomeHarpa(num);
      if (nomeEncontrado) {
        setNome(nomeEncontrado);
      }
    }
  }, [numeroHarpa, tipo, buscarNomeHarpa, nome]);

  const validar = (): boolean => {
    const novos: Record<string, string> = {};
    if (!nome.trim()) novos.nome = 'Nome é obrigatório';
    if (!tom) novos.tom = 'Selecione o tom';
    if (tipo === 'harpa') {
      const num = parseInt(numeroHarpa, 10);
      if (isNaN(num) || num <= 0) {
        novos.numeroHarpa = 'Informe um número válido';
      }
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validar()) {
      erro('Preencha os campos obrigatórios');
      return;
    }

    const dados = {
      nome: nome.trim(),
      tom,
      cantor: cantor.trim(),
      letra: letra.trim(),
      categoria,
      observacoes: observacoes.trim() || undefined,
      tipo,
      numeroHarpa:
        tipo === 'harpa' ? parseInt(numeroHarpa, 10) : undefined,
    };

    try {
      if (ehEdicao && hino) {
        atualizarHino(hino.id, dados);
        sucesso('Hino atualizado com sucesso!');
        onSalvo?.({ ...hino, ...dados, atualizadoEm: new Date().toISOString() });
      } else {
        const novo = salvarHino(dados);
        sucesso('Hino cadastrado com sucesso!');
        onSalvo?.(novo);
      }
    } catch (e: any) {
      erro(e.message || 'Erro ao salvar hino');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tipo === 'harpa' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <Input
            label="Número da Harpa Cristã"
            type="number"
            min={1}
            value={numeroHarpa}
            onChange={(e) => setNumeroHarpa(e.target.value)}
            required
            erro={erros.numeroHarpa}
            hint="Digite o número para preencher o nome automaticamente (se cadastrado na base)"
            placeholder="Ex: 137"
          />
        </div>
      )}

      <Input
        label="Nome do Hino"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        erro={erros.nome}
        placeholder="Ex: Quão Grande és Tu"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tom"
          value={tom}
          onChange={(e) => setTom(e.target.value)}
          required
          erro={erros.tom}
          placeholder="Selecione um tom"
          opcoes={TONS_MUSICAIS.map((t) => ({ valor: t, rotulo: t }))}
        />

        <Select
          label="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          opcoes={CATEGORIAS_HINO.map((c) => ({ valor: c, rotulo: c }))}
        />
      </div>

      <Input
        label="Quem vai cantar"
        value={cantor}
        onChange={(e) => setCantor(e.target.value)}
        placeholder="Ex: Coral, João da Silva, Congregação..."
      />

      <Textarea
        label="Letra do Hino"
        value={letra}
        onChange={(e) => setLetra(e.target.value)}
        rows={10}
        placeholder="Cole ou digite a letra completa do hino aqui..."
        hint="As quebras de linha serão preservadas no PDF"
      />

      <Textarea
        label="Observações"
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        rows={3}
        placeholder="Observações opcionais (ex: andamento, ensaio extra...)"
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" icone={<Save className="w-4 h-4" />}>
          {ehEdicao ? 'Salvar Alterações' : 'Cadastrar Hino'}
        </Button>
        {onCancelar && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelar}
            icone={<X className="w-4 h-4" />}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
