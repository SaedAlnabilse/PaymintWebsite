import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBackofficeAlerts } from '../../hooks/useBackofficeAlerts';
import { checkPermission } from '../../hooks/usePermissionGuard';
import type { BackofficeAlert } from '../../services/backofficeAlertsApi';
import { AlertsBell } from './AlertsBell';

const navigateMock = vi.hoisted(() => vi.fn());
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
    useNavigate: () => navigateMock,
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

vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), { error: vi.fn() }),
}));

vi.mock('./AlertRow', () => ({
  AlertRow: ({
    alert,
    onActivate,
  }: {
    alert: BackofficeAlert;
    onActivate?: (alert: BackofficeAlert) => void;
  }) => (
    <button
      type="button"
      data-testid={`alert-${alert.id}`}
      onClick={() => onActivate?.(alert)}
    >
      {alert.title}
    </button>
  ),
}));

const makeAlert = (
  id: string,
  overrides: Partial<BackofficeAlert> = {},
): BackofficeAlert => ({
  id,
  type: 'STOCK_ALERT_RED',
  alertKind: 'stock_critical',
  severity: 'critical',
  title: `Alert ${id}`,
  message: 'Needs attention',
  isRead: false,
  isDismissible: true,
  createdAt: '2026-07-26T10:00:00.000Z',
  establishmentId: 'location-a',
  ...overrides,
});

const createHookResult = (
  overrides: Record<string, unknown> = {},
) => ({
  alerts: [],
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
    expect(useBackofficeAlerts).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ enabled: false, mode: 'count' }),
    );
    expect(useBackofficeAlerts).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ enabled: false, mode: 'feed' }),
    );
  });

  it('caps the badge, lazily enables the preview, and closes on Escape', () => {
    const countResult = createHookResult({ unreadCount: 120 });
    const previewResult = createHookResult();
    vi.mocked(useBackofficeAlerts).mockImplementation((options) =>
      options.mode === 'count' ? countResult : previewResult,
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
    fireEvent.click(
      screen.getByRole('button', { name: 'Notifications, 120 unread' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useBackofficeAlerts).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        mode: 'feed',
        pageSize: 5,
        poll: false,
      }),
    );
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute(
      'href',
      '/dashboard/cafe-route/notifications',
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens beside a desktop sidebar using direction-aware logical positioning', () => {
    vi.mocked(useBackofficeAlerts).mockReturnValue(createHookResult());

    render(
      <MemoryRouter>
        <AlertsBell scope="owner" placement="sidebar" />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Notifications, 0 unread' }),
    );

    expect(screen.getByRole('dialog')).toHaveClass('fixed', 'bottom-4');
    expect(screen.getByRole('dialog')).toHaveStyle({ visibility: 'visible' });
    expect(screen.getByRole('dialog')).not.toHaveClass('end-0');
  });

  it('navigates trial alerts without marking them read', () => {
    const trial = makeAlert('trial', {
      type: 'TRIAL_EXPIRING',
      alertKind: 'billing',
      isDismissible: false,
    });
    const countResult = createHookResult({ unreadCount: 1 });
    const previewResult = createHookResult({ alerts: [trial], total: 1 });
    vi.mocked(useBackofficeAlerts).mockImplementation((options) =>
      options.mode === 'count' ? countResult : previewResult,
    );

    render(
      <MemoryRouter>
        <AlertsBell scope="owner" />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Notifications, 1 unread' }),
    );
    fireEvent.click(screen.getByTestId('alert-trial'));

    expect(previewResult.markRead).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/owner/billing');
  });

  it('uses the supplied slug map for alert deep links and marks normal rows read', async () => {
    const alert = makeAlert('stock');
    const countResult = createHookResult({ unreadCount: 1 });
    const previewResult = createHookResult({ alerts: [alert], total: 1 });
    vi.mocked(useBackofficeAlerts).mockImplementation((options) =>
      options.mode === 'count' ? countResult : previewResult,
    );

    render(
      <MemoryRouter>
        <AlertsBell
          scope="owner"
          locations={[
            { id: 'location-a', name: 'Cafe', slug: 'mapped-cafe' },
          ]}
        />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Notifications, 1 unread' }),
    );
    fireEvent.click(screen.getByTestId('alert-stock'));

    await waitFor(() => expect(previewResult.markRead).toHaveBeenCalledWith(alert));
    expect(navigateMock).toHaveBeenCalledWith(
      '/dashboard/mapped-cafe/products',
    );
  });
});
