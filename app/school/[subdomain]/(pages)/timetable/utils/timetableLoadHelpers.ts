const RETRY_DELAYS_MS = [0, 1000, 3000];

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatLoadError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

/** Run an async loader with exponential backoff (3 attempts). */
export async function runWithLoadRetry<T>(
  loader: () => Promise<T>,
  delaysMs: number[] = RETRY_DELAYS_MS,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < delaysMs.length; i++) {
    if (delaysMs[i] > 0) await sleep(delaysMs[i]);
    try {
      return await loader();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
