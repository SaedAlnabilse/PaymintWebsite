import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BackofficeAlertsView } from '../../components/notifications/BackofficeAlertsView';
import { useAuth } from '../../context/AuthContext';

export function NotificationsPage() {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const { currentEstablishment } = useAuth();
  const locations = useMemo(
    () => currentEstablishment ? [{
      id: currentEstablishment.id,
      name: currentEstablishment.name,
      slug: locationSlug,
      currency: currentEstablishment.currency,
    }] : [],
    [currentEstablishment, locationSlug],
  );

  return (
    <BackofficeAlertsView
      scope="location"
      establishmentId={currentEstablishment?.id}
      locations={locations}
      feedTitle={currentEstablishment?.name}
    />
  );
}
