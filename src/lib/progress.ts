import { getSupabaseClient } from './supabase';

export interface ReadingProgress {
  docSlug: string;
  lastPage: number;
  updatedAt: string;
}

interface ReadingProgressRow {
  doc_slug: string;
  last_page: number;
  updated_at: string;
}

export async function getReadingProgress(docSlug: string): Promise<ReadingProgress | null> {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await client
    .from('reading_progress')
    .select('doc_slug, last_page, updated_at')
    .eq('doc_slug', docSlug)
    .maybeSingle<ReadingProgressRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    docSlug: data.doc_slug,
    lastPage: data.last_page,
    updatedAt: data.updated_at,
  };
}

export async function upsertReadingProgress(docSlug: string, lastPage: number) {
  const client = getSupabaseClient();

  if (!client) {
    return;
  }

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return;
  }

  const { error } = await client.from('reading_progress').upsert(
    {
      user_id: user.id,
      doc_slug: docSlug,
      last_page: lastPage,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,doc_slug',
    },
  );

  if (error) {
    throw error;
  }
}
