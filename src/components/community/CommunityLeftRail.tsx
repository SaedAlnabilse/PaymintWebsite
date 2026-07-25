import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { communityApi, type CommunityCategory, type CommunityTag } from '../../services/communityApi';

/**
 * Quiet left rail — mint active state, soft labels, no noise.
 */
export function CommunityLeftRail() {
  const { t } = useTranslation();
  const location = useLocation();
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [tags, setTags] = useState<CommunityTag[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, tgs] = await Promise.all([
          communityApi.getCategories(),
          communityApi.getTags(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setTags(tgs.slice(0, 12));
        }
      } catch {
        /* rail is secondary */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCategorySlug = location.pathname.match(/\/community\/c\/([^/]+)/)?.[1];
  const activeTag = location.pathname.match(/\/community\/tags\/([^/]+)/)?.[1];
  const isHome = location.pathname === '/community' || location.pathname === '/community/';

  const linkClass = (active: boolean) =>
    `block px-3 py-2 rounded-xl text-[13px] transition-colors ${
      active
        ? 'bg-[#7dc6a2]/15 text-[#3d7a5c] font-semibold'
        : 'text-text-secondary hover:bg-black/[0.03] hover:text-text-primary'
    }`;

  return (
    <div className="space-y-7">
      <div>
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-text-tertiary">
          {t('community.categories.label', { defaultValue: 'Categories' })}
        </p>
        <nav className="space-y-0.5">
          <Link to="/community" className={linkClass(isHome)}>
            {t('community.home.allTopics', { defaultValue: 'All topics' })}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/community/c/${cat.slug}`}
              className={linkClass(activeCategorySlug === cat.slug)}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#7dc6a2' }}
                />
                <span className="truncate">{cat.name}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {tags.length > 0 && (
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-text-tertiary">
            {t('community.tags.label', { defaultValue: 'Tags' })}
          </p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/community/tags/${tag.slug}`}
                className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors ${
                  activeTag === tag.slug
                    ? 'bg-[#7dc6a2]/20 text-[#3d7a5c]'
                    : 'bg-black/[0.04] text-text-secondary hover:bg-black/[0.07]'
                }`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="px-1 pt-1 border-t border-black/[0.04]">
        <Link
          to="/community/feature-requests"
          className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-text-secondary hover:bg-black/[0.03] hover:text-text-primary transition-colors"
        >
          <span className="text-[#7dc6a2]">✦</span>
          {t('community.featureRequests.label', { defaultValue: 'Feature requests' })}
        </Link>
      </div>
    </div>
  );
}
