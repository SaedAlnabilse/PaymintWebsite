import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import { SecurityVerificationModal } from './SecurityVerificationModal';

vi.mock('../config/api', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    account: {
      email: 'owner@example.com',
    },
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'common.locale' ? 'en' : key),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../hooks/useScrollLock', () => ({ useScrollLock: vi.fn() }));
vi.mock('./QuickInfo', () => ({ QuickInfo: () => null }));
vi.mock('./GoogleAuthButton', () => ({
  GoogleAuthButton: ({ nonce }: { nonce?: string }) => (
    <button type="button" data-testid="google-button" data-nonce={nonce}>
      google
    </button>
  ),
}));
vi.mock('./AppleAuthButton', () => ({
  AppleAuthButton: () => null,
}));

const CHALLENGE_URL = '/api/auth/step-up/challenge';
const VERIFY_URL = '/api/auth/step-up/verify';
const SEND_CODE_URL = '/api/auth/step-up/send-code';

/** Mock the step-up handshake, returning the methods the server would offer. */
const mockStepUp = (methods: string[]) => {
  vi.mocked(api.post).mockImplementation((url: string) => {
    if (url === CHALLENGE_URL) {
      return Promise.resolve({
        data: {
          challengeId: 'challenge-1',
          nonce: 'server-nonce',
          methods,
          expiresInSeconds: 600,
        },
      });
    }
    if (url === VERIFY_URL) {
      return Promise.resolve({ data: { reauthToken: 'reauth-token-1' } });
    }
    if (url === SEND_CODE_URL) {
      return Promise.resolve({ data: { email: 'o***r@example.com' } });
    }
    return Promise.resolve({ data: { message: 'Subscription reactivated' } });
  });
};

const renderModal = (props: Record<string, unknown> = {}) =>
  render(
    <SecurityVerificationModal
      isOpen
      onClose={vi.fn()}
      onSuccess={vi.fn().mockResolvedValue(undefined)}
      targetId="location-1"
      targetName="Cafe One"
      mode="reactivate"
      isResuming={false}
      {...props}
    />,
  );

describe('SecurityVerificationModal step-up verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exchanges the password for a reauth token and sends no credential with the action', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    mockStepUp(['password', 'email-otp']);

    renderModal({ onSuccess });

    const passwordInput = await waitFor(() => {
      const input = document.querySelector<HTMLInputElement>(
        'input[type="password"]',
      );
      expect(input).not.toBeNull();
      return input!;
    });

    expect(api.post).toHaveBeenCalledWith(
      CHALLENGE_URL,
      { action: 'resume-subscription', targetId: 'location-1' },
      { headers: { 'X-Skip-Auth-Redirect': 'true' } },
    );

    fireEvent.change(passwordInput, { target: { value: 'OwnerPassword1!' } });
    fireEvent.click(
      screen.getByRole('button', { name: 'security.modes.reactivate.button' }),
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        VERIFY_URL,
        {
          challengeId: 'challenge-1',
          method: 'password',
          password: 'OwnerPassword1!',
          email: 'owner@example.com',
        },
        { headers: { 'X-Skip-Auth-Redirect': 'true' } },
      );
    });

    // The destructive call carries the proof in a header and an empty body —
    // no password is transmitted with the action itself.
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/accounts/subscriptions/location-1/resume',
        {},
        {
          headers: {
            'X-Reauth-Token': 'reauth-token-1',
            'X-Skip-Auth-Redirect': 'true',
          },
        },
      );
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('offers no password field to an owner who never set one', async () => {
    // This is the case the old dialog could not handle: a Google/Apple owner
    // was shown a password prompt they could never satisfy.
    mockStepUp(['google', 'email-otp']);

    renderModal();

    await waitFor(() => {
      expect(screen.getByTestId('google-button')).toBeTruthy();
    });
    expect(
      document.querySelector('input[type="password"]'),
    ).toBeNull();
  });

  it('binds the server-issued nonce into the Google sign-in so it cannot be replayed', async () => {
    mockStepUp(['google', 'email-otp']);

    renderModal();

    await waitFor(() => {
      expect(
        screen.getByTestId('google-button').getAttribute('data-nonce'),
      ).toBe('server-nonce');
    });
  });

  it('always offers the emailed code as a fallback', async () => {
    mockStepUp(['password', 'email-otp']);

    renderModal();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'security.stepUp.useEmail' }),
      ).toBeTruthy();
    });
  });

  it('scopes account-level actions to the account instead of a target record', async () => {
    mockStepUp(['password', 'email-otp']);

    renderModal({ mode: 'delete-account', targetId: 'ignored' });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        CHALLENGE_URL,
        { action: 'delete-account' },
        { headers: { 'X-Skip-Auth-Redirect': 'true' } },
      );
    });
  });
});
