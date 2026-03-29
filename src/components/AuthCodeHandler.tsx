import { useEffect } from 'react';
import {
  AUTH_RETURN_TO_KEY,
  getDefaultPostAuthUrl,
  isSupabaseConfigured,
  waitForAuthCallback,
} from '../lib/supabase';
import { withBase } from '../lib/paths';

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

export default function AuthCodeHandler() {
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    if (!code) {
      return;
    }

    // If we're on the dedicated callback page, let AuthCallback handle it.
    if (normalizePathname(url.pathname) === normalizePathname(withBase('/auth/callback/'))) {
      return;
    }

    let active = true;

    async function completeAuth() {
      try {
        // SDK auto-detects the code in the URL and exchanges it via PKCE.
        // We just wait for the SIGNED_IN event.
        await waitForAuthCallback();

        if (!active) {
          return;
        }

        const nextLocation = window.localStorage.getItem(AUTH_RETURN_TO_KEY) ?? window.location.href;

        // Strip auth query params from the URL before navigating.
        const cleanUrl = new URL(nextLocation);
        for (const key of ['code', 'error', 'error_code', 'error_description']) {
          cleanUrl.searchParams.delete(key);
        }

        window.localStorage.removeItem(AUTH_RETURN_TO_KEY);
        window.location.replace(cleanUrl.toString() || getDefaultPostAuthUrl());
      } catch (error) {
        console.error('Failed to complete auth from current page.', error);
      }
    }

    void completeAuth();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
