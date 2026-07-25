import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { communityApi } from '../../services/communityApi';
import { Pagination } from '../../components/community/Pagination';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';
import { useCommunityRealtime, CommunityRealtimeEvents } from '../../hooks/useCommunityRealtime';

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  topicId?: string;
  replyId?: string;
  isRead: boolean;
  createdAt: string;
};

export function CommunityNotificationsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await communityApi.getNotifications(p, 20);
      setItems(data.data as Notif[]);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error(t('community.errors.loadFailed', { defaultValue: 'Failed to load.' }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) load(page);
    else setLoading(false);
  }, [isAuthenticated, page, load]);

  useCommunityRealtime({
    enabled: isAuthenticated,
    onEvent: (evt, payload) => {
      if (evt === CommunityRealtimeEvents.NOTIFICATION && payload) {
        setItems((prev) => [payload as Notif, ...prev]);
      }
    },
    onReconnect: () => load(page),
  });

  const markAllRead = async () => {
    try {
      await communityApi.markNotificationsRead({ all: true });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(t('community.notifications.markedAll', { defaultValue: 'All marked read' }));
    } catch {
      toast.error(t('community.errors.actionFailed', { defaultValue: 'Action failed.' }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-5 rounded-xl bg-white border border-black/[0.05]">
        <p className="text-base font-semibold text-text-primary">
          {t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' })}
        </p>
        <Link
          to="/login?redirect=/community/notifications"
          className="inline-flex mt-6 h-10 px-5 items-center justify-center rounded-xl text-sm font-semibold text-white bg-[#7dc6a2] hover:bg-[#6bb892] transition-colors"
        >
          {t('community.login_cta.button', { defaultValue: 'Log in' })}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {t('community.notifications.title', { defaultValue: 'Notifications' })} |{' '}
          {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS
        </title>
      </Helmet>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('community.notifications.title', { defaultValue: 'Notifications' })}
        </h1>
        <button
          onClick={markAllRead}
          className="text-sm text-[#5aab87] hover:underline"
        >
          {t('community.notifications.markAll', { defaultValue: 'Mark all read' })}
        </button>
      </div>

      {loading ? (
        <CommunitySkeleton />
      ) : items.length === 0 ? (
        <CommunityEmptyState
          message={t('community.notifications.empty', { defaultValue: 'No notifications yet.' })}
          icon="🔔"
        />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border ${
                n.isRead ? 'bg-white border-gray-200' : 'bg-[#7dc6a2]/12 border-[#7dc6a2]/25'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900" dir="auto">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5" dir="auto">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {n.topicId && (
                  <Link
                    to={`/community/c/discussions/topic-${n.topicId}`}
                    className="text-xs text-[#5aab87] whitespace-nowrap hover:underline"
                  >
                    {t('community.notifications.view', { defaultValue: 'View' })}
                  </Link>
                )}
              </div>
            </div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}
