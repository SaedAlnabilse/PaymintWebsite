import { render, screen, within } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CashDiscrepancyView } from './CashDiscrepancyView';
import en from '../../../../i18n/locales/en.json';

// t() returns the defaultValue when one is supplied so assertions can be made
// against real copy instead of translation keys.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (key === 'common.locale') return 'en';
      if (opts && typeof opts.defaultValue === 'string') {
        return opts.defaultValue.replace(
          /\{\{(\w+)\}\}/g,
          (_m: string, name: string) => String(opts[name] ?? ''),
        );
      }
      return key;
    },
  }),
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => (props: React.PropsWithChildren<any>) => {
        const { children, initial, animate, transition, ...rest } = props;
        const Tag = tag as any;
        return <Tag {...rest}>{children}</Tag>;
      },
    },
  ),
}));

vi.mock('../../../../context/CurrencyContext', () => ({
  useCurrency: () => ({ currencySymbol: 'JOD' }),
}));

const baseShift = {
  id: 'shift-1',
  status: 'CLOSED' as const,
  startTime: '2026-08-26T20:00:00.000Z',
  endTime: '2026-08-26T22:30:00.000Z',
  openingBalance: 100,
  cashSales: 50,
  totalPayIn: 0,
  totalPayOut: 0,
  expectedBalance: 150,
  closingBalance: 150,
  totalSales: 80,
  orderCount: 4,
  totalDiscounts: 0,
  totalRefunds: 0,
  discrepancy: 0,
  autoClose: false,
};

const renderView = (shifts: any[]) =>
  render(<CashDiscrepancyView shifts={shifts as any} />);

describe('CashDiscrepancyView', () => {
  it('reports an auto-closed drawer as uncounted instead of a balanced 0.00', () => {
    // The API closes an abandoned shift at closingBalance = expectedBalance,
    // so a 0.00 variance here means "nobody counted", not "the till was right".
    renderView([
      {
        ...baseShift,
        autoClose: true,
        closeReason: 'AUTO_LOGOUT',
        discrepancy: 0,
      },
    ]);

    // Scoped to the table: "Not counted" is also a filter pill above it.
    const table = screen.getByRole('table');
    // The counted column refuses to present the calculated figure as a count.
    expect(within(table).getByText('Not counted')).toBeInTheDocument();
    // The variance column offers no verdict at all.
    expect(within(table).getByText('—')).toBeInTheDocument();
    // And the reason the POS closed it is spelled out. The i18n mock resolves
    // to the humanised fallback, so the real copy is asserted against the
    // locale file instead of the rendered string.
    expect(within(table).getByText('auto logout')).toBeInTheDocument();
    expect(en.orders.reports.cashGap.closeReasons.AUTO_LOGOUT).toBe(
      'logged out without cashing out',
    );
  });

  it('keeps uncounted drawers out of the accuracy rate', () => {
    // One genuinely counted shift that came up 10 short, plus four drawers
    // nobody counted. Accuracy must read 0% (0 of 1 counted shifts balanced),
    // not 80% as it would if the uncounted ones counted as balanced.
    const shifts = [
      { ...baseShift, id: 'counted', closingBalance: 140, discrepancy: -10 },
      ...Array.from({ length: 4 }, (_, i) => ({
        ...baseShift,
        id: `auto-${i}`,
        autoClose: true,
        closeReason: 'AUTO_LOGOUT',
        discrepancy: 0,
      })),
    ];

    renderView(shifts);

    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('4 uncounted shifts excluded')).toBeInTheDocument();
    expect(
      screen.getByText('4 shifts closed without a cash count'),
    ).toBeInTheDocument();
  });

  it('shows the real variance for a drawer somebody counted', () => {
    renderView([
      { ...baseShift, closingBalance: 140, discrepancy: -10, autoClose: false },
    ]);

    const table = screen.getByRole('table');
    expect(within(table).getByText('-10.00')).toBeInTheDocument();
    expect(within(table).queryByText('—')).not.toBeInTheDocument();
  });
});
