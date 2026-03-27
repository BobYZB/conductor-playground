import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { formatDate } from '../lib/format';
import { withBase } from '../lib/paths';

interface DocSummary {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  updatedAt: string;
}

interface DocFiltersProps {
  docs: DocSummary[];
  categories: string[];
  tags: string[];
}

function readFiltersFromLocation() {
  if (typeof window === 'undefined') {
    return {
      query: '',
      category: '全部',
      tag: '全部',
    };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    query: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '全部',
    tag: searchParams.get('tag') ?? '全部',
  };
}

export default function DocFilters({ docs, categories, tags }: DocFiltersProps) {
  const initialFilters = readFiltersFromLocation();
  const [query, setQuery] = useState(initialFilters.query);
  const [category, setCategory] = useState(initialFilters.category);
  const [tag, setTag] = useState(initialFilters.tag);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const searchParams = new URLSearchParams();

    if (query.trim()) {
      searchParams.set('q', query.trim());
    }

    if (category !== '全部') {
      searchParams.set('category', category);
    }

    if (tag !== '全部') {
      searchParams.set('tag', tag);
    }

    const nextSearch = searchParams.toString();
    const nextUrl = nextSearch
      ? `${window.location.pathname}?${nextSearch}`
      : window.location.pathname;

    window.history.replaceState({}, '', nextUrl);
  }, [category, query, tag]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredDocs = docs.filter((doc) => {
    const matchesQuery =
      !normalizedQuery ||
      doc.title.toLowerCase().includes(normalizedQuery) ||
      doc.summary.toLowerCase().includes(normalizedQuery);
    const matchesCategory = category === '全部' || doc.category === category;
    const matchesTag = tag === '全部' || doc.tags.includes(tag);

    return matchesQuery && matchesCategory && matchesTag;
  });

  return (
    <div className="library-shell">
      <div className="filter-panel">
        <label className="filter-field">
          <span>标题或摘要</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const nextValue = event.target.value;
              startTransition(() => setQuery(nextValue));
            }}
            placeholder="例如：示例、合同、手册"
          />
        </label>

        <label className="filter-field">
          <span>分类</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="全部">全部</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>标签</span>
          <select value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="全部">全部</option>
            {tags.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="library-summary">共找到 {filteredDocs.length} 份文档。</p>

      {filteredDocs.length > 0 ? (
        <div className="library-grid">
          {filteredDocs.map((doc) => (
            <article className="library-card" key={doc.slug}>
              <div className="library-card__cover">
                <span>{doc.category}</span>
              </div>
              <div className="library-card__body">
                <p className="doc-card__eyebrow">{doc.category}</p>
                <h3>
                  <a href={withBase(`/docs/${doc.slug}/`)}>{doc.title}</a>
                </h3>
                <p>{doc.summary}</p>
                <div className="tag-row">
                  {doc.tags.map((item) => (
                    <span className="tag-chip" key={`${doc.slug}-${item}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <footer className="doc-card__meta">
                <span>更新于 {formatDate(doc.updatedAt)}</span>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>没有匹配结果</h2>
          <p>可以尝试清空筛选条件，或换一个更宽松的关键词。</p>
        </div>
      )}
    </div>
  );
}
