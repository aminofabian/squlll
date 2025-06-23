import { GraphQLClient } from 'graphql-request';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Browser environment in development
    return `${window.location.origin}/api/graphql`;
  }
  // Server environment or production
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql/';
};

export const graphqlClient = new GraphQLClient(getBaseUrl(), {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}); 