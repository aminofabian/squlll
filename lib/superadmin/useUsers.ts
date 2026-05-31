"use client";

import { useCallback, useEffect, useState } from "react";
import {
  changeUserStatus,
  createTenantUser,
  deleteUser,
  fetchAllUsers,
} from "./usersApi";
import type { AdminUserListItem } from "./types";

export function useUsers() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { users: next, hasMore: truncated } = await fetchAllUsers();
      setUsers(next);
      setHasMore(truncated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleUserStatus = useCallback(
    async (user: AdminUserListItem) => {
      const membership = user.memberships[0];
      if (!membership) return;
      const newStatus =
        membership.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      setActionLoading(user.id);
      setError(null);
      try {
        await changeUserStatus(user.id, newStatus);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user");
        throw err;
      } finally {
        setActionLoading(null);
      }
    },
    [refresh],
  );

  const removeUser = useCallback(
    async (userId: string) => {
      setActionLoading(userId);
      setError(null);
      try {
        await deleteUser(userId, "DELETE");
        await refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete user";
        setError(message);
        throw err;
      } finally {
        setActionLoading(null);
      }
    },
    [refresh],
  );

  const createUser = useCallback(
    async (input: {
      tenantId: string;
      email: string;
      name: string;
      role: string;
    }) => {
      setActionLoading("create");
      setError(null);
      try {
        await createTenantUser(input);
        await refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create user";
        setError(message);
        throw err;
      } finally {
        setActionLoading(null);
      }
    },
    [refresh],
  );

  return {
    users,
    hasMore,
    loading,
    actionLoading,
    error,
    refresh,
    toggleUserStatus,
    removeUser,
    createUser,
  };
}
