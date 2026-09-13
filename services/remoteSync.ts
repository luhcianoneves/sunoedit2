import { SyncSettings } from '../types';

type CollectionName = 'album_plans' | 'series_presets';

function baseUrl(sync: SyncSettings): string {
  return sync.apiUrl.replace(/\/+$/, '');
}

export async function checkHealth(sync: SyncSettings): Promise<boolean> {
  const res = await fetch(`${baseUrl(sync)}/health`);
  return res.ok;
}

export async function fetchCollection<T>(sync: SyncSettings, name: CollectionName): Promise<T[]> {
  const res = await fetch(`${baseUrl(sync)}/api/collections/${name}`, {
    headers: { 'x-api-key': sync.apiKey },
  });
  if (!res.ok) {
    throw new Error(`Erro ao buscar "${name}" da nuvem (HTTP ${res.status}). Verifique URL e chave da API.`);
  }
  const json = await res.json();
  return json.data as T[];
}

export async function pushCollection<T>(sync: SyncSettings, name: CollectionName, data: T[]): Promise<void> {
  const res = await fetch(`${baseUrl(sync)}/api/collections/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-api-key': sync.apiKey },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    throw new Error(`Erro ao enviar "${name}" para a nuvem (HTTP ${res.status}). Verifique URL e chave da API.`);
  }
}
