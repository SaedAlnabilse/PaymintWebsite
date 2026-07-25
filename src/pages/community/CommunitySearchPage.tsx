import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { communityApi, type CommunityTopicListItem, type PaginatedResponse } from '../../services/communityApi';
import { TopicListItem } from '../../components/community/TopicListItem';
import { Pagination } from '../../components/community/Pagination';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';

/**
 * Community search page — full-text search with filters.
 * URL: /community/search?q=...&category=...&tag=...&sort=...
 * Public read.
 */
export function CommunitySearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<PaginatedResponse<CommunityTopicListItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('relevance');

  const doSearch = useCallback(async (q: string, p: number, s: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await communityApi.search({
        query: q,
        category: searchParams.get('category') || undefined,
        tag: searchParams.get('tag') || undefined,
        sort: s,
        page: p,
        limit: 20,
      });
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    setInputValue(query);
    setPage(1);
    if (query) {
      doSearch(query, 1, sort);
    }
  }, [query, doSearch, sort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (inputValue.trim()) {
      params.set('q', inputValue.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const sortOptions = [
    { value: 'relevance', label: t('community.sort.relevance', { defaultValue: 'Relevance' }) },
    { value: 'newest', label: t('community.sort.newest', { defaultValue: 'Newest' }) },
    { value: 'top', label: t('community.sort.top', { defaultValue: 'Most Voted' }) },
  ];

  return (
    <>
      <Helmet>
        <title>{query ? `${t('community.search.title', { defaultValue: 'Search' })}: ${query}` : t('community.search.title', { defaultValue: 'Search' })} | {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('community.search.title', { defaultValue: 'Search' })}
        </h1>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('community.search.placeholder', { defaultValue: 'Search topics...' })}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7dc6a2]/40 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-2 bg-[#7dc6a2] text-white rounded-xl hover:bg-[#6bb892] transition-colors font-medium"
          >
            {t('community.search.button', { defaultValue: 'Search' })}
          </button>
        </form>
      </div>

      {/* Sort bar (only when results exist) */}
      {results && results.data.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
                sort === opt.value
                  ? 'bg-[#7dc6a2] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-gray-200 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : results && results.data.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">
            {results.pagination.total} {t('community.search.resultsFound', { defaultValue: 'results found' })}
          </p>
          {results.data.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
          <Pagination
            page={page}
            totalPages={results.pagination.totalPages}
            onPageChange={(p) => { setPage(p); doSearch(query, p, sort); }}
          />
        </div>
      ) : searched && query ? (
        <CommunityEmptyState
          message={t('community.empty.noSearchResults', { defaultValue: 'No results found. Try different keywords.' })}
          icon="🔍"
        />
      ) : (
        <CommunityEmptyState
          message={t('community.search.startTyping', { defaultValue: 'Start typing to search the community.' })}
          icon="💬"
        />
      )}
    </>
  );
}
