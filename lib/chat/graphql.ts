const GRAPHQL_TIMEOUT_MS = 30000;

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

export async function chatGraphqlFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  subdomain: string,
  options?: { timeoutMs?: number },
): Promise<T> {
  const response = await fetchWithTimeout(
    '/api/graphql',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Subdomain': subdomain,
      },
      body: JSON.stringify({ query, variables }),
    },
    options?.timeoutMs ?? GRAPHQL_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status})`)
  }

  const result = await response.json()

  if (result.errors?.length) {
    throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '))
  }

  return result.data as T
}
