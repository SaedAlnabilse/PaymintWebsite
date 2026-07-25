import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { communityApi } from '../../services/communityApi';

interface FollowBookmarkButtonsProps {
  topicId?: string;
  categoryId?: string;
  tagId?: string;
  initialFollowing?: boolean;
  initialBookmarked?: boolean;
}

/**
 * Follow + Bookmark buttons — optimistic update with rollback.
 * Follow works on topics, categories, tags.
 * Bookmark works on topics only.
 */
export function FollowBookmarkButtons({
  topicId,
  categoryId,
  tagId,
  initialFollowing = false,
  initialBookmarked = false,
}: FollowBookmarkButtonsProps) {
  const { t } = useTranslation();
  const [following, setFollowing] = useState(initialFollowing);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const targetType = topicId ? 'TOPIC' : categoryId ? 'CATEGORY' : tagId ? 'TAG' : 'TOPIC';

  const handleFollow = async () => {
    if (loadingFollow) return;
    const prev = following;
    setFollowing(!following);
    setLoadingFollow(true);

    try {
      const result = await communityApi.toggleFollow({
        targetType,
        topicId,
        categoryId,
        tagId,
      });
      setFollowing(result.following);
    } catch (err: any) {
      setFollowing(prev);
      if (err?.response?.status === 401) {
        toast.error(t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' }));
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      } else if (err?.response?.status === 403) {
        toast.error(t('community.errors.forbidden', { defaultValue: 'You do not have permission to do this.' }));
      } else {
        toast.error(t('community.errors.actionFailed', { defaultValue: 'Action failed.' }));
      }
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleBookmark = async () => {
    if (loadingBookmark || !topicId) return;
    const prev = bookmarked;
    setBookmarked(!bookmarked);
    setLoadingBookmark(true);

    try {
      const result = await communityApi.toggleBookmark(topicId);
      setBookmarked(result.bookmarked);
    } catch (err: any) {
      setBookmarked(prev);
      if (err?.response?.status === 401) {
        toast.error(t('community.login_cta.title', { defaultValue: 'Sign in to join the conversation' }));
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      } else if (err?.response?.status === 403) {
        toast.error(t('community.errors.forbidden', { defaultValue: 'You do not have permission to do this.' }));
      } else {
        toast.error(t('community.errors.actionFailed', { defaultValue: 'Action failed.' }));
      }
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFollow}
        disabled={loadingFollow}
        className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
          following
            ? 'bg-[#7dc6a2]/18 text-[#3d7a5c]'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        {following
          ? t('community.follow.following', { defaultValue: 'Following' })
          : t('community.follow.follow', { defaultValue: 'Follow' })}
      </button>

      {topicId && (
        <button
          onClick={handleBookmark}
          disabled={loadingBookmark}
          className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
            bookmarked
              ? 'bg-amber-100 text-amber-700'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          title={t('community.bookmark.title', { defaultValue: 'Save for later' })}
        >
          {bookmarked ? '★' : '☆'}
        </button>
      )}
    </div>
  );
}
