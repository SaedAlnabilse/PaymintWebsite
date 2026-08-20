import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNetworkStatus } from './useNetworkStatus';

describe('useNetworkStatus', () => {
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine,
    });
  });

  it('initializes with navigator.onLine value', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('updates state when offline and online events fire', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOffline).toBe(true);
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
  });

  it('allows manual override via setOfflineState or window.__setOfflineMode', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      result.current.setOfflineState(true);
    });

    expect(result.current.isOffline).toBe(true);

    act(() => {
      (window as any).__setOfflineMode(false);
    });

    expect(result.current.isOnline).toBe(true);
  });
});
