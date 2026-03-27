import { getCollection, type CollectionEntry } from 'astro:content';

export type DocEntry = CollectionEntry<'docs'>;

function sortByRecency(a: DocEntry, b: DocEntry) {
  const aDate = new Date(a.data.updatedAt ?? a.data.publishedAt).getTime();
  const bDate = new Date(b.data.updatedAt ?? b.data.publishedAt).getTime();

  return bDate - aDate;
}

export async function getPublishedDocs() {
  const docs = await getCollection('docs', ({ data }) => !data.draft);

  return docs
    .filter((entry) => entry.data.docType === 'pdf' && entry.data.pdfPath)
    .sort(sortByRecency);
}

export function getFeaturedDocs(entries: DocEntry[]) {
  return entries.filter((entry) => entry.data.featured);
}

export function getCategories(entries: DocEntry[]) {
  return [...new Set(entries.map((entry) => entry.data.category))].sort((a, b) =>
    a.localeCompare(b, 'zh-CN'),
  );
}

export function getTags(entries: DocEntry[]) {
  return [...new Set(entries.flatMap((entry) => entry.data.tags))].sort((a, b) =>
    a.localeCompare(b, 'zh-CN'),
  );
}
