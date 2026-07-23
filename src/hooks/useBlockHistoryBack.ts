import { useEffect } from 'react';

/**
 * When enabled, browser Back stays on the current page (used on onboarding launch
 * after payment so the user cannot re-open billing).
 */
export function useBlockHistoryBack(enabled: boolean, onBlocked?: () => void) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const seal = () => {
      try {
        window.history.pushState({ mintcomOnboardingLock: 1 }, '', window.location.href);
      } catch {
        // ignore
      }
    };

    seal();

    const onPop = () => {
      seal();
      onBlocked?.();
    };

    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, [enabled, onBlocked]);
}
