import React, { useState, useEffect, useRef } from 'react';

interface RhythmLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRhythm: (rhythm: string) => void;
}

interface RhythmItem {
  name: string;
  description: string;
  instruments: string;
  structure: string; 
  useCases: string;  
}

interface RhythmCategory {
  name: string;
  items: RhythmItem[];
}

// Dados: Biblioteca expandida com +100 ritmos categorizados e traduzidos
const RHYTHM_DATA: RhythmCategory[] = [
  {
    name: "Brasileira & Regional",
    items: [
      {
        name: "Funk Carioca (Mandela)",
        description: "Batida pesada, crua e hipnótica das favelas do Rio.",
        instruments: "Beatbox Vocal, Pontos de Funk, Graves distorcidos, Samplers de Voz repetitivos.",
        structure: "Intro com 'Ponto' (Melodia) > Batida Seca (Tu-tcha-tcha) > Drop repetitivo > Breque > Explosão.",
        useCases: "Festas de rua, bailes funk, vídeos de dança (TikTok), cenas de favela, energia caótica."
      },
      {
        name: "Sertanejo Universitário",
        description: "Pop rural moderno, focado em festas e relacionamentos.",
        instruments: "Violão de Aço, Sanfona (Acordeon), Bateria Pop, Baixo elétrico.",
        structure: "Intro de Sanfona > Verso narrativo > Pré-refrão crescente > Refrão explosivo (Vozes em terça) > Solo.",
        useCases: "Festas agro, churrascos, rodeios, histórias de superação amorosa, baladas sertanejas."
      },
      {
        name: "Sertanejo Raiz (Modão)",
        description: "Nostálgico, acústico e sentimental, o som do interior.",
        instruments: "Viola Caipira (10 cordas), Violão, Acordeon suave, Vozes duetadas.",
        structure: "Intro longa de Viola > Verso lento e emotivo > Refrão harmonizado > Solo de Viola > Final lento.",
        useCases: "Cenas de fazenda, amanhecer no campo, nostalgia, almoços de domingo, cultura caipira."
      },
      {
        name: "MPB Clássica",
        description: "Sofisticado, poético e harmonicamente rico.",
        instruments: "Violão de Nylon, Piano, Baixo Fretless, Bateria suave, Percussão leve.",
        structure: "Intro harmônica > Verso poético > Refrão melódico > Ponte complexa > Vocal final suave.",
        useCases: "Cafeterias, novelas, documentários culturais, jantares, pôr do sol na praia."
      },
      {
        name: "Forró Pé de Serra",
        description: "Dançante, nordestino e tradicional.",
        instruments: "Sanfona, Zabumba, Triângulo.",
        structure: "Intro de Sanfona > Ritmo de Zabumba entra > Verso rápido > Refrão dançante > Solo virtuoso.",
        useCases: "Festas juninas, dança a dois (xote/baião), documentários do Nordeste, alegria popular."
      },
      {
        name: "Pisadinha / Piseiro",
        description: "Eletrônico, minimalista e extremamente popular no interior.",
        instruments: "Teclado arranjador (Sintetizador), Bateria eletrônica simples, Baixo sintetizado.",
        structure: "Intro de Teclado (Solo) > Batida seca (Kick constante) > Verso > Refrão chiclete > Solo de Teclado.",
        useCases: "Memes, danças virais, festas populares, paredões de som, cultura pop atual."
      },
      {
        name: "Pagode 90s",
        description: "Romântico, percussivo e nostálgico.",
        instruments: "Cavaquinho, Pandeiro, Tantan, Repique de mão, Teclados.",
        structure: "Intro de Cavaco > Verso romântico > Refrão em coro uníssono > Breque percussivo > Modulação.",
        useCases: "Churrascos, reuniões de família, nostalgia brasileira, cenas de bar/boteco."
      },
      {
        name: "Axé Music",
        description: "A energia do carnaval da Bahia. Percussivo e elétrico.",
        instruments: "Guitarra Baiana, Surdos de marcação, Timbau, Metais.",
        structure: "Intro de Metais/Guitarra > Percussão pesada > Verso animado > Refrão de estádio (pular) > Coreografia.",
        useCases: "Carnaval, verão, trio elétrico, festas na praia, exercícios aeróbicos."
      },
       {
        name: "Bossa Nova", 
        description: "A fusão brasileira de Samba e Jazz. Suave e sofisticado.", 
        instruments: "Violão de Nylon (batida característica), Piano, Bateria suave (Rimshot), Saxofone.",
        structure: "Intro de Violão > Canto suave e falado > Ponte harmônica complexa > Solo de Piano/Sax > Refrão suave.",
        useCases: "Praias tranquilas, pôr do sol, encontros românticos, elevadores de luxo, cenas no Rio de Janeiro."
      },
      { 
        name: "Samba", 
        description: "A alma do Brasil. Percussivo, alegre e festivo.", 
        instruments: "Surdo, Pandeiro, Cavaquinho, Violão 7 Cordas, Cuíca.",
        structure: "Intro de Cavaquinho > Entrada da Percussão > Verso Cantado > Refrão em Coro > Breque de bateria.",
        useCases: "Carnaval, futebol, festas brasileiras, documentários de turismo, churrascos."
      }
    ]
  },
  {
    name: "Eletrônica & Dance",
    items: [
       { 
        name: "Phonk (Drift)", 
        description: "Sombrio, distorcido, febre do TikTok e cultura automotiva.", 
        instruments: "Cowbells distorcidos, Graves 808 estourados, Samples de Rap Memphis, Lo-fi texture.",
        structure: "Intro sombria > Build-up > DROP com Cowbell melody e Grave pesado > Loop hipnótico.",
        useCases: "Vídeos de carros (Drift), edits de anime, academia (treino pesado), conteúdo agressivo."
      },
      { 
        name: "Synthwave 80s", 
        description: "Nostálgico e futurista, evocando a estética neon dos anos 80.", 
        instruments: "Sintetizadores Analógicos, Drum Machines (Linndrum), Snare com Gated Reverb, Baixo Arpejado.",
        structure: "Intro atmosférico > Build-up lento > Drop melódico > Break com pads > Solo de synth > Fade-out.",
        useCases: "Cenas de direção noturna, vídeos de tecnologia retro, introduções de canais de games, trilhas Sci-Fi."
      },
      { 
        name: "Deep House", 
        description: "Profundo, relaxante e com groove constante, focado na atmosfera.", 
        instruments: "Linhas de baixo profundas, Vocais com soul, Piano Rhodes, Bumbo 4/4 suave, Chimbal (Hi-hats).",
        structure: "Intro mixável (DJ friendly) > Entrada do Baixo > Verso vocal suave > Refrão instrumental > Breakdown > Drop suave.",
        useCases: "Lounge bars, desfiles de moda, vídeos de viagem de luxo, fundo para vlogs lifestyle."
      },
      { 
        name: "Tech House", 
        description: "Groove percussivo, repetitivo e focado na pista de dança.", 
        instruments: "Bumbo seco, Linha de baixo Rolling, Snares curtos, Samples vocais cortados.",
        structure: "Intro de Bateria > Entrada do Baixo > Vocal Loop > Drop minimalista mas dançante > Break longo.",
        useCases: "Clubes noturnos, festivais de verão, vídeos de moda urbana, after-parties."
      },
      { 
        name: "Future Bass", 
        description: "Moderno, colorido, com sintetizadores oscilantes e acordes ricos.", 
        instruments: "Super Saw Chords (Wobble), Vocal Chops agudos, Trap Beats, Sub-grave melódico.",
        structure: "Intro melódico > Build-up com Snare Roll > DROP com acordes pulsantes e vocal chops > Ponte suave.",
        useCases: "Vlogs de youtubers, tutoriais, montagens de gameplay, introduções animadas."
      },
      { 
        name: "Eurodance 90s", 
        description: "Alta energia, nostálgico, rápido e eufórico.", 
        instruments: "Piano Korg M1, Sintetizadores Saw, Vocais Diva poderosos, Rap masculino no verso.",
        structure: "Intro Teclado > Refrão Cantado > Verso Rap > Refrão Explosivo > Solo de Synth.",
        useCases: "Festas retrô, memes, cenas de aeróbica, comédias nostálgicas."
      },
       { 
        name: "Vaporwave", 
        description: "Surreal, irônico, desacelerado e nostálgico.", 
        instruments: "Samples de Jazz/Pop 80s desacelerados, Efeitos de fita VHS, Saxofone ecoando.",
        structure: "Loop curto repetido > Efeitos de pitch down > Glitches > Sensação de 'sonho febril'.",
        useCases: "Estética Aesthethic, vídeos de arte digital, background de lojas virtuais, memes."
      },
      { 
        name: "Tropical House", 
        description: "Vibe de praia, verão e relaxamento. Kygo style.", 
        instruments: "Flauta de Pan sintetizada, Marimba, Estalos de dedo, Piano acústico.",
        structure: "Intro acústico > Vocal suave > Drop melódico com Flauta/Marimba > Verso > Drop final.",
        useCases: "Vídeos de férias, verão, praia, coquetéis, vlogs de viagem."
      },
      { 
        name: "Hardstyle", 
        description: "Extremamente agressivo, rápido e distorcido.", 
        instruments: "Kick Distorcido (GONG), Reverse Bass, Melodias eufóricas de Synth.",
        structure: "Intro melódico > Build-up longo > DROP PESADO (Kick) > Break melódico > Drop final.",
        useCases: "Festivais gigantes, vídeos de fisiculturismo, momentos de ápice energético."
      },
      { 
        name: "Techno Industrial", 
        description: "Pesado, repetitivo, mecânico e sombrio.", 
        instruments: "Bumbos distorcidos, Percussão metálica, Sintetizadores modulares, Geradores de ruído.",
        structure: "Loop percussivo longo > Adição de camadas de ruído > Drop minimalista e pesado > Tensão crescente sem melodia óbvia.",
        useCases: "Cenas de perseguição cyberpunk, ambientes de fábrica, tensão em filmes de ação, academias hardcore."
      },
      { 
        name: "Drum and Bass", 
        description: "Rápido (170bpm+), focado em quebras de bateria complexas e graves profundos.", 
        instruments: "Breakbeats rápidos, Baixo Reece (distorcido), Sub-grave, Pads atmosféricos.",
        structure: "Intro leve/jazzística > Build-up rápido > Drop explosivo de bateria e baixo > Ponte melódica > Segundo Drop.",
        useCases: "Esportes radicais, corridas de alta velocidade, cenas de fuga, montagens de gameplay frenético."
      },
      { 
        name: "Lo-Fi Hip Hop", 
        description: "Imperfeito, relaxante, nostálgico e com texturas de vinil.", 
        instruments: "Chiado de vinil, Batidas Downtempo, Samples de piano Jazz, Trompete com surdina.",
        structure: "Loop curto e repetitivo (2 a 4 acordes) > Batida 'bêbada' (off-grid) > Samples vocais de filmes antigos > Sem grandes explosões.",
        useCases: "Estudos/Foco, dias chuvosos, cafeterias, fundos de conversa em podcasts, relaxamento."
      },
      { 
        name: "EDM Festival", 
        description: "Energia máxima, projetado para grandes multidões e estádios.", 
        instruments: "Sintetizadores Supersaw, Risers de build-up, Bumbo pesado, Compressão Sidechain forte.",
        structure: "Intro melódico > Verso cantado > Build-up tenso (snare roll) > DROP massivo instrumental > Break > Drop final.",
        useCases: "Vídeos de melhores momentos de festas, trailers de eventos, montagens esportivas eufóricas."
      },
      { 
        name: "Trance", 
        description: "Hipnótico, melódico e emocionalmente edificante.", 
        instruments: "Sintetizadores dedilhados (Plucks), Arpejos rápidos, Pads etéreos, Linha de baixo pulsante.",
        structure: "Intro longo > Melodia principal suave > Build-up eufórico > Clímax melódico > Outro rítmico.",
        useCases: "Cenas de voo/espaço, meditação ativa, corridas de longa distância, momentos de epifania."
      },
      { 
        name: "Dubstep", 
        description: "Agressivo, marcado pelo grave oscilante (wobble) e meio-tempo.", 
        instruments: "Wobble Bass, Growl Bass (monstruoso), Caixa (Snare) pesada, Sub-grave no drop.",
        structure: "Intro sombrio > Build-up rápido > DROP (Meio tempo, graves pesados) > Ponte melódica > Drop variação.",
        useCases: "Cenas de luta em câmera lenta, robôs gigantes, transições de vídeo impactantes, destaques de jogos de tiro."
      },
      { 
        name: "Cyberpunk", 
        description: "Distópico, agressivo e high-tech.", 
        instruments: "Sintetizadores distorcidos, Efeitos Glitch, Bateria industrial pesada, Ambientes de cidade futura.",
        structure: "Intro com sons de cidade/chuva > Batida pesada e lenta > Melodias sintéticas tristes > Clímax caótico.",
        useCases: "Narrativas futuristas, hacking, ambientes neon sombrios, RPGs de mesa sci-fi."
      },
      { 
        name: "Ambient", 
        description: "Etéreo, sem batida definida, focado na textura sonora.", 
        instruments: "Pads de Drone, Gravações de campo (natureza), Texturas com muito Reverb.",
        structure: "Sem estrutura definida. Evolução lenta de timbres, camadas entrando e saindo suavemente.",
        useCases: "Documentários de natureza, meditação, menus de jogos, cenas espaciais, fundo para leitura."
      }
    ]
  },
  {
    name: "Rock & Metal",
    items: [
      { 
        name: "Classic Rock 70s", 
        description: "Cru, enérgico e baseado em riffs de guitarra, o som clássico do rock.", 
        instruments: "Guitarra Elétrica (Overdrive), Órgão Hammond, Baixo, Bateria Acústica.",
        structure: "Riff de Guitarra > Verso > Refrão Explosivo > Verso > Solo de Guitarra > Refrão Final.",
        useCases: "Road trips, cenas de bar, filmes de época (anos 70), montagens de liberdade/rebeldia."
      },
      { 
        name: "Nu Metal", 
        description: "Agressivo, rítmico, fusão de metal com hip-hop dos anos 2000.", 
        instruments: "Guitarras afinadas graves (Drop D/A), Baixo estalado, DJ Scratches, Vocais Rap/Grito.",
        structure: "Intro Ritmada > Verso Rapado > Pré-refrão tenso > Refrão Melódico/Gritado > Ponte Pesada.",
        useCases: "Cenas de ação intensa, esportes radicais, nostalgia anos 2000, AMVs de luta."
      },
      { 
        name: "Surf Rock", 
        description: "Rápido, praiano e com muita reverberação.", 
        instruments: "Guitarra Fender (Reverb de Mola), Tremolo picking, Bateria rápida, Saxofone (opcional).",
        structure: "Glissando de guitarra > Riff principal rápido > Seção rítmica > Solo de bateria > Retorno ao riff.",
        useCases: "Cenas de praia, perseguições cômicas, filmes de Tarantino, vibe vintage 60s."
      },
      { 
        name: "Post-Punk / Goth", 
        description: "Sombrio, melancólico, linhas de baixo proeminentes.", 
        instruments: "Baixo com Chorus (destaque), Guitarra aguda e fria, Bateria mecânica, Voz grave.",
        structure: "Intro de Baixo > Bateria entra > Guitarra atmosférica > Voz distante > Clímax instrumental.",
        useCases: "Clubes alternativos, cenas noturnas e frias, mistério, estética gótica."
      },
      { 
        name: "Stoner Rock", 
        description: "Lento, pesado, psicodélico e arrastado.", 
        instruments: "Guitarras com Fuzz pesado, Baixo estrondoso, Bateria lenta e solta.",
        structure: "Riff lento e repetitivo (transe) > Vocais com eco > Solo de guitarra longo e improvisado.",
        useCases: "Cenas de deserto, viagens alucinógenas, motociclistas, câmera lenta."
      },
      { 
        name: "Emo 2000s", 
        description: "Emocional, dramático e dinâmico.", 
        instruments: "Guitarras oitavadas, Bateria enérgica, Vocais chorosos/gritados.",
        structure: "Intro limpo > Verso contido > Refrão explosivo e catártico > Ponte dramática (Grito) > Refrão.",
        useCases: "Cenas de término, dramas adolescentes, nostalgia millennial, vídeos de skate."
      },
      { 
        name: "Math Rock", 
        description: "Complexo, técnico, ritmos quebrados (compassos impares).", 
        instruments: "Guitarras limpas dedilhadas (Tapping), Bateria complexa, Baixo técnico.",
        structure: "Mudanças constantes de tempo > Riffs angulares > Melodias entrelaçadas > Sem refrão óbvio.",
        useCases: "Vídeos de design técnico, arquitetura, tutoriais avançados, contemplação complexa."
      },
      { 
        name: "Heavy Metal", 
        description: "Agressivo, rápido e distorcido.", 
        instruments: "Guitarras com muita distorção, Bumbo duplo, Vocais agudos ou guturais.",
        structure: "Intro Rápido > Riff Pesado > Verso Agressivo > Refrão Melódico ou Gritado > Solo Rápido (Shred) > Final abrupto.",
        useCases: "Cenas de batalha intensa, esportes de combate, momentos de raiva/fúria, jogos de ação extrema."
      },
      { 
        name: "Indie Rock", 
        description: "Alternativo, melódico e com produção moderna/caseira.", 
        instruments: "Guitarras limpas (Jangle), Vocais Lo-fi, Bateria simples, Sintetizadores sutis.",
        structure: "Intro simples > Verso Melódico > Refrão 'Chiclete' > Ponte instrumental > Refrão repetido.",
        useCases: "Filmes 'coming-of-age', vlogs de viagens hipsters, comerciais jovens, cenas de romance moderno."
      },
      { 
        name: "Punk Rock", 
        description: "Rápido, rebelde, político e simples.", 
        instruments: "Power Chords rápidos, Baixo tocado com palheta, Bateria acelerada, Vocais gritados.",
        structure: "Contagem (1,2,3,4!) > Intro Rápido > Verso Curto > Refrão Grito > Verso > Refrão > Fim (Músicas curtas < 3min).",
        useCases: "Cenas de skate, protestos, caos adolescente, comédias pastelão, momentos de energia pura."
      },
      { 
        name: "Grunge 90s", 
        description: "Sujo, depressivo, intenso e dinâmico (quieto-barulhento).", 
        instruments: "Guitarra Fuzz, Baixo pesado (Sludge), Bateria arrastada, Vocais angustiados.",
        structure: "Intro limpo/sombrio > Verso sussurrado > Refrão EXPLOSIVO e barulhento > Ponte caótica.",
        useCases: "Cenas dramáticas e sombrias, momentos de angústia, filmes anos 90, estética 'suja'."
      },
      { 
        name: "Psychedelic Rock", 
        description: "Viagem mental, experimental e colorido.", 
        instruments: "Cítara, Guitarra Reversa, Mellotron, Bateria com Phaser, Efeitos de eco.",
        structure: "Longo, jams instrumentais estendidas, solos improvisados, estruturas não lineares.",
        useCases: "Cenas de sonho/alucinação, flashbacks, estética hippie, vídeos artísticos abstratos."
      },
      { 
        name: "Pop Punk", 
        description: "Melódico, rápido e com temas adolescentes.", 
        instruments: "Power Chords, Solos em oitavas, Tempos rápidos, Vocais limpos e anasalados.",
        structure: "Intro de Guitarra > Verso sobre relacionamentos/escola > Refrão Hino > Ponte > Refrão Final.",
        useCases: "Filmes de colegial (High School), festas americanas, vídeos de skate/surf, nostalgia anos 2000."
      }
    ]
  },
  {
    name: "Hip Hop & R&B",
    items: [
      { 
        name: "G-Funk (West Coast)", 
        description: "O som da Califórnia nos anos 90. Relaxado e gangsta.", 
        instruments: "Sintetizador Agudo (High Whistle), Baixo Funk profundo, Piano Rhodes, Batida lenta.",
        structure: "Intro com Synth > Verso Rap relaxado > Refrão feminino soulful > Outro instrumental.",
        useCases: "Cenas de Lowriders, pôr do sol em LA, churrascos, vibe nostálgica de verão."
      },
      { 
        name: "Jazz Rap", 
        description: "Intelectual, suave, consciente e poético.", 
        instruments: "Bateria com vassourinhas, Baixo acústico (Walking bass), Samples de Trompete/Piano.",
        structure: "Loop de Jazz > Verso Rap poético e calmo > Refrão cantado ou Scratches > Solo de Jazz.",
        useCases: "Cafés, livrarias, vlogs de estudo, reflexões urbanas, dias chuvosos."
      },
      { 
        name: "Grime (UK)", 
        description: "Rápido, eletrônico, agressivo e britânico.", 
        instruments: "Sintetizadores ásperos, Sub-grave distorcido, Batida quebrada (140bpm).",
        structure: "Intro rápida > Verso Rap acelerado (Flow rápido) > 'Reload' (reinício da música) > Drop agressivo.",
        useCases: "Cenas de Londres, esportes de combate, tensão urbana, energia caótica."
      },
      { 
        name: "Trap", 
        description: "O som dominante do hip hop moderno, focado em graves e hi-hats.", 
        instruments: "Sub-grave 808, Hi-hats em tercinas (rolling), Snare Rolls, Vocais com Auto-tune.",
        structure: "Intro atmosférico > Hook (Refrão curto) > Verso Ritmado > Hook > Verso > Outro.",
        useCases: "Montagens de carros tunados, vídeos de 'flexing' (ostentação), treinos de academia, festas modernas."
      },
      { 
        name: "Boom Bap 90s", 
        description: "O som clássico de NY, baseado em samples de Jazz/Soul e batidas secas.", 
        instruments: "Sampler MPC, Samples de Jazz, Bumbo e Caixa pesados, Baixo acústico.",
        structure: "Intro com sample de filme > Loop de bateria constante (4 compassos) > Versos focados na letra > Refrão com Scratches.",
        useCases: "Documentários urbanos, vlogs de rua, vídeos de grafite/skate, narrativas nostálgicas."
      },
      { 
        name: "R&B Contemporâneo", 
        description: "Suave, sensual e focado na performance vocal.", 
        instruments: "Sintetizadores suaves, Estalos de dedo, Baixo profundo, Vocais com melisma.",
        structure: "Intro falado ou suave > Verso > Pré-refrão (crescente) > Refrão Harmônico > Ponte emocional.",
        useCases: "Cenas românticas, jantares, vídeos de maquiagem/beleza, momentos intimistas."
      },
      { 
        name: "Neo Soul", 
        description: "Orgânico, 'jazzy', relaxado e com groove atrasado (laid back).", 
        instruments: "Piano Rhodes, Baixo elétrico, Rimshots, Harmonias vocais de fundo.",
        structure: "Groove instrumental > Verso relaxado > Refrão suave > Solo de teclado/instrumental > Fade out.",
        useCases: "Cafeterias modernas, vlogs de rotina matinal, arte e design, ambientes sofisticados."
      },
      { 
        name: "Drill", 
        description: "Sombrio, agressivo, com graves que deslizam (slides).", 
        instruments: "808s com Slide (glissando), Piano sombrio, Hi-hats sincopados.",
        structure: "Intro tenso > Hook agressivo > Verso rápido e direto > Pausas dramáticas na batida.",
        useCases: "Cenas de crime/tensão urbana, vídeos de 'gangster', montagens agressivas, notícias impactantes."
      },
      { 
        name: "Reggaeton", 
        description: "Latino, dançante, baseado na batida 'Dembow'.", 
        instruments: "Ritmo Dembow, Sintetizadores curtos (Plucks), Bumbo 808, Vocais em espanhol.",
        structure: "Intro cantado > Batida entra forte > Verso > Pré-refrão > Refrão Dançante > Ponte (Rap).",
        useCases: "Festas na praia, dança, verão, vídeos de férias tropicais, academias de dança."
      }
    ]
  },
  {
    name: "Reggae & Dub",
    items: [
      {
        name: "Roots Reggae",
        description: "Espiritual, relaxado, protesto pacífico.",
        instruments: "Guitarra 'Skank' (no contratempo), Baixo melódico, Órgão Hammond, Bateria One-Drop.",
        structure: "Intro de Bateria > Groove > Verso consciente > Refrão harmonizado > Solo de Guitarra/Teclado.",
        useCases: "Relaxamento, praia, mensagens de paz, documentários culturais, verão."
      },
      {
        name: "Dub",
        description: "Psicodélico, focado no baixo e efeitos de estúdio.",
        instruments: "Baixo sub-grave, Efeitos de Eco (Delay) e Reverb infinitos, Melodica, Bateria espaçada.",
        structure: "Base de Reggae instrumental > Instrumentos entram e somem > Efeitos extremos > Foco no Baixo e Bateria.",
        useCases: "Ambientes esfumaçados, concentração, lounges alternativos, arte visual abstrata."
      },
      {
        name: "Ska Tradicional",
        description: "Rápido, alegre, precursor do Reggae.",
        instruments: "Metais (Trompete/Sax), Guitarra no contratempo rápido, Baixo caminhante (Walking Bass).",
        structure: "Intro de Metais > Verso rápido e dançante > Solo de Saxofone > Refrão > Fim abrupto.",
        useCases: "Cenas de comédia, dança frenética, desenhos animados, momentos de pura alegria."
      }
    ]
  },
  {
    name: "Jazz, Blues & Soul",
    items: [
      {
        name: "Gospel Choir",
        description: "Poderoso, espiritual, emocional e grandioso.",
        instruments: "Coral massivo, Órgão Hammond, Piano, Bateria enérgica, Palmas.",
        structure: "Intro de Piano/Órgão > Solista inicia > Coral entra no Refrão > Clímax com modulação de tom > Final épico.",
        useCases: "Cenas de redenção, igrejas, momentos de vitória emocional, casamentos."
      },
      {
        name: "Swing Big Band",
        description: "O som das orquestras de dança dos anos 30/40. Grandioso e elegante.",
        instruments: "Seção de Metais (12+ músicos), Bateria Swing, Contrabaixo, Piano.",
        structure: "Tutti (Orquestra toda) > Tema principal > Solos individuais > Batalha de metais > Final 'Sting'.",
        useCases: "Filmes de época, bailes de gala, comédias clássicas, cenas de cassino vintage."
      },
      {
        name: "Smooth Jazz",
        description: "Polido, comercial, música de fundo de luxo.",
        instruments: "Saxofone Soprano, Sintetizadores FM (anos 80), Guitarra limpa, Baixo fretless.",
        structure: "Groove suave constante > Melodia principal no Sax > Solo inofensivo > Retorno à melodia.",
        useCases: "Previsão do tempo, elevadores, recepções de escritório, canais de relaxamento."
      },
      { 
        name: "Cool Jazz", 
        description: "Suave, intelectual, relaxado e sofisticado.", 
        instruments: "Vassourinhas na bateria, Baixo acústico, Saxofone suave, Piano.",
        structure: "Apresentação do Tema (Melodia) > Solos improvisados (Sax, depois Piano) > Retorno ao Tema > Final.",
        useCases: "Jantares chiques, cenas de detetive noir, lobbies de hotel, noites chuvosas na cidade."
      },
      { 
        name: "Chicago Blues", 
        description: "Elétrico, emocional, a base do Rock n' Roll.", 
        instruments: "Guitarra Elétrica, Gaita (Harmônica), Piano, Batida Shuffle.",
        structure: "Estrutura de 12 Compassos (12-bar blues) repetida > Solos de Guitarra/Gaita entre versos > Final clássico.",
        useCases: "Bares de estrada, cenas de desilusão amorosa, viagens de moto, documentários americanos."
      },
      { 
        name: "Funk 70s", 
        description: "Altamente dançante, sincopado, focado no 'Groove' e no baixo.", 
        instruments: "Baixo Slap, Guitarra Wah-wah, Clavinet, Seção de Metais (Trompetes).",
        structure: "Intro com Groove > Verso Ritmado > Refrão em Uníssono > 'The One' (Batida forte no 1) > Jam session.",
        useCases: "Festas retrô, cenas de perseguição cômica, filmes de 'Blaxploitation', comerciais animados."
      },
      { 
        name: "Electro Swing", 
        description: "A mistura vibrante de Jazz dos anos 20 com House moderno.", 
        instruments: "Samples Vintage, Batida House (4/4), Clarinete, Baixo acústico.",
        structure: "Intro Vintage (filtro de rádio) > Drop moderno com batida House e Metais > Verso sampleado > Drop.",
        useCases: "Vídeos de moda excêntrica, comédias rápidas, tutoriais dinâmicos, festas temáticas Gatsby."
      }
    ]
  },
  {
    name: "Cinematográfico",
    items: [
      {
        name: "Film Noir Jazz",
        description: "Misterioso, esfumaçado, sombrio e sedutor.",
        instruments: "Saxofone solitário com eco, Baixo acústico lento, Vassourinhas, Trompete com surdina.",
        structure: "Intro lenta e grave > Melodia melancólica de trompete > Atmosfera de suspense > Sem resolução clara.",
        useCases: "Cenas de detetive, cidades chuvosas à noite, mistério, sedução perigosa (Femme Fatale)."
      },
      {
        name: "Fantasy Battle",
        description: "Urgente, percussivo e orquestral.",
        instruments: "Percussão de guerra, Metais graves (Trompas), Cordas rápidas (Spiccato), Coral gritando.",
        structure: "Ritmo de marcha > Aumento de tensão > Explosão orquestral > Ação frenética > Clímax heróico.",
        useCases: "Cenas de guerra medieval, chefes de videogames, perseguições épicas."
      },
      { 
        name: "Epic Orchestral", 
        description: "Grandioso, heróico, estilo 'Trailer de Hollywood'.", 
        instruments: "Percussão Gigante (Taikos), Cordas em Staccato, Metais (Brass), Coral.",
        structure: "Intro misterioso > Pulso rítmico > Entrada dos Metais > Clímax massivo com Coral > Corte abrupto ou fade.",
        useCases: "Trailers de filmes, momentos de vitória, vídeos motivacionais, batalhas épicas."
      },
      { 
        name: "Emotional Piano", 
        description: "Triste, reflexivo, minimalista e tocante.", 
        instruments: "Piano de Cauda (com muito reverb), Violoncelo Solo, Pads de cordas suaves.",
        structure: "Melodia de piano lenta > Entrada suave do violoncelo > Dinâmica aumenta levemente > Final suave.",
        useCases: "Cenas de despedida, dramas, vídeos de homenagem, momentos de reflexão profunda."
      },
      { 
        name: "Fantasy RPG", 
        description: "Mágico, aventureiro, evocando mundos medievais.", 
        instruments: "Harpa, Flauta, Alaúde, Cordas orquestrais, Carrilhão.",
        structure: "Melodia leve e saltitante > Seção misteriosa > Tema heróico suave > Loop de exploração.",
        useCases: "Jogos de RPG, cenas de floresta, contos de fadas, exploração de mundos mágicos."
      },
      { 
        name: "Horror Tension", 
        description: "Assustador, dissonante, feito para causar desconforto.", 
        instruments: "Cordas dissonantes (estridentes), Graves sub-sônicos, Metais rangendo.",
        structure: "Silêncio/Ambiente > Ruídos crescentes > 'Stings' (sustos sonoros) > Tensão constante sem resolução.",
        useCases: "Filmes de terror, casas assombradas, thrillers psicológicos, momentos de medo."
      },
      { 
        name: "Sci-Fi Score", 
        description: "Futurista, espacial, vasto e misterioso.", 
        instruments: "Sintetizadores Analógicos (Blade Runner), Theremin, Texturas Glitch, Orquestra Híbrida.",
        structure: "Pads longos e evolutivos > Arpejos sintéticos > Melodia solitária > Sensação de vastidão.",
        useCases: "Espaço sideral, tecnologia avançada, mistérios do universo, laboratórios futuristas."
      },
      { 
        name: "Western Spaghetti", 
        description: "O som clássico do Velho Oeste italiano.", 
        instruments: "Assobio, Guitarra Elétrica (com Reverb de mola), Trompete, Violão.",
        structure: "Intro com assobio ou gaita > Cavalgada rítmica > Tema principal na guitarra > Duelo de tensão.",
        useCases: "Duelos, deserto, cenas de cowboy, comédia irônica, pôr do sol no sertão."
      }
    ]
  },
  {
    name: "World & Latino",
    items: [
      {
        name: "Tango Argentino",
        description: "Dramático, apaixonado, marcado e elegante.",
        instruments: "Bandoneón (Acordeon), Piano, Violino, Contrabaixo.",
        structure: "Marcato (ritmo forte) > Melodia dramática de Bandoneón > Pausas bruscas > Variação romântica.",
        useCases: "Danças apaixonadas, cenas de ciúme, elegância clássica, Buenos Aires."
      },
      {
        name: "Afro-Cuban Jazz",
        description: "Jazz complexo com percussão latina frenética.",
        instruments: "Congas, Bongos, Piano Montuno, Saxofone, Trompete agudo.",
        structure: "Clave (ritmo base) > Tema em uníssono > Solos virtuosos sobre percussão rápida > Final explosivo.",
        useCases: "Cenas de dança virtuosa, bares de Havana, energia tropical sofisticada."
      },
      {
        name: "Celtic Punk",
        description: "A mistura de festa irlandesa com a energia do Punk.",
        instruments: "Gaita de Foles, Banjo, Guitarra distorcida, Bateria rápida, Violino.",
        structure: "Intro de Gaita > Batida Punk rápida > Refrão de bar (Coro de bêbados) > Solo de Banjo.",
        useCases: "Cenas de briga em bar, festas caóticas, St. Patrick's Day, perseguições divertidas."
      },
      { 
        name: "Salsa", 
        description: "Cubano/Latino, extremamente dançante e complexo.", 
        instruments: "Piano (Montuno), Congas, Timbales, Seção de Metais, Clave.",
        structure: "Intro de Metais > Verso > Montuno (Piano e Percussão) > 'Soneo' (Improviso vocal) > Mambo (Metais).",
        useCases: "Danças de salão, festas latinas, cenas de cassino caribenho, energia tropical."
      },
      { 
        name: "Flamenco", 
        description: "Espanhol, apaixonado, dramático e virtuosístico.", 
        instruments: "Violão Flamenco, Palmas, Cajón, Castanholas, Sapateado.",
        structure: "Intro livre de violão > Entrada do ritmo (Palmas) > Canto dramático (Cante Jondo) > Explosão rítmica.",
        useCases: "Cenas de paixão/ciúme, touradas, dança espanhola, momentos de tensão romântica."
      },
      { 
        name: "Afrobeat", 
        description: "Groove nigeriano complexo, mistura de Funk e Jazz africano.", 
        instruments: "Seção de Metais, Shekere, Congas, Riffs de Guitarra repetitivos.",
        structure: "Groove longo e hipnótico > Entrada dos Metais > Vocais de chamada e resposta > Solos percussivos.",
        useCases: "Festas culturais, dança, documentários africanos, cenas urbanas vibrantes."
      },
      { 
        name: "K-Pop", 
        description: "Pop coreano moderno. Produção polida, mistura de gêneros.", 
        instruments: "Produção digital perfeita, Sintetizadores, Seções de Rap, Batidas Pop.",
        structure: "Intro cativante > Verso > Pré-refrão > Refrão explosivo e coreografado > Ponte de Rap > Dance Break.",
        useCases: "Vídeos de dança, moda jovem, cultura pop asiática, energia colorida e vibrante."
      },
      { 
        name: "Bollywood", 
        description: "O som do cinema indiano. Dramático, orquestral e percussivo.", 
        instruments: "Cítara, Tabla, Cordas agudas, Tambores Dhol, Vozes características.",
        structure: "Intro de cordas dramáticas > Ritmo dançante > Canto dueto (Homem/Mulher) > Interlúdio instrumental.",
        useCases: "Casamentos indianos, cenas de dança em grupo, comédia romântica exótica, festivais de cores."
      },
      { 
        name: "Celtic Folk", 
        description: "Música folclórica irlandesa/escocesa. Festiva ou mística.", 
        instruments: "Violino (Fiddle), Flauta (Tin Whistle), Tambor Bodhrán, Gaita de Foles.",
        structure: "Melodia A repetida > Melodia B repetida > Aumento de andamento (acelerando) > Final festivo.",
        useCases: "Tavernas medievais, paisagens verdes, festas de São Patrício, filmes de fantasia."
      }
    ]
  },
  {
    name: "Clássica & Erudita",
    items: [
      {
        name: "Barroco",
        description: "Complexo, ornamentado e matemático (anos 1600-1750).",
        instruments: "Cravo, Cordas, Flauta doce, Trompete piccolo.",
        structure: "Contraponto (linhas melódicas independentes) > Fuga (repetição de temas) > Ornamento constante > Ritmo motor.",
        useCases: "Jantares reais, cenas de castelos, inteligência/genialidade, casamentos clássicos."
      },
      {
        name: "Era Romântica",
        description: "Emocional, expressivo e dramático (anos 1800s).",
        instruments: "Piano Virtuoso, Orquestra Gigante, Harpa.",
        structure: "Melodias longas e cantáveis > Mudanças bruscas de dinâmica (pp a ff) > Rubato (tempo flexível).",
        useCases: "Dramas de época, cenas de amor trágico, natureza sublime, paixão intensa."
      },
      {
        name: "Canto Gregoriano",
        description: "Monofônico, sagrado, vozes masculinas em eco.",
        instruments: "Apenas Vozes (A Cappella), reverberação de catedral.",
        structure: "Uníssono (todos cantam a mesma nota) > Ritmo livre baseado no texto > Sem harmonia.",
        useCases: "Mosteiros, cenas sagradas ou misteriosas, flashbacks históricos, rituais."
      }
    ]
  },
  {
    name: "Acústico & Country",
    items: [
      { 
        name: "Modern Country", 
        description: "O som do rádio americano. Pop-rock com alma rural.", 
        instruments: "Violão Acústico, Guitarra Solo (limpa), Slide Guitar, Vocais fortes.",
        structure: "Intro de Guitarra > Verso narrativo (storytelling) > Refrão Hino (Arena) > Solo de Guitarra > Refrão.",
        useCases: "Estradas americanas, bares, histórias de superação, romance rural, comerciais de carros/bebidas."
      },
      { 
        name: "Folk Indie", 
        description: "Intimista, suave, moderno e autêntico.", 
        instruments: "Violão dedilhado (Fingerstyle), Vozes suaves, Ukulele, Percussão leve.",
        structure: "Intro dedilhado > Verso suave > Refrão com harmonias vocais ('Oohs e Aahs') > Crescendo emocional.",
        useCases: "Vídeos de casamento, comerciais inspiradores, natureza, café da manhã, vlogs tranquilos."
      },
      { 
        name: "Piano Ballad", 
        description: "A forma mais pura de emoção musical. Solo e voz.", 
        instruments: "Piano de Cauda, Vozes, Cordas sutis (opcional).",
        structure: "Intro de Piano > Verso vulnerável > Refrão poderoso > Ponte dramática > Final suave.",
        useCases: "Momentos de tristeza, declarações de amor, créditos finais de filmes, audições de talento."
      },
      {
        name: "Bluegrass",
        description: "Rápido, virtuoso e acústico, das montanhas americanas.",
        instruments: "Banjo, Bandolim, Violino, Violão, Contrabaixo.",
        structure: "Tempo muito rápido > Harmonias vocais agudas > Solos improvisados rápidos de cada instrumento.",
        useCases: "Perseguições rurais, comédia caipira, demonstração de habilidade, cenas de fazenda."
      }
    ]
  }
];

const RhythmLibrary: React.FC<RhythmLibraryProps> = ({ isOpen, onClose, onSelectRhythm }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(RHYTHM_DATA[0].name);
  const [hoveredRhythm, setHoveredRhythm] = useState<RhythmItem | null>(null);
  
  // LAZY LOADING STATE
  const [itemsLimit, setItemsLimit] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Calcula os itens filtrados ANTES do render para usar na navegação
  const filteredCategories = RHYTHM_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) || 
        item.instruments.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.useCases.toLowerCase().includes(term)
      );
    })
  })).filter(cat => cat.items.length > 0);

  // Reinicia o limite quando o termo de busca muda
  useEffect(() => {
    setItemsLimit(20);
  }, [searchTerm]);

  // Intersection Observer para Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setItemsLimit((prev) => prev + 20);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget.current]);

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    
    // Calcula quantos itens precisam ser renderizados para alcançar essa categoria
    let neededCount = 0;
    let found = false;
    
    for (const cat of filteredCategories) {
      if (cat.name === catName) {
        neededCount += cat.items.length; // Inclui a própria categoria para garantir visualização
        found = true;
        break;
      }
      neededCount += cat.items.length;
    }

    if (found) {
      // Se o limite atual é menor que o necessário, aumenta
      if (itemsLimit < neededCount) {
        setItemsLimit(neededCount + 20); // +20 de buffer
      }

      // Aguarda o ciclo de renderização e rola
      setTimeout(() => {
        const element = document.getElementById(`cat-${catName}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  if (!isOpen) return null;

  // Lógica de Renderização Progressiva
  let renderedCount = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Container Principal */}
      <div className="bg-dark-800 w-full max-w-6xl max-h-[90vh] rounded-2xl border border-dark-600 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-dark-700 bg-dark-900/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-suno-500">♪</span> Biblioteca de Ritmos
            </h2>
            <p className="text-gray-400 text-sm mt-1">Explore estilos, estruturas e instrumentos.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-dark-800 p-2 rounded-full hover:bg-dark-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-dark-800 border-b border-dark-700 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text"
              placeholder="Buscar ritmo, instrumento ou vibe (ex: 'Triste', 'Neon', 'Festa')..."
              className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-suno-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Grid - 3 Columns Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Coluna 1: Categorias (Esquerda) */}
          <div className="hidden md:block w-1/5 bg-dark-900/50 border-r border-dark-700 overflow-y-auto custom-scrollbar">
            {RHYTHM_DATA.map(cat => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`w-full text-left px-4 py-4 text-sm font-bold transition-all border-l-4 ${
                  activeCategory === cat.name 
                    ? 'bg-dark-800 text-suno-400 border-suno-500 shadow-inner' 
                    : 'text-gray-400 border-transparent hover:bg-dark-800 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Coluna 2: Lista de Itens (Centro) */}
          <div className="flex-1 md:w-2/5 overflow-y-auto p-4 bg-dark-800 custom-scrollbar border-r border-dark-700 scroll-smooth">
            {filteredCategories.map(cat => {
              // Lógica para parar de renderizar se atingir o limite
              const remainingSlots = itemsLimit - renderedCount;
              if (remainingSlots <= 0) return null;

              // Renderiza apenas os itens que cabem no limite atual
              const itemsToShow = cat.items.slice(0, remainingSlots);
              renderedCount += itemsToShow.length;

              if (itemsToShow.length === 0) return null;

              return (
                <div key={cat.name} id={`cat-${cat.name}`} className="mb-6">
                  <h3 className="text-md font-bold text-suno-400 mb-3 sticky top-0 bg-dark-800/95 backdrop-blur py-2 z-10 border-b border-dark-700/50 uppercase tracking-wider">
                    {cat.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {itemsToShow.map((rhythm, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectRhythm(rhythm.name + ", " + rhythm.instruments);
                          onClose();
                        }}
                        onMouseEnter={() => setHoveredRhythm(rhythm)}
                        className={`group flex flex-col text-left p-3 rounded-lg border transition-all ${
                          hoveredRhythm?.name === rhythm.name
                          ? 'bg-dark-700 border-suno-500 shadow-lg translate-x-1'
                          : 'bg-dark-900/40 border-dark-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex justify-between w-full items-center">
                          <span className={`font-bold transition-colors ${hoveredRhythm?.name === rhythm.name ? 'text-white' : 'text-gray-300'}`}>
                              {rhythm.name}
                          </span>
                          {hoveredRhythm?.name === rhythm.name && (
                              <span className="text-xs text-suno-400 font-mono animate-pulse">Selecionar →</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{rhythm.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Sentinela para o Infinite Scroll */}
            <div ref={observerTarget} className="h-8 w-full"></div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Nenhum ritmo encontrado para "{searchTerm}"
              </div>
            )}
          </div>

          {/* Coluna 3: Painel de Detalhes (Direita) */}
          <div className="hidden lg:block w-2/5 bg-dark-900 p-6 overflow-y-auto custom-scrollbar relative">
             {hoveredRhythm ? (
                 <div className="animate-fade-in space-y-6">
                    {/* Título e Descrição */}
                    <div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-suno-400 to-purple-400 mb-2">
                            {hoveredRhythm.name}
                        </h2>
                        <p className="text-lg text-gray-200 leading-relaxed font-light border-l-2 border-suno-600 pl-4">
                            {hoveredRhythm.description}
                        </p>
                    </div>

                    {/* Instrumentos */}
                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            Instrumentos Chave
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {hoveredRhythm.instruments.split(',').map((inst, i) => (
                                <span key={i} className="text-xs bg-dark-700 text-suno-200 px-2 py-1 rounded border border-dark-600">
                                    {inst.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Estrutura Típica */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                            Estrutura Típica
                        </h4>
                        <div className="bg-dark-800/50 p-3 rounded-lg border border-dark-700 text-sm text-gray-300 font-mono leading-relaxed">
                            {hoveredRhythm.structure.split('>').map((part, i) => (
                                <span key={i} className="inline-block mr-1">
                                    {i > 0 && <span className="text-gray-600 mx-1">→</span>}
                                    <span className="text-white">{part.trim()}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Casos de Uso */}
                    <div>
                         <h4 className="text-xs uppercase tracking-widest text-green-400 font-bold mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Onde Usar (Use Cases)
                         </h4>
                         <ul className="grid grid-cols-1 gap-2">
                             {hoveredRhythm.useCases.split(',').map((useCase, i) => (
                                 <li key={i} className="flex items-start text-sm text-gray-400 gap-2">
                                     <span className="text-green-500 mt-1">•</span>
                                     {useCase.trim()}
                                 </li>
                             ))}
                         </ul>
                    </div>

                    {/* Dica de Ação */}
                    <div className="mt-8 pt-6 border-t border-dark-700 text-center">
                        <p className="text-xs text-gray-500 mb-2">Gostou deste estilo?</p>
                        <button 
                            onClick={() => {
                                onSelectRhythm(hoveredRhythm.name + ", " + hoveredRhythm.instruments);
                                onClose();
                            }}
                            className="w-full bg-suno-600 hover:bg-suno-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95"
                        >
                            Selecionar {hoveredRhythm.name}
                        </button>
                    </div>
                 </div>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-50 space-y-4">
                     <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                     <div>
                        <p className="text-lg font-medium">Passe o mouse sobre um ritmo</p>
                        <p className="text-sm">Veja detalhes, instrumentos e dicas de uso aqui.</p>
                     </div>
                 </div>
             )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default RhythmLibrary;
