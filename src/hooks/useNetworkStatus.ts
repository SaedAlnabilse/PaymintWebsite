import { useState, useEffect, useCallback } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('offline') === 'true') return false;
    }
    return navigator.onLine;
  });

  const [wasOffline, setWasOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('offline') === 'true') {
        setIsChecking(false);
        setIsOnline(false);
        return false;
      }

      // Try fetching a lightweight asset with cache-busting
      const response = await fetch('/mintcom-leaf.svg?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const online = response.ok;
      setIsOnline(online);
      setIsChecking(false);
      return online;
    } catch {
      setIsChecking(false);
      setIsOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleDevToggle = (e: CustomEvent<{ offline?: boolean }>) => {
      if (e.detail && typeof e.detail.offline === 'boolean') {
        setIsOnline(!e.detail.offline);
      } else {
        setIsOnline((prev) => !prev);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('mintcom:toggle-offline' as any, handleDevToggle);

    (window as any).__setOfflineMode = (offline: boolean) => {
      window.dispatchEvent(new CustomEvent('mintcom:toggle-offline', { detail: { offline } }));
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mintcom:toggle-offline' as any, handleDevToggle);
      delete (window as any).__setOfflineMode;
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    isChecking,
    checkConnection,
    setOfflineState: (offline: boolean) => setIsOnline(!offline),
  };
}
