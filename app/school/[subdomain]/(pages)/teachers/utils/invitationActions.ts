export async function resendTeacherInvitation(invitationId: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation ResendInvitation($invitationId: String!) {
          resendTeacherInvitation(invitationId: $invitationId) {
            email
            fullName
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
  return result.data.resendTeacherInvitation as {
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
  };
}

export async function resendTeacherWelcome(teacherId: string): Promise<boolean> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation ResendTeacherWelcome($teacherId: ID!) {
          resendTeacherWelcome(teacherId: $teacherId)
        }
      `,
      variables: { teacherId },
    }),
  });

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(
      result.errors[0]?.message || "Failed to resend the teacher welcome",
    );
  }
  return Boolean(result.data?.resendTeacherWelcome);
}

export async function resendTeacherInvitationByEmail(email: string) {
  const lookup = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        query PendingTeacherInvitation($email: String!) {
          getPendingTeacherInvitation(email: $email) { id email }
        }
      `,
      variables: { email },
    }),
  });
  const lookupResult = await lookup.json();
  if (lookupResult.errors?.length) {
    throw new Error(
      lookupResult.errors[0]?.message || "Could not find the invitation",
    );
  }
  const invitation = lookupResult.data?.getPendingTeacherInvitation;
  if (!invitation?.id) {
    throw new Error("No pending invitation found for this email.");
  }
  return resendTeacherInvitation(invitation.id);
}

export async function revokeTeacherInvitation(invitationId: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        mutation RevokeInvitation($invitationId: String!) {
          revokeInvitation(invitationId: $invitationId) {
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
  return result.data.revokeInvitation as { message: string };
}

export async function findTeacherIdByEmail(email: string): Promise<string | null> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        query FindTeacherByEmail {
          getTeachers {
            id
            email
            user { email }
          }
        }
      `,
    }),
  });

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "Failed to fetch teachers");
  }

  const normalized = email.trim().toLowerCase();
  const teachers = result.data?.getTeachers ?? [];
  const match = teachers.find(
    (teacher: { id: string; email?: string; user?: { email?: string } }) =>
      teacher.email?.trim().toLowerCase() === normalized ||
      teacher.user?.email?.trim().toLowerCase() === normalized,
  );

  return match?.id ?? null;
}

export async function resendPendingInvitations(
  invitationIds: string[],
  onProgress?: (completed: number, total: number) => void,
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < invitationIds.length; i++) {
    try {
      await resendTeacherInvitation(invitationIds[i]);
      succeeded += 1;
    } catch {
      failed += 1;
    }
    onProgress?.(i + 1, invitationIds.length);
  }

  return { succeeded, failed };
}
