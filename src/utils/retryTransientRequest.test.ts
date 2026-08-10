import { describe, expect, it, vi } from 'vitest';
import {
  isTransientRequestError,
  retryTransientRequest,
} from './retryTransientRequest';

describe('retryTransientRequest', () => {
  it('retries a temporary 502 and returns the recovered response', async () => {
    const request = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ response: { status: 502 } })
      .mockResolvedValue('loaded');

    await expect(
      retryTransientRequest(request, { baseDelayMs: 0 }),
    ).resolves.toBe('loaded');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('does not retry authorization or validation failures', async () => {
    const request = vi.fn().mockRejectedValue({ response: { status: 403 } });

    await expect(
      retryTransientRequest(request, { baseDelayMs: 0 }),
    ).rejects.toEqual({ response: { status: 403 } });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('recognizes network and gateway failures as transient', () => {
    expect(isTransientRequestError({ code: 'ERR_NETWORK' })).toBe(true);
    expect(isTransientRequestError({ response: { status: 504 } })).toBe(true);
    expect(isTransientRequestError({ response: { status: 404 } })).toBe(false);
  });
});
