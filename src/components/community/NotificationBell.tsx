import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { communityApi } from '../../services/communityApi';
import { useCommunityRealtime, CommunityRealtimeEvents } from '../../hooks/useCommunityRealtime';

/**
 * Notification bell — shows unread count, links to /community/notifications.
 * Polls lightly + listens for community.notification realtime events.
 */
export function NotificationBell() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);

  const refresh = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await communityApi.getNotifications(1, 1);
      setUnread(data.unreadCount || 0);
    } catch {
      // silent — bell is secondary
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  useCommunityRealtime({
    enabled: isAuthenticated,
    global: false,
    onEvent: (evt) => {
      if (evt === CommunityRealtimeEvents.NOTIFICATION) {
        setUnread((u) => u + 1);
      }
    },
  });

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/community/notifications"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600"
      title={t('community.notifications.title', { defaultValue: 'Notifications' })}
    >
      <span aria-hidden>🔔</span>
      {unread > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7dc6a2] text-white text-[10px] font-bold flex items-center justify-center">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
