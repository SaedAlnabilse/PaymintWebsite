import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBackofficeAlerts } from '../../hooks/useBackofficeAlerts';
import { checkPermission } from '../../hooks/usePermissionGuard';
import type { BackofficeAlert } from '../../services/backofficeAlertsApi';
import { AlertsBell } from './AlertsBell';

const account = vi.hoisted(() => ({
  id: 'account-1',
  isSecondaryAdmin: true,
}));
const notificationPermissions = vi.hoisted(() => [
  'dashboard',
  'view_reports',
  'manage_inventory',
  'manage_employees',
  'manage_settings',
  'manage_billing',
  'manage_open_tickets',
  'pos',
]);

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ brandId: 'brand-1', locationSlug: 'cafe-route' }),
  };
});

vi.mock('../../config/permissions', () => ({
  REQUIRED_PERMISSIONS: { notifications: notificationPermissions },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ account }),
}));

vi.mock('../../hooks/usePermissionGuard', () => ({
  checkPermission: vi.fn(),
}));

vi.mock('../../hooks/useBackofficeAlerts', () => ({
  useBackofficeAlerts: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (
      key: string,
      options?: { count?: number; defaultValue?: string },
    ) =>
      (options?.defaultValue || key).replace(
        '{{count}}',
        String(options?.count ?? ''),
      ),
  }),
}));

const createHookResult = (
  overrides: Record<string, unknown> = {},
) => ({
  alerts: [] as BackofficeAlert[],
  counts: null,
  total: 0,
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  hasMore: false,
  refresh: vi.fn(async () => undefined),
  retry: vi.fn(async () => undefined),
  loadMore: vi.fn(async () => undefined),
  markRead: vi.fn(async (alert: BackofficeAlert) => ({
    ...alert,
    isRead: true,
  })),
  markAllRead: vi.fn(async () => ({ updated: 0 })),
  dismiss: vi.fn(async () => ({ message: 'Deleted', deleted: true as const })),
  ...overrides,
});

describe('AlertsBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkPermission).mockReturnValue(true);
  });

  it('uses the centralized notifications permission and stays hidden without access', () => {
    vi.mocked(checkPermission).mockReturnValue(false);
    vi.mocked(useBackofficeAlerts).mockReturnValue(createHookResult());

    const { container } = render(
      <MemoryRouter>
        <AlertsBell scope="owner" />
      </MemoryRouter>,
    );

    expect(checkPermission).toHaveBeenCalledWith(
      account,
      notificationPermissions,
    );
    expect(container).toBeEmptyDOMElement();
    expect(useBackofficeAlerts).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false, mode: 'count' }),
    );
  });

  it('caps the badge and links straight to the location notifications screen', () => {
    vi.mocked(useBackofficeAlerts).mockReturnValue(
      createHookResult({ unreadCount: 120 }),
    );

    render(
      <MemoryRouter>
        <AlertsBell
          scope="location"
          establishmentId="location-a"
          locations={[{ id: 'location-a', name: 'Cafe', slug: 'cafe-slug' }]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
    const link = screen.getByRole('link', {
      name: 'Notifications, 120 unread',
    });
    expect(link).toHaveAttribute('href', '/dashboard/cafe-route/notifications');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('links to the brand notifications screen', () => {
    vi.mocked(useBackofficeAlerts).mockReturnValue(createHookResult());

    render(
      <MemoryRouter>
        <AlertsBell scope="brand" />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Notifications, 0 unread' }),
    ).toHaveAttribute('href', '/brand/brand-1/notifications');
  });

  it('marks the bell active while the notifications screen is open', () => {
    vi.mocked(useBackofficeAlerts).mockReturnValue(createHookResult());

    render(
      <MemoryRouter initialEntries={['/owner/notifications']}>
        <AlertsBell scope="owner" />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Notifications, 0 unread' });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('text-mintcom-green');
  });
});
