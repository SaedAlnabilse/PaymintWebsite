import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { communityApi, type CommunityTopicListItem } from '../../services/communityApi';

/**
 * Quiet right rail — trending + unanswered only when useful.
 */
export function CommunityRightRail() {
  const { t } = useTranslation();
  const [trending, setTrending] = useState<CommunityTopicListItem[]>([]);
  const [unanswered, setUnanswered] = useState<CommunityTopicListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [trend, unans] = await Promise.all([
          communityApi.getTrending(4),
          communityApi.getUnanswered(4),
        ]);
        if (!cancelled) {
          setTrending(trend);
          setUnanswered(unans);
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (trending.length === 0 && unanswered.length === 0) return null;

  return (
    <div className="space-y-7">
      {trending.length > 0 && (
        <RailBlock title={t('community.home.trending', { defaultValue: 'Trending' })}>
          {trending.map((topic) => (
            <MiniTopic key={topic.id} topic={topic} showVotes />
          ))}
        </RailBlock>
      )}
      {unanswered.length > 0 && (
        <RailBlock title={t('community.home.unanswered', { defaultValue: 'Unanswered' })}>
          {unanswered.map((topic) => (
            <MiniTopic key={topic.id} topic={topic} />
          ))}
        </RailBlock>
      )}
    </div>
  );
}

function RailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-text-tertiary">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MiniTopic({
  topic,
  showVotes,
}: {
  topic: CommunityTopicListItem;
  showVotes?: boolean;
}) {
  return (
    <Link
      to={`/community/c/${topic.category.slug}/${topic.slug}-${topic.id}`}
      className="block px-2.5 py-2 rounded-xl hover:bg-black/[0.03] transition-colors"
    >
      <p className="text-[13px] font-medium text-text-primary leading-snug line-clamp-2" dir="auto">
        {topic.title}
      </p>
      <p className="mt-1 text-[11px] text-text-tertiary">
        {topic.replyCount} replies
        {showVotes ? ` · ${topic.upvoteCount} votes` : ''}
      </p>
    </Link>
  );
}
