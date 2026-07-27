import api from '../config/api';

/**
 * Client for the step-up (re-authentication) endpoints.
 *
 * High-impact actions need proof the owner is present *now*, not just that a
 * session exists. The server decides which proofs a given account can produce —
 * an owner who signed up with Google has no password, so asking for one (as the
 * old confirmation dialog did) left them permanently unable to continue.
 */

export type StepUpMethod = 'password' | 'google' | 'apple' | 'email-otp';

export type StepUpAction =
  | 'delete-account-employee'
  | 'delete-staff'
  | 'revoke-brand-access'
  | 'delete-card'
  | 'delete-customer'
  | 'cancel-subscription'
  | 'resume-subscription'
  | 'stop-trial'
  | 'dissolve-brand'
  | 'dissolve-establishment'
  | 'request-establishment-deletion'
  | 'delete-account'
  | 'restore-account';

export interface StepUpChallenge {
  challengeId: string;
  /** Bind this into the Google/Apple identity token so it cannot be replayed. */
  nonce: string;
  methods: StepUpMethod[];
  expiresInSeconds: number;
}

/** Header the destructive request must carry to spend the proof. */
export const REAUTH_HEADER = 'X-Reauth-Token';

const SKIP_REDIRECT = { 'X-Skip-Auth-Redirect': 'true' } as const;

export async function requestStepUpChallenge(
  action: StepUpAction,
  targetId?: string,
): Promise<StepUpChallenge> {
  const { data } = await api.post(
    '/api/auth/step-up/challenge',
    { action, ...(targetId ? { targetId } : {}) },
    { headers: SKIP_REDIRECT },
  );
  return data as StepUpChallenge;
}

/** Mails the one-time code. Returns the masked address it was sent to. */
export async function sendStepUpCode(
  challengeId: string,
): Promise<{ email: string }> {
  const { data } = await api.post(
    '/api/auth/step-up/send-code',
    { challengeId },
    { headers: SKIP_REDIRECT },
  );
  return data as { email: string };
}

type VerifyPayload =
  | { method: 'password'; password: string; email?: string }
  | { method: 'google'; credential: string }
  | { method: 'apple'; identityToken: string; nonce: string }
  | { method: 'email-otp'; otp: string };

export async function verifyStepUp(
  challengeId: string,
  payload: VerifyPayload,
): Promise<string> {
  const { data } = await api.post(
    '/api/auth/step-up/verify',
    { challengeId, ...payload },
    { headers: SKIP_REDIRECT },
  );
  return (data as { reauthToken: string }).reauthToken;
}

/** Headers for the destructive request that spends the proof. */
export function reauthHeaders(reauthToken: string): Record<string, string> {
  return { [REAUTH_HEADER]: reauthToken, ...SKIP_REDIRECT };
}
