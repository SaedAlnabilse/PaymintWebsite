import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CommunityTopicListItem } from '../../services/communityApi';

/**
 * Topic row — calm list, mint solved badge, no indigo.
 */
export function TopicListItem({ topic }: { topic: CommunityTopicListItem }) {
  const { t } = useTranslation();
  const topicUrl = `/community/c/${topic.category.slug}/${topic.slug}-${topic.id}`;

  return (
    <Link
      to={topicUrl}
      className="group block px-4 py-4 sm:px-5 rounded-xl bg-white border border-black/[0.05] hover:border-[#7dc6a2]/40 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Score */}
        <div className="flex flex-col items-center justify-center shrink-0 w-11 pt-0.5">
          <span className="text-base font-semibold tabular-nums text-text-primary leading-none">
            {topic.upvoteCount}
          </span>
          <span className="mt-1 text-[10px] tracking-wide text-text-tertiary">
            {t('community.reactions.votes', { defaultValue: 'Votes' })}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Badges */}
          {(topic.isPinned ||
            topic.isAnnouncement ||
            topic.bestReplyId ||
            topic.state === 'LOCKED' ||
            topic.featureStatus) && (
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {topic.isPinned && (
                <Badge tone="mint">{t('community.topic.pinned', { defaultValue: 'Pinned' })}</Badge>
              )}
              {topic.isAnnouncement && (
                <Badge tone="soft">{t('community.topic.announcement', { defaultValue: 'Announcement' })}</Badge>
              )}
              {topic.bestReplyId && (
                <Badge tone="mint">{t('community.topic.solved', { defaultValue: 'Solved' })}</Badge>
              )}
              {topic.state === 'LOCKED' && (
                <Badge tone="muted">{t('community.topic.locked', { defaultValue: 'Locked' })}</Badge>
              )}
              {topic.featureStatus && (
                <Badge tone="soft">{topic.featureStatus.replace(/_/g, ' ').toLowerCase()}</Badge>
              )}
            </div>
          )}

          <h3
            className="text-[15px] sm:text-base font-semibold text-text-primary leading-snug group-hover:text-[#3d7a5c] transition-colors"
            dir="auto"
          >
            {topic.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[12px] text-text-tertiary">
            <span className="font-medium text-text-secondary">{topic.author.displayName}</span>
            <span className="text-black/10">·</span>
            <span>
              {topic.replyCount}{' '}
              {t('community.topic.replies', { defaultValue: 'replies' })}
            </span>
            <span className="text-black/10">·</span>
            <span>
              {topic.viewCount} {t('community.topic.views', { defaultValue: 'views' })}
            </span>
            {topic.tags && topic.tags.length > 0 && (
              <>
                <span className="text-black/10">·</span>
                <span className="flex items-center gap-1.5">
                  {topic.tags.slice(0, 3).map(({ tag }) => (
                    <span key={tag.id} className="text-[#5aab87]">
                      #{tag.name}
                    </span>
                  ))}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Category pill */}
        {topic.category?.name && (
          <span className="hidden sm:inline-flex shrink-0 mt-1 max-w-[7rem] truncate px-2.5 py-1 rounded-xl text-[11px] font-medium bg-cream-100 text-text-secondary">
            {topic.category.name}
          </span>
        )}
      </div>
    </Link>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'mint' | 'soft' | 'muted';
}) {
  const tones = {
    mint: 'bg-[#7dc6a2]/18 text-[#2f6b4f]',
    soft: 'bg-black/[0.04] text-text-secondary',
    muted: 'bg-black/[0.04] text-text-tertiary',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-xl text-[10px] font-semibold tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
