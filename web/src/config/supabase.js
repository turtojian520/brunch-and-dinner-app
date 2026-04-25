import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL as ENV_SUPABASE_URL,
  SUPABASE_ANON_KEY as ENV_SUPABASE_ANON_KEY,
} from '@env';

// Prefer EXPO_PUBLIC_* (Expo bakes these into the bundle from the build-time
// environment, including Vercel project Environment Variables). Fall back to
// the @env values produced by react-native-dotenv for local dev.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || ENV_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ENV_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase configuration missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (Vercel) or SUPABASE_URL and SUPABASE_ANON_KEY (.env).'
  );
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export default supabase;
