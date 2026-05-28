/** NestJS GraphQL URL for server-side Next.js API routes. */
export function resolveGraphqlEndpoint(): string {
  const raw =
    process.env.GRAPHQL_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3001/graphql';

  let url = raw.trim().replace(/\/+$/, '');
  if (!url.endsWith('/graphql')) {
    url = `${url}/graphql`;
  }
  return url;
}
