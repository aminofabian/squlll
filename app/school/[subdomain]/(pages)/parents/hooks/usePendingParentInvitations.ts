"use client";

import { useState, useEffect } from "react";
import { ParentInvitation } from "../types";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";

export const usePendingParentInvitations = () => {
  const [pendingInvitations, setPendingInvitations] = useState<ParentInvitation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSchoolConfigStore();

  useEffect(() => {
    const fetchPendingInvitations = async () => {
      if (!config?.tenant?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // GraphQL query for pending parent invitations
        const query = `
          query {
            getPendingParentInvitations(tenantId: "${config.tenant.id}") {
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

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending parent invitations');
        }

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0]?.message || 'Error fetching pending parent invitations');
        }

        setPendingInvitations(data.data.getPendingParentInvitations || []);
      } catch (err: any) {
        console.error("Error fetching pending parent invitations:", err);
        setError(err.message || 'Failed to load pending parent invitations');
      } finally {
        setIsLoading(false);
      }
    };

    if (config?.tenant?.id) {
      fetchPendingInvitations();
    }
  }, [config?.tenant?.id]);

  // Function to resend invitation if needed
  const resendInvitation = async (invitationId: string) => {
    // Implementation for resending invitation - would be added if required
    console.log(`Resend invitation for ${invitationId}`);
    // Would call an API endpoint to resend the invitation
  };

  return {
    pendingInvitations,
    isLoading,
    error,
    resendInvitation,
  };
};
