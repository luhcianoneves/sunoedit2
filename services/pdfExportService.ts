import { jsPDF } from "jspdf";
import { AlbumPlan, GeneratedAlbumResult, GeneratorFormData, Song } from "../types";

/** Export do modo Rápido — lógica idêntica ao handleExportPDF original do App.tsx. */
export function exportQuickPDF(formData: GeneratorFormData, songs: Song[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - (margin * 2);

  // CAPA
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("SUNO ARCHITECT", pageWidth / 2, 100, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(`Tema: ${formData.topic.substring(0, 40)}...`, pageWidth / 2, 120, { align: "center" });
  doc.text(`Ritmo: ${formData.rhythm}`, pageWidth / 2, 130, { align: "center" });
  doc.text(`Modo: ${formData.mode === 'full' ? 'Canção Completa' : 'Instrumental'}`, pageWidth / 2, 140, { align: "center" });

  doc.setFontSize(10);
  doc.text("Gerado por IA", pageWidth / 2, 280, { align: "center" });

  // PÁGINAS DAS MÚSICAS
  songs.forEach((song, index) => {
    doc.addPage();
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`#${index + 1} - ${song.title}`, margin, 30);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Prompt de Estilo (Suno):", margin, 45);

    doc.setFont("courier", "normal");
    doc.setTextColor(76, 29, 149);
    const splitPrompt = doc.splitTextToSize(song.stylePrompt, maxLineWidth);
    doc.text(splitPrompt, margin, 52);

    const isInstrumental = !song.lyrics || song.lyrics.includes('[Instrumental]');
    if (!isInstrumental) {
      const promptHeight = splitPrompt.length * 5;
      const lyricsStartY = 60 + promptHeight;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Letra:", margin, lyricsStartY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const splitLyrics = doc.splitTextToSize(song.lyrics!, maxLineWidth);
      doc.text(splitLyrics, margin, lyricsStartY + 8);
    } else {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("[Faixa Instrumental]", margin, 80);
    }
  });

  doc.save("Suno_Architect_Roteiro.pdf");
}

const PAGE_BOTTOM_LIMIT = 275;

function addTableCellsRow(doc: jsPDF, margin: number, y: number, colWidths: number[], cells: string[]): number {
  const lines = cells.map((c, i) => doc.splitTextToSize(c || '-', colWidths[i] - 4));
  const rowHeight = Math.max(...lines.map(l => l.length)) * 5 + 4;

  let x = margin;
  lines.forEach((cellLines, i) => {
    doc.text(cellLines, x + 2, y + 5);
    x += colWidths[i];
  });

  return y + rowHeight;
}

function addTracklistPage(doc: jsPDF, albumPlan: AlbumPlan) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const colWidths = [10, 40, 15, 45, 40, 40]; // #, Faixa, BPM, Estilo, Hino, Nota

  doc.addPage();
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Tracklist", margin, 20);

  let y = 32;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 7, 'F');
  y = addTableCellsRow(doc, margin, y - 5, colWidths, ["#", "Faixa", "BPM", "Estilo/Instrumentação", "Hino de Referência", "Nota de Produção"]);

  doc.setFont("helvetica", "normal");
  albumPlan.tracks.forEach((track, i) => {
    if (y > PAGE_BOTTOM_LIMIT) {
      doc.addPage();
      y = 20;
    }
    y = addTableCellsRow(doc, margin, y, colWidths, [
      String(i + 1),
      track.name,
      track.bpm,
      track.styleInstrumentation,
      track.referenceHymn,
      track.productionNote,
    ]);
  });
}

/** Export do Planejador de Álbum — capa com identidade da série, tracklist estruturada, e páginas por faixa. */
export function exportAlbumPDF(albumPlan: AlbumPlan, result: GeneratedAlbumResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - (margin * 2);

  // CAPA
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(albumPlan.title, pageWidth / 2, 90, { align: "center", maxWidth: pageWidth - 40 });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(albumPlan.volumeLabel, pageWidth / 2, 105, { align: "center" });
  doc.text(`Idioma: ${albumPlan.language.toUpperCase()} · ${albumPlan.tracks.length} faixas`, pageWidth / 2, 120, { align: "center" });

  doc.setFontSize(10);
  doc.text("Good Shepherd Studios · Gerado por IA", pageWidth / 2, 280, { align: "center" });

  // TRACKLIST
  addTracklistPage(doc, albumPlan);

  // PÁGINAS DAS FAIXAS GERADAS
  const trackById = new Map(albumPlan.tracks.map(t => [t.id, t]));
  result.songs
    .slice()
    .sort((a, b) => a.trackIndex - b.trackIndex)
    .forEach((song) => {
      const trackPlan = trackById.get(song.trackPlanId);
      doc.addPage();
      doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(`#${song.trackIndex + 1} - ${song.title}`, margin, 28);

      if (trackPlan) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text(`BPM ${trackPlan.bpm || '-'} · Ref: ${trackPlan.referenceHymn || '-'}`, margin, 36);
      }

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Prompt de Estilo (Suno):", margin, 46);

      doc.setFont("courier", "normal");
      doc.setTextColor(76, 29, 149);
      const splitPrompt = doc.splitTextToSize(song.stylePrompt, maxLineWidth);
      doc.text(splitPrompt, margin, 53);

      const isInstrumental = !song.lyrics || song.lyrics.includes('[Instrumental]');
      if (!isInstrumental) {
        const promptHeight = splitPrompt.length * 5;
        const lyricsStartY = 61 + promptHeight;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Letra:", margin, lyricsStartY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const splitLyrics = doc.splitTextToSize(song.lyrics!, maxLineWidth);
        doc.text(splitLyrics, margin, lyricsStartY + 8);
      } else {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("[Faixa Instrumental]", margin, 80);
      }
    });

  // CAPAS DE ÁLBUM
  if (result.albumCoverPrompts.length > 0) {
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Prompts de Capa", margin, 25);

    let y = 40;
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    result.albumCoverPrompts.forEach((prompt, i) => {
      if (y > PAGE_BOTTOM_LIMIT) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(76, 29, 149);
      const split = doc.splitTextToSize(`OPÇÃO ${i + 1}: ${prompt}`, maxLineWidth);
      doc.text(split, margin, y);
      y += split.length * 5 + 8;
    });
  }

  const safeTitle = albumPlan.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
  doc.save(`${safeTitle}_${albumPlan.volumeLabel.replace(/[^a-z0-9]+/gi, '_')}.pdf`);
}
