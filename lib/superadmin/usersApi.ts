import { superAdminGraphqlRequest } from "./graphql";
import type { AdminUserListItem } from "./types";

export const MAX_USER_PAGE_SIZE = 100;
const MAX_USERS_FETCH = 1000;

const USERS_QUERY = `
  query GetAllUsers($pagination: AdminUserPaginationInput!) {
    getAllUsers(pagination: $pagination) {
      id
      email
      name
      isGlobalAdmin
      globalRole
      createdAt
      memberships {
        id
        role
        status
        tenantId
        tenantName
        tenantSubdomain
        joinedAt
      }
    }
  }
`;

export async function fetchUsersPage(options: {
  cursor?: string | null;
  limit?: number;
}): Promise<AdminUserListItem[]> {
  const data = await superAdminGraphqlRequest<{
    getAllUsers: AdminUserListItem[];
  }>(USERS_QUERY, {
    pagination: {
      cursor: options.cursor || null,
      limit: options.limit ?? MAX_USER_PAGE_SIZE,
    },
  });
  return data.getAllUsers ?? [];
}

export async function fetchAllUsers(): Promise<{
  users: AdminUserListItem[];
  hasMore: boolean;
}> {
  const users: AdminUserListItem[] = [];
  let cursor: string | null = null;
  let hasMore = false;

  while (users.length < MAX_USERS_FETCH) {
    const batch = await fetchUsersPage({ cursor, limit: MAX_USER_PAGE_SIZE });
    users.push(...batch);

    if (batch.length < MAX_USER_PAGE_SIZE) {
      break;
    }

    if (users.length >= MAX_USERS_FETCH) {
      hasMore = true;
      break;
    }

    cursor = batch[batch.length - 1]?.createdAt ?? null;
    if (!cursor) break;
  }

  return { users, hasMore };
}

export async function changeUserStatus(userId: string, newStatus: string) {
  await superAdminGraphqlRequest(
    `
      mutation ChangeUserStatus($input: UserStatusChangeInput!) {
        changeUserStatus(input: $input) {
          userId
          status
        }
      }
    `,
    { input: { userId, newStatus } },
  );
}

export async function deleteUser(userId: string, confirmation: string) {
  const data = await superAdminGraphqlRequest<{
    deleteUser: { success: boolean; userId: string };
  }>(
    `
      mutation DeleteUser($input: DeleteUserInput!) {
        deleteUser(input: $input) {
          success
          userId
        }
      }
    `,
    { input: { userId, confirmation } },
  );

  if (!data.deleteUser?.success) {
    throw new Error("Failed to delete user");
  }
}

export async function createTenantUser(input: {
  tenantId: string;
  email: string;
  name: string;
  role: string;
}) {
  await superAdminGraphqlRequest(
    `
      mutation CreateTenantUser($input: CreateTenantUserInput!) {
        createTenantUser(input: $input) {
          userId
          membershipId
        }
      }
    `,
    { input },
  );
}
