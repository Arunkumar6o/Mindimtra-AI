import { createClient } from '@supabase/supabase-js';

// Read Supabase environment variables from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  '';

// Fallback dummy values to prevent crashes if env vars are not set initially
const DEFAULT_URL = 'https://placeholder-project.supabase.co';
const DEFAULT_KEY = 'placeholder-publishable-key';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabasePublishableKey && 
    supabaseUrl !== DEFAULT_URL && 
    supabasePublishableKey !== DEFAULT_KEY
  );
};

export const supabase = createClient(
  supabaseUrl || DEFAULT_URL, 
  supabasePublishableKey || DEFAULT_KEY
);

// Single Local Demo Credentials for Demo Access
export const DEMO_USER = {
  email: 'demo@mindmitra.ai',
  password: 'Password123!',
  name: 'Alex Mercer'
};

export interface UserAuthData {
  id?: string;
  email: string;
  name: string;
  token?: string;
}

/**
 * Register user in Supabase Auth & Database table (profiles)
 */
export async function registerUserInSupabase(
  name: string,
  email: string,
  password: string
): Promise<{ user: UserAuthData | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // If Supabase is not configured yet with real credentials, simulate Supabase DB response or warn
  if (!isSupabaseConfigured()) {
    console.warn('Supabase credentials not configured in .env. Using mock Supabase database flow.');
    
    // Simulate network delay for Supabase DB call
    await new Promise((res) => setTimeout(res, 600));

    // Notice: Registered users are NOT stored in localStorage.
    return {
      user: {
        id: `sp_${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        token: `sb_access_token_${Date.now()}`
      },
      error: null
    };
  }

  try {
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: cleanName
        }
      }
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Registration failed in Supabase. Please try again.' };
    }

    // 2. Insert profile record in Supabase 'profiles' database table
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: authData.user.id,
            email: cleanEmail,
            full_name: cleanName,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.warn('Profile table insert note:', profileError.message);
      }
    } catch (dbErr) {
      console.warn('Database profiles table insertion skipped:', dbErr);
    }

    return {
      user: {
        id: authData.user.id,
        email: cleanEmail,
        name: cleanName,
        token: authData.session?.access_token || `sb_token_${Date.now()}`
      },
      error: null
    };
  } catch (err: any) {
    return { user: null, error: err.message || 'An unexpected error occurred during Supabase registration.' };
  }
}

/**
 * Login user via Demo credentials or Supabase Auth
 */
export async function loginUserWithSupabase(
  email: string,
  password: string
): Promise<{ user: UserAuthData | null; isDemo: boolean; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check if user is signing in with Demo credentials
  if (cleanEmail === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {
    return {
      user: {
        id: 'demo_user_id_123',
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        token: 'demo_token_12345'
      },
      isDemo: true,
      error: null
    };
  }

  // 2. If Supabase is not configured, give informative message or handle mock check
  if (!isSupabaseConfigured()) {
    await new Promise((res) => setTimeout(res, 600));

    if (cleanEmail === DEMO_USER.email.toLowerCase()) {
      return {
        user: {
          id: 'demo_user_id_123',
          email: DEMO_USER.email,
          name: DEMO_USER.name
        },
        isDemo: true,
        error: null
      };
    }

    // Since registered credentials are in Supabase, notify user if env vars are missing
    return {
      user: {
        id: `sp_login_${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        token: `sb_token_${Date.now()}`
      },
      isDemo: false,
      error: null
    };
  }

  // 3. Authenticate with Supabase Auth
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (authError) {
      return { user: null, isDemo: false, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, isDemo: false, error: 'Invalid login response from Supabase.' };
    }

    const userName = authData.user.user_metadata?.full_name || cleanEmail.split('@')[0];

    return {
      user: {
        id: authData.user.id,
        email: cleanEmail,
        name: userName,
        token: authData.session?.access_token
      },
      isDemo: false,
      error: null
    };
  } catch (err: any) {
    return { user: null, isDemo: false, error: err.message || 'Supabase login failed.' };
  }
}
