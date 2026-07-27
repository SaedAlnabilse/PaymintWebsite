import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertCircle, Bell, LoaderCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { REQUIRED_PERMISSIONS } from '../../config/permissions';
import { useAuth } from '../../context/AuthContext';
import { useBackofficeAlerts } from '../../hooks/useBackofficeAlerts';
import { checkPermission } from '../../hooks/usePermissionGuard';
import type {
  BackofficeAlert,
  BackofficeAlertScope,
} from '../../services/backofficeAlertsApi';
import { AlertRow } from './AlertRow';
import {
  isTrialAlert,
  resolveAlertDeepLink,
  type EstablishmentSlugLookup,
} from './alertPresentation';

export interface AlertsBellLocation {
  id: string;
  name: string;
  slug?: string;
  currency?: string;
}

export interface AlertsBellProps {
  scope: BackofficeAlertScope;
  establishmentId?: string;
  establishmentIds?: readonly string[];
  locations?: readonly AlertsBellLocation[];
  className?: string;
}

const getAbsoluteLocationPath = (
  relativePath: string | null,
  locationSlug?: string,
): string | null => {
  if (!relativePath || !relativePath.startsWith('../')) return relativePath;
  if (!locationSlug) return null;
  return `/dashboard/${encodeURIComponent(locationSlug)}/${relativePath.slice(
    3,
  )}`;
};

export function AlertsBell({
  scope,
  establishmentId,
  establishmentIds,
  locations = [],
  className = '',
}: AlertsBellProps) {
  const { t } = useTranslation();
  const { account } = useAuth();
  const navigate = useNavigate();
  const { brandId, locationSlug } = useParams<{
    brandId?: string;
    locationSlug?: string;
  }>();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasAccess = checkPermission(
    account,
    REQUIRED_PERMISSIONS.notifications,
  );
  const countState = useBackofficeAlerts({
    scope,
    establishmentId,
    establishmentIds,
    enabled: hasAccess,
    mode: 'count',
  });
  const previewState = useBackofficeAlerts({
    scope,
    establishmentId,
    establishmentIds,
    enabled: hasAccess && isOpen,
    mode: 'feed',
    pageSize: 5,
    poll: false,
  });

  const establishmentSlugById = useMemo<EstablishmentSlugLookup>(
    () =>
      Object.fromEntries(
        locations.map((location) => [location.id, location.slug]),
      ),
    [locations],
  );
  const activeLocationSlug =
    locationSlug ||
    (establishmentId
      ? establishmentSlugById[establishmentId] || undefined
      : undefined);

  const viewAllPath = useMemo(() => {
    if (scope === 'owner') return '/owner/notifications';
    if (scope === 'brand') {
      return brandId
        ? `/brand/${encodeURIComponent(brandId)}/notifications`
        : null;
    }
    return activeLocationSlug
      ? `/dashboard/${encodeURIComponent(activeLocationSlug)}/notifications`
      : null;
  }, [activeLocationSlug, brandId, scope]);

  const resolveBellDeepLink = useCallback(
    (alert: BackofficeAlert): string | null => {
      const path = resolveAlertDeepLink(alert, scope, {
        establishmentSlugById,
      });
      if (scope !== 'location') return path;

      const alertLocationSlug = alert.establishmentId
        ? establishmentSlugById[alert.establishmentId] || activeLocationSlug
        : activeLocationSlug;
      return getAbsoluteLocationPath(path, alertLocationSlug || undefined);
    }, [activeLocationSlug, establishmentSlugById, scope],
  );

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const activateAlert = useCallback(
    (alert: BackofficeAlert) => {
      const deepLink = resolveBellDeepLink(alert);
      if (!deepLink) return;

      // Trial alerts are deliberately persistent. They may lead to billing,
      // but clicking them must never issue the mark-read request the API ignores.
      if (!isTrialAlert(alert) && !alert.isRead) {
        void previewState.markRead(alert).catch(() => undefined);
      }
      setIsOpen(false);
      navigate(deepLink);
    }, [navigate, previewState, resolveBellDeepLink],
  );

  const dismissPreviewAlert = useCallback(
    (alert: BackofficeAlert) => {
      void previewState
        .dismiss(alert)
        .then((result) => {
          if (result.blocked) toast(result.message);
        })
        .catch(() => {
          toast.error(
            t('notifications.bell.loadFailed', {
              defaultValue: 'Failed to load notifications.',
            }),
          );
        });
    }, [previewState, t],
  );

  if (!hasAccess) return null;

  const unreadCount = countState.unreadCount;
  const badge = unreadCount > 99 ? '99+' : String(unreadCount);
  const bellLabel = t('notifications.bell.ariaLabel', {
    count: unreadCount,
    defaultValue: 'Notifications, {{count}} unread',
  });

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-mintcom-green dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
        aria-label={bellLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -end-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white dark:ring-[#0D0D0D]"
            aria-hidden="true"
          >
            {badge}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id={panelId}
          role="dialog"
          aria-label={t('notifications.bell.recentTitle', {
            defaultValue: 'Recent notifications',
          })}
          className="absolute end-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#0D0D0D] dark:shadow-black/40"
        >
          <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-white/5">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-gray-900 dark:text-white">
                {t('notifications.bell.recentTitle', {
                  defaultValue: 'Recent notifications',
                })}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('notifications.bell.ariaLabel', {
                  count: unreadCount,
                  defaultValue: 'Notifications, {{count}} unread',
                })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {previewState.isRefreshing && (
                <LoaderCircle
                  className="animate-spin text-mintcom-green"
                  size={16}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-mintcom-green dark:hover:bg-white/[0.06] dark:hover:text-white"
                aria-label={t('notifications.accessibility.closeDropdown', {
                  defaultValue: 'Close notifications',
                })}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="max-h-[min(28rem,65vh)] overflow-y-auto">
            {previewState.isLoading ? (
              <div
                className="space-y-3 p-4"
                aria-label={t('common.loading', { defaultValue: 'Loading' })}
              >
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex animate-pulse gap-3"
                    aria-hidden="true"
                  >
                    <span className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
                    <span className="flex-1 space-y-2 py-1">
                      <span className="block h-3 w-3/4 rounded bg-gray-100 dark:bg-white/[0.06]" />
                      <span className="block h-3 w-1/2 rounded bg-gray-100 dark:bg-white/[0.06]" />
                    </span>
                  </div>
                ))}
              </div>
            ) : previewState.error ? (
              <div className="flex flex-col items-center px-6 py-8 text-center">
                <AlertCircle
                  size={24}
                  className="mb-2 text-red-500"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('notifications.bell.loadFailed', {
                    defaultValue: 'Failed to load notifications.',
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => void previewState.retry()}
                  className="mt-3 rounded-lg px-3 py-1.5 text-sm font-bold text-mintcom-green transition hover:bg-mintcom-green/10 focus:outline-none focus:ring-2 focus:ring-mintcom-green"
                >
                  {t('notifications.actions.retry', { defaultValue: 'Retry' })}
                </button>
              </div>
            ) : previewState.alerts.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-9 text-center">
                <Bell
                  size={25}
                  className="mb-2 text-gray-300 dark:text-gray-600"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {t('notifications.bell.empty', {
                    defaultValue: 'No notifications',
                  })}
                </p>
              </div>
            ) : (
              previewState.alerts.slice(0, 5).map((alert) => {
                const deepLink = resolveBellDeepLink(alert);
                return (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    compact
                    onActivate={deepLink ? activateAlert : undefined}
                    onDismiss={dismissPreviewAlert}
                  />
                );
              })
            )}
          </div>

          {viewAllPath && (
            <footer className="border-t border-gray-100 p-2 dark:border-white/5">
              <Link
                to={viewAllPath}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-2 text-center text-sm font-black text-mintcom-green transition hover:bg-mintcom-green/10 focus:outline-none focus:ring-2 focus:ring-mintcom-green"
              >
                {t('notifications.actions.viewAll', {
                  defaultValue: 'View all',
                })}
              </Link>
            </footer>
          )}
        </section>
      )}
    </div>
  );
}

export default AlertsBell;
