export type DetectedCardBrand = 'card' | 'visa' | 'mastercard' | 'amex' | 'discover';

export const PAYMENT_CARD_API_BRAND: Record<DetectedCardBrand, string> = {
  card: 'CARD',
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
  discover: 'DISCOVER',
};

export const getCardDigits = (value: string) => value.replace(/\D/g, '');

export function detectCardBrand(digits: string): DetectedCardBrand {
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^4/.test(digits)) return 'visa';
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';
  return 'card';
}

export function formatCardNumberInput(value: string) {
  const digits = getCardDigits(value).slice(0, 19);
  const brand = detectCardBrand(digits);
  const groupSizes = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4, 3];
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
  return digits.length >= 13 && digits.length <= 19 && luhnCheck(digits);
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
