import { useEffect } from 'react';
import {
  AUTH_RETURN_TO_KEY,
  finishAuthFromUrl,
  getDefaultPostAuthUrl,
  isSupabaseConfigured,
} from '../lib/supabase';
import { withBase } from '../lib/paths';

const AUTH_QUERY_PARAMS = ['code', 'error', 'error_code', 'error_description'];

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

function stripAuthQuery(urlString: string) {
  const url = new URL(urlString);

  for (const key of AUTH_QUERY_PARAMS) {
    url.searchParams.delete(key);
  }

  return url.toString();
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

    if (normalizePathname(url.pathname) === normalizePathname(withBase('/auth/callback/'))) {
      return;
    }

    let active = true;

    async function completeAuth() {
      try {
        await finishAuthFromUrl();

        if (!active) {
          return;
        }

        const nextLocation = window.localStorage.getItem(AUTH_RETURN_TO_KEY) ?? stripAuthQuery(window.location.href);

        window.localStorage.removeItem(AUTH_RETURN_TO_KEY);
        window.location.replace(nextLocation || getDefaultPostAuthUrl());
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
