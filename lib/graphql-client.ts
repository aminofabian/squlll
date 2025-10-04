import { GraphQLClient } from 'graphql-request';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment (both dev and prod)
    return `${window.location.origin}/api/graphql`;
  }
  // Server environment
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql/';
};

// Create a more robust GraphQL client
const createGraphQLClient = () => {
  const baseUrl = getBaseUrl();
  
  return new GraphQLClient(baseUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
};

// Export a singleton instance
export const graphqlClient = createGraphQLClient();

// Export a function to create new instances if needed
export const createClient = () => createGraphQLClient(); 