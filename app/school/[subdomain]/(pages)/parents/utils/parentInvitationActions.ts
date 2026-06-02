export async function revokeParentInvitation(invitationId: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation RevokeParentInvitation($invitationId: String!) {
          revokeParentInvitation(invitationId: $invitationId) {
            message
          }
        }
      `,
      variables: { invitationId },
    }),
  });

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "Failed to revoke invitation");
  }
  return result.data.revokeParentInvitation as { message: string };
}

export async function resendParentInvitation(invitationId: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation ResendParentInvitation($invitationId: String!) {
          resendParentInvitation(invitationId: $invitationId) {
            email
            name
            status
            createdAt
          }
        }
      `,
      variables: { invitationId },
    }),
  });

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "Failed to resend invitation");
  }
  return result.data.resendParentInvitation as {
    email: string;
    name: string;
    status: string;
    createdAt: string;
  };
}

export async function resendPendingParentInvitations(invitationIds: string[]) {
  let succeeded = 0;
  let failed = 0;

  for (const invitationId of invitationIds) {
    try {
      await resendParentInvitation(invitationId);
      succeeded += 1;
    } catch {
      failed += 1;
    }
  }

  return { succeeded, failed };
}
