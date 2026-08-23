import { describe, expect, it } from 'vitest';
import {
  formatMetadataForExport,
  formatMetadataValue,
  getActionTone,
  getMetadataEntries,
  getRelativeDayKey,
  getVisibleMetadataEntries,
  groupLogsByDay,
  humanizeMetadataKey,
  isIdentifierKey,
  truncateAtWord,
} from '../activityLog';

describe('humanizeMetadataKey', () => {
  it('turns backend field names into readable labels', () => {
    expect(humanizeMetadataKey('inputType')).toBe('Input type');
    expect(humanizeMetadataKey('attributeGroup')).toBe('Attribute group');
    expect(humanizeMetadataKey('points_per_currency')).toBe('Points per currency');
  });
});

describe('formatMetadataValue', () => {
  it('unshouts backend enums', () => {
    expect(formatMetadataValue('MULTI_SELECT')).toBe('Multi select');
    expect(formatMetadataValue('SINGLE_SELECT')).toBe('Single select');
  });

  it('formats booleans with the supplied labels', () => {
    expect(formatMetadataValue(true, { yesLabel: 'Yes', noLabel: 'No' })).toBe('Yes');
    expect(formatMetadataValue('false', { yesLabel: 'Yes', noLabel: 'No' })).toBe('No');
  });

  it('leaves ordinary values alone', () => {
    expect(formatMetadataValue('Chicken Burger')).toBe('Chicken Burger');
    expect(formatMetadataValue(8.5)).toBe('8.5');
  });
});

describe('truncateAtWord', () => {
  it('never cuts in the middle of a word', () => {
    expect(truncateAtWord('Chicken Burger Deluxe Meal', 12)).toBe('Chicken…');
  });

  it('returns short values unchanged', () => {
    expect(truncateAtWord('Sauces', 12)).toBe('Sauces');
  });
});

describe('isIdentifierKey', () => {
  it('recognises opaque identifier fields', () => {
    expect(isIdentifierKey('attributeId')).toBe(true);
    expect(isIdentifierKey('id')).toBe(true);
    expect(isIdentifierKey('establishmentId')).toBe(true);
    expect(isIdentifierKey('price')).toBe(false);
  });
});

describe('getMetadataEntries', () => {
  const metadata = {
    attributeId: 'cmabc123',
    attributeGroup: 'Sauces',
    inputType: 'MULTI_SELECT',
    empty: '',
  };

  it('drops empty values and sorts identifiers last', () => {
    const entries = getMetadataEntries(metadata);
    expect(entries.map((e) => e.key)).toEqual(['attributeGroup', 'inputType', 'attributeId']);
  });

  it('hides identifiers from the inline summary', () => {
    const entries = getVisibleMetadataEntries(metadata);
    expect(entries).toEqual([
      { key: 'attributeGroup', label: 'Attribute group', value: 'Sauces', isIdentifier: false },
      { key: 'inputType', label: 'Input type', value: 'Multi select', isIdentifier: false },
    ]);
  });

  it('exports a readable single-line summary', () => {
    expect(formatMetadataForExport(metadata)).toBe(
      'Attribute group: Sauces · Input type: Multi select',
    );
  });

  it('handles missing metadata', () => {
    expect(getMetadataEntries(null)).toEqual([]);
    expect(getVisibleMetadataEntries(undefined)).toEqual([]);
  });
});

describe('getActionTone', () => {
  it('derives a tone from the verb, including unmapped actions', () => {
    expect(getActionTone('Added attribute group')).toBe('create');
    expect(getActionTone('Archived sub-attribute')).toBe('destructive');
    expect(getActionTone('Reactivated product')).toBe('restore');
    expect(getActionTone('Updated tax rate')).toBe('update');
    expect(getActionTone('Something else entirely')).toBe('neutral');
  });
});

describe('groupLogsByDay', () => {
  it('groups consecutive entries that share a calendar day', () => {
    const logs = [
      { timestamp: '2026-08-20T21:59:26' },
      { timestamp: '2026-08-20T09:12:00' },
      { timestamp: '2026-08-19T23:00:00' },
    ];
    const groups = groupLogsByDay(logs);
    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe('2026-08-20');
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].key).toBe('2026-08-19');
  });

  it('skips unparseable timestamps', () => {
    expect(groupLogsByDay([{ timestamp: 'not-a-date' }])).toEqual([]);
  });
});

describe('getRelativeDayKey', () => {
  const now = new Date(2026, 7, 23, 10, 0, 0);

  it('labels today and yesterday', () => {
    expect(getRelativeDayKey(new Date(2026, 7, 23, 1, 0, 0), now)).toBe('today');
    expect(getRelativeDayKey(new Date(2026, 7, 22, 23, 0, 0), now)).toBe('yesterday');
    expect(getRelativeDayKey(new Date(2026, 7, 20, 12, 0, 0), now)).toBeNull();
  });
});
