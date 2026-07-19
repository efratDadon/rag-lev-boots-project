import { ApiError } from '@google/genai';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const RETRYABLE_STATUS_CODES = new Set([429, 503]);

const isRetryableError = (error: unknown): boolean =>
  error instanceof ApiError && RETRYABLE_STATUS_CODES.has(error.status);

export const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (!isRetryableError(error) || attempt > MAX_RETRIES) {
        throw error;
      }

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(
        `Gemini API call failed with a retryable error (status ${(error as ApiError).status}), retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`
      );
      await sleep(delay);
    }
  }
};
