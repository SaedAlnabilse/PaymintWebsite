import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModalKeyboardGuard } from './useModalKeyboardGuard';

describe('useModalKeyboardGuard', () => {
  it('locks body scroll and handles Escape key when open', () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() =>
      useModalKeyboardGuard({
        isOpen: true,
        onClose,
      }),
    );

    expect(document.body.style.overflow).toBe('hidden');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('handles arrow navigation with RTL support', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    renderHook(() =>
      useModalKeyboardGuard({
        isOpen: true,
        onClose: vi.fn(),
        onNext,
        onPrev,
        isRtl: true,
      }),
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(onPrev).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
