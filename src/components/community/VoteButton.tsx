import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { communityApi } from '../../services/communityApi';

interface VoteButtonProps {
  targetType: 'TOPIC' | 'REPLY';
  targetId: string;
  initialUpvoteCount: number;
  initialReacted?: boolean;
}

/**
 * Vote button — optimistic update with rollback on failure.
 * Calls toggleReaction API. Shows upvote count.
 */
export function VoteButton({
  targetType,
  targetId,
  initialUpvoteCount,
  initialReacted = false,
}: VoteButtonProps) {
  const { t } = useTranslation();
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    // Optimistic update
    const prevCount = upvoteCount;
    const prevReacted = reacted;
    setReacted(!reacted);
    setUpvoteCount(reacted ? upvoteCount - 1 : upvoteCount + 1);
    setLoading(true);

    try {
      const result = await communityApi.toggleReaction({
        targetType,
        targetId,
        type: 'UPVOTE',
      });
      setReacted(result.reacted);
      setUpvoteCount(result.upvoteCount);
    } catch (err: any) {
      // Rollback
      setReacted(prevReacted);
      setUpvoteCount(prevCount);

      if (err?.response?.status === 401) {
        toast.error(t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' }));
        // Guests: send to login with return path (api.ts only wipes session when localStorage.account exists)
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      } else if (err?.response?.status === 403) {
        toast.error(t('community.errors.forbidden', { defaultValue: 'You do not have permission to do this.' }));
      } else if (err?.response?.status === 429) {
        toast.error(t('community.errors.rateLimited', { defaultValue: 'Too many actions. Please slow down.' }));
      } else if (err?.response?.status === 404) {
        toast.error(t('community.errors.notFound', { defaultValue: 'Content not found.' }));
      } else {
        toast.error(t('community.errors.actionFailed', { defaultValue: 'Failed to vote.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-colors ${
        reacted
          ? 'text-[#5aab87] bg-[#7dc6a2]/12'
          : 'text-gray-500 hover:bg-gray-100'
      } ${loading ? 'opacity-50' : ''}`}
      title={t('community.reactions.upvote', { defaultValue: 'Upvote' })}
    >
      <svg
        className={`w-4 h-4 ${reacted ? 'fill-current' : 'fill-none stroke-current'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M7 14l5-5 5 5" />
      </svg>
      <span className="text-xs font-medium">{upvoteCount}</span>
    </button>
  );
}
