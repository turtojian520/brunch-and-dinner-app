import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // loadEnv reads .env files from disk (for local dev)
  const envFile = loadEnv(mode, process.cwd(), '');

  // process.env has Vercel-injected vars at build time; .env has local vars
  const SUPABASE_URL =
    process.env.VITE_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL ||
    envFile.VITE_SUPABASE_URL || envFile.EXPO_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    envFile.VITE_SUPABASE_ANON_KEY || envFile.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  console.log('[vite] Supabase URL:', SUPABASE_URL ? '✅ ' + SUPABASE_URL.substring(0, 45) + '...' : '❌ NOT SET');
  console.log('[vite] Supabase Anon Key:', SUPABASE_ANON_KEY ? '✅ present' : '❌ NOT SET');

  return {
    plugins: [react()],
    define: {
      // Inject directly into client bundle via string substitution at build time
      __SUPABASE_URL__: JSON.stringify(SUPABASE_URL),
      __SUPABASE_ANON_KEY__: JSON.stringify(SUPABASE_ANON_KEY),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 3000,
    },
  };
});
