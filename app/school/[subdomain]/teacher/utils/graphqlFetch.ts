// Utility function to make GraphQL requests

/**
 * Makes a GraphQL request to the school API
 * 
 * @param query GraphQL query or mutation string
 * @param variables Variables for the GraphQL query
 * @param subdomain School subdomain
 * @returns Promise with the response data
 */
export async function graphqlFetch<T>(
  query: string, 
  variables: Record<string, any> = {},
  subdomain: string
): Promise<T> {
  try {
    const response = await fetch(`/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Subdomain': subdomain
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors.map((e: any) => e.message).join(', '));
    }

    return result.data as T;
  } catch (error) {
    console.error('GraphQL fetch error:', error);
    throw error;
  }
}
