import { CoverPromptFields } from '../types';

/**
 * Monta o prompt de capa a partir da fórmula fotográfica fixa usada pela Good Shepherd Studios:
 * fotografia ultra realista, cinematográfica, 85mm, com espaço reservado para título.
 * Função pura e determinística — garante consistência visual entre volumes de uma mesma série
 * sem depender da IA "inventar" a fórmula do zero a cada geração.
 */
export function buildCoverPrompt(fields: CoverPromptFields): string {
  const aspect = fields.aspectFormat?.trim() || 'square format';
  return (
    `Ultra realistic photograph, cinematic lighting, shot on 85mm lens, shallow depth of field, ` +
    `film grain texture. A Black ${fields.gender} in ${fields.ageRange}, ${fields.expressionAction}, ` +
    `${fields.wardrobeProp}, ${fields.setting}. ${fields.colorPalette}, ${fields.mood}. ` +
    `Album cover composition, ${aspect}, title space at top reserved.`
  );
}
