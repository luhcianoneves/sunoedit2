import { AlbumPlan } from '../types';

/** Checklist de execução por lançamento (Parte 1.3 do plano) — offset em dias a partir do lançamento (D0). */
const CHECKLIST_STAGES: { offsetDays: number; title: string; description: string }[] = [
  { offsetDays: -10, title: 'Produção do álbum', description: 'Gerar as faixas com IA (música + voz + mixagem), revisar áudio básico.' },
  { offsetDays: -9, title: 'Capa e arte', description: 'Gerar a capa via Flow usando o prompt correspondente.' },
  { offsetDays: -8, title: 'Metadados', description: 'Título padronizado, descrição, créditos, gênero corretos no Symphonic.' },
  { offsetDays: -7, title: 'Envio para distribuição', description: 'Subir no Symphonic com folga mínima de 5-7 dias antes do lançamento.' },
  { offsetDays: -6, title: 'Pitch para playlists', description: 'Preencher o formulário de pitch no Spotify for Artists.' },
  { offsetDays: -3, title: 'Cortar clipes curtos', description: '2-3 vídeos de 15-30s para Reels/TikTok/Shorts.' },
  { offsetDays: -1, title: 'Agendar posts', description: 'Programar 1 post de anúncio + 2 clipes nos primeiros dias (D-1 a D+3).' },
  { offsetDays: 0, title: 'Dia do lançamento', description: 'Compartilhar em todos os canais; atualizar playlist própria.' },
  { offsetDays: 3, title: 'Acompanhamento (D+3)', description: 'Checar streams; cortar mais clipes se performar bem.' },
  { offsetDays: 7, title: 'Acompanhamento (D+7)', description: 'Checar streams; cortar mais clipes se performar bem.' },
];

function addDays(dateStr: string, days: number): Date {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d;
}

function toICSDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function escapeICSText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Gera um .ics com os eventos do checklist D-10 -> D+7, importável em Google Calendar, Outlook, Apple Calendar. */
export function exportReleaseChecklistICS(plan: AlbumPlan) {
  if (!plan.distribution?.releaseDate) {
    throw new Error('Defina a data de lançamento nos Metadados de Distribuição antes de exportar o cronograma.');
  }

  const releaseLabel = `${plan.title} ${plan.volumeLabel}`.trim();
  const stamp = toICSDate(new Date()) + 'T000000Z';

  const events = CHECKLIST_STAGES.map((stage, i) => {
    const eventDate = addDays(plan.distribution!.releaseDate, stage.offsetDays);
    const dateStr = toICSDate(eventDate);
    const nextDay = toICSDate(addDays(plan.distribution!.releaseDate, stage.offsetDays + 1));
    return [
      'BEGIN:VEVENT',
      `UID:${plan.id}-stage-${i}@suno-architect`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${nextDay}`,
      `SUMMARY:${escapeICSText(`${stage.title} — ${releaseLabel}`)}`,
      `DESCRIPTION:${escapeICSText(stage.description)}`,
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Suno Architect//Good Shepherd Studios//PT',
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Cronograma_${releaseLabel.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
