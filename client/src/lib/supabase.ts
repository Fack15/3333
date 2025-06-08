import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;
let configPromise: Promise<any> | null = null;

const getSupabaseConfig = async () => {
  if (!configPromise) {
    configPromise = fetch('/api/config').then(res => res.json());
  }
  return configPromise;
};

export const getSupabase = async (): Promise<SupabaseClient> => {
  if (!supabaseInstance) {
    const config = await getSupabaseConfig();
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
};

// Export a promise-based client for immediate use
export const supabase = (async () => {
  return await getSupabase();
})();

export type { User } from '@supabase/supabase-js'