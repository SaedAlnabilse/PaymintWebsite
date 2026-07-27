import api from '../config/api';

export const SETUP_GUIDE_KEY = 'ESTABLISHMENT_SETUP' as const;

export type SetupGuideState = {
  guideKey: typeof SETUP_GUIDE_KEY;
  guideVersion: number;
  eligible: boolean;
  alreadySeen: boolean;
  shouldOffer: boolean;
  canReplay: boolean;
};

export type SetupGuideClaimResult =
  | { granted: true; guideVersion: number }
  | { granted: false; reason: 'ALREADY_SEEN' | 'NOT_ELIGIBLE' };

export type SetupGuideReplayResult = {
  allowed: boolean;
};

export type SetupGuideOutcome = 'COMPLETED' | 'DISMISSED';

const establishmentHeaders = (establishmentId: string) => ({
  'X-Establishment-Id': establishmentId,
});

export async function getSetupGuideState(
  establishmentId: string,
): Promise<SetupGuideState> {
  const response = await api.get('/api/setup-guide/state', {
    params: { establishmentId },
    headers: establishmentHeaders(establishmentId),
  });
  return response.data;
}

export async function claimSetupGuide(
  establishmentId: string,
): Promise<SetupGuideClaimResult> {
  const response = await api.post(
    '/api/setup-guide/claim',
    {
      establishmentId,
      guideKey: SETUP_GUIDE_KEY,
    },
    { headers: establishmentHeaders(establishmentId) },
  );
  return response.data;
}

export async function replaySetupGuide(
  establishmentId: string,
): Promise<SetupGuideReplayResult> {
  const response = await api.post(
    '/api/setup-guide/replay',
    {
      establishmentId,
      guideKey: SETUP_GUIDE_KEY,
    },
    { headers: establishmentHeaders(establishmentId) },
  );
  return response.data;
}

export async function reportSetupGuideProgress(
  establishmentId: string,
  outcome: SetupGuideOutcome,
  lastStepIndex?: number,
): Promise<void> {
  await api.patch(
    '/api/setup-guide/progress',
    {
      establishmentId,
      guideKey: SETUP_GUIDE_KEY,
      outcome,
      ...(lastStepIndex === undefined ? {} : { lastStepIndex }),
    },
    { headers: establishmentHeaders(establishmentId) },
  );
}
