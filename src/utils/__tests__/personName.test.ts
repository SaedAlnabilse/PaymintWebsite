import { describe, it, expect } from 'vitest';
import { getPersonInitials, getPersonDisplayName } from '../personName';

describe('getPersonInitials', () => {
    it('builds initials from first and last name', () => {
        expect(getPersonInitials({ firstName: 'saed', lastName: 'nabelsi' })).toBe('SN');
    });

    it('handles an empty last name without throwing', () => {
        expect(getPersonInitials({ firstName: 'Saed', lastName: '' })).toBe('S');
    });

    it('handles undefined/null names without throwing', () => {
        expect(getPersonInitials({})).toBe('?');
        expect(getPersonInitials({ firstName: null, lastName: null })).toBe('?');
    });

    it('falls back to username, then email', () => {
        expect(getPersonInitials({ firstName: '', lastName: '', username: 'cashier1' })).toBe('C');
        expect(getPersonInitials({ firstName: '   ', username: '', email: 'a@b.com' })).toBe('A');
    });

    it('ignores surrounding whitespace', () => {
        expect(getPersonInitials({ firstName: '  ali ', lastName: '  hassan' })).toBe('AH');
    });

    it('leaves non-latin initials intact', () => {
        expect(getPersonInitials({ firstName: 'أحمد', lastName: '' })).toBe('أ');
    });
});

describe('getPersonDisplayName', () => {
    it('joins first and last name', () => {
        expect(getPersonDisplayName({ firstName: 'Saed', lastName: 'Nabelsi' })).toBe('Saed Nabelsi');
    });

    it('does not leave a trailing space when the last name is empty', () => {
        expect(getPersonDisplayName({ firstName: 'Saed', lastName: '' })).toBe('Saed');
    });

    it('falls back to username, then email, then the fallback', () => {
        expect(getPersonDisplayName({ firstName: '', lastName: '', username: 'cashier1' })).toBe('cashier1');
        expect(getPersonDisplayName({ email: 'a@b.com' })).toBe('a@b.com');
        expect(getPersonDisplayName({}, 'Unknown')).toBe('Unknown');
        expect(getPersonDisplayName({})).toBe('');
    });
});
