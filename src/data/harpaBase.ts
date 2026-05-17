import type { HarpaItem } from '../types';

/**
 * Base inicial de hinos da Harpa Cristã.
 *
 * IMPORTANTE: Esta base contém apenas alguns hinos amplamente conhecidos.
 * A Harpa Cristã possui 640 hinos, e a base completa pode ser importada
 * via tela de Configurações (formato JSON ou CSV).
 *
 * Esta base é editável: o usuário pode adicionar, editar ou substituir
 * todos os itens diretamente pelo sistema.
 */
export const harpaCristaBaseInicial: HarpaItem[] = [
  { numero: 1, nome: 'Chuvas de Graça' },
  { numero: 2, nome: 'Saudosa Lembrança' },
  { numero: 12, nome: 'A Vida é um Tesouro' },
  { numero: 21, nome: 'Eu Vejo Jesus' },
  { numero: 35, nome: 'Vencendo Vem Jesus' },
  { numero: 51, nome: 'Quão Grande és Tu' },
  { numero: 57, nome: 'Doce Comunhão' },
  { numero: 71, nome: 'Crê no Senhor' },
  { numero: 85, nome: 'Avante! Avante!' },
  { numero: 137, nome: 'Eu Navegarei' },
  { numero: 207, nome: 'Vinde a Cristo' },
  { numero: 224, nome: 'O Glorioso Cordeiro' },
  { numero: 320, nome: 'Vem a Esta Fonte' },
  { numero: 332, nome: 'Bem de Manhã' },
  { numero: 416, nome: 'Quando Lá nos Céus Eu For' },
  { numero: 446, nome: 'A Festa do Cordeiro' },
];
