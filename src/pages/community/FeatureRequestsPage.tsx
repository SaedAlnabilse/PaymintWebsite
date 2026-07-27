import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { communityApi, type CommunityTopicListItem, type PaginatedResponse } from '../../services/communityApi';
import { TopicListItem } from '../../components/community/TopicListItem';
import { Pagination } from '../../components/community/Pagination';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';

const STATUS_COLUMNS = [
  'OPEN',
  'UNDER_REVIEW',
  'PLANNED',
  'IN_PROGRESS',
  'SHIPPED',
  'DECLINED',
] as const;

/**
 * Feature-request board — status columns with topics sorted by upvotes.
 * URL: /community/feature-requests
 * Public read.
 */
export function FeatureRequestsPage() {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [results, setResults] = useState<PaginatedResponse<CommunityTopicListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async (status: string | null, p: number) => {
    setLoading(true);
    try {
      const data = await communityApi.getFeatureRequests({
        status: status || undefined,
        page: p,
        limit: 20,
      });
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchData(activeStatus, 1);
  }, [activeStatus, fetchData]);

  return (
    <>
      <Helmet>
        <title>{t('community.featureRequests.title', { defaultValue: 'Feature Requests' })} | {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
        <meta name="description" content={t('community.featureRequests.description', { defaultValue: 'Suggest new features and vote on what matters most.' })} />
        <link rel="canonical" href="/community/feature-requests" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('community.featureRequests.title', { defaultValue: 'Feature Requests' })}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {t('community.featureRequests.description', { defaultValue: 'Suggest new features and vote on what matters most.' })}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveStatus(null)}
          className={`px-3 py-1.5 text-sm rounded-xl whitespace-nowrap transition-colors ${
            !activeStatus
              ? 'bg-[#7dc6a2] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('community.featureRequests.all', { defaultValue: 'All' })}
        </button>
        {STATUS_COLUMNS.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-3 py-1.5 text-sm rounded-xl whitespace-nowrap transition-colors ${
              activeStatus === status
                ? 'bg-[#7dc6a2] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t(`community.featureRequests.status.${status}`, { defaultValue: status.replace(/_/g, ' ').toLowerCase() })}
          </button>
        ))}
      </div>

      {loading ? (
        <CommunitySkeleton />
      ) : results && results.data.length > 0 ? (
        <div className="space-y-3">
          {results.data.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
          <Pagination
            page={page}
            totalPages={results.pagination.totalPages}
            onPageChange={(p) => { setPage(p); fetchData(activeStatus, p); }}
          />
        </div>
      ) : (
        <CommunityEmptyState
          message={t('community.empty.noFeatureRequests', { defaultValue: 'No feature requests yet.' })}
          icon="💡"
        />
      )}
    </>
  );
}
