/** Incrementa o último número encontrado no rótulo de volume (ex: "Vol. 6" -> "Vol. 7"). */
export function incrementVolumeLabel(label: string): string {
  const match = label.match(/(\d+)(?!.*\d)/);
  if (!match) {
    return label.trim() ? `${label.trim()} — Próximo Volume` : 'Vol. 2';
  }
  const num = parseInt(match[1], 10) + 1;
  const start = match.index ?? 0;
  return label.slice(0, start) + num + label.slice(start + match[1].length);
}
