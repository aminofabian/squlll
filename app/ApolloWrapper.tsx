'use client'

import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from "@apollo/client";
import { useMemo } from "react";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    return new ApolloClient({
      link: new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "/api/graphql", // Fallback to relative path if env var is not set
        credentials: "include", // Send cookies with requests
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
      }
    });
  }, []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
