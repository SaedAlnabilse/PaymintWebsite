import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  communityApi,
  type CommunityCategory,
  type CommunityTopicListItem,
  type PaginatedResponse,
} from '../../services/communityApi';
import { TopicListItem } from '../../components/community/TopicListItem';
import { Pagination } from '../../components/community/Pagination';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';

/**
 * Category page — lists topics in a category with sort + pagination.
 * Public read. URL: /community/c/:categorySlug
 */
export function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState<CommunityCategory | null>(null);
  const [topics, setTopics] = useState<PaginatedResponse<CommunityTopicListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('latest');

  const fetchData = useCallback(async (p: number, s: string) => {
    if (!categorySlug) return;
    setLoading(true);
    setError(null);
    try {
      const [cat, topicData] = await Promise.all([
        communityApi.getCategory(categorySlug),
        communityApi.getTopics({ category: categorySlug, page: p, limit: 20, sort: s }),
      ]);
      setCategory(cat);
      setTopics(topicData);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? 'not_found' : 'error');
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    setPage(1);
    fetchData(1, sort);
  }, [fetchData, sort]);

  if (loading) return <CommunitySkeleton />;

  if (error === 'not_found' || !category) {
    return <CommunityEmptyState message={t('community.empty.categoryNotFound', { defaultValue: 'Category not found.' })} icon="🔍" />;
  }
  if (error) {
    return <CommunityEmptyState message={t('community.errors.loadFailed')} icon="⚠️" />;
  }

  const sortOptions = [
    { value: 'latest', label: t('community.sort.latest', { defaultValue: 'Latest' }) },
    { value: 'top', label: t('community.sort.top', { defaultValue: 'Top' }) },
    { value: 'trending', label: t('community.sort.trending', { defaultValue: 'Trending' }) },
  ];

  return (
    <>
      <Helmet>
        <title>{category.name} | {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
        <meta name="description" content={category.description || category.name} />
        <link rel="canonical" href={`/community/c/${category.slug}`} />
      </Helmet>

      {/* Category header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/community" className="hover:text-[#5aab87]">
            {t('community.hub.title', { defaultValue: 'Community' })}
          </Link>
          <span>/</span>
          <span className="text-gray-600">{category.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            {category.description && (
              <p className="text-gray-500 text-sm mt-0.5">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sort bar */}
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

      {/* Topics */}
      {topics && topics.data.length > 0 ? (
        <div className="space-y-3">
          {topics.data.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
          <Pagination
            page={page}
            totalPages={topics.pagination.totalPages}
            onPageChange={(p) => { setPage(p); fetchData(p, sort); }}
          />
        </div>
      ) : (
        <CommunityEmptyState
          message={t('community.empty.noTopics', { defaultValue: 'No topics yet. Be the first to start a discussion!' })}
          icon="📝"
        />
      )}
    </>
  );
}
