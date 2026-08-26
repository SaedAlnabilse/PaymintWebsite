import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { format, addMonths } from 'date-fns';
import { DateRangePicker } from './DateRangePicker';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'common.locale') return 'en';
      if (key === 'common.aria.previousMonth') return 'Previous Month';
      if (key === 'common.aria.nextMonth') return 'Next Month';
      if (key === 'common.aria.selectDateRange') return 'Select Date Range';
      if (key === 'common.selectDateRange') return 'Select Date Range';
      if (key === 'common.clear') return 'Clear';
      return key;
    },
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('DateRangePicker', () => {
  it('disables future dates and next month button by default when viewing current month', () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const onRangeChange = vi.fn();

    render(
      <DateRangePicker
        startDate={todayStr}
        endDate={todayStr}
        onRangeChange={onRangeChange}
      />
    );

    // Open date picker
    fireEvent.click(screen.getByRole('button', { name: 'Select Date Range' }));

    // The next month button should be disabled because future months are past today
    const nextMonthBtn = screen.getByRole('button', { name: 'Next Month' });
    expect(nextMonthBtn).toBeDisabled();

    // Clicking next month button should not navigate
    fireEvent.click(nextMonthBtn);
    const nextMonthName = format(addMonths(today, 1), 'MMMM yyyy');
    expect(screen.queryByText(nextMonthName)).not.toBeInTheDocument();
  });

  it('allows selecting past dates within current month', () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const onRangeChange = vi.fn();

    render(
      <DateRangePicker
        startDate={todayStr}
        endDate={todayStr}
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Date Range' }));

    // Click on the 1st of the current month
    const day1Cells = screen.getAllByText('1');
    // Find the cell in the current month
    const currentMonthDay1 = day1Cells.find(cell => !cell.closest('.opacity-40') && !cell.closest('.cursor-not-allowed'));
    if (currentMonthDay1) {
      fireEvent.click(currentMonthDay1);
      // First click sets start date, click today to complete range
      const todayDayNumber = today.getDate().toString();
      const todayCells = screen.getAllByText(todayDayNumber);
      const activeTodayCell = todayCells.find(cell => !cell.closest('.opacity-40') && !cell.closest('.cursor-not-allowed'));
      if (activeTodayCell) {
        fireEvent.click(activeTodayCell);
        expect(onRangeChange).toHaveBeenCalled();
      }
    }
  });

  it('allows navigating to previous months', () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const onRangeChange = vi.fn();

    render(
      <DateRangePicker
        startDate={todayStr}
        endDate={todayStr}
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Date Range' }));

    const prevMonthBtn = screen.getByRole('button', { name: 'Previous Month' });
    expect(prevMonthBtn).not.toBeDisabled();

    fireEvent.click(prevMonthBtn);
    // After moving back one month, next month button should now be enabled to go back to current month
    const nextMonthBtn = screen.getByRole('button', { name: 'Next Month' });
    expect(nextMonthBtn).not.toBeDisabled();
  });

  it('allows future dates if allowFutureDates is true', () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const onRangeChange = vi.fn();

    render(
      <DateRangePicker
        startDate={todayStr}
        endDate={todayStr}
        onRangeChange={onRangeChange}
        allowFutureDates={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Date Range' }));

    const nextMonthBtn = screen.getByRole('button', { name: 'Next Month' });
    expect(nextMonthBtn).not.toBeDisabled();
  });
});
