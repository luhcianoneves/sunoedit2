export interface ProductionNoteCategory {
  name: string;
  notes: string[];
}

/**
 * Snippets de "nota de produção" reutilizáveis entre faixas/volumes — extraídos dos padrões
 * recorrentes do plano de lançamentos da Good Shepherd Studios. Usado para inserção rápida
 * no campo de nota de produção, sem precisar redigitar as mesmas instruções toda vez.
 */
export const PRODUCTION_NOTE_CATEGORIES: ProductionNoteCategory[] = [
  {
    name: 'Voz',
    notes: [
      'Voz rouca e grave',
      'Voz com forte influência de blues/gospel',
      'Foco na voz e no órgão, poucos instrumentos',
      'Textura mais intimista, poucos instrumentos',
    ],
  },
  {
    name: 'Introdução',
    notes: [
      'Introdução só com piano por 8 compassos antes da voz',
      'Introdução instrumental de 4-8 compassos antes da voz',
      'Introdução com fade in de 30-40s',
    ],
  },
  {
    name: 'Coro / Call and Response',
    notes: [
      'Usar vozes "coral" sutil respondendo a linha principal',
      'Call and response entre guitarra e voz principal',
      'Refrão com camada extra de vozes',
      'Refrão com resposta coral sutil',
    ],
  },
  {
    name: 'Dinâmica',
    notes: [
      'Dinâmica crescente: começa baixo, cresce no refrão',
      'Dinâmica suave do início ao fim',
      'Ponto de energia mais alta do álbum, sem perder o clima',
      'Textura mais suja/vintage, como gravação analógica antiga',
    ],
  },
  {
    name: 'Solo',
    notes: [
      'Solo de guitarra curto entre os versos',
      'Solo curto de guitarra no meio da faixa',
    ],
  },
  {
    name: 'Encerramento',
    notes: [
      'Faixa de encerramento; fade out longo no final',
      'Encerramento lento, quase a cappella',
      'Fade out longo, fechando o álbum com clima solene',
    ],
  },
  {
    name: 'Ambiente / Relaxamento',
    notes: [
      'Faixa longa 10-12 min; volume constante, sem picos',
      'Voz como textura de fundo, nunca protagonista — mixar bem baixo',
      'Elementos entram e saem lentamente, sem batida',
      'Sem clique perceptível; fluir como respiração',
      '12-15 min; repetição hipnótica de um motivo simples',
    ],
  },
  {
    name: 'Groove / Soul',
    notes: [
      'Groove de baixo marcante conduzindo a faixa',
      'Faixa mais festiva; ideal para clipes de redes sociais',
      'Ponto de respiro entre as faixas mais dançantes',
      'Fechamento com mais camadas, clima de celebração',
    ],
  },
];
