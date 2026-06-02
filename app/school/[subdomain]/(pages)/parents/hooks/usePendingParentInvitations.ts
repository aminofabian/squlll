"use client";

import { useState, useEffect, useCallback } from "react";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { ParentInvitation } from "../types";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";

const GET_PENDING_PARENT_INVITATIONS = gql`
  query GetPendingParentInvitations($tenantId: String!) {
    getPendingParentInvitations(tenantId: $tenantId) {
      id
      email
      role
      status
      createdAt
      expiresAt
      invitedBy {
        id
        name
        email
      }
    }
  }
`;

export const usePendingParentInvitations = () => {
  const [pendingInvitations, setPendingInvitations] = useState<
    ParentInvitation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSchoolConfigStore();
  const tenantId = config?.tenant?.id;

  const fetchPendingInvitations = useCallback(async () => {
    if (!tenantId) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await graphqlClient.request<{
        getPendingParentInvitations: ParentInvitation[];
      }>(GET_PENDING_PARENT_INVITATIONS, { tenantId });

      setPendingInvitations(data.getPendingParentInvitations ?? []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pending parent invitations",
      );
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) {
      void fetchPendingInvitations();
    }
  }, [tenantId, fetchPendingInvitations]);

  useDomainRealtime({
    onInvitationSent: () => {
      void fetchPendingInvitations();
    },
    onInvitationRevoked: () => {
      void fetchPendingInvitations();
    },
    onParentInvitationAccepted: () => {
      void fetchPendingInvitations();
    },
  });

  return {
    pendingInvitations,
    isLoading,
    error,
    refetch: fetchPendingInvitations,
  };
};
