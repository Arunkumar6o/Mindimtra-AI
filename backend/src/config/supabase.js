import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

let supabaseClient = null;
let supabaseAdminClient = null;

if (config.supabase.url && config.supabase.anonKey) {
  supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);
}

if (config.supabase.url && config.supabase.serviceRoleKey) {
  supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export { supabaseClient, supabaseAdminClient };

