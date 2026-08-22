import { useEffect } from 'react';

export interface ModalKeyboardGuardOptions {
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isRtl?: boolean;
  hideChatWidget?: boolean;
}

/**
 * Custom hook to handle modal keyboard navigation (Escape, ArrowLeft, ArrowRight),
 * body scroll locking, and chat widget hide/show events.
 */
export function useModalKeyboardGuard({
  isOpen,
  onClose,
  onNext,
  onPrev,
  isRtl = false,
  hideChatWidget = true,
}: ModalKeyboardGuardOptions) {
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNext && onPrev) {
        (isRtl ? onPrev : onNext)();
      } else if (e.key === 'ArrowLeft' && onNext && onPrev) {
        (isRtl ? onNext : onPrev)();
      }
    };

    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (hideChatWidget) {
      window.dispatchEvent(new CustomEvent('mintcom-chat-widget-hide'));
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (hideChatWidget) {
        window.dispatchEvent(new CustomEvent('mintcom-chat-widget-show'));
      }
    };
  }, [isOpen, onClose, onNext, onPrev, isRtl, hideChatWidget]);
}
