export type DetectedCardBrand = 'card' | 'visa' | 'mastercard' | 'amex' | 'discover';

export const PAYMENT_CARD_API_BRAND: Record<DetectedCardBrand, string> = {
  card: 'CARD',
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
  discover: 'DISCOVER',
};

/** Canonical display labels for known card brands / payment names. */
const PAYMENT_BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  master: 'Mastercard',
  'master card': 'Mastercard',
  mc: 'Mastercard',
  amex: 'Amex',
  'american express': 'American Express',
  discover: 'Discover',
  mada: 'Mada',
  jcb: 'JCB',
  unionpay: 'UnionPay',
  'union pay': 'UnionPay',
  diners: 'Diners Club',
  'diners club': 'Diners Club',
  maestro: 'Maestro',
  applepay: 'Apple Pay',
  'apple pay': 'Apple Pay',
  googlepay: 'Google Pay',
  'google pay': 'Google Pay',
};

/**
 * Format a card brand or payment-method name for UI display.
 * Examples: "MASTERCARD" / "mastercard" → "Mastercard", "visa" → "Visa".
 */
export function formatPaymentBrandName(name: string | null | undefined): string {
  if (name == null || String(name).trim() === '') return '—';

  const raw = String(name).trim();
  const key = raw
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (PAYMENT_BRAND_LABELS[key]) {
    return PAYMENT_BRAND_LABELS[key];
  }

  // Title-case each word for custom methods / unknown brands.
  return key
    .split(' ')
    .map((word) => {
      if (!word) return word;
      if (word.length <= 3 && word === word.toUpperCase()) {
        // Keep short codes like "POS" if already all-caps input was mixed; we lowercased already
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export const MAX_CARD_NUMBER_DIGITS = 16;
export const AMEX_CARD_NUMBER_DIGITS = 15;
export const MAX_FORMATTED_CARD_NUMBER_LENGTH = 19; // 16 digits + 3 spaces

export const getCardDigits = (value: string) => value.replace(/\D/g, '');

export function detectCardBrand(digits: string): DetectedCardBrand {
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^4/.test(digits)) return 'visa';
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';
  return 'card';
}

export function formatCardNumberInput(
  value: string,
  maxDigits = MAX_CARD_NUMBER_DIGITS,
) {
  let digits = getCardDigits(value).slice(0, maxDigits);
  const brand = detectCardBrand(digits);
  // Amex numbers are 15 digits grouped 4-6-5 regardless of the caller's cap.
  if (brand === 'amex') digits = digits.slice(0, AMEX_CARD_NUMBER_DIGITS);
  const groupSizes =
    brand === 'amex'
      ? [4, 6, 5]
      : maxDigits === MAX_CARD_NUMBER_DIGITS
      ? [4, 4, 4, 4]
      : [4, 4, 4, 4, 3];
  const parts: string[] = [];
  let cursor = 0;

  for (const size of groupSizes) {
    const part = digits.slice(cursor, cursor + size);
    if (!part) break;
    parts.push(part);
    cursor += size;
  }

  return parts.join(' ');
}

export function formatExpiryInput(value: string) {
  const digits = getCardDigits(value).slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function luhnCheck(digits: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum > 0 && sum % 10 === 0;
}

export function isValidCardNumber(digits: string) {
  // Local saved cards are not tokenized with a live gateway yet, so do not run
  // card-network/Luhn validation here. The UI only needs a complete display
  // number so the API can save card metadata safely. (Matches the admin
  // portal's paymentCard util.) Amex numbers are 15 digits, all others 16.
  const expectedLength =
    detectCardBrand(digits) === 'amex'
      ? AMEX_CARD_NUMBER_DIGITS
      : MAX_CARD_NUMBER_DIGITS;
  return digits.length === expectedLength;
}

export function getCardCvvLength(brand: DetectedCardBrand) {
  return brand === 'amex' ? 4 : 3;
}

export function parseExpiryDate(value: string) {
  const [monthValue, yearValue] = value.split('/');
  const month = Number(monthValue);
  const year = yearValue?.length === 2 ? 2000 + Number(yearValue) : NaN;

  if (!Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (month < 1 || month > 12) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return null;
  }

  return { month, year };
}
