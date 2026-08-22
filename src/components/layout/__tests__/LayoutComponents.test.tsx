import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarUserProfileFooter } from '../SidebarUserProfileFooter';
import { MobileNavigationDrawer } from '../MobileNavigationDrawer';
import { LayoutDashboard } from 'lucide-react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    account: { id: 'acc-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    currentEstablishment: null,
    establishments: [],
  }),
}));

describe('Layout Deduplicated Components', () => {
  it('renders SidebarUserProfileFooter correctly when open', () => {
    render(
      <MemoryRouter>
        <SidebarUserProfileFooter
          sidebarOpen={true}
          account={{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as any}
          scope="owner"
          locations={[]}
          onOpenMobileAppModal={vi.fn()}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('dashboard.menu.logout')).toBeDefined();
  });

  it('renders MobileNavigationDrawer navigation items and user card', () => {
    render(
      <MemoryRouter>
        <MobileNavigationDrawer
          isOpen={true}
          onClose={vi.fn()}
          menuItems={[
            { icon: LayoutDashboard, label: 'Overview', path: '/owner' },
          ]}
          account={{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as any}
          scope="owner"
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('John')).toBeDefined();
  });
});
