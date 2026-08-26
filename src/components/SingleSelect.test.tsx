import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SingleSelect } from './SingleSelect';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'common.locale') return 'en';
      if (key === 'common.all') return 'All';
      if (key === 'common.searchPlaceholder') return 'Search...';
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

describe('SingleSelect', () => {
  const shortOptions = [
    { label: 'Applied', value: 'applied' },
    { label: 'Not applied', value: 'not_applied' },
    { label: 'Changed/removed', value: 'changed' },
  ];

  const longOptions = [
    { label: 'Opt 1', value: '1' },
    { label: 'Opt 2', value: '2' },
    { label: 'Opt 3', value: '3' },
    { label: 'Opt 4', value: '4' },
    { label: 'Opt 5', value: '5' },
    { label: 'Opt 6', value: '6' },
    { label: 'Opt 7', value: '7' },
    { label: 'Opt 8', value: '8' },
    { label: 'Opt 9', value: '9' },
  ];

  it('does not render search box for short options list by default', () => {
    render(
      <SingleSelect
        value={null}
        onChange={vi.fn()}
        options={shortOptions}
        placeholder="Service charge"
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /Service charge/i }));

    // Search box should NOT be present
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    // Options should be present
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Not applied')).toBeInTheDocument();
  });

  it('does not render search box when searchable is explicitly false', () => {
    render(
      <SingleSelect
        value={null}
        onChange={vi.fn()}
        options={longOptions}
        placeholder="Select Long"
        searchable={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Select Long/i }));
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('renders search box for long options list by default', () => {
    render(
      <SingleSelect
        value={null}
        onChange={vi.fn()}
        options={longOptions}
        placeholder="Select Long"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Select Long/i }));
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders search box when searchable is explicitly true even for short list', () => {
    render(
      <SingleSelect
        value={null}
        onChange={vi.fn()}
        options={shortOptions}
        placeholder="Service charge"
        searchable={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Service charge/i }));
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});
