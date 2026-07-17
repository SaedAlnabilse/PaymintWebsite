import { describe, expect, it } from 'vitest';
import {
  detectCardBrand,
  formatCardNumberInput,
  formatExpiryInput,
  getCardCvvLength,
  isValidCardNumber,
  luhnCheck,
  parseExpiryDate,
} from './paymentCard';

describe('paymentCard helpers', () => {
  it('detects common card brands', () => {
    expect(detectCardBrand('4242424242424242')).toBe('visa');
    expect(detectCardBrand('5555555555554444')).toBe('mastercard');
    expect(detectCardBrand('378282246310005')).toBe('amex');
    expect(detectCardBrand('6011111111111117')).toBe('discover');
  });

  it('formats card numbers with brand-specific spacing', () => {
    expect(formatCardNumberInput('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumberInput('378282246310005')).toBe('3782 822463 10005');
  });

  it('formats expiry input as month and year', () => {
    expect(formatExpiryInput('1230')).toBe('12/30');
    expect(formatExpiryInput('1')).toBe('1');
  });

  it('validates card numbers by brand-aware length (no gateway tokenization yet)', () => {
    expect(isValidCardNumber('4242424242424242')).toBe(true);
    expect(isValidCardNumber('424242424242424')).toBe(false);
    // Amex is 15 digits and must be accepted.
    expect(isValidCardNumber('378282246310005')).toBe(true);
    expect(isValidCardNumber('37828224631000')).toBe(false);
  });

  it('luhnCheck flags checksum-invalid numbers', () => {
    expect(luhnCheck('4242424242424242')).toBe(true);
    expect(luhnCheck('4242424242424241')).toBe(false);
  });

  it('returns the expected cvv length per brand', () => {
    expect(getCardCvvLength('visa')).toBe(3);
    expect(getCardCvvLength('amex')).toBe(4);
  });

  it('parses future expiries and rejects invalid values', () => {
    const futureYear = String((new Date().getFullYear() + 1) % 100).padStart(2, '0');

    expect(parseExpiryDate(`12/${futureYear}`)).toEqual({
      month: 12,
      year: 2000 + Number(futureYear),
    });
    expect(parseExpiryDate('13/30')).toBeNull();
    expect(parseExpiryDate('01/20')).toBeNull();
  });
});
