import type { TFunction } from 'i18next';

const SYSTEM_ROLE_NAME_KEYS: Record<string, string> = {
  'back office analyst': 'roles.systemNames.backOfficeAnalyst',
  'backoffice analyst': 'roles.systemNames.backOfficeAnalyst',
  cashier: 'roles.systemNames.cashier',
  'inventory manager': 'roles.systemNames.inventoryManager',
  'kitchen staff': 'roles.systemNames.kitchenStaff',
  'operations manager': 'roles.systemNames.operationsManager',
  'shift supervisor': 'roles.systemNames.shiftSupervisor',
};

const normalizeRoleName = (roleName: string) =>
  roleName
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

export const getLocalizedRoleName = (roleName: string, t: TFunction): string => {
  if (!roleName) return '';

  const key = SYSTEM_ROLE_NAME_KEYS[normalizeRoleName(roleName)];
  if (!key) return roleName;

  const translated = t(key);
  return translated === key ? roleName : translated;
};


/** Minimal shape the staff tables need to describe an assignment's role. */
export interface RoleDisplaySource {
  role?: string;
  customRoleName?: string | null;
}

/**
 * The label for a built-in base role (ADMIN / MANAGER / CASHIER / USER).
 * This is a coarse permission tier, not a job title.
 */
export const getBaseRoleLabel = (role: string | undefined, t: TFunction): string => {
  if (!role) return '';
  if (role.toUpperCase() === 'ACCOUNT_OWNER') {
    return t('staff.roles.accountOwner', { defaultValue: 'Owner' });
  }

  const key = `staff.roles.${role.toLowerCase()}`;
  const translated = t(key);
  if (translated !== key) return translated;

  return role.charAt(0) + role.slice(1).toLowerCase();
};

/**
 * What a staff table should print for one assignment: the role the operator
 * named, falling back to the base role only when no template is attached.
 *
 * Showing the base role alone collapsed every Cashier, Shift Supervisor and
 * Barista Lead into four generic words and disagreed with the employee form,
 * which has always shown the template name.
 */
export const getAssignmentRoleLabel = (
  source: RoleDisplaySource,
  t: TFunction,
): string =>
  source.customRoleName
    ? getLocalizedRoleName(source.customRoleName, t)
    : getBaseRoleLabel(source.role, t);

/**
 * One label for an employee who may hold different roles at different
 * locations. Returns the shared role when they all agree, otherwise a "Mixed"
 * summary — never one branch's role presented as if it applied everywhere.
 */
export const getEmployeeRoleSummary = (
  assignments: RoleDisplaySource[] | undefined,
  fallback: RoleDisplaySource,
  t: TFunction,
): string => {
  const labels = Array.from(
    new Set(
      (assignments || [])
        .map((assignment) => getAssignmentRoleLabel(assignment, t))
        .filter(Boolean),
    ),
  );

  if (labels.length === 0) return getAssignmentRoleLabel(fallback, t);
  if (labels.length === 1) return labels[0];

  return t('staff.table.mixedRoles', {
    count: labels.length,
    defaultValue: `Mixed (${labels.length} roles)`,
  });
};
