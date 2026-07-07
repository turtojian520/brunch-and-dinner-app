import { createClient } from '@supabase/supabase-js';

// __SUPABASE_URL__ and __SUPABASE_ANON_KEY__ are injected at build time by Vite's `define`
// Falls back to import.meta.env for local dev compatibility
const SUPABASE_URL = __SUPABASE_URL__ || import.meta.env.VITE_SUPABASE_URL || import.meta.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = __SUPABASE_ANON_KEY__ || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase configuration missing. Set VITE_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL in your Vercel env.'
  );
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export default supabase;
