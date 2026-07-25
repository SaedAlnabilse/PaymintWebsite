import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { CommunityLeftRail } from './CommunityLeftRail';
import { CommunityRightRail } from './CommunityRightRail';
import { NotificationBell } from './NotificationBell';
import { Leaderboard } from './Leaderboard';
import { useAuth } from '../../context/AuthContext';

/**
 * Community shell.
 * Navbar is position:fixed — content needs top padding so nothing
 * peeks behind the floating pill. Sticky rails use the same offset.
 */
export function CommunityLayout() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-mintcom-dark">
      <Navbar />

      {/* Spacer for fixed navbar (pill + top gap ~88px) */}
      <div className="h-[5.5rem] sm:h-24 shrink-0" aria-hidden />

      {/* Community toolbar — sticks below the fixed navbar */}
      <div className="sticky top-[5.5rem] sm:top-24 z-30 border-b border-black/[0.04] bg-cream-50/90 dark:bg-mintcom-dark/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
          <Link
            to="/community"
            className="text-sm font-semibold text-text-primary tracking-tight hover:text-[#5aab87] transition-colors"
          >
            {t('community.hub.title', { defaultValue: 'Community' })}
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/community/search')}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs text-text-secondary bg-white border border-black/[0.06] hover:border-[#7dc6a2]/40 transition-colors"
            >
              <SearchIcon />
              {t('community.search.placeholder', { defaultValue: 'Search topics…' })}
            </button>
            <NotificationBell />
            <Link
              to={isAuthenticated ? '/community/new' : '/login?redirect=/community/new'}
              className="inline-flex items-center h-8 px-3.5 rounded-xl text-xs font-semibold text-white bg-[#7dc6a2] hover:bg-[#6bb892] shadow-sm transition-colors"
            >
              {t('community.compose.title', { defaultValue: 'New topic' })}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <aside className="hidden lg:block w-[200px] shrink-0">
            {/* sticky under navbar + community toolbar */}
            <div className="sticky top-[8.75rem] sm:top-36">
              <CommunityLeftRail />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

          <aside className="hidden xl:block w-[220px] shrink-0">
            <div className="sticky top-[8.75rem] sm:top-36 space-y-8">
              <CommunityRightRail />
              <Leaderboard limit={5} />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
