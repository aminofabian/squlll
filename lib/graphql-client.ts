import { GraphQLClient } from 'graphql-request';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment (both dev and prod)
    return `${window.location.origin}/api/graphql`;
  }
  // Server environment
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql/';
};

export const graphqlClient = new GraphQLClient(getBaseUrl(), {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}); 