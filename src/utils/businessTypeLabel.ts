import i18n from '../i18n';
import { toTitleCase } from './textCase';

const BUSINESS_TYPE_KEY_MAP: Record<string, string> = {
  retail_store: 'retail',
};

const BUSINESS_TYPE_TRANSLATION_PREFIXES = [
  'establishments.types',
  'onboarding.step1.businessTypes',
] as const;

export function normalizeBusinessTypeKey(
  type: string | null | undefined,
): string {
  const normalized = String(type || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  return BUSINESS_TYPE_KEY_MAP[normalized] || normalized;
}

export function formatBusinessTypeLabel(
  type: string | null | undefined,
): string {
  const normalizedKey = normalizeBusinessTypeKey(type);

  if (!normalizedKey) {
    return '';
  }

  for (const prefix of BUSINESS_TYPE_TRANSLATION_PREFIXES) {
    const translated = i18n.t(`${prefix}.${normalizedKey}`, { defaultValue: '' });

    if (translated) {
      return translated;
    }
  }

  return toTitleCase(
    normalizedKey.replace(/_/g, ' '),
    i18n.resolvedLanguage || i18n.language || 'en',
  );
}
