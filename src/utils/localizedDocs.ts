/**
 * Locale-aware paths for downloadable Mintcom manuals hosted on the website.
 * English is the default; Arabic uses dedicated -ar PDF assets.
 * Different filenames per language so browser/OS caches never mix EN/AR files.
 */
export type ManualKind = 'user' | 'setup';

export function normalizeManualLanguage(language?: string | null): 'ar' | 'en' {
  const lang = (language || 'en').toLowerCase().replace('_', '-');
  if (lang === 'ar' || lang.startsWith('ar-')) return 'ar';
  return 'en';
}

export function getLocalizedManual(
  kind: ManualKind,
  language?: string | null,
): { path: string; filename: string; language: 'ar' | 'en' } {
  const languageCode = normalizeManualLanguage(language);
  const isArabic = languageCode === 'ar';

  if (kind === 'user') {
    return isArabic
      ? {
          path: '/docs/mintcom-user-manual-ar.pdf',
          filename: 'mintcom-user-manual-ar.pdf',
          language: languageCode,
        }
      : {
          path: '/docs/mintcom-user-manual.pdf',
          filename: 'mintcom-user-manual.pdf',
          language: languageCode,
        };
  }

  return isArabic
    ? {
        path: '/docs/mintcom-setup-manual-ar.pdf',
        filename: 'mintcom-setup-manual-ar.pdf',
        language: languageCode,
      }
    : {
        path: '/docs/mintcom-setup-manual.pdf',
        filename: 'mintcom-setup-manual.pdf',
        language: languageCode,
      };
}
