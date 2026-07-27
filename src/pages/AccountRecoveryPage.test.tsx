import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import { AccountRecoveryPage } from './AccountRecoveryPage';

const auth = {
  account: {
    id: 'account-1',
    email: 'owner@example.com',
    firstName: 'Owner',
    lastName: 'One',
    emailVerified: true,
    trialUsed: true,
    authProvider: 'google' as const,
    deletionRequestedAt: '2026-07-01T10:00:00.000Z',
    deletionScheduledFor: '2026-07-31T10:00:00.000Z',
  },
  establishments: [],
  logout: vi.fn(),
  refreshEstablishments: vi.fn(),
  refreshProfile: vi.fn(),
  updateAccount: vi.fn(),
};

vi.mock('../config/api', () => ({
  default: { post: vi.fn() },
  extractErrorMessage: vi.fn(() => ''),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => auth,
}));

vi.mock('../components/GoogleAuthButton', () => ({
  GoogleAuthButton: ({ onSuccess }: { onSuccess: (credential: string) => void }) => (
    <button type="button" onClick={() => onSuccess('google-id-token')}>
      verify Google
    </button>
  ),
}));

vi.mock('../components/AppleAuthButton', () => ({
  AppleAuthButton: () => null,
}));

vi.mock('../components/SecurityVerificationModal', () => ({
  SecurityVerificationModal: () => null,
}));

vi.mock('../components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => null,
}));

vi.mock('../components/ThemeToggle', () => ({
  ThemeToggle: () => null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue || key,
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('AccountRecoveryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.refreshProfile.mockResolvedValue(undefined);
    auth.refreshEstablishments.mockResolvedValue([
      {
        id: 'location-1',
        name: 'Recovered cafe',
        type: 'CAFE',
        currency: 'JOD',
        subscriptionStatus: 'ACTIVE',
      },
    ]);
    vi.mocked(api.post).mockResolvedValue({
      data: { message: 'Account restored' },
    });
  });

  it('reauthenticates a Google account, then refreshes account and locations', async () => {
    render(
      <MemoryRouter>
        <AccountRecoveryPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'verify Google' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/accounts/me/restore',
        { authProvider: 'google', credential: 'google-id-token' },
        { headers: { 'X-Skip-Auth-Redirect': 'true' } },
      );
    });
    expect(auth.updateAccount).toHaveBeenCalledWith({
      deletionRequestedAt: null,
      deletionScheduledFor: null,
    });
    expect(auth.refreshProfile).toHaveBeenCalledTimes(1);
    expect(auth.refreshEstablishments).toHaveBeenCalledTimes(1);
  });
});
