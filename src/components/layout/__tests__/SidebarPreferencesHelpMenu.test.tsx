import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarPreferencesHelpMenu } from '../SidebarPreferencesHelpMenu';

const setTheme = vi.fn();
const changeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'common.locale' ? 'en' : key),
    i18n: { language: 'en', resolvedLanguage: 'en', changeLanguage },
  }),
}));

vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', setTheme }),
}));

vi.mock('../../PortalDropdown', () => ({
  PortalDropdown: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: ReactNode;
  }) => (isOpen ? <div>{children}</div> : null),
}));

const openMenu = () => {
  fireEvent.click(
    screen.getByRole('button', { name: 'common.helpAndPreferences' }),
  );
};

describe('SidebarPreferencesHelpMenu', () => {
  it('switches the theme from the appearance section and keeps the menu open', () => {
    render(
      <SidebarPreferencesHelpMenu
        canReplay
        onReplay={vi.fn()}
        onOpenHelpCenter={vi.fn()}
      />,
    );
    openMenu();

    fireEvent.click(screen.getByRole('menuitemradio', { name: /theme\.dark/ }));

    expect(setTheme).toHaveBeenCalledWith('dark');
    expect(
      screen.getByRole('menuitemradio', { name: /theme\.light/ }),
    ).toBeInTheDocument();
  });

  it('switches the language and closes the menu', () => {
    render(
      <SidebarPreferencesHelpMenu
        canReplay
        onReplay={vi.fn()}
        onOpenHelpCenter={vi.fn()}
      />,
    );
    openMenu();

    fireEvent.click(
      screen.getByRole('menuitemradio', { name: /common\.languages\.ar/ }),
    );

    expect(changeLanguage).toHaveBeenCalledWith('ar');
    expect(
      screen.queryByRole('menuitemradio', { name: /common\.languages\.en/ }),
    ).not.toBeInTheDocument();
  });

  it('marks the coming-soon language as disabled', () => {
    render(
      <SidebarPreferencesHelpMenu
        canReplay
        onReplay={vi.fn()}
        onOpenHelpCenter={vi.fn()}
      />,
    );
    openMenu();

    const zh = screen.getByRole('menuitemradio', {
      name: /common\.languages\.zh/,
    });
    expect(zh).toHaveAttribute('aria-disabled', 'true');
    expect(zh).toBeDisabled();
  });

  it('hides the replay entry when server state cannot replay it and opens the help center', () => {
    const onOpenHelpCenter = vi.fn();
    render(
      <SidebarPreferencesHelpMenu
        canReplay={false}
        onReplay={vi.fn()}
        onOpenHelpCenter={onOpenHelpCenter}
      />,
    );
    openMenu();

    expect(
      screen.queryByRole('menuitem', { name: 'dashboard.setupGuide.menuItem' }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('menuitem', {
        name: 'dashboard.setupGuide.helpCenter',
      }),
    );
    expect(onOpenHelpCenter).toHaveBeenCalledTimes(1);
  });

  it('delegates replay authorization and closes the menu when allowed', async () => {
    const onReplay = vi.fn().mockResolvedValue(true);
    render(
      <SidebarPreferencesHelpMenu
        canReplay
        onReplay={onReplay}
        onOpenHelpCenter={vi.fn()}
      />,
    );
    openMenu();

    const trigger = screen.getByRole('button', {
      name: 'common.helpAndPreferences',
    });
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'dashboard.setupGuide.menuItem' }),
    );

    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();

    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', {
          name: 'dashboard.setupGuide.menuItem',
        }),
      ).not.toBeInTheDocument();
    });
  });

  it('keeps the menu open when replay authorization is refused', async () => {
    const onReplay = vi.fn().mockResolvedValue(false);
    render(
      <SidebarPreferencesHelpMenu
        canReplay
        onReplay={onReplay}
        onOpenHelpCenter={vi.fn()}
      />,
    );
    openMenu();

    fireEvent.click(
      screen.getByRole('menuitem', { name: 'dashboard.setupGuide.menuItem' }),
    );

    await waitFor(() => {
      expect(onReplay).toHaveBeenCalled();
    });
    expect(
      screen.getByRole('menuitem', { name: 'dashboard.setupGuide.menuItem' }),
    ).toBeInTheDocument();
  });

  it('renders a bare icon trigger in compact mode', () => {
    render(<SidebarPreferencesHelpMenu compact onOpenHelpCenter={vi.fn()} />);

    const trigger = screen.getByRole('button', {
      name: 'common.helpAndPreferences',
    });
    expect(trigger.textContent).toBe('');
  });
});
