import { useEffect, useState } from 'react';

/** Generaliza o padrão try/catch de leitura/escrita em localStorage já usado nas Settings do App.tsx. */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage indisponível (modo privado, quota excedida etc.) — falha silenciosa
    }
  }, [key, value]);

  return [value, setValue];
}
