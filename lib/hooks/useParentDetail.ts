"use client";

import { useCallback, useEffect, useState } from "react";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import {
  mapGraphqlParentToListItem,
  type ParentsListItem,
} from "@/app/school/[subdomain]/(pages)/parents/utils/mapGraphqlParent";
import type { GraphQLParent } from "@/app/school/[subdomain]/(pages)/parents/hooks/useExactParents";

const GET_PARENT_BY_ID = gql`
  query GetParentById($parentId: String!) {
    getParentById(parentId: $parentId) {
      id
      name
      email
      phone
      address
      occupation
      isActive
      userId
      createdAt
      updatedAt
      students {
        id
        admissionNumber
        firstName
        lastName
        grade
        relationship
        isPrimary
      }
    }
  }
`;

export function useParentDetail(parentId: string | null) {
  const [parent, setParent] = useState<ParentsListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParent = useCallback(async () => {
    if (!parentId) {
      setParent(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await graphqlClient.request<{
        getParentById: GraphQLParent;
      }>(GET_PARENT_BY_ID, { parentId });

      setParent(mapGraphqlParentToListItem(response.getParentById));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch parent");
      setParent(null);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    void fetchParent();
  }, [fetchParent]);

  return {
    parent,
    loading,
    error,
    refetch: fetchParent,
  };
}
