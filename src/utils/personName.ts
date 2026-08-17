/**
 * Helpers for rendering people (employees, admins, account owners).
 *
 * `firstName` / `lastName` are non-nullable columns in the API, but they are
 * allowed to be EMPTY strings: staff can be created without a last name, and
 * the mirrored owner-employee splits a single-word account name into
 * `firstName` + `lastName: ''`. Indexing straight into them (`name[0]`) throws
 * "Cannot read properties of undefined (reading 'toUpperCase')" and takes the
 * whole page down, so avatar/label rendering must go through these helpers.
 */

export interface PersonNameParts {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    email?: string | null;
}

const firstChar = (value?: string | null) => (value ?? '').trim().charAt(0);

/**
 * Up to two initials, falling back to username/email and finally `fallback`.
 * Never throws and never returns an empty string.
 */
export function getPersonInitials(person: PersonNameParts, fallback = '?'): string {
    const initials = `${firstChar(person.firstName)}${firstChar(person.lastName)}`;
    const resolved = initials || firstChar(person.username) || firstChar(person.email);
    return (resolved || fallback).toUpperCase();
}

/**
 * Full name without the stray whitespace an empty first/last name leaves
 * behind, falling back to username/email and finally `fallback`.
 */
export function getPersonDisplayName(person: PersonNameParts, fallback = ''): string {
    const fullName = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
    return fullName || (person.username ?? '').trim() || (person.email ?? '').trim() || fallback;
}
