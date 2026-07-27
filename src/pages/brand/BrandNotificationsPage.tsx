import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BackofficeAlertsView } from '../../components/notifications/BackofficeAlertsView';
import { useAuth } from '../../context/AuthContext';

interface BrandContext {
  id: string;
  name: string;
  establishments: Array<{
    id: string;
    name: string;
    currency?: string;
  }>;
}

export function BrandNotificationsPage() {
  const { brand } = useOutletContext<{ brand: BrandContext | null }>();
  const { establishments } = useAuth();
  const locations = useMemo(() => {
    const accountLocations = new Map(establishments.map((location) => [location.id, location]));

    return (brand?.establishments ?? []).map((brandLocation) => {
      const accountLocation = accountLocations.get(brandLocation.id);
      return {
        id: brandLocation.id,
        name: brandLocation.name || accountLocation?.name || '',
        slug: accountLocation?.establishmentLoginId,
        currency: brandLocation.currency || accountLocation?.currency,
      };
    });
  }, [brand?.establishments, establishments]);

  return (
    <BackofficeAlertsView
      scope="brand"
      establishmentIds={locations.map((location) => location.id)}
      locations={locations}
      feedTitle={brand?.name}
    />
  );
}
