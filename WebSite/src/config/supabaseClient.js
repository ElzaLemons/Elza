const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(
  /^https:\/\/[^\s]+\.supabase\.co$/.test(SUPABASE_URL)
  && SUPABASE_ANON_KEY
  && !SUPABASE_ANON_KEY.includes('sua-chave-anon')
);

let clientPromise;

export async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  clientPromise ||= import('@supabase/supabase-js').then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  return clientPromise;
}
