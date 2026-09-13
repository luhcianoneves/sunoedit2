import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Isso permite que o código use process.env.API_KEY mesmo no navegador,
      // pegando o valor das variáveis de ambiente do Vercel.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});