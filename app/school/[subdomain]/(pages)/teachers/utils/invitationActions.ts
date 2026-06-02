import { toast } from "sonner";

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
