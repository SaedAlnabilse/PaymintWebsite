import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SetupGuideHelpMenu } from './SetupGuideHelpMenu';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'common.locale' ? 'en' : key),
  }),
}));

vi.mock('../PortalDropdown', () => ({
  PortalDropdown: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: ReactNode;
  }) => (isOpen ? children : null),
}));

describe('SetupGuideHelpMenu', () => {
  it('hides the setup entry when server state cannot replay it', () => {
    render(
      <SetupGuideHelpMenu
        canReplay={false}
        onReplay={vi.fn()}
        onOpenHelpCenter={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'dashboard.setupGuide.help' }),
    );
    expect(
      screen.queryByRole('menuitem', {
        name: 'dashboard.setupGuide.menuItem',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {
        name: 'dashboard.setupGuide.helpCenter',
      }),
    ).toBeInTheDocument();
  });

  it('delegates replay authorization before closing the menu', async () => {
    const onReplay = vi.fn().mockResolvedValue(true);
    render(
      <SetupGuideHelpMenu
        canReplay
        onReplay={onReplay}
        onOpenHelpCenter={vi.fn()}
      />,
    );

    const helpTrigger = screen.getByRole('button', {
      name: 'dashboard.setupGuide.help',
    });
    fireEvent.click(helpTrigger);
    fireEvent.click(
      screen.getByRole('menuitem', {
        name: 'dashboard.setupGuide.menuItem',
      }),
    );

    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(helpTrigger).toHaveFocus();
  });
});
