export const DELETE_TEACHER_MUTATION = `
  mutation DeleteTeacher($id: String!, $tenantId: String!) {
    deleteTeacher(id: $id, tenantId: $tenantId)
  }
`;

export const ADMIN_CHANGE_USER_PASSWORD_MUTATION = `
  mutation AdminChangeUserPassword($userId: String!, $newPassword: String!) {
    adminChangeUserPassword(userId: $userId, newPassword: $newPassword)
  }
`;

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "GraphQL request failed");
  }

  return result.data as T;
}
