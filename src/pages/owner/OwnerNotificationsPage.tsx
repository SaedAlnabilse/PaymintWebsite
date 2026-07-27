import { useMemo } from 'react';
import { BackofficeAlertsView } from '../../components/notifications/BackofficeAlertsView';
import { useAuth } from '../../context/AuthContext';

export function OwnerNotificationsPage() {
  const { establishments } = useAuth();
  const locations = useMemo(
    () => establishments.map((establishment) => ({
      id: establishment.id,
      name: establishment.name,
      slug: establishment.establishmentLoginId,
      currency: establishment.currency,
    })),
    [establishments],
  );

  return <BackofficeAlertsView scope="owner" locations={locations} />;
}
