export interface HymnItem {
  name: string;
  alternateTitles?: string;
  theme: string;
  moodTempo: string;
  publicDomainNote: string;
  suggestedUseCases: string;
}

export interface HymnCategory {
  name: string;
  items: HymnItem[];
}

/**
 * Biblioteca de hinos/salmos/espirituais de referência — paralela à Biblioteca de Ritmos.
 * Usada para orientar clima/andamento de uma faixa (não para cópia de letra/melodia).
 * A maioria dos itens é de domínio público (hinos tradicionais com +70 anos).
 */
export const HYMN_DATA: HymnCategory[] = [
  {
    name: 'Salmos',
    items: [
      {
        name: 'Salmo 23 — O Senhor é Meu Pastor',
        theme: 'Confiança, provisão divina, descanso, proteção ("águas tranquilas", "vale da sombra da morte", "mesa posta")',
        moodTempo: 'Lento a médio; introspectivo, solene, reconfortante',
        publicDomainNote: 'Texto bíblico de domínio público; usar como direção temática, não copiar arranjos específicos',
        suggestedUseCases: 'Blues gospel lento, faixas ambiente/relaxamento, faixa de abertura ou encerramento de álbum',
      },
      {
        name: 'Salmo 91',
        theme: 'Refúgio, proteção sob as asas do Altíssimo',
        moodTempo: 'Lento, atmosférico',
        publicDomainNote: 'Domínio público',
        suggestedUseCases: 'Faixas instrumentais de sono/relaxamento',
      },
      {
        name: 'Salmo 4 — "Em Paz Me Deito"',
        theme: 'Paz noturna, descanso, confiança para dormir',
        moodTempo: 'Muito lento, sussurrado',
        publicDomainNote: 'Domínio público',
        suggestedUseCases: 'Série de sono/relaxamento, faixas longas com voz como textura de fundo',
      },
      {
        name: 'Salmo 46 — "Aquietai-vos e Sabei"',
        theme: 'Quietude, presença divina em meio ao caos',
        moodTempo: 'Lento, minimalista',
        publicDomainNote: 'Domínio público',
        suggestedUseCases: 'Faixas ambiente instrumentais',
      },
      {
        name: 'Salmo 121 — "Não Dormitará Quem Te Guarda"',
        theme: 'Vigilância divina constante, segurança para dormir',
        moodTempo: 'Lento, introspectivo',
        publicDomainNote: 'Domínio público',
        suggestedUseCases: 'Série de sono/relaxamento',
      },
      {
        name: 'Salmo 30 — "O Choro Pode Durar Uma Noite"',
        theme: 'Superação, alegria após a dor, renovação pela manhã',
        moodTempo: 'Livre (rubato), arco emocional de tristeza para esperança',
        publicDomainNote: 'Domínio público',
        suggestedUseCases: 'Faixa de encerramento de álbuns de relaxamento',
      },
    ],
  },
  {
    name: 'Hinos Clássicos (Domínio Público)',
    items: [
      {
        name: 'Amazing Grace / Graça Infinita',
        theme: 'Redenção, graça, transformação pessoal',
        moodTempo: 'Lento a médio; pode ganhar versão soul/groove mais animada',
        publicDomainNote: 'Hino tradicional, domínio público (letra original de 1779)',
        suggestedUseCases: 'Blues gospel, versão soul/groove, faixa de clímax emocional do álbum',
      },
      {
        name: 'Rock of Ages / Rocha Eterna',
        theme: 'Firmeza, refúgio inabalável em Deus',
        moodTempo: 'Blues shuffle médio',
        publicDomainNote: 'Hino tradicional, domínio público (1763)',
        suggestedUseCases: 'Blues gospel médio, com introdução de piano/guitarra antes da voz',
      },
      {
        name: 'A Mighty Fortress Is Our God / Castelo Forte',
        theme: 'Força, proteção, fortaleza espiritual (Lutero)',
        moodTempo: 'Lento, solene, com solo de guitarra curto',
        publicDomainNote: 'Hino de Martinho Lutero, domínio público',
        suggestedUseCases: 'Blues lento clássico, slide guitar em destaque',
      },
      {
        name: 'How Great Thou Art / Quão Grande És Tu',
        theme: 'Grandeza e majestade de Deus na criação',
        moodTempo: 'Médio, refrão com mais energia',
        publicDomainNote: 'Domínio público (melodia sueca tradicional)',
        suggestedUseCases: 'Blues médio com guitarra expressiva (bend), ponto alto do álbum',
      },
      {
        name: 'It Is Well with My Soul / Está Bem Com Minha Alma',
        theme: 'Paz em meio à tribulação, tranquilidade',
        moodTempo: 'Lento, introspectivo',
        publicDomainNote: 'Domínio público (1876)',
        suggestedUseCases: 'Faixa introspectiva, blues lento ou ambiente',
      },
      {
        name: 'Blessed Assurance / Bendita Certeza',
        theme: 'Certeza da salvação, alegria e confiança',
        moodTempo: 'Médio, animado',
        publicDomainNote: 'Domínio público (1873)',
        suggestedUseCases: 'Gospel groove soul, faixa festiva',
      },
      {
        name: 'Nearer My God to Thee / Mais Perto Quero Estar',
        theme: 'Intimidade e proximidade com Deus',
        moodTempo: 'Lento, solene',
        publicDomainNote: 'Domínio público (1841)',
        suggestedUseCases: 'Blues gospel lento, faixa introspectiva',
      },
      {
        name: 'Just As I Am / Tal Qual Estou',
        theme: 'Entrega, aceitação incondicional',
        moodTempo: 'Muito lento, quase a cappella',
        publicDomainNote: 'Domínio público (1835)',
        suggestedUseCases: 'Faixa de encerramento de álbum, fade out longo',
      },
      {
        name: 'When the Saints Go Marching In',
        theme: 'Celebração, esperança escatológica, alegria coletiva',
        moodTempo: 'Animado, shuffle',
        publicDomainNote: 'Espiritual tradicional afro-americano, domínio público',
        suggestedUseCases: 'Ponto de energia mais alta do álbum, gospel groove',
      },
      {
        name: 'Down by the Riverside',
        theme: 'Paz, deposição de fardos, comunhão',
        moodTempo: 'Médio, groove leve',
        publicDomainNote: 'Espiritual tradicional afro-americano, domínio público',
        suggestedUseCases: 'Blues gospel médio, clima comunitário',
      },
      {
        name: 'Wade in the Water',
        theme: 'Travessia, libertação, purificação',
        moodTempo: 'Médio, hipnótico, call and response',
        publicDomainNote: 'Espiritual tradicional afro-americano, domínio público',
        suggestedUseCases: 'Blues gospel com coro de fundo, call and response marcante',
      },
      {
        name: 'Swing Low, Sweet Chariot',
        theme: 'Esperança, libertação, jornada para casa',
        moodTempo: 'Lento, solene, emotivo',
        publicDomainNote: 'Espiritual tradicional afro-americano, domínio público',
        suggestedUseCases: 'Faixa introspectiva ou de encerramento, blues lento',
      },
    ],
  },
  {
    name: 'Temas Bíblicos Livres',
    items: [
      {
        name: '2 Samuel 6 — "Davi Dançou"',
        theme: 'Celebração exuberante, dança e louvor sem reservas',
        moodTempo: 'Rápido, festivo, percussão extra',
        publicDomainNote: 'Tema bíblico livre (não é um hino específico)',
        suggestedUseCases: 'Faixa mais festiva do álbum, ideal para clipes de redes sociais',
      },
      {
        name: 'Filipenses 4:7 — "Paz Que Excede Todo Entendimento"',
        theme: 'Paz sobrenatural, tranquilidade além da lógica',
        moodTempo: 'Livre (rubato), sem clique perceptível',
        publicDomainNote: 'Tema bíblico livre',
        suggestedUseCases: 'Faixa ambiente de encerramento em álbuns de relaxamento',
      },
      {
        name: '1 Samuel 7:12 — "Até Aqui Nos Ajudou o Senhor"',
        theme: 'Gratidão retrospectiva, memorial, fidelidade ao longo do tempo',
        moodTempo: 'Lento, clima solene e nostálgico',
        publicDomainNote: 'Tema bíblico livre',
        suggestedUseCases: 'Faixas de fim de ano/fim de ciclo, emotiva',
      },
    ],
  },
];
