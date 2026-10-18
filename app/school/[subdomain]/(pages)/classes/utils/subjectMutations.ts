import type { QueryClient } from "@tanstack/react-query";

export interface SubjectUpdateInput {
  name?: string;
  subjectType?: "core" | "elective";
  isCompulsory?: boolean;
  totalMarks?: number | null;
  passingMarks?: number | null;
}

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  let payload: {
    data?: T;
    errors?: Array<{ message?: string }>;
  } | null = null;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "The server returned an unreadable response"
        : `Request failed (${response.status})`,
    );
  }

  if (!response.ok || payload?.errors?.length) {
    const message = payload?.errors
      ?.map((error) => error?.message)
      .filter(Boolean)
      .join(", ");
    throw new Error(message || `Request failed (${response.status})`);
  }

  return (payload?.data ?? {}) as T;
}

const UPDATE_TENANT_SUBJECT = `
  mutation UpdateClassSubject($tenantSubjectId: String!, $input: UpdateTenantSubjectInput!) {
    updateCustomSubject(tenantSubjectId: $tenantSubjectId, input: $input) {
      id
      name
      subjectType
    }
  }
`;

export async function updateTenantSubject(
  tenantSubjectId: string,
  input: SubjectUpdateInput,
): Promise<void> {
  await graphqlRequest(UPDATE_TENANT_SUBJECT, { tenantSubjectId, input });
}

const DELETE_TENANT_SUBJECT = `
  mutation DeleteClassSubject($tenantSubjectId: String!) {
    deleteTenantSubject(tenantSubjectId: $tenantSubjectId)
  }
`;

export async function deleteTenantSubjects(
  tenantSubjectIds: string[],
): Promise<void> {
  const ids = Array.from(new Set(tenantSubjectIds.filter(Boolean)));
  for (const tenantSubjectId of ids) {
    await graphqlRequest(DELETE_TENANT_SUBJECT, { tenantSubjectId });
  }
}

/** Keep every surface that reads subjects/curricula in sync after an edit. */
export async function invalidateSubjectCaches(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] }),
    queryClient.invalidateQueries({ queryKey: ["schoolConfig"] }),
    queryClient.invalidateQueries({ queryKey: ["teachers"] }),
    queryClient.invalidateQueries({ queryKey: ["getTeachers"] }),
  ]);
}
