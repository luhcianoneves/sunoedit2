import { AlbumPlan } from '../types';

const norm = (s: string) => s.trim().toLowerCase();

/** Conta em quantos OUTROS álbuns do catálogo o mesmo nome de faixa já aparece (duplicidade literal de título). */
export function countTrackNameElsewhere(albumPlans: AlbumPlan[], currentPlanId: string, trackName: string): number {
  const target = norm(trackName);
  if (!target) return 0;
  let count = 0;
  albumPlans.forEach(plan => {
    if (plan.id === currentPlanId) return;
    plan.tracks.forEach(t => { if (norm(t.name) === target) count++; });
  });
  return count;
}

/** Conta em quantos OUTROS álbuns do catálogo o mesmo hino/tema de referência já foi usado (informativo, reuso é esperado). */
export function countHymnReferenceElsewhere(albumPlans: AlbumPlan[], currentPlanId: string, referenceHymn: string): number {
  const target = norm(referenceHymn);
  if (!target) return 0;
  let count = 0;
  albumPlans.forEach(plan => {
    if (plan.id === currentPlanId) return;
    plan.tracks.forEach(t => { if (norm(t.referenceHymn) === target) count++; });
  });
  return count;
}
