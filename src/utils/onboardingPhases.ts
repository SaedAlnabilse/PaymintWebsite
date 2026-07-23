/** Canonical onboarding phase slugs used in the URL. */
export const ONBOARDING_PHASES = [
  'profile',
  'location-login',
  'owner-login',
  'billing',
  'launch',
] as const;

export type OnboardingPhaseSlug = (typeof ONBOARDING_PHASES)[number];

export type ApiOnboardingPhase =
  | 'PROFILE'
  | 'LOCATION_LOGIN'
  | 'OWNER_LOGIN'
  | 'BILLING'
  | 'LAUNCH'
  | 'COMPLETED';

export const phaseToStepNumber: Record<OnboardingPhaseSlug, number> = {
  profile: 1,
  'location-login': 2,
  'owner-login': 3,
  billing: 4,
  launch: 5,
};

export const stepNumberToPhase: Record<number, OnboardingPhaseSlug> = {
  1: 'profile',
  2: 'location-login',
  3: 'owner-login',
  4: 'billing',
  5: 'launch',
};

const API_TO_SLUG: Record<ApiOnboardingPhase, OnboardingPhaseSlug> = {
  PROFILE: 'profile',
  LOCATION_LOGIN: 'location-login',
  OWNER_LOGIN: 'owner-login',
  BILLING: 'billing',
  LAUNCH: 'launch',
  COMPLETED: 'launch',
};

export function mapApiPhase(phase: string | undefined | null): OnboardingPhaseSlug {
  if (!phase) return 'profile';
  const key = phase.toUpperCase() as ApiOnboardingPhase;
  return API_TO_SLUG[key] || 'profile';
}

export function isLaunchLocked(
  serverPhase: OnboardingPhaseSlug,
  apiPhase?: string | null,
): boolean {
  if (serverPhase === 'launch') return true;
  const upper = String(apiPhase || '').toUpperCase();
  return upper === 'LAUNCH' || upper === 'COMPLETED';
}

/**
 * Clamp a requested phase against the server-allowed phase.
 * - Cannot skip ahead of server progress.
 * - After launch/complete, always force launch (no back to payment).
 */
export function clampPhase(
  requested: string | undefined,
  serverPhase: OnboardingPhaseSlug,
  locked: boolean,
): OnboardingPhaseSlug {
  if (locked || serverPhase === 'launch') {
    return 'launch';
  }

  const reqIdx = ONBOARDING_PHASES.indexOf(requested as OnboardingPhaseSlug);
  const maxIdx = ONBOARDING_PHASES.indexOf(serverPhase);

  if (reqIdx === -1) {
    return serverPhase;
  }

  // Cannot go past server phase (skip).
  if (reqIdx > maxIdx) {
    return serverPhase;
  }

  // Before complete: allow revisiting earlier phases.
  return ONBOARDING_PHASES[reqIdx];
}

export function isOnboardingPhaseSlug(value: string | undefined): value is OnboardingPhaseSlug {
  return !!value && (ONBOARDING_PHASES as readonly string[]).includes(value);
}
