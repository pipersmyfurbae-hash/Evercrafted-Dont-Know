import { createClient } from '@supabase/supabase-js';

// Same env/process.env dual-read pattern the old lib/firebase.ts used, so
// this module works both under Vite (browser) and plain Node/tsx (test
// scripts), where import.meta.env is never populated.
function envVar(name: string): string | undefined {
  return (import.meta as { env?: Record<string, string> }).env?.[name] ?? process.env[name];
}

// Fallback values are the project URL and anon/publishable key for the
// "Final EcoSystem" Supabase project — not secret, safe to ship in the
// client bundle (see .env.example), and kept here so a fresh deploy works
// before env vars are configured on the hosting platform. Real env vars
// still take precedence when set.
const supabaseUrl = envVar('VITE_SUPABASE_URL') || 'https://kxkvsrwpezusqvriftqv.supabase.co';
const supabaseAnonKey = envVar('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_jT7UCGSoRXIAkAh73DZoSg_vjbVbc_5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
