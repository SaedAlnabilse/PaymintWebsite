import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  communityApi,
  type CommunityTopicDetail,
  type CommunityReply,
  type PaginatedResponse,
} from '../../services/communityApi';
import { VoteButton } from '../../components/community/VoteButton';
import { ReplyComposer } from '../../components/community/ReplyComposer';
import { FollowBookmarkButtons } from '../../components/community/FollowBookmarkButtons';
import { ReportModal } from '../../components/community/ReportModal';
import { ModActionMenu } from '../../components/community/ModActionMenu';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../../components/community/Pagination';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';
import { useCommunityRealtime, CommunityRealtimeEvents } from '../../hooks/useCommunityRealtime';

/**
 * Topic detail page — thread body + paginated replies.
 * Public read. URL: /community/c/:categorySlug/:topicSlug-:topicId
 * Uses dir="auto" on content blocks for mixed RTL/LTR.
 */
export function TopicPage() {
  const { topicId, categorySlug } = useParams<{ topicId: string; categorySlug: string; topicSlug: string }>();
  const { t } = useTranslation();
  const { isAuthenticated, account } = useAuth();
  // Mod UI is staff-only. Owners are customers — never treat tenant * as global mod.
  // Server CommunityModGuard is the source of truth; this only hides affordances.
  const canModerate =
    isAuthenticated &&
    !!(
      account?.isSecondaryAdmin ||
      (Array.isArray(account?.permissions) &&
        account.permissions.includes('community_moderate'))
    );
  const [reportOpen, setReportOpen] = useState(false);
  const [topic, setTopic] = useState<CommunityTopicDetail | null>(null);
  const [replies, setReplies] = useState<PaginatedResponse<CommunityReply> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchReplies = useCallback(async (p: number) => {
    if (!topicId) return;
    try {
      const data = await communityApi.getReplies(topicId, p, 20);
      setReplies(data);
    } catch {
      // Replies failed to load — topic is still visible
    }
  }, [topicId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!topicId) return;
      setLoading(true);
      try {
        const topicData = await communityApi.getTopic(topicId);
        if (!cancelled) {
          setTopic(topicData);
          setLoading(false);
          fetchReplies(1);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.status === 404 ? 'not_found' : 'error');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [topicId, fetchReplies]);

  // Live thread updates — REST is source of truth; refetch on reconnect/events
  useCommunityRealtime({
    topicId: topicId || null,
    enabled: !!topicId,
    onEvent: (evt) => {
      if (
        evt === CommunityRealtimeEvents.REPLY_CREATED ||
        evt === CommunityRealtimeEvents.REACTION_CHANGED ||
        evt === CommunityRealtimeEvents.TOPIC_UPDATED
      ) {
        fetchReplies(page);
      }
    },
    onReconnect: () => {
      if (topicId) {
        communityApi.getTopic(topicId).then(setTopic).catch(() => {});
        fetchReplies(page);
      }
    },
  });

  if (loading) return <CommunitySkeleton />;

  if (error === 'not_found' || !topic) {
    return <CommunityEmptyState message={t('community.empty.topicNotFound', { defaultValue: 'Topic not found.' })} icon="🔍" />;
  }
  if (error) {
    return <CommunityEmptyState message={t('community.errors.loadFailed')} icon="⚠️" />;
  }

  // JSON-LD for SEO (QAPage or DiscussionForumPosting)
  const jsonLd = topic.bestReplyId
    ? {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
          '@type': 'Question',
          name: topic.title,
          text: topic.body,
          answerCount: topic.replyCount,
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'See accepted solution in thread',
          },
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'DiscussionForumPosting',
        headline: topic.title,
        text: topic.body,
        author: {
          '@type': 'Person',
          name: topic.author.displayName,
        },
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/ReplyAction',
          userInteractionCount: topic.replyCount,
        },
      };

  return (
    <>
      <Helmet>
        <title>{topic.title} | {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
        <meta name="description" content={topic.body.slice(0, 160)} />
        <link rel="canonical" href={`/community/c/${topic.category.slug}/${topic.slug}-${topic.id}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link to="/community" className="hover:text-[#5aab87]">
          {t('community.hub.title', { defaultValue: 'Community' })}
        </Link>
        <span>/</span>
        <Link to={`/community/c/${topic.category.slug}`} className="hover:text-[#5aab87]">
          {topic.category.name}
        </Link>
      </div>

      {/* Topic header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-3" dir="auto">{topic.title}</h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <Link to={`/community/u/${topic.author.username}`} className="flex items-center gap-2 hover:text-[#5aab87]">
            {topic.author.avatar ? (
              <img src={topic.author.avatar} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                {topic.author.displayName.charAt(0)}
              </span>
            )}
            <span>{topic.author.displayName}</span>
          </Link>
          <span>·</span>
          <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>{topic.viewCount} {t('community.topic.views', { defaultValue: 'views' })}</span>
          <span>·</span>
          <span>{topic.upvoteCount} {t('community.reactions.votes', { defaultValue: 'votes' })}</span>
        </div>

        {/* Topic body */}
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dir="auto"
          dangerouslySetInnerHTML={{ __html: topic.bodyHtml }}
        />

        {/* Vote + Follow + Bookmark actions */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <VoteButton
            targetType="TOPIC"
            targetId={topic.id}
            initialUpvoteCount={topic.upvoteCount}
            initialReacted={topic.reactions && topic.reactions.length > 0}
          />
          <FollowBookmarkButtons topicId={topic.id} />
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              {t('community.moderation.report', { defaultValue: 'Report' })}
            </button>
          )}
          <ModActionMenu
            canModerate={canModerate}
            targetType="TOPIC"
            topicId={topic.id}
            onDone={() => {
              communityApi.getTopic(topic.id).then(setTopic).catch(() => {});
            }}
          />
        </div>

        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="TOPIC"
          topicId={topic.id}
        />

        {topic.tags && topic.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {topic.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                to={`/community/tags/${tag.slug}`}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {topic.replyCount} {t('community.reply.replies', { defaultValue: 'Replies' })}
        </h2>
      </div>

      {replies && replies.data.length > 0 ? (
        <div className="space-y-3">
          {replies.data.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
          <Pagination
            page={page}
            totalPages={replies.pagination.totalPages}
            onPageChange={(p) => { setPage(p); fetchReplies(p); }}
          />
        </div>
      ) : (
        <CommunityEmptyState
          message={t('community.empty.noReplies', { defaultValue: 'No replies yet.' })}
          icon="💬"
        />
      )}

      {/* Reply composer */}
      {topic.state !== 'LOCKED' && (
        <div className="mt-6">
          <ReplyComposer topicId={topic.id} onReplyCreated={() => fetchReplies(1)} />
        </div>
      )}
    </>
  );
}

function ReplyItem({ reply }: { reply: CommunityReply }) {
  const { t } = useTranslation();
  return (
    <div className={`bg-white rounded-xl border p-4 ${reply.isSolution ? 'border-emerald-300 border-2' : 'border-gray-200'}`}>
      {reply.isSolution && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 mb-2">
          ✓ {t('community.reply.solution', { defaultValue: 'Accepted Solution' })}
        </div>
      )}

      <div className="flex items-start gap-3">
        <Link to={`/community/u/${reply.author.username}`}>
          {reply.author.avatar ? (
            <img src={reply.author.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500 flex-shrink-0">
              {reply.author.displayName.charAt(0)}
            </span>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm mb-1">
            <Link to={`/community/u/${reply.author.username}`} className="font-medium text-gray-900 hover:text-[#5aab87]">
              {reply.author.displayName}
            </Link>
            <span className="text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
            {reply.editedAt && (
              <span className="text-xs text-gray-400">({t('community.reply.edited', { defaultValue: 'edited' })})</span>
            )}
          </div>

          <div
            className="prose prose-sm max-w-none text-gray-700"
            dir="auto"
            dangerouslySetInnerHTML={{ __html: reply.bodyHtml }}
          />

          {/* Vote on reply */}
          <div className="mt-2">
            <VoteButton
              targetType="REPLY"
              targetId={reply.id}
              initialUpvoteCount={reply.upvoteCount}
              initialReacted={reply.reactions && reply.reactions.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
