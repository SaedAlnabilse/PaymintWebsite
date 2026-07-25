import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function CommunityEmptyState({
  message,
  icon = '💬',
}: {
  message?: string;
  icon?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16 px-4 rounded-xl bg-white border border-black/[0.04]">
      <div className="text-3xl mb-3 opacity-80">{icon}</div>
      <p className="text-sm text-text-secondary max-w-sm mx-auto">
        {message || t('community.empty.noResults', { defaultValue: 'Nothing here yet.' })}
      </p>
      <Link
        to="/community/new"
        className="inline-flex mt-5 h-9 px-4 items-center rounded-xl text-xs font-semibold text-white bg-[#7dc6a2] hover:bg-[#6bb892] transition-colors"
      >
        {t('community.compose.title', { defaultValue: 'New topic' })}
      </Link>
    </div>
  );
}
