import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { communityApi, type CommunityTopicListItem, type CommunityTag, type PaginatedResponse } from '../../services/communityApi';
import { TopicListItem } from '../../components/community/TopicListItem';
import { Pagination } from '../../components/community/Pagination';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';

/**
 * Tag page — lists topics by tag. URL: /community/tags/:tag
 * Public read.
 */
export function TagPage() {
  const { tag: tagSlug } = useParams<{ tag: string }>();
  const { t } = useTranslation();
  const [tag, setTag] = useState<CommunityTag | null>(null);
  const [topics, setTopics] = useState<PaginatedResponse<CommunityTopicListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async (p: number) => {
    if (!tagSlug) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch tags list to find this tag (API returns tag info in the response)
      const data = await communityApi.getTopicsByTag(tagSlug, p, 20);
      setTopics(data);
      // The response includes tag info at the top level
      setTag((data as any).tag || null);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? 'not_found' : 'error');
    } finally {
      setLoading(false);
    }
  }, [tagSlug]);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  if (loading) return <CommunitySkeleton />;

  if (error === 'not_found') {
    return <CommunityEmptyState message={t('community.empty.tagNotFound', { defaultValue: 'Tag not found.' })} icon="🏷️" />;
  }
  if (error) {
    return <CommunityEmptyState message={t('community.errors.loadFailed')} icon="⚠️" />;
  }

  return (
    <>
      <Helmet>
        <title>#{tag?.name || tagSlug} | {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
      </Helmet>

      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/community" className="hover:text-[#5aab87]">
            {t('community.hub.title', { defaultValue: 'Community' })}
          </Link>
          <span>/</span>
          <span className="text-gray-600">#{tag?.name || tagSlug}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          #{tag?.name || tagSlug}
        </h1>
        {tag && (
          <p className="text-gray-500 text-sm mt-0.5">
            {tag.topicCount} {t('community.stats.topics', { defaultValue: 'topics' })}
          </p>
        )}
      </div>

      {topics && topics.data.length > 0 ? (
        <div className="space-y-3">
          {topics.data.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
          <Pagination
            page={page}
            totalPages={topics.pagination.totalPages}
            onPageChange={(p) => { setPage(p); fetchData(p); }}
          />
        </div>
      ) : (
        <CommunityEmptyState
          message={t('community.empty.noTopicsTag', { defaultValue: 'No topics with this tag yet.' })}
          icon="🏷️"
        />
      )}
    </>
  );
}
