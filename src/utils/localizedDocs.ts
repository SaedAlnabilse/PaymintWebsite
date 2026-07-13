/**
 * Locale-aware paths for downloadable Mintcom manuals hosted on the website.
 * English is the default; Arabic uses dedicated -ar PDF assets.
 */
export type ManualKind = 'user' | 'setup';

export function getLocalizedManual(
  kind: ManualKind,
  language?: string | null,
): { path: string; filename: string } {
  const lang = (language || 'en').toLowerCase();
  const isArabic = lang === 'ar' || lang.startsWith('ar-') || lang.startsWith('ar_');

  if (kind === 'user') {
    return isArabic
      ? {
          path: '/docs/mintcom-user-manual-ar.pdf',
          filename: 'mintcom-user-manual-ar.pdf',
        }
      : {
          path: '/docs/mintcom-user-manual.pdf',
          filename: 'mintcom-user-manual.pdf',
        };
  }

  return isArabic
    ? {
        path: '/docs/mintcom-setup-manual-ar.pdf',
        filename: 'mintcom-setup-manual-ar.pdf',
      }
    : {
        path: '/docs/mintcom-setup-manual.pdf',
        filename: 'mintcom-setup-manual.pdf',
      };
}
