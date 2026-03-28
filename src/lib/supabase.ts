import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import { withBase } from './paths';

export const AUTH_RETURN_TO_KEY = 'farmerville-auth-return-to';

let browserClient: SupabaseClient | null | undefined;

function getEnv() {
  return {
    url: import.meta.env.PUBLIC_SUPABASE_URL,
    anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    authRedirectUrl: import.meta.env.PUBLIC_AUTH_REDIRECT_URL,
  };
}

export function getAuthCallbackUrl(origin = window.location.origin) {
  const { authRedirectUrl } = getEnv();
  const normalizedRedirectUrl = authRedirectUrl?.trim();

  if (normalizedRedirectUrl) {
    return normalizedRedirectUrl;
  }

  return new URL(withBase('/auth/callback/'), origin).toString();
}

export function getDefaultPostAuthUrl(origin = window.location.origin) {
  return new URL(withBase('/library/'), origin).toString();
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getEnv();

  return Boolean(url && anonKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    browserClient = null;
    return null;
  }

  if (browserClient !== undefined) {
    return browserClient;
  }

  const { url, anonKey } = getEnv();

  browserClient = createClient(url!, anonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });

  return browserClient;
}

export async function getCurrentUser() {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user ?? null;
}

export async function signInWithMagicLink(email: string, redirectTo: string) {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const client = getSupabaseClient();

  if (!client) {
    return;
  }

  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
  const client = getSupabaseClient();

  if (!client) {
    return () => {};
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session ?? null);
  });

  return () => subscription.unsubscribe();
}

export async function finishAuthFromUrl() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');

  if (!code) {
    return null;
  }

  const { data, error } = await client.auth.exchangeCodeForSession(code);

  if (error) {
    throw error;
  }

  return data.session;
}
