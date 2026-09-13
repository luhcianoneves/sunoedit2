export interface SeasonalTheme {
  id: string;
  name: string;
  period: string;
  suggestedTitle: string;
  suggestedConcept: string;
  suggestedHymns: string[];
}

/** Presets de tema sazonal — pontos de partida rápidos pra álbuns pontuais fora das franquias fixas. */
export const SEASONAL_THEMES: SeasonalTheme[] = [
  {
    id: 'natal',
    name: 'Natal',
    period: 'Dezembro',
    suggestedTitle: 'Natal Gospel Blues',
    suggestedConcept: 'Clima natalino sutil dentro da identidade sonora já existente — nuance sazonal, não um álbum temático inteiro.',
    suggestedHymns: ['Noite Feliz / Silent Night', 'Ó Vinde, Fiéis / O Come All Ye Faithful', 'Alegria ao Mundo / Joy to the World'],
  },
  {
    id: 'ano-novo',
    name: 'Ano Novo / Virada',
    period: 'Dezembro-Janeiro',
    suggestedTitle: 'Renovo Para o Novo Ano',
    suggestedConcept: 'Gratidão retrospectiva e esperança renovada — encerramento de ciclo.',
    suggestedHymns: ['Até Aqui o Senhor Nos Ajudou — 1 Samuel 7:12', 'Conta as Bênçãos / Count Your Blessings', 'Renova-me (tema livre)'],
  },
  {
    id: 'pascoa',
    name: 'Páscoa',
    period: 'Março-Abril',
    suggestedTitle: 'Ressurreição e Esperança',
    suggestedConcept: 'Redenção, vitória sobre a morte, renascimento espiritual.',
    suggestedHymns: ['Cristo Já Ressuscitou / Christ the Lord Is Risen Today', 'Vitória em Cristo (tema livre)', 'Salmo 118 (domínio público)'],
  },
  {
    id: 'dia-das-maes',
    name: 'Dia das Mães',
    period: 'Maio',
    suggestedTitle: 'Bênção de Mãe',
    suggestedConcept: 'Cuidado, amor incondicional, gratidão — tom mais suave/emotivo.',
    suggestedHymns: ['Provérbios 31 (base bíblica)', 'Bondade Que Me Segue — Salmo 23 (domínio público)'],
  },
  {
    id: 'dia-dos-pais',
    name: 'Dia dos Pais',
    period: 'Agosto',
    suggestedTitle: 'Coração de Pai',
    suggestedConcept: 'Proteção, provisão, força tranquila.',
    suggestedHymns: ['Salmo 103 ("como um pai se compadece", domínio público)', 'Castelo Forte / A Mighty Fortress (domínio público)'],
  },
  {
    id: 'festa-junina',
    name: 'Festa Junina',
    period: 'Junho',
    suggestedTitle: 'Arraiá Gospel',
    suggestedConcept: 'Celebração comunitária, colheita, alegria festiva — bom encaixe pra linha Groove Soul.',
    suggestedHymns: ['Celebrai o Senhor (tema tradicional livre)', 'Ceifeiros Voltarão (tema tradicional livre)'],
  },
  {
    id: 'dia-das-criancas',
    name: 'Dia das Crianças',
    period: 'Outubro',
    suggestedTitle: 'Pequeninos no Senhor',
    suggestedConcept: 'Simplicidade, ternura, fé como criança.',
    suggestedHymns: ['Deixai Vir a Mim os Pequeninos (tema tradicional livre)', 'Cordeirinhos — tema pastoril da Harpa Cristã'],
  },
];
