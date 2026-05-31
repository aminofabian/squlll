export async function chatGraphqlFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  subdomain: string,
): Promise<T> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-School-Subdomain': subdomain,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status})`)
  }

  const result = await response.json()

  if (result.errors?.length) {
    throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '))
  }

  return result.data as T
}
