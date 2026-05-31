"use client";

import { useState, useEffect, useCallback } from "react";
import { ParentInvitation } from "../types";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";

export const usePendingParentInvitations = () => {
  const [pendingInvitations, setPendingInvitations] = useState<ParentInvitation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSchoolConfigStore();
  const tenantId = config?.tenant?.id;

  const fetchPendingInvitations = useCallback(async () => {
    if (!tenantId) return;

    try {
      setIsLoading(true);
      setError(null);

      const query = `
        query {
          getPendingParentInvitations(tenantId: "${tenantId}") {
            id
            email
            role
            status
            createdAt
            invitedBy {
              id
              name
              email
            }
          }
        }
      `;

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending parent invitations");
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(
          data.errors[0]?.message || "Error fetching pending parent invitations",
        );
      }

      setPendingInvitations(data.data.getPendingParentInvitations || []);
    } catch (err: unknown) {
      console.error("Error fetching pending parent invitations:", err);
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

  const resendInvitation = async (invitationId: string) => {
    console.log(`Resend invitation for ${invitationId}`);
  };

  return {
    pendingInvitations,
    isLoading,
    error,
    resendInvitation,
    refetch: fetchPendingInvitations,
  };
};
