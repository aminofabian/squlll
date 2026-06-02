"use client";

import { useCallback, useState } from "react";
import {
  ACTIVATE_PARENT_MUTATION,
  graphqlRequest,
} from "@/lib/graphql/parentAdmin";
import { ADMIN_CHANGE_USER_PASSWORD_MUTATION } from "@/lib/graphql/teacherAdmin";

export function useParentAdminActions() {
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const setParentPassword = useCallback(
    async (userId: string, newPassword: string) => {
      if (!userId?.trim()) {
        throw new Error("User account is required to set a password");
      }
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      setIsSettingPassword(true);
      try {
        const data = await graphqlRequest<{
          adminChangeUserPassword: boolean;
        }>(ADMIN_CHANGE_USER_PASSWORD_MUTATION, {
          userId,
          newPassword,
        });

        if (!data.adminChangeUserPassword) {
          throw new Error("Failed to update password");
        }
      } finally {
        setIsSettingPassword(false);
      }
    },
    [],
  );

  const activateParentRecord = useCallback(async (parentId: string) => {
    if (!parentId?.trim()) {
      throw new Error("Parent ID is required");
    }

    setIsActivating(true);
    try {
      const data = await graphqlRequest<{
        activateParent: { success: boolean; message: string; email?: string };
      }>(ACTIVATE_PARENT_MUTATION, {
        input: { parentId: parentId.trim() },
      });

      if (!data.activateParent?.success) {
        throw new Error(
          data.activateParent?.message || "Failed to activate parent",
        );
      }

      return data.activateParent;
    } finally {
      setIsActivating(false);
    }
  }, []);

  return {
    setParentPassword,
    activateParentRecord,
    isSettingPassword,
    isActivating,
  };
}
