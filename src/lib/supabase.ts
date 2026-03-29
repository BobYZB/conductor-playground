import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
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

  // createBrowserClient from @supabase/ssr internally forces:
  //   flowType: 'pkce', detectSessionInUrl: true, persistSession: true
  // so there is no need (or way) to override them here.
  browserClient = createBrowserClient(url!, anonKey!);

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

export function onAuthStateChange(callback: (user: User | null, session: Session | null, event?: string) => void) {
  const client = getSupabaseClient();

  if (!client) {
    return () => {};
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, session ?? null, event);
  });

  return () => subscription.unsubscribe();
}

/**
 * Wait for the SDK to automatically complete the PKCE exchange when
 * `detectSessionInUrl` is enabled (the default for createBrowserClient).
 * Resolves with the session once a SIGNED_IN event fires, or rejects on
 * timeout / if the URL contains no auth code.
 */
export function waitForAuthCallback(timeoutMs = 10_000): Promise<Session> {
  const client = getSupabaseClient();

  if (!client) {
    return Promise.reject(new Error('Supabase is not configured.'));
  }

  const url = new URL(window.location.href);

  if (!url.searchParams.get('code')) {
    return Promise.reject(new Error('URL 中未找到授权码。'));
  }

  return new Promise<Session>((resolve, reject) => {
    let settled = false;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (settled) {
        return;
      }

      // SIGNED_IN fires when the SDK exchanges the code in real-time.
      // INITIAL_SESSION fires immediately on subscribe — if the SDK already
      // completed the PKCE exchange before we registered this listener,
      // the session will be present here.
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        settled = true;
        subscription.unsubscribe();
        resolve(session);
      }
    });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        subscription.unsubscribe();
        reject(new Error('登录超时，请重试。'));
      }
    }, timeoutMs);
  });
}
