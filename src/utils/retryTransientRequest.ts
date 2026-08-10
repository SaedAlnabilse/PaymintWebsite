const TRANSIENT_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export interface TransientRetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

export const isTransientRequestError = (error: unknown): boolean => {
  const candidate = error as {
    code?: string;
    response?: { status?: number };
  } | null;
  const status = candidate?.response?.status;

  return (
    status === undefined ||
    TRANSIENT_HTTP_STATUSES.has(status) ||
    candidate?.code === 'ECONNABORTED' ||
    candidate?.code === 'ERR_NETWORK'
  );
};

/** Retry idempotent reads that failed before the server could return stable data. */
export async function retryTransientRequest<T>(
  request: () => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 250 }: TransientRetryOptions = {},
): Promise<T> {
  let attempt = 0;

  while (true) {
    attempt += 1;
    try {
      return await request();
    } catch (error) {
      if (attempt >= maxAttempts || !isTransientRequestError(error)) {
        throw error;
      }

      await new Promise<void>((resolve) =>
        setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1)),
      );
    }
  }
}
