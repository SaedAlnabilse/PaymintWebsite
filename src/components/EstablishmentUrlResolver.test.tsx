import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstablishmentUrlResolver } from './EstablishmentUrlResolver';

const auth = {
  establishments: [
    {
      id: 'location-1',
      name: 'Cafe One',
      type: 'CAFE',
      currency: 'JOD',
      subscriptionStatus: 'CANCELED',
      establishmentLoginId: 'cafe-one',
      isActive: false,
      deletionRequestedAt: '2026-07-01T10:00:00.000Z',
      deletionScheduledFor: '2026-07-31T10:00:00.000Z',
      deletionExportSentTo: 'owner@example.com',
      accessLockReason: 'PENDING_DELETION',
    },
  ],
  currentEstablishment: null as any,
  setCurrentEstablishment: vi.fn(),
  isLoading: false,
  isAuthenticated: true,
  needsOnboarding: false,
  account: { id: 'account-1', email: 'owner@example.com' },
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => auth,
}));

function RecoveryChild() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.search}`}</output>;
}

describe('EstablishmentUrlResolver deletion recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.currentEstablishment = auth.establishments[0];
  });

  it('keeps a manually pending location selectable but routes it only to Settings recovery', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/cafe-one/orders']}>
        <Routes>
          <Route
            path="/dashboard/:locationSlug/*"
            element={
              <EstablishmentUrlResolver>
                <RecoveryChild />
              </EstablishmentUrlResolver>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('/dashboard/cafe-one/settings?section=danger-zone&restoreDeletion=1')).toBeInTheDocument();
    });
    expect(auth.setCurrentEstablishment).toHaveBeenCalledWith(
      auth.establishments[0],
    );
  });
});
