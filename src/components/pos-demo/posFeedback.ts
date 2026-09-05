/**
 * Smart cash suggestions, web audio/haptic feedback, and draft cart storage utilities
 * for the interactive POS demo (mirrors real POS algorithms).
 */

export type OrderTender = {
  method: 'CASH' | 'CARD' | 'OTHER' | string;
  label: string;
  amount: number;
  tendered?: number;
  change?: number;
  cardType?: string;
  otherPaymentMethod?: string;
};

/**
 * Smart dynamic quick-cash suggestions based on the order total.
 * Generates 3 realistic banknote combinations strictly >= total.
 * Never displays bills lower than total (which would leave the order short).
 * Exact match to mintcom-pos getSmartQuickCashSuggestions.
 */
export function getSmartQuickCashSuggestions(total: number): number[] {
  if (!total || total <= 0) {
    return [10, 20, 50];
  }

  const results: number[] = [];
  const step = total > 200 ? 50 : total > 50 ? 10 : 5;

  // 1. Next immediate multiple of step strictly greater than total
  let nextStep = Math.ceil(total / step) * step;
  if (nextStep <= total + 0.001) {
    nextStep += step;
  }
  results.push(nextStep);

  // 2. Next multiple of (step * 2)
  const nextDoubleStep = Math.ceil(total / (step * 2)) * (step * 2);
  if (nextDoubleStep > nextStep + 0.001 && !results.includes(nextDoubleStep)) {
    results.push(nextDoubleStep);
  }

  // 3. Next major banknotes: [5, 10, 20, 50, 100, 200, 500]
  const majorBills = [5, 10, 20, 50, 100, 200, 500];
  for (const bill of majorBills) {
    if (bill > total + 0.001 && !results.includes(bill)) {
      results.push(bill);
      if (results.length >= 3) break;
    }
  }

  // Fallback if needed
  let fallback = results[results.length - 1] + step;
  while (results.length < 3) {
    if (!results.includes(fallback)) {
      results.push(fallback);
    }
    fallback += step;
  }

  return results.sort((a, b) => a - b).slice(0, 3);
}

/**
 * Subtle tactile click/ring when an item is successfully added to the cart.
 */
export function triggerCartAddFeedback(): void {
  try {
    if (typeof window !== 'undefined') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    }
  } catch {
    // Graceful fallback
  }
}

/**
 * Distinct double-buzz warning pattern when an item is out of stock or action is blocked.
 */
export function triggerOutOfStockBuzzer(): void {
  try {
    if (typeof window !== 'undefined') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([0, 120, 80, 180]);
      }
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      }
    }
  } catch {
    // Graceful fallback
  }
}

export const ACTIVE_CART_STORAGE_KEY = '@mintcom_active_cart_draft';

export function saveActiveCartDraft(draft: unknown): void {
  try {
    if (typeof window !== 'undefined') {
      if (draft && typeof draft === 'object' && Array.isArray((draft as { lines?: unknown[] }).lines) && ((draft as { lines: unknown[] }).lines.length > 0)) {
        localStorage.setItem(ACTIVE_CART_STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(ACTIVE_CART_STORAGE_KEY);
      }
    }
  } catch {
    // Storage quota guard
  }
}

export function loadActiveCartDraft<T = unknown>(): T | null {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(ACTIVE_CART_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as T;
      }
    }
  } catch {
    // Fallback
  }
  return null;
}

export function clearActiveCartDraft(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_CART_STORAGE_KEY);
    }
  } catch {
    // Fallback
  }
}
