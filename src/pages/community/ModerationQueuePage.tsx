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

/**
 * Minimal website mod queue. Full analytics/queue lives in admin portal (RN).
 * Authorization is enforced server-side by CommunityModGuard (Mintcom staff only).
 */
export function ModerationQueuePage() {
  const { t } = useTranslation();
  const { isAuthenticated, account } = useAuth();
  const allowed =
    isAuthenticated &&
    !!(
      account?.isSecondaryAdmin ||
      (Array.isArray(account?.permissions) &&
        account.permissions.includes('community_moderate'))
    );

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await communityApi.getModerationQueue(p, 20);
      setItems(data.data);
      setTotalPages(data.pagination.totalPages);
      setForbidden(false);
    } catch (err: any) {
      if (err?.response?.status === 403) setForbidden(true);
      else toast.error(t('community.errors.loadFailed', { defaultValue: 'Failed to load.' }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) load(page);
    else setLoading(false);
  }, [isAuthenticated, page, load]);

  const act = async (item: any, action: string) => {
    try {
      await communityApi.performModAction({
        action,
        targetType: item.targetType,
        topicId: item.topicId || undefined,
        replyId: item.replyId || undefined,
        profileId: item.profileId || undefined,
      });
      toast.success(t('community.moderation.actionDone', { defaultValue: 'Action applied' }));
      load(page);
    } catch {
      toast.error(t('community.errors.actionFailed', { defaultValue: 'Action failed.' }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <Link to="/login?redirect=/community/moderation" className="text-[#5aab87] hover:underline">
          {t('auth.login', { defaultValue: 'Login' })}
        </Link>
      </div>
    );
  }

  if (forbidden) {
    return (
      <CommunityEmptyState
        message={t('community.errors.forbidden', { defaultValue: 'You do not have permission to moderate.' })}
        icon="🔒"
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {t('community.moderation.queueTitle', { defaultValue: 'Moderation Queue' })} | Mintcom POS
        </title>
      </Helmet>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {t('community.moderation.queueTitle', { defaultValue: 'Moderation Queue' })}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {t('community.moderation.queueHint', {
          defaultValue: 'Open reports. Full moderation analytics live in the admin portal.',
        })}
      </p>

      {loading ? (
        <CommunitySkeleton />
      ) : items.length === 0 ? (
        <CommunityEmptyState
          message={t('community.moderation.queueEmpty', { defaultValue: 'Queue is empty.' })}
          icon="✅"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.targetType} · {item.reason}
                  </p>
                  {item.topic && (
                    <p className="text-sm text-gray-700 mt-1" dir="auto">
                      {item.topic.title}
                    </p>
                  )}
                  {item.reply && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2" dir="auto">
                      {item.reply.body}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {t('community.moderation.reportedBy', { defaultValue: 'Reported by' })}{' '}
                    @{item.reporter?.username} · {new Date(item.createdAt).toLocaleString()}
                  </p>
                  {item.details && (
                    <p className="text-xs text-gray-500 mt-1" dir="auto">{item.details}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {item.targetType === 'TOPIC' && (
                    <>
                      <button type="button" onClick={() => act(item, 'HIDE')} className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-800">HIDE</button>
                      <button type="button" onClick={() => act(item, 'DELETE')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700">DELETE</button>
                    </>
                  )}
                  {item.targetType === 'REPLY' && (
                    <>
                      <button type="button" onClick={() => act(item, 'HIDE')} className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-800">HIDE</button>
                      <button type="button" onClick={() => act(item, 'DELETE')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700">DELETE</button>
                    </>
                  )}
                  {item.targetType === 'PROFILE' && (
                    <>
                      <button type="button" onClick={() => act(item, 'WARN')} className="text-xs px-2 py-1 rounded bg-gray-100">WARN</button>
                      <button type="button" onClick={() => act(item, 'SUSPEND')} className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-800">SUSPEND</button>
                      <button type="button" onClick={() => act(item, 'BAN')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700">BAN</button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      // Dismiss without content action
                      try {
                        await communityApi.performModAction({
                          action: 'WARN',
                          targetType: item.targetType,
                          topicId: item.topicId || undefined,
                          replyId: item.replyId || undefined,
                          profileId: item.profileId || item.reporterId,
                          reason: 'Dismissed as no action',
                        });
                        load(page);
                      } catch { /* ignore */ }
                    }}
                    className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500"
                  >
                    {t('community.moderation.dismiss', { defaultValue: 'Dismiss' })}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}
