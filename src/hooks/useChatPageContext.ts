import { useMemo } from 'react';
import { resolveChatbotPageContext } from '../data/chatbotPageContexts';
import type { ChatbotPageContextOptions } from '../components/Chat/chatbotTypes';

export function useChatPageContext(
  pathname: string,
  useArabic: boolean,
  options?: ChatbotPageContextOptions,
) {
  const canAccessOwnerPortal = options?.canAccessOwnerPortal;
  const dashboardPath = options?.dashboardPath;
  const isAuthenticated = options?.isAuthenticated;

  return useMemo(
    () => resolveChatbotPageContext(pathname, useArabic, {
      canAccessOwnerPortal,
      dashboardPath,
      isAuthenticated,
    }),
    [pathname, useArabic, canAccessOwnerPortal, dashboardPath, isAuthenticated],
  );
}
