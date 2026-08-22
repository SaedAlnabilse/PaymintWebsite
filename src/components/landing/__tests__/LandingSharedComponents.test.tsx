import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingFeatureCard } from '../LandingFeatureCard';
import { AppDownloadBadgeGroup } from '../AppDownloadBadgeGroup';
import { Store } from 'lucide-react';

describe('LandingSharedComponents', () => {
  it('renders LandingFeatureCard and responds to click', () => {
    const onOpen = vi.fn();
    render(
      <LandingFeatureCard
        title="Speedy Sales"
        description="Fast order taking"
        icon={Store}
        index={0}
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText('Speedy Sales')).toBeDefined();
    expect(screen.getByText('Fast order taking')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Speedy Sales' }));
    expect(onOpen).toHaveBeenCalledWith(0);
  });

  it('renders AppDownloadBadgeGroup with badges', () => {
    render(
      <AppDownloadBadgeGroup
        label="Install App"
        iosAriaLabel="Download on App Store"
        androidAriaLabel="Get it on Google Play"
      />,
    );

    expect(screen.getByText('Install App')).toBeDefined();
    expect(screen.getByAltText('Download on App Store')).toBeDefined();
    expect(screen.getByAltText('Get it on Google Play')).toBeDefined();
  });
});
