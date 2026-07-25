import { useTranslation } from 'react-i18next';

/**
 * Placeholder for community routes not yet implemented.
 * Phase 0 ships only the home page; Phase 1 adds the rest.
 */
export function CommunityComingSoonPage() {
  const { t } = useTranslation();
  return (
    <div className="text-center py-16">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t('community.hub.comingSoon', { defaultValue: 'Coming Soon' })}
      </h2>
      <p className="text-gray-500">
        {t('community.hub.phaseInDevelopment', {
          defaultValue: 'This section is under active development.',
        })}
      </p>
    </div>
  );
}
