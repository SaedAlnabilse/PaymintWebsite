import { describe, expect, it } from 'vitest';
import { TEXT_INPUT_LIMITS } from '../../config/textLimits';
import {
  applyElementTextLimit,
  getLimitKeyForField,
  limitText,
  sanitizeTextPayload,
} from '../textLimitUtils';

describe('text limit utilities', () => {
  it('uses field-specific limits instead of a single fallback', () => {
    expect(getLimitKeyForField('productName')).toBe('PRODUCT_NAME');
    expect(getLimitKeyForField('category name')).toBe('CATEGORY_NAME');
    expect(getLimitKeyForField('refundReason')).toBe('REFUND_REASON');
    expect(getLimitKeyForField('email')).toBe('EMAIL');
  });

  it('truncates pasted or typed values to the resolved limit', () => {
    const value = 'x'.repeat(TEXT_INPUT_LIMITS.PRODUCT_NAME + 10);
    expect(limitText(value, 'PRODUCT_NAME')).toHaveLength(TEXT_INPUT_LIMITS.PRODUCT_NAME);
  });

  it('sanitizes payloads before API submission', () => {
    const payload = sanitizeTextPayload({
      name: 'A'.repeat(90),
      description: 'B'.repeat(180),
      nested: { taxIdNumber: '1'.repeat(50) },
    });

    expect(payload.name).toHaveLength(TEXT_INPUT_LIMITS.PERSON_NAME);
    expect(payload.description).toHaveLength(TEXT_INPUT_LIMITS.ITEM_DESCRIPTION);
    expect(payload.nested.taxIdNumber).toHaveLength(TEXT_INPUT_LIMITS.TAX_ID);
  });

  it('does not truncate serialized id arrays or record ids', () => {
    // A clipped attributeIds array reaches the API as malformed JSON and the
    // whole product save fails with a 400.
    const attributeIds = JSON.stringify([
      'cmt35tjdy0002x6kbea8mrkg3',
      'cmt35dtkp0004bs4jywkq7p5v',
      'cmt35du0r0006bs4j84xnbe7x',
    ]);
    const taxId = 'cmt35dube0008bs4j2oddbauo';

    const payload = sanitizeTextPayload({ attributeIds, taxId });

    expect(payload.attributeIds).toBe(attributeIds);
    expect(JSON.parse(payload.attributeIds)).toHaveLength(3);
    expect(payload.taxId).toBe(taxId);
  });

  it('keeps product FormData fields intact through the request interceptor', () => {
    const form = new FormData();
    form.append('name', 'Grilled Chicken Sandwich');
    form.append('attributeIds', JSON.stringify([
      'cmt35tjdy0002x6kbea8mrkg3',
      'cmt35dtkp0004bs4jywkq7p5v',
      'cmt35du0r0006bs4j84xnbe7x',
    ]));

    const sanitized = sanitizeTextPayload(form);

    expect(JSON.parse(String(sanitized.get('attributeIds')))).toHaveLength(3);
  });

  it('does not truncate generated image data URLs', () => {
    const image = `data:image/png;base64,${'a'.repeat(500)}`;
    const payload = sanitizeTextPayload({ image });

    expect(payload.image).toBe(image);
  });

  it('assigns maxlength and truncates old long values on text inputs', () => {
    const input = document.createElement('input');
    input.name = 'productName';
    input.value = 'Long product name '.repeat(10);

    applyElementTextLimit(input);

    expect(input.maxLength).toBe(TEXT_INPUT_LIMITS.PRODUCT_NAME);
    expect(input.value).toHaveLength(TEXT_INPUT_LIMITS.PRODUCT_NAME);
  });
});
