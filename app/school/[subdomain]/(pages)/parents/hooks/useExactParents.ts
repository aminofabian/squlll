"use client";

import { useState, useEffect, useCallback } from "react";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import {
  mapGraphqlParentToListItem,
  type ParentsListItem,
} from "../utils/mapGraphqlParent";

const GET_ALL_PARENTS = gql`
  query GetAllParents {
    getAllParents {
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

export interface GraphQLParent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  occupation: string | null;
  isActive: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  students: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    grade: unknown;
    relationship: string;
    isPrimary: boolean;
  }[];
}

export function useExactParents() {
  const [parents, setParents] = useState<ParentsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await graphqlClient.request<{
        getAllParents: GraphQLParent[];
      }>(GET_ALL_PARENTS);

      const items = (response.getAllParents ?? []).map(mapGraphqlParentToListItem);
      setParents(items);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch parents",
      );
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchParents();
  }, [fetchParents]);

  return {
    parents,
    loading,
    error,
    refetchParents: fetchParents,
  };
}
