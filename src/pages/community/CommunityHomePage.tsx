import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  communityApi,
  type CommunityCategory,
  type CommunityTopicListItem,
} from '../../services/communityApi';
import { CommunitySkeleton } from '../../components/community/CommunitySkeleton';
import { TopicListItem } from '../../components/community/TopicListItem';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';

/**
 * Community home - simple hero, category strip (no truncated cards),
 * topic feed as the star.
 */
export function CommunityHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [topics, setTopics] = useState<CommunityTopicListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState('latest');
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, topicData] = await Promise.all([
          communityApi.getCategories(),
          communityApi.getTopics({ sort, limit: 15 }),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setTopics(topicData.data);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.status === 404 ? 'not_enabled' : 'error');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sort]);

  if (loading) return <CommunitySkeleton />;

  if (error === 'not_enabled') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          {t('community.hub.title', { defaultValue: 'Community' })}
        </h1>
        <p className="text-text-secondary">
          {t('community.hub.comingSoon', { defaultValue: 'Coming soon.' })}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">
          {t('community.errors.loadFailed', { defaultValue: 'Failed to load community content.' })}
        </p>
      </div>
    );
  }

  const sortOptions = [
    { value: 'latest', label: t('community.sort.latest', { defaultValue: 'Latest' }) },
    { value: 'top', label: t('community.sort.top', { defaultValue: 'Top' }) },
    { value: 'trending', label: t('community.sort.trending', { defaultValue: 'Trending' }) },
  ];

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/community/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Helmet>
        <title>{t('community.hub.title', { defaultValue: 'Community' })} | Mintcom POS</title>
        <meta
          name="description"
          content={t('community.hub.subtitle', {
            defaultValue: 'Ask questions, share tips, and connect with other Mintcom merchants.',
          })}
        />
        <link rel="canonical" href="/community" />
      </Helmet>

      {/* Hero */}
      <header className="mb-8 sm:mb-10">
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#5aab87] mb-2">
          Mintcom
        </p>
        <h1 className="text-3xl sm:text-[2rem] font-semibold tracking-tight text-text-primary leading-tight">
          {t('community.hub.title', { defaultValue: 'Community' })}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary max-w-md leading-snug">
          {t('community.hub.subtitle', {
            defaultValue: 'Tips, questions, and ideas from merchants like you.',
          })}
        </p>

        <form onSubmit={onSearch} className="mt-5 flex gap-2 max-w-lg">
          <div className="relative flex-1 min-w-0">
            <span className="absolute inset-y-0 start-3 flex items-center text-text-tertiary pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('community.search.placeholder', { defaultValue: 'Search topics…' })}
              className="w-full h-11 ps-9 pe-3 rounded-xl bg-white border border-black/[0.06] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#7dc6a2]/35 focus:border-[#7dc6a2]/50 transition"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-4 rounded-xl text-sm font-semibold text-white bg-[#7dc6a2] hover:bg-[#6bb892] transition-colors shrink-0"
          >
            {t('community.search.button', { defaultValue: 'Search' })}
          </button>
        </form>
      </header>

      {/* Category strip - full names, no card truncation */}
      <section className="mb-9">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">
            {t('community.categories.label', { defaultValue: 'Browse by category' })}
          </h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/community/c/${cat.slug}`}
              className="group shrink-0 flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-xl bg-white border border-black/[0.05] hover:border-[#7dc6a2]/45 hover:shadow-sm transition-all"
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                style={{ backgroundColor: cat.color || '#7dc6a2' }}
              >
                {cat.name.charAt(0)}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-text-primary whitespace-nowrap">
                  {cat.name}
                </p>
                <p className="text-[11px] text-text-tertiary whitespace-nowrap">
                  {cat.topicCount} {t('community.stats.topics', { defaultValue: 'topics' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-text-primary">
            {t('community.home.recentTopics', { defaultValue: 'Recent topics' })}
          </h2>
          <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04]">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-xl transition-all ${
                  sort === opt.value
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {topics.length > 0 ? (
          <div className="space-y-2.5">
            {topics.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <CommunityEmptyState
            message={t('community.empty.noTopics', {
              defaultValue: 'No topics yet. Be the first to start a discussion!',
            })}
            icon="💬"
          />
        )}
      </section>
    </>
  );
}
