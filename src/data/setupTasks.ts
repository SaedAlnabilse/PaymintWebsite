/**
 * Canonical setup-guide task IDs (order matters).
 * Badge count + completion checks must use this list so they never drift
 * from TasksModal.
 */
export const SETUP_TASK_IDS = [
  'location-profile',
  'receipt-settings',
  'setup-taxes',
  'setup-payments',
  'create-category',
  'add-product',
  'addons',
  'discounts',
  'loyalty',
  'roles',
  'add-staff',
  'go-live',
] as const;

export type SetupTaskId = (typeof SETUP_TASK_IDS)[number];

export const TOTAL_SETUP_TASKS = SETUP_TASK_IDS.length;

export const getTasksStorageKey = (contextId: string) =>
  `mintcom.widget.tasks.v1.${contextId}`;

export const getPopupSeenKey = (contextId: string) =>
  `mintcom.widget.tasks.popup.seen.${contextId}`;

/** Match TasksModal: derive context from the URL (useParams is empty outside route trees). */
export function getDashboardTasksContextId(pathname: string): string {
  const match = pathname.match(/^\/dashboard\/([^/]+)/);
  return match ? `dashboard-${match[1]}` : 'global';
}

export function countPendingSetupTasks(
  completedById: Record<string, boolean> | null | undefined,
): number {
  if (!completedById) return TOTAL_SETUP_TASKS;
  return SETUP_TASK_IDS.filter((id) => !completedById[id]).length;
}

export function areAllSetupTasksCompleted(
  completedById: Record<string, boolean> | null | undefined,
): boolean {
  if (!completedById) return false;
  return SETUP_TASK_IDS.every((id) => Boolean(completedById[id]));
}

export function readCompletedTasksMap(storageKey: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, boolean>;
    }
  } catch {
    // ignore invalid storage
  }
  return {};
}
