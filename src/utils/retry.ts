import { TimeoutError } from '../errors/TimeoutError.js';
import { sleep } from './sleep.js';

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  backoff = 2
): Promise<T> {
  let attempt = 0;
  let currentDelay = delayMs;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      await sleep(currentDelay);
      currentDelay *= backoff;
    }
  }

  throw new TimeoutError('Retry threshold exceeded');
}