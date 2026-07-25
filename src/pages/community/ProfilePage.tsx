import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { communityApi, type CommunityProfile } from '../../services/communityApi';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';

/**
 * Public profile page — shows community data only (never email/tenant/billing).
 * URL: /community/u/:username
 * Public read.
 */
export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [stats, setStats] = useState<{ rank: number; reputation: number; trustLevel: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!username) return;
      setLoading(true);
      try {
        const [data, st] = await Promise.all([
          communityApi.getProfile(username),
          communityApi.getProfileStats(username).catch(() => null),
        ]);
        if (!cancelled) {
          setProfile(data);
          if (st) setStats({ rank: st.rank, reputation: st.reputation, trustLevel: st.trustLevel });
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.status === 404 ? 'not_found' : 'error');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [username]);

  if (loading) return <CommunitySkeleton />;

  if (error === 'not_found' || !profile) {
    return <CommunityEmptyState message={t('community.empty.profileNotFound', { defaultValue: 'Profile not found.' })} icon="👤" />;
  }
  if (error) {
    return <CommunityEmptyState message={t('community.errors.loadFailed')} icon="⚠️" />;
  }

  return (
    <>
      <Helmet>
        <title>{profile.displayName} (@{profile.username}) | {t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
        <meta name="description" content={profile.bio || `${profile.displayName} — ${profile.postCount} posts, ${profile.solutionCount} solutions`} />
        <link rel="canonical" href={`/community/u/${profile.username}`} />
      </Helmet>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-16 h-16 rounded-full flex-shrink-0" />
          ) : (
            <span className="w-16 h-16 rounded-full bg-[#7dc6a2]/18 flex items-center justify-center text-2xl font-bold text-[#5aab87] flex-shrink-0">
              {profile.displayName.charAt(0)}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900" dir="auto">{profile.displayName}</h1>
            <p className="text-sm text-gray-500" dir="auto">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-gray-600 mt-2" dir="auto">{profile.bio}</p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{profile.postCount} {t('community.profile.posts', { defaultValue: 'posts' })}</span>
              <span>{profile.solutionCount} {t('community.profile.solutions', { defaultValue: 'solutions' })}</span>
              <span>{profile.reputation} {t('community.profile.reputation', { defaultValue: 'reputation' })}</span>
              {stats && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#7dc6a2]/12 text-[#3d7a5c]">
                  #{stats.rank}
                </span>
              )}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                {profile.trustLevel}
              </span>
            </div>

            {(profile.country || profile.businessType) && (
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                {profile.country && <span>📍 {profile.country}</span>}
                {profile.businessType && <span>🏪 {profile.businessType}</span>}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">
              {t('community.profile.joined', { defaultValue: 'Joined' })} {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {profile.badges.map(({ badge }) => (
              <span
                key={badge.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700"
                title={badge.description}
              >
                {badge.icon && <span>{badge.icon}</span>}
                {badge.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity — Phase 2 will add actual topic list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {t('community.profile.recentActivity', { defaultValue: 'Recent Activity' })}
        </h2>
        <CommunityEmptyState
          message={t('community.profile.noActivity', { defaultValue: 'No recent activity.' })}
          icon="📋"
        />
      </div>
    </>
  );
}
