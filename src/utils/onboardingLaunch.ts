import type { NavigateFunction } from 'react-router-dom';

/** Canonical entry of the location setup wizard (server resumes correct phase). */
export const ONBOARDING_START_PATH = '/onboarding';

/**
 * Open the first-location onboarding wizard in a new browser tab.
 * Returns false when the browser blocks the popup (callers should fall back).
 */
export function openOnboardingInNewTab(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const url = `${window.location.origin}${ONBOARDING_START_PATH}`;
  const tab = window.open(url, '_blank', 'noopener,noreferrer');
  return Boolean(tab);
}

/**
 * After a successful first-time login/signup:
 * - open onboarding in a new tab when allowed
 * - keep the current tab on the marketing site so the user can still browse
 * - if the popup is blocked, fall back to onboarding in the current tab
 */
export function launchFirstTimeOnboarding(navigate: NavigateFunction): void {
  const opened = openOnboardingInNewTab();
  if (opened) {
    navigate('/', { replace: true });
    return;
  }
  navigate(ONBOARDING_START_PATH, { replace: true });
}
